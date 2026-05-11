/**
 * Cancellation token (Plan #6 Step 0 + Step 1.1 / Step 1.3 surface).
 *
 * `CancellationToken` is the public type a handler reads as `$cancel` from
 * its evaluation context. It is `AbortSignal`-shaped: the inner `signal`
 * field is a real `AbortSignal` so it can be passed straight to `App.fetch`
 * and other web APIs. The `aborted` / `reason` / `throwIfAborted` /
 * `onAbort` surface mirrors the established `AbortController` ergonomics
 * with one addition: a typed `reason` ("user" | "supersede" | "timeout" |
 * "unmount") that lets handlers distinguish *why* they were cancelled.
 *
 * NOTE — W3-6 risk-probe scope: Phase 1 of plan #6 ships only the
 * **public API** of cancellation. The dispatcher-side wiring that would
 * actually trigger the token (component unmount, supersession, timeout)
 * lands in Phase 2 / Phase 3 (W7-1). Until then the token is created
 * fresh per handler and aborted on handler completion only — handlers
 * that never read `$cancel` see no behavioural change.
 */

/** The four cancellation origins exposed to user code. */
export type CancellationReason = "user" | "supersede" | "timeout" | "unmount";

export interface CancellationToken {
  /** True once the token has been aborted. */
  readonly aborted: boolean;
  /** Set when `aborted` flips to true; identifies the cancellation origin. */
  readonly reason?: CancellationReason;
  /** Throws `HandlerCancelledError` synchronously when the token is aborted; no-op otherwise. */
  throwIfAborted(): void;
  /**
   * Register a callback that fires exactly once when the token aborts.
   * If the token is already aborted, the callback fires synchronously
   * (microtask-deferred to keep ordering predictable).
   */
  onAbort(cb: () => void): void;
  /** A real `AbortSignal` — pass straight to `App.fetch(url, { signal })` etc. */
  readonly signal: AbortSignal;
}

/**
 * Error raised by `throwIfAborted()` and by the dispatcher when a handler
 * is cancelled mid-evaluation. The `reason` field disambiguates origins.
 */
export class HandlerCancelledError extends Error {
  readonly reason: CancellationReason;
  constructor(reason: CancellationReason, message?: string) {
    super(message ?? `Handler cancelled (${reason})`);
    this.name = "HandlerCancelledError";
    this.reason = reason;
  }
}

/**
 * Create a fresh cancellation token plus the controller-side `abort`
 * function. Mirrors the `AbortController` shape but exposes the typed
 * `CancellationReason` surface.
 */
export function createCancellationToken(): {
  token: CancellationToken;
  abort(reason: CancellationReason): void;
} {
  const controller = new AbortController();
  let abortedReason: CancellationReason | undefined;
  const callbacks: Array<() => void> = [];
  let drained = false;

  const token: CancellationToken = {
    get aborted() {
      return controller.signal.aborted;
    },
    get reason() {
      return abortedReason;
    },
    throwIfAborted() {
      if (controller.signal.aborted) {
        throw new HandlerCancelledError(abortedReason ?? "user");
      }
    },
    onAbort(cb) {
      if (controller.signal.aborted) {
        // Defer to a microtask so callers always observe consistent ordering.
        queueMicrotask(() => {
          try {
            cb();
          } catch {
            /* swallow — same-shape as AbortSignal `addEventListener` */
          }
        });
        return;
      }
      callbacks.push(cb);
    },
    signal: controller.signal,
  };

  function abort(reason: CancellationReason): void {
    if (controller.signal.aborted || drained) return;
    abortedReason = reason;
    controller.abort(new HandlerCancelledError(reason));
    drained = true;
    for (const cb of callbacks) {
      try {
        cb();
      } catch {
        /* swallow */
      }
    }
    callbacks.length = 0;
  }

  return { token, abort };
}

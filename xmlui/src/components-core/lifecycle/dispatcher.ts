/**
 * Lifecycle dispatcher — Plan #04 Step 0 + Step 1.1.
 *
 * Centralizes registration and firing of `mount` / `unmount` /
 * `beforeDispose` handlers per component `uid`. The dispatcher itself is
 * a pure JS module — no React, no DOM. The adapter (and, in Phase 3,
 * container components) drives it from `useEffect` mount/unmount.
 *
 * Today the adapter fires `mount`/`unmount` directly via
 * `lookupEventHandler("mount" | "unmount")()` and only uses the
 * dispatcher's diagnostic helpers (`reportLifecycleEvent`,
 * `reportLifecycleViolation`). The full `register`/`fire`/`dispose`
 * surface is exposed for Phase 3 (`onBeforeDispose`) and for unit
 * testing of the contract.
 *
 * See `dev-docs/plans/04-managed-lifecycle-vocabulary.md`.
 */

import { pushXsLog, getCurrentTrace } from "../inspector/inspectorUtils";
import {
  LifecycleViolationError,
  type LifecyclePhase,
  type LifecycleViolationReason,
} from "./diagnostics";

export type { LifecyclePhase } from "./diagnostics";

export interface LifecycleEvent {
  phase: LifecyclePhase;
  componentUid: string;
  abortSignal?: AbortSignal;
}

export interface LifecycleDispatcher {
  register(
    uid: string,
    phase: LifecyclePhase,
    handler: () => unknown | Promise<unknown>,
  ): void;
  fire(event: LifecycleEvent): Promise<void>;
  dispose(uid: string): void;
}

interface Bucket {
  mount: Array<() => unknown | Promise<unknown>>;
  unmount: Array<() => unknown | Promise<unknown>>;
  beforeDispose: Array<() => unknown | Promise<unknown>>;
}

function emptyBucket(): Bucket {
  return { mount: [], unmount: [], beforeDispose: [] };
}

export function createLifecycleDispatcher(): LifecycleDispatcher {
  const buckets = new Map<string, Bucket>();

  return {
    register(uid, phase, handler) {
      let bucket = buckets.get(uid);
      if (!bucket) {
        bucket = emptyBucket();
        buckets.set(uid, bucket);
      }
      bucket[phase].push(handler);
    },
    async fire(event) {
      const bucket = buckets.get(event.componentUid);
      if (!bucket) return;
      const handlers = bucket[event.phase];
      for (const handler of handlers) {
        try {
          const result = handler();
          if (event.phase === "unmount" && isThenable(result)) {
            // Synchronous-only contract on `unmount` (Step 0). Emit a
            // violation but do not await — the React commit phase is
            // synchronous.
            reportLifecycleViolation({
              componentUid: event.componentUid,
              phase: event.phase,
              reason: "async-onUnmount",
            });
            continue;
          }
          if (isThenable(result)) {
            await result;
          }
        } catch (err) {
          reportLifecycleViolation({
            componentUid: event.componentUid,
            phase: event.phase,
            reason: "throw",
            error: err,
          });
        }
      }
    },
    dispose(uid) {
      buckets.delete(uid);
    },
  };
}

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    !!value &&
    (typeof value === "object" || typeof value === "function") &&
    typeof (value as PromiseLike<unknown>).then === "function"
  );
}

/**
 * Fire a single `onBeforeDispose` handler with a timeout budget.
 *
 * - Sync handlers: fire synchronously; success is traced immediately.
 * - Async handlers: fire and race against `timeoutMs`.  If the handler
 *   settles before the deadline the success is traced.  If the deadline
 *   fires first a `reason:"timeout"` violation is emitted and the timeout
 *   is cleared (the handler is still allowed to settle in the background,
 *   but its late resolve is ignored).
 * - Any throw (sync or async) emits a `reason:"throw"` violation.
 *
 * The function itself is **synchronous** — React cleanup functions cannot
 * be `async`.  The async racing is purely fire-and-forget from React's
 * perspective.  That is intentional: `onBeforeDispose` is a best-effort
 * "start your flush now" hook, not a blocker on unmounting.
 *
 * Called by `ComponentAdapter` for every component that has an
 * `onBeforeDispose` event handler (Plan #04 Step 3.1).
 */
export function fireBeforeDispose(
  handler: () => unknown | Promise<unknown>,
  options: {
    componentUid: string;
    timeoutMs: number;
    strict?: boolean;
    componentType?: string;
    componentLabel?: string;
  },
): void {
  const start = typeof performance !== "undefined" ? performance.now() : undefined;

  let result: unknown;
  try {
    result = handler();
  } catch (err) {
    reportLifecycleViolation(
      {
        componentUid: options.componentUid,
        phase: "beforeDispose",
        reason: "throw",
        error: err,
        componentType: options.componentType,
        componentLabel: options.componentLabel,
      },
      { strict: options.strict },
    );
    return;
  }

  if (!isThenable(result)) {
    // Synchronous handler — trace and return.
    reportLifecycleEvent({
      componentUid: options.componentUid,
      phase: "beforeDispose",
      durationMs: start !== undefined ? performance.now() - start : undefined,
      componentType: options.componentType,
      componentLabel: options.componentLabel,
    });
    return;
  }

  // Async handler — race the promise against the deadline.
  const timeoutId = setTimeout(() => {
    reportLifecycleViolation(
      {
        componentUid: options.componentUid,
        phase: "beforeDispose",
        reason: "timeout",
        componentType: options.componentType,
        componentLabel: options.componentLabel,
      },
      { strict: options.strict },
    );
  }, options.timeoutMs);

  (result as Promise<unknown>).then(
    () => {
      clearTimeout(timeoutId);
      reportLifecycleEvent({
        componentUid: options.componentUid,
        phase: "beforeDispose",
        durationMs: start !== undefined ? performance.now() - start : undefined,
        componentType: options.componentType,
        componentLabel: options.componentLabel,
      });
    },
    (err) => {
      clearTimeout(timeoutId);
      reportLifecycleViolation(
        {
          componentUid: options.componentUid,
          phase: "beforeDispose",
          reason: "throw",
          error: err,
          componentType: options.componentType,
          componentLabel: options.componentLabel,
        },
        { strict: options.strict },
      );
    },
  );
}

// ---------------------------------------------------------------------------
// Trace helpers (used by the adapter and the dispatcher).
// ---------------------------------------------------------------------------

/**
 * Push a `kind:"lifecycle"` info trace entry recording a successful phase.
 * No-op when no log buffer is present.
 */
export function reportLifecycleEvent(payload: {
  componentUid: string;
  phase: LifecyclePhase;
  componentType?: string;
  componentLabel?: string;
  durationMs?: number;
}): void {
  pushXsLog({
    ts: Date.now(),
    perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
    traceId: getCurrentTrace(),
    kind: "lifecycle",
    severity: "info",
    phase: payload.phase,
    componentUid: payload.componentUid,
    componentType: payload.componentType,
    componentLabel: payload.componentLabel,
    durationMs: payload.durationMs,
  });
}

/**
 * Push a `kind:"lifecycle"` warn/error trace entry for a violation
 * (async `onUnmount`, handler throw, or `onBeforeDispose` timeout).
 *
 * Severity escalates from `warn` to `error` when the second argument's
 * `strict` is `true` (i.e. `App.appGlobals.strictLifecycle === true`).
 */
export function reportLifecycleViolation(
  payload: {
    componentUid: string;
    phase: LifecyclePhase;
    reason: LifecycleViolationReason;
    error?: unknown;
    componentType?: string;
    componentLabel?: string;
  },
  options: { strict?: boolean } = {},
): LifecycleViolationError {
  const violation = new LifecycleViolationError(
    payload.componentUid,
    payload.phase,
    payload.reason,
    payload.error,
  );
  const severity = options.strict ? "error" : "warn";
  pushXsLog({
    ts: Date.now(),
    perfTs: typeof performance !== "undefined" ? performance.now() : undefined,
    traceId: getCurrentTrace(),
    kind: "lifecycle",
    severity,
    phase: payload.phase,
    componentUid: payload.componentUid,
    componentType: payload.componentType,
    componentLabel: payload.componentLabel,
    reason: payload.reason,
    message: violation.message,
    error: payload.error
      ? {
          message: payload.error instanceof Error ? payload.error.message : String(payload.error),
          stack: payload.error instanceof Error ? payload.error.stack : undefined,
        }
      : undefined,
  });
  if (options.strict) {
    // eslint-disable-next-line no-console
    console.error(violation.message, payload.error);
  } else {
    // eslint-disable-next-line no-console
    console.warn(violation.message, payload.error);
  }
  return violation;
}

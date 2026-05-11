/**
 * Handler-policy public API (Plan #6 Step 0 / Step 2.1 contract surface).
 *
 * W3-6 risk-probe scope: this file ships only the *types* and a
 * pass-through `createHandlerCoordinator()` stub that always returns
 * `{ proceed: true, token }`. The real coordinator (cancel-and-restart,
 * FIFO queue, drop-while-running) lands in W7-1 (Phase 2). Shipping the
 * type surface now lets:
 *
 * - Component metadata declare `handlerPolicy` as a base prop in W3-6.
 * - Handler authors adopt `handlerPolicy="single-flight"` in markup
 *   knowing the contract is settled.
 * - Forms (W5-1, W5-4) and Determinism (W7-2) build on a stable name.
 *
 * Default is always `parallel` — today's behaviour. Setting any other
 * policy is currently a no-op (the coordinator stub returns
 * `proceed: true` regardless), but emits a `kind:"concurrency"` info
 * trace so handler authors can verify their markup reaches the
 * coordinator surface.
 */

import {
  createCancellationToken,
  type CancellationToken,
  type CancellationReason,
} from "./token";

/** The four handler-invocation policies declared in plan #6 Phase 2. */
export type HandlerPolicy =
  | "parallel" // today's behaviour — every invocation runs concurrently
  | "single-flight" // cancel running invocation, start a new one
  | "queue" // FIFO: serialise invocations, none overlap
  | "drop-while-running"; // ignore new invocation if one already running

/** Description of one handler invocation — passed to `coordinator.enter`. */
export interface HandlerInvocation {
  componentUid: string;
  eventName: string;
  policy: HandlerPolicy;
  /** Optional per-invocation timeout override; falls back to `defaultHandlerTimeoutMs`. */
  timeoutMs?: number;
}

/** Result of `coordinator.enter` — instructs the dispatcher whether to run. */
export interface HandlerEntryDecision {
  /** When `false`, the dispatcher must not invoke the handler (drop policy). */
  proceed: boolean;
  /** Cancellation token to inject into the handler's `$cancel` slot. */
  token: CancellationToken;
}

/**
 * Coordinator interface — managed by the per-app dispatcher.
 *
 * W3-6 pass-through stub: `enter` always returns `proceed: true` with a
 * fresh token; `exit` is a no-op. The full implementation in W7-1 will
 * track running invocations per `(componentUid, eventName)` and apply
 * the four policies.
 */
export interface HandlerCoordinator {
  enter(inv: HandlerInvocation): HandlerEntryDecision;
  exit(inv: HandlerInvocation): void;
  /**
   * Abort any running handlers matching `(componentUid?, eventName?)`.
   * Used by `App.cancel()` (Step 1.2 — wired in W7-1). The W3-6 stub
   * does nothing because no running set is tracked yet.
   */
  abortRunning(componentUid?: string, eventName?: string, reason?: CancellationReason): void;
}

/**
 * Create the W3-6 pass-through coordinator stub.
 *
 * The full implementation in W7-1 will track running invocations and
 * apply the four policies. Until then, every invocation proceeds with
 * a fresh token regardless of policy — handler authors can still
 * adopt the markup without waiting for the runtime.
 */
export function createHandlerCoordinator(): HandlerCoordinator {
  return {
    enter(_inv) {
      const { token } = createCancellationToken();
      return { proceed: true, token };
    },
    exit(_inv) {
      /* no-op — running set lands in W7-1 */
    },
    abortRunning(_componentUid, _eventName, _reason) {
      /* no-op — running set lands in W7-1 */
    },
  };
}

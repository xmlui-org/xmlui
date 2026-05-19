/**
 * Handler-policy public API (Plan #6 Step 0 / Step 2.1 contract surface).
 *
 * Defines the types and factory that the dispatcher (`event-handlers.ts`)
 * uses to coordinate handler invocations under one of four policies
 * (`parallel`, `single-flight`, `queue`, `drop-while-running`).
 *
 * W7-1 update: `createHandlerCoordinator()` now returns the real
 * implementation from `coordinator.ts` instead of the W3-6 pass-through
 * stub. Default behaviour is unchanged because `parallel` (the implicit
 * default for every component) is still a fast-path no-op.
 */

import {
  createCancellationToken,
  type CancellationToken,
  type CancellationReason,
} from "./token";
import {
  createRealHandlerCoordinator,
  type CoordinatorDiagnosticSink,
} from "./coordinator";

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
  /**
   * W7-1: lets the dispatcher abort the token on handler completion
   * (e.g. to fire `$cancel.onAbort` cleanup callbacks for in-flight
   * fetches). Optional for backward compatibility with the W3-6
   * pass-through stub, which omits it.
   */
  abort?: (reason: CancellationReason) => void;
}

/**
 * Coordinator interface — managed by the per-app dispatcher.
 *
 * The real W7-1 coordinator may return a Promise from `enter()` (the
 * `queue` policy awaits the current invocation), so callers must
 * `await` the result. The W3-6 pass-through stub returns synchronously;
 * `await` of a non-thenable is a no-op so both shapes are
 * interchangeable.
 */
export interface HandlerCoordinator {
  enter(inv: HandlerInvocation): HandlerEntryDecision | Promise<HandlerEntryDecision>;
  exit(inv: HandlerInvocation): void;
  /**
   * Abort any running handlers matching `(componentUid?, eventName?)`.
   * Used by `App.cancel()` (Step 1.2 — wired in W7-1). The W3-6 stub
   * does nothing because no running set is tracked yet.
   */
  abortRunning(componentUid?: string, eventName?: string, reason?: CancellationReason): void;
}

/**
 * Create a HandlerCoordinator.
 *
 * W7-1 ships the real coordinator that tracks running invocations and
 * applies the four policies. Pass a `sink` to receive `onSuperseded` /
 * `onDropped` notifications (used by the dispatcher to emit
 * `concurrency-handler-superseded` / `concurrency-handler-dropped`
 * traces). The default behaviour for `parallel` (the implicit default)
 * remains a pass-through fast path — existing apps observe no change.
 *
 * The legacy pass-through stub is still available via
 * `createPassThroughHandlerCoordinator()` for tests that want to verify
 * the W3-6 surface shape independent of the runtime.
 */
export function createHandlerCoordinator(
  sink: CoordinatorDiagnosticSink = {},
): HandlerCoordinator {
  return createRealHandlerCoordinator(sink);
}

/**
 * The W3-6 pass-through stub — every invocation proceeds with a fresh
 * token regardless of policy. Retained for tests that pin the public
 * surface shape; not used by the dispatcher.
 */
export function createPassThroughHandlerCoordinator(): HandlerCoordinator {
  return {
    enter(_inv) {
      const { token } = createCancellationToken();
      return { proceed: true, token };
    },
    exit(_inv) {
      /* no-op */
    },
    abortRunning(_componentUid, _eventName, _reason) {
      /* no-op */
    },
  };
}

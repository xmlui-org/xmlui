/**
 * Real HandlerCoordinator implementation (Plan #6 Phase 2 / W7-1).
 *
 * Tracks at most one in-flight invocation per `(componentUid, eventName)`
 * slot and applies one of the four `HandlerPolicy` values to each fresh
 * entry. Replaces the W3-6 pass-through stub.
 *
 * Design notes:
 *
 * - `enter()` is async to let the `queue` policy await the current
 *   invocation's completion before resolving its decision. Other policies
 *   resolve synchronously (microtask).
 * - When `proceed: true` the returned token is also stored on the running
 *   slot so a subsequent `single-flight` entry can abort it with
 *   `reason:"supersede"`. `parallel` invocations are not tracked.
 * - `exit()` clears the running slot and drains the next queued waiter.
 *   The caller must call `exit()` from a `finally` to release the slot.
 * - `abortRunning()` lets `App.cancel()` tear down handlers outside the
 *   dispatcher path.
 */

import {
  createCancellationToken,
  type CancellationReason,
  type CancellationToken,
} from "./token";
import {
  type HandlerCoordinator,
  type HandlerEntryDecision,
  type HandlerInvocation,
} from "./policy";

type SlotKey = string;

interface RunningEntry {
  inv: HandlerInvocation;
  token: CancellationToken;
  abort: (reason: CancellationReason) => void;
}

interface QueueWaiter {
  resume: () => void;
  cancel: (reason: CancellationReason) => void;
}

function slotKey(uid: string, eventName: string): SlotKey {
  return `${uid}\u0000${eventName}`;
}

export interface CoordinatorDiagnosticSink {
  onSuperseded?: (inv: HandlerInvocation) => void;
  onDropped?: (inv: HandlerInvocation) => void;
}

export function createRealHandlerCoordinator(
  sink: CoordinatorDiagnosticSink = {},
): HandlerCoordinator {
  const running = new Map<SlotKey, RunningEntry>();
  const queues = new Map<SlotKey, QueueWaiter[]>();

  function installRunning(inv: HandlerInvocation): HandlerEntryDecision {
    const { token, abort } = createCancellationToken();
    running.set(slotKey(inv.componentUid, inv.eventName), { inv, token, abort });
    return { proceed: true, token, abort };
  }

  async function enter(inv: HandlerInvocation): Promise<HandlerEntryDecision> {
    if (inv.policy === "parallel") {
      const { token, abort } = createCancellationToken();
      return { proceed: true, token, abort };
    }

    const key = slotKey(inv.componentUid, inv.eventName);
    const current = running.get(key);

    if (!current) {
      return installRunning(inv);
    }

    if (inv.policy === "single-flight") {
      sink.onSuperseded?.(current.inv);
      current.abort("supersede");
      running.delete(key);
      return installRunning(inv);
    }

    if (inv.policy === "drop-while-running") {
      sink.onDropped?.(inv);
      const { token, abort } = createCancellationToken();
      abort("user");
      return { proceed: false, token };
    }

    // queue
    return new Promise<HandlerEntryDecision>((resolve) => {
      const waiter: QueueWaiter = {
        resume: () => resolve(installRunning(inv)),
        cancel: (reason) => {
          const { token, abort } = createCancellationToken();
          abort(reason);
          resolve({ proceed: false, token });
        },
      };
      const q = queues.get(key) ?? [];
      q.push(waiter);
      queues.set(key, q);
    });
  }

  function exit(inv: HandlerInvocation): void {
    if (inv.policy === "parallel") return;
    const key = slotKey(inv.componentUid, inv.eventName);
    const current = running.get(key);
    if (current && current.inv === inv) {
      running.delete(key);
    }
    const q = queues.get(key);
    if (q && q.length) {
      const next = q.shift()!;
      if (q.length === 0) queues.delete(key);
      // Resume on a microtask so the caller's `finally` runs first.
      queueMicrotask(() => next.resume());
    }
  }

  function abortRunning(
    componentUid?: string,
    eventName?: string,
    reason: CancellationReason = "user",
  ): void {
    for (const [key, entry] of Array.from(running.entries())) {
      if (componentUid && entry.inv.componentUid !== componentUid) continue;
      if (eventName && entry.inv.eventName !== eventName) continue;
      entry.abort(reason);
      running.delete(key);
    }
    for (const [key, q] of Array.from(queues.entries())) {
      if (componentUid && !key.startsWith(`${componentUid}\u0000`)) continue;
      if (eventName && !key.endsWith(`\u0000${eventName}`)) continue;
      for (const w of q) w.cancel(reason);
      queues.delete(key);
    }
  }

  return {
    enter,
    exit,
    abortRunning,
  };
}

// ----------------------------------------------------------------------------
// Process-wide default coordinator (W7-1 dispatcher integration).
//
// The dispatcher (`event-handlers.ts`) needs a single coordinator instance
// so that supersede / queue / drop semantics work across a component's
// re-renders (each render creates a fresh `createEventHandlers` invocation
// but the running-slot state must persist). A module-level singleton is
// sufficient because slot keys are namespaced by `componentUid`, which is
// globally unique per XMLUI app instance.
//
// Tests that need an isolated coordinator should call
// `createRealHandlerCoordinator()` directly.
// ----------------------------------------------------------------------------

let _defaultCoordinator: HandlerCoordinator | null = null;
let _defaultSink: CoordinatorDiagnosticSink = {};

/** Returns (and lazily creates) the process-wide default coordinator. */
export function getDefaultHandlerCoordinator(): HandlerCoordinator {
  if (!_defaultCoordinator) {
    _defaultCoordinator = createRealHandlerCoordinator({
      onSuperseded: (inv) => _defaultSink.onSuperseded?.(inv),
      onDropped: (inv) => _defaultSink.onDropped?.(inv),
    });
  }
  return _defaultCoordinator;
}

/**
 * Install (or update) the diagnostic sink that the default coordinator
 * forwards `onSuperseded` / `onDropped` notifications to. Called by the
 * dispatcher once per app initialisation so concurrency traces land in
 * the Inspector log stream.
 */
export function setDefaultCoordinatorSink(sink: CoordinatorDiagnosticSink): void {
  _defaultSink = sink;
}

/** Test-only — reset the singleton so unit tests can observe a clean state. */
export function __resetDefaultCoordinatorForTests(): void {
  _defaultCoordinator = null;
  _defaultSink = {};
}

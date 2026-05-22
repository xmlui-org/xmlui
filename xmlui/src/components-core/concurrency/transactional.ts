/**
 * Transactional state-write buffer (Plan #6 Phase 4 / W7-1).
 *
 * When a handler is declared `transactional`, every state mutation it
 * performs is buffered here instead of being dispatched to the container's
 * reducer immediately. On successful completion the buffered writes are
 * committed in a single dispatch; on cancellation, timeout, or error the
 * writes are discarded.
 *
 * A snapshot of the relevant container state is captured at handler entry.
 * If the snapshot differs from the live state at commit time (because a
 * parallel handler wrote in the meantime), the buffer is retried once: the
 * dispatcher re-snapshots and re-applies. A second conflict surfaces as a
 * `concurrency-transactional-conflict` warn/error and the writes are
 * dropped.
 *
 * Buffer shape: a list of `(pathArray, newValue, target, action)` tuples
 * matching the `statePartChanged` signature used by `event-handlers.ts`.
 */

import type { ProxyAction } from "../rendering/buildProxy";

export interface BufferedWrite {
  pathArray: string[];
  newValue: any;
  target: any;
  action: ProxyAction;
}

export interface TransactionalBuffer {
  /** Append a write; called from the `statePartChanged` interceptor. */
  push(write: BufferedWrite): void;
  /** Drain buffered writes and clear the buffer (commit path). */
  drain(): BufferedWrite[];
  /** Discard all buffered writes (cancel / error path). */
  discard(): void;
  /** Number of writes currently buffered. */
  readonly size: number;
}

export function createTransactionalBuffer(): TransactionalBuffer {
  let writes: BufferedWrite[] = [];
  return {
    push(write) {
      writes.push(write);
    },
    drain() {
      const out = writes;
      writes = [];
      return out;
    },
    discard() {
      writes = [];
    },
    get size() {
      return writes.length;
    },
  };
}

/**
 * Compare two state snapshots at the keys mentioned in `paths`. Returns
 * `true` if a conflict is detected (the live state diverged from the
 * snapshot for at least one written key).
 *
 * Snapshot equality is reference-based on the top-level key — sufficient
 * for the W7-1 risk-probe. A deeper diff is deferred until W7-2 once
 * transactional handlers see real production use.
 */
export function detectSnapshotConflict(
  snapshot: Record<string | symbol, any>,
  live: Record<string | symbol, any>,
  paths: string[][],
): boolean {
  for (const path of paths) {
    const head = path[0];
    if (head === undefined) continue;
    if (snapshot[head] !== live[head]) return true;
  }
  return false;
}

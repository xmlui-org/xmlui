/**
 * Handler-timeout helper (Plan #6 Phase 3 / W7-1).
 *
 * Races a handler promise against a `setTimeout`. On timeout, the
 * cancellation token is aborted with `reason:"timeout"` and the returned
 * promise rejects with `HandlerCancelledError("timeout")`.
 *
 * - `timeoutMs <= 0` disables the timeout (returns the handler promise as-is).
 * - The timer is cleared when the handler settles first.
 * - The `onTimeout` callback fires exactly once and only if the timeout
 *   wins the race; consumers use it to emit the
 *   `concurrency-handler-timeout` trace.
 */

import {
  HandlerCancelledError,
  type CancellationReason,
} from "./token";

export interface RunWithTimeoutOptions {
  timeoutMs: number;
  abort: (reason: CancellationReason) => void;
  onTimeout?: () => void;
}

export async function runWithTimeout<T>(
  handler: Promise<T>,
  { timeoutMs, abort, onTimeout }: RunWithTimeoutOptions,
): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return handler;
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      onTimeout?.();
      abort("timeout");
      reject(new HandlerCancelledError("timeout"));
    }, timeoutMs);
  });
  try {
    return await Promise.race([handler, timeoutPromise]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

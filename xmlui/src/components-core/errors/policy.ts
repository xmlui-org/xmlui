/**
 * Retry and circuit-breaker policy primitives (Step 0 stubs).
 *
 * `executeWithPolicy` drives an async operation through a configurable
 * retry loop with optional circuit-breaker logic.
 *
 * This module is the foundation for `<RetryPolicy>` (Phase 3) and for the
 * cooperative-concurrency `$cancel` integration (Phase 3 × plan #06).
 *
 * ## Rollout note
 *
 * Phase 3 implements the full retry / circuit-breaker runtime.  This Step 0
 * stub exports the public type contract so downstream plans (plan #09 Forms,
 * plan #06 Concurrency) can import and reference the signatures without
 * waiting for the full implementation.
 */

import type { ErrorCategory } from "./app-error";

// ---------------------------------------------------------------------------
// RetryPolicySpec
// ---------------------------------------------------------------------------

export interface RetryPolicySpec {
  /** Total number of attempts, including the first try. Must be ≥ 1. */
  attempts: number;
  /** Backoff algorithm between retries. */
  backoff: "fixed" | "linear" | "exponential";
  /** Base delay in milliseconds. */
  delayMs: number;
  /**
   * When `true` (default), a random jitter of up to ±25 % of `delayMs` is
   * added to each delay to spread out retries across concurrent callers.
   */
  jitter?: boolean;
  /**
   * When set, only retry on errors whose `category` is in this list.
   * Errors outside the list cause an immediate rethrow.
   */
  onlyCategories?: ReadonlyArray<ErrorCategory>;
  /** Hard ceiling per attempt in milliseconds (0 = no per-attempt timeout). */
  timeoutMs?: number;
}

// ---------------------------------------------------------------------------
// CircuitBreakerSpec
// ---------------------------------------------------------------------------

export interface CircuitBreakerSpec {
  /** Number of consecutive failures needed to open the circuit. */
  failureThreshold: number;
  /** Time in milliseconds before the circuit moves to half-open for a probe. */
  resetMs: number;
}

// ---------------------------------------------------------------------------
// executeWithPolicy (stub — full implementation in Phase 3)
// ---------------------------------------------------------------------------

/**
 * Execute `op` with the given retry / circuit-breaker policy.
 *
 * The `cancel` signal is respected between attempts; if it fires the
 * operation is aborted immediately and the most recent error is rethrown.
 *
 * **Step 0 stub**: this implementation performs a single attempt with no
 * retries.  Phase 3 replaces the body with the full retry loop and
 * circuit-breaker state machine.
 */
export async function executeWithPolicy<T>(
  op: (signal: AbortSignal) => Promise<T>,
  _spec: RetryPolicySpec & { circuitBreaker?: CircuitBreakerSpec },
  cancel: AbortSignal,
): Promise<T> {
  return op(cancel);
}

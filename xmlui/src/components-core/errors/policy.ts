/**
 * Retry and circuit-breaker policy primitives (plan #07 Phase 3).
 *
 * `executeWithPolicy` drives an async operation through a configurable retry
 * loop with optional circuit-breaker logic.  Errors are normalised to
 * `AppError` so callers can branch on `category`/`retryable`/`code`.
 *
 * Used by `<RetryPolicy>` (Phase 3) and the cooperative-concurrency
 * `$cancel` integration (plan #06).
 */

import { AppError, type ErrorCategory } from "./app-error";

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
  /**
   * When `true` (default) and the underlying `AppError.data.retryAfterMs` is
   * set (parsed from an HTTP `Retry-After` header), the next delay is
   * overridden by that value, capped at `MAX_RETRY_AFTER_MS`.
   */
  honourRetryAfter?: boolean;
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
// Internal helpers
// ---------------------------------------------------------------------------

/** Hard cap on a `Retry-After` override (60 s — per plan #07 Step 3.2). */
export const MAX_RETRY_AFTER_MS = 60_000;

/**
 * Parse an HTTP `Retry-After` header value to milliseconds.
 *
 * The header may be either a delta-seconds integer or an HTTP date.
 * Returns `undefined` when the value cannot be parsed.  The returned value
 * is clamped to `[0, MAX_RETRY_AFTER_MS]`.
 */
export function parseRetryAfter(value: string | null | undefined, now: number = Date.now()): number | undefined {
  if (value == null) return undefined;
  const trimmed = String(value).trim();
  if (trimmed === "") return undefined;
  // Delta-seconds form (RFC 7231).
  if (/^\d+$/.test(trimmed)) {
    const seconds = Number(trimmed);
    if (!Number.isFinite(seconds) || seconds < 0) return undefined;
    return Math.min(seconds * 1000, MAX_RETRY_AFTER_MS);
  }
  // HTTP-date form.
  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) return undefined;
  const delta = parsed - now;
  if (delta <= 0) return 0;
  return Math.min(delta, MAX_RETRY_AFTER_MS);
}

/** Compute the delay for a given attempt index (0-based) from the policy. */
function computeBackoff(spec: RetryPolicySpec, attemptIndex: number): number {
  const base = Math.max(0, spec.delayMs);
  let delay: number;
  switch (spec.backoff) {
    case "fixed":
      delay = base;
      break;
    case "linear":
      delay = base * (attemptIndex + 1);
      break;
    case "exponential":
      delay = base * Math.pow(2, attemptIndex);
      break;
    default:
      delay = base;
  }
  if (spec.jitter !== false) {
    // ±25 % jitter.
    const jitter = delay * 0.25 * (Math.random() * 2 - 1);
    delay = Math.max(0, delay + jitter);
  }
  return delay;
}

/**
 * Promise that resolves after `ms` or rejects when `signal` aborts. The
 * abort error is rethrown as an `AppError` with `category: "user-cancelled"`.
 */
function delay(ms: number, signal: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
      reject(
        new AppError({
          code: "cancelled",
          category: "user-cancelled",
          message: "Operation cancelled during retry backoff",
        }),
      );
    };
    if (signal.aborted) {
      onAbort();
      return;
    }
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

// ---------------------------------------------------------------------------
// Circuit breaker state machine
// ---------------------------------------------------------------------------

type CircuitState = "closed" | "open" | "half-open";

export interface CircuitBreakerState {
  state: CircuitState;
  consecutiveFailures: number;
  openedAt: number | undefined;
}

/** Create a fresh circuit-breaker state (used by `<RetryPolicy>` per-instance). */
export function createCircuitState(): CircuitBreakerState {
  return { state: "closed", consecutiveFailures: 0, openedAt: undefined };
}

// ---------------------------------------------------------------------------
// executeWithPolicy
// ---------------------------------------------------------------------------

export interface ExecuteOptions {
  /** Existing per-policy circuit-breaker state. Pass to share across calls. */
  circuitState?: CircuitBreakerState;
  /** Called for every attempt (success or failure). Used for tracing. */
  onAttempt?: (info: { attempt: number; error?: AppError }) => void;
}

/**
 * Execute `op` with the given retry / circuit-breaker policy.
 *
 * - Wraps every thrown value in `AppError.from()`.
 * - When `onlyCategories` is set and the error's category is outside the
 *   list, the error is rethrown immediately (no retries).
 * - Honours `signal` between attempts — aborts immediately.
 * - When a circuit breaker is configured and open, fails fast with
 *   `code: "circuit-open"`.
 * - After exhausting `attempts`, throws the last error tagged with
 *   `code: "retry-exhausted"` (wrapping the most recent failure as `cause`).
 */
export async function executeWithPolicy<T>(
  op: (signal: AbortSignal) => Promise<T>,
  spec: RetryPolicySpec & { circuitBreaker?: CircuitBreakerSpec },
  signal: AbortSignal,
  options: ExecuteOptions = {},
): Promise<T> {
  const attempts = Math.max(1, spec.attempts | 0);
  const cb = spec.circuitBreaker;
  const state = options.circuitState ?? createCircuitState();
  let lastError: AppError | undefined;

  for (let attempt = 0; attempt < attempts; attempt++) {
    if (signal.aborted) {
      throw new AppError({
        code: "cancelled",
        category: "user-cancelled",
        message: "Operation cancelled before attempt",
      });
    }

    // Circuit breaker gate.
    if (cb && state.state === "open") {
      const elapsed = Date.now() - (state.openedAt ?? 0);
      if (elapsed < cb.resetMs) {
        throw new AppError({
          code: "circuit-open",
          category: "server",
          message: "Circuit breaker is open; failing fast",
          retryable: false,
          data: { resetInMs: Math.max(0, cb.resetMs - elapsed) },
        });
      }
      // Half-open: allow a single probe.
      state.state = "half-open";
    }

    try {
      const result = await runWithTimeout(op, signal, spec.timeoutMs);
      // Success — reset circuit breaker.
      if (cb) {
        state.state = "closed";
        state.consecutiveFailures = 0;
        state.openedAt = undefined;
      }
      options.onAttempt?.({ attempt: attempt + 1 });
      return result;
    } catch (raw) {
      const err = AppError.from(raw);
      lastError = err;
      options.onAttempt?.({ attempt: attempt + 1, error: err });

      // Categorically-excluded errors rethrow immediately.
      if (spec.onlyCategories && !spec.onlyCategories.includes(err.category)) {
        throw err;
      }
      // Non-retryable errors rethrow immediately (e.g. user-cancelled).
      if (err.retryable === false && err.category !== "rate-limit" && err.category !== "server" && err.category !== "network") {
        throw err;
      }

      // Update circuit breaker on failure.
      if (cb) {
        state.consecutiveFailures += 1;
        if (state.state === "half-open" || state.consecutiveFailures >= cb.failureThreshold) {
          state.state = "open";
          state.openedAt = Date.now();
        }
      }

      // No more attempts left.
      if (attempt === attempts - 1) break;

      // Compute delay: honour Retry-After when present.
      let nextDelay = computeBackoff(spec, attempt);
      const retryAfter = (err.data as any)?.retryAfterMs;
      if (spec.honourRetryAfter !== false && typeof retryAfter === "number" && retryAfter >= 0) {
        nextDelay = Math.min(retryAfter, MAX_RETRY_AFTER_MS);
      }
      await delay(nextDelay, signal);
    }
  }

  // Exhausted.
  throw new AppError({
    code: "retry-exhausted",
    category: lastError?.category ?? "internal",
    message: `Retry policy exhausted after ${attempts} attempt(s)`,
    retryable: false,
    cause: lastError,
    data: { attempts, lastErrorCode: lastError?.code },
  });
}

function runWithTimeout<T>(
  op: (signal: AbortSignal) => Promise<T>,
  parent: AbortSignal,
  timeoutMs: number | undefined,
): Promise<T> {
  if (!timeoutMs || timeoutMs <= 0) return op(parent);
  const ctrl = new AbortController();
  const onParentAbort = () => ctrl.abort();
  parent.addEventListener("abort", onParentAbort, { once: true });
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  return op(ctrl.signal)
    .finally(() => {
      clearTimeout(timer);
      parent.removeEventListener("abort", onParentAbort);
    });
}


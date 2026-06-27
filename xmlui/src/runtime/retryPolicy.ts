import { createContext, useContext } from "react";

import { ManagedFetchError } from "./data";

export type RetryErrorCategory =
  | "network"
  | "server"
  | "rate-limit"
  | "validation"
  | "authorization"
  | "not-found"
  | "conflict"
  | "user-cancelled"
  | "internal";

export type RetryPolicySpec = {
  attempts: number;
  backoff: "fixed" | "linear" | "exponential";
  delayMs: number;
  jitter?: boolean;
  onlyCategories?: readonly RetryErrorCategory[];
  timeoutMs?: number;
  honourRetryAfter?: boolean;
  circuitBreaker?: CircuitBreakerSpec;
};

export type CircuitBreakerSpec = {
  failureThreshold: number;
  resetMs: number;
};

export type CircuitBreakerState = {
  state: "closed" | "open" | "half-open";
  consecutiveFailures: number;
  openedAt?: number;
};

export type RetryPolicyContextValue = {
  spec: RetryPolicySpec;
  circuitState: CircuitBreakerState;
};

export type RetryPolicyError = Error & {
  code?: string;
  category?: RetryErrorCategory;
  retryable?: boolean;
  data?: Record<string, unknown>;
  cause?: unknown;
};

export const RetryPolicyContext = createContext<RetryPolicyContextValue | undefined>(undefined);

export function useRetryPolicy(): RetryPolicyContextValue | undefined {
  return useContext(RetryPolicyContext);
}

export function createCircuitState(): CircuitBreakerState {
  return { state: "closed", consecutiveFailures: 0 };
}

export async function executeWithRetryPolicy<T>(
  operation: () => Promise<T>,
  spec: RetryPolicySpec,
  circuitState: CircuitBreakerState = createCircuitState(),
): Promise<T> {
  const attempts = Math.max(1, Math.trunc(spec.attempts) || 1);
  let lastError: RetryPolicyError | undefined;

  for (let attempt = 0; attempt < attempts; attempt++) {
    assertCircuitAllowsAttempt(spec, circuitState);
    try {
      const result = await runWithTimeout(operation, spec.timeoutMs);
      closeCircuit(circuitState);
      return result;
    } catch (error) {
      const normalized = normalizeRetryError(error);
      lastError = normalized;
      markCircuitFailure(spec, circuitState);

      if (!shouldRetry(normalized, spec)) {
        throw normalized;
      }
      if (attempt === attempts - 1) {
        break;
      }
      await delay(retryDelay(spec, attempt, normalized));
    }
  }

  throw retryExhaustedError(attempts, lastError);
}

function assertCircuitAllowsAttempt(spec: RetryPolicySpec, state: CircuitBreakerState): void {
  const breaker = spec.circuitBreaker;
  if (!breaker || state.state !== "open") {
    return;
  }
  const elapsed = Date.now() - (state.openedAt ?? 0);
  if (elapsed >= breaker.resetMs) {
    state.state = "half-open";
    return;
  }
  throw createRetryError({
    code: "circuit-open",
    category: "server",
    message: "Circuit breaker is open; failing fast",
    retryable: false,
    data: { resetInMs: Math.max(0, breaker.resetMs - elapsed) },
  });
}

function markCircuitFailure(spec: RetryPolicySpec, state: CircuitBreakerState): void {
  const breaker = spec.circuitBreaker;
  if (!breaker) {
    return;
  }
  state.consecutiveFailures += 1;
  if (state.state === "half-open" || state.consecutiveFailures >= breaker.failureThreshold) {
    state.state = "open";
    state.openedAt = Date.now();
  }
}

function closeCircuit(state: CircuitBreakerState): void {
  state.state = "closed";
  state.consecutiveFailures = 0;
  state.openedAt = undefined;
}

function shouldRetry(error: RetryPolicyError, spec: RetryPolicySpec): boolean {
  if (spec.onlyCategories && !spec.onlyCategories.includes(error.category ?? "internal")) {
    return false;
  }
  if (error.retryable === false) {
    return false;
  }
  return ["network", "server", "rate-limit"].includes(error.category ?? "internal");
}

function retryDelay(spec: RetryPolicySpec, attemptIndex: number, error: RetryPolicyError): number {
  const retryAfter = error.data?.retryAfterMs;
  if (spec.honourRetryAfter !== false && typeof retryAfter === "number" && retryAfter >= 0) {
    return Math.min(retryAfter, 60_000);
  }

  const base = Math.max(0, spec.delayMs);
  let nextDelay = base;
  if (spec.backoff === "linear") {
    nextDelay = base * (attemptIndex + 1);
  } else if (spec.backoff === "exponential") {
    nextDelay = base * 2 ** attemptIndex;
  }
  if (spec.jitter !== false) {
    const jitter = nextDelay * 0.25 * (Math.random() * 2 - 1);
    nextDelay = Math.max(0, nextDelay + jitter);
  }
  return nextDelay;
}

function normalizeRetryError(error: unknown): RetryPolicyError {
  if ((error as { name?: string })?.name === "AbortError") {
    return createRetryError({
      code: "cancelled",
      category: "user-cancelled",
      message: "Operation cancelled",
      retryable: false,
      cause: error,
    });
  }
  if (error instanceof ManagedFetchError) {
    return createRetryError({
      code: error.statusCode ? `http-${error.statusCode}` : "managed-fetch-error",
      category: categoryForStatus(error.statusCode),
      message: error.message,
      retryable: isRetryableStatus(error.statusCode),
      cause: error,
      data: retryDataFromResponse(error.response),
    });
  }
  if (error instanceof Error) {
    const existing = error as RetryPolicyError;
    if (existing.category) {
      return existing;
    }
    return createRetryError({
      code: existing.code ?? "error",
      category: "network",
      message: existing.message,
      cause: error,
    });
  }
  return createRetryError({
    code: "error",
    category: "network",
    message: String(error ?? "Unknown error"),
    cause: error,
  });
}

function categoryForStatus(statusCode: number | undefined): RetryErrorCategory {
  if (statusCode === 429) {
    return "rate-limit";
  }
  if (statusCode === 401 || statusCode === 403) {
    return "authorization";
  }
  if (statusCode === 404) {
    return "not-found";
  }
  if (statusCode === 409) {
    return "conflict";
  }
  if (statusCode !== undefined && statusCode >= 400 && statusCode < 500) {
    return "validation";
  }
  if (statusCode !== undefined && statusCode >= 500) {
    return "server";
  }
  return "network";
}

function isRetryableStatus(statusCode: number | undefined): boolean {
  return statusCode === undefined || statusCode === 429 || statusCode >= 500;
}

function retryDataFromResponse(response: unknown): Record<string, unknown> | undefined {
  if (!response || typeof response !== "object") {
    return undefined;
  }
  const retryAfterMs = (response as Record<string, unknown>).retryAfterMs;
  return typeof retryAfterMs === "number" ? { retryAfterMs } : undefined;
}

function retryExhaustedError(attempts: number, lastError: RetryPolicyError | undefined): RetryPolicyError {
  return createRetryError({
    code: "retry-exhausted",
    category: lastError?.category ?? "internal",
    message: `Retry policy exhausted after ${attempts} attempt(s)`,
    retryable: false,
    cause: lastError,
    data: { attempts, lastErrorCode: lastError?.code },
  });
}

function createRetryError(input: {
  code: string;
  category: RetryErrorCategory;
  message: string;
  retryable?: boolean;
  data?: Record<string, unknown>;
  cause?: unknown;
}): RetryPolicyError {
  const error = new Error(input.message) as RetryPolicyError;
  error.code = input.code;
  error.category = input.category;
  error.retryable = input.retryable;
  error.data = input.data;
  error.cause = input.cause;
  return error;
}

function runWithTimeout<T>(operation: () => Promise<T>, timeoutMs: number | undefined): Promise<T> {
  const timeout = Math.max(0, Math.trunc(timeoutMs ?? 0));
  if (timeout === 0) {
    return operation();
  }
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(createRetryError({
        code: "timeout",
        category: "network",
        message: `Operation timed out after ${timeout}ms`,
      }));
    }, timeout);
    operation().then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, Math.max(0, ms)));
}

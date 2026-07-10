import { memo, useMemo, useRef, type ReactNode } from "react";

import { RetryPolicyContext, type RetryPolicyContextValue } from "../../components-core/errors/RetryPolicyContext";
import { createCircuitState, type CircuitBreakerSpec, type RetryPolicySpec } from "../../components-core/errors/policy";
import type { ErrorCategory } from "../../components-core/errors/app-error";
import { defaultProps } from "./RetryPolicy.defaults";

// =====================================================================================================================
// React RetryPolicy component implementation
//
// Plan #07 Phase 3 Step 3.1.  Provides a `RetryPolicyContext` for descendants
// (currently `<Loader>` / `<DataSource>`; APICall, WebSocket, EventSource
// are wired in follow-up steps).  Renders children unchanged.

type Backoff = "fixed" | "linear" | "exponential";

type Props = {
  attempts?: number;
  backoff?: Backoff;
  delayMs?: number;
  jitter?: boolean;
  onlyCategories?: ReadonlyArray<ErrorCategory> | string;
  timeoutMs?: number;
  honourRetryAfter?: boolean;
  circuitBreaker?: CircuitBreakerSpec;
  children?: ReactNode;
};

function normalizeCategories(
  value: ReadonlyArray<ErrorCategory> | string | undefined,
): ReadonlyArray<ErrorCategory> | undefined {
  if (value == null) return undefined;
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    const parts = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as ErrorCategory[];
    return parts.length ? parts : undefined;
  }
  return undefined;
}

export const RetryPolicy = memo(function RetryPolicy({
  attempts = defaultProps.attempts,
  backoff = defaultProps.backoff,
  delayMs = defaultProps.delayMs,
  jitter = defaultProps.jitter,
  onlyCategories,
  timeoutMs,
  honourRetryAfter = defaultProps.honourRetryAfter,
  circuitBreaker,
  children,
}: Props) {
  // Circuit-breaker state is per-policy-instance and must survive re-renders.
  const circuitStateRef = useRef(createCircuitState());

  const value = useMemo<RetryPolicyContextValue>(() => {
    const spec: RetryPolicySpec & { circuitBreaker?: CircuitBreakerSpec } = {
      attempts: Math.max(1, attempts | 0),
      backoff,
      delayMs: Math.max(0, delayMs | 0),
      jitter,
      onlyCategories: normalizeCategories(onlyCategories),
      timeoutMs: timeoutMs != null ? Math.max(0, timeoutMs | 0) : undefined,
      honourRetryAfter,
      circuitBreaker,
    };
    return { spec, circuitState: circuitStateRef.current };
  }, [attempts, backoff, delayMs, jitter, onlyCategories, timeoutMs, honourRetryAfter, circuitBreaker]);

  return <RetryPolicyContext.Provider value={value}>{children}</RetryPolicyContext.Provider>;
});

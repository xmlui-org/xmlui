import { createContext, useContext } from "react";
import type { CircuitBreakerSpec, CircuitBreakerState, RetryPolicySpec } from "./policy";

/**
 * React context used by `<RetryPolicy>` to broadcast its policy to nearest
 * eligible descendants (currently `Loader`, `APICall`). When no provider is
 * present (`undefined`), descendants behave with their default
 * single-attempt fetch.
 *
 * The context carries a stable `circuitState` reference so consecutive
 * fetches from the same descendant share circuit-breaker state.
 */
export interface RetryPolicyContextValue {
  spec: RetryPolicySpec & { circuitBreaker?: CircuitBreakerSpec };
  circuitState: CircuitBreakerState;
}

export const RetryPolicyContext = createContext<RetryPolicyContextValue | undefined>(undefined);

/** Read the nearest ambient retry policy. */
export function useRetryPolicy(): RetryPolicyContextValue | undefined {
  return useContext(RetryPolicyContext);
}

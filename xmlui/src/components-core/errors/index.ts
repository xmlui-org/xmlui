/**
 * Structured exception model — public barrel.
 *
 * Import from this module at all call sites to keep the public API stable
 * as the internal structure evolves.
 */

export type { ErrorCategory, AppErrorInit } from "./app-error";
export { AppError, categorizeHttpStatus } from "./app-error";

export type { RetryPolicySpec, CircuitBreakerSpec, ExecuteOptions, CircuitBreakerState } from "./policy";
export { executeWithPolicy, parseRetryAfter, createCircuitState, MAX_RETRY_AFTER_MS } from "./policy";

export type { ErrorDiagnosticCode, ErrorSource, ErrorDiagnostic } from "./diagnostics";

export type { RetryPolicyContextValue } from "./RetryPolicyContext";
export { RetryPolicyContext, useRetryPolicy } from "./RetryPolicyContext";

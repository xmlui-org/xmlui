/**
 * Structured exception model — public barrel.
 *
 * Import from this module at all call sites to keep the public API stable
 * as the internal structure evolves.
 */

export type { ErrorCategory, AppErrorInit } from "./app-error";
export { AppError } from "./app-error";

export type { RetryPolicySpec, CircuitBreakerSpec } from "./policy";
export { executeWithPolicy } from "./policy";

export type { ErrorDiagnosticCode, ErrorSource, ErrorDiagnostic } from "./diagnostics";

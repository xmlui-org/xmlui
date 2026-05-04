/**
 * Error diagnostic types.
 *
 * `ErrorDiagnostic` is produced whenever the XMLUI error pipeline detects a
 * structural problem (unhandled error, exhausted retry policy, open circuit,
 * rethrow cycle, fallback rendered, etc.).
 *
 * Diagnostics are emitted as `kind: "errors"` trace entries via `pushXsLog`.
 * They do *not* replace the toast / `$error` surface; they augment it with
 * machine-readable metadata for telemetry and the Inspector overlay.
 */

// ---------------------------------------------------------------------------
// Code and source unions
// ---------------------------------------------------------------------------

export type ErrorDiagnosticCode =
  | "unhandled-error"    // error escaped all containment sites
  | "retry-exhausted"    // all attempts failed (plan #07 Phase 3)
  | "circuit-open"       // circuit breaker is open (plan #07 Phase 3)
  | "fallback-rendered"  // <Fallback> activated (plan #07 Phase 4)
  | "rethrow-cycle";     // error was rethrown in an onError handler, creating a cycle

export type ErrorSource =
  | "render"    // thrown during React render
  | "handler"   // thrown in an event handler
  | "loader"    // thrown during DataSource / APICall load
  | "lifecycle" // thrown in a lifecycle hook (plan #04)
  | "fetch"     // thrown inside App.fetch / RestApiProxy
  | "user";     // explicitly created by user markup (throw expression)

// ---------------------------------------------------------------------------
// ErrorDiagnostic
// ---------------------------------------------------------------------------

export interface ErrorDiagnostic {
  code: ErrorDiagnosticCode;
  severity: "error" | "warn" | "info";
  /** UID of the component where the error originated, if known. */
  componentUid?: string;
  source: ErrorSource;
  message: string;
  /** Server-issued correlation ID, if available on the `AppError`. */
  correlationId?: string;
}

/**
 * Audit-grade observability — diagnostic types.
 *
 * `AuditDiagnostic` entries are emitted as `kind: "audit"` trace entries
 * via `pushXsLog` when the audit pipeline itself encounters a structural
 * problem (redaction gap, sink failure, buffer overflow, etc.).
 *
 * Note: this is the audit *system's own* diagnostics — not the entries the
 * pipeline carries for other subsystems.
 */

export type AuditDiagCode =
  | "audit-redaction-missing"   // a field that should be redacted was not covered by a rule
  | "audit-redaction-overrun"   // the redacted payload exceeded the configured size budget
  | "audit-sink-failure"        // the sink (OTLP / console) could not accept entries
  | "audit-correlation-missing" // a trace entry was produced without a correlation context
  | "audit-buffer-overflow"     // the in-memory buffer was full and entries were dropped
  | "audit-pii-leaked"          // a PII value escaped through an un-redacted path (strict mode)
  | "audit-policy-conflict";    // two redaction rules target the same path with incompatible modes

export interface AuditDiagnostic {
  code: AuditDiagCode;
  severity: "error" | "warn" | "info";
  message: string;
  data?: unknown;
}

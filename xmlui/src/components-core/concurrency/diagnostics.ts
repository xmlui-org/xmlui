/**
 * Diagnostic codes for the concurrency module (Plan #6 §6 / master-plan §6).
 *
 * Every diagnostic emitted via `pushXsLog({ kind: "concurrency", code, ... })`
 * uses one of the codes below. Centralising them here lets:
 *
 * - The Inspector group / colour traces by code.
 * - W7-1 add new codes without scattering string literals.
 * - Tests assert on the union exhaustively.
 *
 * All codes are prefix-namespaced `concurrency-*` per master-plan §6
 * convention 3 (diagnostic-code prefix discipline).
 */

export type ConcurrencyCode =
  /** Handler aborted via `$cancel`-driven `throwIfAborted()` or signal. */
  | "concurrency-handler-cancelled"
  /** Handler exceeded `defaultHandlerTimeoutMs` / per-invocation `timeoutMs`. */
  | "concurrency-handler-timeout"
  /** `drop-while-running` policy refused a new invocation. */
  | "concurrency-handler-dropped"
  /** `single-flight` policy aborted a running invocation in favour of a newer one. */
  | "concurrency-handler-superseded"
  /** Form-style transactional conflict (W5-1 / W5-4). */
  | "concurrency-transactional-conflict";

/** Severity tier for routing concurrency traces in the Inspector. */
export type ConcurrencySeverity = "info" | "warn" | "error";

export interface ConcurrencyDiagnostic {
  code: ConcurrencyCode;
  severity: ConcurrencySeverity;
  componentUid?: string;
  eventName?: string;
  /** Free-form human-readable detail; safe to render in tooltips. */
  message: string;
}

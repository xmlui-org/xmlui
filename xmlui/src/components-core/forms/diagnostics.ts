/**
 * Diagnostic codes for the forms module (Plan #9 §0).
 *
 * Every diagnostic emitted via `pushXsLog({ kind: "forms", code, ... })`
 * uses one of the codes below. Centralising them here lets:
 *
 * - The Inspector group / colour traces by code.
 * - W5-1..W5-4 extend the union without scattering string literals.
 * - Tests assert on the union exhaustively.
 *
 * All codes share no special prefix — `kind: "forms"` already namespaces
 * them in the Inspector trace stream.
 */

export type FormDiagnosticCode =
  /** Validator name referenced from markup is not in the registry. */
  | "unknown-validator"
  /** A validator with the same name was registered more than once. */
  | "duplicate-validator"
  /** Server returned a per-field error for a field not present in the form. */
  | "server-error-unmapped"
  /** A submit was attempted while a previous submit is still in flight. */
  | "submit-while-busy"
  /** A CSRF token is required but the `<Form>` did not supply one. */
  | "csrf-token-missing"
  /** A validator `fn` threw an exception during evaluation. */
  | "validator-throw"
  /** A deprecated alias (e.g. `pattern`) was used; rename to the new name. */
  | "deprecated-alias";

export type FormDiagnosticSeverity = "info" | "warn" | "error";

export interface FormDiagnostic {
  code: FormDiagnosticCode;
  severity: FormDiagnosticSeverity;
  formId?: string;
  fieldName?: string;
  validatorName?: string;
  message: string;
  data?: unknown;
}

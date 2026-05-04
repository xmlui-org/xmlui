/**
 * Build-time validation diagnostic types.
 *
 * A `BuildDiagnostic` is the unit of output from every analyzer rule. Rules
 * are registered via `rule-registry.ts`; the walker in `walker.ts` collects
 * diagnostics from all rules and returns them to the caller.
 *
 * `BuildDiagnosticCode` is an *open* string union — each rule family extends
 * it with its own prefix-namespaced codes:
 *   `id-*`          identifier rules (unknown component/prop/event/method/slot)
 *   `expr-*`        expression rules (unused var, dead conditional, …)
 *   `theming-*`     theme-variable rules (plan #02)
 *   `forms-*`       form-validation rules (plan #09)
 *   `udc-*`         UDC sandbox rules (plan #14)
 *   `audit-*`       audit-pipeline rules (plan #15)
 *   `versioning-*`  deprecation / removal rules (plan #12)
 *   `accessibility-*` a11y rules (plan #05)
 *   `lifecycle-*`   lifecycle rules (plan #04)
 *   `concurrency-*` concurrency rules (plan #06)
 *   `determinism-*` state-write ordering rules (plan #16)
 *   `error-*`       error-model rules (plan #07)
 *   `i18n-*`        internationalisation rules (plan #11)
 *   `route-*`       routing rules (plan #10)
 */

// Open union — rule families extend this by re-exporting a wider union type.
export type BuildDiagnosticCode = string;

export interface BuildDiagnosticSuggestion {
  title: string;
  replacement?: string;
}

export interface BuildDiagnostic {
  /** Prefix-namespaced code identifying the rule. */
  code: BuildDiagnosticCode;
  severity: "error" | "warn" | "info";
  /** Workspace-relative or absolute path of the source file. */
  file: string;
  /** 1-based line number. */
  line: number;
  /** 1-based column number. */
  column: number;
  /** Length of the offending token (0 when the position is a point). */
  length: number;
  /** Human-readable description of the problem. */
  message: string;
  /** Optional structured payload for machine consumers. */
  data?: unknown;
  /** Optional fix hints shown in the IDE. */
  suggestions?: ReadonlyArray<BuildDiagnosticSuggestion>;
}

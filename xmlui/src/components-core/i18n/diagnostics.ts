export type I18nDiagnosticCode =
  | "missing-key"
  | "missing-bundle"
  | "icu-parse-error"
  | "untranslated-literal"
  | "physical-css-property"
  | "rtl-mismatch";

export interface I18nDiagnostic {
  code: I18nDiagnosticCode;
  severity: "error" | "warn";
  locale?: string;
  key?: string;
  bundleId?: string;
  message: string;
  data?: unknown;
}

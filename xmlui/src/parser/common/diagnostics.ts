import type { SourceSpan } from "./source";

export type ParserDiagnosticSeverity = "error" | "warning";

export type ParserDiagnostic = {
  code: string;
  message: string;
  severity: ParserDiagnosticSeverity;
  span: SourceSpan;
  contextSpan?: SourceSpan;
};

export function createErrorDiagnostic(
  code: string,
  message: string,
  span: SourceSpan,
  contextSpan?: SourceSpan,
): ParserDiagnostic {
  return {
    code,
    message,
    severity: "error",
    span,
    ...(contextSpan ? { contextSpan } : {}),
  };
}

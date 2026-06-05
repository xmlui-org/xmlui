import {
  buildSuppressionMap,
  isSuppressed,
  type SuppressionMap,
} from "../analyzer/suppression";
import type { TypeContractDiagnostic } from "./diagnostics";

export function filterSuppressedTypeContractDiagnostics(
  diagnostics: readonly TypeContractDiagnostic[],
  source: string | undefined,
): TypeContractDiagnostic[] {
  if (!source || diagnostics.length === 0) {
    return [...diagnostics];
  }

  const suppressions = buildSuppressionMap(source);
  return diagnostics.filter((diag) => !isTypeContractDiagnosticSuppressed(diag, suppressions));
}

export function isTypeContractDiagnosticSuppressed(
  diagnostic: TypeContractDiagnostic,
  suppressions: SuppressionMap,
): boolean {
  const line = diagnostic.range?.line;
  if (line === undefined) return false;

  return isSuppressed(diagnostic.code, line, suppressions);
}

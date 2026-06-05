import {
  buildSuppressionMap,
  isSuppressed,
  type SuppressionMap,
} from "../analyzer/suppression";
import type { TypeContractDiagnostic } from "./diagnostics";

const TYPE_CONTRACT_SUPPRESSION_ALIASES: Partial<Record<string, string>> = {
  "unknown-component": "id-unknown-component",
  "unknown-prop": "id-unknown-prop",
  "unknown-event": "id-unknown-event",
  "unknown-exposed-method": "id-unknown-method",
};

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

  for (const code of suppressionCodesFor(diagnostic.code)) {
    if (isSuppressed(code, line, suppressions)) {
      return true;
    }
  }
  return false;
}

function suppressionCodesFor(code: TypeContractDiagnostic["code"]): string[] {
  const alias = TYPE_CONTRACT_SUPPRESSION_ALIASES[code];
  return alias ? [code, alias] : [code];
}

import { pushXsLog } from "../../inspector/inspectorUtils";
import type { ThemeDiagnostic } from "./diagnostics";

const emittedDiagnosticKeys = new Set<string>();

export function emitThemeDiagnostic(diagnostic: ThemeDiagnostic): void {
  const key = themeDiagnosticKey(diagnostic);
  if (emittedDiagnosticKeys.has(key)) return;
  emittedDiagnosticKeys.add(key);

  pushXsLog({
    kind: "theming",
    ts: Date.now(),
    severity: diagnostic.severity,
    code: diagnostic.code,
    variableName: diagnostic.variableName,
    propName: diagnostic.propName,
    expected: diagnostic.expected,
    actual: diagnostic.actual,
    message: diagnostic.message,
  });

  if (typeof console === "undefined") return;
  const message = `[XMLUI Theme] [${diagnostic.code}] ${diagnostic.message}`;
  if (diagnostic.severity === "error") {
    console.error?.(message);
  } else {
    console.warn?.(message);
  }
}

export function emitThemeDiagnostics(diagnostics: ThemeDiagnostic[]): void {
  for (const diagnostic of diagnostics) {
    emitThemeDiagnostic(diagnostic);
  }
}

export function resetThemeDiagnosticDeduplication(): void {
  emittedDiagnosticKeys.clear();
}

function themeDiagnosticKey(diagnostic: ThemeDiagnostic): string {
  return JSON.stringify({
    severity: diagnostic.severity,
    code: diagnostic.code,
    variableName: diagnostic.variableName,
    propName: diagnostic.propName,
    expected: diagnostic.expected,
    actual: diagnostic.actual,
    message: diagnostic.message,
  });
}

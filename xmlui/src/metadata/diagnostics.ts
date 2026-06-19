import { compileXmluiSource } from "../compiler/compileXmluiSource";
import { XmluiParseError } from "../compiler/parseXmlui";
import { SourceText, type ParserDiagnostic } from "../parser";
import type { XmluiUnifiedDiagnostic } from "./types";

export type CollectUnifiedDiagnosticsOptions = {
  knownComponents?: ReadonlySet<string>;
};

export function collectUnifiedDiagnostics(
  text: string,
  sourceId = "document.xmlui",
  options: CollectUnifiedDiagnosticsOptions = {},
): XmluiUnifiedDiagnostic[] {
  try {
    const compiled = compileXmluiSource({
      id: sourceId,
      source: text,
      knownComponents: options.knownComponents ?? [],
    });
    return filterDuplicateDiagnostics(compiled.compilerIr.diagnostics).map((diagnostic) =>
      toUnifiedDiagnostic(text, sourceId, diagnostic),
    );
  } catch (error) {
    if (!(error instanceof XmluiParseError)) {
      throw error;
    }
    return [toUnifiedDiagnostic(text, sourceId, error.diagnostic)];
  }
}

function filterDuplicateDiagnostics(diagnostics: ParserDiagnostic[]): ParserDiagnostic[] {
  const irUnknownComponentSpans = new Set(
    diagnostics
      .filter((diagnostic) => diagnostic.code === "IR003")
      .map((diagnostic) => `${diagnostic.span.start}:${diagnostic.span.end}`),
  );
  return diagnostics.filter((diagnostic) => {
    if (diagnostic.code !== "XC001") {
      return true;
    }
    return !irUnknownComponentSpans.has(`${diagnostic.span.start}:${diagnostic.span.end}`);
  });
}

export function toUnifiedDiagnostic(
  text: string,
  sourceId: string,
  diagnostic: ParserDiagnostic,
): XmluiUnifiedDiagnostic {
  const source = new SourceText(text, sourceId);
  const start = source.positionAt(diagnostic.span.start);
  const end = source.positionAt(diagnostic.span.end);
  return {
    code: diagnostic.code,
    category: categoryForDiagnostic(diagnostic.code),
    message: diagnostic.message,
    severity: diagnostic.severity,
    sourceId,
    start: diagnostic.span.start,
    end: diagnostic.span.end,
    line: start.line,
    character: start.column,
    endLine: end.line,
    endCharacter: end.column,
  };
}

function categoryForDiagnostic(code: string): XmluiUnifiedDiagnostic["category"] {
  if (code.startsWith("XP")) {
    return "parser";
  }
  if (code.startsWith("XC")) {
    return "contract";
  }
  if (code.startsWith("XM")) {
    return "metadata";
  }
  return "compiler";
}

import { buildCompilerIrFromDocument } from "../../../xmlui/src/compiler/ir/index";
import { parseXmlui, XmluiParseError } from "../../../xmlui/src/compiler/parseXmlui";
import { SourceText, type ParserDiagnostic } from "../../../xmlui/src/parser";

export type XmluiDiagnostic = {
  code: string;
  message: string;
  severity: "error" | "warning";
  line: number;
  character: number;
  endLine: number;
  endCharacter: number;
};

export type CollectXmluiDiagnosticsOptions = {
  knownComponents?: ReadonlySet<string>;
};

export function collectXmluiDiagnostics(
  text: string,
  sourceId = "document.xmlui",
  options: CollectXmluiDiagnosticsOptions = {},
): XmluiDiagnostic[] {
  try {
    const document = parseXmlui(text, { sourceId });
    const ir = buildCompilerIrFromDocument(document, {
      sourceId,
      validation: options.knownComponents ? { knownComponents: options.knownComponents } : undefined,
    });
    return ir.diagnostics.map((diagnostic) => diagnosticToVsCodeDiagnostic(text, sourceId, diagnostic));
  } catch (error) {
    if (!(error instanceof XmluiParseError)) {
      throw error;
    }
    return [diagnosticToVsCodeDiagnostic(text, sourceId, error.diagnostic)];
  }
}

function diagnosticToVsCodeDiagnostic(
  text: string,
  sourceId: string,
  diagnostic: ParserDiagnostic,
): XmluiDiagnostic {
  const source = new SourceText(text, sourceId);
  const start = source.positionAt(diagnostic.span.start);
  const end = source.positionAt(diagnostic.span.end);
  return {
    code: diagnostic.code,
    message: diagnostic.message,
    severity: diagnostic.severity,
    line: start.line,
    character: start.column,
    endLine: end.line,
    endCharacter: end.column,
  };
}

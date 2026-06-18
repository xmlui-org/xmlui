import { parseXmlui, XmluiParseError } from "../../../xmlui/src/compiler/parseXmlui";
import { SourceText } from "../../../xmlui/src/parser";

export type XmluiDiagnostic = {
  code: string;
  message: string;
  severity: "error" | "warning";
  line: number;
  character: number;
  endLine: number;
  endCharacter: number;
};

export function collectXmluiDiagnostics(text: string, sourceId = "document.xmlui"): XmluiDiagnostic[] {
  try {
    parseXmlui(text, { sourceId });
    return [];
  } catch (error) {
    if (!(error instanceof XmluiParseError)) {
      throw error;
    }
    const source = new SourceText(text, sourceId);
    const start = source.positionAt(error.diagnostic.span.start);
    const end = source.positionAt(error.diagnostic.span.end);
    return [
      {
        code: error.diagnostic.code,
        message: error.diagnostic.message,
        severity: error.diagnostic.severity,
        line: start.line,
        character: start.column,
        endLine: end.line,
        endCharacter: end.column,
      },
    ];
  }
}

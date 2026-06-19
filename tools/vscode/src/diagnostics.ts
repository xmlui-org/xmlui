import { collectUnifiedDiagnostics } from "../../../xmlui/src/metadata";

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
  return collectUnifiedDiagnostics(text, sourceId, options).map((diagnostic) => ({
    code: diagnostic.code,
    message: diagnostic.message,
    severity: diagnostic.severity,
    line: diagnostic.line,
    character: diagnostic.character,
    endLine: diagnostic.endLine,
    endCharacter: diagnostic.endCharacter,
  }));
}

import { DiagnosticSeverity, type Diagnostic, type Position } from "vscode-languageserver";
import type { ParserDiag } from "../../parsers/xmlui-parser/diagnostics";
import type { ParseResult } from "../../parsers/xmlui-parser/parser";
import type { Project } from "../base/project";
import type { DocumentUri, DocumentCursor } from "../base/text-document";

export type DiagnosticsContext = {
  cursor: DocumentCursor;
  parseResult: ParseResult;
};

function getDiagnosticsInternal(ctx: DiagnosticsContext): Diagnostic[] {
  const { errors } = ctx.parseResult;

  return errors.map((e) => {
    return errorToLspDiag(e, ctx.cursor);
  });
}

export function errorToLspDiag(e: ParserDiag, cursor: DocumentCursor): Diagnostic {
  return {
    severity: DiagnosticSeverity.Error,
    range: cursor.rangeAt(e),
    message: e.message,
    code: e.code,
  };
}

export function getDiagnostics(project: Project, uri: DocumentUri): Diagnostic[] {
  const document = project.documents.get(uri);
  if (!document) {
    return [];
  }
  const { parseResult } = document.parse();
  const ctx = {
    parseResult,
    cursor: document.cursor,
  };
  return getDiagnosticsInternal(ctx);
}

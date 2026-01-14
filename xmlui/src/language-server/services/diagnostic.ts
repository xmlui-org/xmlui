import { DiagnosticSeverity, type Diagnostic, type Position } from "vscode-languageserver";
import type { ParserDiag } from "../../parsers/xmlui-parser/diagnostics";
import type { ParseResult } from "../../parsers/xmlui-parser/parser";
import { offsetRangeToPosRange } from "./common/lsp-utils";
import type { Project } from "../base/project";
import type { DocumentUri } from "../base/text-document";

export type DiagnosticsContext = {
  offsetToPos: (pos: number) => Position;
  parseResult: ParseResult;
};

function getDiagnosticsInternal(ctx: DiagnosticsContext): Diagnostic[] {
  const { errors } = ctx.parseResult;

  return errors.map((e) => {
    return errorToLspDiag(e, ctx.offsetToPos);
  });
}

export function errorToLspDiag(e: ParserDiag, offsetToPos: (n: number) => Position): Diagnostic {
  return {
    severity: DiagnosticSeverity.Error,
    range: offsetRangeToPosRange(offsetToPos, e),
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
    offsetToPos: (offset: number) => document.positionAt(offset),
  };
  return getDiagnosticsInternal(ctx);
}

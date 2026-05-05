import { DiagnosticSeverity, type Diagnostic, type Position } from "vscode-languageserver";
import type { ParserDiag } from "../../parsers/xmlui-parser/diagnostics";
import type { ParseResult } from "../../parsers/xmlui-parser/parser";
import type { Project } from "../base/project";
import type { DocumentUri, DocumentCursor } from "../base/text-document";
import { analyze } from "../../components-core/analyzer/walker";

export type DiagnosticsContext = {
  cursor: DocumentCursor;
  parseResult: ParseResult;
  source?: string;
  uri?: string;
};

function getDiagnosticsInternal(ctx: DiagnosticsContext): Diagnostic[] {
  const { errors } = ctx.parseResult;

  const parserDiags = errors.map((e) => {
    return errorToLspDiag(e, ctx.cursor);
  });

  // Run the build-validator analyzer on the raw source
  const analyzerDiags: Diagnostic[] = [];
  if (ctx.source && ctx.uri) {
    try {
      const findings = analyze({ files: [{ file: ctx.uri, source: ctx.source }], strict: false });
      for (const d of findings) {
        const line = Math.max(0, (d.line ?? 1) - 1);
        const col = Math.max(0, (d.column ?? 1) - 1);
        analyzerDiags.push({
          severity: d.severity === "error"
            ? DiagnosticSeverity.Error
            : d.severity === "warn"
              ? DiagnosticSeverity.Warning
              : DiagnosticSeverity.Information,
          range: {
            start: { line, character: col },
            end: { line, character: col + 1 },
          },
          message: d.message,
          code: d.code,
          source: "xmlui-check",
        });
      }
    } catch {
      // Analyzer must never crash the LSP server
    }
  }

  return [...parserDiags, ...analyzerDiags];
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
  const source = document.getText();
  const ctx = {
    parseResult,
    cursor: document.cursor,
    source,
    uri,
  };
  return getDiagnosticsInternal(ctx);
}


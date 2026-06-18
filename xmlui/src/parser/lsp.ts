import type { ParserDiagnostic } from "./common/diagnostics";
import { SourceText, type SourceId, type SourceSpan, type TextSource } from "./common/source";
import type { TokenClassification } from "./common/tokens";
import { parseMarkup } from "./markup/parser";
import { tokenizeMarkup } from "./markup/scanner";
import { findTokenAtOffset, type FindTokenSuccess } from "./markup/syntaxNode";
import {
  findScriptNodeAtOffset,
  type FindScriptNodeSuccess,
  type ParseScriptOptions,
} from "./script/ast";
import { parseScriptExpression } from "./script/parser";
import { tokenizeScript } from "./script/scanner";

export type LspPosition = {
  line: number;
  character: number;
};

export type LspRange = {
  start: LspPosition;
  end: LspPosition;
};

export type ParserSemanticToken = {
  range: LspRange;
  classification: TokenClassification;
  text: string;
};

export type ParserLspDiagnostic = {
  range: LspRange;
  severity: "error" | "warning";
  code: string;
  message: string;
};

export type MarkupCursorContext = {
  parseResult: ReturnType<typeof parseMarkup>;
  lookup: FindTokenSuccess | undefined;
};

export type ScriptCursorContext = {
  parseResult: ReturnType<typeof parseScriptExpression>;
  lookup: FindScriptNodeSuccess | undefined;
};

export function markupSemanticTokens(source: TextSource | string, sourceId?: SourceId) {
  const sourceText = new SourceText(source, sourceId);
  return tokenizeMarkup(sourceText).tokens
    .filter((token) => token.text.length > 0)
    .map((token) => ({
      range: rangeForSpan(sourceText, token.span),
      classification: token.classification,
      text: token.text,
    })) satisfies ParserSemanticToken[];
}

export function scriptSemanticTokens(
  source: TextSource | string,
  options: ParseScriptOptions = {},
) {
  const sourceText = new SourceText(source, options.sourceId);
  return tokenizeScript(sourceText, options).tokens
    .filter((token) => token.text.length > 0)
    .map((token) => ({
      range: rangeForSpan(sourceText, token.span, options.originSpan),
      classification: token.classification,
      text: token.text,
    })) satisfies ParserSemanticToken[];
}

export function diagnosticsToLspDiagnostics(
  diagnostics: ParserDiagnostic[],
  source: SourceText,
): ParserLspDiagnostic[] {
  return diagnostics.map((diagnostic) => ({
    range: rangeForSpan(source, diagnostic.span),
    severity: diagnostic.severity,
    code: diagnostic.code,
    message: diagnostic.message,
  }));
}

export function findMarkupCursorContext(
  source: TextSource | string,
  offset: number,
  sourceId?: SourceId,
): MarkupCursorContext {
  const parseResult = parseMarkup(source, sourceId);
  return {
    parseResult,
    lookup: findTokenAtOffset(parseResult.node, offset),
  };
}

export function findScriptCursorContext(
  source: TextSource | string,
  offset: number,
  options: ParseScriptOptions = {},
): ScriptCursorContext {
  const parseResult = parseScriptExpression(source, options);
  const mappedOffset = options.originSpan ? options.originSpan.start + offset : offset;
  return {
    parseResult,
    lookup: findScriptNodeAtOffset(parseResult.node, mappedOffset),
  };
}

function rangeForSpan(source: SourceText, span: SourceSpan, originSpan?: SourceSpan): LspRange {
  const startOffset = originSpan ? span.start - originSpan.start : span.start;
  const endOffset = originSpan ? span.end - originSpan.start : span.end;
  return {
    start: toLspPosition(source.positionAt(startOffset)),
    end: toLspPosition(source.positionAt(endOffset)),
  };
}

function toLspPosition(position: { line: number; column: number }): LspPosition {
  return {
    line: position.line,
    character: position.column,
  };
}

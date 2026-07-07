import { parseScriptExpression } from "../parser";
import type { MixedTextSegment, SourceRange } from "./ir";

export type ParseMixedTextOptions = {
  sourceId?: string;
};

export function parseMixedTextSegments(
  value: string,
  range: SourceRange,
  options: ParseMixedTextOptions = {},
): MixedTextSegment[] {
  const segments: MixedTextSegment[] = [];
  let cursor = 0;

  while (cursor < value.length) {
    const open = findUnescaped(value, "{", cursor);
    if (open < 0) {
      pushLiteral(segments, unescapeLiteralBraces(value.slice(cursor)), offsetRange(range, cursor, value.length));
      break;
    }

    if (open > cursor) {
      pushLiteral(segments, unescapeLiteralBraces(value.slice(cursor, open)), offsetRange(range, cursor, open));
    }

    const close = findUnescaped(value, "}", open + 1);
    if (close < 0) {
      pushLiteral(segments, unescapeLiteralBraces(value.slice(open)), offsetRange(range, open, value.length));
      break;
    }

    const source = value.slice(open + 1, close).trim();
    const expressionStart = open + 1 + leadingWhitespace(value.slice(open + 1, close));
    const expressionEnd = expressionStart + source.length;
    const parsed = parseScriptExpression(source, {
      originSpan: {
        sourceId: options.sourceId ?? "anonymous.xmlui",
        start: range.start + expressionStart,
        end: range.start + expressionEnd,
      },
    });

    if (parsed.diagnostics.length > 0) {
      throw new Error(parsed.diagnostics[0].message);
    }

    segments.push({
      kind: "expression",
      source,
      range: offsetRange(range, open, close + 1),
      expressionRange: offsetRange(range, expressionStart, expressionEnd),
      ast: parsed.node,
    });
    cursor = close + 1;
  }

  return segments;
}

export function parseExpressionOrMixedText(
  value: string,
  range: SourceRange,
  options: ParseMixedTextOptions = {},
) {
  return parseMixedTextSegments(value, range, options);
}

function pushLiteral(segments: MixedTextSegment[], value: string, range: SourceRange): void {
  if (value.length === 0) {
    return;
  }
  segments.push({
    kind: "literal",
    value,
    range,
  });
}

function offsetRange(range: SourceRange, start: number, end: number): SourceRange {
  return {
    start: range.start + start,
    end: range.start + end,
  };
}

function leadingWhitespace(value: string): number {
  return value.length - value.trimStart().length;
}

function findUnescaped(value: string, needle: "{" | "}", start: number): number {
  let index = value.indexOf(needle, start);
  while (index >= 0 && isEscaped(value, index)) {
    index = value.indexOf(needle, index + 1);
  }
  return index;
}

function isEscaped(value: string, index: number): boolean {
  let backslashes = 0;
  for (let cursor = index - 1; cursor >= 0 && value[cursor] === "\\"; cursor--) {
    backslashes++;
  }
  return backslashes % 2 === 1;
}

function unescapeLiteralBraces(value: string): string {
  return value.replace(/\\([{}])/g, "$1");
}

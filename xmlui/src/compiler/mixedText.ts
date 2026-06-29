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
  let literalStart = 0;
  let literalRangeStart = 0;
  let literalValue = "";

  while (cursor < value.length) {
    if (value[cursor] === "\\" && isEscapableMixedTextBrace(value[cursor + 1])) {
      literalValue += value.slice(literalStart, cursor) + value[cursor + 1];
      cursor += 2;
      literalStart = cursor;
      continue;
    }

    if (value[cursor] !== "{") {
      cursor++;
      continue;
    }

    const open = cursor;
    const close = value.indexOf("}", open + 1);
    if (close < 0) {
      literalValue += value.slice(literalStart);
      pushLiteral(segments, literalValue, offsetRange(range, literalRangeStart, value.length));
      break;
    }

    literalValue += value.slice(literalStart, open);
    pushLiteral(segments, literalValue, offsetRange(range, literalRangeStart, open));

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
    literalStart = cursor;
    literalRangeStart = cursor;
    literalValue = "";
  }

  if (literalStart < value.length && cursor >= value.length) {
    literalValue += value.slice(literalStart);
    pushLiteral(segments, literalValue, offsetRange(range, literalRangeStart, value.length));
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

function isEscapableMixedTextBrace(value: string | undefined): value is "{" | "}" {
  return value === "{" || value === "}";
}

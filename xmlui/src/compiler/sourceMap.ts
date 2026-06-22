import { SourceText, type SourceSpan } from "../parser";

export type RawSourceMap = {
  version: 3;
  file: string;
  sources: string[];
  sourcesContent: string[];
  names: string[];
  mappings: string;
};

export type SourceMapMapping = {
  generatedOffset: number;
  sourceSpan: SourceSpan;
};

const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export function createLineMappedSourceMap({
  file,
  sourceId,
  source,
  generated,
}: {
  file: string;
  sourceId: string;
  source: string;
  generated: string;
}): RawSourceMap {
  const sourceLineCount = Math.max(1, source.split("\n").length);
  const generatedLineCount = Math.max(1, generated.split("\n").length);
  const lines: string[] = [];
  let previousSourceLine = 0;

  for (let generatedLine = 0; generatedLine < generatedLineCount; generatedLine++) {
    const sourceLine = Math.min(generatedLine, sourceLineCount - 1);
    lines.push(encodeVlq(0) + encodeVlq(0) + encodeVlq(sourceLine - previousSourceLine) + encodeVlq(0));
    previousSourceLine = sourceLine;
  }

  return {
    version: 3,
    file,
    sources: [sourceId],
    sourcesContent: [source],
    names: [],
    mappings: lines.join(";"),
  };
}

export function createMappedSourceMap({
  file,
  sourceId,
  source,
  generated,
  mappings,
}: {
  file: string;
  sourceId: string;
  source: string;
  generated: string;
  mappings: readonly SourceMapMapping[];
}): RawSourceMap {
  if (mappings.length === 0) {
    return createLineMappedSourceMap({ file, sourceId, source, generated });
  }

  const generatedText = new SourceText(generated, file);
  const sourceText = new SourceText(source, sourceId);
  const ordered = [...mappings].sort((left, right) => left.generatedOffset - right.generatedOffset);
  const generatedLineCount = Math.max(1, generated.split("\n").length);
  const lines: string[][] = Array.from({ length: generatedLineCount }, () => []);
  let previousGeneratedLine = 0;
  let previousGeneratedColumn = 0;
  let previousSourceIndex = 0;
  let previousSourceLine = 0;
  let previousSourceColumn = 0;

  for (const mapping of ordered) {
    const generatedPosition = generatedText.positionAt(mapping.generatedOffset);
    const sourcePosition = sourceText.positionAt(mapping.sourceSpan.start);
    const segment = [
      encodeVlq(generatedPosition.column - (generatedPosition.line === previousGeneratedLine ? previousGeneratedColumn : 0)),
      encodeVlq(0 - previousSourceIndex),
      encodeVlq(sourcePosition.line - previousSourceLine),
      encodeVlq(sourcePosition.column - previousSourceColumn),
    ].join("");
    lines[generatedPosition.line]?.push(segment);
    previousGeneratedLine = generatedPosition.line;
    previousGeneratedColumn = generatedPosition.column;
    previousSourceIndex = 0;
    previousSourceLine = sourcePosition.line;
    previousSourceColumn = sourcePosition.column;
  }

  return {
    version: 3,
    file,
    sources: [sourceId],
    sourcesContent: [source],
    names: [],
    mappings: lines.map((segments) => segments.join(",")).join(";"),
  };
}

function encodeVlq(value: number): string {
  let vlq = value < 0 ? ((-value) << 1) + 1 : value << 1;
  let encoded = "";
  do {
    let digit = vlq & 31;
    vlq >>>= 5;
    if (vlq > 0) {
      digit |= 32;
    }
    encoded += BASE64_CHARS[digit];
  } while (vlq > 0);
  return encoded;
}

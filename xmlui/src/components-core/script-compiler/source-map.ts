import type { CompiledScriptArtifact, CompiledScriptMapping } from "./types";

export type CompiledScriptSourceMap = {
  version: 3;
  file?: string;
  sources: string[];
  sourcesContent?: string[];
  names: string[];
  mappings: string;
};

export function createCompiledScriptSourceMap(
  artifact: CompiledScriptArtifact,
  file = artifact.sourceUrl ?? artifact.sourceId,
): CompiledScriptSourceMap {
  const sourceEntries = artifact.sources.length
    ? artifact.sources
    : [{ id: artifact.sourceId, sourceText: artifact.sourceText }];
  const sourceKeys = sourceEntries.map((source) => source.url ?? source.id);
  const sourceIndexById = new Map<string, number>();
  sourceEntries.forEach((source, index) => {
    sourceIndexById.set(source.id, index);
    if (source.url) {
      sourceIndexById.set(source.url, index);
    }
  });

  return {
    version: 3,
    file,
    sources: sourceKeys,
    sourcesContent: sourceEntries.map((source) => source.sourceText ?? ""),
    names: [],
    mappings: encodeMappings(artifact.js, artifact.mappings, sourceIndexById),
  };
}

export function createCompiledScriptGeneratedSourceUrl(
  artifact: Pick<CompiledScriptArtifact, "sourceId">,
): string {
  return `/@xmlui-source/__compiled/${encodeURIComponent(artifact.sourceId)}.js`;
}

export function createInlineSourceMapComment(sourceMap: CompiledScriptSourceMap): string {
  const json = JSON.stringify(sourceMap);
  const btoaFn = (globalThis as any).btoa;
  const encoded =
    typeof btoaFn === "function"
      ? btoaFn(unescape(encodeURIComponent(json)))
      : (globalThis as any).Buffer.from(json, "utf8").toString("base64");
  return `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${encoded}`;
}

export function createSourceUrlComment(sourceUrl: string): string {
  return `//# sourceURL=${sourceUrl}`;
}

function encodeMappings(
  generatedCode: string,
  mappings: CompiledScriptMapping[],
  sourceIndexById: Map<string, number>,
): string {
  const lines: string[][] = [];
  let previousGeneratedLine = 0;
  let previousGeneratedColumn = 0;
  let previousSourceIndex = 0;
  let previousOriginalLine = 0;
  let previousOriginalColumn = 0;
  const emittedGeneratedPositions = new Set<string>();

  for (const mapping of [...mappings].sort((a, b) => a.generatedStart - b.generatedStart)) {
    if (!mapping.sourceRange) continue;
    const sourceIndex = sourceIndexById.get(mapping.sourceId);
    if (sourceIndex === undefined) continue;

    const generatedPosition = positionAt(generatedCode, mapping.generatedStart);
    const generatedLine = generatedPosition.line - 1;
    const generatedColumn = generatedPosition.column;
    const generatedKey = `${generatedLine}:${generatedColumn}`;
    if (emittedGeneratedPositions.has(generatedKey)) {
      continue;
    }
    emittedGeneratedPositions.add(generatedKey);
    const originalLine = Math.max(0, (mapping.sourceRange.startLine ?? 1) - 1);
    const originalColumn = mapping.sourceRange.startColumn ?? 0;

    while (lines.length <= generatedLine) {
      lines.push([]);
    }
    if (generatedLine !== previousGeneratedLine) {
      previousGeneratedColumn = 0;
    }

    lines[generatedLine].push(
      encodeVlq(generatedColumn - previousGeneratedColumn) +
        encodeVlq(sourceIndex - previousSourceIndex) +
        encodeVlq(originalLine - previousOriginalLine) +
        encodeVlq(originalColumn - previousOriginalColumn),
    );

    previousGeneratedLine = generatedLine;
    previousGeneratedColumn = generatedColumn;
    previousSourceIndex = sourceIndex;
    previousOriginalLine = originalLine;
    previousOriginalColumn = originalColumn;
  }

  return lines.map((line) => line.join(",")).join(";");
}

function positionAt(sourceText: string, offset: number): { line: number; column: number } {
  const normalizedOffset = Math.max(0, Math.min(offset, sourceText.length));
  let line = 1;
  let column = 0;
  for (let i = 0; i < normalizedOffset; i++) {
    if (sourceText[i] === "\n") {
      line++;
      column = 0;
    } else {
      column++;
    }
  }
  return { line, column };
}

const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function encodeVlq(value: number): string {
  let vlq = value < 0 ? (-value << 1) + 1 : value << 1;
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

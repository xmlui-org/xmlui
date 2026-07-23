import type { ScripNodeBase } from "../script-runner/ScriptingSourceTree";
import type {
  CompiledScriptMapping,
  CompiledScriptSourceOrigin,
  CompiledScriptSourceRange,
} from "./types";

export function sourceRangeFromNode(
  node?: Pick<ScripNodeBase, "startToken" | "endToken">,
  origin?: CompiledScriptSourceOrigin,
): CompiledScriptSourceRange | undefined {
  if (!node?.startToken || !node.endToken) {
    return undefined;
  }

  return applySourceOriginToRange(
    {
      start: node.startToken.startPosition,
      end: node.endToken.endPosition,
      startLine: node.startToken.startLine,
      startColumn: node.startToken.startColumn,
      endLine: node.endToken.endLine,
      endColumn: node.endToken.endColumn,
    },
    origin,
  );
}

export function createCompiledScriptMapping(
  generatedStart: number,
  generatedEnd: number,
  sourceId: string,
  sourceRange?: CompiledScriptSourceRange,
): CompiledScriptMapping {
  return {
    generatedStart,
    generatedEnd,
    sourceId,
    sourceRange,
  };
}

export function applySourceOriginToRange(
  range: CompiledScriptSourceRange,
  origin?: CompiledScriptSourceOrigin,
): CompiledScriptSourceRange {
  if (!origin) {
    return range;
  }

  const offset = origin.offset ?? 0;
  const start = range.start + offset;
  const end = range.end + offset;
  if (origin.sourceText !== undefined) {
    const startPosition = positionAt(origin.sourceText, start);
    const endPosition = positionAt(origin.sourceText, end);
    return {
      start,
      end,
      startLine: startPosition.line,
      startColumn: startPosition.column,
      endLine: endPosition.line,
      endColumn: endPosition.column,
    };
  }

  const originLine = origin.line ?? 1;
  const originColumn = origin.column ?? 0;
  const localStartLine = range.startLine ?? 1;
  const localEndLine = range.endLine ?? localStartLine;
  return {
    start,
    end,
    startLine: originLine + localStartLine - 1,
    startColumn: localStartLine === 1 ? originColumn + (range.startColumn ?? 0) : range.startColumn,
    endLine: originLine + localEndLine - 1,
    endColumn: localEndLine === 1 ? originColumn + (range.endColumn ?? 0) : range.endColumn,
  };
}

export function positionAt(sourceText: string, offset: number): { line: number; column: number } {
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

export function createDebugSourceUrl(sourceId: string): string {
  if (sourceId.startsWith("/@xmlui-source/") || /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(sourceId)) {
    return sourceId;
  }
  return `/@xmlui-source/${sourceId.replace(/^\/+/, "")}`;
}

import type { ScripNodeBase } from "../script-runner/ScriptingSourceTree";
import type { CompiledScriptMapping, CompiledScriptSourceRange } from "./types";

export function sourceRangeFromNode(
  node?: Pick<ScripNodeBase, "startToken" | "endToken">,
): CompiledScriptSourceRange | undefined {
  if (!node?.startToken || !node.endToken) {
    return undefined;
  }

  return {
    start: node.startToken.startPosition,
    end: node.endToken.endPosition,
    startLine: node.startToken.startLine,
    startColumn: node.startToken.startColumn,
    endLine: node.endToken.endLine,
    endColumn: node.endToken.endColumn,
  };
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


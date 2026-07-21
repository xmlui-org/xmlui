import type { ScripNodeBase } from "../script-runner/ScriptingSourceTree";
import { sourceRangeFromNode } from "./source";
import type { CompiledScriptSourceRange } from "./types";

export class UnsupportedCompiledScriptNodeError extends Error {
  constructor(
    public readonly nodeType: string,
    public readonly sourceId: string,
    public readonly sourceRange?: CompiledScriptSourceRange,
  ) {
    super(`Unsupported ${nodeType} node in compiled script target '${sourceId}'.`);
    this.name = "UnsupportedCompiledScriptNodeError";
  }
}

export function throwUnsupportedCompiledScriptNode(
  node: Pick<ScripNodeBase, "type" | "startToken" | "endToken">,
  sourceId: string,
): never {
  throw new UnsupportedCompiledScriptNodeError(String(node.type), sourceId, sourceRangeFromNode(node));
}

import type { ScripNodeBase } from "../script-runner/ScriptingSourceTree";
import { sourceRangeFromNode } from "./source";
import { describeScriptNodeType } from "./node-names";
import type { CompiledScriptSourceRange } from "./types";

export class UnsupportedCompiledScriptNodeError extends Error {
  /** Human-readable name of the construct, e.g. `"await expression"`. */
  public readonly nodeTypeName: string;

  constructor(
    public readonly nodeType: string,
    public readonly sourceId: string,
    public readonly sourceRange?: CompiledScriptSourceRange,
  ) {
    const nodeTypeName = describeScriptNodeType(nodeType);
    super(
      `Unsupported ${nodeTypeName} (node type ${nodeType}) in compiled script target ` +
        `'${sourceId}'${formatSourcePosition(sourceRange)}.`,
    );
    this.nodeTypeName = nodeTypeName;
    this.name = "UnsupportedCompiledScriptNodeError";
  }
}

export function throwUnsupportedCompiledScriptNode(
  node: Pick<ScripNodeBase, "type" | "startToken" | "endToken">,
  sourceId: string,
): never {
  throw new UnsupportedCompiledScriptNodeError(
    String(node.type),
    sourceId,
    sourceRangeFromNode(node),
  );
}

function formatSourcePosition(sourceRange?: CompiledScriptSourceRange): string {
  if (sourceRange?.startLine === undefined) {
    return "";
  }
  const column = sourceRange.startColumn;
  return column === undefined
    ? ` at line ${sourceRange.startLine}`
    : ` at line ${sourceRange.startLine}, column ${column + 1}`;
}

import { T_IDENTIFIER } from "../../parsers/scripting/ScriptingNodeTypes";
import type { Identifier, ScripNodeBase } from "../script-runner/ScriptingSourceTree";
import { UnsupportedCompiledScriptNodeError } from "./errors";
import { sourceRangeFromNode } from "./source";

/**
 * A name that can be emitted as a JavaScript identifier.
 *
 * Both targets carried a copy of this, testing the same pattern and failing differently:
 * `binding-sync` raised an unsupported-node error, `event-async` a plain `Error`, which
 * `createCompileDiagnostic` then coded as `compile-source-unavailable` — "compilation
 * failed for some other reason" — rather than naming the construct. Same input, two
 * diagnostics, depending on where it appeared. The shared version keeps the accurate one.
 */
export function assertJsIdentifier(
  expr: Pick<Identifier, "name"> & Partial<Pick<ScripNodeBase, "type" | "startToken" | "endToken">>,
  sourceId: string,
): void {
  if (/^[$A-Z_a-z][$\w]*$/.test(expr.name)) {
    return;
  }
  throw new UnsupportedCompiledScriptNodeError(
    String(expr.type ?? T_IDENTIFIER),
    sourceId,
    // --- A name synthesized from a destructuring pattern carries no tokens, so there is
    // --- no range to report; a real identifier node has one.
    expr.startToken ? sourceRangeFromNode(expr as unknown as ScripNodeBase) : undefined,
  );
}

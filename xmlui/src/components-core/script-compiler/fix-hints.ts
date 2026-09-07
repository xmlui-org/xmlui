import * as T from "../../parsers/scripting/ScriptingNodeTypes";

/**
 * What to write instead.
 *
 * "await expression is not supported by the compiler" names the construct and stops. An
 * app author reading it still has to work out whether the code is wrong, whether the
 * framework is wrong, and what shape the fix takes. These hints answer that, and they are
 * the difference between a diagnostic and a chore.
 *
 * A hint is only worth having if it is concrete, so a node type with nothing specific to
 * say is deliberately absent rather than given a filler line.
 */
const FIX_HINTS: Record<number, string> = {
  [T.T_AWAIT_EXPRESSION]:
    "`await` is not part of XMLScript, and the interpreter rejects it too — XMLUI awaits " +
    "async calls for you. Remove the keyword; the value is the same either way.",
  [T.T_ARROW_EXPRESSION]:
    "An `async` arrow cannot be compiled. Drop the `async` keyword — XMLUI awaits async " +
    "calls on its own, so the body behaves the same without it.",
  [T.T_LITERAL]:
    "This literal cannot be written into generated JavaScript. Move the value into a " +
    "variable the script can reference instead of writing it inline.",
  [T.T_DESTRUCTURE]:
    "Destructuring is not supported in this position yet. Take the parameter whole and " +
    "read its fields in the body — `(row) => row.id` rather than `({ id }) => id`.",
  [T.T_OBJECT_DESTRUCTURE]:
    "Object destructuring is not supported in this position yet. Take the parameter whole " +
    "and read its fields in the body.",
  [T.T_ARRAY_DESTRUCTURE]:
    "Array destructuring is not supported in this position yet. Take the parameter whole " +
    "and index into it in the body.",
  [T.T_SPREAD_EXPRESSION]:
    "A rest parameter is not supported in this position yet. Declare the parameters you " +
    "need by name.",
  [T.T_ASYNC_FUNCTION_DECLARATION]:
    "`async function` is not part of XMLScript. Declare it without `async` — XMLUI awaits " +
    "async calls for you.",
};

export function fixHintForNodeType(nodeType: string | number | undefined): string | undefined {
  return nodeType === undefined ? undefined : FIX_HINTS[Number(nodeType)];
}

import type {
  MixedTextSegment,
  ParsedExpression,
  XmluiParsedBindings,
} from "../../compiler/ir";
import type { RuntimeScope } from "./scope";
import type { StateBag } from "./types";

export type RuntimeBindingEvaluator = (
  value: string,
  parsed: ParsedExpression | MixedTextSegment[] | undefined,
  scope: RuntimeScope | undefined,
) => unknown;

export function initializeStateValues(
  expressions: Record<string, string>,
  parsed: XmluiParsedBindings["vars"] | XmluiParsedBindings["globals"] | undefined,
  scope: RuntimeScope | undefined,
  evaluate: RuntimeBindingEvaluator,
): StateBag {
  const result: StateBag = {};
  for (const [key, value] of Object.entries(expressions)) {
    result[key] = evaluate(value, parsed?.[key], scope);
  }
  return result;
}

import type { AppContextObject } from "../../abstractions/AppContextDefs";
import type { EvalTreeOptions } from "./BindingTreeEvaluationContext";

/**
 * Builds the evaluation options used by synchronous binding evaluation.
 *
 * `compileBindings` is an experimental app-level switch. Step 1 only carries
 * the option through the existing interpreter path; later compiler work will
 * use it to select the compiled binding evaluator.
 */
export function createBindingEvalOptions(
  appContext?: AppContextObject,
  overrides: EvalTreeOptions = {},
): EvalTreeOptions {
  return {
    ...(appContext?.xmluiConfig?.compileBindings === true ? { compileBindings: true } : {}),
    ...overrides,
  };
}

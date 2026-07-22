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

/**
 * Builds the evaluation options used by asynchronous event-handler execution.
 *
 * `compileEventHandlers` is an experimental app-level switch. This first step
 * only carries the option through the existing async interpreter path; later
 * compiler work will use it to select the compiled event/code-behind evaluator.
 */
export function createEventEvalOptions(
  appContext?: AppContextObject,
  overrides: EvalTreeOptions = {},
): EvalTreeOptions {
  return {
    defaultToOptionalMemberAccess:
      typeof appContext?.xmluiConfig?.defaultToOptionalMemberAccess === "boolean"
        ? appContext.xmluiConfig.defaultToOptionalMemberAccess
        : true,
    strictDomSandbox: Array.isArray(appContext?.xmluiConfig?.strictDomSandbox)
      ? appContext.xmluiConfig.strictDomSandbox
      : appContext?.xmluiConfig?.strictDomSandbox === true,
    allowConsole: appContext?.xmluiConfig?.allowConsole !== false,
    ...(appContext?.xmluiConfig?.compileEventHandlers === true
      ? { compileEventHandlers: true }
      : {}),
    ...((appContext as any)?.__udcEvalOptions ?? {}),
    ...overrides,
  };
}

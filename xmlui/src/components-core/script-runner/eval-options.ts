import type { AppContextObject } from "../../abstractions/AppContextDefs";
import type { EvalTreeOptions } from "./BindingTreeEvaluationContext";

/**
 * Builds the evaluation options used by synchronous binding evaluation.
 *
 * `compileScripts` is the preferred app-level switch. `compileBindings` remains
 * a compatibility alias for opting the binding compiler in or out separately.
 */
export function createBindingEvalOptions(
  appContext?: AppContextObject,
  overrides: EvalTreeOptions = {},
): EvalTreeOptions {
  return {
    ...(shouldCompileBindings(appContext) ? { compileBindings: true } : {}),
    ...normalizeCompiledScriptSourceMaps(appContext),
    ...overrides,
  };
}

/**
 * Builds the evaluation options used by asynchronous event-handler execution.
 *
 * `compileScripts` is the preferred app-level switch. `compileEventHandlers`
 * remains a compatibility alias for opting event compilation in or out
 * separately.
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
    ...(shouldCompileEventHandlers(appContext) ? { compileEventHandlers: true } : {}),
    ...normalizeCompiledScriptSourceMaps(appContext),
    ...((appContext as any)?.__udcEvalOptions ?? {}),
    ...overrides,
  };
}

export type ScriptExecutionMode = {
  mode: "compiled" | "interpreted" | "mixed";
  bindings: "compiled" | "interpreted";
  eventHandlers: "compiled" | "interpreted";
};

export function getScriptExecutionMode(
  appContext?: Pick<AppContextObject, "xmluiConfig">,
): ScriptExecutionMode {
  const bindings = shouldCompileBindings(appContext as AppContextObject)
    ? "compiled"
    : "interpreted";
  const eventHandlers = shouldCompileEventHandlers(appContext as AppContextObject)
    ? "compiled"
    : "interpreted";
  const mode = bindings === eventHandlers ? bindings : "mixed";
  return { mode, bindings, eventHandlers };
}

function shouldCompileBindings(appContext?: Pick<AppContextObject, "xmluiConfig">): boolean {
  const config = appContext?.xmluiConfig;
  return config?.compileBindings ?? config?.compileScripts ?? false;
}

function shouldCompileEventHandlers(appContext?: Pick<AppContextObject, "xmluiConfig">): boolean {
  const config = appContext?.xmluiConfig;
  return config?.compileEventHandlers ?? config?.compileScripts ?? false;
}

function normalizeCompiledScriptSourceMaps(appContext?: AppContextObject): EvalTreeOptions {
  const mode = appContext?.xmluiConfig?.compiledScriptSourceMaps;
  if (mode === true || mode === "inline" || mode === "external") {
    return { compiledScriptSourceMaps: mode };
  }
  if (
    mode !== false &&
    import.meta.env.DEV &&
    (shouldCompileBindings(appContext) || shouldCompileEventHandlers(appContext))
  ) {
    return { compiledScriptSourceMaps: "external" };
  }
  return {};
}

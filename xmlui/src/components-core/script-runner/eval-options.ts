import type { AppContextObject } from "../../abstractions/AppContextDefs";
import type { EvalTreeOptions } from "./BindingTreeEvaluationContext";

type ConfigSource = Pick<AppContextObject, "xmluiConfig"> | undefined;

/**
 * Builds the evaluation options used by synchronous binding evaluation.
 *
 * `compileScripts` is the single switch: when it is on, bindings, event handlers, and
 * code-behind declarations all compile. There is no per-path alias to disagree with.
 */
export function createBindingEvalOptions(
  appContext?: AppContextObject,
  overrides: EvalTreeOptions = {},
): EvalTreeOptions {
  return {
    ...(shouldCompileScripts(appContext) ? { compileScripts: true } : {}),
    ...(shouldReportCompileFallbacks(appContext) ? { reportCompileFallbacks: true } : {}),
    ...resolveSourceMaps(appContext),
    ...overrides,
  };
}

/**
 * Builds the evaluation options used by asynchronous event-handler execution.
 *
 * Reads the same `compileScripts` switch as binding evaluation — see
 * `createBindingEvalOptions`.
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
    ...(shouldCompileScripts(appContext) ? { compileScripts: true } : {}),
    ...(shouldReportCompileFallbacks(appContext) ? { reportCompileFallbacks: true } : {}),
    ...resolveSourceMaps(appContext),
    ...((appContext as any)?.__udcEvalOptions ?? {}),
    ...overrides,
  };
}

export type ScriptExecutionMode = {
  mode: "compiled" | "interpreted";
};

export function getScriptExecutionMode(appContext?: ConfigSource): ScriptExecutionMode {
  return { mode: shouldCompileScripts(appContext) ? "compiled" : "interpreted" };
}

export function shouldCompileScripts(appContext?: ConfigSource): boolean {
  return appContext?.xmluiConfig?.compileScripts === true;
}

export function shouldReportCompileFallbacks(appContext?: ConfigSource): boolean {
  return appContext?.xmluiConfig?.reportCompileFallbacks === true;
}

/**
 * Source maps are not an app-level setting: they exist to make compiled scripts
 * debuggable while developing, and they cost size everywhere else. `xmlui start` marks
 * the app as dev-served (`VITE_XMLUI_DEV_SERVER`), and that is the only thing that
 * turns them on for scripts compiled in the browser.
 */
function resolveSourceMaps(appContext?: ConfigSource): EvalTreeOptions {
  if (!shouldCompileScripts(appContext)) {
    return {};
  }
  return isDevServed() ? { sourceMaps: "external" } : {};
}

function isDevServed(): boolean {
  const env = import.meta.env as Record<string, any> | undefined;
  return env?.VITE_XMLUI_DEV_SERVER === "true" || env?.DEV === true;
}

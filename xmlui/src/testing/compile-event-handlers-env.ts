import {
  applyE2eCompileScriptsConfig,
  isE2eCompileScriptsEnabled,
  XMLUI_COMPILE_EVENT_HANDLERS_ENV,
} from "./compile-scripts-env";

export { XMLUI_COMPILE_EVENT_HANDLERS_ENV };

export function isE2eCompileEventHandlersEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return isE2eCompileScriptsEnabled(env);
}

export function applyE2eCompileEventHandlersConfig<
  T extends { xmluiConfig?: Record<string, any> },
>(description: T, env: Record<string, string | undefined> = process.env): T {
  return applyE2eCompileScriptsConfig(description, env);
}

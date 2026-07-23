export const XMLUI_COMPILE_SCRIPTS_ENV = "XMLUI_COMPILE_SCRIPTS";
export const XMLUI_COMPILE_BINDINGS_ENV = "XMLUI_COMPILE_BINDINGS";
export const XMLUI_COMPILE_EVENT_HANDLERS_ENV = "XMLUI_COMPILE_EVENT_HANDLERS";

function isTruthyEnv(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

export function isE2eCompileScriptsEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return (
    isTruthyEnv(env[XMLUI_COMPILE_SCRIPTS_ENV]) ||
    isTruthyEnv(env[XMLUI_COMPILE_BINDINGS_ENV]) ||
    isTruthyEnv(env[XMLUI_COMPILE_EVENT_HANDLERS_ENV])
  );
}

export function applyE2eCompileScriptsConfig<T extends { xmluiConfig?: Record<string, any> }>(
  description: T,
  env: Record<string, string | undefined> = process.env,
): T {
  if (!isE2eCompileScriptsEnabled(env)) {
    return description;
  }

  return {
    ...description,
    xmluiConfig: {
      compileScripts: true,
      ...description.xmluiConfig,
    },
  };
}

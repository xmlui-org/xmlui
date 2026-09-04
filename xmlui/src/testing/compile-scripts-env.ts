export const XMLUI_COMPILE_SCRIPTS_ENV = "XMLUI_COMPILE_SCRIPTS";

function isTruthyEnv(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

/** Whether the E2E run asked for compiled scripts (`XMLUI_COMPILE_SCRIPTS=true`). */
export function isE2eCompileScriptsEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return isTruthyEnv(env[XMLUI_COMPILE_SCRIPTS_ENV]);
}

/**
 * Turns compilation on for a test-bed app description, unless the test set the switch
 * itself.
 */
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

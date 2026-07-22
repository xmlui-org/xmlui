export const XMLUI_COMPILE_EVENT_HANDLERS_ENV = "XMLUI_COMPILE_EVENT_HANDLERS";

export function isE2eCompileEventHandlersEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const value = env[XMLUI_COMPILE_EVENT_HANDLERS_ENV]?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

export function applyE2eCompileEventHandlersConfig<
  T extends { xmluiConfig?: Record<string, any> },
>(description: T, env: Record<string, string | undefined> = process.env): T {
  if (!isE2eCompileEventHandlersEnabled(env)) {
    return description;
  }

  return {
    ...description,
    xmluiConfig: {
      compileEventHandlers: true,
      ...description.xmluiConfig,
    },
  };
}

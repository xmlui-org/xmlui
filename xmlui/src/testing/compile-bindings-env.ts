export const XMLUI_COMPILE_BINDINGS_ENV = "XMLUI_COMPILE_BINDINGS";

export function isE2eCompileBindingsEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const value = env[XMLUI_COMPILE_BINDINGS_ENV]?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

export function applyE2eCompileBindingsConfig<T extends { xmluiConfig?: Record<string, any> }>(
  description: T,
  env: Record<string, string | undefined> = process.env,
): T {
  if (!isE2eCompileBindingsEnabled(env)) {
    return description;
  }

  return {
    ...description,
    xmluiConfig: {
      compileBindings: true,
      ...description.xmluiConfig,
    },
  };
}


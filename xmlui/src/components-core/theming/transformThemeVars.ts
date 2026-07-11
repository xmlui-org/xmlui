export function isThemeVarName(varName: unknown) {
  return typeof varName === "string" && varName.startsWith("$");
}

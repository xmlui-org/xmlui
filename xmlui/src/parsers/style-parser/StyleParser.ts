export const THEME_VAR_PREFIX = "xmlui";

type ThemeIdDescriptor = {
  id: string;
  defaultValue?: Array<string | ThemeIdDescriptor>;
};

export function toCssVar(c: string | ThemeIdDescriptor): string {
  if (typeof c === "string") {
    return `var(--${THEME_VAR_PREFIX}-${c.substring(1)})`;
  }
  if (c.defaultValue && c.defaultValue.length > 0) {
    const defaultValueString = c.defaultValue
      .map((segment) => typeof segment === "string" ? segment : toCssVar(segment))
      .join("");
    return `var(--${THEME_VAR_PREFIX}-${c.id.substring(1)}, ${defaultValueString})`;
  }
  return `var(--${THEME_VAR_PREFIX}-${c.id.substring(1)})`;
}

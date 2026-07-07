import type { ThemeVarMetadata } from "../../component-core/metadata/types";
import { parseScssVar as parseRewriteScssVar } from "../../styling/theme";

export function parseScssVar(value: unknown): Record<string, string | ThemeVarMetadata> {
  const parsed = parseRewriteScssVar(value);
  if (Array.isArray(parsed)) {
    return Object.fromEntries(
      parsed
        .filter((item): item is string | ThemeVarMetadata =>
          typeof item === "string" ||
          (typeof item === "object" && item !== null && typeof (item as ThemeVarMetadata).name === "string")
        )
        .map((item) => {
          const name = typeof item === "string" ? item : item.name;
          return [name, item];
        }),
    );
  }
  if (!parsed || typeof parsed !== "object") {
    return {};
  }
  return parsed as Record<string, string | ThemeVarMetadata>;
}

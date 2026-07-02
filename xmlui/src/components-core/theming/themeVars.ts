import type { ThemeVarMetadata } from "../../component-core/metadata/types";
import { parseScssVar as parseRewriteScssVar } from "../../styling/theme";

export function parseScssVar(value: unknown): Record<string, string | ThemeVarMetadata> {
  return parseRewriteScssVar(value) as Record<string, string | ThemeVarMetadata>;
}

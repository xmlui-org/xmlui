import type { CSSProperties } from "react";

import { themePropNameToCssVarName, themeVarReference } from "./contracts";

export const defaultThemeVariables: Record<string, string> = {
  "color-primary": "#2563eb",
  "color-primary-50": "#eff6ff",
  "color-primary-100": "#dbeafe",
  "color-primary-600": "#2563eb",
  "color-surface": "#ffffff",
  "color-surface-100": "#f3f4f6",
  "color-text": "#111827",
  "color-muted": "#6b7280",
  "color-border": "#d1d5db",
  "space-1": "4px",
  "space-2": "8px",
  "space-3": "12px",
  "space-4": "16px",
  "radius": "4px",
};

export function resolveThemeReferences(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith("$")) {
    return value;
  }
  const name = value.slice(1).trim();
  return name ? themeVarReference(name) : value;
}

export function themeVariablesToCssProperties(
  variables: Record<string, unknown>,
): CSSProperties {
  const style: Record<string, string | number> = {};
  for (const [name, value] of Object.entries(variables)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    style[themePropNameToCssVarName(name)] = String(value);
  }
  return style as CSSProperties;
}


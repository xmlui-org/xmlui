import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../component-core/metadata";
import { themePropNameToCssVarName, themeVarReference } from "./contracts";

export type ThemeTone = "light" | "dark";

export type ThemeVariableMap = Record<string, unknown>;

export type ThemeVariableLayer = ThemeVariableMap & {
  light?: ThemeVariableMap;
  dark?: ThemeVariableMap;
  tones?: Partial<Record<ThemeTone, ThemeVariableMap>>;
};

export type ComponentThemeClass = {
  className: string;
  style: CSSProperties;
  variables: ThemeVariableMap;
};

export const rootThemeVariables: ThemeVariableLayer = {
  "space-base": "0.25em",
  "space-0": "0",
  "space-0_5": "calc(0.5 * var(--xmlui-space-base))",
  "space-1": "calc(1 * var(--xmlui-space-base))",
  "space-1_5": "calc(1.5 * var(--xmlui-space-base))",
  "space-2": "calc(2 * var(--xmlui-space-base))",
  "space-2_5": "calc(2.5 * var(--xmlui-space-base))",
  "space-3": "calc(3 * var(--xmlui-space-base))",
  "space-4": "calc(4 * var(--xmlui-space-base))",
  "space-5": "calc(5 * var(--xmlui-space-base))",
  "space-6": "calc(6 * var(--xmlui-space-base))",
  "space-7": "calc(7 * var(--xmlui-space-base))",
  "space-8": "calc(8 * var(--xmlui-space-base))",
  "space-10": "calc(10 * var(--xmlui-space-base))",
  "space-11": "calc(11 * var(--xmlui-space-base))",
  "space-16": "calc(16 * var(--xmlui-space-base))",
  "space-64": "calc(64 * var(--xmlui-space-base))",

  "const-color-surface-0": "white",
  "const-color-surface-50": "hsl(204, 30.3%, 98%)",
  "const-color-surface-100": "hsl(204, 30.3%, 95%)",
  "const-color-surface-200": "hsl(204, 30.3%, 83%)",
  "const-color-surface-300": "hsl(204, 30.3%, 75%)",
  "const-color-surface-400": "hsl(204, 30.3%, 63%)",
  "const-color-surface-500": "hsl(204, 30.3%, 52%)",
  "const-color-surface-600": "hsl(204, 30.3%, 40%)",
  "const-color-surface-700": "hsl(204, 30.3%, 32%)",
  "const-color-surface-800": "hsl(204, 30.3%, 27%)",
  "const-color-surface-900": "hsl(204, 30.3%, 16%)",
  "const-color-surface-950": "hsl(204, 30.3%, 13%)",
  "const-color-surface-1000": "hsl(204, 30.3%, 9%)",
  "const-color-surface": "$const-color-surface-500",

  "const-color-primary-50": "hsl(212,71.9%,94.5%)",
  "const-color-primary-100": "hsl(212,71.9%,89.1%)",
  "const-color-primary-200": "hsl(212,71.9%,78.1%)",
  "const-color-primary-300": "hsl(212,71.9%,67.2%)",
  "const-color-primary-400": "hsl(212,71.9%,56.3%)",
  "const-color-primary-500": "#206bc4",
  "const-color-primary-600": "hsl(212,71.9%,36.3%)",
  "const-color-primary-700": "hsl(212,71.9%,27.2%)",
  "const-color-primary-800": "hsl(212,71.9%,18.1%)",
  "const-color-primary-900": "hsl(212,71.9%,9.1%)",
  "const-color-primary-950": "hsl(212,71.9%,4.5%)",
  "const-color-primary": "$const-color-primary-500",

  "const-color-secondary-50": "hsl(211.7,21.2%,96.9%)",
  "const-color-secondary-100": "hsl(211.7,21.2%,93.7%)",
  "const-color-secondary-200": "hsl(211.7,21.2%,87.4%)",
  "const-color-secondary-300": "hsl(211.7,21.2%,81.1%)",
  "const-color-secondary-400": "hsl(211.7,21.2%,74.8%)",
  "const-color-secondary-500": "#6c7a91",
  "const-color-secondary-600": "hsl(211.7,21.2%,54.8%)",
  "const-color-secondary-700": "hsl(211.7,21.2%,41.1%)",
  "const-color-secondary-800": "hsl(211.7,21.2%,27.4%)",
  "const-color-secondary-900": "hsl(211.7,21.2%,13.7%)",
  "const-color-secondary-950": "hsl(211.7,21.2%,6.9%)",
  "const-color-secondary": "$const-color-secondary-500",

  "const-color-warn-50": "hsl(45, 100%, 97%)",
  "const-color-warn-100": "hsl(45, 100%, 91%)",
  "const-color-warn-200": "hsl(45, 100%, 80%)",
  "const-color-warn-300": "hsl(45, 100%, 70%)",
  "const-color-warn-400": "hsl(45, 100%, 60%)",
  "const-color-warn-500": "hsl(35, 100%, 50%)",
  "const-color-warn-600": "hsl(35, 100%, 45%)",
  "const-color-warn-700": "hsl(35, 100%, 40%)",
  "const-color-warn-800": "hsl(35, 100%, 35%)",
  "const-color-warn-900": "hsl(35, 100%, 30%)",
  "const-color-warn-950": "hsl(35, 100%, 15%)",
  "const-color-warn": "$const-color-warn-500",

  "const-color-danger-50": "hsl(356, 100%, 95%)",
  "const-color-danger-100": "hsl(356, 100%, 91%)",
  "const-color-danger-200": "hsl(356, 100%, 80%)",
  "const-color-danger-300": "hsl(356, 100%, 70%)",
  "const-color-danger-400": "hsl(356, 100%, 60%)",
  "const-color-danger-500": "hsl(356, 100%, 50%)",
  "const-color-danger-600": "hsl(356, 100%, 45%)",
  "const-color-danger-700": "hsl(356, 100%, 40%)",
  "const-color-danger-800": "hsl(356, 100%, 35%)",
  "const-color-danger-900": "hsl(356, 100%, 30%)",
  "const-color-danger-950": "hsl(356, 100%, 15%)",
  "const-color-danger": "$const-color-danger-600",
  "const-color-attention": "$const-color-danger-500",

  "const-color-success-50": "hsl(129.5, 58.4%, 96.4%)",
  "const-color-success-100": "hsl(129.5, 58.4%, 92.9%)",
  "const-color-success-200": "hsl(129.5, 58.4%, 85.7%)",
  "const-color-success-300": "hsl(129.5, 58.4%, 78.6%)",
  "const-color-success-400": "hsl(129.5, 58.4%, 71.5%)",
  "const-color-success-500": "hsl(129.5, 58.4%, 51.5%)",
  "const-color-success-600": "hsl(129.5, 58.4%, 45%)",
  "const-color-success-700": "hsl(129.5, 58.4%, 38.6%)",
  "const-color-success-800": "hsl(129.5, 58.4%, 25.7%)",
  "const-color-success-900": "hsl(129.5, 58.4%, 12.9%)",
  "const-color-success-950": "hsl(129.5, 58.4%, 6.4%)",
  "const-color-success": "$const-color-success-500",

  "const-color-info-50": "hsl(183, 97%, 95%)",
  "const-color-info-100": "hsl(183, 97%, 90%)",
  "const-color-info-200": "hsl(183, 97%, 80%)",
  "const-color-info-300": "hsl(183, 97%, 70%)",
  "const-color-info-400": "hsl(183, 97%, 60%)",
  "const-color-info-500": "hsl(183, 97%, 50%)",
  "const-color-info-600": "hsl(183, 97%, 45%)",
  "const-color-info-700": "hsl(183, 97%, 35%)",
  "const-color-info-800": "hsl(183, 97%, 25%)",
  "const-color-info-900": "hsl(183, 97%, 15%)",
  "const-color-info-950": "hsl(183, 97%, 10%)",

  "fontWeight-light": "300",
  "fontWeight-normal": "400",
  "fontWeight-medium": "500",
  "fontWeight-bold": "600",
  "fontWeight-extra-bold": "900",
  "fontWeight": "$fontWeight-normal",

  "textColor-primary": "$color-surface-950",
  "textColor-attention": "$color-danger-600",
  "textColor-subtitle": "$color-surface-500",
  "textColor--disabled": "$color-surface-500",
  "textColor-secondary": "$color-surface-600",
  textColor: "$textColor-primary",

  "backgroundColor-primary": "$color-surface-50",
  "backgroundColor-secondary": "$color-surface-50",
  "backgroundColor-attention": "$color-attention",
  "backgroundColor--disabled": "$color-surface-50",
  "backgroundColor--selected": "$color-primary-50",
  "backgroundColor-dropdown-item": "transparent",
  "backgroundColor-dropdown-item--hover": "$color-surface-50",
  "backgroundColor-dropdown-item--active": "$color-surface-100",
  "backgroundColor-dropdown-item--active-hover": "$color-surface-50",
  backgroundColor: "$color-surface-subtle",

  "color-info": "$color-info-500",
  "color-valid": "$color-success-600",
  "color-warning": "$color-warn-700",
  "color-error": "$color-danger-500",

  "fontFamily-sans-serif":
    "'Inter', -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif",
  "fontFamily-monospace": "Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace",
  "font-feature-settings": "'cv03', 'cv04', 'cv11'",
  fontFamily: "$fontFamily-sans-serif",

  "fontSize-tiny": "0.625em",
  "fontSize-xs": "0.75em",
  "fontSize-sm": "0.875em",
  "fontSize-base": "1em",
  "fontSize-lg": "1.125em",
  "fontSize-xl": "1.25em",
  "fontSize-2xl": "1.5em",
  "fontSize-3xl": "1.875em",
  "fontSize-4xl": "2.25em",
  "fontSize-5xl": "3em",
  "fontSize-6xl": "3.75em",
  "fontSize-7xl": "4.5em",
  "fontSize-8xl": "6em",
  "fontSize-9xl": "8em",
  "fontSize-code": "0.975em",
  fontSize: "$fontSize-base",
  "font-size": "15px",

  "const-fontSize-tiny": "10px",
  "const-fontSize-xs": "12px",
  "const-fontSize-sm": "14px",
  "const-fontSize-base": "16px",
  "const-fontSize-lg": "18px",
  "const-fontSize-xl": "20px",
  "const-fontSize-2xl": "24px",
  "const-fontSize-3xl": "30px",
  "const-fontSize-4xl": "36px",
  "const-fontSize-5xl": "48px",
  "const-fontSize-6xl": "60px",
  "const-fontSize-7xl": "72px",
  "const-fontSize-8xl": "96px",
  "const-fontSize-9xl": "128px",
  "const-fontSize-code": "15.6px",

  "lineHeight-none": "1",
  "lineHeight-tight": "1.25",
  "lineHeight-snug": "1.375",
  "lineHeight-normal": "1.5",
  "lineHeight-relaxed": "1.625",
  "lineHeight-relaxed-2": "1.7",
  "lineHeight-loose": "2",
  lineHeight: "$lineHeight-relaxed-2",

  "letterSpacing-tighter": "-0.05em",
  "letterSpacing-tight": "-0.025em",
  "letterSpacing-normal": "0em",
  "letterSpacing-wide": "0.025em",
  "letterSpacing-wider": "0.05em",
  "letterSpacing-widest": "0.1em",
  letterSpacing: "$letterSpacing-normal",

  "gap-none": "$space-0",
  "gap-tight": "$space-2",
  "gap-normal": "$space-4",
  "gap-loose": "$space-8",
  "gap-layout": "$gap-normal",
  "padding-none": "$space-0",
  "padding-tight": "$space-2",
  "padding-normal": "$space-4",
  "padding-loose": "$space-8",
  "padding-layout": "$padding-normal",
  "paddingHorizontal-layout": "$padding-layout",
  "paddingVertical-layout": "$padding-layout",
  "space-none": "$space-0",
  "space-tight": "$space-2",
  "space-normal": "$space-4",
  "space-loose": "$space-8",

  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, .1), 0 1px 2px 0 rgba(0, 0, 0, .06)",
  "boxShadow-sm": "0 1px 2px 0 rgba(0, 0, 0, .05)",
  "boxShadow-md": "0 4px 6px -1px rgba(0, 0, 0, .1), 0 2px 4px -1px rgba(0, 0, 0, .06)",
  "boxShadow-xl":
    "0 16px 24px 2px rgba(0, 0, 0, 0.07), 0 6px 30px 5px rgba(0, 0, 0, 0.06), 0 8px 10px -5px rgba(0, 0, 0, 0.1)",
  "boxShadow-xxl": "0 8px 17px 0 rgba(0, 0, 0, .2), 0 6px 20px 0 rgba(0, 0, 0, .19)",
  "boxShadow-spread": "0px 0px 30px rgba(0, 0, 0, 0.1)",
  "boxShadow-spread-2": "-6px -4px 40px 10px rgba(0, 0, 0, 0.1)",
  "boxShadow-spread-2-xl": "-6px -4px 40px 18px rgba(0, 0, 0, 0.1)",

  "maxWidth-content": "1280px",
  "maxWidth-columnContent": "800px",
  borderRadius: "4px",
  radius: "4px",
  "outlineColor--focus": "rgb(from $color-primary-500 r g b / 0.5)",
  "outlineWidth--focus": "2px",
  "outlineStyle--focus": "solid",
  "outlineOffset--focus": "0",
  borderColor: "rgb(from $color-surface-900 r g b / 0.1)",
  "borderColor--disabled": "$color-surface-200",
  "borderColor-outlined": "$color-primary-600",
  "borderColor-outlined--hover": "$color-primary-500",
  "borderColor-outlined--active": "$color-primary-700",
  "borderColor-outlined--focus": "$color-primary-600",
  "backgroundColor-Input-default": "$color-surface-0",
  "backgroundColor-Input-success": "$color-surface-0",
  "backgroundColor-Input-warning": "$color-surface-0",
  "backgroundColor-Input-error": "$color-surface-0",
  "borderColor-Input-default": "$color-surface-200",
  "borderColor-Input-default--hover": "$color-surface-600",
  "borderColor-Input-default--focus": "$color-surface-600",
  "borderColor-Input-default--success": "$color-success-600",
  "borderColor-Input-default--warning": "$color-warn-700",
  "borderColor-Input-default--error": "$color-danger-500",

  light: {
    "color-surface-0": "$const-color-surface-0",
    "color-surface-50": "$const-color-surface-50",
    "color-surface-100": "$const-color-surface-100",
    "color-surface-200": "$const-color-surface-200",
    "color-surface-300": "$const-color-surface-300",
    "color-surface-400": "$const-color-surface-400",
    "color-surface-500": "$const-color-surface-500",
    "color-surface-600": "$const-color-surface-600",
    "color-surface-700": "$const-color-surface-700",
    "color-surface-800": "$const-color-surface-800",
    "color-surface-900": "$const-color-surface-900",
    "color-surface-950": "$const-color-surface-950",
    "color-surface-1000": "$const-color-surface-1000",
    "color-surface": "$const-color-surface-500",
    "color-surface-base": "$color-surface-0",
    "color-surface-lower": "$color-surface-100",
    "color-surface-raised": "$color-surface-0",
    "color-surface-subtle": "$color-surface-50",
    "color-primary-50": "$const-color-primary-50",
    "color-primary-100": "$const-color-primary-100",
    "color-primary-200": "$const-color-primary-200",
    "color-primary-300": "$const-color-primary-300",
    "color-primary-400": "$const-color-primary-400",
    "color-primary-500": "$const-color-primary-500",
    "color-primary-600": "$const-color-primary-600",
    "color-primary-700": "$const-color-primary-700",
    "color-primary-800": "$const-color-primary-800",
    "color-primary-900": "$const-color-primary-900",
    "color-primary-950": "$const-color-primary-950",
    "color-primary": "$const-color-primary-500",
    "color-secondary-50": "$const-color-secondary-50",
    "color-secondary-100": "$const-color-secondary-100",
    "color-secondary-200": "$const-color-secondary-200",
    "color-secondary-300": "$const-color-secondary-300",
    "color-secondary-400": "$const-color-secondary-400",
    "color-secondary-500": "$const-color-secondary-500",
    "color-secondary-600": "$const-color-secondary-600",
    "color-secondary-700": "$const-color-secondary-700",
    "color-secondary-800": "$const-color-secondary-800",
    "color-secondary-900": "$const-color-secondary-900",
    "color-secondary-950": "$const-color-secondary-950",
    "color-secondary": "$const-color-secondary-500",
    "color-warn-50": "$const-color-warn-50",
    "color-warn-100": "$const-color-warn-100",
    "color-warn-200": "$const-color-warn-200",
    "color-warn-300": "$const-color-warn-300",
    "color-warn-400": "$const-color-warn-400",
    "color-warn-500": "$const-color-warn-500",
    "color-warn-600": "$const-color-warn-600",
    "color-warn-700": "$const-color-warn-700",
    "color-warn-800": "$const-color-warn-800",
    "color-warn-900": "$const-color-warn-900",
    "color-warn-950": "$const-color-warn-950",
    "color-warn": "$const-color-warn-500",
    "color-danger-50": "$const-color-danger-50",
    "color-danger-100": "$const-color-danger-100",
    "color-danger-200": "$const-color-danger-200",
    "color-danger-300": "$const-color-danger-300",
    "color-danger-400": "$const-color-danger-400",
    "color-danger-500": "$const-color-danger-500",
    "color-danger-600": "$const-color-danger-600",
    "color-danger-700": "$const-color-danger-700",
    "color-danger-800": "$const-color-danger-800",
    "color-danger-900": "$const-color-danger-900",
    "color-danger-950": "$const-color-danger-950",
    "color-danger": "$const-color-danger-600",
    "color-attention": "$const-color-danger-500",
    "color-success-50": "$const-color-success-50",
    "color-success-100": "$const-color-success-100",
    "color-success-200": "$const-color-success-200",
    "color-success-300": "$const-color-success-300",
    "color-success-400": "$const-color-success-400",
    "color-success-500": "$const-color-success-500",
    "color-success-600": "$const-color-success-600",
    "color-success-700": "$const-color-success-700",
    "color-success-800": "$const-color-success-800",
    "color-success-900": "$const-color-success-900",
    "color-success-950": "$const-color-success-950",
    "color-success": "$const-color-success-500",
    "color-info-50": "$const-color-info-50",
    "color-info-100": "$const-color-info-100",
    "color-info-200": "$const-color-info-200",
    "color-info-300": "$const-color-info-300",
    "color-info-400": "$const-color-info-400",
    "color-info-500": "$const-color-info-500",
    "color-info-600": "$const-color-info-600",
    "color-info-700": "$const-color-info-700",
    "color-info-800": "$const-color-info-800",
    "color-info-900": "$const-color-info-900",
    "color-info-950": "$const-color-info-950",
    "color-info": "$const-color-info-800",
  },
  dark: {
    textColor: "white",
    "color-surface-0": "$const-color-surface-1000",
    "color-surface-50": "$const-color-surface-950",
    "color-surface-100": "$const-color-surface-900",
    "color-surface-200": "$const-color-surface-800",
    "color-surface-300": "$const-color-surface-700",
    "color-surface-400": "$const-color-surface-600",
    "color-surface-500": "$const-color-surface-500",
    "color-surface-600": "$const-color-surface-400",
    "color-surface-700": "$const-color-surface-300",
    "color-surface-800": "$const-color-surface-200",
    "color-surface-900": "$const-color-surface-100",
    "color-surface-950": "$const-color-surface-50",
    "color-surface-1000": "$const-color-surface-0",
    "color-surface": "$const-color-surface-500",
    "color-surface-base": "$color-surface-0",
    "color-surface-lower": "$color-surface-0",
    "color-surface-raised": "$color-surface-100",
    "color-surface-subtle": "$color-surface-50",
    "color-primary-50": "$const-color-primary-950",
    "color-primary-100": "$const-color-primary-900",
    "color-primary-200": "$const-color-primary-800",
    "color-primary-300": "$const-color-primary-700",
    "color-primary-400": "$const-color-primary-600",
    "color-primary-500": "$const-color-primary-500",
    "color-primary-600": "$const-color-primary-400",
    "color-primary-700": "$const-color-primary-300",
    "color-primary-800": "$const-color-primary-200",
    "color-primary-900": "$const-color-primary-100",
    "color-primary-950": "$const-color-primary-50",
    "color-primary": "$const-color-primary-500",
    "color-error": "$color-danger-400",
  },
};

export const xmluiThemeVariables: ThemeVariableLayer = {
  "font-size": "15px",
  "boxShadow-Input": "$boxShadow-sm",
  light: {
    "backgroundColor-ModalDialog": "white",
    "backgroundColor-checked-RadioGroupOption": "$color-primary-400",
  },
  dark: {
    "color-error": "$color-danger-400",
  },
};

const borderSides = ["Left", "Right", "Top", "Bottom"] as const;
const borderParts = ["Width", "Style", "Color"] as const;
type BorderSide = (typeof borderSides)[number];
type BorderPart = (typeof borderParts)[number];

export function buildDefaultThemeVariables(tone: ThemeTone = "light"): ThemeVariableMap {
  const rawThemeVariables = mergeThemeVariableLayers([
    rootThemeVariables,
    xmluiThemeVariables,
  ], tone);
  return mergeThemeVariableLayers([
    rootThemeVariables,
    generateBaseSpacings(rawThemeVariables),
    generatePaddingSegments(rawThemeVariables),
    generateBorderSegments(rawThemeVariables),
    generateBaseTones(rawThemeVariables),
    xmluiThemeVariables,
  ], tone);
}

export const defaultThemeVariables = buildDefaultThemeVariables();

export function resolveThemeReferences(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }
  return value.replace(/\$([A-Za-z][A-Za-z0-9_-]*)/g, (_match, name: string) =>
    themeVarReference(name),
  );
}

export function parseScssVar(value: unknown): unknown {
  if (!value || typeof value !== "string") {
    return value;
  }
  const jsValue = value.replace(/(^['"])|(['"]$)/g, "");
  try {
    return JSON.parse(jsValue);
  } catch {
    try {
      return JSON.parse(
        value
          .replace("(", "{")
          .replace(")", "}")
          .replace(/: ?([^,}]+)([,}])/g, ': "$1"$2')
          .replace(/([\s{,])(?!")([^:\s]+)+:/g, '$1"$2":'),
      );
    } catch {
      return jsValue;
    }
  }
}

export function extractScssThemeVars(sourceInput: unknown): Record<string, string> {
  const source =
    typeof sourceInput === "string"
      ? sourceInput
      : sourceInput &&
          typeof sourceInput === "object" &&
          "default" in sourceInput &&
          typeof sourceInput.default === "string"
        ? sourceInput.default
        : "";
  const themeVars: Record<string, string> = {};
  const createThemeVarPattern = /createThemeVar\(\s*["']([^"']+)["']\s*\)/g;
  for (const match of source.matchAll(createThemeVarPattern)) {
    const name = match[1];
    themeVars[name] = `Theme variable declared by ${name}.`;
  }
  return themeVars;
}

export function resolveThemeVariable(
  name: string,
  layers: readonly ThemeVariableMap[],
): unknown {
  const normalized = name.startsWith("$") ? name.slice(1) : name;
  const fallbackNames = themeVariableFallbackNames(normalized);
  for (let layerIndex = layers.length - 1; layerIndex >= 0; layerIndex -= 1) {
    const layer = layers[layerIndex];
    for (const fallbackName of fallbackNames) {
      const value = layer[fallbackName];
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }
  }
  return undefined;
}

export function resolveThemeVariablesWithCssVars(
  variables: ThemeVariableMap,
): Record<string, string | number | boolean> {
  const resolved: Record<string, string | number | boolean> = {};
  for (const [name, value] of Object.entries(variables)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    const normalized = resolveThemeReferences(value);
    if (
      typeof normalized === "string" ||
      typeof normalized === "number" ||
      typeof normalized === "boolean"
    ) {
      resolved[name] = normalized;
    }
  }
  return resolved;
}

export function mergeThemeVariableLayers(
  layers: readonly ThemeVariableLayer[],
  tone: ThemeTone = "light",
): ThemeVariableMap {
  const merged: ThemeVariableMap = {};
  for (const layer of layers) {
    const { light, dark, tones, ...base } = layer;
    Object.assign(merged, base, layer[tone], tones?.[tone]);
  }
  return merged;
}

export function generateBaseTones(themeVariables: ThemeVariableMap | undefined): ThemeVariableMap {
  if (!themeVariables) {
    return {};
  }
  const resolvedThemeVariables = resolveThemeVariableMap(themeVariables);
  return {
    ...generateBaseTonesForColor("color-primary", resolvedThemeVariables),
    ...generateBaseTonesForColor("color-secondary", resolvedThemeVariables),
    ...generateBaseTonesForColor("color-info", resolvedThemeVariables),
    ...generateBaseTonesForColor("color-success", resolvedThemeVariables),
    ...generateBaseTonesForColor("color-warn", resolvedThemeVariables),
    ...generateBaseTonesForColor("color-danger", resolvedThemeVariables),
    ...generateBaseTonesForColor("color-surface", resolvedThemeVariables, { distributeEven: true }),
  };
}

export function generateBaseSpacings(themeVariables: ThemeVariableMap | undefined): ThemeVariableMap {
  if (!themeVariables) {
    return {};
  }
  const resolvedThemeVariables = resolveThemeVariableMap(themeVariables);
  const base = resolvedThemeVariables["space-base"];
  if (!base || typeof base !== "string") {
    return {};
  }
  let baseTrimmed = base.trim();
  if (baseTrimmed.startsWith(".")) {
    baseTrimmed = `0${baseTrimmed}`;
  }
  const baseNum = parseFloat(baseTrimmed);
  if (Number.isNaN(baseNum)) {
    return {};
  }
  const baseUnit = baseTrimmed.replace(String(baseNum), "") || "px";
  const scale = [
    0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40,
    44, 48, 52, 56, 60, 64, 72, 80, 96,
  ];
  return Object.fromEntries(
    scale.map((step) => [
      `space-${String(step).replace(".", "_")}`,
      `${step * baseNum}${baseUnit}`,
    ]),
  );
}

export function generatePaddingSegments(themeVariables: ThemeVariableMap | undefined): ThemeVariableMap {
  if (!themeVariables) {
    return {};
  }
  const result: ThemeVariableMap = {};
  for (const [key, value] of Object.entries(themeVariables)) {
    if (value === null || value === undefined || value === "") {
      continue;
    }
    const stringValue = String(value);
    let match = /^paddingHorizontal-(.+)$/.exec(key);
    if (match) {
      const suffix = match[1];
      result[`paddingLeft-${suffix}`] ??= stringValue;
      result[`paddingRight-${suffix}`] ??= stringValue;
      continue;
    }
    match = /^paddingVertical-(.+)$/.exec(key);
    if (match) {
      const suffix = match[1];
      result[`paddingTop-${suffix}`] ??= stringValue;
      result[`paddingBottom-${suffix}`] ??= stringValue;
      continue;
    }
    match = /^padding-(.+)$/.exec(key);
    if (!match) {
      continue;
    }
    const suffix = match[1];
    const horizontal = themeVariables[`paddingHorizontal-${suffix}`];
    const vertical = themeVariables[`paddingVertical-${suffix}`];
    const segments = stringValue.trim().replace(/ +/g, " ").split(" ");
    if (segments.length < 1 || segments.length > 4) {
      continue;
    }
    const [top, right = top, bottom = top, left = right] = segments;
    result[`paddingTop-${suffix}`] ??= vertical ?? top;
    result[`paddingRight-${suffix}`] ??= horizontal ?? right;
    result[`paddingBottom-${suffix}`] ??= vertical ?? bottom;
    result[`paddingLeft-${suffix}`] ??= horizontal ?? left;
  }
  return result;
}

export function generateBorderSegments(themeVariables: ThemeVariableMap | undefined): ThemeVariableMap {
  if (!themeVariables) {
    return {};
  }
  const generated: ThemeVariableMap = {};
  const entries = Object.entries(themeVariables).filter(([, value]) =>
    value !== undefined && value !== null && value !== "",
  );

  for (const [name, value] of entries) {
    const suffix = themeVarSuffix(name, "border");
    if (!suffix) {
      continue;
    }
    const parsed = parseBorderShorthand(String(resolveThemeReferences(value)));
    setBorderSide(generated, "Left", suffix, value, parsed);
    setBorderSide(generated, "Right", suffix, value, parsed);
    setBorderSide(generated, "Top", suffix, value, parsed);
    setBorderSide(generated, "Bottom", suffix, value, parsed);
    setBorderParts(generated, "", suffix, parsed);
  }

  for (const [name, value] of entries) {
    setAxisBorder(generated, name, value, "Horizontal", ["Left", "Right"]);
    setAxisBorder(generated, name, value, "Vertical", ["Top", "Bottom"]);
  }

  for (const [name, value] of entries) {
    for (const side of borderSides) {
      const suffix = themeVarSuffix(name, `border${side}`);
      if (!suffix) {
        continue;
      }
      const parsed = parseBorderShorthand(String(resolveThemeReferences(value)));
      setBorderSide(generated, side, suffix, value, parsed);
    }
  }

  for (const part of borderParts) {
    for (const [name, value] of entries) {
      const suffix = themeVarSuffix(name, `border${part}`);
      if (!suffix) {
        continue;
      }
      for (const side of borderSides) {
        generated[`border${side}${part}-${suffix}`] = value;
      }
    }
  }

  for (const part of borderParts) {
    for (const [name, value] of entries) {
      setAxisBorderPart(generated, name, value, "Horizontal", part, ["Left", "Right"]);
      setAxisBorderPart(generated, name, value, "Vertical", part, ["Top", "Bottom"]);
    }
  }

  for (const part of borderParts) {
    for (const [name, value] of entries) {
      for (const side of borderSides) {
        const suffix = themeVarSuffix(name, `border${side}${part}`);
        if (suffix) {
          generated[`border${side}${part}-${suffix}`] = value;
        }
      }
    }
  }

  return generated;
}

function setAxisBorder(
  generated: ThemeVariableMap,
  name: string,
  value: unknown,
  axis: "Horizontal" | "Vertical",
  sides: readonly BorderSide[],
): void {
  const suffix = themeVarSuffix(name, `border${axis}`);
  if (!suffix) {
    return;
  }
  const parsed = parseBorderShorthand(String(resolveThemeReferences(value)));
  for (const side of sides) {
    setBorderSide(generated, side, suffix, value, parsed);
  }
}

function setAxisBorderPart(
  generated: ThemeVariableMap,
  name: string,
  value: unknown,
  axis: "Horizontal" | "Vertical",
  part: BorderPart,
  sides: readonly BorderSide[],
): void {
  const suffix = themeVarSuffix(name, `border${axis}${part}`);
  if (!suffix) {
    return;
  }
  for (const side of sides) {
    generated[`border${side}${part}-${suffix}`] = value;
  }
}

function setBorderSide(
  generated: ThemeVariableMap,
  side: BorderSide,
  suffix: string,
  value: unknown,
  parsed: ReturnType<typeof parseBorderShorthand>,
): void {
  generated[`border${side}-${suffix}`] = value;
  setBorderParts(generated, side, suffix, parsed);
}

function setBorderParts(
  generated: ThemeVariableMap,
  side: "" | BorderSide,
  suffix: string,
  parsed: ReturnType<typeof parseBorderShorthand>,
): void {
  const prefix = side ? `border${side}` : "border";
  if (parsed?.width) {
    generated[`${prefix}Width-${suffix}`] = parsed.width;
  }
  if (parsed?.style) {
    generated[`${prefix}Style-${suffix}`] = parsed.style;
  }
  if (parsed?.color) {
    generated[`${prefix}Color-${suffix}`] = parsed.color;
  }
}

function themeVarSuffix(name: string, prefix: string): string | undefined {
  const match = new RegExp(`^${prefix}-(.+)$`).exec(name);
  return match?.[1];
}

function resolveThemeVariableMap(themeVariables: ThemeVariableMap): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const name of Object.keys(themeVariables)) {
    const value = resolveThemeVariableValue(name, themeVariables);
    if (value !== undefined && value !== null && value !== "") {
      resolved[name] = String(value);
    }
  }
  return resolved;
}

function resolveThemeVariableValue(
  name: string,
  themeVariables: ThemeVariableMap,
  visited = new Set<string>(),
): unknown {
  const normalized = name.startsWith("$") ? name.slice(1) : name;
  if (visited.has(normalized)) {
    return undefined;
  }
  visited.add(normalized);
  const value = themeVariables[normalized];
  if (typeof value === "string" && value.startsWith("$")) {
    return resolveThemeVariableValue(value, themeVariables, visited);
  }
  return value;
}

function generateBaseTonesForColor(
  varName: string,
  themeVariables: Record<string, string>,
  options: { distributeEven?: boolean } = {},
): ThemeVariableMap {
  const color = parseColor(themeVariables[varName]);
  if (!color) {
    return {};
  }

  const baseLightness = labLightness(color);
  const darkStep = baseLightness / 5;
  const lightStep = (100 - baseLightness) / 5;
  const lightnessValues = options.distributeEven
    ? [100, 98, 95, 83, 75, 63, 52, 40, 32, 27, 16, 13, 9]
    : [
        100,
        baseLightness + lightStep * 4.5,
        baseLightness + lightStep * 4,
        baseLightness + lightStep * 3,
        baseLightness + lightStep * 2,
        baseLightness + lightStep,
        baseLightness,
        baseLightness - darkStep,
        baseLightness - darkStep * 2,
        baseLightness - darkStep * 3,
        baseLightness - darkStep * 4,
        baseLightness - darkStep * 4.5,
        baseLightness - darkStep * 5,
      ];
  const names = ["0", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950", "1000"];
  return Object.fromEntries(
    names.map((name, index) => [
      `const-${varName}-${name}`,
      hslString(color.h, color.s, lightnessValues[index]),
    ]),
  );
}

export function collectComponentThemeDefaults(
  metadata: ComponentMetadata,
  contributors: readonly ComponentMetadata[] = [],
  tone: ThemeTone = "light",
): ThemeVariableMap {
  const variables: ThemeVariableMap = {};
  for (const descriptor of [metadata, ...contributors]) {
    Object.assign(
      variables,
      descriptor.defaultThemeVars,
      descriptor.toneSpecificThemeVars?.[tone],
    );
  }
  return variables;
}

export function componentThemeVariablesToCssProperties(
  metadata: ComponentMetadata,
  themeVariables: ThemeVariableMap,
  contributors: readonly ComponentMetadata[] = [],
  explicitThemeVariables: ThemeVariableMap = themeVariables,
): CSSProperties {
  const declarations = new Set<string>();
  const declarationSources = new Map<string, Set<string>>();
  for (const descriptor of [metadata, ...contributors]) {
    for (const key of Object.keys(descriptor.themeVars ?? {})) {
      addThemeDeclaration(declarations, declarationSources, key);
    }
    for (const key of Object.keys(descriptor.defaultThemeVars ?? {})) {
      addThemeDeclaration(declarations, declarationSources, key);
    }
  }

  const cssVariables: Record<string, string | number> = {};
  for (const name of declarations) {
    const value = themeVariableValue(name, declarationSources.get(name), themeVariables);
    if (value !== undefined && value !== null && value !== "") {
      cssVariables[themePropNameToCssVarName(name)] = String(resolveThemeReferences(value));
    }
  }
  addBorderShorthandLonghands(cssVariables, themeVariables, explicitThemeVariables);
  return cssVariables as CSSProperties;
}

export function createComponentThemeClass(
  componentName: string,
  metadata: ComponentMetadata,
  themeVariables: ThemeVariableMap,
  contributors: readonly ComponentMetadata[] = [],
  variant?: string,
): ComponentThemeClass {
  const defaultThemeVariables = collectComponentThemeDefaults(metadata, contributors);
  const variantThemeVariables = variant
    ? componentVariantThemeVariables(metadata, themeVariables, contributors, variant)
    : {};
  const rawThemeVariables = mergeThemeVariableLayers([
    defaultThemeVariables,
    themeVariables,
    variantThemeVariables,
  ]);
  const baseThemeVariables = mergeThemeVariableLayers([
    defaultThemeVariables,
    generatePaddingSegments(rawThemeVariables),
    generateBorderSegments(rawThemeVariables),
    themeVariables,
    variantThemeVariables,
  ]);
  const rawExplicitThemeVariables = mergeThemeVariableLayers([
    themeVariables,
    variantThemeVariables,
  ]);
  const explicitThemeVariables = mergeThemeVariableLayers([
    generatePaddingSegments(rawExplicitThemeVariables),
    generateBorderSegments(rawExplicitThemeVariables),
    rawExplicitThemeVariables,
  ]);
  const mergedThemeVariables = mergeThemeVariableLayers([
    generatePaddingSegments(baseThemeVariables),
    generateBorderSegments(baseThemeVariables),
    baseThemeVariables,
    generateButtonTones(baseThemeVariables, explicitThemeVariables),
  ]);
  const style = componentThemeVariablesToCssProperties(
    metadata,
    mergedThemeVariables,
    contributors,
    explicitThemeVariables,
  );
  return {
    className: `xmlui-${componentName}`,
    style,
    variables: Object.fromEntries(
      Object.entries(style).map(([name, value]) => [
        name.replace(/^--xmlui-/, ""),
        value,
      ]),
    ),
  };
}

function componentVariantThemeVariables(
  metadata: ComponentMetadata,
  themeVariables: ThemeVariableMap,
  contributors: readonly ComponentMetadata[],
  variant: string,
): ThemeVariableMap {
  const aliases: ThemeVariableMap = {};
  for (const descriptor of [metadata, ...contributors]) {
    const keys = new Set([
      ...Object.keys(descriptor.themeVars ?? {}),
      ...Object.keys(descriptor.defaultThemeVars ?? {}),
    ]);
    for (const key of keys) {
      const variantKey = `${key}-${variant}`;
      if (themeVariables[variantKey] !== undefined) {
        aliases[key] = themeVariables[variantKey];
      }
    }
  }
  return aliases;
}

export function generateButtonTones(
  themeVariables: ThemeVariableMap | undefined,
  explicitThemeVariables: ThemeVariableMap = themeVariables ?? {},
): ThemeVariableMap {
  if (!themeVariables) {
    return {};
  }
  const generated: ThemeVariableMap = {};
  const explicitValue = (...names: string[]) => firstThemeReference(explicitThemeVariables, names);
  const themeValue = (...names: string[]) => firstThemeReference(themeVariables, names);
  for (const themeColor of ["primary", "secondary", "attention"]) {
    const tone = buttonToneReferences(themeColor, themeVariables);
    const solidBackground = themeValue(`backgroundColor-Button-${themeColor}-solid`) ?? tone.base;
    const solidBorder = themeValue(`borderColor-Button-${themeColor}-solid`) ?? tone.base;
    const solidText = themeValue(
      `textColor-Button-${themeColor}-solid`,
      "textColor-Button-solid",
    ) ?? tone.contrast;
    const solidBorderStyle = themeValue(
      `borderStyle-Button-${themeColor}-solid`,
      "borderStyle-Button",
    ) ?? "solid";
    const outlinedBackground = themeValue(`backgroundColor-Button-${themeColor}-outlined`);
    const outlinedBorder = themeValue(`borderColor-Button-${themeColor}-outlined`) ?? tone.base;
    const outlinedBorderStyle = themeValue(
      `borderStyle-Button-${themeColor}-outlined`,
      "borderStyle-Button",
    ) ?? "solid";
    const outlinedText = themeValue(`textColor-Button-${themeColor}-outlined`) ?? tone.base;
    const ghostBackground = themeValue(`backgroundColor-Button-${themeColor}-ghost`);
    const ghostText = themeValue(`textColor-Button-${themeColor}-ghost`) ?? tone.base;
    const ghostBorderStyle = themeValue(
      `borderStyle-Button-${themeColor}-ghost`,
      "borderStyle-Button",
    ) ?? "solid";
    Object.assign(generated, {
      [`backgroundColor-Button-${themeColor}-solid`]: solidBackground,
      [`backgroundColor-Button-${themeColor}-solid--hover`]:
        explicitValue(`backgroundColor-Button-${themeColor}-solid--hover`) ??
        explicitValue(`backgroundColor-Button-${themeColor}-solid`) ??
        themeValue(`backgroundColor-Button-${themeColor}-solid--hover`) ??
        solidBackground,
      [`backgroundColor-Button-${themeColor}-solid--active`]:
        explicitValue(`backgroundColor-Button-${themeColor}-solid--active`) ??
        explicitValue(`backgroundColor-Button-${themeColor}-solid`) ??
        themeValue(`backgroundColor-Button-${themeColor}-solid--active`) ??
        solidBackground,
      [`borderColor-Button-${themeColor}-solid`]: solidBorder,
      [`borderColor-Button-${themeColor}-solid--hover`]:
        explicitValue(`borderColor-Button-${themeColor}-solid--hover`) ??
        explicitValue(`borderColor-Button-${themeColor}-solid`) ??
        themeValue(`borderColor-Button-${themeColor}-solid--hover`) ??
        solidBorder,
      [`borderColor-Button-${themeColor}-solid--active`]:
        explicitValue(`borderColor-Button-${themeColor}-solid--active`) ??
        explicitValue(`borderColor-Button-${themeColor}-solid`) ??
        themeValue(`borderColor-Button-${themeColor}-solid--active`) ??
        solidBorder,
      [`borderStyle-Button-${themeColor}-solid`]: solidBorderStyle,
      [`textColor-Button-${themeColor}-solid`]: solidText,
      [`textColor-Button-${themeColor}-solid--hover`]:
        explicitValue(`textColor-Button-${themeColor}-solid--hover`) ??
        explicitValue(`textColor-Button-${themeColor}-solid`, "textColor-Button-solid") ??
        themeValue(`textColor-Button-${themeColor}-solid--hover`) ??
        solidText,
      [`textColor-Button-${themeColor}-solid--active`]:
        explicitValue(`textColor-Button-${themeColor}-solid--active`) ??
        explicitValue(`textColor-Button-${themeColor}-solid`, "textColor-Button-solid") ??
        themeValue(`textColor-Button-${themeColor}-solid--active`) ??
        solidText,

      [`backgroundColor-Button-${themeColor}-outlined`]: outlinedBackground,
      [`backgroundColor-Button-${themeColor}-outlined--hover`]:
        explicitValue(`backgroundColor-Button-${themeColor}-outlined--hover`) ??
        explicitValue(`backgroundColor-Button-${themeColor}-outlined`) ??
        themeValue(`backgroundColor-Button-${themeColor}-outlined--hover`) ??
        outlinedBackground ?? tone.alphaHover,
      [`backgroundColor-Button-${themeColor}-outlined--active`]:
        explicitValue(`backgroundColor-Button-${themeColor}-outlined--active`) ??
        explicitValue(`backgroundColor-Button-${themeColor}-outlined`) ??
        themeValue(`backgroundColor-Button-${themeColor}-outlined--active`) ??
        outlinedBackground ?? tone.alphaActive,
      [`borderColor-Button-${themeColor}-outlined`]: outlinedBorder,
      [`borderColor-Button-${themeColor}-outlined--hover`]:
        explicitValue(`borderColor-Button-${themeColor}-outlined--hover`) ??
        explicitValue(`borderColor-Button-${themeColor}-outlined`) ??
        themeValue(`borderColor-Button-${themeColor}-outlined--hover`) ??
        outlinedBorder,
      [`borderColor-Button-${themeColor}-outlined--active`]:
        explicitValue(`borderColor-Button-${themeColor}-outlined--active`) ??
        explicitValue(`borderColor-Button-${themeColor}-outlined`) ??
        themeValue(`borderColor-Button-${themeColor}-outlined--active`) ??
        outlinedBorder,
      [`borderStyle-Button-${themeColor}-outlined`]: outlinedBorderStyle,
      [`textColor-Button-${themeColor}-outlined`]: outlinedText,
      [`textColor-Button-${themeColor}-outlined--hover`]:
        explicitValue(`textColor-Button-${themeColor}-outlined--hover`) ??
        explicitValue(`textColor-Button-${themeColor}-outlined`) ??
        themeValue(`textColor-Button-${themeColor}-outlined--hover`) ??
        outlinedText,
      [`textColor-Button-${themeColor}-outlined--active`]:
        explicitValue(`textColor-Button-${themeColor}-outlined--active`) ??
        explicitValue(`textColor-Button-${themeColor}-outlined`) ??
        themeValue(`textColor-Button-${themeColor}-outlined--active`) ??
        outlinedText,

      [`backgroundColor-Button-${themeColor}-ghost`]: ghostBackground,
      [`backgroundColor-Button-${themeColor}-ghost--hover`]:
        explicitValue(`backgroundColor-Button-${themeColor}-ghost--hover`) ??
        explicitValue(`backgroundColor-Button-${themeColor}-ghost`) ??
        themeValue(`backgroundColor-Button-${themeColor}-ghost--hover`) ??
        ghostBackground ?? tone.alphaHover,
      [`backgroundColor-Button-${themeColor}-ghost--active`]:
        explicitValue(`backgroundColor-Button-${themeColor}-ghost--active`) ??
        explicitValue(`backgroundColor-Button-${themeColor}-ghost`) ??
        themeValue(`backgroundColor-Button-${themeColor}-ghost--active`) ??
        ghostBackground ?? tone.alphaActive,
      [`textColor-Button-${themeColor}-ghost`]: ghostText,
      [`borderStyle-Button-${themeColor}-ghost`]: ghostBorderStyle,
      [`textColor-Button-${themeColor}-ghost--hover`]:
        explicitValue(`textColor-Button-${themeColor}-ghost--hover`) ??
        explicitValue(`textColor-Button-${themeColor}-ghost`) ??
        themeValue(`textColor-Button-${themeColor}-ghost--hover`) ??
        ghostText,
      [`textColor-Button-${themeColor}-ghost--active`]:
        explicitValue(`textColor-Button-${themeColor}-ghost--active`) ??
        explicitValue(`textColor-Button-${themeColor}-ghost`) ??
        themeValue(`textColor-Button-${themeColor}-ghost--active`) ??
        ghostText,
    });
  }
  return generated;
}

function buttonToneReferences(themeColor: string, themeVariables: ThemeVariableMap): {
  base: string;
  hover: string;
  active: string;
  contrast: string;
  alphaHover: string;
  alphaActive: string;
} {
  const base = firstThemeReference(themeVariables, [
    `color-Button-${themeColor}-solid`,
    `color-Button-${themeColor}`,
    `backgroundColor-Button-${themeColor}-solid`,
    `backgroundColor-Button-${themeColor}`,
    themeColor === "attention" ? "color-attention" : `color-${themeColor}-500`,
    `color-${themeColor}`,
  ]) ?? (themeColor === "attention" ? "$color-attention" : `$color-${themeColor}-500`);
  const hover = firstThemeReference(themeVariables, [
    `color-Button-${themeColor}-solid--hover`,
    `backgroundColor-Button-${themeColor}-solid--hover`,
    `backgroundColor-Button-${themeColor}--hover`,
    themeColor === "attention" ? "color-danger-400" : `color-${themeColor}-400`,
  ]) ?? base;
  const active = firstThemeReference(themeVariables, [
    `color-Button-${themeColor}-solid--active`,
    `backgroundColor-Button-${themeColor}-solid--active`,
    `backgroundColor-Button-${themeColor}--active`,
    themeColor === "attention" ? "color-attention" : `color-${themeColor}-500`,
  ]) ?? base;
  const contrast = firstThemeReference(themeVariables, [
    `textColor-Button-${themeColor}-solid`,
    "textColor-Button-solid",
  ]) ?? "$const-color-surface-50";
  return {
    base,
    hover,
    active,
    contrast,
    alphaHover: alphaThemeColor(base, 0.1),
    alphaActive: alphaThemeColor(base, 0.2),
  };
}

function firstThemeReference(
  themeVariables: ThemeVariableMap,
  names: readonly string[],
): string | undefined {
  for (const name of names) {
    const value = themeVariables[name];
    if (value !== undefined && value !== null && value !== "") {
      return typeof value === "string" ? value : String(value);
    }
    for (const fallbackName of themeVariableFallbackNames(name)) {
      if (fallbackName === name) {
        continue;
      }
      const fallbackValue = themeVariables[fallbackName];
      if (fallbackValue !== undefined && fallbackValue !== null && fallbackValue !== "") {
        return typeof fallbackValue === "string" ? fallbackValue : String(fallbackValue);
      }
    }
  }
  return undefined;
}

function alphaThemeColor(value: string, alpha: number): string {
  return `rgb(from ${resolveThemeReferences(value)} r g b / ${alpha})`;
}

type ParsedColor = {
  h: number;
  s: number;
  l: number;
  r: number;
  g: number;
  b: number;
};

function parseColor(value: string | undefined): ParsedColor | undefined {
  if (!value || value.startsWith("$")) {
    return undefined;
  }
  const source = value.trim().toLowerCase();
  const hslMatch = /^hsl\(\s*([-.\d]+)(?:deg)?\s*,\s*([-.\d]+)%\s*,\s*([-.\d]+)%\s*\)$/.exec(source);
  if (hslMatch) {
    const h = Number(hslMatch[1]);
    const s = Number(hslMatch[2]);
    const l = Number(hslMatch[3]);
    const rgb = hslToRgb(h, s, l);
    return { h, s, l, ...rgb };
  }
  const hexMatch = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(source);
  if (hexMatch) {
    const hex = hexMatch[1].length === 3
      ? hexMatch[1].split("").map((part) => part + part).join("")
      : hexMatch[1];
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { ...rgbToHsl(r, g, b), r, g, b };
  }
  if (source === "white") {
    return { h: 0, s: 0, l: 100, r: 255, g: 255, b: 255 };
  }
  if (source === "black") {
    return { h: 0, s: 0, l: 0, r: 0, g: 0, b: 0 };
  }
  return undefined;
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const normalizedHue = ((h % 360) + 360) % 360 / 360;
  const saturation = clamp(s, 0, 100) / 100;
  const lightness = clamp(l, 0, 100) / 100;
  if (saturation === 0) {
    const channel = lightness * 255;
    return { r: channel, g: channel, b: channel };
  }
  const q = lightness < 0.5
    ? lightness * (1 + saturation)
    : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;
  return {
    r: hueToRgb(p, q, normalizedHue + 1 / 3) * 255,
    g: hueToRgb(p, q, normalizedHue) * 255,
    b: hueToRgb(p, q, normalizedHue - 1 / 3) * 255,
  };
}

function hueToRgb(p: number, q: number, hue: number): number {
  let value = hue;
  if (value < 0) value += 1;
  if (value > 1) value -= 1;
  if (value < 1 / 6) return p + (q - p) * 6 * value;
  if (value < 1 / 2) return q;
  if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
  return p;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const l = (max + min) / 2;
  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }
  const delta = max - min;
  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let h = 0;
  if (max === red) {
    h = (green - blue) / delta + (green < blue ? 6 : 0);
  } else if (max === green) {
    h = (blue - red) / delta + 2;
  } else {
    h = (red - green) / delta + 4;
  }
  return { h: h * 60, s: s * 100, l: l * 100 };
}

function labLightness(color: ParsedColor): number {
  const y = linearRgb(color.r / 255) * 0.2126
    + linearRgb(color.g / 255) * 0.7152
    + linearRgb(color.b / 255) * 0.0722;
  return y <= 216 / 24389
    ? y * (24389 / 27)
    : 116 * Math.cbrt(y) - 16;
}

function linearRgb(channel: number): number {
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

function hslString(h: number, s: number, l: number): string {
  return `hsl(${formatCssNumber(h)}, ${formatCssNumber(s)}%, ${formatCssNumber(clamp(l, 0, 100))}%)`;
}

function formatCssNumber(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function themeVariableFallbackNames(name: string): string[] {
  const parsed = parseHierarchicalThemeVarName(name);
  if (!parsed) {
    return [name];
  }
  const stateSuffixes = combinations(parsed.states).map((states) =>
    states.length > 0 ? `--${states.join("--")}` : "",
  );
  const traitSuffixes = combinations(parsed.traits).map((traits) =>
    traits.length > 0 ? `-${traits.join("-")}` : "",
  );
  const componentParts = [parsed.component, ...parsed.classes];
  const names: string[] = [];
  for (const stateSuffix of stateSuffixes) {
    for (const traitSuffix of traitSuffixes) {
      for (const componentPart of componentParts) {
        names.push(`${parsed.attribute}-${componentPart}${traitSuffix}${stateSuffix}`);
      }
    }
  }
  return [...new Set(names)];
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

function addThemeDeclaration(
  declarations: Set<string>,
  declarationSources: Map<string, Set<string>>,
  originalName: string,
): void {
  const name = stripLegacyThemeClassPrefix(originalName);
  declarations.add(name);
  const sources = declarationSources.get(name) ?? new Set<string>();
  sources.add(originalName);
  sources.add(name);
  declarationSources.set(name, sources);
}

function themeVariableValue(
  name: string,
  sourceNames: Set<string> | undefined,
  themeVariables: ThemeVariableMap,
): unknown {
  for (const sourceName of sourceNames ?? [name]) {
    const value = themeVariables[sourceName];
    if (value !== undefined) {
      return value;
    }
  }
  for (const sourceName of sourceNames ?? [name]) {
    for (const fallbackName of themeVariableFallbackNames(sourceName)) {
      const value = themeVariables[fallbackName];
      if (value !== undefined) {
        return value;
      }
    }
  }
  return themeVariables[name];
}

function stripLegacyThemeClassPrefix(name: string): string {
  return name.replace("Input:", "").replace("Heading:", "");
}

function addBorderShorthandLonghands(
  cssVariables: Record<string, string | number>,
  themeVariables: ThemeVariableMap,
  explicitThemeVariables: ThemeVariableMap,
): void {
  for (const [name, value] of Object.entries(themeVariables)) {
    const shorthand = borderShorthandLonghandPrefix(name);
    if (!shorthand || value === undefined || value === null || value === "") {
      continue;
    }
    const suffix = name.slice(shorthand.sourcePrefix.length);
    const parsed = parseBorderShorthand(String(resolveThemeReferences(value)));
    if (!parsed) {
      continue;
    }
    addDerivedCssVariable(cssVariables, explicitThemeVariables, `${shorthand.targetPrefix}Width-${suffix}`, parsed.width);
    addDerivedCssVariable(cssVariables, explicitThemeVariables, `${shorthand.targetPrefix}Style-${suffix}`, parsed.style);
    addDerivedCssVariable(cssVariables, explicitThemeVariables, `${shorthand.targetPrefix}Color-${suffix}`, parsed.color);
  }
}

function borderShorthandLonghandPrefix(name: string): {
  sourcePrefix: string;
  targetPrefix: string;
} | undefined {
  for (const prefix of [
    "borderHorizontal",
    "borderVertical",
    "borderLeft",
    "borderRight",
    "borderTop",
    "borderBottom",
    "border",
  ]) {
    const sourcePrefix = `${prefix}-`;
    if (name.startsWith(sourcePrefix)) {
      return {
        sourcePrefix,
        targetPrefix: prefix,
      };
    }
  }
  return undefined;
}

function addDerivedCssVariable(
  cssVariables: Record<string, string | number>,
  themeVariables: ThemeVariableMap,
  name: string,
  value: string | undefined,
): void {
  if (!value || themeVariables[name] !== undefined) {
    return;
  }
  cssVariables[themePropNameToCssVarName(name)] = value;
}

function parseBorderShorthand(
  value: string,
): { width?: string; style?: string; color?: string } | undefined {
  const source = value.trim();
  if (!source) {
    return undefined;
  }
  const stylePattern = /\b(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset)\b/;
  const widthPattern = /(?:^|\s)(thin|medium|thick|-?\d*\.?\d+(?:px|em|rem|%|vh|vw|vmin|vmax|ch|ex)?)(?=\s|$)/;
  const style = source.match(stylePattern)?.[1];
  const widthMatch = source.match(widthPattern);
  const width = widthMatch?.[1];
  const color = source
    .replace(stylePattern, "")
    .replace(widthPattern, " ")
    .trim()
    .replace(/\s+/g, " ");
  return {
    width,
    style,
    color: color || undefined,
  };
}

function parseHierarchicalThemeVarName(name: string):
  | {
      classes: string[];
      attribute: string;
      component: string;
      traits: string[];
      states: string[];
    }
  | undefined {
  const match = name.match(/^(?<prefix>.+?)-(?<component>[A-Z][A-Za-z0-9]*)(?<rest>(?:-.+|--.+)?)$/);
  if (!match?.groups) {
    return undefined;
  }
  const prefix = match.groups.prefix;
  const classParts = prefix.split(":");
  const attribute = classParts[classParts.length - 1];
  if (!attribute) {
    return undefined;
  }
  const rest = match.groups.rest ?? "";
  const [traitPart = "", ...stateParts] = rest.split("--");
  const traits = traitPart.split("-").filter(Boolean);
  const states = stateParts.flatMap((state) => state.split("--")).filter(Boolean);
  return {
    classes: classParts.slice(0, -1),
    attribute,
    component: match.groups.component,
    traits,
    states,
  };
}

function combinations(values: string[]): string[][] {
  const result: string[][] = [];
  for (let length = values.length; length >= 1; length -= 1) {
    for (let index = 0; index <= values.length - length; index += 1) {
      result.push(values.slice(index, index + length));
    }
  }
  result.push([]);
  return result;
}

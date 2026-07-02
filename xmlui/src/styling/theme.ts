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
  "space-2": "calc(2 * var(--xmlui-space-base))",
  "space-3": "calc(3 * var(--xmlui-space-base))",
  "space-4": "calc(4 * var(--xmlui-space-base))",
  "space-5": "calc(5 * var(--xmlui-space-base))",
  "space-6": "calc(6 * var(--xmlui-space-base))",
  "space-8": "calc(8 * var(--xmlui-space-base))",
  "space-10": "calc(10 * var(--xmlui-space-base))",
  "space-11": "calc(11 * var(--xmlui-space-base))",
  "space-64": "calc(64 * var(--xmlui-space-base))",

  "const-color-surface-0": "white",
  "const-color-surface-50": "hsl(204, 30.3%, 96.5%)",
  "const-color-surface-100": "hsl(204, 30.3%, 93%)",
  "const-color-surface-200": "hsl(204, 30.3%, 85%)",
  "const-color-surface-300": "hsl(204, 30.3%, 75%)",
  "const-color-surface-400": "hsl(204, 30.3%, 65%)",
  "const-color-surface-500": "hsl(204, 30.3%, 52%)",
  "const-color-surface-600": "hsl(204, 30.3%, 45%)",
  "const-color-surface-700": "hsl(204, 30.3%, 35%)",
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

  "const-color-success-0": "hsl(129.5, 58.4%, 100%)",
  "const-color-success-50": "hsl(129.5, 58.4%, 97.3%)",
  "const-color-success-100": "hsl(129.5, 58.4%, 94.5%)",
  "const-color-success-200": "hsl(129.5, 58.4%, 89%)",
  "const-color-success-300": "hsl(129.5, 58.4%, 83.5%)",
  "const-color-success-400": "hsl(129.5, 58.4%, 78.1%)",
  "const-color-success-500": "hsl(129.5, 58.4%, 72.6%)",
  "const-color-success-600": "hsl(129.5, 58.4%, 58.1%)",
  "const-color-success-700": "hsl(129.5, 58.4%, 43.5%)",
  "const-color-success-800": "hsl(129.5, 58.4%, 29%)",
  "const-color-success-900": "hsl(129.5, 58.4%, 14.5%)",
  "const-color-success-950": "hsl(129.5, 58.4%, 7.3%)",
  "const-color-success-1000": "hsl(129.5, 58.4%, 0%)",
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
  borderColor: "rgb(from $color-surface-900 r g b / 0.1)",
  "borderColor--disabled": "$color-surface-200",
  "borderColor-outlined": "$color-primary-600",
  "borderColor-outlined--hover": "$color-primary-500",
  "borderColor-outlined--active": "$color-primary-700",
  "borderColor-outlined--focus": "$color-primary-600",

  light: {
    textColor: "black",
    "color-surface-0": "$const-color-surface-0",
    "color-surface-50": "$const-color-surface-50",
    "color-surface-100": "hsl(204, 30.3%, 95%)",
    "color-surface-200": "$const-color-surface-200",
    "color-surface-300": "$const-color-surface-300",
    "color-surface-400": "$const-color-surface-400",
    "color-surface-500": "$const-color-surface-500",
    "color-surface-600": "hsl(204, 30.3%, 40%)",
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
    "color-primary-300": "color(srgb 0.436168 0.651561 0.907832)",
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
    "color-secondary-800": "rgb(44, 50, 59)",
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
  "backgroundColor-Button-secondary-solid--hover": "rgb(140, 151, 169)",
  "borderColor-Button-secondary-solid--hover": "rgb(226, 229, 234)",
  light: {
    "backgroundColor-ModalDialog": "white",
    "backgroundColor-checked-RadioGroupOption": "$color-primary-400",
  },
  dark: {
    "color-error": "$color-danger-400",
  },
};

export const generatedThemeVariables: ThemeVariableLayer = {
  "fontSize-Text-keyboard": `calc(${themeVarReference("fontSize-Text")} * 0.875)`,
  "fontSize-Text-sample": `calc(${themeVarReference("fontSize-Text")} * 0.875)`,
  "fontSize-Text-sup": `calc(${themeVarReference("fontSize-Text")} * 0.625)`,
  "fontSize-Text-sub": `calc(${themeVarReference("fontSize-Text")} * 0.625)`,
  "fontSize-Text-title": `calc(${themeVarReference("fontSize-Text")} * 1.5)`,
  "fontSize-Text-subtitle": `calc(${themeVarReference("fontSize-Text")} * 1.25)`,
  "fontSize-Text-small": `calc(${themeVarReference("fontSize-Text")} * 0.875)`,
  "fontSize-Text-placeholder": `calc(${themeVarReference("fontSize-Text")} * 0.875)`,
  "fontSize-Text-paragraph": themeVarReference("fontSize-Text"),
  "fontSize-Text-subheading": `calc(${themeVarReference("fontSize-Text")} * 0.625)`,
  "fontSize-Text-tableheading": `calc(${themeVarReference("fontSize-Text")} * 0.625)`,
  "fontSize-Text-secondary": `calc(${themeVarReference("fontSize-Text")} * 0.875)`,
};

export const defaultThemeVariables = mergeThemeVariableLayers([
  rootThemeVariables,
  generatedThemeVariables,
  xmluiThemeVariables,
]);

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
  const baseThemeVariables = mergeThemeVariableLayers([
    collectComponentThemeDefaults(metadata, contributors),
    themeVariables,
    variant ? componentVariantThemeVariables(metadata, themeVariables, contributors, variant) : {},
  ]);
  const mergedThemeVariables = mergeThemeVariableLayers([
    generateButtonTones(baseThemeVariables),
    baseThemeVariables,
  ]);
  const style = componentThemeVariablesToCssProperties(
    metadata,
    mergedThemeVariables,
    contributors,
    themeVariables,
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
      const value = themeVariables[variantKey];
      if (value !== undefined && !isSelfReferentialVariantAlias(key, value)) {
        aliases[key] = value;
      }
    }
  }
  return aliases;
}

function isSelfReferentialVariantAlias(key: string, value: unknown): boolean {
  return typeof value === "string" && value.includes(themeVarReference(key));
}

export function generateButtonTones(themeVariables: ThemeVariableMap | undefined): ThemeVariableMap {
  if (!themeVariables) {
    return {};
  }
  const generated: ThemeVariableMap = {};
  for (const themeColor of ["primary", "secondary", "attention"]) {
    const tone = buttonToneReferences(themeColor, themeVariables);
    Object.assign(generated, {
      [`backgroundColor-Button-${themeColor}-solid`]: tone.base,
      [`backgroundColor-Button-${themeColor}-solid--hover`]: tone.hover,
      [`backgroundColor-Button-${themeColor}-solid--active`]: tone.active,
      [`borderColor-Button-${themeColor}-solid`]: tone.base,
      [`borderColor-Button-${themeColor}-solid--hover`]: tone.base,
      [`borderColor-Button-${themeColor}-solid--active`]: tone.base,
      [`textColor-Button-${themeColor}-solid`]: tone.contrast,
      [`textColor-Button-${themeColor}-solid--hover`]: tone.contrast,
      [`textColor-Button-${themeColor}-solid--active`]: tone.contrast,

      [`backgroundColor-Button-${themeColor}-outlined--hover`]: tone.alphaHover,
      [`backgroundColor-Button-${themeColor}-outlined--active`]: tone.alphaActive,
      [`borderColor-Button-${themeColor}-outlined`]: tone.base,
      [`borderColor-Button-${themeColor}-outlined--hover`]: tone.hover,
      [`borderColor-Button-${themeColor}-outlined--active`]: tone.active,
      [`textColor-Button-${themeColor}-outlined`]: tone.base,
      [`textColor-Button-${themeColor}-outlined--hover`]: tone.hover,
      [`textColor-Button-${themeColor}-outlined--active`]: tone.active,

      [`backgroundColor-Button-${themeColor}-ghost--hover`]: tone.alphaHover,
      [`backgroundColor-Button-${themeColor}-ghost--active`]: tone.alphaActive,
      [`textColor-Button-${themeColor}-ghost`]: tone.base,
      [`textColor-Button-${themeColor}-ghost--hover`]: tone.hover,
      [`textColor-Button-${themeColor}-ghost--active`]: tone.active,
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
  }
  return undefined;
}

function alphaThemeColor(value: string, alpha: number): string {
  return `rgb(from ${resolveThemeReferences(value)} r g b / ${alpha})`;
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
  for (const sourceName of themeVariableLookupNames(sourceNames ?? [name])) {
    const value = themeVariables[sourceName];
    if (value !== undefined) {
      return value;
    }
  }
  return themeVariables[name];
}

function themeVariableLookupNames(sourceNames: Iterable<string>): string[] {
  const names: string[] = [];
  for (const sourceName of sourceNames) {
    const aliases = [
      sourceName.startsWith("borderWidth-")
        ? sourceName.replace(/^borderWidth-/, "borderThickness-")
        : undefined,
    ].filter((name): name is string => !!name);
    names.push(sourceName, ...aliases);
    for (const lookupName of [sourceName, ...aliases]) {
      names.push(...themeVariableFallbackNames(lookupName));
    }
  }
  return [...new Set(names)];
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
  if (!value || explicitThemeVariableExists(themeVariables, name)) {
    return;
  }
  cssVariables[themePropNameToCssVarName(name)] = value;
}

function explicitThemeVariableExists(themeVariables: ThemeVariableMap, name: string): boolean {
  if (themeVariables[name] !== undefined) {
    return true;
  }
  return name.startsWith("borderWidth-")
    ? themeVariables[name.replace(/^borderWidth-/, "borderThickness-")] !== undefined
    : false;
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

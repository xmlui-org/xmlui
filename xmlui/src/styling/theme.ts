import type { CSSProperties } from "react";

import type { ComponentMetadata } from "../components/metadata";
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
): CSSProperties {
  const declarations = new Set<string>();
  for (const descriptor of [metadata, ...contributors]) {
    for (const key of Object.keys(descriptor.themeVars ?? {})) {
      declarations.add(stripLegacyThemeClassPrefix(key));
    }
    for (const key of Object.keys(descriptor.defaultThemeVars ?? {})) {
      declarations.add(stripLegacyThemeClassPrefix(key));
    }
  }

  const cssVariables: Record<string, string | number> = {};
  for (const name of declarations) {
    const value = resolveThemeVariable(name, [themeVariables]);
    if (value !== undefined && value !== null && value !== "") {
      cssVariables[themePropNameToCssVarName(name)] = String(resolveThemeReferences(value));
    }
  }
  return cssVariables as CSSProperties;
}

export function createComponentThemeClass(
  componentName: string,
  metadata: ComponentMetadata,
  themeVariables: ThemeVariableMap,
  contributors: readonly ComponentMetadata[] = [],
): ComponentThemeClass {
  const style = componentThemeVariablesToCssProperties(metadata, themeVariables, contributors);
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

function stripLegacyThemeClassPrefix(name: string): string {
  return name.replace("Input:", "").replace("Heading:", "");
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

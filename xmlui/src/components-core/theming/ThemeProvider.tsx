import { useMemo } from "react";

import type {
  FontDef,
  ThemeDefinition,
  ThemeDefinitionDetails,
  ThemeTone,
} from "../../abstractions/ThemingDefs";
import {
  defaultThemeVariables,
  defaultThemeVariableLayers,
  generateBaseTones,
  mergeThemeVariableLayers,
  resolveThemeVariablesWithCssVars,
  themeVariablesToCssProperties,
  type ThemeVariableLayer,
} from "../../styling";

type CompiledTheme = {
  themeCssVars: Record<string, string>;
  getResourceUrl: (resourceString?: string) => string | undefined;
  fontLinks: string[];
  allThemeVarsWithResolvedHierarchicalVars: Record<string, string>;
  invalidThemeVarNames: Set<string>;
  getThemeVar: (themeVar: string) => string | undefined;
};

const DEFAULT_RESOURCE_URLS: Record<string, string> = {
  logo: "/resources/xmlui-logo.svg",
  "logo-light": "/resources/xmlui-logo.svg",
  "logo-dark": "/resources/xmlui-logo-dark.svg",
  favicon: "/resources/favicon.ico",
};

export function useCompiledTheme(
  currentTheme: ThemeDefinition,
  tone: ThemeTone,
  themes: Array<ThemeDefinition>,
  resources: Record<string, string | FontDef> = {},
  resourceMap: Record<string, string> = {},
  _strictTheming = true,
  _strictAccessibility = false,
): CompiledTheme {
  return useMemo(() => {
    const themeStack = resolveThemeStack(currentTheme, themes);
    const layers = themeStack.flatMap((theme) => themeLayers(theme, tone));
    const variablesForGeneratedTones = mergeThemeVariableLayers(
      [...defaultThemeVariableLayers, ...layers],
      tone,
    );
    const variables = mergeThemeVariableLayers(
      [
        ...defaultThemeVariableLayers,
        generateBaseTones(variablesForGeneratedTones),
        ...layers,
      ],
      tone,
    );
    const resolvedVars = resolveThemeVariablesWithCssVars(variables);
    const themeCssVars = Object.fromEntries(
      Object.entries(themeVariablesToCssProperties(resolvedVars)).map(([name, value]) => [
        name,
        String(value),
      ]),
    );
    const allThemeVarsWithResolvedHierarchicalVars = Object.fromEntries(
      Object.entries(resolvedVars).map(([name, value]) => [name, String(value)]),
    );
    const mergedResources = mergeResources(themeStack, tone, resources);

    return {
      themeCssVars,
      getResourceUrl: (resourceString?: string) =>
        getResourceUrl(resourceString, mergedResources, resourceMap),
      fontLinks: fontLinks(mergedResources),
      allThemeVarsWithResolvedHierarchicalVars,
      invalidThemeVarNames: new Set<string>(),
      getThemeVar: (themeVar: string) => {
        const name = themeVar.startsWith("$") ? themeVar.slice(1) : themeVar;
        const value = allThemeVarsWithResolvedHierarchicalVars[name] ?? variables[name];
        return value === undefined || value === null ? undefined : String(value);
      },
    };
  }, [currentTheme, resourceMap, resources, themes, tone]);
}

function resolveThemeStack(
  currentTheme: ThemeDefinition,
  themes: Array<ThemeDefinition>,
  seen = new Set<string>(),
): Array<ThemeDefinition> {
  const extensions = Array.isArray(currentTheme.extends)
    ? currentTheme.extends
    : currentTheme.extends
      ? [currentTheme.extends]
      : [];
  const ancestors = extensions.flatMap((themeId) => {
    if (seen.has(themeId)) {
      return [];
    }
    seen.add(themeId);
    const found = themes.find((theme) => theme.id === themeId);
    return found ? resolveThemeStack(found, themes, seen) : [];
  });
  return [...ancestors, currentTheme];
}

function themeLayers(theme: ThemeDefinition, tone: ThemeTone): ThemeVariableLayer[] {
  return [
    theme.themeVars ?? {},
    theme.tones?.[tone]?.themeVars ?? {},
  ];
}

function mergeResources(
  themes: Array<ThemeDefinition>,
  tone: ThemeTone,
  resources: Record<string, string | FontDef>,
): Record<string, string | FontDef> {
  return themes.reduce<Record<string, string | FontDef>>(
    (merged, theme) => ({
      ...merged,
      ...(theme.resources ?? {}),
      ...(theme.tones?.[tone]?.resources ?? {}),
    }),
    {
      ...DEFAULT_RESOURCE_URLS,
      ...resources,
    },
  );
}

function getResourceUrl(
  resourceString: string | undefined,
  resources: Record<string, string | FontDef>,
  resourceMap: Record<string, string>,
): string | undefined {
  if (!resourceString) {
    return undefined;
  }
  const resourceName = resourceString.startsWith("resource:")
    ? resourceString.slice("resource:".length)
    : resourceString;
  const mappedName = resourceMap[resourceName] ?? resourceName;
  const resource = resources[mappedName] ?? resources[resourceName];
  if (typeof resource === "string") {
    return resource;
  }
  if (resource && typeof resource === "object" && typeof resource.src === "string") {
    return resource.src;
  }
  return resourceString.startsWith("resource:") ? undefined : resourceString;
}

function fontLinks(resources: Record<string, string | FontDef>): string[] {
  return Object.values(resources).flatMap((resource) =>
    typeof resource === "string" || !resource.src ? [] : [resource.src],
  );
}

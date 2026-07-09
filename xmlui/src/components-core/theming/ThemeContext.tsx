import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { AppThemes, FontDef, ThemeDefinition, ThemeScope, ThemeTone } from "../../abstractions/ThemingDefs";
import { useThemeRuntime } from "../../runtime/rendering/theme";
import {
  XmlUiBlogThemeDefinition,
  XmlUiCyanThemeDefinition,
  XmlUiGrayThemeDefinition,
  XmlUiGreenThemeDefinition,
  XmlUiOrangeThemeDefinition,
  XmlUiPurpleThemeDefinition,
  XmlUiRedThemeDefinition,
  XmlUiThemeDefinition,
  XmlUiWebThemeDefinition,
} from "./themes/xmlui";

type ResourceMap = Record<string, string | FontDef>;

const DEFAULT_RESOURCE_URLS: Record<string, string> = {
  logo: "/resources/xmlui-logo.svg",
  "logo-light": "/resources/xmlui-logo.svg",
  "logo-dark": "/resources/xmlui-logo-dark.svg",
  favicon: "/resources/favicon.ico",
};

export const builtInThemes: Array<ThemeDefinition> = [
  XmlUiThemeDefinition,
  XmlUiGreenThemeDefinition,
  XmlUiGrayThemeDefinition,
  XmlUiOrangeThemeDefinition,
  XmlUiPurpleThemeDefinition,
  XmlUiCyanThemeDefinition,
  XmlUiRedThemeDefinition,
  XmlUiBlogThemeDefinition,
  XmlUiWebThemeDefinition,
];

const defaultThemeScope: ThemeScope = {
  activeThemeTone: "light",
  activeThemeId: "xmlui",
  root: typeof document === "undefined" ? undefined as unknown as HTMLElement : document.body,
  setRoot: () => undefined,
  activeTheme: builtInThemes[0],
  themeStyles: {},
  themeVars: {},
  getThemeVar: () => undefined,
  getResourceUrl: () => undefined,
};

const defaultAppThemes: AppThemes = {
  activeThemeTone: "light",
  activeThemeId: "xmlui",
  themes: builtInThemes,
  resources: DEFAULT_RESOURCE_URLS,
  resourceMap: {},
  availableThemeIds: builtInThemes.map((theme) => theme.id),
  activeTheme: builtInThemes[0],
  setActiveThemeTone: () => undefined,
  setActiveThemeId: () => undefined,
  toggleThemeTone: () => undefined,
};

export const ThemeContext = createContext<ThemeScope>(defaultThemeScope);
const ThemesContext = createContext<AppThemes>(defaultAppThemes);

export function LegacyThemeProvider({
  resources = {},
  resourceMap = {},
  themes = [],
  defaultTheme,
  children,
}: {
  resources?: Record<string, string>;
  resourceMap?: Record<string, string>;
  themes?: Array<ThemeDefinition>;
  defaultTheme?: string;
  children: ReactNode;
}) {
  const runtimeTheme = useThemeRuntime();
  const allThemes = useMemo(() => mergeThemes(themes), [themes]);
  const [activeThemeId, setActiveThemeIdState] = useState(() =>
    defaultTheme && allThemes.some((theme) => theme.id === defaultTheme) ? defaultTheme : "xmlui",
  );
  const themeVars = useMemo<Record<string, string>>(() => {
    const vars = Object.fromEntries(
      Object.entries(runtimeTheme.variables).map(([name, value]) => [
        name,
        legacyThemeVarValue(value),
      ]),
    );
    return {
      ...vars,
      "maxWidth-drawer-App": vars["maxWidth-drawer-App"] ?? "100%",
      "top-closeButton-App": vars["top-closeButton-App"] ?? "var(--xmlui-space-2)",
      "right-closeButton-App": vars["right-closeButton-App"] ?? "var(--xmlui-space-2)",
    };
  }, [runtimeTheme.variables]);
  const resourceDefinitions = useMemo<ResourceMap>(
    () => ({
      ...DEFAULT_RESOURCE_URLS,
      ...resources,
    }),
    [resources],
  );
  const activeTheme = allThemes.find((theme) => theme.id === activeThemeId) ?? allThemes[0];
  const activeThemeTone = runtimeTheme.tone;

  const appThemes = useMemo<AppThemes>(() => ({
    activeThemeTone,
    activeThemeId: activeTheme.id,
    themes: allThemes,
    resources: resourceDefinitions,
    resourceMap,
    availableThemeIds: allThemes.map((theme) => theme.id),
    activeTheme,
    setActiveThemeTone: (tone: ThemeTone) => {
      if (tone === "light" || tone === "dark") {
        runtimeTheme.setTone(tone);
      }
    },
    setActiveThemeId: (themeId: string) => {
      if (themeId && allThemes.some((theme) => theme.id === themeId)) {
        setActiveThemeIdState(themeId);
      }
    },
    toggleThemeTone: () => {
      runtimeTheme.setTone(activeThemeTone === "dark" ? "light" : "dark");
    },
  }), [activeTheme, activeThemeId, activeThemeTone, allThemes, resourceDefinitions, resourceMap, runtimeTheme.setTone]);

  const themeScope = useMemo<ThemeScope>(() => ({
    activeThemeTone,
    activeThemeId: activeTheme.id,
    root: typeof document === "undefined" ? undefined as unknown as HTMLElement : document.body,
    setRoot: () => undefined,
    activeTheme,
    themeStyles: Object.fromEntries(
      Object.entries(themeVars).map(([name, value]) => [`--xmlui-${name}`, value]),
    ),
    themeVars,
    getThemeVar: (name: string) => {
      const themeVarName = name.startsWith("$") ? name.slice(1) : name;
      return (
        legacyThemeVarFromRuntime(themeVarName, runtimeTheme.variables) ??
        legacyThemeVarFromDocument(themeVarName)
      );
    },
    getResourceUrl: (name?: string) => getResourceUrl(name, resourceDefinitions, resourceMap),
  }), [activeTheme, activeThemeTone, resourceDefinitions, resourceMap, runtimeTheme.variables, themeVars]);

  return (
    <ThemesContext.Provider value={appThemes}>
      <ThemeContext.Provider value={themeScope}>
        {children}
      </ThemeContext.Provider>
    </ThemesContext.Provider>
  );
}

export function useTheme(): ThemeScope {
  return useContext(ThemeContext);
}

export function useThemes(): AppThemes {
  return useContext(ThemesContext);
}

function mergeThemes(themes: Array<ThemeDefinition>): Array<ThemeDefinition> {
  const merged = new Map<string, ThemeDefinition>();
  for (const theme of builtInThemes) {
    merged.set(theme.id, theme);
  }
  for (const theme of themes) {
    merged.set(theme.id, theme);
  }
  return Array.from(merged.values());
}

function getResourceUrl(
  resourceString: string | undefined,
  resources: ResourceMap,
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

function legacyThemeVarValue(value: unknown): string {
  if (typeof value === "string" && value.startsWith("$")) {
    return `var(--xmlui-${value.slice(1)})`;
  }
  return value === undefined || value === null ? "" : String(value);
}

function legacyThemeVarFromRuntime(
  name: string,
  variables: Record<string, unknown>,
  seen = new Set<string>(),
): string | undefined {
  if (seen.has(name)) {
    return undefined;
  }
  seen.add(name);
  const value = variables[name];
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return normalizeLegacyThemeLength(resolveLegacyThemeValue(value, variables, seen));
}

function resolveLegacyThemeValue(
  value: unknown,
  variables: Record<string, unknown>,
  seen: Set<string>,
): string {
  if (typeof value !== "string") {
    return String(value);
  }
  if (value.startsWith("$")) {
    return legacyThemeVarFromRuntime(value.slice(1), variables, seen) ?? value;
  }
  return value.replace(/var\(--xmlui-([A-Za-z][A-Za-z0-9_-]*)\)/g, (match, name: string) =>
    legacyThemeVarFromRuntime(name, variables, seen) ?? match,
  );
}

function legacyThemeVarFromDocument(name: string): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }
  const cssVar = `--xmlui-${name}`;
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  return value ? normalizeLegacyThemeLength(value) : undefined;
}

function normalizeLegacyThemeLength(value: string): string {
  const calcMatch = value.match(
    /^\s*calc\(\s*(-?\d+(?:\.\d+)?)\s*\*\s*(-?\d+(?:\.\d+)?)(px|rem|em)\s*\)\s*$/,
  );
  if (!calcMatch) {
    return value;
  }
  return `${Number(calcMatch[1]) * Number(calcMatch[2])}${calcMatch[3]}`;
}

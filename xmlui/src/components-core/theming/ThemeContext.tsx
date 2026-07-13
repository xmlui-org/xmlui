import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { AppThemes, FontDef, ThemeDefinition, ThemeScope, ThemeTone } from "../../abstractions/ThemingDefs";
import type { ComponentThemeMetadataRegistry } from "../../component-core/themeMetadata";
import { useThemeRuntime } from "../../runtime/rendering/theme";
import { compileOldThemeModel, type CompiledOldThemeModel } from "./oldThemeCompiler";
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
type ShadowThemeVarMismatch = {
  name: string;
  emittedValue: string | undefined;
  shadowValue: string | undefined;
};

export type OldThemeShadowDiagnostics = {
  activeThemeId: string;
  activeThemeTone: ThemeTone;
  emittedRootVars: Record<string, string>;
  shadowTheme: CompiledOldThemeModel;
  mismatches: ShadowThemeVarMismatch[];
};

declare global {
  var __XMLUI_ENABLE_OLD_THEME_SHADOW__: boolean | undefined;
  var __XMLUI_OLD_THEME_SHADOW__: OldThemeShadowDiagnostics | undefined;
}

const DEFAULT_RESOURCE_URLS: Record<string, string> = {
  logo: "/resources/xmlui-logo.svg",
  "logo-light": "/resources/xmlui-logo.svg",
  "logo-dark": "/resources/xmlui-logo-dark.svg",
  favicon: "/resources/favicon.ico",
};

const EMPTY_COMPONENT_THEME_METADATA: Pick<
  ComponentThemeMetadataRegistry,
  "componentThemeVars" | "componentDefaultThemeVars"
> = {
  componentThemeVars: new Set<string>(),
  componentDefaultThemeVars: {},
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
  componentThemeMetadata = EMPTY_COMPONENT_THEME_METADATA,
  enableOldThemeShadowDiagnostics = false,
  children,
}: {
  resources?: Record<string, string | FontDef>;
  resourceMap?: Record<string, string>;
  themes?: Array<ThemeDefinition>;
  defaultTheme?: string;
  componentThemeMetadata?: Pick<
    ComponentThemeMetadataRegistry,
    "componentThemeVars" | "componentDefaultThemeVars"
  >;
  enableOldThemeShadowDiagnostics?: boolean;
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
  const emittedRootVars = useMemo(
    () => Object.fromEntries(
      Object.entries(themeVars).map(([name, value]) => [`--xmlui-${name}`, value]),
    ),
    [themeVars],
  );
  const resourceDefinitions = useMemo<ResourceMap>(
    () => ({
      ...DEFAULT_RESOURCE_URLS,
      ...resources,
    }),
    [resources],
  );
  const activeTheme = allThemes.find((theme) => theme.id === activeThemeId) ?? allThemes[0];
  const activeThemeTone = runtimeTheme.tone;
  const shouldShadowCompile =
    enableOldThemeShadowDiagnostics || globalThis.__XMLUI_ENABLE_OLD_THEME_SHADOW__ === true;
  const oldThemeShadowDiagnostics = useMemo<OldThemeShadowDiagnostics | undefined>(() => {
    if (!shouldShadowCompile) {
      globalThis.__XMLUI_OLD_THEME_SHADOW__ = undefined;
      return undefined;
    }
    const shadowTheme = compileOldThemeModel({
      builtInThemes,
      customThemes: themes,
      activeThemeId: activeTheme.id,
      defaultTheme,
      defaultTone: activeThemeTone,
      componentThemeMetadata,
      resources: resourceDefinitions,
      resourceMap,
    });
    const mismatches = compareShadowRootVars(emittedRootVars, shadowTheme.themeCssVars);
    const diagnostics = {
      activeThemeId: activeTheme.id,
      activeThemeTone,
      emittedRootVars,
      shadowTheme,
      mismatches,
    };
    globalThis.__XMLUI_OLD_THEME_SHADOW__ = diagnostics;
    return diagnostics;
  }, [
    activeTheme.id,
    activeThemeTone,
    componentThemeMetadata,
    defaultTheme,
    emittedRootVars,
    resourceDefinitions,
    resourceMap,
    shouldShadowCompile,
    themes,
  ]);

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
    themeStyles: emittedRootVars,
    themeVars,
    getThemeVar: (name: string) => {
      const themeVarName = name.startsWith("$") ? name.slice(1) : name;
      return (
        legacyThemeVarFromRuntime(themeVarName, runtimeTheme.variables) ??
        legacyThemeVarFromDocument(themeVarName)
      );
    },
    getResourceUrl: (name?: string) => getResourceUrl(name, resourceDefinitions, resourceMap),
  }), [activeTheme, activeThemeTone, emittedRootVars, resourceDefinitions, resourceMap, runtimeTheme.variables, themeVars]);

  void oldThemeShadowDiagnostics;

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

function compareShadowRootVars(
  emittedRootVars: Record<string, string>,
  shadowThemeCssVars: Record<string, string>,
): ShadowThemeVarMismatch[] {
  const names = new Set([
    ...Object.keys(emittedRootVars),
    ...Object.keys(shadowThemeCssVars),
  ]);
  return [...names]
    .filter((name) => emittedRootVars[name] !== shadowThemeCssVars[name])
    .sort()
    .map((name) => ({
      name,
      emittedValue: emittedRootVars[name],
      shadowValue: shadowThemeCssVars[name],
    }));
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

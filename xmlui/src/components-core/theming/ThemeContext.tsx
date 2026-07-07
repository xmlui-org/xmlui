import { createContext, useContext, useMemo, type ReactNode } from "react";

import { useThemeRuntime } from "../../runtime/rendering/theme";

type LegacyThemeContextValue = {
  activeThemeTone: string;
  activeThemeId?: string;
  root?: HTMLElement | null;
  themeVars?: Record<string, string>;
  themes?: Record<string, unknown>;
  getThemeVar: (name: string) => string | undefined;
  getResourceUrl: (name: string) => string | undefined;
  setActiveThemeTone?: (tone: string) => void;
  setActiveThemeId?: (themeId: string) => void;
};

const DEFAULT_RESOURCE_URLS: Record<string, string> = {
  logo: "/resources/xmlui-logo.svg",
  "logo-light": "/resources/xmlui-logo.svg",
  "logo-dark": "/resources/xmlui-logo-dark.svg",
  favicon: "/resources/favicon.ico",
};

export const ThemeContext = createContext<LegacyThemeContextValue>({
  activeThemeTone: "light",
  activeThemeId: "default",
  root: typeof document === "undefined" ? null : document.body,
  themeVars: {},
  themes: {},
  getThemeVar: () => undefined,
  getResourceUrl: () => undefined,
  setActiveThemeTone: () => undefined,
  setActiveThemeId: () => undefined,
});

export function LegacyThemeProvider({
  resources = {},
  children,
}: {
  resources?: Record<string, string>;
  children: ReactNode;
}) {
  const runtimeTheme = useThemeRuntime();
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
  const value = useMemo<LegacyThemeContextValue>(() => ({
    activeThemeTone: runtimeTheme.tone,
    activeThemeId: "default",
    root: typeof document === "undefined" ? null : document.body,
    themeVars,
    themes: {},
    getThemeVar: (name: string) => {
      const themeVarName = name.startsWith("$") ? name.slice(1) : name;
      return (
        legacyThemeVarFromRuntime(themeVarName, runtimeTheme.variables) ??
        legacyThemeVarFromDocument(themeVarName)
      );
    },
    getResourceUrl: (name: string) => {
      if (!name.startsWith("resource:")) {
        return undefined;
      }
      const resourceName = name.slice("resource:".length);
      return resources[resourceName] ?? DEFAULT_RESOURCE_URLS[resourceName];
    },
    setActiveThemeTone: () => undefined,
    setActiveThemeId: () => undefined,
  }), [resources, runtimeTheme.tone, themeVars]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
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

export function useTheme(): LegacyThemeContextValue {
  return useContext(ThemeContext);
}

export function useThemes(): LegacyThemeContextValue {
  return useTheme();
}

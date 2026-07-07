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
      const cssVar = `--xmlui-${name}`;
      return typeof document === "undefined"
        ? undefined
        : getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim() || undefined;
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

export function useTheme(): LegacyThemeContextValue {
  return useContext(ThemeContext);
}

export function useThemes(): LegacyThemeContextValue {
  return useTheme();
}

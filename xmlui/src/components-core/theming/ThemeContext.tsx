import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { AppThemes, FontDef, ThemeDefinition, ThemeScope, ThemeTone } from "../../abstractions/ThemingDefs";
import type { ComponentThemeMetadataRegistry } from "../../component-core/themeMetadata";
import { checkThemeContrast } from "../accessibility/contrast";
import { pushXsLog } from "../inspector/inspectorUtils";
import { compileThemeModel, type CompiledThemeModel } from "./themeCompiler";
import { emitThemeDiagnostics } from "./validator/emit";
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
import { useDomRoot } from "./StyleContext";
import { useIsomorphicLayoutEffect } from "../utils/hooks";
import { useXmluiAppContext } from "../../runtime/appContext";

type ResourceMap = Record<string, string | FontDef>;

const DEFAULT_RESOURCE_URLS: Record<string, string> = {
  logo: "/resources/xmlui-logo.svg",
  "logo-light": "/resources/xmlui-logo.svg",
  "logo-dark": "/resources/xmlui-logo-dark.svg",
  favicon: "/resources/favicon.ico",
};

function fallbackThemeRoot(): HTMLElement {
  return typeof document === "undefined" ? undefined as unknown as HTMLElement : document.body;
}

const EMPTY_COMPONENT_THEME_METADATA: Pick<
  ComponentThemeMetadataRegistry,
  "componentThemeVars" | "componentDefaultThemeVars" | "componentThemeVarDeclarations"
> = {
  componentThemeVars: new Set<string>(),
  componentDefaultThemeVars: {},
  componentThemeVarDeclarations: new Map(),
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
  root: fallbackThemeRoot(),
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

export function XmluiThemeProvider({
  resources = {},
  resourceMap = {},
  themes = [],
  defaultTheme,
  defaultTone = "light",
  componentThemeMetadata = EMPTY_COMPONENT_THEME_METADATA,
  strictTheming = true,
  strictAccessibility = false,
  applyDocumentThemeVars = true,
  children,
}: {
  resources?: Record<string, string | FontDef>;
  resourceMap?: Record<string, string>;
  themes?: Array<ThemeDefinition>;
  defaultTheme?: string;
  defaultTone?: ThemeTone;
  componentThemeMetadata?: Pick<
    ComponentThemeMetadataRegistry,
    "componentThemeVars" | "componentDefaultThemeVars" | "componentThemeVarDeclarations"
  >;
  strictTheming?: boolean;
  strictAccessibility?: boolean;
  applyDocumentThemeVars?: boolean;
  children: ReactNode;
}) {
  const appContext = useXmluiAppContext();
  const allThemes = useMemo(() => mergeThemes(themes), [themes]);
  const activeThemeSetExplicitly = useRef(false);
  const [activeThemeId, setActiveThemeIdState] = useState(() =>
    defaultTheme && allThemes.some((theme) => theme.id === defaultTheme) ? defaultTheme : "xmlui",
  );
  const [activeThemeTone, setActiveThemeToneState] = useState<ThemeTone>(() =>
    defaultTone === "dark" ? "dark" : "light",
  );
  const resourceDefinitions = useMemo<ResourceMap>(
    () => ({
      ...DEFAULT_RESOURCE_URLS,
      ...resources,
    }),
    [resources],
  );
  const activeTheme = allThemes.find((theme) => theme.id === activeThemeId) ?? allThemes[0];
  const compiledTheme = useMemo<CompiledThemeModel>(() => {
    return compileThemeModel({
      builtInThemes,
      customThemes: themes,
      activeThemeId: activeTheme.id,
      defaultTheme,
      defaultTone: activeThemeTone,
      componentThemeMetadata,
      strictTheming,
      resources: resourceDefinitions,
      resourceMap,
    });
  }, [
    activeTheme.id,
    activeThemeTone,
    componentThemeMetadata,
    defaultTheme,
    resourceDefinitions,
    resourceMap,
    strictTheming,
    themes,
  ]);
  const activeThemeStyles = compiledTheme.themeCssVars;
  const activeThemeVars = compiledTheme.themeVars;
  const activeGetResourceUrl = compiledTheme.getResourceUrl;
  const activeGetThemeVar = compiledTheme.getThemeVar;
  const domRoot = useDomRoot();
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const themeRoot = root ?? fallbackThemeRoot();
  const setThemeRoot = useCallback<ThemeScope["setRoot"]>((value) => {
    setRoot((previousRoot) => {
      const previousThemeRoot = previousRoot ?? fallbackThemeRoot();
      return typeof value === "function" ? value(previousThemeRoot) : value;
    });
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    if (domRoot instanceof ShadowRoot) {
      let portalContainer = domRoot.getElementById("nested-app-portal-root");
      if (!portalContainer) {
        portalContainer = document.createElement("div");
        portalContainer.id = "nested-app-portal-root";
      }
      domRoot.appendChild(portalContainer);
      setRoot(portalContainer);
      return;
    }
    setRoot(document.body);
  }, [domRoot]);

  useMemo(() => {
    if (strictTheming) {
      emitThemeDiagnostics(compiledTheme.themeDiagnostics);
    }
  }, [compiledTheme.themeDiagnostics, strictTheming]);

  useMemo(() => {
    if (!strictAccessibility && !import.meta.env.DEV) {
      return;
    }
    const resolvedForContrast = new Map<string, string>();
    for (const key of Object.keys(compiledTheme.rawAllThemeVars)) {
      const value = compiledTheme.getThemeVar(key);
      if (value !== undefined) {
        resolvedForContrast.set(key, value);
      }
    }
    for (const diagnostic of checkThemeContrast(resolvedForContrast)) {
      pushXsLog({
        kind: "a11y",
        ts: Date.now(),
        severity: strictAccessibility ? "error" : diagnostic.severity,
        code: diagnostic.code,
        componentName: diagnostic.componentName,
        message: diagnostic.message,
        fix: diagnostic.fix,
      });
      if (strictAccessibility) {
        console.error(`[XMLUI Accessibility] ${diagnostic.message}`);
      }
    }
  }, [compiledTheme, strictAccessibility]);

  useEffect(() => {
    if (!applyDocumentThemeVars || typeof document === "undefined") {
      return;
    }
    return applyThemeCssVarsToRoot(document.documentElement, compiledTheme.themeCssVars);
  }, [applyDocumentThemeVars, compiledTheme]);

  useEffect(() => {
    if (
      activeThemeSetExplicitly.current ||
      !defaultTheme ||
      activeThemeId === defaultTheme ||
      !allThemes.some((theme) => theme.id === defaultTheme)
    ) {
      return;
    }
    setActiveThemeIdState(defaultTheme);
  }, [activeThemeId, allThemes, defaultTheme]);

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
        setActiveThemeToneState(tone);
      }
    },
    setActiveThemeId: (themeId: string) => {
      if (themeId && allThemes.some((theme) => theme.id === themeId)) {
        activeThemeSetExplicitly.current = true;
        setActiveThemeIdState(themeId);
      }
    },
    toggleThemeTone: () => {
      setActiveThemeToneState(activeThemeTone === "dark" ? "light" : "dark");
    },
  }), [activeTheme, activeThemeId, activeThemeTone, allThemes, resourceDefinitions, resourceMap]);

  const themeScope = useMemo<ThemeScope>(() => ({
    activeThemeTone,
    activeThemeId: activeTheme.id,
    root: themeRoot,
    setRoot: setThemeRoot,
    activeTheme,
    themeStyles: activeThemeStyles,
    themeVars: activeThemeVars,
    getThemeVar: activeGetThemeVar,
    getResourceUrl: activeGetResourceUrl,
    disableInlineStyle: isTruthyBoolean(appContext.appGlobals.disableInlineStyle) ? true : undefined,
  }), [
    activeGetResourceUrl,
    activeGetThemeVar,
    activeTheme,
    activeThemeStyles,
    activeThemeTone,
    activeThemeVars,
    appContext.appGlobals.disableInlineStyle,
    setThemeRoot,
    themeRoot,
  ]);

  return (
    <ThemesContext.Provider value={appThemes}>
      <ThemeContext.Provider value={themeScope}>
        {children}
      </ThemeContext.Provider>
    </ThemesContext.Provider>
  );
}

function isTruthyBoolean(value: unknown): boolean {
  return value === true || value === "true";
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

export function applyThemeCssVarsToRoot(
  root: Pick<CSSStyleDeclaration, "getPropertyValue" | "removeProperty" | "setProperty"> | HTMLElement,
  themeCssVars: Record<string, string>,
): () => void {
  const style = "style" in root ? root.style : root;
  const previousValues = Object.fromEntries(
    Object.keys(themeCssVars).map((name) => [name, style.getPropertyValue(name)]),
  );
  Object.entries(themeCssVars).forEach(([name, value]) => {
    style.setProperty(name, value);
  });
  return () => {
    Object.entries(previousValues).forEach(([name, value]) => {
      if (value) {
        style.setProperty(name, value);
      } else {
        style.removeProperty(name);
      }
    });
  };
}

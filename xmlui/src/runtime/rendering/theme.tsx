import React, {
  createContext,
  useContext,
  useEffect,
  useInsertionEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import type { ComponentMetadata } from "../../component-core/metadata";
import {
  createComponentThemeClass,
  defaultThemeVariableLayers,
  defaultThemeVariables,
  generateBaseTones,
  mergeThemeVariableLayers,
  resolveThemeVariablesWithCssVars,
  themeVariablesToCssProperties,
  type ThemeTone,
} from "../../styling";

type StyleRegistryEntry = {
  className: string;
  hash: string;
  css: string;
};

export type ThemeRuntimeContext = {
  variables: Record<string, unknown>;
  tone: ThemeTone;
  setTone: (tone: ThemeTone) => void;
  disableInlineStyle?: boolean;
};

const noopSetTone = () => undefined;
const StyleRegistryContext = createContext<StyleRegistry | undefined>(undefined);
const ThemeContext = createContext<ThemeRuntimeContext>({
  variables: defaultThemeVariables,
  tone: "light",
  setTone: noopSetTone,
  disableInlineStyle: undefined,
});
const themeRootBaseStyles: CSSProperties = {
  direction: "var(--xmlui-direction)" as CSSProperties["direction"],
  backgroundColor: "var(--xmlui-backgroundColor)",
  color: "var(--xmlui-textColor-primary)",
  fontFamily: "var(--xmlui-fontFamily)",
  fontSize: "var(--xmlui-fontSize)",
  fontFeatureSettings: "var(--xmlui-font-feature-settings)",
  fontWeight: "var(--xmlui-fontWeight-normal)",
  lineHeight: "var(--xmlui-lineHeight)",
  letterSpacing: "var(--xmlui-letterSpacing)",
  "--stack-gap-default": "var(--xmlui-space-4)",
} as CSSProperties;

export function StyleProvider({ children }: { children: ReactNode }) {
  const [registry] = useState(() => new StyleRegistry());
  return (
    <StyleRegistryContext.Provider value={registry}>
      {children}
    </StyleRegistryContext.Provider>
  );
}

export function RuntimeThemeProvider({
  children,
  variables,
  tone,
  setTone,
  disableInlineStyle,
}: {
  children: ReactNode;
  variables: Record<string, unknown>;
  tone: ThemeTone;
  setTone: (tone: ThemeTone) => void;
  disableInlineStyle?: boolean;
}) {
  const parent = useThemeRuntime();
  const value = useMemo<ThemeRuntimeContext>(
    () => ({
      variables,
      tone,
      setTone,
      disableInlineStyle: disableInlineStyle ?? parent.disableInlineStyle,
    }),
    [disableInlineStyle, parent.disableInlineStyle, setTone, tone, variables],
  );
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function XmluiThemeRoot({ children, tone: initialTone = "light" }: { children: ReactNode; tone?: ThemeTone }) {
  const [tone, setTone] = useState<ThemeTone>(initialTone);
  useEffect(() => {
    setTone(initialTone);
  }, [initialTone]);
  const variables = useMemo(
    () => {
      const baseVariables = mergeThemeVariableLayers(defaultThemeVariableLayers, tone);
      return mergeThemeVariableLayers(
        [...defaultThemeVariableLayers, generateBaseTones(baseVariables)],
        tone,
      );
    },
    [tone],
  );
  const value = useMemo<ThemeRuntimeContext>(
    () => ({ variables, tone, setTone, disableInlineStyle: undefined }),
    [tone, variables],
  );
  const rootClassName = useDynamicStyle(
    {
      ...themeVariablesToCssProperties(resolveThemeVariablesWithCssVars(variables)),
      ...themeRootBaseStyles,
    },
    "themes",
  );
  useRootStyleClass(rootClassName);
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeVariables(): Record<string, unknown> {
  return useContext(ThemeContext).variables;
}

export function useThemeRuntime(): ThemeRuntimeContext {
  return useContext(ThemeContext);
}

export function useComponentThemeClass(
  componentName: string,
  metadata: ComponentMetadata,
  contributors: readonly ComponentMetadata[] = [],
  variant?: string,
) {
  const themeVariables = useThemeVariables();
  const themeClass = useMemo(
    () => createComponentThemeClass(componentName, metadata, themeVariables, contributors, variant),
    [componentName, metadata, themeVariables, contributors, variant],
  );
  const generatedClassName = useDynamicStyle(themeClass.style, "themes");
  return useMemo(
    () => ({
      ...themeClass,
      className: [themeClass.className, generatedClassName].filter(Boolean).join(" "),
      style: {},
    }),
    [generatedClassName, themeClass],
  );
}

export function ThemeScope({
  variables,
  style,
  children,
  tone,
}: {
  variables: Record<string, unknown>;
  style?: CSSProperties;
  children: ReactNode;
  tone?: ThemeTone;
}) {
  const parent = useThemeRuntime();
  const nextVariables = useMemo(
    () => {
      const nextTone = tone ?? parent.tone;
      const baseVariables = mergeThemeVariableLayers([parent.variables, variables], nextTone);
      return mergeThemeVariableLayers(
        [parent.variables, generateBaseTones(baseVariables), variables],
        nextTone,
      );
    },
    [parent.tone, parent.variables, tone, variables],
  );
  const cssVariables = useMemo(
    () => ({
      display: "contents",
      ...themeVariablesToCssProperties(resolveThemeVariablesWithCssVars(variables)),
    }),
    [variables],
  );
  const themeClassName = useDynamicStyle(cssVariables, "themes");
  const value = useMemo<ThemeRuntimeContext>(
    () => ({
      variables: nextVariables,
      tone: tone ?? parent.tone,
      setTone: parent.setTone,
      disableInlineStyle: parent.disableInlineStyle,
    }),
    [nextVariables, parent.disableInlineStyle, parent.setTone, parent.tone, tone],
  );
  if (!hasHostLayoutStyle(style)) {
    return (
      <ThemeContext.Provider value={value}>
        {children}
      </ThemeContext.Provider>
    );
  }
  return (
    <ThemeContext.Provider value={value}>
      <div
        data-xmlui-component="Theme"
        data-xmlui-part="root"
        data-xmlui-tone={tone ?? parent.tone}
        className={themeClassName}
        style={style}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

function hasHostLayoutStyle(style: CSSProperties | undefined): boolean {
  if (!style) {
    return false;
  }
  return Object.entries(style).some(([name, value]) =>
    value !== undefined && value !== null && !(name === "display" && value === "contents")
  );
}

function useRootStyleClass(className: string | undefined): void {
  useEffect(() => {
    if (!className || typeof document === "undefined") {
      return;
    }
    document.documentElement.classList.add(className);
    return () => {
      document.documentElement.classList.remove(className);
    };
  }, [className]);
}

function useDynamicStyle(styles: CSSProperties | undefined, layer = "dynamic"): string | undefined {
  const registry = useContext(StyleRegistryContext);
  const entry = useMemo(() => {
    if (!registry || !styles || Object.keys(styles).length === 0) {
      return undefined;
    }
    return registry.register(styles, layer);
  }, [layer, registry, styles]);

  useInsertionEffect(() => {
    if (!entry || typeof document === "undefined") {
      return;
    }
    if (document.head.querySelector(`style[data-xmlui-style-hash="${entry.hash}"]`)) {
      return;
    }
    const style = document.createElement("style");
    style.setAttribute("data-xmlui-style-hash", entry.hash);
    style.textContent = `@layer ${layer} {${entry.css}}`;
    document.head.appendChild(style);
  }, [entry, layer]);

  return entry?.className;
}

class StyleRegistry {
  private readonly cache = new Map<string, StyleRegistryEntry>();

  register(styles: CSSProperties, layer: string): StyleRegistryEntry {
    const key = stableJSONStringify({ layer, styles });
    const hash = hashString(key);
    const cached = this.cache.get(hash);
    if (cached) {
      return cached;
    }
    const className = `xmlui-css-${hash}`;
    const css = generateCss(`.${className}`, styles);
    const entry = { className, hash, css };
    this.cache.set(hash, entry);
    return entry;
  }
}

function generateCss(selector: string, styles: CSSProperties): string {
  const declarations = Object.entries(styles)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([name, value]) => `${toKebabCase(name)}:${String(value)};`)
    .join("");
  return declarations ? `${selector}{${declarations}}` : "";
}

function toKebabCase(value: string): string {
  return value.startsWith("--")
    ? value
    : value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function stableJSONStringify(value: unknown): string {
  if (!value || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableJSONStringify).join(",")}]`;
  }
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJSONStringify((value as Record<string, unknown>)[key])}`)
    .join(",")}}`;
}

function hashString(value: string): string {
  let hash = 5381;
  let index = value.length;
  while (index) {
    hash = (hash * 33) ^ value.charCodeAt(--index);
  }
  return (hash >>> 0).toString(36);
}

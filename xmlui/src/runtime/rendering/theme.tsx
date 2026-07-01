import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import type { ComponentMetadata } from "../../component-core/metadata";
import { useComponentStyle, useStyles } from "../../components-core/theming/StyleContext";
import {
  buildDefaultThemeVariables,
  createComponentThemeClass,
  defaultThemeVariables,
  generateBaseSpacings,
  generateBaseTones,
  generateBorderSegments,
  generatePaddingSegments,
  mergeThemeVariableLayers,
  resolveThemeVariablesWithCssVars,
  themeVariablesToCssProperties,
  type ThemeTone,
} from "../../styling";

export type ThemeRuntimeContext = {
  variables: Record<string, unknown>;
  tone: ThemeTone;
  setTone: (tone: ThemeTone) => void;
};

const noopSetTone = () => undefined;
const ThemeContext = createContext<ThemeRuntimeContext>({
  variables: defaultThemeVariables,
  tone: "light",
  setTone: noopSetTone,
});

const EMPTY_STYLE: CSSProperties = {};

function mergeClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function XmluiThemeRoot({ children, tone: initialTone = "light" }: { children: ReactNode; tone?: ThemeTone }) {
  const [tone, setTone] = useState<ThemeTone>(initialTone);
  useEffect(() => {
    setTone(initialTone);
  }, [initialTone]);
  const variables = useMemo(
    () => buildDefaultThemeVariables(tone),
    [tone],
  );
  const cssVariables = useMemo(
    () => themeVariablesToCssProperties(resolveThemeVariablesWithCssVars(variables)),
    [variables],
  );
  const themeClassName = useComponentStyle(
    cssVariables as Record<string, CSSProperties[keyof CSSProperties]>,
    { layer: "themes" },
  );
  useLayoutEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const root = document.documentElement;
    if (!themeClassName) {
      return;
    }
    root.classList.add(themeClassName);
    return () => {
      root.classList.remove(themeClassName);
    };
  }, [themeClassName]);
  const value = useMemo<ThemeRuntimeContext>(
    () => ({ variables, tone, setTone }),
    [tone, variables],
  );
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
  const componentTheme = useMemo(
    () => createComponentThemeClass(componentName, metadata, themeVariables, contributors, variant),
    [componentName, metadata, themeVariables, contributors, variant],
  );
  const dynamicClassName = useComponentStyle(
    componentTheme.style as Record<string, CSSProperties[keyof CSSProperties]>,
    { layer: "themes" },
  );
  return useMemo(
    () => ({
      ...componentTheme,
      className: mergeClassNames(componentTheme.className, dynamicClassName),
      style: EMPTY_STYLE,
    }),
    [componentTheme, dynamicClassName],
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
      const activeTone = tone ?? parent.tone;
      const rawVariables = mergeThemeVariableLayers([parent.variables, variables], activeTone);
      return mergeThemeVariableLayers([
        parent.variables,
        generateBaseSpacings(rawVariables),
        generatePaddingSegments(rawVariables),
        generateBorderSegments(rawVariables),
        generateBaseTones(rawVariables),
        variables,
      ], activeTone);
    },
    [parent.tone, parent.variables, tone, variables],
  );
  const cssVariables = useMemo(
    () => {
      const activeTone = tone ?? parent.tone;
      const rawVariables = mergeThemeVariableLayers([parent.variables, variables], activeTone);
      const scopedVariables = mergeThemeVariableLayers([
        generateBaseSpacings(rawVariables),
        generatePaddingSegments(rawVariables),
        generateBorderSegments(rawVariables),
        variables,
      ], activeTone);
      return themeVariablesToCssProperties(resolveThemeVariablesWithCssVars(scopedVariables));
    },
    [parent.tone, parent.variables, tone, variables],
  );
  const themeScopeStyles = useMemo(
    () => ({
      "&": {
        display: "contents",
        ...cssVariables,
        colorScheme: tone ?? parent.tone,
      },
    }),
    [cssVariables, parent.tone, tone],
  );
  const themeClassName = useStyles(themeScopeStyles, { layer: "themes" });
  const value = useMemo<ThemeRuntimeContext>(
    () => ({
      variables: nextVariables,
      tone: tone ?? parent.tone,
      setTone: parent.setTone,
    }),
    [nextVariables, parent.setTone, parent.tone, tone],
  );
  const wrapperStyle = useMemo(() => {
    if (!style) {
      return undefined;
    }
    const { boxSizing: _boxSizing, ...rest } = style;
    return Object.keys(rest).length > 0 ? rest : undefined;
  }, [style]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (wrapperStyle) {
      return;
    }
    wrapperRef.current?.removeAttribute("style");
  }, [wrapperStyle]);
  return (
    <ThemeContext.Provider value={value}>
      <div
        ref={wrapperRef}
        data-xmlui-component="Theme"
        data-xmlui-part="root"
        data-xmlui-tone={tone ?? parent.tone}
        className={themeClassName}
        {...(wrapperStyle ? { style: wrapperStyle } : {})}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

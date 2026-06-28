import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import type { ComponentMetadata } from "../../component-core/metadata";
import {
  createComponentThemeClass,
  defaultThemeVariables,
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

export function XmluiThemeRoot({ children, tone: initialTone = "light" }: { children: ReactNode; tone?: ThemeTone }) {
  const [tone, setTone] = useState<ThemeTone>(initialTone);
  useEffect(() => {
    setTone(initialTone);
  }, [initialTone]);
  const variables = useMemo(
    () => mergeThemeVariableLayers([defaultThemeVariables], tone),
    [tone],
  );
  const cssVariables = useMemo(
    () => themeVariablesToCssProperties(resolveThemeVariablesWithCssVars(variables)),
    [variables],
  );
  useLayoutEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const root = document.documentElement;
    const previous = new Map<string, string>();
    for (const [name, value] of Object.entries(cssVariables)) {
      previous.set(name, root.style.getPropertyValue(name));
      root.style.setProperty(name, String(value));
    }
    return () => {
      for (const [name, value] of previous) {
        if (value) {
          root.style.setProperty(name, value);
        } else {
          root.style.removeProperty(name);
        }
      }
    };
  }, [cssVariables]);
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
  return useMemo(
    () => createComponentThemeClass(componentName, metadata, themeVariables, contributors, variant),
    [componentName, metadata, themeVariables, contributors, variant],
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
    () => mergeThemeVariableLayers([parent.variables, variables], tone ?? parent.tone),
    [parent.tone, parent.variables, tone, variables],
  );
  const cssVariables = useMemo(
    () => themeVariablesToCssProperties(resolveThemeVariablesWithCssVars(variables)),
    [variables],
  );
  const value = useMemo<ThemeRuntimeContext>(
    () => ({
      variables: nextVariables,
      tone: tone ?? parent.tone,
      setTone: parent.setTone,
    }),
    [nextVariables, parent.setTone, parent.tone, tone],
  );
  return (
    <ThemeContext.Provider value={value}>
      <div
        data-xmlui-component="Theme"
        data-xmlui-part="root"
        data-xmlui-tone={tone ?? parent.tone}
        style={{ ...cssVariables, ...style }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

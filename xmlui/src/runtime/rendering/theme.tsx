import React, { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from "react";

import type { ComponentMetadata } from "../../components/metadata";
import {
  createComponentThemeClass,
  defaultThemeVariables,
  mergeThemeVariableLayers,
  resolveThemeVariablesWithCssVars,
  themeVariablesToCssProperties,
} from "../../styling";

const ThemeContext = createContext<Record<string, unknown>>(defaultThemeVariables);

export function XmluiThemeRoot({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={defaultThemeVariables}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeVariables(): Record<string, unknown> {
  return useContext(ThemeContext);
}

export function useComponentThemeClass(
  componentName: string,
  metadata: ComponentMetadata,
  contributors: readonly ComponentMetadata[] = [],
) {
  const themeVariables = useThemeVariables();
  return useMemo(
    () => createComponentThemeClass(componentName, metadata, themeVariables, contributors),
    [componentName, metadata, themeVariables, contributors],
  );
}

export function ThemeScope({
  variables,
  style,
  children,
}: {
  variables: Record<string, unknown>;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const parent = useThemeVariables();
  const nextVariables = useMemo(
    () => mergeThemeVariableLayers([parent, variables]),
    [parent, variables],
  );
  const cssVariables = useMemo(
    () => themeVariablesToCssProperties(resolveThemeVariablesWithCssVars(variables)),
    [variables],
  );
  return (
    <ThemeContext.Provider value={nextVariables}>
      <div
        data-xmlui-component="Theme"
        data-xmlui-part="root"
        style={{ ...cssVariables, ...style }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

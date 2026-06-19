import React, { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from "react";

import {
  defaultThemeVariables,
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
  const nextVariables = useMemo(() => ({ ...parent, ...variables }), [parent, variables]);
  const cssVariables = useMemo(() => themeVariablesToCssProperties(variables), [variables]);
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


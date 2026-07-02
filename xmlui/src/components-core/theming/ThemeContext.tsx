import { createContext, useContext, useMemo, type ReactNode } from "react";

import { useThemeRuntime } from "../../runtime/rendering/theme";

type LegacyThemeContextValue = {
  activeThemeTone: string;
  getResourceUrl: (name: string) => string | undefined;
};

const LegacyThemeContext = createContext<LegacyThemeContextValue>({
  activeThemeTone: "light",
  getResourceUrl: () => undefined,
});

export function LegacyThemeProvider({
  resources = {},
  children,
}: {
  resources?: Record<string, string>;
  children: ReactNode;
}) {
  const runtimeTheme = useThemeRuntime();
  const value = useMemo<LegacyThemeContextValue>(() => ({
    activeThemeTone: runtimeTheme.tone,
    getResourceUrl: (name: string) => {
      if (!name.startsWith("resource:")) {
        return undefined;
      }
      const resourceName = name.slice("resource:".length);
      return resources[resourceName];
    },
  }), [resources, runtimeTheme.tone]);

  return (
    <LegacyThemeContext.Provider value={value}>
      {children}
    </LegacyThemeContext.Provider>
  );
}

export function useTheme(): LegacyThemeContextValue {
  return useContext(LegacyThemeContext);
}

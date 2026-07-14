import { createContext, useContext, type ReactNode } from "react";

import type { ComponentMetadata } from "../component-core/metadata";

type ComponentRegistryValue = {
  lookupComponentRenderer: (name: string) => {
    descriptor?: ComponentMetadata;
    isCompoundComponent?: boolean;
  } | undefined;
  componentThemeVars: Set<string>;
  componentDefaultThemeVars?: Record<string, unknown>;
  componentThemeVarDeclarations?: Map<string, unknown>;
};

const defaultRegistry: ComponentRegistryValue = {
  lookupComponentRenderer: () => undefined,
  componentThemeVars: new Set<string>(),
};

export const ComponentRegistryContext = createContext<ComponentRegistryValue>(defaultRegistry);

export function ComponentRegistryProvider({
  children,
  value = defaultRegistry,
}: {
  children: ReactNode;
  value?: ComponentRegistryValue;
}) {
  return (
    <ComponentRegistryContext.Provider value={value}>
      {children}
    </ComponentRegistryContext.Provider>
  );
}

export function useComponentRegistry(): ComponentRegistryValue {
  return useContext(ComponentRegistryContext);
}

import { createContext, useContext, type ReactNode } from "react";

type ComponentRegistryValue = {
  lookupComponentRenderer: (name: string) => { isCompoundComponent?: boolean } | undefined;
  componentThemeVars: Set<string>;
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

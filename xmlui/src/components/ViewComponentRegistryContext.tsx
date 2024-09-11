import React, { useContext } from "react";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import type { ComponentRegistry } from "@components/ComponentProvider";
import type { ComponentRendererFn } from "@abstractions/RendererDefs";


// A single registry entry
export type ComponentRegistryEntry = {
  // The function that renders a component definition into a React component
  renderer: ComponentRendererFn<any>;

  // Component descriptor (hints and other metadata)
  descriptor?: ComponentDescriptor<any>;
  isCompoundComponent?: boolean;
};

// Context object that makes the component registry available
export const ViewComponentRegistryContext = React.createContext<ComponentRegistry | null>(null);

// Use this hook within a component to access the component registry
export function useComponentRegistry() {
  return useContext(ViewComponentRegistryContext)!;
}

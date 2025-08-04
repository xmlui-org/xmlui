import React, { useContext } from "react";

import type { ComponentRendererFn } from "../abstractions/RendererDefs";
import type { ComponentMetadata } from "../abstractions/ComponentDefs";

import type { ComponentRegistry } from "./ComponentProvider";

// A single registry entry
export type ComponentRegistryEntry = {
  // The function that renders a component definition into a React component
  renderer: ComponentRendererFn<any>;

  // Component descriptor (hints and other metadata)
  descriptor?: ComponentMetadata;
  isCompoundComponent?: boolean;
};

// Context object that makes the component registry available
export const ComponentRegistryContext = React.createContext<ComponentRegistry | null>(null);

// Use this hook within a component to access the component registry
export function useComponentRegistry() {
  return useContext(ComponentRegistryContext)!;
}

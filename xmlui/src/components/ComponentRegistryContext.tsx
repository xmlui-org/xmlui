import React, { useContext } from "react";

import type { ComponentRendererFn } from "../abstractions/RendererDefs";
import type { ComponentMetadata, CompoundComponentDef } from "../abstractions/ComponentDefs";

import type { ComponentRegistry } from "./ComponentProvider";

// A single registry entry
export type ComponentRegistryEntry = {
  // The function that renders a component definition into a React component
  renderer: ComponentRendererFn<any>;

  // Component descriptor (hints and other metadata)
  descriptor?: ComponentMetadata;

  // Indicates whether this entry represents a compound (user-defined) component
  isCompoundComponent?: boolean;

  // For compound components: the UDC sandbox contract parsed from
  // explicit <Prop>/<Event>/<Method>/<Slot> declarations.  Used by analyzer
  // rules (e.g. udc-slot-undeclared) to enforce the declared surface
  // across files.  Typed loosely to avoid pulling components-core types
  // into the registry layer; consumers cast to `UdcContract`.
  udcContract?: unknown;
};

// Context object that makes the component registry available
export const ComponentRegistryContext = React.createContext<ComponentRegistry | null>(null);

// Use this hook within a component to access the component registry
export function useComponentRegistry() {
  return useContext(ComponentRegistryContext)!;
}

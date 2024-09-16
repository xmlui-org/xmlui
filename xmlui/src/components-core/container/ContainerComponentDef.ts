import type { ComponentDef } from "@abstractions/ComponentDefs";

// Represents a container component. A container provides optional actions, loaders to implement its behavior and stores
// state the child components can access.
export interface ContainerComponentDef extends ComponentDef<"Container"> {
  containerUid?: symbol;
  contextVars?: Record<string, any>;
  apiBoundContainer?: boolean;
}

/**
 * We store the state application state in a hierarchical structure of containers. This type represents
 * the state within a single container stored as key and value pairs.
 */
export type ContainerState = Record<string | symbol, any>;

/**
 * Components can provide an API that other components can invoke (using the host component ID). This
 * type defines the shape of a hash object that stores the API endpoints.
 */
export type ComponentApi = Record<string, (args?: any[]) => any>;

// Function signature to register a component API

/**
 * This function registers a component API that the core components can invoke. The function takes
 * the component UID and the API object as arguments.
 */
export type RegisterComponentApiFnInner = (componentUid: symbol, api: ComponentApi) => void;

export type ComponentCleanupFn = (uid: symbol) => void;

// Tests if the particular component definition needs to be wrapped with an inline container
export function isContainerLike(node: ComponentDef) {
  if (node.type === "Container") {
    return true;
  }
  return !!(
    node.loaders ||
    node.vars ||
    node.uses ||
    node.contextVars ||
    // TODO: Check if this is needed
    // node.props?.uses !== undefined ||
    node.functions ||
    node.scriptCollected
  );
}

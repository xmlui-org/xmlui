// We store the state application state in a hierarchical structure of containers. 
// This type represents the state within a single container stored as key and value 
// pairs.
export type ContainerState = Record<string | symbol, any>;

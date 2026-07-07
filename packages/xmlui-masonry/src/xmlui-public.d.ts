declare module "xmlui" {
  import type { ComponentType } from "react";

  export type ComponentMetadata = {
    status?: string;
    description?: string;
    props?: Record<string, unknown>;
    events?: Record<string, unknown>;
    apis?: Record<string, unknown>;
    contextVars?: Record<string, unknown>;
    childrenAsTemplate?: string;
    [key: string]: unknown;
  };

  export function createMetadata(metadata: ComponentMetadata): ComponentMetadata;
  export function wrapComponent(
    name: string,
    component: ComponentType<any>,
    metadata: ComponentMetadata,
    options?: {
      booleans?: readonly string[];
      numbers?: readonly string[];
      [key: string]: unknown;
    },
  ): unknown;
}

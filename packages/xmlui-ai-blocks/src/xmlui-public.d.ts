declare module "xmlui" {
  import type { ComponentType, ReactNode } from "react";

  export type ComponentMetadata = {
    status?: string;
    description?: string;
    props?: Record<string, unknown>;
    events?: Record<string, unknown>;
    apis?: Record<string, unknown>;
    contextVars?: Record<string, unknown>;
    childrenAsTemplate?: string;
    themeVars?: Record<string, string>;
    defaultThemeVars?: Record<string, unknown>;
    [key: string]: unknown;
  };

  export function createMetadata(metadata: ComponentMetadata): ComponentMetadata;
  export function parseScssVar(scssExports: unknown): Record<string, string>;
  export function createComponentRenderer(
    name: string,
    metadata: ComponentMetadata,
    render: (args: any) => ReactNode,
  ): unknown;
  export function startApp(runtime: Record<string, unknown>, extensions?: unknown): void;
  export function wrapComponent(
    name: string,
    component: ComponentType<any>,
    metadata: ComponentMetadata,
    options?: {
      booleans?: readonly string[];
      numbers?: readonly string[];
      strings?: readonly string[];
      captureNativeEvents?: boolean;
      exposeRegisterApi?: boolean;
      [key: string]: unknown;
    },
  ): unknown;
}

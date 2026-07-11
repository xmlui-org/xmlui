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
  export function parseScssVar(scssExports: unknown): Record<string, string>;
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

  export function useTheme(): {
    root?: HTMLElement;
    getThemeVar(name: string, fallback?: unknown): string;
  };
}

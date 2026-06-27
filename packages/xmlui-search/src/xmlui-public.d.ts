declare module "xmlui" {
  import type { ComponentType, ReactNode } from "react";

  export type ComponentMetadata = {
    status?: string;
    description?: string;
    props?: Record<string, unknown>;
    events?: Record<string, unknown>;
    apis?: Record<string, unknown>;
    themeVars?: Record<string, string>;
    defaultThemeVars?: Record<string, unknown>;
    [key: string]: unknown;
  };

  export const SEARCH_DEFAULT_CATEGORY: string;
  export function createMetadata(metadata: ComponentMetadata): ComponentMetadata;
  export function parseScssVar(scssExports: unknown): Record<string, string>;
  export function createComponentRenderer(
    name: string,
    metadata: ComponentMetadata,
    render: (args: any) => ReactNode,
  ): unknown;
  export function useComponentThemeClass(metadata: ComponentMetadata): string;
  export function useSearchContextContent(): Record<string, any>;

  export const Button: ComponentType<any>;
  export const Icon: ComponentType<any>;
  export const LinkNative: ComponentType<any>;
  export const Text: ComponentType<any>;
  export const TextBox: ComponentType<any>;
  export const VisuallyHidden: ComponentType<{ children?: ReactNode }>;
  export function startApp(...args: unknown[]): void;
}

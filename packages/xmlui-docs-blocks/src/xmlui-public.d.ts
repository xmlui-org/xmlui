declare module "xmlui" {
  import type { ComponentType, CSSProperties, ReactNode } from "react";

  export type ComponentMetadata = {
    status?: string;
    description?: string;
    props?: Record<string, unknown>;
    events?: Record<string, unknown>;
    apis?: Record<string, unknown>;
    themeVars?: Record<string, string>;
    defaultThemeVars?: Record<string, unknown>;
  };

  export type ThemeDefinition = Record<string, unknown>;

  export type NavHierarchyNode = {
    label?: string;
    to?: string;
    pathSegments?: NavHierarchyNode[];
  };

  export const COMPONENT_PART_KEY: string;
  export function createMetadata(metadata: ComponentMetadata): ComponentMetadata;
  export function parseScssVar(scssExports: unknown): Record<string, string>;
  export function wrapComponent(
    name: string,
    component: ComponentType<any>,
    metadata: ComponentMetadata,
    options?: { booleans?: readonly string[]; numbers?: readonly string[] },
  ): unknown;
  export function createComponentRenderer(
    name: string,
    metadata: ComponentMetadata,
    render: (args: any) => ReactNode,
  ): unknown;
  export function createUserDefinedComponentRenderer(
    metadata: ComponentMetadata,
    componentSource: string,
  ): unknown;

  export function useAppContext(): {
    appGlobals?: Record<string, unknown>;
    mediaSize: { sizeIndex: number };
  };
  export function useTheme(): {
    getThemeVar(name: string, fallback?: unknown): unknown;
    variables?: Record<string, string>;
  };
  export function useLinkInfo(): NavHierarchyNode | undefined;

  export const Icon: ComponentType<any>;
  export const LinkNative: ComponentType<any>;
  export const Text: ComponentType<any>;
  export const Heading: ComponentType<any>;
  export const Image: ComponentType<any>;
  export const Markdown: ComponentType<any>;
  export const TableOfContents: ComponentType<any>;
  export const Tabs: ComponentType<any>;
  export const TabItem: ComponentType<any>;
  export const FlowLayout: ComponentType<any>;
  export const FlowItemWrapper: ComponentType<any>;

  export function startApp(options?: unknown): void;
}

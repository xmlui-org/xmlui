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
  export function createComponentRenderer(
    name: string,
    metadata: ComponentMetadata,
    render: (args: {
      extractValue: unknown;
      node: unknown;
      renderChild: (child: unknown) => unknown;
      [key: string]: unknown;
    }) => unknown,
  ): unknown;
  export function startApp(runtime: Record<string, unknown>, extensions?: unknown): void;
  export const Button: ComponentType<any>;
  export const Icon: ComponentType<any>;
  export function useTheme(): {
    activeThemeTone?: string;
    getThemeVar: (name: string, fallback?: string) => string | undefined;
    root?: Element | DocumentFragment | null;
    [key: string]: unknown;
  };
  export function useDevTools(): {
    mockApi?: unknown;
    inspectedNode?: any;
    sources?: Record<string, string>;
    setIsOpen: (isOpen: boolean) => void;
    projectCompilation?: any;
    isOpen: boolean;
    clickPosition: { x: number; y: number };
    [key: string]: unknown;
  };
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

declare module "xmlui/syntax/monaco" {
  export const xmluiThemeLight: any;
  export const xmluiThemeDark: any;
  export const xmluiGrammar: any;
  export const xmluiScriptGrammar: any;
}

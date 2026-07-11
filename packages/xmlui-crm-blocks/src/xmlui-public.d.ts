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
    [key: string]: unknown;
  };

  export type RegisterComponentApiFn = (api: Record<string, unknown>) => void;

  export const COMPONENT_PART_KEY: string;
  export const Icon: ComponentType<any>;

  export function createMetadata(metadata: ComponentMetadata): ComponentMetadata;
  export function parseScssVar(scssExports: unknown): Record<string, string>;
  export function startApp(runtime: Record<string, unknown>, extensions?: unknown): void;
  export function createComponentRenderer(
    name: string,
    metadata: ComponentMetadata,
    render: (args: {
      className?: string;
      classes: Record<string, string>;
      node: { props?: Record<string, unknown>; [key: string]: unknown };
      state?: Record<string, unknown>;
      extractValue: {
        (value: unknown): unknown;
        asOptionalBoolean(value: unknown, fallback?: boolean): boolean | undefined;
        asOptionalNumber(value: unknown, fallback?: number): number | undefined;
        asOptionalString(value: unknown, fallback?: string): string | undefined;
      };
      lookupEventHandler: (name: string) => ((...args: unknown[]) => unknown) | undefined;
      registerComponentApi: RegisterComponentApiFn;
      updateState: (state: Record<string, unknown>, options?: { initial?: boolean }) => void;
      renderChild: (child: unknown) => ReactNode;
    }) => ReactNode,
  ): unknown;
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

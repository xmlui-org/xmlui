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

  export function createMetadata(metadata: ComponentMetadata): ComponentMetadata;
  export function startApp(runtime: Record<string, unknown>, extensions?: unknown): void;
  export function wrapComponent(
    name: string,
    component: ComponentType<any>,
    metadata: ComponentMetadata,
    options?: {
      booleans?: readonly string[];
      numbers?: readonly string[];
      strings?: readonly string[];
      exclude?: readonly string[];
      captureNativeEvents?: boolean;
      exposeRegisterApi?: boolean;
      customRender?: (
        props: Record<string, unknown>,
        args: {
          node: { props: Record<string, unknown>; children?: unknown };
          extractValue: {
            (value: unknown): unknown;
            asOptionalBoolean(value: unknown, fallback?: boolean): boolean | undefined;
            asOptionalNumber(value: unknown, fallback?: number): number | undefined;
            asOptionalString(value: unknown, fallback?: string): string | undefined;
          };
          lookupEventHandler(name: string): ((...args: unknown[]) => unknown) | undefined;
          registerComponentApi(api: Record<string, unknown>): void;
          renderChild(child: unknown): ReactNode;
        },
      ) => ReactNode;
      [key: string]: unknown;
    },
  ): unknown;
}

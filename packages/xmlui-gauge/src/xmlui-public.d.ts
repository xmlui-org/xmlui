declare module "xmlui" {
  import type { ComponentType } from "react";

  export type ComponentMetadata = {
    status?: string;
    description?: string;
    props?: Record<string, unknown>;
    events?: Record<string, unknown>;
    apis?: Record<string, unknown>;
    defaultAriaLabel?: string;
    themeVars?: Record<string, string>;
    defaultThemeVars?: Record<string, unknown>;
    [key: string]: unknown;
  };

  export function createMetadata(metadata: ComponentMetadata): ComponentMetadata;
  export function parseScssVar(scssExports: unknown): Record<string, string>;
  export function wrapCompound(
    name: string,
    component: ComponentType<any>,
    metadata: ComponentMetadata,
    options?: {
      booleans?: readonly string[];
      numbers?: readonly string[];
      rename?: Record<string, string>;
      parseInitialValue?: (raw: unknown, props: Record<string, unknown>) => unknown;
      formatExternalValue?: (value: unknown, props: Record<string, unknown>) => unknown;
      [key: string]: unknown;
    },
  ): unknown;

  export function dDidChange(component: string): unknown;
  export function dEnabled(defaultValue?: boolean): unknown;
  export function dInitialValue(defaultValue?: unknown, valueType?: string): unknown;
}

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

  export type RegisterComponentApiFn = (api: Record<string, unknown>) => void;

  export function createMetadata(metadata: ComponentMetadata): ComponentMetadata;
  export function wrapComponent(
    name: string,
    component: ComponentType<any>,
    metadata: ComponentMetadata,
    options?: {
      booleans?: readonly string[];
      numbers?: readonly string[];
      strings?: readonly string[];
      exposeRegisterApi?: boolean;
      captureNativeEvents?: boolean;
      deriveAriaLabel?: (props: Record<string, any>) => string | undefined;
      [key: string]: unknown;
    },
  ): unknown;

  export function useTheme(): {
    root?: HTMLElement;
    getThemeVar(name: string, fallback?: unknown): string;
  };
}

declare module "xmlui" {
  import type { ComponentType, ReactNode } from "react";

  export type PropertyValueDescription<T = string | number> =
    | T
    | { value: T; description: string };

  export type ComponentMetadata = {
    status?: string;
    description?: string;
    props?: Record<string, unknown>;
    events?: Record<string, unknown>;
    apis?: Record<string, unknown>;
    parts?: Record<string, unknown>;
    themeVars?: Record<string, string>;
    defaultThemeVars?: Record<string, unknown>;
    [key: string]: unknown;
  };

  export type CompoundComponentRendererInfo = unknown;
  export type RegisterComponentApiFn = (api: Record<string, unknown>) => void;

  export const COMPONENT_PART_KEY: string;
  export function createMetadata(metadata: ComponentMetadata): ComponentMetadata;
  export function parseScssVar(scssExports: unknown): Record<string, string>;
  export function wrapComponent(
    name: string,
    component: ComponentType<any>,
    metadata: ComponentMetadata,
    options?: {
      booleans?: readonly string[];
      numbers?: readonly string[];
      events?: Record<string, string>;
      exclude?: readonly string[];
      exposeRegisterApi?: boolean;
      [key: string]: unknown;
    },
  ): unknown;
  export function createUserDefinedComponentRenderer(
    metadata: ComponentMetadata,
    componentSource: unknown,
  ): unknown;

  export function dClick(component: string): unknown;
  export function dGotFocus(component: string): unknown;
  export function dLostFocus(component: string): unknown;
  export function dComponent(description: string): unknown;

  export function useTheme(): {
    activeThemeTone?: "light" | "dark";
    getThemeVar(name: string, fallback?: unknown): unknown;
  };

  export const Button: ComponentType<any>;
  export const Icon: ComponentType<any>;
  export const Part: ComponentType<{ partId?: string; children?: ReactNode }>;
  export const Theme: ComponentType<{ tone?: string; children?: ReactNode }>;
  export function startApp(...args: unknown[]): void;
}

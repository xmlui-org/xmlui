import type { ReactNode } from "react";

export type ComponentApi = Record<string, unknown>;

export type RegisterComponentApiFn = (componentApi: ComponentApi) => void;

export type UpdateStateFn = (componentState: Record<string, unknown>, options?: unknown) => void;

export type LayoutContext = Record<string, unknown>;

export type RenderChildFn = (children?: unknown, layoutContext?: LayoutContext) => ReactNode;

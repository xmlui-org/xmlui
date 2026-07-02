import type { ForwardedRef, ReactNode, RefObject } from "react";

import type { ComponentDef, ParentRenderContext } from "./ComponentDefs";

export type ValueExtractor = {
  (expression?: any, strict?: boolean): any;
  asString(expression?: any, defValue?: string): string | undefined;
  asDisplayText(expression?: any): string | undefined;
  asOptionalBoolean(expression?: any, defValue?: boolean): boolean | undefined;
  asOptionalNumber(expression?: any, defValue?: number): number | undefined;
  asOptionalString(expression?: any, defValue?: string): string | undefined;
};

export type LayoutContext<T extends ComponentDef = ComponentDef> = {
  type?: string;
  parent?: LayoutContext<T>;
  [key: string]: any;
};

export type RenderChildFn<L extends ComponentDef = ComponentDef> = (
  children?: ComponentDef | ComponentDef[] | string,
  layoutContext?: LayoutContext<L>,
  parentRenderContext?: ParentRenderContext,
  uidInfoRef?: RefObject<Record<string, any>>,
  ref?: ForwardedRef<any>,
  rest?: Record<string, any>,
) => ReactNode | ReactNode[];

export type RegisterComponentApiFn = (componentApi: Record<string, any>) => void;

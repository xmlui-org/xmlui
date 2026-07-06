import type { ForwardedRef, ReactNode, RefObject } from "react";

import type { ComponentDef, ParentRenderContext } from "./ComponentDefs";
import type { ComponentMetadata } from "../component-core/metadata";

export type ValueExtractor = {
  (expression?: any, strict?: boolean): any;
  asString(expression?: any, defValue?: string): string | undefined;
  asDisplayText(expression?: any): string | undefined;
  asOptionalBoolean(expression?: any, defValue?: boolean): boolean | undefined;
  asOptionalNumber(expression?: any, defValue?: number): number | undefined;
  asOptionalString(expression?: any, defValue?: string): string | undefined;
  asSize(expression?: any, defValue?: string): string | undefined;
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
export type UpdateStateFn = (
  state: Record<string, any>,
  options?: { initial?: boolean },
) => void;

export type LookupActionOptions = {
  context?: Record<string, any>;
  defaultHandler?: string;
  [key: string]: any;
};

export type LookupEventHandlerFn<TMd extends ComponentMetadata = ComponentMetadata> = (
  eventName: keyof NonNullable<TMd["events"]> | string,
  actionOptions?: LookupActionOptions,
) => ((...args: any[]) => any) | undefined;

export type RendererContext = {
  extractValue: ValueExtractor;
  node: ComponentDef;
  renderChild: RenderChildFn;
  lookupEventHandler: LookupEventHandlerFn;
  lookupAction: (expression: string, options?: Record<string, any>) => (() => any) | undefined;
  lookupSyncCallback: (expression: unknown) => ((...args: any[]) => any) | undefined;
  classes: Record<string, string>;
  registerComponentApi: RegisterComponentApiFn;
  layoutContext?: LayoutContext;
};

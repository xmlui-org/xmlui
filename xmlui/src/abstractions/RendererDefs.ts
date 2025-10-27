import type { CSSProperties, ForwardedRef, ReactNode, RefObject } from "react";

import type { AppContextObject } from "./AppContextDefs";
import type {
  ComponentDef,
  ComponentMetadata,
  CompoundComponentDef,
  DynamicChildComponentDef, ParentRenderContext,
} from "./ComponentDefs";
import type { ContainerState } from "./ContainerDefs";
import type { LookupActionOptions, LookupAsyncFn, LookupSyncFn } from "./ActionDefs";
import type { AsyncFunction } from "./FunctionDefs";
import type {ComponentApi} from "../components-core/rendering/ContainerWrapper";
import type { layoutOptionKeys } from "../components-core/descriptorHelper";

// This interface defines the renderer context for the exposed components of the 
// XMLUI framework.
export interface RendererContext<TMd extends ComponentMetadata = ComponentMetadata>
  extends ComponentRendererContextBase<TMd> {
  uid: symbol; // The unique identifier of the component instance

  updateState: UpdateStateFn; // A component invokes this function to change its internal state

  // When a component wants to access a property value (which may contain a binding
  // expression to evaluate), it must use this property to get the current value.
  extractValue: ValueExtractor;

  // This function gets a physical resource URL according to the provided logical URL.
  extractResourceUrl: (url?: string) => string | undefined;

  // This function gets an async executable function that handles an event.
  lookupEventHandler: LookupEventHandlerFn<TMd>;

  registerComponentApi: RegisterComponentApiFn; // A component can register its APIs with this function

  lookupAction: LookupAsyncFn; // This function obtains an action by its name with the specified options

  // This function retrieves a sync function the component can use as a callback
  lookupSyncCallback: LookupSyncFn;

  className?: string;
}

export type UpdateStateFn = (componentState: any, options?: any) => void; // This function updates the state of a component.

// This type represent the function that extracts the value from a component property
export type ValueExtractor = {
  (expression?: any, strict?: boolean): any; // Get a value (any) from a component property

  asString(expression?: any): string; // Get a string value from an expression

  // Get an optional string value from an expression
  asOptionalString<T extends string>(expression?: any, defValue?: string): T | undefined;

  // Get an optional string value from an expression
  asOptionalStringArray(expression?: any): (string | undefined)[];

  asDisplayText(expression?: any): string; // Get a display string value from an expression

  asNumber(expression?: any): number; // Get a number value from an expression

  // Get an optional number value from an expression
  asOptionalNumber(expression?: any, defValue?: number): number | undefined;

  // Get a boolean value (JavaScript semantics) from an expression
  asBoolean(expression?: any): boolean;

  // Get an optional Boolean value from an expression
  asOptionalBoolean(expression?: any, defValue?: boolean): boolean | undefined;

  // Get a CSS size value from an expression
  asSize(expression?: any): string; 
};

// This function retrieves an async function for a particular component's specified
// event to be invoked as an event handler (`undefined` if the particular event
// handler is not defined).
export type LookupEventHandlerFn<TMd extends ComponentMetadata = ComponentMetadata> = (
  eventName: keyof NonNullable<TMd["events"]>,
  actionOptions?: LookupActionOptions,
) => AsyncFunction | undefined;

// This type represents a function that registers all API endpoints of a particular component.
export type RegisterComponentApiFn = (componentApi: ComponentApi) => void;

// Function signature to render a particular child component (or set of child components)
export type RenderChildFn<L extends ComponentDef = ComponentDef> = (
  children?:
    | ComponentDef
    | ComponentDef[]
    | DynamicChildComponentDef
    | DynamicChildComponentDef[]
    | string,
  layoutContext?: LayoutContext<L>,
  parentRenderContext?: ParentRenderContext,
  uidInfoRef?: RefObject<Record<string, any>>,
  ref?: ForwardedRef<any>,
  rest?: Record<string, any>
) => ReactNode | ReactNode[];

// Each component is rendered in a particular layout context (for example, within a
// stack). This type provides information about that context and the operations that
// render children in it.
export type LayoutContext<T extends ComponentDef = ComponentDef> = {
  type?: string; // The type of the layout context

  // This function allows the React representation of a particular child node to be
  // wrapped in whatever React components to accommodate the current layout context.
  // When the engine is about to render children in a particular layout context, it
  // checks the existence of this function. If declared, the engine invokes it.
  wrapChild?: (
    context: RendererContext<T>,
    renderedChild: ReactNode,
    metadata?: ComponentMetadata,
  ) => ReactNode;

  // Arbitrary props extending the layout context
  [key: string]: any;
};

export type NonCssLayoutProps = {
  horizontalAlignment?: string;
  verticalAlignment?: string;
  orientation?: string;
};

// This function renders a component definition into a React component
export type ComponentRendererFn<T extends ComponentDef> = (
  context: RendererContext<T>,
) => ReactNode;


export type StylePropResolverContext = {
  value: any,
  node: ComponentDef,
  extractValue: ValueExtractor,
  layoutContext?: LayoutContext,
  resolveStyleProp: (propName: string) => any
}

export type StylePropResolvers = Partial<
  Record<(typeof layoutOptionKeys)[number] | "defaults", (context: StylePropResolverContext) => CSSProperties>
>;

export type StylePropsResolver = (styleProps: Record<(typeof layoutOptionKeys)[number], string>)=> CSSProperties;

export type ComponentRendererOptions = {
  stylePropsResolver?: StylePropsResolver;
};

// This function renders a component definition into a React component
export type CompoundComponentRendererInfo = {
  compoundComponentDef: CompoundComponentDef;
  metadata?: ComponentMetadata;
};

// Components must be registered with a component registry so the engine can use them.
// This type collects the information held by the registry.
export type ComponentRendererDef<T extends ComponentDef = any> = {
  // The component's type identifier. In the markup, the component must use this name
  // to be recognized.
  type: string;

  // This function renders the component from its definition to its React representation.
  renderer: ComponentRendererFn<T>;

  // The metadata to use when rendering the component
  metadata?: ComponentMetadata;

  options?: ComponentRendererOptions
};

// Rendering components (turning component definitions into their React node 
// representation) is a complicated process that requires information describing the 
// actual context. This interface defines the common properties of that context.
export interface ComponentRendererContextBase<TMd extends ComponentMetadata = ComponentMetadata> {
  // The definition of the component to render
  node: ComponentDef<TMd>;

  // The state of the container in which the component is rendered
  state: ContainerState;

  // The application context the component (and its binding expressions) can use
  appContext?: AppContextObject;

  // The component can use this function to render its child components
  renderChild: RenderChildFn;

  // Information about the layout context in which the component is rendered
  layoutContext?: LayoutContext;
}

import type { Component, CSSProperties, ReactNode } from "react";
import type { AppContextObject } from "./AppContextDefs";
import type { ComponentDef, CompoundComponentDef, DynamicChildComponentDef } from "./ComponentDefs";
import type { ContainerState } from "./ContainerDefs";
import type { ComponentDescriptor } from "./ComponentDescriptorDefs";
import type { LookupActionOptions, LookupAsyncFn, LookupSyncFn } from "./ActionDefs";
import type { AsyncFunction } from "./FunctionDefs";

/**
 * This interface defines the renderer context for the exposed components of the XMLUI framework.
 */
export interface RendererContext<T extends ComponentDef> extends ComponentRendererContextBase<T> {
  /**
   * The unique identifier of the component instance
   */
  uid: symbol;

  /**
   * A component invokes this function to change its internal state
   */
  updateState: UpdateStateFn;

  /**
   * When a component wants to access a property value (which may contain a binding expression to
   * evaluate), it must use this property to get the current value.
   */
  extractValue: ValueExtractor;

  /**
   * This function gets a physical resource URL according to the provided logical URL.
   */
  extractResourceUrl: (url?: string) => string | undefined;

  /**
   * This function gets an async executable function that handles an event.
   */
  lookupEventHandler: LookupEventHandlerFn<T>;

  /**
   * A component can register its APIs with this function
   */
  registerComponentApi: RegisterComponentApiFn;

  /**
   * This function obtains an action by its name with the specified options
   */
  lookupAction: LookupAsyncFn;

  /**
   * This function retrieves a sync function the component can use as a callback
   */
  lookupSyncCallback: LookupSyncFn;
}

/**
 * This function updates the state of a component.
 * @param componentState The new state of the component
 */
export type UpdateStateFn = (componentState: any) => void;

/**
 * This type represent the function that extracts the value from a component property
 */
export type ValueExtractor = {
  /**
   * Get a value (any) from a component property
   * @param expression Value expression
   * @param strict Strict matching?
   */
  (expression?: any, strict?: boolean): any;

  /**
   * Get a string value from an expression
   * @param expression Value expression
   */
  asString(expression?: any): string;

  /**
   * Get an optional string value from an expression
   * @param expression Value expression
   */
  asOptionalString(expression?: any): string | undefined;

  /**
   * Get an optional string value from an expression
   * @param expression Value expression
   */
  asOptionalStringArray(expression?: any): string[];

  /**
   * Get a display string value from an expression
   * @param expression Value expression
   */
  asDisplayText(expression?: any): string;

  /**
   * Get a number value from an expression
   * @param expression Value expression
   */
  asNumber(expression?: any): number;

  /**
   * Get an optional number value from an expression
   * @param expression Value expression
   * @param defValue Default value, if the parameter value is undefined
   */
  asOptionalNumber(expression?: any, defValue?: number): number;

  /**
   * Get a boolean value (JavaScript semantics) from an expression
   * @param expression Value expression
   */
  asBoolean(expression?: any): boolean;

  /**
   * Get an optional Boolean value from an expression
   * @param expression Value expression
   * @param defValue Default value, if the parameter value is undefined
   */
  asOptionalBoolean(expression?: any, defValue?: boolean): boolean;

  /**
   * Get a CSS size value from an expression
   * @param expression Value expression
   */
  asSize(expression?: any): string;
};

/**
 * This function retrieves an async function for a particular component's specified event to be
 * invoked as an event handler (`undefined` if the particular event handler is not defined).
 */
export type LookupEventHandlerFn<T extends ComponentDef = ComponentDef> = (
  eventName: keyof NonNullable<T["events"]>,
  actionOptions?: LookupActionOptions
) => AsyncFunction | undefined;

/**
 * This type represents a function that registers all API endpoints of a particular component.
 */
export type RegisterComponentApiFn = (apiFn: Record<string, (...args: any[]) => void>) => void;

// Function signature to render a particular child component (or set of child components)
export type RenderChildFn<L extends ComponentDef = ComponentDef> = (
  children?: ComponentDef | ComponentDef[] | DynamicChildComponentDef | DynamicChildComponentDef[] | string,
  layoutContext?: LayoutContext<L>,
  childrenToRender?: DynamicChildComponentDef[],
  dynamicSlotsToRender?: Record<string, DynamicChildComponentDef[]>
) => ReactNode | ReactNode[];

/**
 * Each component is rendered in a particular layout context (for example, within a stack). This
 * type provides information about that context and the operations that render children in it.
 */
export type LayoutContext<T extends ComponentDef = ComponentDef> = {
  /**
   * The type of the layout context
   */
  type?: string;

  /**
   * This function allows the React representation of a particular child node to be wrapped in
   * whatever React components to accommodate the current layout context. When the engine is about to
   * render children in a particular layout context, it checks the existence of this function.
   * If declared, the engine invokes it.
   * @param context Rendering context
   * @param renderedChild The React node representing the rendered child
   * @param metadata The metadata of the child component
   * @returns The wrapped React node
   */
  wrapChild?: (context: RendererContext<T>, renderedChild: ReactNode, metadata?: ComponentDescriptor<T>) => ReactNode;

  /**
   * Arbitrary props extending the layout context
   */
  [key: string]: any;
};

export type NonCssLayoutProps = {
  horizontalAlignment?: string;
  verticalAlignment?: string;
  orientation?: string;
};

/**
 * This function renders a component definition into a React component
 */
export type ComponentRendererFn<T extends ComponentDef> = (context: RendererContext<T>) => ReactNode;

/**
 * This function renders a component definition into a React component
 */
export type CompoundComponentRendererInfo = {
  compoundComponentDef: CompoundComponentDef;
  hints?: ComponentDescriptor<any>;
};

/**
 * Components must be registered with a component registry so the engine can use them. This type
 * collects the information held by the registry.
 */
export type ComponentRendererDef = {
  /**
   * The component's type identifier. In the markup, the component must use this name to be recognized.
   */
  type: string;

  /**
   * This function renders the component from its definition to its React representation.
   */
  renderer: ComponentRendererFn<any>;

  /**
   * The metadata to use when rendering the component
   */
  metadata?: ComponentDescriptor<any>;
};

// --- Rendering components (turning component definitions into their React node representation) is a
// --- complicated process that requires information describing the actual context. This interface
// --- defines the common properties of that context.
export interface ComponentRendererContextBase<T extends ComponentDef = ComponentDef> {
  // --- The definition of the component to render
  node: T;

  // --- The state of the container in which the component is rendered
  state: ContainerState;

  // --- The application context the component (and its binding expressions) can use
  appContext?: AppContextObject;

  // --- The component can use this function to render its child components
  renderChild: RenderChildFn;

  // --- These are the CSS property values the underlying React component can merge into its "style" property
  layoutCss: CSSProperties;

  // --- Other layout property values the component may transform and merge into its "style" property
  layoutNonCss: NonCssLayoutProps;

  // --- Information about the layout context in which the component is rendered
  layoutContext?: LayoutContext;

  // --- Information about children rendered dynamically
  dynamicChildren?: Array<DynamicChildComponentDef>;
  dynamicSlots?: Record<string, Array<DynamicChildComponentDef>>;

  // --- The optional index of the child being rendered
  childIndex?: number;
}

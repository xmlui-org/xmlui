import type { RenderChildFn } from "./RendererDefs";
import type { CollectedDeclarations } from "../components-core/script-runner/ScriptingSourceTree";
import type { DefaultThemeVars } from "./ThemingDefs";

/**
 * This interface represents the core properties of a component definition
 * (independent of component metadata).
 */
export interface ComponentDefCore {
  /**
   * The type discriminator field of the component; it defines the unique ID of the component type.
   */
  type: string;

  /**
   * Unique identifier of a component-like object
   */
  uid?: string;

  /**
   * An optional identifier we use for e2e tests; it does not influence the rendering of a component.
   */
  testId?: string;

  /**
   * Though components manage their state internally, the app logic may require user
   * state management. Components may have user *variables*, which the UI logic uses to
   * manage the application state. This property holds the variables (name and value
   * pairs) associated with this component definition.
   */
  vars?: Record<string, any>;

  /**
   * Each component may have child components to constitute a hierarchy of components.
   * This property holds the definition of these nested children.
   */
  children?: ComponentDef[];

  /**
   * Components may have slots that can be filled with other components. This property
   * holds the contents of the slots.
   */
  slots?: Record<string, ComponentDef[]>;

  /**
   * This property is evaluated to a Boolean value during run time. When this value is
   * `true`, the component with its children chain is rendered; otherwise, the entire
   * component hierarchy is omitted from the rendered tree.
   */
  when?: string | boolean;

  /**
   * Some components work with data obtained asynchronously. Fetching this data requires
   * some state management handling the complexity (including error handling) of data
   * access. A *loader* is responsible for managing this logic. This property holds the
   * loaders associated with this component definition.
   */
  loaders?: ComponentDef[];

  /**
   * Components may have functions that are used to perform some logic. This property
   * holds the functions (name and function body) associated with this component
   * definition.
   */
  functions?: Record<string, any>;

  /**
   * Components managing state through variables or loaders are wrapped with containers
   * responsible for this job. Just as components, containers form a hierarchy. While
   * working with this hierarchy, parent components may flow state values (key and value
   * pairs) to their child containers. This property holds the name of state values to
   * flow down to the direct child containers.
   */
  uses?: string[];

  /**
   * Arbitrary debug information that can be attached to a component definition.
   * Current usage:
   * - `debug: { source: { start: number, end: number } }` The start and end
   *   positions of the source belonging to the particular component definition.
   */
  debug?: Record<string, any>;
}
// This interface represents the properties of a component definition.
export interface ComponentDef<TMd extends ComponentMetadata = ComponentMetadata>
  extends ComponentDefCore,
    Scriptable {
  // Component properties
  props?: Record<keyof TMd["props"], any>;

  // Component events
  events?: Record<keyof TMd["events"], any>;

  // Components may have an API that other components can use to interact with them.
  // This property holds the API methods associated with this component definition.
  api?: Record<keyof TMd["apis"], any>;

  // Components may provide context variables that can be used to in expressions and
  // event handlers within the component.

  contextVars?: Record<keyof TMd["contextVars"], string>;
}

// XMLUI allows the creation of reusable components assembled from other XMLUI
// components (with markup). This type represents such components. The name
// `CompoundComponent` refers to the assembled nature of reusable components.
export interface CompoundComponentDef extends Scriptable {
  // Each compound component must have a unique name. The markup uses this name to refer
  // to the particular compound component.
  name: string;

  // Each compound component must have a single root component defining the component
  // contents.
  component: ComponentDef;

  // Compound components may provide an API that other components can use to interact
  // with them. This property holds the API methods associated with this compound
  // component definition.
  api?: Record<string, any>;

  // This property holds the variables (name and value pairs) associated with this
  // compound component definition.

  vars?: Record<string, any>;

  // A component can define namespaces on it, with the <ComponentName xmlns:KEY="VALUE" />
  // syntax. These are used later to resolve the `type` of the componentDef.
  // <KEY:Button/> will have type `VALUE.Button` (joined with a "." (dot)).
  namespaces?: Record<string, string>;

  // Arbitrary debug information that can be attached to a component definition.
  // Current usage:
  // - `debug: { source: { start: number, end: number } }` The start and end
  //   positions of the source belonging to the particular component definition.
  debug?: Record<string, any>;

  codeBehind?: string;
}

// Sometimes, components and compound components can both be used
export type ComponentLike = ComponentDef | CompoundComponentDef;

// Some components render their nested child components dynamically using the current
// context of their parents. For example, reusable components (`CompoundComponentDef`)
// have a `Slot` placeholder that marks the location where the children should be
// rendered. Other component types (e.g., `ApiBoundComponent` and `ContainerComponent`)
// use this dynamic rendering, too.
//
// This interface represents this functionality.
export interface DynamicChildComponentDef extends ComponentDef {
  // This property holds a function that can render a particular child or children into
  // a specific layout context.
  renderChild: RenderChildFn;

  // This property holds the child component that should be rendered.
  childToRender: ComponentDef;
}

// This interface holds the properties representing a scriptable component definition.
interface Scriptable {
  // This property holds the text defined in all <script> sections attached to a
  // component.
  script?: string;

  // This property holds the parsed form of scripts stored in code-behind files.
  scriptCollected?: CollectedDeclarations;

  // This property holds errors coming from parsing the code-behind scripts.
  scriptError?: any;
}

export type PropertyValueType = "boolean" | "string" | "number" | "any" | "ComponentDef";

// A generic validation function that retrieves either a hint (the validation argument
// has issues) or undefined (the argument is valid).
export type IsValidFunction<T> = (
  propKey: string,
  propValue: T,
) => string | string[] | undefined | null;

// This type represents the description of a property value, which can be a string, a
// number, or an object with a value and a description. This type is used in the
// metadata of a component.
export type PropertyValueDescription<T = string | number> =
  | T
  | {
      value: T;
      description: string;
    };

// Components have properties, events, context values, and exposed API endpoints, each
// holding metadata the rendering engine uses at run time. This type defines the
// structure of such metadata.
export type ComponentPropertyMetadata = {
  // This field defines the description explaining the property. You can use markdown,
  // as the UI may display this value.
  readonly description: string;

  // This field defines the type of the property. The rendering engine uses this
  // information to validate the property value.
  readonly valueType?: PropertyValueType;

  // This field defines the available values of the property. The rendering engine
  // uses this information to validate the property value.
  readonly availableValues?: readonly PropertyValueDescription[];

  // This field defines the default value of the property. The rendering engine uses
  // this information to set the default value of the property.
  defaultValue?: any;

  // This field defines a validation function that the rendering engine uses to
  // validate the property value. The function returns one or more hints if the
  // property value is invalid.
  isValid?: IsValidFunction<any>;

  // Indicates that a particular property is internal and should not be exposed in the
  // documentation
  isInternal?: boolean;

  // Indicates that a particular property is required for the component to essentially
  // function.
  isRequired?: boolean;
};

// This type defines the metadata of a component API. It is used to describe the
// methods that the component exposes for interaction.
export type ComponentApiMetadata = {
  // This field defines the description explaining the property. You can use markdown,
  // as the UI may display this value.
  readonly description: string;

  // This field defines the signature of the API method using TypeScript-like syntax.
  readonly signature?: string;

  // This field defines the parameters of the API method. It is an object where each key
  // is the parameter name, and the value is its description.
  readonly parameters?: Record<string, string>;
};

// This type defines the metadata of a component part. It is used to describe the
// individual parts that make up the component.
export type ComponentPartMetadata = {
  description: string;
};

// Components have metadata that the rendering engine uses to render the component.
// This type defines the structure of such metadata.
//
// The type has generic parameters to ensure that type-checking works with the
// metadata defined here in concert with the renderer object using the same metadata
// type.
export type ComponentMetadata<
  TProps extends Record<string, ComponentPropertyMetadata> = Record<string, any>,
  TEvents extends Record<string, ComponentPropertyMetadata> = Record<string, any>,
  TContextValues extends Record<string, ComponentPropertyMetadata> = Record<string, any>,
  TApis extends Record<string, ComponentApiMetadata> = Record<string, any>,
> = {
  // The current status of the component. This field is now mandatory.
  status?: "stable" | "experimental" | "deprecated" | "in progress" | "internal";

  // Component description in markdown; it goes into the generated documentation
  description?: string;

  // Optional short description of the component to display in visual tools
  shortDescription?: string;

  // Description of component properties
  props?: TProps;

  // Description of component events
  events?: TEvents;

  // Description of component context variables
  contextVars?: TContextValues;

  // Description of component APIs
  apis?: TApis;

  // Indicates that a particular component does not render any visual element on its own (Default: false)
  nonVisual?: boolean;

  // childrenAsTemplate?: keyof TProps;
  childrenAsTemplate?: string;

  opaque?: boolean;

  // List of theme variables available for the component
  themeVars?: Array<string>;

  // Optional description of theme variables available for the component
  themeVarDescriptions?: Record<string, string>;

  // Theme variable default values for the "solid" theme
  defaultThemeVars?: DefaultThemeVars;

  // Theme variable defaults for a particular tone-specific theme
  toneSpecificThemeVars?: Record<string, Record<string, string>>;

  // Indicates that the documentation should include only the theme variables
  // including the component name
  limitThemeVarsToComponent?: boolean;

  // Indicates that the component allows arbitrary props (not just the named ones)
  allowArbitraryProps?: boolean;

  // If the component is specalized, this property holds the name of the parent component
  specializedFrom?: string;

  // Contains the folder name if it does not match the component name
  docFolder?: string;

  // Indicates that the component represent an HTML tag
  isHtmlTag?: boolean;

  // Describes the individual parts that make up the component
  parts?: Record<string, ComponentPartMetadata>;

  // The name of the default part. Layout properties will be applied to this part by default.
  defaultPart?: string;
};

export interface ParentRenderContext {
  renderChild: RenderChildFn;
  children?: ComponentDef[];
  props?: Record<string, any>;
}

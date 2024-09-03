import type { RenderChildFn } from "./RendererDefs";
import type { CollectedDeclarations } from "./scripting/ScriptingSourceTree";

/**
 * XMLUI turns its markup into component definitions, simple data structures describing a component.
 * When the engine renders these definitions, it turns them into React components.
 *
 * Components (like other concepts within the XMLUI framework) use properties and event handlers to do
 * their job; thus, this interface extends `ObjectWithProps<T>`.
 *
 * We will refactor component script handling in the future and consider removing the `uses` property.
 */
export interface ComponentDef<T extends string = string> extends Scriptable {
  // The type discriminator field of the component; it defines the unique ID of the component type.
  type: T;

  // Unique identifier of a component-like object
  uid?: string;

  // An optional identifier we use for e2e tests; it does not influence the rendering of a component.
  testId?: string;

  // Component properties
  props?: Record<string, any>;

  // Component events
  events?: Record<string, any>;

  /**
   * Though components manage their state internally, the app logic may require user state management.
   * Components may have user *variables*, which the UI logic uses to manage the application state.
   * This property holds the variables (name and value pairs) associated with this component definition.
   */
  vars?: Record<string, any>;

  /**
   * Each component may have child components to constitute a hierarchy of components. This property
   * holds the definition of these nested children.
   */
  children?: ComponentDef[];


  /**
   * Components may have slots that can be filled with other components. This property holds the 
   * contents of the slots
   */
  slots?: Record<string, ComponentDef[]>;

  /**
   * This property is evaluated to a Boolean value during run time. When this value is `true`, the
   * component with its children chain is rendered; otherwise, the entire component hierarchy is omitted
   * from the rendered tree.
   */
  when?: string | boolean;

  /**
   * Some components work with data obtained asynchronously. Fetching this data requires some state
   * management handling the complexity (including error handling) of data access. A *loader* is
   * responsible for managing this logic. This property holds the loaders associated with this component
   * definition.
   */
  loaders?: ComponentDef[];

  /**
   * Components may have functions that are used to perform some logic. This property holds the functions
   * (name and function body) associated with this component definition.
   */
  functions?: Record<string, any>;

  /**
   * Components may have an API that other components can use to interact with them. This property holds
   * the API methods associated with this component definition.
   */
  api?: Record<string, any>;

  /**
   * Components may provide context variables that can be used to in expressions and event handlers
   * within the component.
   */
  contextVars?: Record<string, any>;

  /**
   * Components managing state through variables or loaders are wrapped with containers responsible
   * for this job. Just as components, containers form a hierarchy. While working with this hierarchy,
   * parent components may flow state values (key and value pairs) to their child containers. This
   * property holds the name of state values to flow down to the direct child containers.
   */
  uses?: string[];

  /**
   * Arbitrary debug information that can be attached to a component definition.
   * Current usage:
   * - `debug: { source: { start: number, end: number } }` Ther start and end positions of of the source
   *   belonging to the particular component definition.
   */
  debug?: Record<string, any>;
}

/**
 * XMLUI allows the creation of reusable components assembled from other XMLUI components (with markup).
 * This type represents such components. The name `CompoundComponent` refers to the assembled nature
 * of reusable components.
 */
export interface CompoundComponentDef extends Scriptable {
  /**
   * Each compound component must have a unique name. The markup uses this name to refer to the
   * particular compound component.
   */
  name: string;

  /**
   * Each compound component must have a single root component defining the component contents.
   */
  component: ComponentLike;

  /**
   * Compound components may provide an API that other components can use to interact with them. This
   * property holds the API methods associated with this compound component definition.
   */
  api?: Record<string, any>;

  /**
   * This property holds the variables (name and value pairs) associated with this compound component
   * definition.
   */
  vars?: Record<string, any>;

  /**
   * Arbitrary debug information that can be attached to a component definition.
   * Current usage:
   * - `debug: { source: { start: number, end: number } }` Ther start and end positions of of the source
   *   belonging to the particular component definition.
   */
  debug?: Record<string, any>;
}

/**
 * Sometimes, components and compound components can both be used
 */
export type ComponentLike = ComponentDef | CompoundComponentDef;

/**
 * Some components render their nested child components dynamically using the current context of
 * their parents. For example, reusable components (`CompoundComponentDef`) have a `Slot`
 * placeholder that marks the location where the children should be rendered. Other component types
 * (e.g., `ApiBoundComponent` and `ContainerComponent`) use this dynamic rendering, too.
 *
 * This interface represents this functionality.
 */
export interface DynamicChildComponentDef extends ComponentDef {
  /**
   * This property holds a function that can render a particular child or children into a specific
   * layout context.
   */
  renderChild: RenderChildFn;

  /**
   * This property holds the child component that should be rendered.
   */
  childToRender: ComponentDef;
}

/**
 * This interface holds the properties representing a scriptable component definition.
 */
interface Scriptable {
  /**
   * This property holds the text defined in all <script> sections attached to a component.
   */
  script?: string;

  /**
   * This property holds the parsed form of scripts stored in code-behind files.
   */
  scriptCollected?: CollectedDeclarations;

  /**
   * This property holds errors coming from parsing the code-behind scripts.
   */
  scriptError?: any;
}

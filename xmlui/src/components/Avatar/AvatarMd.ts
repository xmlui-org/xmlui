// =====================================================================================================================
// XMLUI Avatar component definition

import { IsValidFunction, PropertyValueType } from "@abstractions/ComponentDescriptorDefs";
import { CollectedDeclarations } from "@abstractions/scripting/ScriptingSourceTree";
import { desc } from "@components-core/descriptorHelper";
import { sizeNames } from "@components/abstractions";
import { DefaultThemeVars } from "@components/ViewComponentRegistryContext";

type ComponentFieldMetadata = {
  // The markdown description to explain the property in the inspector view
  readonly description: string;
};

type ComponentPropertyMetadata = ComponentFieldMetadata & {
  // The markdown description to explain the property in the inspector view
  readonly description: string;

  // The value type of the property
  readonly valueType?: PropertyValueType;

  // What are the available values of this property?
  readonly availableValues?: any[];

  // The default property value (if there is any)
  defaultValue?: any;

  // The function that tests if the current property value is valid
  isValid?: IsValidFunction<any>;
};

type ComponentEventMetadata = ComponentFieldMetadata;

type ComponentContextVarMetadata = ComponentFieldMetadata;

type ComponentApiMetadata = ComponentFieldMetadata;

type PM = ComponentPropertyMetadata;

// =====================================================================================================================
// Experiment with types

export interface ComponentDefNew<TId extends string = string, TMd extends ComponentMetadata = ComponentMetadata>
  extends Scriptable {
  // The type discriminator field of the component; it defines the unique ID of the component type.
  type: TId;

  // Unique identifier of a component-like object
  uid?: string;

  // An optional identifier we use for e2e tests; it does not influence the rendering of a component.
  testId?: string;

  // Component properties
  props?: Record<keyof TMd["props"], string>;

  // Component events
  events?: Record<keyof TMd["events"], string>;

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
  children?: ComponentDefNew[];

  /**
   * Components may have slots that can be filled with other components. This property holds the
   * contents of the slots
   */
  slots?: Record<string, ComponentDefNew[]>;

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
  loaders?: ComponentDefNew[];

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

type ComponentMetadata<
  TProps = {},
  TEvents extends Record<string, ComponentEventMetadata> = {},
  TContextVars extends Record<string, ComponentContextVarMetadata> = {},
  TApis extends Record<string, ComponentApiMetadata> = {},
> = {
  props: TProps;
  events: TEvents;
  contextVars?: TContextVars;
  apis?: TApis;
  // Indicates that a particular component does not render any visual element on its own (Default: false)
  nonVisual?: boolean;

  opaque?: boolean;

  // List of theme variables available for the component
  themeVars?: Array<string>;

  // Theme variable default values for the "solid" theme
  defaultThemeVars?: DefaultThemeVars;

  // Theme variable defaults for a particular tone-specific theme
  toneSpecificThemeVars?: Record<string, Record<string, string>>;

  // Indicates that the component allows arbitrary props (not just the named ones)
  allowArbitraryProps?: boolean;
};

const AvatarProps = {
  size: <PM>{ description: "Size of the avatar (xs, sm, md, or lg)", availableValues: sizeNames },
  name: desc("Name to extract the first letters of words as avatar text"),
  url: desc("Url of the avatar image"),
};
const AvatarEvents: Record<string, ComponentEventMetadata> = {
  click: { description: "Triggers when the avatar is clicked" },
};
const NoContextVars: Record<string, ComponentContextVarMetadata> = {};
const NoApis: Record<string, ComponentApiMetadata> = {};

export const AvatarMetadataNew: ComponentMetadata<
  typeof AvatarProps,
  typeof AvatarEvents,
  typeof NoContextVars,
  typeof NoApis
> = {
  props: AvatarProps,
  events: AvatarEvents,
  defaultThemeVars: {
    "radius-Avatar": "4px",
    "thickness-border-Avatar": "0px",
    "style-border-Avatar": "solid",
    "border-Avatar": "$thickness-border-Avatar $style-border-Avatar $color-border-Avatar",
    "shadow-Avatar": "inset 0 0 0 1px rgba(4,32,69,0.1)",
    "color-text-Avatar": "$color-text-secondary",
    "font-weight-Avatar": "$font-weight-bold",
    light: {
      "color-bg-Avatar": "$color-surface-100",
      "color-border-Avatar": "$color-surface-400A80",
    },
    dark: {
      "color-bg-Avatar": "$color-surface-800",
      "color-border-Avatar": "$color-surface-700",
    },
  },
};

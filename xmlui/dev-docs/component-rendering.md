# Component Rendering

## How Native React Components Are Used

The framework cannot directly use native React components. They must be wrapped with a unique component that acts as a bridge between xmlui and React. 

### Bridge to React

This bridging is done with the help of a component renderer function:

```ts
type ComponentRendererFn<T extends ComponentDef> = (
  context: RendererContext<T>,
) => ReactNode;
```

This function gets an object, a `RendererContext` with properties and methods that provide the bridge, and returns a `ReactNode` representing the native React component to display. The renderer function can access the component's definition (its internal representation extracted from the markup), translate, and pass the component's properties to the native React component.

`ComponentRenderFn` has a type parameter. This parameter is used only for type safety. It is passed in the renderer function as the type parameter of the `context` parameter. Behind the scenes, using TypeScript's type-checking features, this type parameter allows the compiler to carry out strict type checks.

We never use a component renderer function directly. When defining the bridge, we apply the `createComponentRenderer` function, which has the following signature:

```ts
function createComponentRenderer<TMd extends ComponentMetadata>(
  type: string,
  metadata: TMd,
  renderer: ComponentRendererFn<ComponentDef<TMd>>,
): ComponentRendererDef
```

The function receives a unique name for the component (`type`), its metadata, and the renderer function. The return value is an object (`ComponentRenderDef`) that the engine's component registry can consume. 

Here is an example that prepares the `NoResult` xmlui component for the registry:

```ts
export const noResultComponentRenderer = createComponentRenderer(
  "NoResult",
  NoResultMd,
  ({ node, extractValue, layoutCss }) => {
    return (
      <NoResult
        label={extractValue.asDisplayText(node.props.label 
          || node.children || "No results found")}
        icon={node.props.icon}
        hideIcon={extractValue.asOptionalBoolean(node.props.hideIcon)}
        style={layoutCss}
      />
    );
  },
);
```

The first parameter is the component's unique name, which the registry uses to identify it. The second parameter represents the component's metadata (`NoResultMd`). This information is used for type-checking during compilation time and tooling purposes during run time (in development mode).

The `<NoResult>` tag is the native React component implementing the functionality. The renderer function (third parameter) utilizes the `node`, `extractValue`, and `layoutCss` properties of the rendering context to prepare the native React component to be returned.

Here is an example that shows how the `NoResult` component metadata (`NoResultMd`) is composed for passing it to `createComponentRenderer`:

```ts
const COMP = "NoResult";

export const NoResultMd = createMetadata({
  description:
    `\`${COMP}\` is a component that displays a visual indication that some data query (search) ` +
    `resulted in no (zero) items.`,
  props: {
    label: dLabel(),
    icon: d(`This property defines the icon to display with the component.`),
    hideIcon: d(`This boolean property indicates if the icon should be hidden.`),
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    [`padding-vertical-${COMP}`]: "$space-2",
    [`gap-icon-${COMP}`]: "$space-2",
    [`size-icon-${COMP}`]: "$space-8",
    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
});
```

Here, `createMetadata` is a simple helper function that considers its input as (partial) metadata and prepares it for the framework's use.

Creating a new xmlui component that can be used with the framework contains these steps:
1. Create a native React component as the backing for the xmlui component. This React component should implement the functionality of the xmlui component. You can use an existing React component (obtain it from a package).
2. Declare the component's metadata with `createMetadata`.
3. Declare the component renderer with `createComponentRenderer` and pass the component's unique ID and metadata to it.

### Component Metadata

Metadata is an indispensable part of component rendering. The bridge between the xmlui and the React domains cannot be created without this metadata information. Besides compile-time checks, metadata is used for several other purposes:
- Automated component documentation generation
- Markup compilation checks (is the markup correct?)
- Development tools may display component information

The framework defines this metadata in the following way:

```ts
type ComponentMetadata<
  TProps extends Record<string, ComponentPropertyMetadata> = Record<string, any>,
  TEvents extends Record<string, ComponentPropertyMetadata> = Record<string, any>,
  TContextValues extends Record<string, ComponentPropertyMetadata> = Record<string, any>,
  TApis extends Record<string, ComponentPropertyMetadata> = Record<string, any>,
> = {
  // --- Properties omitted for brevity, learn about them later
}
```

The `ComponentMetadata` generic type has four type parameters, which define the metadata sections unique for a particular component:
- `TProps`: The component's properties
- `TEvent`: The events the component supports with event handlers
- `TContextValues`: The collection of context values (such as `$item` for `List`) to be put into the documentation
- `TApis`: The exposed methods of a component that are available for calling through the component instance's identifier.

As the definition shows, each metadata section is a hash object collecting `ComponentPropertyMetadata` instances.

> This generic approach provides the TypeScript compiler with enough information for strict type-checking. For example, if the renderer function wants to use an unknown component property or event name, the compiler will mark that as an error.

`ComponentMetadata` has these properties (each is optional):

- `status`. This property describes the development status of a particular component. This property is used for documentation (we do not document immature components, as they are considered unsupported in production).
- `description`. This property provides a concise definition (purpose) of the component
- `shortDescription`. A shorter (one-short-line-on-the-screen) definition of the component for visual tools
- `props`:  The component's properties (`TProps` is inferred from this property)
- `events`: The supported event handlers (`TEvents` is inferred from this property)
- `contextVars`. The context values the component offers (`TContextValues` is inferred from this property)
- `apis`. The exposed methods the component offers to invoke through the component instance ID (`TApis` is inferred from this property)
- `nonVisual`. Indicates that a particular component does not render any visual element on its own (Default: `false`)
- `opaque`. If this property is set to `true,` the component does not render any React component (with a DOM node) on its own; only its children may.
- `themeVars`. This string list contains the theme variable names the property uses to establish its themeable appearance.
- `defaultThemeVars`. This hash object contains the default values of particular theme variables. The current definition enables the definition of tone-specific theme variables here, putting their hash objects into the `light` and `dark` properties.
- `toneSpecificThemeVars`. This hash object allows the definition of tone-specific theme variables separately from - `defaultThemeVars`. *This property seems to be ready for removal.*
- `allowArbitraryProps`. When this property is set to true, the component markup should accept *any* property names, even if some of them are not used.
- `specializedFrom`. If the component is specialized from another (such as `VStack` is a specialization of `Stack`), this property holds the name of the parent component. This value is used only for document generation purposes.
- `docFolder`. This property is used for document generation. If a component's additional (non-metadata-described) documentation is not within the folder matching the component's ID, this property defines the appropriate folder.

### Property Metadata

The sections of `ComponentMetadata` (properties, events, context values, and APIs) all are hash objects with a value of `ComponentPropertyMetadata`:

```ts
type ComponentPropertyMetadata = {
  readonly description: string;
  readonly valueType?: PropertyValueType;
  readonly availableValues?: readonly PropertyValueDescription[];
  defaultValue?: any;
  isValid?: IsValidFunction<any>;
  isInternal?: boolean;
}
```

This type declares these properties:

- `description`. It defines the description explaining the property. You can use markdown, as the UI may display this value.
- `valueType`. The type of the particular property (`"boolean"`, `"string"`, `"number"`, `"any"` (default), or `"ComponentDef"`). `"ComponentDef"` indicates that the property values is a component definition (for example, it is used as a component template property).
- `availableValues`. This optional property lists any valid values the property may have. It will be used for markup validation in the future.
- `defaultValue`. The component's default value. It is used only for document generation.
- `isValid`. This optional property holds a function that can validate the property value.
- `isInternal`. This property's `true` value indicates that this should be omitted from the generated component documentation.

The framework provides several helper functions to describe component properties, such as the `d()` and `dLabel()` in the metadata declaration of `NoResult`:

```ts
export const NoResultMd = createMetadata({
  description:
    `\`${COMP}\` is a component that displays a visual indication that some data query (search) ` +
    `resulted in no (zero) items.`,
  props: {
    label: dLabel(),
    icon: d(`This property defines the icon to display with the component.`),
    hideIcon: d(`This boolean property indicates if the icon should be hidden.`),
  },
  // ...
});
```

The `metadata-helpers.ts` file contains many helper functions for describing property metadata. Using them allows for consistency in the property metadata definition.




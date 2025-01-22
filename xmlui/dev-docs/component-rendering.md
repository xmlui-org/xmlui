# Component Rendering

You can use xmlui in two ways:

- You create a standalone app (the entire app is created with xmlui)
- You inject an xmlui-based partial view into an existing web page.
  Independently of which method to use, the rendering engine starts its job when the browser is about to render the [`AppRoot`](./AppRoot.md) react component.

`AppRoot` is a gateway between the xmlui domain (where an app's internal representation comes from markup and code-behind files) and the React domain (where an app works with React components). It expects the app's internal representation as its input (along with several other optional properties). Internally, it invokes the `renderRoot()` function passing the app definition. You can consider `renderRoot()` as the entry point to the rendering engine.

## How Native React Components Are Used

The framework cannot directly use native React components. They must be wrapped with a unique component that acts as a bridge between xmlui and React.

### Bridge to React

This bridging is done with the help of a component renderer function:

```ts
type ComponentRendererFn<T extends ComponentDef> = (context: RendererContext<T>) => ReactNode;
```

This function gets an object, a `RendererContext` with properties and methods that provide the bridge, and returns a `ReactNode` representing the native React component to display. The renderer function can access the component's definition (its internal representation extracted from the markup), translate, and pass the component's properties to the native React component.

`ComponentRenderFn` has a type parameter. This parameter is used only for type safety. It is passed in the renderer function as the type parameter of the `context` parameter. Behind the scenes, using TypeScript's type-checking features, this type parameter allows the compiler to carry out strict type checks.

We never use a component renderer function directly. When defining the bridge, we apply the `createComponentRenderer` function, which has the following signature:

```ts
function createComponentRenderer<TMd extends ComponentMetadata>(
  type: string,
  metadata: TMd,
  renderer: ComponentRendererFn<ComponentDef<TMd>>,
): ComponentRendererDef;
```

The function receives a unique name for the component (`type`), its metadata, and the renderer function. The return value is an object (`ComponentRenderDef`) that the engine's component registry stores.

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

Here, `createMetadata` is a helper function that considers its input as (partial) metadata and prepares it for the framework's use.

Without creating the renderer function and the metadata, no xmlui component could work. Thus, creating a new xmlui component that can be used with the framework contains these steps so that the bridge between the xmlui and the React domains can be established:

1. Create a native React component as the backing for the xmlui component. This React component should implement the functionality of the xmlui component. You can use an existing React component (obtain it from a package).
2. Declare the component's metadata with `createMetadata`.
3. Declare the component renderer with `createComponentRenderer` and pass the component's unique ID and metadata to it.

### Component Metadata

Metadata is an indispensable part of component rendering. The bridge between the xmlui and the React domains required this information. Besides compile-time checks, metadata is used for several other purposes:

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
};
```

The `ComponentMetadata` generic type has four type parameters, which define the metadata sections unique for a particular component:

- `TProps`: The component's properties
- `TEvent`: The events the component supports with event handlers
- `TContextValues`: The collection of context values (such as `$item` for `List`) to be put into the documentation
- `TApis`: The exposed methods of a component that are available for calling through the component instance's identifier (such as `setValue` for form items).

As the definition shows, each metadata section is a hash object collecting `ComponentPropertyMetadata` instances.

> This generic approach provides the TypeScript compiler with enough information for strict type-checking. For example, if the renderer function wants to use an unknown component property or event name, the compiler will mark that as an error.

`ComponentMetadata` has these properties (each is optional):

- `status`. This property describes the development status of a particular component. This property is used for documentation (we do not document immature components, as they are considered unsupported in production).
- `description`. This property provides a concise definition (purpose) of the component
- `shortDescription`. A shorter (one-short-line-on-the-screen) definition of the component for visual tools
- `props`: The component's properties (`TProps` is inferred from this property)
- `events`: The supported event handlers (`TEvents` is inferred from this property)
- `contextVars`. The context values the component offers (`TContextValues` is inferred from this property)
- `apis`. The exposed methods the component offers to invoke through the component instance ID (`TApis` is inferred from this property)
- `nonVisual`. Indicates that a particular component does not render any visual element on its own (Default: `false`)
- `opaque`. If this property is set to `true,` the component does not render any React component (with a DOM node) on its own; only its children may.
- `themeVars`. This string list contains the theme variable names the property uses to establish its themeable appearance.
- `defaultThemeVars`. This hash object contains the default values of particular theme variables. The current definition enables the definition of tone-specific theme variables here, putting their hash objects into the `light` and `dark` properties.
- `toneSpecificThemeVars`. This hash object allows the definition of tone-specific theme variables separately from - `defaultThemeVars`. _This property seems to be ready for removal._
- `allowArbitraryProps`. When this property is set to true, the component markup should accept _any_ property names, even if some of them are not used.
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
};
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

## The Renderer Context

As discussed previously, a particular xmlui component registers its renderer function to create its corresponding native React component.

```ts
type ComponentRendererFn<T extends ComponentDef> = (context: RendererContext<T>) => ReactNode;
```

The renderer function accepts a `RendererContext` object with the data the function may need to create the native React component:

```ts
interface RendererContext<TMd extends ComponentMetadata> extends ComponentRendererContextBase<TMd> {
  // --- Properties omitted for brevity, learn about them later
}
```

### Renderer Context Definitions

The engine utilizes several renderer contexts, `RendererContext` being just one of them, tuned to create the bridge between xmlui and React components. Its core definition, `ComponentRendererContextBase`, contains these properties:

- `node`. This property holds the component's definition (internal representation) to render.
- `state`. This hash object represents the state of the container in which the component is being rendered.
- `appContext`. Optional. This object injects a collection of global functions and properties (e.g., date and object processing utilities, information about the current theme and viewport, etc.) that the framework provides for the scripts running within the component.
- `renderChild`. A function the component can use to render its child components (recursively).
- `layoutContext`. Optional. This property contains an object with properties to query the current layout (in which the component is rendered) and an optional helper function that allows wrapping the already rendered children in a native React component. For example, the layout context can tell that child components are rendered in a horizontal stack, so their width should fit the content. They should fill the entire viewport width if rendered in a vertical stack.

`RendererContext` extends its base with these properties:

- `uid`. The unique identifier of the component instance. If the component defines an identifier (with the `id` attribute in its markup), that value; otherwise, the framework assigns a unique symbol to it.
- `updateState`. The component can use this function to update its state (with the reducer pattern) stored in the state container where it is rendered.
- `extractValue`. When a component wants to access a property value (which may contain a binding expression to evaluate), it must use this function to get the current value.
- `extractResource`. The components that want to use external resources (such as an image, icon, etc.) must use this function to obtain the particular resource. Resources may be theme-dependent; this function resolves them accordingly.
- `lookupEventHandler`. When a component responds to an event, this function creates that event handler. The function's return value can be assigned to a native React event handler.
- `registerComponentApi`. Components may expose an API that other components can use through the component instance ID. This function can register that API with the component.
- `lookupAction`. The framework has a concept of [actions](./glossary.md#action). This function looks up an action by its unique name within the framework's action registry.
- `lookupSyncCallback`. Some components may contain properties with callback functions (such as `rowDisabledPredicate` in a `Table`). This function creates a sync function from the current property value (e.g., transforming an arrow expression or a function declaration text to its internal representation). This function can be safely called back from a native React component.
- `layoutCss`. This property holds the component's [layout properties](./glossary.md#layout-properties), which can be represented in a `React.CSSProperties` object.
- `layoutNonCss`: Some component layout properties, such as `orientation,` cannot have an unambiguous CSS style pair. These properties are collected into a hash object with their values and put into `layoutNonCss`.

The engine uses another rendering context for its internal operation:

```ts
interface InnerRendererContext<T extends ComponentMetadata = ComponentMetadata>
  extends ComponentRendererContextBase<T> {
  // --- Properties omitted for brevity, learn about them later
}
```

`InnerRendererContext` adds extra properties to `ComponentRendererContextBase`:

- `dispatch`. This function is a dispatcher that changes the state of a particular container following the redux style by dispatching a state-changing action.
- `registerComponentApi`. Components may expose an API that other components can use through the component instance ID. This function can register that API with the internal ID of the component instance.
- `lookupSyncCallback`. This function creates a sync callback function from the current property value using the internal ID of the component instance.
- `lookupAction`. This function looks up an action by its unique name within the component node using the action.
- `memoedVarsRef`. This property refers to the map of the memoized variables available within the component being rendered.
- `parentRenderContext`. This property accepts the context of the current component's parent (e.g., the parent component's properties, the definition of its children, and the function that renders the children). The component may use this information for its rendering purposes.
- `uiIdInfoRef`. Components working with data instantiate some internal components (so-called loaders) to manage data fetching asynchronously. This property is a reference to the map holding the loaders already instantiated. The engine uses this map to avoid duplicated loaders.

When rendering a particular child component, the engine uses a rendering context with some extra properties:

```ts
interface ChildRendererContext extends InnerRendererContext {
  // --- Properties omitted for brevity, learn about them later
}
```

`ChildRendererContext` adds extra properties to `InnerRendererContext`:

- `stateFieldPartChanged`. This state stored in a container can be a compound object (arrays, hash objects, and their combinations). With this function, a child component can sign that a part of this state object (or the entire object) has changed.
- `cleanup`. This method can be called when the rendered React component is unmounted for optional cleanup activities.

## The Rendering Flow

As you learned, the rendering engine's entry point is the `renderRoot()` function. When `AppRoot` invokes this function, it ensures that the app's root is wrapped with a top-level state container representing the app state.

`renderRoot()` invokes the `renderChild()` function, which expects a `RenderChildContext` argument. `renderChild()` is the rendering engine's jolly-joker function; it implements all the nitty-gritty details that make the engine so powerful.

When `renderRoot()` calls `renderChild(),` the context it passes contains the app's definition and all others with their default (empty or no-op) values.

### The `renderChild` function

This function checks the component definition for special arrangements that come from these rendering engine features:

**1. Rendering a `Slot`**

The `Slot` component is a placeholder within a compound component and marks the place where the children should be transposed from their client. Assume we have this compound component:

```xml
<Component name="MyComponent">
  <VStack backgroundColor="red" color="white">
    <Slot />
  </VStack>
</Component>
```

Let's use this component from the app like this:

```xml
<App var.myValue="42">
  <MyComponent>The truth is {myValue}</MyComponent>
</App>
```

When the engine renders `MyComponent`, its `Slot` should be replaced with the rendered value of `The truth is {myValue}`. However, at that moment, the expression is in the context of `MyComponent` where `myValue` has no meaning; it was declared in the parent's context.

So, whenever a `Slot` is rendered, its content must be rendered in the context of the parent (where the slot's content comes from).

**2. Rendering text nodes**

When the markup contains text within an opening and closing tag, like here, during the markup parsing and transformation phase, it is wrapped into a `TextNode` virtual component:

Source markup:

```xml
<Stack>
  Hello, my name is {myName}
  <Icon name="arrowright">
</Stack>
```

Transformed markup:

```xml
<Stack>
  <TextNode>Hello, my name is {myName}<TextNode>
  <Icon name="arrowright">
</Stack>
```

`TextNode` is virtual; this name does not have an xmlui component. The rendering engine automatically renders the appropriate text for this node.

Besides `TextNode`, `TextNodeCData` (from a CDATA node in the markup) is also a virtual component with the same behavior.

Due to these rendering engine features (special handling of `Slot`, `TextNode`, and `TextNodeCData` ), `renderChild` differentiates the following cases:

1. The component is a `Slot` with a single `TextNode` or `TextNodeCData`. The rendered output is a text evaluated in the parent context.
2. The component is a `TextNodeCData`. The output is the component value without any change (the purpose of CDATA is to preserve each character as it is).
3. The component is a `TextNode`. The output is the text evaluated in the current rendering context.
4. In other cases, `renderChild` returns a `ComponentNode` React component.

### `ComponentNode`

This React component's primary responsibility is to prepare a particular component for use in the XMLUI environment. It connects the component with the engine's state management and data handling operations.

The only usage of `ComponentNode` is in `renderChild`, which passes a `key` and a `resolvedKey` property to `ComponentNode`:

- `key`: This property is the traditional `key` property of React, used to distinguish individual component items within a list (React optimizes the DOM updates with this property's help).
- `resolvedKey`: This internal property allows debugging containers (within the rendering engine development). It comprises the IDs of components in the current container chain and may generate console log messages.

`ComponentNode` is implemented with React's `forwardRef`. The native implementations of xmlui components use third-party component libraries, which heavily build on React component references, as they need to manipulate the shadow DOM (radix ui, animations, etc):

```ts
const ComponentNode = memo(
  forwardRef(function ComponentNode(
    {
      // --- Omitted for simplicity
      ...rest
    }: ChildRendererContext & { resolvedKey: string },
    ref,
  ) {
    // --- Implemetation omitted
  }),
);
```

`ComponentNode` examines the definition of the component to check if there are some chores to do; it may transform the original representation. The engine executes these steps:

1. It extends the component definition with all bells and whistles required by handling data, provided the component or its children utilize any data-related operation. This process is described in detail [here](./data-sources.md).
2. If the particular component (after the previous step) requires a container (state management) for its (and children's) rendering, the engine wraps it into a container using the `ComponentContainer` React component. You can read more about state management with containers [here](./state-management.md).
3. Otherwise, the component does not need its separate container (and so it will use a container up to its parent chain); the engine wraps it into a `ComponentBed` React component.

### `ComponentBed`

This component receives a modified rendering context (derived from `InnerRendererContext`), including the component definition already prepared for state and data management. **`ComponentBed` is the little cog that translates xmlui concepts to their corresponding React concepts and assembles a rendering context to pass to `renderChild`.**

- `ComponentBed` memoizes the helper values and functions it uses for rendering; it uses the `useMemo`, `useCallback`, and custom hooks with a similar approach heavily. 
- If the component does not have an explicit identifier (in the `id` attribute of the component markup), `ComponentBed` creates a JavaScript [Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) as the ID.
- `ComponentBed` ensures the optional callback function passed via `onUnmount` is invoked when the component instance is dismounted. The state container uses this functionality to remove the state of a particular component instance when it has been disposed of.

The following list details how the particular properties of the renderer context are prepared:

- `uid`: The component instance identifier (either explicitly set or generated by `ComponentBed`).
- `node`: The component definition is fixed. It is replaced with stable references to an empty object if it does not have properties or events. This action avoids continuous tests against the `undefined` value for the `props` and `events` component definition values.
- `id`: The explicit component id if the component markup declares it, or the one generated by `ComponentBed`.
- `updateState`: Changes in the component instance's state occur by invoking a state updater function. `ComponentBed` uses the `dispatch` function received in its rendering context parameter to change the state via a `componentStateChanged` action. Learn more about it [here](./state-management.md#updating-component-state).
- `appContext`: `ComponentBed` forwards the `appContext` instance received.
- `extractValue`: When resolving component properties, the engine may need to [evaluate expressions](./expression-evaluation.md). `ComponentBed prepares a value extractor function to carry out this evaluation.
- `lookupAction`: Some internal actions associated with the component (for example, fetching or modifying data) are described with xmlui scripts, which must be converted into an asynchronously invokable function. `ComponentBed` prepares a function that can retrieve an invokable function from a particular named action. 
- `lookupSyncCallback`: Components may contain properties that describe callback functions. For example, a `Table` can define a predicate (`rowDisabledPredicate`) to sign whether a particular row should be displayed as disabled. Such predicates are defined as expressions and are processed synchronously. `ComponentBed` prepares a function that can turn a script into a synchronously invokable function.
- `lookupEventHandler`: Event handlers are also transformed into asynchronously invokable functions (like in `lookupSyncCallback`). They are bound to a particular event and have some extra internal administration compared to actions. `ComponentBed prepares a function to transform the script of a particular event handler.
- `extractResourceUrl`: `ComponentBed` uses the current theme context to obtain the function that resolves a logical URL to a physical URL. The logical URL can be an expression evaluated before the resolution.
- `renderChild`: `ComponentBed` creates a wrapped version of the `renderChild` received in its input. This version would replace an undefined parent rendering context with the current component instance's parent renderer context.
- `registerComponentApi`: `ComponentBed` ensures that the (either explicitly set or generated) component instance ID is passed to the `registerComponentApi` function received in the input renderer context.
- `layoutCss`: It compiles the layout properties representable as CSS style properties into an object to pass into any React component's `style` property.
- `layoutNonCss`: It compiles the layout properties not representable as CSS style properties (such as `orientation`) into an object (`NonCssLayoutProps`) that React components can further process to create CSS properties.
- `layoutContext`: `ComponentBed` passes the layout context instance it receives. As the input parameter is a `MutableRefObject`, all children within a particular parent may receive the same layout context instance.

Besides translating the xmlui domain concepts into React concepts, `ComponentBed` preprocesses the component passed for rendering:

1. If that is an API-bound component, `ComponentBed` delegates the rendering to an `ApiBoundComponent` React component. As of this writing, the following components are API-bound (this list may expand in future xmlui releases):
  - `DataSource`
  - `DataSourceRef`
  - `APICall`
  - `FileDownload`
  - `FileUpload`
2. If the current component is a `Slot` instance, `ComponentBed` translates it to a `SlotItem` React component, ensuring that the children transposed from the parent (they replace `Slot`) use the parent's rendering context for expression evaluation. Learn more about this process [here](reusable-components.md).
3. If the particular component is not in the xmlui component registry, `ComponentBed` renders an `UnknownComponent` instance and skips processing the children.
4. The rendering engine can run in unique modes (for development or tooling purposes). In these modes, 
  - `ComponentBed` may decorate the shadow DOM of the rendered component instance with attributes and carry out special actions when the component has been mounted.
  - In end-to-end testing mode (used during development), the component nodes may be decorated with a `data-testid` attribute to let the E2E test find the DOM node belonging to the rendered component.
  - In inspection mode (used for tooling purposes), `ComponentBed` may decorate the corresponding DOM element with the `data-inspectId` attribute. Modal dialogs may be modified to allow the inspection to display its own modal dialog (e.g., with the source code of the inspected component).
  - `ComponentBed` uses the `ComponentDecorator` React component to help with these transforms.

After all these preparations and transformations, `ComponentBed` invokes the rendering function (`renderChild` with the appropriate rendering context).

Should the rendering raise an error, `ComponentBed` will retrieve an `InvalidComponent` instance to display the particular error.

## Rendering Summary

These are the types, functions, virtual xmlui and React components that undertake responsibility for translating an xmlui component (and its children) into a hierarchy of React components:

| React Component | Category | Responsibility |
|-|-|-| 
| `ApiBoundComponent` | React component | ... |
| `APICall` | Virtual component | ... |
| `AppRoot` | Reac component | ... |
| `ChildRendererContext` | Types | ... |
| `ComponentBed` | React component| Translates xmlui concepts to their corresponding React concepts and assembles a rendering context to pass to `renderChild` |
| `ComponentDecorator` | React component | ... |
| `ComponentNode` | React component | This React component's primary responsibility is to prepare a particular component for use in the XMLUI environment. It connects the component with the engine's state management and data handling operations. |
| `ComponentMetadata` | Type | ... |
| `ComponentPropertyMetadata` | Types | ... |
| `ComponentRenderDef` | Type | ... |
| `ComponentRendererContextBase` | Type | ... |
| `ComponentRendererFn` | Type | ... |
| `createComponentRenderer()` | Function | ... |
| `createMetadata()` | Function | ... |
| `DataSource` | Virtual component | ... |
| `DataSourceRef` | Virtual component | ... |
| `FileDownload` | Virtual component | ... |
| `FileUpload` | Virtual component | ... |
| `InnerRendererContext` | Type | ... |
| `InvalidComponent` | React component | ... |
| `renderChild()` | Function | ... |
| `RendererContext` | Type | ... |
| `renderRoot()` | Function | ... |
| `Slot` | Virtual component | ... |
| `SlotItem` | React component | ... |
| `TextNode` | Virtual component | Translates a text node in the xmlui markup into a string representing the text. |
| `TextNodeCData` | Virtual component | Translates a CDATA node in the xmlui markup into a string representing the text (preserving all source text characters). |
| `UnknownComponent` | type | ... |
# Component Rendering

Read this article to get acquainted with the rendering flow. When you go through, you will understand the pivotal concepts of the xmlui rendering engine and identify the primary components responsible for them.

You can use xmlui in two ways:

- You create a standalone app (the entire app is created with xmlui)
- You inject an xmlui-based partial view into an existing web page.
  
Independently of which method to use, the rendering engine starts its job when the browser is about to render the [`AppRoot`](./AppRoot.md) react component.

`AppRoot` is a gateway between the xmlui domain (where an app's internal representation comes from markup and code-behind files) and the React domain (where an app works with React components). It expects the app's internal representation as input (along with several other optional properties). Internally, it invokes the `renderChild()` function passing the app definition. You can consider `renderChild()` as the entry point to the rendering engine.

## How Native React Components Are Used

The framework cannot directly use native React components. They must be wrapped with a unique component that acts as a bridge between xmlui and React.

### Bridge to React

This bridging is done with the help of a component renderer function:

```ts
type ComponentRendererFn<T extends ComponentDef> = (context: RendererContext<T>) => ReactNode;
```

This function gets an object, a `RendererContext` with properties and methods that provide the bridge, and returns a `ReactNode` representing the native React component to display. The renderer function can access the component's definition (its internal representation extracted from the markup), translate, and pass the component's properties to the native React component.

`ComponentRenderFn` has a type parameter. This parameter is used only for type safety. It is passed in the renderer function as the type parameter of the `context` parameter. Behind the scenes, using TypeScript's type-checking features, this type parameter allows the compiler to carry out strict type checks.

We never use a component renderer function directly. When defining the bridge, we apply the `createComponentRenderer` helper function, which has the following signature:

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
    [`paddingVertical-${COMP}`]: "$space-2",
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

> Note: Instead of creating a native React component in Step 1, you can create a `CompoundComponent` using xmlui markup. Nonetheless, you should harness it with metadata and create a renderer function. For now, just ignore this alternative.

### Component Metadata

Metadata is an indispensable part of component rendering. The bridge between the xmlui and the React domains requires this information. Besides compile-time checks, metadata is used for several other purposes:

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

| Property | Description |
|-|-|
| `status` | This property describes the development status of a particular component and is used for documentation (we do not document immature components, as they are considered unsupported in production). |
| `description` | This property provides a concise definition (purpose) of the component. |
| `shortDescription` | A shorter (one-short-line-on-the-screen) definition of the component for visual tools. |
| `props` | The component's properties (`TProps` is inferred from this property). |
| `events` | The supported event handlers (`TEvents` is inferred from this property). |
| `contextVars` | The context values the component offers (`TContextValues` is inferred from this property). |
| `apis` | The exposed methods the component offers to invoke through the component instance ID (`TApis` is inferred from this property). |
| `nonVisual` | Indicates that a particular component does not render any visual element on its own (Default: `false`) |
| `opaque` | If this property is set to `true,` the component does not render any React component (with a DOM node) on its own; only its children may. |
| `themeVars` | This string list contains the theme variable names the property uses to establish its themeable appearance. |
| `defaultThemeVars` | This hash object contains the default values of particular theme variables. The current definition enables the definition of tone-specific theme variables here, putting their hash objects into the `light` and `dark` properties. |
| `toneSpecificThemeVars` | This hash object allows the definition of tone-specific theme variables separately from `defaultThemeVars`. (_This property seems to be ready for removal._)
| `allowArbitraryProps` | When this property is set to true, the component markup should accept _any_ property names, even if some of them are not used. |
| `specializedFrom` | If the component is specialized from another (such as `VStack` is a specialization of `Stack`), this property holds the name of the parent component. This value is used only for document generation purposes |
| `docFolder` | This property is used for document generation. If a component's additional (non-metadata-described) documentation is not within the folder matching the component's ID, this property defines the appropriate folder. |

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

| Property | Description |
|-|-|
| `description` | It defines the description explaining the property. You can use markdown, as the UI may display this value. |
| `valueType` | The type of the particular property (`"boolean"`, `"string"`, `"number"`, `"any"` (default), or `"ComponentDef"`). `"ComponentDef"` indicates that the property values is a component definition (for example, it is used as a component template property). |
| `availableValues` | This optional property lists any valid values the property may have. It will be used for markup validation in the future. |
| `defaultValue` | The component's default value. It is used only for document generation. |
| `isValid` | This optional property holds a function that can validate the property value. |
| `isInternal` | This property's `true` value indicates that this should be omitted from the generated component documentation. |

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

A renderer context is an object that holds data structures (such as a component's internal representation, the CSS properties collected from the markup, and others) and helper methods the renderer function can use to implement the component.

### Renderer Context Definitions

The engine utilizes two renderer contexts:

1. The rendered function accepts a `RendererContext` instance. The engine uses this object to render an xmlui component.
2. The `renderChild()` function accepts a `ChildRendererContext` instance. This type has some extra members to `RendererContext`.

The following figure shows the hierarchy of these renderer contexts:

```
ComponentRendererContextBase
  ├─ RendererContext (used by the renderer function of xmlui components)
  └─ InnerRendererContext
      └─ ChildRendererContext (used by renderChild)
```

`ComponentRendererContextBase` contains these properties:

| Property | Description |
|-|-|
| `node` | This property holds the component's definition (internal representation) to render. |
| `state` | This hash object represents the state of the container in which the component is being rendered. |
| `appContext` | Optional. This object injects a collection of global functions and properties (e.g., date and object processing utilities, information about the current theme and viewport, etc.) that the framework provides for the scripts running within the component. |
| `renderChild` | A function the component can use to render its child components (recursively). |
| `layoutContext` | Optional. This property contains an object with properties to query the current layout (in which the component is rendered) and an optional helper function that allows wrapping the already rendered children in a native React component. For example, the layout context can tell that child components are rendered in a horizontal stack, so their width should fit the content. They should fill the entire viewport width if rendered in a vertical stack. |

`RendererContext` extends its base with these properties:

| Property | Description |
|-|-|
| `uid` | The engine assigns a unique identifier to each component instance using a JavaScript [`Symbol`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol). If the component has an `id` markup attribute, the engine uses that value as the Symbol's `description` value. |
| `updateState` | The component can use this function to update its state (with the reducer pattern) stored in the state container where it is rendered. |
| `extractValue` | When a component wants to access a property value (which may contain a binding expression to evaluate), it must use this function to get the current value. |
| `extractResource` | The components that want to use external resources (such as an image, icon, etc.) must use this function to obtain the particular resource. Resources may be theme-dependent; this function resolves them accordingly. |
| `lookupEventHandler` | When a component responds to an event, this function creates that event handler. The function's return value can be assigned to a native React event handler. |
| `registerComponentApi` | Components may expose an API that other components can use through the component instance ID. This function can register that API with the component. |
| `lookupAction` | The framework has a concept of [actions](./glossary.md#action). This function looks up an action by its unique name within the framework's action registry. |
| `lookupSyncCallback` | Some components may contain properties with callback functions (such as `rowDisabledPredicate` in a `Table`). This function creates a sync function from the current property value (e.g., transforming an arrow expression or a function declaration text to its internal representation). This function can be safely called back from a native React component. |
| `layoutCss` | This property holds the component's [layout properties](./glossary.md#layout-properties), which can be represented in a `React.CSSProperties` object. |
| `layoutNonCss` | Some component layout properties, such as `orientation,` cannot have an unambiguous CSS style pair. These properties are collected into a hash object with their values and put into `layoutNonCss`. |

While the `renderChild()` function uses `RendererContext,` the engine uses other rendering contexts for its internal operation for the React components surrounding the xmlui components.

`InnerRendererContext` adds these extra properties to `ComponentRendererContextBase`:

| Property | Description |
|-|-|
| `dispatch` | This function is a dispatcher that changes the state of a particular container following the redux style by dispatching a state-changing action. |
| `registerComponentApi` | Components may expose an API that other components can use through the component instance ID. This function can register that API with the internal ID of the component instance. |
| `lookupSyncCallback` | This function creates a sync callback function from the current property value using the internal ID of the component instance. |
| `lookupAction` | This function looks up an action by its unique name within the component node using the action. |
| `memoedVarsRef` | This property refers to the map of the memoized variables available within the component being rendered. |
| `parentRenderContext` | This property accepts the context of the current component's parent (e.g., the parent component's properties, the definition of its children, and the function that renders the children). The component may use this information to transpose other components from the parent into a slot of a compound component. |
| `uidInfoRef` | Components working with data instantiate some internal components (so-called loaders) to manage data fetching asynchronously. This property is a reference to the map holding the loaders already instantiated. The engine uses this map to avoid duplicated loaders. |

`ChildRendererContext` adds extra properties to `InnerRendererContext`:

| `statePartChanged` | This state stored in a container can be a compound object (arrays, hash objects, and their combinations). With this function, a child component can sign that a part of this state object (or the entire object) has changed. |
| `cleanup` | This method can be called when the rendered React component is unmounted for optional cleanup activities. |

## The Rendering Flow

As you learned, the rendering engine's entry point is the `renderChild()` function. When `AppRoot` invokes this function, it passes a rendering context with the app's definition and all others with their default (empty or no-op) values. `AppRoot` ensures that the app's root is wrapped with a top-level state container representing the app state.


### The `renderChild` function

This function is the rendering engine's jolly-joker function; it implements all the nitty-gritty details that make the engine so powerful.

1. If the component is omitted from the visual tree (its `when` markup attribute results in a false-like value), renderChild returns with `null`, causing React to render nothing for the component.
2. If the component is `TextNodeCData`, it returns the text in the corresponding `CData` markup section preserving each character.
3. If the component is a `TextNode`, the function evaluates the node's text (replacing binding expressions with their values) and returns the evaluated result.
4. If the component is a `Slot`, `renderChild()` transposes the corresponding parent template (or the parent's children) into the context of `Slot` and renders them. This process involves several steps; you can find more details [here](./reusable-components.md).
5. In any other cases, `renderChild()` delegates rendering to a `ComponentWrapper` instance.

### `ComponentWrapper`

This React component's primary responsibility is to prepare a particular component for use in the XMLUI environment. It connects the component with the engine's state management and data handling operations and checks the components for implicit data operations (such as a `DataSource` or components having a `data` property, etc.). 

`ComponentWrapper` creates an internal loader for each data operation occurrence and initializes it accordingly. These loaders work separately, each knowing how to carry out its specific operation (and manage its state).

`renderChild()` passes the properties of its input renderer context along with the `key` and `resolvedKey` properties to `ComponentWrapper`:

- `key`: This property is the traditional `key` property of React, used to distinguish individual component items within a list (React optimizes the DOM updates with this property's help).
- `resolvedKey`: This internal property allows debugging containers (within the rendering engine development). It comprises the IDs of components in the current container chain and may generate console log messages.

`ComponentWrapper` is implemented with React's `forwardRef`. The native implementations of xmlui components use third-party component libraries, which heavily build on React component references, as they need to manipulate the shadow DOM (radix ui, animations, etc):

```ts
const ComponentWrapper = memo(
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

1. It extends the component definition with all bells and whistles required by handling data. This process is described in detail [here](./data-sources.md).
2. If the particular component (after the previous step) requires a container (state management) for its (and children's) rendering, the engine wraps it into a container using the `ComponentContainer` React component. You can read more about state management with containers [here](./state-management.md).
3. Otherwise, the component does not need its separate container (and so it will use a container up to its parent chain); the engine wraps it into a `ComponentAdapter` React component.

### `ComponentAdapter`

**`ComponentAdapter` is the little cog that translates xmlui domain concepts to their corresponding React domain concepts and assembles a rendering context to pass to `renderChild`.**

It receives a modified rendering context (derived from `InnerRendererContext`), including the component definition already prepared for state and data management. 

The component memoizes the helper values and functions it uses for rendering; it uses the `useMemo`, `useCallback`, and custom hooks with a similar approach heavily. It creates a JavaScript [Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) to use as the unique component instance identifier.

`ComponentAdapter` also ensures the optional callback function passed via `onUnmount` is invoked when the component instance is dismounted. The state container uses this functionality to remove the state of a particular component instance when it has been disposed of.

The following table details how the particular properties of the renderer context are prepared:

| Property | Description |
|-|-|
| `uid` | The component instance identifier (either explicitly set or generated by `ComponentBed`). |
| `node` | The component definition is fixed. It is replaced with stable references to an empty object if it does not have properties or events. This action avoids continuous tests against the `undefined` value for the `props` and `events` component definition values. |
| `id` | The explicit component id if the component markup declares it, or the one generated by `ComponentBed`. |
| `updateState` | Changes in the component instance's state occur by invoking a state updater function. `ComponentBed` uses the `dispatch` function received in its rendering context parameter to change the state via a `componentStateChanged` action. Learn more about it [here](./state-management.md#updating-component-state). |
| `appContext` | `ComponentBed` forwards the `appContext` instance received. |
| `extractValue` | When resolving component properties, the engine may need to [evaluate expressions](./expression-evaluation.md). `ComponentBed prepares a value extractor function to carry out this evaluation. |
| `lookupAction` | Some internal actions associated with the component (for example, fetching or modifying data) are described with xmlui scripts, which must be converted into an asynchronously invokable function. `ComponentBed` prepares a function that can retrieve an invokable function from a particular named action. |
| `lookupSyncCallback` | Components may contain properties that describe callback functions. For example, a `Table` can define a predicate (`rowDisabledPredicate`) to sign whether a particular row should be displayed as disabled. Such predicates are defined as expressions and are processed synchronously. `ComponentBed` prepares a function that can turn a script into a synchronously invokable function. |
| `lookupEventHandler` | Event handlers are also transformed into asynchronously invokable functions (like in `lookupSyncCallback`). They are bound to a particular event and have some extra internal administration compared to actions. `ComponentBed prepares a function to transform the script of a particular event handler. |
| `extractResourceUrl` | `ComponentBed` uses the current theme context to obtain the function that resolves a logical URL to a physical URL. The logical URL can be an expression evaluated before the resolution. |
| `renderChild` | `ComponentBed` creates a wrapped version of the `renderChild` received in its input. This version would replace an undefined parent rendering context with the current component instance's parent renderer context. |
| `registerComponentApi` | `ComponentBed` ensures that the (either explicitly set or generated) component instance ID is passed to the `registerComponentApi` function received in the input renderer context |
| `layoutCss` | It compiles the layout properties representable as CSS style properties into an object to pass into any React component's `style` property. |
| `layoutNonCss` | It compiles the layout properties not representable as CSS style properties (such as `orientation`) into an object (`NonCssLayoutProps`) that React components can further process to create CSS properties. |
| `layoutContext` | This property holds the layout context where the component should be rendered; for example, it tells the component is rendered in a horizontal stack. The component can execute its rendering strategy according to that context. As the input parameter is a `MutableRefObject`, all children within a particular parent may receive the same layout context instance. |

Besides translating the xmlui domain concepts into React concepts, `ComponentAdapter` preprocesses the component passed for rendering:

1. If that is an API-bound component, `ComponentAdapter` delegates the rendering to an `ApiBoundComponent` React component. As of this writing, the following components are API-bound (this list may expand in future xmlui releases):

- `DataSource`
- `DataSourceRef`
- `APICall`
- `FileDownload`
- `FileUpload`

2. If the current component is a `Slot` instance, `ComponentAdapter` translates it to a `SlotItem` React component, ensuring that the children transposed from the parent (they replace `Slot`) use the parent's rendering context for expression evaluation. Learn more about this process [here](reusable-components.md).
3. If the particular component is not in the xmlui component registry, `ComponentAdapter` renders an `UnknownComponent` instance and skips processing the children.
4. The rendering engine can run in unique modes (for development or tooling purposes). In these modes,
- `ComponentAdapter` may decorate the shadow DOM of the rendered component instance with attributes and carry out special actions when the component has been mounted.
- In end-to-end testing mode (used during development), the component nodes may be decorated with a `data-testid` attribute to let the E2E test find the DOM node belonging to the rendered component.
- In inspection mode (used for tooling purposes), `ComponentAdapter` may decorate the corresponding DOM element with the `data-inspectId` attribute. Modal dialogs may be modified to allow the inspection to display its own modal dialog (e.g., with the source code of the inspected component).
- `ComponentAdapter` uses the `ComponentDecorator` React component to help with these transforms.

After all these preparations and transformations, `ComponentAdapter` invokes the rendering function (`renderChild` with the appropriate rendering context).

Should the rendering raise an error, `ComponentAdapter` will retrieve an `InvalidComponent` instance to display the particular error.

## Rendering Summary

These are the types, functions, virtual xmlui and React components that undertake responsibility for translating an xmlui component (and its children) into a hierarchy of React components:

| React Component                | Category          | Responsibility                                                                                                                                                                                                  |
| ------------------------------ | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ApiBoundComponent`            | React component   | Binds API data to the component, ensuring the wrapped component is refreshed when the API-bound operation changes the component state.                                                                          |
| `APICall`                      | Virtual component | Handles the request-response protocol of an API call.                                                                                                                                                           |
| `AppRoot`                      | React component   | This component receives the internal representation of the app markup and code and executes the app accordingly.                                                                                                |
| `ChildRendererContext`         | Types             | Provides context for rendering child components.                                                                                                                                                                |
| `ComponentAdapter`                 | React component   | Translates xmlui concepts to their corresponding React concepts and assembles a rendering context to pass to `renderChild`.                                                                                     |
| `ComponentDecorator`           | React component   | Decorates the corresponding DOM element of a component with attributes used in development and tooling context.                                                                                                 |
| `ComponentMetadata`            | Type              | Defines metadata for components, including properties, events, context values, APIs, and theming (and others) for compile time and run time purposes.                                                           |
| `ComponentPropertyMetadata`    | Types             | Describes the metadata for individual component properties.                                                                                                                                                     |
| `ComponentRenderDef`           | Type              | Specifies the rendering definition for a component, including its metadata and rendering function.                                                                                                              |
| `ComponentRendererContextBase` | Type              | Provides the base context for rendering components.                                                                                                                                                             |
| `ComponentRendererFn`          | Type              | Defines the signature of the function that creates a React component according to its rendering context.                                                                                                        |
| `ComponentWrapper`                | React component   | This React component's primary responsibility is to prepare a particular component for use in the XMLUI environment. It connects the component with the engine's state management and data handling operations. |
| `createComponentRenderer()`    | Function          | Helper function to create a renderer for a component based on its metadata and render definition.                                                                                                               |
| `createMetadata()`             | Function          | Helper function to create component metadata.                                                                                                                                                                   |
| `DataSource`                   | Virtual component | Manages the request-response protocol for data fetching.                                                                                                                                                        |
| `DataSourceRef`                | Virtual component | Similar to `DataSource`, it ensures that string-returning data fetch operations do not fire data fetch again.                                                                                                   |
| `FileDownload`                 | Virtual component | Handles file download operations within the application.                                                                                                                                                        |
| `FileUpload`                   | Virtual component | Handles file upload operations within the application.                                                                                                                                                          |
| `InnerRendererContext`         | Type              | Provides an internally used context for rendering components.                                                                                                                                                   |
| `InvalidComponent`             | React component   | Renders an error-displaying UI for a component when the renderer raises an error.                                                                                                                               |
| `renderChild()`                | Function          | Renders a child component within the given context.                                                                                                                                                             |
| `RendererContext`              | Type              | Provides the context for rendering components (used by `renderChild()`).                                                                                                                                        |
| `Slot`                         | Virtual component | Defines a placeholder for dynamically rendered content.                                                                                                                                                         |
| `SlotItem`                     | React component   | Transposes component children into a slot within a custom component.                                                                                                                                            |
| `TextNode`                     | Virtual component | Translates a text node in the xmlui markup into a string representing the text.                                                                                                                                 |
| `TextNodeCData`                | Virtual component | Translates a CDATA node in the xmlui markup into a string representing the text (preserving all source text characters).                                                                                        |
| `UnknownComponent`             | Type              | Represents an unknown or unrecognized component type.                                                                                                                                                           |

## Implementation Details

Start with these functions and types to get acquainted with the implementation details:

- `AppRoot`
- `renderChild()` function
- `ComponentWrapper`
- `ComponentAdapter`

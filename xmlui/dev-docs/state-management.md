# State Management

> Managing a particular _xmlui app's state_ (regarding the app's functionality) differs from managing the _rendering engine's state_ though the app's state management leverages the engine's. This article discusses the latter.

## Containers

In xmlui, the rendering engine uses hierarchical containers to manage the app's rendering state. When this state changes, the state (and properties) of underlying React components change, triggering a UI refresh. 

The container hierarchy is bound to the markup hierarchy; several components in the markup are wrapped into a container.

> **Note**: When the engine runs, it does not work with the markup; it uses a pre-compiled internal representation structurally equivalent to the markup. This article mentions "markup" for simplicity, even if it means the internal representation.

Whenever the state of a particular component changes, it triggers the refresh of the associated UI, namely, the container-wrapped component and its entire child hierarchy. Thus, for example, if the topmost state container changes, the entire app's UI gets refreshed.

A container is a black box with the following traits:

- It stores the entire state of its wrapped markup (with the wrapped node and all of its children recursively).
- The state stored within the container is closed from its external context (an outermost container cannot directly see what's inside a nested container).
- The components within a particular container (the wrapped component and its whole child hierarchy) can see its entire state.
- Parent containers may (and do) flow down the public part of their state to their child containers.

### What in a Contaner Is Stored

The state in the container composes the following data:

- The reactive variables declared within the wrapped component
- The public state of xmlui components exposed explicitly for consumption by other components
- The exposed members of components (component API) 
- The state of _loader_ objects (each of which handles async data management for the components within the container)
- The state of event handlers associated with the components within the container

The container identifies each component in the container by an identifier using a JavaScript [`Symbol`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol).

If the component has an `id` markup attribute, it becomes the `description` property of the `Symbol`; otherwise, the engine creates a new (and unique) `Symbol` instance.

### When a Component Is Wrapped with a Container

The engine wraps only those components into containers that satisfy _any_ of these conditions:

- The component has at least one loader (it involves some data-management operation).
- It declares variables (at least one).
- The component uses context values for being used by its child components.
- It declares a script.
- The component explicitly declares a set of state variables to flow down to its child containers (see the `uses` property of `ComponentDef`). By default, containers do not apply this pattern; they flow down all state variables.

## Updating Component State

The rendering engine uses the [reducer pattern](https://react.dev/learn/extracting-state-logic-into-a-reducer) to change a particular state within the container. The state update mechanism uses the `produce` function of the `immer` package to create a new state from the previous one according to a particular action.

The `produce` function from the `immer` NPM package allows you to create immutable state updates in a mutable-like way. It takes the current state and a draft function, where you can modify the draft state directly. Immer then produces a new immutable state with those changes:

```ts
const nextState = produce(prevState, (draft) => {
  draft.someProperty = "new value";
});
```

Here, `prevState` is a `ContainerState` instance, `draft` is a function with the `ComntainerAction` signature:

```ts
type ContainerState = Record<string | symbol, any>;
interface ContainerAction {
  type: ContainerActionKind;
  // Potential improvement: Try to specify the type with more details
  payload: {
    uid?: any;
    data?: any;
    error?: any;
    value?: any;
    // --- Other properties omitted for
  };
}
```

### Reducer Actions

`ContainerActionKind` defines the set of strings that can be used as the action identifiers.

The rendering engine uses these actions to change the state within a container (action names are the constants storing the string ID of a specific action):

| Action | Description |
|-|-|
| `LOADER_IN_PROGRESS_CHANGED` | This action is applied when a loader has started fetching the data; it sets the `inProgress` property of the particular loader (for example, a `DataSource`) to `true`. |
| `LOADER_LOADED` | This action signs that the data fetch operation has been completed; the result is available. |
| `LOADER_ERROR` | The engine applies this action when the data fetching results in an error. |
| `EVENT_HANDLER_STARTED` | This action signs that the engine started running a particular event handler of a component. |
| `EVENT_HANDLER_COMPLETED` | When an event handler has been completed, the engine invokes this action. |
| `EVENT_HANDLER_ERROR` | If an event handler results in an error, this action signs that fact. |
| `COMPONENT_STATE_CHANGED` | React components may use their arbitrary state machine to manage a particular component's state. They use this action to update that state. |
| `STATE_PART_CHANGED` | This action is invoked when the execution engine detects a particular script changes something in the container state. With a clever mechanism, the engine detects variable and other state changes even when only a part of that state changes. For example, the engine observes updating an item in an array or changing an object's property.|

All the actions above except `STATE_PART_CHANGED` have a `uid` in their payload, which identifies the component affected by the action. The `STATE_PART_CHANGED` action receives a `path` payload property determining the state element to change.

### Partial State Change

When you examine the reducer function, all actions are implemented straightforwardly; you can follow them without any additional explanation. However, `STATE_PART_CHANGED` is more complicated. This action can be easier to understand through an example.

Here is an example demonstrating what the `STATE_PART_CHANGED` action does. Look at this markup:

```xml
<Button 
  var.some="{ {count: 0} }"
  onClick="() => some.count++">
  Click me: {some.count}
</Button>
```

When you click the button, it increments a single property within the `some` variable while keeping a stable reference to `some`.  The reducer receives the following action:

```json
{
  "type": "ContainerActionKind:STATE_PART_CHANGED",
  "payload": {
    "actionType": "set",
    "path": [ "some", "count" ],
    "target": { "count": 0 },
    "value": 1
  }
}
```

The `path` parameter is an array of chained properties to set the particular value within the container. The `some` part gets the entire object stored in that variable, and `count` is the property set to 1 (according to the payload's `value`).

The reducer function updates the `some` variable's `count` property in place just as the following JavaScript statement would do (without changing the reference to `some`):

```js
some.count = 1
```

As the reducer modifies the draft, `produce` returns with a new state instance. This instance is stored within a variable created with React's `useState`, so its change will trigger the re-rendering of the container's React component and eventually refresh the UI.

## Container Components

The engine leverages these React components to manage the engine's state:

| Component | Responsibility |
|-|-|
| `ContainerWrapper` | This component is the outermost wrapper of a containerized xmlui component. It surrounds an xmlui component with a special internal component (using the `"Container"` component type identifier). |
| `StateContainer` | This component keeps the state. Its primary responsibility is to prepare the initial state of the container, considering the parent container's state, variables, exposed component APIs, and scripts in the container children. |
| `Container` | This component wraps the container's children, having an error boundary between the state store and the components that trigger state changes. This way, the state's integrity is kept when components raise an error. |

These components are organized into the following hierarchy:

```xml
<ContainerWrapper>
  <ErrorBoundary>
    <StateContainer>
      <ErrorBoundary>
        <Container />
      </ErrorBoundary>
    </StateContainer>
  </ErrorBoundary>
</ContainerWrapper>
```

### `ContainerWrapper`

This component does a simple job. If the xmlui component to wrap is already a container (a component with the `"Component"` type identifier), it keeps it as is. Otherwise, it wraps that into a `"Container"`-typed xmlui component.

`ContainerWrapper` receives these properties from `ComponentWrapper` (the single React component instantiating a container):

| Property | Description |
|-|-|
| `resolvedKey` | Identifier information is received from `renderChild()` via `ComponentWrapper`. This key is helpful in debugging and tracking a particular container and its parent chain. |
| `node` | The xmlui component to be put into the container |
| `parentState` | The current state of the parent container |
| `parentStatePartChanged` | This function triggers a change in a variable's value or a property within the variable. |
| `parentRegisterComponentApi` | This function registers an exposed API endpoint for a component within the parent container. |
| `parentDispatch` | This function dispatches the specified action in the parent container to change that container's state. |
| `parentRenderContext` | This property accepts the context of the current component's parent (e.g., the parent component's properties, the definition of its children, and the function that renders the children). The component may use this information to transpose other components from the parent into a slot of a compound component. |
| `layoutContext` | This property holds the layout context where the component should be rendered; for example, it tells the component is rendered in a horizontal stack. The component can execute its rendering strategy according to that context. |
| `uidInfoRef` | Components working with data instantiate some internal components (so-called loaders) to manage data fetching asynchronously. This property is a reference to the map holding the loaders already instantiated. The engine uses this map to avoid duplicated loaders. |

`ContainerWrapper` passes these properties (except `node`) directly to `StateContainer`. It replaces `node` with its container-wrapped representation.

### `StateContainer`

This component keeps the current container state. It assembles the state from several pieces with this strategy:
- ...
- ...

### `Container`

_TBD_

## Ensuring UI Responsiveness

The rendering engine must make the UI responsive even if you run a costly operation, such as a long loop (or even an infinite one). Look at this markup:

```xml
<Button 
  var.count="{0}"
  onClick="() => { for (let i = 0; i < 10000; i++) count++; } ">
  Click me: {count}
</Button>
```



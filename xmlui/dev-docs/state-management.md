# State Management

> Managing a particular *xmlui app's state* (regarding the app's functionality) differs from managing the *rendering engine's state* though the app's state management leverages the engine's. This article discusses the latter.

## Containers

In xmlui, the rendering engine uses hierarchical containers to manage the app's rendering state and refresh the UI according to state changes. The container hierarchy is bound to the markup hierarchy; several components in the markup are wrapped into a container.

> **Note**: When the engine runs, it does not work with the markup; it uses a pre-compiled internal representation structurally equivalent to the markup. This article mentions "markup" for simplicity, even if it means the internal representation.

Whenever the state of a particular component changes, it triggers the refresh of the associated UI, namely, the container-wrapped component and its entire child hierarchy. Thus, for example, if the topmost state container changes, the entire app's UI gets refreshed.

A container is a black box with the following traits:
- It stores the entire state of its wrapped markup (with the wrapped node and all of its children recursively).
- The state stored within the container is closed from its external context (an outermost container cannot directly see what's inside a nested container).
- The components within a particular component can see the entire state.
- Parent containers may (and do) flow down the public part of their state to their child containers.

### What in a Contaner Is Stored

The state in the container composes the following data:
- The reactive variables declared within the wrapped component
- The state of *loader* objects (each of which handles async data management for the components within the container)
- The state of event handlers associated with the components within the container

The container identifies each component in the container by an identifier. This id comes from the `id` markup attribute of the component (if it is explicitly defined); otherwise, the engine uses a JavaScript [`Symbol`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) as the particular component's id.

### When a Component Is Wrapped with a Container

The engine wraps only those components into containers that satisfy *any* of these conditions:

- The component has at least one loader (it involves some data-management operation).
- It declares variables (at least one).
- The component uses context values for being used by its child components.
- It declares a script.
- The component explicitly declares a set of state variables to flow down to its child containers (see the `uses` property of `ComponentDef`). By default, containers do not apply this pattern; they flow down all state variables.

## Updating Component State

The rendering engine uses the [reducer pattern](https://react.dev/learn/extracting-state-logic-into-a-reducer) to change a particular state within the container. The state update mechanism uses the `produce` function of the `immer` package to create a new state from the previous one according to a particular action.

The `produce` function from the `immer` NPM package allows you to create immutable state updates in a mutable-like way. It takes the current state and a draft function, where you can modify the draft state directly. Immer then produces a new immutable state with those changes:

```ts
const nextState = produce(prevState, draft => {
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
| `STATE_PART_CHANGED` | This action is invoked when the execution engine detects a particular script changes something in the container state. With a clever mechanism, the engine detects variable and other state changes even when only a part of that state changes. For example, the engine observes updating an item in an array or changing an object's property. |



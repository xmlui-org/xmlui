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
| `node` | The xmlui component to be put into the container |
| `resolvedKey` | Identifier information is received from `renderChild()` via `ComponentWrapper`. This key is helpful in debugging and tracking a particular container and its parent chain. |
| `parentState` | The current state of the parent container |
| `parentStatePartChanged` | This function triggers a change in a variable's value or a property within the variable. |
| `parentRegisterComponentApi` | This function registers an exposed API endpoint for a component within the parent container. |
| `parentDispatch` | This function dispatches the specified action in the parent container to change that container's state. |
| `parentRenderContext` | This property accepts the context of the current component's parent (e.g., the parent component's properties, the definition of its children, and the function that renders the children). The component may use this information to transpose other components from the parent into a slot of a compound component. |
| `layoutContext` | This property holds the layout context where the component should be rendered; for example, it tells the component is rendered in a horizontal stack. The component can execute its rendering strategy according to that context. |
| `uidInfoRef` | Components working with data instantiate some internal components (so-called loaders) to manage data fetching asynchronously. This property is a reference to the map holding the loaders already instantiated. The engine uses this map to avoid duplicated loaders. |

`ContainerWrapper` passes these properties (except `node`) directly to `StateContainer`. It replaces `node` with its container-wrapped representation.

### `StateContainer`

This component keeps the current container state available to its children. This component keeps the current container state available to its children. It is instantiated in `ContainerWrapper` and has all properties of `ContainerWrapper`. Besides them, it also has an `isImplicit` boolean property, the `true` value indicating the rendering engine automatically wrapped a component into a container. 

This component keeps the current container state. It assembles the state from several pieces with this strategy:
- ...
- ...

### `Container`

This component does the lion's share of the work. It wraps the container's children with an error boundary between them and `StateContainer.` Even if the children raise an error, `StateContainer` keeps its state. `Container` manages the complex logic to execute event handler scripts while keeping the UI responsive.

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

When you click the button, a long loop starts, updating the `count` reactive variable ten thousand times. Though it seems simple, keeping the UI responsive while the event handler runs requires sophisticated techniques. These are the issues to solve:

- **Issue #1**. The event handler code runs in an interpreted way, which is hundreds of times slower than the native JavaScript code (but still fast enough). The UI must be able to process other events while the code runs.
- **Issue #2**. The value of the `count` variable is part of the state, and every modification invokes the reducer function to update the state. The state update is not instantaneous; eventually, it will happen and update the UI. However, non-instantaneous updates raise an issue: the next loop iteration (when it increments `count`) may still see the previous value of `count`.

The behavior and collaboration of `StateContainer` and `Container` are the key to cope with these issues.

### Memoized behavior

The `Container` and `StateContainer` are memoized components. Even if any of their parents is re-rendered, they are not, while their properties remain the same.

This trait is significant as it means `StateContainer` keeps the state without re-rendering until its rendering context (received from `ContainerWrapper`) remains unchanged. Also, `Container` is only re-rendered when the state stored in `StateContainer` has been changed.

### Resolving Issue #1

The `Container` runs all event handler code asynchronously. Every event handler started uses a separate logical thread. At the same time, multiple event handlers may run on their logical threads; `Container` does not limit them. 

At the end of every instruction in a particular event handler, `Container` awaits an asynchronous completion step: it collects all changes since the previously executed instruction and initiates the corresponding state updates. While this step is pending, the code execution of the particular event handler is suspended.

With an ingenious mechanism (you will learn about it soon), `Container` awaits (of course, asynchronously) while React completes the bundle of state updates, and `StateContainer` holds the modified state.



**Due to the async nature of this update at the end of each completed instruction, the JavaScript event loop has the opportunity to handle other events and, thus, keep the UI responsive.**

### Resolving Issue #2

The async code execution keeps the state of reactive variables in `StateContainer`. Suppose an instruction modifies a reactive variable (or only a part of it, such as an array item or an object property, even somewhere deep in the variable). In that case, the next instruction cannot continue until the modification is committed in the state.

`Container` has an ingenious mechanism to provide this trait:

- **Step 1**. It stores references (with `useRef`) to promises associated with completed event handler statements that cause state changes. Each statement has a unique ID, and Promises are mapped to the particular statement with this ID.
- **Step 2**. When the `version` state (created with `useState`) changes, all pending event handler statement promises are resolved.

When the event handler completes a statement, these steps ensure that the subsequent statement's execution awaits while the state changes are committed:

- **Step 3**. The reducer function (with the `STATE_PART_CHANGED` action) updates the changes. A single instruction may initiate multiple state changes (but only ); in this case, the reducer is invoked for all of them. The React engine schedules the updates for these changes.
- **Step 4**. `Container` adds a promise to the references mentioned in **Step 1**. This promise is mapped to the just completed statement.
- **Step 5**. `Container` uses the `setVersion` function passed by `StateContainer` to increment the state version.
- **Step 7**. `Container` awaits the promise created in **Step 4**. The previous steps (**Step 3 - Step5**) ran synchronously, so the JavaScript event loop had no opportunity to run the scheduled state updates. However, at this point, due to the awaiting, the event loop lets React carry out the updates. These set the new state (changes initiated in **Step 3**) and the new version (initiated in **Step 4**).
- **Step 8**. The state changes are committed in `StateContainer`, which propagates these changes to `Container`; so `Container` is re-rendered. As the `version` changes (**Step 2**), `Container` resolves the pending promises (including the one created in **Step 4**). 
- **Step 9**. 
 






The `Container` runs the event handler code asynchronously. At the end of every instruction, it collects all changes since the previously executed instruction. It invokes the reducer once for each change with the `STATE_PART_CHANGED`. 

The current state is stored in the `StateContainer` surrounding `Container`. When all reducer actions have been issued, `Container` triggers the state update by incrementing a version number with the `setVersion` function it receives in a property from `StateContainer` (so it bundles all changes in a single version update):

```js
setVersion((prev) => prev + 1);
```




Some instructions may not change the state. The engine waits for up to 100 adjacent non-state-changing statements in such cases. Then, it awaits an asynchronous delay of 0 to give the JavaScript event loop an opportunity to run.

> Note: The execution engine may call into a native JavaScript function that blocks the UI. This technique does not protect against such a situation. Fortunately, it generally does not happen with the standard JS Runtime; nonetheless, third-party JS functions may cause blocking.

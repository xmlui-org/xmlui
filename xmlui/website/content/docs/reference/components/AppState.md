# AppState [#appstate]

>[!WARNING]
> The AppState component is deprecated. We will remove it in a future release. Please use [global variables](/docs/guides/markup#global-variables) instead.

`AppState` is an invisible component that provides global state management across your entire application. Unlike component variables that are scoped locally, AppState allows any component to access and update shared state without prop drilling.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Publish/Subscribe | `subscribeToTopic` |

## Properties [#properties]

### `bucket` [#bucket]

> [!DEF]  default: **"default"**

This property is the identifier of the bucket to which the `AppState` instance is bound. Multiple `AppState` instances with the same bucket will share the same state object: any of them updating the state will cause the other instances to view the new, updated state.

### `initialValue` [#initialvalue]

This property contains the initial state value. Though you can use multiple `AppState`component instances for the same bucket with their `initialValue` set, it may result in faulty app logic. When xmlui instantiates an `AppState` with an explicit initial value, that value is immediately merged with the existing state. The issue may come from the behavior that `initialValue` is set (merged) only when a component mounts. By default, the bucket's initial state is undefined.

## Events [#events]

### `didUpdate` [#didupdate]

This event is fired when the AppState value is updated. The event provides the new state value as its parameter.

**Signature**: `(updateInfo: { bucket: string; value: any; previousValue: any }) => void`

- `updateInfo`: An object containing the bucket name, the new state value, and the previous value.

## Exposed Methods [#exposed-methods]

### `appendToList` [#appendtolist]

This method appends an item to an array in the application state object bound to the `AppState` instance.

**Signature**: `appendToList(key: string, id: any)`

- `key`: The key of the array in the state object.
- `id`: The item to append to the array.

### `listIncludes` [#listincludes]

This method checks if an array in the application state object contains a specific item.

**Signature**: `listIncludes(key: string, id: any)`

- `key`: The key of the array in the state object.
- `id`: The item to check for in the array.

### `removeFromList` [#removefromlist]

This method removes an item from an array in the application state object bound to the `AppState` instance.

**Signature**: `removeFromList(key: string, id: any)`

- `key`: The key of the array in the state object.
- `id`: The item to remove from the array.

### `update` [#update]

This method updates the application state object bound to the `AppState` instance.

**Signature**: `update(newState: Record<string, any>)`

- `newState`: An object that specifies the new state value.

## Styling [#styling]

This component does not have any styles.

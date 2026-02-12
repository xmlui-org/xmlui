# AppState [#appstate]

`AppState` is an invisible component that provides global state management across your entire application. Unlike component variables that are scoped locally, AppState allows any component to access and update shared state without prop drilling.

**Key advantages over variables:**
- **Global accessibility**: Any component can access the state by referencing the same `bucket`
- **Automatic reactivity**: UI updates automatically when state changes, no manual prop passing required
- **Cross-component coordination**: Perfect for user sessions, UI preferences, loading states, and shared data

## Using AppState [#using-appstate]

Variables in xmlui are a straightforward tool for managing states. However, a variable's scope is the app's main file or the particular component file in which it is declared. To access the variable's value (the stored state), you must pass its value to components wanting to leverage it.

### Storing State in Variables [#storing-state-in-variables]

In the following example, the main file of the app declares a variable, `enhancedMode`, which is toggled with a checkbox:

```xmlui-pg
---app copy display filename="Main.xmlui"
<App var.enhancedMode="{false}">
  <VStack gap="$space-4" padding="$space-4">
    <Checkbox
      label="Enhanced mode"
      initialValue="{enhancedMode}"
      onDidChange="v => enhancedMode = v" />
    <Component1 enhancedMode="{enhancedMode}" />
    <Component2 enhancedMode="{enhancedMode}" />
  </VStack>
</App>
---desc
Two components, `Component1` and `Component2`, use the value of `enhancedMode`. Because of the aforementioned scoping issue, the app must explicitly pass the variable's value to those components so that they can use it. These components utilize the value to render their UI:
---comp copy display filename="Component1.xmlui"
<Component name="Component1">
  <H3 when="{$props.enhancedMode}">I am in enhanced mode!</H3>
  <Text when="{!$props.enhancedMode}">Enhanced mode turned off.</Text>
</Component>
---desc
When you define an `AppState`, you can set its `initialValue` property to initialize the state value.
---comp copy display filename="Component2.xmlui"
<Component name="Component2">
  <Button enabled="{$props.enhancedMode}">Set enhanced options</Button>
</Component>
---desc
You can try how this app works:
```

### Storing State in AppState [#storing-state-in-appstate]

What if `Component1` and `Component2` had nested components using `enhancedMode`? You must also pass them to the nested components (via properties). What if you have not only one but a dozen of similar properties and a long chain of nested components? The "use a variable" pattern soon becomes a state management nightmare.

If the nested components want to change the state value, you must declare events and event handlers or component APIs to manage the state. It sounds pretty tedious!

This situation is where `AppState` comes into the picture. With an `AppState` instance, you can define a state object that automatically conveys between parent and nested child component chains implicitly.

Let's turn the previous example into one using `AppState`! The following code shows how we change the main app file:

```xmlui-pg 
---app copy display filename="Main.xmlui"
<App>
  <AppState id="appState" initialValue="{{ enhancedMode: false }}"/>
  <VStack gap="$space-4" padding="$space-4">
    <Checkbox
      label="Enhanced mode"
      initialValue="{appState.value.enhancedMode}"
      onDidChange="v => appState.update({ enhancedMode: v})" />
    <Component1 />
    <Component2 />
  </VStack>
</App>
---desc
When you define an `AppState`, you can set its `initialValue` property to initialize the state value. You must give an ID to the `AppState` instance to access it and use the `value` property to get the state. You must invoke the `AppState`'s `update` method when you intend to update the state.

The components may use their own `AppState` object to access the state value:
---comp copy display filename="Component1.xmlui"
<Component name="Component1">
  <AppState id="state" />
  <H3 when="{state.value.enhancedMode}">I am in enhanced mode!</H3>
  <Text when="{!state.value.enhancedMode}">Enhanced mode turned off.</Text>
</Component>
---comp copy display filename="Component2.xmlui"
<Component name="Component2">
  <AppState id="state" />
  <Button enabled="{state.value.enhancedMode}">Set enhanced options</Button>
</Component>
---desc
The modified app works the same way as the previous one (using variables):
```

### State Buckets [#state-buckets]

With the `AppState` component, you can use separate state objects. The `bucket` property of `AppState` is an identifier (using the "default" string by default). While multiple `AppState` objects use the same `bucket` property value, they refer to the same state object.

If you want to run the sample with explicit state buckets (for example, with the `settings` bucket id), you should change the `AppState` declarations accordingly:

```xmlui /bucket="settings"/
<!-- Main.xmlui -->
<AppState id="appState" bucket="settings" initialValue="{{ enhancedMode: false }}"/>

<!-- Component1 -->
<AppState id="state" bucket="settings" />

<!-- Component2 -->
<AppState id="state" bucket="settings" />
```

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

If the argument is a hash object, it will be merged with the previous state value. Let's assume the previous state value was the following:

```json
{
  "enhancedMode": false,
  "showHeader": true,
  "showFooter": true,
  "theme": "light"
}
```

Now, update the state with this call:

```js
appState.update({ enhancedMode: true, theme: "dark" });
```

The new state value will be:

```json
{
  "enhancedMode": true,
  "showHeader": true,
  "showFooter": true,
  "theme": "dark"
}
```

## Styling [#styling]

This component does not have any styles.

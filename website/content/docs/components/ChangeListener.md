# ChangeListener [#changelistener]

`ChangeListener` is an invisible component that watches for changes in values and triggers actions in response. It's essential for creating reactive behavior when you need to respond to data changes, state updates, or component property modifications outside of normal event handlers.

**Key features:**
- **Value monitoring**: Watches any expression, variable, or component property for changes
- **Throttling support**: Prevents excessive triggering with `throttleWaitInMs` for rapid changes
- **Previous/new values**: Access both old and new values in the change handler
- **Reactive patterns**: Coordinates between components or triggers side effects

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Publish/Subscribe | `subscribeToTopic` |

## Properties [#properties]

### `listenTo` [#listento]

Value to the changes of which this component listens. If this property is not set, the `ChangeListener` is inactive.

The following sample demonstrates using this property. Every time the user clicks the button, a counter is incremented. The `ChangeListener` component watches the counter's value. Whenever it changes, the component fires the `didChange` event, which stores whether the new counter value is even into the `isEven` variable.

```xmlui-pg copy display name="Example: listenTo"
<App var.counter="{0}" var.isEven="{false}">
  <Button label="Increment counter" onClick="{counter++}" />
  <ChangeListener
    listenTo="{counter}"
    onDidChange="isEven = counter % 2 == 0" />
  <Text>Counter is {counter} which {isEven? "is": "isn't"} even.</Text>
</App>
```

### `throttleWaitInMs` [#throttlewaitinms]

> [!DEF]  default: **0**

This variable sets a throttling time (in milliseconds) to apply when executing the `didChange` event handler. All changes within that throttling time will only fire the `didChange` event once.

The following example works like the previous one (in the `listen` prop's description). However, the user can reset or set the throttling time to 3 seconds. You can observe that while the throttling time is 3 seconds, the counter increments on every click, but `isEven` only refreshes once within 3 seconds.

```xmlui-pg copy display name="Example: throttleWaitInMs"
<App var.counter="{0}" var.isEven="{false}" var.throttle="{0}">
  <HStack>
    <Button label="Increment counter" onClick="{counter++}" />
    <Button label="Set 3 sec throttling" onClick="throttle = 3000" />
    <Button label="Reset throttling" onClick="throttle = 0" />
  </HStack>

  <ChangeListener
    listenTo="{counter}"
    throttleWaitInMs="{throttle}"
    onDidChange="isEven = counter % 2 == 0" />
  <Text>Counter is {counter} which {isEven? "is": "isn't"} even.</Text>
</App>
```

## Events [#events]

### `didChange` [#didchange]

This event is triggered when the value specified in the `listenTo` property changes.

**Signature**: `(oldValue: any, newValue: any) => void`

- `oldValue`: The previous value of the property being listened to.
- `newValue`: The new value of the property being listened to.

This event is fired when the component observes a value change (within the specified throttling interval). Define the event handler that responds to that change (as the previous samples demonstrate).

The event argument is an object with `prevValue` and `newValue` properties that (as their name suggests) contain the previous and the new values.

```xmlui-pg copy display name="Example: prevValue and newValue"
<App var.counter="{0}">
  <Button label="Increment counter" onClick="{counter++}" />
  <ChangeListener
    listenTo="{counter}"
    onDidChange="(change) => changeLog.setValue('prev: ' + change.prevValue + ' new: ' + change.newValue)"
  />
  <TextArea id="changeLog" />
</App>

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.

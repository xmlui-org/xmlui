# ChangeListener [#changelistener]

`ChangeListener` is an invisible component that watches for changes in values and triggers actions in response. It's essential for creating reactive behavior when you need to respond to data changes, state updates, or component property modifications outside of normal event handlers.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Publish/Subscribe | `subscribeToTopic` |

## Properties [#properties]

### `listenTo` [#listento]

Value to the changes of which this component listens. If this property is not set, the `ChangeListener` is inactive.

### `throttleWaitInMs` [#throttlewaitinms]

> [!DEF]  default: **0**

This variable sets a throttling time (in milliseconds) to apply when executing the `didChange` event handler. All changes within that throttling time will only fire the `didChange` event once.

## Events [#events]

### `didChange` [#didchange]

This event is triggered when the value specified in the `listenTo` property changes.

**Signature**: `(oldValue: any, newValue: any) => void`

- `oldValue`: The previous value of the property being listened to.
- `newValue`: The new value of the property being listened to.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.

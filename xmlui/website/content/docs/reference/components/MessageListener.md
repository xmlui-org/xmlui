# MessageListener [#messagelistener]

The `MessageListener` component listens for messages sent via the window.postMessage API from other windows or iframes. It does not render any UI of its own and passes through its children without adding wrapper elements, making it ideal for adding message listening capabilities without disrupting layout.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Publish/Subscribe | `subscribeToTopic` |

## Properties [#properties]

This component does not have any properties.

## Events [#events]

### `messageReceived` [#messagereceived]

This event fires when the `MessageListener` component receives a message from another window or iframe via the window.postMessage API.

**Signature**: `(data: any) => void`

- `data`: The data sent from the other window via postMessage.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.

# MessageListener [#messagelistener]

The `MessageListener` component listens for messages sent via the window.postMessage API from other windows or iframes. It does not render any UI of its own and passes through its children without adding wrapper elements, making it ideal for adding message listening capabilities without disrupting layout.

The `MessageListener` component listens for messages sent via the browser's `window.postMessage` API from other windows or iframes. It does not render any UI of its own and transparently passes through its children without adding wrapper elements, making it ideal for adding message listening capabilities without disrupting layout.

**Key features:**

- **Non-visual**: Renders children directly without wrapper elements
- **Layout-friendly**: Does not interfere with Stack, FlowLayout, or other container gaps
- **Flexible placement**: Can be used anywhere in the component tree
- **Multiple listeners**: Multiple MessageListener instances can coexist and all will receive messages

## Behaviors [#behaviors]

This component supports the following behaviors:

- **label**: Adds a label to input components with a 'label' prop using the ItemWithLabel component.
- **pubsub**: Subscribes the component to specified topics and triggers an event when a topic is received.

## Properties [#properties]

This component does not have any properties.

## Events [#events]

### `messageReceived` [#messagereceived]

This event fires when the `MessageListener` component receives a message from another window or iframe via the window.postMessage API.

**Signature**: `(data: any) => void`

- `data`: The data sent from the other window via postMessage.

```xmlui-pg copy display name="Example: messageReceived" /onMessageReceived/ /window.postMessage/
<App var.message="(no message received yet)">
  <Card>
    <MessageListener
      onMessageReceived="(msg, ev) => message = JSON.stringify(msg)"
    >
      <Button
        label="Send a message"
        onClick="window.postMessage({type: 'message', text: 'Here you are!'}, '*')"
      />
      <Text>
        Message received: {message}
      </Text>
    </MessageListener>
  </Card>
</App>
```

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.

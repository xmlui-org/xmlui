%-DESC-START

The `MessageListener` component listens for messages sent via the browser's `window.postMessage` API from other windows or iframes. It does not render any UI of its own and transparently passes through its children without adding wrapper elements, making it ideal for adding message listening capabilities without disrupting layout.

**Key features:**

- **Non-visual**: Renders children directly without wrapper elements
- **Layout-friendly**: Does not interfere with Stack, FlowLayout, or other container gaps
- **Flexible placement**: Can be used anywhere in the component tree
- **Multiple listeners**: Multiple MessageListener instances can coexist and all will receive messages

%-DESC-END

%-EVENT-START messageReceived

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

%-EVENT-END

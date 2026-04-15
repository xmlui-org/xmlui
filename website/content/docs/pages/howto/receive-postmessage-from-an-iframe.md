# Receive postMessage from an iframe

Use `MessageListener` to react to messages sent from embedded content or a parent window.

`MessageListener` is a non-visual component that listens for `window.postMessage` events. When a message arrives, `onMessageReceived` fires with the parsed data and the raw `MessageEvent`. Use it to receive commands from an embedded `IFrame`, a child popup, or a parent window that hosts your app.

```xmlui-pg copy display name="Receive messages from an IFrame"
---app display
<App>
  <variable name="lastMessage" value="(waiting for message)" />
  <variable name="messageCount" value="{0}" />

  <MessageListener
    onMessageReceived="(data) => {
      if (typeof data === 'object' && data.type === 'greeting') {
        lastMessage = data.text;
        messageCount = messageCount + 1;
      }
    }" />

  <HStack wrapContent verticalAlignment="start">
    <VStack width="*" minWidth="240px">
      <Text variant="strong">Host app</Text>
      <Text>Last message: {lastMessage}</Text>
      <Text variant="caption">Messages received: {messageCount}</Text>
    </VStack>
    <VStack width="*" minWidth="240px">
      <Text variant="strong">Embedded frame</Text>
      <IFrame
        id="child"
        height="120px"
        backgroundColor="lightblue"
        srcdoc=`<button onclick="window.parent.postMessage(
          \{type: 'greeting',text: 'Hello from iframe!'}, '*')">
          Send message to host</button>`
        sandbox="allow-scripts" />
    </VStack>
  </HStack>
</App>
```

## Key points

**`onMessageReceived` fires for every incoming message**: The handler receives the deserialized `data` payload as its first argument and the full `MessageEvent` as the second. Filter on a `type` field or check `event.origin` to ignore unwanted messages.

**Always validate the message origin**: In production, check `event.origin` against an allowlist before acting on the data. Accepting messages from any origin (`*`) is convenient for development but unsafe for production.

**`IFrame.postMessage()` sends messages the other way**: Call `iframeId.postMessage(data, targetOrigin)` from your XMLUI app to send data into the embedded page. The iframe listens with `window.addEventListener("message", …)`.

**Multiple `MessageListener` instances coexist**: Place listeners in different components or pages — each one receives all messages independently. Use a `type` or `channel` field in the payload to route messages to the right handler.

**`srcdoc` sets the iframe's inline HTML content**: Instead of loading a URL via `src`, `srcdoc` lets you embed raw HTML directly as the frame's content — no external server needed. Use backtick string syntax for multi-line HTML values.

**Escape `{` with `\` inside backtick attribute values**: XMLUI treats `{…}` as a reactive expression anywhere in markup. When the attribute value is a backtick string containing JavaScript object literals, prefix each `{` with a backslash (`\{`) so the framework treats it as a literal character instead of an expression wrapper.

---

## See also

- [Embed an external site in an IFrame](/docs/howto/embed-an-external-site-in-an-iframe) — load remote content and control permissions with `sandbox`
- [Show toast notifications from code](/docs/howto/show-toast-notifications-from-code) — display a toast when a message arrives
- [Run a one-time action on page load](/docs/howto/run-a-one-time-action-on-page-load) — trigger setup logic when the page mounts

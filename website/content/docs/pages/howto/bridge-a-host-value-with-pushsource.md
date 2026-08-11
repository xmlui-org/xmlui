# Bridge a host value into reactive state with PushSource

`PushSource` is the push analogue of `DataSource`: where `DataSource` *pulls*
(fetch / poll), `PushSource` *receives* values pushed to it. Use it to bring a
host-provided value stream — `postMessage`, Tauri events, a WebSocket, a
polling cache, a DOM observer — into XMLUI's reactive model, where it behaves
like any other observable value.

The `subscribe` prop is a function with the shape
`(emit) => unsubscribe | void`. XMLUI calls it once on mount, handing it an
`emit(value)` callback; every `emit` becomes an observable value change. The
returned function (if any) runs on unmount. Give `initial` a seed value to
render before the first `emit`.

```xmlui-pg copy display name="Subscribe a host value stream"
<App>
  <!-- docsSubscribeAgentStatus is a docs-only source: it emit()s a new status
       every 1.5s and returns an unsubscribe fn. In a real app this is your
       postMessage / Tauri event / WebSocket subscription. -->
  <PushSource
    id="agentStatus"
    initial="{{ state: 'idle' }}"
    subscribe="{window.docsSubscribeAgentStatus}" />

  <Text value="Agent is {agentStatus.value.state}" />
</App>
```

`agentStatus.value` holds the latest emitted value and updates every binding
that reads it. `agentStatus.loaded` is `true` once the source is mounted.

**The `subscribe` contract:**

```js
// (emit) => unsubscribe | void
function subscribeAgentStatus(emit) {
  const handler = (e) => emit(e.detail);
  window.addEventListener("agent-status", handler);
  emit({ state: "idle" });            // optional synchronous seed
  return () => window.removeEventListener("agent-status", handler);
}
```

- Call `emit` synchronously inside `subscribe` to seed a first value (it wins
  over `initial`), and asynchronously thereafter for every update.
- Return an unsubscribe function so the source cleans up when the component
  unmounts (or a `when` condition hides it).
- `subscribe` lives in host/app JavaScript, not in XMLUI expressions — the
  point of `PushSource` is to bridge things the markup can't express itself.

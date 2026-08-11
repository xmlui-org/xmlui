# Run a side effect when a PushSource value changes

Binding to `PushSource.value` re-renders the UI automatically. When you need a
*side effect* on each pushed value — refetch data, show a toast, advance a
counter — pair `PushSource` with a `ChangeListener` that watches its value.
This is the push counterpart to reacting to a `DataSource` result.

```xmlui-pg copy display name="React to each pushed change"
---app display
<App var.refreshes="{0}">
  <!-- docsSubscribeTick is a docs-only source: it emit()s a new tick every
       1.5s. In a real app this is your host's "something changed" signal. -->
  <PushSource id="changed" subscribe="{window.docsSubscribeTick}" />

  <DataSource id="items" url="/api/items" />

  <ChangeListener
    listenTo="{changed.value}"
    onDidChange="() => { items.refetch(); refreshes++; }" />

  <Text value="Reacted {refreshes} time(s)" />
  <List data="{items.value}">
    <Text value="{$item.name}" />
  </List>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.n = 0",
  "operations": {
    "get-items": {
      "url": "/items",
      "method": "get",
      "handler": "$state.n = $state.n + 1; return [{ id: 1, name: 'fetch #' + $state.n + ' - alpha' }, { id: 2, name: 'fetch #' + $state.n + ' - beta' }]"
    }
  }
}
```

This is the exact shape Bram uses to keep pull-based `DataSource`s fresh from
push-based host events: a `PushSource` carries the "something changed" signal,
and a `ChangeListener` turns each emit into a `refetch()`. Because
`ChangeListener` reacts to the *value* regardless of who set it, the push
source and the consumer stay decoupled.

**Tips:**

- Emit a monotonic tick (or a small changed-key) rather than a large payload
  when the value is only a *signal* to act — cheaper to diff, and the
  `ChangeListener` still fires on every emit.
- Debounce bursts with `ChangeListener`'s `debounceWaitInMs` when the host can
  push faster than you want to react (see
  [Rate-limit value changes](/docs/howto/debounce-with-changelistener)).
- Keep the `onDidChange` body to app-level calls (`refetch()`, `toast()`,
  state assignments); the push machinery itself lives in the host `subscribe`
  function.

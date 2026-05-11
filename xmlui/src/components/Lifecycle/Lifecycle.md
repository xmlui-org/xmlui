%-DESC-START

`Lifecycle` is a non-visual primitive that runs the `onMount` handler when
the component is first rendered, runs `onUnmount` when it is removed, and
re-arms the cycle whenever its `keyValue` prop changes (firing `onUnmount`
for the previous value and then `onMount` for the new value).

It is the recommended escape hatch for one-shot side effects that do **not**
fit a more specific managed component. Reach for the dedicated component
first:

| Need | Use |
|---|---|
| Recurring tick on a schedule | `<Timer>` |
| Long-lived bidirectional connection | `<WebSocket>` |
| Server-sent events | `<EventSource>` |
| Cached HTTP read with reactive params | `<DataSource>` |
| One-off HTTP write triggered by code | `<APICall>` |
| Anything that does not fit the above | `<Lifecycle>` |

%-DESC-END

%-PROP-START keyValue

When this expression's value changes, the component fires `onUnmount`
(for the previous value) and then `onMount` (for the new value). This is
the markup equivalent of a React `useEffect` with a dependency array.

```xml
<Lifecycle
  keyValue="{state.activeConversationId}"
  onMount="markRead.execute({ id: state.activeConversationId })"
  onUnmount="flushUnreadCounter.execute({ id: state.activeConversationId })"
/>
```

Omit this prop for the simple mount/unmount-only case.

%-PROP-END

%-EVENT-START mount

Fires once when the component is mounted, and on every subsequent
`keyValue` change after the previous `unmount` runs. The handler may be
`async`. Throws are caught and routed to `onError` (when declared) with
`source: "mount"`.

%-EVENT-END

%-EVENT-START unmount

Fires once when the component is unmounted, and on each `keyValue`
change before the new `mount`. The handler **must be synchronous** —
React commits the unmount synchronously, so awaited work after this
point may write to a torn-down container. For the asynchronous flush
case use the upcoming container `onBeforeDispose` hook.

Throws are caught and routed to `onError` (when declared) with
`source: "unmount"`.

%-EVENT-END

%-EVENT-START error

Fires when an `onMount` or `onUnmount` handler throws. The handler
receives a single argument shaped like
`{ source: "mount" | "unmount", error: { message, stack? } }`. When
`onError` is declared, the global error toast for the failing lifecycle
phase is suppressed (the user's handler is the override).

%-EVENT-END

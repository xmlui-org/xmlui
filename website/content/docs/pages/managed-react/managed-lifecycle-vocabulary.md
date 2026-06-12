# Managed Lifecycle Vocabulary

XMLUI gives every component a uniform set of lifecycle events — `onMount`,
`onUnmount`, and `onError` — plus a declarative `<Lifecycle>` component and
a container-level `onBeforeDispose` hook for flushing work before a part of
the UI disappears. You can react to a component appearing, disappearing,
or failing without writing any React code or wiring `useEffect` yourself.

## What problems this prevents

- One-shot actions that should happen exactly once when a screen appears no
  longer have to be hung off an unrelated click handler or a timer — they
  go in `onMount`.
- Drafts, scroll positions, "last read" markers, and analytics events that
  need to be persisted when a page closes no longer get lost when the user
  navigates away — `onUnmount` or `onBeforeDispose` runs before the
  component goes away.
- Errors thrown inside a lifecycle handler no longer disappear into a
  generic toast — `onError` receives a structured `{ source, error }`
  payload and you can route it to your own diagnostics surface.
- Async work that tries to update state after a component has unmounted no
  longer silently corrupts a torn-down container — `onUnmount` is
  synchronous by contract, and async flushes have a separate hook
  (`onBeforeDispose`) with a bounded time budget.
- Re-arming a side effect when an input changes (the React `useEffect`
  with a dependency array pattern) is expressible in markup using the
  `<Lifecycle key="...">` form, without exposing closures or refs.

## How it works

Every container and wrapper component participates in the managed lifecycle
surface. When a component enters the displayed XMLUI tree, XMLUI fires
`onMount`; when it leaves the displayed tree, XMLUI fires `onUnmount` and
(synchronously) any registered `onError` handler if a handler throws. The
events are ordinary action handlers — they run through the same expression
and scope pipeline as `onClick`, so they can read state, call other
component methods, write to `App.session`, or invoke `Log.info()`.

## Universal `onMount` and `onUnmount`

`onMount` and `onUnmount` are available on every component. No
per-component declaration is needed. They are the canonical names; the older
`onInit` and `onCleanup` attributes remain compatibility aliases. If both
canonical and legacy names are declared on the same component, XMLUI runs only
the canonical handler and emits a lifecycle warning.

```xmlui copy
<App>
  <Stack
    var.openedAt="{null}"
    onMount="openedAt = App.now(); Log.info('panel opened')"
    onUnmount="Log.info('panel closed', { duration: App.now() - openedAt })"
  >
    <Text value="Hello." />
  </Stack>
</App>
```

`onMount` runs when the component becomes visible (`when` absent/true or
false → true). Re-renders do not re-fire it. `onUnmount` runs once,
synchronously, when the component leaves the displayed tree (`when` true →
false or parent teardown) — the handler can still read the component's state.

## Reacting to lifecycle failures with `onError`

If `onMount` (or `onUnmount`, or an action handler) throws, declaring
`onError` gives you the failure as data:

```xmlui copy
<Stack
  onMount="riskyInit()"
  onError="Log.warn('init failed', event.error)"
/>
```

`event.source` is one of `"mount"`, `"unmount"`, `"beforeDispose"`, or
`"action"`. When `onError` is declared, the default error toast is
suppressed for that component — your handler owns the response.

## `<Lifecycle>` for one-shot effects without a dedicated component

When you need a side effect that does not map cleanly onto `<Timer>`,
`<DataSource>`, `<APICall>`, `<WebSocket>`, or `<EventSource>`, the
non-visual `<Lifecycle>` component is the escape hatch:

```xmlui copy
<Page when="{state.helpDrawerOpen}">
  <DataSource id="recent" url="/api/articles/recent" />
  <APICall id="saveBookmark" method="POST" url="/api/bookmarks" />

  <Lifecycle
    onMount="recent.refetch(); Log.info('help-drawer opened')"
    onUnmount="saveBookmark.execute({ articleId: state.lastReadArticle })"
  />
</Page>
```

The optional `key` prop re-arms the cycle whenever the key changes. The
dispatcher fires `onUnmount` for the old key, then `onMount` for the new
one — declaratively, with the correct value captured at each phase:

```xmlui copy
<Lifecycle
  key="{state.activeConversationId}"
  onMount="markRead.execute({ conversationId: state.activeConversationId })"
  onUnmount="flushUnread.execute({ conversationId: state.activeConversationId })"
/>
```

Before reaching for `<Lifecycle>`, check whether a more specific managed
component fits. If you need a recurring action, use `<Timer>`. If you
need to fetch data, use `<DataSource>`. If you need a push stream, use
`<WebSocket>` or `<EventSource>`. `<Lifecycle>` is for the leftover "do
exactly this when this part of the UI appears and disappears" cases.

## Flushing pending work with `onBeforeDispose`

Container components (`App`, `Page`, `Form`, `NestedApp`, `Container`)
expose `onBeforeDispose`, which fires *before* React commits the unmount
and **may be asynchronous**. It is the right hook for flushing a pending
write to a managed mutation, persisting scroll position, or sending a
final telemetry beacon:

```xmlui copy
<Page
  onBeforeDispose="await saveDraft.execute({ content: state.draft })"
>
  <TextArea bindTo="{state.draft}" />
</Page>
```

The dispatcher races the handler against a per-app budget
(`xmluiConfig.disposeTimeoutMs`, default `250` ms). If the handler exceeds
the budget the unmount proceeds anyway and a `kind: "lifecycle"`
violation with `reason: "timeout"` is reported in the trace — you are
never trapped in a hanging unmount.

Containers that do not declare `onBeforeDispose` unmount with no added
latency.

## Async-vs-sync contract

| Hook                | Async allowed? | Notes                                              |
|---------------------|----------------|----------------------------------------------------|
| `onMount`           | Yes            | The dispatcher provides an abort signal on unmount |
| `onUnmount`         | **No**         | Synchronous only; async handlers report a violation |
| `onBeforeDispose`   | Yes            | Bounded by `xmluiConfig.disposeTimeoutMs`          |
| `onError`           | Sync preferred | Runs in the same phase as the failing event        |

If a piece of cleanup truly needs to await something, move it from
`onUnmount` to `onBeforeDispose`.

## Enabling strict mode

The `strictLifecycle` build switch upgrades lifecycle violations
(async `onUnmount`, exceeded `onBeforeDispose` budget, throws inside
`onMount` with no `onError`) from warnings in the trace to surfaced
errors:

```json
{
  "xmluiConfig": {
    "strictLifecycle": true
  }
}
```

When strict mode is off (for example, while migrating), violations
still appear as `kind: "lifecycle"` entries in the Inspector trace, so
you can audit them without affecting the running app.

## Related

- [Managed React Overview](/docs/managed-react/overview)
- [Reactive Cycle Detection](/docs/managed-react/reactive-cycle-detection)
- [Observability Substrate](/docs/managed-react/observability-substrate)
- [Timer](/components/Timer)
- [DataSource](/components/DataSource)
- [WebSocket](/components/WebSocket)
- [EventSource](/components/EventSource)

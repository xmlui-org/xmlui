---
"xmlui": patch
---

Plan #04 (Managed Lifecycle Vocabulary) Phases 1–2 (W3-3): universal
`onMount` / `onUnmount` / `onError` events on every component plus a new
declarative `<Lifecycle>` primitive (with `keyValue` re-arming) for
one-shot side effects that don't fit `<Timer>`, `<DataSource>`,
`<APICall>`, `<WebSocket>`, or `<EventSource>`. Adds the
`appGlobals.strictLifecycle` switch (default `false`) and the
`appGlobals.disposeTimeoutMs` setting, registers a new
`kind:"lifecycle"` trace entry, and ships the `components-core/lifecycle/`
module skeleton with `LifecycleViolationError`, dispatcher, and trace
helpers.

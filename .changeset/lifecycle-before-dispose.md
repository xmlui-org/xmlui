---
"xmlui": patch
---

Add `onBeforeDispose` lifecycle event on all components (Plan #04 Step 3.1).

`onBeforeDispose` fires just before a component unmounts, with support for
async handlers. The handler is raced against a configurable budget
(default 250 ms, controlled via `App.appGlobals.disposeTimeoutMs`).
Exceeding the budget emits a `kind:"lifecycle"` violation trace with
`reason:"timeout"` and lets the unmount proceed. Sync handlers complete
with zero added latency. Useful for flushing pending writes to a managed
`<DataSource>`, persisting scroll position, or emitting final telemetry.

```xml
<Page onBeforeDispose="async () => {
  await dataSource.flush();
}">
  ...
</Page>
```

# Determinism

XMLUI's determinism contract defines what order the managed React runtime preserves when event handlers, state writes, renders, data loading, and replay diagnostics overlap.

## Happens-Before Edges

| Edge | Before | After | Guarantee |
|---|---|---|---|
| H1 | Any state write inside handler `h` | Any render that observes a value transitively dependent on that write | Always |
| H2 | Source-order handler `i` of an event | Source-order handler `i + 1` of the same event | Always |
| H3 | Resolution of a `var.x` write | Re-evaluation of any expression depending on `x` | Always within a single trace |
| H4 | Completion of a queued handler chain rooted at trace `T` | Start of any handler chain rooted at trace `T'` enqueued strictly after `T` | FIFO scheduler |
| H5 | Render commit at frame `F` | Any state read at frame `F + 1` | Always, via React |
| H6 | `<DataSource>` settle, success or error | Any handler chained via `onSuccess` or `onError` | Always |
| H7 | Two traces with overlapping logical clocks | No ordering guarantee | Concurrent scheduler; FIFO preserves order per trace only |

## Scheduler Modes

`<App scheduler="concurrent">` preserves the historical XMLUI behavior: handlers start immediately. The scheduler still records enqueue and completion order and emits `determinism-handler-reordered` when completion order differs within the same trace.

`<App scheduler="fifo">` serializes handlers within each trace while letting independent traces drain in parallel. `strictDeterminism` also selects FIFO mode and escalates determinism diagnostics.

`maxQueuedPerTrace` bounds runaway handler chains. When the queue would exceed the bound, XMLUI emits `determinism-convergence-failed` and rejects the queued handler.

```xml
<App scheduler="fifo" maxQueuedPerTrace="{64}">
  ...
</App>
```

Internally, `runCodeAsync()` calls `App.scheduleHandler({ traceId, spanId, label, handler })`.
The scheduler calls back into `runCodeAsync()` with `schedulerBypass` set so the handler body is not
re-enqueued recursively.

## Diagnostics

| Code | When |
|---|---|
| `determinism-handler-reordered` | Concurrent completion order differs from enqueue order within one trace. |
| `determinism-convergence-failed` | FIFO queue would exceed `maxQueuedPerTrace`; the new task is rejected. |
| `determinism-state-write-after-render` | A reducer write occurs while `Container` / `ComponentAdapter` render markers are active. |
| `determinism-replay-divergence` | Replay comparison finds the first structural log mismatch. |

All of these use `kind:"scheduler"` trace entries. `strictDeterminism` selects FIFO by default and
escalates determinism diagnostics.

## Replay

The replay harness compares a captured `XsLogEntry` stream with a produced stream after removing volatile timing fields such as `ts`, `duration`, and `startPerfTs`. The first structural difference returns `determinism-replay-divergence` data through the replay result.

## Deterministic Utilities

`orderedKeys(obj)` returns numeric string keys ascending, non-numeric strings in insertion order, and
symbols sorted by description. `Items` uses this when rendering plain-object data.

`serializeSpacing(value)` rounds finite numbers to four decimal places and trims trailing zeros,
avoiding values such as `0.30000000000000004`.

## Key Files

| File | Purpose |
|---|---|
| [xmlui/src/components-core/scheduler/queue.ts](../../xmlui/src/components-core/scheduler/queue.ts) | FIFO/concurrent scheduler |
| [xmlui/src/components-core/container/event-handlers.ts](../../xmlui/src/components-core/container/event-handlers.ts) | Handler scheduling hook |
| [xmlui/src/components-core/scheduler/happens-before.ts](../../xmlui/src/components-core/scheduler/happens-before.ts) | Render-phase markers |
| [xmlui/src/components-core/scheduler/replay.ts](../../xmlui/src/components-core/scheduler/replay.ts) | Replay comparator |
| [xmlui/src/components-core/utils/orderedKeys.ts](../../xmlui/src/components-core/utils/orderedKeys.ts) | Deterministic key ordering |
| [xmlui/src/components-core/utils/serializeSpacing.ts](../../xmlui/src/components-core/utils/serializeSpacing.ts) | Stable spacing serialization |

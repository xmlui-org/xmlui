# Determinism & Scheduler — AI Reference

Wave 4 completes the runtime pieces for concurrent-state determinism above React: render-phase
diagnostics, a per-trace FIFO scheduler, reorder/convergence diagnostics, replay comparison, and
small deterministic utility helpers.

## Core Files

| File | Role |
|---|---|
| `xmlui/src/components-core/scheduler/queue.ts` | Promise-based FIFO/concurrent scheduler |
| `xmlui/src/components-core/scheduler/happens-before.ts` | Render-phase marker helpers |
| `xmlui/src/components-core/scheduler/replay.ts` | Trace comparator for replay harness |
| `xmlui/src/components-core/scheduler/diagnostics.ts` | Determinism diagnostic codes |
| `xmlui/src/components-core/container/event-handlers.ts` | Handler hot-path scheduling via `App.scheduleHandler()` |
| `xmlui/src/components-core/rendering/Container.tsx` | Container render-phase marker integration |
| `xmlui/src/components-core/rendering/ComponentAdapter.tsx` | Component renderer marker integration |
| `xmlui/src/components-core/rendering/reducer.ts` | `determinism-state-write-after-render` diagnostic |
| `xmlui/src/components-core/utils/orderedKeys.ts` | Stable object key ordering helper |
| `xmlui/src/components-core/utils/serializeSpacing.ts` | Stable spacing-number serialization |

## Scheduler Modes

`App.scheduler` is either `"concurrent"` or `"fifo"`.

- `concurrent` is the legacy/default behavior unless `strictDeterminism` is enabled.
- `fifo` serializes handlers within the same trace in enqueue order.
- Different trace IDs drain independently, so unrelated interactions can still overlap.

`strictDeterminism: true` selects FIFO by default and escalates scheduler diagnostics.

## App Namespace

| API | Signature | Description |
|---|---|---|
| `App.scheduler` | `"concurrent" \| "fifo"` | Current mode |
| `App.maxQueuedPerTrace` | `number` | Queue budget |
| `App.setScheduler` | `(mode, { maxQueuedPerTrace? }?) => void` | Runtime scheduler override |
| `App.scheduleHandler` | `({ traceId, spanId, label, handler }) => Promise<void>` | Internal handler scheduling hook |

`<App scheduler="fifo" maxQueuedPerTrace="{64}">` is the markup surface.

## Handler Integration

`runCodeAsync()` in `container/event-handlers.ts` is wrapped by `App.scheduleHandler()` unless
`LookupActionOptions.schedulerBypass` is set. The bypass flag prevents recursive enqueueing when
the scheduler invokes the actual handler body.

Trace IDs come from `getCurrentTrace()` when present; otherwise the handler runner creates a
synthetic handler trace ID. Span IDs are generated per queued handler.

## Diagnostics

| Code | When |
|---|---|
| `determinism-handler-reordered` | Concurrent completion order differs from enqueue order within one trace. |
| `determinism-convergence-failed` | A FIFO queue would exceed `maxQueuedPerTrace`; the new task is rejected. |
| `determinism-state-write-after-render` | Reducer sees a state write while a render-phase marker is active. |
| `determinism-replay-divergence` | Replay comparison finds the first structural log mismatch. |

Diagnostics are emitted as `kind:"scheduler"` trace entries.

## Replay

`replay({ traces, actualTraces })` compares expected and actual `XsLogEntry` streams after stripping
volatile timing fields (`ts`, `duration`, `startPerfTs`). It returns `{ diverged: false }` for
matching traces, or the first divergent index and entries.

## Deterministic Utilities

`orderedKeys(obj)` returns numeric string keys ascending, then non-numeric strings in insertion
order, then symbols sorted by description. `Items` uses this for plain-object data.

`serializeSpacing(number)` rounds finite values to four decimal places and trims trailing zeros.
This prevents token output such as `0.30000000000000004`.

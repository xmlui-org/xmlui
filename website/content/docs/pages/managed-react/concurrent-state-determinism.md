# Concurrent-State Determinism

XMLUI ships a happens-before contract for handlers, state writes, and
renders, plus an optional FIFO scheduler that serialises handlers within
a single user interaction. Spacing tokens serialise to a stable
fixed-precision string, plain-object iteration is sorted deterministically,
and any captured trace can be replayed against a current run to detect
divergence. You get reproducible behaviour without writing any
synchronisation code yourself.

## What problems this prevents

- Two rapid clicks on the same button no longer produce arbitrary
  interleavings of state writes. Under the FIFO scheduler, handlers within
  one trace run in source order, so the resulting state is the same every
  time.
- A reducer that fires mid-render — for example a `useLayoutEffect` that
  writes state inside a render commit — now produces a
  `determinism-state-write-after-render` diagnostic instead of silently
  triggering a second render pass.
- Spacing tokens such as `$space-1_5` no longer produce
  `0.30000000000000004` in one browser and `0.3` in another. Visual
  snapshots are byte-identical across Chromium, Firefox, and WebKit.
- `<Items>` iteration order over plain objects no longer depends on the
  engine's quirks for symbol keys or sparse arrays. Numeric strings come
  first ascending, then string keys in insertion order, then symbols
  sorted by description.
- A regression that changes the order in which `onSuccess` and `onError`
  handlers fire after a `<DataSource>` settle is caught the next time you
  replay an exported trace — the divergence panel shows the exact entry
  that drifted.
- A runaway handler chain that keeps enqueuing itself is bounded by
  `maxQueuedPerTrace` and surfaces as a `determinism-convergence-failed`
  trace instead of locking up the page.

## How it works

Every handler invocation is tagged with the `traceId` of the user
interaction (or background trigger) that started it. The scheduler
maintains one queue per `traceId`; under `scheduler="fifo"` it drains
queues in enqueue order within a trace while letting independent traces
proceed in parallel. Render commits set a marker the state reducer
checks, so writes that arrive mid-commit are flagged. Spacing values
flow through a shared serialiser, and `<Items>` iterates plain objects
through an ordered-key helper.

## The happens-before contract

| Edge | Before | After | Guarantee |
|---|---|---|---|
| H1 | Any state write inside handler `h` | Any render observing a value derived from that write | Always |
| H2 | Source-order handler `i` of an event | Source-order handler `i + 1` of the same event | Always |
| H3 | Resolution of a `var.x` write | Re-evaluation of any expression depending on `x` | Always within a single trace |
| H4 | Completion of a queued handler chain rooted at trace `T` | Start of any handler chain rooted at trace `T'` enqueued strictly after `T` | FIFO scheduler |
| H5 | Render commit at frame `F` | Any state read at frame `F + 1` | Always |
| H6 | `<DataSource>` settle (success or error) | Any handler chained via `onSuccess` / `onError` | Always |
| H7 | Two traces with overlapping logical clocks | No ordering guarantee | Concurrent scheduler only |

## Picking a scheduler mode

`<App>` exposes two modes. Use `concurrent` (the historical behaviour) if
you need maximum parallelism between handlers in one trace; use `fifo`
when you want strict in-order execution per trace and reproducible
state-write order.

```xmlui copy
<App scheduler="fifo" maxQueuedPerTrace="{64}">
  <!-- handlers within one user click run strictly in source order -->
</App>
```

`maxQueuedPerTrace` caps how long a queued chain can grow before XMLUI
rejects the next enqueue with `determinism-convergence-failed`. The
default is 64, which comfortably fits any legitimate chain.

Independent traces — two unrelated user interactions, a `<Timer>` tick
overlapping a click — never block each other. The FIFO guarantee applies
*within* a trace, not across the app.

## Strict determinism

`appGlobals.strictDeterminism` (default `true`) enables:

- `scheduler="fifo"` as the default mode.
- Spacing-token serialisation through the fixed-precision helper.
- `determinism-*` diagnostics escalated to errors.

Set it to `false` to opt back into the legacy concurrent mode while you
migrate:

```json
{
  "appGlobals": {
    "strictDeterminism": false
  }
}
```

## Diagnostics

| Code | When it fires |
|---|---|
| `determinism-handler-reordered` | Under `concurrent`, completion order within one trace differs from enqueue order. Information for migration; no behaviour change. |
| `determinism-state-write-after-render` | A reducer write happens while a render commit is in flight. |
| `determinism-convergence-failed` | A FIFO queue would exceed `maxQueuedPerTrace`; the new task is rejected. |
| `determinism-floating-point-token` | Markup serialises a numeric value that should flow through `serializeSpacing`. |
| `determinism-iteration-order-symbol` | An expression iterates an object that contains symbol keys without the ordered-key helper. |
| `determinism-replay-divergence` | The replay comparator finds the first structural difference between an expected and an actual trace. |

All diagnostics arrive as `kind:"scheduler"` entries in `_xsLogs` and
through the Inspector overlay.

## Record-replay regression tests

1. With the Inspector overlay open, click **Export** to download the live
   trace as JSON. Commit the file as a fixture alongside the rest of your
   tests.
2. Re-run the interaction (in the browser, in CI, in another environment)
   to produce a new live trace.
3. Click **Replay…** in the Inspector overlay and select the saved
   fixture. The overlay shows either *"Replay matches"* or
   *"determinism-replay-divergence at entry #N"* with a side-by-side diff
   of the expected and actual entry.

For headless CI use the CLI:

```bash
npx xmlui replay expected.json actual.json
```

The comparator strips volatile timing fields (`ts`, `perfTs`,
`startPerfTs`, `duration`) before comparing, so timestamps never count as
divergences. The first structural difference — different `kind`,
different ordered values, different `traceId` topology — exits non-zero
and prints the divergence point.

## Related

- [Cooperative Concurrency](/docs/managed-react/cooperative-concurrency) —
  per-handler `handlerPolicy`, `$cancel`, and `handlerTimeoutMs` sit on
  top of the scheduler shipped here.
- [Audit-Grade Observability](/docs/managed-react/audit-grade-observability) —
  the `traceId` partitioning and the trace-export format the replay
  harness consumes.
- [Reactive Cycle Detection](/docs/managed-react/reactive-cycle-detection) —
  the convergence detector shared with the FIFO scheduler's chain-budget
  guard.
- [Structured Exception Model](/docs/managed-react/structured-exception-model) —
  errors in a queued chain surface through `AppError` rather than being
  silently swallowed.

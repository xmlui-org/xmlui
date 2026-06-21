# Event Handler Yield Benchmark Findings

Date: 2026-06-21

## Subject

Benchmark for event-handler yield checkpoint optimization in
`xmlui/src/examples/handler-loop-benchmark/Main.xmlui`.

## Benchmark Loop

Both async and sync variants compute:

```js
let sum = 0;
let i = 0;
while (i <= 300000) {
  sum += i;
  i++;
}
```

Expected sum: `45000150000`.

## Measurements

Earlier async baseline after time-based yield guards but before cheap-statement
pruning and loop-level pacing:

```text
async elapsed ms: about 165.8
sync elapsed ms: about 1.6
```

Automated Playwright measurement after shared helper emission, cheap-statement
checkpoint pruning, and loop-level pacing:

```text
async elapsed ms: 1.699999988079071
sync elapsed ms: 1.600000023841858
async sum: 45000150000
sync sum: 45000150000
```

## Interpretation

The async benchmark is now close to the sync benchmark for this tight arithmetic
loop because the generated loop no longer calls `__xmluiYieldIfNeeded` after
each cheap handler-local statement. The loop still has cooperative pacing via a
generated counter that checks the time-based yield helper every 256 iterations.

The remaining code-size follow-up is to consider importing the shared yield
helper from runtime rather than emitting it as a module-local singleton. That is
not required for the current benchmark behavior.

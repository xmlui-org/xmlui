# Measure performance with App.mark

To time XMLUI hotspots, use `App.now()`, `App.mark()`, and `App.measure()`. They
are the sandbox-safe replacements for the browser's `performance.*` API (which is
banned in XMLUI scripts), and every mark and measure is pushed to the Inspector
trace so you can read it in the timeline.

## Mark and measure

`App.mark(label)` records a named timing mark; `App.measure(label, fromMark)`
returns the elapsed milliseconds since that mark. Click **Mark start**, wait a
moment, then **Mark end + measure**:

```xmlui-pg copy display name="Measure elapsed time with App marks" height="200px"
---app display
<App var.ms="{null}">
  <VStack padding="$space-4" gap="$space-2">
    <HStack gap="$space-2">
      <Button label="Mark start" onClick="App.mark('start')" />
      <Button label="Mark end + measure" onClick="ms = App.measure('span', 'start')" />
    </HStack>
    <Text value="{ms === null ? 'No measurement yet' : 'Elapsed: ' + ms.toFixed(1) + ' ms'}" />
  </VStack>
</App>
```

`App.measure` returns the number for use in markup (above); it *also* pushes an
`app:measure` record to the Inspector trace, alongside the `app:mark` records
each `App.mark` emits.

## Read the marks in the Inspector

Each `App.mark(label)` pushes an `app:mark` record carrying `label`, `ts` (a
Unix-ms timestamp from `Date.now()`), and `perfTs` (a high-resolution
`performance.now()` value). Because `ts` is on the same Unix-ms clock as a
host-side log, you can merge the two streams; and counting how many times a label
fired in a window ("this expression re-evaluated N times while typing") becomes a
grep over the trace rather than guesswork.

To find a hotspot: extract the suspected inline expression into a named function,
add an `App.mark` at its top, and read the trace — don't infer downstream cost by
eyeballing raw handler timings.

## Key points

**The `App` timing API replaces `performance.*`.** `App.now()` is a
high-resolution timestamp; `App.mark(label)` records a named mark; `App.measure(label,
fromMark, toMark?)` returns elapsed milliseconds. All three write to the Inspector
trace.

**Raw `performance.now/mark/measure` is banned.** Under `strictDomSandbox` the
bundle blocks the `performance` global and points you at `App.now()` / `App.mark()`;
reach for the `App` API instead.

**Instrument named functions, don't eyeball traces.** Move the code you suspect
into a named function and mark it. Marks give a hard record per region; inferring
re-evaluation cost from handler timings alone is speculation.

---

## See also

- [Scripting](/docs/guides/scripting) — the `xs` language and its restrictions
- [App component](/docs/reference/components/App) — the `App` namespace

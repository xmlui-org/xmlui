# Keep sync-callback attributes to one expression

A few component attributes are **sync callbacks** — the engine runs them during
evaluation/render, and they accept only a **single arrow expression**. A `{ }`
statement block throws `Only arrow expression allowed in sync callback`. This is
stricter than event handlers (`onClick` and friends), and the error doesn't name
the offending attribute, so it helps to recognize the class.

## A sync callback takes one arrow expression

`Slider`'s `valueFormat` is a sync callback. Give it one arrow **expression**
that returns the display string:

```xmlui-pg copy display name="A sync callback takes one arrow expression" height="200px"
---app display
<App var.pct="{40}">
  <VStack padding="$space-4" gap="$space-2">
    <Text value="Selected: {pct}%" />
    <Slider
      initialValue="{pct}"
      minValue="{0}"
      maxValue="{100}"
      step="{5}"
      valueFormat="{(v) => v + '%'}"
      onDidChange="(v) => pct = v" />
  </VStack>
</App>
```

Wrap that same body in braces and it fails:

```xmlui
<!-- ❌ throws: "Only arrow expression allowed in sync callback" -->
<Slider valueFormat="{(v) => { return v + '%' }}" />

<!-- ✅ single arrow expression -->
<Slider valueFormat="{(v) => v + '%'}" />
```

## Key points

**Sync callbacks accept a single arrow expression, not a statement block.** The
engine evaluates them synchronously during render, so `(v) => { … }` with a body
block throws `Only arrow expression allowed in sync callback`. Use
`(v) => <expression>`.

**The known sync-callback attributes** (as of the current engine): `Slider`
`valueFormat`; `Table` `rowDisabledPredicate` and `rowUnselectablePredicate`;
`List` `groupBy` and `rowUnselectablePredicate`. The error message doesn't say
which attribute offended — if you see it, look for one of these.

**Event handlers are different — they allow blocks.** `Button.onClick`,
`onDidChange`, and other `on*` events run asynchronously and accept
multi-statement blocks. Only the sync-callback attributes above are restricted.

**Don't compute inside a sync callback.** If the value needs real work, derive it
in a top-level binding or a named function and reference that — keep the callback
itself a one-line expression.

---

## See also

- [Scripting](/docs/guides/scripting) — the `xs` language and its restrictions
- [Slider component](/docs/reference/components/Slider) — `valueFormat`
- [List component](/docs/reference/components/List) — `groupBy`, `rowUnselectablePredicate`
- [Table component](/docs/reference/components/Table) — `rowDisabledPredicate`, `rowUnselectablePredicate`

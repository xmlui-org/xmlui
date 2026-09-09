# Align columns across loop rows

Give sibling rows in an `Items` or `List` loop a shared column width by deriving
that width from your data. XMLUI has no content-derived column sizing — not in a
loop, and not in `Table` either — so the width has to come from somewhere, and
the data is the cheapest place to get it.

Start by naming which of these you actually need:

| Goal | Where it exists |
| --- | --- |
| A share of the leftover row space | `width="*"` / `"2*"` on any layout child |
| A fixed width every row repeats | `width="120px"` on the same child in each row |
| A column that measures its own cells and fits the longest one | **Nowhere** — derive it from the data |

## There is no `Column`-style content sizing, inside `Table` or outside it

This is worth stating plainly, because the absence is easy to read as a failed
search. A `Column` with no `width` does **not** auto-size to its content — it
falls back to `1*`, exactly as if you had written `width="*"`, and takes an equal
share of the remaining space.

The table below proves it. Both columns hold the same data. The first gets a
width computed from the longest path; the second is left widthless and truncates:

```xmlui-pg copy display name="A widthless Column takes 1*, it does not fit its content" height="260px"
<App
  var.files="{[
    { path: 'README.md' },
    { path: 'app/tools/components/Worklist.xmlui' }
  ]}"
  var.pathPx="{files.reduce((widest, file) 
    => Math.max(widest, file.path.length), 0) * 8 + 24}">
  <Table data="{files}">
    <Column bindTo="path" header="Derived width" width="{pathPx}px" />
    <Column bindTo="path" header="No width (1*)" />
  </Table>
</App>
```

Outside `Table` the situation is the same, for a different reason: each row an
`Items` loop renders is its own layout context. Nothing measures row 2 in order
to widen row 1. The near neighbours each solve a different problem — **star
sizing** is proportional, **`SpaceFiller`** absorbs slack inside a single row,
**`TileGrid`** gives every tile the same fixed `itemWidth`, and
**`itemWidth="fit-content"`** makes each row hug *its own* content, so the rows
disagree with each other by design.

Star sizing fails in a way worth seeing, because it fails twice. The short path
leaves its column half empty; the long one overflows and shoves its neighbour
sideways, so the `Changes` values no longer line up with each other *or* with
the header:

```xmlui-pg copy display name="Star widths are proportional, so rows drift apart" height="240px"
<App>
  <VStack width="330px" gap="$space-1">
    <HStack gap="$space-3">
      <Text width="2*" variant="strong" value="File" />
      <Text width="90px" variant="strong" value="Changes" />
    </HStack>
    <Items data="{[
      { path: 'README.md', changes: '+3 -1' },
      { path: 'app/tools/components/Worklist.xmlui', changes: '+253 -37' }
    ]}">
      <HStack gap="$space-3">
        <Text width="2*" variant="mono" value="{$item.path}" />
        <Text width="90px" value="{$item.changes}" />
      </HStack>
    </Items>
  </VStack>
</App>
```

## Derive the width from the data

The width is a function of your data, so compute it once and give the header and
every row the same number. For monospace content, character count *is* the
width, and `ch` converts it exactly — one `ch` is the width of the font's `0`
glyph:

```xmlui-pg copy display name="One derived width shared by header and rows" height="260px"
<App
  var.files="{[
    { path: 'README.md', changes: '+3 -1' },
    { path: 'src/main.ts', changes: '+12 -0' },
    { path: 'app/tools/components/Worklist.xmlui', changes: '+253 -37' }
  ]}"
  var.pathChars="{
    Math.min(48, Math.max(12,
      files.reduce((widest, file) => Math.max(widest, file.path.length), 0)
    )) + 2
  }">
  <VStack gap="$space-1">
    <HStack gap="$space-3">
      <Text 
        width="{pathChars}ch" 
        variant="mono" 
        fontWeight="$fontWeight-bold" value="File" 
      />
      <Text width="90px" variant="strong" value="Changes" />
    </HStack>
    <Items data="{files}">
      <HStack gap="$space-3">
        <Text width="{pathChars}ch" variant="mono" value="{$item.path}" />
        <Text width="90px" value="{$item.changes}" />
      </HStack>
    </Items>
  </VStack>
</App>
```

Three decisions are doing the work:

- **`reduce` over the data, not a DOM measurement.** The longest string is
  already known before anything renders, so there is no measurement pass, no ref
  collection, and no `ResizeObserver`.
- **`Math.max(12, …)` is a floor** so a set of short paths still leaves a
  readable column, and **`Math.min(48, …)` is a ceiling** so one pathological
  value cannot push the other columns off screen.
- **The `+ 2` is padding in character positions** — room for a chevron, a sort
  icon, or simply breathing space before the next column.

Because `pathChars` is a reactive variable, replacing `files` re-derives the
width and every row follows.

### Inside `Table`, use pixels or `rem` instead of `ch`

The same derivation works on a `Column`, but `ch` is not one of the units
`Column` accepts. `width="38ch"` is rejected at runtime with a console error —

```
[Table] Invalid TableColumnDef 'width' value: "38ch" (column "path").
Expected a number, a pixel value (e.g. "100px"), a rem/em value (e.g. "2rem"),
or (when allowed) a star-sized value (e.g. "*", "2*").
Falling back to the default width.
```

— and the column silently reverts to `1*`. `Column` takes a number, `px`,
`rem`/`em`, or a star size, so multiply the character count by an approximate
glyph width yourself, as the first example on this page does with `* 8 + 24`.
Note that `rem` resolves against the *root* font size, not the column's font, so
it does not track a monospace cell font the way `ch` does.

## Non-monospace content

`ch` measures the `0` glyph; it does not inspect your text. In a proportional
font it is an estimate, and a string of wide glyphs will overflow a width that a
string of narrow ones underfills. Two honest options:

- **Cap and truncate.** Keep the derived `ch` width as an estimate and let the
  text degrade predictably instead of overflowing — `maxLines="1"` with the
  default `overflowMode="ellipsis"` on the `Text`.
- **Widen the estimate.** Multiply the character count before converting, and
  accept a column that is a little loose rather than one that clips.

Mixing fonts is a separate trap: a proportional header and a monospace value
that both declare `width="20ch"` measure *different* rulers and end up
physically different widths. Give the header and the body cell the same font, as
the examples above do.

## Summary

**Nothing in XMLUI measures cell content to size a column.** Not `Items`, not
`List`, and not `Table` — a widthless `Column` is `1*`, an equal share of the
remaining space, not a fit to its longest value.

**Star sizing is the closest built-in, and it is proportional.** In a loop it
also lets a long value push its own row's later columns out of line with the
other rows, because each row is an independent layout context.

**Compute the width from the data and share the number.** `ch` makes that exact
for monospace content outside `Table`; inside `Table`, convert to `px` or `rem`,
because `Column` rejects `ch`. Clamp with a floor and a ceiling so neither empty
columns nor outlier values break the layout.

## See also

- [Use `ch` when width should track character count](/docs/howto/size-with-font-relative-units) —
  what `ch` measures, and why separate `ch` widths may not align
- [Auto-size column widths with star](/docs/howto/auto-size-column-widths-with-star) —
  how star sizing distributes space inside `Table`
- [Make a component hug its content with `fit-content`](/docs/howto/know-when-to-use-fit-content) —
  per-component hugging, which does not coordinate across rows
- [Build a master-detail layout](/docs/howto/build-a-master-detail-layout) —
  when a row needs detail shown alongside it
- [Table](/docs/reference/components/Table) — the full `Column` width vocabulary

# Display preformatted or monospace text

`Text` and `Markdown` render HTML underneath, so by default they collapse whitespace exactly the way a browser collapses whitespace in any tag: runs of spaces become one space, and line breaks disappear. Paste a log line with hand-aligned columns and it arrives as a single run-together line — the columns are gone before you ever get to the font.

```xmlui-pg copy display name="The default collapses whitespace"
<App>
  <VStack gap="$space-4">
    <VStack gap="$space-1">
      <Text variant="strong">Pasted as-is (default)</Text>
      <Text
        testId="collapsed"
        backgroundColor="$color-surface-100"
        padding="$space-2"
        value="ID    Name      Qty
1     apples    12
22    kiwi      3" />
    </VStack>
    <VStack gap="$space-1">
      <Text variant="strong">Same string, preserveLinebreaks="true"</Text>
      <Text
        testId="preserved"
        backgroundColor="$color-surface-100"
        padding="$space-2"
        preserveLinebreaks="true"
        value="ID    Name      Qty
1     apples    12
22    kiwi      3" />
    </VStack>
  </VStack>
</App>
```

The first block renders as one line: `ID Name Qty 1 apples 12 22 kiwi 3`. Every line break and every run of spaces collapsed to a single space, because that's what `white-space: normal` — the CSS default — does. Nothing about the *data* changed; only the rendering did.

## `preserveLinebreaks` keeps the newlines

Set `preserveLinebreaks="true"` on `Text` (or `Link`, or `Heading`) for the common case of "keep my newlines." Under the hood this switches the element to `white-space: pre-wrap`, which does two things: it stops collapsing runs of spaces *and* it stops discarding line breaks. The second block above renders as three separate lines, each with its internal spacing intact.

> **Use `value`, not nested children.** The Text docs call this out for a reason: nesting the string as a child collapses embedded line breaks before the component ever sees `preserveLinebreaks`. Put multi-line content in the `value` attribute.

`pre-wrap` still **wraps** at the container edge when a line is too long to fit — it preserves whitespace, not layout. That distinction is the rest of this how-to.

## Two separate decisions: spacing and font

`preserveLinebreaks` decides whether whitespace survives. It says nothing about the *font*. A proportional font gives every character a different width, so even with every space and line break intact, columns built from spaces will not line up — `apples` and `kiwi` are different widths, so the numbers after them land in different places. Fixed-width output needs a **second**, independent decision: a monospace font, so every character (including a space) occupies the same width and a column of spaces lines up the way it did when the text was authored.

```xmlui-pg copy display name="Spacing vs monospace: two separate decisions" height="420px"
<App var.report="ID    Name      Qty
1     apples    12
22    kiwi      3">
  <VStack gap="$space-4">
    <VStack gap="$space-1">
      <Text variant="strong">preserveLinebreaks only — proportional font, columns drift</Text>
      <Text
        testId="proportional"
        backgroundColor="$color-surface-100"
        padding="$space-2"
        preserveLinebreaks="true"
        value="{report}" />
    </VStack>
    <VStack gap="$space-1">
      <Text variant="strong">monospace variant only — whitespace still collapses</Text>
      <Text
        testId="mono-only"
        backgroundColor="$color-surface-100"
        padding="$space-2"
        variant="code"
        value="{report}" />
    </VStack>
    <VStack gap="$space-1">
      <Text variant="strong">Both together — the columns actually line up</Text>
      <Text
        testId="mono-preserved"
        backgroundColor="$color-surface-100"
        padding="$space-2"
        preserveLinebreaks="true"
        variant="code"
        value="{report}" />
    </VStack>
  </VStack>
</App>
```

Read the three blocks in order and the trap is visible: the first *looks* like it should be enough — the raw text is right there, spacing and all — but the columns still don't align, because a proportional font renders `1` and `22` at different widths regardless of how many spaces separate them from the next column. The second block proves the font alone isn't the answer either: `variant="code"` switches the font family, but with no `preserveLinebreaks` the runs of spaces are gone and the "table" is a single run-on line again. Only the third block, with both props set, gets a rendered table where a column of digits actually stacks — do only one and the output looks nearly right, which is worse than looking obviously wrong, because it invites shipping it.

One variant is a shortcut worth knowing, and also a trap of its own: `variant="mono"` renders a native `<pre>` element rather than an inline tag, and `<pre>` is preformatted by the browser's own default stylesheet — so `variant="mono"` *alone*, with no `preserveLinebreaks`, already preserves whitespace and line breaks. `code` and `sample` are also monospace variants but render `<code>`/`<samp>`, which carry no such default — they behave like the middle block above, font changed and nothing else. "Monospace variant" does not imply "preserves whitespace"; it depends on which variant, so setting `preserveLinebreaks` explicitly is the mechanism that works regardless of which one you pick.

## Overflow: preformatted text doesn't wrap, so bound it and scroll

`preserveLinebreaks`'s `pre-wrap` still wraps long lines to fit its container — useful for prose-shaped text with occasional line breaks, wrong for a wide ASCII table or a long log line, where wrapping breaks the very alignment you preserved the whitespace to get. True "don't touch my layout" text needs the generic [`whiteSpace`](/docs/styles-and-themes/layout-props#whitespace) layout property set to `"pre"` instead — every component accepts it, not just `Text` — which preserves whitespace **and** refuses to wrap. A line rendered with `whiteSpace="pre"` is exactly as wide as its longest row, so put it in a width-bound container with `overflowX="auto"` and let *that* box scroll horizontally. Don't leave it unbounded — an unbounded `pre` line pushes the whole page into horizontal scroll, taking your layout down with it.

```xmlui-pg copy display name="No wrap: bounded horizontal scroll"
<App var.wideLine="request_id=8f2c1a   status=200   latency_ms=42   path=/api/v1/orders/8842   user=jon@example.com">
  <VStack gap="$space-4">
    <VStack gap="$space-1">
      <Text variant="strong">preserveLinebreaks in a narrow box — wraps, breaks the columns</Text>
      <VStack testId="wrap-box" width="280px" borderWidth="1px" borderColor="$color-surface-300" padding="$space-2">
        <Text preserveLinebreaks="true" variant="mono" value="{wideLine}" />
      </VStack>
    </VStack>
    <VStack gap="$space-1">
      <Text variant="strong">whiteSpace="pre" in a scrollable box — stays one line, scrolls</Text>
      <VStack testId="scroll-box" width="280px" overflowX="auto" borderWidth="1px" borderColor="$color-surface-300" padding="$space-2">
        <Text testId="scroll-text" whiteSpace="pre" variant="mono" value="{wideLine}" />
      </VStack>
    </VStack>
  </VStack>
</App>
```

The first box wraps the line to fit 280px — readable, but the moment this is a table instead of one line, wrapping destroys the column alignment `variant="mono"` just bought back. The second box holds its single line at full width and scrolls horizontally inside its own border, so the *page* never gains a sideways scrollbar just because one log line is long.

## Which mechanism: `Text` props, or a Markdown code block?

Both `Text` (composed from `preserveLinebreaks` or `whiteSpace="pre"`, plus `variant="mono"`/`"code"`) and `Markdown` can produce preformatted output, and it's worth trying both before picking one.

**A `Markdown` fenced or indented code block wins for anything that's fundamentally a block of static or log-shaped text.** Indent a block four spaces (or fence it with triple backticks) and `Markdown` renders it as a native HTML `<pre><code>` element — preformatted and monospace *by construction*, with no props to remember. The theme already ships `fontFamily-Text-codefence: $fontFamily-monospace` and `overflow-x: auto` on that element, so the whitespace-preservation, monospace-font, and no-page-scroll decisions above are all made correctly for you, by default, rather than assembled from three separate props:

```xmlui
<Markdown>
  <![CDATA[
    ID    Name      Qty
    1     apples    12
    22    kiwi      3
  ]]>
</Markdown>
```

**`Text` wins when the content isn't static markup** — when you're composing it from a bound expression, need `Text`-only features like `highlightText` or `segments`, or want the preformatted run inline among other styled `Text` runs rather than as its own block. In that case, reach for `preserveLinebreaks` (or `whiteSpace="pre"` when it must not wrap) plus `variant="mono"` or `"code"`, exactly as shown above.

**A theme-variable "recipe" loses.** The idea is a custom `Text` variant that bakes in the whitespace handling, and it fails not for lack of trying: custom variants only cover the documented text-property allowlist (`fontFamily`, `textColor`, `letterSpacing`, and the rest), and `whiteSpace` isn't on it. A variant can select the monospace font for you, but it can't flip whitespace handling, so you're back to setting `preserveLinebreaks` or `whiteSpace` on the instance regardless — a bespoke variant buys nothing a plain prop doesn't already give you.

## Key points

**The default collapses whitespace.** `Text` and `Markdown` render HTML, so runs of spaces and line breaks collapse unless told otherwise. This is the first thing to know, not a footnote.

**`preserveLinebreaks="true"`** (`Text`, `Link`, `Heading`) keeps line breaks *and* internal runs of spaces — it renders `white-space: pre-wrap` — but still wraps long lines to fit the container.

**Preserving spacing and using a monospace font are two independent decisions.** `preserveLinebreaks` alone keeps the raw text but not the alignment in a proportional font; `variant="code"` or `"sample"` alone keeps the font but not the spacing. (`variant="mono"` is the one exception — it renders a native `<pre>`, which preserves whitespace on its own.) Fixed-width output needs both decisions made, however you get there.

**For content that must not wrap**, use the generic `whiteSpace="pre"` layout property (available on any component, not just `Text`) inside a width-bound container with `overflowX="auto"`, so the bounded box scrolls horizontally instead of the page.

**A `Markdown` fenced or indented code block gets all three — preserved whitespace, monospace font, bounded horizontal scroll — with no extra props**, because it renders a native `<pre><code>` element. Prefer it for static or log-shaped content; compose `Text` props when the content is dynamic or needs `Text`-specific features.

---

## See also

- [Text component](/docs/reference/components/Text) — `preserveLinebreaks`, `variant`, and the full property list
- [Markdown component](/docs/reference/components/Markdown) — fenced code blocks, `overflowMode`, `breakMode`
- [Layout Properties](/docs/styles-and-themes/layout-props#whitespace) — the generic `whiteSpace` and `overflowX` properties, available on every component
- [Style text with custom variants](/docs/howto/style-text-with-custom-variants) — the `{cssProperty}-Text-{variant}` pattern, and why it can't cover `whiteSpace`
- [Wrap long text in a Link](/docs/howto/wrap-long-text-in-a-link) — the opposite problem: making text wrap that doesn't by default

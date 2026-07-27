# Highlight matching text inside Markdown

Wrap every occurrence of a search string in rendered Markdown with a `<mark>`,
and step through the matches — using the `Markdown` component's `highlightText`,
`highlightActive`, and `highlightActiveIndex` props.

> [!NOTE]
> Plain `Markdown` emits **no** `<mark>` for a substring on its own. There is no
> hidden "find" behaviour to switch on — highlighting happens only when you set
> `highlightText`. If you are hunting for why a `<mark>` never appears, this is
> the answer: the prop is opt-in.

## Highlight as you type

Bind `highlightText` to a search box. Every case-insensitive occurrence in the
rendered content — across prose, code, and links — is wrapped in a `<mark>`:

```xmlui-pg copy display name="Highlight as you type" height="360px"
<App var.query="scroll">
  <VStack gap="$space-2">
    <TextBox
      placeholder="Highlight in the text below…"
      width="260px"
      value="{query}"
      onDidChange="(v) => query = v" />
    <Markdown highlightText="{query}"><![CDATA[
## Scrolling in XMLUI

The **scroll** position of a region is owned by one container. When a
scroller nests inside another scroller, the inner one can defer its scroll to
the outer one — give the inner region a firm height, set
`scrollWholePage="false"`, and let one container own the scroll.

See [Fill the viewport with one internal scroll region](/docs/howto/build-a-full-height-scroll-layout)
for the whole-page scroll case.
    ]]></Markdown>
  </VStack>
</App>
```

Type `scroll`: the word lights up in the heading, the prose, the inline
`scrollWholePage` code, and the link text at once. Clear the box and the marks disappear. A search shorter
than two characters is a no-op, so a single stray keystroke doesn't paint the
whole document.

## Step through the matches

`highlightText` marks *every* occurrence. To make *one* of them the active match
— emphasized with a distinct colour and scrolled into view — use
`highlightActiveIndex` (a 0-based index across the whole block). `highlightActive`
is the boolean shorthand for "the first one."

Pair it with a find toolbar to get next/previous navigation and a match count:

```xmlui-pg copy display name="Step through matches" height="360px"
<App
  var.doc="{`This region owns its scroll. A bounded region caps its own scroll, while an unbounded region defers to its parent. Give every scrolling region a firm height, and the region behaves. When one region contains another region, only the inner region should scroll.`}"
  var.query="region"
  var.active="{0}"
  var.total="{query.length < 2 ? 0 : doc.toLowerCase().split(query.toLowerCase()).length - 1}">
  <VStack gap="$space-2">
    <HStack verticalAlignment="center" gap="$space-2">
      <TextBox
        placeholder="Find…"
        width="180px"
        value="{query}"
        onDidChange="(v) => { query = v; active = 0; }" />
      <Button
        icon="chevronleft"
        variant="outlined"
        enabled="{total > 0}"
        onClick="active = Math.max(0, active - 1)" />
      <Button
        icon="chevronright"
        variant="outlined"
        enabled="{total > 0}"
        onClick="active = Math.min(active + 1, total - 1)" />
      <Text
        variant="secondary"
        value="{query.length < 2 ? 'Type 2+ characters' : (total === 0 ? 'No matches' : (Math.min(active, total - 1) + 1) + ' of ' + total)}" />
    </HStack>
    <Markdown
      content="{doc}"
      highlightText="{query}"
      highlightActiveIndex="{total === 0 ? -1 : Math.min(active, total - 1)}" />
  </VStack>
</App>
```

Next/previous move `highlightActiveIndex`; the active match takes the
`markActive` colour while the rest keep the plain `mark` colour, and it scrolls
into view when it is off-screen.

## Key points

**`highlightText` is opt-in and case-insensitive.** Every occurrence of the
string in the rendered content is wrapped in a `<mark>` — prose, code, and link
text alike. An empty string, or one shorter than two characters, highlights
nothing.

**`highlightActiveIndex` picks the active match.** It is 0-based and counts every
occurrence in the block. `-1` or unset means no active match. `highlightActive="true"`
is the shorthand for index `0`. The active match is both recoloured and scrolled
into view.

**Style the marks with theme variables.** The regular highlight uses
`backgroundColor-mark-markdown` and `textColor-mark-markdown`; the active match
uses `backgroundColor-markActive-markdown`. Override them to match your palette.

**Counting and clamping is your job.** The component highlights and scrolls; it
does not expose a match count or clamp the index. Derive the total from the
source text (as `total` does above) and keep the index in `[0, total - 1]`.

---

**See also**
- [Markdown component](/docs/reference/components/Markdown) — `highlightText`, `highlightActive`, `highlightActiveIndex` props
- [Pin a toolbar above a bounded scroll region](/docs/howto/pin-a-toolbar-above-a-bounded-scroll-region) — the find/filter toolbar layout this pairs with

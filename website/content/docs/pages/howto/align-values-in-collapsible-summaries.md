# Align values in collapsible section summaries

A list of collapsible sections often wants its collapsed rows to read like a
table: an amount, then a label, with the amounts lined up in a column. Whether
you can get real columns depends on where the list is written.

| Where the list is written | What the summary can hold | How the column lines up |
| --- | --- | --- |
| XMLUI markup, `ExpandableItem` | Components | Layout, exactly, in any font |
| Markdown, `> [!DETAILS]` | One trimmed plain string | Invisible spacing characters, and only with tabular figures |

In XMLUI, the summary of an `ExpandableItem` is a slot that holds components, so
a collapsed row can have real columns. In Markdown, a `[!DETAILS]` summary is a
plain string, so the collapsed view has no structure, and the best you can do is
imitate columns with typography. **If the collapsed view needs structure, build
that part in XMLUI.**

## Build the summary from components

`ExpandableItem` accepts its `summary` either as text or, through
`<property name="summary">`, as a component tree. Put an `HStack` there with a
fixed-width, end-aligned `Text` for the value and a second `Text` for the label:

```xmlui-pg copy display name="Aligned values in ExpandableItem summaries" height="320px"
<App>
  <Items data="{[
    { amount: '1,850', title: 'Rent', note: 'Paid on the 1st.' },
    { amount: '884', title: 'Groceries', note: 'Four trips to the market.' },
    { amount: '211', title: 'Utilities', note: 'Power, water and internet.' },
    { amount: '7', title: 'Parking', note: 'One meter, downtown.' }
  ]}">
    <ExpandableItem>
      <property name="summary">
        <HStack gap="$space-3">
          <Text width="4rem" textAlign="end" value="{$item.amount}" />
          <Text value="{$item.title}" />
        </HStack>
      </property>
      <Text value="{$item.note}" />
    </ExpandableItem>
  </Items>
</App>
```

Every row gives its value the same `4rem` box and aligns the text to that box's
end, so the right edges of the amounts coincide and the labels all start at the
same place. Layout does the aligning: it doesn't depend on the font, on the
digits, or on any invisible characters. Size the width to your longest value;
[Align columns across loop rows](/docs/howto/align-columns-across-loop-rows)
shows how to derive it from the data.

This is the answer whenever you can write the list as XMLUI, for example with
`Items` over your data, instead of as Markdown text.

## Collapsible sections in Markdown

The `Markdown` component turns a blockquote whose first line starts with
`[!DETAILS]` into a collapsible section. The rest of that first line becomes the
summary, and the following lines become the content:

```xmlui-pg copy display name="A DETAILS block in Markdown" height="300px"
<App>
  <Markdown>
    <![CDATA[
> [!DETAILS] Rent
> Paid on the 1st.

> [!DETAILS] Groceries
> Four trips to the market.
]]>
  </Markdown>
</App>
```

Under the hood this is an `ExpandableItem` too, but the Markdown path hands it
the summary as a string: the text after `[!DETAILS]`, with leading and trailing
whitespace trimmed. There is no Markdown syntax that reaches the component
summary slot, so a `[!DETAILS]` summary can't contain an `HStack`, a
fixed-width box, or anything else that would make a column.

The trim matters for the next section. A figure space (U+2007) counts as
whitespace, so padding at the start of a summary disappears. A Braille pattern
blank (U+2800) looks just as empty but is a symbol, not whitespace, so it
survives the trim and protects the spaces after it.

Both rows below start with the same three figure spaces before the `7`. They are
not meant to line up: the gap between them is the point. In the first row the
padding is trimmed and the `7` sits at the left edge; in the second the anchor
keeps the padding and the `7` is pushed to the right.

```xmlui-pg copy display name="Leading figure spaces are trimmed; an anchor keeps them" height="300px"
<App>
  <Markdown>
    <![CDATA[
> [!DETAILS] &#x2007;&#x2007;&#x2007;7 — no anchor: padding trimmed
> The figure spaces were trimmed away.

> [!DETAILS] &#x2800;&#x2007;&#x2007;&#x2007;7 — anchor: padding kept
> The anchor kept the figure spaces.
]]>
  </Markdown>
</App>
```

The examples write the invisible characters as numeric character references
(`&#x2007;`), which the Markdown parser decodes. That keeps them visible in the
source, where a literal figure space would be indistinguishable from an
ordinary one.

## If the content has to stay in Markdown

When the list really must be Markdown text, you can imitate a right-aligned
column by padding each summary to the same width with spaces that are exactly
as wide as the characters they stand in for:

| Character | Code point | Role |
| --- | --- | --- |
| Braille pattern blank | U+2800 | Anchor at the start of every summary, so the trim can't remove the padding |
| Figure space | U+2007 | Stands in for a missing digit; defined as the width of a digit |
| Punctuation space | U+2008 | Stands in for a missing thousands comma; defined as the width of a period |

Each row gets the anchor, then enough padding to make up the width of the
longest value. With `1,850` as the widest, `884` needs one digit slot and the
comma slot, and `7` needs three digit slots and the comma slot.

**This works only with tabular figures.** A figure space is as wide as a
*tabular* digit, one of a set of digits that all share the same width. XMLUI's
default font, Inter, uses proportional digits unless told otherwise, so its
digits differ in width and the padded column drifts. Here is the recipe in the
default font:

```xmlui-pg copy display name="The padded recipe with proportional digits" height="220px"
<App>
  <Markdown>
    <![CDATA[
> [!DETAILS] &#x2800;1,850 — Rent
> Paid on the 1st.

> [!DETAILS] &#x2800;&#x2007;&#x2008;884 — Groceries
> Four trips to the market.

> [!DETAILS] &#x2800;&#x2007;&#x2008;211 — Utilities
> Power, water and internet.

> [!DETAILS] &#x2800;&#x2007;&#x2008;&#x2007;&#x2007;7 — Parking
> One meter, downtown.
]]>
  </Markdown>
</App>
```

The em dashes don't line up: the rows disagree by a few pixels. To switch on
tabular figures, set the `fontVariant` layout property on the `Markdown`
component to `tabular-nums`. The property sets the CSS `font-variant`
shorthand, which accepts `tabular-nums`, and the setting is inherited by the
summaries inside:

```xmlui-pg copy display name="The padded recipe with tabular figures" height="220px"
<App>
  <Markdown fontVariant="tabular-nums">
    <![CDATA[
> [!DETAILS] &#x2800;1,850 — Rent
> Paid on the 1st.

> [!DETAILS] &#x2800;&#x2007;&#x2008;884 — Groceries
> Four trips to the market.

> [!DETAILS] &#x2800;&#x2007;&#x2008;211 — Utilities
> Power, water and internet.

> [!DETAILS] &#x2800;&#x2007;&#x2008;&#x2007;&#x2007;7 — Parking
> One meter, downtown.
]]>
  </Markdown>
</App>
```

Now the em dashes share one position. Two cautions remain:

- **It depends on the font.** The font has to provide tabular figures, and its
  punctuation space has to match its comma. Change the font and check the
  column again.
- **Use the layout property, not the theme variable.** `ExpandableItem` lists a
  `fontVariant-summary-ExpandableItem` theme variable, but setting it through
  `Theme` leaves `font-variant-numeric` at `normal` on the summary, and the
  column still drifts.

## Summary

**An `ExpandableItem` summary written in XMLUI holds components.** A fixed-width,
end-aligned `Text` in an `HStack` gives exact columns in any font, with no
special characters.

**A `[!DETAILS]` summary written in Markdown is one trimmed string.** It has no
columns to align; the U+2800 / U+2007 / U+2008 padding recipe only imitates
them, and only with tabular figures, which you switch on with
`fontVariant="tabular-nums"` on the `Markdown` component.

**If the collapsed view needs structure, build that part in XMLUI.**

## See also

- [ExpandableItem](/docs/reference/components/ExpandableItem) — the `summary`
  property, text or component
- [Markdown](/docs/reference/components/Markdown) — the component that renders
  `[!DETAILS]`
- [Align columns across loop rows](/docs/howto/align-columns-across-loop-rows) —
  deriving a shared column width from the data
- [Layout properties: `fontVariant`](/docs/styles-and-themes/layout-props#fontvariant)

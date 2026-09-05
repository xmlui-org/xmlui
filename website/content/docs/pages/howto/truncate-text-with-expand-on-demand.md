# Truncate long text and expand it on demand

A description, comment, or log entry can consume too much vertical space when
it is shown in full. Use this pattern when the reader needs a compact preview
but must still be able to reveal the complete text. `Text`'s `maxLines` prop
creates the preview; a state toggle removes and restores that limit without
changing the underlying content.

## Clamp known-long text and toggle the full value

`maxLines` caps a `Text` at N lines, cropping the overflow with `…` by default.
Drive it from a boolean var: return the line limit while collapsed and
`undefined` while expanded. This first recipe assumes the content is known to
exceed the four-line preview.

```xmlui-pg copy display name="Clamp known-long text and expand on demand" id="clamp-known-long-text-and-expand-on-demand" height="360px"
<App var.expanded="{false}">
  <VStack
    width="320px"
    gap="$space-2"
    padding="$space-3"
    borderWidth="1px"
    borderColor="$color-surface-300"
  >
    <Text
      testId="description"
      maxLines="{expanded ? undefined : 4}"
      value="Field notes from the shakedown cruise: the new mast held through gusts recorded well above the manufacturer's rating, and the reefing lines ran clean on every pull, even wet and under load. Below decks the bilge stayed dry through six hours of a beam sea, and the batteries never dropped under 12.1 volts despite running the autopilot and instruments the whole leg. Two things to fix before the next passage: the port running light flickers when the boat heels past twenty degrees, and the anchor windlass needs a new solenoid, since it now takes two tries to bring the chain up." />
    <Button
      label="{expanded ? 'Show less' : 'Show more'}"
      onClick="expanded = !expanded" />
  </VStack>
</App>
```

The `expanded` var controls both the clamp and the button's explicit “Show
more / Show less” label. The full value always remains in the DOM—only its
visual clamp changes—so there is no need to slice or re-fetch the text.

If the content might already fit, avoid showing a useless expansion control.
The Text component's `hasOverflow()` method reports whether its current layout
overflows. It is a snapshot, not a reactive value: evaluate it after the text
has rendered, and recheck after any later content or width change. Run that
check from the lifecycle, data-loading, or resize path that owns those changes;
XMLUI does not currently emit an overflow-change event.

## Variations: crop without a marker, or force a single line

**`ellipses="false"` crops without the trailing marker.** Use it when the
container itself signals truncation (a fade, a "…" rendered separately) or
when the ellipsis character would clash with the content, like a fixed-width
code snippet.

```xmlui-pg copy display name="Crop with and without the ellipsis marker" id="crop-with-and-without-the-ellipsis-marker" height="200px"
<App>
  <VStack width="220px" gap="$space-4">
    <VStack gap="$space-1">
      <Text variant="strong">Default — crops with "…"</Text>
      <Text
        testId="withEllipsis"
        maxLines="1"
        value="This line is longer than the box, so it has to be cropped somehow" />
    </VStack>
    <VStack gap="$space-1">
      <Text variant="strong">ellipses="false" — crops with no marker</Text>
      <Text
        testId="withoutEllipsis"
        maxLines="1"
        ellipses="false"
        value="This line is longer than the box, so it has to be cropped somehow" />
    </VStack>
  </VStack>
</App>
```

Note the spelling: the prop is `ellipses`, not `ellipsis`.

**`maxLines="1"` truncates to a single line** — the common shape for
table-ish rows, list items, or anywhere a multi-line clamp would break the
row's fixed height:

```xmlui-pg copy display name="Single-line rows" id="single-line-rows" height="200px"
<App>
  <VStack
    width="240px"
    gap="$space-1"
    borderWidth="1px"
    borderColor="$color-surface-300"
    padding="$space-2">
    <Text testId="singleLineRow" maxLines="1">Q3 planning notes — budget review and headcount</Text>
    <Text maxLines="1">Renewal: annual support contract with Meridian Labs</Text>
    <Text maxLines="1">Incident retro — checkout latency spike on 08-14</Text>
  </VStack>
</App>
```

## Truncate custom content inside a Table cell

A plain `Column bindTo="..."` already truncates overflowing values. For custom
cell content, put `maxLines="1"` on the descendant `Text` in the same way. The
current layout engine lets nested `Link` and `HStack` elements shrink with the
cell, so no `minWidth` workaround is required:

```xmlui-pg copy display name="Truncate custom Table cell content" id="truncate-custom-table-cell-content" height="280px"
<App>
  <Table
    data="{[
      { id: 1, name: 'Short', status: 'Ready' },
      { id: 2, name: 'A moderately long name that should truncate with ellipsis', status: 'Queued' },
      { id: 3, name: 'Another very long name that definitely overflows its column when it is not truncated properly', status: 'Needs review' }
    ]}"
    width="460px"
  >
    <Column header="ID" width="60px" bindTo="id" />
    <Column header="Name" width="2*" bindTo="name">
      <Link to="/items/{$item.id}">
        <HStack gap="$space-2" verticalAlignment="center">
          <Icon name="trash" />
          <Text testId="cellText-{$item.id}" value="{$cell}" maxLines="1" />
        </HStack>
      </Link>
    </Column>
    <Column header="Status" width="100px" bindTo="status" />
  </Table>
</App>
```

The long name stays inside the middle column and the Status column remains
visible. This nested-content case is covered because it previously regressed
in [#2936](https://github.com/xmlui-org/xmlui/issues/2936).

## Key points

**`maxLines` clamps by line count, not character count.** It crops at the Nth
line regardless of how many characters that holds, so the clamp point
follows the container's width, not a fixed string length.

**Drive `maxLines` from a var to build "show more."** Return `undefined` to
remove the limit and a positive number to restore it. The underlying text
never changes—only the clamp does.

**`ellipses="false"` crops without the marker.** Default `true` appends `…`
at the clamp point; set it `false` to crop silently instead. The prop is
spelled `ellipses`.

**Do not show an expansion control unless the text overflows.** Call the
Text's `hasOverflow()` method after layout, and recheck it if later changes can
alter the text or its available width.

---

## See also

- [Text component](/docs/reference/components/Text) — `maxLines`, `ellipses`, and the full property list
- [Wrap long text in a Link](/docs/howto/wrap-long-text-in-a-link) — the opposite problem: making text wrap that doesn't by default
- [Display preformatted or monospace text](/docs/howto/display-preformatted-text) — preserve whitespace and line breaks instead of clamping them
- [Render a custom cell with components](/docs/howto/render-a-custom-cell-with-components) — the general pattern for putting components inside a `Column`

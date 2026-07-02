# Keep per-item state in an Items or List loop

Inside an `Items` or `List` iteration, each rendered row exposes the current
data through context variables — `$item`, `$itemIndex`, `$isFirst`, and
`$isLast` — but those are a **read-only view of the data**. When a row needs its
own *mutable* state (an editable quantity, a per-row toggle, an inline draft),
keep that state in the data array itself and update it by the item's stable
`id`.

```xmlui-pg copy display name="Per-row quantity, kept in the data array" height="360px"
<App var.rows="{[
    { id: 1, name: 'Coffee',    qty: 0 },
    { id: 2, name: 'Tea',       qty: 0 },
    { id: 3, name: 'Croissant', qty: 0 }
  ]}">
  <Text variant="caption">
    {rows.filter(r => r.qty !== 0).length} of {rows.length} rows changed
  </Text>
  <List data="{rows}">
    <HStack verticalAlignment="center" gap="$space-2">
      <Text width="8rem">{$item.name}</Text>
      <Button
        label="-"
        onClick="rows = rows.map(r => r.id === $item.id ? { ...r, qty: r.qty - 1 } : r)" />
      <Text width="2rem" textAlign="center">{$item.qty}</Text>
      <Button
        label="+"
        onClick="rows = rows.map(r => r.id === $item.id ? { ...r, qty: r.qty + 1 } : r)" />
    </HStack>
  </List>
  <Button
    label="Reset Tea"
    onClick="rows = rows.map(r => r.id === 2 ? { ...r, qty: 0 } : r)" />
</App>
```

## Key points

**`$item` is the row's data, not a place to store state**: `$item`,
`$itemIndex`, `$isFirst`, and `$isLast` are the context XMLUI hands each
rendered row ([Items](/docs/reference/components/Items)). Reading `$item.qty`
shows the current value; to *change* it you assign a new `rows` array, and the
row re-renders because it reads from `rows`.

**Update by stable `id`, never by `$itemIndex`**: Key every update off a stable
field from the data (`r.id === $item.id`). `$itemIndex` shifts the moment the
list is filtered, sorted, or reordered, so an index-keyed write would land on
the wrong row after any reordering.

**Replace the array, don't mutate in place**:
`rows = rows.map(r => r.id === $item.id ? { ...r, qty: r.qty + 1 } : r)` builds
a new array with one row changed. XMLUI detects the new reference and re-renders
the affected row and anything derived from `rows` (here the "N of M changed"
caption). This is the same map-and-spread update used in
[Disable menu items conditionally](/docs/howto/disable-menu-items-conditionally).

**Don't keep mutable state as a `var` inside a `List` row**: `List` virtualizes
— off-screen rows are unmounted and remounted as you scroll, so a `var.` local
to the row template is lost when the row scrolls away and reset when it returns.
Keep per-row state in the parent's data array (as above) so it survives
scrolling. See the virtualization note in
[Render a flat list with custom cards](/docs/howto/render-a-flat-list-with-custom-cards).
(`Items` does not virtualize, but keying state by `id` is still the more robust
pattern.)

## Reaching a specific row from outside the loop

You do **not** collect refs to row components, or give each row a unique
component `id` to call `setValue` on later. Row components come and go with
virtualization, so a stored ref would dangle. Instead, write the same keyed
state from wherever you are — the "Reset Tea" button above reaches one row
purely by its `id`:

```xmlui
<Button
  label="Reset Tea"
  onClick="rows = rows.map(r => r.id === 2 ? { ...r, qty: 0 } : r)" />
```

The row re-renders reactively because it reads `$item.qty` from `rows`. The one
built-in "address a row by id" affordance is *scrolling*: `List` exposes
`scrollToId(id)` and `scrollToIndex(n)` to bring a row into view — see
[Keep a list scrolled to the newest item](/docs/howto/follow-a-list-to-the-bottom).

## When the row template crosses a component boundary

If the row template — or another consumer of the state — lives inside a
user-defined component, promote `var.rows` to `global.rows`. Subtree variables
(`var.`) don't cross user-defined-component boundaries; a `global` is readable
and writable from any component. See
[Toggle multiple items with shared state](/docs/howto/toggle-multiple-items-with-shared-state)
and [Scoping](/docs/guides/scoping).

---

## See also

- [Toggle multiple items with shared state](/docs/howto/toggle-multiple-items-with-shared-state) — track a set of selected/hidden items in one shared array
- [Disable menu items conditionally](/docs/howto/disable-menu-items-conditionally) — the map-and-spread update, plus per-row derived state (`selected?.id === $item.id`)
- [Render a flat list with custom cards](/docs/howto/render-a-flat-list-with-custom-cards) — the `List` virtualization caveat in full
- [Communicate between sibling components](/docs/howto/communicate-between-sibling-components) — the subtree-variable-vs-global decision

# Correlate a Table with another view

Hovering a `Table` row highlights the matching rows in a companion view below it; clicking pins the highlight so it survives scrolling and pointer movement, until the same row is clicked again or another row is clicked.

The views are linked by a shared key: the Table's `id` matches each companion item's `orderId`. The example keeps that key visible as an **Order** column and label, so the relationship is understandable before you hover.

The state model is two variables: one holds the transient hover target, the other holds the pinned target. `onRowEnter` and `onRowLeave` set and clear the hover variable, but only while nothing is pinned — once a pin is live, hovering a different row must not steal the highlight. `onRowClick` toggles the pin: the same row releases it, a different row moves it. Every surface that needs to know "what's active right now" reads `pinned ?? hovered` — the pin wins when present, the hover value stands in when it isn't.

```xmlui-pg copy display name="Hover to highlight, click to pin" height="700px"
---app display
<App
  var.hoveredId="{null}"
  var.pinnedId="{null}"
  var.orders="{[
    { id: 1, customer: 'Acme Corp', total: 420 },
    { id: 2, customer: 'Globex', total: 150 },
    { id: 3, customer: 'Initech', total: 980 }
  ]}"
>
  <VStack gap="$space-4">
    <Table
      data="{orders.map(order => ({
        ...order,
        isActive: (pinnedId ?? hoveredId) === order.id
      }))}"
      onRowEnter="(item) => { if (!pinnedId) hoveredId = item.id; }"
      onRowLeave="() => { if (!pinnedId) hoveredId = null; }"
      onRowClick="(item) => {
        pinnedId = pinnedId === item.id ? null : item.id;
      }"
    >
      <Column bindTo="id" header="Order" width="80px" />
      <Column bindTo="customer" header="Customer">
        <Text
          testId="{'order-' + $item.id}"
          width="100%"
          backgroundColor="{$item.isActive ? '$color-primary-100' : ''}"
        >{$cell}</Text>
      </Column>
      <Column bindTo="total" header="Total">
        <Text
          width="100%"
          backgroundColor="{$item.isActive ? '$color-primary-100' : ''}"
        >${$cell}</Text>
      </Column>
    </Table>

    <Text variant="secondary">
      Shared Order values connect the rows: the Table's id matches each item's orderId.
    </Text>
    <Text variant="strong">Items</Text>
    <Items
      data="{[
        { orderId: 1, product: 'Keyboard', qty: 4 },
        { orderId: 1, product: 'Mouse', qty: 1 },
        { orderId: 2, product: 'Monitor', qty: 10 },
        { orderId: 3, product: 'Webcam', qty: 2 },
        { orderId: 3, product: 'Headset', qty: 3 }
      ]}"
    >
      <HStack
        testId="{'line-' + $item.product}"
        padding="$space-2"
        verticalAlignment="center"
        backgroundColor="{(pinnedId ?? hoveredId) === $item.orderId 
          ? '$color-primary-100' : ''}"
      >
        <Text width="80px" variant="secondary">Order {$item.orderId}</Text>
        <Text width="100px">{$item.product}</Text>
        <Text variant="secondary">qty {$item.qty}</Text>
      </HStack>
    </Items>

    <Text variant="secondary">
      {pinnedId ? 'Pinned: order ' + pinnedId : 'Hover an order to preview its items; click to pin.'}
    </Text>
  </VStack>
</App>
```

## Key points

**Two variables, one derived expression**: `hoveredId` and `pinnedId` are the only state. Nothing else needs its own variable — every place that renders a highlight computes it inline from `pinnedId ?? hoveredId`, so the pin and the hover can never fall out of sync with each other.

**Guard the hover handlers, not the read side**: `onRowEnter` and `onRowLeave` check `if (!pinnedId)` before touching `hoveredId`. This is what makes "hovering while pinned does not move the highlight" true — the hover variable simply stops updating while a pin is live, rather than every reader having to re-check which one currently applies.

**`onRowClick` is a toggle, not a setter**: `pinnedId = pinnedId === item.id ? null : item.id` covers all three cases the scenario needs — clicking the pinned row clears it, clicking a different row replaces it, and clicking when nothing is pinned sets it — in one line.

**The visual cue reuses conditional `backgroundColor`**: both the `Table` cell wrapper and the companion `Items` row compute their `backgroundColor` from the same `(pinnedId ?? hoveredId) === ...` comparison against their own id field. See [Highlight rows conditionally](/docs/howto/highlight-rows-conditionally) for the underlying technique — this page applies it to interaction state instead of data values.

## Why not selection

`rowsSelectable` with single selection looks like a shortcut to the same behavior, and it isn't one: clicking a row always **sets** the selection to that row — there is no code path that clicks a selected row and clears it. A pin needs release-on-second-click, and single-row selection cannot express that; it can only ever select "the" row.

`rowClick` is the right tool here precisely because it stays out of selection's way: it "reports the click without replacing or suppressing selection," so it's free for the app to interpret as a toggle, an action, or anything else that isn't "the current choice." Reach for `rowsSelectable` and `selectionDidChange` instead when a row should stay chosen until something else is picked — see [Build a master–detail layout](/docs/howto/build-a-master-detail-layout) for that case. Reach for `rowClick` when the click is a toggle, not a choice.

One more boundary worth knowing before you rely on it: `rowClick` does not fire for a click on the selection checkbox, nor for a click on an interactive control (a button, say) inside a cell. That's what lets a pin toggle and per-row action buttons coexist in the same table without one intercepting the other's clicks.

---

## See also

- [Highlight rows conditionally](/docs/howto/highlight-rows-conditionally) — the `backgroundColor`/`color` technique this page applies to interaction state
- [Build a master–detail layout](/docs/howto/build-a-master-detail-layout) — use `rowsSelectable` instead when a row should stay chosen, not toggled
- [Enable multi-row selection in a table](/docs/howto/enable-multi-row-selection-in-a-table) — selection for bulk actions rather than correlation

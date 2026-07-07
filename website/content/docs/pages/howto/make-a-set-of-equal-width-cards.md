# Make a set of equal-width cards

Use HStack with wrapContent and width="*" star sizing to divide available row space equally across cards.

A dashboard header row shows four summary stat cards — Unpaid, Paid, Draft, Sent. All four must share the available width equally and reflow gracefully when the window is narrow. `HStack` with `wrapContent` and `width="*"` star sizing divides the row space proportionally without any arithmetic.

```xmlui-pg copy display name="Equal-width stat cards with HStack wrapContent"
---app display
<App var.stats="{{
    outstanding: 3502.90,
    paid_this_year: 1745.18,
    draft_invoices: 6,
    sent_invoices: 43
}}">
  <HStack wrapContent>
    <Card width="*" title="Unpaid">
      <Text fontWeight="$fontWeight-extra-bold">{stats.outstanding}</Text>
    </Card>
    <Card width="*" title="Paid">
      <Text fontWeight="$fontWeight-extra-bold">{stats.paid_this_year}</Text>
    </Card>
    <Card width="*" title="Draft">
      <Text fontWeight="$fontWeight-extra-bold">{stats.draft_invoices}</Text>
    </Card>
    <Card width="*" title="Sent">
      <Text fontWeight="$fontWeight-extra-bold">{stats.sent_invoices}</Text>
    </Card>
  </HStack>
</App>
```

## Key points

**`width="*"` divides remaining space equally**: In an `HStack` with `wrapContent`, children with `width="*"` each receive an equal share of the container width after fixed-width children have been allocated. Four `*` children each get 25% of the row:

```xmlui
<HStack wrapContent>
  <Card width="*">…</Card> <!-- each gets 25% -->
  <Card width="*">…</Card>
  <Card width="*">…</Card>
  <Card width="*">…</Card>
</HStack>
```

**Proportional weights with `2*`**: A child with `width="2*"` receives twice the share of a `*` child. Mix fixed and star widths to create columns of controlled relative size:

```xmlui
<HStack wrapContent>
  <Card width="2*">…</Card>  <!-- gets 50% -->
  <Card width="*">…</Card>   <!-- gets 25% each -->
  <Card width="*">…</Card>
</HStack>
```

**`wrapContent` wraps when the row fills**: `HStack` with `wrapContent` automatically wraps children to the next row when there is not enough horizontal space. Combine star sizing with a `minWidth` to control when a card wraps rather than becoming too narrow:

```xmlui
<HStack wrapContent gap="$space-3">
  <Card width="*" minWidth="160px">…</Card>
  <Card width="*" minWidth="160px">…</Card>
  <Card width="*" minWidth="160px">…</Card>
  <Card width="*" minWidth="160px">…</Card>
</HStack>
```

**`gap` controls spacing between cards**: The `gap` prop sets the space between cards both horizontally and vertically:

```xmlui
<HStack wrapContent gap="$space-3">…</HStack>
```

**When you need a single non-wrapping row**: If the cards must never wrap and always stay on one row regardless of screen width, use `HStack` without `wrapContent` and set `itemWidth` to distribute space evenly:

```xmlui
<HStack itemWidth="25%">
  <Card>…</Card>
  <Card>…</Card>
  <Card>…</Card>
  <Card>…</Card>
</HStack>
```

---

**See also**
- [Stack component](/docs/reference/components/Stack) — `wrapContent`, `itemWidth`, and star sizing
- [Layout Properties](/docs/styles-and-themes/layout-props) — `gap` and spacing units

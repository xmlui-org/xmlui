# Wrap Items Across Multiple Rows

Use `HStack` with `wrapContent` to arrange items horizontally and let them flow onto new rows when the container is too narrow.

A tag list, a button group, or a set of filter chips should display side by side when space permits and wrap naturally on smaller screens — without overflow or a horizontal scrollbar. Setting `wrapContent` on an `HStack` activates this flex-wrap behaviour.

```xmlui-pg copy display name="Wrapping tag list"
---app display
<App>
  <HStack wrapContent>
    <Badge value="React" />
    <Badge value="TypeScript" />
    <Badge value="Vite" />
    <Badge value="Playwright" />
    <Badge value="Vitest" />
    <Badge value="CSS Modules" />
    <Badge value="XML" />
    <Badge value="Accessibility" />
    <Badge value="Theming" />
    <Badge value="Responsive" />
    <Badge value="Dark Mode" />
  </HStack>
</App>
```

## Key points

**`wrapContent` enables line wrapping**: By default, an `HStack` keeps all children in a single row and may overflow. Adding `wrapContent` causes children that do not fit on the current row to move to the next row automatically:

```xmlui
<HStack wrapContent>
  <Badge value="A" />
  <Badge value="B" />
  <!-- … more badges wrap as the container narrows -->
</HStack>
```

**Children control their own width**: In a wrapping `HStack`, children size themselves unless you set an explicit width. Use a fixed width, a percentage, or star sizing (`width="*"`) depending on the desired behaviour:

```xmlui-pg copy display name="Mixed widths in a wrapping HStack"
---app display
<App>
  <HStack wrapContent>
    <Card width="200px" title="Fixed 200 px" />
    <Card width="30%"  title="30 %" />
    <Card width="*"    title="Fills rest" />
  </HStack>
</App>
```

**Combine with `minWidth` to control when items wrap**: A child with `width="*"` grows to fill its row, but without a `minWidth` it could shrink to nearly zero on a small container. Add `minWidth` to trigger wrapping before the card becomes too narrow:

```xmlui-pg copy display name="Cards with minWidth guard"
---app display
<App>
  <HStack wrapContent>
    <Card width="*" minWidth="180px" title="Card One" />
    <Card width="*" minWidth="180px" title="Card Two" />
    <Card width="*" minWidth="180px" title="Card Three" />
    <Card width="*" minWidth="180px" title="Card Four" />
  </HStack>
</App>
```

**`itemWidth` sets a uniform width for every child**: Instead of repeating `width="*"` on each child, set `itemWidth="*"` on the `HStack` to apply that width to every direct child automatically:

```xmlui-pg copy display name="itemWidth on the HStack"
---app display
<App>
  <HStack wrapContent itemWidth="*">
    <Card title="Alpha" />
    <Card title="Beta" />
    <Card title="Gamma" />
    <Card title="Delta" />
  </HStack>
</App>
```

---

**See also**
- [HStack component](/docs/reference/components/HStack) — full property reference including `wrapContent` and `itemWidth`
- [Make a set of equal-width cards](/docs/howto/make-a-set-of-equal-width-cards) — star sizing for equal columns
- [Force a row break in a wrapping layout](/docs/howto/force-a-row-break-in-a-wrapping-layout) — inserting an explicit line break with SpaceFiller
- [Build a responsive card grid](/docs/howto/build-a-responsive-card-grid) — combining TileGrid and wrapping HStack for grids

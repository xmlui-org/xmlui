# Build a responsive card grid

Use TileGrid or HStack with wrapContent and responsive width to reflow cards on different screens.

A team directory shows profile cards for colleagues. On a wide screen they should flow into multiple columns; on a phone they should stack into a single column. Two patterns cover this: `TileGrid` for virtualized, uniformly-sized tiles and `HStack wrapContent` for freely varying card heights.

```xmlui-pg copy display name="Team directory card grid"
---app display
<App var.team="{[
    {name:'Alice Chen', role:'Engineering'},
    {name:'Ben Ortiz', role:'Design'},
    {name:'Carol Davis', role:'Product'},
    {name:'Dan Smith', role:'Engineering'},
    {name:'Eva Brown', role:'QA'},
    {name:'Frank Lee', role:'Design'},
    {name:'Grace Kim', role:'Product'},
    {name:'Henry Wu', role:'Engineering'}
]}">
  <H3>TileGrid approach</H3>
  <TileGrid data="{team}" itemWidth="200px" itemHeight="100px">
    <Card title="{$item.name}">
      <Badge value="{$item.role}" />
    </Card>
  </TileGrid>
  <H3>HStack wrapContent approach</H3>
  <HStack wrapContent>
    <Items data="{team}">
      <Card title="{$item.name}" width="200px">
        <Badge value="{$item.role}" />
      </Card>
    </Items>
  </HStack>
</App>
```

## Key points

**`TileGrid` auto-calculates columns**: It measures the container width, divides it by `itemWidth`, and determines how many tiles fit per row. All tiles share the same fixed dimensions. For large datasets `TileGrid` only renders visible rows (virtualization), making it efficient for hundreds or thousands of items:

```xmlui
<TileGrid data="{team}" itemWidth="200px" itemHeight="100px">
  <Card title="{$item.name}">
    <Badge value="{$item.role}" />
  </Card>
</TileGrid>
```

**`HStack wrapContent` as a simpler alternative**: Children declare their own fixed `width`. When a row fills they wrap to the next line — like CSS `flex-wrap: wrap`. Use this when tiles have varying heights or when the list is short enough that virtualization is not needed:

```xmlui
<HStack wrapContent>
  <Items data="{team}">
    <Card title="{$item.name}" width="200px">…</Card>
  </Items>
</HStack>
```

**Explicit parent `height` for `TileGrid` virtualization**: `TileGrid` only renders visible rows when it knows its height. Give the parent an explicit height or place the grid inside a `Splitter` panel to activate virtualization. Without it the grid renders all rows at once.

**`stretchItems` on `TileGrid`**: Set `stretchItems="true"` to make tiles grow and fill the calculated column width evenly — so there are no gaps in the last partial row. Compare the two grids below: without `stretchItems` the last row has trailing empty space; with it the tiles expand to fill the full row width:

```xmlui-pg copy display name="TileGrid stretchItems comparison"
---app display
<App var.team="{[
    {name:'Alice Chen', role:'Engineering'},
    {name:'Ben Ortiz', role:'Design'},
    {name:'Carol Davis', role:'Product'},
    {name:'Dan Smith', role:'Engineering'},
    {name:'Eva Brown', role:'QA'}
]}">
  <H4>Without stretchItems (default)</H4>
  <TileGrid data="{team}" itemWidth="180px" itemHeight="60px">
    <Card title="{$item.name}" />
  </TileGrid>
  <H4>With stretchItems="true"</H4>
  <TileGrid data="{team}" itemWidth="180px" itemHeight="60px" stretchItems="true">
    <Card title="{$item.name}" />
  </TileGrid>
</App>
```

**`wrapContent` vs fixed `itemWidth` without wrapping**: `HStack wrapContent` wraps children to the next row when the container width is exhausted. An `HStack` with a fixed `itemWidth` but without `wrapContent` stretches all children equally in a single row and will overflow if too many items are present.

---

**See also**
- [TileGrid component](/docs/reference/components/TileGrid) — full prop reference including selection and keyboard shortcuts
- [Stack component](/docs/reference/components/Stack) — `wrapContent` and `itemWidth` props
- [Items component](/docs/reference/components/Items) — list iteration without a container wrapper

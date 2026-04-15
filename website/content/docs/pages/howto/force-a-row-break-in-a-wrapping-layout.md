# Force a Row Break in a Wrapping Layout

Use `SpaceFiller` inside an `HStack` with `wrapContent` to start a new row at an exact position regardless of available space.

A mixed content row has several short tags followed by one element that must always start on its own line. In a wrapping `HStack`, `SpaceFiller` acts as a forced line break: it fills the remainder of the current row so the next child has no choice but to begin a new row.

```xmlui-pg copy display name="Forced row break between tag groups"
---app
<App>
  <HStack wrapContent>
    <Badge value="Design" />
    <Badge value="Frontend" />
    <Badge value="Open" />
    <SpaceFiller />
    <Text variant="strong">Always starts on a new line</Text>
  </HStack>
</App>
```

## Key points

**`width="100%"` forces the break**: A `SpaceFiller` without an explicit width grows to fill remaining space on the current row — if that remaining width is non-zero, following siblings may still fit on that row. Setting `width="100%"` ensures the `SpaceFiller` consumes the full container width, guaranteeing the next sibling wraps:

```xmlui
<HStack wrapContent>
  <Badge value="A" />
  <Badge value="B" />
  <SpaceFiller />   <!-- forces next item to a new row -->
  <Text>Always on its own row</Text>
</HStack>
```

**Multiple breaks divide content into logical rows**: Place a `SpaceFiller width="100%"` anywhere in the children sequence to create as many row separations as needed:

```xmlui-pg copy display name="Multiple forced row breaks"
---app display
<App>
  <HStack wrapContent>
    <Badge value="Tag A" />
    <Badge value="Tag B" />
    <SpaceFiller />
    <Badge value="Tag C" />
    <Badge value="Tag D" />
    <Badge value="Tag E" />
    <SpaceFiller />
    <Text variant="strong">Footer row</Text>
  </HStack>
</App>
```

**Combine with star-sized children**: Use `SpaceFiller width="100%"` to break a row and then rely on `width="*"` children on the next row to divide that row's space equally:

```xmlui-pg copy display name="Row break then equal-width row"
---app display
<App>
  <HStack wrapContent>
    <Text>Header spans the full row</Text>
    <SpaceFiller />
    <Card width="*" title="First quarter" />
    <Card width="*" title="Second quarter" />
    <Card width="*" title="Third quarter" />
  </HStack>
</App>
```

---

**See also**
- [SpaceFiller component](/docs/reference/components/SpaceFiller) — full property and event reference
- [Wrap items across multiple rows](/docs/howto/wrap-items-across-multiple-rows) — general wrapping layout setup
- [Align items to opposite ends of a row](/docs/howto/align-items-to-row-ends-with-spacefiller) — spacing apart toolbar items with SpaceFiller

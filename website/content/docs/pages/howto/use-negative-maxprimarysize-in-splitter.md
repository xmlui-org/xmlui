# Use negative maxPrimarySize in Splitter

Set negative values on `maxPrimarySize` to calculate the maximum from the opposite edge.

A negative `maxPrimarySize` means "container size minus this amount" — so `maxPrimarySize="-200px"` on an `HSplitter` caps the left panel at `containerWidth - 200px`, guaranteeing the right panel always has at least 200 px. This is more robust than a percentage when the secondary panel needs a minimum absolute size.

```xmlui-pg copy display name="Negative maxPrimarySize in HSplitter" height="400px"
---app display
<App>
  <VStack height="300px">
    <Text variant="caption" marginBottom="$space-2">
      Left panel: max = container−180px. Drag the handle to the right—the left panel stops before the right panel collapses.
    </Text>
    <HSplitter
      initialPrimarySize="50%"
      minPrimarySize="120px"
      maxPrimarySize="-180px"
      height="250px"
    >
      <VStack backgroundColor="$color-primary-50" padding="$space-3" height="100%">
        <H4>Left panel</H4>
        <Text>Drag right → stops before right disappears.</Text>
      </VStack>
      <VStack backgroundColor="$color-surface-50" padding="$space-3" height="100%">
        <H4>Right panel</H4>
        <Text>Always has at least 180 px of space.</Text>
      </VStack>
    </HSplitter>
  </VStack>
</App>
```

## Key points

**Negative `maxPrimarySize` means "container minus abs(value)"**: `maxPrimarySize="-200px"` sets the effective maximum at `containerSize - 200`. This guarantees the secondary panel retains at least 200 px regardless of container width. The same logic applies to `VSplitter` with heights.

**Percentages and pixel values both work**: `maxPrimarySize="-20%"` leaves at least 20% of the container for the secondary panel. Negative percentage is relative to the measured container size at the moment the limit is applied.

**`minPrimarySize` works with positive values only**: Minimum size is measured from the primary panel's edge, not the opposite edge. Combine `minPrimarySize="120px"` with `maxPrimarySize="-180px"` to constrain both ends of the drag range.

**`initialPrimarySize` sets the starting split**: Supply a pixel or percentage value. The splitter snaps to this size on first render, then the user can drag within the `minPrimarySize`/`maxPrimarySize` bounds.

**`resize` event reports the new primary size in pixels**: Bind `onResize="(px) => myVar = px"` to track the current split for persistence or downstream layout calculations.

---

## See also

- [Create a resizable split view](/docs/howto/create-a-resizable-split-view) — basic HSplitter/VSplitter setup
- [Generate a table of contents](/docs/howto/generate-a-table-of-contents) — TableOfContents inside an HSplitter
- [Dock children in a Stack panel](/docs/howto/dock-children-in-a-stack-panel) — alternative layout for divided panels

# Handle ContentSeparator orientation

Set an explicit parent height for vertical `ContentSeparator` display.

`ContentSeparator` renders a horizontal line by default. Switch to `orientation="vertical"` to get a vertical divider — but a vertical separator's height is `100%` by default, which requires the parent container to have a defined height. Without it the separator collapses to zero and becomes invisible.

```xmlui-pg copy display name="ContentSeparator orientation"
---app display
<App>
  <VStack>
    <Text variant="strong">Horizontal (default)</Text>
    <VStack verticalAlignment="center" padding="$space-2">
      <Text>Top item</Text>
      <ContentSeparator orientation="horizontal" thickness="1px" />
      <Text>Bottom item</Text>
    </VStack>

    <Text variant="strong">Vertical — parent has explicit height</Text>
    <!-- HStack height set explicitly — the vertical separator fills it -->
    <HStack height="60px" verticalAlignment="center" gap="$space-3">
      <Text>Left</Text>
      <ContentSeparator orientation="vertical" thickness="1px" />
      <Text>Middle</Text>
      <ContentSeparator orientation="vertical" thickness="1px" />
      <Text>Right</Text>
    </HStack>

    <Text variant="strong">Vertical with explicit length</Text>
    <!-- No parent height needed when length is set explicitly -->
    <HStack verticalAlignment="center" gap="$space-3">
      <Text>Left</Text>
      <ContentSeparator orientation="vertical" thickness="1px" length="24px" />
      <Text>Right</Text>
    </HStack>
  </VStack>
</App>
```

## Key points

**`orientation="vertical"` makes the separator a column divider**: The separator rotates 90° — `thickness` becomes its width, and `length` becomes its height. The default `length` is `100%`, which resolves relative to the parent.

**The parent must have an explicit height for `length: 100%` to work**: When the parent container's height is determined by its content (auto height), `100%` of that height is undefined and collapses to zero. Add `height="60px"` (or any fixed value) to the parent to give the separator something to fill.

**Set an explicit `length` to skip the parent height constraint**: `length="40px"` gives the separator an absolute height independent of the parent. Use this when you cannot control the parent's height — for example, inside automatically-sized flex containers.

**`thickness` controls the line width for vertical separators**: For a vertical separator, `thickness` maps to the CSS `width`. The default is `1px`. Increase it for a more pronounced divider.

**Horizontal separators have no height requirement**: A `ContentSeparator` without `orientation` (or with `orientation="horizontal"`) expands to full width and has a fixed `thickness` height — no parent height needed.

---

## See also

- [Create a resizable split view](/docs/howto/create-a-resizable-split-view) — draggable HSplitter/VSplitter dividers
- [Align items to opposite ends of a row](/docs/howto/align-items-to-row-ends-with-spacefiller) — SpaceFiller as an alternative horizontal divider
- [Build a holy-grail layout](/docs/howto/build-a-holy-grail-layout) — layout patterns with visible section boundaries

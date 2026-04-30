# Create a resizable split view

Use Splitter, HSplitter, or VSplitter with min and max constraints for an IDE-style panel layout.

A notes app shows a list on the left and the selected note on the right. The user drags the divider to trade width between panels. `Splitter` wires up the resize handle and enforces min/max constraints so neither panel collapses below a usable size.

```xmlui-pg copy display name="Resizable notes split view" height="450px"
---app display
<App scrollWholePage="false">
  <HSplitter
    height="100%"
    initialPrimarySize="220px"
    minPrimarySize="140px"
    maxPrimarySize="80%"
  >
    <VStack>
      <H4>Notes</H4>
      <Card title="Sprint planning" />
      <Card title="API design" />
      <Card title="Retrospective" />
      <Card title="Onboarding docs" />
    </VStack>
    <VStack paddingHorizontal="$space-4">
      <H4>Sprint planning</H4>
      <Text>
        Define the work items for this sprint. Review the backlog, estimate
        story points, and commit to a realistic scope for the two-week cycle.
      </Text>
    </VStack>
  </HSplitter>
</App>
```

## Key points

**`Splitter` orientation**: `Splitter` defaults to `orientation="vertical"`, which creates a top-and-bottom split. For a side-by-side split, set `orientation="horizontal"` or use the `HSplitter` shorthand. Use `VSplitter` when you want the vertical top-and-bottom shorthand:

```xmlui
<!-- side-by-side -->
<HSplitter>…</HSplitter>

<!-- side-by-side without the shorthand -->
<Splitter orientation="horizontal">…</Splitter>

<!-- top and bottom -->
<Splitter>…</Splitter>
```

**`initialPrimarySize`**: Sets the starting size of the first child panel. In `HSplitter` or `orientation="horizontal"` it controls width; in `VSplitter` or `orientation="vertical"` it controls height. Accepts `px`, `%`, or viewport units.

**`minPrimarySize` / `maxPrimarySize`**: Clamp the draggable range so neither panel collapses to zero:

```xmlui
<HSplitter
  initialPrimarySize="240px"
  minPrimarySize="160px"
  maxPrimarySize="60%"
>
  <VStack>…</VStack>   <!-- left/primary panel -->
  <VStack>…</VStack>   <!-- right/secondary panel -->
</HSplitter>
```

**Negative `maxPrimarySize`**: A negative value calculates from the trailing edge rather than the leading edge. `maxPrimarySize="-200px"` means the primary panel can grow until only 200 px remain for the secondary panel — without needing to know the total container width:

```xmlui
<Splitter maxPrimarySize="-200px">
  <!-- secondary panel always has at least 200 px -->
</Splitter>
```

**`scrollWholePage="false"` + explicit `height` are required**: `Splitter` fills its available height. Without `scrollWholePage="false"` the content area has natural height and `height="100%"` on the `Splitter` resolves to zero. Set `height="100%"` on the `Splitter` after opting out of whole-page scroll.

**`floating` drag handle**: When `floating="true"`, the drag handle overlays both panels without shrinking them — ideal for a collapsible side panel that should open and close over the main content:

```xmlui
<Splitter floating="true" initialPrimarySize="0px">
  <!-- primary panel starts collapsed; drag to open -->
</Splitter>
```

---

**See also**
- [Splitter component](/docs/reference/components/Splitter) — full prop reference including `swapped` and `splitterTemplate`
- [App component](/docs/reference/components/App) — `scrollWholePage` prop
- [Layout Properties](/docs/styles-and-themes/layout-props) — height and sizing properties

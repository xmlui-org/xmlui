# Dock elements to panel edges

Use `dock` on `Stack` children to build fixed-height panels with pinned headers, scrollable middle content, and bottom action bars.

A common case is a panel or dialog section with a long, scrollable body and buttons that must remain visible at the bottom. Put the scrollable region in a child with `dock="stretch"` and the actions in a child with `dock="bottom"`. The parent `Stack` must have an explicit height.

```xmlui-pg copy display name="Scrollable panel with bottom actions" height="340px"
---app display
<App scrollWholePage="false">
  <Stack height="100%" borderWidth="1px" borderColor="$color-surface-200" gap="0">
    <HStack
      dock="top"
      padding="$space-2 $space-3"
      backgroundColor="$color-surface-100"
      borderBottom="1px solid $color-surface-200"
    >
      <Text variant="strong">Preview events</Text>
    </HStack>
    <ScrollViewer dock="stretch" showScrollerFade="{false}">
      <VStack padding="$space-2" gap="$space-2">
        <Text>Community forum at the library</Text>
        <Text>Neighborhood cleanup on Saturday</Text>
        <Text>Summer concert in the park</Text>
        <Text>Transit board meeting</Text>
        <Text>Farmers market opening day</Text>
        <Text>After-school robotics demo</Text>
        <Text>Public art walk downtown</Text>
        <Text>Book club at the branch library</Text>
        <Text>Tenant association meeting</Text>
        <Text>Neighborhood potluck in the park</Text>
        <Text>Open studio night at the arts center</Text>
        <Text>Community bike ride kickoff</Text>
      </VStack>
    </ScrollViewer>
    <HStack
      dock="bottom"
      padding="$space-2"
      gap="$space-2"
      horizontalAlignment="end"
      backgroundColor="$color-surface-0"
      borderTop="1px solid $color-surface-200"
    >
      <Button label="Back" variant="ghost" />
      <Button label="Add Feed" />
    </HStack>
  </Stack>
</App>
```

The next example uses all four edges at once — a toolbar at the top, a status bar at the bottom, a navigation tree on the left, a properties panel on the right, and a scrollable editor region in the middle:

```xmlui-pg copy display name="All four dock edges" height="450px"
---app display
<App scrollWholePage="false">
  <Stack 
    height="100%" 
    borderWidth="1px" 
    borderColor="$color-surface-200"
    gap="0"
  >
    <HStack
      dock="top"
      padding="$space-3 $space-2"
      backgroundColor="$color-surface-100"
    >
      <Icon name="layout" />
      <Text variant="strong">Editor</Text>
    </HStack>
    <VStack
      dock="left"
      width="150px"
      padding="$space-2"
      backgroundColor="$color-primary-100"
    >
      <Text variant="strong">Files</Text>
      <Text>index.xmlui</Text>
      <Text>App.xmlui</Text>
      <Text>Card.xmlui</Text>
    </VStack>
    <VStack
      dock="right"
      width="140px"
      padding="$space-2"
      backgroundColor="$color-warn-100"
    >
      <Text variant="strong">Properties</Text>
      <Text>width: auto</Text>
      <Text>height: 100%</Text>
    </VStack>
    <VStack dock="stretch" padding="$space-3">
      <Text>…editor content…</Text>
    </VStack>
    <HStack
      dock="bottom"
      padding="$space-1 $space-3"
      backgroundColor="$color-surface-100"
    >
      <Text>Ln 12, Col 4</Text>
      <SpaceFiller />
      <Text>UTF-8</Text>
    </HStack>
  </Stack>
</App>
```

## Key points

**DockPanel mode activates automatically**: As soon as any direct child of a `Stack` receives a `dock` prop, the parent switches to DockPanel layout. No extra mode attribute is needed on the parent:

| `dock` value | Behaviour |
|---|---|
| `"top"` | Anchored to the top edge, full container width |
| `"bottom"` | Anchored to the bottom edge, full container width |
| `"left"` | Anchored to the left edge, full height of the middle row |
| `"right"` | Anchored to the right edge, full height of the middle row |
| `"stretch"` | Fills all remaining space in the middle row |

**`dock="stretch"` is the fill region**: Exactly one child should have `dock="stretch"`. It takes all space not claimed by top, bottom, left, and right children. Omitting it leaves the middle row at zero height:

```xmlui
<Stack height="400px">
  <HStack dock="top">…header…</HStack>
  <VStack dock="stretch">…scrollable content…</VStack>
  <HStack dock="bottom">…action bar…</HStack>
</Stack>
```

`dock="stretch"` is the usual place for a `ScrollViewer` when the middle region should scroll while the action row remains fixed:

```xmlui
<Stack height="400px" gap="0">
  <ScrollViewer dock="stretch">…long content…</ScrollViewer>
  <HStack dock="bottom">…buttons…</HStack>
</Stack>
```

**Parent `height` is required for `dock="bottom"` to take effect**: Without an explicit height the outer container collapses to content size and the bottom-docked child simply follows the content instead of anchoring to the edge:

```xmlui
<Stack height="100%">   <!-- or height="400px" -->
  <VStack dock="stretch">…</VStack>
  <HStack dock="bottom">…</HStack>
</Stack>
```

**`gap="0"` removes the default spacing between docked regions**: By default `Stack` applies a gap between its children. In a DockPanel layout this creates visible gaps between the toolbar, side panels, and content area. Set `gap="0"` on the parent `Stack` when the docked children carry their own borders or background colors and you want the regions to meet flush:

```xmlui
<Stack height="100%" gap="0">
  <HStack dock="top">…toolbar…</HStack>
  <VStack dock="left" width="160px">…sidebar…</VStack>
  <VStack dock="stretch">…content…</VStack>
</Stack>
```

**Use `dock="bottom"` for parent-owned action bars, not `ScrollViewer.footerTemplate`**: `footerTemplate` belongs to the scroll container itself. When you need a panel or dialog section with a scrollable body and a bottom action row, make the action row a sibling in the parent `Stack` and dock it to the bottom:

```xmlui
<Stack height="400px" gap="0">
  <ScrollViewer dock="stretch">…body…</ScrollViewer>
  <HStack dock="bottom">…Back / Save…</HStack>
</Stack>
```

**Children without a `dock` prop**: Undocked children participate in the middle row alongside the `stretch` child, distributed by normal flex rules.

**Nesting DockPanels**: A `dock="stretch"` child can itself contain another `Stack` with docked children — giving you an outer shell with a toolbar at the top and an inner panel that splits into a scrollable list and a status bar at the bottom.

---

**See also**
- [Stack component](/docs/reference/components/Stack) — `dock` prop and DockPanel layout reference
- [SpaceFiller component](/docs/reference/components/SpaceFiller) — pushing items apart inside docked rows
- [Layout Properties](/docs/styles-and-themes/layout-props) — height sizing

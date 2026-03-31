# Dock elements to panel edges

Use dock on Stack children to pin items to top, bottom, left, or right of a container.

A file-explorer side panel needs a fixed title bar at the top, a scrollable file list in the middle, and action buttons permanently pinned to the bottom — regardless of how many files are present. The `dock` prop on `Stack` children activates DockPanel mode, which handles this anchoring declaratively.

```xmlui-pg copy display name="File-explorer panel with docked header and footer" height="450px"
---app display
<App scrollWholePage="false">
  <Stack height="100%" borderWidth="1px" borderColor="$color-surface-200">
    <HStack
      dock="top" 
      padding="$space-2 $space-3"
      backgroundColor="$color-surface-100"
    >
      <Icon name="folder" />
      <Text variant="strong">src / components</Text>
    </HStack>
    <VStack dock="stretch" paddingVertical="$space-2">
      <Card title="Button.xmlui" />
      <Card title="Card.xmlui" />
      <Card title="Form.xmlui" />
    </VStack>
    <HStack
      dock="bottom"
      padding="$space-3 $space-2"
      backgroundColor="$color-surface-50"
    >
      <Button label="New File" variant="solid" themeColor="primary" />
      <SpaceFiller />
      <Button label="Delete" variant="outlined" />
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

**Children without a `dock` prop**: Undocked children participate in the middle row alongside the `stretch` child, distributed by normal flex rules.

**Nesting DockPanels**: A `dock="stretch"` child can itself contain another `Stack` with docked children — giving you an outer shell with a toolbar at the top and an inner panel that splits into a scrollable list and a status bar at the bottom.

---

**See also**
- [Stack component](/docs/reference/components/Stack) — `dock` prop and DockPanel layout reference
- [SpaceFiller component](/docs/reference/components/SpaceFiller) — pushing items apart inside docked rows
- [Layout Properties](/docs/styles-and-themes/layout-props) — height sizing

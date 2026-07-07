# Align Items to Opposite Ends of a Row

Use `SpaceFiller` inside an `HStack` to push items to opposite ends without explicit widths or margins.

A page header has a title on the left and an action button on the right. Without `SpaceFiller` you would need to calculate widths or use absolute positioning. `SpaceFiller` grows to absorb all unused horizontal space, naturally pushing the items around it to the row ends.

```xmlui-pg display copy name="Page header with title and actions"
---app 
<App scrollWholePage="false">
  <HStack 
    verticalAlignment="center" 
    padding="$padding-normal" 
    backgroundColor="$color-surface-100"
  >
    <Icon name="grid" />
    <Text variant="strong">Project Hub</Text>
    <SpaceFiller />
    <Button label="New Project" variant="solid" themeColor="primary" icon="plus" />
    <Button label="Settings" icon="settings" />
  </HStack>
  <VStack padding="$space-4">
    <Text>Main content area</Text>
  </VStack>
</App>
```

## Key points

**`SpaceFiller` absorbs all remaining space**: In an `HStack`, a `SpaceFiller` child grows to fill all unused horizontal space between the items before and after it. Items left of it align to the left edge; items right of it align to the right edge:

```xmlui
<HStack>
  <Text>Title</Text>
  <SpaceFiller />
  <Button label="Action" />
</HStack>
```

**Multiple `SpaceFiller` components distribute space equally**: If you place two `SpaceFiller` components in a row they share the unused space evenly, centering the content between them:

```xmlui-pg display copy name="Three zones: left, center, right"
---app 
<App>
  <HStack 
    verticalAlignment="center" 
    padding="$padding-normal" 
    backgroundColor="$color-surface-100"
  >
    <Button label="Back" icon="arrow-left" />
    <SpaceFiller />
    <Text variant="strong">Page Title</Text>
    <SpaceFiller />
    <Button label="Next" icon="arrow-right" />
  </HStack>
</App>
```

**Combine with other components freely**: `SpaceFiller` works alongside any combination of buttons, icons, text, and inputs in the same row. A common pattern is a toolbar with grouped controls on each side:

```xmlui-pg copy display name="Toolbar with grouped controls"
---app
<App>
  <HStack
    verticalAlignment="center" 
    padding="$padding-normal" 
    gap="$gap-tight" 
    backgroundColor="$color-surface-100"
  >
    <Button label="Bold" icon="bold" />
    <Button label="Italic" icon="italic" />
    <Button label="Underline" icon="underline" />
    <SpaceFiller />
    <Button label="Undo" icon="undo" />
    <Button label="Redo" icon="redo" />
  </HStack>
</App>
```

**`SpaceFiller` in a `VStack` pushes content down**: `SpaceFiller` adapts to the orientation of its parent. Inside a `VStack` it grows vertically, pushing an item that follows it to the bottom of the container:

```xmlui-pg display copy name="SpaceFiller in a VStack" height="250px"
---app
<App scrollWholePage="false">
  <VStack 
    height="100%" 
    padding="$padding-normal" 
    backgroundColor="$color-surface-100"
  >
    <Text variant="strong">Top section</Text>
    <Text>Some content that does not fill the panel.</Text>
    <SpaceFiller />
    <Button label="Log out" />
  </VStack>
</App>
```

---

**See also**
- [SpaceFiller component](/docs/reference/components/SpaceFiller) — full property and event reference
- [Push a footer to the bottom](/docs/howto/push-a-footer-to-the-bottom) — pinning a footer in a page layout
- [Dock elements to panel edges](/docs/howto/dock-elements-to-panel-edges) — alternative with explicit docking

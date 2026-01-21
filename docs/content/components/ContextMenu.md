# ContextMenu [#contextmenu]

`ContextMenu` provides a context-sensitive menu that appears at a specific position when opened programmatically via its `openAt()` API. Unlike `DropdownMenu`, it has no trigger button and is typically used with `onContextMenu` events to create right-click menus or custom context-aware action menus. The menu automatically positions itself within the viewport and closes when clicking outside or when a menu item is selected. 

**Key features:**
- **Programmatic control**: Opens at specific coordinates via the `openAt()` API
- **Context-aware data**: Pass context information that's available to menu items via `$context`
- **No trigger button**: Unlike `DropdownMenu`, `ContextMenu` has no built-in trigger and is typically used with `onContextMenu` events
- **Automatic positioning**: Positions itself within the viewport and prevents default browser context menus

You can nest `MenuItem`, `MenuSeparator`, and `SubMenuItem` components into `ContextMenu` to define a menu hierarchy. The menu is opened programmatically using the `openAt()` method:

```xmlui-pg copy display name="Example: Using ContextMenu" height="240px"
---app copy display
<App>
  <Card title="Right Click Me" onContextMenu="ev => contextMenu.openAt(ev)">
    <Text value="Right click anywhere to see the context menu" />
  </Card>
  <ContextMenu id="contextMenu">
    <MenuItem>Cut</MenuItem>
    <MenuItem>Copy</MenuItem>
    <MenuItem>Paste</MenuItem>
    <MenuSeparator />
    <MenuItem>Delete</MenuItem>
  </ContextMenu>
</App>
---desc
Try right-clicking the card to see the context menu:
```

**Context variables available during execution:**

- `$context`: Contains the context data passed to the `openAt()` method. This allows menu items to access information about the element or data that triggered the context menu.

## Properties [#properties]

### `alignment` [#alignment]

-  default: **"start"**

This property allows you to determine the alignment of the context menu panel with the displayed menu items.

Available values:

| Value | Description |
| --- | --- |
| `center` | Place the content in the middle |
| `start` | Justify the content to the left (to the right if in right-to-left) **(default)** |
| `end` | Justify the content to the right (to the left if in right-to-left) |

Available values are:
- `start`: Menu items are aligned to the start position (default).
- `end`: Menu items are aligned to the end position.

```xmlui-pg copy display name="Example: alignment" height="280px"
<App>
  <VStack>
    <Card testId="start" title="Start-aligned menu" onContextMenu="ev => startMenu.openAt(ev)">
      <Text value="Right click for start-aligned menu" />
    </Card>
    <Card testId="end" title="End-aligned menu" onContextMenu="ev => endMenu.openAt(ev)">
      <Text value="Right click for end-aligned menu" />
    </Card>
  </VStack>
  <ContextMenu id="startMenu" alignment="start">
    <MenuItem>Item 1</MenuItem>
    <MenuItem>Item 2</MenuItem>
    <MenuItem>Item 3</MenuItem>
  </ContextMenu>
  <ContextMenu id="endMenu" alignment="end">
    <MenuItem>Item 1</MenuItem>
    <MenuItem>Item 2</MenuItem>
    <MenuItem>Item 3</MenuItem>
  </ContextMenu>
</App>
```

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

### `close` [#close]

This method closes the context menu.

**Signature**: `close(): void`

```xmlui-pg copy {4} display name="Example: close" height="240px"
<App>
  <Card testId="target" title="Right click or click Close" onContextMenu="ev => menu.openAt(ev)">
    <Text value="Right click to open menu" />
  </Card>
  <Button onClick="menu.close()">Close Menu</Button>
  <ContextMenu id="menu">
    <MenuItem>Item 1</MenuItem>
    <MenuItem>Item 2</MenuItem>
    <MenuItem>Item 3</MenuItem>
  </ContextMenu>
</App>
```

### `openAt` [#openat]

This method opens the context menu at the specified event position (e.g., mouse click coordinates). Optionally, you can pass a context object that will be available within the menu as `$context`. The method automatically prevents the browser's default context menu from appearing.

**Signature**: `openAt(event: MouseEvent, context?: any): void`

```xmlui-pg copy {2,10} display name="Example: openAt" height="280px"
<App>
  <Button id="triggerBtn" onClick="ev => { const rect = triggerBtn.getBoundingClientRect(); menu.openAt(new MouseEvent('contextmenu', { clientX: rect.x + 10, clientY: rect.y + 30 }), { action: 'triggered-by-button' }); }">
    Click to show context menu
  </Button>
  <Card testId="target" onContextMenu="ev => menu.openAt(ev, { action: 'right-clicked' })">
    <Text value="Or right click here" />
  </Card>
  <ContextMenu id="menu">
    <MenuItem>Action triggered by: {$context.action}</MenuItem>
    <MenuItem>Item 2</MenuItem>
    <MenuItem>Item 3</MenuItem>
  </ContextMenu>
</App>
```

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`content`**: The content area of the ContextMenu where menu items are displayed.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-ContextMenu | $color-surface-raised | $color-surface-raised |
| [borderColor](../styles-and-themes/common-units/#color)-ContextMenu-content | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-ContextMenu | $borderRadius | $borderRadius |
| [borderStyle](../styles-and-themes/common-units/#border-style)-ContextMenu-content | solid | solid |
| [borderWidth](../styles-and-themes/common-units/#size)-ContextMenu-content | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-ContextMenu | $boxShadow-xl | $boxShadow-xl |
| [minWidth](../styles-and-themes/common-units/#size)-ContextMenu | 160px | 160px |

%-DESC-START

**Key features:**
- **Programmatic control**: Opens at specific coordinates via the `openAt()` API
- **Context-aware data**: Pass context information that's available to menu items via `$context`
- **No trigger button**: Unlike `DropdownMenu`, `ContextMenu` has no built-in trigger and is typically used with `onContextMenu` events
- **Automatic positioning**: Positions itself within the viewport and prevents default browser context menus

You can nest `MenuItem`, `MenuSeparator`, and `SubMenuItem` components into `ContextMenu` to define a menu hierarchy. The menu is opened programmatically using the `openAt()` method:

```xmlui-pg copy display name="Example: Using ContextMenu" height="240px"
---app copy display
<App>
  <Card testId="target" title="Right Click Me" onContextMenu="ev => contextMenu.openAt(ev)">
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

%-DESC-END

%-PROP-START alignment

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

%-PROP-END

%-CONTEXT-VAR-START $context

The `$context` variable contains data passed to the `openAt()` method, allowing menu items to access information about what triggered the context menu.

```xmlui-pg copy display name="Example: Using $context" height="280px"
<App>
  <VStack>
    <Card testId="file1" onContextMenu="ev => fileMenu.openAt(ev, { fileName: 'document.txt', size: '2.5MB' })">
      <Text value="File: document.txt (2.5MB) - Right click" />
    </Card>
    <Card testId="file2" onContextMenu="ev => fileMenu.openAt(ev, { fileName: 'image.png', size: '1.2MB' })">
      <Text value="File: image.png (1.2MB) - Right click" />
    </Card>
  </VStack>
  <ContextMenu id="fileMenu">
    <MenuItem>Download {$context.fileName}</MenuItem>
    <MenuItem>Delete {$context.fileName}</MenuItem>
    <MenuItem>Properties: {$context.size}</MenuItem>
  </ContextMenu>
</App>
```

%-CONTEXT-VAR-END

%-API-START close

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

%-API-END

%-API-START openAt

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

%-API-END

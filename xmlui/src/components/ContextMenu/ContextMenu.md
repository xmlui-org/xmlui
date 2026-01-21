%-DESC-START

**Key features:**

- **Programmatic control**: Opens at specific coordinates via the `openAt()` API
- **Context-aware data**: Pass context information that's available to menu items via `$context`
- **No trigger button**: Unlike `DropdownMenu`, `ContextMenu` has no built-in trigger and is typically used with `onContextMenu` events
- **Automatic positioning**: Positions itself within the viewport and prevents default browser context menus

You can nest `MenuItem`, `MenuSeparator`, and `SubMenuItem` components into `ContextMenu` to define a menu hierarchy. The menu is opened programmatically using the `openAt()` method:

```xmlui-pg copy display name="Example: Using ContextMenu" height="300px"
---app copy display
<App>
  <Items data="{['Main.xmlui', 'MyComp.xmlui', 'AnotherComp.xmlui']}">
    <Card
      title="File: {$item}"
      onContextMenu="ev => contextMenu.openAt(ev, { file: $item })"
    />
  </Items>
  <ContextMenu id="contextMenu" menuWidth="200px">
    <MenuItem onClick="toast.success('Renamed ' + $context.file)">
      Rename {$context.file}
    </MenuItem>
    <MenuItem onClick="toast.success('Copied ' + $context.file)">
      Copy {$context.file}
    </MenuItem>
    <MenuSeparator />
    <MenuItem onClick="toast.success('Deleted ' + $context.file)">
      Delete {$context.file}
    </MenuItem>
  </ContextMenu>
</App>
---desc
Try right-clicking the cards to see the context menu:
```

%-DESC-END

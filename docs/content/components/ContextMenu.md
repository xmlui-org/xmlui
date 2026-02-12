# ContextMenu [#contextmenu]

`ContextMenu` provides a context-sensitive menu that appears at a specific position when opened programmatically via its `openAt()` API. Unlike `DropdownMenu`, it has no trigger button and is typically used with `onContextMenu` events to create right-click menus or custom context-aware action menus. The menu automatically positions itself within the viewport and closes when clicking outside or when a menu item is selected. 

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

**Context variables available during execution:**

- `$context`: Contains the context data passed to the `openAt()` method. This allows menu items to access information about the element or data that triggered the context menu.

## Behaviors [#behaviors]

This component supports the following behaviors:

- **animation**: Adds animation functionality to components with an 'animation' prop.
- **bookmark**: Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.
- **label**: Adds a label to input components with a 'label' prop using the ItemWithLabel component.
- **pubsub**: Subscribes the component to specified topics and triggers an event when a topic is received.
- **tooltip**: Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.
- **variant**: Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.

## Properties [#properties]

### `menuWidth` [#menuwidth]

Sets the width of the context menu.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

### `close` [#close]

This method closes the context menu.

**Signature**: `close(): void`

### `openAt` [#openat]

This method opens the context menu at the specified event position (e.g., mouse click coordinates). Optionally, you can pass a context object that will be available within the menu as `$context`. The method automatically prevents the browser's default context menu from appearing.

**Signature**: `openAt(event: MouseEvent, context?: any): void`

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

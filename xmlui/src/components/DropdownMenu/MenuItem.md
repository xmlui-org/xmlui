%-DESC-START

**Key features:**
- **Action handling**: Support both navigation (`to` property) and custom click handlers
- **Visual feedback**: Built-in active, hover, and disabled states for clear user interaction
- **Icon support**: Optional icons with flexible positioning (start or end)
- **Menu integration**: Designed to work seamlessly within `DropdownMenu` and `SubMenuItem` hierarchies

**Usage pattern:**
Always used within menu containers like `DropdownMenu`. Use `to` for navigation or `onClick` for custom actions. For complex menu structures, combine with `MenuSeparator` and `SubMenuItem` components.

%-DESC-END

%-PROP-START icon

```xmlui-pg copy display name="Example: icon" height="200px"
<App>
  <DropdownMenu label="DropdownMenu">
    <MenuItem icon="drive">Item 1</MenuItem>
    <MenuItem icon="trash">Item 2</MenuItem>
    <MenuItem icon="email">Item 3</MenuItem>
  </DropdownMenu>
</App>
```

%-PROP-END

%-PROP-START iconPosition

```xmlui-pg copy display name="Example: iconPosition" height="200px"
<App>
  <DropdownMenu label="DropdownMenu">
    <MenuItem icon="drive" iconPosition="start">Item 1</MenuItem>
    <MenuItem icon="trash" iconPosition="end">Item 2</MenuItem>
    <MenuItem icon="email">Item 3</MenuItem>
  </DropdownMenu>
</App>
```

%-PROP-END

%-PROP-START active

```xmlui-pg copy display name="Example: active" height="200px"
<App>
  <DropdownMenu label="DropdownMenu">
    <MenuItem icon="drive" active="true">Item 1</MenuItem>
    <MenuItem icon="trash">Item 2</MenuItem>
    <MenuItem icon="email">Item 3</MenuItem>
  </DropdownMenu>
</App>
```

%-PROP-END

%-EVENT-START click

This event is fired when the user clicks the menu item. With an event handler, you can define how to respond to the user's click. If this event does not have an associated event handler but the `to` property has a value, clicking the component navigates the URL set in `to`.

If both properties are defined, `click` takes precedence.

```xmlui-pg copy display name="Example: click" height="200px"
<DropdownMenu label="DropdownMenu">
  <MenuItem onClick="toast('Item 1 clicked')">Item 1</MenuItem>
  <MenuItem onClick="toast('Item 2 clicked')">Item 2</MenuItem>
  <MenuItem onClick="toast('Item 3 clicked')">Item 3</MenuItem>
</DropdownMenu>
```

%-EVENT-END

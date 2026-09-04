%-DESC-START

**Key features:**
- **Action handling**: Support both navigation (`to` property) and custom click handlers
- **Visual feedback**: Built-in active, hover, and disabled states for clear user interaction
- **Icon support**: Optional icons with flexible positioning (start or end)
- **Menu integration**: Designed to work seamlessly within `DropdownMenu` and `SubMenuItem` hierarchies

**Usage pattern:**
Always used within menu containers like `DropdownMenu`. Use `to` for navigation or `onClick` for custom actions. For complex menu structures, combine with `MenuSeparator` and `SubMenuItem` components.

%-DESC-END

%-PROP-START to

When `to` is set, the menu item is rendered as a real link — an `<a>` element with an `href` —
rather than as an element that merely reacts to a click. That means the browser's own link
affordances work: ctrl/cmd-click and middle-click open the target in a new tab, the target
shows in the status bar on hover, "Copy link address" works from the browser context menu, and
assistive technology can report the destination.

```xmlui-pg copy display name="Example: to" height="200px"
<App>
  <DropdownMenu label="Navigate">
    <MenuItem to="/getting-started">Getting started</MenuItem>
    <MenuItem to="/reference">Reference</MenuItem>
    <MenuItem to="https://github.com/xmlui-org/xmlui">GitHub</MenuItem>
  </DropdownMenu>
</App>
```

> [!WARNING]
> Do not put another link or button (`Link`, `NavLink`, `Button`) inside a `MenuItem` that
> declares `to`. Because the menu item is itself a link, nesting one produces invalid markup
> that browsers and assistive technology handle unpredictably. Either drop `to` from the menu
> item or remove the nested component.

%-PROP-END

%-PROP-START target

This property only has an effect when `to` is set.

```xmlui-pg copy display name="Example: target" height="200px"
<App>
  <DropdownMenu label="DropdownMenu">
    <MenuItem to="https://github.com/xmlui-org/xmlui" target="_blank">
      Open GitHub in a new tab
    </MenuItem>
  </DropdownMenu>
</App>
```

%-PROP-END

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

If both properties are defined, `click` takes precedence: a plain click runs the event handler
and does not navigate. The `href` is still rendered, so the user can deliberately open the
target — for example with ctrl/cmd-click — in which case the browser follows the link and the
event handler does not run.

```xmlui-pg copy display name="Example: click" height="200px"
<DropdownMenu label="DropdownMenu">
  <MenuItem onClick="toast('Item 1 clicked')">Item 1</MenuItem>
  <MenuItem onClick="toast('Item 2 clicked')">Item 2</MenuItem>
  <MenuItem onClick="toast('Item 3 clicked')">Item 3</MenuItem>
</DropdownMenu>
```

%-EVENT-END

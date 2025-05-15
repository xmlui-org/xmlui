# MenuItem [#menuitem]

This property represents a leaf item in a menu hierarchy. Clicking the item triggers an action.

See the [`DropdownMenu` component](./DropdownMenu) for using this component in menus.

## Properties

### `active (default: false)`

This property indicates if the specified menu item is active.

```xmlui-pg copy display name="Example: active" height="200px"
<App>
  <DropdownMenu label="DropdownMenu">
    <MenuItem icon="drive" active="true">Item 1</MenuItem>
    <MenuItem icon="trash">Item 2</MenuItem>
    <MenuItem icon="email">Item 3</MenuItem>
  </DropdownMenu>
</App>
```

### `enabled (default: true)`

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `icon`

This property names an optional icon to display with the menu item.

```xmlui-pg copy display name="Example: icon" height="200px"
<App>
  <DropdownMenu label="DropdownMenu">
    <MenuItem icon="drive">Item 1</MenuItem>
    <MenuItem icon="trash">Item 2</MenuItem>
    <MenuItem icon="email">Item 3</MenuItem>
  </DropdownMenu>
</App>
```

### `iconPosition (default: "start")`

This property allows you to determine the position of the icon displayed in the menu item.

Available values:

| Value | Description |
| --- | --- |
| `start` | The icon will appear at the start (left side when the left-to-right direction is set) **(default)** |
| `end` | The icon will appear at the end (right side when the left-to-right direction is set) |

```xmlui-pg copy display name="Example: iconPosition" height="200px"
<App>
  <DropdownMenu label="DropdownMenu">
    <MenuItem icon="drive" iconPosition="start">Item 1</MenuItem>
    <MenuItem icon="trash" iconPosition="end">Item 2</MenuItem>
    <MenuItem icon="email">Item 3</MenuItem>
  </DropdownMenu>
</App>
```

### `label`

This property sets the label of the component.

### `to`

This property defines the URL of the menu item. If this property is defined (and the `click` event does not have an event handler), clicking the menu item navigates to this link.

## Events

### `click`

This event is triggered when the MenuItem is clicked.

This event is fired when the user clicks the menu item. With an event handler, you can define how to respond to the user's click. If this event does not have an associated event handler but the `to` property has a value, clicking the component navigates the URL set in `to`.

If both properties are defined, `click` takes precedence.

```xmlui-pg copy display name="Example: click" height="200px"
<DropdownMenu label="DropdownMenu">
  <MenuItem onClick="toast('Item 1 clicked')">Item 1</MenuItem>
  <MenuItem onClick="toast('Item 2 clicked')">Item 2</MenuItem>
  <MenuItem onClick="toast('Item 3 clicked')">Item 3</MenuItem>
</DropdownMenu>
```

## Exposed Methods

This component does not expose any methods.

## Styling

### Theme Variables

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-MenuItem | $backgroundColor-dropdown-item | $backgroundColor-dropdown-item |
| [backgroundColor](../styles-and-themes/common-units/#color)-MenuItem--active | $backgroundColor-dropdown-item--active | $backgroundColor-dropdown-item--active |
| [backgroundColor](../styles-and-themes/common-units/#color)-MenuItem--active--hover | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-MenuItem--hover | $backgroundColor-dropdown-item--hover | $backgroundColor-dropdown-item--hover |
| [color](../styles-and-themes/common-units/#color)-MenuItem | $textColor-primary | $textColor-primary |
| [color](../styles-and-themes/common-units/#color)-MenuItem--active | $color-primary | $color-primary |
| [color](../styles-and-themes/common-units/#color)-MenuItem--active--hover | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-MenuItem--disabled | $textColor--disabled | $textColor--disabled |
| [color](../styles-and-themes/common-units/#color)-MenuItem--hover | inherit | inherit |
| [fontFamily](../styles-and-themes/common-units/#fontFamily)-MenuItem | $fontFamily | $fontFamily |
| [fontSize](../styles-and-themes/common-units/#size)-MenuItem | $fontSize-small | $fontSize-small |
| [gap](../styles-and-themes/common-units/#size)-MenuItem | $space-2 | $space-2 |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-MenuItem | $space-3 | $space-3 |
| [paddingVertical](../styles-and-themes/common-units/#size)-MenuItem | $space-2 | $space-2 |

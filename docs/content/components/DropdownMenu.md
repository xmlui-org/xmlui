# DropdownMenu [#dropdownmenu]

This component represents a dropdown menu with a trigger. When the user clicks the trigger, the dropdown menu displays its items.

You can nest `MenuItem`, `MenuSeparator`, and `SubMenuItem` components into `DropdownMenu` to define a menu hierarchy. The component provides a trigger to display the menu items:

```xmlui-pg copy display name="Example: Using DropdownMenu" height="240px"
---app copy display
<App>
  <DropdownMenu label="DropdownMenu">
    <MenuItem>Item 1</MenuItem>
    <MenuItem>Item 2</MenuItem>
    <MenuSeparator />
    <SubMenuItem label="Submenu">
      <MenuItem>Submenu Item 1</MenuItem>
      <MenuItem>Submenu Item 2</MenuItem>
    </SubMenuItem>
  </DropdownMenu>
</App>
---desc
Try this dropdown menu:
```

## Properties [#properties]

### `alignment (default: "start")` [#alignment-default-start]

This property allows you to determine the alignment of the dropdown panel with the displayed menu items.

Available values:

| Value | Description |
| --- | --- |
| `center` | Place the content in the middle |
| `start` | Justify the content to the left (to the right if in right-to-left) **(default)** |
| `end` | Justify the content to the right (to the left if in right-to-left) |

Available values are:
- `start`: Menu items are aligned to the start of the trigger component (default).
- `end`: Menu items are aligned to the end of the trigger component.

```xmlui-pg copy display name="Example: alignment" height="240px"
<App>
  <HStack>
    <DropdownMenu label="Start-aligned menu (open it!)">
      <MenuItem>Item 1</MenuItem>
      <MenuItem>Item 2</MenuItem>
      <MenuItem>Item 3</MenuItem>
    </DropdownMenu>
    <DropdownMenu label="End-aligned menu (open it!)" alignment="end">
      <MenuItem>Item 1</MenuItem>
      <MenuItem>Item 2</MenuItem>
      <MenuItem>Item 3</MenuItem>
    </DropdownMenu>
  </HStack>
</App>
```

### `enabled (default: true)` [#enabled-default-true]

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

```xmlui-pg copy {4, 11} display name="Example: enabled" height="240px"
<App>
  <HStack>
    <DropdownMenu
      enabled="true"
      label="Enabled Dropdown">
      <MenuItem>Item 1</MenuItem>
      <MenuItem>Item 2</MenuItem>
      <MenuItem>Item 3</MenuItem>
    </DropdownMenu>
    <DropdownMenu
      enabled="false"
      label="Disabled Dropdown">
      <MenuItem>Item 1</MenuItem>
      <MenuItem>Item 2</MenuItem>
      <MenuItem>Item 3</MenuItem>
    </DropdownMenu>
  </HStack>
</App>
```

### `label` [#label]

This property sets the label of the component.

### `triggerButtonIcon (default: "triggerButton:DropdownMenu")` [#triggerbuttonicon-default-triggerbutton-dropdownmenu]

This property defines the icon to display on the trigger button. You can change the default icon for all DropdownMenu instances with the "icon.triggerButton:DropdownMenu" declaration in the app configuration file.

### `triggerButtonIconPosition (default: "end")` [#triggerbuttoniconposition-default-end]

This property defines the position of the icon on the trigger button.

Available values:

| Value | Description |
| --- | --- |
| `start` | The icon will appear at the start (left side when the left-to-right direction is set) |
| `end` | The icon will appear at the end (right side when the left-to-right direction is set) **(default)** |

### `triggerButtonThemeColor (default: "primary")` [#triggerbuttonthemecolor-default-primary]

This property defines the theme color of the `Button` as the dropdown menu's trigger. It has no effect when a custom trigger is defined with `triggerTemplate`.

Available values:

| Value | Description |
| --- | --- |
| `attention` | Attention state theme color |
| `primary` | Primary theme color **(default)** |
| `secondary` | Secondary theme color |

### `triggerButtonVariant (default: "ghost")` [#triggerbuttonvariant-default-ghost]

This property defines the theme variant of the `Button` as the dropdown menu's trigger. It has no effect when a custom trigger is defined with `triggerTemplate`.

Available values:

| Value | Description |
| --- | --- |
| `solid` | A button with a border and a filled background. |
| `outlined` | The button is displayed with a border and a transparent background. |
| `ghost` | A button with no border and fill. Only the label is visible; the background is colored when hovered or clicked. **(default)** |

### `triggerTemplate` [#triggertemplate]

This property allows you to define a custom trigger instead of the default one provided by `DropdownMenu`.

```xmlui-pg copy {3-5} display name="Example: triggerTemplate" height="240px"
<App>
  <DropdownMenu label="(ignored)">
    <property name="triggerTemplate">
      <Button label="Custom trigger" icon="chevrondown" iconPosition="end"/>
    </property>
    <MenuItem>Item 1</MenuItem>
    <MenuItem>Item 2</MenuItem>
    <MenuItem>Item 3</MenuItem>
  </DropdownMenu>
</App>
```

## Events [#events]

### `willOpen` [#willopen]

This event fires when the `DropdownMenu` component is opened.

```xmlui-pg copy {6} display name="Example: willOpen" height="240px"
<App>
  <variable name="counter" value="{0}" />
  <Text value="Number of times the dropdown was opened: {counter}" />
  <DropdownMenu
    label="Dropdown"
    onWillOpen="counter += 1">
    <MenuItem>Item 1</MenuItem>
    <MenuItem>Item 2</MenuItem>
    <MenuItem>Item 3</MenuItem>
  </DropdownMenu>
</App>
```

## Exposed Methods [#exposed-methods]

### `close` [#close]

This method command closes the dropdown.

```xmlui-pg copy {4} display name="Example: close" height="240px"
<App>
  <DropdownMenu id="emojiDropDown" label="Emoji Dropdown">
    <EmojiSelector
      onSelect="(reaction) => { emojiDropDown.close(); }"
      autoFocus="true"
    />
  </DropdownMenu>
</App>
```

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-DropdownMenu | $color-surface-raised | $color-surface-raised |
| [borderColor](../styles-and-themes/common-units/#color)-DropdownMenu-content | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-DropdownMenu | $borderRadius | $borderRadius |
| [borderStyle](../styles-and-themes/common-units/#border-style)-DropdownMenu-content | solid | solid |
| [borderWidth](../styles-and-themes/common-units/#size)-DropdownMenu-content | *none* | *none* |
| [boxShadow](../styles-and-themes/common-units/#boxShadow)-DropdownMenu | $boxShadow-xl | $boxShadow-xl |
| [minWidth](../styles-and-themes/common-units/#size)-DropdownMenu | 160px | 160px |

# DropdownMenu [#dropdownmenu]

`DropdownMenu` provides a space-efficient way to present multiple options or actions through a collapsible interface. When clicked, the trigger button reveals a menu that can include items, separators, and nested submenus, making it ideal for navigation, action lists, or any situation requiring many options without permanent screen space.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `alignment` [#alignment]

> [!DEF]  default: **"start"**

This property allows you to determine the alignment of the dropdown panel with the displayed menu items.

Available values:

| Value | Description |
| --- | --- |
| `center` | Place the content in the middle |
| `start` | Justify the content to the left (to the right if in right-to-left) **(default)** |
| `end` | Justify the content to the right (to the left if in right-to-left) |

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

### `triggerButtonIcon` [#triggerbuttonicon]

> [!DEF]  default: **"triggerButton:DropdownMenu"**

This property defines the icon to display on the trigger button. You can change the default icon for all DropdownMenu instances with the "icon.triggerButton:DropdownMenu" declaration in the app configuration file.

### `triggerButtonIconPosition` [#triggerbuttoniconposition]

> [!DEF]  default: **"end"**

This property defines the position of the icon on the trigger button.

Available values:

| Value | Description |
| --- | --- |
| `start` | The icon will appear at the start (left side when the left-to-right direction is set) |
| `end` | The icon will appear at the end (right side when the left-to-right direction is set) **(default)** |

### `triggerButtonThemeColor` [#triggerbuttonthemecolor]

> [!DEF]  default: **"primary"**

This property defines the theme color of the `Button` as the dropdown menu's trigger. It has no effect when a custom trigger is defined with `triggerTemplate`.

Available values:

| Value | Description |
| --- | --- |
| `attention` | Attention state theme color |
| `primary` | Primary theme color **(default)** |
| `secondary` | Secondary theme color |

### `triggerButtonVariant` [#triggerbuttonvariant]

> [!DEF]  default: **"ghost"**

This property defines the theme variant of the `Button` as the dropdown menu's trigger. It has no effect when a custom trigger is defined with `triggerTemplate`.

Available values:

| Value | Description |
| --- | --- |
| `solid` | A button with a border and a filled background. |
| `outlined` | The button is displayed with a border and a transparent background. |
| `ghost` | A button with no border and fill. Only the label is visible; the background is colored when hovered or clicked. **(default)** |

### `triggerTemplate` [#triggertemplate]

This property allows you to define a custom trigger instead of the default one provided by `DropdownMenu`.

## Events [#events]

### `willOpen` [#willopen]

This event fires when the `DropdownMenu` component is about to be opened. You can prevent opening the menu by returning `false` from the event handler. Otherwise, the menu will open at the end of the event handler like normal.

**Signature**: `willOpen(): boolean | void`

## Exposed Methods [#exposed-methods]

### `close` [#close]

This method command closes the dropdown.

**Signature**: `close(): void`

### `open` [#open]

This method command opens the dropdown.

**Signature**: `open(): void`

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`content`**: The content area of the DropdownMenu where menu items are displayed.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-DropdownMenu | $color-surface-raised | $color-surface-raised |
| [borderColor](/docs/styles-and-themes/common-units/#color)-DropdownMenu-content | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-DropdownMenu | $borderRadius | $borderRadius |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-DropdownMenu-content | solid | solid |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-DropdownMenu-content | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-DropdownMenu | $boxShadow-xl | $boxShadow-xl |
| [minWidth](/docs/styles-and-themes/common-units/#size-values)-DropdownMenu | 160px | 160px |

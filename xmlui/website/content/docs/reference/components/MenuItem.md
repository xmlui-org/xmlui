# MenuItem [#menuitem]

`MenuItem` represents individual clickable items within dropdown menus and other menu components. Each menu item can display text, icons, and respond to clicks with either navigation or custom actions, making it the building block for interactive menu systems.

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

### `active` [#active]

> [!DEF]  default: **false**

This property indicates if the specified menu item is active.

### `enabled` [#enabled]

> [!DEF]  default: **true**

This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).

### `icon` [#icon]

This property names an optional icon to display with the menu item. You can use component-specific icons in the format "iconName:MenuItem".

### `iconPosition` [#iconposition]

> [!DEF]  default: **"start"**

This property allows you to determine the position of the icon displayed in the menu item.

Available values:

| Value | Description |
| --- | --- |
| `start` | The icon will appear at the start (left side when the left-to-right direction is set) **(default)** |
| `end` | The icon will appear at the end (right side when the left-to-right direction is set) |

### `label` [#label]

This property sets the label of the component.  If not set, the component will not display a label.

### `to` [#to]

This property defines the URL of the menu item. If this property is defined (and the `click` event does not have an event handler), clicking the menu item navigates to this link.

## Events [#events]

### `click` [#click]

This event is triggered when the MenuItem is clicked.

**Signature**: `click(event: MouseEvent): void`

- `event`: The mouse event object.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-MenuItem | $backgroundColor-dropdown-item | $backgroundColor-dropdown-item |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-MenuItem--active | $backgroundColor-dropdown-item--active | $backgroundColor-dropdown-item--active |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-MenuItem--active--hover | *none* | *none* |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-MenuItem--hover | $backgroundColor-dropdown-item--hover | $backgroundColor-dropdown-item--hover |
| [color](/docs/styles-and-themes/common-units/#color)-MenuItem | $textColor-primary | $textColor-primary |
| [color](/docs/styles-and-themes/common-units/#color)-MenuItem--active | $color-primary | $color-primary |
| [color](/docs/styles-and-themes/common-units/#color)-MenuItem--active--hover | *none* | *none* |
| [color](/docs/styles-and-themes/common-units/#color)-MenuItem--disabled | $textColor--disabled | $textColor--disabled |
| [color](/docs/styles-and-themes/common-units/#color)-MenuItem--hover | inherit | inherit |
| [fontFamily](/docs/styles-and-themes/common-units/#fontFamily)-MenuItem | $fontFamily | $fontFamily |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-MenuItem | $fontSize-sm | $fontSize-sm |
| [gap](/docs/styles-and-themes/common-units/#size)-MenuItem | $space-2 | $space-2 |
| [maxWidth](/docs/styles-and-themes/common-units/#size-values)-MenuItem | 100% | 100% |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-MenuItem | $space-3 | $space-3 |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-MenuItem | $space-2 | $space-2 |

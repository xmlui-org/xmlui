# ResponsiveBar [#responsivebar]

`ResponsiveBar` is a layout container that automatically manages child component overflow by moving items that don't fit into a dropdown menu. It supports both horizontal and vertical orientations and provides a space-efficient way to display navigation items, toolbar buttons, or other components that need to adapt to varying container dimensions while maintaining full functionality.

**Context variables available during execution:**

- `$overflow`: Boolean indicating whether the child component is displayed in the overflow dropdown menu (true) or visible in the main bar (false).

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `dropdownAlignment` [#dropdownalignment]

Alignment of the dropdown menu relative to the trigger button. By default, uses 'end' when reverse is false (dropdown on the right/bottom) and 'start' when reverse is true (dropdown on the left/top).

Available values:

| Value | Description |
| --- | --- |
| `center` | Place the content in the middle |
| `start` | Justify the content to the left (to the right if in right-to-left) |
| `end` | Justify the content to the right (to the left if in right-to-left) |

### `dropdownText` [#dropdowntext]

> [!DEF]  default: **"More options"**

Text to display in the dropdown trigger button label when items overflow. This text is used for accessibility and appears alongside the overflow icon.

### `gap` [#gap]

> [!DEF]  default: **0**

Gap between child elements in pixels. Controls the spacing between items in the responsive bar layout.

### `orientation` [#orientation]

> [!DEF]  default: **"horizontal"**

Layout direction of the responsive bar. In horizontal mode, items are arranged left-to-right and overflow is based on container width. In vertical mode, items are arranged top-to-bottom and overflow is based on container height.

Available values: `horizontal` **(default)**, `vertical`

### `overflowIcon` [#overflowicon]

> [!DEF]  default: **"ellipsisHorizontal:ResponsiveBar"**

Icon to display in the dropdown trigger button when items overflow. You can use component-specific icons in the format "iconName:ResponsiveBar".

### `reverse` [#reverse]

> [!DEF]  default: **false**

Reverses the direction of child elements. In horizontal mode, items are arranged from right to left instead of left to right. In vertical mode, items are arranged from bottom to top instead of top to bottom. The dropdown menu position also adjusts to appear at the start (left/top) instead of the end (right/bottom).

### `triggerTemplate` [#triggertemplate]

This property allows you to define a custom trigger instead of the default one provided by `ResponsiveBar`.

## Events [#events]

### `click` [#click]

This event is triggered when the ResponsiveBar is clicked.

**Signature**: `click(event: MouseEvent): void`

- `event`: The mouse event object.

### `willOpen` [#willopen]

This event fires when the `ResponsiveBar` overflow dropdown menu is about to be opened. You can prevent opening the menu by returning `false` from the event handler. Otherwise, the menu will open at the end of the event handler like normal.

**Signature**: `willOpen(): boolean | void`

## Exposed Methods [#exposed-methods]

### `close` [#close]

This method closes the overflow dropdown menu.

**Signature**: `close(): void`

### `hasOverflow` [#hasoverflow]

This method returns true if the ResponsiveBar currently has an overflow menu (i.e., some items don't fit and are in the dropdown).

**Signature**: `hasOverflow(): boolean`

### `open` [#open]

This method opens the overflow dropdown menu.

**Signature**: `open(): void`

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-ResponsiveBar | transparent | transparent |
| [margin](/docs/styles-and-themes/common-units/#size-values)-ResponsiveBar | 0 | 0 |
| [padding](/docs/styles-and-themes/common-units/#size-values)-ResponsiveBar | 0 | 0 |

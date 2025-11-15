# ResponsiveBar [#responsivebar]

`ResponsiveBar` is a layout container that automatically manages child component overflow by moving items that don't fit into a dropdown menu. It supports both horizontal and vertical orientations and provides a space-efficient way to display navigation items, toolbar buttons, or other components that need to adapt to varying container dimensions while maintaining full functionality.

**Key features:**
- **Automatic overflow management**: Automatically moves items that don't fit into a dropdown menu
- **Responsive design**: Adapts to container width changes in real-time
- **Zero configuration**: Works out of the box with sensible defaults
- **Customizable overflow icon**: Use custom icons for the overflow dropdown trigger

The component monitors its container width and automatically determines which child components fit within the available space. Components that don't fit are moved into a dropdown menu accessible via a "..." trigger button.

```xmlui-pg copy display name="Example: Basic ResponsiveBar" height="220px"
---app copy display
<App>
  <ResponsiveBar>
    <Button label="File" />
    <Button label="Edit" />
    <Button label="View" />
    <Button label="Very Long Menu Name" />
    <Button label="Project" />
    <Button label="Build" />
    <Button label="Window" />
    <Button label="Help" />
  </ResponsiveBar>
</App>
---desc
Try resizing the container or browser window to see the responsive behavior:
```

**Context variables available during execution:**

- `$overflow`: Boolean indicating whether the child component is displayed in the overflow dropdown menu (true) or visible in the main bar (false).

## Properties [#properties]

### `dropdownAlignment` [#dropdownalignment]

Alignment of the dropdown menu relative to the trigger button. By default, uses 'end' when reverse is false (dropdown on the right/bottom) and 'start' when reverse is true (dropdown on the left/top).

Available values:

| Value | Description |
| --- | --- |
| `center` | Place the content in the middle |
| `start` | Justify the content to the left (to the right if in right-to-left) |
| `end` | Justify the content to the right (to the left if in right-to-left) |

### `dropdownText` (default: "More options") [#dropdowntext-default-more-options]

Text to display in the dropdown trigger button label when items overflow. This text is used for accessibility and appears alongside the overflow icon.

### `gap` (default: 0) [#gap-default-0]

Gap between child elements in pixels. Controls the spacing between items in the responsive bar layout.

### `orientation` (default: "horizontal") [#orientation-default-horizontal]

Layout direction of the responsive bar. In horizontal mode, items are arranged left-to-right and overflow is based on container width. In vertical mode, items are arranged top-to-bottom and overflow is based on container height.

Available values: `horizontal` **(default)**, `vertical`

### `overflowIcon` (default: "ellipsisHorizontal:ResponsiveBar") [#overflowicon-default-ellipsishorizontal-responsivebar]

Icon to display in the dropdown trigger button when items overflow. You can use component-specific icons in the format "iconName:ResponsiveBar".

You can customize the icon used for the overflow dropdown trigger:

```xmlui-pg copy display name="Example: Custom overflow icon" height="220px"
<App>
  <ResponsiveBar overflowIcon="dotmenu">
    <Button label="File" />
    <Button label="Edit" />
    <Button label="View" />
    <Button label="Very Long Menu Name" />
    <Button label="Project" />
    <Button label="Build" />
    <Button label="Window" />
    <Button label="Help" />
  </ResponsiveBar>
</App>
```

### `reverse` (default: false) [#reverse-default-false]

Reverses the direction of child elements. In horizontal mode, items are arranged from right to left instead of left to right. In vertical mode, items are arranged from bottom to top instead of top to bottom. The dropdown menu position also adjusts to appear at the start (left/top) instead of the end (right/bottom).

### `triggerTemplate` [#triggertemplate]

This property allows you to define a custom trigger instead of the default one provided by `ResponsiveBar`.

## Events [#events]

### `click` [#click]

This event is triggered when the ResponsiveBar is clicked.

```xmlui-pg copy display name="Example: Click event" height="200px"
<App>
  <variable name="clickCount" value="{0}" />
  <Text value="ResponsiveBar clicked {clickCount} times" />
  <ResponsiveBar onClick="clickCount += 1">
    <Button label="Item 1" />
    <Button label="Item 2" />
    <Button label="Item 3" />
    <Button label="Item 4" />
    <Button label="Item 5" />
    <Button label="Item 6" />
    <Button label="Item 7" />
    <Button label="Item 8" />
    <Button label="Item 9" />
  </ResponsiveBar>
</App>
```

### `willOpen` [#willopen]

This event fires when the `ResponsiveBar` overflow dropdown menu is about to be opened. You can prevent opening the menu by returning `false` from the event handler. Otherwise, the menu will open at the end of the event handler like normal.

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
| [backgroundColor](../styles-and-themes/common-units/#color)-ResponsiveBar | transparent | transparent |
| [margin](../styles-and-themes/common-units/#size)-ResponsiveBar | 0 | 0 |
| [padding](../styles-and-themes/common-units/#size)-ResponsiveBar | 0 | 0 |

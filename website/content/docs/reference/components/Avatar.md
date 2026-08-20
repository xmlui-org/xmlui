# Avatar [#avatar]

`Avatar` displays a user or entity's profile picture as a circular image, with automatic fallback to initials when no image is provided. It's commonly used in headers, user lists, comments, and anywhere you need to represent a person or organization.

**Key features:**
- **Automatic fallback**: Shows initials when no image URL is provided or image fails to load
- **Multiple sizes**: Predefined sizes (xs, sm, md, lg) scale with font size, or use custom CSS values for precise control
- **Clickable**: Supports click events for profile actions, modals, or navigation
- **Accessible**: Automatically generates appropriate alt text from the name

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `name` [#name]

This property sets the name value the Avatar uses to display initials. If neither this property nor `url` is defined, an empty avatar is displayed.

```xmlui-pg copy display name="Example: name"
<App>
  <Avatar name="John, Doe" />
</App>
```

### `size` [#size]

> [!DEF]  default: **"sm"**

This property defines the display size of the Avatar. Predefined sizes (xs, sm, md, lg) scale with the current font size (using em units). Custom CSS values (e.g., '50px', '3rem', '5em') are supported for both width and height, with font-size automatically calculated at approximately 33% of the width for proper initial display.

Available values:

| Value | Description |
| --- | --- |
| `xs` | Extra small |
| `sm` | Small **(default)** |
| `md` | Medium |
| `lg` | Large |
| `xl` | Extra large |

Predefined sizes scale with the current font size:

```xmlui-pg copy display name="Example: Predefined sizes"
<App>
  <HStack>
    <Avatar name="Dorothy Ellen Fuller" />
    <Avatar name="Xavier Schiller" size="xs" />
    <Avatar name="Sebastien Moore" size="sm" />
    <Avatar name="Molly Dough" size="md" />
    <Avatar name="Lynn Gilbert" size="lg" />
  </HStack>
</App>
```

Custom CSS values can be used for precise sizing:

```xmlui-pg copy display name="Example: Custom sizes"
<App>
  <HStack verticalAlignment="center">
    <Avatar name="John Doe" size="40px" />
    <Avatar name="Jane Smith" size="60px" />
    <Avatar name="Bob Wilson" size="80px" />
    <Avatar name="Alice Brown" size="6rem" />
  </HStack>
</App>
```

### `url` [#url]

This property specifies the URL of the image to display in the Avatar. If neither this property nor `name` is defined, an empty avatar is displayed.

```xmlui-pg copy display name="Example: url"
<App>
  <Avatar url="https://i.pravatar.cc/100" size="md" />
</App>
```

## Events [#events]

### `click` [#click]

This event is triggered when the Avatar is clicked.

**Signature**: `click(event: MouseEvent): void`

- `event`: The mouse event object.

```xmlui-pg copy display name="Example: click"
<App>
  <HStack verticalAlignment="center">
    <Avatar name="Molly Dough" size="md" onClick="toast('Avatar clicked')" />
    Click the avatar!
  </HStack>
</App>
```

### `contextMenu` [#contextmenu]

This event is triggered when the Avatar is right-clicked (context menu).

**Signature**: `contextMenu(event: MouseEvent): void`

- `event`: The mouse event object.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor-Avatar](/docs/styles-and-themes/common-units/#color) | $color-surface-100 | $color-surface-100 |
| [border-Avatar](/docs/styles-and-themes/common-units/#border) | 0px solid $color-surface-400A80 | 0px solid $color-surface-400A80 |
| [borderBottom-Avatar](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottomColor-Avatar](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomStyle-Avatar](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomWidth-Avatar](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderColor-Avatar](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderEndEndRadius-Avatar](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-Avatar](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderHorizontal-Avatar](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontalColor-Avatar](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalStyle-Avatar](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalWidth-Avatar](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeft-Avatar](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeftColor-Avatar](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftStyle-Avatar](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftWidth-Avatar](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRadius-Avatar](/docs/styles-and-themes/common-units/#border-rounding) | 4px | 4px |
| [borderRight-Avatar](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRightColor-Avatar](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightStyle-Avatar](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightWidth-Avatar](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderStartEndRadius-Avatar](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-Avatar](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-Avatar](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTop-Avatar](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTopColor-Avatar](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopStyle-Avatar](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopWidth-Avatar](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVertical-Avatar](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVerticalColor-Avatar](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalStyle-Avatar](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalWidth-Avatar](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Avatar](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [boxShadow-Avatar](/docs/styles-and-themes/common-units/#boxShadow) | inset 0 0 0 1px rgba(4,32,69,0.1) | inset 0 0 0 1px rgba(4,32,69,0.1) |
| [fontWeight-Avatar](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-bold | $fontWeight-bold |
| [textColor-Avatar](/docs/styles-and-themes/common-units/#color) | $textColor-secondary | $textColor-secondary |

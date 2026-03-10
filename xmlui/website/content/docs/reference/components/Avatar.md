# Avatar [#avatar]

`Avatar` displays a user or entity's profile picture as a circular image, with automatic fallback to initials when no image is provided. It's commonly used in headers, user lists, comments, and anywhere you need to represent a person or organization.

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

### `name` [#name]

This property sets the name value the Avatar uses to display initials. If neither this property nor `url` is defined, an empty avatar is displayed.

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

### `url` [#url]

This property specifies the URL of the image to display in the Avatar. If neither this property nor `name` is defined, an empty avatar is displayed.

## Events [#events]

### `click` [#click]

This event is triggered when the Avatar is clicked.

**Signature**: `click(event: MouseEvent): void`

- `event`: The mouse event object.

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
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Avatar | $color-surface-100 | $color-surface-100 |
| [border](/docs/styles-and-themes/common-units/#border)-Avatar | 0px solid $color-surface-400A80 | 0px solid $color-surface-400A80 |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-Avatar | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-Avatar | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-Avatar | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-Avatar | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Avatar | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Avatar | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Avatar | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-Avatar | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-Avatar | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-Avatar | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-Avatar | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-Avatar | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-Avatar | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-Avatar | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-Avatar | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-Avatar | 4px | 4px |
| [borderRight](/docs/styles-and-themes/common-units/#border)-Avatar | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-Avatar | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-Avatar | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-Avatar | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Avatar | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Avatar | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Avatar | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-Avatar | *none* | *none* |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-Avatar | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-Avatar | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-Avatar | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-Avatar | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-Avatar | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-Avatar | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-Avatar | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Avatar | *none* | *none* |
| [boxShadow](/docs/styles-and-themes/common-units/#boxShadow)-Avatar | inset 0 0 0 1px rgba(4,32,69,0.1) | inset 0 0 0 1px rgba(4,32,69,0.1) |
| [fontWeight](/docs/styles-and-themes/common-units/#fontWeight)-Avatar | $fontWeight-bold | $fontWeight-bold |
| [textColor](/docs/styles-and-themes/common-units/#color)-Avatar | $textColor-secondary | $textColor-secondary |

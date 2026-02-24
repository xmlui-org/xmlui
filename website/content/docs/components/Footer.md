# Footer [#footer]

`Footer` provides a designated area at the bottom of your application for footer content such as branding, copyright notices, or utility controls like theme toggles.

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

### `sticky` [#sticky]

> [!DEF]  default: **true**

When set to true (default), keeps the Footer docked to the bottom of the page in sticky layouts. When set to false, allows the Footer to scroll with the main content for non-desktop layouts. In desktop layout, the Footer remains sticky regardless of this property.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-Footer | $backgroundColor-AppHeader | $backgroundColor-AppHeader |
| [border](../styles-and-themes/common-units/#border)-Footer | *none* | *none* |
| [borderBottom](../styles-and-themes/common-units/#border)-Footer | *none* | *none* |
| [borderBottomColor](../styles-and-themes/common-units/#color)-Footer | *none* | *none* |
| [borderBottomStyle](../styles-and-themes/common-units/#border-style)-Footer | *none* | *none* |
| [borderBottomWidth](../styles-and-themes/common-units/#size)-Footer | *none* | *none* |
| [borderColor](../styles-and-themes/common-units/#color)-Footer | *none* | *none* |
| [borderEndEndRadius](../styles-and-themes/common-units/#border-rounding)-Footer | *none* | *none* |
| [borderEndStartRadius](../styles-and-themes/common-units/#border-rounding)-Footer | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Footer | *none* | *none* |
| [borderHorizontalColor](../styles-and-themes/common-units/#color)-Footer | *none* | *none* |
| [borderHorizontalStyle](../styles-and-themes/common-units/#border-style)-Footer | *none* | *none* |
| [borderHorizontalWidth](../styles-and-themes/common-units/#size)-Footer | *none* | *none* |
| [borderLeft](../styles-and-themes/common-units/#border)-Footer | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Footer | *none* | *none* |
| [borderLeftStyle](../styles-and-themes/common-units/#border-style)-Footer | *none* | *none* |
| [borderLeftWidth](../styles-and-themes/common-units/#size)-Footer | *none* | *none* |
| [borderRight](../styles-and-themes/common-units/#border)-Footer | *none* | *none* |
| [color](../styles-and-themes/common-units/#color)-Footer | *none* | *none* |
| [borderRightStyle](../styles-and-themes/common-units/#border-style)-Footer | *none* | *none* |
| [borderRightWidth](../styles-and-themes/common-units/#size)-Footer | *none* | *none* |
| [borderStartEndRadius](../styles-and-themes/common-units/#border-rounding)-Footer | *none* | *none* |
| [borderStartStartRadius](../styles-and-themes/common-units/#border-rounding)-Footer | *none* | *none* |
| [borderStyle](../styles-and-themes/common-units/#border-style)-Footer | *none* | *none* |
| [borderTop](../styles-and-themes/common-units/#border)-Footer | 1px solid $borderColor | 1px solid $borderColor |
| [borderTopColor](../styles-and-themes/common-units/#color)-Footer | *none* | *none* |
| [borderTopStyle](../styles-and-themes/common-units/#border-style)-Footer | *none* | *none* |
| [borderTopWidth](../styles-and-themes/common-units/#size)-Footer | *none* | *none* |
| [borderHorizontal](../styles-and-themes/common-units/#border)-Footer | *none* | *none* |
| [borderVerticalColor](../styles-and-themes/common-units/#color)-Footer | *none* | *none* |
| [borderVerticalStyle](../styles-and-themes/common-units/#border-style)-Footer | *none* | *none* |
| [borderVerticalWidth](../styles-and-themes/common-units/#size)-Footer | *none* | *none* |
| [borderWidth](../styles-and-themes/common-units/#size)-Footer | *none* | *none* |
| [fontSize](../styles-and-themes/common-units/#size)-Footer | $fontSize-sm | $fontSize-sm |
| [gap](../styles-and-themes/common-units/#size)-Footer | $space-normal | $space-normal |
| [height](../styles-and-themes/common-units/#size)-Footer | *none* | *none* |
| [margin](../styles-and-themes/common-units/#size)-Footer | 0 auto | 0 auto |
| [maxWidth-content](../styles-and-themes/common-units/#size)-Footer | $maxWidth-content | $maxWidth-content |
| [padding](../styles-and-themes/common-units/#size)-Footer | $space-2 $space-4 | $space-2 $space-4 |
| [paddingBottom](../styles-and-themes/common-units/#size)-Footer | *none* | *none* |
| [paddingHorizontal](../styles-and-themes/common-units/#size)-Footer | *none* | *none* |
| [paddingLeft](../styles-and-themes/common-units/#size)-Footer | *none* | *none* |
| [paddingRight](../styles-and-themes/common-units/#size)-Footer | *none* | *none* |
| [paddingTop](../styles-and-themes/common-units/#size)-Footer | *none* | *none* |
| [paddingVertical](../styles-and-themes/common-units/#size)-Footer | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-Footer | $textColor-secondary | $textColor-secondary |
| [verticalAlignment](../styles-and-themes/common-units/#alignment)-Footer | center | center |

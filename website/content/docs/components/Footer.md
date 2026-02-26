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
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Footer | $backgroundColor-AppHeader | $backgroundColor-AppHeader |
| [border](/docs/styles-and-themes/common-units/#border)-Footer | *none* | *none* |
| [borderBottom](/docs/styles-and-themes/common-units/#border)-Footer | *none* | *none* |
| [borderBottomColor](/docs/styles-and-themes/common-units/#color)-Footer | *none* | *none* |
| [borderBottomStyle](/docs/styles-and-themes/common-units/#border-style)-Footer | *none* | *none* |
| [borderBottomWidth](/docs/styles-and-themes/common-units/#size-values)-Footer | *none* | *none* |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Footer | *none* | *none* |
| [borderEndEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Footer | *none* | *none* |
| [borderEndStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Footer | *none* | *none* |
| [borderHorizontal](/docs/styles-and-themes/common-units/#border)-Footer | *none* | *none* |
| [borderHorizontalColor](/docs/styles-and-themes/common-units/#color)-Footer | *none* | *none* |
| [borderHorizontalStyle](/docs/styles-and-themes/common-units/#border-style)-Footer | *none* | *none* |
| [borderHorizontalWidth](/docs/styles-and-themes/common-units/#size-values)-Footer | *none* | *none* |
| [borderLeft](/docs/styles-and-themes/common-units/#border)-Footer | *none* | *none* |
| [borderLeftColor](/docs/styles-and-themes/common-units/#color)-Footer | *none* | *none* |
| [borderLeftStyle](/docs/styles-and-themes/common-units/#border-style)-Footer | *none* | *none* |
| [borderLeftWidth](/docs/styles-and-themes/common-units/#size-values)-Footer | *none* | *none* |
| [borderRight](/docs/styles-and-themes/common-units/#border)-Footer | *none* | *none* |
| [borderRightColor](/docs/styles-and-themes/common-units/#color)-Footer | *none* | *none* |
| [borderRightStyle](/docs/styles-and-themes/common-units/#border-style)-Footer | *none* | *none* |
| [borderRightWidth](/docs/styles-and-themes/common-units/#size-values)-Footer | *none* | *none* |
| [borderStartEndRadius](/docs/styles-and-themes/common-units/#border-rounding)-Footer | *none* | *none* |
| [borderStartStartRadius](/docs/styles-and-themes/common-units/#border-rounding)-Footer | *none* | *none* |
| [borderStyle](/docs/styles-and-themes/common-units/#border-style)-Footer | *none* | *none* |
| [borderTop](/docs/styles-and-themes/common-units/#border)-Footer | 1px solid $borderColor | 1px solid $borderColor |
| [borderTopColor](/docs/styles-and-themes/common-units/#color)-Footer | *none* | *none* |
| [borderTopStyle](/docs/styles-and-themes/common-units/#border-style)-Footer | *none* | *none* |
| [borderTopWidth](/docs/styles-and-themes/common-units/#size-values)-Footer | *none* | *none* |
| [borderVertical](/docs/styles-and-themes/common-units/#border)-Footer | *none* | *none* |
| [borderVerticalColor](/docs/styles-and-themes/common-units/#color)-Footer | *none* | *none* |
| [borderVerticalStyle](/docs/styles-and-themes/common-units/#border-style)-Footer | *none* | *none* |
| [borderVerticalWidth](/docs/styles-and-themes/common-units/#size-values)-Footer | *none* | *none* |
| [borderWidth](/docs/styles-and-themes/common-units/#size-values)-Footer | *none* | *none* |
| [fontSize](/docs/styles-and-themes/common-units/#size-values)-Footer | $fontSize-sm | $fontSize-sm |
| [gap](/docs/styles-and-themes/common-units/#size)-Footer | $space-normal | $space-normal |
| [height](/docs/styles-and-themes/common-units/#size-values)-Footer | *none* | *none* |
| [margin](/docs/styles-and-themes/common-units/#size-values)-Footer | 0 auto | 0 auto |
| [maxWidth-content](/docs/styles-and-themes/common-units/#size-values)-Footer | $maxWidth-content | $maxWidth-content |
| [padding](/docs/styles-and-themes/common-units/#size-values)-Footer | $space-2 $space-4 | $space-2 $space-4 |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-Footer | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-Footer | *none* | *none* |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-Footer | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-Footer | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-Footer | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-Footer | *none* | *none* |
| [textColor](/docs/styles-and-themes/common-units/#color)-Footer | $textColor-secondary | $textColor-secondary |
| [verticalAlignment](/docs/styles-and-themes/common-units/#alignment)-Footer | center | center |

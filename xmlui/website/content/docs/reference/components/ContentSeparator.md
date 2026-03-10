# ContentSeparator [#contentseparator]

`ContentSeparator` creates visual dividers between content sections using horizontal or vertical lines. It's essential for improving readability by breaking up dense content, separating list items, or creating clear boundaries between different UI sections.

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

### `length` [#length]

This property defines the component's width (if the `orientation` is horizontal) or the height (if the `orientation` is vertical). If not defined, the component uses the theme variable `length-ContentSeparator` (default: 100%).

### `orientation` [#orientation]

> [!DEF]  default: **"horizontal"**

Sets the main axis of the component

Available values:

| Value | Description |
| --- | --- |
| `horizontal` | The component will fill the available space horizontally **(default)** |
| `vertical` | The component will fill the available space vertically |

### `thickness` [#thickness]

This property defines the component's height (if the `orientation` is horizontal) or the width (if the `orientation` is vertical). If not defined, the component uses the theme variable `thickness-ContentSeparator` (default: 1px).

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-ContentSeparator | $color-surface-200 | $color-surface-200 |
| length-ContentSeparator | 100% | 100% |
| [marginBottom](/docs/styles-and-themes/common-units/#size-values)-ContentSeparator | *none* | *none* |
| [margin](/docs/styles-and-themes/common-units/#size-values)Horizontal-ContentSeparator | 0 | 0 |
| [marginLeft](/docs/styles-and-themes/common-units/#size-values)-ContentSeparator | *none* | *none* |
| [marginRight](/docs/styles-and-themes/common-units/#size-values)-ContentSeparator | *none* | *none* |
| [marginTop](/docs/styles-and-themes/common-units/#size-values)-ContentSeparator | *none* | *none* |
| [margin](/docs/styles-and-themes/common-units/#size-values)Vertical-ContentSeparator | 0 | 0 |
| [paddingBottom](/docs/styles-and-themes/common-units/#size-values)-ContentSeparator | *none* | *none* |
| [paddingHorizontal](/docs/styles-and-themes/common-units/#size-values)-ContentSeparator | 0 | 0 |
| [paddingLeft](/docs/styles-and-themes/common-units/#size-values)-ContentSeparator | *none* | *none* |
| [paddingRight](/docs/styles-and-themes/common-units/#size-values)-ContentSeparator | *none* | *none* |
| [paddingTop](/docs/styles-and-themes/common-units/#size-values)-ContentSeparator | *none* | *none* |
| [paddingVertical](/docs/styles-and-themes/common-units/#size-values)-ContentSeparator | 0 | 0 |
| [thickness](/docs/styles-and-themes/common-units/#size-values)-ContentSeparator | 1px | 1px |

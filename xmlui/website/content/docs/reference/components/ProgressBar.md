# ProgressBar [#progressbar]

`ProgressBar` provides a visual indicator showing the completion percentage of tasks, processes, or any measurable progress. It displays as a horizontal bar that fills from left to right based on the provided value between 0 (empty) and 1 (complete).

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

### `value` [#value]

> [!DEF]  default: **0**

This property defines the progress value with a number between 0 and 1.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-ProgressBar | $color-surface-200 | $color-surface-200 |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-indicator-ProgressBar | 999em | 999em |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-ProgressBar | 999em | 999em |
| [color](/docs/styles-and-themes/common-units/#color)-indicator-ProgressBar | $color-primary-500 | $color-primary-500 |
| [color](/docs/styles-and-themes/common-units/#color)-indicator-ProgressBar--complete | *none* | *none* |
| [thickness](/docs/styles-and-themes/common-units/#size-values)-ProgressBar | 0.5em | 0.5em |

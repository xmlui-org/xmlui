# Spinner [#spinner]

`Spinner` is an animated indicator that represents an action in progress with no deterministic progress value.

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

### `delay` [#delay]

> [!DEF]  default: **400**

The delay in milliseconds before the spinner is displayed.

### `fullScreen` [#fullscreen]

> [!DEF]  default: **false**

If set to `true`, the component will be rendered in a full screen container.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Spinner | $color-surface-400 | $color-surface-400 |
| [size](/docs/styles-and-themes/common-units/#size-values)-Spinner | 2.5em | 2.5em |
| [thickness](/docs/styles-and-themes/common-units/#size-values)-Spinner | 0.125em | 0.125em |

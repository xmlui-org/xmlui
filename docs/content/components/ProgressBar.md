# ProgressBar [#progressbar]

A `ProgressBar` component visually represents the progress of a task or process.

## Properties

### `value (default: 0)`

This property defines the progress value with a number between 0 and 1.

The following example demonstrates using it:

```xmlui-pg copy {2-6} display name="Example: value" height="200px"
<App>
  <ProgressBar />
  <ProgressBar value="0.2"/>
  <ProgressBar value="0.6"/>
  <ProgressBar value="1"/>
  <ProgressBar value="1.2"/>
</App>
```

## Events

This component does not have any events.

## Exposed Methods

This component does not expose any methods.

## Styling

### Theme Variables

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-ProgressBar | $color-surface-200 | $color-surface-200 |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-indicator-ProgressBar | 0px | 0px |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-ProgressBar | $borderRadius | $borderRadius |
| [color](../styles-and-themes/common-units/#color)-indicator-ProgressBar | $color-primary-500 | $color-primary-500 |
| [thickness](../styles-and-themes/common-units/#size)-ProgressBar | $space-2 | $space-2 |

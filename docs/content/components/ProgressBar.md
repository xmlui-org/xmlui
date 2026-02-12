# ProgressBar [#progressbar]

`ProgressBar` provides a visual indicator showing the completion percentage of tasks, processes, or any measurable progress. It displays as a horizontal bar that fills from left to right based on the provided value between 0 (empty) and 1 (complete).

**Key features:**
- **Percentage visualization**: Displays progress as a filled portion of a horizontal bar
- **Flexible value handling**: Accepts values from 0 to 1, with automatic bounds handling for out-of-range values
- **Extensive theming**: Customizable background color, indicator color, thickness, and border radius
- **Responsive design**: Adapts to container width while maintaining consistent height

## Behaviors [#behaviors]

This component supports the following behaviors:

- **animation**: Adds animation functionality to components with an 'animation' prop.
- **bookmark**: Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.
- **label**: Adds a label to input components with a 'label' prop using the ItemWithLabel component.
- **pubsub**: Subscribes the component to specified topics and triggers an event when a topic is received.
- **tooltip**: Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.
- **variant**: Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.

## Properties [#properties]

### `value` [#value]

-  default: **0**

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

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-ProgressBar | $color-surface-200 | $color-surface-200 |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-indicator-ProgressBar | 999em | 999em |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-ProgressBar | 999em | 999em |
| [color](../styles-and-themes/common-units/#color)-indicator-ProgressBar | $color-primary-500 | $color-primary-500 |
| [color](../styles-and-themes/common-units/#color)-indicator-ProgressBar--complete | *none* | *none* |
| [thickness](../styles-and-themes/common-units/#size)-ProgressBar | 0.5em | 0.5em |

# ToneSwitch [#toneswitch]

`ToneSwitch` enables the user to switch between light and dark modes using a switch control.

```xmlui-pg {4} copy display name="Example: using ToneSwitch"
<App>
  <AppHeader>
    <SpaceFiller />
    <ToneSwitch />
  </AppHeader>
  <Card
    title="Tone Switch"
    subtitle="Toggle the switch to change the tone."
  />
</App>
```

## Behaviors [#behaviors]

This component supports the following behaviors:

- **animation**: Adds animation functionality to components with an 'animation' prop.
- **bookmark**: Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.
- **label**: Adds a label to input components with a 'label' prop using the ItemWithLabel component.
- **pubsub**: Subscribes the component to specified topics and triggers an event when a topic is received.
- **tooltip**: Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.
- **variant**: Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.

## Properties [#properties]

### `iconDark` [#icondark]

-  default: **"moon"**

Icon to display for dark mode

### `iconLight` [#iconlight]

-  default: **"sun"**

Icon to display for light mode

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-ToneSwitch-dark | $color-primary-500 | $color-primary-500 |
| [backgroundColor](../styles-and-themes/common-units/#color)-ToneSwitch-light | $color-surface-200 | $color-surface-700 |
| [borderColor](../styles-and-themes/common-units/#color)-ToneSwitch | $color-surface-200 | $color-surface-600 |
| [borderColor](../styles-and-themes/common-units/#color)-ToneSwitch--hover | $color-surface-300 | $color-surface-500 |
| [color](../styles-and-themes/common-units/#color)-ToneSwitch-dark | $color-surface-0 | $color-surface-0 |
| [color](../styles-and-themes/common-units/#color)-ToneSwitch-light | $color-text-primary | $color-text-primary |

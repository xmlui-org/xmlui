# Spinner [#spinner]

`Spinner` is an animated indicator that represents an action in progress with no deterministic progress value.

While it is visible, the action is yet to be completed; on completion, the UI logic may opt to remove the component.

## Using the `Spinner` [#using-the-spinner]

```xmlui-pg copy display name="Example: using Spinner"
<App>
  <Spinner />
</App>
```

>[!INFO]
> `Spinner` ignores the `width`, `minWidth`, `maxWidth`, `height`, `minHeight`, and `maxHeight` properties. If you want to change its size, use the `size-Spinner` theme variable (see details is the [Styling](#styling) section).

## Behaviors [#behaviors]

This component supports the following behaviors:

- **animation**: Adds animation functionality to components with an 'animation' prop.
- **bookmark**: Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.
- **label**: Adds a label to input components with a 'label' prop using the ItemWithLabel component.
- **pubsub**: Subscribes the component to specified topics and triggers an event when a topic is received.
- **tooltip**: Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.
- **variant**: Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.

## Properties [#properties]

### `delay` [#delay]

-  default: **400**

The delay in milliseconds before the spinner is displayed.

Use the buttons to toggle between the two `Spinners`.

```xmlui-pg copy {8-9} display name="Example: delay"
<App>
  <variable name="noDelay" value="{true}" />
  <variable name="yesDelay" value="{false}" />
  <HStack gap="$space-0_5">
    <Button label="No delay" onClick="noDelay = true; yesDelay = false;" />
    <Button label="1000 ms delay" onClick="noDelay = false; yesDelay = true;" />
  </HStack>
  <Spinner when="{noDelay}" delay="0" />
  <Spinner when="{yesDelay}" delay="1000" />
</App>
```

### `fullScreen` [#fullscreen]

-  default: **false**

If set to `true`, the component will be rendered in a full screen container.

```xmlui-pg copy display name="Example: fullScreen" height="200px"
<App>
  <Spinner fullScreen="true" />
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
| [borderColor](../styles-and-themes/common-units/#color)-Spinner | $color-surface-400 | $color-surface-400 |
| [size](../styles-and-themes/common-units/#size)-Spinner | 2.5em | 2.5em |
| [thickness](../styles-and-themes/common-units/#size)-Spinner | 0.125em | 0.125em |

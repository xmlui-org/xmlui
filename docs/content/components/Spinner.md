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

> [!DEF]  default: **false**

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

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

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | N/A |

## Properties [#properties]

### `iconDark` [#icondark]

> [!DEF]  default: **"moon"**

Icon to display for dark mode

### `iconLight` [#iconlight]

> [!DEF]  default: **"sun"**

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

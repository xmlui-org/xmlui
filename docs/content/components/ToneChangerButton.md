# ToneChangerButton [#tonechangerbutton]

`ToneChangerButton` enables the user to switch between light and dark modes.

```xmlui-pg {4} copy display name="Example: using ToneChangerButton"
<App>
  <AppHeader>
    <SpaceFiller />
    <ToneChangerButton />
  </AppHeader>
  <Card
    title="Tone Changer Button"
    subtitle="Click the button in the header to change the tone."
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
| Styling Variant | `variant` |

## Properties [#properties]

### `darkToLightIcon` [#darktolighticon]

> [!DEF]  default: **"darkToLight:ToneChangerButton"**

The icon displayed when the theme is in dark mode and will switch to light. You can change the default icon for all ToneChangerButton instances with the "icon.darkToLight:ToneChangerButton" declaration in the app configuration file.

### `lightToDarkIcon` [#lighttodarkicon]

> [!DEF]  default: **"lightToDark:ToneChangerButton"**

The icon displayed when the theme is in light mode and will switch to dark. You can change the default icon for all ToneChangerButton instances with the "icon.lightToDark:ToneChangerButton" declaration in the app configuration file.

## Events [#events]

### `click` [#click]

This event is triggered when the ToneChangerButton is clicked.

**Signature**: `click(event: MouseEvent): void`

- `event`: The mouse event object.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.

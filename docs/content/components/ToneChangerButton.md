# ToneChangerButton [#tonechangerbutton]

>[!WARNING]
> This component is in an **experimental** state; you can use it in your app. However, we may modify it, and it may even have breaking changes in the future.The `ToneChangerButton` component is a component that allows the user to change the tone of the app.

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

## Properties [#properties]

### `darkToLightIcon` [#darktolighticon]

The icon displayed when the theme is in dark mode and will switch to light. You can change the default icon for all ToneChangerButton instances with the "icon.darkToLight:ToneChangerButton" declaration in the app configuration file.

### `lightToDarkIcon` [#lighttodarkicon]

The icon displayed when the theme is in light mode and will switch to dark. You can change the default icon for all ToneChangerButton instances with the "icon.lightToDark:ToneChangerButton" declaration in the app configuration file.

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.

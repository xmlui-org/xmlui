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
    subtitle="Use the switch in the header to change the tone."
  />
</App>
```

## Properties [#properties]

### `darkIcon (default: "moon:ToneSwitch")` [#darkicon-default-moon-toneswitch]

The icon displayed when the theme is in dark mode. You can change the default icon for all ToneSwitch instances with the "icon.dark:ToneSwitch" declaration in the app configuration file.

### `lightIcon (default: "sun:ToneSwitch")` [#lighticon-default-sun-toneswitch]

The icon displayed when the theme is in light mode. You can change the default icon for all ToneSwitch instances with the "icon.light:ToneSwitch" declaration in the app configuration file.

### `showIcons (default: true)` [#showicons-default-true]

Whether to show icons next to the switch control. When true, displays sun and moon icons that fade based on the current theme.

```xmlui-pg {4,9} copy display name="Example: with and without icons"
<App>
  <AppHeader>
    <SpaceFiller />
    <ToneSwitch showIcons="true" />
  </AppHeader>
  <Card title="With Icons" />
  <Card>
    <HStack>
      <ToneSwitch showIcons="false" />
      <Text>Without icons</Text>
    </HStack>
  </Card>
</App>
```

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

The component uses the standard Switch styling from the XMLUI theme system. Icons are positioned with 8px gap spacing and transition opacity based on the active theme.

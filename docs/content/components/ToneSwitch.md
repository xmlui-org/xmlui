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

### `darkIcon (default: "moonThreeQuarter:ToneSwitch")` [#darkicon-default-moon-toneswitch]

The icon displayed when the theme is in dark mode (3/4 moon icon). You can change the default icon for all ToneSwitch instances with the "icon.dark:ToneSwitch" declaration in the app configuration file.

### `lightIcon (default: "sun:ToneSwitch")` [#lighticon-default-sun-toneswitch]

The icon displayed when the theme is in light mode. You can change the default icon for all ToneSwitch instances with the "icon.light:ToneSwitch" declaration in the app configuration file.

### `showIcons (default: true)` [#showicons-default-true]

Whether to use icons as the switch control itself. When true, the switch becomes a pill-shaped toggle with sun and moon icons inside. When false, uses the standard switch design.

```xmlui-pg {4,9} copy display name="Example: icon switch vs standard switch"
<App>
  <AppHeader>
    <SpaceFiller />
    <ToneSwitch showIcons="true" />
  </AppHeader>
  <Card title="Icon-based Switch" />
  <Card>
    <HStack>
      <ToneSwitch showIcons="false" />
      <Text>Standard switch</Text>
    </HStack>
  </Card>
</App>
```

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

The component uses either a custom icon-based switch design or the standard Switch styling from the XMLUI theme system. In icon mode, creates a pill-shaped toggle with sun and moon icons that transition opacity and background color based on the active theme.

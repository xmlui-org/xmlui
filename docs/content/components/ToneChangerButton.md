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

- **animation**: Adds animation functionality to components with an 'animation' prop.
- **bookmark**: Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.
- **label**: Adds a label to input components with a 'label' prop using the ItemWithLabel component.
- **pubsub**: Subscribes the component to specified topics and triggers an event when a topic is received.
- **tooltip**: Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.
- **variant**: Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.

## Properties [#properties]

### `darkToLightIcon` [#darktolighticon]

-  default: **"darkToLight:ToneChangerButton"**

The icon displayed when the theme is in dark mode and will switch to light. You can change the default icon for all ToneChangerButton instances with the "icon.darkToLight:ToneChangerButton" declaration in the app configuration file.

### `lightToDarkIcon` [#lighttodarkicon]

-  default: **"lightToDark:ToneChangerButton"**

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

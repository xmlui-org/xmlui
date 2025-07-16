# ToneSwitch

`ToneSwitch` enables users to switch between light and dark themes using a switch control with optional icons.

## Properties

### `lightIcon (default: "sun:ToneSwitch")`

The icon displayed when the theme is in light mode. You can change the default icon for all ToneSwitch instances with the "icon.light:ToneSwitch" declaration in the app configuration file.

### `darkIcon (default: "moon:ToneSwitch")`

The icon displayed when the theme is in dark mode. You can change the default icon for all ToneSwitch instances with the "icon.dark:ToneSwitch" declaration in the app configuration file.

### `showIcons (default: true)`

Whether to show icons next to the switch control. When true, displays sun and moon icons that fade based on the current theme.

## Usage Examples

### Basic usage
```xmlui
<ToneSwitch />
```

### Without icons
```xmlui
<ToneSwitch showIcons="false" />
```

### Custom icons
```xmlui
<ToneSwitch lightIcon="brightness" darkIcon="nightMode" />
```

## Behavior

- The switch automatically reflects the current theme state
- Clicking the switch toggles between light and dark themes
- Icons (when shown) have reduced opacity when not active
- Includes proper ARIA labeling for accessibility

## Styling

The component uses the standard Switch styling from the XMLUI theme system. Icons are positioned with 8px gap spacing and transition opacity based on the active theme.

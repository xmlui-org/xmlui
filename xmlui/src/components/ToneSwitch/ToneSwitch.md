# ToneSwitch

`ToneSwitch` enables users to switch between light and dark themes using a switch control with optional icons.

## Properties

### `lightIcon (default: "sun:ToneSwitch")`

The icon displayed when the theme is in light mode. You can change the default icon for all ToneSwitch instances with the "icon.light:ToneSwitch" declaration in the app configuration file.

### `darkIcon (default: "moon:ToneSwitch")`

The icon displayed when the theme is in dark mode (full moon icon). You can change the default icon for all ToneSwitch instances with the "icon.dark:ToneSwitch" declaration in the app configuration file.

### `showIcons (default: true)`

Whether to use icons as the switch control itself. When true, the switch becomes a pill-shaped toggle with sun and moon icons inside. When false, uses the standard switch design.

## Usage Examples

### Basic usage
```xmlui
<ToneSwitch />
```

### Standard switch design
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

The component uses either a custom icon-based switch design or the standard Switch styling from the XMLUI theme system. In icon mode, creates a pill-shaped toggle with sun and moon icons that transition opacity and background color based on the active theme.

# ToneSwitch

`ToneSwitch` enables users to switch between light and dark themes using an icon-based toggle switch.

## Properties

### `lightIcon (default: \"sun:ToneSwitch\")`

The icon displayed when the theme is in light mode. You can change the default icon for all ToneSwitch instances with the \"icon.light:ToneSwitch\" declaration in the app configuration file.

### `darkIcon (default: \"moonWaning:ToneSwitch\")`

The icon displayed when the theme is in dark mode. You can change the default icon for all ToneSwitch instances with the \"icon.dark:ToneSwitch\" declaration in the app configuration file.

## Usage Examples

### Basic usage
```xmlui
<ToneSwitch />
```

### Custom icons
```xmlui
<ToneSwitch lightIcon=\"brightness\" darkIcon=\"nightMode\" />
```

## Behavior

- The switch automatically reflects the current theme state
- Clicking the switch toggles between light and dark themes
- Shows sun icon in light mode (thumb on left)
- Shows moon icon in dark mode (thumb on right)
- Includes proper ARIA labeling for accessibility

## Styling

The component uses an icon-based switch design with a sliding thumb that contains the theme-appropriate icon. The switch matches the size and styling of standard XMLUI switches.

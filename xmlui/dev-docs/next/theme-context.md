# ThemeContext - XMLUI's Theme Management System

## What is ThemeContext?

ThemeContext is XMLUI's **React Context-based theming system** that provides centralized theme management throughout your application. It's like a global state manager specifically for themes and visual appearance.

## Two Main Hooks

### `useTheme()` - Current Theme Information

```typescript
import { useTheme } from "../../components-core/theming/ThemeContext";

function MyComponent() {
  const theme = useTheme();

  // Access current theme properties:
  console.log(theme.activeThemeTone);    // "light" or "dark"
  console.log(theme.activeTheme);        // Current theme object
  console.log(theme.getResourceUrl);     // Function to get theme-specific resources
}
```

### `useThemes()` - Theme Control & Management

```typescript
import { useThemes } from "../../components-core/theming/ThemeContext";

function ThemeController() {
  const { activeThemeTone, setActiveThemeTone, themes } = useThemes();

  // Read current state:
  console.log('Current tone:', activeThemeTone); // "light" or "dark"

  // Change themes:
  setActiveThemeTone("dark");   // Switch to dark mode
  setActiveThemeTone("light");  // Switch to light mode

  // Access available themes:
  console.log('Available themes:', themes);
}
```

## Key Properties & Methods

| Property | Type | Description |
|----------|------|-------------|
| `activeThemeTone` | `light` or `dark` | Current theme tone |
| `setActiveThemeTone` | `function` | Function to change theme tone |
| `activeTheme` | `object` | Current theme configuration |
| `setActiveThemeId` | `function` | Function to change theme |
| `themes` | `array` | Available theme definitions |
| `getResourceUrl` | `function` | Get theme-specific resource URLs |

## How Components Use It

### Reading Theme State

```typescript
// ToneSwitch uses it to sync with theme state
const { activeThemeTone } = useThemes();
const isDarkMode = activeThemeTone === "dark";
```

### Controlling Themes

```typescript
// ToneChangerButton uses it to toggle themes
const { activeThemeTone, setActiveThemeTone } = useThemes();
const toggleTheme = () => {
  setActiveThemeTone(activeThemeTone === "light" ? "dark" : "light");
};
```

### Theme-Aware Styling

```typescript
// AppHeader uses it for theme-specific logos
const { activeThemeTone } = useTheme();
const logoUrl = useResourceUrl(`resource:logo-${activeThemeTone}`);
```

## Provider Setup

The ThemeContext is typically provided at the app level through the `<App>` component or `<Theme>` components, making theme state available to all child components.

## Benefits

- **Centralized theme management** - Single source of truth
- **Reactive updates** - Components auto-update when theme changes
- **Type-safe** - TypeScript support for theme properties
- **Resource management** - Theme-specific assets and URLs
- **Cross-component sync** - All components stay in sync automatically

A themed component doesn't need to manage its own state. It simply:

1. **Reads** the current theme from context
2. **Displays** the appropriate visual state
3. **Updates** the global theme when clicked
4. **Automatically re-renders** when theme changes elsewhere

The ThemeContext is the "invisible glue" that makes XMLUI's theming system work seamlessly across all components.

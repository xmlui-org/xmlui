# ScrollToTop [#scrolltotop]

A floating button that scrolls the page to the top when clicked

## Properties

### `behavior` (default: "smooth")

Scroll behavior when scrolling to top

### `icon` (default: "chevronup")

Name of the icon to display in the button

### `position` (default: "end")

Horizontal position of the button at the bottom of the screen

### `threshold` (default: 300)

Scroll position threshold (in pixels) after which the button becomes visible

### `visible` (default: true)

Whether the button is visible

## Events

### `click`

Triggered when the scroll to top button is clicked

## Exposed Methods

This component does not expose any methods.

## Parts

The component has some parts that can be styled through layout properties and theme variables separately:

- **`icon`**: The icon displayed inside the scroll to top button

## Styling

### Theme Variables

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-ScrollToTop | $color-primary | $color-primary |
| [borderColor](../styles-and-themes/common-units/#color)-ScrollToTop | $color-primary-dark | $color-primary-dark |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-ScrollToTop | $space-24 | $space-24 |
| bottom-ScrollToTop | $space-16 | $space-16 |
| [color](../styles-and-themes/common-units/#color)-ScrollToTop | $color-surface-0 | $color-surface-0 |
| horizontalSpacing-ScrollToTop | $space-16 | $space-16 |
| shadow-ScrollToTop | $shadow-lg | $shadow-lg |
| [size](../styles-and-themes/common-units/#size)-ScrollToTop | 48px | 48px |
| zIndex-ScrollToTop | 1000 | 1000 |

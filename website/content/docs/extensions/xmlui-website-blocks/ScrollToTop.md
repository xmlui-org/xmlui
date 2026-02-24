# ScrollToTop [#scrolltotop]

A floating button that scrolls the page to the top when clicked

## Behaviors

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties

### `behavior`

> [!DEF]  default: **"smooth"**

Scroll behavior when scrolling to top

### `icon`

> [!DEF]  default: **"chevronup"**

Name of the icon to display in the button

### `position`

> [!DEF]  default: **"end"**

Horizontal position of the button at the bottom of the screen

### `threshold`

> [!DEF]  default: **300**

Scroll position threshold (in pixels) after which the button becomes visible

### `visible`

> [!DEF]  default: **true**

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
| bottom-ScrollToTop | *none* | *none* |
| bottom-ScrollToTop-lg | $space-16 | $space-16 |
| bottom-ScrollToTop-md | $space-14 | $space-14 |
| bottom-ScrollToTop-sm | $space-12 | $space-12 |
| bottom-ScrollToTop-xs | $space-10 | $space-10 |
| [color](../styles-and-themes/common-units/#color)-ScrollToTop | $color-surface-0 | $color-surface-0 |
| horizontalSpacing-ScrollToTop | *none* | *none* |
| horizontalSpacing-ScrollToTop-lg | $space-12 | $space-12 |
| horizontalSpacing-ScrollToTop-md | $space-10 | $space-10 |
| horizontalSpacing-ScrollToTop-sm | $space-8 | $space-8 |
| horizontalSpacing-ScrollToTop-xs | $space-6 | $space-6 |
| shadow-ScrollToTop | $shadow-lg | $shadow-lg |
| [size](../styles-and-themes/common-units/#size)-ScrollToTop | *none* | *none* |
| [size](../styles-and-themes/common-units/#size)-ScrollToTop-lg | 48px | 48px |
| [size](../styles-and-themes/common-units/#size)-ScrollToTop-md | 42px | 42px |
| [size](../styles-and-themes/common-units/#size)-ScrollToTop-sm | 42px | 42px |
| [size](../styles-and-themes/common-units/#size)-ScrollToTop-xs | 38px | 38px |
| zIndex-ScrollToTop | 1000 | 1000 |

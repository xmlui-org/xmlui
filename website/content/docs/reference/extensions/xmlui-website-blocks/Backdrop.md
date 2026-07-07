# Backdrop [#backdrop]

The `Backdrop` component is a semi-transparent overlay that appears on top of its child component to obscure or highlight the content behind it.

## Behaviors

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties

### `backgroundColor`

The background color of the backdrop.

### `opacity`

The opacity of the backdrop.

### `overlayTemplate`

This property defines the component template for an optional overlay to display over the component.

## Events

This component does not have any events.

## Exposed Methods

This component does not expose any methods.

## Styling

### Theme Variables

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-Backdrop | transparent | transparent |
| [opacity](/docs/styles-and-themes/common-units/#opacity)-Backdrop | 0.1 | 0.1 |

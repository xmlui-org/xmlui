# FadeAnimation [#fadeanimation]

The `FadeAnimation` component represents an animation that fades the content with adjustable opacity values.

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

### `animateWhenInView`

Indicates whether the animation should start when the component is in view

### `delay`

> [!DEF]  default: **0**

The delay before the animation starts in milliseconds

### `duration`

The duration of the animation in milliseconds

### `from`

> [!DEF]  default: **0**

Sets the initial opacity of the content.If the `to` property is not set, the initial opacity set here will be used as the final opacity.

### `loop`

> [!DEF]  default: **false**

Indicates whether the animation should loop

### `reverse`

> [!DEF]  default: **false**

Indicates whether the animation should run in reverse

### `to`

> [!DEF]  default: **1**

Sets the final opacity of the content.If the `from` property is not set, the initial opacity set here will be used as the final opacity.

## Events

### `started`

Event fired when the animation starts

### `stopped`

Event fired when the animation stops

## Exposed Methods

### `start`

Starts the animation

### `stop`

Stops the animation

## Styling

This component does not have any styles.

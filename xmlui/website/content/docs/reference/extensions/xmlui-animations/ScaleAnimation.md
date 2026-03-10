# ScaleAnimation [#scaleanimation]

The `ScaleAnimation` component represents an animation that scales the content.

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

Indicates whether the animation should start when the component is in view.

### `delay`

> [!DEF]  default: **0**

The delay before the animation starts in milliseconds

### `duration`

The duration of the animation in milliseconds.

### `from`

> [!DEF]  default: **0**

The initial scale of the content.

### `loop`

> [!DEF]  default: **false**

Indicates whether the animation should loop

### `reverse`

> [!DEF]  default: **false**

Indicates whether the animation should run in reverse

### `to`

> [!DEF]  default: **1**

The final scale of the content.

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

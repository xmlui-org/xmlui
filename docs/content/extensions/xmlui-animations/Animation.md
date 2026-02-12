# Animation [#animation]

No description provided.

## Behaviors

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | N/A |

## Properties

### `animateWhenInView`

Indicates whether the animation should start when the component is in view

### `animation`

The animation object to be applied to the component

### `delay`

> [!DEF]  default: **0**

The delay before the animation starts in milliseconds

### `duration`

The duration of the animation in milliseconds

### `loop`

> [!DEF]  default: **false**

Indicates whether the animation should loop

### `once`

> [!DEF]  default: **false**

Indicates whether the animation should only run once

### `reverse`

> [!DEF]  default: **false**

Indicates whether the animation should run in reverse

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

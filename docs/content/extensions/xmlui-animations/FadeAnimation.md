# FadeAnimation [#fadeanimation]

>[!WARNING]
> This component is in an **experimental** state; you can use it in your app. However, we may modify it, and it may even have breaking changes in the future.The `FadeAnimation` component represents an animation that fades the content with adjustable opacity values.

## Properties

### `animateWhenInView`

Indicates whether the animation should start when the component is in view

### `delay (default: 0)`

The delay before the animation starts in milliseconds

### `duration`

The duration of the animation in milliseconds

### `from (default: 0)`

Sets the initial opacity of the content.If the `to` property is not set, the initial opacity set here will be used as the final opacity.

### `loop (default: false)`

Indicates whether the animation should loop

### `reverse (default: false)`

Indicates whether the animation should run in reverse

### `to (default: 1)`

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

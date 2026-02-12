# FadeAnimation [#fadeanimation]

The `FadeAnimation` component represents an animation that fades the content with adjustable opacity values.

## Behaviors

This component supports the following behaviors:

- **animation**: Adds animation functionality to components with an 'animation' prop.
- **bookmark**: Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.
- **label**: Adds a label to input components with a 'label' prop using the ItemWithLabel component.
- **pubsub**: Subscribes the component to specified topics and triggers an event when a topic is received.
- **tooltip**: Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.
- **variant**: Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.

## Properties

### `animateWhenInView`

Indicates whether the animation should start when the component is in view

### `delay`

-  default: **0**

The delay before the animation starts in milliseconds

### `duration`

The duration of the animation in milliseconds

### `from`

-  default: **0**

Sets the initial opacity of the content.If the `to` property is not set, the initial opacity set here will be used as the final opacity.

### `loop`

-  default: **false**

Indicates whether the animation should loop

### `reverse`

-  default: **false**

Indicates whether the animation should run in reverse

### `to`

-  default: **1**

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

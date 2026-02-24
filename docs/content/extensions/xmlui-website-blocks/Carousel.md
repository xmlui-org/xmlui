# Carousel [#carousel]

This component displays a slideshow by cycling through elements (images, text, or custom slides) like a carousel.

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

### `autoplay`

> [!DEF]  default: **false**

Start scrolling the carousel automatically (`true`) or not (`false`).

### `autoplayInterval`

> [!DEF]  default: **5000**

Specifies the interval between autoplay transitions.

### `controls`

> [!DEF]  default: **true**

Display the previous/next controls (`true`) or not (`false`).

### `indicators`

> [!DEF]  default: **true**

Display the individual slides as buttons (`true`) or not (`false`).

### `loop`

> [!DEF]  default: **false**

Sets whether the carousel should loop back to the start/end when it reaches the last/first slide.

### `nextIcon`

The icon to display for the next control.

### `orientation`

> [!DEF]  default: **"horizontal"**

This property indicates the orientation of the carousel. The `horizontal` value indicates that the carousel moves horizontally, and the `vertical` value indicates that the carousel moves vertically.

Available values: `horizontal` **(default)**, `vertical`

### `prevIcon`

The icon to display for the previous control.

### `startIndex`

> [!DEF]  default: **0**

The index of the first slide to display.

### `stopAutoplayOnInteraction`

> [!DEF]  default: **true**

This property indicates whether autoplay stops on user interaction.

### `transitionDuration`

> [!DEF]  default: **25**

The duration of the transition between slides.

## Events

### `displayDidChange`

This event is fired when the displayed content of the CarouselNew changes.

## Exposed Methods

### `canScrollNext`

This method returns `true` if the carousel can scroll to the next slide.

**Signature**: `canScrollNext(): boolean`

### `canScrollPrev`

This method returns `true` if the carousel can scroll to the previous slide.

**Signature**: `canScrollPrev(): boolean`

### `scrollNext`

This method scrolls the carousel to the next slide.

**Signature**: `scrollNext(): void`

### `scrollPrev`

This method scrolls the carousel to the previous slide.

**Signature**: `scrollPrev(): void`

### `scrollTo`

This method scrolls the carousel to the specified slide index.

**Signature**: `scrollTo(index: number): void`

- `index`: The index of the slide to scroll to.

## Styling

### Theme Variables

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-control-active-Carousel | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-control-active-CarouselNew | $color-primary | $color-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-control-Carousel | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-control-CarouselNew | $color-primary | $color-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-control-disabled-Carousel | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-control-disabled-CarouselNew | $color-surface-200 | $color-surface-200 |
| [backgroundColor](../styles-and-themes/common-units/#color)-control-hover-Carousel | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-control-hover-CarouselNew | $color-primary | $color-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-indicator-active-Carousel | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-indicator-active-CarouselNew | $color-primary | $color-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-indicator-Carousel | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-indicator-CarouselNew | $color-surface-200 | $color-surface-200 |
| [backgroundColor](../styles-and-themes/common-units/#color)-indicator-hover-Carousel | *none* | *none* |
| [backgroundColor](../styles-and-themes/common-units/#color)-indicator-hover-CarouselNew | $color-surface-200 | $color-surface-200 |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-control-Carousel | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-control-CarouselNew | 50% | 50% |
| [height](../styles-and-themes/common-units/#size)-Carousel | *none* | *none* |
| [height](../styles-and-themes/common-units/#size)-CarouselNew | 100% | 100% |
| [height](../styles-and-themes/common-units/#size)-control-Carousel | *none* | *none* |
| [height](../styles-and-themes/common-units/#size)-control-CarouselNew | 36px | 36px |
| [height](../styles-and-themes/common-units/#size)-indicator-Carousel | *none* | *none* |
| [height](../styles-and-themes/common-units/#size)-indicator-CarouselNew | 6px | 6px |
| [textColor](../styles-and-themes/common-units/#color)-control-active-Carousel | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-control-active-CarouselNew | $color-primary | $color-primary |
| [textColor](../styles-and-themes/common-units/#color)-control-Carousel | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-control-CarouselNew | $textColor | $textColor |
| [textColor](../styles-and-themes/common-units/#color)-control-disabled-Carousel | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-control-disabled-CarouselNew | $textColor-disabled | $textColor-disabled |
| [textColor](../styles-and-themes/common-units/#color)-control-hover-Carousel | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-control-hover-CarouselNew | $textColor | $textColor |
| [textColor](../styles-and-themes/common-units/#color)-indicator-active-Carousel | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-indicator-active-CarouselNew | $color-primary | $color-primary |
| [textColor](../styles-and-themes/common-units/#color)-indicator-Carousel | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-indicator-CarouselNew | $color-primary | $color-primary |
| [textColor](../styles-and-themes/common-units/#color)-indicator-hover-Carousel | *none* | *none* |
| [textColor](../styles-and-themes/common-units/#color)-indicator-hover-CarouselNew | $color-primary | $color-primary |
| [width](../styles-and-themes/common-units/#size)-Carousel | *none* | *none* |
| [width](../styles-and-themes/common-units/#size)-CarouselNew | 100% | 100% |
| [width](../styles-and-themes/common-units/#size)-control-Carousel | *none* | *none* |
| [width](../styles-and-themes/common-units/#size)-control-CarouselNew | 36px | 36px |
| [width](../styles-and-themes/common-units/#size)-indicator-Carousel | *none* | *none* |
| [width](../styles-and-themes/common-units/#size)-indicator-CarouselNew | 25px | 25px |

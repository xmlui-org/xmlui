# Carousel [#carousel]

This component displays a slideshow by cycling through elements (images, text, or custom slides) like a carousel.

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

This event fires when the active slide of the Carousel changes.

**Signature**: `displayDidChange(activeSlide: number): void`

- `activeSlide`: The index of the currently active slide.

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
| [backgroundColor-control-active-Carousel](/docs/styles-and-themes/common-units/#color) | $color-primary | $color-primary |
| [backgroundColor-control-Carousel](/docs/styles-and-themes/common-units/#color) | $color-primary | $color-primary |
| [backgroundColor-control-disabled-Carousel](/docs/styles-and-themes/common-units/#color) | $color-surface-200 | $color-surface-200 |
| [backgroundColor-control-hover-Carousel](/docs/styles-and-themes/common-units/#color) | $color-primary | $color-primary |
| [backgroundColor-indicator-active-Carousel](/docs/styles-and-themes/common-units/#color) | $color-primary | $color-primary |
| [backgroundColor-indicator-Carousel](/docs/styles-and-themes/common-units/#color) | $color-surface-200 | $color-surface-200 |
| [backgroundColor-indicator-hover-Carousel](/docs/styles-and-themes/common-units/#color) | $color-surface-200 | $color-surface-200 |
| [borderRadius-control-Carousel](/docs/styles-and-themes/common-units/#border-rounding) | 50% | 50% |
| [height-Carousel](/docs/styles-and-themes/common-units/#size-values) | 100% | 100% |
| [height-control-Carousel](/docs/styles-and-themes/common-units/#size-values) | 36px | 36px |
| [height-indicator-Carousel](/docs/styles-and-themes/common-units/#size-values) | 6px | 6px |
| [textColor-control-active-Carousel](/docs/styles-and-themes/common-units/#color) | $color-primary | $color-primary |
| [textColor-control-Carousel](/docs/styles-and-themes/common-units/#color) | $textColor | $textColor |
| [textColor-control-disabled-Carousel](/docs/styles-and-themes/common-units/#color) | $textColor-disabled | $textColor-disabled |
| [textColor-control-hover-Carousel](/docs/styles-and-themes/common-units/#color) | $textColor | $textColor |
| [textColor-indicator-active-Carousel](/docs/styles-and-themes/common-units/#color) | $color-primary | $color-primary |
| [textColor-indicator-Carousel](/docs/styles-and-themes/common-units/#color) | $color-primary | $color-primary |
| [textColor-indicator-hover-Carousel](/docs/styles-and-themes/common-units/#color) | $color-primary | $color-primary |
| [width-Carousel](/docs/styles-and-themes/common-units/#size-values) | 100% | 100% |
| [width-control-Carousel](/docs/styles-and-themes/common-units/#size-values) | 36px | 36px |
| [width-indicator-Carousel](/docs/styles-and-themes/common-units/#size-values) | 25px | 25px |

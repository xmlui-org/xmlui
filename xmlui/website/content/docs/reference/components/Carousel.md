# Carousel [#carousel]

This component displays a slideshow by cycling through elements (images, text, or custom slides) like a carousel.

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Publish/Subscribe | `subscribeToTopic` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `autoplay` [#autoplay]

> [!DEF]  default: **false**

Start scrolling the carousel automatically (`true`) or not (`false`).

### `autoplayInterval` [#autoplayinterval]

> [!DEF]  default: **5000**

Specifies the interval between autoplay transitions.

### `controls` [#controls]

> [!DEF]  default: **true**

Display the previous/next controls (`true`) or not (`false`).

### `indicators` [#indicators]

> [!DEF]  default: **true**

Display the individual slides as buttons (`true`) or not (`false`).

### `loop` [#loop]

> [!DEF]  default: **false**

Sets whether the carousel should loop back to the start/end when it reaches the last/first slide.

### `nextIcon` [#nexticon]

The icon to display for the next control.

### `orientation` [#orientation]

> [!DEF]  default: **"horizontal"**

This property indicates the orientation of the carousel. The `horizontal` value indicates that the carousel moves horizontally, and the `vertical` value indicates that the carousel moves vertically.

Available values:

| Value | Description |
| --- | --- |
| `horizontal` | The component will fill the available space horizontally **(default)** |
| `vertical` | The component will fill the available space vertically |

### `prevIcon` [#previcon]

The icon to display for the previous control.

### `startIndex` [#startindex]

> [!DEF]  default: **0**

The index of the first slide to display.

### `stopAutoplayOnInteraction` [#stopautoplayoninteraction]

> [!DEF]  default: **true**

This property indicates whether autoplay stops on user interaction.

### `transitionDuration` [#transitionduration]

> [!DEF]  default: **25**

The duration of the transition between slides.

## Events [#events]

### `displayDidChange` [#displaydidchange]

This event fires when the active slide of the Carousel changes.

**Signature**: `displayDidChange(activeSlide: number): void`

- `activeSlide`: The index of the currently active slide.

## Exposed Methods [#exposed-methods]

### `canScrollNext` [#canscrollnext]

This method returns `true` if the carousel can scroll to the next slide.

**Signature**: `canScrollNext(): boolean`

### `canScrollPrev` [#canscrollprev]

This method returns `true` if the carousel can scroll to the previous slide.

**Signature**: `canScrollPrev(): boolean`

### `scrollNext` [#scrollnext]

This method scrolls the carousel to the next slide.

**Signature**: `scrollNext(): void`

### `scrollPrev` [#scrollprev]

This method scrolls the carousel to the previous slide.

**Signature**: `scrollPrev(): void`

### `scrollTo` [#scrollto]

This method scrolls the carousel to the specified slide index.

**Signature**: `scrollTo(index: number): void`

- `index`: The index of the slide to scroll to.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-control-active-Carousel | $color-primary | $color-primary |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-control-Carousel | $color-primary | $color-primary |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-control-disabled-Carousel | $color-surface-200 | $color-surface-200 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-control-hover-Carousel | $color-primary | $color-primary |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-indicator-active-Carousel | $color-primary | $color-primary |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-indicator-Carousel | $color-surface-200 | $color-surface-200 |
| [backgroundColor](/docs/styles-and-themes/common-units/#color)-indicator-hover-Carousel | $color-surface-200 | $color-surface-200 |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-control-Carousel | 50% | 50% |
| [height](/docs/styles-and-themes/common-units/#size-values)-Carousel | 100% | 100% |
| [height](/docs/styles-and-themes/common-units/#size-values)-control-Carousel | 36px | 36px |
| [height](/docs/styles-and-themes/common-units/#size-values)-indicator-Carousel | 6px | 6px |
| [textColor](/docs/styles-and-themes/common-units/#color)-control-active-Carousel | $color-primary | $color-primary |
| [textColor](/docs/styles-and-themes/common-units/#color)-control-Carousel | $textColor | $textColor |
| [textColor](/docs/styles-and-themes/common-units/#color)-control-disabled-Carousel | $textColor-disabled | $textColor-disabled |
| [textColor](/docs/styles-and-themes/common-units/#color)-control-hover-Carousel | $textColor | $textColor |
| [textColor](/docs/styles-and-themes/common-units/#color)-indicator-active-Carousel | $color-primary | $color-primary |
| [textColor](/docs/styles-and-themes/common-units/#color)-indicator-Carousel | $color-primary | $color-primary |
| [textColor](/docs/styles-and-themes/common-units/#color)-indicator-hover-Carousel | $color-primary | $color-primary |
| [width](/docs/styles-and-themes/common-units/#size-values)-Carousel | 100% | 100% |
| [width](/docs/styles-and-themes/common-units/#size-values)-control-Carousel | 36px | 36px |
| [width](/docs/styles-and-themes/common-units/#size-values)-indicator-Carousel | 25px | 25px |

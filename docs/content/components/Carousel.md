# Carousel [#carousel]

This component displays a slideshow by cycling through elements (images, text, or custom slides) like a carousel.

`Carousel` displays a slideshow by cycling through elements (images, text, or custom slides) in a carousel format. It provides an interactive way to present multiple content items in a single interface area with smooth transitions and navigation controls.

**Key features:**
- **Multiple orientations**: Supports both horizontal and vertical scrolling
- **Navigation controls**: Built-in previous/next buttons with customizable icons
- **Indicators**: Visual dots showing current position and allowing direct navigation
- **Autoplay functionality**: Automatic slide progression with configurable intervals
- **Loop support**: Continuous cycling through slides
- **Keyboard navigation**: Arrow key support for accessibility
- **Exposed methods**: Programmatic control via `scrollTo()`, `scrollNext()`, `scrollPrev()`, `canScrollNext()`, `canScrollPrev()`

## Properties [#properties]

### `autoplay` (default: false) [#autoplay-default-false]

This property indicates whether the carousel automatically scrolls.

This property indicates whether the carousel automatically scrolls through slides.

```xmlui-pg copy display name="Example: autoplay"
<App>
  <Carousel autoplay autoplayInterval="2000" height="120px" loop>
    <CarouselItem>
      <Card title="Slide 1" />
    </CarouselItem>
    <CarouselItem>
      <Card title="Slide 2" />
    </CarouselItem>
    <CarouselItem>
      <Card title="Slide 3" />
    </CarouselItem>
  </Carousel>
</App>
```

### `autoplayInterval` (default: 5000) [#autoplayinterval-default-5000]

This property specifies the interval between autoplay transitions.

This property specifies the interval between autoplay transitions in milliseconds.

### `controls` (default: true) [#controls-default-true]

This property indicates whether the carousel displays the controls.

This property indicates whether the carousel displays navigation controls (previous/next buttons).

```xmlui-pg copy display name="Example: controls"
<App>
  <Carousel controls="true" height="120px">
    <CarouselItem>Slide 1 with controls</CarouselItem>
    <CarouselItem>Slide 2 with controls</CarouselItem>
  </Carousel>
</App>
```

### `indicators` (default: true) [#indicators-default-true]

This property indicates whether the carousel displays the indicators.

This property indicates whether the carousel displays position indicators.

```xmlui-pg copy display name="Example: indicators"
<App>
  <Carousel indicators="true" height="120px">
    <CarouselItem>Slide 1 with indicators</CarouselItem>
    <CarouselItem>Slide 2 with indicators</CarouselItem>
    <CarouselItem>Slide 3 with indicators</CarouselItem>
  </Carousel>
</App>
```

### `keyboard` [#keyboard]

This property indicates whether the carousel responds to keyboard events.

This property indicates whether the carousel responds to keyboard events (arrow keys for navigation).

### `loop` (default: false) [#loop-default-false]

This property indicates whether the carousel loops.

This property indicates whether the carousel loops continuously from the last slide back to the first.

```xmlui-pg copy display name="Example: loop"
<App>
  <Carousel loop="true" height="120px">
    <CarouselItem>
      <Card title="First Slide" />
    </CarouselItem>
    <CarouselItem>
      <Card title="Second Slide" />
    </CarouselItem>
    <CarouselItem>
      <Card title="Third Slide" />
    </CarouselItem>
  </Carousel>
</App>
```

### `nextIcon` [#nexticon]

This property specifies the icon to display for the next control.

This property specifies the icon to display for the next control button.

```xmlui-pg copy display name="Example: custom icons"
<App>
  <Carousel nextIcon="chevronright" prevIcon="chevronleft" height="120px">
    <CarouselItem>Slide 1</CarouselItem>
    <CarouselItem>Slide 2</CarouselItem>
    <CarouselItem>Slide 3</CarouselItem>
  </Carousel>
</App>
```

### `orientation` (default: "horizontal") [#orientation-default-horizontal]

This property indicates the orientation of the carousel. The `horizontal` value indicates that the carousel moves horizontally, and the `vertical` value indicates that the carousel moves vertically.

Available values:

| Value | Description |
| --- | --- |
| `horizontal` | The component will fill the available space horizontally **(default)** |
| `vertical` | The component will fill the available space vertically |

This property indicates the orientation of the carousel. The `horizontal` value indicates that the carousel moves horizontally, and the `vertical` value indicates that the carousel moves vertically.

Available values:

| Value | Description |
| --- | --- |
| `horizontal` | The carousel moves horizontally **(default)** |
| `vertical` | The carousel moves vertically |

```xmlui-pg copy display name="Example: orientation"
<App>
  <Carousel orientation="horizontal" height="120px">
    <CarouselItem>Horizontal Slide 1</CarouselItem>
    <CarouselItem>Horizontal Slide 2</CarouselItem>
  </Carousel>
</App>
```

### `prevIcon` [#previcon]

This property specifies the icon to display for the previous control.

This property specifies the icon to display for the previous control button.

### `startIndex` (default: 0) [#startindex-default-0]

This property indicates the index of the first slide to display.

This property indicates the index of the first slide to display when the carousel initializes.

```xmlui-pg copy display name="Example: startIndex"
<App>
  <Carousel startIndex="2" height="120px">
    <CarouselItem>Slide 1</CarouselItem>
    <CarouselItem>Slide 2</CarouselItem>
    <CarouselItem>Slide 3 (starts here)</CarouselItem>
    <CarouselItem>Slide 4</CarouselItem>
  </Carousel>
</App>
```

### `stopAutoplayOnInteraction` (default: true) [#stopautoplayoninteraction-default-true]

This property indicates whether autoplay stops on interaction.

This property indicates whether autoplay stops when the user interacts with the carousel (clicking controls, indicators, or using keyboard navigation).

### `transitionDuration` (default: 25) [#transitionduration-default-25]

This property indicates the duration of the transition between slides.

This property indicates the duration of the transition between slides in milliseconds.

## Events [#events]

### `displayDidChange` [#displaydidchange]

This event is triggered when value of Carousel has changed.

This event is triggered when the active slide changes.

The event handler receives the active slide index as a parameter.

```xmlui-pg copy display name="Example: displayDidChange"
<App var.currentSlide="0">
  <Carousel onDisplayDidChange="(index) => currentSlide = index" height="120px">
    <CarouselItem>Slide 1</CarouselItem>
    <CarouselItem>Slide 2</CarouselItem>
    <CarouselItem>Slide 3</CarouselItem>
  </Carousel>
  <Text>Current slide: {currentSlide + 1}</Text>
</App>
```

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
| [backgroundColor](../styles-and-themes/common-units/#color)-control-Carousel | $color-primary | $color-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-control-active-Carousel | $color-primary | $color-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-control-disabled-Carousel | $color-surface-200 | $color-surface-200 |
| [backgroundColor](../styles-and-themes/common-units/#color)-control-hover-Carousel | $color-primary | $color-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-indicator-Carousel | $color-surface-200 | $color-surface-200 |
| [backgroundColor](../styles-and-themes/common-units/#color)-indicator-active-Carousel | $color-primary | $color-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-indicator-hover-Carousel | $color-surface-200 | $color-surface-200 |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-control-Carousel | 50% | 50% |
| [height](../styles-and-themes/common-units/#size)-Carousel | 100% | 100% |
| [height](../styles-and-themes/common-units/#size)-control-Carousel | 36px | 36px |
| [height](../styles-and-themes/common-units/#size)-indicator-Carousel | 6px | 6px |
| [textColor](../styles-and-themes/common-units/#color)-control-Carousel | $textColor | $textColor |
| [textColor](../styles-and-themes/common-units/#color)-control-active-Carousel | $color-primary | $color-primary |
| [textColor](../styles-and-themes/common-units/#color)-control-disabled-Carousel | $textColor-disabled | $textColor-disabled |
| [textColor](../styles-and-themes/common-units/#color)-control-hover-Carousel | $textColor | $textColor |
| [textColor](../styles-and-themes/common-units/#color)-indicator-Carousel | $color-primary | $color-primary |
| [textColor](../styles-and-themes/common-units/#color)-indicator-active-Carousel | $color-primary | $color-primary |
| [textColor](../styles-and-themes/common-units/#color)-indicator-hover-Carousel | $color-primary | $color-primary |
| [width](../styles-and-themes/common-units/#size)-Carousel | 100% | 100% |
| [width](../styles-and-themes/common-units/#size)-control-Carousel | 36px | 36px |
| [width](../styles-and-themes/common-units/#size)-indicator-Carousel | 25px | 25px |

### Navigation Controls [#navigation-controls]

The carousel provides built-in navigation controls that can be customized through theme variables:

```xmlui-pg copy name="Example: Custom control styling"
<App>
  <Theme 
    backgroundColor-control-Carousel="red"
    textColor-control-Carousel="white"
    borderRadius-control-Carousel="4px">
    <Carousel height="120px">
      <CarouselItem>Slide 1</CarouselItem>
      <CarouselItem>Slide 2</CarouselItem>
      <CarouselItem>Slide 3</CarouselItem>
    </Carousel>
  </Theme>
</App>
```

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor](../styles-and-themes/common-units/#color)-control-active-Carousel | $color-primary | $color-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-control-Carousel | $color-primary | $color-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-control-disabled-Carousel | $color-surface-200 | $color-surface-200 |
| [backgroundColor](../styles-and-themes/common-units/#color)-control-hover-Carousel | $color-primary | $color-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-indicator-active-Carousel | $color-primary | $color-primary |
| [backgroundColor](../styles-and-themes/common-units/#color)-indicator-Carousel | $color-surface-200 | $color-surface-200 |
| [backgroundColor](../styles-and-themes/common-units/#color)-indicator-hover-Carousel | $color-surface-200 | $color-surface-200 |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-control-Carousel | 50% | 50% |
| [height](../styles-and-themes/common-units/#size)-Carousel | 100% | 100% |
| [height](../styles-and-themes/common-units/#size)-control-Carousel | 36px | 36px |
| [height](../styles-and-themes/common-units/#size)-indicator-Carousel | 6px | 6px |
| [textColor](../styles-and-themes/common-units/#color)-control-active-Carousel | $color-primary | $color-primary |
| [textColor](../styles-and-themes/common-units/#color)-control-Carousel | $textColor | $textColor |
| [textColor](../styles-and-themes/common-units/#color)-control-disabled-Carousel | $textColor-disabled | $textColor-disabled |
| [textColor](../styles-and-themes/common-units/#color)-control-hover-Carousel | $textColor | $textColor |
| [textColor](../styles-and-themes/common-units/#color)-indicator-active-Carousel | $color-primary | $color-primary |
| [textColor](../styles-and-themes/common-units/#color)-indicator-Carousel | $color-primary | $color-primary |
| [textColor](../styles-and-themes/common-units/#color)-indicator-hover-Carousel | $color-primary | $color-primary |
| [width](../styles-and-themes/common-units/#size)-Carousel | 100% | 100% |
| [width](../styles-and-themes/common-units/#size)-control-Carousel | 36px | 36px |
| [width](../styles-and-themes/common-units/#size)-indicator-Carousel | 25px | 25px |

# Image [#image]

`Image` displays pictures from URLs or local sources with built-in responsive sizing, aspect ratio control, and accessibility features. It handles different image formats and provides options for lazy loading and click interactions.

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

### `alt` [#alt]

This optional property specifies an alternate text for the image.

### `aspectRatio` [#aspectratio]

This property sets a preferred aspect ratio for the image, which will be used in calculating auto sizes and other layout functions. If this value is not used, the original aspect ratio is kept. The value can be a number of a string (such as "16/9").

### `data` [#data]

This property contains the binary data that represents the image.

### `fit` [#fit]

> [!DEF]  default: **"contain"**

This property sets how the image content should be resized to fit its container.

### `grayscale` [#grayscale]

> [!DEF]  default: **false**

When set to true, the image will be displayed in grayscale.

### `inline` [#inline]

> [!DEF]  default: **false**

When set to true, the image will be displayed as an inline element instead of a block element.

### `lazyLoad` [#lazyload]

> [!DEF]  default: **false**

Lazy loading instructs the browser to load the image only when it is imminently needed (e.g. user scrolls to it).

### `src` [#src]

This property is used to indicate the source (path) of the image to display. When not defined, no image is displayed.

## Events [#events]

### `click` [#click]

This event is triggered when the Image is clicked.

**Signature**: `click(event: MouseEvent): void`

- `event`: The mouse event object.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [borderColor](/docs/styles-and-themes/common-units/#color)-Image | *none* | *none* |
| [borderRadius](/docs/styles-and-themes/common-units/#border-rounding)-Image | *none* | *none* |

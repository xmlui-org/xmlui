# Image [#image]

`Image` displays pictures from URLs or local sources with built-in responsive sizing, aspect ratio control, and accessibility features. It handles different image formats and provides options for lazy loading and click interactions.

## Behaviors [#behaviors]

This component supports the following behaviors:

- **animation**: Adds animation functionality to components with an 'animation' prop.
- **bookmark**: Adds bookmark functionality to any visual component with a 'bookmark' prop by adding bookmark-related attributes and APIs directly to the component.
- **label**: Adds a label to input components with a 'label' prop using the ItemWithLabel component.
- **pubsub**: Subscribes the component to specified topics and triggers an event when a topic is received.
- **tooltip**: Adds tooltip functionality to components with a 'tooltip' or 'tooltipMarkdown' prop.
- **variant**: Applies custom variant styling to components with a 'variant' prop. For Button components, this only applies if the variant is not one of the predefined values ('solid', 'outlined', 'ghost'). For other components, it applies to any component with a 'variant' prop.

## Properties [#properties]

### `alt` [#alt]

This optional property specifies an alternate text for the image.

This is useful in two cases:
1. Accessibility: screen readers read the prop value to users so they know what the image is about.
2. The text is also displayed when the image can't be loaded for some reason (network errors, content blocking, etc.).

```xmlui-pg copy display name="Example: alt"
<App>
  <Image 
    src="cantFindIt.jpg" 
    alt="This image depicts a wonderful scene not for human eyes" />
</App>
```

### `aspectRatio` [#aspectratio]

This property sets a preferred aspect ratio for the image, which will be used in calculating auto sizes and other layout functions. If this value is not used, the original aspect ratio is kept. The value can be a number of a string (such as "16/9").

```xmlui-pg copy display name="Example: aspectRatio"
<App>
  <Image 
    src="/resources/images/components/image/breakfast.jpg" 
    aspectRatio="200 / 150" />
</App>
```

### `data` [#data]

This property contains the binary data that represents the image.

### `fit` [#fit]

-  default: **"contain"**

This property sets how the image content should be resized to fit its container.

| Name      | Value |
| --------- | ----- |
| `contain` | The replaced content is scaled to maintain its aspect ratio while fitting within the image's container. The entire image is made to fill the container. |
| `cover`   | The image is sized to maintain its aspect ratio while filling the element's entire content box. If the image's aspect ratio does not match the aspect ratio of its container, then the image will be clipped to fit. |

```xmlui-pg copy display name="Example: fit" {5,9}
<App>
  <HStack padding="1rem" height="280px" gap="1rem">
    <Image 
      src="/resources/images/components/image/breakfast.jpg" 
      fit="contain" 
      width="240px" />
    <Image 
      src="/resources/images/components/image/breakfast.jpg" 
      fit="cover" 
      width="240px" />
  </HStack>
</App>
```

### `grayscale` [#grayscale]

-  default: **false**

When set to true, the image will be displayed in grayscale.

### `inline` [#inline]

-  default: **false**

When set to true, the image will be displayed as an inline element instead of a block element.

### `lazyLoad` [#lazyload]

-  default: **false**

Lazy loading instructs the browser to load the image only when it is imminently needed (e.g. user scrolls to it).

Lazy loading instructs the browser to load the image only when it is imminently needed (e.g. user scrolls to it).
The default value is eager (\`false\`).

### `src` [#src]

This property is used to indicate the source (path) of the image to display. When not defined, no image is displayed.

## Events [#events]

### `click` [#click]

This event is triggered when the Image is clicked.

**Signature**: `click(event: MouseEvent): void`

- `event`: The mouse event object.

This event is triggered when the image is clicked.

```xmlui-pg copy {6} display name="Example: click"
<App>
  <Stack height="280px" width="400px">
    <Image
      src="/resources/images/components/image/breakfast.jpg"
      fit="cover"
      onClick="toast('Image clicked')"
    />
  </Stack>
</App>
```

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [borderColor](../styles-and-themes/common-units/#color)-Image | *none* | *none* |
| [borderRadius](../styles-and-themes/common-units/#border-rounding)-Image | *none* | *none* |

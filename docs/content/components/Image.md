# Image [#image]

The `Image` component represents or depicts an object, scene, idea, or other concept with a picture.

## Properties

### `alt`

This property specifies an alternate text for the image.

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

### `animation`

The animation object to be applied to the component

### `aspectRatio`

This property sets a preferred aspect ratio for the image, which will be used in the calculation of auto sizes and some other layout functions.

```xmlui-pg copy display name="Example: aspectRatio"
<App>
  <Image 
    src="/resources/images/components/image/breakfast.jpg" 
    aspectRatio="200 / 150" />
</App>
```

### `fit (default: "contain")`

This property sets how the image content should be resized to fit its container.

| Name      | Value |
| --------- | ----- |
| `contain` | The replaced content is scaled to maintain its aspect ratio while fitting within the image's container. The entire image is made to fill the container. |
| `cover`   | The image is sized to maintain its aspect ratio while filling the element's entire content box. If the image's aspect ratio does not match the aspect ratio of its container, then the image will be clipped to fit. |

```xmlui-pg copy display name="Example: fit"
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

### `lazyLoad`

Lazy loading instructs the browser to load the image only when it is imminently needed (e.g. user scrolls to it). The default value is eager (`false`).

Lazy loading instructs the browser to load the image only when it is imminently needed (e.g. user scrolls to it).
The default value is eager (\`false\`).

### `src`

This property is used to indicate the source (path) of the image to display.

## Events

### `click`

This event is triggered when the Image is clicked.

This event is triggered when the image is clicked.

```xmlui-pg copy {5} display name="Example: click"
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

## Exposed Methods

This component does not expose any methods.

## Styling

This component does not have any styles.

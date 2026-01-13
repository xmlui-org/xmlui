# FlowLayout [#flowlayout]

`FlowLayout` positions content in rows with automatic wrapping. When items exceed the available horizontal space, they automatically wrap to a new line.

For details on how to work with \`FlowLayout\` (like sizing children), see [this guide](/layout#flowlayout).

## Using `SpaceFiller` with `FlowLayout` [#using-spacefiller-with-flowlayout]

The `SpaceFiller` component can be used as a line break.
See the [reference docs](/components/SpaceFiller) for details.

## Properties [#properties]

### `columnGap` (default: "$gap-normal") [#columngap-default-gap-normal]

The `columnGap` property specifies the space between items in a single row; it overrides the `gap` value.

The `columnGap` property specifies the space between items in a single row; it overrides the `gap` value.

```xmlui-pg copy display name="Example: columnGap"
---app copy display
<App>
  <FlowLayout columnGap="$space-8">
  <Stack width="25%" height="32px" backgroundColor="red" />
  <Stack width="25%" height="32px" backgroundColor="blue" />
  <Stack width="25%" height="32px" backgroundColor="green" />
  <Stack width="25%" height="32px" backgroundColor="yellow" />
  <Stack width="25%" height="32px" backgroundColor="maroon" />
  <Stack width="25%" height="32px" backgroundColor="teal" />
  <Stack width="25%" height="32px" backgroundColor="seagreen" />
  <Stack width="25%" height="32px" backgroundColor="olive" />
  </FlowLayout>
</App>
---desc
You can observe no gap between the rows of the `FlowLayout`, as `columnGap` keeps the space between rows intact:
```

### `gap` (default: "$gap-normal") [#gap-default-gap-normal]

This property defines the gap between items in the same row and between rows. The FlowLayout component creates a new row when an item is about to overflow the current row.

The `gap` property defines the gap between items in the same row and between rows. The `FlowLayout` component creates a new row when an item is about to overflow the current row.

```xmlui-pg copy display name="Example: gap"
---app copy display
<App>
  <FlowLayout gap="$space-12">
    <Stack width="25%" height="32px" backgroundColor="red" />
    <Stack width="25%" height="32px" backgroundColor="blue" />
    <Stack width="25%" height="32px" backgroundColor="green" />
    <Stack width="25%" height="32px" backgroundColor="yellow" />
    <Stack width="25%" height="32px" backgroundColor="maroon" />
    <Stack width="25%" height="32px" backgroundColor="teal" />
    <Stack width="25%" height="32px" backgroundColor="seagreen" />
    <Stack width="25%" height="32px" backgroundColor="olive" />
  </FlowLayout>
</App>
---desc
In this markup, only four items fit in a single row. 
The `gap` property sets the same gaps within and between rows.
```

This markup demonstrates different `gap` values:

```xmlui-pg copy display name="Example: different size units"
---app copy display
<App>
  <FlowLayout>
    <Stack width="25%" height="32px" backgroundColor="red" />
    <Stack width="25%" height="32px" backgroundColor="blue" />
    <Stack width="25%" height="32px" backgroundColor="green" />
    <Stack width="25%" height="32px" backgroundColor="yellow" />
  </FlowLayout>
  <FlowLayout gap="10px">
    <Stack width="25%" height="32px" backgroundColor="red" />
    <Stack width="25%" height="32px" backgroundColor="blue" />
    <Stack width="25%" height="32px" backgroundColor="green" />
    <Stack width="25%" height="32px" backgroundColor="yellow" />
  </FlowLayout>
  <FlowLayout gap="1rem">
    <Stack width="25%" height="32px" backgroundColor="red" />
    <Stack width="25%" height="32px" backgroundColor="blue" />
    <Stack width="25%" height="32px" backgroundColor="green" />
    <Stack width="25%" height="32px" backgroundColor="yellow" />
  </FlowLayout>
  <FlowLayout gap="4ch">
    <Stack width="25%" height="32px" backgroundColor="red" />
    <Stack width="25%" height="32px" backgroundColor="blue" />
    <Stack width="25%" height="32px" backgroundColor="green" />
    <Stack width="25%" height="32px" backgroundColor="yellow" />
  </FlowLayout>
</App>
---desc
All items within a `FlowLayout` instance fit in a single row, so `gap` affects only the space between items. The space between rows comes from the outermost `Stack`.
```

### `rowGap` (default: "$gap-normal") [#rowgap-default-gap-normal]

The `rowGap` property specifies the space between the FlowLayout rows; it overrides the `gap` value.

The `rowGap` property specifies the space between the `FlowLayout` rows; it overrides the `gap` value.

```xmlui-pg copy display name="Example: rowGap"
---app copy display
<App>
  <FlowLayout rowGap="2px">
    <Stack width="25%" height="32px" backgroundColor="red" />
    <Stack width="25%" height="32px" backgroundColor="blue" />
    <Stack width="25%" height="32px" backgroundColor="green" />
    <Stack width="25%" height="32px" backgroundColor="yellow" />
    <Stack width="25%" height="32px" backgroundColor="maroon" />
    <Stack width="25%" height="32px" backgroundColor="teal" />
    <Stack width="25%" height="32px" backgroundColor="seagreen" />
    <Stack width="25%" height="32px" backgroundColor="olive" />
  </FlowLayout>
</App>
---desc
You can observe no gap between the items in a single row of the `FlowLayout`, as `rowGap` keeps the gap within a row intact:
```

### `stretch` (default: false) [#stretch-default-false]

When set to true, the FlowLayout takes the full height of its parent container. This is particularly useful in desktop layouts where you want content to fill the available vertical space between fixed header and footer elements.

### `verticalAlignment` (default: "start") [#verticalalignment-default-start]

Manages the vertical content alignment for each child element within the same row. This aligns items along the cross-axis of the flex container.

Available values: `start` **(default)**, `center`, `end`

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

### `scrollToBottom` [#scrolltobottom]

Scrolls the FlowLayout container to the bottom. Works when the FlowLayout has an explicit height and overflowY is set to 'scroll'.

**Signature**: `scrollToBottom(behavior?: 'auto' | 'instant' | 'smooth'): void`

### `scrollToTop` [#scrolltotop]

Scrolls the FlowLayout container to the top. Works when the FlowLayout has an explicit height and overflowY is set to 'scroll'.

**Signature**: `scrollToTop(behavior?: 'auto' | 'instant' | 'smooth'): void`

## Styling [#styling]

This component does not have any styles.

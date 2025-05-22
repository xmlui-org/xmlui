# FlowLayout [#flowlayout]

This layout component is used to position content in rows with an auto wrapping feature: if the length of the items exceed the available space the layout will wrap into a new line.

For details on how to work with \`FlowLayout\` (like sizing children), see [this guide](../learning/using-components/layout-components.mdx#flowlayout).

## Using `SpaceFiller` with `FlowLayout` [#using-spacefiller-with-flowlayout]

The `SpaceFiller` component can be used as a line break.
See the [reference docs](./SpaceFiller.mdx) for details.

## Properties [#properties]

### `columnGap (default: "$gap-normal")` [#columngap-default-gap-normal]

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

### `gap (default: "$gap-normal")` [#gap-default-gap-normal]

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

### `rowGap (default: "$gap-normal")` [#rowgap-default-gap-normal]

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

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

This component does not have any styles.

# Column [#column]

`Column` defines the structure and behavior of individual table columns within a [`Table`](/components/Table) component. Each Column controls data binding, header display, sorting capabilities, sizing, and can contain any XMLUI components for rich cell content.

**Key features:**
- **Data binding**: Use `bindTo` to automatically display object properties
- **Component embedding**: Place any component inside `Column`: `Button`, `Text`, `Icon`, etc.
- **Interactive behavior**: Enable/disable sorting and column resizing
- **Layout control**: Set width using pixels, star sizing (`*`, `2*`), or proportional values
- **Column pinning**: Pin columns to left or right edges for sticky behavior

**Context variables available during execution:**

- `$cell`: The specific cell value for this column
- `$colIndex`: Zero-based column index
- `$item`: The complete data row object being rendered
- `$itemIndex`: Zero-based row index
- `$row`: The complete data row object being rendered (the same as `$item`).
- `$rowIndex`: Zero-based row index (the same as `$itemIndex`).

## Properties [#properties]

### `bindTo` [#bindto]

Indicates the name of the current row item's property, the value of which to lay out in the column. If this property is not defined, the column is not sortable.

```xmlui copy {3}
<App>
  <Table data='{[...]}'>
    <Column bindTo="name" />
  </Table>
</App>
```

```xmlui-pg name="Example: bindTo"
<App>
  <Table data='{
    [
      {
        id: 0,
        name: "Apples",
        quantity: 5,
        unit: "pieces",
        category: "fruits",
        key: 5,
      },
      {
        id: 1,
        name: "Bananas",
        quantity: 6,
        unit: "pieces",
        category: "fruits",
        key: 4,
      },
      {
        id: 2,
        name: "Carrots",
        quantity: 100,
        unit: "grams",
        category: "vegetables",
        key: 3,
      },
      {
        id: 3,
        name: "Spinach",
        quantity: 1,
        unit: "bunch",
        category: "vegetables",
        key: 2,
      },
      {
        id: 4,
        name: "Milk",
        quantity: 10,
        unit: "liter",
        category: "dairy",
        key: 1,
      },
      {
        id: 5,
        name: "Cheese",
        quantity: 200,
        unit: "grams",
        category: "dairy",
        key: 0,
      },
    ]}'>
    <Column bindTo="name" />
  </Table>
</App>
```

### `canResize` (default: true) [#canresize-default-true]

This property indicates whether the user can resize the column. If set to `true`, the column can be resized by dragging the column border. If set to `false`, the column cannot be resized. Double-clicking the column border resets to the original size.

### `canSort` (default: true) [#cansort-default-true]

This property sets whether the user can sort by a column by clicking on its header (`true`) or not (`false`). If the `bindTo` property is not defined, the column is not sortable.

Click on either the `Name` or the `Quantity` column headers to order the data by that attribute.

```xmlui copy /canSort/
<App>
  <Table data='{[...]}'>
    <Column canSort="true" bindTo="name" />
    <Column canSort="true" bindTo="quantity" />
    <Column canSort="false" bindTo="unit" />
  </Table>
</App>
```

```xmlui-pg name="Example: canSort"
<App>
  <Table data='{
  [
    {
      id: 0,
      name: "Apples",
      quantity: 5,
      unit: "pieces",
      category: "fruits",
      key: 5,
    },
    {
      id: 1,
      name: "Bananas",
      quantity: 6,
      unit: "pieces",
      category: "fruits",
      key: 4,
    },
    {
      id: 2,
      name: "Carrots",
      quantity: 100,
      unit: "grams",
      category: "vegetables",
      key: 3,
    },
    {
      id: 3,
      name: "Spinach",
      quantity: 1,
      unit: "bunch",
      category: "vegetables",
      key: 2,
    },
    {
      id: 4,
      name: "Milk",
      quantity: 10,
      unit: "liter",
      category: "dairy",
      key: 1,
    },
    {
      id: 5,
      name: "Cheese",
      quantity: 200,
      unit: "grams",
      category: "dairy",
      key: 0,
    },
  ]}'>
    <Column canSort="true" bindTo="name" />
    <Column canSort="true" bindTo="quantity" />
    <Column canSort="false" bindTo="unit" />
  </Table>
</App>
```

### `header` [#header]

This property defines a label for a particular column. If not set, the `bindTo` property value is used for the label.

```xmlui copy {3-4}
<App>
  <Table data='{[...]}'>
    <Column header="Food Name" bindTo="name" />
    <Column header="Food Quantity" bindTo="quantity" />
    <Column bindTo="unit" />
  </Table>
</App>
```

```xmlui-pg name="Example: header"
<App>
  <Table data='{
  [
    {
      id: 0,
      name: "Apples",
      quantity: 5,
      unit: "pieces",
      category: "fruits",
      key: 5,
    },
    {
      id: 1,
      name: "Bananas",
      quantity: 6,
      unit: "pieces",
      category: "fruits",
      key: 4,
    },
    {
      id: 2,
      name: "Carrots",
      quantity: 100,
      unit: "grams",
      category: "vegetables",
      key: 3,
    },
    {
      id: 3,
      name: "Spinach",
      quantity: 1,
      unit: "bunch",
      category: "vegetables",
      key: 2,
    },
    {
      id: 4,
      name: "Milk",
      quantity: 10,
      unit: "liter",
      category: "dairy",
      key: 1,
    },
    {
      id: 5,
      name: "Cheese",
      quantity: 200,
      unit: "grams",
      category: "dairy",
      key: 0,
    },
  ]}'>
    <Column header="Food Name" bindTo="name" />
    <Column header="Food Quantity" bindTo="quantity" />
    <Column bindTo="unit" />
  </Table>
</App>
```

### `maxWidth` [#maxwidth]

Indicates the maximum width a particular column can have. Same rules apply as with [width](#width).

### `minWidth` [#minwidth]

Indicates the minimum width a particular column can have. Same rules apply as with [width](#width).

### `pinTo` [#pinto]

This property allows the column to be pinned to the `left` (left-to-right writing style) or `right` (left-to-right writing style) edge of the table. If the writing style is right-to-left, the locations are switched. If this property is not set, the column is not pinned to any edge.

Available values: `left`, `right`

>[!WARNING]
> By default, the background color of table rows is transparent. When using the `pinTo` property, you should set the background to an explicit (non-transparent) color; otherwise, the scrolled cells will be visible under the pinned columns.

```xmlui copy /pinTo="left"/ /pinTo="right"/
<App>
  <Theme backgroundColor-row-Table="$color-surface-0">
    <Table data='{[...]}' height="100%">
      <Column bindTo="id" width="50px" pinTo="left" />
      <Column bindTo="name" width="500px" />
      <Column bindTo="quantity" width="300px" />
      <Column bindTo="unit" width="300px"/>
      <Column bindTo="category" width="100px" pinTo="right"/>
    </Table>
  </Theme>
</App>
```
Scroll the table contents horizontally to see how the pinned columns are displayed.

```xmlui-pg name="Example: pinTo"
<App>
  <Theme backgroundColor-row-Table="$color-surface-0">
  <Table data='{
  [
    {
      id: 0,
      name: "Apples",
      quantity: 5,
      unit: "pieces",
      category: "fruits",
      key: 5,
    },
    {
      id: 1,
      name: "Bananas",
      quantity: 6,
      unit: "pieces",
      category: "fruits",
      key: 4,
    },
    {
      id: 2,
      name: "Carrots",
      quantity: 100,
      unit: "grams",
      category: "vegetables",
      key: 3,
    },
    {
      id: 3,
      name: "Spinach",
      quantity: 1,
      unit: "bunch",
      category: "vegetables",
      key: 2,
    },
    {
      id: 4,
      name: "Milk",
      quantity: 10,
      unit: "liter",
      category: "dairy",
      key: 1,
    },
    {
      id: 5,
      name: "Cheese",
      quantity: 200,
      unit: "grams",
      category: "dairy",
      key: 0,
    },
  ]}'
      height="100%">
    <Column bindTo="id" width="50px" pinTo="left" />
    <Column bindTo="name" width="500px" />
    <Column bindTo="quantity" width="300px" />
    <Column bindTo="unit" width="300px"/>
    <Column bindTo="category" width="100px" pinTo="right"/>
  </Table>
  </Theme>
</App>
```

### `width` [#width]

This property defines the width of the column. You can use a numeric value, a pixel value (such as `100px`), or a star size value (such as `*`, `2*`, etc.). You will get an error if you use any other unit (or value).If not defined, the component will use a width according to the column values and the available space.

The following example sets the second column to an absolute size (size pixels), while the first and third columns have star sizes:

```xmlui copy {4}
<App>
  <Table data='{[...]}'>
    <Column bindTo="name" canResize="true" width="3*" />
    <Column bindTo="quantity" width="100px" minWidth="50px" maxWidth="500px" />
    <Column bindTo="unit" width="*" />
  </Table>
</App>
```

Check what happens when you resize table columns:

```xmlui-pg name="Example: width"
<App>
  <Table data='{
  [
    {
      id: 0,
      name: "Apples",
      quantity: 5,
      unit: "pieces",
      category: "fruits",
      key: 5,
    },
    {
      id: 1,
      name: "Bananas",
      quantity: 6,
      unit: "pieces",
      category: "fruits",
      key: 4,
    },
    {
      id: 2,
      name: "Carrots",
      quantity: 100,
      unit: "grams",
      category: "vegetables",
      key: 3,
    },
    {
      id: 3,
      name: "Spinach",
      quantity: 1,
      unit: "bunch",
      category: "vegetables",
      key: 2,
    },
    {
      id: 4,
      name: "Milk",
      quantity: 10,
      unit: "liter",
      category: "dairy",
      key: 1,
    },
    {
      id: 5,
      name: "Cheese",
      quantity: 200,
      unit: "grams",
      category: "dairy",
      key: 0,
    },
  ]}'>
    <Column bindTo="name" canResize="true" width="3*" />
    <Column bindTo="quantity" width="100px" minWidth="50px" maxWidth="500px" />
    <Column bindTo="unit" width="*" />
  </Table>
</App>
```

## Events [#events]

This component does not have any events.

## Exposed Methods [#exposed-methods]

This component does not expose any methods.

## Styling [#styling]

Styling is done via the [`Table` component](/components/Table).

%-DESC-START

**Key features:**
- **Data binding**: Use `bindTo` to automatically display object properties
- **Component embedding**: Place any component inside `Column`: `Button`, `Text`, `Icon`, etc.
- **Interactive behavior**: Enable/disable sorting and column resizing
- **Layout control**: Set width using pixels, star sizing (`*`, `2*`), or proportional values
- **Column pinning**: Pin columns to left or right edges for sticky behavior

You can pass layout properties to a Column:

```xmlui copy {6,7}
<App>
  <Table data='{[...]}'>
    <Column bindTo="name" />
    <Column
      bindTo="quantity"
      horizontalAlignment="right"
      backgroundColor="lightyellow"
    />
    <Column bindTo="unit" />
  </Table>
</App>
```

```xmlui-pg copy name="Example: Layout properties in Column"
<App>
  <Table
    data='{[
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
  ]}'
    rowsSelectable="true"
    checkboxTolerance="comfortable"
  >
    <Column bindTo="name" />
    <Column
      bindTo="quantity"
      horizontalAlignment="right"
      backgroundColor="lightyellow"
    />
    <Column bindTo="unit" />
  </Table>
</App>
```

%-DESC-END

%-PROP-START bindTo

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

%-PROP-END

%-PROP-START canSort

Columns with `bindTo` are sortable by default. Click on the `Name` or `Quantity` column headers to order the data. The `Unit` column has sorting explicitly disabled with `canSort="false"`.

```xmlui copy /canSort/
<App>
  <Table data='{[...]}'>
    <Column bindTo="name" />
    <Column bindTo="quantity" />
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
    <Column bindTo="name" />
    <Column bindTo="quantity" />
    <Column canSort="false" bindTo="unit" />
  </Table>
</App>
```

To change the default for all columns in your app, set `columnCanSortDefault` in `config.json`:

```json
{
  "appGlobals": {
    "columnCanSortDefault": false
  }
}
```

%-PROP-END

%-PROP-START header

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

%-PROP-END

%-PROP-START pinTo

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

%-PROP-END

%-PROP-START width

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

%-PROP-END

%-STYLE-START

Styling is done via the [`Table` component](/components/Table).

%-STYLE-END

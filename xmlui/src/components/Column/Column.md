%-DESC-START

**Key features:**
- **Data binding**: Use `bindTo` to automatically display object properties
- **Typed display**: Use `type` for common table-cell formatting such as email links, dates, numbers, currency, enum labels, and JSON
- **Component embedding**: Place any component inside `Column`: `Button`, `Text`, `Icon`, etc.
- **Interactive behavior**: Enable/disable sorting and column resizing
- **Layout control**: Set width using pixels, star sizing (`*`, `2*`), or proportional values
- **Column pinning**: Pin columns to left or right edges for sticky behavior

`Column` can bind a field, display that field with a type hint, or render completely custom child markup.
The `type` property is display-oriented; it does not validate or convert the underlying data.
When you place child components inside a `Column`, that custom content overrides `type` rendering.

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

%-PROP-START type

`type` tells the table how to display the column's bound values.
Use it for common display semantics without writing custom cell markup.

Common type families include:

- Text: `text`, `short-text`, `long-text`, `markdown`, `code`, `json`
- Links and identifiers: `email`, `phone`, `url`, `link`, `uuid`, `id(short)`
- Numbers: `number`, `number(8,3)`, `integer`, `decimal(2)`, `percent`, `currency(USD)`, `accounting(USD)`, `scientific`, `bytes`, `duration`, `rating(5)`
- Dates: `date`, `date(short)`, `time`, `datetime`, `relative-time`, `timestamp`, `iso-date`
- Choices and booleans: `boolean`, `checkbox`, `yes-no`, `status`, `enum`
- Visual and structured values: `color`, `tag`, `tags`, `image`, `avatar`, `icon`, `object`, `array`, `list`

```xmlui-pg name="Example: Column type formatting"
<App>
  <Table
    data='{[
      {
        customer: "Ada",
        email: "ada@example.com",
        total: 1234.567,
        paidAt: "2026-08-06T12:00:00Z",
        active: true
      }
    ]}'
  >
    <Column bindTo="customer" type="text" />
    <Column bindTo="email" type="email" />
    <Column bindTo="total" type="currency(USD)" />
    <Column bindTo="paidAt" type="datetime" />
    <Column bindTo="active" type="yes-no" />
  </Table>
</App>
```

`number(8,3)` displays numeric values with up to three fractional digits and uses a decimal-aware cell structure:

```xmlui-pg name="Example: Numeric column type"
<App>
  <Table data='{[{ amount: 1234.5678 }, { amount: 9.5 }]}' >
    <Column bindTo="amount" type="number(8,3)" />
  </Table>
</App>
```

If a `Column` has child content, the child content is rendered instead of the typed default:

```xmlui-pg name="Example: Column child content overrides type"
<App>
  <Table data='{[{ total: 1234.5 }]}' >
    <Column bindTo="total" type="currency(USD)">
      <Text>Custom total: {$cell}</Text>
    </Column>
  </Table>
</App>
```

%-PROP-END

%-PROP-START typeOptions

`typeOptions` provides object-shaped display options for the selected `type`.
It is most useful when compact type syntax is not expressive enough.

For `enum` and `status`, values render as plain text by default.
Use `typeOptions` to map raw values to readable labels:

```xmlui-pg name="Example: Enum labels with typeOptions"
<App>
  <Table
    data='{[
      { invoice: "INV-001", state: "sent" },
      { invoice: "INV-002", state: "draft" }
    ]}'
  >
    <Column bindTo="invoice" />
    <Column
      bindTo="state"
      type="enum"
      typeOptions="{{sent:{label:'Sent to customer'}, draft:{label:'Draft'}}}"
    />
  </Table>
</App>
```

The same pattern works for `status`; it still renders plain text unless you provide custom child content:

```xmlui-pg name="Example: Status labels stay plain text"
<App>
  <Table data='{[{ state: "blocked" }, { state: "ready" }]}' >
    <Column
      bindTo="state"
      type="status"
      typeOptions="{{blocked:'Blocked', ready:'Ready'}}"
    />
  </Table>
</App>
```

For `image` and `avatar`, use `typeOptions` for accessible labels:

```xmlui-pg name="Example: Image type options"
<App>
  <Table
    data='{[
      {
        name: "Ada",
        photo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
      }
    ]}'
  >
    <Column bindTo="name" />
    <Column bindTo="photo" type="avatar" typeOptions="{{label:'Ada avatar'}}" />
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
  "xmluiConfig": {
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

Styling is done via the [`Table` component](/docs/reference/components/Table).

%-STYLE-END

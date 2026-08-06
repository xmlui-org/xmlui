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
The type affects display only; it does not validate, convert, or mutate the underlying data.
If a value cannot be formatted for the selected type, the table falls back to plain text for that cell.

### Type Syntax

Use a bare type name for the default behavior:

```xmlui
<Column bindTo="email" type="email" />
```

Some types accept positional arguments:

```xmlui
<Column bindTo="amount" type="number(8,3)" />
<Column bindTo="total" type="currency(EUR)" />
<Column bindTo="createdAt" type="datetime(short)" />
```

Some types accept named arguments:

```xmlui
<Column bindTo="site" type="url(label:domain)" />
<Column bindTo="note" type="long-text(lines:2)" />
```

`typeOptions` can provide the same kind of options as an object.
When both compact `type` arguments and `typeOptions` provide the same option, `typeOptions` wins.

```xmlui
<Column bindTo="note" type="long-text(lines:2)" typeOptions="{{maxLines:4}}" />
```

### Text and Identifier Types

| Type | Visual traits | Useful options |
| --- | --- | --- |
| `text` | Plain text cell. | None. |
| `short-text` | Plain text with compact text styling, useful for short labels and codes. | None. |
| `long-text` | Wrapped text. Can be clamped to a fixed number of visual lines; clamped cells show the full text as a title tooltip by default. | `long-text(lines:2)`, `typeOptions="{{maxLines:2}}"`, `typeOptions="{{tooltip:false}}"`. |
| `markdown` | Inline Markdown for `**bold**` and `*italic*`; also supports line clamping. | `markdown(lines:2)` or `typeOptions="{{maxLines:2}}"`. |
| `code` | Monospace code-style text. | None. |
| `id` | Compact identifier text. Long values are shortened to the first eight characters followed by `...` by default. | `id(short)` or `id(full)`. |
| `uuid` | Compact text styling for UUID-shaped identifiers; the full value is displayed. | None. |
| `name` | Plain name text with normal table-cell styling. | None. |
| `address` | Wrapped address text. Can be clamped like `long-text`. | `address(lines:2)` or `typeOptions="{{maxLines:2}}"`. |

### Link Types

| Type | Visual traits | Useful options |
| --- | --- | --- |
| `email` | Renders an anchor with a `mailto:` URL and displays the email address. | None. |
| `phone` | Renders an anchor with a `tel:` URL and displays the phone number. | None. |
| `url` | Renders an anchor using the cell value as the `href`. | `url(label:domain)` displays the hostname. `url(label:'Open')` displays a fixed label. |
| `link` | Same link renderer as `url`; use it when the value is a generic hyperlink. | `link(label:domain)` or `link(label:'Open')`. |

### Numeric Types

Numeric types are aligned to the end of the cell by default.
The renderer separates integer, decimal, fraction, and suffix parts so decimals line up consistently across rows.
For `number`, `integer`, `decimal`, `percent`, `currency`, `accounting`, `scientific`, `bytes`, and `rating`, invalid numeric values fall back to plain text.

| Type | Visual traits | Useful options |
| --- | --- | --- |
| `number` | Locale-formatted number. | `number(8,3)` accepts precision and scale; the current formatter uses the scale as the maximum number of fractional digits. |
| `integer` | Locale-formatted number rounded to zero fractional digits. | None. |
| `decimal` | Locale-formatted decimal with a fixed number of fractional digits. | `decimal(2)`. |
| `percent` | Locale-formatted percentage. For example, `0.12` displays as `12%`. | None. |
| `currency` | Locale-formatted currency. | `currency(USD)`, `currency(EUR)`, or `typeOptions="{{currency:'USD'}}"`. Defaults to `USD`. |
| `accounting` | Locale-formatted currency with accounting sign display where the locale supports it. | `accounting(USD)` or `typeOptions="{{currency:'USD'}}"`. Defaults to `USD`. |
| `scientific` | Locale-formatted scientific notation. | None. |
| `bytes` | Scales a byte count to `B`, `KB`, `MB`, `GB`, or `TB` with up to one fractional digit. | None. |
| `duration` | Interprets the value as seconds and displays a compact duration such as `1h 1m 1s`. Negative values display as `0s`. | None. |
| `rating` | Displays the value against a maximum, such as `4 / 5`. | `rating(5)` or `typeOptions="{{max:10}}"`. Defaults to `5`. |

### Date and Time Types

Date and time types accept `Date` values and date-compatible strings or numbers.
Invalid date values fall back to plain text.

| Type | Visual traits | Useful options |
| --- | --- | --- |
| `date` | Locale-formatted date. Defaults to medium date style. | `date(short)`, `date(medium)`, `date(long)`, or `date(full)`. |
| `time` | Locale-formatted time. Defaults to short time style. | `time(short)`, `time(medium)`, `time(long)`, or `time(full)`. |
| `datetime` | Locale-formatted date and time. Defaults to short date and short time style. | `datetime(short)`, `datetime(medium)`, `datetime(long)`, or `datetime(full)`. |
| `relative-time` | Displays a relative value such as `1 hour ago` or `tomorrow`, based on the current time. | None. |
| `timestamp` | Displays the JavaScript timestamp in milliseconds. | None. |
| `iso-date` | Displays the ISO calendar date portion, such as `2026-08-06`. | None. |

### Choice and Boolean Types

`enum` and `status` render as plain text by default.
Use `typeOptions` to map raw values to readable labels; visual badges require custom `Column` child content.

| Type | Visual traits | Useful options |
| --- | --- | --- |
| `boolean` | Displays `true` or `false`. | None. |
| `checkbox` | Displays a checkmark for truthy values and an empty cell for falsy values. The cell has checkbox semantics. | None. |
| `yes-no` | Displays `Yes` or `No`. | None. |
| `enum` | Displays the raw value or a mapped label as plain text. | `typeOptions="{{sent:{label:'Sent'}, draft:'Draft'}}"` or `typeOptions="{{values:{sent:'Sent'}}}"`. |
| `status` | Displays the raw value or a mapped label as plain text. | Same mapping options as `enum`. |

### Visual and Structured Types

| Type | Visual traits | Useful options |
| --- | --- | --- |
| `color` | Displays a color swatch followed by the color text. | None. |
| `tag` | Displays a single value with tag-like styling. | None. |
| `tags` | Displays arrays as comma-separated values with tag-like styling. Non-array values display as text. | None. |
| `image` | Displays the cell value as an image URL. | `typeOptions="{{alt:'Thumbnail'}}"` for accessible alt text. |
| `avatar` | Displays the cell value as a rounded avatar image URL. | `typeOptions="{{label:'Ada avatar'}}"` or `typeOptions="{{alt:'Ada avatar'}}"`. |
| `icon` | Displays an XMLUI icon and its icon name. | None. |
| `json` | Displays `JSON.stringify(value)` in code styling. `null` displays as `null`. | None. |
| `object` | Displays objects with `JSON.stringify(value)` in code styling. | None. |
| `array` | Displays arrays with `JSON.stringify(value)` in code styling. | None. |
| `list` | Displays arrays as comma-separated values. Non-array values display as text. | None. |

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

`long-text` can clamp wrapped content to a maximum number of visual lines.
Use compact syntax or `typeOptions`; `typeOptions` wins when both are provided:

```xmlui-pg name="Example: Long text line clamp"
<App>
  <Table
    columnSizing="balanced"
    data='{[
      {
        note: "This is a longer note that wraps across lines and is clamped for compact table display."
      }
    ]}'
  >
    <Column bindTo="note" type="long-text(lines:2)" />
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

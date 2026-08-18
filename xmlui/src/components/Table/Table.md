%-DESC-START

**Key features:**
- **Data integration**: Load data from APIs via [DataSource](/docs/reference/components/DataSource) or use static arrays
- **Virtualization**: Only renders visible rows for smooth performance with large datasets
- **Row selection**: Support single or multi-row selection for bulk operations
- **Pagination**: Built-in pagination controls for managing large datasets
- **Inferred columns**: Display object arrays even when no `Column` children are provided

Use `Column` to define headers, data binding, sorting behavior, display types, and custom cell content.
If you omit `Column` children, `Table` inspects the data records and creates inferred columns automatically.
Explicit `Column` children always win over inferred columns.
Inferred columns use [`idKey`](#idkey) to identify the row identifier column, so the default `idKey="id"` infers an `id` display type for an `id` field.
UUID-shaped string values infer the more specific `uuid` display type.

**Row identity**: The Table uses the `id` field of each data item as a unique row identifier. This identifier is used for row selection, `selectId()`, `getSelectedIds()`, and `syncWithVar`. If your data uses a different field as the key, set the [`idKey`](#idkey) property to that field name.

`Table` keeps a bounded cache of recently rendered virtualized rows by default. This reduces remount and measurement flash when users scroll back through content they have already seen. Set `renderCache="{false}"` to minimize mounted DOM nodes, tune `renderCacheSize` for the number of recently rendered rows to retain, and use `virtualBufferSize` when fast scrolling should prepare more never-seen rows just outside the viewport.

In the following sections the examples use data with the structure outlined below:

| Id   | Name    | Quantity | Unit   | Category   |
| :--- | :------ | :------- | :----- | :--------- |
| 0    | Apples  | 5        | pieces | fruits     |
| 1    | Bananas | 6        | pieces | fruits     |
| 2    | Carrots | 100      | grams  | vegetables |
| 3    | Spinach | 1        | bunch  | vegetables |
| 4    | Milk    | 10       | liter  | diary      |
| 5    | Cheese  | 200      | grams  | diary      |

The data is provided as JSON. In the source code samples, the `data={[...]}` declaration represents the data above.

All samples use table columns with the following definition unless noted otherwise
(The `...` declaration nested into `<Table>` represents this column definition):

```xmlui copy 
<Table data='{[...]}'>
  <Column bindTo="name"/>
  <Column bindTo="quantity"/>
  <Column bindTo="unit"/>
</Table>
```

> **Note**: See [`Column`](../components/Column) to learn more about table columns.

The simplest table can render directly from structured data:

```xmlui-pg name="Example: Inferred columns"
<App>
  <Table
    data='{[
      { id: 1, customer: "Ada", total: 123.45, paid: true },
      { id: 2, customer: "Grace", total: 87.5, paid: false }
    ]}'
  />
</App>
```

When you provide explicit columns, the table renders only those columns:

```xmlui-pg name="Example: Explicit columns override inference"
<App>
  <Table
    data='{[
      { id: 1, customer: "Ada", total: 123.45, paid: true },
      { id: 2, customer: "Grace", total: 87.5, paid: false }
    ]}'
  >
    <Column bindTo="customer" header="Customer" />
    <Column bindTo="total" header="Total" type="currency(USD)" />
  </Table>
</App>
```

Inferred columns with bound fields are sortable by default:

```xmlui-pg name="Example: Sort inferred columns"
<App>
  <Table
    data='{[
      { id: 1, product: "Notebook", quantity: 12 },
      { id: 2, product: "Pencil", quantity: 48 },
      { id: 3, product: "Folder", quantity: 7 }
    ]}'
  />
</App>
```

%-DESC-END

%-PROP-START data

```xmlui copy /data='{[...]}'/
<App>
  <Table data='{[...]}'>
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: data"
<App>
  <Table data='{[
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
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

You can also provide the `Table` with data directly from an API via this property.
Here, the component displays rocket information coming from the official SpaceX API.

```xmlui-pg copy display name="Example: data API Call"
<App>
  <Table data='https://api.spacexdata.com/v3/rockets'>
    <Column header="Image" size="140px">
      <Image height="100px" fit="cover" src="{$item.flickr_images[0]}"/>
    </Column>
    <Column canSort="true" bindTo="country"/>
    <Column canSort="true" bindTo="company"/>
  </Table>
</App>
```

%-PROP-END

%-PROP-START canResizeColumns

Set `canResizeColumns` to `false` to prevent users from resizing all table columns by default.
The default is `true`.

Individual `Column` components can override this table-level default with their own `canResize` property.

```xmlui-pg name="Example: canResizeColumns"
<App>
  <Table
    canResizeColumns="{false}"
    data='{[
      { id: 1, product: "Notebook", quantity: 12, category: "Office" },
      { id: 2, product: "Pencil", quantity: 48, category: "Office" }
    ]}'
  >
    <Column bindTo="product" canResize="{true}" />
    <Column bindTo="quantity" />
    <Column bindTo="category" />
  </Table>
</App>
```

%-PROP-END

%-PROP-START columnInference

`columnInference` controls how `Table` samples data when no `Column` children are provided.
The default is `first-n(25)`, which inspects the first 25 records and infers both field names and display types from those sampled values.

Useful values:

- `first-only`: infer from the first row only
- `first-n(25)`: infer from the first 25 rows; this is the default
- `sample(25)`: infer from a deterministic spread of rows
- `all`: inspect every row; use this only for small datasets
- `off`: do not infer columns

The `25` in `first-n(25)` and `sample(25)` is only an example.
Use any positive integer that fits the data size and cost you want, such as `first-n(5)`, `first-n(100)`, or `sample(50)`.

`columnInference` expects the table's `data` value to be the row array itself.
If an API returns an envelope such as `{ items: [...] }`, unwrap that envelope before passing the value to `Table`.

### How Inference Works

Column inference runs only when the `Table` has no explicit `Column` children.
If you add any `Column` children, those columns define the table instead of the inferred columns.

The table expects `data` to resolve to an array of row objects.
Only plain object rows participate in field discovery; primitive values, arrays, dates, inherited properties, and non-enumerable properties are ignored.
The internal `order` field is also skipped.

| Step | Rule |
| --- | --- |
| 1. Sample rows | `first-only`, `first-n(n)`, `sample(n)`, `all`, or `off` decides which rows are inspected. `sample(n)` uses a deterministic spread across the supplied array. |
| 2. Discover fields | The table reads enumerable own keys from sampled row objects. Field order follows first discovery: keys from earlier sampled rows come first, and newly discovered keys from later sampled rows are appended. |
| 3. Create columns | Each discovered field becomes a sortable inferred column with `header` and `accessorKey` set to the field name. |
| 4. Infer type | The sampled values for each field are inspected and mapped to a `Column` `type`. |
| 5. Apply layout | The inferred type participates in `columnSizing`; numeric-like types align to the end, compact types get compact default widths in balanced sizing, and text-like types can use star sizing. |

Type inference ignores `null`, `undefined`, and empty string values when deciding the type.
If no present values remain, or if the sampled values are mixed in a way the table cannot classify, the type falls back to `text`.

| Sampled values | Inferred type |
| --- | --- |
| UUID-shaped strings | `uuid` |
| Scalar values in the field named by `idKey` | `id` |
| Finite numbers | `integer` when all numbers are integers; otherwise `number` |
| Booleans | `boolean` |
| Arrays of short strings | `tags` |
| Other arrays | `array` |
| Plain objects | `object` |
| ISO date strings | `date` |
| ISO datetime strings | `datetime` |
| Mostly email, URL, or phone strings | `email`, `url`, or `phone` |
| Name-like fields such as `name`, `customer`, `customerName`, `displayName`, `fullName`, or fields ending in `Name` | `name` |
| Any string longer than 80 characters | `long-text` |
| Low-cardinality short string sets | `enum` |
| Other strings or unknown mixed values | `text` |

Inference is display-oriented.
It does not validate data, mutate rows, unwrap API response envelopes, or inspect server-side pages that are not present in the supplied `data` array.
Use explicit `Column` children when you need guaranteed columns, labels, ordering, types, sizing, or custom cell content.

```xmlui-pg display name="Example: columnInference first-only"
<App>
  <Table
    columnInference="first-only"
    data='{[
      { id: 1, customer: "Ada" },
      { id: 2, customer: "Grace", total: 87.5 }
    ]}'
  />
</App>
```

Use `first-n(n)` when the first record may be sparse, but the useful fields appear near the beginning of the data:

```xmlui-pg display name="Example: columnInference first-n"
<App>
  <Table
    columnInference="first-n(3)"
    data='{[
      { id: 1, customer: "Ada" },
      { id: 2, customer: "Grace", total: 87.5 },
      { id: 3, customer: "Linus", paid: true },
      { id: 4, customer: "Margaret", internalNote: "Not sampled" }
    ]}'
  />
</App>
```

Use `sample(n)` when fields may appear later in a larger local array and you want a deterministic spread instead of only the first records:

```xmlui-pg display name="Example: columnInference sample"
<App>
  <Table
    columnInference="sample(3)"
    data='{[
      { id: 1, customer: "Ada" },
      { id: 2, customer: "Grace" },
      { id: 3, customer: "Linus", total: 87.5 },
      { id: 4, customer: "Margaret" },
      { id: 5, customer: "Katherine", status: "paid" }
    ]}'
  />
</App>
```

`idKey` also guides inferred display types.
The field named by `idKey` is inferred as `id`; UUID-shaped string values are inferred as `uuid`.

```xmlui-pg display name="Example: columnInference with idKey"
<App>
  <Table
    idKey="customerId"
    data='{[
      {
        customerId: "C-001",
        name: "Ada",
        traceId: "47f4d9f8-2f6a-4e3d-9bf5-010d74822c6f"
      },
      {
        customerId: "C-002",
        name: "Grace",
        traceId: "550e8400-e29b-41d4-a716-446655440000"
      }
    ]}'
  />
</App>
```

%-PROP-END

%-PROP-START columnSizing

`columnSizing` controls how automatically sized columns consume horizontal space.

Available values:

- `auto`: use type-aware balanced sizing for inferred columns, and preserve the traditional stretch behavior for explicit columns
- `stretch`: distribute available width among columns that do not specify `width`
- `balanced`: keep compact types such as `id`, numbers, booleans, and dates narrow, while text-like types use star sizing
- `content`: prefer compact fixed widths for typed columns

Explicit `Column` values such as `width`, `minWidth`, `maxWidth`, and `horizontalAlignment` override type-aware defaults.

```xmlui-pg display name="Example: columnSizing"
<App>
  <Table
    columnSizing="balanced"
    data='{[
      { id: 1, customer: "Ada", total: 123.45 },
      { id: 2, customer: "Grace", total: 87.5 }
    ]}'
  />
</App>
```

%-PROP-END

%-PROP-START enableMultiRowSelection

This boolean property indicates whether you can select multiple rows in the table.
This property only has an effect when the `rowsSelectable` property is set.
Setting it to `false` limits selection to a single row.

By default, the value of this property is `true`.

```xmlui copy /enableMultiRowSelection="false"/
<App>
  <Table data='{[...]}' 
    rowsSelectable="true" 
    enableMultiRowSelection="false">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: enableMultiRowSelection"
<App>
  <Table data='{[
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
    rowsSelectable="true" 
    enableMultiRowSelection="false">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

%-PROP-END

%-PROP-START toggleSelectionOnClick

When `true`, a plain click toggles the row's selection state (adds it if not selected, removes it if already selected) instead of replacing the current selection with just that row.
This property only has an effect when `rowsSelectable` is `true`. Ctrl+Click and Shift+Click behavior is unchanged.

The default value is `false`.

```xmlui copy /toggleSelectionOnClick="true"/
<App>
  <Table data='{[...]}' rowsSelectable="true" toggleSelectionOnClick="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: toggleSelectionOnClick"
<App>
  <Table data='{[
    { id: 0, name: "Apples", quantity: 5, unit: "pieces" },
    { id: 1, name: "Bananas", quantity: 6, unit: "pieces" },
    { id: 2, name: "Carrots", quantity: 100, unit: "grams" },
    { id: 3, name: "Spinach", quantity: 1, unit: "bunch" }
  ]}'
    rowsSelectable="true"
    toggleSelectionOnClick="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

%-PROP-END

%-PROP-START headerHeight

It accepts common [size values](/docs/styles-and-themes/common-units#size-values).

```xmlui copy /headerHeight="60px"/
<App>
  <Table data='{[...]}' headerHeight="60px">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: headerHeight"
<App>
  <Table data='{[
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
    headerHeight="60px">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

%-PROP-END

%-PROP-START hideHeader

Set the header visibility using this property. Set it to `true` to hide the header.
The default value is `false`.

```xmlui copy /hideHeader="true"/
<App>
  <Table data='{[...]}' hideHeader="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: hideHeader" height="300px"
<App>
  <Table data='{[
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
    hideHeader="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

%-PROP-END

%-PROP-START isPaginated

```xmlui copy /isPaginated="true"/
<App>
  <Table data='{[...]}' isPaginated="true" pageSizeOptions="{[3, 6, 12]}">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: isPaginated"
<App>
  <Table data='{[
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
    isPaginated="true" pageSizeOptions="{[3, 6, 12]}">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

%-PROP-END

%-PROP-START loading

This boolean property indicates if the component is fetching (or processing) data.
This property is useful when data is loaded conditionally or receiving it takes some time. While
loading is `true` and no rows are available, the table shows its loading UI after the configured
[`loadingDelay`](#loadingdelay).

```xmlui-pg copy display name="Example: loading"
<App>
  <Table loading="true" loadingDelay="0">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
  </Table>
</App>
```

%-PROP-END

%-PROP-START loadingDelay

The `loadingDelay` property controls how many milliseconds the table waits before showing its loading
UI. The default is `400`, which prevents flicker when data loads quickly. Set it to `0` to show the
loading UI immediately.

```xmlui-pg copy display name="Example: loading delay" /loadingDelay/
<App var.isLoading="{false}" var.items="{[]}">
  <Button
    label="Load"
    onClick="isLoading = true; delay(1000); items = [{ id: 1, name: 'Loaded row', quantity: 1 }]; isLoading = false" />
  <Table loading="{isLoading}" loadingDelay="400" data="{items}">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
  </Table>
</App>
```

%-PROP-END

%-PROP-START noDataTemplate

```xmlui-pg copy {3-5} display name="Example: noDataTemplate"
<App>
  <Table>
    <property name="noDataTemplate">
      <Text value="No data loaded" variant="strong" />
    </property>
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
  </Table>
</App>
```

%-PROP-END

%-PROP-START pageSizeOptions

Page sizes are only accepted in an array, even if the array contains one item.

Note that this property only works if the [`isPaginated`](#ispaginated) property is set to `true`.

```xmlui copy /pageSizeOptions="{[3, 6, 12]}"/
<App>
  <Table data='{[...]}' isPaginated="true" pageSizeOptions="{[3, 6, 12]}">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: pageSizeOptions"
<App>
  <Table data='{[
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
    isPaginated="true" pageSizeOptions="{[3, 6, 12]}">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

%-PROP-END

%-PROP-START rowDisabledPredicate

The following example disables all table rows where the item's quantity exceeds 6:

```xmlui copy {3}
<App>
  <Table data='{[...]}'
    rowDisabledPredicate="{(item) => item.quantity > 6}">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

>[!INFO]
> Disabled items are rendered with a different color.

```xmlui-pg name="Example: rowDisabledPredicate"
<App>
  <Table data='{[
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
    rowDisabledPredicate="{(item) => item.quantity > 6}">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

%-PROP-END

%-PROP-START rowsSelectable

The default value is `false`.

```xmlui copy /rowsSelectable="true"/
<App>
  <Table data='{[...]}' rowsSelectable="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: rowsSelectable"
<App>
  <Table data='{[
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
    rowsSelectable="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

%-PROP-END

%-PROP-START hideSelectionCheckboxes

Hides the selection checkboxes in both the header and rows while keeping the selection API and keyboard selection behavior intact. Useful when you want selection functionality without visible checkboxes.

The default value is `false`.

```xmlui copy /hideSelectionCheckboxes="true"/
<App>
  <Table data='{[...]}' rowsSelectable="true" enableMultiRowSelection="true" hideSelectionCheckboxes="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: hideSelectionCheckboxes"
<App>
  <Table data='{[
    { id: 0, name: "Apples", quantity: 5, unit: "pieces" },
    { id: 1, name: "Bananas", quantity: 6, unit: "pieces" },
    { id: 2, name: "Carrots", quantity: 100, unit: "grams" },
    { id: 3, name: "Spinach", quantity: 1, unit: "bunch" }
  ]}'
    rowsSelectable="true"
    enableMultiRowSelection="true"
    hideSelectionCheckboxes="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

%-PROP-END

%-PROP-START hideSelectionCheckboxesHeader

Hides the selection checkbox in the table header so it is never displayed, not even on hover. Row checkboxes are unaffected. Selection logic still works via the component API and keyboard shortcuts.

The default value is `false`.

```xmlui copy /hideSelectionCheckboxesHeader="true"/
<App>
  <Table data='{[...]}' rowsSelectable="true" enableMultiRowSelection="true" hideSelectionCheckboxesHeader="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: hideSelectionCheckboxesHeader"
<App>
  <Table data='{[
    { id: 0, name: "Apples", quantity: 5, unit: "pieces" },
    { id: 1, name: "Bananas", quantity: 6, unit: "pieces" },
    { id: 2, name: "Carrots", quantity: 100, unit: "grams" },
    { id: 3, name: "Spinach", quantity: 1, unit: "bunch" }
  ]}'
    rowsSelectable="true"
    enableMultiRowSelection="true"
    hideSelectionCheckboxesHeader="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

%-PROP-END

%-PROP-START checkboxTolerance

The default value is `false`.

```xmlui copy /checkboxTolerance="comfortable"/
<App>
  <Table data='{[...]}' 
    rowsSelectable="true"
    checkboxTolerance="comfortable"
  >
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: checkboxTolerance"
<App>
  <Table data='{[
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
    rowsSelectable="true"
    checkboxTolerance="comfortable">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

%-PROP-END

%-PROP-START singleSelectOnRowClick

The following sample turns on this property. Try how it works when you click on a row or directly to the selection checkbox.

```xmlui copy /singleSelectOnRowClick="true"/
<App>
  <Table 
    data='{[...]}' 
    rowsSelectable="true"
    singleSelectOnRowClick="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: singleSelectOnRowClick"
<App>
  <SelectionStore>
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
    rowsSelectable="true"
    singleSelectOnRowClick="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
  </SelectionStore>
</App>
```

%-PROP-END


%-PROP-START sortBy

```xmlui copy /sortBy="quantity"/
<App>
  <Table data='{[...]}' sortBy="quantity">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: sortBy"
<App>
  <Table data='{[
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
    sortBy="quantity">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

%-PROP-END

%-PROP-START sortDirection

```xmlui copy /sortDirection="descending"/
<App>
  <Table data='{[...]}' sortBy="quantity" sortDirection="descending">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: sortDirection"
<App>
  <Table data='{[
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
    sortBy="quantity" sortDirection="descending">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

%-PROP-END

%-PROP-START iconSortAsc

Allows the customization of the icon displayed in a Table column header when sorting is enabled,
sorting is done according to the column, and the column is sorted in ascending order.

```xmlui copy /iconSortAsc="chevronup"/
<App>
  <Table data='{[...]}' sortBy="quantity" iconSortAsc="chevronup">
    <Column bindTo="name" canSort="true" />
    <Column bindTo="quantity" canSort="true" />
    <Column bindTo="unit" canSort="true" />
  </Table>
</App>
```

```xmlui-pg copy name="Example: iconSortAsc"
<App>
  <Table data='{[
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
    sortBy="quantity" iconSortAsc="chevronup">
    <Column bindTo="name" canSort="true" />
    <Column bindTo="quantity" canSort="true" />
    <Column bindTo="unit" canSort="true" />
  </Table>
</App>
```

%-PROP-END

%-PROP-START iconSortDesc

Allows the customization of the icon displayed in a Table column header when sorting is enabled,
sorting is done according to the column, and the column is sorted in descending order.

```xmlui copy /iconSortDesc="chevrondown"/
<App>
  <Table data='{[...]}' sortBy="quantity" iconSortDesc="chevrondown">
    <Column bindTo="name" canSort="true" />
    <Column bindTo="quantity" canSort="true" />
    <Column bindTo="unit" canSort="true" />
  </Table>
</App>
```

Select a column header and set it to descending ordering.

```xmlui-pg name="Example: iconSortDesc"
<App>
  <Table data='{[
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
    sortBy="quantity" iconSortDesc="chevrondown">
    <Column bindTo="name" canSort="true" />
    <Column bindTo="quantity" canSort="true" />
    <Column bindTo="unit" canSort="true" />
  </Table>
</App>
```

%-PROP-END

%-PROP-START iconNoSort

Allows the customization of the icon displayed in a Table column header when when sorting is enabled
and sorting is not done according to the column. Use the "-" (dash) value to sign that you do not want to display an icon when a table column is not sorted.

```xmlui copy /iconNoSort="close"/
<App>
  <Table data='{[...]}' sortBy="quantity" iconNoSort="close">
    <Column bindTo="name" canSort="true" />
    <Column bindTo="quantity" canSort="true" />
    <Column bindTo="unit" canSort="true" />
  </Table>
</App>
```

```xmlui-pg name="Example: iconNoSort"
<App>
  <Table data='{[
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
    sortBy="quantity" iconNoSort="close">
    <Column bindTo="name" canSort="true" />
    <Column bindTo="quantity" canSort="true" />
    <Column bindTo="unit" canSort="true" />
  </Table>
</App>
```

%-PROP-END

%-PROP-START keyBindings

This property uses the following default key bindings:

```json
{ 
  "selectAll": "CmdOrCtrl+A", 
  "cut": "CmdOrCtrl+X", 
  "copy": "CmdOrCtrl+C", 
  "paste": "CmdOrCtrl+V", 
  "delete": "Delete"
}
```

You can use these accelerator key names:
- `CmdOrCtrl`: Command on macOS, Ctrl on Windows/Linux
- `Alt`: Alt/Options
- `Shift`: Shift
- `Super`: Command on macOS, Windows key on Windows/Linux
- `Ctrl`: Control key
- `Cmd`: Command key (macOS only)

%-PROP-END

%-PROP-START striped

```xmlui copy /striped="true"/
<App>
  <Table data='{[...]}' striped="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

```xmlui-pg name="Example: striped"
<App>
  <Table data='{[
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
]}' striped="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

%-PROP-END

%-EVENT-START sortingDidChange

Note the [`canSort`](/docs/reference/components/Column#cansort-default-true) properties on the `Column` components which enable custom ordering.

```xmlui copy {4}
<App var.sortedBy="">
  <Heading level="h4" value="Table is sorted by: {sortedBy || ''}" paddingLeft="1rem"/>
  <Table data='{[...]}'
    onSortingDidChange="(by, dir) => sortedBy = (by && dir) ? by + ' | ' + dir : '' " >
    <Column bindTo="name" canSort="true"/>
    <Column bindTo="quantity" canSort="true"/>
    <Column bindTo="unit" canSort="true"/>
  </Table>
</App>
```

Click on any of the column headers to trigger a new sorting:

```xmlui-pg name="Example: sortingDidChange"
<App var.sortedBy="">
  <Heading level="h4" value="Table is sorted by: {sortedBy || ''}" paddingLeft="1rem"/>
  <Table data='{[
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
    onSortingDidChange="(by, dir) => sortedBy = (by && dir) ? by + ' | ' + dir : '' " >
    <Column bindTo="name" canSort="true"/>
    <Column bindTo="quantity" canSort="true"/>
    <Column bindTo="unit" canSort="true"/>
  </Table>
</App>
```

%-EVENT-END

%-EVENT-START willSort

The following example uses the `willSort` event to refuse sorting by name:

```xmlui copy {4}
<App var.sortedBy="">
  <Heading level="h4" value="Table is sorted by: {sortedBy || ''}" paddingLeft="1rem"/>
  <Table data='{[...]}'
    onWillSort="(by, dir) => by !== 'name'"
    onSortingDidChange="(by, dir) => sortedBy = (by && dir) ? by + ' | ' + dir : '' " >
    <Column bindTo="name" canSort="true"/>
    <Column bindTo="quantity" canSort="true"/>
    <Column bindTo="unit" canSort="true"/>
  </Table>
</App>
```

Click on any of the column headers to trigger the event.
Though sorting is enabled in the `TableColumnnDef` component of the "name" column via `canSort`,
clicking that column header still does not sort because `willSort` prevents it:

```xmlui-pg name="Example: willSort"
<App var.sortedBy="">
  <Heading level="h4" value="Table is sorted by: {sortedBy || ''}" paddingLeft="1rem"/>
  <Table data='{[
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
    onWillSort="(by, dir) => by !== 'name'"
    onSortingDidChange="(by, dir) => sortedBy = (by && dir) ? by + ' | ' + dir : '' " >
    <Column bindTo="name" canSort="true"/>
    <Column bindTo="quantity" canSort="true"/>
    <Column bindTo="unit" canSort="true"/>
  </Table>
</App>
```

%-EVENT-END

%-EVENT-START selectionDidChange

Of course, if multiple-row selection is not allowed (`enableMultipleRowSelection` is false), this array will contain zero or one item.

```xmlui copy {4}
<App var.selection="">
  <Text>Current selection (row IDs): [{selection}]</Text>
  <Table data='{[...]}'
    rowsSelectable="true"
    enableMultiRowSelection="true"
    onSelectionDidChange="(newSel) => selection = newSel.map(item => item.id).join()" >
    <Column bindTo="name" canSort="true"/>
    <Column bindTo="quantity" canSort="true"/>
    <Column bindTo="unit" canSort="true"/>
  </Table>
</App>
```

Click on any of the column headers to trigger a new sorting:

```xmlui-pg name="Example: selectionDidChange"
<App var.selection="">
  <Text>Current selection (row IDs): [{selection}]</Text>
  <Table data='{[
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
    rowsSelectable="true"
    enableMultiRowSelection="true"
    onSelectionDidChange="(newSel) => selection = newSel.map(item => item.id).join()" >
    <Column bindTo="name" canSort="true"/>
    <Column bindTo="quantity" canSort="true"/>
    <Column bindTo="unit" canSort="true"/>
  </Table>
</App>
```

%-EVENT-END

%-EVENT-START rowDoubleClick

This event is triggered when a table row is double-clicked. The handler receives the row's data item as its only argument.

```xmlui copy {4}
<App>
  <Table data='{[...]}' onRowDoubleClick="(item) => console.log(item)">
    <Column bindTo="name"/>

%-EVENT-START rowDoubleClick

This event is triggered when a table row is double-clicked. The handler receives the row's data item as its only argument.

```xmlui copy {4}
<App>
  <Table data='{[...]}' onRowDoubleClick="(item) => console.log(item)">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
  </Table>
</App>
```

%-EVENT-END
    <Column bindTo="quantity"/>
  </Table>
</App>
```

%-EVENT-END
%-EVENT-START scroll

This event fires as the user scrolls the table. The event object includes `scrollTop`, `scrollHeight`, `viewportSize`, `atEnd`, `visibleRange`, and `itemCount`.

It is only fired for user-driven scrolls; the table's own programmatic scrolls do not trigger it. Use `visibleRange` and `itemCount` to display the currently visible range while the user scrolls.

%-EVENT-END

%-EVENT-START visibleRangeDidChange

This event fires when the visible row range changes. It also fires for non-user-scroll changes, such as initial measurement or programmatic scrolling.

%-EVENT-END

%-API-START getItemCount

Returns the number of rows in the table's current virtualized row model. Use this with `getVisibleRange()` to build a display such as `234-245 of 1000`.

For paginated tables, this count is the number of rows in the current page's virtualized row model.

%-API-END

%-API-START getVisibleRange

Returns the currently visible row range as `{ startIndex, endIndex }`. Indexes are zero-based and inclusive, so add `1` when displaying them to users.

When the table is empty or not yet measured, the method returns `{ startIndex: -1, endIndex: -1 }`. This is the pull-style counterpart of the `visibleRangeDidChange` event.

```xmlui-pg copy display name="Example: visible range display" height="420px"
<App
  scrollWholePage="false"
  var.itemCount="{0}"
  var.range="{{ startIndex: -1, endIndex: -1 }}">
  <Text
    variant="strong"
    value="{range.startIndex < 0
      ? 'No rows'
      : (range.startIndex + 1) + '-' 
        + (range.endIndex + 1) + ' of ' + itemCount}" 
  />
  <Table
    id="table"
    height="*"
    onScroll="(e) => { range = e.visibleRange; itemCount = e.itemCount }"
    onVisibleRangeDidChange="(r) => { 
      range = r; 
      itemCount = table.getItemCount() 
    }"
    data="{Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      name: 'Item ' + (i + 1),
      quantity: (i % 25) + 1,
    }))}">
    <Column bindTo="id" width="90px" />
    <Column bindTo="name" />
    <Column bindTo="quantity">
      <Text height="50px">{$cell}</Text>
    </Column>
  </Table>
</App>
```

%-API-END

%-API-START scrollToBottom

See the [`getVisibleRange`](#getvisiblerange) example for displaying the visible range while scrolling.

%-API-END

%-API-START scrollToTop

See the [`getVisibleRange`](#getvisiblerange) example.

%-API-END

%-API-START scrollToIndex

See the [`getVisibleRange`](#getvisiblerange) example.

%-API-END

%-API-START scrollToId

See the [`getVisibleRange`](#getvisiblerange) example.

%-API-END

%-API-START clearSelection


```xmlui copy /clearSelection()/ /selectId(1)/ /selectId([2, 4])/ /selectAll()/
<App>
  <HStack>
    <Button label="Select all" onClick="table.selectAll()" />
    <Button label="Clear all" onClick="table.clearSelection()" />
    <Button label="Select 1" onClick="table.selectId(1)" />
    <Button label="Select 2, 4" onClick="table.selectId([2, 4])" />
  </HStack>
  <Table id="table" data='{[...]}'
    rowsSelectable="true"
    enableMultiRowSelection="true">
    <Column bindTo="name" canSort="true"/>
    <Column bindTo="quantity" canSort="true"/>
    <Column bindTo="unit" canSort="true"/>
  </Table>
</App>
```

```xmlui-pg name="Example: clearSelection"
<App>
  <HStack>
    <Button label="Select all" onClick="table.selectAll()" />
    <Button label="Clear all" onClick="table.clearSelection()" />
    <Button label="Select 1" onClick="table.selectId(1)" />
    <Button label="Select 2, 4" onClick="table.selectId([2, 4])" />
  </HStack>
  <Table id="table" data='{[
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
    rowsSelectable="true"
    enableMultiRowSelection="true">
    <Column bindTo="name" canSort="true"/>
    <Column bindTo="quantity" canSort="true"/>
    <Column bindTo="unit" canSort="true"/>
  </Table>
</App>
```

%-API-END

%-API-START getSelectedIds

(See the [example](#clearselection) at the `clearSelection` method)

%-API-END

%-API-START getSelectedItems

(See the [example](#clearselection) at the `clearSelection` method)

%-API-END

%-API-START selectAll

(See the [example](#clearselection) at the `clearSelection` method)

%-API-END

%-API-START selectId

(See the [example](#clearselection) at the `clearSelection` method)

%-API-END

%-PROP-START idKey

```xmlui copy /idKey="key"/
<App>
  <Table
    idKey="key"
    rowsSelectable="true"
    data="{[
      { 'key': 0, 'name': 'John' },
      { 'key': 1, 'name': 'Jane' },
      { 'key': 2, 'name': 'Bill' },
    ]}"
  > 
    <Column bindTo="name"/>
  </Table>
</App>
```

%-PROP-END

%-PROP-START syncWithVar

The following example demonstrates how two independent `MyTable` components share selection state through a global variable. Selecting a row in either table immediately reflects in the other, and `selState` always holds the current selection:

>[!INFO]
> `syncWithVar` works with both global and local variables. When using local variables, ensure all Tables in the sync have that variable in their scope.

```xmlui-pg name="Table"
---app copy display /global.selState/ filename="Main.xmlui"
<App global.selState="{{}}">
  <MyTable />
  <Text>Selection: {JSON.stringify(selState)}</Text>
  <MyTable />
</App>
---comp copy display /syncWithVar="selState"/ filename="MyTable.xmlui"
<Component name="MyTable">
  <Table
    syncWithVar="selState"
    rowsSelectable="true"
    data='{[
      { id: 0, name: "Apples", quantity: 5, unit: "pieces" },
      { id: 1, name: "Bananas", quantity: 6 },
      { id: 2, name: "Carrots", quantity: 100, unit: "grams" },
    ]}'
  >
    <Column bindTo="name" />
    <Column bindTo="quantity" />
    <Column bindTo="unit" />
  </Table>
</Component>
---desc
Change the selection in one of the tables and check how it is synced.
```

%-PROP-END

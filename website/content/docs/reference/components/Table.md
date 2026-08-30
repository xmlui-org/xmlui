# Table [#table]

`Table` presents structured data for viewing, sorting, selection, and interaction.

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

| Id  | Name    | Quantity | Unit   | Category   |
| :-- | :------ | :------- | :----- | :--------- |
| 0   | Apples  | 5        | pieces | fruits     |
| 1   | Bananas | 6        | pieces | fruits     |
| 2   | Carrots | 100      | grams  | vegetables |
| 3   | Spinach | 1        | bunch  | vegetables |
| 4   | Milk    | 10       | liter  | diary      |
| 5   | Cheese  | 200      | grams  | diary      |

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

**Context variables available during execution:**

- `$cell`: The value of the current cell for this column.
- `$colIndex`: Zero-based index of the current column.
- `$item`: The complete data row object being rendered.
- `$itemIndex`: Zero-based index of the row in the data array.
- `$row`: The complete data row object being rendered (alias of `$item`).
- `$rowIndex`: Zero-based row index (alias of `$itemIndex`).

## Behaviors [#behaviors]

This component supports the following behaviors:

| Behavior | Properties |
| --- | --- |
| Animation | `animation`, `animationOptions` |
| Bookmark | `bookmark`, `bookmarkLevel`, `bookmarkTitle`, `bookmarkOmitFromToc` |
| Component Label | `label`, `labelPosition`, `labelWidth`, `labelBreak`, `required`, `enabled`, `shrinkToLabel`, `style`, `readOnly` |
| Tooltip | `tooltip`, `tooltipMarkdown`, `tooltipOptions` |
| Styling Variant | `variant` |

## Properties [#properties]

### `alwaysShowHeader` [#alwaysshowheader]

> [!DEF]  default: **false**

This property indicates whether the table header is always visible when scrolling and no height is specified. When set to `true`, the header is sticky and always visible on page scroll. Otherwise, it scrolls with the content and may not be visible when scrolled down.

### `alwaysShowPagination` [#alwaysshowpagination]

This property explicitly toggles pagination controls visibility. If set to `true`, controls are always shown even if there is only one page. If set to `false`, controls are hidden. If omitted, controls are hidden when there is only one page and shown otherwise. This property only has effect when pagination is enabled. It acts as an alias for showPaginationControls.

### `alwaysShowSelectionCheckboxes` [#alwaysshowselectioncheckboxes]

> [!DEF]  default: **false**

When set to `true`, selection checkboxes are always visible for all rows instead of appearing only on hover. Has no effect when `hideSelectionCheckboxes` is `true` or when row selection is disabled.

### `alwaysShowSelectionCheckboxesHeader` [#alwaysshowselectioncheckboxesheader]

> [!DEF]  default: **false**

This property indicates when the row selection header is displayed. When the value is `true,` the selection header is always visible. Otherwise, it is displayed only when hovered.

### `alwaysShowSortingIndicator` [#alwaysshowsortingindicator]

> [!DEF]  default: **false**

This property indicates whether the sorting indicator is always visible in the column headers. When set to `true`, the sorting indicator is always visible. Otherwise, it is visible only when the user hovers over/focuses the column header or the column is sorted.

### `autoFocus` [#autofocus]

> [!DEF]  default: **false**

If this property is set to `true`, the component gets the focus automatically when displayed.

### `buttonRowPosition` [#buttonrowposition]

> [!DEF]  default: **"center"**

Determines where to place the pagination button row in the layout. It works the same as the [Pagination component property](./Pagination#buttonrowposition).

Available values: `start`, `center` **(default)**, `end`

### `canResizeColumns` [#canresizecolumns]

> [!DEF]  default: **true**

Indicates whether columns can be resized by dragging their header borders. Individual `Column` components can override this table-level default with their own `canResize` property.

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

### `cellUserSelect` [#celluserselect]

> [!DEF]  default: **"none"**

This property controls whether users can select text within table cells.

Available values:

| Value | Description |
| --- | --- |
| `auto` | Default text selection behavior |
| `text` | Text can be selected by the user |
| `none` | Text cannot be selected **(default)** |
| `contain` | Selection is contained within this element |
| `all` | The entire element content is selected as one unit |

### `cellVerticalAlign` [#cellverticalalign]

> [!DEF]  default: **"center"**

This property controls the vertical alignment of cell content. It can be set to `top`, `center`, or `bottom`.

Available values: `top`, `center` **(default)**, `bottom`

### `checkboxTolerance` [#checkboxtolerance]

> [!DEF]  default: **"compact"**

This property controls the tolerance area around checkboxes for easier interaction. This property only has an effect when the rowsSelectable property is set to `true`. `none` provides no tolerance (0px), `compact` provides minimal tolerance (8px), `comfortable` provides medium tolerance (12px), and `spacious` provides generous tolerance (16px) for improved accessibility.

Available values: `none`, `compact` **(default)**, `comfortable`, `spacious`

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

### `columnInference` [#columninference]

> [!DEF]  default: **"first-n(25)"**

Controls how the `Table` samples the resolved `data` array when it has no explicit `Column` children and needs to infer columns and display types. The default is `first-n(25)`. Use `first-only` for the fastest inference, `first-n(n)` for a bounded prefix, `sample(n)` for deterministic spread sampling, `all` for small datasets, or `off` to disable inferred columns. This setting inspects row objects only; unwrap API response envelopes before passing data to the table.

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

### How Inference Works [#how-inference-works]

Column inference runs only when the `Table` has no explicit `Column` children.
If you add any `Column` children, those columns define the table instead of the inferred columns.

The table expects `data` to resolve to an array of row objects.
Only plain object rows participate in field discovery; primitive values, arrays, dates, inherited properties, and non-enumerable properties are ignored.
The internal `order` field is also skipped.

| Step               | Rule                                                                                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Sample rows     | `first-only`, `first-n(n)`, `sample(n)`, `all`, or `off` decides which rows are inspected. `sample(n)` uses a deterministic spread across the supplied array.                                                 |
| 2. Discover fields | The table reads enumerable own keys from sampled row objects. Field order follows first discovery: keys from earlier sampled rows come first, and newly discovered keys from later sampled rows are appended. |
| 3. Create columns  | Each discovered field becomes a sortable inferred column with `header` and `accessorKey` set to the field name.                                                                                               |
| 4. Infer type      | The sampled values for each field are inspected and mapped to a `Column` `type`.                                                                                                                              |
| 5. Apply layout    | The inferred type participates in `columnSizing`; numeric-like types align to the end, compact types get compact default widths in balanced sizing, and text-like types can use star sizing.                  |

Type inference ignores `null`, `undefined`, and empty string values when deciding the type.
If no present values remain, or if the sampled values are mixed in a way the table cannot classify, the type falls back to `text`.

| Sampled values                                                                                                     | Inferred type                                               |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| UUID-shaped strings                                                                                                | `uuid`                                                      |
| Scalar values in the field named by `idKey`                                                                        | `id`                                                        |
| Finite numbers                                                                                                     | `integer` when all numbers are integers; otherwise `number` |
| Booleans                                                                                                           | `boolean`                                                   |
| Arrays of short strings                                                                                            | `tags`                                                      |
| Other arrays                                                                                                       | `array`                                                     |
| Plain objects                                                                                                      | `object`                                                    |
| ISO date strings                                                                                                   | `date`                                                      |
| ISO datetime strings                                                                                               | `datetime`                                                  |
| Mostly email, URL, or phone strings                                                                                | `email`, `url`, or `phone`                                  |
| Name-like fields such as `name`, `customer`, `customerName`, `displayName`, `fullName`, or fields ending in `Name` | `name`                                                      |
| Any string longer than 80 characters                                                                               | `long-text`                                                 |
| Low-cardinality short string sets                                                                                  | `enum`                                                      |
| Other strings or unknown mixed values                                                                              | `text`                                                      |

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

### `columnSizing` [#columnsizing]

> [!DEF]  default: **"auto"**

Controls how automatically sized columns consume horizontal space. `stretch` keeps the traditional equal-fill behavior, `balanced` uses type-aware defaults so compact types such as IDs and numbers stay narrow while text-like columns use star sizing, `content` prefers compact fixed widths, and `auto` uses `balanced` for inferred columns while preserving `stretch` for explicit columns.

Available values: `auto` **(default)**, `stretch`, `balanced`, `content`

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

### `data` [#data]

The component receives data via this property. The `data` property is a list of items that the `Table` can display.

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

### `dataRefreshMode` [#datarefreshmode]

> [!DEF]  default: **"reset"**

Controls how the table handles later data refreshes after the initial load. `reset` keeps the table's default refresh behavior. `preserve-state` reconciles refreshed data with the current view state for unchanged source row IDs.

Available values: `reset` **(default)**, `preserve-state`

Use `dataRefreshMode="preserve-state"` when a Table receives refreshed `data` after backend mutations. The table keeps the current scroll position, sort state, pagination state when still valid, column sizing, and row selection for source rows whose `idKey` values still exist. If deletion leaves the current page beyond the new page count, the table clamps to the last available page.

For a complete backend-style insert, update, and delete workflow, see [Preserve collection state across data refreshes](/docs/howto/preserve-tree-state-across-data-refreshes).

For mutation flows where only the next refresh should preserve state, call `preserveStateOnNextDataRefresh()` before updating or refetching the data:

```xmlui-pg name="Example: Preserve Table state for the next refresh" height="300px" /preserveStateOnNextDataRefresh/
<App var.items="{Array.from({ length: 20 }, (_, i) => ({ id: 'row-' + (i + 1), name: 'Row ' + (i + 1) }))}">
  <Button onClick="
    table.preserveStateOnNextDataRefresh({ operation: 'insert' });
    items = [...items, { id: 'row-new', name: 'Inserted row' }];
  ">
    Add row
  </Button>
  <Table id="table" height="200px" dataRefreshMode="reset" data="{items}">
    <Column bindTo="name" />
  </Table>
</App>
```

Stable, unique `idKey` values are required. If an inserted row is outside the current viewport and is present in the current row model, `operation: "insert"` or `scrollTarget: "first-inserted"` scrolls it into view after reconciliation. For paginated tables, insert targeting does not switch pages.

### `enableMultiRowSelection` [#enablemultirowselection]

> [!DEF]  default: **true**

This boolean property indicates whether you can select multiple rows in the table. This property only has an effect when the rowsSelectable property is set. Setting it to `false` limits selection to a single row.

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

### `headerHeight` [#headerheight]

This optional property is used to specify the height of the table header.

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

### `headerUserSelect` [#headeruserselect]

> [!DEF]  default: **"text"**

This property controls whether users can select text within table headers.

Available values:

| Value | Description |
| --- | --- |
| `auto` | Default text selection behavior |
| `text` | Text can be selected by the user **(default)** |
| `none` | Text cannot be selected |
| `contain` | Selection is contained within this element |
| `all` | The entire element content is selected as one unit |

### `hideHeader` [#hideheader]

> [!DEF]  default: **false**

Set the header visibility using this property. Set it to `true` to hide the header.

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

### `hideSelectionCheckboxes` [#hideselectioncheckboxes]

> [!DEF]  default: **false**

If true, hides selection checkboxes for both rows and header. Selection logic still works via API and keyboard.

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

### `hideSelectionCheckboxesHeader` [#hideselectioncheckboxesheader]

> [!DEF]  default: **false**

If true, the selection checkbox in the table header is never displayed, not even on hover. Row checkboxes are unaffected. Selection logic still works via API and keyboard.

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

### `highlightHoveredColumn` [#highlighthoveredcolumn]

> [!DEF]  default: **false**

When set to `true`, hovering a table cell tints its entire column with the [`backgroundColor-column-Table--hover`](#backgroundcolor-column-table--hover) theme variable. The default is `false`: no cell hover handlers are attached and the rendered output is unchanged. Where the hovered row and the hovered column intersect, the row highlight wins. Pinned columns keep their own hover background instead of the column tint.

Column headers already highlight on hover, but by default hovering a cell in the table body only highlights its row — nothing marks which column you are in. On a wide table this makes it easy to lose track of which field you are reading as your eye travels down a column.

Set `highlightHoveredColumn` to `true` to tint the entire hovered column with the [`backgroundColor-column-Table--hover`](#backgroundcolor-column-table--hover) theme variable. The default is `false`: no cell hover handlers are attached and the table renders exactly as it does today.

Where the hovered row and the hovered column intersect, the row highlight wins — the column tint never competes with or muddies the row's own hover color. Pinned columns keep their existing hover background instead of showing the column tint, since the pointer being elsewhere in the table should not change how a pinned column looks.

```xmlui copy /highlightHoveredColumn="true"/
<App>
  <Table data='{[...]}' highlightHoveredColumn="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
  </Table>
</App>
```

Hover any cell to see its whole column tinted, and hover a row to see the row highlight take precedence where the two overlap:

```xmlui-pg name="Example: highlightHoveredColumn"
<App>
  <Table
    data='{[
      { id: 0, name: "Apples", quantity: 5, unit: "pieces", category: "fruits" },
      { id: 1, name: "Bananas", quantity: 6, unit: "pieces", category: "fruits" },
      { id: 2, name: "Carrots", quantity: 100, unit: "grams", category: "vegetables" },
      { id: 3, name: "Spinach", quantity: 1, unit: "bunch", category: "vegetables" },
      { id: 4, name: "Milk", quantity: 10, unit: "liter", category: "dairy" }
    ]}'
    highlightHoveredColumn="true">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
    <Column bindTo="unit"/>
    <Column bindTo="category"/>
  </Table>
</App>
```

### `iconNoSort` [#iconnosort]

Allows setting an alternate icon displayed in the Table column header when sorting is enabled, but the column remains unsorted. You can change the default icon for all Table instances with the "icon.nosort:Table" declaration in the app configuration file.

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

### `iconSortAsc` [#iconsortasc]

Allows setting an alernate icon displayed in the Table column header when sorting is enabled, and the column is sorted in ascending order. You can change the default icon for all Table instances with the "icon.sortasc:Table" declaration in the app configuration file.

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

### `iconSortDesc` [#iconsortdesc]

Allows setting an alternate icon displayed in the Table column header when sorting is enabled, and the column is sorted in descending order. You can change the default icon for all Table instances with the "icon.sortdesc:Table" declaration in the app configuration file.

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

### `idKey` [#idkey]

> [!DEF]  default: **"id"**

This property is used to specify the unique ID property in the data array. If the idKey points to a property that does not exist in the data items, that will result in incorrect behavior when using selectable rows.

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

### `initiallySelected` [#initiallyselected]

An array of IDs that should be initially selected when the table is rendered. This property only has an effect when the rowsSelectable property is set to `true`.

### `isPaginated` [#ispaginated]

> [!DEF]  default: **false**

This property adds pagination controls to the `Table`. When enabled, the pagination bar is automatically hidden if all rows fit on a single page. You can omit this property and set only `pageSize` instead — pagination will then activate automatically when the data length exceeds the page size and hide itself when it does not.

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

### `keyBindings` [#keybindings]

This property defines keyboard shortcuts for table actions. Provide an object with action names as keys and keyboard shortcut strings as values. The shortcut strings use Electron accelerator syntax (e.g., 'CmdOrCtrl+A', 'Delete'). Available actions: `selectAll`, `cut`, `copy`, `paste`, `delete`. If not provided, default shortcuts are used.

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

### `loading` [#loading]

This boolean property indicates if the component is fetching (or processing) data. This property is useful when data is loaded conditionally or receiving it takes some time.

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

### `loadingDelay` [#loadingdelay]

> [!DEF]  default: **400**

The delay in milliseconds before showing the loading UI. Set to `0` to show immediately, or a higher value to prevent flicker for fast-loading data.

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

### `noBottomBorder` [#nobottomborder]

> [!DEF]  default: **false**

This property indicates whether the table should have a bottom border. When set to `true`, the table does not have a bottom border. Otherwise, it has a bottom border.

### `noDataTemplate` [#nodatatemplate]

A property to customize what to display if the table does not contain any data.

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

### `pageInfoPosition` [#pageinfoposition]

> [!DEF]  default: **"end"**

Determines where to place the page information in the layout. It works the same as the [Pagination component property](./Pagination#pageinfoposition).

### `pageSize` [#pagesize]

This property defines the number of rows to display per page. When set without also setting `isPaginated`, pagination is activated automatically whenever the number of data rows exceeds this value and suppressed otherwise. This makes `pageSize` the minimal way to get auto-activating, auto-hiding pagination: no conditional expressions on `isPaginated` or the position props are needed.

Options

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

### `pageSizeOptions` [#pagesizeoptions]

This property holds an array of page sizes (numbers) the user can select for pagination. If this property is not defined, the component allows only a page size of 10 items.

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

### `pageSizeSelectorPosition` [#pagesizeselectorposition]

> [!DEF]  default: **"start"**

Determines where to place the page size selector in the layout. It works the same as the [Pagination component property](./Pagination#pagesizeselectorposition).

### `paginationControlsLocation` [#paginationcontrolslocation]

> [!DEF]  default: **"bottom"**

This property determines the location of the pagination controls. It can be set to `top`, `bottom`, or `both`.

Available values: `top`, `bottom` **(default)**, `both`

### `refreshOn` [#refreshon]

An expression whose value change forces all table rows and cells to re-render. Use this to ensure that closure variables bound in row or cell templates are updated when global state changes (e.g. `{selectMode}`). Without this, virtualized rows might retain stale references to global variables for performance reasons.

### `renderCache` [#rendercache]

> [!DEF]  default: **true**

Controls whether the table keeps a bounded set of recently rendered virtualized rows mounted while they are outside the viewport. Keeping rows mounted reduces remount and measurement flash when users scroll back through recently viewed content.

### `renderCacheSize` [#rendercachesize]

> [!DEF]  default: **80**

Maximum number of recently rendered virtualized rows to keep mounted when [`renderCache`](#rendercache) is enabled. Larger values can make repeat scrolling smoother but retain more DOM nodes.

### `rowDisabledPredicate` [#rowdisabledpredicate]

This property defines a predicate function with a return value that determines if the row should be disabled. The function retrieves the item to display and should return a Boolean-like value.

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

> [!INFO]
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

### `rowsSelectable` [#rowsselectable]

Indicates whether the rows are selectable (`true`) or not (`false`).

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

### `rowUnselectablePredicate` [#rowunselectablepredicate]

This property defines a predicate function with a return value that determines if the row should be unselectable. The function retrieves the item to display and should return a Boolean-like value. This property only has an effect when the `rowsSelectable` property is set to `true`.

### `showCurrentPage` [#showcurrentpage]

> [!DEF]  default: **true**

Whether to show the current page indicator. It works the same as the [Pagination component property](./Pagination#showcurrentpage).

### `showPageInfo` [#showpageinfo]

> [!DEF]  default: **true**

Whether to show page information. It works the same as the [Pagination component property](./Pagination#showpageinfo).

### `showPageSizeSelector` [#showpagesizeselector]

> [!DEF]  default: **true**

Whether to show the page size selector. It works the same as the [Pagination component property](./Pagination#showpagesizeselector).

### `sortBy` [#sortby]

This property is used to determine which data property to sort by. If not defined, the data is not sorted

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

### `sortDirection` [#sortdirection]

This property determines the sort order to be `ascending` or `descending`. This property only works if the [`sortBy`](#sortby) property is also set. By default ascending order is used.

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

### `striped` [#striped]

> [!DEF]  default: **false**

When set to `true`, the table rows alternate between the `backgroundColor-evenRow-Table` and `backgroundColor-oddRow-Table` theme variables, creating a striped appearance.

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

### `syncWithAppState` [#syncwithappstate]

An AppState instance to synchronize the table's selection state with. The table will read from and write to the 'selectedIds' property of the AppState object. When provided, this takes precedence over the initiallySelected property for initial selection. You can use the AppState's didUpdate event to receive notifications when the selection changes.

### `syncWithVar` [#syncwithvar]

The name of a global variable to synchronize the table's selection state with. The named variable must reference an object; the table will read from and write to its 'selectedIds' property. When provided, this takes precedence over both `initiallySelected` and `syncWithAppState`. Multiple tables sharing the same variable name will keep their selections in sync automatically. A runtime error is signalled if the value is not a valid JavaScript variable name.

The following example demonstrates how two independent `MyTable` components share selection state through a global variable. Selecting a row in either table immediately reflects in the other, and `selState` always holds the current selection:

> [!INFO]
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

### `toggleSelectionOnClick` [#toggleselectiononclick]

> [!DEF]  default: **false**

When `true`, a plain click toggles the row's selection state instead of replacing the current selection. Ctrl+Click and Shift+Click behavior is unchanged. Only has an effect when `rowsSelectable` is `true`.

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

### `userSelectCell` [#userselectcell]

> [!DEF]  default: **"auto"**

This property controls whether users can select text within table cells.

Available values:

| Value | Description |
| --- | --- |
| `auto` | Default text selection behavior **(default)** |
| `text` | Text can be selected by the user |
| `none` | Text cannot be selected |
| `contain` | Selection is contained within this element |
| `all` | The entire element content is selected as one unit |

### `userSelectHeading` [#userselectheading]

> [!DEF]  default: **"none"**

This property controls whether users can select text within table headings. Use `text` to allow text selection, `none` to prevent selection, or `auto` for default behavior.

Available values:

| Value | Description |
| --- | --- |
| `auto` | Default text selection behavior |
| `text` | Text can be selected by the user |
| `none` | Text cannot be selected **(default)** |
| `contain` | Selection is contained within this element |
| `all` | The entire element content is selected as one unit |

### `userSelectRow` [#userselectrow]

> [!DEF]  default: **"auto"**

This property controls whether users can select text within table rows. Use `text` to allow text selection, `none` to prevent selection, or `auto` for default behavior.

Available values:

| Value | Description |
| --- | --- |
| `auto` | Default text selection behavior **(default)** |
| `text` | Text can be selected by the user |
| `none` | Text cannot be selected |
| `contain` | Selection is contained within this element |
| `all` | The entire element content is selected as one unit |

### `virtualBufferSize` [#virtualbuffersize]

Extra virtualizer buffer, in pixels, to render before and after the viewport. Increase this when fast scrolling reaches rows that have not been rendered before; unlike [`renderCache`](#rendercache), this prepares never-seen rows near the viewport.

## Events [#events]

### `contextMenu` [#contextmenu]

This event is triggered when the Table is right-clicked (context menu).

**Signature**: `contextMenu(event: MouseEvent): void`

- `event`: The mouse event object.

### `copyAction` [#copyaction]

This event is triggered when the user presses the copy keyboard shortcut (default: Ctrl+C/Cmd+C) and `rowsSelectable` is set to `true`. The handler receives three parameters: the focused row, selected items, and selected IDs. The handler should implement the copy logic (e.g., using the Clipboard API to copy selected data).

**Signature**: `copy(row: TableRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>`

- `row`: The currently focused row context, or null if no row is focused.
- `selectedItems`: Array of selected row items.
- `selectedIds`: Array of selected row IDs (as strings).

### `cutAction` [#cutaction]

This event is triggered when the user presses the cut keyboard shortcut (default: Ctrl+X/Cmd+X) and `rowsSelectable` is set to `true`. The handler receives three parameters: the focused row, selected items, and selected IDs. Note: The component does not automatically modify data; the handler must implement the cut logic (e.g., copying data to clipboard and removing from the data source).

**Signature**: `cut(row: TableRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>`

- `row`: The currently focused row context, or null if no row is focused.
- `selectedItems`: Array of selected row items.
- `selectedIds`: Array of selected row IDs (as strings).

### `deleteAction` [#deleteaction]

This event is triggered when the user presses the delete keyboard shortcut (default: Delete key) and `rowsSelectable` is set to `true`. The handler receives three parameters: the focused row, selected items, and selected IDs. Note: The component does not automatically remove data; the handler must implement the delete logic (e.g., removing selected items from the data source).

**Signature**: `delete(row: TableRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>`

- `row`: The currently focused row context, or null if no row is focused.
- `selectedItems`: Array of selected row items.
- `selectedIds`: Array of selected row IDs (as strings).

### `pasteAction` [#pasteaction]

This event is triggered when the user presses the paste keyboard shortcut (default: Ctrl+V/Cmd+V) and `rowsSelectable` is set to `true`. The handler receives three parameters: the focused row, selected items, and selected IDs. The handler must implement the paste logic (e.g., reading from clipboard and inserting data into the table).

**Signature**: `paste(row: TableRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>`

- `row`: The currently focused row context, or null if no row is focused.
- `selectedItems`: Array of selected row items.
- `selectedIds`: Array of selected row IDs (as strings).

### `rowClick` [#rowclick]

This event is fired when the user clicks a table row. The handler receives the clicked row item as its only argument. It reports the click without replacing or suppressing selection — pair it with `rowsSelectable` deliberately, and prefer `selectionDidChange` when what you actually care about is the selection. The event does not fire for clicks on the selection checkbox or on an interactive control (such as a button) inside a cell.

**Signature**: `rowClick(item: any): void`

- `item`: The clicked table row item.

This event is triggered when a table row is clicked. The handler receives the row's data item as its only argument.

`rowClick` reports activation — it does not replace or suppress selection. Row click already runs a selection toggle when `rowsSelectable` is set, and `rowClick` fires alongside that without interfering with it: pair it with `rowsSelectable` deliberately, and prefer [`selectionDidChange`](#selectiondidchange) when what you actually care about is the selection rather than the click itself. `rowClick` does not fire for a click on the selection checkbox, nor for a click on an interactive control (such as a button) inside a cell.

```xmlui copy {4}
<App>
  <Table data='{[...]}' onRowClick="(item) => console.log(item)">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
  </Table>
</App>
```

### `rowDoubleClick` [#rowdoubleclick]

This event is fired when the user double-clicks a table row. The handler receives the clicked row item as its only argument.

**Signature**: `rowDoubleClick(item: any): void`

- `item`: The clicked table row item.

This event is triggered when a table row is double-clicked. The handler receives the row's data item as its only argument.

```xmlui copy {4}
<App>
  <Table data='{[...]}' onRowDoubleClick="(item) => console.log(item)">
    <Column bindTo="name"/>
    <Column bindTo="quantity"/>
  </Table>
</App>
```

### `rowEnter` [#rowenter]

This event is fired when the pointer enters a table row. The handler receives the row item as its only argument. Use it with `rowLeave` to link the table to another view — highlighting the matching point on a chart, or showing the hovered record in a detail panel. Moving between cells of the same row does not re-fire it.

**Signature**: `rowEnter(item: any): void`

- `item`: The hovered table row item.

This event fires when the pointer enters a table row. The handler receives the row's data item as its only argument.

Use it with `rowLeave` to link the table to another view: the table already highlights the hovered row for the user, and these events let the rest of the app react to the same hover — a detail panel, a matching point on a chart, a pin on a map.

Moving between cells within one row does not re-fire the event; only entering and leaving the row itself does.

```xmlui copy {4-5}
<App var.hovered="{null}">
  <Table
    data='{[...]}'
    onRowEnter="(item) => hovered = item"
    onRowLeave="() => hovered = null">
    <Column bindTo="name"/>
  </Table>
</App>
```

Hover a row to see the panel follow it:

```xmlui-pg name="Example: rowEnter and rowLeave"
<App var.hovered="{null}">
  <HStack gap="$space-4">
    <Table
      width="60%"
      data='{[
        { id: 0, name: "Apples", quantity: 5, unit: "pieces", category: "fruits" },
        { id: 1, name: "Bananas", quantity: 6, unit: "pieces", category: "fruits" },
        { id: 2, name: "Carrots", quantity: 100, unit: "grams", category: "vegetables" },
        { id: 3, name: "Spinach", quantity: 1, unit: "bunch", category: "vegetables" },
        { id: 4, name: "Milk", quantity: 10, unit: "liter", category: "dairy" },
      ]}'
      onRowEnter="(item) => hovered = item"
      onRowLeave="() => hovered = null">
      <Column bindTo="name"/>
      <Column bindTo="quantity"/>
      <Column bindTo="unit"/>
    </Table>
    <Card width="40%">
      <Text when="{!hovered}" variant="secondary" value="Hover a row." />
      <Fragment when="{hovered}">
        <Text variant="strong" value="{hovered.name}" />
        <Text value="{hovered.quantity} {hovered.unit}" />
        <Text variant="secondary" value="{hovered.category}" />
      </Fragment>
    </Card>
  </HStack>
</App>
```

### `rowLeave` [#rowleave]

This event is fired when the pointer leaves a table row. The handler receives the row item as its only argument. Pair it with `rowEnter` to clear whatever that event set.

**Signature**: `rowLeave(item: any): void`

- `item`: The table row item the pointer left.

This event fires when the pointer leaves a table row. The handler receives the row's data item as its only argument — the row being left, not the one being entered.

Pair it with `rowEnter` to clear whatever that event set. See the [`rowEnter`](#rowenter) example.

### `scroll` [#scroll]

This event fires as the user scrolls the table. The handler receives an object describing the current scroll state. It is only fired for user-driven scrolls; the table's own programmatic scrolls do not trigger it. Use it together with the `atEnd` flag and the `scrollToBottom()` method to implement follow-newest and read-pause behavior, or with `visibleRange` and `itemCount` to display a visible row range.

**Signature**: `scroll(event: { scrollTop: number, scrollHeight: number, viewportSize: number, atEnd: boolean, visibleRange: { startIndex: number, endIndex: number }, itemCount: number }): void`

- `event`: The scroll state: `scrollTop` (current scroll offset), `scrollHeight` (total scrollable size), `viewportSize` (visible size), and `atEnd` (true when scrolled to within ~1.5px of the bottom), plus `visibleRange` and `itemCount`.

This event fires as the user scrolls the table. The event object includes `scrollTop`, `scrollHeight`, `viewportSize`, `atEnd`, `visibleRange`, and `itemCount`.

It is only fired for user-driven scrolls; the table's own programmatic scrolls do not trigger it. Use `visibleRange` and `itemCount` to display the currently visible range while the user scrolls.

### `selectAllAction` [#selectallaction]

This event is triggered when the user presses the select all keyboard shortcut (default: Ctrl+A/Cmd+A) and `rowsSelectable` is set to `true`. The component automatically selects all rows before invoking this handler. The handler receives three parameters: the currently focused row (if any), all selected items, and all selected IDs.

**Signature**: `selectAll(row: TableRowContext | null, selectedItems: any[], selectedIds: string[]): void | Promise<void>`

- `row`: The currently focused row context, or null if no row is focused. Contains item data, row index, row ID, and selection state.
- `selectedItems`: Array of all selected row items. When selectAll is triggered, this contains all table rows.
- `selectedIds`: Array of all selected row IDs (as strings). When selectAll is triggered, this contains all row IDs.

### `selectionDidChange` [#selectiondidchange]

This event is triggered when the table's current selection (the rows selected) changes. Its parameter is an array of the selected table row items. 

**Signature**: `selectionDidChange(selectedItems: any[]): void`

- `selectedItems`: An array of the selected table row items.

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

### `sortingDidChange` [#sortingdidchange]

This event is fired when the table data sorting has changed. It has two arguments: the column's name and the sort direction. When the column name is empty, the table displays the data list as it received it.

**Signature**: `sortingDidChange(columnName: string, sortDirection: 'asc' | 'desc' | null): void`

- `columnName`: The name of the column being sorted.
- `sortDirection`: The sort direction: 'asc' for ascending, 'desc' for descending, or null for unsorted.

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

### `visibleRangeDidChange` [#visiblerangedidchange]

This event fires when the range of visible table rows changes — whatever caused it: a user scroll, a programmatic scroll, or content growth. Unlike the `scroll` event, it is not suppressed during the table's own programmatic scrolls, because consumers of the visible range care about what is visible, not why it became visible. It fires only when the range actually shifts (deduplicated by value).

**Signature**: `visibleRangeDidChange(range: { startIndex: number, endIndex: number }): void`

- `range`: The visible range: `startIndex` (first visible row index) and `endIndex` (last visible row index), inclusive, in the table's current row order.

This event fires when the visible row range changes. It also fires for non-user-scroll changes, such as initial measurement or programmatic scrolling.

### `willSort` [#willsort]

This event is fired before the table data is sorted. It has two arguments: the column's name and the sort direction. When the method returns a literal `false` value (and not any other falsy one), the method indicates that the sorting should be aborted.

**Signature**: `willSort(columnName: string, sortDirection: 'asc' | 'desc'): boolean | void`

- `columnName`: The name of the column about to be sorted.
- `sortDirection`: The intended sort direction: 'asc' for ascending or 'desc' for descending.

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

## Exposed Methods [#exposed-methods]

### `clearSelection` [#clearselection]

This method clears the list of currently selected table rows.

**Signature**: `clearSelection(): void`

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

### `getItemCount` [#getitemcount]

This method returns the number of rows in the table's current virtualized row model. For an unpaginated table, this is the number of rows supplied through `data` or `items`; for a paginated table, this is the number of rows on the current page.

**Signature**: `getItemCount(): number`

Returns the number of rows in the table's current virtualized row model. Use this with `getVisibleRange()` to build a display such as `234-245 of 1000`.

For paginated tables, this count is the number of rows in the current page's virtualized row model.

### `getSelectedIds` [#getselectedids]

This method returns the list of currently selected table rows IDs.

**Signature**: `getSelectedIds(): Array<string>`

(See the [example](#clearselection) at the `clearSelection` method)

### `getSelectedItems` [#getselecteditems]

This method returns the list of currently selected table rows items.

**Signature**: `getSelectedItems(): Array<TableRowItem>`

(See the [example](#clearselection) at the `clearSelection` method)

### `getVisibleRange` [#getvisiblerange]

This method returns the currently visible row range as an object with `startIndex` and `endIndex` (inclusive, in the table's current row order). Returns `{ startIndex: -1, endIndex: -1 }` when the table is empty or not yet measured. The pull-style counterpart of the `visibleRangeDidChange` event.

**Signature**: `getVisibleRange(): { startIndex: number, endIndex: number }`

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

### `preserveStateOnNextDataRefresh` [#preservestateonnextdatarefresh]

Preserve the current table view state for the next data refresh, even when dataRefreshMode is `reset`. Optional operation metadata controls post-refresh scroll behavior.

**Signature**: `preserveStateOnNextDataRefresh(options?: { operation?: "insert" | "delete" | "update", scrollTarget?: string | number | "first-inserted" | "preserve" }): void`

### `scrollToBottom` [#scrolltobottom]

This method scrolls the table to the bottom.

**Signature**: `scrollToBottom(): void`

See the [`getVisibleRange`](#getvisiblerange) example for displaying the visible range while scrolling.

### `scrollToId` [#scrolltoid]

This method scrolls the table to a specific row. The method accepts a row ID as a parameter.

**Signature**: `scrollToId(id: string): void`

- `id`: The ID of the row to scroll to.

See the [`getVisibleRange`](#getvisiblerange) example.

### `scrollToIndex` [#scrolltoindex]

This method scrolls the table to a specific row index. The method accepts an index as a parameter.

**Signature**: `scrollToIndex(index: number): void`

- `index`: The row index to scroll to.

See the [`getVisibleRange`](#getvisiblerange) example.

### `scrollToTop` [#scrolltotop]

This method scrolls the table to the top.

**Signature**: `scrollToTop(): void`

See the [`getVisibleRange`](#getvisiblerange) example.

### `selectAll` [#selectall]

This method selects all the rows in the table. This method has no effect if the rowsSelectable property is set to `false`.

**Signature**: `selectAll(): void`

(See the [example](#clearselection) at the `clearSelection` method)

### `selectId` [#selectid]

This method selects the row with the specified ID. This method has no effect if the `rowsSelectable` property is set to `false`. The method argument can be a single id or an array of them.

**Signature**: `selectId(id: string | Array<string>): void`

- `id`: The ID of the row to select, or an array of IDs to select multiple rows.

(See the [example](#clearselection) at the `clearSelection` method)

## Parts [#parts]

The component has some parts that can be styled through layout properties and theme variables separately:

- **`pagination`**: The pagination controls container.
- **`table`**: The main table container.

## Styling [#styling]

### Theme Variables [#theme-variables]

| Variable | Default Value (Light) | Default Value (Dark) |
| --- | --- | --- |
| [backgroundColor-column-Table--hover](/docs/styles-and-themes/common-units/#color) | $color-surface-100 | $color-surface-100 |
| [backgroundColor-evenRow-Table](/docs/styles-and-themes/common-units/#color) | $backgroundColor-row-Table | $backgroundColor-row-Table |
| [backgroundColor-heading-Table](/docs/styles-and-themes/common-units/#color) | $color-surface-100 | $color-surface-100 |
| [backgroundColor-heading-Table--active](/docs/styles-and-themes/common-units/#color) | $color-surface-300 | $color-surface-300 |
| [backgroundColor-heading-Table--hover](/docs/styles-and-themes/common-units/#color) | $color-surface-200 | $color-surface-200 |
| [backgroundColor-oddRow-Table](/docs/styles-and-themes/common-units/#color) | $color-surface-100 | $color-surface-100 |
| [backgroundColor-pagination-Table](/docs/styles-and-themes/common-units/#color) | $backgroundColor-Table | $backgroundColor-Table |
| [backgroundColor-pinnedCell-Table](/docs/styles-and-themes/common-units/#color) | $color-surface-50 | $color-surface-50 |
| [backgroundColor-pinnedCell-Table--hover](/docs/styles-and-themes/common-units/#color) | $backgroundColor-row-Table--hover | $backgroundColor-row-Table--hover |
| [backgroundColor-row-Table](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [backgroundColor-row-Table--hover](/docs/styles-and-themes/common-units/#color) | $color-primary-50 | $color-primary-50 |
| [backgroundColor-selected-Table](/docs/styles-and-themes/common-units/#color) | $color-primary-100 | $color-primary-100 |
| [backgroundColor-selected-Table--hover](/docs/styles-and-themes/common-units/#color) | $backgroundColor-row-Table--hover | $backgroundColor-row-Table--hover |
| [backgroundColor-selectionCell-Table](/docs/styles-and-themes/common-units/#color) | $backgroundColor-pinnedCell-Table | $backgroundColor-pinnedCell-Table |
| [backgroundColor-selectionCell-Table--hover](/docs/styles-and-themes/common-units/#color) | $backgroundColor-row-Table--hover | $backgroundColor-row-Table--hover |
| [backgroundColor-Table](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [border-cell-Table](/docs/styles-and-themes/common-units/#border) | 1px solid $borderColor | 1px solid $borderColor |
| [border-Table](/docs/styles-and-themes/common-units/#border) | 0px solid transparent | 0px solid transparent |
| [borderBottom-cell-Table](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottom-last-row-Table](/docs/styles-and-themes/common-units/#border) | $borderBottom-cell-Table | $borderBottom-cell-Table |
| [borderBottom-Table](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderBottomColor-cell-Table](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomColor-Table](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderBottomStyle-cell-Table](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomStyle-Table](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderBottomWidth-cell-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderBottomWidth-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderColor-cell-Table](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Checkbox--hover](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderColor-Table](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderEndEndRadius-cell-Table](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndEndRadius-Table](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-cell-Table](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderEndStartRadius-Table](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderHorizontal-cell-Table](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontal-Table](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderHorizontalColor-cell-Table](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalColor-Table](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderHorizontalStyle-cell-Table](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalStyle-Table](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderHorizontalWidth-cell-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderHorizontalWidth-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeft-cell-Table](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeft-Table](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderLeftColor-cell-Table](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftColor-Table](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderLeftStyle-cell-Table](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftStyle-Table](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderLeftWidth-cell-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderLeftWidth-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRadius-Table](/docs/styles-and-themes/common-units/#border-rounding) | $borderRadius | $borderRadius |
| [borderRight-cell-Table](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRight-Table](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderRightColor-cell-Table](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightColor-Table](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderRightStyle-cell-Table](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightStyle-Table](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderRightWidth-cell-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderRightWidth-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderStartEndRadius-cell-Table](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartEndRadius-Table](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-cell-Table](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStartStartRadius-Table](/docs/styles-and-themes/common-units/#border-rounding) | *none* | *none* |
| [borderStyle-cell-Table](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderStyle-Table](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTop-cell-Table](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTop-Table](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderTopColor-cell-Table](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopColor-Table](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderTopStyle-cell-Table](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopStyle-Table](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderTopWidth-cell-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderTopWidth-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVertical-cell-Table](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVertical-Table](/docs/styles-and-themes/common-units/#border) | *none* | *none* |
| [borderVerticalColor-cell-Table](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalColor-Table](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [borderVerticalStyle-cell-Table](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalStyle-Table](/docs/styles-and-themes/common-units/#border-style) | *none* | *none* |
| [borderVerticalWidth-cell-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderVerticalWidth-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-cell-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [borderWidth-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [fontSize-checkbox-Table](/docs/styles-and-themes/common-units/#size-values) | $fontSize | $fontSize |
| [fontSize-heading-Table](/docs/styles-and-themes/common-units/#size-values) | $fontSize-tiny | $fontSize-tiny |
| [fontSize-row-Table](/docs/styles-and-themes/common-units/#size-values) | $fontSize-sm | $fontSize-sm |
| [fontWeight-heading-Table](/docs/styles-and-themes/common-units/#fontWeight) | $fontWeight-bold | $fontWeight-bold |
| [fontWeight-row-Table](/docs/styles-and-themes/common-units/#fontWeight) | *none* | *none* |
| [outlineColor-heading-Table--focus](/docs/styles-and-themes/common-units/#color) | $outlineColor--focus | $outlineColor--focus |
| [outlineOffset-heading-Table--focus](/docs/styles-and-themes/common-units/#size-values) | $outlineOffset--focus | $outlineOffset--focus |
| [outlineStyle-heading-Table--focus](/docs/styles-and-themes/common-units/#border) | $outlineStyle--focus | $outlineStyle--focus |
| [outlineWidth-heading-Table--focus](/docs/styles-and-themes/common-units/#size-values) | $outlineWidth--focus | $outlineWidth--focus |
| [padding-cell-Table](/docs/styles-and-themes/common-units/#size-values) | $space-2 $space-1 $space-2 $space-2 | $space-2 $space-1 $space-2 $space-2 |
| [padding-heading-Table](/docs/styles-and-themes/common-units/#size-values) | $space-2 $space-1 $space-2 $space-2 | $space-2 $space-1 $space-2 $space-2 |
| [paddingBottom-cell-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingBottom-heading-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-cell-first-Table](/docs/styles-and-themes/common-units/#size-values) | $space-5 | $space-5 |
| [paddingHorizontal-cell-last-Table](/docs/styles-and-themes/common-units/#size-values) | $space-1 | $space-1 |
| [paddingHorizontal-cell-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingHorizontal-heading-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-cell-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingLeft-heading-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-cell-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingRight-heading-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-cell-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingTop-heading-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-cell-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [paddingVertical-heading-Table](/docs/styles-and-themes/common-units/#size-values) | *none* | *none* |
| [textColor-heading-Table](/docs/styles-and-themes/common-units/#color) | $color-surface-500 | $color-surface-500 |
| [textColor-pagination-Table](/docs/styles-and-themes/common-units/#color) | $color-secondary | $color-secondary |
| [textColor-Table](/docs/styles-and-themes/common-units/#color) | *none* | *none* |
| [textTransform-heading-Table](/docs/styles-and-themes/common-units/#textTransform) | uppercase | uppercase |
| userSelect-cell-Table | none | none |
| userSelect-heading-Table | text | text |
| userSelect-row-Table | none | none |

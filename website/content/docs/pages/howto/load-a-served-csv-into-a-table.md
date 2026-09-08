# Load a served CSV into a table

Point a `DataSource` at a CSV URL with `dataType="csv"` and bind `Table` columns to the header row — no upload, no manual parsing.

If a CSV file is already reachable at a URL, you don't need `FileInput` or a parsing library. Set `dataType="csv"` on a `DataSource` and it fetches the file, parses it, and hands you an array of row objects keyed by the header row — the same shape a JSON API would return.

```xmlui-pg copy display name="Load a served CSV into a table" id="load-served-csv"
<App>
  <DataSource id="products" url="/resources/files/sample-products.csv" dataType="csv" />

  <Table data="{products}" testId="productsTable">
    <Column bindTo="name" />
    <Column bindTo="price" />
    <Column bindTo="category" />
    <Column bindTo="inStock" />
  </Table>
</App>
```

The `Column bindTo` values (`name`, `price`, `category`, `inStock`) come straight from `sample-products.csv`'s first line. Change the file and the columns you can bind to change with it.

## Those explicit `Column` elements are optional

When the shape of the file is not known ahead of time, let `Table` infer one column per field from the loaded rows:

```xmlui-pg copy display name="Infer Table columns from the loaded CSV" id="infer-table-columns-from-csv"
<App>
  <DataSource id="products" url="/resources/files/sample-products.csv" dataType="csv" />
  <Table data="{products}" testId="inferredProductsTable" />
</App>
```

The inferred table updates when the `DataSource` finishes loading.

## Data typing

CSV values arrive as strings. Convert the fields you need before binding them to a table when sorting, formatting, or arithmetic must use their data type.

### When the CSV already has an `id`

This file includes a stable `id` column, so Table can sort its rows directly. The transform only converts `price` to a number:

```xmlui-pg copy display name="Sort rows that already have IDs" id="csv-data-typing-existing-ids"
<App>
  <DataSource
    id="products"
    url="/resources/files/sample-products-with-ids.csv"
    dataType="csv"
    transformResult="{data => data.map(row => ({ ...row, price: Number(row.price) }))}"
  />

  <Table
    data="{products}"
    testId="typedProductsWithIdsTable"
  >
    <Column bindTo="name" />
    <Column bindTo="price" type="currency(USD)" canSort="true" />
    <Column bindTo="category" />
  </Table>
</App>
```

The `price` column opts into sorting with `canSort="true"`; clicking its header sorts the numeric values, and the currency renderer receives a number.

Reach for `transformResult` (or `resultSelector` for a simpler nested-path extraction) whenever the raw parsed rows aren't ready to bind as-is — converting types is the most common case for CSV, but the same mechanism reshapes or filters rows too.

---

## Key points

**`dataType="csv"` is a `DataSource` prop, not a component of its own**: the two-line pattern — `DataSource` plus a `Table` bound to it — is the whole recipe. No `FileInput`, no manual `Papa.parse` call.

**Every value is a string until you convert it**: use `transformResult` when a value needs to sort, format, or compute correctly.

## See also

- [Parse uploaded files as CSV or JSON](/docs/howto/parse-uploaded-files-as-csv-or-json) — the upload-and-parse entry point (`FileInput` + `parseAs`), for when the CSV comes from the user rather than a URL
- [Transform nested API responses](/docs/howto/filter-and-transform-data-from-an-api) — more on `resultSelector` and `transformResult`
- [DataSource](/docs/reference/components/DataSource#datatype) — full reference, including `dataType`, `transformResult`, and `resultSelector`

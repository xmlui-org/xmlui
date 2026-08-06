# Use smart Table columns

Use a `Table` without nested `Column` elements when your data already has a useful object shape.
The table can discover fields from the data and infer display types for common values such as numbers, booleans, dates, links, tags, and objects.

## Render a table without writing columns

When a table has no `Column` children, it samples the data and creates one column for each discovered field.

```xmlui-pg display name="Render a table without writing columns" id="render-a-table-without-writing-columns"
<App>
  <Table
    data='{[
      { id: 1, customer: "Ada", total: 123.45, status: "sent" },
      { id: 2, customer: "Grace", total: 87.5, status: "draft" }
    ]}'
  />
</App>
```

## Use columnInference when early rows are incomplete

The default `columnInference="first-n(25)"` can discover fields that appear after the first row.
Use `first-only` when the first row is complete and you want the fastest possible inference.

```xmlui-pg display name="Compare inference sampling modes" id="compare-inference-sampling-modes"
<App>
  <VStack gap="$space-4">
    <Text variant="strong">Default sampling</Text>
    <Table
      testId="default-table"
      data='{[
        { id: 1, customer: "Ada" },
        { id: 2, customer: "Grace", total: 87.5 }
      ]}'
    />

    <Text variant="strong">First row only</Text>
    <Table
      testId="first-only-table"
      columnInference="first-only"
      data='{[
        { id: 1, customer: "Ada" },
        { id: 2, customer: "Grace", total: 87.5 }
      ]}'
    />
  </VStack>
</App>
```

## Turn inference off

Use `columnInference="off"` when you want a table to stay empty unless columns are provided explicitly.
This is useful while wiring strict schemas or when a parent component is responsible for adding columns later.

```xmlui-pg display name="Turn inference off" id="turn-inference-off"
<App>
  <Table
    columnInference="off"
    data='{[
      { id: 1, customer: "Ada", total: 123.45 },
      { id: 2, customer: "Grace", total: 87.5 }
    ]}'
  />
</App>
```

## Use explicit columns when you want control

Existing markup remains backward compatible.
If a `Table` contains `Column` children, those explicit columns override inferred columns.

```xmlui-pg display name="Use explicit columns when you want control" id="use-explicit-columns-when-you-want-control"
<App>
  <Table
    data='{[
      { id: 1, customer: "Ada", total: 123.45, status: "sent" },
      { id: 2, customer: "Grace", total: 87.5, status: "draft" }
    ]}'
  >
    <Column bindTo="customer" header="Customer" />
    <Column bindTo="total" header="Total" type="currency(USD)" />
  </Table>
</App>
```

## Sort inferred columns

Inferred columns are sortable by default when they are bound to data fields.

```xmlui-pg display name="Sort inferred columns" id="sort-inferred-columns"
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

## Key points

**Inference samples row objects**: Pass the row array itself to `data`. If an API returns `{ items: [...] }`, unwrap the `items` array before passing it to `Table`.

**The default is bounded**: `first-n(25)` gives predictable performance while handling sparse first rows.

**Explicit columns still win**: Add `Column` children whenever you need custom headers, selected fields, custom cell markup, or pinned/resizable/layout-specific columns.

---

## See also

- [Table](/docs/reference/components/Table) - the full component reference
- [Column](/docs/reference/components/Column) - explicit column binding and formatting
- [Format table columns by type](/docs/howto/format-table-columns-by-type) - display values with `Column type`

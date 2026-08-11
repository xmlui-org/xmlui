# Align table Column headers

Use `headerHorizontalAlignment` when the header text and sort indicator should align differently from the body cells. The values match the horizontal layout alignment style: `start`, `center`, and `end`.

The alignment applies to the whole header content, so the sort icon moves together with the header text.

## Align header content

Set `alwaysShowSortingIndicator` on the table in examples where you want the icon to be visible before a column is sorted.

```xmlui-pg copy display name="Align Column headers with sort icons"
<App>
  <Table
    data="{[
      { item: 'Notebook', quantity: 24, status: 'Ready' },
      { item: 'Pencil', quantity: 120, status: 'Low' },
      { item: 'Folder', quantity: 18, status: 'Ready' }
    ]}"
    alwaysShowSortingIndicator
  >
    <Column
      bindTo="item"
      header="Item"
      width="{180}"
      headerHorizontalAlignment="start"
    />
    <Column
      bindTo="quantity"
      header="Quantity"
      type="integer"
      width="{160}"
      horizontalAlignment="end"
      headerHorizontalAlignment="center"
    />
    <Column
      bindTo="status"
      header="Status"
      width="{160}"
      headerHorizontalAlignment="end"
    />
  </Table>
</App>
```

## Keep header and cell alignment independent

`horizontalAlignment` controls the cell content. `headerHorizontalAlignment` controls the header content. Use both when numeric or compact values should align one way in the body while the header label uses another visual rhythm.

```xmlui-pg copy display name="Use different header and cell alignment"
<App>
  <Table
    data="{[
      { metric: 'Revenue', actual: 1234.5, target: 1500 },
      { metric: 'Expenses', actual: 820.75, target: 900 }
    ]}"
    alwaysShowSortingIndicator
  >
    <Column bindTo="metric" header="Metric" />
    <Column
      bindTo="actual"
      header="Actual"
      type="currency(USD)"
      horizontalAlignment="end"
      headerHorizontalAlignment="center"
    />
    <Column
      bindTo="target"
      header="Target"
      type="currency(USD)"
      horizontalAlignment="end"
      headerHorizontalAlignment="center"
    />
  </Table>
</App>
```

## Key points

**Header alignment includes the sort icon**: The label and sort indicator are aligned together as one header content group.

**Body alignment stays separate**: Use `horizontalAlignment` for cell values and `headerHorizontalAlignment` for header content.

**Use the same alignment vocabulary**: `start`, `center`, and `end` follow the same style as horizontal layout alignment values.

---

## See also

- [Column](/docs/reference/components/Column) - all supported column properties
- [Sort a table by a computed value](/docs/howto/sort-a-table-by-a-computed-value) - customize table sorting behavior
- [Auto-size column widths with star](/docs/howto/auto-size-column-widths-with-star) - manage table column sizing

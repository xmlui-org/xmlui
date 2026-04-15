# Modify a value reported in a Column

Format or replace the raw cell value by adding child content to a `Column` — use an inline expression for simple transforms or embed a component for richer output.

A `Column` with no children renders its `bindTo` value as plain text. Add children to take full control: an expression wrapped in curly braces for formatting, or a component tag to render icons, badges, or buttons. Both approaches have access to `$item` (the full row object) and `$cell` (the bound column value).

```xmlui-pg noHeader
---app
<App>
  <Test />
</App>
---comp display
<Component name="Test">
  <DataSource
    id="invoices_with_badges"
    url="/resources/files/invoices.json"
    transformResult="{data => data.slice(0,5)}"
  />
  <Table data="{invoices_with_badges}">
    <Column bindTo="invoice_number" /> <!-- empty tag for bound column -->
    <Column bindTo="client" />
    <Column bindTo="issue_date" />
    <Column bindTo="due_date" />
    <Column bindTo="paid_date" />
    <Column header="total" horizontalAlignment="end">
      ${$item.total.toFixed(2)} <!-- unbound column, prepend $ to the $item value -->
    </Column>
    <Column header="status">
        <StatusBadge status="{$item.status}" /> <!-- embed component, pass value -->
    </Column>
  </Table>
</Component>
---comp display
<Component
    name="StatusBadge"
    var.statusColors="{{
        draft: { background: '#f59e0b', label: 'white' },
        sent: { background: '#3b82f6', label: 'white' },
        paid: { background: '#10b981', label: 'white' }
    }}"
>
    <Badge
        value="{$props.status}"
        colorMap="{statusColors}"
        variant="pill"
    />
</Component>
```

## Key points

**Use inline text expressions for simple formatting**: Writing `${$item.total.toFixed(2)}` directly inside `<Column>` renders formatted text without any extra component. Any JavaScript expression works — number formatting, date conversion, string concatenation, ternary values.

**`$item` is the full row object; `$cell` is the bound column value**: Both are available in every Column template. Use `$item` when you need fields other than the bound one (e.g. driving a color from a sibling property). Use `$cell` as shorthand when you only need the column's own value.

**Embed components for structured output**: Replace the text node with a component tag — `<Badge>`, `<Icon>`, `<HStack>`, or a custom component — to render anything beyond plain text. The component receives `$item` values via its props.

**Extract complex cell content into a named component**: When a cell template grows (like `StatusBadge` here), pull it into a separate `---comp` block. This keeps the `Table` markup readable and lets you iterate on the cell design independently.

**`bindTo` still enables sorting even with a custom template**: Keep `bindTo` on the `Column` so users can click the header to sort. For the unbound `total` column, omit `bindTo` and sort is simply not available for that column.

---

## See also

- [Render a custom cell with components](/docs/howto/render-a-custom-cell-with-components) — more examples with Badge, Icon, and Button in cells
- [Highlight rows conditionally](/docs/howto/highlight-rows-conditionally) — vary cell colors based on row data values
- [Sort a table by a computed value](/docs/howto/sort-a-table-by-a-computed-value) — sort by a derived field alongside custom cell templates
---app
<App>
  <Test />
</App>
---comp display
<Component name="Test">
  <DataSource
    id="invoices_with_badges"
    url="/resources/files/invoices.json"
    transformResult="{data => data.slice(0,5)}"
  />
  <Table data="{invoices_with_badges}">
    <Column bindTo="invoice_number" />         <!-- empty tag for bound column -->
    <Column bindTo="client" />
    <Column bindTo="issue_date" />
    <Column bindTo="due_date" />
    <Column bindTo="paid_date" />
    <Column header="total" horizontalAlignment="end">
      ${$item.total.toFixed(2)}             <!-- unbound column, prepend $ to the $item value -->
    </Column>
    <Column header="status">
        <StatusBadge status="{$item.status}" />  <!-- embed component, pass value -->
    </Column>
  </Table>
</Component>
---comp display
<Component
    name="StatusBadge"
    var.statusColors="{{
        draft: { background: '#f59e0b', label: 'white' },
        sent: { background: '#3b82f6', label: 'white' },
        paid: { background: '#10b981', label: 'white' }
    }}"
>
    <Badge
        value="{$props.status}"
        colorMap="{statusColors}"
        variant="pill"
    />
</Component>
```

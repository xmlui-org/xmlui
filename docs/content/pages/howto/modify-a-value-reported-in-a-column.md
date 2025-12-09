# Modify a value reported in a Column

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
    <Column bindTo="invoice_number" />         <!-- empty tag for bound column -->
    <Column bindTo="client" />
    <Column bindTo="issue_date" />
    <Column bindTo="due_date" />
    <Column bindTo="paid_date" />
    <Column header="total">
      ${$item.total}             <!-- unbound column, prepend $ to the $item value -->
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

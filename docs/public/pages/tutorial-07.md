# Invoices

Here is the app's `Invoices` page, with a cached subset of data. To view the table full-width, and optionally make changes, use the <img src="/resources/pg-popout.svg" alt="" class="_htmlImage_1usjo_351" style="display: inline;"> icon to pop out to the full XMLUI playground.


```xmlui-pg
---app display
<App>
  <Invoices />
</App>
---comp
<Component
    name="Invoices"
>
    <DataSource
        id="invoices"
        url="/resources/files/invoices.json"
        transformResult="{(data) => data.slice(0, 10)}"
        method="GET"
    />

    <Theme maxWidth-ModalDialog="50%">
        <ModalDialog id="detailsDialog">
            <InvoiceDetails details="{$params[0]}" />
        </ModalDialog>
    </Theme>

    <HStack>
        <H1>Invoices</H1>
        <SpaceFiller />
        <Button enabled="{false}" label="Create Invoice" onClick="navigate('/invoices/new')" />
    </HStack>

    <Table data="{invoices}">
        <Column canSort="true" bindTo="invoice_number" />
        <Column canSort="true" bindTo="client" />
        <Column canSort="true" bindTo="issue_date" />
        <Column canSort="true" bindTo="due_date" />
        <Column canSort="true" bindTo="paid_date" />
        <Column canSort="true" header="total">
            ${$item.total}
        </Column>
        <Column canSort="true" header="Status">
            <StatusBadge status="{$item.status}" />
        </Column>
        <Column header="Details">
            <Icon name="doc-outline" />
        </Column>
    </Table>

</Component>
---comp
<Component
    name="StatusBadge"
    var.statusColors="{{
        draft: { background: '#f59e0b', label: 'white' },
        sent: { background: '#3b82f6', label: 'white' },
        paid: { background: '#10b981', label: 'white' }
    }}"
>
    <Badge
        enabled="{$props.enabled}"
        value="{$props.status}"
        colorMap="{statusColors}"
        variant="pill"
    />
</Component>
```

Here is the `Invoices` component. The `Create Invoice` button is disabled for this part of the demo.

```xmlui /id="invoices"/ /url=/ /transformResult/ /ModalDialog id="detailsDialog"/ /InvoiceDetails/ /navigate/ /StatusBadge/ /id="detailsDialog"/ /data="{invoices}"/ /onClick="detailsDialog.open($item)"/ /Create Invoice/
<Component name="Invoices">

    <DataSource
        id="invoices"
        url="/resources/files/invoices.json"
        transformResult="{(data) => data.slice(0, 10)}"
        method="GET"
    />

    <Theme maxWidth-ModalDialog="50%">
        <ModalDialog id="detailsDialog">
            <InvoiceDetails details="{$params[0]}" />
        </ModalDialog>
    </Theme>

    <HStack>
        <H1>Invoices</H1>
        <SpaceFiller />
        <Button enabled="false" label="Create Invoice" onClick="navigate('/invoices/new')" />
    </HStack>

    <Table data="{invoices}">
        <Column canSort="true" bindTo="invoice_number" />
        <Column canSort="true" bindTo="client" />
        <Column canSort="true" bindTo="issue_date" />
        <Column canSort="true" bindTo="due_date" />
        <Column canSort="true" bindTo="paid_date" />
        <Column canSort="true" header="total">
            ${$item.total}
        </Column>
        <Column canSort="true" header="Status">
            <StatusBadge enabled="{false}" status="{$item.status}" />
        </Column>
        <Column header="Details">
            <Icon name="doc-outline" onClick="detailsDialog.open($item)" />
        </Column>
    </Table>

</Component>
```

The `id` attribute of the [DataSource](/components/DataSource) is set to `invoices` which matches the `data` attribute of the [Table](/components/Table). The `url` here refers to a static JSON file, normally it is the `/api/invoices` endpoint. The `transformResult` attribute reduces the sample data for our purposes here, normally it isn't used.

The id attribute of the [ModalDialog](/components/ModalDialog) maps to the `onClick` handler of the `Details` column. That handler is also disabled for this part of the demo. We'll see later how, when clicked, it loads the `InvoiceDetails` component into a `ModalDialog`. Note that one way to set the `maxWidth-ModalDialog` is to wrap the `ModelDialog` in a [Theme](/components/Theme).

When enabled, the `CreateInvoice` button uses the global function `navigate` to go to the page defined by the `CreateInvoice` component.

Two of the columns in the table, `Status` and `Details`, show how a [Column](/components/Column) can contain XMLUI markup that may include user-defined (`StatusBadge`) and/or built-in (`Icon`) components.



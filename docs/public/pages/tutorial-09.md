# Invoice Details

We've seen that the `Invoices` [Table](/components/Table) includes a `Details` [Column](/components/Column) with an icon. Clicking the icon opens a [ModalDialog](/components/ModalDialog) and sends it the current row of the table as `$item`.

```xmlui /detailsDialog/
<Table data="{invoices}">
    <Column  bindTo="invoice_number" />
    <Column  bindTo="client" />
    <Column  bindTo="issue_date" />
    <Column  bindTo="due_date" />
    <Column  bindTo="paid_date" />
    <Column  header="total">
        ${$item.total}
    </Column>
    <Column  header="Status">
        <StatusBadge status="{$item.status}" />
    </Column>
    <Column canSort="{false}" header="Details">
        <Icon name="doc-outline" onClick="detailsDialog.open($item)" />
    </Column>
</Table>
```

```xmlui /detailsDialog/
<ModalDialog id="detailsDialog">
  <InvoiceDetails details="{$params[0]}" />
</ModalDialog>
```

The `ModalDialog` wraps an `InvoiceDetails` component which displays an invoice and enables editing. Click the `Details` icon to open the viewer/editor.

```xmlui-pg noHeader height="500px"
---app
<App>
  <Table gap="0" data="{[window.sampleInvoice]}">
    <Column canSort="{false}" bindTo="invoice_number" />
    <Column canSort="{false}" bindTo="client" />
    <Column canSort="{false}" bindTo="issue_date" />
    <Column canSort="{false}" bindTo="due_date" />
    <Column canSort="{false}" bindTo="paid_date" />
    <Column canSort="{false}" header="total">
      ${$item.total}
    </Column>
    <Column canSort="{false}" header="Status">
      <StatusBadge status="{$item.status}" />
    </Column>
    <Column canSort="{false}" header="Details">
      <Icon name="doc-outline" onClick="detailsDialog.open($item)" />
    </Column>
  </Table>

  <Theme
    maxWidth-ModalDialog="50%"
    backgroundColor-overlay-ModalDialog="rgba(0,0,0,0.5)">
    <ModalDialog id="detailsDialog">
      <InvoiceDetails details="{$params[0]}" />
    </ModalDialog>
  </Theme>
</App>
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
        value="{$props.status}"
        colorMap="{statusColors}"
        variant="pill"
    />
</Component>
---comp
<Component name="InvoiceDetails">

    <variable name="details" value="{$props.details}" />

    <Form>

        <Table width="100%" data="{[details]}">
            <Column canSort="{false}" bindTo="invoice_number" />
            <Column canSort="{false}" bindTo="client" />
            <Column canSort="{false}" bindTo="issue_date" />
            <Column canSort="{false}" bindTo="due_date" />
            <Column canSort="{false}" header="Status">
                <StatusBadge status="{$item.status}" />
            </Column>
        </Table>


        <VStack gap="0">
            <Text>Notes:</Text>
            <FormItem bindTo="notes" initialValue="{window.coalesce(details.notes)}" />
        </VStack>

        <VStack gap="0">
            <Text>Status:</Text>
            <FormItem type="select" bindTo="status" initialValue="{details.status}" enabled="{details.status !== 'paid'}">
                <Option label="sent"  value="sent" />
                <Option label="paid"  value="paid" />
                <Option label="draft" value="draft" />
                <Option value="{$item.name}" label="{$item.name}" />
            </FormItem>
        </VStack>


        <Table width="100%" data="{JSON.parse(details.items)}">
            <Column bindTo="name" />
            <Column bindTo="quantity" />
            <Column bindTo="total">
                ${$item.total}
            </Column>
            <Column header="price">
                ${$item.price}
            </Column>
        </Table>

        <event name="submit">
            <APICall
                url="https://httpbin.org/post"
                method="POST"
                inProgressNotificationMessage="Updating invoice..."
                completedNotificationMessage="Invoice updated successfully"
                body="{
                    {
                    number: details.invoice_number,
                    status: $param.status,
                    notes: $param.notes
                    }
                  }"
                  onSuccess="Actions.navigate('/invoices')"
            />
        </event>

    </Form>

</Component>
```

Here's the `InvoiceDetails` component.

```xmlui
<Component name="InvoiceDetails">
    <Table width="100%" data="{[$props.details]}">
        <Column canSort="{false}" bindTo="invoice_number" />
        <Column canSort="{false}" bindTo="client" />
        <Column canSort="{false}" bindTo="issue_date" />
        <Column canSort="{false}" bindTo="due_date" />
        <Column canSort="{false}" header="Status">
            <StatusBadge status="{$item.status}" />
        </Column>
    </Table>
    <Form submitUrl="/api/invoices/{$props.details.invoice_number}"
          submitMethod="PUT"
    >
        <FormItem
           label="Notes"
           bindTo="notes"
           initialValue="{window.coalesce($props.details.notes)}" />
        <FormItem label="Status" bindTo="status"
          initialValue="{$props.details.status}"
          type="select"
          enabled="{$props.details.status !== 'paid'}"
        >
            <Option label="sent"  value="sent" />
            <Option label="paid"  value="paid" />
            <Option label="draft" value="draft" />
        </FormItem>
        <Table data="{JSON.parse($props.details.items)}">
            <Column bindTo="name" />
            <Column bindTo="quantity" />
            <Column bindTo="total">
                ${$item.total}
            </Column>
            <Column header="price">
                ${$item.price}
            </Column>
        </Table>
    </Form>
</Component>
```

There are two `Table`s. The first has only one row to report the top-level details. Since `$props.details` is an object, not an array, we wrap it in square brackets (`[ ]`) to provide the array that `Table` expects.

The second `Table` reports one row per lineitem. The Invoices app chooses not to make lineitems editable. The editable fields are `notes` and `status`.

The `status` field uses `FormItem type="select"`. It's disabled for statuses other than `paid`, so the operator can mark a `sent` invoice as `paid` but not vice versa.

The [APICall](/component/APICall) is triggered by the submit event. Its `onSuccess` handler uses [Actions.navigate](/globals#navigate) to return to the `Invoices` page.

In other contexts you use `ModalDialog`'s `close()` method, but when a `Form` is wrapped in a `ModalDialog`, the form's submit and cancel buttons both close the dialog.

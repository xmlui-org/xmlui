# Create Invoice

Here's the `Create Invoice` form, using cached data for clients and products. The `Save` button is wired to a dummy API endpoint, try it as you explore the form to see how validation works when no client is selected, and/or when no line items are added.

```xmlui-pg
---app display
<App>
  <CreateInvoice />
</App>
---comp
<Component name="CreateInvoice">
  <DataSource id="clients" url="/resources/files/clients.json" method="GET" />

  <DataSource id="products" url="/resources/files/products.json" method="GET" />

  <Form
    id="invoiceForm"
    onCancel="invoiceForm.reset()">
    <Card>
      <H1>Create New Invoice</H1>

        <FlowLayout>

        <Card border="none" width="50%" padding="0">
          <FormItem
            type="select"
            placeholder="select client"
            bindTo="client"
            label="Client"
            required="true"
          >
            <Items data="{clients}">
              <Option value="{$item.name}" label="{$item.name}" />
            </Items>
          </FormItem>
        </Card>

        <Card border="none" width="25%" padding="0">
          <FormItem type="datePicker" dateFormat="yyyy-MM-dd" initialValue="{ formatToday() }"
            bindTo="issueDate" label="Issue date" />
        </Card>

        <Card border="none" width="25%" padding="0">
          <FormItem type="datePicker" dateFormat="yyyy-MM-dd" initialValue="{ formatToday(30) }"
            bindTo="dueDate" label="Due date" />
        </Card>

      </FlowLayout>

      <H2>Line Items</H2>
      <FlowLayout fontWeight="bold" backgroundColor="$color-surface-100" padding="$space-2">
        <Text width="25%">Product/Service</Text>
        <Text width="25%">Description</Text>
        <Text width="12%">Quantity</Text>
        <Text width="12%">Price</Text>
        <Text width="12%">Amount</Text>
      </FlowLayout>

      <FormItem
        bindTo="lineItems"
        type="items"
        id="lineItems"
        required="true"
        onValidate="(value) => Array.isArray(value) && value.length > 0 && value.every(item => item.product)"
        requiredInvalidMessage="At least one line item is required."
      >
        <FlowLayout
           width="100%"
          verticalAlignment="center"
          gap="$space-2"
        >
          <DataSource
            id="productDetails"
            url="/resources/files/products.json"
            when="{$item.product != null}"
            method="GET"
            transformResult="{(data) => data.filter(product => product.name === $item.product)}"
          />
          <FormItem
            bindTo="product"d
            type="select"
            placeholder="select product"
            width="25%"
          >
            <Items data="{products}">
              <Option value="{$item.name}" label="{$item.name}" />
            </Items>
          </FormItem>

          <Text width="25%">{ productDetails.value[0].description }</Text>
          <FormItem width="12%" bindTo="quantity"               type="number"   initialValue="1" minValue="1" />
          <FormItem width="12%" bindTo="price"  startText="$"                   initialValue="{ productDetails.value[0].price }" />
          <FormItem width="12%" bindTo="amount" startText="$"   enabled="false" initialValue="{ $item.price ? $item.quantity * $item.price : '' } " />
          <Button width="2rem" onClick="lineItems.removeItem($itemIndex)">X</Button>

        </FlowLayout>
      </FormItem>
      <HStack>
        <Button onClick="lineItems.addItem()">
          Add Item
        </Button>
        <SpaceFiller />
        <Text>
         Total: ${ ($data.lineItems || []).reduce((sum, item) => sum + (item.amount || 0), 0) }
        </Text>
      </HStack>
    </Card>
    <event name="submit">
      <APICall
        url="https://httpbin.org/post"
        method="POST"
        inProgressNotificationMessage="Saving invoice..."
        completedNotificationMessage="Invoice saved successfully"
        body="{
          {
          client: $param.client,
          issueDate: $param.issueDate,
          dueDate: $param.dueDate,
          total: ($param.lineItems || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
          items: JSON.stringify($param.lineItems || [])
          }
        }"
        onSuccess="Actions.navigate('/invoices')"
      />
    </event>

  </Form>
</Component>
```

The `<CreateInvoice>` component encapsulates all the form logic. Let's review the key points.

## Data sources

As with `Invoices` we are again using stored data, the real API endpoints are `/clients` and `/products`.

```xmlui
<Component name="CreateInvoice">
  <DataSource id="clients" url="/resources/files/clients.json" method="GET" />
  <DataSource id="products" url="/resources/files/products.json" method="GET" />
```


## The Form tag

This [Form](/components/Form) contains a dropdown menu of products, two date pickers, and an expandable set of lineitems. These parts separately feed into the form's `$data` [context variable](/context-variables) which accumulates the JSON payload sent to the server on submit with successful validation.

```xmlui
<Form
    id="invoiceForm"
    onCancel="invoiceForm.reset()">
```


## The payload

A valid payload looks like this.

```json
{
  "issueDate": "2025-06-10",
  "dueDate": "2025-07-10",
  "client": "Abstergo Industries",
  "lineItems": [
      { "quantity": "1", "amount": 105, "product": "API Integration", "price": 105 },
      { "quantity": "1", "amount": 115, "product": "Brand Strategy Consulting", "price": 115 }
   ]
}
```

The `Cancel` button resets all of the form's components and empties this data structure.

## Nested FormItems

There is a top-level `FormItem` for `client`, `issue_date`, `due_date`, and `lineItems`. Their `bindTo` attributes name and populate corresponding fields in `$data`.

Nested with within `lineItems` there is a `FormItem` for `product`, `quantity`, `price`, and `amount`. Their `bindTo` attributes name and define slots in an array of `lineItems` that's dynamically built on each click of the `Add Item` button.

```xmlui /<FormItem/
<Card>
  <H1>Create New Invoice</H1>

  <FlowLayout>

  <Card border="none" width="50%" padding="0">
    <FormItem
      type="select"
      placeholder="select client"
      bindTo="client"
      label="Client"
      required="true"
    >
      <Items data="{clients}">
        <Option value="{$item.name}" label="{$item.name}" />
      </Items>
    </FormItem>
  </Card>

  <Card border="none" width="25%" padding="0">
    <FormItem type="datePicker" dateFormat="yyyy/MM/dd" initialValue="{ formatToday() }"
      bindTo="issueDate" label="Issue date" />
  </Card>

  <Card border="none" width="25%" padding="0">
    <FormItem type="datePicker" dateFormat="yyyy/MM/dd" initialValue="{ formatToday(30) }"
      bindTo="dueDate" label="Due date" />
  </Card>

</FlowLayout>

<H2>Line Items</H2>
<FlowLayout fontWeight="bold" backgroundColor="$color-surface-100" padding="$space-2">
  <Text width="20%">Product/Service</Text>
  <Text width="20%">Description</Text>
  <Text width="20%">Quantity</Text>
  <Text width="20%">Price</Text>
  <Text width="20%">Amount</Text>
</FlowLayout>

 <FormItem
  bindTo="lineItems"
  type="items"
  id="lineItems"
  required="true"
  onValidate="(value) => Array.isArray(value) && value.length > 0 && value.every(item => item.product)"
  requiredInvalidMessage="At least one line item is required."
>
  <FlowLayout width="100%"
    verticalAlignment="center">
    <DataSource
      id="productDetails"
      url="/resources/files/products.json"
      when="{$item.product != null}"
      method="GET"
      transformResult="{(data) => data.filter(product => product.name === $item.product)}"
    />
    <FormItem
      bindTo="product"
      type="select"
      placeholder="select product"
      width="20%"
    >
      <Items data="{products}">
        <Option value="{$item.name}" label="{$item.name}" />
      </Items>
    </FormItem>
    <Text width="20%">{ productDetails.value[0].description }</Text>
    <FormItem width="20%" bindTo="quantity"               type="number"   initialValue="1" minValue="1" />
    <FormItem width="20%" bindTo="price"  startText="$"                   initialValue="{ productDetails.value[0].price }" />
    <FormItem width="13%" bindTo="amount" startText="$"   enabled="false" initialValue="{ $item.price ? $item.quantity * $item.price : '' } " />
    <Button width="*" variant="ghost" themeColor="attention" icon="close" onClick="lineItems.removeItem($itemIndex)" />
  </FlowLayout>
</FormItem>
```

<!--

<HStack>
  <Button onClick="lineItems.addItem()">
    Add Item
  </Button>
  <SpaceFiller />
  <Text>
    Total: ${ ($data.lineItems || []).reduce((sum, item) => sum + (item.amount || 0), 0) }
  </Text>
</HStack>
</Card>


    <event name="submit">
      <APICall
        url="https://httpbin.org/post"
        method="POST"
        inProgressNotificationMessage="Saving invoice..."
        completedNotificationMessage="Invoice saved successfully"
        body="{
          {
          client: $param.client,
          issueDate: $param.issueDate,
          dueDate: $param.dueDate,
          total: ($param.lineItems || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
          items: JSON.stringify($param.lineItems || [])
          }
        }"
        onSuccess="Actions.navigate('/invoices')"
      />
    </event>

  </Form>
</Component>
-->

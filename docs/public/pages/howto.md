# How To

These examples answer common questions of the form "How do I do SOMETHING with XMLUI?" The [XMLUI MCP server](https://github.com/xmlui-org/xmlui-mcp) provides two related tools. Agents can call `xmlui-list-howto` to list the entries here and `xmlui-search-howto` to search them.

## Use built-in form validation

```xmlui-pg
---app
<App>
  <Test />
</App>
---api
{}
---comp display
<Component name="Test">

<Form
  data="{{ password: '' }}"
  onSubmit="(data) => console.log('Submitted:', data)"
>
  <FormItem
    label="Password"
    bindTo="password"
    type="password"
    minLength="8"
    lengthInvalidMessage="Password must be at least 8 characters"
  />
</Form>

</Component>
```

## Do custom form validation

```xmlui-pg
---app
<App>
  <Test />
</App>
---api
{}
---comp display
<Component name="Test" var.limit="{100}">

<Form
  data="{{ spending: 0 }}"
  onSubmit="(data) => console.log('Submitted:', data)"
>

  <FormItem
    label="Requested Amount (limit {limit})"
    bindTo="total"
    type="integer"
    onValidate="{ (value) => value > 0 && value <= limit }"
  />
</Form>

</Component>
```

## Make a set of equal-width cards

```xmlui-pg noHeader
---app
<App>
  <Test />
</App>
---api
{
  "apiUrl": "/api",
"initialize": "$state.stats = {
      \"draft_invoices\":6,
      \"outstanding\":3502.9,
      \"paid_invoices\":79,
      \"paid_this_year\":1745.18,
      \"sent_invoices\":43,
      \"total_clients\":30,
      \"total_invoices\":91
  }",
  "operations": {
    "get-stats": {
      "url": "/stats",
      "method": "get",
      "handler": "$state.stats"
    }
  }
}
---comp display
<Component name="Test" >

<DataSource id="stats" url="/api/stats" method="GET" />

  <FlowLayout>
    <InfoCard
      width="*"               <!-- use star sizing -->
      title="Outstanding"
      value="{ stats.value.outstanding }"
    />
    <InfoCard
    width="*"
      title="Paid This Year"
      value="{ stats.value.paid_this_year }"
    />
    <InfoCard
      width="*"
      title="Draft"
      value="{ stats.value.draft_invoices }"

    />
    <InfoCard
      width="*"
      title="Sent"
      value="{ stats.value.sent_invoices }"
    />
  </FlowLayout>

</Component>
---comp display
<Component name="InfoCard">

    <Card width="{$props.width}" borderRadius="8px" boxShadow="$boxShadow-spread">

        <Text>{$props.title}</Text>

        <Text fontWeight="$fontWeight-extra-bold" fontSize="larger">
            { $props.value }
        </Text>
    </Card>

</Component>
```


## Set the initial value of a Select from fetched data

```xmlui-pg
---app
<App>
  <Test />
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.users = [
        {
          id: 1,
          username: 'Coder Gal',
        },
        {
          id: 2,
          username: 'Tech Ninja',
        },
        {
          id: 3,
          username: 'Design Diva',
        },
      ]",
  "operations": {
    "get-users": {
      "url": "/users",
      "method": "get",
      "handler": "$state.users"
    }
  }
}
---comp display
<Component name="Test" var.selectedValue="">

<DataSource
  id="myData"
  url="/api/users"
  onLoaded="(data) => { selectedValue = data[0].id }"
/>

<Select initialValue="{selectedValue}">
  <Items data="{myData}">
    <Option value="{$item.id}" label="{$item.username}" />
  </Items>
</Select>

</Component>
```
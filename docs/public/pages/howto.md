# How To

These examples answer common questions of the form "How do I do SOMETHING with XMLUI?" The [XMLUI MCP server](https://github.com/xmlui-org/xmlui-mcp) provides two related tools. Agents can call `xmlui-list-howto` to list the entries here and `xmlui-search-howto` to search them.

## Delay a DataSource until another DataSource is ready

```xmlui-pg
---app
<App>
  <Test />
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.users_for_ds_dependency =
    [
      { id: 1, name: 'Alice', departmentId: 1 },
      { id: 2, name: 'Bob', departmentId: 2 }
      ];
    $state.departments_with_ds_dependency = [
      { id: 1, name: 'Engineering' },
      { id: 2, name: 'Marketing' }
    ]",
  "operations": {
    "get_users_for_ds_dependency": {
      "url": "/users_for_ds_dependency",
      "method": "get",
      "handler": "delay(1000); return $state.users_for_ds_dependency"
    },
    "get_departments_with_ds_dependency": {
      "url": "/departments_with_ds_dependency",
      "method": "get",
      "handler": "delay(1000); return $state.departments_with_ds_dependency"
    }
  }
}
---comp display
<Component name="Test" var.selectedId="" var.nonce="{0}">

  <DataSource
    id="users_for_ds_dependency"
    url="/api/users_for_ds_dependency"
    inProgressNotificationMessage="Loading users..."
    when="{ nonce > 0 }"
    />

  <DataSource
    id="departments_with_ds_dependency"
    url="/api/departments_with_ds_dependency"
    when="{ users.loaded && nonce > 0 }"
    inProgressNotificationMessage="Loading departments..."
  />

  <Select
    id="usersForDsDepencency"
    data="{users_for_ds_dependency}"
    when="{users_for_ds_dependency.loaded}"
    onDidChange="(newVal) => selectedId = newVal"
  >
    <Items data="{users_for_ds_dependency}">
      <Option value="{$item.id}" label="{$item.name}" />
    </Items>
  </Select>

  <Button
    label="Run"
    onClick="{nonce++}"
  />


</Component>
```

## Hide an element until its DataSource is ready

```xmlui-pg
---app
<App>
  <Test />
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.fruits = [
    { id: 1, name: 'Orange' },
    { id: 2, name: 'Apple' },
    { id: 3, name: 'Pear' },
  ]",
  "operations": {
    "get-fruits": {
      "url": "/fruits",
      "method": "get",
      "handler": "delay(3000); return $state.fruits;"
    }
  }
}
---comp display
<Component name="Test" var.nonce="{0}">

<DataSource
  id="fruits"
  url="/api/fruits?{nonce}"
  inProgressNotificationMessage="Loading fruits"
  when="{nonce > 0}"
  />

<Button
  label="Reload"
  onClick="{nonce++}"
/>

<Fragment when="{fruits.loaded}">
  <Text>Fruits: {fruits.value.length} found</Text>
</Fragment>

</Component>
```


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
"initialize": "$state.dashboard_stats = {
      \"draft_invoices\":6,
      \"outstanding\":3502.9,
      \"paid_invoices\":79,
      \"paid_this_year\":1745.18,
      \"sent_invoices\":43,
      \"total_clients\":30,
      \"total_invoices\":91
  }",
  "operations": {
    "get-dashboard-stats": {
      "url": "/dashboard_stats",
      "method": "get",
      "handler": "$state.dashboard_stats"
    }
  }
}
---comp display
<Component name="Test" >

<DataSource id="dashboard_stats" url="/api/dashboard_stats" method="GET" />

  <FlowLayout>
    <InfoCard
      width="*"               <!-- use star sizing -->
      title="Outstanding"
      value="{ dashboard_stats.value.outstanding }"
    />
    <InfoCard
    width="*"
      title="Paid This Year"
      value="{ dashboard_stats.value.paid_this_year }"
    />
    <InfoCard
      width="*"
      title="Draft"
      value="{ dashboard_stats.value.draft_invoices }"

    />
    <InfoCard
      width="*"
      title="Sent"
      value="{ dashboard_stats.value.sent_invoices }"
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
  "initialize": "$state.users_initial_value = [
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
    "get_users_initial_value": {
      "url": "/users_initial_value",
      "method": "get",
      "handler": "$state.users_initial_value"
    }
  }
}
---comp display
<Component name="Test" var.selectedValue="">

<DataSource
  id="myData"
  url="/api/users_initial_value"
  onLoaded="(data) => { selectedValue = data[0].id }"
/>

<Select initialValue="{selectedValue}">
  <Items data="{myData}">
    <Option value="{$item.id}" label="{$item.username}" />
  </Items>
</Select>

</Component>
```
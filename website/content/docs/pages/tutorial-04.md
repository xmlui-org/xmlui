# InfoCards

The `Dashboard` page opens with a set of infocards. Here is a simplified version of two of them.

```xmlui-pg display name="infocards"
<App
  var.dashboardStats="{
    {  value:  [ { outstanding: 3569, paid_this_year: 1745} ]  }
  }"
>

<HStack>
  <Card>
      <Text>Outstanding</Text>
      <Text>{ dashboardStats.value[0].outstanding } </Text>
  </Card>
  <Card>
      <Text>Paid this year</Text>
      <Text>{ dashboardStats.value[0].paid_this_year } </Text>
  </Card>
</HStack>
</App>
```

>[!INFO]
> The definition of `var.dashboardStats` uses two sets of curly braces. The outer braces enclose the JavaScript expression to be evaluated. The inner braces enclose a literal object that emulates data returned from an API.


In the real app, `dashboardStats` is a [DataSource](/components/DataSource).

```xmlui
<DataSource id="dashboardStats" url="/api/dashboard/stats" method="GET" />
```

It returns a structure like the variable we've defined above: an object with a `value` key that points to a list of objects corresponding to rows in the database.

## A custom Card

There are five infocards on the XMLUI Invoice dashboard. To style them all in a consistent way, the app defines an `InfoCard` that wraps `Card` and `Text`.


```xmlui
<Component name="InfoCard">

    <Card width="{$props.width}" borderRadius="8px" boxShadow="$boxShadow-spread">

        <Text>{$props.title}</Text>

        <Text fontWeight="$fontWeight-extra-bold" fontSize="larger">
            { $props.currency === 'true' ? '$' + $props.value : $props.value }
        </Text>
    </Card>

</Component>
```

 These are in turn wrapped in a `Dashboard` that passes properties to `InfoCard`: `title`, `width`, `value`, and optionally a `currency` flag for `$` formatting.


```xmlui
<Component name="Dashboard">

  <DataSource id="dashboardStats" url="/api/dashboard/stats" method="GET"/>

  <HStack>
    <H1>Dashboard</H1>
    <SpaceFiller/>
    <Button label="Create Invoice" onClick="navigate('/invoices/new')"/>
  </HStack>

  <FlowLayout>
    <InfoCard
      width="20%"
      title="Outstanding"
      value="{ dashboardStats.value[0] }"
      currency='true'
    />
    <InfoCard
      ...
    />
    <InfoCard
      ...
    />
    <InfoCard
      ...
    />
    <InfoCard
      ...
    />

    <Statuses width="50%" title="Statuses"/>

    <MonthlyStatus width="50%" title="Monthly Status"/>

  </FlowLayout>

  <DailyRevenue title="Daily Revenue"/>

</Component>
```

A [user-defined component](/components-intro) like `Dashboard` can define any set of names and values. `InfoCard` receives them in its `$props` [context variable](/context-variables). `InfoCard` is opinionated about `borderRadius` and `boxShadow`. It could also receive these in `$props` but chooses not to. And while it is strongly opinionated about the `borderRadius`, which it hardcodes, it is willing to use the theme variable `$boxShadow-spread` so that setting can be theme-governed.

Here's a more complete version of the row of `InfoCard`s used in the Invoices app.


```xmlui-pg  noHeader
---app display
<App>
  <Dashboard />
</App>
---comp
<Component name="InfoCard">

    <Card width="{$props.width}" borderRadius="8px" boxShadow="$boxShadow-spread">

        <Text>{$props.title}</Text>

        <Text fontWeight="$fontWeight-extra-bold" fontSize="larger">
            { $props.currency === 'true' ? '$' + $props.value : $props.value }
        </Text>
    </Card>

</Component>
---comp
<Component name="Dashboard">

  <variable name="dashboardStats" value="{
    {
      value:
        [
          {
            outstanding: 3569,
            paid_this_year: 1745,
            draft_invoices: 6,
            sent_invoices: 7,
            paid_invoices: 79
          }
        ]
    }
  }" />


  <HStack>
      <InfoCard
          width="20%"
          title="Outstanding"
          value="{ dashboardStats.value[0].outstanding }"
          currency='true'
      />
      <InfoCard
          width="*"
          title="Paid"
          value="{dashboardStats.value[0].paid_this_year}"
          currency='true'
      />
      <InfoCard
          width="*"
          title="Draft"
          value="{dashboardStats.value[0].draft_invoices}"
      />
      <InfoCard
          width="*"
          title="Sent"
          value="{dashboardStats.value[0].sent_invoices}"
      />
      <InfoCard
          width="*"
          title="Paid"
          value="{dashboardStats.value[0].paid_invoices}"
      />
  </HStack>

</Component>
```


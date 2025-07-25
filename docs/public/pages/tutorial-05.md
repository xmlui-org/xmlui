# Charts

The `Dashboard` page continues with a donut chart that visualizes some of the same facts reported using `InfoCard`. We define it as a `Statuses` component whose width and title are defined by its containing `Dashboard` component. Here we'll use it standalone.

```xmlui
<App>
  <Statuses width="50%" title="Statuses" />
</App>
```

`Statuses` uses three critical properties of `DonutChart`.

- `data`: The ubiquitous attribute that refers to data that may be defined literally or, as in this case, via an API call backed by a database query.
- `dataKey`: The object key that holds data.
- `nameKey`: The object key whose value is the data label.

```xmlui /data/ /dataKey/ /nameKey/
<Component name="Statuses">
  <DataSource id="dashboardStats" url="/api/dashboard/stats" method="GET" />
  <Card title="Statuses" height="400px" width="{$props.width}">
    <DonutChart
      data="{
        [
          {
            name: 'sent',
            value: dashboardStats.value[0].sent_invoices
          },
          {
            name: 'draft',
            value: dashboardStats.value[0].draft_invoices
          },
          {
            name: 'paid',
            value: dashboardStats.value[0].paid_invoices
          },
        ]
      }"
      dataKey="value"
      nameKey="name"
    />
  </Card>
</Component>
```

```xmlui-pg  noHeader
---app
<App>
  <Statuses />
</App>
---comp
<Component name="Statuses">
  <DataSource id="dashboardStats" url="/resources/files/dashboard-stats.json" method="GET" />
  <Card title="Statuses" height="400px" width="{$props.width}">
    <DonutChart
      data="{
        [
          {
            name: 'sent',
            value: dashboardStats.value[0].sent_invoices
          },
          {
            name: 'draft',
            value: dashboardStats.value[0].draft_invoices
          },
          {
            name: 'paid',
            value: dashboardStats.value[0].paid_invoices
          },
        ]
      }"
      dataKey="value"
      nameKey="name"
    />
  </Card>
</Component>
```

## Multiseries charts

[PieChart](/components/PieChart) and [DonutChart](/components/DonutChart) work with a single series of data and use `dataKey`. [BarChart](/components/BarChart) and [LineChart](/components/LineChart) can display multiple series denoted by `dataKeys`. We see that in the `MonthlyStatus` chart.

```xmlui display  noHeader /data/ /dataKeys/ /nameKey/
<Component name="MonthlyStatus"">

    <DataSource
        id="monthlyStatus"
        url="/resources/files/monthly-status.json"
        method="GET" />

    <VStack width="{$props.width}">
        <H1>{$props.title}</H1>

        <Card height="400px">
        <BarChart
          layout="horizontal"
          data="{ monthlyStatus }"
          dataKeys="{['paid_revenue', 'sent_revenue']}" nameKey="month"
          stacked="true"
          showLegend="true"
          tickFormatter="{(value) => {
            return window.formatMonth(value);
          }}"
        />
        </Card>
    </VStack>

</Component>
```

```xmlui-pg /data/  noHeader
---app display /data/
<App>
  <MonthlyStatus />
</App>
---comp display /data/
<Component name="MonthlyStatus">

    <DataSource
        id="monthlyStatus"
        url="/resources/files/monthly-status.json"
        method="GET" />

    <VStack width="{$props.width}">
        <H1>{$props.title}</H1>

        <Card height="400px">
        <BarChart
          layout="horizontal"
          data="{ monthlyStatus }"
          dataKeys="{['paid_revenue', 'sent_revenue']}" nameKey="month"
          stacked="true"
          showLegend="true"
          tickFormatter="{(value) => {
            return window.formatMonth(value);
          }}"
        />
        </Card>
    </VStack>

</Component>
```
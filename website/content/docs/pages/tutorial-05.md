# Charts

The `Dashboard` page continues with a donut chart that visualizes some of the same facts reported using `InfoCard`. We define it as a `Statuses` component whose width and title are defined by its containing `Dashboard` component. Here we'll use it standalone.

```xmlui-pg  noHeader
---app display
<App>
  <Statuses />
</App>
---desc
`Statuses` uses three critical properties of `DonutChart`.
- `data`: The ubiquitous attribute that refers to data that may be defined literally or, as in this case, via an API call backed by a database query.
- `dataKey`: The object key that holds data.
- `nameKey`: The object key whose value is the data label.
---comp display copy /dataKey/ /nameKey/
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

[PieChart](/docs/reference/components/PieChart) and [DonutChart](/docs/reference/components/DonutChart) work with a single series of data and use `dataKey`. [BarChart](/docs/reference/components/BarChart) and [LineChart](/docs/reference/components/LineChart) can display multiple series denoted by `yKeys`. We see that in the `MonthlyStatus` chart.

```xmlui-pg /data/ noHeader
---app display /data/ /xKey/ /yKeys/
<App>
  <MonthlyStatus />
</App>
---comp display /data/ /yKeys/
<Component name="MonthlyStatus">

    <DataSource
        id="monthlyStatus"
        url="/resources/files/monthly-status.json"
        method="GET" />

    <VStack width="{$props.width}">
        <H1>{$props.title}</H1>

        <Card height="400px">
        <BarChart
          orientation="horizontal"
          data="{ monthlyStatus }"
          xKey="month"
          yKeys="{['paid_revenue', 'sent_revenue']}"
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
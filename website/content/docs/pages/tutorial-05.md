# Charts

The `Dashboard` page continues with a donut chart that visualizes some of the same facts reported using `InfoCard`. We define it as a `Statuses` component whose width and title are defined by its containing `Dashboard` component. Here we'll use it standalone.

```xmlui-pg  noHeader
---app display
<App>
  <Statuses />
</App>
---desc
`Statuses` wraps `EChart` in a `SimpleDonutChart` component that accepts familiar props: `data`, `dataKey`, and `nameKey`. Internally it builds the ECharts option object.
- `data`: The ubiquitous attribute that refers to data that may be defined literally or, as in this case, via an API call backed by a database query.
- `dataKey`: The object key that holds data.
- `nameKey`: The object key whose value is the data label.
---comp display
<Component name="SimpleDonutChart">
  <EChart
    height="{$props.height || '100%'}"
    option="{
      {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { orient: $props.layout === 'vertical' ? 'vertical' : 'horizontal', bottom: 0 },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          label: { show: true, formatter: '{b}' },
          data: ($props.data || []).map(function(item) {
            return { name: item[$props.nameKey || 'name'], value: item[$props.dataKey || 'value'] }
          })
        }]
      }
    }" />
</Component>
---comp display copy /dataKey/ /nameKey/
<Component name="Statuses">
  <DataSource id="dashboardStats" url="/resources/files/dashboard-stats.json" method="GET" />
  <Card title="Statuses" height="400px" width="{$props.width}">
    <SimpleDonutChart
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

The `SimpleDonutChart` works with a single series of data and uses `dataKey`. A `SimpleBarChart` wrapper can display multiple series denoted by `yKeys`. We see that in the `MonthlyStatus` chart.

```xmlui-pg /data/ noHeader
---app display /data/ /xKey/ /yKeys/
<App>
  <MonthlyStatus />
</App>
---comp display
<Component name="SimpleBarChart">
  <EChart
    height="{$props.height || '100%'}"
    option="{
      {
        tooltip: { trigger: 'axis' },
        legend: $props.showLegend ? {} : undefined,
        grid: { containLabel: true },
        xAxis: $props.orientation === 'horizontal'
          ? { type: 'category', data: ($props.data || []).map(function(d) { return d[$props.xKey] }), axisLabel: { formatter: $props.tickFormatterX } }
          : { type: 'value', axisLabel: { formatter: $props.tickFormatterY } },
        yAxis: $props.orientation === 'horizontal'
          ? { type: 'value', axisLabel: { formatter: $props.tickFormatterY } }
          : { type: 'category', data: ($props.data || []).map(function(d) { return d[$props.xKey] }), axisLabel: { formatter: $props.tickFormatterX } },
        series: ($props.yKeys || []).map(function(k) {
          return {
            type: 'bar',
            name: k,
            stack: ($props.stacked === 'true' || $props.stacked === true) ? 'total' : undefined,
            data: ($props.data || []).map(function(d) { return d[k] })
          }
        })
      }
    }" />
</Component>
---comp display /data/ /yKeys/
<Component name="MonthlyStatus">

    <DataSource
        id="monthlyStatus"
        url="/resources/files/monthly-status.json"
        method="GET" />

    <VStack width="{$props.width}">
        <H1>{$props.title}</H1>

        <Card height="400px">
        <SimpleBarChart
          orientation="horizontal"
          data="{monthlyStatus.value}"
          xKey="month"
          yKeys="{['paid_revenue', 'sent_revenue']}"
          stacked="true"
          showLegend="true"
          tickFormatterX="{(value) => window.formatMonth(value)}"
        />
        </Card>
    </VStack>

</Component>
```

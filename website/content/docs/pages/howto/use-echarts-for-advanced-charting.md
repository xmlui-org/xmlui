# Use ECharts for advanced charting

The [EChart](/docs/reference/extensions/xmlui-echart/EChart) component wraps [Apache ECharts](https://echarts.apache.org/) and accepts any valid ECharts `option` configuration. XMLUI theme colors are automatically injected.

## Basic bar chart

Pass an `option` object with `xAxis`, `yAxis`, and `series` to render a chart.

```xmlui-pg copy id="basic-bar-chart-b6ce"
<App>
  <DataSource id="monthly" url="/resources/files/monthly-status.json" method="GET" />
  <Card height="400px">
    <EChart
      height="100%"
      option="{
        {
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: (monthly.value || []).map(function(d) { return d.month }) },
          yAxis: { type: 'value' },
          series: [{ type: 'bar', data: (monthly.value || []).map(function(d) { return d.paid_revenue }) }]
        }
      }" />
  </Card>
</App>
```

## Pie / donut chart

Set `series.type` to `'pie'` and use `radius` to create a donut.

```xmlui-pg copy id="pie-donut-chart-b72a"
<App>
  <DataSource id="stats" url="/resources/files/dashboard-stats.json" method="GET" />
  <Card height="400px">
    <EChart
      height="100%"
      option="{
        {
          tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
          legend: { bottom: 0 },
          series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            data: [
              { name: 'sent', value: stats.value ? stats.value[0].sent_invoices : 0 },
              { name: 'draft', value: stats.value ? stats.value[0].draft_invoices : 0 },
              { name: 'paid', value: stats.value ? stats.value[0].paid_invoices : 0 }
            ]
          }]
        }
      }" />
  </Card>
</App>
```

## Line chart with multiple series

Use multiple entries in the `series` array to overlay lines.

```xmlui-pg copy id="line-chart-with-multiple-series-b7b6"
<App>
  <DataSource id="monthly" url="/resources/files/monthly-status.json" method="GET" />
  <Card height="400px">
    <EChart
      height="100%"
      option="{
        {
          tooltip: { trigger: 'axis' },
          legend: {},
          xAxis: { type: 'category', data: (monthly.value || []).map(function(d) { return d.month }) },
          yAxis: { type: 'value' },
          series: [
            { type: 'line', name: 'paid', smooth: true, data: (monthly.value || []).map(function(d) { return d.paid_revenue }) },
            { type: 'line', name: 'sent', smooth: true, data: (monthly.value || []).map(function(d) { return d.sent_revenue }) }
          ]
        }
      }" />
  </Card>
</App>
```

## Stacked bar chart

Set `stack` on each series to the same value to stack bars.

```xmlui-pg copy
<App>
  <DataSource id="monthly" url="/resources/files/monthly-status.json" method="GET" />
  <Card height="400px">
    <EChart
      height="100%"
      option="{
        {
          tooltip: { trigger: 'axis' },
          legend: {},
          grid: { containLabel: true },
          xAxis: { type: 'category', data: (monthly.value || []).map(function(d) { return d.month }) },
          yAxis: { type: 'value' },
          series: [
            { type: 'bar', name: 'paid', stack: 'total', data: (monthly.value || []).map(function(d) { return d.paid_revenue }) },
            { type: 'bar', name: 'sent', stack: 'total', data: (monthly.value || []).map(function(d) { return d.sent_revenue }) }
          ]
        }
      }" />
  </Card>
</App>
```

## Wrapping EChart in a reusable component

For common chart patterns, define an XMLUI component that builds the ECharts option from simple props.

```xmlui-pg copy
---app display
<App>
  <DataSource id="monthly" url="/resources/files/monthly-status.json" method="GET" />
  <Card height="400px">
    <SimpleBarChart
      data="{monthly.value}"
      xKey="month"
      yKeys="{['paid_revenue', 'sent_revenue']}"
      stacked="true"
      showLegend="true" />
  </Card>
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
        xAxis: { type: 'category', data: ($props.data || []).map(function(d) { return d[$props.xKey] }) },
        yAxis: { type: 'value' },
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
```

See the [EChart reference](/docs/reference/extensions/xmlui-echart/EChart) for all properties and the [ECharts option docs](https://echarts.apache.org/en/option.html) for the full configuration API.

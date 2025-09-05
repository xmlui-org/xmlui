# Make a set of equal-width cards

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

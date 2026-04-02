# Poll an API at regular intervals

Set `pollIntervalInSeconds` on a `DataSource` to re-fetch data automatically on a timer.

Some dashboards need live data — stock prices, queue lengths, build status. Instead of asking users to click a refresh button, you can set `pollIntervalInSeconds` on a `DataSource`. The component will re-issue the same request at the specified interval and update every bound element when new data arrives.

```xmlui-pg copy display name="Live server metrics dashboard"
---app display
<App>
  <DataSource
    id="metrics"
    url="/api/metrics"
    pollIntervalInSeconds="3"
  />

  <VStack>
    <HStack verticalAlignment="center">
      <Text variant="h5">Server Metrics</Text>
      <Badge variant="vivid" themeColor="success">Live — refreshes every 3 s</Badge>
    </HStack>

    <HStack wrapContent itemWidth="*">
      <Card>
        <VStack>
          <Text variant="caption">CPU Usage</Text>
          <Text variant="h4">{metrics.value?.cpu}%</Text>
        </VStack>
      </Card>
      <Card>
        <VStack>
          <Text variant="caption">Memory</Text>
          <Text variant="h4">{metrics.value?.memory} MB</Text>
        </VStack>
      </Card>
      <Card>
        <VStack>
          <Text variant="caption">Active Connections</Text>
          <Text variant="h4">{metrics.value?.connections}</Text>
        </VStack>
      </Card>
    </HStack>

    <Text variant="caption">Last updated: {metrics.value?.timestamp}</Text>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.tick = 0",
  "operations": {
    "get-metrics": {
      "url": "/metrics",
      "method": "get",
      "handler": "$state.tick++; return { cpu: 30 + Math.floor(Math.random() * 40), memory: 512 + Math.floor(Math.random() * 256), connections: 80 + Math.floor(Math.random() * 120), timestamp: new Date().toLocaleTimeString() }"
    }
  }
}
```

## Key points

**`pollIntervalInSeconds` sets the timer**: Assign a number of seconds and the DataSource will automatically repeat its request on that cadence. Set `0` or remove the prop to stop polling.

**Polling re-triggers the same request**: Every tick re-sends the original `url`, `method`, `queryParams`, and `headers`. If those values use reactive expressions, the latest values are used on each tick.

**Bound elements update automatically**: Because the DataSource's `value` is reactive, every component that references it — text, lists, badges — re-renders with the fresh data without any extra wiring.

**Use `onLoaded` to react to new data**: If you need side-effects on each poll (e.g., showing a toast when a threshold is exceeded), attach an `onLoaded` handler. The second argument `isRefetch` will be `true` for every poll after the initial load.

---

## See also

- [Transform nested API responses](/docs/howto/filter-and-transform-data-from-an-api) — reshape data before it reaches the UI
- [Show a skeleton while data loads](/docs/howto/hide-an-element-until-its-datasource-is-ready) — display a placeholder during the initial fetch
- [Chain a DataSource refetch](/docs/howto/chain-a-refetch) — manually trigger a refetch after a mutation

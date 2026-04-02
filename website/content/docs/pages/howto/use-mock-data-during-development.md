# Use mock data during development

Set `mockData` on a `DataSource` to build and test your UI without a running backend.

When the backend isn't ready yet — or you want fast, deterministic tests — `mockData` lets you feed data directly into a `DataSource`. No HTTP request is made; the component resolves immediately with the value you provide. Because `mockData` accepts reactive expressions, you can even simulate data changes by binding it to a variable.

```xmlui-pg copy display name="Develop a user list with mock data"
---app display {4-8}
<App>
  <DataSource
    id="users"
    mockData="{[
      { id: 1, name: 'Alice', role: 'Admin' },
      { id: 2, name: 'Bob', role: 'Editor' },
      { id: 3, name: 'Carol', role: 'Viewer' }
    ]}"
  />

  <VStack>
    <Text variant="h5">Team Members</Text>
    <Items data="{users}">
      <Card>
        <HStack verticalAlignment="center">
          <VStack>
            <Text>{$item.name}</Text>
            <Text variant="caption">{$item.role}</Text>
          </VStack>
        </HStack>
      </Card>
    </Items>
  </VStack>
</App>
```

## Key points

**`mockData` bypasses the network entirely**: When set, the DataSource resolves instantly with the provided value. No `url` is required, and no HTTP request is made.

**`mockData` supports reactive expressions**: Bind `mockData` to a variable — `mockData="{myItems}"` — and the DataSource re-resolves every time the variable changes. This is useful for simulating server-pushed updates or testing filter logic.

**`resultSelector` and `transformResult` still work**: You can chain `resultSelector` or `transformResult` on a DataSource that uses `mockData`. This lets you develop your data pipeline before the real API exists.

**Switch to a real URL for production**: Replace `mockData` with a `url` when the backend is ready. The rest of the markup stays the same because downstream components bind to the DataSource's `value`, not to the data source type.

---

## See also

- [Transform nested API responses](/docs/howto/filter-and-transform-data-from-an-api) — reshape data with `resultSelector` and `transformResult`
- [Show a skeleton while data loads](/docs/howto/hide-an-element-until-its-datasource-is-ready) — handle loading states for real API calls
- [Poll an API at regular intervals](/docs/howto/poll-an-api-at-regular-intervals) — automatic re-fetching once you switch to a live URL

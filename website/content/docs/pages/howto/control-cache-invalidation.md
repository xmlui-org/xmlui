# Invalidate related data after a write

Use the `invalidates` prop on `APICall` to control which DataSource caches are refreshed after a successful mutation.

By default, when an `APICall` executes successfully, it invalidates ALL DataSource caches, causing them to refetch. For pages with many DataSources, this creates unnecessary network traffic. Set `invalidates` to an array of URL patterns to refresh only the data that actually changed.

```xmlui-pg name="Update user - refreshes user list"
---app display {16}
<App>
  <DataSource
    id="users"
    url="/api/users"
  />

  <DataSource
    id="stats"
    url="/api/stats"
  />

  <APICall
    id="updateUser"
    method="put"
    url="/api/users/{$param}"
    invalidates="{['/api/users']}"
    completedNotificationMessage="User updated!"
  />

  <VStack>
    <Text>Users (will refresh)</Text>

    <Items data="{users}">
      <Card>
        <HStack>
          <VStack>
            <Text>{$item.name}</Text>
            <Text>Role: {$item.role}</Text>
          </VStack>
          <Button
            onClick="updateUser.execute($item.id)"
            enabled="{$item.role !== 'admin'}">
            Promote to Admin
          </Button>
        </HStack>
      </Card>
    </Items>

    <Text>Stats (won't refresh)</Text>
    <Text>Total requests: {stats.value.totalRequests}</Text>
    <Text>Stats fetched: {stats.value.lastUpdate} time(s)</Text>
  </VStack>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "
    $state.users = [
      { id: '1', name: 'Alice', role: 'viewer' },
      { id: '2', name: 'Bob', role: 'viewer' }
    ];
    $state.stats = { totalRequests: 42, lastUpdate: 0 };
  ",
  "operations": {
    "get-users": {
      "url": "/users",
      "method": "get",
      "handler": "return [...$state.users]"
    },
    "get-stats": {
      "url": "/stats",
      "method": "get",
      "handler": "
        $state.stats.lastUpdate++;
        return { ...$state.stats };
      "
    },
    "update-user": {
      "url": "/users/:id",
      "method": "put",
      "pathParamTypes": { "id": "string" },
      "handler": "
        const user = $state.users.find(u => u.id === $pathParams.id);
        if (user) {
          user.role = 'admin';
        }
      "
    }
  }
}
```

## Key points

**By default, every successful APICall invalidates all caches**: Without the `invalidates` prop, every DataSource on the page re-fetches after any mutation. This is safe but can be wasteful.

**`invalidates` restricts which caches are refreshed**: Set it to an array of URL strings — `invalidates="{['/api/users']}"`. Only DataSources whose `url` matches one of the patterns will refetch.

**An empty array prevents all invalidation**: Use `invalidates="{[]}"` when a mutation has no visible side-effects on the current page (e.g., logging, analytics calls).

**The `onSuccess` event can suppress invalidation too**: Return `false` from the `onSuccess` handler to cancel the automatic cache invalidation entirely, giving you full programmatic control.

---

## See also

- [Chain a DataSource refetch](/docs/howto/chain-a-refetch) — manually trigger a refetch after a mutation
- [Update UI optimistically](/docs/howto/update-ui-optimistically) — update the UI before the server responds
- [Retry a failed API call](/docs/howto/retry-a-failed-api-call) — handle mutation failures
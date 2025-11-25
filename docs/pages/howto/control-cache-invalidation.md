# Control cache invalidation

By default, when an `APICall` executes successfully, it invalidates ALL DataSource caches, causing them to refetch. Use the `invalidates` property to control this behavior for better performance.

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

When an API mutation doesn't affect other displayed data, use `invalidates="{[]}"` to prevent unnecessary refetches.


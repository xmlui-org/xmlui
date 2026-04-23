# Prevent undefined requests in chained DataSources

When one `DataSource` depends on another, the dependent request can fire too early and interpolate `undefined` into its URL.

Use `when` to guard the dependent `DataSource` so it only runs after the required value exists.

```xmlui-pg copy display name="Chain DataSources without undefined requests"
---app
<App>
  <DataSource
    id="user"
    url="/api/users/me"
  />

  <DataSource
    id="orders"
    url="/api/orders/{user.value.id}"
    when="{user.value.id}"
  />

  <Text variant="strong">User:</Text>
  <Text>{user.value.name}</Text>

  <Text variant="strong">Orders:</Text>
  <List data="{orders}">
    <Text>Order #{$item.id}: {$item.total} USD</Text>
  </List>
</App>
---api display
{
  "apiUrl": "/api",
  "initialize": "$state.user = { id: 42, name: 'Ada Lovelace' };\n$state.ordersByUserId = {\n  42: [\n    { id: 1001, total: 19.9 },\n    { id: 1002, total: 42.0 }\n  ]\n};",
  "operations": {
    "get-users-me": {
      "url": "/users/me",
      "method": "get",
      "handler": "delay(800); return $state.user;"
    },
    "get-orders-id": {
      "url": "/orders/:id",
      "method": "get",
      "handler": "return $state.ordersByUserId[$pathParams.id] || [];"
    }
  }
}
```

## Key point

Without `when`, `orders` may run first and call `/api/orders/undefined`.

With `when="{user.value.id}"`, the orders request starts only after the first `DataSource` resolves.

---

## See also

- [Delay a DataSource until another is ready](/docs/howto/delay-a-datasource-until-another-datasource-is-ready)

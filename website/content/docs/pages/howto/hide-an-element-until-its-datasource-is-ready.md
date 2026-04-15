# Show a notification while data loads

Use the DataSource's `loaded` and `inProgress` properties to conditionally render content or a placeholder while data is being fetched.

When a DataSource fetches from a slow endpoint, the UI should show a meaningful placeholder — a spinner, a skeleton card, or simply nothing — until data arrives. Bind visibility to `loaded` or `inProgress` to control what users see during the wait.

```xmlui-pg copy display name="Show content only after the DataSource loads"
---app
<App var.nonce="{0}">
  <DataSource
    id="fruits"
    url="/api/fruits?{nonce}"
    inProgressNotificationMessage="Loading fruits"
    when="{nonce > 0}"
    />

  <Button
    label="Run (takes about 3s)"
    enabled="{!fruits.inProgress}"
    onClick="{nonce++}"
  />

  <Text when="{fruits.loaded}">Fruits: {fruits.value.length} found</Text>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.fruits = [
    { id: 1, name: 'Orange' },
    { id: 2, name: 'Apple' },
    { id: 3, name: 'Pear' },
  ]",
  "operations": {
    "get-fruits": {
      "url": "/fruits",
      "method": "get",
      "handler": "delay(3000); return $state.fruits;"
    }
  }
}
```

## Key points

**`loaded` becomes `true` after the first successful fetch**: Use `when="{ds.loaded}"` on any element to hide it until data is available. Before the first fetch completes, `loaded` is `false`.

**`inProgress` is `true` while a fetch is in flight**: Bind `enabled="{!ds.inProgress}"` on a button to prevent the user from triggering another fetch while one is already running. It toggles back to `false` when the response arrives.

**`inProgressNotificationMessage` shows a toast automatically**: Set a string and the framework displays a non-blocking toast during the fetch. No manual spinner wiring is needed for simple cases.

**The `when` prop on DataSource controls whether it fetches at all**: In the example, `when="{nonce > 0}"` prevents the DataSource from firing until the user clicks **Run**. This is different from hiding elements with `when` — it suppresses the HTTP request entirely.

---

## See also

- [Delay a DataSource until another is ready](/docs/howto/delay-a-datasource-until-another-datasource-is-ready) — chain dependent fetches using `when`
- [Transform nested API responses](/docs/howto/filter-and-transform-data-from-an-api) — reshape data after it loads
- [Poll an API at regular intervals](/docs/howto/poll-an-api-at-regular-intervals) — keep data fresh with periodic refetches

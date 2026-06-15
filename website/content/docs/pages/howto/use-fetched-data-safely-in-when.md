# Use fetched data safely in `when`

When a visibility rule depends on fetched data, guard the fetch lifecycle first and keep the final `when` expression simple.

A `DataSource` value is usually `undefined` before the first successful load. After it loads, refetches can preserve unchanged object references through structural sharing. For conditional rendering, use explicit status such as `loaded`, or compute the business rule once and store it in a `var`.

```xmlui-pg copy display name="Use fetched data safely in when"
---app display /hasBillingAddress/ /profile.loaded/
<App var.hasBillingAddress="{false}">
  <DataSource
    id="profile"
    url="/api/profile"
    onLoaded="data => hasBillingAddress = !!data.billing.address"
  />

  <Text when="{!profile.loaded}">Loading profile...</Text>

  <Card when="{hasBillingAddress}">
    <Text variant="strong">Billing address</Text>
    <Text>{profile.value.billing.address.line1}</Text>
    <Text>{profile.value.billing.address.city}</Text>
  </Card>

  <Text when="{profile.loaded && !hasBillingAddress}">
    No billing address on file.
  </Text>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.profile = { id: 1, name: 'Ada Lovelace', billing: { address: { line1: '12 Analytical Engine Way', city: 'London' } } };",
  "operations": {
    "get-profile": {
      "url": "/profile",
      "method": "get",
      "handler": "delay(600); return $state.profile;"
    }
  }
}
```

## Key points

**Use `loaded` for readiness**: `when="{profile.loaded}"` is the clearest way to wait until the first successful response exists.

**Keep business rules in a `var`**: If visibility depends on a nested payload condition, compute it in `onLoaded` and bind `when` to the boolean. This avoids repeating long paths and makes the dependency explicit.

**Guard direct payload reads**: If you read `profile.value` directly in a `when` expression, also guard for readiness or use optional member access:

```xmlui
<Card when="{profile.loaded && profile.value.billing.address}">
  ...
</Card>
```

**Use `ChangeListener` for several sources**: When a derived condition depends on multiple values, watch those values with `ChangeListener` and store the result in a `var`.

```xmlui
<Fragment var.canShowBilling="{false}" var.selectedPlan="">
  <ChangeListener
    listenToSources="{{ loaded: profile.loaded, selected: selectedPlan }}"
    onDidChange="() => canShowBilling = profile.loaded && !!selectedPlan"
  />
</Fragment>
```

---

## See also

- [Visibility and Responsive Display](/docs/visibility#reactivity-of-when) — how `when` re-evaluates
- [Hide an element until its DataSource is ready](/docs/howto/hide-an-element-until-its-datasource-is-ready) — use `loaded` and `inProgress`
- [Prevent undefined requests in chained DataSources](/docs/howto/prevent-undefined-requests-in-chained-datasources) — guard dependent requests
- [React to value changes with debounce](/docs/howto/debounce-with-changelistener) — derive state from changing values

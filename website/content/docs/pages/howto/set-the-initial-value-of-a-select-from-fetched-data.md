# Set the initial value of a Select from fetched data

Use a `DataSource` with `onLoaded` to capture the server response and set a variable, then pass that variable to `Select` as `initialValue`.

A `Select` rendered before its data arrives has no items to select, so setting `initialValue` statically has no effect. The `onLoaded` handler fires once the API responds, at which point both the items and the initial selection can be applied together.

```xmlui-pg display copy name="Set the initial value of a Select from fetched data" height="240px"
---app
<App var.selectedValue="{null}">
  <DataSource
    id="myData"
    url="/api/users_initial_value"
    onLoaded="(data) => { selectedValue = data[0].id }"
  />

  <Select initialValue="{selectedValue}">
    <Items data="{myData}">
      <Option value="{$item.id}" label="{$item.username}" />
    </Items>
  </Select>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.users_initial_value = [{ id: 1, username: 'Coder Gal' }, { id: 2, username: 'Tech Ninja' }, { id: 3, username: 'Design Diva' }]",
  "operations": {
    "get_users_initial_value": {
      "url": "/users_initial_value",
      "method": "get",
      "handler": "$state.users_initial_value"
    }
  }
}
```

## Key points

**`onLoaded` fires once the API response arrives**: The handler receives the full response array. In the example, `data[0].id` reads the first record's ID and assigns it to `selectedValue` — the variable that drives the `Select`'s `initialValue`.

**`initialValue` is reactive**: Because `selectedValue` is a `var` on the `App`, the `Select` re-evaluates `initialValue` when the variable changes. When `onLoaded` sets `selectedValue`, the `Select` picks up the new value automatically.

**The `Select` items and initial value load together**: `Items` is bound to the same `DataSource`. Both the option list and the pre-selected value become available at the same moment, so the `Select` renders correctly in a single pass.

**Use `data[0].id` or any expression to derive the default**: The initial value does not have to be the first item. Replace `data[0].id` with any expression over the loaded array — for example the item with the lowest value, a match against a user preference, or a hardcoded fallback.

---

## See also

- [Select component](/docs/reference/components/Select) — `initialValue`, `Items`, `Option`
- [DataSource component](/docs/reference/components/DataSource) — `url`, `onLoaded`
- [Prefill a form from an API response](/docs/howto/prefill-a-form-from-an-api-response) — setting multiple form fields from fetched data

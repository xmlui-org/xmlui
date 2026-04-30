# Delay a DataSource until another is ready

Use the `when` prop to chain DataSources so one waits for another to finish loading before it fires.

When a dropdown needs data from two endpoints — users and departments — and the display label combines values from both, you must ensure the second DataSource doesn't fire until the first has resolved. Bind the second DataSource's `when` to the first's `loaded` property to create a sequential chain.

```xmlui-pg copy display name="Load departments only after users are ready"
---api
{
  "apiUrl": "/api",
  "initialize": "$state.users_for_ds_dependency = [{ id: 1, name: 'Alice', departmentId: 1 }, { id: 2, name: 'Bob', departmentId: 2 }]; $state.departments_with_ds_dependency = [{ id: 1, name: 'Engineering' }, { id: 2, name: 'Marketing' }]",
  "operations": {
    "get_users_for_ds_dependency": {
      "url": "/users_for_ds_dependency",
      "method": "get",
      "handler": "delay(1000); return $state.users_for_ds_dependency"
    },
    "get_departments_with_ds_dependency": {
      "url": "/departments_with_ds_dependency",
      "method": "get",
      "handler": "delay(1000); return $state.departments_with_ds_dependency"
    }
  }
}
---app display /selectedId/ /nonce/
<App var.selectedId="" var.nonce="{0}" var.userOptions="{[]}">
  <DataSource
    id="users_for_ds_dependency"
    url="/api/users_for_ds_dependency?nonce={nonce}"
    inProgressNotificationMessage="Loading users..."
    when="{ nonce > 0 }"
  />

  <DataSource
    id="departments_with_ds_dependency"
    url="/api/departments_with_ds_dependency"
    when="{ users_for_ds_dependency.loaded }"
    inProgressNotificationMessage="Loading departments..."
    onLoaded="(departments) => {
      userOptions = users_for_ds_dependency.value.map(user => {
        const department = departments.find(d => d.id === user.departmentId);
        return {
          id: user.id,
          label: user.name + ' (' + department.name + ')'
        };
      });
    }"
  />

  <Select
    id="usersForDsDependency"
    label="User"
    when="{userOptions.length > 0}"
    onDidChange="(newVal) => selectedId = newVal"
  >
    <Items data="{userOptions}">
      <Option value="{$item.id}" label="{$item.label}" />
    </Items>
  </Select>

  <Button label="Run" onClick="{nonce++}"/>
</App>
```

## Key points

**`when` prevents the DataSource from fetching until the condition is truthy**: In the example, `when="{users_for_ds_dependency.loaded}"` ensures the departments request doesn't fire until users have arrived.

**Build the Select options after both responses are available**: The departments DataSource uses `onLoaded` to combine `users_for_ds_dependency.value` with the department response and store the ready-to-render options in `userOptions`. The `Select` then renders only from `<Items data="{userOptions}">`, so it has one clear source for its options and each option already has a resolved label.

**You can chain multiple DataSources**: DataSource A's `when` can reference DataSource B's `loaded`, and DataSource C can wait for both. This creates a sequential loading pipeline.

**`when` on the DataSource is different from `when` on a UI element**: On a DataSource, `when` suppresses the HTTP request entirely. On a `Select` or `Fragment`, `when` controls rendering but the request may have already fired.

**`inProgressNotificationMessage` provides loading feedback per step**: Assign a different message to each DataSource in the chain so users know which step is in progress.

---

## See also

- [Show a skeleton while data loads](/docs/howto/hide-an-element-until-its-datasource-is-ready) — display placeholders during the wait
- [Chain a DataSource refetch](/docs/howto/chain-a-refetch) — trigger a refetch after a mutation
- [Transform nested API responses](/docs/howto/filter-and-transform-data-from-an-api) — reshape data before rendering

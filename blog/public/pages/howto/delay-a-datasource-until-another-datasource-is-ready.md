# Delay a DataSource until another DataSource is ready

```xmlui-pg noHeader
---app
<App>
  <Test />
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.users_for_ds_dependency =
    [
      { id: 1, name: 'Alice', departmentId: 1 },
      { id: 2, name: 'Bob', departmentId: 2 }
      ];
    $state.departments_with_ds_dependency = [
      { id: 1, name: 'Engineering' },
      { id: 2, name: 'Marketing' }
    ]",
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
---comp display
<Component name="Test" var.selectedId="" var.nonce="{0}">

  <DataSource
    id="users_for_ds_dependency"
    url="/api/users_for_ds_dependency?nonce"
    inProgressNotificationMessage="Loading users..."
    when="{ nonce > 0 }"
    />

  <DataSource
    id="departments_with_ds_dependency"
    url="/api/departments_with_ds_dependency"
    when="{ users_for_ds_dependency.loaded }"
    inProgressNotificationMessage="Loading departments..."
  />

  <Select
    id="usersForDsDepencency"
    data="{users_for_ds_dependency}"
    when="{departments_with_ds_dependency.loaded}"
    onDidChange="(newVal) => selectedId = newVal"
  >
    <Items data="{users_for_ds_dependency}">
      <Option
        value="{$item.id}"
        label="{$item.name} ({departments_with_ds_dependency.value.find(d => d.id === $item.departmentId)?.name})"
     />
    </Items>
  </Select>

  <Button
    label="Run"
    onClick="{nonce++}"
  />


</Component>
```

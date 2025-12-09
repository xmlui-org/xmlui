# Set the initial value of a Select from fetched data

```xmlui-pg noHeader
---app
<App>
  <Test />
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.users_initial_value = [
        {
          id: 1,
          username: 'Coder Gal',
        },
        {
          id: 2,
          username: 'Tech Ninja',
        },
        {
          id: 3,
          username: 'Design Diva',
        },
      ]",
  "operations": {
    "get_users_initial_value": {
      "url": "/users_initial_value",
      "method": "get",
      "handler": "$state.users_initial_value"
    }
  }
}
---comp display
<Component name="Test" var.selectedValue="">

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

</Component>
```

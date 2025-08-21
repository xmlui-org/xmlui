# Debug a component

```xmlui-pg noHeader
---app
<App>
  <Test />
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.user_data = {
      id: 42,
      name: 'John Doe',
      preferences: { theme: 'dark', notifications: true },
      recentItems: ['item1', 'item2', 'item3']
    }",
  "operations": {
    "get_user_data": {
      "url": "/user_data",
      "method": "get",
      "handler": "console.log('API called:', $state.user_data); return $state.user_data"
    }
  }
}
---comp display
<Component name="Test"
  var.counter = "{1}"
>

  <DataSource
    id="userData"
    url="/api/user_data"
  />

  <script>
    // can customize here
    function debug(msg, data) {
      console.log(msg, data)
    };
  </script>

  <Text>Method 1: JSON.stringify with preserveLinebreaks</Text>

  <Text preserveLinebreaks="true">
    {JSON.stringify(userData.value, null, 2)}
  </Text>

  <Text>Method 2: Console.log in handler</Text>

  <Button
    label="Log to console"
    onClick="console.log(userData);console.log(userData.value)"
  />

  <Text>Method 3: Use Fragment and custom debug function to watch changes</Text>

  <Fragment when="{debug('counter', counter)}" />

  <Button
    label="Update counter"
    onClick="{counter++}"
  />

</Component>
```

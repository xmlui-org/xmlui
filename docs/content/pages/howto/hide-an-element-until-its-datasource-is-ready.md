# Hide an element until its DataSource is ready

```xmlui-pg
---app
<App>
  <Test />
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
---comp display /nonce/
<Component name="Test" var.nonce="{0}">

<DataSource
  id="fruits"
  url="/api/fruits?{nonce}"
  inProgressNotificationMessage="Loading fruits"
  when="{nonce > 0}"
  />

<Button
  label="Run"
  onClick="{nonce++}"
/>

<Fragment when="{fruits.loaded}">
  <Text>Fruits: {fruits.value.length} found</Text>
</Fragment>

</Component>
```

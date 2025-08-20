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
  var.localState="{{
    currentStep: 2,
    errors: ['Invalid email', 'Password too short'],
    formData: { email: 'test@example.com', age: 25 }
  }}">

  <DataSource
    id="userData"
    url="/api/user_data"
  />

  <Text>User Debug Info</Text>

  <!-- Method 1: JSON.stringify with preserveLinebreaks -->
  <Text preserveLinebreaks="true">
    {JSON.stringify(userData.value, null, 2)}
  </Text>

  <!-- Method 2: Console.log in handler -->
  <Button
    label="Log to Console"
    onClick="console.log('Button clicked, userData:', userData.value)"
  />

  <!-- Method 3: Window function for component variables -->
  <Button
  label="Debug Local State"
  onClick="window.debugLog(localState, 'Local component state')"
  />

  <!-- Method 4: Unwrapping Proxy objects -->
  <Button
    label="Debug Unwrapped Data"
    onClick="console.log('Unwrapped userData:', JSON.parse(JSON.stringify(userData.value)))"
  />


</Component>
```

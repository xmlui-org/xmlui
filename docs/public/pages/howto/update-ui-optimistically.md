# APICall Error Event Bug Reproduction

**Bug:** APICall becomes non-functional after first error when used with DataSource + Items + $item context

```xmlui-pg copy display name="Bug: APICall + Items + Error Event"
---app display
<App>
  <APICall
    id="testCall"
    method="post"
    url="/api/test/{$param}">
    <event name="error">
      console.log('Error event fired');
    </event>
  </APICall>

  <DataSource
    id="testData"
    url="/api/data"
    method="GET" />

  <Items data="{testData}">
    <Card>
      <Button onClick="testCall.execute($item.id)">
        Click Multiple Times (Bug: Only First Click Works)
      </Button>
    </Card>
  </Items>
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.items = [{ id: '1', name: 'Test Item' }]",
  "operations": {
    "get-data": {
      "url": "/data",
      "method": "get",
      "handler": "return $state.items"
    },
    "test-endpoint": {
      "url": "/test/:id",
      "method": "post",
      "pathParamTypes": {
        "id": "string"
      },
      "handler": "throw 'error'"
    }
  }
}
```

**Expected:** Each button click makes a network request and triggers error event
**Actual:** Only first click works, subsequent clicks do nothing (no network request, no error event)

**Root Cause:** The combination of APICall error events + DataSource/Items + $item context variables causes APICall to become permanently broken after first error.
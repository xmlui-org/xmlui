# Update UI Optimistically

This example demonstrates a performance issue where updating component variables causes ALL DataSources to re-render and trigger fresh API calls, even when they have no dependency on the changed variables.

**Try this:**
1. Open browser console to see debug logs
2. Click "Update Local State" button
3. Notice ALL DataSources re-render simultaneously after the state update

```xmlui-pg noHeader
---app
<App>
  <CascadeDemo />
</App>
---api
{
  "apiUrl": "/api",
  "operations": {
    "get_post_1": {
      "url": "/posts/1",
      "method": "get",
      "handler": "console.log('📡 DataSource 1 API called at:', Date.now()); return { id: 1, title: 'Post 1', body: 'Content for post 1' }"
    },
    "get_post_2": {
      "url": "/posts/2", 
      "method": "get",
      "handler": "console.log('📡 DataSource 2 API called at:', Date.now()); return { id: 2, title: 'Post 2', body: 'Content for post 2' }"
    },
    "get_post_3": {
      "url": "/posts/3",
      "method": "get", 
      "handler": "console.log('📡 DataSource 3 API called at:', Date.now()); return { id: 3, title: 'Post 3', body: 'Content for post 3' }"
    },
    "trigger_state_update": {
      "url": "/trigger",
      "method": "get",
      "handler": "console.log('🟢 API completed - will update local state next'); return { success: true, timestamp: Date.now() }"
    }
  }
}
---comp display
<Component name="CascadeDemo" var.localState="{null}">
  
  <!-- Three independent DataSources that should NOT re-render when localState changes -->
  <DataSource id="dataSource1" url="/api/posts/1" />
  <DataSource id="dataSource2" url="/api/posts/2" />
  <DataSource id="dataSource3" url="/api/posts/3" />
  
  <APICall
    id="triggerUpdate"
    method="get"
    url="/api/trigger"
    errorNotificationMessage="API call failed">
    <event name="success">
      console.log('🔄 About to update localState - watch for DataSource re-renders...');
      
      // This local state update should NOT cause unrelated DataSources to re-render
      localState = 'updated_' + Date.now();
      
      console.log('✅ Local state updated to:', localState);
      console.log('❌ Check if DataSources re-rendered above (they should not!)');
    </event>
  </APICall>

  <VStack gap="1rem" padding="2rem">
    <Text variant="h1">XMLUI State Update Cascade Bug Demo</Text>
    
    <Alert type="warning">
      Open browser console and click the button below. You'll see that updating localState triggers ALL DataSources to re-render and make fresh API calls.
    </Alert>
    
    <Button onDidClick="triggerUpdate.execute()">
      Update Local State (Watch Console)
    </Button>
    
    <Text><strong>Local State:</strong> {localState || 'null'}</Text>
    
    <VStack gap="0.5rem">
      <Text variant="h2">DataSource Status (should not change when button clicked):</Text>
      <Text>📊 DataSource 1: {dataSource1.loading ? 'Loading...' : `Loaded - ${dataSource1.value?.title}`}</Text>
      <Text>📊 DataSource 2: {dataSource2.loading ? 'Loading...' : `Loaded - ${dataSource2.value?.title}`}</Text>
      <Text>📊 DataSource 3: {dataSource3.loading ? 'Loading...' : `Loaded - ${dataSource3.value?.title}`}</Text>
    </VStack>
    
    <Alert type="info">
      <strong>Expected:</strong> Only localState should update when button clicked.<br/>
      <strong>Actual:</strong> All DataSources re-render and make fresh API calls.<br/>
      <strong>Evidence:</strong> Check console for "📡 DataSource X API called" logs after clicking.
    </Alert>
  </VStack>
</Component>
```

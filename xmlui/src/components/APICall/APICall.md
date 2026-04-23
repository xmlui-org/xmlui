%-DESC-START

**Key characteristics:**
- **Manual execution**: Call `execute()` method to trigger the API request
- **Form integration**: Commonly used in `<event name="submit">` handlers for forms
- **Parameter passing**: Pass data to the API call via `execute()` parameters
- **Built-in notifications**: Supports automatic progress, success, and error messages

%-DESC-END

%-PROP-START completedNotificationMessage

This property customizes the success message displayed in a toast after the finished API invocation. The `$result` context variable can refer to the response body. For example, you can use the following code snippet to display the first 100 characters in the completed operation's response body:

```xmlui copy
 <APICall
  id="api"
  method="post"
  url="/api/shopping-list" 
  completedNotificationMessage="Result: {JSON.stringify($result).substring(0, 100)}" />
```

%-PROP-END

%-PROP-START errorNotificationMessage

This property customizes the message displayed in a toast when the API invocation results in an error. Use the `$error` context object to get the error code (`$error.statusCode`) optional message (`$error.message`), or details coming from the response body (`$error.details`). For example, you can use the following code snippet to display the status code and the details:

```xmlui copy
 <APICall
  id="api"
  method="post"
  url="/api/shopping-list"
  errorNotificationMessage="
    ${error.statusCode}, ${error.message} {JSON.stringify($error.details)}
  " />
```

**Error handling in try/catch blocks**: When calling `Actions.callApi()`, you can catch errors and access their properties directly:

```xmlui-pg name="Example: Error handling with Actions.callApi"
---app copy display 
<App>
  <Button onClick="
    try {
      Actions.callApi({
        url: '/api/create-file',
        method: 'post',
        body: { name: 'file.txt' }
      });
      toast.success('File created');
    } catch (error) {
      if (error.statusCode === 409) {
        toast.error('File already exists');
      } else if (error.statusCode === 400) {
        toast.error('Invalid request: ' + error.message);
      } else {
        toast.error(error.message);
      }
    }
  ">
    Create File
  </Button>
</App>
---api display
{
  "apiUrl": "/api",
  "operations": {
    "create-file": {
      "url": "/create-file",
      "method": "post",
      "handler": "throw Errors.HttpError(409, { message: 'File already exists', details: { fileName: $requestBody.name, conflictReason: 'Duplicate entry' }, customField: 'customValue' });"
    }
  }
}
```

The error object provides:
- `error.statusCode` - HTTP status code (e.g., 400, 404, 500)
- `error.message` - Extracted error message
- `error.details` - Extracted error details object
- `error.response` - Full original response body (includes custom fields)

**NOTE:** While we support Microsoft/Google-style and RFC 7807 errors, not all response shapes can be accounted for.
Because of this, there is an attribute available in the `configuration` file called `errorResponseTransform` under `appGlobals`. This exposes the error response using the `$response` context variable.
Here is an example on how to use it (note that this is evaluated as a `binding expression`):

Error looks the following coming from the backend:

```js
{
  code: number,
  error: string
}
```

This is how to transform it in config:

```json
{
  "appGlobals": {
    "errorResponseTransform": "{{ statusCode: $response.code, message: $response.error }}"
  }
}
```

%-PROP-END

%-PROP-START credentials

**Important**: When using `credentials="include"` for cross-origin requests, the server must respond with the `Access-Control-Allow-Credentials: true` header, and the `Access-Control-Allow-Origin` header cannot be `*` (it must be a specific origin).

**Example**: Submitting a form with authentication

```xmlui copy
<Form>
  <TextBox id="message" label="Message" />
  <event name="submit">
    <APICall 
      url="https://api.example.com/messages"
      method="post"
      body='{{"message": message.value}}'
      credentials="include"
    />
  </event>
</Form>
```

%-PROP-END

%-PROP-START deferredMode

First, `APICall` executes the initial request, then `statusUrl` polls until completion or failure.

Use `statusUrl` to define the polling endpoint. If you need query parameters for status checks, include them directly in the URL template.

```xmlui-pg name="Example: deferredMode with statusUrl and status query params"
---app copy display {7,8}
<App>
  <APICall
    id="startExport"
    method="post"
    url="/api/exports"
    body="{{ format: 'csv' }}"
    deferredMode="true"
    statusUrl="/api/exports/{$result.jId}/status?tenant={$result.tId}&includeProgress=true"
    statusMethod="get"
    pollingInterval="1000"
    maxPollingDuration="60000"
    completionCondition="{$statusData.state === 'completed'}"
    errorCondition="{$statusData.state === 'failed'}"
    progressExtractor="{$statusData.progress}"
    inProgressNotificationMessage="Preparing export: {$progress}%"
    completedNotificationMessage="Export is ready"
    errorNotificationMessage="Export failed: {$statusData.message}"
  />

  <Button label="Start export" onClick="startExport.execute()" />
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.exportJobs = {}",
  "operations": {
    "start-export": {
      "url": "/exports",
      "method": "post",
      "handler": "const id = 'job-' + Date.now(); $state.exportJobs[id] = { progress: 0, state: 'running', message: 'Export in progress' }; return { jId: id, tId: 'tenant-a' };"
    },
    "get-export-status": {
      "url": "/exports/:jId/status",
      "method": "get",
      "pathParamTypes": { "jId": "string" },
      "handler": "const job = $state.exportJobs[$pathParams.jId]; if (!job) return { state: 'failed', progress: 0, message: 'Job not found' }; if (job.state === 'running') { job.progress = Math.min(100, job.progress + 25); if (job.progress >= 100) { job.state = 'completed'; job.message = 'Export completed'; } } return { state: job.state, progress: job.progress, message: job.message, tenant: $queryParams.tenant, includeProgress: $queryParams.includeProgress };"
    }
  }
}
```

%-PROP-END

%-PROP-START pollingInterval

Combine it with `pollingBackoff` to reduce server load for long-running tasks.

Note how in this example, the progress toast shows up less frequently as polling time is increased from the preset one.

```xmlui-pg name="Example: pollingInterval with pollingBackoff"
---app copy display {8,9}
<App>
  <APICall
    id="rebuildSearch"
    method="post"
    url="/api/search/rebuild"
    deferredMode="true"
    statusUrl="/api/search/rebuild/{$result.operationId}/status"
    pollingInterval="1000"
    pollingBackoff="exponential"
    maxPollingInterval="10000"
    maxPollingDuration="180000"
    completionCondition="{$statusData.done === true}"
    errorCondition="{$statusData.failed === true}"
    progressExtractor="{$statusData.percent}"
    inProgressNotificationMessage="Rebuilding index: {$progress}%"
  />

  <Button label="Rebuild search index" onClick="rebuildSearch.execute()" />
</App>
---api
{
  "apiUrl": "/api",
  "initialize": "$state.rebuildOps = {}",
  "operations": {
    "start-rebuild": {
      "url": "/search/rebuild",
      "method": "post",
      "handler": "const id = 'op-' + Date.now(); $state.rebuildOps[id] = { percent: 0, done: false, failed: false }; return { operationId: id };"
    },
    "get-rebuild-status": {
      "url": "/search/rebuild/:operationId/status",
      "method": "get",
      "pathParamTypes": { "operationId": "string" },
      "handler": "const op = $state.rebuildOps[$pathParams.operationId]; if (!op) return { percent: 0, done: false, failed: true }; if (!op.done && !op.failed) { op.percent = Math.min(100, op.percent + 20); if (op.percent >= 100) op.done = true; } return { percent: op.percent, done: op.done, failed: op.failed };"
    }
  }
}
```

%-PROP-END

%-PROP-START invalidates

This property takes either a string or a list of strings representing URL endpoints to invalidate the local data cache based on the given URL routes.

For a short overview on client side caching, see the [DataSource component](/docs/reference/components/DataSource).

%-PROP-END

%-PROP-START updates

This property takes either a string or a list of strings representing URL endpoints to indicate which data should be updated in the cache.

%-PROP-END

%-EVENT-START mockExecute

When this event is defined, it **replaces the real HTTP request** entirely. The handler's return value becomes the result of the API call — `onSuccess` still fires with it, `lastResult` is updated, and query invalidation still runs as normal. No network request is made.

This is the `APICall` counterpart to [`DataSource`'s `mockData`](/docs/reference/components/DataSource) property: use it during development and testing to simulate backend mutations without a real server.

**Context variables available in the handler:**

| Variable | Description |
|---|---|
| `$requestBody` | Resolved request body (`body` / `rawBody`) |
| `$queryParams` | Resolved query parameters |
| `$requestHeaders` | Resolved request headers |
| `$pathParams` | Path parameters (empty object for client-side mocks) |
| `$cookies` | Request cookies (empty object for client-side mocks) |
| `$param` | First argument passed to `execute()` |
| `$params` | Array of all arguments passed to `execute()` |

```xmlui-pg name="Example: mockExecute — building a mock CRUD list"
---app copy display
<App var.users="{[
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]}">
  <DataSource id="userList" url="/api/users" mockData="{users}" />
  <Button>
    <event name="click">
      <APICall
        url="/api/users"
        method="post"
        invalidates="/api/users"
        onMockExecute="() => {
          const newUser = { id: users.length + 1, name: 'New User' };
          users = [...users, newUser];
          return newUser;
        }"
      />
    </event>
    Add user
  </Button>
  <List data="{userList}">
    <HStack>
      <Text value="{$item.id}." width="24px"/>
      <Text value="{$item.name}" />
    </HStack>
  </List>
</App>
```

%-EVENT-END

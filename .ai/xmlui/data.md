# Data Operations

Reference for DataSource, APICall, and related data patterns in XMLUI markup.

## DataSource

Fetches data from an API endpoint. Access via its `id` anywhere in scope.

```xml
<DataSource id="users" url="/api/users" />
<Table data="{users}" />
```

### Loader State Properties

| Property | Type | Description |
|---|---|---|
| `users.value` | `any` | Fetched data after transformation |
| `users.inProgress` | `boolean` | `true` while fetching |
| `users.loaded` | `boolean` | `true` after first successful fetch |
| `users.error` | `object \| null` | Error details, or `null` on success |

```xml
<Spinner visible="{users.inProgress}" />
<Text visible="{users.error}">Error: {users.error.message}</Text>
<Text>{users.value.length} users loaded</Text>
<Button onClick="users.refetch()" enabled="{!users.inProgress}">Refresh</Button>
```

### Key Props

| Prop | Description |
|---|---|
| `url` | API endpoint (may contain `{expressions}`) |
| `id` | Identifier for referencing the loader |
| `transformResult` | Function applied to raw response: `"(data) => data.items"` |
| `resultSelector` | Lodash path to extract a subtree: `"data.users"` |
| `pollIntervalInSeconds` | Auto-refetch interval |
| `queryParams` | Query string parameters object |
| `body` | Request body (for non-GET) |
| `method` | HTTP method (default: `GET`) |
| `invalidates` | URL pattern to invalidate in cache after mutation |

### Events

```xml
<DataSource id="users" url="/api/users">
  <event name="loaded">toast("Data loaded")</event>
  <event name="error">toast("Failed: " + $error.message)</event>
</DataSource>
```

### Dependent Queries

A DataSource whose `url` references another loader's value will wait for that loader to resolve:

```xml
<DataSource id="user" url="/api/user/{userId}" />
<DataSource id="posts" url="/api/posts?userId={user.value.id}" />
<!-- posts waits until user.value.id is available -->
```

### Transformation and Result Selection

```xml
<DataSource
  id="products"
  url="/api/products"
  resultSelector="data.items"
  transformResult="(items) => items.filter(i => i.active)"
/>
```

### Polling

```xml
<DataSource id="status" url="/api/status" pollIntervalInSeconds="10" />
```

---

## APICall

Executes a write operation (POST, PUT, PATCH, DELETE). Does **not** auto-execute — requires a manual trigger.

```xml
<APICall id="saveUser" url="/api/users" method="POST" body="{userData}" />
<Button onClick="saveUser.execute()">Save</Button>
```

### Key Props

| Prop | Description |
|---|---|
| `url` | API endpoint |
| `method` | HTTP method (`POST`, `PUT`, `PATCH`, `DELETE`) |
| `body` | Request body (expression) |
| `id` | Identifier for calling `id.execute()` |
| `invalidates` | URL pattern to invalidate from React Query cache |
| `confirmMessage` | Shows confirmation dialog before executing |
| `confirmButtonLabel` | Label for the confirm button |

### Events and Context Variables

| Event | When | Available context vars |
|---|---|---|
| `beforeRequest` | Before execution (return `false` to cancel) | `$param`, `$params` |
| `success` | On successful response | `$result` |
| `error` | On failure | `$error` |

```xml
<APICall id="deleteItem" url="/api/items/{$param}" method="DELETE">
  <event name="beforeRequest">
    return $param != null;   <!-- cancel if no id -->
  </event>
  <event name="success">
    toast("Deleted"); users.refetch();
  </event>
  <event name="error">
    toast("Error: " + $error.message);
  </event>
</APICall>

<Button onClick="deleteItem.execute(item.id)">Delete</Button>
```

`execute()` accepts arguments: `$param` is the first argument, `$params` is the full array.

### Cache Invalidation

```xml
<!-- After creating a user, invalidate the /api/users cache -->
<APICall url="/api/users" method="POST" invalidates="/api/users" />
```

### Conditional Execution with Confirmation

```xml
<APICall
  id="deleteUser"
  url="/api/users/{userId}"
  method="DELETE"
  confirmMessage="Are you sure you want to delete this user?"
  confirmButtonLabel="Delete"
  invalidates="/api/users"
/>
```

---

## File Operations

### FileUpload (via event)

```xml
<FileUploadDropZone>
  <event name="uploaded">
    <FileUpload url="/api/upload" file="{$param}" />
  </event>
</FileUploadDropZone>
```

### FileDownload (via event)

```xml
<Button>
  Export
  <event name="click">
    <FileDownload url="/api/export" filename="report.csv" />
  </event>
</Button>
```

---

## Inline APICall in Event Handlers

When APICall is nested inside an `<event>` tag, it fires inline without a separate `id`:

```xml
<Form>
  <event name="submit">
    <APICall url="/api/users" method="POST" body="{$data}" />
  </event>
</Form>
```

`$data` in form context contains the form's current field values.

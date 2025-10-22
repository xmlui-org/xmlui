# Data Operations

This document explains XMLUI's data operation architecture, covering automatic loader creation, the ApiBoundComponent system, DataSource/APICall components, state integration, and React Query caching.

## Overview

XMLUI provides declarative data operations through components that automatically manage async state, caching, and integration with the container system. The framework detects data requirements and creates **loaders** - internal mechanisms handling fetch operations, state transitions, and cache management.

**Core Components:**
- **DataSource** - Fetches and caches data from API endpoints
- **APICall** - Creates, updates, or deletes data (manual execution)
- **FileUpload/FileDownload** - Specialized file operations
- **Loaders** - Internal state machines managing async operations

**What Loaders Do:**

Loaders are React components (not user-defined) that the framework automatically creates to manage async operations. Each loader:
1. Executes HTTP requests via React Query
2. Manages loading/error/success states
3. Integrates with container state via reducer actions
4. Provides programmatic APIs (`refetch()`, `update()`, etc.)
5. Handles caching, polling, and pagination

**Key Features:** Automatic loader creation, declarative API operations, integrated caching with React Query, seamless container state integration, polling/refetching, optimistic updates.

## Automatic Loader Creation

### ApiBoundComponent Detection

The framework automatically detects when components require API operations and wraps them in `ApiBoundComponent`, which generates necessary loaders. Detection occurs in `ComponentAdapter.tsx`:

```typescript
// Scan component for API-bound properties
const apiBoundProps = useMemo(
  () => getApiBoundItems(safeNode.props, "DataSource", "DataSourceRef"),
  [safeNode.props]
);

// Scan events for API actions
const apiBoundEvents = useMemo(
  () => getApiBoundItems(safeNode.events, "APICall", "FileDownload", "FileUpload"),
  [safeNode.events]
);

// Wrap if API-bound items found
if (apiBoundProps.length || apiBoundEvents.length) {
  return (
    <ApiBoundComponent
      uid={uid}
      node={safeNode}
      apiBoundProps={apiBoundProps}
      apiBoundEvents={apiBoundEvents}
      renderChild={renderChild}
    />
  );
}
```

### Detection Scenarios

**1. Property-Based (Data Fetching):**
```xml
<!-- Direct URL pattern -->
<Table data="/api/users" />
<!-- Creates DataLoader automatically -->

<!-- DataSource reference -->
<Table data="{users}" />
<!-- Creates DataLoader when 'users' is DataSource -->

<!-- Explicit DataSource -->
<DataSource id="users" url="/api/users" />
<Table data="{users}" />
<!-- DataSource becomes loader accessible as 'users' -->
```

**2. Event-Based (Data Mutation):**
```xml
<Button>
  Save
  <event name="click">
    <APICall url="/api/save" method="POST" body="{formData}" />
  </event>
</Button>
<!-- APICall handler generated for click event -->

<FileUploadDropZone>
  <event name="uploaded">
    <FileUpload url="/api/upload" />
  </event>
</FileUploadDropZone>
<!-- FileUpload handler attached to uploaded event -->
```

### ApiBoundComponent Transformation

`ApiBoundComponent` transforms the component definition by:

1. **Creating Loader Definitions** - Generates `DataLoader` components for each API-bound property
2. **Generating Event Handlers** - Converts action components into executable functions
3. **Injecting API Properties** - Adds loader state properties (`value`, `inProgress`, `loaded`, `error`)
4. **Registering APIs** - Creates methods like `fetch_data()`, `update_data()`, `refetch()`

```typescript
// Inside ApiBoundComponent.tsx
apiBoundProps.forEach((key) => {
  const loaderUid = node.props![key].uid || generateloaderUid(key);
  const operation = node.props![key].props || node.props![key];
  
  // Create DataLoader definition
  loaders.push({
    type: "DataLoader",
    uid: loaderUid,
    props: operation,
    events: loaderEvents,
  });
  
  // Inject reactive properties
  props[key] = `{ ${loaderUid}.value }`;
  props.loading = `{ ${loaderUid}.inProgress === undefined ? true : ${loaderUid}.inProgress}`;
  
  // Register API methods
  api[`fetch_${key}`] = `() => { ${loaderUid}.refetch(); }`;
  api[`update_${key}`] = `(updaterFn) => { ${loaderUid}.update(updaterFn); }`;
});
```

**Result:** Component receives transformed props/events and gains API methods for programmatic control.

## DataSource Component

### Purpose and Properties

DataSource fetches data from API endpoints with automatic caching, polling, and state management.

**Core Properties:**
```typescript
{
  id: string;              // Required: Identifier for referencing
  url: string;             // Required: API endpoint
  method?: string;         // HTTP method (default: "GET")
  body?: any;              // Request body (JSON serialized)
  rawBody?: string;        // Pre-serialized body
  queryParams?: object;    // URL query parameters
  headers?: object;        // Request headers
  pollIntervalInSeconds?: number;  // Auto-refresh interval
  resultSelector?: string;          // Extract subset of response
  transformResult?: Function;       // Transform response data
  structuralSharing?: boolean;      // Keep unchanged refs (default: true)
}
```

**Events:**
- `loaded(data, isRefetch)` - Fires when data successfully fetched
- `error(error)` - Fires on request failure

**APIs:**
```typescript
{
  value: any;              // Fetched data (post-transformation)
  inProgress: boolean;     // Loading state
  isRefetching: boolean;   // Re-fetch state
  loaded: boolean;         // Has data been loaded
  refetch(): void;         // Manually trigger re-fetch
}
```

### Usage Patterns

**Basic Fetching:**
```xml
<DataSource id="users" url="/api/users" />
<Table data="{users}" />
<!-- Table receives users.value automatically -->
```

**With Transformation:**
```xml
<DataSource 
  id="products" 
  url="/api/products"
  resultSelector="data.items"
  transformResult="(items) => items.filter(i => i.active)"
/>
```

**With Polling:**
```xml
<DataSource 
  id="status" 
  url="/api/status"
  pollIntervalInSeconds="5"
  inProgressNotificationMessage="Checking status..."
/>
```

**Programmatic Control:**
```xml
<DataSource id="orders" url="/api/orders" />
<Button onClick="orders.refetch()">Refresh</Button>
```

### Data Transformation Pipeline

1. **Fetch** - HTTP request via RestApiProxy
2. **Result Selection** - Extract subset via `resultSelector` (lodash path)
3. **Transformation** - Apply `transformResult` function
4. **Structural Sharing** - Preserve unchanged object references (if enabled)
5. **State Update** - Dispatch `LOADER_LOADED` action to container

```typescript
// In DataLoader.tsx
const transformResult = useCallback(async (data: any) => {
  // 1. Extract subset
  if (loader.props.resultSelector) {
    data = extractParam(state, loader.props.resultSelector, appContext, data);
  }
  
  // 2. Apply custom transformation
  if (loader.props.transformResult) {
    const transform = extractParam(state, loader.props.transformResult, appContext);
    data = await transform(data);
  }
  
  return data;
}, [loader.props, state, appContext]);
```

### Paging Support

DataSource supports pagination when `prevPageSelector` and/or `nextPageSelector` are defined:

```xml
<DataSource 
  id="pagedData"
  url="/api/items?page=1"
  nextPageSelector="pagination.nextPage"
  prevPageSelector="pagination.prevPage"
/>

<Table data="{pagedData}">
  <event name="requestFetchNextPage">
    <!-- Auto-wired by ApiBoundComponent -->
  </event>
</Table>
```

Internally uses `PageableLoader` with React Query's infinite query capabilities.

## APICall Component

### Purpose and Properties

APICall creates, updates, or deletes data. Unlike DataSource, it doesn't auto-execute - requires manual trigger via `execute()` method.

**Core Properties:**
```typescript
{
  url: string;             // Required: API endpoint
  method?: string;         // HTTP method (default: "GET")
  body?: any;              // Request body
  rawBody?: string;        // Pre-serialized body
  queryParams?: object;    // URL parameters
  headers?: object;        // Request headers
  
  // Confirmation dialog
  confirmTitle?: string;
  confirmMessage?: string;
  confirmButtonLabel?: string;
  
  // Notifications
  inProgressNotificationMessage?: string;
  completedNotificationMessage?: string;
  errorNotificationMessage?: string;
}
```

**Events:**
- `beforeRequest($param, $params)` - Before execution (return `false` to cancel)
- `success($result)` - On successful response
- `error($error)` - On failure

**APIs:**
```typescript
{
  execute(...params): Promise<any>;  // Trigger API call
}
```

**Context Variables:**
- `$param` - First argument to `execute()`
- `$params` - Array of all arguments
- `$result` - Response data (in success/notification contexts)
- `$error` - Error details (in error contexts)

### Usage Patterns

**Button Click:**
```xml
<APICall id="saveUser" url="/api/users" method="POST" body="{userData}" />
<Button onClick="saveUser.execute()">Save</Button>
```

**Form Submission:**
```xml
<Form>
  <event name="submit">
    <APICall 
      url="/api/users" 
      method="POST" 
      body="{$data}"
      completedNotificationMessage="User created successfully!"
    />
  </event>
</Form>
```

**With Parameters:**
```xml
<APICall id="deleteItem" url="/api/items/{$param}" method="DELETE">
  <event name="success">
    <script>
      users.refetch();  // Refresh user list after deletion
    </script>
  </event>
</APICall>

<Button onClick="deleteItem.execute(item.id)">Delete</Button>
```

**With Confirmation:**
```xml
<APICall 
  id="deleteUser"
  url="/api/users/{$param}"
  method="DELETE"
  confirmTitle="Delete User"
  confirmMessage="Are you sure you want to delete this user?"
  confirmButtonLabel="Delete"
/>
```

**Conditional Execution:**
```xml
<APICall id="updateStatus" url="/api/status" method="PATCH">
  <event name="beforeRequest">
    <script>
      // Return false to prevent execution
      return formIsValid;
    </script>
  </event>
</APICall>
```

### Event-Based APICall

When APICall is in an event handler, ApiBoundComponent generates inline function:

```typescript
// Generated event handler
events.click = `(eventArgs, options) => {
  return Actions.callApi({
    uid: ${JSON.stringify(uid)},
    method: "POST",
    url: "/api/save",
    body: ${JSON.stringify(body)} || (options?.passAsDefaultBody ? eventArgs : undefined),
    params: { '$param': eventArgs },
    onSuccess: ${prepareEvent(success)},
    onError: ${prepareEvent(error)},
  }, { resolveBindingExpressions: true });
}`;
```

This allows seamless integration with form submissions and button clicks.

## Loader Infrastructure

### LoaderComponent

`LoaderComponent` manages individual loader lifecycle and state integration:

```typescript
export function LoaderComponent({
  node,               // Loader definition
  state,              // Container state
  dispatch,           // Container dispatcher
  registerComponentApi,
  loaderInProgressChanged,  // State update callbacks
  loaderLoaded,
  loaderError,
}) {
  const uid = useMemo(() => Symbol(node.uid), [node.uid]);
  
  // Lookup renderer based on loader type
  const renderer = componentRegistry.lookupLoaderRenderer(node.type);
  
  // Render with callbacks for state updates
  return renderer({
    loader: node,
    state,
    loaderInProgressChanged: (isInProgress) => 
      dispatch(loaderInProgressChanged(uid, isInProgress)),
    loaderLoaded: (data, pageInfo) => 
      dispatch(loaderLoaded(uid, data, pageInfo)),
    loaderError: (error) => 
      dispatch(loaderError(uid, error)),
  });
}
```

### DataLoader Implementation

`DataLoader` is the primary loader renderer, integrating React Query:

**Key Responsibilities:**
1. **Query Key Generation** - Creates unique keys for caching
2. **Data Fetching** - Uses RestApiProxy for HTTP requests
3. **State Transitions** - Dispatches loader actions to container
4. **Polling** - Implements refetch intervals
5. **Transformation** - Applies result selectors and transformers

```typescript
function DataLoader({ loader, loaderInProgressChanged, loaderLoaded, loaderError }) {
  const url = extractParam(state, loader.props.url, appContext);
  const queryParams = useShallowCompareMemoize(
    extractParam(state, loader.props.queryParams, appContext)
  );
  
  // Generate cache key
  const queryKey = useMemo(() => 
    DataLoaderQueryKeyGenerator.generate(url, queryParams, body),
    [url, queryParams, body]
  );
  
  // React Query integration
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => doLoad(signal),
    refetchInterval: loader.props.pollIntervalInSeconds * 1000,
    structuralSharing: loader.props.structuralSharing,
  });
  
  // Sync state with container
  useEffect(() => {
    loaderInProgressChanged(query.isFetching);
  }, [query.isFetching]);
  
  useEffect(() => {
    if (query.data !== undefined) {
      loaderLoaded(query.data, pageInfo);
    }
  }, [query.data]);
  
  useEffect(() => {
    if (query.error) {
      loaderError(query.error);
    }
  }, [query.error]);
}
```

### PageableLoader

Extends DataLoader for infinite pagination using React Query's `useInfiniteQuery`:

```typescript
function PageableLoader({ loader, direction }) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ signal, pageParam }) => doLoad(signal, pageParam),
    getNextPageParam: (lastPage) => 
      extractParam(state, loader.props.nextPageSelector, appContext, lastPage),
    getPreviousPageParam: (firstPage) =>
      extractParam(state, loader.props.prevPageSelector, appContext, firstPage),
  });
  
  // Register APIs
  registerComponentApi({
    fetchNextPage: query.fetchNextPage,
    fetchPrevPage: query.fetchPreviousPage,
    hasNextPage: query.hasNextPage,
    hasPrevPage: query.hasPreviousPage,
  });
}
```

## State Integration

### Container Reducer Actions

Loaders integrate with container state via actions:

```typescript
export enum ContainerActionKind {
  LOADER_IN_PROGRESS_CHANGED = "ContainerActionKind:LOADER_IN_PROGRESS_CHANGED",
  LOADER_IS_REFETCHING_CHANGED = "ContainerActionKind:LOADER_IS_REFETCHING_CHANGED",
  LOADER_LOADED = "ContainerActionKind:LOADER_LOADED",
  LOADER_ERROR = "ContainerActionKind:LOADER_ERROR",
}
```

**Reducer Handling:**
```typescript
switch (action.type) {
  case ContainerActionKind.LOADER_IN_PROGRESS_CHANGED:
    state[uid] = { ...state[uid], inProgress: action.payload.inProgress };
    break;
    
  case ContainerActionKind.LOADER_LOADED:
    state[uid] = {
      value: action.payload.data,
      byId: Array.isArray(data) ? keyBy(data, item => item.$id) : undefined,
      inProgress: false,
      loaded: true,
      pageInfo: action.payload.pageInfo,
    };
    break;
    
  case ContainerActionKind.LOADER_ERROR:
    state[uid] = { 
      ...state[uid], 
      error: action.payload.error, 
      inProgress: false, 
      loaded: true 
    };
    break;
}
```

### State Structure

Loader state in container:

```typescript
{
  [loaderUid]: {
    value: any,              // Fetched/transformed data
    byId?: Record<string, any>,  // Indexed by $id (if array)
    inProgress: boolean,     // Loading state
    isRefetching: boolean,   // Re-fetch state
    loaded: boolean,         // Has loaded
    error?: any,             // Error object
    pageInfo?: {             // Pagination info
      hasNextPage: boolean,
      hasPrevPage: boolean,
      nextPage: any,
      prevPage: any,
    }
  }
}
```

### Reactive Access

Components access loader state reactively:

```xml
<DataSource id="users" url="/api/users" />

<!-- Reactive bindings -->
<Text>{users.value.length} users</Text>
<Spinner visible="{users.inProgress}" />
<Text visible="{users.error}">Error: {users.error.message}</Text>

<!-- Programmatic access -->
<Button onClick="users.refetch()" enabled="{!users.inProgress}">
  Refresh
</Button>
```

## React Query Integration

### Query Client Configuration

XMLUI provides QueryClient in `AppWrapper`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes
      cacheTime: 10 * 60 * 1000,     // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

<QueryClientProvider client={queryClient}>
  {/* App content */}
</QueryClientProvider>
```

### Cache Key Generation

`DataLoaderQueryKeyGenerator` creates deterministic keys:

```typescript
class DataLoaderQueryKeyGenerator {
  static generate(url: string, queryParams?: any, body?: any): QueryKey {
    const parts = ['data-loader', url];
    
    if (queryParams) {
      parts.push(JSON.stringify(sortKeys(queryParams)));
    }
    
    if (body) {
      parts.push(JSON.stringify(sortKeys(body)));
    }
    
    return parts;
  }
}
```

**Example Keys:**
```typescript
['data-loader', '/api/users']
['data-loader', '/api/users', '{"role":"admin"}']
['data-loader', '/api/search', '{"query":"test"}', '{"filters":{}}']
```

### Cache Invalidation

**Automatic via Cache Keys:**
```xml
<APICall 
  url="/api/users" 
  method="POST"
  invalidates="/api/users"
/>
<!-- Invalidates all queries matching /api/users -->
```

**Manual Invalidation:**
```typescript
// In event handler
queryClient.invalidateQueries(['data-loader', '/api/users']);
```

**Optimistic Updates:**
```xml
<APICall 
  id="toggleStatus"
  url="/api/items/{$param}/toggle"
  method="PATCH"
  updates="items"
  optimisticValue="{item => ({ ...item, status: !item.status })}"
/>
```

## File Operations

### FileUpload

Handles file uploads with multipart/form-data or JSON payloads:

```xml
<FileUploadDropZone>
  <event name="uploaded">
    <FileUpload 
      url="/api/upload"
      asForm="true"
      formParams="{metadata}"
    />
  </event>
</FileUploadDropZone>
```

**Properties:**
- `url` - Upload endpoint
- `asForm` - Send as multipart/form-data (default: true)
- `formParams` - Additional form fields
- `file` - File to upload (usually from event)

### FileDownload

Triggers browser download:

```xml
<Button>
  Export
  <event name="click">
    <FileDownload 
      url="/api/export"
      fileName="data.csv"
      queryParams="{filters}"
    />
  </event>
</Button>
```

## API Interception

### ApiInterceptorProvider

Enables request mocking, stubbing, and instrumentation:

```typescript
<ApiInterceptorProvider 
  interceptor={(request) => {
    // Log request
    console.log('API Request:', request.url);
    
    // Mock response
    if (request.url === '/api/users') {
      return { data: mockUsers };
    }
    
    // Continue to real endpoint
    return null;
  }}
>
  {/* App content */}
</ApiInterceptorProvider>
```

**Use Cases:**
- Development mocking
- Testing
- Request logging
- Error simulation
- Authentication token injection

## Advanced Patterns

### Dependent Queries

```xml
<DataSource id="user" url="/api/user/{userId}" />
<DataSource 
  id="userPosts" 
  url="/api/posts?userId={user.value.id}"
/>
<!-- userPosts waits for user to load -->
```

### Conditional Loading

```xml
<DataSource 
  id="details"
  url="/api/details"
>
  <script>
    if (!showDetails) return null;  // Skip loading
  </script>
</DataSource>
```

### Mutation Chaining

```xml
<APICall id="createUser" url="/api/users" method="POST">
  <event name="success">
    <APICall url="/api/welcome-email" method="POST" body="{$result}" />
  </event>
</APICall>
```

### Error Recovery

```xml
<DataSource id="data" url="/api/data">
  <event name="error">
    <script>
      toast.error('Failed to load data. Retrying...');
      setTimeout(() => data.refetch(), 3000);
    </script>
  </event>
</DataSource>
```

### Custom Data Types

DataLoader supports specialized data types:

**CSV:**
```xml
<DataSource 
  id="csvData"
  url="/data.csv"
  dataType="csv"
/>
<!-- Auto-parsed with Papa Parse -->
```

**SQL (requires backend):**
```xml
<DataSource 
  id="sqlData"
  url="/query"
  dataType="sql"
  body="{sql: 'SELECT * FROM users WHERE active = ?', params: [true]}"
/>
```

## Performance Considerations

### Structural Sharing

Preserves object references when data unchanged:

```xml
<DataSource 
  id="items"
  url="/api/items"
  structuralSharing="true"
/>
<!-- Child components won't re-render if items unchanged -->
```

### Polling Strategy

```xml
<!-- Aggressive polling -->
<DataSource pollIntervalInSeconds="2" />  

<!-- Conservative polling -->
<DataSource pollIntervalInSeconds="60" />

<!-- Manual only -->
<DataSource />
```

### Query Key Granularity

**Coarse (shares cache broadly):**
```xml
<DataSource id="users" url="/api/users" />
<!-- All users queries share cache -->
```

**Fine (separate caches):**
```xml
<DataSource id="activeUsers" url="/api/users" queryParams="{status: 'active'}" />
<DataSource id="inactiveUsers" url="/api/users" queryParams="{status: 'inactive'}" />
<!-- Separate caches due to different query params -->
```

## Summary

XMLUI's data operation system provides:

1. **Automatic Detection** - Framework identifies API requirements and creates loaders
2. **Declarative API** - XML-based data fetching/mutation without imperative code
3. **State Integration** - Seamless connection with container reactive state
4. **Caching** - React Query integration with smart cache management
5. **Type Safety** - Proper handling of loading/error states
6. **Flexibility** - Polling, pagination, transformations, interceptors

This architecture eliminates boilerplate for async operations while maintaining full control through programmatic APIs and event hooks.

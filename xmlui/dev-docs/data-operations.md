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

## Implementation Architecture

This section provides comprehensive implementation details for developers working on the XMLUI data operations infrastructure. It documents the complete data operation pipeline from component detection through React Query integration and state updates.

### Component Detection Flow

The framework automatically detects when components require API operations through a scan-and-wrap mechanism in `ComponentAdapter.tsx`:

```typescript
// From ComponentAdapter.tsx lines 167-174
const apiBoundProps = useMemo(
  () => getApiBoundItems(safeNode.props, "DataSource", "DataSourceRef"),
  [safeNode.props],
);
const apiBoundEvents = useMemo(
  () => getApiBoundItems(safeNode.events, "APICall", "FileDownload", "FileUpload"),
  [safeNode.events],
);
const isApiBound = apiBoundProps.length > 0 || apiBoundEvents.length > 0;
```

The `getApiBoundItems()` function (lines 579-595) scans property/event hashes for plain objects whose `type` field matches known data operation types:

```typescript
function getApiBoundItems(items: Record<string, any> | undefined, ...type: string[]): string[] {
  const ret: string[] = [];
  if (!items) return ret;
  
  const entries = Object.entries(items);
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    if (isPlainObject(value) && type.includes(value.type)) {
      ret.push(key);
    }
  }
  return ret;
}
```

When `isApiBound` is true, `ComponentAdapter` delegates to `ApiBoundComponent` for transformation (lines 420-430).

### ApiBoundComponent Transformation Pipeline

`ApiBoundComponent` transforms the component definition to inject loader infrastructure. The transformation occurs in a single `useMemo` hook that processes both properties and events (lines 24-243):

#### Loader Generation for API-Bound Properties

For each API-bound property (typically the `data` prop), the component:

1. **Creates Loader Definition** - Generates a `DataLoader` component definition with unique UID:
   ```typescript
   // Lines 194-200
   loaders.push({
     type: "DataLoader",
     uid: loaderUid,
     props: operation,
     events: loaderEvents,
   });
   ```

2. **Injects Reactive Properties** - Replaces the property value with loader state bindings:
   ```typescript
   // Lines 217-227
   props[key] = `{ ${loaderUid}.value }`;
   props.loading = `{ ${loaderUid}.inProgress === undefined ? true : ${loaderUid}.inProgress}`;
   props.pageInfo = `{${loaderUid}.pageInfo}`;
   ```

3. **Registers API Methods** - Creates programmatic control methods:
   ```typescript
   // Lines 201-206
   api[`fetch_${key}`] = `() => { ${loaderUid}.refetch(); }`;
   api[`update_${key}`] = `(updaterFn) => { ${loaderUid}.update(updaterFn); }`;
   api[`addItem_${key}`] = `(element, index) => { ${loaderUid}.addItem(element, index); }`;
   api[`getItems_${key}`] = `() => { return ${loaderUid}.getItems(); }`;
   api[`deleteItem_${key}`] = `(element) => { ${loaderUid}.deleteItem(element); }`;
   ```

4. **Wires Pagination Events** - Connects loader paging APIs to component events:
   ```typescript
   // Lines 228-231
   events.requestFetchPrevPage = `${loaderUid}.fetchPrevPage()`;
   events.requestFetchNextPage = `${loaderUid}.fetchNextPage()`;
   events.requestRefetch = `()=> ${loaderUid}.refetch();`;
   ```

#### Event Handler Generation for API Actions

For API-bound events (APICall, FileUpload, FileDownload), the component generates inline handler functions that delegate to the Actions framework:

```typescript
// Lines 37-172 - generateEventHandler() function
function generateEventHandler(actionComponent: any): string {
  const { type } = actionComponent;
  
  switch (type) {
    case "APICall": {
      // Extract all APICall properties
      const { confirmTitle, headers, method, url, body, ... } = actionComponent.props;
      
      // Generate inline function that calls Actions.callApi
      return `(eventArgs, options) => {
        return Actions.callApi({
          uid: ${JSON.stringify(uid)},
          method: ${JSON.stringify(method)},
          url: ${JSON.stringify(url)},
          body: ${JSON.stringify(body)} || (options?.passAsDefaultBody ? eventArgs : undefined),
          params: { '$param': eventArgs },
          onSuccess: ${prepareEvent(success)},
          onError: ${prepareEvent(error)},
          // ... all other properties
        }, { resolveBindingExpressions: true });
      }`;
    }
    case "FileUpload": { /* similar structure */ }
    case "FileDownload": { /* similar structure */ }
  }
}
```

The `prepareEvent()` helper (lines 43-56) recursively handles nested action components, allowing chained operations like:
```xml
<APICall url="/api/create">
  <event name="success">
    <APICall url="/api/notify" body="{$result}" />
  </event>
</APICall>
```

#### Transformation Result

The transformation returns a wrapped component definition (lines 236-250) with:
- `containerUid` - Symbol identifying this API-bound container
- `apiBoundContainer: true` - Flag for rendering pipeline
- Modified `props` - Includes loader state bindings
- Modified `events` - Includes generated handlers
- `loaders` array - DataLoader component definitions
- `api` object - Programmatic control methods

### LoaderComponent Infrastructure

`LoaderComponent.tsx` serves as the bridge between component definitions and loader renderers. It manages loader lifecycle, state integration, and API registration.

#### Lifecycle Management

Each loader receives a unique symbol-based UID (line 38) and registers cleanup on unmount (lines 41-46):

```typescript
const uid = useMemo(() => Symbol(node.uid), [node.uid]);

useEffect(() => {
  return () => {
    onUnmount(uid);
  };
}, [onUnmount, uid]);
```

#### Callback Memoization

The component memoizes four critical callbacks to prevent unnecessary re-renders (lines 49-106):

1. **registerComponentApi** - Bound to this loader's UID
2. **lookupAction** - Resolves event handlers with loader context
3. **lookupSyncCallback** - Executes synchronous scripts
4. **Loader state callbacks** - Four action dispatchers:
   - `loaderInProgressChanged` - Updates loading state
   - `loaderIsRefetchingChanged` - Updates refetch state
   - `loaderLoaded` - Dispatches loaded data
   - `loaderError` - Dispatches error state

```typescript
const memoedLoaderInProgressChanged = useCallback(
  (isInProgress: boolean) => {
    dispatch(loaderInProgressChanged(uid, isInProgress));
  },
  [dispatch, uid],
);

// Similar for other callbacks...
```

#### Renderer Resolution and Invocation

The component looks up the appropriate loader renderer from the component registry (lines 108-114) and invokes it with all necessary context (lines 116-127):

```typescript
const renderer = componentRegistry.lookupLoaderRenderer(node.type);
if (!renderer) {
  console.error(`Loader ${node.type} is not available...`);
  return null;
}

return renderer({
  loader: node,
  state,
  dispatch,
  loaderInProgressChanged: memoedLoaderInProgressChanged,
  loaderIsRefetchingChanged: memoedLoaderIsRefetchingChanged,
  loaderLoaded: memoedLoaderLoaded,
  loaderError: memoedLoaderError,
  extractValue: valueExtractor,
  registerComponentApi: memoedRegisterComponentApi,
  lookupAction: memoedLookupAction,
  lookupSyncCallback: memoedLookupSyncCallback,
});
```

#### Action Creator Functions

The module exports action creators used by loader implementations (lines 130-182):

```typescript
function loaderInProgressChanged(uid: symbol, isInProgress: boolean) {
  return {
    type: ContainerActionKind.LOADER_IN_PROGRESS_CHANGED,
    payload: { uid, inProgress: isInProgress },
  };
}

function loaderLoaded(uid: symbol, data: any, pageInfo?: any) {
  return {
    type: ContainerActionKind.LOADER_LOADED,
    payload: { uid, data, pageInfo },
  };
}

// Similar for loaderIsRefetchingChanged and loaderError
```

### DataLoader Implementation

`DataLoader.tsx` implements the core data fetching logic using React Query. It handles both simple and pageable data sources, CSV/SQL data types, and integrates with the container state system.

#### Query Key Generation

Cache keys are generated using `DataLoaderQueryKeyGenerator` (lines 265-271):

```typescript
const queryId = useMemo(() => {
  return new DataLoaderQueryKeyGenerator(
    url,
    queryParams,
    appContext?.appGlobals.apiUrl,
    body,
    rawBody,
  ).asKey();
}, [appContext?.appGlobals.apiUrl, queryParams, url, body, rawBody]);
```

The generator (from `DataLoaderQueryKeyGenerator.ts`) creates deterministic keys by combining URL, query params, API URL, body, and rawBody into an array:

```typescript
constructor(url, queryParams, apiUrl, body, rawBody) {
  this.key = [url];
  if (queryParams) this.key.push(queryParams);
  if (apiUrl) this.key.push(apiUrl);
  if (body) this.key.push(body);
  if (rawBody) this.key.push(rawBody);
}
```

#### Data Fetching Pipeline

The `doLoad` callback (lines 91-262) implements the fetch logic with special handling for CSV and SQL data types:

**CSV Data Type** (lines 93-136):
```typescript
if (loader.props.dataType === "csv") {
  const response = await fetch(url, fetchOptions);
  const csvText = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
    });
  });
}
```

**SQL Data Type** (lines 137-251):
```typescript
else if (loader.props.dataType === "sql") {
  // Extract SQL query and parameters from body/rawBody
  let sqlQuery = body?.sql || JSON.parse(rawBody).sql;
  let sqlParams = body?.params || JSON.parse(rawBody).params || [];
  
  // POST to /query endpoint
  const response = await fetch(queryUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql: sqlQuery, params: sqlParams }),
  });
  
  const jsonResult = await response.json();
  return jsonResult.rows || jsonResult.results || jsonResult;
}
```

**Standard API Calls** (lines 252-260):
```typescript
else {
  return await api.execute({
    abortSignal,
    operation: loader.props as any,
    params: { ...state, $pageParams: pageParams },
    resolveBindingExpressions: true,
  });
}
```

#### Paging Direction Detection

The loader detects pagination requirements by examining selector properties (lines 80-89):

```typescript
const pagingDirection: LoaderDirections | null = useMemo(() => {
  if (loader.props.prevPageSelector && loader.props.nextPageSelector) {
    return "BIDIRECTIONAL";
  }
  if (loader.props.prevPageSelector) return "BACKWARD";
  if (loader.props.nextPageSelector) return "FORWARD";
  return null;
}, [loader.props.nextPageSelector, loader.props.prevPageSelector]);

const hasPaging = pagingDirection !== null;
```

#### State Callbacks with Toast Notifications

The loader implements three state callbacks that integrate with toast notifications (lines 274-364):

**inProgress Callback** (lines 274-300):
```typescript
const inProgress: LoaderInProgressChangedFn = useCallback(
  (isInProgress) => {
    loaderInProgressChanged(isInProgress);
    
    const inProgressMessage = extractParam(
      stateRef.current.state,
      loader.props.inProgressNotificationMessage,
      stateRef.current.appContext,
    );
    
    if (isInProgress && inProgressMessage) {
      if (loadingToastIdRef.current) {
        toast.dismiss(loadingToastIdRef.current);
      }
      loadingToastIdRef.current = toast.loading(inProgressMessage);
    } else {
      if (loadingToastIdRef.current) {
        toast.dismiss(loadingToastIdRef.current);
      }
    }
  },
  [loader.props.inProgressNotificationMessage, loaderInProgressChanged],
);
```

**loaded Callback** (lines 302-331):
```typescript
const loaded: LoaderLoadedFn = useCallback(
  (data, pageInfo) => {
    loaderLoaded(data, pageInfo);
    
    const completedMessage = extractParam(
      { ...stateRef.current.state, $result: data },
      loader.props.completedNotificationMessage,
      stateRef.current.appContext,
    );
    
    if (completedMessage) {
      toast.success(completedMessage, { id: loadingToastIdRef.current });
    } else if (loadingToastIdRef.current) {
      toast.dismiss(loadingToastIdRef.current);
    }
  },
  [loader.props.completedNotificationMessage, loaderLoaded],
);
```

**error Callback** (lines 333-364):
```typescript
const error: LoaderErrorFn = useCallback(
  async (error) => {
    loaderError(error);
    
    if (onError) {
      const result = await onError(createContextVariableError(error));
      if (result === false) {
        if (loadingToastIdRef.current) {
          toast.dismiss(loadingToastIdRef.current);
        }
        return;
      }
    }
    
    const errorMessage = extractParam(
      { ...stateRef.current.state, $error: createContextVariableError(error) },
      loader.props.errorNotificationMessage,
      stateRef.current.appContext,
    );
    
    if (errorMessage) {
      toast.error(errorMessage, { id: loadingToastIdRef.current });
    } else if (loadingToastIdRef.current) {
      toast.dismiss(loadingToastIdRef.current);
    }
    
    if (errorMessage === undefined) {
      appContext.signError(error as Error);
    }
  },
  [appContext, loader.props.errorNotificationMessage, loaderError, onError],
);
```

#### Loader Delegation

The final step delegates to either `PageableLoader` or `Loader` based on paging requirements (lines 367-399):

```typescript
return hasPaging ? (
  <PageableLoader
    queryId={queryId}
    key={queryId?.join("")}
    loaderFn={doLoad}
    pollIntervalInSeconds={pollIntervalInSeconds}
    // ... all state callbacks and props
  />
) : (
  <Loader
    queryId={queryId}
    key={queryId?.join("")}
    loaderFn={doLoad}
    pollIntervalInSeconds={pollIntervalInSeconds}
    // ... all state callbacks and props
  />
);
```

### Loader and PageableLoader: React Query Integration

Both `Loader.tsx` and `PageableLoader.tsx` wrap React Query hooks (`useQuery` and `useInfiniteQuery`) to integrate with XMLUI's state system.

#### Loader: Simple Data Fetching

`Loader` uses `useQuery` for non-paginated data (lines 60-114):

```typescript
const { data, status, isFetching, isLoading, error, refetch, isRefetching } = useQuery({
  queryKey: useMemo(
    () => (queryId ? queryId : [uid, extractParam(state, loader.props, appContext)]),
    [appContext, loader.props, queryId, state, uid],
  ),
  structuralSharing,
  enabled: initialized, // Wait for API interceptor
  
  queryFn: useCallback<QueryFunction>(
    async ({ signal }) => {
      const newVar: any = await loaderFn(signal);
      return newVar === undefined ? null : newVar;
    },
    [loaderFn],
  ),
  
  select: useCallback(
    (data: any) => {
      let result = data;
      const resultSelector = loader.props.resultSelector;
      
      if (resultSelector) {
        result = extractParam(
          { $response: data },
          resultSelector.startsWith("{") ? resultSelector : `{$response.${resultSelector}}`,
        );
      }
      
      return transformResult ? transformResult(result) : result;
    },
    [loader.props.resultSelector, transformResult],
  ),
  
  retry: false,
});
```

**Key Query Options:**
- `queryKey` - Cache key (from queryId or generated)
- `structuralSharing` - Preserve unchanged object references (default: true)
- `enabled` - Waits for API interceptor initialization
- `queryFn` - Executes the loader function with abort signal
- `select` - Applies resultSelector and transformResult
- `retry: false` - Disables automatic retry on error

#### State Synchronization

Three `useIsomorphicLayoutEffect` hooks sync query state to container state (lines 126-153):

```typescript
// Sync loading state
useIsomorphicLayoutEffect(() => {
  loaderInProgressChanged(isFetching || isLoading);
}, [isLoading, isFetching, loaderInProgressChanged]);

// Sync refetching state
useIsomorphicLayoutEffect(() => {
  loaderIsRefetchingChanged(isRefetching);
}, [isRefetching, loaderIsRefetchingChanged]);

// Sync data and errors
useIsomorphicLayoutEffect(() => {
  if (status === "success" && data !== prevData) {
    loaderLoaded(data);
    setTimeout(() => {
      onLoaded?.(data, isRefetching);
    }, 0);
  } else if (status === "error" && error !== prevError) {
    loaderError(error);
  }
}, [data, error, loaderError, loaderLoaded, onLoaded, prevData, prevError, status, isRefetching]);
```

The `setTimeout` in the success handler pushes `onLoaded` to the next event loop, ensuring the loader value is accessible in the container state before the callback executes.

#### Polling Implementation

Polling is implemented with a manual interval that calls `refetch()` (lines 116-124):

```typescript
useEffect(() => {
  let intervalId: NodeJS.Timeout;
  if (pollIntervalInSeconds) {
    intervalId = setInterval(() => {
      void refetch();
    }, pollIntervalInSeconds * 1000);
  }
  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}, [pollIntervalInSeconds, refetch]);
```

#### API Registration

The loader registers programmatic APIs for imperatively controlling data (lines 161-197):

```typescript
useEffect(() => {
  registerComponentApi?.({
    refetch: (options) => {
      void refetch(options);
    },
    
    update: async (updater) => {
      const oldData = appContext.queryClient?.getQueryData(queryId!) as any[];
      if (!oldData) return; // Loader not loaded yet
      
      const draft = createDraft(oldData);
      const ret = await updater(draft);
      const newData = ret || finishDraft(draft);
      
      if (oldData.length !== newData.length) {
        throw new Error("Use this method for update only...");
      }
      
      appContext.queryClient?.setQueryData(queryId!, newData);
    },
    
    addItem: (element: any, indexToInsert?: number) => {
      const oldData = appContext.queryClient?.getQueryData(queryId!) as any[];
      const draft = createDraft(oldData);
      
      if (indexToInsert === undefined) {
        draft.push(element);
      } else {
        draft.splice(indexToInsert, 0, element);
      }
      
      const newData = finishDraft(draft);
      appContext.queryClient?.setQueryData(queryId!, newData);
    },
    
    getItems: () => data,
    deleteItem: (element: any) => { throw new Error("not implemented"); },
  });
}, [appContext.queryClient, queryId, refetch, registerComponentApi, data]);
```

The `update` and `addItem` methods use Immer's `createDraft` and `finishDraft` to enable immutable updates with mutable syntax.

#### PageableLoader: Infinite Query Integration

`PageableLoader` uses `useInfiniteQuery` for paginated data (lines 96-141):

```typescript
const {
  data, status, error,
  hasNextPage, isFetchingNextPage,
  hasPreviousPage, isFetchingPreviousPage,
  isFetching, refetch, isRefetching,
  fetchPreviousPage, fetchNextPage,
} = useInfiniteQuery({
  queryKey,
  
  queryFn: useCallback<QueryFunction>(
    async ({ signal, pageParam }) => {
      return await loaderFn(signal, pageParam);
    },
    [loaderFn],
  ),
  
  structuralSharing,
  
  select: useCallback(
    (data: any) => {
      // Flatten pages into single array
      let result = data ? data.pages.flatMap((d) => d) : [];
      
      const resultSelector = loader.props.resultSelector;
      if (resultSelector) {
        result = extractParam(
          { $response: result },
          resultSelector.startsWith("{") ? resultSelector : `{$response.${resultSelector}}`,
        );
      }
      
      return transformResult ? transformResult(result) : result;
    },
    [loader.props.resultSelector, transformResult],
  ),
  
  getPreviousPageParam: loader.props.prevPageSelector === undefined 
    ? undefined 
    : getPreviousPageParam,
    
  getNextPageParam: loader.props.nextPageSelector === undefined 
    ? undefined 
    : getNextPageParam,
});
```

**Page Parameter Extractors** (lines 61-93):

```typescript
const getPreviousPageParam = useCallback(
  (firstPage: any) => {
    const prevPageSelector = loader.props.prevPageSelector;
    if (!prevPageSelector) return undefined;
    
    const prevPageParam = extractParam(
      { $response: firstPage.filter((item) => !item._optimisticValue) },
      prevPageSelector.startsWith("{") ? prevPageSelector : `{$response.${prevPageSelector}}`,
    );
    
    return prevPageParam ? { prevPageParam } : undefined;
  },
  [loader.props.prevPageSelector],
);

const getNextPageParam = useCallback(
  (lastPage: any) => {
    const nextPageSelector = loader.props.nextPageSelector;
    if (!nextPageSelector) return undefined;
    
    const nextPageParam = extractParam(
      { $response: lastPage },
      nextPageSelector.startsWith("{") ? nextPageSelector : `{$response.${nextPageSelector}}`,
    );
    
    return nextPageParam ? { nextPageParam } : undefined;
  },
  [loader.props.nextPageSelector],
);
```

**Page Info Construction** (lines 182-191):

```typescript
const pageInfo = useMemo(() => {
  return {
    hasPrevPage: hasPreviousPage,
    isFetchingPrevPage: isFetchingPreviousPage,
    hasNextPage,
    isFetchingNextPage,
  };
}, [hasNextPage, hasPreviousPage, isFetchingNextPage, isFetchingPreviousPage]);
```

**API Registration** (lines 231-289):

```typescript
useEffect(() => {
  registerComponentApi({
    fetchPrevPage: () => fetchPreviousPage(),
    fetchNextPage: () => fetchNextPage(),
    
    refetch: (options) => void refetch(options),
    
    update: async (updater) => {
      const oldData = appContext.queryClient?.getQueryData(queryId!) as InfiniteData<any[]>;
      if (!oldData) return;
      
      const originalFlatItems = oldData.pages.flatMap((d) => d);
      const draft = createDraft(oldData);
      const flatItems = [];
      
      for (let i = 0; i < draft.pages.length; i++) {
        const page = draft.pages[i];
        await updater(page);
        flatItems.push(...page);
      }
      
      if (flatItems.length !== originalFlatItems.length) {
        throw new Error("Use this method for update only...");
      }
      
      const newData = finishDraft(draft);
      appContext.queryClient?.setQueryData(queryId!, newData);
    },
    
    addItem: (element: any, indexToInsert?: number) => {
      const oldData = appContext.queryClient?.getQueryData(queryId!) as InfiniteData<any[]>;
      const draft = createDraft(oldData);
      
      if (indexToInsert === undefined) {
        draft.pages[draft.pages.length - 1].push(element);
      } else {
        throw new Error("not implemented");
      }
      
      const newData = finishDraft(draft);
      appContext.queryClient?.setQueryData(queryId!, newData);
    },
    
    getItems: () => data,
    deleteItem: (element: any) => { throw new Error("not implemented"); },
  });
}, [/* dependencies */]);
```

**Cache Management on Unmount** (lines 143-163):

PageableLoader clears all pages except the last one on unmount to prevent refetching all pages on remount:

```typescript
useEffect(() => {
  const queryKey = thizRef.current;
  return () => {
    void appContext.queryClient?.cancelQueries(queryKey);
    appContext.queryClient?.setQueryData(queryKey, (old) => {
      if (!old) return old;
      
      return produce(old, (draft: any) => {
        draft.pages = draft.pages.length ? [draft.pages[draft.pages.length - 1]] : [];
        draft.pageParams = [];
      });
    });
    loaderLoaded(undefined, undefined);
  };
}, [appContext.queryClient, loaderLoaded, uid]);
```

### APICall Action Implementation

`APICall.tsx` (the action implementation in `components-core/action/`) implements the `callApi` function that executes API mutations with optimistic updates, confirmations, and cache invalidation.

#### Function Signature and Options

The `callApi` function signature (lines 257-307):

```typescript
export async function callApi(
  { state, appContext, lookupAction, getCurrentState, apiInstance }: ActionExecutionContext,
  {
    confirmTitle,
    confirmMessage,
    confirmButtonLabel,
    params = {},
    onBeforeRequest,
    onSuccess,
    onError,
    invalidates,
    updates,
    optimisticValue,
    payloadType,
    when,
    getOptimisticValue,
    inProgressNotificationMessage,
    completedNotificationMessage,
    errorNotificationMessage,
    uid: actionUid,
    onProgress,
    
    // Operation properties
    headers,
    url,
    queryParams,
    rawBody,
    method,
    body,
  }: APICall,
  { resolveBindingExpressions }: ApiActionOptions = {},
)
```

#### Execution Pipeline

**1. Conditional Execution** (lines 309-315):
```typescript
const uid = typeof actionUid === "symbol" ? actionUid : Symbol(actionUid);
const stateContext = { ...state, ...params };

if (!shouldKeep(when, stateContext, appContext)) {
  return; // Skip execution if when condition is false
}
```

**2. Confirmation Dialog** (lines 316-327):
```typescript
if (confirmTitle || confirmMessage || confirmButtonLabel) {
  const title = extractParam(stateContext, confirmTitle, appContext);
  const message = extractParam(stateContext, confirmMessage, appContext);
  const buttonLabel = extractParam(stateContext, confirmButtonLabel, appContext);
  
  const dialogCheck = await appContext.confirm(
    title ?? "Confirm Operation",
    message ?? "Are you sure you want to perform this operation?",
    buttonLabel ?? "Yes",
  );
  
  if (!dialogCheck) return;
}
```

**3. beforeRequest Hook** (lines 331-336):
```typescript
const beforeRequestFn = lookupAction(onBeforeRequest, uid);
const beforeRequestResult = await beforeRequestFn?.();

if (typeof beforeRequestResult === "boolean" && beforeRequestResult === false) {
  return; // Cancel execution if beforeRequest returns false
}
```

**4. Optimistic Updates** (lines 338-348):

The `updateQueriesWithOptimisticValue` helper (lines 216-254) finds matching queries and applies optimistic values:

```typescript
const { queryKeysToUpdate, optimisticValuesByQueryKeys } = 
  await updateQueriesWithOptimisticValue({
    stateContext,
    updates,
    appContext,
    queryClient: appContext.queryClient!,
    clientTxId,
    optimisticValue,
    lookupAction,
    getOptimisticValue,
    uid,
  });
```

This helper:
- Finds all queries matching the `updates` URL pattern
- Prepares optimistic values (either resolved or computed via `getOptimisticValue`)
- Marks values with `_optimisticValue: true` and `_initiatorClientTxId`
- Applies updates to query cache using Immer

**5. Progress Notification** (lines 350-354):
```typescript
const inProgressMessage = extractParam(stateContext, inProgressNotificationMessage, appContext);

let loadingToastId;
if (inProgressMessage) {
  loadingToastId = toast.loading(inProgressMessage);
}
```

**6. API Execution** (lines 355-371):
```typescript
try {
  const operation: ApiOperationDef = {
    headers, url, queryParams, rawBody, method, body, payloadType,
  };
  
  const _onProgress = lookupAction(onProgress, uid, { eventName: "progress" });
  
  const result = await new RestApiProxy(appContext, apiInstance).execute({
    operation,
    params: stateContext,
    transactionId: clientTxId,
    resolveBindingExpressions,
    onProgress: _onProgress,
  });
```

**7. Success Handling** (lines 373-377):
```typescript
  const onSuccessFn = lookupAction(onSuccess, uid, {
    eventName: "success",
    context: getCurrentState()
  });
  await onSuccessFn?.(result, stateContext["$param"]);
```

**8. Query Updates** (lines 379-387):

The `updateQueriesWithResult` helper (lines 128-178) replaces optimistic values with real results:

```typescript
  updateQueriesWithResult(
    queryKeysToUpdate,
    optimisticValuesByQueryKeys,
    clientTxId,
    appContext.queryClient!,
    result,
  );
  
  if (resolvedInvalidates || !updates) {
    await invalidateQueries(resolvedInvalidates, appContext, state);
  }
```

**9. Completion Notification** (lines 388-397):
```typescript
  const completedMessage = extractParam(
    { ...stateContext, $result: result },
    completedNotificationMessage,
    appContext,
  );
  
  if (completedMessage) {
    toast.success(completedMessage, { id: loadingToastId });
  } else if (loadingToastId) {
    toast.dismiss(loadingToastId);
  }
  
  return result;
```

**10. Error Handling** (lines 398-418):
```typescript
} catch (e: any) {
  // Rollback optimistic updates
  if (optimisticValuesByQueryKeys.size) {
    await appContext.queryClient!.invalidateQueries();
  }
  
  const onErrorFn = lookupAction(onError, uid, { eventName: "error" });
  const result = await onErrorFn?.(e, stateContext["$param"]);
  
  const errorMessage = extractParam(
    { ...stateContext, $error: createContextVariableError(e) },
    errorNotificationMessage,
    appContext,
  );
  
  if (errorMessage) {
    toast.error(errorMessage, { id: loadingToastId });
  } else {
    if (loadingToastId) toast.dismiss(loadingToastId);
    if (result !== false) throw e; // Re-throw unless error handler returns false
  }
}
```

#### Optimistic Update Implementation

**prepareOptimisticValue** (lines 38-44):
```typescript
function prepareOptimisticValue(value: any, clientTxId: string) {
  return {
    ...value,
    id: value.id || clientTxId,
    _optimisticValue: true,
    _initiatorClientTxId: clientTxId,
  };
}
```

**prepareOptimisticValuesForQueries** (lines 46-73):
```typescript
async function prepareOptimisticValuesForQueries(
  queryKeys: Array<QueryKey>,
  queryClient: QueryClient,
  clientTxId: string,
  stateContext: any,
  resolvedOptimisticValue?: any,
  optimisticValueGetter?: AsyncFunction,
) {
  const ret: Map<QueryKey, any> = new Map();
  
  await Promise.all(
    queryKeys.map(async (queryKey) => {
      if (resolvedOptimisticValue) {
        ret.set(queryKey, prepareOptimisticValue(resolvedOptimisticValue, clientTxId));
        return;
      }
      
      if (!optimisticValueGetter) return;
      
      const currentData = queryClient.getQueryData(queryKey) as any;
      const flatData = currentData?.pages
        ? currentData.pages.flatMap((page: any) => page)
        : currentData;
        
      const optimisticValue = await optimisticValueGetter(flatData, stateContext["$param"]);
      if (optimisticValue) {
        ret.set(queryKey, prepareOptimisticValue(optimisticValue, clientTxId));
      }
    }),
  );
  
  return ret;
}
```

**doOptimisticUpdate** (lines 75-108):
```typescript
async function doOptimisticUpdate(
  optimisticValuesByQueryKeys: Map<QueryKey, any>,
  queryClient: QueryClient,
) {
  if (!optimisticValuesByQueryKeys.size) return;
  
  for (const entry of optimisticValuesByQueryKeys.entries()) {
    const [key, optimisticValue] = entry;
    await queryClient.cancelQueries({ queryKey: key });
    const oldData = queryClient.getQueryData(key) as any;
    
    const draft = createDraft(oldData as any);
    
    if (draft.pages) {
      // Pageable loader
      let updated = false;
      draft.pages.forEach((page: any) => {
        page.forEach((item: any) => {
          if (item.id === optimisticValue.id) {
            Object.assign(item, optimisticValue);
            updated = true;
          }
        });
      });
      if (!updated) {
        draft.pages[draft.pages.length - 1].push(optimisticValue);
      }
    } else {
      // Simple loader
      let updated = false;
      draft.forEach((item: any) => {
        if (item.id === optimisticValue.id) {
          Object.assign(item, optimisticValue);
          updated = true;
        }
      });
      if (!updated) {
        draft.push(optimisticValue);
      }
    }
    
    const newData = finishDraft(draft);
    queryClient.setQueryData(key, newData);
  }
}
```

**updateQueriesWithResult** (lines 110-178):

Similar structure to `doOptimisticUpdate`, but replaces optimistic values with real results by matching `_initiatorClientTxId`.

### APICallNative Component

The `APICallNative` component (from `components/APICall/APICallNative.tsx`) provides the React component interface for APICall. It's a thin wrapper that registers the `execute` API and delegates to the `callApi` action implementation.

#### Implementation (lines 19-51):

```typescript
export function APICallNative({ registerComponentApi, node, uid }: Props) {
  const execute = useEvent(
    async (executionContext: ActionExecutionContext, ...eventArgs: any[]) => {
      const options = eventArgs[1];
      
      return await callApi(
        executionContext,
        {
          ...node.props,
          body: node.props.body || (options?.passAsDefaultBody ? eventArgs[0] : undefined),
          uid: uid,
          params: { $param: eventArgs[0], $params: eventArgs },
          onError: node.events?.error,
          onProgress: node.events?.progress,
          onBeforeRequest: node.events?.beforeRequest,
          onSuccess: node.events?.success,
        },
        {
          resolveBindingExpressions: true,
        },
      );
    },
  );
  
  useEffect(() => {
    registerComponentApi({
      execute: execute,
      _SUPPORT_IMPLICIT_CONTEXT: true,
    });
  }, [execute, registerComponentApi]);
  
  return null;
}
```

**Key Points:**
- Uses `useEvent` to create stable function reference
- Constructs `$param` and `$params` context variables from arguments
- Sets `_SUPPORT_IMPLICIT_CONTEXT: true` to enable implicit execution context injection
- Returns `null` (non-visual component)

### Container State Integration

The container reducer (from `rendering/reducer.ts`) handles loader action types to update container state.

#### Action Types (from `containers.ts` lines 5-9):

```typescript
export const enum ContainerActionKind {
  LOADER_LOADED = "ContainerActionKind:LOADER_LOADED",
  LOADER_IN_PROGRESS_CHANGED = "ContainerActionKind:LOADER_IN_PROGRESS_CHANGED",
  LOADER_IS_REFETCHING_CHANGED = "ContainerActionKind:LOADER_IS_REFETCHING_CHANGED",
  LOADER_ERROR = "ContainerActionKind:LOADER_ERROR",
  // ... other action types
}
```

#### Reducer Cases (from `reducer.ts` lines 44-71):

```typescript
switch (action.type) {
  case ContainerActionKind.LOADER_IN_PROGRESS_CHANGED: {
    state[uid] = { ...state[uid], inProgress: action.payload.inProgress };
    storeNextValue(state[uid]);
    break;
  }
  
  case ContainerActionKind.LOADER_IS_REFETCHING_CHANGED: {
    state[uid] = { ...state[uid], isRefetching: action.payload.isRefetching };
    storeNextValue(state[uid]);
    break;
  }
  
  case ContainerActionKind.LOADER_LOADED: {
    const { data, pageInfo } = action.payload;
    state[uid] = {
      value: data,
      byId: Array.isArray(data) ? keyBy(data, (item) => item.$id) : undefined,
      inProgress: false,
      loaded: data !== undefined,
      pageInfo,
    };
    storeNextValue(state[uid]);
    break;
  }
  
  case ContainerActionKind.LOADER_ERROR: {
    const { error } = action.payload;
    state[uid] = { ...state[uid], error, inProgress: false, loaded: true };
    storeNextValue(state[uid]);
    break;
  }
}
```

**State Structure:**

```typescript
{
  [loaderUid]: {
    value: any,              // Fetched/transformed data
    byId?: Record<string, any>,  // Indexed by $id (if array)
    inProgress: boolean,     // Loading state
    isRefetching: boolean,   // Re-fetch state
    loaded: boolean,         // Has loaded
    error?: any,             // Error object
    pageInfo?: {             // Pagination info (if applicable)
      hasPrevPage: boolean,
      isFetchingPrevPage: boolean,
      hasNextPage: boolean,
      isFetchingNextPage: boolean,
    }
  }
}
```

The `byId` index is automatically created when data is an array, using each item's `$id` property. This enables efficient lookups without searching.

### Complete Data Operation Flow

**Example: Table with DataSource**

```xml
<DataSource id="users" url="/api/users" />
<Table data="{users}" />
```

**Pipeline Execution:**

1. **Detection** (ComponentAdapter)
   - Scans Table props, finds `data` references DataSource
   - Sets `isApiBound = true`
   - Delegates to ApiBoundComponent

2. **Transformation** (ApiBoundComponent)
   - Generates loader UID: `table_123_data_users`
   - Creates DataLoader definition with url="/api/users"
   - Replaces `data` prop: `data="{table_123_data_users.value}"`
   - Injects `loading="{table_123_data_users.inProgress}"`
   - Registers APIs: `fetch_data()`, `update_data()`, etc.

3. **Rendering** (ComponentWrapper → ContainerWrapper)
   - Wraps Table in StateContainer
   - Renders LoaderComponent for DataLoader

4. **Loader Execution** (LoaderComponent → DataLoader → Loader)
   - Creates query key: `["/api/users"]`
   - Calls `useQuery` with RestApiProxy fetch
   - Query executes HTTP request

5. **State Updates** (Loader → LoaderComponent → Container Reducer)
   - `loaderInProgressChanged(true)` → `state[uid].inProgress = true`
   - HTTP completes with data
   - `loaderLoaded(data)` → `state[uid].value = data`, `state[uid].inProgress = false`

6. **Reactive Re-render** (Table)
   - Table re-renders with `data={state[uid].value}`
   - `loading={state[uid].inProgress}` updates to false

**Example: Button with APICall**

```xml
<Button>
  Save
  <event name="click">
    <APICall url="/api/save" method="POST" body="{formData}" />
  </event>
</Button>
```

**Pipeline Execution:**

1. **Detection** (ComponentAdapter)
   - Scans Button events, finds `click` contains APICall
   - Sets `isApiBound = true`

2. **Event Handler Generation** (ApiBoundComponent)
   - Generates inline function:
     ```javascript
     events.click = `(eventArgs, options) => {
       return Actions.callApi({
         uid: "...",
         method: "POST",
         url: "/api/save",
         body: formData,
         params: { $param: eventArgs },
       }, { resolveBindingExpressions: true });
     }`;
     ```

3. **Runtime Click**
   - User clicks button
   - Event handler executes
   - Calls `Actions.callApi()` (from action registry)

4. **API Execution** (callApi function)
   - Shows loading toast
   - Executes POST via RestApiProxy
   - Awaits response
   - Shows success/error toast
   - Invalidates related queries

## Summary

XMLUI's data operation system provides:

1. **Automatic Detection** - Framework identifies API requirements and creates loaders
2. **Declarative API** - XML-based data fetching/mutation without imperative code
3. **State Integration** - Seamless connection with container reactive state
4. **Caching** - React Query integration with smart cache management
5. **Type Safety** - Proper handling of loading/error states
6. **Flexibility** - Polling, pagination, transformations, interceptors

**Key Implementation Components:**

| Component | Role |
|-----------|------|
| **getApiBoundItems** | Scans component definitions for DataSource/APICall references |
| **ApiBoundComponent** | Transforms components by generating loaders and event handlers |
| **LoaderComponent** | Manages loader lifecycle, state callbacks, and renderer lookup |
| **DataLoader** | Implements data fetching with CSV/SQL support and pagination detection |
| **Loader** | Wraps `useQuery` for simple data fetching with state synchronization |
| **PageableLoader** | Wraps `useInfiniteQuery` for paginated data with page management |
| **callApi** | Executes API mutations with optimistic updates and cache invalidation |
| **APICallNative** | React component wrapper that registers `execute()` API |
| **Container Reducer** | Updates container state based on loader actions |
| **DataLoaderQueryKeyGenerator** | Generates deterministic cache keys for React Query |

This architecture eliminates boilerplate for async operations while maintaining full control through programmatic APIs and event hooks.

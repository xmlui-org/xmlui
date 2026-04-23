# Data Operations & Loaders

Internal architecture for DataSource, APICall, and file operations. For user-facing markup patterns, see `.ai/xmlui/data.md`.

## Architecture Overview

**Two categories of data components:**
- **Query components** (`DataSource`) — declarative, fetched automatically, cached via React Query `useQuery`
- **Mutation components** (`APICall`, `FileUpload`, `FileDownload`) — imperative, triggered by events, executed via `Actions.callApi()`

**Key pipeline:**
```
Markup (DataSource/APICall) → ApiBoundComponent detects → creates LoaderDefs/EventHandlers
→ LoaderComponent mounts → React Query useQuery/useMutation → loaderLoaded/loaderError dispatch
→ Container reducer updates state[uid] → reactive re-render → {loaderName.value}
```

## Key Files

| File | Role |
|------|------|
| `components-core/ApiBoundComponent.tsx` | Detects API-bound props/events; generates loader defs and event handler code |
| `components-core/LoaderComponent.tsx` | Mounts a loader inside the container; bridges React Query callbacks to reducer dispatch |
| `components-core/loader/Loader.tsx` | `useQuery` wrapper; handles polling, result selection, transform |
| `components-core/loader/DataLoader.tsx` | Full-featured loader (fetch + transform + pagination detection) |
| `components-core/loader/ApiLoader.tsx` | Simple GET-only loader |
| `components-core/loader/ExternalDataLoader.tsx` | POST-based loader for external APIs |
| `components-core/loader/PageableLoader.tsx` | `useInfiniteQuery` wrapper for cursor/page-based pagination |
| `components-core/loader/MockLoaderRenderer.tsx` | Development mock data loader |
| `components-core/action/APICall.tsx` | APICall execution: fetch + optimistic updates + cache invalidation + event chains |
| `components-core/action/FileUploadAction.tsx` | Chunked file upload via FormData |
| `components-core/action/FileDownloadAction.tsx` | File download via iframe (GET) or anchor (other) |
| `components-core/rendering/containers.ts` | `ContainerActionKind` enum |
| `components-core/rendering/reducer.ts` | Container reducer: LOADER_LOADED, LOADER_ERROR, etc. |
| `components-core/utils/DataLoaderQueryKeyGenerator.ts` | React Query cache key builder |
| `components-core/utils/actionUtils.ts` | `invalidateQueries()` utility |
| `components-core/RestApiProxy.ts` | HTTP request abstraction |
| `components/DataSource/DataSource.tsx` | DataSource component metadata |
| `components/APICall/APICall.tsx` | APICall component metadata |
| `components/APICall/APICallNative.tsx` | APICall native with deferred polling |

## ApiBoundComponent — The Transform Layer

`ApiBoundComponent` is a React component that sits between the renderer and the actual native component. When a component node has API-bound props (DataSource refs) or API-bound events (APICall, FileUpload, FileDownload), the renderer wraps it in `ApiBoundComponent` instead of rendering directly.

**Detection:**
```typescript
const apiBoundProps = getApiBoundItems(node.props, "DataSource", "DataSourceRef");
const apiBoundEvents = getApiBoundItems(node.events, "APICall", "FileDownload", "FileUpload");
if (apiBoundProps.length || apiBoundEvents.length) {
  return <ApiBoundComponent node={node} ... />;
}
```

**What it produces:**
- For each `DataSource` prop: creates a `LoaderDef`, rewrites the prop to `{ loaderUid.value }`
- For each `APICall` event: generates an event handler string that calls `Actions.callApi(...)`
- For each `FileUpload` event: generates a handler calling `Actions.uploadFile(...)`
- For each `FileDownload` event: generates a handler calling `Actions.downloadFile(...)`

The generated event handler code is injected as a string that is later evaluated by the scripting engine.

## ContainerActionKind Enum

```typescript
export const enum ContainerActionKind {
  LOADER_LOADED               = "ContainerActionKind:LOADER_LOADED",
  LOADER_IN_PROGRESS_CHANGED  = "ContainerActionKind:LOADER_IN_PROGRESS_CHANGED",
  LOADER_IS_REFETCHING_CHANGED= "ContainerActionKind:LOADER_IS_REFETCHING_CHANGED",
  LOADER_ERROR                = "ContainerActionKind:LOADER_ERROR",
  EVENT_HANDLER_STARTED       = "ContainerActionKind:EVENT_HANDLER_STARTED",
  EVENT_HANDLER_COMPLETED     = "ContainerActionKind:EVENT_HANDLER_COMPLETED",
  EVENT_HANDLER_ERROR         = "ContainerActionKind:EVENT_HANDLER_ERROR",
  COMPONENT_STATE_CHANGED     = "ContainerActionKind:COMPONENT_STATE_CHANGED",
  STATE_PART_CHANGED          = "ContainerActionKind:STATE_PART_CHANGED",
}
```

## Loader State in Container

Each loader `uid` gets a dedicated slot in container state:

```typescript
interface LoaderState {
  value: any;                              // Transformed response data (alias: $data, $result)
  byId: Record<string, any> | undefined;  // Index by $id if value is array
  inProgress: boolean;                     // Currently fetching
  isRefetching: boolean;                   // Background refetch in progress
  loaded: boolean;                         // True after first successful fetch
  error: Error | null;                     // Error from last fetch attempt
  pageInfo?: {
    hasPrevPage: boolean;
    isFetchingPrevPage: boolean;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
  };
  responseHeaders?: Record<string, string>;
}
```

**Reducer transitions:**

| Action | State changes |
|--------|--------------|
| `LOADER_IN_PROGRESS_CHANGED` | `inProgress = payload.inProgress` |
| `LOADER_IS_REFETCHING_CHANGED` | `isRefetching = payload.isRefetching` |
| `LOADER_LOADED` | `value = data`, `byId` (if array), `inProgress = false`, `loaded = true`, `pageInfo`, `responseHeaders` |
| `LOADER_ERROR` | `error = payload.error`, `inProgress = false`, `loaded = true` |

## React Query Integration

**DataLoader** (standard queries):
```typescript
useQuery({
  queryKey: [uid, extractParam(state, loader.props, appContext)],
  queryFn: async ({ signal }) => loaderFn(signal),
  select: (data) => applyResultSelectorAndTransform(data),
  structuralSharing: true,
  enabled: initialized,
  retry: false,
})
```

**PageableLoader** (cursor/page pagination):
```typescript
useInfiniteQuery({
  queryKey,
  queryFn: async ({ signal, pageParam }) => loaderFn(signal, pageParam),
  getPreviousPageParam: (firstPage) => extractSelector(firstPage, prevPageSelector),
  getNextPageParam: (lastPage) => extractSelector(lastPage, nextPageSelector),
  structuralSharing: true,
})
```

**Cache key structure** (`DataLoaderQueryKeyGenerator`):
```
[baseUrl, queryParams?, apiUrl?, body?, rawBody?]

// Example: GET /api/users?page=2 with apiUrl=https://api.example.com
// Key: ["/api/users", { page: 2 }, "https://api.example.com"]
```

## Polling

`DataSource` polling uses `setInterval` calling `refetch()` (NOT React Query's built-in `refetchInterval` — XMLUI implements its own):

```typescript
useEffect(() => {
  if (!pollIntervalInSeconds) return;
  const id = setInterval(() => void refetch(), pollIntervalInSeconds * 1000);
  return () => clearInterval(id);
}, [pollIntervalInSeconds, refetch]);
```

Prop: `pollIntervalInSeconds` (number, seconds).

## Result Processing Pipeline

```
Raw HTTP response
  → JSON parse
  → resultSelector  (lodash path: "data.items" → response.$response.data.items)
  → transformResult (custom function: "(items) => items.filter(...)")
  → structural sharing (React Query preserves unchanged refs)
  → LOADER_LOADED dispatch → state[uid].value
```

- `resultSelector`: extracts a subtree. String path (`"data.items"`) is converted to `{$response.data.items}`; expression form (`"{$response.data.items}"`) used as-is.
- `transformResult`: async function expression applied after selector. Receives the (post-selector) data.

## Cache Invalidation

`invalidates` prop on APICall triggers `queryClient.invalidateQueries()` after a successful mutation:

```typescript
// In actionUtils.ts:
invalidateQueries(invalidates, appContext, state)
// If invalidates is undefined → invalidates ALL queries
// If string/string[] → builds DataLoaderQueryKeyGenerator.asPredicate() per URL
```

The predicate matches any cached query whose key starts with the same base URL (ignoring query params). This means `invalidates="/api/users"` also invalidates `/api/users?page=2`.

## Optimistic Updates

`updates` + `optimisticValue` / `getOptimisticValue` props on APICall:

1. Find all cached query keys matching `updates` URL pattern
2. Snapshot current values (for rollback on error)
3. Immediately set optimistic values into the cache
4. Execute the actual API call
5. On success: refetch updated queries (cache replaced with server response)
6. On error: roll back to snapshots

## Deferred (Long-Running) Operations

APICall supports polling for async backend jobs when `deferredMode` is enabled:

| Prop | Description |
|------|-------------|
| `deferredMode` | Enable deferred operation mode for long-running operations that return 202 Accepted |
| `statusUrl` | URL to poll for status updates (may contain `{$result.jobId}` or other result interpolations) |
| `statusMethod` | HTTP method for status requests (default: `'get'`) |
| `pollingInterval` | Milliseconds between status polls (default: 2000ms) |
| `maxPollingDuration` | Maximum time to poll before timing out (default: 300000ms / 5 minutes) |
| `pollingBackoff` | Backoff strategy: `'none'` (fixed), `'linear'` (adds 1s/attempt), `'exponential'` (doubles each time) |
| `maxPollingInterval` | Maximum interval between polls when using backoff (default: 30000ms / 30 seconds) |
| `completionCondition` | Expression evaluated against `$statusData`; if true, polling stops |
| `errorCondition` | Expression evaluated against `$statusData`; if true, polling stops as error |
| `progressExtractor` | Expression to extract progress value (0–100) from `$statusData` |
| `cancelUrl` | URL to call when cancelling the operation (may use `{$result.jobId}` interpolation) |
| `cancelMethod` | HTTP method for cancel requests (default: `'post'`) |
| `cancelBody` | Optional body to send with cancel request |

## APICall Context Variables

| Variable | Available in | Content |
|----------|-------------|---------|
| `$param` | all events | First argument to `execute(param1, ...)` |
| `$params` | all events | All arguments `[param1, param2, ...]` |
| `$result` | `success` event | Response data |
| `$error` | `error` event | Error object |
| `$progress` | `progress` event | Progress percentage 0–100 |
| `$statusData` | deferred `progress` | Current status response |

## APICall vs DataSource

| Aspect | DataSource | APICall |
|--------|-----------|---------|
| Trigger | Auto on mount + dependency change | Manual via `apiCallId.execute(...)` |
| Use case | Queries (GET, read-only) | Mutations (POST/PUT/PATCH/DELETE) |
| Caching | Cached by React Query | No built-in caching |
| Polling | `pollIntervalInSeconds` prop | Deferred mode with `pollUrl` |
| Optimistic updates | No | Yes: `updates` + `optimisticValue` |
| Cache invalidation | N/A (is the cache) | Yes: `invalidates` prop |
| Pagination | `prevPageSelector` + `nextPageSelector` | No |

## Dependent Queries

No explicit `dependsOn` prop. Dependency is implicit through expressions:

```xml
<DataSource id="user" url="/api/users/{userId}" />
<DataSource id="posts" url="/api/posts?userId={user.value.id}" />
```

When `user.value.id` is undefined (before `user` loads), the query key for `posts` contains `undefined`. React Query treats this as a different key — the query is enabled but returns stale/empty data until the key resolves to a real value. Once `user` loads and `user.value.id` becomes defined, the key changes and React Query fetches `posts` automatically.

## File Operations

### FileUpload

Triggered as an event action (not a standalone visible component):

```xml
<FileUploadDropZone>
  <event name="uploaded">
    <FileUpload url="/api/upload" file="{$param}" fieldName="attachment"
                chunkSizeInBytes="1048576" invalidates="/api/files" />
  </event>
</FileUploadDropZone>
```

Key props: `url`, `file`, `fieldName` (default: `"file"`), `asForm` (default: `true`), `formParams`, `chunkSizeInBytes`, `invalidates`, `method`, `headers`, `queryParams`.

**Chunking:** splits `file.slice(start, end)` into chunks; sends sequentially with `chunkStart`/`chunkEnd` metadata; calls `onProgress` after each chunk.

### FileDownload

```xml
<event name="click">
  <FileDownload url="/api/export" fileName="report.csv" />
</event>
```

**Download strategy:**
- Simple GET with no custom headers → iframe trick (browser native download, shows progress bar)
- Any other case (POST, custom headers, mocked) → fetch via RestApiProxy, then `URL.createObjectURL` + anchor `click()`

Key props: `url`, `fileName`, `method`, `queryParams`, `body`, `rawBody`, `headers`.

## Anti-patterns

- **Don't use `invalidates` without a URL** — omitting `invalidates` on APICall invalidates ALL cached queries, triggering a full refetch of every DataSource in the app
- **Don't rely on `loaded` for error state** — `loaded` becomes `true` on both success and error; always check `error` separately
- **Dependent queries break if URL contains `undefined`** — `url="/api/posts?id={item.id}"` will fetch with `id=undefined` if `item` is null; use `when="{!!item}"` on the DataSource to prevent this
- **`resultSelector` and `transformResult` are both async** — `transformResult` may return a Promise; the loader awaits it, but reactive expressions using `.value` will briefly see the previous value
- **`byId` index requires `$id` field** — the `state[uid].byId` map is only populated when the response is an array whose items have `.$id`; without it, `byId` is `undefined`

# APICall Caching Implementation Plan (REVISED - Incremental Approach)

## Overview

This plan implements caching for APICall component in small, testable steps. Each step includes:
- Clear implementation focus
- E2E tests to verify functionality
- Validation checkpoint before proceeding

## Current State Analysis

### APICall Component Status
**APICall DOES NOT currently support React Query caching** like DataSource does.

### Key Architecture Differences

#### DataSource (Has Caching)
- Uses `useQuery` from `@tanstack/react-query` in `Loader.tsx`
- Automatically generates query keys via `DataLoaderQueryKeyGenerator`
- Stores responses in React Query cache with automatic staleness management
- Multiple DataSource instances with same URL share cached data
- Located at: `xmlui/src/components/DataSource/DataSource.tsx`
- Renderer at: `xmlui/src/components-core/loader/DataLoader.tsx`

#### APICall (No Caching Currently)
- Directly calls `callApi()` function from `xmlui/src/components-core/action/APICall.tsx`
- Does NOT use React Query for caching
- Only uses `queryClient.setQueryData()` for **optimistic updates** (not caching)
- Each call makes a fresh network request
- Component metadata at: `xmlui/src/components/APICall/APICall.tsx`

### How DataSource Implements Caching

1. **Query Key Generation** (`DataLoader.tsx` line 270):
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

2. **React Query Integration** (`Loader.tsx` line 63):
   ```typescript
   const { data, status, isFetching, isLoading, error, refetch, isRefetching } = useQuery({
     queryKey: useMemo(
       () => (queryId ? queryId : [uid, extractParam(state, loader.props, appContext)]),
       [appContext, loader.props, queryId, state, uid],
     ),
     structuralSharing,
     enabled: initialized,
     queryFn: useCallback<QueryFunction>(
       async ({ signal }) => {
         const newVar: any = await loaderFn(signal);
         if (newVar === undefined) {
           return null;
         }
         return newVar;
       },
       [loaderFn],
     ),
     // ... other options
   });
   ```

3. **Result**: React Query manages the cache automatically with default staleTime/gcTime settings

---

## Feature Request Summary

### Goal
Allow `Actions.callApi()` to populate the React Query cache so that:
1. Tree component's `loadChildren` can call `callApi` directly (synchronous requirement)
2. Files Table component's DataSource reads from the cache (avoids duplicate requests)
3. Result: Only ONE network request for the same URL

### Proposed API (UPDATED - Explicit Opt-In)

**⚠️ IMPORTANT SAFETY CHANGE**: Caching is now **opt-in only** to prevent dangerous caching of POST/PUT/DELETE operations.

```typescript
// Option 1: Property-based (declarative)
<APICall 
  url="/api/folders/123/children" 
  method="get"
  allowCache="true"          // NEW: Must explicitly enable
  staleTime="300000"         // Optional: cache lifetime in ms
  onSuccess="..."
/>

// Option 2: Method-based (imperative)
<Button onClick="api.executeWithCaching()">Load with Cache</Button>  // NEW method
<Button onClick="api.execute()">Load without Cache</Button>          // Existing (unchanged)
```

### Implementation Requirements

1. **Generate Query Key** (same as DataSource):
   ```typescript
   const key = new DataLoaderQueryKeyGenerator(
     url, 
     queryParams, 
     appGlobals.apiUrl, 
     body, 
     rawBody
   ).asKey();
   ```

2. **Store Result in Cache** (only if `allowCache=true`):
   ```typescript
   if (allowCache) {
     appContext.queryClient.setQueryData(key, data);
   }
   ```

3. **Set Cache Lifetime** (optional, defaults to 5 minutes):
   ```typescript
   appContext.queryClient.setQueryDefaults(key, { 
     staleTime: staleTime ?? 300000  // Default: 5 minutes
   });
   ```

---

## Implementation Plan

### Phase 1: Add Caching Support to `callApi()` Function

**File**: `xmlui/src/components-core/action/APICall.tsx`

#### Changes Required:

1. **Add `allowCache` and `staleTime` parameters to `APICall` type** (around line 241):
   ```typescript
   type APICall = {
     // ... existing properties
     credentials?: "omit" | "same-origin" | "include";
     allowCache?: boolean;  // NEW: Explicit opt-in for caching (default: false)
     staleTime?: number;    // NEW: Cache lifetime in milliseconds (default: 300000ms)
     uid?: string | symbol;
     when?: string;
     // ... rest of properties
   } & ApiOperationDef;
   ```

2. **Update `callApi()` function signature** (around line 269):
   ```typescript
   export async function callApi(
     { state, appContext, lookupAction, getCurrentState, apiInstance }: ActionExecutionContext,
     {
       // ... existing parameters
       credentials,
       allowCache,  // NEW PARAMETER: Explicit opt-in
       staleTime,   // NEW PARAMETER: Cache lifetime
     }: APICall,
     { resolveBindingExpressions }: ApiActionOptions = {},
   ) {
   ```

3. **Import `DataLoaderQueryKeyGenerator`** (top of file):
   ```typescript
   import { DataLoaderQueryKeyGenerator } from "../utils/DataLoaderQueryKeyGenerator";
   ```

4. **Generate query key and cache result** (after successful API call, around line 367):
   ```typescript
   // Existing code:
   const result = await new RestApiProxy(appContext, apiInstance).execute({
     operation,
     params: stateContext,
     transactionId: clientTxId,
     resolveBindingExpressions,
     onProgress: _onProgress,
   });
   console.log("API call result:", result);

   // NEW: Cache the result ONLY if explicitly allowed AND method is safe
   if (appContext.queryClient && allowCache) {
     const normalizedMethod = (method || 'get').toLowerCase();
     
     // SAFETY CHECK: Only cache GET requests (idempotent operations)
     // POST/PUT/DELETE/PATCH modify server state and should NEVER be cached
     if (normalizedMethod === 'get') {
       const effectiveStaleTime = staleTime ?? 300000; // Default: 5 minutes
       
       // Generate the same query key that DataSource would use
       const queryKey = new DataLoaderQueryKeyGenerator(
         extractParam(stateContext, url, appContext),
         extractParam(stateContext, queryParams, appContext),
         appContext.appGlobals?.apiUrl,
         extractParam(stateContext, body, appContext),
         extractParam(stateContext, rawBody, appContext),
       ).asKey();
       
       // Store result in React Query cache
       appContext.queryClient.setQueryData(queryKey, result);
       
       // Set cache lifetime
       appContext.queryClient.setQueryDefaults(queryKey, { 
         staleTime: effectiveStaleTime 
       });
       
       console.log("API result cached with key:", queryKey, "staleTime:", effectiveStaleTime);
     } else {
       console.warn(
         `APICall caching ignored for ${normalizedMethod.toUpperCase()} request. ` +
         `Only GET requests can be cached (idempotent operations). ` +
         `POST/PUT/DELETE/PATCH modify server state and should not be cached.`
       );
     }
   }

   // Continue with existing code...
   const onSuccessFn = lookupAction(onSuccess, uid, {
   ```

### Phase 2: Update APICall Component Metadata and Renderer

**Files**: 
- `xmlui/src/components/APICall/APICall.tsx` (metadata and renderer)
- `xmlui/src/components/APICall/APICallNative.tsx` (native component)

#### Changes Required:

1. **Add `allowCache` and `staleTime` to component interface** (around line 10 in `APICall.tsx`):
   ```typescript
   export interface ApiActionComponent extends ComponentDef {
     props?: ApiOperationDef & {
       // ... existing props
       errorNotificationMessage?: string;
       allowCache?: boolean;  // NEW: Explicit opt-in for caching
       staleTime?: number;    // NEW: Cache lifetime in milliseconds
     };
     events?: {
       // ... existing events
     };
   }
   ```

2. **Add `allowCache` and `staleTime` to metadata** (around line 120, after `credentials` in `APICall.tsx`):
   ```typescript
   credentials: {
     description: /* ... existing description ... */,
     valueType: "string",
   },
   allowCache: {
     description:
       "Enables response caching in the React Query cache. When `true`, the response will be " +
       "stored and reused by DataSource components with the same URL, avoiding duplicate network requests. " +
       "**Important**: Only use for idempotent operations (typically GET requests). Do NOT enable for " +
       "POST/PUT/DELETE operations as it will prevent actual server-side changes. Default: `false`.",
     valueType: "boolean",
     defaultValue: false,
   },
   staleTime: {
     description:
       "Cache lifetime in milliseconds (only applies when `allowCache` is `true`). " +
       "After this time, cached data is considered stale and will be refetched on next access. " +
       "Default: 300000ms (5 minutes).",
     valueType: "number",
     defaultValue: "300000",
   },
   ```

3. **Extract properties in renderer and pass to APICallNative** (in `APICall.tsx` renderer function):
   ```typescript
   export const apiCallComponentRenderer = createComponentRenderer(
     "APICall",
     APICallMd,
     ({ node, state, extractValue, registerComponentApi, layoutCss }: RendererContext) => {
       // Extract the new caching properties
       const allowCache = extractValue.asOptionalBoolean(node.props?.allowCache, false);
       const staleTime = extractValue.asOptionalNumber(node.props?.staleTime, 300000);
       
       // Extract existing properties
       const url = extractValue(node.props?.url);
       const method = extractValue.asOptionalString(node.props?.method, defaultProps.method);
       // ... other property extractions
       
       return (
         <APICallNative
           id={node.uid}
           url={url}
           method={method}
           allowCache={allowCache}        // NEW: Pass to native component
           staleTime={staleTime}          // NEW: Pass to native component
           // ... other props
           registerComponentApi={registerComponentApi}
           style={layoutCss}
         />
       );
     },
   );
   ```

4. **Update APICallNative to accept and use the properties** (in `APICallNative.tsx`):
   ```typescript
   interface APICallNativeProps {
     id?: string;
     url: string;
     method?: string;
     allowCache?: boolean;    // NEW: Accept caching property
     staleTime?: number;      // NEW: Accept cache lifetime property
     // ... other props
     registerComponentApi?: RegisterComponentApiFn;
   }
   
   export const APICallNative = ({
     id,
     url,
     method,
     allowCache,              // NEW: Destructure
     staleTime,               // NEW: Destructure
     // ... other props
     registerComponentApi,
   }: APICallNativeProps) => {
     // ... existing code
     
     useEffect(() => {
       registerComponentApi?.({
         execute: async (options?: { params?: any }) => {
           return callApi(
             executionContext,
             {
               url,
               method,
               allowCache,      // NEW: Pass to callApi
               staleTime,       // NEW: Pass to callApi
               // ... other parameters
             },
             { resolveBindingExpressions: true }
           );
         },
       });
     }, [/* dependencies including allowCache, staleTime */]);
     
     return null; // APICall is non-visual
   };
   ```

### Phase 3: Add executeWithCaching() Method (Optional Enhancement)

**File**: `xmlui/src/components/APICall/APICallNative.tsx`

This phase is optional and provides an alternative imperative API for caching.

#### Changes Required:

**Add `executeWithCaching()` method** alongside existing `execute()` in APICallNative:
**Add `executeWithCaching()` method** alongside existing `execute()` in APICallNative:
   ```typescript
   useEffect(() => {
     registerComponentApi?.({
       // Existing execute method - respects allowCache prop
       execute: async (options?: { params?: any }) => {
         return callApi(
           executionContext,
           {
             url,
             method,
             allowCache,      // Uses component prop value
             staleTime,       // Uses component prop value
             // ... other parameters
           },
           { resolveBindingExpressions: true }
         );
       },
       
       // NEW: executeWithCaching method - always caches regardless of allowCache prop
       executeWithCaching: async (options?: { params?: any; staleTime?: number }) => {
         return callApi(
           executionContext,
           {
             url,
             method,
             allowCache: true,                           // Force caching
             staleTime: options?.staleTime ?? staleTime ?? 300000,  // Override or use prop or default
             // ... other parameters
           },
           { resolveBindingExpressions: true }
         );
       },
     });
   }, [/* dependencies */]);
   ```

### Phase 4: Testing

#### 1. Basic Caching Test (Property-based)
```typescript
test("caches GET response when allowCache=true", async ({ initTestBed, page }) => {
  const cachingMock: ApiInterceptorDefinition = {
    initialize: "$state.requestCount = 0;",
    operations: {
      "get-folders": {
        url: "/api/folders/123/children",
        method: "get",
        handler: `
          $state.requestCount++;
          return { items: ["file1.txt", "file2.txt"], requestNumber: $state.requestCount };
        `,
      },
    },
  };

  await initTestBed(
    `
    <Fragment>
      <APICall 
        id="api" 
        url="/api/folders/123/children"
        allowCache="true"
        staleTime="300000"
        onSuccess="result => testState = result"
      />
      <DataSource id="ds" url="/api/folders/123/children" />
      <Button testId="trigger" onClick="api.execute()" />
      <Text testId="api-result" value="{JSON.stringify(testState)}" />
      <Text testId="ds-result" value="{JSON.stringify(ds.value)}" />
    </Fragment>
    `,
    { apiInterceptor: cachingMock }
  );

  // Execute APICall
  await page.getByTestId("trigger").click();
  
  // Wait for both to load
  await expect(page.getByTestId("api-result")).toContainText("requestNumber");
  await expect(page.getByTestId("ds-result")).toContainText("requestNumber");
  
  // Both should have requestNumber: 1 (only one network request made)
  await expect(page.getByTestId("api-result")).toContainText('"requestNumber":1');
  await expect(page.getByTestId("ds-result")).toContainText('"requestNumber":1');
});
```

#### 2. No Caching When allowCache=false (Default)
```typescript
test("does NOT cache when allowCache=false", async ({ initTestBed, page }) => {
  const noCachingMock: ApiInterceptorDefinition = {
    initialize: "$state.requestCount = 0;",
    operations: {
      "get-data": {
        url: "/api/data",
        method: "get",
        handler: `
          $state.requestCount++;
          return { value: "data", requestNumber: $state.requestCount };
        `,
      },
    },
  };

  await initTestBed(
    `
    <Fragment>
      <APICall 
        id="api" 
        url="/api/data"
        allowCache="false"
        onSuccess="result => testState = result"
      /Explicit Opt-In Required (UPDATED)
**Issue**: Caching POST/PUT/DELETE operations would cause app logic errors

**Solution**: 
- **Default behavior**: NO caching (safe by default)
- **Explicit opt-in required**: Must set `allowCache="true"` 
- **Recommendation**: Only enable for idempotent GET requests
- **POST/PUT/DELETE**: Should NEVER use `allowCache="true"` (would prevent actual server changes)
- **Caveat**: Even with `allowCache="true"`, POST/PUT/DELETE might be explicitly blocked in implementation for safety
    { apiInterceptor: noCachingMock }
  );

  await page.getByTestId("trigger").click();
  await expect(page.getByTestId("api-result")).toContainText("requestNumber");
  await expect(page.getByTestId("ds-result")).toContainText("requestNumber");
  
  // Should have DIFFERENT request numbers (two separate requests)
  await expect(page.getByTestId("api-result")).toContainText('"requestNumber":1');
  await expect(page.getByTestId("ds-result")).toContainText('"requestNumber":2');
});
```

#### 3. executeWithCaching() Method Test
```typescript
test("executeWithCaching() method caches response", async ({ initTestBed, page }) => {
  const methodCachingMock: ApiInterceptorDefinition = {
    initialize: "$state.requestCount = 0;",
    operations: {
      "get-items": {
        url: "/api/items",
        method: "get",
        handler: `
          $state.requestCount++;
          return { items: [1, 2, 3], requestNumber: $state.requestCount };
        `,
      },
    },
  };

  const { testStateDriver } = await initTestBed(
    `
    <Fragment>
      <APICall id="api" url="/api/items" />
      <DataSource id="ds" url="/api/items" />
      <Button testId="trigger" onClick="testState = await api.executeWithCaching()" />
      <Text testId="ds-result" value="{JSON.stringify(ds.value)}" />
    </Fragment>
    `,
    { apiInterceptor: methodCachingMock }
  );

  await page.getByTestId("trigger").click();
  
  // Check APICall result
  const apiResult = await testStateDriver.testState();
  eallowCache` defaults to `false` (no caching unless explicitly enabled)
- `staleTime` is optional
- Default behavior: NO caching (same as current behavior)
- Existing APICall components work without modification
- No breaking changes to existing APIs
- New `executeWithCaching()` method is additive (doesn't affect existing `execute()` method)sult")).toContainText('"requestNumber":1');
});
```

#### 4. execute() Method Does NOT Cache
```typescript
test("execute() method does NOT cache response", async ({ initTestBed, page }) => {
  const noMethodCachingMock: ApiInterceptorDefinition = {
    initialize: "$state.requestCount = 0;",
    operations: {
      "get-users": {
        url: "/api/users",
        method: "get",
        handler: `
          $state.requestCount++;
          return { users: ["Alice", "Bob"], requestNumber: $state.requestCount };
        `,
      },
    },
  };
~~Should caching be enabled by default for GET requests?~~
   - **RESOLVED**: No - explicit opt-in required via `allowCache="true"` (safer approach)

3. Should we add cache debugging tools?
   - Recommendation: Use React Query DevTools (already available)

4. Should we support cache prefetching?
   - Recommendation: Phase 2 feature, not part of initial implementation

5. Should we block POST/PUT/DELETE from caching even with `allowCache="true"`?
   - Recommendation: YES - add safety check in implementation to prevent misuse
    </Fragment>
    `,
    { apiInterceptor: noMethodCachingMock }
  );

  await page.getByTestId("trigger").click();
  
  // Check results - should have DIFFERENT request numbers
  const apiResult = await testStateDriver.testState();
  expect(apiResult.requestNumber).toBe(1);
  
  await expect(page.getByTestId("ds-result")).toContainText('"requestNumber":2');
});
```

#### 5. Different Query Parameters Create Different Cache Keys
```typescript
test("different query params create separate cache entries", async ({ initTestBed, page }) => {
  const queryParamsMock: ApiInterceptorDefinition = {
    initialize: "$state.requestCount = 0;",
    operations: {
      "get-items-filtered": {
        url: "/api/items",
        method: "get",
        handler: `
          $state.requestCount++;
          return { 
            filter: $queryParams.filter, 
            items: [],
            requestNumber: $state.requestCount 
          };
        `,
      },
    },
  };

  await initTestBed(
    `
    <Fragment>
      <APICall 
        id="api" 
        url="/api/items"
        queryParams="{filter: 'active'}"
        allowCache="true"
      />
      <DataSource 
        id="ds" 
        url="/api/items"
        queryParams="{filter: 'inactive'}"
      />
      <Button testId="trigger" onClick="api.execute()" />
      <Text testId="ds-result" value="{JSON.stringify(ds.value)}" />
    </Fragment>
    `,
    { apiInterceptor: queryParamsMock }
  );

  await page.getByTestId("trigger").click();
  await expect(page.getByTestId("ds-result")).toContainText("requestNumber");
  
  // Should have DIFFERENT request numbers (different cache keys)
  await expect(page.getByTestId("ds-result")).toContainText('"requestNumber":2');
});
```

#### 6. POST/PUT/DELETE Safety Test
```typescript
test("POST request does NOT cache even with allowCache=true", async ({ initTestBed, page }) => {
  const postMock: ApiInterceptorDefinition = {
    initialize: "$state.createCount = 0;",
    operations: {
      "create-item": {
        url: "/api/items",
        method: "post",
        handler: `
          $state.createCount++;
          return { id: $state.createCount, name: $requestBody.name };
        `,
      },
      "get-items": {
        url: "/api/items",
        method: "get",
        handler: `
          return { count: $state.createCount };
        `,
      },
    },
  };

  const { testStateDriver } = await initTestBed(
    `
    <Fragment>
      <APICall 
        id="api" 
        url="/api/items"
        method="post"
        body="{name: 'test'}"
        allowCache="true"
      />
      <DataSource id="ds" url="/api/items" />
      <Button testId="create1" onClick="testState = [await api.execute()]" />
      <Button testId="create2" onClick="testState = [...testState, await api.execute()]" />
      <Text testId="count" value="{ds.value.count}" />
    </Fragment>
    `,
    { apiInterceptor: postMock }
  );

  // Create first item
  await page.getByTestId("create1").click();
  await page.waitForTimeout(100);
  
  // Create second item
  await page.getByTestId("create2").click();
  await page.waitForTimeout(100);
  
  // Server should have received 2 POST requests
  await expect(page.getByTestId("count")).toContainText("2");
  
  // testState should show two different IDs
  const results = await testStateDriver.testState();
  expect(results).toHaveLength(2);
  expect(results[0].id).toBe(1);
  expect(results[1].id).toBe(2);
});
```

### Test File Location
Add to existing: `xmlui/src/components/APICall/APICall.spec.ts` (in new describe block)
Or create separ**Zero StaleTime (No Caching)**:
   ```xmlui
   <APICall 
     id="api2" 
     url="/api/data" 
     staleTime="0"
   />
   
   <DataSource id="ds2" url="/api/data" />
   ```
   **Expected**: TWO network requests (caching disabled)

3. **Different Query Parameters**:
   ```xmlui
   <APICall 
     id="api3" 
     url="/api/items" 
     queryParams="{filter: 'active'}"
     staleTime="300000"
   />
   
   <DataSource 
     id="ds3" 
     url="/api/items"
     queryParams="{filter: 'inactive'}"
   />
   ```
   **Expected**: TWO network requests (different cache keys)

4. **POST vs GET**:
   ```xmlui
   <APICall 
     id="api4" 
     url="/api/data" 
     method="post"
     body="{name: 'test'}"
   />
   
   <DataSource id="ds4" url="/api/data" />
   ```
   **Expected**: TWO network requests (POST not cached by default)

### Test File Location
Create: `xmlui/src/components/APICall/APICall-caching.spec.ts`

---

## Edge Cases & Considerations

### 1. Cache Key Consistency
**Issue**: DataSource and APICall must generate identical keys for same requests

**Solution**: Both use `DataLoaderQueryKeyGenerator` with same parameters in same order:
- url
- queryParams
- appGlobals.apiUrl
- body
- rawBody

### 2. Method-Based Default Behavior
**Issue**: Should POSTs be cached by default?

**Solution**: 
- GET requests: Default `staleTime = 300000ms` (5 minutes)
- Other methods: Default `staleTime = 0` (no caching)
- Explicit `staleTime` prop overrides defaults

### 3. Cache Invalidation
**Issue**: How to invalidate cache when data changes?

**Existing Solution**: Already handled via:
- `invalidates` prop on APICall
- `Actions.invalidateQueries()` global
- No changes needed

### 4. Optimistic Updates Interaction
**Issue**: Existing optimistic update logic uses `setQueryData`

**Solution**: Caching won't conflict:
- Optimistic updates modify specific query keys
- Response caching adds new query keys
- Both can coexist

### 5. Memory Management
**Issue**: Cached data consumes memory

**Solution**: React Query handles this via:
- `staleTime`: When data becomes stale
- `gcTime` (garbage collection): When unused data is removed from cache
- Default `gcTime` = 5 minutes after query becomes unused

### 6. Server-Side Rendering (SSR)
**Issue**: Cache behavior during SSR

**Solution**: 
- React Query handles SSR automatically
- `queryClient` is available in `appContext` during SSR
- No special handling needed

---

## Benefits

1. **Performance**: Eliminates duplicate network requests
2. **UX**: Faster perceived load times (instant data from cache)
3. **Consistency**: Both APICall and DataSource use same caching mechanism
4. **Flexibility**: Opt-in via `staleTime` prop, backward compatible
5. **Tree/Table Use Case**: Solves the exact problem described in feature request

---

## Backward Compatibility

✅ **Fully backward compatible**:
- `staleTime` is optional
- Default behavior unchanged (no caching for non-GET unless specified)
- Existing APICall components work without modification
- No breaking changes to existing APIs

---

## Implementation Effort Estimate

- **Phase 1** (callApi function): 2-3 hours
- **Phase 2** (metadata): 30 minutes
- **Phase 3** (native component): 30 minutes
- **Phase 4** (testing): 2-3 hours

**Total**: ~6 hours

---

## Open Questions

1. Should we expose `gcTime` (garbage collection time) as well?
   - Recommendation: Start with `staleTime` only, add `gcTime` later if needed

2. Should caching be enabled by default for GET requests?
   - Recommendation: Yes (5 minutes), can be disabled with `staleTime={0}`

3. Should we add cache debugging tools?
   - Recommendation: Use React Query DevTools (already available)

4. Should we support cache prefetching?
   - Recommendation: Phase 2 feature, not part of initial implementation

---

## Next Steps

1. ✅ Create this implementation plan
2. ⏸️ Get approval from project maintainer
3. ⏸️ Implement Phase 1 (core caching logic)
4. ⏸️ Implement Phases 2-3 (component updates)
5. ⏸️ Write comprehensive tests
6. ⏸️ Update documentation
7. ⏸️ Test in real Tree/Files Table scenario
8. ⏸️ Create pull request

---

## References

- **DataSource Implementation**: `xmlui/src/components/DataSource/DataSource.tsx`
- **DataLoader**: `xmlui/src/components-core/loader/DataLoader.tsx`
- **Loader (React Query)**: `xmlui/src/components-core/loader/Loader.tsx`
- **APICall Action**: `xmlui/src/components-core/action/APICall.tsx`
- **Query Key Generator**: `xmlui/src/components-core/utils/DataLoaderQueryKeyGenerator.ts`
- **React Query Docs**: https://tanstack.com/query/latest/docs/react/overview

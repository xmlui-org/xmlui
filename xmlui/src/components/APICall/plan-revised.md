# APICall Caching Implementation Plan (REVISED - Incremental Approach)

## Overview

This plan implements caching for APICall component in **small, testable, incremental steps**. Each step includes:
- ✅ Clear, focused implementation goal
- ✅ E2E tests to verify functionality  
- ✅ Validation checkpoint requiring approval before proceeding
- ✅ Rollback strategy if issues arise

**Key Principle**: Each step must be **independently testable** and **all tests must pass** before moving forward.

---

## Current State Analysis

### APICall Component (No Caching)
- **Location**: `xmlui/src/components-core/action/APICall.tsx`
- **Behavior**: Directly calls REST API via `RestApiProxy`
- **Cache usage**: Only for optimistic updates (not response caching)
- **Result**: Each `APICall` makes a fresh network request

### DataSource Component (Has Caching)
- **Location**: `xmlui/src/components-core/loader/DataLoader.tsx`  
- **Behavior**: Uses React Query's `useQuery` hook
- **Cache key generation**: `DataLoaderQueryKeyGenerator` (consistent hashing)
- **Result**: Automatic caching with `staleTime`/`gcTime` management

### Problem
When a Tree component's `loadChildren` calls `callApi()` and a Table's DataSource uses the same URL:
- **Current**: 2 separate network requests
- **Desired**: 1 network request (shared via React Query cache)

---

## Implementation Strategy

### Goals
1. ✅ Enable APICall to populate React Query cache (explicit opt-in)
2. ✅ Share cached data between APICall and DataSource  
3. ✅ Maintain backward compatibility (no breaking changes)
4. ✅ Safety: Only cache GET requests, never POST/PUT/DELETE

### Safety Requirements
- **Default**: NO caching (backward compatible)
- **Explicit opt-in**: Must set `allowCache="true"`
- **GET requests only**: POST/PUT/DELETE never cached (even with `allowCache=true`)
- **Same query key logic**: Use `DataLoaderQueryKeyGenerator` for consistency

---

## Step-by-Step Implementation

### ✅ Step 0: Preparation and Baseline Tests

**Goal**: Establish baseline behavior - verify APICall and DataSource currently make separate requests.

**What to create**:
- New test file: `xmlui/src/components/APICall/APICall-caching.spec.ts`
- Single baseline test confirming current behavior

**Test case**:
```typescript
import { expect, test } from "../../testing/fixtures";
import type { ApiInterceptorDefinition } from "../../components-core/interception/abstractions";

// =============================================================================
// STEP 0: BASELINE - VERIFY CURRENT BEHAVIOR
// =============================================================================

test.describe("APICall Caching - Baseline", () => {
  test("baseline: APICall and DataSource make separate requests (current behavior)", async ({ 
    initTestBed, 
    page 
  }) => {
    // Mock backend that tracks request count
    const baselineMock: ApiInterceptorDefinition = {
      initialize: "$state.requestCount = 0;",
      operations: {
        "get-data": {
          url: "/api/data",
          method: "get",
          handler: `
            $state.requestCount++;
            return { 
              message: "success", 
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
          url="/api/data" 
          method="get"
          onSuccess="result => testState = result" 
        />
        <DataSource id="ds" url="/api/data" />
        <Button testId="trigger" onClick="api.execute()" />
        <Text testId="api-result" value="{JSON.stringify(testState)}" />
        <Text testId="ds-result" value="{JSON.stringify(ds.value)}" />
      </Fragment>
      `,
      { apiInterceptor: baselineMock }
    );

    // Execute APICall
    await page.getByTestId("trigger").click();
    
    // Wait for both components to have data
    await expect(page.getByTestId("api-result")).toContainText("requestNumber");
    await expect(page.getByTestId("ds-result")).toContainText("requestNumber");
    
    // EXPECTED BEHAVIOR: TWO separate requests (no caching yet)
    await expect(page.getByTestId("api-result")).toContainText('"requestNumber":1');
    await expect(page.getByTestId("ds-result")).toContainText('"requestNumber":2');
  });
});
```

**Success Criteria**:
- ✅ Test file created successfully
- ✅ Baseline test PASSES (confirms 2 separate requests)
- ✅ All existing APICall tests still pass

**Commands to run**:
```bash
# Run baseline test
npx playwright test APICall-caching.spec.ts --workers=1 --reporter=line

# Verify existing tests still pass
npx playwright test APICall.spec.ts --workers=1 --reporter=line
```

**What NOT to do**:
- ❌ Don't modify any production code yet
- ❌ Don't add any metadata or properties
- ❌ Don't implement caching logic

**Approval Checkpoint**: ⏸️ **STOP HERE - Wait for approval before Step 1**

---

### ⏸️ Step 1: Add `allowCache` Property to Type Definitions (Metadata Only)

**Goal**: Add `allowCache` property to TypeScript types, component metadata, renderer, and native component. NO functionality yet - just API surface and prop passing.

**Files to modify**:
1. `xmlui/src/components-core/action/APICall.tsx` - Add to type definition
2. `xmlui/src/components/APICall/APICall.tsx` - Add to metadata and renderer
3. `xmlui/src/components/APICall/APICallNative.tsx` - Add to props interface

**Changes**:

**File 1**: `xmlui/src/components-core/action/APICall.tsx` (around line 236)
```typescript
type APICall = {
  invalidates?: string | string[];
  updates?: string | string[];
  confirmTitle?: string;
  confirmMessage?: string;
  confirmButtonLabel?: string;
  params?: any;
  payloadType?: string;
  optimisticValue?: any;
  getOptimisticValue?: string;
  inProgressNotificationMessage?: string;
  completedNotificationMessage?: string;
  errorNotificationMessage?: string;
  credentials?: "omit" | "same-origin" | "include";
  allowCache?: boolean;  // NEW: Explicit opt-in for caching (default: false)

  uid?: string | symbol;
  when?: string;

  onBeforeRequest?: string;
  onSuccess?: string;
  onProgress?: string;
  onError?: string;
} & ApiOperationDef;
```

**File 2**: `xmlui/src/components/APICall/APICall.tsx` (around line 80, after `credentials` property)
```typescript
credentials: {
  description:
    `Controls whether cookies and other credentials are sent with the request. ` +
    `Set to \`"include"\` to send credentials in cross-origin requests (requires ` +
    `\`Access-Control-Allow-Credentials: true\` header on the server).`,
  availableValues: [
    { value: "omit", description: "Never send credentials" },
    { value: "same-origin", description: "Send credentials only for same-origin requests (default browser behavior)" },
    { value: "include", description: "Always send credentials, even for cross-origin requests" },
  ],
  valueType: "string",
},
allowCache: {
  description:
    "Enables response caching in the React Query cache. When `true`, GET responses will be " +
    "stored and reused by DataSource components with the same URL, avoiding duplicate network requests. " +
    "**Important**: Only applies to GET requests. POST/PUT/DELETE operations are never cached " +
    "as they modify server state. Default: `false`.",
  valueType: "boolean",
  defaultValue: false,
},
```

**File 3**: `xmlui/src/components/APICall/APICall.tsx` - Extract in renderer and pass to native component
```typescript
export const apiCallComponentRenderer = createComponentRenderer(
  "APICall",
  APICallMd,
  ({ node, state, extractValue, registerComponentApi, layoutCss }: RendererContext) => {
    // NEW: Extract the caching property
    const allowCache = extractValue.asOptionalBoolean(node.props?.allowCache, false);
    
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
        // ... other props
        registerComponentApi={registerComponentApi}
        style={layoutCss}
      />
    );
  },
);
```

**File 4**: `xmlui/src/components/APICall/APICallNative.tsx` - Add to props interface (don't use yet)
```typescript
interface APICallNativeProps {
  id?: string;
  url: string;
  method?: string;
  allowCache?: boolean;    // NEW: Accept caching property (not used in Step 1)
  // ... other props
  registerComponentApi?: RegisterComponentApiFn;
}

export const APICallNative = ({
  id,
  url,
  method,
  allowCache,              // NEW: Destructure (but don't pass to callApi yet)
  // ... other props
  registerComponentApi,
}: APICallNativeProps) => {
  // ... existing code (don't modify execute() method yet)
  
  return null; // APICall is non-visual
};
```

**Test cases** (add to `APICall-caching.spec.ts`):
```typescript
// =============================================================================
// STEP 1: PROPERTY ACCEPTANCE
// =============================================================================

test.describe("APICall Caching - Step 1: Property Acceptance", () => {
  test("step1: allowCache property is accepted without errors", async ({ 
    initTestBed, 
    page 
  }) => {
    const mock: ApiInterceptorDefinition = {
      operations: {
        "get-data": {
          url: "/api/data",
          method: "get",
          handler: `return { data: "test" };`,
        },
      },
    };

    // Should compile and run without errors
    await initTestBed(
      `
      <Fragment>
        <APICall 
          id="api" 
          url="/api/data" 
          allowCache="true"
          onSuccess="result => testState = result" 
        />
        <Button testId="trigger" onClick="api.execute()" />
      </Fragment>
      `,
      { apiInterceptor: mock }
    );

    // Execute - should not throw errors
    await page.getByTestId("trigger").click();
    await page.waitForTimeout(100);
  });

  test("step1: baseline behavior unchanged (still 2 requests)", async ({ 
    initTestBed, 
    page 
  }) => {
    const mock: ApiInterceptorDefinition = {
      initialize: "$state.requestCount = 0;",
      operations: {
        "get-data": {
          url: "/api/data",
          method: "get",
          handler: `
            $state.requestCount++;
            return { requestNumber: $state.requestCount };
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
          allowCache="true"
          onSuccess="result => testState = result" 
        />
        <DataSource id="ds" url="/api/data" />
        <Button testId="trigger" onClick="api.execute()" />
        <Text testId="api-result" value="{JSON.stringify(testState)}" />
        <Text testId="ds-result" value="{JSON.stringify(ds.value)}" />
      </Fragment>
      `,
      { apiInterceptor: mock }
    );

    await page.getByTestId("trigger").click();
    
    await expect(page.getByTestId("api-result")).toContainText("requestNumber");
    await expect(page.getByTestId("ds-result")).toContainText("requestNumber");
    
    // STILL 2 requests (no caching implemented yet)
    await expect(page.getByTestId("api-result")).toContainText('"requestNumber":1');
    await expect(page.getByTestId("ds-result")).toContainText('"requestNumber":2');
  });
});
```

**Success Criteria**:
- ✅ Code compiles without TypeScript errors
- ✅ Property acceptance test passes
- ✅ Baseline behavior unchanged (still 2 requests)
- ✅ All existing APICall tests still pass
- ✅ VS Code IntelliSense shows `allowCache` property with description

**Commands to run**:
```bash
# Run new tests
npx playwright test APICall-caching.spec.ts --workers=1 --reporter=line

# Verify existing tests
npx playwright test APICall.spec.ts --workers=1 --reporter=line
```

**What NOT to do**:
- ❌ Don't implement any caching logic yet
- ❌ Don't import `DataLoaderQueryKeyGenerator` yet
- ❌ Don't pass `allowCache` to `callApi()` yet (Step 2 will do this)

**Approval Checkpoint**: ⏸️ **STOP HERE - Wait for approval before Step 2**

---

### ⏸️ Step 2: Generate Query Key (Console Logging Only - No Caching)

**Goal**: 
1. Update APICallNative to pass `allowCache` to `callApi()`
2. Add query key generation logic but DON'T cache yet
3. Just log to verify correctness

**Files to modify**:
1. `xmlui/src/components-core/action/APICall.tsx` - Import and generate key
2. `xmlui/src/components/APICall/APICallNative.tsx` - Pass allowCache to callApi

**Changes**:

**File 1**: `xmlui/src/components/APICall/APICallNative.tsx` - Pass allowCache to callApi
```typescript
export const APICallNative = ({
  id,
  url,
  method,
  allowCache,              // Already destructured in Step 1
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
            // ... other parameters
          },
          { resolveBindingExpressions: true }
        );
      },
    });
  }, [/* add allowCache to dependencies */]);
  
  return null;
};
```

**File 2**: `xmlui/src/components-core/action/APICall.tsx`

**Add import at top of file**:
```typescript
import { DataLoaderQueryKeyGenerator } from "../utils/DataLoaderQueryKeyGenerator";
```

**Add parameter to function signature** (around line 269):
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

    //operation
    headers,
    url,
    queryParams,
    rawBody,
    method,
    body,
    credentials,
    allowCache,  // NEW PARAMETER (add this line)
  }: APICall,
  { resolveBindingExpressions }: ApiActionOptions = {},
) {
```

**Add key generation after successful API call** (around line 367, after `console.log("API call result:", result);`):
```typescript
const result = await new RestApiProxy(appContext, apiInstance).execute({
  operation,
  params: stateContext,
  transactionId: clientTxId,
  resolveBindingExpressions,
  onProgress: _onProgress,
});
console.log("API call result:", result);

// NEW: Generate query key if caching is enabled (but don't cache yet)
if (appContext.queryClient && allowCache) {
  const normalizedMethod = (method || 'get').toLowerCase();
  
  // Only generate key for GET requests
  if (normalizedMethod === 'get') {
    const queryKey = new DataLoaderQueryKeyGenerator(
      extractParam(stateContext, url, appContext),
      extractParam(stateContext, queryParams, appContext),
      appContext.appGlobals?.apiUrl,
      extractParam(stateContext, body, appContext),
      extractParam(stateContext, rawBody, appContext),
    ).asKey();
    
    console.log("✓ [APICall] Query key generated (not caching yet):", queryKey);
  } else {
    console.log(`✗ [APICall] Caching skipped for ${normalizedMethod.toUpperCase()} request`);
  }
}

// Continue with existing code...
const onSuccessFn = lookupAction(onSuccess, uid, {
```

**Test cases** (add to `APICall-caching.spec.ts`):
```typescript
// =============================================================================
// STEP 2: QUERY KEY GENERATION
// =============================================================================

test.describe("APICall Caching - Step 2: Query Key Generation", () => {
  test("step2: generates query key for GET with allowCache=true", async ({ 
    initTestBed, 
    page 
  }) => {
    const mock: ApiInterceptorDefinition = {
      operations: {
        "get-data": {
          url: "/api/data",
          method: "get",
          handler: `return { data: "test" };`,
        },
      },
    };

    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    await initTestBed(
      `
      <Fragment>
        <APICall 
          id="api" 
          url="/api/data" 
          allowCache="true"
          onSuccess="result => testState = result" 
        />
        <Button testId="trigger" onClick="api.execute()" />
      </Fragment>
      `,
      { apiInterceptor: mock }
    );

    await page.getByTestId("trigger").click();
    await page.waitForTimeout(200);
    
    // Verify query key was generated
    const keyLog = consoleLogs.find(log => log.includes('Query key generated'));
    expect(keyLog).toBeTruthy();
    expect(keyLog).toContain('/api/data');
  });

  test("step2: skips query key generation for POST request", async ({ 
    initTestBed, 
    page 
  }) => {
    const mock: ApiInterceptorDefinition = {
      operations: {
        "post-data": {
          url: "/api/data",
          method: "post",
          handler: `return { id: 1 };`,
        },
      },
    };

    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    await initTestBed(
      `
      <Fragment>
        <APICall 
          id="api" 
          url="/api/data" 
          method="post"
          allowCache="true"
          onSuccess="result => testState = result" 
        />
        <Button testId="trigger" onClick="api.execute()" />
      </Fragment>
      `,
      { apiInterceptor: mock }
    );

    await page.getByTestId("trigger").click();
    await page.waitForTimeout(200);
    
    // Verify caching was skipped for POST
    const skipLog = consoleLogs.find(log => log.includes('Caching skipped for POST'));
    expect(skipLog).toBeTruthy();
  });

  test("step2: no key generation when allowCache=false", async ({ 
    initTestBed, 
    page 
  }) => {
    const mock: ApiInterceptorDefinition = {
      operations: {
        "get-data": {
          url: "/api/data",
          method: "get",
          handler: `return { data: "test" };`,
        },
      },
    };

    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    await initTestBed(
      `
      <Fragment>
        <APICall 
          id="api" 
          url="/api/data" 
          onSuccess="result => testState = result" 
        />
        <Button testId="trigger" onClick="api.execute()" />
      </Fragment>
      `,
      { apiInterceptor: mock }
    );

    await page.getByTestId("trigger").click();
    await page.waitForTimeout(200);
    
    // Verify NO query key was generated
    const keyLog = consoleLogs.find(log => log.includes('Query key generated'));
    expect(keyLog).toBeUndefined();
  });

  test("step2: baseline behavior still unchanged (2 requests)", async ({ 
    initTestBed, 
    page 
  }) => {
    const mock: ApiInterceptorDefinition = {
      initialize: "$state.requestCount = 0;",
      operations: {
        "get-data": {
          url: "/api/data",
          method: "get",
          handler: `
            $state.requestCount++;
            return { requestNumber: $state.requestCount };
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
          allowCache="true"
          onSuccess="result => testState = result" 
        />
        <DataSource id="ds" url="/api/data" />
        <Button testId="trigger" onClick="api.execute()" />
        <Text testId="api-result" value="{JSON.stringify(testState)}" />
        <Text testId="ds-result" value="{JSON.stringify(ds.value)}" />
      </Fragment>
      `,
      { apiInterceptor: mock }
    );

    await page.getByTestId("trigger").click();
    
    await expect(page.getByTestId("api-result")).toContainText("requestNumber");
    await expect(page.getByTestId("ds-result")).toContainText("requestNumber");
    
    // STILL 2 requests (not caching yet, just generating keys)
    await expect(page.getByTestId("api-result")).toContainText('"requestNumber":1');
    await expect(page.getByTestId("ds-result")).toContainText('"requestNumber":2');
  });
});
```

**Success Criteria**:
- ✅ Console shows query key generation for GET requests
- ✅ Console shows "skipped" message for POST requests  
- ✅ No query key generated when `allowCache=false`
- ✅ Baseline still shows 2 separate requests (not caching yet)
- ✅ All tests pass

**Commands to run**:
```bash
npx playwright test APICall-caching.spec.ts --workers=1 --reporter=line
npx playwright test APICall.spec.ts --workers=1 --reporter=line
```

**What NOT to do**:
- ❌ Don't call `setQueryData` yet
- ❌ Don't implement actual caching yet

**Approval Checkpoint**: ⏸️ **STOP HERE - Wait for approval before Step 3**

---

### ⏸️ Step 3: Implement Basic Caching (The Critical Step)

**Goal**: Actually store the API result in React Query cache using `setQueryData`. This is the main feature.

**Files to modify**:
1. `xmlui/src/components-core/action/APICall.tsx` - Add caching logic

**Changes**:

Replace the console logging code from Step 2 with actual caching:
```typescript
const result = await new RestApiProxy(appContext, apiInstance).execute({
  operation,
  params: stateContext,
  transactionId: clientTxId,
  resolveBindingExpressions,
  onProgress: _onProgress,
});
console.log("API call result:", result);

// NEW: Cache the result if caching is enabled
if (appContext.queryClient && allowCache) {
  const normalizedMethod = (method || 'get').toLowerCase();
  
  // SAFETY CHECK: Only cache GET requests (idempotent operations)
  if (normalizedMethod === 'get') {
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
    
    console.log("✓ [APICall] Result cached with key:", queryKey);
  } else {
    console.log(
      `✗ [APICall] Caching skipped for ${normalizedMethod.toUpperCase()} request ` +
      `(only GET requests can be cached)`
    );
  }
}

// Continue with existing code...
const onSuccessFn = lookupAction(onSuccess, uid, {
```

**Test cases** (add to `APICall-caching.spec.ts`):
```typescript
// =============================================================================
// STEP 3: BASIC CACHING (THE MAIN FEATURE)
// =============================================================================

test.describe("APICall Caching - Step 3: Basic Caching", () => {
  test("step3: MAIN TEST - APICall caches response for DataSource", async ({ 
    initTestBed, 
    page 
  }) => {
    const cachingMock: ApiInterceptorDefinition = {
      initialize: "$state.requestCount = 0;",
      operations: {
        "get-data": {
          url: "/api/folders/123/children",
          method: "get",
          handler: `
            $state.requestCount++;
            return { 
              data: "folders", 
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
          url="/api/folders/123/children" 
          method="get"
          allowCache="true"
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

    // Execute APICall first
    await page.getByTestId("trigger").click();
    
    // Wait for both to have results
    await expect(page.getByTestId("api-result")).toContainText("requestNumber");
    await expect(page.getByTestId("ds-result")).toContainText("requestNumber");
    
    // *** THE KEY ASSERTION: Only ONE request made ***
    await expect(page.getByTestId("api-result")).toContainText('"requestNumber":1');
    await expect(page.getByTestId("ds-result")).toContainText('"requestNumber":1');
  });

  test("step3: without allowCache, still makes 2 separate requests", async ({ 
    initTestBed, 
    page 
  }) => {
    const mock: ApiInterceptorDefinition = {
      initialize: "$state.requestCount = 0;",
      operations: {
        "get-data": {
          url: "/api/data",
          method: "get",
          handler: `
            $state.requestCount++;
            return { requestNumber: $state.requestCount };
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
          method="get"
          onSuccess="result => testState = result"
        />
        <DataSource id="ds" url="/api/data" />
        <Button testId="trigger" onClick="api.execute()" />
        <Text testId="api-result" value="{JSON.stringify(testState)}" />
        <Text testId="ds-result" value="{JSON.stringify(ds.value)}" />
      </Fragment>
      `,
      { apiInterceptor: mock }
    );

    await page.getByTestId("trigger").click();
    
    await expect(page.getByTestId("api-result")).toContainText("requestNumber");
    await expect(page.getByTestId("ds-result")).toContainText("requestNumber");
    
    // Without allowCache: 2 separate requests
    await expect(page.getByTestId("api-result")).toContainText('"requestNumber":1');
    await expect(page.getByTestId("ds-result")).toContainText('"requestNumber":2');
  });

  test("step3: POST request never caches (even with allowCache=true)", async ({ 
    initTestBed, 
    page 
  }) => {
    const mock: ApiInterceptorDefinition = {
      initialize: "$state.requestCount = 0;",
      operations: {
        "post-data": {
          url: "/api/items",
          method: "post",
          handler: `
            $state.requestCount++;
            return { id: $state.requestCount, created: true };
          `,
        },
        "get-items": {
          url: "/api/items",
          method: "get",
          handler: `
            $state.requestCount++;
            return { requestNumber: $state.requestCount };
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
          method="post"
          allowCache="true"
          onSuccess="result => testState = result"
        />
        <DataSource id="ds" url="/api/items" />
        <Button testId="trigger" onClick="api.execute()" />
        <Text testId="ds-result" value="{JSON.stringify(ds.value)}" />
      </Fragment>
      `,
      { apiInterceptor: mock }
    );

    await page.getByTestId("trigger").click();
    await expect(page.getByTestId("ds-result")).toContainText("requestNumber");
    
    // POST doesn't cache - DataSource makes its own GET request
    await expect(page.getByTestId("ds-result")).toContainText('"requestNumber":2');
  });
});
```

**Success Criteria**:
- ✅ **MAIN TEST PASSES**: APICall with `allowCache=true` shares cache with DataSource (1 request)
- ✅ Without `allowCache`: 2 separate requests (backward compatible)
- ✅ POST requests don't cache even with `allowCache=true`
- ✅ All existing APICall tests still pass
- ✅ Console logs confirm caching is happening

**Commands to run**:
```bash
npx playwright test APICall-caching.spec.ts --workers=1 --reporter=line
npx playwright test APICall.spec.ts --workers=1 --reporter=line
npx playwright test DataSource.spec.ts --workers=1 --reporter=line
```

**What if tests fail**:
If Step 3 tests fail, this is the rollback plan:
1. Revert changes to `callApi()` function body
2. Keep the property definitions from Steps 1-2
3. Investigate query key generation mismatch
4. Compare generated keys with DataSource keys in debugger

**Approval Checkpoint**: ⏸️ **STOP HERE - Wait for approval before Step 4**

---

### ⏸️ Step 4: Add `staleTime` Property for Cache Lifetime Control

**Goal**: Add optional `staleTime` property to control how long cached data remains fresh.

**Files to modify**:
1. `xmlui/src/components-core/action/APICall.tsx` - Add to type and implementation
2. `xmlui/src/components/APICall/APICall.tsx` - Add to metadata and renderer
3. `xmlui/src/components/APICall/APICallNative.tsx` - Add to props and pass to callApi

**Changes**:

**File 1**: `xmlui/src/components-core/action/APICall.tsx`

Add to type definition:
```typescript
type APICall = {
  // ... existing properties
  credentials?: "omit" | "same-origin" | "include";
  allowCache?: boolean;
  staleTime?: number;  // NEW: Cache lifetime in milliseconds

  uid?: string | symbol;
  when?: string;
  // ... rest
} & ApiOperationDef;
```

Add parameter to function signature:
```typescript
export async function callApi(
  { state, appContext, lookupAction, getCurrentState, apiInstance }: ActionExecutionContext,
  {
    // ... existing parameters
    credentials,
    allowCache,
    staleTime,  // NEW PARAMETER
  }: APICall,
  { resolveBindingExpressions }: ApiActionOptions = {},
) {
```

Update caching logic:
```typescript
// Cache the result if caching is enabled
if (appContext.queryClient && allowCache) {
  const normalizedMethod = (method || 'get').toLowerCase();
  
  if (normalizedMethod === 'get') {
    const effectiveStaleTime = staleTime ?? 300000; // Default: 5 minutes
    
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
    
    console.log("✓ [APICall] Result cached:", { queryKey, staleTime: effectiveStaleTime });
  } else {
    console.log(
      `✗ [APICall] Caching skipped for ${normalizedMethod.toUpperCase()} request`
    );
  }
}
```

**File 2**: `xmlui/src/components/APICall/APICall.tsx`

Add metadata after `allowCache`:
```typescript
allowCache: {
  description:
    "Enables response caching in the React Query cache. When `true`, GET responses will be " +
    "stored and reused by DataSource components with the same URL, avoiding duplicate network requests. " +
    "**Important**: Only applies to GET requests. POST/PUT/DELETE operations are never cached " +
    "as they modify server state. Default: `false`.",
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

**Test cases** (add to `APICall-caching.spec.ts`):
```typescript
// =============================================================================
// STEP 4: STALETIME PROPERTY
// =============================================================================

test.describe("APICall Caching - Step 4: StaleTime", () => {
  test("step4: custom staleTime is applied", async ({ initTestBed, page }) => {
    const mock: ApiInterceptorDefinition = {
      operations: {
        "get-data": {
          url: "/api/data",
          method: "get",
          handler: `return { data: "test", timestamp: Date.now() };`,
        },
      },
    };

    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    await initTestBed(
      `
      <Fragment>
        <APICall 
          id="api" 
          url="/api/data" 
          allowCache="true"
          staleTime="60000"
          onSuccess="result => testState = result" 
        />
        <Button testId="trigger" onClick="api.execute()" />
      </Fragment>
      `,
      { apiInterceptor: mock }
    );

    await page.getByTestId("trigger").click();
    await page.waitForTimeout(200);
    
    // Verify custom staleTime was used
    const cacheLog = consoleLogs.find(log => 
      log.includes('Result cached') && log.includes('staleTime')
    );
    expect(cacheLog).toBeTruthy();
    expect(cacheLog).toContain('60000');
  });

  test("step4: default staleTime is 300000ms", async ({ initTestBed, page }) => {
    const mock: ApiInterceptorDefinition = {
      operations: {
        "get-data": {
          url: "/api/data",
          method: "get",
          handler: `return { data: "test" };`,
        },
      },
    };

    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    await initTestBed(
      `
      <Fragment>
        <APICall 
          id="api" 
          url="/api/data" 
          allowCache="true"
          onSuccess="result => testState = result" 
        />
        <Button testId="trigger" onClick="api.execute()" />
      </Fragment>
      `,
      { apiInterceptor: mock }
    );

    await page.getByTestId("trigger").click();
    await page.waitForTimeout(200);
    
    // Verify default staleTime was used
    const cacheLog = consoleLogs.find(log => 
      log.includes('Result cached') && log.includes('staleTime')
    );
    expect(cacheLog).toBeTruthy();
    expect(cacheLog).toContain('300000');
  });

  test("step4: caching still works with custom staleTime", async ({ 
    initTestBed, 
    page 
  }) => {
    const mock: ApiInterceptorDefinition = {
      initialize: "$state.requestCount = 0;",
      operations: {
        "get-data": {
          url: "/api/data",
          method: "get",
          handler: `
            $state.requestCount++;
            return { requestNumber: $state.requestCount };
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
          allowCache="true"
          staleTime="60000"
          onSuccess="result => testState = result"
        />
        <DataSource id="ds" url="/api/data" />
        <Button testId="trigger" onClick="api.execute()" />
        <Text testId="api-result" value="{JSON.stringify(testState)}" />
        <Text testId="ds-result" value="{JSON.stringify(ds.value)}" />
      </Fragment>
      `,
      { apiInterceptor: mock }
    );

    await page.getByTestId("trigger").click();
    
    await expect(page.getByTestId("api-result")).toContainText("requestNumber");
    await expect(page.getByTestId("ds-result")).toContainText("requestNumber");
    
    // Still only 1 request
    await expect(page.getByTestId("api-result")).toContainText('"requestNumber":1');
    await expect(page.getByTestId("ds-result")).toContainText('"requestNumber":1');
  });
});
```

**Success Criteria**:
- ✅ Custom staleTime test passes
- ✅ Default staleTime test passes
- ✅ Caching still works with custom staleTime
- ✅ All previous tests still pass
- ✅ VS Code IntelliSense shows `staleTime` property

**Commands to run**:
```bash
npx playwright test APICall-caching.spec.ts --workers=1 --reporter=line
npx playwright test APICall.spec.ts --workers=1 --reporter=line
```

**Approval Checkpoint**: ⏸️ **STOP HERE - Wait for approval before Step 5**

---

### ⏸️ Step 5: Test Query Parameter Differentiation

**Goal**: Verify that different query parameters create separate cache entries (edge case testing).

**Files to modify**:
- Only test file (no production code changes)

**Test cases** (add to `APICall-caching.spec.ts`):
```typescript
// =============================================================================
// STEP 5: QUERY PARAMETER DIFFERENTIATION
// =============================================================================

test.describe("APICall Caching - Step 5: Query Parameters", () => {
  test("step5: different query params create separate cache entries", async ({ 
    initTestBed, 
    page 
  }) => {
    const mock: ApiInterceptorDefinition = {
      initialize: "$state.requestCount = 0;",
      operations: {
        "get-items": {
          url: "/api/items",
          method: "get",
          handler: `
            $state.requestCount++;
            const filter = $queryParams.filter || 'none';
            return { 
              items: [], 
              filter: filter,
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
          onSuccess="result => testState = result"
        />
        <DataSource 
          id="ds" 
          url="/api/items"
          queryParams="{filter: 'inactive'}"
        />
        <Button testId="trigger" onClick="api.execute()" />
        <Text testId="api-result" value="{JSON.stringify(testState)}" />
        <Text testId="ds-result" value="{JSON.stringify(ds.value)}" />
      </Fragment>
      `,
      { apiInterceptor: mock }
    );

    await page.getByTestId("trigger").click();
    
    await expect(page.getByTestId("api-result")).toContainText("requestNumber");
    await expect(page.getByTestId("ds-result")).toContainText("requestNumber");
    
    // Different query params = different cache keys = 2 requests
    await expect(page.getByTestId("api-result")).toContainText('"requestNumber":1');
    await expect(page.getByTestId("ds-result")).toContainText('"requestNumber":2');
    
    // Verify they got different filters
    await expect(page.getByTestId("api-result")).toContainText('"filter":"active"');
    await expect(page.getByTestId("ds-result")).toContainText('"filter":"inactive"');
  });

  test("step5: same query params share cache", async ({ initTestBed, page }) => {
    const mock: ApiInterceptorDefinition = {
      initialize: "$state.requestCount = 0;",
      operations: {
        "get-items": {
          url: "/api/items",
          method: "get",
          handler: `
            $state.requestCount++;
            const filter = $queryParams.filter || 'all';
            return { 
              items: [], 
              filter: filter,
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
          onSuccess="result => testState = result"
        />
        <DataSource 
          id="ds" 
          url="/api/items"
          queryParams="{filter: 'active'}"
        />
        <Button testId="trigger" onClick="api.execute()" />
        <Text testId="api-result" value="{JSON.stringify(testState)}" />
        <Text testId="ds-result" value="{JSON.stringify(ds.value)}" />
      </Fragment>
      `,
      { apiInterceptor: mock }
    );

    await page.getByTestId("trigger").click();
    
    await expect(page.getByTestId("api-result")).toContainText("requestNumber");
    await expect(page.getByTestId("ds-result")).toContainText("requestNumber");
    
    // Same query params = shared cache = 1 request
    await expect(page.getByTestId("api-result")).toContainText('"requestNumber":1');
    await expect(page.getByTestId("ds-result")).toContainText('"requestNumber":1');
    
    // Verify they got the same filter
    await expect(page.getByTestId("api-result")).toContainText('"filter":"active"');
    await expect(page.getByTestId("ds-result")).toContainText('"filter":"active"');
  });

  test("step5: body parameter affects cache key", async ({ initTestBed, page }) => {
    const mock: ApiInterceptorDefinition = {
      initialize: "$state.requestCount = 0;",
      operations: {
        "get-search": {
          url: "/api/search",
          method: "get",
          handler: `
            $state.requestCount++;
            const searchTerm = $body?.term || 'none';
            return { 
              results: [], 
              searchTerm: searchTerm,
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
          url="/api/search" 
          body="{term: 'foo'}"
          allowCache="true"
          onSuccess="result => testState = result"
        />
        <DataSource 
          id="ds" 
          url="/api/search"
          body="{term: 'bar'}"
        />
        <Button testId="trigger" onClick="api.execute()" />
        <Text testId="api-result" value="{JSON.stringify(testState)}" />
        <Text testId="ds-result" value="{JSON.stringify(ds.value)}" />
      </Fragment>
      `,
      { apiInterceptor: mock }
    );

    await page.getByTestId("trigger").click();
    
    await expect(page.getByTestId("api-result")).toContainText("requestNumber");
    await expect(page.getByTestId("ds-result")).toContainText("requestNumber");
    
    // Different body = different cache keys = 2 requests
    await expect(page.getByTestId("api-result")).toContainText('"requestNumber":1');
    await expect(page.getByTestId("ds-result")).toContainText('"requestNumber":2');
  });
});
```

**Success Criteria**:
- ✅ Different query params test passes (2 requests)
- ✅ Same query params test passes (1 request)
- ✅ Different body params test passes (2 requests)
- ✅ All previous tests still pass

**Commands to run**:
```bash
npx playwright test APICall-caching.spec.ts --workers=1 --reporter=line
```

**Approval Checkpoint**: ⏸️ **STOP HERE - Wait for approval before Step 6**

---

### ⏸️ Step 6: Cleanup and Final Validation

**Goal**: Remove debug console.log statements, verify all tests pass, ensure production-ready code.

**Files to modify**:
1. `xmlui/src/components-core/action/APICall.tsx` - Remove or reduce logging

**Changes**:

**Option 1 - Remove all logging**:
```typescript
// Cache the result if caching is enabled
if (appContext.queryClient && allowCache) {
  const normalizedMethod = (method || 'get').toLowerCase();
  
  if (normalizedMethod === 'get') {
    const effectiveStaleTime = staleTime ?? 300000;
    
    const queryKey = new DataLoaderQueryKeyGenerator(
      extractParam(stateContext, url, appContext),
      extractParam(stateContext, queryParams, appContext),
      appContext.appGlobals?.apiUrl,
      extractParam(stateContext, body, appContext),
      extractParam(stateContext, rawBody, appContext),
    ).asKey();
    
    appContext.queryClient.setQueryData(queryKey, result);
    appContext.queryClient.setQueryDefaults(queryKey, { 
      staleTime: effectiveStaleTime 
    });
  }
}
```

**Option 2 - Keep minimal logging** (recommended for debugging):
```typescript
// Cache the result if caching is enabled
if (appContext.queryClient && allowCache) {
  const normalizedMethod = (method || 'get').toLowerCase();
  
  if (normalizedMethod === 'get') {
    const effectiveStaleTime = staleTime ?? 300000;
    
    const queryKey = new DataLoaderQueryKeyGenerator(
      extractParam(stateContext, url, appContext),
      extractParam(stateContext, queryParams, appContext),
      appContext.appGlobals?.apiUrl,
      extractParam(stateContext, body, appContext),
      extractParam(stateContext, rawBody, appContext),
    ).asKey();
    
    appContext.queryClient.setQueryData(queryKey, result);
    appContext.queryClient.setQueryDefaults(queryKey, { 
      staleTime: effectiveStaleTime 
    });
    
    // Keep this single log for debugging (can be removed later)
    console.log("[APICall] Cached:", queryKey[0]);
  }
}
```

**Update tests** that relied on console logs (if using Option 1):
- Remove console capture code from Step 2, 4 tests
- Keep functional assertions that don't depend on console output

**Final validation checklist**:
```bash
# Run all caching tests
npx playwright test APICall-caching.spec.ts --workers=1 --reporter=line

# Run all existing APICall tests
npx playwright test APICall.spec.ts --workers=1 --reporter=line

# Run DataSource tests (ensure no regression)
npx playwright test DataSource.spec.ts --workers=1 --reporter=line

# Optional: Run broader test suite
npx playwright test --grep "APICall|DataSource" --workers=1 --reporter=line
```

**Success Criteria**:
- ✅ All caching tests pass without console log dependencies
- ✅ All existing APICall tests pass (no regressions)
- ✅ All DataSource tests pass (no regressions)
- ✅ Code is clean and production-ready
- ✅ No TypeScript errors
- ✅ Documentation updated (if needed)

**Final checklist**:
- [ ] All tests passing
- [ ] Code reviewed for edge cases
- [ ] Performance acceptable (no memory leaks)
- [ ] Backward compatibility verified
- [ ] Ready for pull request

**Approval Checkpoint**: ⏸️ **STOP HERE - Final review before marking complete**

---

## Summary of Implementation

### What We Built (Step-by-Step)

**Step 0**: Baseline tests (current behavior: 2 requests)  
**Step 1**: Added `allowCache` property (metadata only)  
**Step 2**: Generated query keys (logging only, no caching)  
**Step 3**: ✨ **Implemented caching** (1 request when enabled)  
**Step 4**: Added `staleTime` for cache lifetime control  
**Step 5**: Verified query parameter differentiation  
**Step 6**: Cleanup and final validation  

### Key Features Delivered

✅ **Explicit opt-in caching**: `allowCache="true"` required  
✅ **GET requests only**: POST/PUT/DELETE never cached  
✅ **Cache sharing**: APICall → React Query ← DataSource  
✅ **Cache lifetime control**: `staleTime` property (default: 5 min)  
✅ **Query key consistency**: Same logic as DataSource  
✅ **Backward compatible**: Default behavior unchanged  

### API Usage

```xmlui
<!-- Basic caching -->
<APICall 
  url="/api/folders/123/children" 
  method="get"
  allowCache="true"
  onSuccess="..."
/>

<!-- Custom cache lifetime -->
<APICall 
  url="/api/data" 
  allowCache="true"
  staleTime="60000"
  onSuccess="..."
/>

<!-- No caching (default) -->
<APICall 
  url="/api/data" 
  method="post"
  onSuccess="..."
/>
```

### Benefits

1. **Performance**: Eliminates duplicate network requests
2. **UX**: Faster perceived load times (instant data from cache)
3. **Consistency**: APICall and DataSource use same caching mechanism
4. **Safety**: POST/PUT/DELETE operations never cached
5. **Flexibility**: Opt-in, configurable, backward compatible

---

## Edge Cases Handled

✅ **Different query parameters**: Create separate cache entries  
✅ **Different body parameters**: Create separate cache entries  
✅ **POST/PUT/DELETE requests**: Never cached (safety)  
✅ **Missing queryClient**: Gracefully skips caching  
✅ **allowCache=false**: No caching (default behavior)  
✅ **Optimistic updates**: Don't conflict with response caching  

---

## Testing Strategy Summary

Each step had **clear, focused tests**:
- **Step 0**: Baseline behavior verification
- **Step 1**: Property acceptance without errors
- **Step 2**: Query key generation without side effects
- **Step 3**: Actual caching behavior (main feature)
- **Step 4**: StaleTime configuration
- **Step 5**: Query parameter differentiation
- **Step 6**: Final integration testing

All tests use `ApiInterceptorDefinition` with `$state.requestCount` to track network requests.

---

## Open Questions & Future Work

### Resolved
- ✅ Caching enabled by default? **No** - explicit opt-in required
- ✅ POST/PUT/DELETE caching? **No** - safety check prevents it
- ✅ Query key consistency? **Yes** - uses same `DataLoaderQueryKeyGenerator`

### Future Enhancements (Not in this implementation)
- `gcTime` property (garbage collection time)
- Cache prefetching
- Cache debugging tools (use React Query DevTools)
- `executeWithCaching()` method (alternative API)

---

## Rollback Strategy

If any step fails:
1. **Revert production code** to previous step
2. **Keep test file** for debugging
3. **Investigate issue** in isolation
4. **Fix and retry** current step
5. **Don't proceed** until step passes

---

## References

- **DataSource**: `xmlui/src/components/DataSource/DataSource.tsx`
- **DataLoader**: `xmlui/src/components-core/loader/DataLoader.tsx`
- **APICall Action**: `xmlui/src/components-core/action/APICall.tsx`
- **Query Key Generator**: `xmlui/src/components-core/utils/DataLoaderQueryKeyGenerator.ts`
- **React Query**: https://tanstack.com/query/latest/docs/react/overview

---

## Next Steps

1. ✅ Review this plan
2. ⏸️ Get approval for Step 0
3. ⏸️ Execute Step 0 (baseline tests)
4. ⏸️ Get approval for Step 1
5. ⏸️ Execute each step sequentially with approval gates
6. ⏸️ Final review and merge

**Remember**: Wait for approval at each checkpoint. All tests must pass before proceeding.

# APICall Deferred Operations Plan

> **Implementation References**: This plan follows conventions defined in:
> - [conv-create-components.md](/Users/dotneteer/source/xmlui/xmlui/dev-docs/conv-create-components.md) - Component creation patterns
> - [conv-e2e-testing.md](/Users/dotneteer/source/xmlui/xmlui/dev-docs/conv-e2e-testing.md) - E2E testing patterns
>
> These documents contain essential patterns for:
> - Component metadata, renderers, and native implementations
> - Test structure, fixtures, and Playwright usage
> - Mock API patterns with ApiInterceptorDefinition
> - State testing with testStateDriver

## Problem Statement

### Current Situation
When dealing with long-running server-side operations that return `202 Accepted` immediately:

1. **Server Behavior**:
   - Client makes a request (e.g., "Enable Encryption at Rest")
   - Server returns `202 Accepted` immediately with a tracking URL/ID
   - Actual operation takes time to complete on the server
   - Server exposes a status endpoint to track progress

2. **Current Limitations**:
   - **APICall**: Only signals when the initial request succeeds/fails, not when the deferred operation completes
   - **Queue**: Designed for async XMLUI processing (client-side task batching), not server-side async operations
   - **DataSource workaround**: Requires manual polling logic with flags and variables; `onLoaded` doesn't fire if data unchanged, making completion detection unreliable

3. **Current Workaround Problems**:
   ```xmlui
   <!-- Current messy approach -->
   <DataSource 
     id="statusPoller" 
     url="{$statusUrl}" 
     refreshInterval="2000"
     onLoaded="
       if ($data.status === 'completed') {
         toast('Operation completed!');
         // Stop polling somehow?
         // Track completion flag manually
       } else if ($data.status === 'failed') {
         toast('Operation failed');
       }
     "
   />
   ```
   Issues:
   - Manually managing polling state
   - No built-in progress indicators
   - `onLoaded` doesn't fire if server returns same data
   - No automatic cleanup when complete
   - Scattered logic for showing toasts

### What Users Need

A clean way to:
1. Execute an API call that returns `202 Accepted`
2. Automatically poll a status endpoint
3. Show progress notifications automatically
4. Detect completion/failure
5. Stop polling when done
6. Clean up resources
7. Handle errors gracefully

## Proposed Solution

### Extend APICall Component

Add deferred operation support to `APICall` through new properties:

```xmlui
<APICall
  id="enableEncryption"
  method="post"
  url="/api/encryption/enable"
  
  <!-- New deferred operation properties -->
  deferredMode="true"
  statusUrl="/api/encryption/status/{$result.operationId}"
  statusMethod="get"
  pollingInterval="2000"
  maxPollingDuration="300000"
  completionCondition="$statusData.status === 'completed'"
  errorCondition="$statusData.status === 'failed'"
  progressExtractor="$statusData.percentComplete"
  
  <!-- Notification support -->
  inProgressNotificationMessage="Enabling encryption: {$progress}% complete..."
  completedNotificationMessage="Encryption enabled successfully!"
  errorNotificationMessage="Failed to enable encryption: {$statusData.error}"
  
  <!-- Events -->
  onSuccess="handleEncryptionSuccess($result)"
  onError="handleEncryptionError($error)"
  onProgress="updateProgressBar($progress)"
  onStatusUpdate="logStatus($statusData)"
/>
```

### Key Features

#### 1. **Deferred Mode Properties**

| Property | Type | Description |
|----------|------|-------------|
| `deferredMode` | boolean | Enables deferred operation tracking (default: false) |
| `statusUrl` | string | URL template for polling status. Can use `$result` context from initial response |
| `statusMethod` | string | HTTP method for status requests (default: "get") |
| `statusHeaders` | object | Headers for status requests |
| `statusQueryParams` | object | Query params for status requests |

#### 2. **Polling Configuration**

| Property | Type | Description |
|----------|------|-------------|
| `pollingInterval` | number | Milliseconds between polls (default: 2000) |
| `maxPollingDuration` | number | Max time to poll before timeout (default: 300000 = 5 min) |
| `pollingBackoff` | string | Strategy: "none", "linear", "exponential" (default: "none") |
| `maxPollingInterval` | number | Max interval for backoff strategies (default: 30000) |

#### 3. **Status Interpretation**

| Property | Type | Description |
|----------|------|-------------|
| `completionCondition` | expression | Expression that returns true when operation is complete |
| `errorCondition` | expression | Expression that returns true when operation failed |
| `progressExtractor` | expression | Expression to extract progress value (0-100) |
| `statusDataPath` | string | JSONPath to status data in response (default: root) |

#### 4. **Enhanced Notifications**

Automatic toast notifications with progress updates:
- Progress messages use `$progress` context variable
- Completion/error messages use `$statusData` context
- Supports dismissible toasts with auto-update

#### 5. **New Events**

| Event | Description | Signature |
|-------|-------------|-----------|
| `onStatusUpdate` | Fires on each poll | `(statusData: any, progress: number) => void` |
| `onPollingStart` | Fires when polling begins | `(initialResult: any) => void` |
| `onPollingComplete` | Fires when polling stops (success/failure/timeout) | `(finalStatus: any, reason: string) => void` |
| `onTimeout` | Fires if max polling duration exceeded | `() => void` |

#### 6. **New Context Variables**

| Variable | Description |
|----------|-------------|
| `$statusData` | Latest status response data |
| `$progress` | Current progress (0-100) |
| `$polling` | Boolean indicating if polling is active |
| `$attempts` | Number of status polls made |
| `$elapsed` | Time elapsed since polling started (ms) |

#### 7. **New API Methods**

| Method | Description |
|--------|-------------|
| `stopPolling()` | Manually stop polling |
| `resumePolling()` | Resume polling if stopped |
| `getStatus()` | Get current status data |
| `isPolling()` | Check if polling is active |

## Implementation Strategy

### Testing Best Practice

**⚠️ IMPORTANT: Efficient Test Execution**

When implementing each step:
1. **After making changes**: Run ONLY the failing/new tests first using `--grep` flag
   ```bash
   npx playwright test APICall.spec.ts --grep "Step 3" --reporter=line
   ```
2. **Once specific tests pass**: Run the complete test suite to ensure no regressions
   ```bash
   npx playwright test APICall.spec.ts --reporter=line
   ```

This approach saves significant time during iterative development while ensuring overall quality.

### XMLUI Scripting Patterns

**⚠️ IMPORTANT: XMLUI Script Constraints**

XMLUI scripting has different patterns than standard JavaScript:

1. **Async/Await**: XMLUI does NOT support `async`/`await` keywords
   - XMLUI automatically detects async functions and awaits them
   - Write async code as if it's synchronous
   ```xmlui
   <!-- ✅ CORRECT - XMLUI handles async automatically -->
   <Button onClick="api.execute(); delay(100); testState = api.getStatus();" />
   
   <!-- ❌ INCORRECT - No await keyword -->
   <Button onClick="await api.execute(); await delay(100); testState = api.getStatus();" />
   ```

2. **Delays**: Use `delay()` function, NOT `setTimeout()`
   ```xmlui
   <!-- ✅ CORRECT -->
   <Button onClick="delay(100); doSomething();" />
   
   <!-- ❌ INCORRECT - setTimeout not available -->
   <Button onClick="setTimeout(() => { doSomething(); }, 100);" />
   ```

3. **Sequential Async Operations**: Simply write them in sequence
   ```xmlui
   <!-- ✅ CORRECT - XMLUI executes sequentially -->
   <Button onClick="
     let result = api.execute();
     delay(100);
     let status = api.getStatus();
     testState = { result, status };
   " />
   ```

These patterns apply to:
- Event handlers (`onClick`, `onSuccess`, etc.)
- Test state assignments
- Any XMLUI script context

### Phase 1: Core Deferred Logic

**Files to modify:**
- `APICall.tsx` - Add metadata for new properties/events/APIs
- `APICallNative.tsx` - Implement polling logic

**Key Implementation Points:**

1. **State Management**:
   ```typescript
   interface DeferredState {
     isPolling: boolean;
     statusData: any;
     progress: number;
     attempts: number;
     startTime: number;
     lastPollTime: number;
     pollingIntervalId?: NodeJS.Timeout;
     progressToastId?: string;
   }
   ```

2. **Polling Hook**:
   ```typescript
   const useDeferredPolling = (
     enabled: boolean,
     statusUrl: string,
     options: PollingOptions,
     callbacks: PollingCallbacks
   ) => {
     // Implement polling logic with:
     // - Interval management
     // - Backoff strategies
     // - Timeout detection
     // - Cleanup on unmount
   }
   ```

3. **Execute Flow**:
   ```typescript
   async function execute(...args) {
     // 1. Execute initial API call
     const initialResult = await callApi(...);
     
     // 2. If deferredMode, start polling
     if (deferredMode) {
       startPolling(initialResult);
     }
     
     // 3. Return initial result immediately
     return initialResult;
   }
   ```

4. **Polling Flow**:
   ```typescript
   async function pollStatus() {
     const statusResponse = await fetch(statusUrl);
     const statusData = await statusResponse.json();
     
     // Update progress
     const progress = evaluateProgressExpression(statusData);
     updateProgressNotification(progress);
     
     // Check completion
     if (evaluateCompletionCondition(statusData)) {
       stopPolling();
       showCompletionNotification(statusData);
       fireSuccessEvent(statusData);
       return;
     }
     
     // Check error
     if (evaluateErrorCondition(statusData)) {
       stopPolling();
       showErrorNotification(statusData);
       fireErrorEvent(statusData);
       return;
     }
     
     // Check timeout
     if (elapsedTime > maxPollingDuration) {
       stopPolling();
       fireTimeoutEvent();
       return;
     }
     
     // Continue polling
     scheduleNextPoll();
   }
   ```

### Phase 2: Backoff Strategies

Implement polling backoff:

```typescript
function calculateNextInterval(
  baseInterval: number,
  attempt: number,
  strategy: 'none' | 'linear' | 'exponential',
  maxInterval: number
): number {
  switch (strategy) {
    case 'linear':
      return Math.min(baseInterval + (attempt * 1000), maxInterval);
    case 'exponential':
      return Math.min(baseInterval * Math.pow(2, attempt), maxInterval);
    default:
      return baseInterval;
  }
}
```

### Phase 3: Enhanced Notifications

Implement smart toast management:

```typescript
function updateProgressNotification(progress: number, message: string) {
  if (!progressToastId) {
    // Create new toast
    progressToastId = toast.loading(message, {
      duration: Infinity,
    });
  } else {
    // Update existing toast
    toast.loading(message, {
      id: progressToastId,
    });
  }
}

function showCompletionNotification(statusData: any) {
  if (progressToastId) {
    toast.success(completedNotificationMessage, {
      id: progressToastId,
    });
  } else {
    toast.success(completedNotificationMessage);
  }
}
```

### Phase 4: Context Variable Support

Expose deferred state as context variables:

```typescript
contextVars: {
  $statusData: state.deferredState?.statusData,
  $progress: state.deferredState?.progress || 0,
  $polling: state.deferredState?.isPolling || false,
  $attempts: state.deferredState?.attempts || 0,
  $elapsed: state.deferredState?.startTime 
    ? Date.now() - state.deferredState.startTime 
    : 0,
}
```

## Usage Examples

### Example 1: Basic Deferred Operation

```xmlui
<APICall
  id="enableEncryption"
  method="post"
  url="/api/encryption/enable"
  body="{ datasetId: $datasetId }"
  
  deferredMode="true"
  statusUrl="/api/encryption/status/{$result.operationId}"
  completionCondition="$statusData.status === 'completed'"
  errorCondition="$statusData.status === 'failed'"
  
  inProgressNotificationMessage="Enabling encryption..."
  completedNotificationMessage="Encryption enabled successfully!"
  errorNotificationMessage="Failed to enable encryption: {$statusData.message}"
  
  onSuccess="refreshDatasetList()"
/>

<Button 
  label="Enable Encryption" 
  onClick="$api.enableEncryption.execute()"
/>
```

### Example 2: With Progress Tracking

```xmlui
<APICall
  id="processData"
  method="post"
  url="/api/data/process"
  
  deferredMode="true"
  statusUrl="/api/data/status/{$result.jobId}"
  pollingInterval="1000"
  completionCondition="$statusData.progress === 100"
  progressExtractor="$statusData.progress"
  
  inProgressNotificationMessage="Processing: {$progress}% complete"
  completedNotificationMessage="Processing complete!"
  
  onStatusUpdate="updateProgressBar($progress)"
/>

<Stack>
  <Button 
    label="Process Data" 
    onClick="$api.processData.execute()"
  />
  <ProgressBar 
    value="{$api.processData.$progress}"
    visible="{$api.processData.$polling}"
  />
  <Text value="Attempt: {$api.processData.$attempts}" />
</Stack>
```

### Example 3: With Exponential Backoff

```xmlui
<APICall
  id="longOperation"
  method="post"
  url="/api/operations/start"
  
  deferredMode="true"
  statusUrl="/api/operations/{$result.id}/status"
  pollingInterval="2000"
  pollingBackoff="exponential"
  maxPollingInterval="30000"
  maxPollingDuration="600000"
  
  completionCondition="$statusData.state === 'SUCCESS'"
  errorCondition="$statusData.state === 'FAILED'"
  
  onPollingStart="toast('Operation started')"
  onTimeout="toast('Operation timed out')"
  onSuccess="handleSuccess($statusData)"
/>
```

### Example 4: Manual Polling Control

```xmlui
<APICall
  id="backgroundTask"
  method="post"
  url="/api/tasks"
  
  deferredMode="true"
  statusUrl="/api/tasks/{$result.taskId}"
  completionCondition="$statusData.done === true"
/>

<Stack>
  <Button 
    label="Start Task" 
    onClick="$api.backgroundTask.execute()"
  />
  <Button 
    label="Stop Polling" 
    onClick="$api.backgroundTask.stopPolling()"
    enabled="{$api.backgroundTask.$polling}"
  />
  <Button 
    label="Resume Polling" 
    onClick="$api.backgroundTask.resumePolling()"
    enabled="{!$api.backgroundTask.$polling}"
  />
  <Button 
    label="Check Status" 
    onClick="toast(JSON.stringify($api.backgroundTask.getStatus()))"
  />
</Stack>
```

### Example 5: Complex Status Checks

```xmlui
<APICall
  id="deployment"
  method="post"
  url="/api/deploy"
  
  deferredMode="true"
  statusUrl="/api/deployments/{$result.deploymentId}/status"
  statusHeaders="{ Authorization: 'Bearer {$authToken}' }"
  
  completionCondition="
    $statusData.phase === 'Succeeded' || 
    ($statusData.phase === 'Running' && $statusData.conditions?.find(c => c.type === 'Ready' && c.status === 'True'))
  "
  errorCondition="
    $statusData.phase === 'Failed' || 
    $statusData.conditions?.some(c => c.type === 'Failed' && c.status === 'True')
  "
  progressExtractor="
    ($statusData.readyReplicas || 0) / ($statusData.replicas || 1) * 100
  "
  
  inProgressNotificationMessage="Deploying: {$statusData.readyReplicas}/{$statusData.replicas} replicas ready"
  completedNotificationMessage="Deployment successful!"
  errorNotificationMessage="Deployment failed: {$statusData.conditions?.find(c => c.type === 'Failed')?.message}"
/>
```

## API Specification

### New Props

```typescript
interface DeferredOperationProps {
  // Enable deferred mode
  deferredMode?: boolean;
  
  // Status endpoint configuration
  statusUrl?: string;
  statusMethod?: 'get' | 'post' | 'put' | 'patch' | 'delete';
  statusHeaders?: Record<string, string>;
  statusQueryParams?: Record<string, any>;
  statusBody?: any;
  
  // Polling behavior
  pollingInterval?: number; // milliseconds, default: 2000
  maxPollingDuration?: number; // milliseconds, default: 300000
  pollingBackoff?: 'none' | 'linear' | 'exponential'; // default: 'none'
  maxPollingInterval?: number; // milliseconds, default: 30000
  
  // Status interpretation
  completionCondition?: string; // expression
  errorCondition?: string; // expression
  progressExtractor?: string; // expression
  statusDataPath?: string; // JSONPath, default: root
  
  // Auto-retry on status check failure
  maxStatusRetries?: number; // default: 3
  statusRetryDelay?: number; // milliseconds, default: 1000
  
  // Server-side cancellation
  cancelUrl?: string; // URL template for cancelling operation
  cancelMethod?: 'get' | 'post' | 'put' | 'delete'; // default: 'post'
  cancelBody?: any; // Body to send with cancel request
}
```

### New Events

```typescript
interface DeferredOperationEvents {
  onStatusUpdate?: (statusData: any, progress: number) => void;
  onPollingStart?: (initialResult: any) => void;
  onPollingComplete?: (finalStatus: any, reason: 'completed' | 'failed' | 'timeout' | 'manual') => void;
  onTimeout?: () => void;
}
```

### New Context Variables

```typescript
interface DeferredContextVars {
  $statusData: any; // Latest status response
  $progress: number; // 0-100
  $polling: boolean; // Is polling active
  $attempts: number; // Number of polls made
  $elapsed: number; // Time since polling started (ms)
}
```

### New API Methods

```typescript
interface DeferredOperationAPI {
  stopPolling(): void;
  resumePolling(): void;
  getStatus(): any;
  isPolling(): boolean;
  cancel(): Promise<void>; // Cancel operation on server and stop polling
}
```

## Testing Strategy

### Unit Tests

1. **Polling Logic**:
   - Verify polling starts after initial request
   - Verify polling interval timing
   - Verify backoff strategies
   - Verify timeout detection

2. **Condition Evaluation**:
   - Test completion condition evaluation
   - Test error condition evaluation
   - Test progress extraction

3. **State Management**:
   - Verify state updates on each poll
   - Verify cleanup on unmount
   - Verify context variable updates

4. **API Methods**:
   - Test stopPolling()
   - Test resumePolling()
   - Test getStatus()

### Integration Tests

1. **End-to-End Flow**:
   - Mock API returning 202 + status endpoint
   - Verify full deferred operation flow
   - Verify notifications shown correctly

2. **Error Scenarios**:
   - Status endpoint returns error
   - Status endpoint returns 404
   - Timeout scenarios
   - Network failures during polling

3. **Multiple Concurrent Operations**:
   - Verify multiple deferred calls don't interfere
   - Verify proper cleanup

## Migration Path

### Backward Compatibility

All new features are opt-in via `deferredMode` flag:
- Existing APICall usage unchanged
- No breaking changes
- Can gradually adopt deferred features

### Documentation Updates

1. **Component Reference**:
   - Add deferred operation section
   - Document all new properties
   - Add usage examples

2. **How-To Guide**:
   - Create "Handling Long-Running Operations" guide
   - Show common patterns
   - Include Reese's encryption scenario

3. **API Reference**:
   - Update context variables
   - Update API methods
   - Add migration examples

## Open Questions

1. **Status Endpoint Response Format**:
   - Should we standardize on a response format?
   - Or keep it fully customizable via expressions?
   - Current proposal: Fully customizable

2. **Polling Persistence**:
   - Should polling survive page navigation?
   - Store polling state in localStorage/sessionStorage?
   - Current proposal: No persistence (stops on unmount)

3. **Multiple Status Checks**:
   - Should we support checking multiple endpoints?
   - Use case: Check both operation status and resource availability
   - Current proposal: Single endpoint (can be extended later)

4. **Cancellation**:
   - Should we support server-side cancellation?
   - Add `cancelUrl` property?
   - Current proposal: Not in v1, add if needed

5. **Notification Customization**:
   - Allow custom toast components?
   - Support for different notification styles (toast, modal, inline)?
   - Current proposal: Use existing toast system, can extend later

## Success Criteria

1. **User Experience**:
   - ✅ Reese's encryption scenario works with clean markup
   - ✅ No manual flag/variable management needed
   - ✅ Automatic progress feedback
   - ✅ Automatic cleanup

2. **Code Quality**:
   - ✅ No breaking changes to existing APICall usage
   - ✅ Well-documented with examples
   - ✅ Comprehensive test coverage
   - ✅ Clean abstraction of polling logic

3. **Performance**:
   - ✅ Efficient polling with backoff
   - ✅ No memory leaks
   - ✅ Proper cleanup on unmount

## Testing Strategy

### Understanding XMLUI Test Infrastructure

XMLUI uses **Playwright** for E2E testing with a custom `ApiInterceptorDefinition` system for mocking backends.

#### Key Testing Patterns from Existing Tests

**1. API Interceptor Pattern**

Mock API responses using handler functions:

```typescript
const deferredApiInterceptor: ApiInterceptorDefinition = {
  operations: {
    "enable-encryption": {
      url: "/api/encryption/enable",
      method: "post",
      handler: `return { operationId: "op-123", status: "accepted" };`,
    },
    "check-status-pending": {
      url: "/api/encryption/status/op-123",
      method: "get",
      handler: `return { status: "pending", progress: 0 };`,
    },
  },
};
```

**2. Async Delays in Handlers**

Use `setTimeout` in handler code to simulate slow operations:

```typescript
"slow-operation": {
  url: "/api/slow",
  method: "get",
  handler: `
    await new Promise(resolve => setTimeout(resolve, 100));
    return { message: "Completed after delay" };
  `,
}
```

**3. State Tracking Pattern**

Test component state using `testState`:

```typescript
const { testStateDriver } = await initTestBed(`
  <Fragment>
    <APICall id="api" url="/api/test" onSuccess="result => testState = result" />
    <Button testId="trigger" onClick="api.execute()" />
  </Fragment>
`);

await button.click();
await expect.poll(testStateDriver.testState, { timeout: 2000 }).toEqual(expectedValue);
```

**4. Testing inProgress State**

Verify state changes during execution:

```typescript
// Check during execution
await executeButton.click();
await checkButton.click();
await expect.poll(testStateDriver.testState).toEqual(true);

// Wait for completion
await new Promise((resolve) => setTimeout(resolve, 500));

// Check after completion
await checkButton.click();
await expect.poll(testStateDriver.testState).toEqual(false);
```

### Mock Backend Strategies for Deferred Operations

#### Strategy 1: Stateful Interceptor (Recommended)

Use handler state to track operation progress:

```typescript
const deferredMockBackend: ApiInterceptorDefinition = {
  operations: {
    // Initial request - returns 202 Accepted
    "start-operation": {
      url: "/api/operation/start",
      method: "post",
      handler: `
        const operationId = 'op-' + Math.random().toString(36).substr(2, 9);
        
        // Store operation in mock state
        if (!globalThis.mockOperations) {
          globalThis.mockOperations = {};
        }
        globalThis.mockOperations[operationId] = {
          status: 'pending',
          progress: 0,
          startTime: Date.now()
        };
        
        return { operationId, status: 'accepted' };
      `,
    },
    
    // Status endpoint - updates progress over time
    "check-status": {
      url: "/api/operation/status/:operationId",
      method: "get",
      handler: `
        const { operationId } = $pathParams;
        const operation = globalThis.mockOperations?.[operationId];
        
        if (!operation) {
          throw Errors.HttpError(404, { message: "Operation not found" });
        }
        
        // Simulate progress over time
        const elapsed = Date.now() - operation.startTime;
        
        if (elapsed < 1000) {
          operation.progress = 25;
          operation.status = 'pending';
        } else if (elapsed < 2000) {
          operation.progress = 50;
          operation.status = 'in-progress';
        } else if (elapsed < 3000) {
          operation.progress = 75;
          operation.status = 'in-progress';
        } else {
          operation.progress = 100;
          operation.status = 'completed';
        }
        
        return operation;
      `,
    },
  },
};
```

#### Strategy 2: Call Counter Pattern

Track how many times status endpoint is called:

```typescript
const counterBasedMock: ApiInterceptorDefinition = {
  operations: {
    "start-task": {
      url: "/api/task",
      method: "post",
      handler: `
        globalThis.statusCallCount = 0;
        return { taskId: "task-123" };
      `,
    },
    "check-status": {
      url: "/api/task/status/task-123",
      method: "get",
      handler: `
        if (!globalThis.statusCallCount) globalThis.statusCallCount = 0;
        globalThis.statusCallCount++;
        
        // Return different status based on call count
        if (globalThis.statusCallCount === 1) {
          return { status: 'pending', progress: 0 };
        } else if (globalThis.statusCallCount === 2) {
          return { status: 'in-progress', progress: 50 };
        } else {
          return { status: 'completed', progress: 100 };
        }
      `,
    },
  },
};
```

#### Strategy 3: Explicit Status Sequence

Define specific responses for testing:

```typescript
const explicitSequenceMock: ApiInterceptorDefinition = {
  operations: {
    "init-operation": {
      url: "/api/encrypt",
      method: "post",
      handler: `return { id: "enc-1" };`,
    },
    "status-pending": {
      url: "/api/encrypt/status-pending",
      method: "get",
      handler: `return { status: "pending", percentComplete: 10 };`,
    },
    "status-progress": {
      url: "/api/encrypt/status-progress",
      method: "get",
      handler: `return { status: "in-progress", percentComplete: 60 };`,
    },
    "status-completed": {
      url: "/api/encrypt/status-completed",
      method: "get",
      handler: `return { status: "completed", percentComplete: 100 };`,
    },
    "status-failed": {
      url: "/api/encrypt/status-failed",
      method: "get",
      handler: `return { status: "failed", error: "Encryption failed" };`,
    },
  },
};
```

#### Strategy 4: Error Scenarios

Test error handling during polling:

```typescript
const errorScenarioMock: ApiInterceptorDefinition = {
  operations: {
    "start-op": {
      url: "/api/operation",
      method: "post",
      handler: `return { id: "op-1" };`,
    },
    
    // Status endpoint that fails intermittently
    "status-with-errors": {
      url: "/api/operation/status/:id",
      method: "get",
      handler: `
        if (!globalThis.statusAttempts) globalThis.statusAttempts = 0;
        globalThis.statusAttempts++;
        
        // First 2 calls fail (to test retry logic)
        if (globalThis.statusAttempts <= 2) {
          throw Errors.HttpError(503, { message: "Service temporarily unavailable" });
        }
        
        // Third call succeeds
        return { status: "completed" };
      `,
    },
    
    // Status endpoint times out
    "status-timeout": {
      url: "/api/operation/timeout/:id",
      method: "get",
      handler: `
        await new Promise(resolve => setTimeout(resolve, 10000));
        return { status: "completed" };
      `,
    },
  },
};
```

## Incremental Implementation Plan

Break down the feature into small, testable steps where **each step can be verified with E2E tests** while **all existing tests continue passing**.

### Step 0: Preparation & Analysis ✅

**Goal**: Understand current implementation and prepare for changes.

**Tasks**:
- [x] Review existing APICall implementation
- [x] Study testing conventions and patterns
- [x] Examine APICall.spec.ts test structure
- [x] Create comprehensive implementation plan

**Verification**: Plan reviewed and approved.

---

### Step 1: Add Basic Deferred Properties (Metadata Only) ✅

**Goal**: Add new metadata without changing behavior. All existing tests pass.

**Changes**:
- ✅ Added new properties to `APICallMd` in `APICall.tsx`:
  - `deferredMode` (boolean, default: false)
  - `statusUrl` (string)
  - `statusMethod` (string, default: "get")
  - `pollingInterval` (number, default: 2000)
  - `maxPollingDuration` (number, default: 300000)
  - `completionCondition` (string)
  - `errorCondition` (string)
  - `progressExtractor` (string)
- ✅ Added new context variables to metadata:
  - `$statusData`, `$progress`, `$polling`, `$attempts`, `$elapsed`
- ✅ Added new events to metadata:
  - `statusUpdate`, `pollingStart`, `pollingComplete`, `timeout`
- ✅ Added new API methods to metadata:
  - `stopPolling()`, `resumePolling()`, `getStatus()`, `isPolling()`, `cancel()`

**Testing**: ✅ COMPLETE
- Created Step 1 test suite in `APICall.spec.ts` with 4 tests:
  - ✅ Accepts deferredMode property without error
  - ✅ Accepts all Step 1 deferred properties
  - ✅ Existing APICall functionality unchanged
  - ✅ Deferred properties have correct types

**Verification**: ✅ PASSED
- `npx playwright test APICall.spec.ts --reporter=line` - 64 passed (all existing + Step 1 tests)
- New properties accepted without errors
- No breaking changes to existing functionality

**Files Modified**:
- [APICall.tsx](APICall.tsx) - Added metadata properties, events, context variables, and API methods
- [APICall.spec.ts](APICall.spec.ts) - Added Step 1 test suite

---

### ✅ Step 2: Add Deferred State Management (COMPLETE)

**Goal**: Add state tracking for deferred operations. No polling yet.

**Changes**:
- Update `APICallNative.tsx` to initialize deferred state:
  ```typescript
  interface DeferredState {
    isPolling: boolean;
    statusData: any;
    progress: number;
    attempts: number;
    startTime: number;
  }
  ```
- Add to component state initialization
- Add new API methods (no-op for now):
  - `stopPolling()`
  - `resumePolling()`
  - `getStatus()`
  - `isPolling()`

**Testing**:
```typescript
test.describe("Deferred Mode - Step 2: State", () => {
  test("initializes deferred state when deferredMode enabled", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall id="api" url="/api/test" deferredMode="true" />
        <Button onClick="testState = api.isPolling()" testId="check" />
      </Fragment>
    `);
    
    const button = await createButtonDriver("check");
    await button.click();
    
    // Should be false (not polling yet)
    await expect.poll(testStateDriver.testState).toEqual(false);
  });
  
  test("exposes getStatus() API method", async ({ initTestBed, createButtonDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall id="api" url="/api/test" deferredMode="true" />
        <Button onClick="testState = api.getStatus()" testId="check" />
      </Fragment>
    `);
    
    const button = await createButtonDriver("check");
    await button.click();
    
    // Should return null/undefined initially
    await expect.poll(testStateDriver.testState).toEqual(null);
  });
});
```

**Verification**:
- All existing tests pass
- New API methods accessible
- State properly initialized

---

### ✅ Step 3: Implement Single Poll (No Loop) (COMPLETE)

**Goal**: Make status request after initial call completes. Single poll only.

**Changes**:
- In `APICallNative.tsx`, after `callApi` completes:
  - If `deferredMode === true`, extract `statusUrl`
  - Make single status request
  - Store result in `statusData`
  - Update state

**Mock Backend**:
```typescript
const singlePollMock: ApiInterceptorDefinition = {
  operations: {
    "start": {
      url: "/api/operation",
      method: "post",
      handler: `return { operationId: "op-123" };`,
    },
    "status": {
      url: "/api/operation/status/op-123",
      method: "get",
      handler: `return { status: "completed", progress: 100 };`,
    },
  },
};
```

**Testing**:
```typescript
test.describe("Deferred Mode - Step 3: Single Poll", () => {
  test("makes status request after initial call", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/operation" 
          method="post"
          deferredMode="true"
          statusUrl="/api/operation/status/{$result.operationId}"
        />
        <Button onClick="api.execute()" testId="exec" />
        <Button onClick="testState = api.getStatus()" testId="check" />
      </Fragment>
    `, {
      apiInterceptor: singlePollMock,
    });
    
    const execButton = await createButtonDriver("exec");
    const checkButton = await createButtonDriver("check");
    
    // Execute operation
    await execButton.click();
    
    // Wait for status check
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify status was fetched
    await checkButton.click();
    const status = await testStateDriver.testState();
    expect(status).toEqual({ status: "completed", progress: 100 });
  });
});
```

**Verification**:
- All existing tests pass
- Status endpoint called after initial request
- Status data stored correctly

---

### Step 4: Implement Polling Loop (Basic) ✅

**Goal**: Add interval-based polling with fixed interval.

**Changes**:
- Add `pollingIntervalRef` for interval management
- Distinguish between single poll (Step 3) and polling loop (Step 4)
  - If `pollingInterval` prop present: Start interval-based polling
  - If no `pollingInterval` prop: Do single poll (Step 3 behavior)
- Loop until `maxPollingDuration` reached
- Stop on unmount (cleanup in useEffect)
- Update `isPolling` state during polling
- Clear interval in `stopPolling()` and `cancel()`

**Mock Backend** (using `$state`):
```typescript
const pollingLoopMock: ApiInterceptorDefinition = {
  initialize: "$state.pollCount = 0;",
  operations: {
    "start": {
      url: "/api/task",
      method: "post",
      handler: `
        $state.pollCount = 0;
        return { taskId: "task-1" };
      `,
    },
    "status": {
      url: "/api/task/status/task-1",
      method: "get",
      handler: `
        $state.pollCount++;
        
        // Complete after 3 polls
        if ($state.pollCount >= 3) {
          return { status: "completed", pollCount: $state.pollCount };
        }
        
        return { status: "pending", pollCount: $state.pollCount };
      `,
    },
  },
};
```

**Testing**:
```typescript
test.describe("Deferred Mode - Step 4: Polling Loop", () => {
  test("polls status endpoint multiple times", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/task" 
          method="post"
          deferredMode="true"
          statusUrl="/api/task/status/{$result.taskId}"
          pollingInterval="500"
        />
        <Button onClick="api.execute()" testId="exec" />
        <Button onClick="testState = api.getStatus()" testId="check" />
      </Fragment>
    `, {
      apiInterceptor: pollingLoopMock,
    });
    
    const execButton = await createButtonDriver("exec");
    const checkButton = await createButtonDriver("check");
    
    await execButton.click();
    
    // Wait for multiple polls (3 * 500ms + buffer)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check final status
    await checkButton.click();
    const status = await testStateDriver.testState();
    expect(status.status).toEqual("completed");
    expect(status.pollCount).toBeGreaterThanOrEqual(3);
  });
  
  test("isPolling returns true during polling", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/task" 
          method="post"
          deferredMode="true"
          statusUrl="/api/task/status/{$result.taskId}"
          pollingInterval="500"
        />
        <Button onClick="api.execute()" testId="exec" />
        <Button onClick="testState = api.isPolling()" testId="check" />
      </Fragment>
    `, {
      apiInterceptor: pollingLoopMock,
    });
    
    const execButton = await createButtonDriver("exec");
    const checkButton = await createButtonDriver("check");
    
    await execButton.click();
    
    // Check immediately after starting
    await checkButton.click();
    await expect.poll(testStateDriver.testState).toEqual(true);
    
    // Wait for completion
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Should be false after completion
    await checkButton.click();
    await expect.poll(testStateDriver.testState).toEqual(false);
  });
  
  test("stopPolling() stops the polling loop", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/task" 
          method="post"
          deferredMode="true"
          statusUrl="/api/task/status/{$result.taskId}"
          pollingInterval="500"
        />
        <Button onClick="api.execute()" testId="exec" />
        <Button onClick="api.stopPolling()" testId="stop" />
        <Button onClick="testState = api.isPolling()" testId="check" />
      </Fragment>
    `, {
      apiInterceptor: pollingLoopMock,
    });
    
    const execButton = await createButtonDriver("exec");
    const stopButton = await createButtonDriver("stop");
    const checkButton = await createButtonDriver("check");
    
    await execButton.click();
    await stopButton.click();
    
    await checkButton.click();
    await expect.poll(testStateDriver.testState).toEqual(false);
  });
});
```

**Verification**:
- ✅ Polling loop works correctly
- ✅ `isPolling` state accurate
- ✅ `stopPolling()` works
- ✅ Cleanup on unmount (no memory leaks)
- ✅ All existing tests pass (74 passing, 1 skipped)
- ✅ 4 Step 4 tests added: multiple polls, isPolling state, stopPolling(), maxPollingDuration timeout

---

### Step 5: Add Completion/Error Condition Detection

**Goal**: Stop polling when conditions are met.

**Changes**:
- Add `completionCondition` property
- Add `errorCondition` property
- Evaluate expressions on each poll
- Stop polling when condition met
- Fire appropriate events

**Mock Backend**:
```typescript
const conditionTestMock: ApiInterceptorDefinition = {
  operations: {
    "start": {
      url: "/api/deploy",
      method: "post",
      handler: `
        globalThis.deployStatus = 'pending';
        return { deploymentId: "deploy-1" };
      `,
    },
    "status": {
      url: "/api/deploy/status/deploy-1",
      method: "get",
      handler: `
        if (!globalThis.statusChecks) globalThis.statusChecks = 0;
        globalThis.statusChecks++;
        
        // Transition through states
        if (globalThis.statusChecks === 1) {
          return { status: 'pending', phase: 'Initializing' };
        } else if (globalThis.statusChecks === 2) {
          return { status: 'in-progress', phase: 'Running' };
        } else {
          return { status: 'completed', phase: 'Succeeded' };
        }
      `,
    },
  },
};
```

**Testing**:
```typescript
test.describe("Deferred Mode - Step 5: Conditions", () => {
  test("stops polling when completionCondition is met", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/deploy" 
          method="post"
          deferredMode="true"
          statusUrl="/api/deploy/status/{$result.deploymentId}"
          pollingInterval="500"
          completionCondition="$statusData.status === 'completed'"
          onSuccess="result => testState = { initial: result }"
          onPollingComplete="status => testState = { final: status }"
        />
        <Button onClick="api.execute()" testId="exec" />
      </Fragment>
    `, {
      apiInterceptor: conditionTestMock,
    });
    
    const execButton = await createButtonDriver("exec");
    await execButton.click();
    
    // Wait for polling to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = await testStateDriver.testState();
    expect(result.final.status).toEqual('completed');
  });
  
  test("handles errorCondition correctly", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/deploy" 
          method="post"
          deferredMode="true"
          statusUrl="/api/deploy/status/{$result.deploymentId}"
          pollingInterval="500"
          errorCondition="$statusData.status === 'failed'"
          onError="error => testState = { error: error }"
        />
        <Button onClick="api.execute()" testId="exec" />
      </Fragment>
    `, {
      apiInterceptor: {
        operations: {
          "start": {
            url: "/api/deploy",
            method: "post",
            handler: `return { deploymentId: "deploy-1" };`,
          },
          "status": {
            url: "/api/deploy/status/deploy-1",
            method: "get",
            handler: `return { status: "failed", error: "Deployment failed" };`,
          },
        },
      },
    });
    
    const execButton = await createButtonDriver("exec");
    await execButton.click();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = await testStateDriver.testState();
    expect(result.error).toBeDefined();
  });
});
```

**Verification**:
- Completion condition stops polling
- Error condition triggers error handling
- Events fire correctly
- All existing tests pass

---

### Step 6: Add Progress Extraction & Context Variables

**Goal**: Extract progress and expose context variables.

**Changes**:
- Add `progressExtractor` property
- Evaluate expression on each poll
- Update `$progress` context variable
- Add `$statusData`, `$attempts`, `$elapsed` context variables
- Make available in event handlers

**Testing**:
```typescript
test.describe("Deferred Mode - Step 6: Progress & Context", () => {
  test("extracts progress from status data", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/process" 
          method="post"
          deferredMode="true"
          statusUrl="/api/process/status/{$result.jobId}"
          pollingInterval="500"
          completionCondition="$statusData.progress === 100"
          progressExtractor="$statusData.progress"
          onStatusUpdate="(statusData, progress) => testState = { progress }"
        />
        <Button onClick="api.execute()" testId="exec" />
      </Fragment>
    `, {
      apiInterceptor: {
        operations: {
          "start": {
            url: "/api/process",
            method: "post",
            handler: `
              globalThis.progressValue = 0;
              return { jobId: "job-1" };
            `,
          },
          "status": {
            url: "/api/process/status/job-1",
            method: "get",
            handler: `
              if (!globalThis.progressValue) globalThis.progressValue = 0;
              globalThis.progressValue += 33;
              if (globalThis.progressValue > 100) globalThis.progressValue = 100;
              return { progress: globalThis.progressValue };
            `,
          },
        },
      },
    });
    
    const execButton = await createButtonDriver("exec");
    await execButton.click();
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = await testStateDriver.testState();
    expect(result.progress).toBeGreaterThan(0);
  });
  
  test("context variables available in completedNotificationMessage", async ({ 
    initTestBed,
    createButtonDriver,
    page 
  }) => {
    await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/task" 
          method="post"
          deferredMode="true"
          statusUrl="/api/task/status"
          completionCondition="$statusData.done === true"
          completedNotificationMessage="Task completed after {$attempts} checks"
        />
        <Button onClick="api.execute()" testId="exec" />
      </Fragment>
    `, {
      apiInterceptor: {
        operations: {
          "start": {
            url: "/api/task",
            method: "post",
            handler: `return { taskId: "t1" };`,
          },
          "status": {
            url: "/api/task/status",
            method: "get",
            handler: `
              if (!globalThis.calls) globalThis.calls = 0;
              globalThis.calls++;
              if (globalThis.calls >= 2) {
                return { done: true };
              }
              return { done: false };
            `,
          },
        },
      },
    });
    
    const execButton = await createButtonDriver("exec");
    await execButton.click();
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Toast should show number of attempts
    await expect(page.getByText(/Task completed after \d+ checks/)).toBeVisible();
  });
});
```

**Verification**:
- Progress extracted correctly
- Context variables accessible
- All existing tests pass

---

### Step 7: Add Notification Updates

**Goal**: Implement auto-updating toast notifications.

**Changes**:
- Update toast on each poll with progress
- Show completion/error toast at end
- Reuse existing notification infrastructure

**Testing**:
```typescript
test.describe("Deferred Mode - Step 7: Notifications", () => {
  test("shows progress notification with updates", async ({ 
    initTestBed,
    createButtonDriver,
    page 
  }) => {
    await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/upload" 
          method="post"
          deferredMode="true"
          statusUrl="/api/upload/status"
          pollingInterval="500"
          completionCondition="$progress === 100"
          progressExtractor="$statusData.percent"
          inProgressNotificationMessage="Uploading: {$progress}% complete"
          completedNotificationMessage="Upload complete!"
        />
        <Button onClick="api.execute()" testId="exec" />
      </Fragment>
    `, {
      apiInterceptor: {
        operations: {
          "start": {
            url: "/api/upload",
            method: "post",
            handler: `
              globalThis.uploadPercent = 0;
              return { uploadId: "up-1" };
            `,
          },
          "status": {
            url: "/api/upload/status",
            method: "get",
            handler: `
              globalThis.uploadPercent += 50;
              if (globalThis.uploadPercent > 100) globalThis.uploadPercent = 100;
              return { percent: globalThis.uploadPercent };
            `,
          },
        },
      },
    });
    
    const execButton = await createButtonDriver("exec");
    await execButton.click();
    
    // Should see progress notification
    await expect(page.getByText(/Uploading: \d+% complete/)).toBeVisible();
    
    // Wait for completion
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Should see completion message
    await expect(page.getByText("Upload complete!")).toBeVisible();
  });
});
```

**Verification**:
- Notifications update during polling
- Completion notification shows
- Error notifications work
- All existing tests pass

---

### Step 8: Add Timeout Detection

**Goal**: Stop polling after `maxPollingDuration`.

**Changes**:
- Track elapsed time
- Compare against `maxPollingDuration`
- Fire `onTimeout` event
- Stop polling

**Testing**:
```typescript
test.describe("Deferred Mode - Step 8: Timeout", () => {
  test("stops polling after maxPollingDuration", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/longop" 
          method="post"
          deferredMode="true"
          statusUrl="/api/longop/status"
          pollingInterval="200"
          maxPollingDuration="800"
          completionCondition="$statusData.done === true"
          onTimeout="() => testState = 'timeout'"
        />
        <Button onClick="api.execute()" testId="exec" />
      </Fragment>
    `, {
      apiInterceptor: {
        operations: {
          "start": {
            url: "/api/longop",
            method: "post",
            handler: `return { id: "op-1" };`,
          },
          "status": {
            url: "/api/longop/status",
            method: "get",
            handler: `return { done: false };`, // Never completes
          },
        },
      },
    });
    
    const execButton = await createButtonDriver("exec");
    await execButton.click();
    
    // Wait for timeout (800ms + buffer)
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    await expect.poll(testStateDriver.testState).toEqual('timeout');
  });
});
```

**Verification**:
- Timeout detection works
- `onTimeout` event fires
- Polling stops
- All existing tests pass

---

### Step 9: Add Retry Logic for Status Checks

**Goal**: Implement polling interval backoff.

**Changes**:
- Add `pollingBackoff` property ("none", "linear", "exponential")
- Add `maxPollingInterval` property
- Calculate next interval based on strategy
- Update tests

**Testing**:
```typescript
test.describe("Deferred Mode - Step 9: Retry Logic", () => {
  test("retries status check on failure", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/task" 
          method="post"
          deferredMode="true"
          statusUrl="/api/task/status"
          pollingInterval="200"
          pollingBackoff="exponential"
          maxPollingInterval="1000"
          completionCondition="$statusData.done === true"
          onStatusUpdate="(statusData, progress) => testState = { attempts: $attempts }"
        />
        <Button onClick="api.execute()" testId="exec" />
      </Fragment>
    `, {
      apiInterceptor: {
        operations: {
          "start": {
            url: "/api/task",
            method: "post",
            handler: `
              globalThis.pollTimestamps = [];
              return { id: "t1" };
            `,
          },
          "status": {
            url: "/api/task/status",
            method: "get",
            handler: `
              if (!globalThis.pollTimestamps) globalThis.pollTimestamps = [];
              globalThis.pollTimestamps.push(Date.now());
              
              // Complete after 4 polls
              if (globalThis.pollTimestamps.length >= 4) {
                return { done: true, timestamps: globalThis.pollTimestamps };
              }
              
              return { done: false };
            `,
          },
        },
      },
    });
    
    const execButton = await createButtonDriver("exec");
    await execButton.click();
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const result = await testStateDriver.testState();
    // Should have made 4 attempts
    expect(result.attempts).toBeGreaterThanOrEqual(3);
  });
});
```

**Verification**:
- Retry logic works correctly
- Max retries respected
- Polling continues after successful retry
- All existing tests pass

---

### Step 10: Add Backoff Strategies

**Goal**: Implement polling interval backoff to reduce server load.

**Changes**:
- Add `pollingBackoff` property ("none", "linear", "exponential")
- Add `maxPollingInterval` property
- Calculate next interval based on strategy

**Testing**:
```typescript
test.describe("Deferred Mode - Step 10: Backoff", () => {
  test("exponential backoff increases interval", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/task" 
          method="post"
          deferredMode="true"
          statusUrl="/api/task/status"
          pollingInterval="100"
          pollingBackoff="exponential"
          maxPollingInterval="1000"
          completionCondition="$statusData.done === true"
        />
        <Button onClick="api.execute()" testId="exec" />
      </Fragment>
    `, {
      apiInterceptor: {
        operations: {
          "start": {
            url: "/api/task",
            method: "post",
            handler: `
              globalThis.pollIntervals = [];
              globalThis.lastPollTime = Date.now();
              return { id: "t1" };
            `,
          },
          "status": {
            url: "/api/task/status",
            method: "get",
            handler: `
              const now = Date.now();
              if (globalThis.lastPollTime) {
                const interval = now - globalThis.lastPollTime;
                globalThis.pollIntervals.push(interval);
              }
              globalThis.lastPollTime = now;
              
              // Complete after 5 polls
              if (globalThis.pollIntervals.length >= 4) {
                return { done: true, intervals: globalThis.pollIntervals };
              }
              
              return { done: false };
            `,
          },
        },
      },
    });
    
    const execButton = await createButtonDriver("exec");
    await execButton.click();
    
    await new Promise(resolve => setTimeout(resolve, 3000));
  });
});
```

**Verification**:
- Backoff strategies work
- Intervals increase correctly
- MaxInterval respected
- All existing tests pass

---

### Step 11: Add Server-Side Cancellation Support

**Goal**: Allow cancelling long-running operations on the server.

**Changes**:
- Add `cancelUrl` property
- Add `cancelMethod` property (default: "post")
- Add `cancelBody` property
- Implement `cancel()` API method
- Call cancel endpoint when `cancel()` invoked
- Stop polling after cancellation

**Testing**:
```typescript
test.describe("Deferred Mode - Step 11: Cancellation", () => {
  test("cancels operation on server", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/operation" 
          method="post"
          deferredMode="true"
          statusUrl="/api/operation/status/{$result.operationId}"
          cancelUrl="/api/operation/cancel/{$result.operationId}"
          cancelMethod="post"
          pollingInterval="500"
          completionCondition="$statusData.status === 'completed'"
          onPollingComplete="status => testState = { status: status.status }"
        />
        <Button onClick="api.execute()" testId="exec" />
        <Button onClick="api.cancel()" testId="cancel" />
      </Fragment>
    `, {
      apiInterceptor: {
        operations: {
          "start": {
            url: "/api/operation",
            method: "post",
            handler: `return { operationId: "op-1" };`,
          },
          "status": {
            url: "/api/operation/status/op-1",
            method: "get",
            handler: `
              if (globalThis.operationCancelled) {
                return { status: "cancelled" };
              }
              return { status: "in-progress" };
            `,
          },
          "cancel": {
            url: "/api/operation/cancel/op-1",
            method: "post",
            handler: `
              globalThis.operationCancelled = true;
              return { status: "cancelled" };
            `,
          },
        },
      },
    });
    
    const execButton = await createButtonDriver("exec");
    const cancelButton = await createButtonDriver("cancel");
    
    await execButton.click();
    
    // Wait a bit then cancel
    await new Promise(resolve => setTimeout(resolve, 800));
    await cancelButton.click();
    
    // Wait for cancellation to propagate
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = await testStateDriver.testState();
    expect(result.status).toEqual("cancelled");
  });
  
  test("cancel() stops polling immediately", async ({ 
    initTestBed, 
    createButtonDriver 
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APICall 
          id="api" 
          url="/api/operation" 
          method="post"
          deferredMode="true"
          statusUrl="/api/operation/status/{$result.operationId}"
          cancelUrl="/api/operation/cancel/{$result.operationId}"
          pollingInterval="500"
          completionCondition="$statusData.status === 'completed'"
        />
        <Button onClick="api.execute()" testId="exec" />
        <Button onClick="api.cancel()" testId="cancel" />
        <Button onClick="testState = api.isPolling()" testId="check" />
      </Fragment>
    `, {
      apiInterceptor: {
        operations: {
          "start": {
            url: "/api/operation",
            method: "post",
            handler: `return { operationId: "op-1" };`,
          },
          "status": {
            url: "/api/operation/status/op-1",
            method: "get",
            handler: `return { status: "in-progress" };`,
          },
          "cancel": {
            url: "/api/operation/cancel/op-1",
            method: "post",
            handler: `return { status: "cancelled" };`,
          },
        },
      },
    });
    
    const execButton = await createButtonDriver("exec");
    const cancelButton = await createButtonDriver("cancel");
    const checkButton = await createButtonDriver("check");
    
    await execButton.click();
    await cancelButton.click();
    
    // Check immediately after cancel
    await checkButton.click();
    await expect.poll(testStateDriver.testState).toEqual(false);
  });
});
```

**Verification**:
- Cancel endpoint called
- Polling stops immediately
- `cancel()` API works
- All existing tests pass

---

### Step 12: Integration Testing & Polish

**Goal**: Test complete scenarios and edge cases.

**Testing Scenarios**:

1. **Complete Reese's Encryption Scenario**:
```typescript
test("encryption at rest scenario", async ({ initTestBed, createButtonDriver, page }) => {
  await initTestBed(`
    <Fragment>
      <APICall 
        id="enableEncryption"
        url="/api/encryption/enable"
        method="post"
        body="{{ datasetId: 'ds-123' }}"
        deferredMode="true"
        statusUrl="/api/encryption/status/{$result.operationId}"
        pollingInterval="1000"
        completionCondition="$statusData.status === 'completed'"
        errorCondition="$statusData.status === 'failed'"
        inProgressNotificationMessage="Enabling encryption..."
        completedNotificationMessage="Encryption enabled successfully!"
        errorNotificationMessage="Failed to enable encryption: {$statusData.error}"
        onSuccess="result => testState = { started: true, id: result.operationId }"
        onPollingComplete="status => testState = { ...testState, finished: true, finalStatus: status }"
      />
      <Button onClick="enableEncryption.execute()" testId="enable" label="Enable Encryption" />
    </Fragment>
  `, {
    apiInterceptor: {
      operations: {
        "enable": {
          url: "/api/encryption/enable",
          method: "post",
          handler: `return { operationId: "enc-op-1", status: "accepted" };`,
        },
        "status": {
          url: "/api/encryption/status/enc-op-1",
          method: "get",
          handler: `
            if (!globalThis.encryptionProgress) globalThis.encryptionProgress = 0;
            globalThis.encryptionProgress += 50;
            
            if (globalThis.encryptionProgress >= 100) {
              return { status: "completed", progress: 100 };
            }
            
            return { status: "in-progress", progress: globalThis.encryptionProgress };
          `,
        },
      },
    },
  });
  
  const button = await createButtonDriver("enable");
  await button.click();
  
  // Should see initial success
  await new Promise(resolve => setTimeout(resolve, 500));
  let state = await testStateDriver.testState();
  expect(state.started).toEqual(true);
  
  // Should see progress message
  await expect(page.getByText("Enabling encryption...")).toBeVisible();
  
  // Wait for completion
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  // Should see completion message
  await expect(page.getByText("Encryption enabled successfully!")).toBeVisible();
  
  // Should have final status
  state = await testStateDriver.testState();
  expect(state.finished).toEqual(true);
  expect(state.finalStatus.status).toEqual("completed");
});
```

2. **Multiple Concurrent Operations**:
```typescript
test("handles multiple concurrent deferred operations", async ({ 
  initTestBed, 
  createButtonDriver 
}) => {
  // Test that two deferred operations don't interfere
});
```

3. **Component Unmount During Polling**:
```typescript
test("cleans up polling when component unmounts", async ({ 
  initTestBed, 
  page 
}) => {
  // Test memory cleanup
});
```

4. **Resume After Stop**:
```typescript
test("can resume polling after stopPolling()", async ({ 
  initTestBed, 
  createButtonDriver 
}) => {
  // Test resume functionality
});
```

**Verification**:
- Real-world scenarios work
- No memory leaks
- All existing tests pass
- Performance acceptable

---

### Step 13: Documentation & Examples

**Goal**: Complete documentation and example code.

**Tasks**:
- Update APICall.md with deferred section
- Add usage examples
- Document all new properties/events/APIs
- Create migration guide
- Add troubleshooting section

---

## Testing Best Practices

### Efficient Test Execution Strategy

When tests fail during development, run only the failing tests first using `--grep`, then run the full suite:

```bash
# Run only failing tests first for fast feedback
npx playwright test --grep "specific failing test name" --reporter=line

# Once passing, run full suite to ensure no regressions
npx playwright test src/components/APICall/APICall.spec.ts --reporter=line
```

This approach:
- Provides immediate feedback on the specific issue
- Avoids waiting for unrelated tests to complete
- Ensures full test coverage before marking work complete

### APIInterceptor State Management with $state

**CRITICAL**: In APIInterceptor handlers, use `$state` to maintain state across API calls, NOT `globalThis`:

```typescript
// ✅ CORRECT - Use $state context variable
const mockBackend: ApiInterceptorDefinition = {
  "initialize": "$state.pollCount = 0; $state.taskId = null;",
  "operations": {
    "start": {
      "url": "/api/task",
      "method": "post",
      "handler": `
        $state.pollCount = 0;
        $state.taskId = 'task-1';
        return { taskId: $state.taskId };
      `
    },
    "status": {
      "url": "/api/task/status/task-1",
      "method": "get",
      "handler": `
        $state.pollCount++;
        if ($state.pollCount >= 3) {
          return { status: 'completed', pollCount: $state.pollCount };
        }
        return { status: 'pending', pollCount: $state.pollCount };
      `
    }
  }
};

// ❌ INCORRECT - globalThis is not available in APIInterceptor handlers
const mockBackend: ApiInterceptorDefinition = {
  "operations": {
    "start": {
      "handler": `
        globalThis.pollCount = 0;  // Will not work!
        return { taskId: 'task-1' };
      `
    }
  }
};
```

**Key Points:**
- `$state` is a singleton state object accessible across all API operations
- Use `initialize` property to set initial state values
- Properties can be read and modified: `$state.count++`, `$state.items.push(item)`
- State persists across multiple API calls in the same test
- Each test gets a fresh `$state` instance

### XMLUI Script Patterns

**No async/await keywords:**

XMLUI automatically handles asynchronous operations without explicit `async`/`await` syntax:

```typescript
// ✅ CORRECT - XMLUI handles async automatically
<Button onClick="api.execute(); delay(100); testState = api.getStatus();" />

// ❌ INCORRECT - No await keyword
<Button onClick="await api.execute(); await delay(100); testState = api.getStatus();" />
```

**Use delay() instead of setTimeout():**

```typescript
// ✅ CORRECT - Use delay() function
<Button onClick="api.execute(); delay(100); testState = api.getStatus();" />

// ❌ INCORRECT - setTimeout not available
<Button onClick="api.execute().then(() => { setTimeout(() => { testState = api.getStatus(); }, 100); })" />
```

**Sequential async operations:**

Write async operations in sequence - XMLUI executes them sequentially:

```typescript
// ✅ CORRECT - XMLUI awaits each operation automatically
<Button onClick="
  let result = api.execute();
  delay(100);
  let status = api.getStatus();
  testState = { result, status };
" />

// ❌ INCORRECT - Promise chains not needed
<Button onClick="
  api.execute().then(result => {
    return delay(100).then(() => {
      testState = { result, status: api.getStatus() };
    });
  });
" />
```

## Testing Commands

Run tests during development:

```bash
# From workspace root - all tests
npx playwright test APICall.spec.ts --reporter=line

# Single worker for debugging
npx playwright test APICall.spec.ts --workers=1 --reporter=line

# Specific test suite
npx playwright test APICall.spec.ts --grep "Deferred Mode - Step 4" --reporter=line

# Watch mode during active development
npx playwright test APICall.spec.ts --workers=1 --reporter=line --repeat-each=1
```

## Implementation Decisions

1. **Polling Persistence**: Stop on unmount (cleanup on component unmount)
2. **Status Endpoint Format**: Fully customizable via expressions, with sensible defaults for common patterns
3. **Cancellation Support**: Full server-side cancellation support via `cancelUrl`
4. **Default Values**:
   - `pollingInterval`: 2000ms (customizable)
   - `maxPollingDuration`: 300000ms / 5 minutes (customizable)
   - `maxStatusRetries`: 3 (customizable)
   - `statusRetryDelay`: 1000ms (customizable)
5. **Retry Logic**: Retry status checks on failure, configurable retry count

## Next Steps

1. ✅ Review this updated plan
2. Answer the questions above
3. Begin implementation with Step 1
4. Create test file with Step 1 tests
5. Proceed incrementally through steps
6. Verify all existing tests pass after each step

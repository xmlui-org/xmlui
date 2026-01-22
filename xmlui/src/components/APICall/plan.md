# APICallNative.tsx Refactoring Plan

## Problems Identified

1. **Linting Issues**: Type errors with method parameters (statusMethod, cancelMethod) - strings not assignable to strict HTTP method types
2. **Code Organization**: Normal and deferred execution logic intermingled in a 250+ line `execute` function
3. **Redundancy**: Repeated state update patterns, URL interpolation logic appears multiple times
4. **Readability**: Deep nesting, unclear separation between polling modes

## Refactoring Strategy

### 1. Fix Linting Issues (Quick Win)
- Cast `statusMethod` and `cancelMethod` to proper HTTP method type
- Use type assertion: `as "get" | "post" | ...` or cast at point of use

### 2. Extract Helper Functions
**Create these new internal functions:**

- `updateDeferredState(state, updateState?)` - Centralize state updates with context variables
- `interpolateUrl(template, result)` - DRY up URL interpolation (used 3 times)
- `extractProgress(statusData, progressExtractor, executionContext, result)` - Separate progress extraction logic
- `handlePollingTimeout(...)` - Extract timeout handling
- `handlePollingCompletion(...)` - Extract completion handling

### 3. Separate Deferred Logic into Dedicated Functions

**Main extraction:**
- `executeDeferredOperation(executionContext, result, node, ...)` - Handle all deferred logic
  - Returns early if not deferred mode
  - Decides between single poll vs polling loop
  - Calls sub-functions for clarity

**Polling sub-functions:**
- `executeSinglePoll(...)` - Handle one-time status check
- `executePollingLoop(...)` - Handle continuous polling with backoff

### 4. Restructure `execute` Function

```typescript
execute() {
  // 1. Preparation (store context, set inProgress)
  // 2. Make initial API call
  // 3. Update state on success
  // 4. Handle deferred operations (if enabled) ← extracted function
  // 5. Return result / handle errors
}
```

### 5. Group Related Code

**Organize file structure:**
```
1. Imports
2. Types/Interfaces
3. Helper Functions (pure)
   - interpolateNotificationMessage
   - calculateNextInterval
   - interpolateUrl (new)
   - extractProgress (new)
4. Deferred State Helpers
   - updateDeferredState (new)
5. Main Component
   - State/Refs
   - Initialization
   - execute (simplified)
   - Deferred operations (extracted)
   - API methods (stop, resume, etc.)
   - Registration
```

### 6. Add Clear Section Comments

Use banner comments to mark sections:
```typescript
// =============================================================================
// NORMAL API EXECUTION
// =============================================================================

// =============================================================================
// DEFERRED OPERATIONS - SINGLE POLL
// =============================================================================

// =============================================================================
// DEFERRED OPERATIONS - POLLING LOOP
// =============================================================================
```

### 7. Remove Redundancies

- **State update pattern**: Used 6+ times with same structure → `updateDeferredState` helper
- **URL interpolation**: Used 3 times → `interpolateUrl` helper
- **Progress extraction**: Complex block → separate function

## Execution Order

1. ⬜ **Fix linting** (3 type casts) - 2 min
2. ⬜ **Create helper functions** (interpolateUrl, updateDeferredState, extractProgress) - 10 min
3. ⬜ **Extract polling timeout handler** - 5 min
4. ⬜ **Extract polling completion handler** - 5 min
5. ⬜ **Extract single poll logic** - 8 min
6. ⬜ **Extract polling loop logic** - 10 min
7. ⬜ **Refactor execute function** to use extracted functions - 5 min
8. ⬜ **Add section comments** throughout - 5 min
9. ⬜ **Final cleanup** - remove old comments, ensure consistency - 5 min

**Total Time: ~55 minutes**

**Status: Reverted - Starting fresh with incremental steps**

## Expected Outcome

- **execute function**: ~60 lines (down from ~250)
- **Clear separation**: Normal vs deferred paths obvious at a glance
- **No redundancy**: DRY principle applied
- **Better testability**: Individual functions can be unit tested
- **Maintainability**: Future changes isolated to specific functions
- **Type safety**: All linting errors resolved

## Files Changed

- `APICallNative.tsx` - Complete refactor
- No test changes needed (behavior unchanged)

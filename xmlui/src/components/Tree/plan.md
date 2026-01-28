# Tree Component Async Loading

The current Tree component's async (lazy) loading mechanism is creepy and needs to be updated.

## Workflow Rules

**Before each step:**
1. Run all Tree e2e tests to ensure baseline is stable
2. Implement the feature
3. Create e2e tests for the new feature
4. Run the new tests separately first
5. If new tests pass, run all Tree tests together
6. If new tests fail, run them separately while stabilizing (do not run all tests)
7. Only proceed to next step when all tests pass

**Test command:** `cd /Users/dotneteer/source/xmlui && npx playwright test xmlui/src/components/Tree/`

## Step 1: NOT DONE - Baseline Analysis & Plan Refinement

**Status:** NOT STARTED

**Tasks:**
- Run all existing Tree e2e tests to establish baseline
- Analyze Tree component implementation
- Identify existing vs missing features
- Document baseline test results

## Idea

Let's extend the state of tree nodes with these properties:

- `dynamic`: Boolean property. If true, the node's children should be dynamically loaded. If the data contains children, those should be reloaded the next time the node is expanded. If false, the node is static, use the children in the data provided. If this property is not defined in the data, use the component's value for `dynamic`.
- `loaded`: Boolean property. Ignored if the node is not dynamic. If true, the node's children are considered loaded. If false, children are loaded the next time the node is expanded.
- `expanded`: timestamp value (Date().now). Represent the last time the node was expanded. This property it not read from the data.
- `autoLoadAfter`: numeric property given in milliseconds (negative values are considererd zero). Ignored if the node is not dynamic. The next time the node is expanded, if the time span between the current time and the `expanded` timestamp is greater than `autoLoadAfter`, the node is marked as unloaded and the node's children are loaded again. If this property is not defined in the data, use the component's value for `autoLoadAfter`.

Let's have these properties to name the data field for a particular property:
- `dynamicField`: property representing `dynamic`.
- `loadedField`: property representing `loaded`.
- `autoLoadAfterField`: representing `autoLoadAfter`.

Let's extend the component with these properties:
- `dynamic`: the default value for the tree nodes' `dynamic` field if the data does not specify them. This property is false, by default.
- `autoLoadAfter`: the default value for the tree nodes' `autoLoadAfter` field if the data does not specify them. This property is 3000 milliseconds, by default.

Extend the existing API with these functions:
- `getDynamic(nodeId: any): boolean`
- `setDynamic(nodeId: any, value: boolean)`
- `getLoaded(nodeId: any): boolean`
- `setLoaded(nodeId: any, value: boolean)`
- `getAutoLoadAfter(nodeId: any): number`
- `setAutoLoadAfter(nodeId: any, value: number)`

## Resources

- xmlui/dev-docs/conv-e2e-testing.md
- xmlui/dev-docs/conv-create-components.md
- e2e tests for the APICall components (using mock API interceptor)
- e2e tests for the Tree component

## Implementation Plan

### Step 1: ✅ DONE - Baseline Analysis

**Status:** COMPLETED

**Baseline Test Results:** 197/202 passing, 5 skipped (58.5s)

**Existing Infrastructure Found:**
- Props: `loadedField` (default: "loaded"), `autoLoadAfter` (default: undefined)
- State: `expandedTimestamps`, `collapsedTimestamps`, `autoLoadAfterMap`
- API Methods: `getExpandedTimestamp`, `setAutoLoadAfter`, `getNodeAutoLoadAfter`, `markNodeLoaded`, `markNodeUnloaded`, `getNodeLoadingState`

**Missing Features (to implement):**
- `dynamicField` property and `dynamic` component-level default
- `getDynamic(nodeId)` and `setDynamic(nodeId, value)` API methods
- `autoLoadAfterField` property for reading per-node autoLoadAfter from data
- `getLoaded(nodeId)` and `setLoaded(nodeId, value)` API aliases

**Next Step:** Implement `dynamic` field support

### Step 2: ✅ DONE - Add `dynamic` Field Support

**Status:** COMPLETED

**Completed:**
1. ✅ Baseline check - all Tree tests passing (197/202)
2. ✅ Added `dynamicField` and `dynamic` properties to Tree component
3. ✅ Added `dynamicStateMap` state management for per-node overrides
4. ✅ Implemented `getDynamic(nodeId)` API method
5. ✅ Implemented `setDynamic(nodeId, value)` API method
6. ✅ Added `dynamicField` to TreeFieldConfig interface
7. ✅ Connected properties from Tree.tsx to TreeNative.tsx using extractValue.asOptionalBoolean
8. ✅ Created 12 e2e tests for dynamic field functionality
9. ✅ All 12 new tests passing
10. ✅ All 214 Tree tests passing (209 passed, 5 skipped)

**Implementation Details:**
- `dynamicField` prop (default: "dynamic") - configurable field name in source data
- `dynamic` prop (default: false) - component-level default for nodes
- `getDynamic(nodeId)` - reads from: setDynamic override > data field > component default
- `setDynamic(nodeId, value)` - sets per-node override (undefined to clear)
- Value priority: explicit setDynamic > node data field > component-level default

**Next Step:** Step 3 - Integrate `dynamic` with existing async loading logic

### Step 3: NOT DONE - Integrate `dynamic` with Async Loading

**Status:** NOT STARTED

**Tasks:**
1. Run all Tree e2e tests (baseline check)
2. Update expansion logic to check `dynamic` field before triggering `loadChildren`
3. Only apply `autoLoadAfter` threshold to dynamic nodes
4. Create e2e tests for dynamic/static node behavior
5. Run new tests separately first
6. Run all Tree tests together if new tests pass

### Step 4: NOT DONE - Add `autoLoadAfterField`

**Status:** NOT STARTED

**Tasks:**
1. Run all Tree e2e tests (baseline check)
2. Add `autoLoadAfterField` property (default: "autoLoadAfter")
3. Update data parsing to read per-node `autoLoadAfter` values
4. Create e2e tests for per-node autoLoadAfter configuration
5. Run new tests separately first
6. Run all Tree tests together if new tests pass

### Step 5: NOT DONE - API Method Aliases

**Status:** NOT STARTED

**Tasks:**
1. Run all Tree e2e tests (baseline check)
2. Add `getLoaded(nodeId)` as alias for `getNodeLoadingState`
3. Add `setLoaded(nodeId, value)` as wrapper for `markNodeLoaded/Unloaded`
4. Create e2e tests for new API aliases
5. Run new tests separately first
6. Run all Tree tests together if new tests pass

### Step 6: NOT DONE - Documentation

**Status:** NOT STARTED

**Tasks:**
- Update component documentation with static vs dynamic nodes
- Document all new API methods
- Ensure test coverage is comprehensive

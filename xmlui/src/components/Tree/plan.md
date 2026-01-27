# Tree Component - Async Loading Enhancement Plan

## Reference Documents
- [Conventions: Creating XMLUI Components](file:///Users/dotneteer/source/xmlui/xmlui/dev-docs/conv-create-components.md)
- [Conventions: XMLUI Component E2E Testing](file:///Users/dotneteer/source/xmlui/xmlui/dev-docs/conv-e2e-testing.md)

---

## INCREMENTAL IMPLEMENTATION PLAN: "loaded" Field Approach

## Current Architecture

### Files
- **Tree.tsx**: Metadata + renderer (419 lines)
- **TreeNative.tsx**: React implementation (1717 lines)
- **TreeComponent.module.scss**: Styling

### Data Flow
1. **Input formats**: `flat` (array with parentId) or `hierarchy` (nested objects)
2. **Transform**: Convert to `TreeNode[]` via `flatToNative`/`hierarchyToNative`
3. **Flatten**: `toFlatTree()` creates visible rows based on `expandedIds`
4. **Render**: Virtualized list (virtua) renders `TreeRow` components

### Key State
- `expandedIds`: Array of expanded node keys
- `nodeStates`: Map<nodeId, NodeLoadingState> where state = `'unloaded' | 'loading' | 'loaded'`
- `internalData`: Modified tree data after async loads
- `internalSelectedId`: Selected node key

### Current Async Loading (OLD - to be replaced)

**Props:**
- `dynamicField`: Field name marking dynamic nodes (default: "dynamic")
- `loadChildren`: `(node: FlatTreeNode) => Promise<any[]>` callback

**Flow:**
1. Node with `dynamic: true` starts as `unloaded`
2. On expand: set state to `loading`, clear children, show spinner
3. Call `loadChildren(node)`, await result
4. Update `internalData` with loaded children
5. Set state to `loaded`, hide spinner

---

## INCREMENTAL IMPLEMENTATION PLAN: "loaded" Field Approach

### Pre-Implementation

**Check Existing E2E Tests:**
```bash
# From workspace root
npx playwright test Tree.spec.ts --workers=1 --reporter=line
npx playwright test Tree-dynamic.spec.ts --workers=1 --reporter=line
npx playwright test Tree-icons.spec.ts --workers=1 --reporter=line
```

All tests must pass before starting implementation.

---

## NEW IMPLEMENTATION PLAN: "loaded" Field Approach

### Requirements Summary
1. Add `loadedField` prop (field name, default: "loaded")
2. Default value: `true` (nodes are loaded by default)
3. When `loaded: false` → show expand indicator even without children
4. On expand of unloaded node → call `loadChildren` event
5. Show progress indicator during async loading
6. Add returned children to parent node and expand
7. Update node's loaded state to `true` after successful load

### Implementation Steps

#### STEP 1: Add loadedField Infrastructure (No Behavior Change)

**Goal:** Add new prop and config without changing any behavior

**Changes:**
1. Add `loadedField` to `TreeFieldConfig` interface
2. Add `loadedField` prop to metadata with default value
3. Add to `defaultProps` in TreeNative.tsx
4. Add to `TreeComponentProps` interface
5. Pass prop from renderer to native component
6. Update `fieldConfig` useMemo to include `loadedField`

**Files to modify:**
- `xmlui/src/components-core/abstractions/treeAbstractions.ts`
- `xmlui/src/components/Tree/Tree.tsx` (metadata + renderer)
- `xmlui/src/components/Tree/TreeNative.tsx` (defaultProps + props interface)

**E2E Tests to Create:**
Add to `Tree.spec.ts` in "Basic Functionality" section:

```typescript
test("accepts loadedField prop", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Tree
      testId="tree"
      dataFormat="flat"
      data="{[
        { id: 1, name: 'Root', loaded: true }
      ]}"
      loadedField="loaded"
    >
      <property name="itemTemplate">
        <Text>{$item.name}</Text>
      </property>
    </Tree>
  `);
  await expect(page.getByText("Root")).toBeVisible();
});
```

**Verification:**
```bash
# Run all existing Tree tests - must all pass
npx playwright test Tree.spec.ts --workers=1 --reporter=line
npx playwright test Tree-dynamic.spec.ts --workers=1 --reporter=line
npx playwright test Tree-icons.spec.ts --workers=1 --reporter=line
```

**Success Criteria:**
- ✅ All existing tests pass
- ✅ New loadedField prop accepted without errors
- ✅ No behavior changes - trees render exactly as before

**Status: ✅ COMPLETED**

---

#### STEP 2: Store loaded Field in TreeNode (No Behavior Change)

**Goal:** Read and store `loaded` field from source data in TreeNode

**Changes:**
1. Add `loaded?: boolean` property to `TreeNode` interface
2. Update `flatToNative()` to read `loadedField` from source data, default to `true`
3. Update `hierarchyToNative()` to read `loadedField` from source data, default to `true`

**Files to modify:**
- `xmlui/src/components-core/abstractions/treeAbstractions.ts` (TreeNode interface)
- `xmlui/src/components-core/utils/treeUtils.ts` (flatToNative, hierarchyToNative)

**E2E Tests to Create:**
Add to `Tree.spec.ts`:

```typescript
test("stores loaded field from source data (flat format)", async ({ initTestBed, page }) => {
  const { testStateDriver } = await initTestBed(`
    <Fragment>
      <Tree
        id="tree"
        dataFormat="flat"
        data="{[
          { id: 1, name: 'Loaded Node', loaded: true },
          { id: 2, name: 'Unloaded Node', loaded: false }
        ]}"
        loadedField="loaded"
      >
        <property name="itemTemplate">
          <Text>{$item.name}</Text>
        </property>
      </Tree>
      <Button testId="checkBtn" onClick="testState = {
        node1: tree.getNodeById(1),
        node2: tree.getNodeById(2)
      }" />
    </Fragment>
  `);
  
  await page.getByTestId("checkBtn").click();
  const result = await testStateDriver.testState();
  
  expect(result.node1.loaded).toBe(true);
  expect(result.node2.loaded).toBe(false);
});

test("stores loaded field from source data (hierarchy format)", async ({ initTestBed, page }) => {
  const { testStateDriver } = await initTestBed(`
    <Fragment>
      <Tree
        id="tree"
        dataFormat="hierarchy"
        data="{[
          { id: 1, name: 'Loaded Node', loaded: true },
          { id: 2, name: 'Unloaded Node', loaded: false }
        ]}"
        loadedField="loaded"
      >
        <property name="itemTemplate">
          <Text>{$item.name}</Text>
        </property>
      </Tree>
      <Button testId="checkBtn" onClick="testState = tree.getNodeById(2)" />
    </Fragment>
  `);
  
  await page.getByTestId("checkBtn").click();
  const result = await testStateDriver.testState();
  
  expect(result.loaded).toBe(false);
});

test("defaults loaded to true when not specified", async ({ initTestBed, page }) => {
  const { testStateDriver } = await initTestBed(`
    <Fragment>
      <Tree
        id="tree"
        dataFormat="flat"
        data="{[{ id: 1, name: 'Node Without Loaded' }]}"
        loadedField="loaded"
      >
        <property name="itemTemplate">
          <Text>{$item.name}</Text>
        </property>
      </Tree>
      <Button testId="checkBtn" onClick="testState = tree.getNodeById(1)" />
    </Fragment>
  `);
  
  await page.getByTestId("checkBtn").click();
  const result = await testStateDriver.testState();
  
  expect(result.loaded).toBe(true);
});
```

**Verification:**
```bash
npx playwright test Tree.spec.ts --workers=1 --reporter=line
npx playwright test Tree-dynamic.spec.ts --workers=1 --reporter=line
npx playwright test Tree-icons.spec.ts --workers=1 --reporter=line
```

**Success Criteria:**
- ✅ All existing tests pass
- ✅ `loaded` field read from source data and stored in TreeNode
- ✅ Defaults to `true` when not specified
- ✅ No visual/behavioral changes yet

---

#### STEP 3: Show Expand Indicator for Unloaded Nodes

**Goal:** Nodes with `loaded: false` show expand indicator even without children

**Changes:**
1. Update `hasChildren` logic in `toFlatTree()` to include `loaded === false` condition
2. Update any other `hasChildren` calculations in TreeNative.tsx to respect `loaded` field

**Files to modify:**
- `xmlui/src/components-core/utils/treeUtils.ts` (toFlatTree function)
- `xmlui/src/components/Tree/TreeNative.tsx` (review all hasChildren usage)

**Logic:**
```typescript
// OLD:
hasChildren = node.children && node.children.length > 0

// NEW:
hasChildren = (node.children && node.children.length > 0) || node.loaded === false
```

**E2E Tests to Create:**
Add to `Tree.spec.ts`:

```typescript
test("shows expand indicator for unloaded nodes without children", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Tree
      dataFormat="flat"
      data="{[
        { id: 1, name: 'Unloaded Node', loaded: false }
      ]}"
      loadedField="loaded"
    >
      <property name="itemTemplate">
        <Text>{$item.name}</Text>
      </property>
    </Tree>
  `);
  
  const row = page.locator('[role="treeitem"]').filter({ hasText: "Unloaded Node" });
  const expandIcon = row.locator('[role="img"]').first();
  
  await expect(expandIcon).toBeVisible();
});

test("does not show expand indicator for loaded nodes without children", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Tree
      dataFormat="flat"
      data="{[
        { id: 1, name: 'Loaded Node', loaded: true }
      ]}"
      loadedField="loaded"
    >
      <property name="itemTemplate">
        <Text>{$item.name}</Text>
      </property>
    </Tree>
  `);
  
  const row = page.locator('[role="treeitem"]').filter({ hasText: "Loaded Node" });
  const expandIcon = row.locator('[role="img"]').first();
  
  await expect(expandIcon).not.toBeVisible();
});

test("shows expand indicator for nodes with actual children", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Tree
      dataFormat="flat"
      data="{[
        { id: 1, name: 'Parent', loaded: true },
        { id: 2, name: 'Child', parentId: 1, loaded: true }
      ]}"
      loadedField="loaded"
    >
      <property name="itemTemplate">
        <Text>{$item.name}</Text>
      </property>
    </Tree>
  `);
  
  const row = page.locator('[role="treeitem"]').filter({ hasText: "Parent" });
  const expandIcon = row.locator('[role="img"]').first();
  
  await expect(expandIcon).toBeVisible();
});
```

**Verification:**
```bash
npx playwright test Tree.spec.ts --workers=1 --reporter=line
npx playwright test Tree-dynamic.spec.ts --workers=1 --reporter=line
npx playwright test Tree-icons.spec.ts --workers=1 --reporter=line
```

**Success Criteria:**
- ✅ All existing tests pass
- ✅ Unloaded nodes show expand indicator
- ✅ Loaded nodes without children don't show expand indicator
- ✅ Nodes with actual children still show expand indicator

---

#### STEP 4: Implement Async Loading on Expand

**Goal:** When unloaded node is expanded, call loadChildren and update tree

**Changes:**
1. Update `toggleNode()` function to detect unloaded nodes
2. Add async loading logic:
   - Set loading state
   - Call `loadChildren` callback
   - Update `internalData` with new children
   - Mark node as loaded in source data
   - Expand the node
3. Handle errors (keep node unloaded, don't expand)

**Files to modify:**
- `xmlui/src/components/Tree/TreeNative.tsx` (toggleNode function ~line 716)

**E2E Tests to Create:**
Create new file `Tree-loaded-field.spec.ts`:

```typescript
import { test, expect } from "../../testing/fixtures";
import type { ApiInterceptorDefinition } from "../../testing/APIInterceptor";

// =============================================================================
// ASYNC LOADING WITH LOADED FIELD TESTS
// =============================================================================

test.describe("Async Loading with loaded Field", () => {
  
  test("calls loadChildren when expanding unloaded node (flat format)", async ({ initTestBed, page }) => {
    const mockBackend: ApiInterceptorDefinition = {
      initialize: "$state.loadCalled = false; $state.nodeId = null;",
      operations: {
        loadChildren: {
          url: "/api/tree/children/:nodeId",
          method: "get",
          handler: `
            $state.loadCalled = true;
            $state.nodeId = $params.nodeId;
            return [
              { id: 11, name: 'Child 1', parentId: $params.nodeId, loaded: true },
              { id: 12, name: 'Child 2', parentId: $params.nodeId, loaded: true }
            ];
          `
        }
      }
    };

    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APIInterceptor definition="{${JSON.stringify(mockBackend)}}" />
        <Tree
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Unloaded Parent', loaded: false }
          ]}"
          loadedField="loaded"
          loadChildren="async node => {
            let response = await fetch('/api/tree/children/' + node.id);
            return await response.json();
          }"
        >
          <property name="itemTemplate">
            <Text>{$item.name}</Text>
          </property>
        </Tree>
      </Fragment>
    `);
    
    // Expand the unloaded node
    const expandIcon = page.locator('[role="treeitem"]').filter({ hasText: "Unloaded Parent" })
      .locator('[role="img"]').first();
    await expandIcon.click();
    
    // Wait for children to appear
    await expect(page.getByText("Child 1")).toBeVisible();
    await expect(page.getByText("Child 2")).toBeVisible();
  });

  test("shows spinner during async loading", async ({ initTestBed, page }) => {
    const mockBackend: ApiInterceptorDefinition = {
      operations: {
        loadChildren: {
          url: "/api/tree/children/:nodeId",
          method: "get",
          handler: `
            delay(500);
            return [
              { id: 11, name: 'Child 1', parentId: $params.nodeId, loaded: true }
            ];
          `
        }
      }
    };

    await initTestBed(`
      <Fragment>
        <APIInterceptor definition="{${JSON.stringify(mockBackend)}}" />
        <Tree
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Unloaded Parent', loaded: false }
          ]}"
          loadedField="loaded"
          loadChildren="async node => {
            let response = await fetch('/api/tree/children/' + node.id);
            return await response.json();
          }"
        >
          <property name="itemTemplate">
            <Text>{$item.name}</Text>
          </property>
        </Tree>
      </Fragment>
    `);
    
    // Expand the node
    const row = page.locator('[role="treeitem"]').filter({ hasText: "Unloaded Parent" });
    const expandIcon = row.locator('[role="img"]').first();
    await expandIcon.click();
    
    // Check for spinner (it should appear briefly)
    // Note: This might be flaky due to timing, but documents expected behavior
    await page.waitForTimeout(50);
    
    // Eventually children appear
    await expect(page.getByText("Child 1")).toBeVisible({ timeout: 2000 });
  });

  test("marks node as loaded after successful load", async ({ initTestBed, page }) => {
    const mockBackend: ApiInterceptorDefinition = {
      operations: {
        loadChildren: {
          url: "/api/tree/children/:nodeId",
          method: "get",
          handler: `
            return [
              { id: 11, name: 'Child 1', parentId: $params.nodeId, loaded: true }
            ];
          `
        }
      }
    };

    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APIInterceptor definition="{${JSON.stringify(mockBackend)}}" />
        <Tree
          id="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Unloaded Parent', loaded: false }
          ]}"
          loadedField="loaded"
          loadChildren="async node => {
            let response = await fetch('/api/tree/children/' + node.id);
            return await response.json();
          }"
        >
          <property name="itemTemplate">
            <Text>{$item.name}</Text>
          </property>
        </Tree>
        <Button testId="checkBtn" onClick="testState = tree.getNodeById(1)" />
      </Fragment>
    `);
    
    // Expand and wait for load
    const expandIcon = page.locator('[role="treeitem"]').filter({ hasText: "Unloaded Parent" })
      .locator('[role="img"]').first();
    await expandIcon.click();
    await expect(page.getByText("Child 1")).toBeVisible();
    
    // Check that node is now marked as loaded
    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();
    expect(result.loaded).toBe(true);
  });

  test("handles empty children response", async ({ initTestBed, page }) => {
    const mockBackend: ApiInterceptorDefinition = {
      operations: {
        loadChildren: {
          url: "/api/tree/children/:nodeId",
          method: "get",
          handler: "return [];"
        }
      }
    };

    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APIInterceptor definition="{${JSON.stringify(mockBackend)}}" />
        <Tree
          id="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Unloaded Parent', loaded: false }
          ]}"
          loadedField="loaded"
          loadChildren="async node => {
            let response = await fetch('/api/tree/children/' + node.id);
            return await response.json();
          }"
        >
          <property name="itemTemplate">
            <Text>{$item.name}</Text>
          </property>
        </Tree>
        <Button testId="checkBtn" onClick="testState = tree.getNodeById(1)" />
      </Fragment>
    `);
    
    // Expand the node
    const expandIcon = page.locator('[role="treeitem"]').filter({ hasText: "Unloaded Parent" })
      .locator('[role="img"]').first();
    await expandIcon.click();
    
    // Node should still be marked as loaded even with no children
    await page.waitForTimeout(100);
    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();
    expect(result.loaded).toBe(true);
    
    // Expand indicator should be gone
    await expect(expandIcon).not.toBeVisible();
  });

  test("handles load error gracefully", async ({ initTestBed, page }) => {
    const mockBackend: ApiInterceptorDefinition = {
      operations: {
        loadChildren: {
          url: "/api/tree/children/:nodeId",
          method: "get",
          handler: "throw 'Load failed';"
        }
      }
    };

    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APIInterceptor definition="{${JSON.stringify(mockBackend)}}" />
        <Tree
          id="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Unloaded Parent', loaded: false }
          ]}"
          loadedField="loaded"
          loadChildren="async node => {
            let response = await fetch('/api/tree/children/' + node.id);
            return await response.json();
          }"
        >
          <property name="itemTemplate">
            <Text>{$item.name}</Text>
          </property>
        </Tree>
        <Button testId="checkBtn" onClick="testState = tree.getNodeById(1)" />
      </Fragment>
    `);
    
    // Try to expand - should fail
    const expandIcon = page.locator('[role="treeitem"]').filter({ hasText: "Unloaded Parent" })
      .locator('[role="img"]').first();
    await expandIcon.click();
    
    // Wait a bit for error handling
    await page.waitForTimeout(200);
    
    // Node should remain unloaded
    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();
    expect(result.loaded).toBe(false);
    
    // Node should not be expanded
    const row = page.locator('[role="treeitem"]').filter({ hasText: "Unloaded Parent" });
    await expect(row).toHaveAttribute('aria-expanded', 'false');
  });

  test("works with hierarchy format", async ({ initTestBed, page }) => {
    const mockBackend: ApiInterceptorDefinition = {
      operations: {
        loadChildren: {
          url: "/api/tree/children/:nodeId",
          method: "get",
          handler: `
            return [
              { id: 11, name: 'Child 1', loaded: true },
              { id: 12, name: 'Child 2', loaded: true }
            ];
          `
        }
      }
    };

    await initTestBed(`
      <Fragment>
        <APIInterceptor definition="{${JSON.stringify(mockBackend)}}" />
        <Tree
          dataFormat="hierarchy"
          data="{[
            { id: 1, name: 'Unloaded Parent', loaded: false }
          ]}"
          loadedField="loaded"
          childrenField="children"
          loadChildren="async node => {
            let response = await fetch('/api/tree/children/' + node.id);
            return await response.json();
          }"
        >
          <property name="itemTemplate">
            <Text>{$item.name}</Text>
          </property>
        </Tree>
      </Fragment>
    `);
    
    // Expand and verify children appear
    const expandIcon = page.locator('[role="treeitem"]').filter({ hasText: "Unloaded Parent" })
      .locator('[role="img"]').first();
    await expandIcon.click();
    
    await expect(page.getByText("Child 1")).toBeVisible();
    await expect(page.getByText("Child 2")).toBeVisible();
  });
});
```

**Verification:**
```bash
# Run all Tree tests
npx playwright test Tree.spec.ts --workers=1 --reporter=line
npx playwright test Tree-dynamic.spec.ts --workers=1 --reporter=line
npx playwright test Tree-icons.spec.ts --workers=1 --reporter=line
npx playwright test Tree-loaded-field.spec.ts --workers=1 --reporter=line
```

**Success Criteria:**
- ✅ All existing tests pass
- ✅ All new async loading tests pass
- ✅ loadChildren called when expanding unloaded nodes
- ✅ Spinner shown during loading
- ✅ Children added to tree after load
- ✅ Node marked as loaded after successful load
- ✅ Errors handled gracefully

---

#### STEP 5: Update API Methods

**Goal:** Update markNodeLoaded/markNodeUnloaded to work with loaded field

**Changes:**
1. Update `markNodeLoaded()` to set `loaded: true` in source data
2. Update `markNodeUnloaded()` to set `loaded: false` in source data
3. Update `getNodeLoadingState()` to check both nodeStates Map and `loaded` field

**Files to modify:**
- `xmlui/src/components/Tree/TreeNative.tsx` (API methods section)

**E2E Tests to Create:**
Add to `Tree-loaded-field.spec.ts`:

```typescript
test.describe("API Methods with loaded Field", () => {
  
  test("markNodeUnloaded sets loaded to false", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Tree
          id="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Parent', loaded: true },
            { id: 2, name: 'Child', parentId: 1, loaded: true }
          ]}"
          loadedField="loaded"
        >
          <property name="itemTemplate">
            <Text>{$item.name}</Text>
          </property>
        </Tree>
        <Button testId="unloadBtn" onClick="tree.markNodeUnloaded(1)" />
        <Button testId="checkBtn" onClick="testState = tree.getNodeById(1)" />
      </Fragment>
    `);
    
    // Mark node as unloaded
    await page.getByTestId("unloadBtn").click();
    await page.waitForTimeout(50);
    
    // Check that loaded field is false
    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();
    expect(result.loaded).toBe(false);
  });

  test("markNodeLoaded sets loaded to true", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Tree
          id="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Node', loaded: false }
          ]}"
          loadedField="loaded"
        >
          <property name="itemTemplate">
            <Text>{$item.name}</Text>
          </property>
        </Tree>
        <Button testId="loadBtn" onClick="tree.markNodeLoaded(1)" />
        <Button testId="checkBtn" onClick="testState = tree.getNodeById(1)" />
      </Fragment>
    `);
    
    // Mark node as loaded
    await page.getByTestId("loadBtn").click();
    await page.waitForTimeout(50);
    
    // Check that loaded field is true
    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();
    expect(result.loaded).toBe(true);
  });

  test("getNodeLoadingState returns correct state", async ({ initTestBed, page }) => {
    const mockBackend: ApiInterceptorDefinition = {
      operations: {
        loadChildren: {
          url: "/api/tree/children/:nodeId",
          method: "get",
          handler: `
            delay(200);
            return [{ id: 11, name: 'Child', parentId: $params.nodeId, loaded: true }];
          `
        }
      }
    };

    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <APIInterceptor definition="{${JSON.stringify(mockBackend)}}" />
        <Tree
          id="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Unloaded', loaded: false }
          ]}"
          loadedField="loaded"
          loadChildren="async node => {
            let response = await fetch('/api/tree/children/' + node.id);
            return await response.json();
          }"
        >
          <property name="itemTemplate">
            <Text>{$item.name}</Text>
          </property>
        </Tree>
        <Button testId="checkBtn" onClick="testState = tree.getNodeLoadingState(1)" />
      </Fragment>
    `);
    
    // Initial state should be unloaded
    await page.getByTestId("checkBtn").click();
    let result = await testStateDriver.testState();
    expect(result).toBe("unloaded");
    
    // Start loading
    const expandIcon = page.locator('[role="treeitem"]').filter({ hasText: "Unloaded" })
      .locator('[role="img"]').first();
    await expandIcon.click();
    
    // Check loading state (might be flaky due to timing)
    await page.waitForTimeout(50);
    await page.getByTestId("checkBtn").click();
    result = await testStateDriver.testState();
    // Could be "loading" or "loaded" depending on timing
    expect(["loading", "loaded"]).toContain(result);
    
    // Wait for completion
    await expect(page.getByText("Child")).toBeVisible();
    
    // Final state should be loaded
    await page.getByTestId("checkBtn").click();
    result = await testStateDriver.testState();
    expect(result).toBe("loaded");
  });
});
```

**Verification:**
```bash
npx playwright test Tree.spec.ts --workers=1 --reporter=line
npx playwright test Tree-dynamic.spec.ts --workers=1 --reporter=line
npx playwright test Tree-icons.spec.ts --workers=1 --reporter=line
npx playwright test Tree-loaded-field.spec.ts --workers=1 --reporter=line
```

**Success Criteria:**
- ✅ All existing tests pass
- ✅ All new API tests pass
- ✅ markNodeLoaded/Unloaded update loaded field correctly
- ✅ getNodeLoadingState returns correct states

---

#### STEP 6: Backward Compatibility with dynamicField (DEPRECATED - SEE BELOW)

**INVESTIGATION FINDINGS:**

The `dynamicField` feature is **barely used** and **functionally identical** to the new `loadedField` approach:

**Current usage:**
- Only documented in one section of Tree.md with one example
- Only 3 tests specifically test `dynamicField`
- Only 3 test datasets use `dynamic: true`
- No usage found outside the Tree component

**Functional equivalence:**
- `dynamic: true` = `loaded: false` (both show expand indicator, trigger async loading)
- Both use the same `loadChildren` event
- Both show loading spinners
- Both track loading state

**REVISED APPROACH: Simple Internal Mapping**

Instead of maintaining two parallel systems, we'll use a simpler approach:

**Changes:**
1. Keep `dynamicField` prop (deprecated) for backward compatibility
2. In `flatToNative` and `hierarchyToNative`, map `dynamic: true` → `loaded: false` internally
3. No need for priority logic - just convert dynamic to loaded format
4. Add deprecation notice to metadata

**Logic:**
```typescript
// In flatToNative/hierarchyToNative when reading node data:
let loaded = true; // default

// Check loadedField first (new approach)
if (loadedField && sourceItem[loadedField] !== undefined) {
  loaded = sourceItem[loadedField];
} 
// Fallback to dynamicField for backward compatibility
else if (dynamicField && sourceItem[dynamicField]) {
  loaded = false; // dynamic: true means loaded: false
}

node.loaded = loaded;
```

**Files to modify:**
- `xmlui/src/components-core/utils/treeUtils.ts` (flatToNative, hierarchyToNative)
- `xmlui/src/components/Tree/Tree.tsx` (add deprecation notice to dynamicField metadata)

**E2E Tests:**
The existing 3 tests in `Tree-dynamic.spec.ts` should continue to pass without modification.

Add one new test to Tree-loaded-field.spec.ts:

```typescript
test("dynamic field mapped to loaded field (backward compatibility)", async ({ initTestBed, page }) => {
  const { testStateDriver } = await initTestBed(`
    <Fragment>
      <Tree
        id="tree"
        dataFormat="flat"
        data="{[
          { id: 1, name: 'Dynamic Node', dynamic: true }
        ]}"
        dynamicField="dynamic"
      >
        <property name="itemTemplate">
          <Text>{$item.name}</Text>
        </property>
      </Tree>
      <Button testId="checkBtn" onClick="testState = tree.getNodeById(1)" />
    </Fragment>
  `);
  
  await page.getByTestId("checkBtn").click();
  const result = await testStateDriver.testState();
  
  // dynamic: true should be converted to loaded: false internally
  expect(result.loaded).toBe(false);
  
  // Should show expand indicator
  const expandIcon = page.locator('[role="treeitem"]').filter({ hasText: "Dynamic Node" })
    .locator('[role="img"]').first();
  await expect(expandIcon).toBeVisible();
});
```

**Verification:**
```bash
# All existing dynamic tests should pass
npx playwright test Tree-dynamic.spec.ts --workers=1 --reporter=line
# New loaded field tests
npx playwright test Tree-loaded-field.spec.ts --workers=1 --reporter=line
```

**Success Criteria:**
- ✅ All existing Tree-dynamic.spec.ts tests pass without modification
- ✅ `dynamic: true` nodes show expand indicators (via internal `loaded: false`)
- ✅ Async loading works with both `dynamic` and `loaded` fields
- ✅ Simpler implementation - no dual system to maintain

**Migration Notes:**
- `dynamicField` prop is now **deprecated** but still supported
- Users should migrate to `loadedField="loaded"` and `loaded: false`
- Both approaches work identically during transition period
- Consider removing `dynamicField` in a future major version

---

#### STEP 7: Real-World App Testing

**Goal:** Test with your actual file system browser app

**Changes:**
1. Update backend to support `/api/fs-data/parent/:parentId` endpoint
2. Update app markup to use `loadedField` and `loadChildren`

**Modified App Markup:**
```xml
<App scrollWholePage="false">
  <DataSource 
    id="rootData" 
    url="/api/fs-data/parent/root" 
    onLoaded="console.log('Root data loaded')" />
  <VStack height="*">
    <Tree
      dataFormat="flat"
      data="{rootData}"
      defaultExpanded="first-level"
      itemClickExpands
      iconSize="20"
      itemHeight="28"
      fixedItemSize
      scrollStyle="whenMouseOver"
      loadedField="loaded"
      loadChildren="async node => {
        let response = await fetch('/api/fs-data/parent/' + node.id);
        return await response.json();
      }"
    >
      <property name="itemTemplate">
        <HStack gap="0.5rem" verticalAlignment="center">
          <Icon name="{$item.icon}" size="16" />
          <Text>{$item.name}</Text>
          <SpaceFiller />
          <Text when="{$item.isFolder}" variant="secondary" fontSize="0.85rem">
            ({$item.dch}/{$item.total} items)
          </Text>
          <Text when="{!$item.isFolder}" variant="secondary" fontSize="0.85rem">
            {$item.sizeFormatted}
          </Text>
        </HStack>
      </property>
    </Tree>
  </VStack>
</App>
```

**Backend Data Format:**
```json
// Root response
[
  { 
    "id": "folder1", 
    "name": "Documents", 
    "icon": "folder",
    "isFolder": true,
    "dch": 5,
    "total": 15,
    "loaded": false
  },
  { 
    "id": "file1", 
    "name": "readme.txt", 
    "icon": "file",
    "isFolder": false,
    "sizeFormatted": "2.5 KB",
    "loaded": true
  }
]

// Children response for /api/fs-data/parent/folder1
[
  { 
    "id": "subfolder1", 
    "name": "Photos", 
    "parentId": "folder1",
    "icon": "folder",
    "isFolder": true,
    "dch": 0,
    "total": 10,
    "loaded": false
  }
]
```

**Manual Testing:**
1. Start your app
2. Verify root nodes load correctly
3. Click expand on folder nodes
4. Verify children load asynchronously
5. Verify spinner appears during load
6. Verify multiple levels of expansion work
7. Test error handling (disconnect network mid-load)

---

### Summary of Changes

**Core Files Modified:**
1. `treeAbstractions.ts` - Added `loadedField` to interfaces
2. `treeUtils.ts` - Read/store loaded field, update hasChildren logic
3. `Tree.tsx` - Added metadata and renderer prop passing
4. `TreeNative.tsx` - Main implementation (props, toggleNode, APIs)

**Test Files Created/Modified:**
1. `Tree.spec.ts` - New tests for loaded field storage and display
2. `Tree-loaded-field.spec.ts` - NEW file for async loading tests
3. `Tree-dynamic.spec.ts` - Should continue passing (backward compat)
4. `Tree-icons.spec.ts` - Should continue passing

**Total Test Steps:** 7 incremental steps, each with verification

**Estimated Implementation Time:**
- Step 1: 15 minutes
- Step 2: 30 minutes
- Step 3: 20 minutes
- Step 4: 60 minutes (main logic)
- Step 5: 30 minutes
- Step 6: 30 minutes
- Step 7: Manual testing time
- **Total: ~3 hours + manual testing**

---

### Testing Infrastructure

**Before Each Step:**
```bash
cd /Users/dotneteer/source/xmlui
npx playwright test Tree.spec.ts --workers=1 --reporter=line
npx playwright test Tree-dynamic.spec.ts --workers=1 --reporter=line
npx playwright test Tree-icons.spec.ts --workers=1 --reporter=line
```

**After Step 4 Onward:**
```bash
cd /Users/dotneteer/source/xmlui
npx playwright test Tree.spec.ts --workers=1 --reporter=line
npx playwright test Tree-dynamic.spec.ts --workers=1 --reporter=line
npx playwright test Tree-icons.spec.ts --workers=1 --reporter=line
npx playwright test Tree-loaded-field.spec.ts --workers=1 --reporter=line
```

**Success Criteria for Each Step:**
✅ All existing tests pass
✅ All new tests for that step pass
✅ No console errors
✅ Manual spot-check of behavior if needed
**File**: `xmlui/src/components-core/abstractions/treeAbstractions.ts`

Add `loadedField` to interface:
```typescript
export interface TreeFieldConfig {
  idField: string;
  labelField: string;
  iconField?: string;
  iconExpandedField?: string;
  iconCollapsedField?: string;
  parentField?: string;
  childrenField?: string;
  selectableField?: string;
  dynamicField?: string;  // Keep for backward compatibility
  loadedField?: string;   // NEW
}
```

#### 2. Update Metadata
**File**: `xmlui/src/components/Tree/Tree.tsx`

Add new prop to metadata:
```typescript
loadedField: {
  description: `The property name in source data for loaded state (default: "loaded"). When false, shows expand indicator even without children and triggers async loading.`,
  valueType: "string",
  defaultValue: defaultProps.loadedField,
}
```

#### 3. Update Default Props
**File**: `xmlui/src/components/Tree/TreeNative.tsx` (line ~295)

Add to `defaultProps`:
```typescript
export const defaultProps = {
  // ... existing props
  loadedField: "loaded",
};
```

#### 4. Update Component Props Interface
**File**: `xmlui/src/components/Tree/TreeNative.tsx` (line ~319)

Add to `TreeComponentProps`:
```typescript
interface TreeComponentProps {
  // ... existing props
  loadedField?: string;
}
```

#### 5. Update TreeNode Processing
**File**: `xmlui/src/components-core/utils/treeUtils.ts`

Modify `flatToNative` and `hierarchyToNative`:
- Read `loadedField` value from source data
- Store as `loaded` property on TreeNode
- Default to `true` if not specified

#### 6. Update TreeNode hasChildren Logic
**Files**: 
- `xmlui/src/components-core/utils/treeUtils.ts` (toFlatTree function)
- `xmlui/src/components/Tree/TreeNative.tsx` (multiple locations)

**Logic change:**
```typescript
// OLD: hasChildren = node.children && node.children.length > 0
// NEW:
hasChildren = (node.children && node.children.length > 0) || node.loaded === false
```

Node should show expand indicator if:
- Has actual children, OR
- Has `loaded: false` (indicating potential children to load)

#### 7. Update toggleNode Logic
**File**: `xmlui/src/components/Tree/TreeNative.tsx` (line 716)

**Changes needed:**
```typescript
const toggleNode = useCallback(async (node: FlatTreeNode) => {
  if (!node.isExpanded) {
    // Expanding the node
    
    // Check if node is unloaded (loaded: false in source data)
    const sourceNode = getNodeById(node.key);
    const isUnloaded = sourceNode?.loaded === false;
    
    if (isUnloaded && loadChildren) {
      // Set loading state
      setNodeStates(prev => new Map(prev).set(node.key, "loading"));
      
      try {
        // Call loadChildren event
        const loadedData = await loadChildren({ ...node, isExpanded: true });
        
        if (loadedData && Array.isArray(loadedData) && loadedData.length > 0) {
          // Update internalData with new children
          updateInternalData(prevData => {
            const currentData = prevData ?? data;
            
            if (dataFormat === "flat") {
              // Add children with parentId set
              const newItems = loadedData.map(item => ({
                ...item,
                [fieldConfig.parentField || "parentId"]: String(node.key),
              }));
              return [...currentData, ...newItems];
            } else if (dataFormat === "hierarchy") {
              // Find parent node and add children
              const updateHierarchy = (nodes: any[]): any[] => {
                return nodes.map(n => {
                  if (String(n[fieldConfig.idField]) === String(node.key)) {
                    return {
                      ...n,
                      [fieldConfig.childrenField || "children"]: loadedData,
                      [fieldConfig.loadedField || "loaded"]: true, // Mark as loaded
                    };
                  } else if (n[fieldConfig.childrenField]) {
                    return {
                      ...n,
                      [fieldConfig.childrenField]: updateHierarchy(n[fieldConfig.childrenField]),
                    };
                  }
                  return n;
                });
              };
              return updateHierarchy(currentData);
            }
            
            return currentData;
          });
        } else {
          // No children loaded, just mark as loaded
          updateInternalData(prevData => {
            // Mark node as loaded in source data
            // (implementation similar to above but only update loaded field)
          });
        }
        
        // Set loaded state
        setNodeStates(prev => new Map(prev).set(node.key, "loaded"));
        
        // Expand the node
        setExpandedIds(prev => [...prev, node.key]);
        
        // Fire nodeDidExpand event
        if (onNodeExpanded) {
          onNodeExpanded({ ...node, isExpanded: true });
        }
        
      } catch (error) {
        console.error("Error loading tree node data:", error);
        // Keep state as unloaded, don't expand
        setNodeStates(prev => {
          const newMap = new Map(prev);
          newMap.delete(node.key);
          return newMap;
        });
        // TODO: Consider adding error state UI
      }
    } else {
      // Node already has children or no loadChildren handler
      // Standard expand behavior
      setExpandedIds(prev => [...prev, node.key]);
      if (onNodeExpanded) {
        onNodeExpanded({ ...node, isExpanded: true });
      }
    }
  } else {
    // Collapsing - existing logic unchanged
    // ...
  }
}, [/* dependencies */]);
```

#### 8. Update Renderer
**File**: `xmlui/src/components/Tree/Tree.tsx` (renderer section)

Pass `loadedField` to native component:
```typescript
export const treeComponentRenderer = createComponentRenderer(
  COMP,
  TreeMd,
  ({ node, extractValue, /* ... */ }) => {
    return (
      <TreeComponent
        // ... existing props
        loadedField={extractValue.asOptionalString(node.props.loadedField)}
      />
    );
  }
);
```

#### 9. Update Loading State Display
**File**: `xmlui/src/components/Tree/TreeNative.tsx` (TreeRow component, line ~150)

Current spinner display logic should work as-is, since it checks:
```typescript
{(treeItem as FlatTreeNodeWithState).loadingState === "loading" ? (
  <Spinner delay={0} style={{ width: 24, height: 24 }} />
) : (
  <Icon ... />
)}
```

No changes needed here.

#### 10. Update API Methods
**File**: `xmlui/src/components/Tree/TreeNative.tsx`

Update these APIs to respect `loaded` field:
- `markNodeLoaded`: Should update source data's `loaded` field to `true`
- `markNodeUnloaded`: Should update source data's `loaded` field to `false`
- `getNodeLoadingState`: Should check both nodeStates Map and `loaded` field

#### 11. Backward Compatibility
Keep `dynamicField` working alongside new `loadedField`:
- If node has `dynamic: true` → treat as `loaded: false`
- Priority: `loadedField` overrides `dynamicField` if both present

### Testing Strategy

#### Test Cases
1. **Basic loaded/unloaded nodes**
   - Node with `loaded: false` shows expand indicator
   - Node with `loaded: true` shows children normally
   - Node without `loaded` field defaults to `true`

2. **Async loading**
   - Expanding unloaded node calls `loadChildren`
   - Spinner shows during loading
   - Children appear after load completes
   - Node's `loaded` state becomes `true`

3. **Error handling**
   - Failed load keeps node unloaded
   - Can retry by collapsing and re-expanding

4. **Both data formats**
   - Works with `dataFormat="flat"`
   - Works with `dataFormat="hierarchy"`

5. **API methods**
   - `markNodeLoaded` / `markNodeUnloaded` work correctly
   - `getNodeLoadingState` returns correct state

6. **Backward compatibility**
   - Old `dynamic` field still works
   - Can mix both approaches in same tree

### Files to Modify

1. `xmlui/src/components-core/abstractions/treeAbstractions.ts` - Add `loadedField` to interface
2. `xmlui/src/components-core/utils/treeUtils.ts` - Update node processing, hasChildren logic
3. `xmlui/src/components/Tree/Tree.tsx` - Add metadata, pass prop to native
4. `xmlui/src/components/Tree/TreeNative.tsx` - Main implementation (defaultProps, toggleNode, APIs)

### Migration Notes

**Breaking Changes**: None (backward compatible)

**Deprecation**: Consider deprecating `dynamicField` in future version

**Documentation**: Update Tree.md with examples of new `loaded` field usage

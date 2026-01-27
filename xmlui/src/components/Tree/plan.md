# Tree Auto-Load Feature Implementation Plan

## Context References
- E2E Testing Conventions: `/Users/dotneteer/source/xmlui/xmlui/dev-docs/conv-e2e-testing.md`
- Component Creation Conventions: `/Users/dotneteer/source/xmlui/xmlui/dev-docs/conv-create-components.md`

## Testing Workflow Per Step
1. **Before implementation**: Run all existing Tree tests to ensure baseline passes
   ```bash
   npx playwright test Tree.spec.ts --workers=1 --reporter=line
   ```
2. **Implement the step**: Make code changes for the specific step
3. **Run new tests**: Execute only the new E2E tests for this step
   ```bash
   npx playwright test Tree.spec.ts --grep "step name pattern" --workers=1 --reporter=line
   ```
4. **Run all Tree tests**: Verify no regressions
   ```bash
   npx playwright test Tree.spec.ts --workers=1 --reporter=line
   ```
5. **Wait for approval**: Confirm success before proceeding to next step

---

## Step 1: Add expanded timestamp tracking
**Implementation:**
- Add `expandedTimestamp?: number` field to `FlatTreeNodeWithState` interface in `treeAbstractions.ts`
- Record `Date.now()` in `toggleNode` when expanding nodes (TreeNative.tsx)
- Add `getExpandedTimestamp(nodeId: string | number): number | undefined` API method
- Update metadata in Tree.tsx with new API

**E2E Test:**
- Verify timestamp is recorded when node expands
- Verify timestamp is retrievable via API
- Verify timestamp updates on re-expansion
- Verify undefined returned for never-expanded nodes

---

## Step 2: Add autoLoadAfter state field
**Implementation:**
- Add `autoLoadAfter?: number | null` field to `FlatTreeNodeWithState` interface
- Add `setAutoLoadAfter(nodeId: string | number, milliseconds: number | null | undefined): void` API method
- Update metadata in Tree.tsx with new API
- Store per-node autoLoadAfter in node state

**E2E Test:**
- Verify setAutoLoadAfter stores value correctly
- Verify null/undefined clears autoLoadAfter
- Verify values persist across collapse/expand cycles
- Verify setting different values for different nodes

---

## Step 3: Add autoLoadAfter component property
**Implementation:**
- Add `autoLoadAfter` property to Tree metadata (default: undefined)
- Pass through renderer to TreeNative component
- Apply default to nodes when autoLoadAfter not explicitly set per-node
- Store default in component props

**E2E Test:**
- Verify default autoLoadAfter is applied to new nodes
- Verify per-node values override default
- Verify nodes without explicit value use default

---

## Step 4: Implement autoload mechanism
**Implementation:**
- Add `collapsedTimestamp?: number` field to `FlatTreeNodeWithState` interface
- Record collapse timestamp in `toggleNode` when collapsing dynamic nodes
- On expand: check if (currentTime - collapsedTimestamp) > autoLoadAfter
- If condition met: trigger loadChildren event and reload children
- Only apply to dynamic nodes (nodes with `loadedField` === false initially and then loaded via loadChildren)

**E2E Test:**
- Verify autoload triggers after threshold exceeded
- Verify autoload doesn't trigger before threshold
- Verify autoload only affects dynamic nodes, not static nodes
- Verify children are actually reloaded (new data appears)
- Use delay() in XMLUI to control timing

---

## Step 5: Edge cases and integration
**Implementation:**
- Handle node removal/updates during autoload
- Ensure autoload state cleared when node manually reloaded via markNodeUnloaded
- Clear timestamps appropriately on data changes
- Handle multiple rapid collapse/expand cycles

**E2E Test:**
- Complex scenario: multiple nodes with different thresholds
- Test manual reload clearing autoload state
- Test rapid collapse/expand doesn't cause issues
- Test removing nodes with pending autoload
- Integration test with all features combined

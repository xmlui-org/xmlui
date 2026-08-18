# Tree Data Refresh State Preservation Plan

## Goal

Support Tree scenarios where `data` comes from a backend-backed `DataSource` / React Query result and later changes after a mutation. The Tree should be able to display refreshed data while preserving the user's current view state for unchanged source node IDs: expanded/collapsed branches, selection when still valid, dynamic loading state, autoload timing state, and scroll position.

The feature should be opt-in so existing applications keep their current refresh behavior.

The refresh should avoid unnecessary visual flashing. Ideally, the user sees the old tree until the refreshed data and reconciled view state are ready, then sees the updated tree in a single visible commit.

## Current Context

- `Tree` is implemented in `xmlui/src/components/Tree/Tree.tsx` and `xmlui/src/components/Tree/TreeReact.tsx`.
- Tree source IDs are already the stable key for expansion state: `TreeNode.key` is set from `idField`.
- Tree already exposes `getTreeState()` and `setTreeState(treeState)`.
- `initialTreeState` already restores matching node IDs and ignores missing IDs as data becomes available.
- `data="{someDataSource}"` can be rewritten to a `DataSourceRef`, so the solution must work both for plain prop data changes and API-bound `DataSource` refreshes.
- I could not find the root `guidelines.md` referenced by the component prompt in this checkout. I used `.github/instructions/components.instructions.md`, `.ai/xmlui/component-architecture.md`, `.ai/xmlui/wrapcomponent.md`, `.ai/xmlui/data-operations.md`, and `.ai/xmlui/testing-conventions.md`.

## Proposed Public API

Add a declarative prop:

```xml
<Tree dataRefreshMode="preserve-state" data="{treeData}" />
```

Values:

- `reset` - default. Preserve current behavior.
- `preserve-state` - when `data` changes after initial load, reconcile the new tree data with the existing view state by stable source node ID.

Add a one-shot imperative API for mutation flows that only need the next refresh preserved:

```xml
<Button onClick="
  tree.preserveStateOnNextDataRefresh({ operation: 'insert' });
  addNode.execute();
" />
```

API:

- `preserveStateOnNextDataRefresh(options?: TreeDataRefreshOptions): void` - captures the current Tree state and applies it to the next observed `data` change, then clears the one-shot request.

Calling this API forces preserve behavior for the next observed `data` refresh even when the declarative `dataRefreshMode` prop is currently `"reset"`. In other words, the API is an imperative one-refresh promotion to `"preserve-state"` semantics.

Options:

```ts
type TreeDataRefreshOptions = {
  operation?: "insert" | "delete" | "update";
  scrollTarget?: string | number | "first-inserted" | "preserve";
};
```

Scroll behavior:

- Omitted options: preserve the existing scroll position.
- `operation: "insert"`: infer the first inserted source node ID by comparing pre-refresh and post-refresh source IDs, then scroll it into view only if it is outside the current viewport. If no inserted node can be inferred, preserve scroll position.
- `operation: "delete"`: preserve the existing scroll position.
- `operation: "update"`: preserve the existing scroll position unless `scrollTarget` is supplied.
- `scrollTarget`: explicit override. A source node ID scrolls that node into view after reconciliation. `"first-inserted"` uses insert inference even when `operation` is omitted. `"preserve"` forces current scroll preservation.

This gives two usage styles:

- Use the prop when all backend refreshes should preserve view.
- Use the API when a particular mutation/refetch should preserve view and optionally declare the operation intent.
- For the first implementation, prioritize the API path; keep `dataRefreshMode` as the explicit mode name for the declarative path.

## Behavior Rules

When preservation is active and refreshed data arrives:

1. Rebuild the normalized tree from the latest `data`.
2. Reapply state for nodes whose source IDs still exist.
3. Drop state for deleted nodes and their descendants.
4. Keep expanded/collapsed choices for unchanged IDs, including parent branches of unchanged nodes.
5. Keep selection only if the selected source ID still exists and remains selectable; otherwise clear selection.
6. Keep node loading/autoload state for IDs that still exist, unless the incoming source data explicitly says the node is unloaded.
7. Restore scroll position after the virtualizer sees the refreshed row count, clamped naturally by the virtualizer/browser if content shrinks.
8. Apply `defaultExpanded` only for the initial tree load, not for later preserved refreshes.
9. Newly added nodes use normal defaults: collapsed unless made visible by an already-expanded parent, selected only through controlled `selectedValue`/`selectedId`, and loaded/dynamic according to source data.
10. Avoid intermediate empty/collapsed states during refresh. The UI should not briefly reset to the default expansion state before preserved state is reapplied.
11. Respect refresh intent for viewport placement:
    - no intent: preserve current scroll position,
    - insert intent: scroll the first inserted node into view if it is not already visible,
    - delete intent: preserve current scroll position,
    - explicit node target: scroll that node into view if present.
12. If `dataRefreshMode="reset"` but `preserveStateOnNextDataRefresh()` has been called, the next data refresh uses `"preserve-state"` reconciliation and intent handling, then returns to the declarative mode for later refreshes.

## Implementation Steps

1. Add metadata and defaults.
   - Add `dataRefreshMode` to `TreeMd.props` in `xmlui/src/components/Tree/Tree.tsx`.
   - Add default `"reset"` to `xmlui/src/components/Tree/Tree.defaults.ts`.
   - Thread `dataRefreshMode` through the custom `wrapComponent` renderer into `TreeComponent`.
   - Add API metadata for `preserveStateOnNextDataRefresh`.
   - Because this changes public API/metadata, update metadata snapshot and add a patch changeset during implementation.

2. Add preservation plumbing in `TreeReact.tsx`.
   - Add a `dataRefreshMode` prop to `TreeComponentProps`.
   - Track the previous `data` identity and whether the component has completed its initial data load.
   - Add refs for:
     - a pending one-shot preserved state,
     - pending refresh options / operation intent,
     - the pre-refresh set of source node IDs,
     - the most recent data identity,
     - whether preservation is currently being applied.
   - Register `preserveStateOnNextDataRefresh(options?: TreeDataRefreshOptions)` in `treeApiMethods`; it should store `getTreeState()`, the current source ID set, and the supplied options in pending refs.

3. Reconcile state after new data is transformed.
   - Reuse the existing `applyTreeState` path so matching node IDs, selection, loading state, timestamps, and scroll restore stay consistent with `setTreeState`.
   - For `dataRefreshMode="preserve-state"`, capture the pre-refresh state before applying refresh semantics, then apply it after `treeItemsById` reflects the new data.
   - For the one-shot API, apply the explicitly captured state once after the next data identity change regardless of the current declarative `dataRefreshMode` value.
   - Guard against loops: applying state must not itself be treated as another data refresh.
   - Ensure the transformed data and reconciled Tree state are committed together from the user's perspective. Avoid a render where refreshed data appears with reset expansion state, and avoid a render where the Tree disappears or collapses before the preserved state is applied.
   - Compute inserted IDs from `postRefreshIds - preRefreshIds` when refresh options request insert handling. Use visible tree order after reconciliation to choose the first inserted node that is currently reachable through expanded parents.

4. Clean stale internal state.
   - Prune `expandedIds`, `nodeStates`, `expandedTimestamps`, `collapsedTimestamps`, `autoLoadAfterMap`, and `dynamicStateMap` to source IDs that still exist after the refresh.
   - Clear uncontrolled selection when the selected ID no longer exists.
   - Keep controlled `selectedValue` / `selectedId` behavior authoritative.

5. Keep rendering efficient where practical.
   - Keep `TreeMemoizedRow` keyed by stable `node.key`.
   - Avoid avoidable state updates when the reconciled arrays/maps are equal by source ID.
   - Prefer deriving the next visible flat tree from latest data plus preserved state in one calculation over applying several independent state updates that can produce transient visual states.
   - If React state batching is not enough for this path, introduce a small pending-refresh state/ref so the component continues showing the previous visible tree until the reconciled state is ready.
   - For insert intent, perform scroll adjustment after the virtualizer has the reconciled row list. If the inferred/explicit target is already visible, do not scroll.
   - Treat deeper structural sharing of normalized `TreeNode` objects as a follow-up if tests show visible row churn; the first implementation should focus on correctness and stable UX state.

6. Add tests.
   - Add E2E coverage in `xmlui/src/components/Tree/Tree.spec.ts` or a focused companion spec.
   - Direct prop refresh test: expand/collapse several branches, change the backing array, and verify unchanged branches preserve state while added/removed nodes reconcile correctly.
   - `DataSource` + `APICall invalidates` test: simulate a backend mutation through `apiInterceptor`, let React Query refetch, and verify the expanded branch remains expanded and a new backend node appears.
   - One-shot API test: call `preserveStateOnNextDataRefresh()` before a mutation/refetch and verify only the next refresh preserves state.
   - Reset-mode one-shot test: with `dataRefreshMode="reset"`, call `preserveStateOnNextDataRefresh()` before a mutation/refetch and verify that refresh preserves state; then trigger a later refresh without the API and verify it follows reset behavior.
   - Insert intent test: call `preserveStateOnNextDataRefresh({ operation: "insert" })`, add a backend node, refetch, and verify the first inserted visible node is scrolled into view only when it was outside the viewport.
   - Delete intent test: call `preserveStateOnNextDataRefresh({ operation: "delete" })`, delete a backend node, refetch, and verify scroll position is preserved.
   - Explicit scroll target test: call `preserveStateOnNextDataRefresh({ scrollTarget: someId })`, refetch, and verify the target is scrolled into view when present.
   - Selection test: selected node persists when still present and clears when removed.
   - Scroll test if stable enough with the existing virtualizer helpers; otherwise keep scroll covered by existing `getTreeState` / `setTreeState` tests and document residual risk.
   - Anti-flash test: during a `DataSource` refetch, assert the expanded existing branch does not temporarily collapse or disappear before the updated node set appears. Use durable visible outcomes rather than timing-sensitive screenshots where possible.

7. Documentation.
   - Update `xmlui/src/components/Tree/Tree.md` with a short "Preserving State Across Data Refreshes" section.
   - Include both the `dataRefreshMode="preserve-state"` declarative example and the one-shot API example for mutation flows.
   - Document refresh intent options, especially the default scroll preservation, `operation: "insert"` first-inserted-node behavior, and `operation: "delete"` scroll preservation.
   - Generated website docs should update through the metadata/doc pipeline as usual.

8. Verification.
   - Run focused Tree E2E tests:
     `npx playwright test xmlui/src/components/Tree/Tree.spec.ts --reporter=line`
   - Run any new focused spec if separate.
   - Run metadata snapshot check:
     `npm --prefix xmlui run check:metadata-snapshot`
   - Run `npx changeset status`.

## Open Questions For Approval

Resolved decisions:

- Use the prop name `dataRefreshMode`.
- Include the one-shot API in the first implementation.
- For deleted selected nodes, clear uncontrolled selection; controlled `selectedValue` remains the caller's responsibility.
- For insert intent, choose the first inserted node in post-refresh visible tree order. If inserted nodes are inside a collapsed branch, preserve scroll position unless an explicit `scrollTarget` is supplied.

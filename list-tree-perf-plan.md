# List & Tree Performance Audit

> **Date:** April 10, 2026  
> **Reference:** `table-perf-plan.md`, `tileGrid-perf-plan.md`  
> **Branch:** TBD

---

## Methodology

Each issue class discovered and fixed in Table/TileGrid was checked against List and Tree.
The table below summarizes the audit; detailed findings follow.

| # | Issue Class | Table | TileGrid | **List** | **Tree** |
|---|-------------|-------|----------|----------|----------|
| 1 | O(n²) sync expression (JSON in expr string) | ✅ Fixed | ✅ Fixed | **AFFECTED** | N/A (no syncWithVar) |
| 2 | No `startTransition` on sync write | ✅ Fixed | ✅ Fixed | **AFFECTED** | N/A |
| 3 | No own-write suppression (`pendingOwnWrite`) | ✅ Fixed | ✅ Fixed | **AFFECTED** | N/A |
| 4 | No `__v` version tracking for reliable own-write detection | ✅ Fixed | ⚠️ Still boolean | **AFFECTED** | N/A |
| 5 | Unstable `itemRenderer` reference | ✅ Fixed | ✅ Fixed | **AFFECTED** | **AFFECTED** |
| 6 | Unstable `renderChild` passed to MemoizedItem | ✅ Fixed | ✅ Fixed | **AFFECTED** | **AFFECTED** |
| 7 | No `refreshOn` / `renderVersion` for controlled re-render | ✅ Fixed | ✅ Fixed | **AFFECTED** | N/A (no syncWithVar scope) |
| 8 | External selection changes not detected | ✅ Fixed | ✅ Fixed | **AFFECTED** | N/A |
| 9 | All items re-render on every click | ✅ Fixed | ✅ Fixed | **PARTIALLY** | **PARTIALLY** |
| 10 | Full XMLUI tree re-render blocks main thread | ✅ Fixed (startTransition) | ✅ Fixed | **AFFECTED** | N/A |

**Tree** does not have `syncWithVar` support, so sync‐related issues (1-4, 7-8, 10) do not apply.
However, issues 5, 6, and 9 affect Tree whenever an XMLUI reactive cycle fires.

---

## Detailed Findings

### List Component

#### Issue L1 — O(n²) sync expression (JSON embedded in expression string)

**File:** `xmlui/src/components/List/List.tsx`, `ListWithSelection` (~line 400)

**Problem:** The `syncAdapter.update` embeds the full `selectedIds` array as a JSON literal
inside the XMLUI expression string on every selection change:

```typescript
update: ({ selectedIds }: { selectedIds: string[] }) => {
  const valueJson = JSON.stringify(selectedIds);
  const expr = `{${syncVarName} = {selectedIds: ${valueJson}}}`;
  const handler = lookupActionRef.current?.(expr, { ephemeral: true });
  handler?.();
},
```

With `ephemeral: true` the expression cache is bypassed, so the string is parsed from scratch
each time. As the selection grows, the expression string grows linearly → O(n²) total parse cost
across N clicks.

**Fix:** Use the `window.__tgSync_*` pattern from Table/TileGrid — pass data via a window
variable and keep the expression string constant O(1).

---

#### Issue L2 — No `startTransition` on sync write

**File:** `xmlui/src/components/List/List.tsx`, `ListWithSelection`

**Problem:** `handler?.()` is called synchronously. This triggers a synchronous XMLUI full-tree
re-render on the main thread, blocking the UI. Table and TileGrid both wrap `handler()` in
`startTransition()` to make this non-blocking.

**Fix:** Wrap `handler?.()` in `startTransition(() => { handler?.(); })`.

---

#### Issue L3 — No own-write suppression

**File:** `xmlui/src/components/List/List.tsx`, `ListWithSelection`

**Problem:** There is no `pendingOwnWriteRef` mechanism. After `syncAdapter.update()` writes
the selection, the XMLUI reactive cycle produces a new `extractValue(syncVarName)` value.
The current code unconditionally does `syncAdapterHolderRef.current.value = currentSyncVarValue`
(in-place), which is accidentally correct for suppressing `ListNative` re-renders — but only
because it never creates a new object. However, this also means **external changes are never
detected** (Issue L8).

**Fix:** Implement the `pendingOwnWriteRef` + `pendingOwnWriteVersionRef` (`__v`) pattern
from Table. On own-write cycles, update in-place. On external changes, create a new
`syncAdapterHolderRef.current` object so `ListNative` detects the change.

---

#### Issue L4 — No `__v` version tracking

**File:** `xmlui/src/components/List/List.tsx`, `ListWithSelection`

**Problem:** Without `__v`, own-write detection cannot survive concurrent React renders or
`startTransition` deferred passes. The boolean `pendingOwnWriteRef` alone is unreliable
(as documented in `table-perf-plan.md`).

**Fix:** Port the `__v` mechanism from Table: embed a monotonically-increasing version number
in the stored window object, compare on read-back.

---

#### Issue L5 — Unstable `itemRenderer` reference

**File:** `xmlui/src/components/List/List.tsx`, `ListWithSelection` (~line 430)

**Problem:** `itemRenderer` is an inline arrow function inside the render body of
`ListWithSelection`:

```typescript
itemRenderer={
  itemTemplate &&
  ((item, key, rowIndex, count, isSelected) => {
    return (
      <MemoizedItem
        node={itemTemplate as any}
        key={key}
        renderChild={renderChild}
        ...
      />
    );
  })
}
```

This creates a new function reference on every render of `ListWithSelection`. If `ListNative`
is wrapped in `memo()` (it currently isn't but should be for performance), this would defeat it.
Even without `memo()`, React will diff differently since the prop is always a new reference.

Similarly, `sectionRenderer` and `sectionFooterRenderer` are inline arrow functions that
change on every render.

**Fix:** Wrap `itemRenderer` in `useMemo` with deps `[itemTemplate, idKey]`, using stable
`renderChild` and `layoutContext` refs (see L6). Same for section renderers.

---

#### Issue L6 — Unstable `renderChild` passed to MemoizedItem

**File:** `xmlui/src/components/List/List.tsx`, `ListWithSelection`

**Problem:** `renderChild` is a new function reference on every XMLUI reactive cycle (same root
cause as TileGrid §6). It is passed directly to `MemoizedItem` via the inline `itemRenderer`.
`MemoizedItem`'s `memo()` comparator uses `useShallowCompareMemoize` on `contextVars` but
`renderChild` is a direct prop that changes every cycle → all visible list items re-render.

**Fix:** Store `renderChild` and `layoutContext` in refs. Create a stable wrapper function
(`stableRenderChildFnRef`) that delegates to the ref, same as TileGrid and Table.

---

#### Issue L7 — No `refreshOn` / `renderVersion`

**File:** `xmlui/src/components/List/List.tsx`

**Problem:** Once `renderChild` is stabilized (L6), XMLUI reactive state changes that should
propagate into item closures (e.g. mode changes) will be blocked — the same stale-closure
problem as TileGrid §7. Without a `refreshOn` prop and `renderVersion` counter, there is no
way to selectively force item re-renders when specific external state changes.

**Fix:** Add `refreshOn` prop to List metadata. Implement `renderVersion` counter that
increments only when `refreshOn` changes. Create a `ListMemoizedItem` wrapper (like
`TileGridMemoizedItem`) with a custom comparator that checks `renderVersion`.

---

#### Issue L8 — External selection changes not reflected

**File:** `xmlui/src/components/List/List.tsx`, `ListWithSelection`

**Problem:** The current code always does in-place value update:
```typescript
} else {
  syncAdapterHolderRef.current.value = currentSyncVarValue;
}
```

There is no distinction between own-write and external-write. This means:
- When another component (e.g. "Select All" button) changes the sync variable, the List's
  `ListNative` never sees a new `syncWithAppState` object reference → `useRowSelection`'s
  effect never fires → selection checkboxes don't update.

**Fix:** With the `pendingOwnWriteRef` mechanism (L3), external changes create a new adapter
object, triggering `ListNative` to re-render and `useRowSelection` to pick up the new selection.

---

#### Issue L9 — All items re-render on every click (partial)

**Problem:** `ListNative` is defined with `forwardRef` but **not wrapped in `memo()`**.
Every parent re-render causes a full `ListNative` re-render. Combined with unstable
`itemRenderer` (L5) and unstable `renderChild` (L6), every click triggers:
1. XMLUI reactive cycle → new `renderChild` → new `ListWithSelection` render
2. New `itemRenderer` → new `ListNative` render
3. Inside `Virtualizer`, `rows.map(...)` calls `itemRenderer` for every visible row
4. Each `MemoizedItem` receives new `renderChild` → re-renders

After fixes L5+L6, `MemoizedItem` should skip re-renders when only `renderChild` changed.
Adding `memo()` to `ListNative` (or at least its `forwardRef` wrapper) would further reduce
unnecessary renders.

---

#### Issue L10 — Full XMLUI tree re-render blocks main thread

**Problem:** Same as TileGrid §10. Without `startTransition`, `handler()` blocks the main
thread with a full XMLUI tree re-render. Already addressed by fix L2.

---

### Tree Component

#### Issue T1 — Unstable `itemRenderer` reference

**File:** `xmlui/src/components/Tree/Tree.tsx`, `treeComponentRenderer` customRender (~line 545)

**Problem:** `itemRenderer` is an inline arrow function in the `customRender` body:

```typescript
itemRenderer={(flatTreeNode: any) => {
  const itemContext = { ... };
  return node.props.itemTemplate ? (
    <MemoizedItem
      node={node.props.itemTemplate}
      contextVars={{ $item: itemContext }}
      renderChild={renderChild}
    />
  ) : (
    <MemoizedItem
      node={defaultItemTemplate}
      contextVars={{ $item: itemContext }}
      renderChild={renderChild}
    />
  );
}}
```

This creates a new function reference on every render. Since `TreeComponent` is wrapped in
`memo()`, it would normally skip re-renders — but a new `itemRenderer` defeats the memo.

Additionally, `renderChild` is passed directly to `MemoizedItem`, so even if the `itemRenderer`
were stabilized, every XMLUI reactive cycle would produce a new `renderChild` → all visible
`MemoizedItem` instances re-render.

**Fix:**
1. Store `renderChild` in a ref and create a stable wrapper function.
2. Wrap `itemRenderer` in `useMemo` with deps on `itemTemplate` and the stable renderChild ref.

---

#### Issue T2 — Unstable `renderChild` passed to MemoizedItem

**File:** `xmlui/src/components/Tree/Tree.tsx`

**Problem:** Same as L6. `renderChild` changes every XMLUI reactive cycle. It is passed
directly into `MemoizedItem` inside the `itemRenderer` closure. All visible tree row items
will re-render on every reactive cycle.

**Fix:** Store `renderChild` in a ref. Pass the stable wrapper to `MemoizedItem`.

---

#### Issue T3 — `itemData` object recreated on every state change

**File:** `xmlui/src/components/Tree/TreeNative.tsx` (~line 1420)

**Problem:** The `itemData` object passed to all `TreeRow` components is created via `useMemo`
with many dependencies including `effectiveSelectedId`, `focusedIndex`, and `itemRenderer`.
When the user clicks a tree node:
- `effectiveSelectedId` changes → new `itemData` → all `TreeRow` memo comparisons fail →
  all visible rows re-render.
- `focusedIndex` changes → same cascade.

The `TreeRow` component is `memo()`'d, but its `data` prop is the entire `itemData` object.
Since `itemData` changes on every selection/focus change, the memo is ineffective.

**Impact:** Every node click re-renders ALL visible `TreeRow` components, not just the
previously-selected and newly-selected rows (should be at most 2-3 rows).

**Fix:** Move volatile values (`selectedId`, `focusedIndex`) out of the `itemData` object.
Store them in refs that `TreeRow` reads directly, or pass them as separate props to `TreeRow`
so the memo comparator can do targeted checks. This is analogous to how `TableMemoizedCells`
reads `isSelected` and `rowIndex` from refs rather than props.

---

#### Issue T4 — No `refreshOn` / `renderVersion` (lower priority)

**Problem:** Tree does not have `syncWithVar`, so the stale-closure risk is lower. However,
if `itemRenderer` and `renderChild` are stabilized (T1+T2), any XMLUI reactive state accessed
inside the item template closure could become stale. Since Tree's `itemRenderer` creates
`itemContext` from the `flatTreeNode` (which comes from `itemData.nodes`), and `itemData`
already re-creates on every selection change (T3), this is partially mitigated. But after
fixing T3, a `renderVersion` mechanism may be needed.

**Fix:** Defer until after T1-T3 are implemented. If stale closures appear in testing, add
a `renderVersion` counter similar to TileGrid.

---

## Execution Plan

### Phase 1 — List syncWithVar Fixes (L1-L4, L8, L10)

These are the highest-impact fixes since they affect every selection click in lists
that use `syncWithVar`.

1. **L1+L2+L3+L4+L8:** Rewrite `ListWithSelection`'s syncAdapter to match Table's pattern:
   - `window.__tgSync_*` for O(1) expression
   - `startTransition` wrapper
   - `pendingOwnWriteRef` + `__v` version tracking
   - Own-write → in-place update; external → new object

**Files:** `xmlui/src/components/List/List.tsx`

### Phase 2 — List Render Stability (L5, L6, L7, L9)

2. **L6:** Store `renderChild` and `layoutContext` in refs. Create `stableRenderChildFnRef`.
3. **L5:** Wrap `itemRenderer`, `sectionRenderer`, `sectionFooterRenderer` in `useMemo`.
4. **L7:** Add `refreshOn` prop to List metadata. Implement `renderVersion` counter.
   Create `ListMemoizedItem` with custom comparator.
5. **L9:** Consider wrapping `ListNative` in `memo()`.

**Files:** `xmlui/src/components/List/List.tsx`, `xmlui/src/components/List/ListNative.tsx`

### Phase 3 — Tree Render Stability (T1, T2, T3)

6. **T2:** Store `renderChild` in a ref in `treeComponentRenderer.customRender`. Create stable wrapper.
7. **T1:** Wrap `itemRenderer` in `useMemo`, passing stable renderChild ref.
8. **T3:** Refactor `itemData` — move `selectedId` and `focusedIndex` to refs. Update `TreeRow`
   to read from refs or receive them as separate memoizable props.

**Files:** `xmlui/src/components/Tree/Tree.tsx`, `xmlui/src/components/Tree/TreeNative.tsx`

### Phase 4 — Validation

9. Add `console.count` telemetry to `ListNative` render, `MemoizedItem` render inside List,
   `TreeRow` render — measure before/after.
10. Run E2E tests to verify no regressions.

---

## Expected Impact

| Component | Metric | Before (estimated) | After (expected) |
|-----------|--------|--------------------|--------------------|
| **List** (syncWithVar) | renders per click | All visible items | 1-2 items |
| **List** (syncWithVar) | sync expression cost | O(n) per click, O(n²) total | O(1) |
| **List** (syncWithVar) | main thread blocking | ~200ms (XMLUI re-render) | Deferred via startTransition |
| **List** (no sync) | renders per click | All visible items | All (no change until L5-L7) |
| **Tree** | renders per click | All visible rows | 2-3 rows (old + new selection) |

---

## Key Files

| File | Changes |
|------|---------|
| `xmlui/src/components/List/List.tsx` | Phases 1 + 2 |
| `xmlui/src/components/List/ListNative.tsx` | Phase 2 (memo wrapper) |
| `xmlui/src/components/Tree/Tree.tsx` | Phase 3 (stable renderChild + itemRenderer) |
| `xmlui/src/components/Tree/TreeNative.tsx` | Phase 3 (itemData refactor) |

# Table Performance Optimization Plan

> **Branch:** `yurii/table-tilegrid-optimization-new`
> **Status:** ✅ Optimization & Cleanup Completed (April 7, 2026)
> **Reference:** TileGrid optimizations in `perf-investigation.md`

---

## Problem Statement

The `Table` component exhibited significant click latency (~220ms per row click, sometimes up to ~1 second) in large datasets. Root causes mirrored those already solved in `TileGrid`.

---

## Original State & Audit (Prior to Fixes)

### Documented Findings (Initial Audit)
- **Leaky `memo` in `TableWithColumns`:** By adding a `whyDidYouRender` hook to `TableWithColumns`, we discovered that its `memo` wrapper was fundamentally broken. It re-rendered on every XMLUI reactive cycle because context props changed their references on every engine update. 
- **Synchronous XMLUI re-render.** `handler()` in `syncAdapter.update` ran synchronously, blocking the main thread with a full XMLUI tree re-render (~220 ms).

### What already works

| Area | Status | Details |
|------|--------|---------|
| **O(1) sync expression** | Done | `Table.tsx:672` uses `window.__tgSync_*` pattern (same as TileGrid) |
| **`useRowSelection` refactored** | Done | `syncStateRef` as `useRef`, `scheduleSyncReset` via `requestAnimationFrame` |
| **`VirtualTableRow` stable identity** | Done | `TableNative.tsx:1259` creates row component once via `useMemo(…, [])`, reads state from `rowStateRef` |
| **`ViewWrapper` height constraint** | Done | `ViewWrapper.xmlui` has `height="100%"` on `VStack` |
| **Virtua virtualizer** | Present | `TableNative.tsx:1796` uses `<Virtualizer as="tbody" scrollRef={wrapperRef}>` |

### What is missing

| Area | Gap | TileGrid Equivalent |
|------|-----|---------------------|
| **`MobileTableWrapper` height constraint** | Not verified. May lack `height="100%"`. | §5 |

---

## Refactoring Plan (Historical Phase Tracking)

### Phase 0 — Telemetry (measure before fixing) (COMPLETED)
1. Add `console.count("[Table] TableWithColumns render")` at top of `TableWithColumns` render.
2. Add `console.count("[TableNative] render")` inside `TableNativeComponent`.
3. Add `console.count("[VirtualTableRow] render")` inside `VirtualTableRow`.
4. Add `performance.mark` / `performance.measure` around `rows.map(…)` in `Virtualizer` body.
5. Add timing to `syncAdapter.update`.
6. Run app, click a row, record baseline.

### Phase 1 — Own-Write Suppression (`pendingOwnWriteRef`) (COMPLETED)
Implemented to prevent `<Table>` from re-rendering due to its own click via `syncAdapter`.

### Phase 2 — `startTransition` for sync writes (COMPLETED)
`startTransition` was added around `handler?.()` call to make XMLUI tree re-render (global variable change) non-blocking.

### Phase 3 — Stable `renderChild` + `refreshOn` (COMPLETED)
Implemented `stableRenderChildFnRef` and `refreshOn` logic. Column/cell renderers only re-create when `refreshOn` changes.

### Phase 4 — `MobileTableWrapper` height check (COMPLETED)
Verified `MobileTableWrapper` has `<VStack height="100%" minHeight="0">` like `ViewWrapper`.

### Phase 5 — Validate & measure again (COMPLETED)
- `[VirtualTableRow]` renders verified.
- `render+commit` targets tracked and optimized.

---

## What Was Achieved & Detailed Fixes (April 2026)

### 1. `TableWithColumns` and `syncWithVar` stability ✅ FIXED

**The Fix:** We implemented a stable `syncAdapter` using `useRef` directly inside `Table.tsx`. By embedding a monotonically increasing version number (`__v`) into the stored sync variable object, we reliably detect "own writes" in $O(1)$ time. 
- **Result:** `isOwnWrite` reliably returns `true`. The `TableNative` component's `props` remain strictly equal.

### 2. `isOwnWrite` detection logic ✅ FIXED

**The Logic:**
```typescript
const isOwnWrite = pendingOwnWrite || 
  (pendingOwnWriteVersionRef.current > 0 && 
   currentSyncVarValue?.__v === pendingOwnWriteVersionRef.current);
```
Reliable even when XMLUI does not preserve inner array references across state evaluations.

### 3. Column re-registration loop (cellRenderer identity) ✅ FIXED

**File**: `xmlui/src/components/Column/ColumnReact.tsx`

**Problem**: `cellRenderer` was a `useCallback` with dependencies `[nodeChildren, renderChild]`. XMLUI recreates `renderChild` on every reactive cycle → `cellRenderer` changed → `registerColumn` fired → `columns` array changed → TanStack Table reset `columnSizing` → **all visible VirtualTableRow components re-rendered on every click**.

**The Fix:** Store `renderChild`, `nodeChildren`, and `cellLayoutContext` in refs. Create `cellRenderer` with `useCallback([], [])` (empty deps) so its reference never changes. Also added `JSON.stringify(columnMetadata)` to the `registerColumn` deps.

### 4. `columns` array identity stability ✅ FIXED

**File**: `xmlui/src/components/Table/Table.tsx`

**Problem**: `useMemo()` returned a new array whenever `columnsByIds` reference changed — even if column data was identical. TanStack Table treated the new array as "columns changed" → reset `columnSizing` state.

**The Fix:** Manual shallow compare of cached columns before returning a new array in `Table.tsx`. Only creates a new array when column IDs change or a column object reference actually differs.

### 5. `TableMemoizedCells` and `VirtualTableRow` ✅ FIXED

**File**: `xmlui/src/components/Table/TableNative.tsx`

**Problem**: Original code rendered cells inline inside `<Fragment>` for each row. When any table state changed, ALL cells re-rendered.

**The Fix:** Created `TableMemoizedCells` with a custom comparator. Cell state is read via `rowsRef.current` and `cellRenderStateRef.current` to avoid dependency on volatile values. Only `isSelected`, `rowIndex`, and `renderVersion` trigger re-renders.

### 6. `refreshOn` prop for Table ✅ FIXED

**File**: `xmlui/src/components/Table/Table.tsx`
**The Fix:** The `renderVersion` counter increments only when `refreshOn` value changes.

### 7. `pendingOwnWrite` + `startTransition` for Table sync ✅ FIXED

**File**: `xmlui/src/components/Table/Table.tsx`
**The Fix:** Prevents the sync-back cycle from creating a new `syncAdapter` object, and wraps `handler()` in `startTransition` to defer the XMLUI tree re-render.

---

## Code Reviews & Simplification (Cleanup Phase) ✅ COMPLETED

### Original Code Review Concerns
1. **`columns` manual shallow-compare HACK** ⚠️: Was a 30-line `prevDeps` hack. *Resolved:* Updated the `registerColumn`/`unRegisterColumn` setters to perform shallow comparisons *before* modifying state.
2. **`TableMemoizedCells` complexity** ⚠️: ~80 lines of complex ref-reading code. Initially flagged for testing removal.

### Simplification Achieved (What was removed)
The following over-engineered parts were removed to keep the codebase maintainable:
- **Legacy `syncWithAppState` complex caching**: Removed in favor of direct prop passing.
- **`hasContextMenu` caching**: Now using direct `!!node.events?.contextMenu` check.
- **`stableHandlers` wrapper**: Intricate `useRef` object was replaced with clean `useEvent` hooks.
- **`stableRenderChildFnRef`**: Replaced with direct `renderChild` call since stability is handled safely downstream.
- **`noDataRenderer` memoization**: Simple arrow function is efficient enough without `useMemo`.

---

## Current Table Performance Profile (per click)

| Metric | Value | Notes |
|--------|-------|-------|
| `render+commit` time | ~10ms | Very fast, well below the 16ms frame budget |
| VirtualTableRow renders | 38 (~19 × 2) | Two React cycles (click + sync-back) |
| TableMemoizedCells renders | 1–2 | Only rows with changed `isSelected` |
| Click handler time | ~167ms | Dominated by XMLUI reactive cycle + `rowDisabledPredicate` eval |

**Remaining bottleneck**: The second render cycle (sync-back via XMLUI reactive evaluation) still causes ~19 lightweight `<tr>` re-renders. The `rowDisabledPredicate` evaluates an XMLUI expression for each visible row, adding ~3–4ms per row across both cycles.

---

## Debug Logs

| File | What it logs |
|------|-------------|
| `Table.tsx` | `[TableWithColumns] isOwnWrite check` |
| `Table.tsx:764–775` | `performance.mark table:sync-*` — table sync timing |
| `TableNative.tsx` | `[TableNative] render+commit` |
| `TableNative.tsx:1323` | `[TableMemoizedCells] render` — cell render counter |
| `TableNative.tsx:1385` | `[VirtualTableRow] render` — row wrapper render counter |
| `ColumnNative.tsx:23,65` | `[Column] render` / `registerColumn` — column lifecycle |

---

## Future Investigations & Next Steps

- **Port `__v` to `TileGrid.tsx`**: While `Table` handles concurrent own-writes flawlessly via `__v`, `TileGrid` still uses a boolean mechanism which occasionally drops own-writes. This is the immediate next action.
- **`Ctrl+Click` and `Shift+Click` lag**: Individual clicks in selection mode and "Select All" operate extremely fast (~5ms), but selecting items while holding `Ctrl` or `Shift` is still very slow (~167ms). Likely due to XMLUI reactive cycle and `rowDisabledPredicate` evaluation for all visible rows.
- **Second Table render cycle**: The sync-back XMLUI reactive cycle causes a second full VirtualTableRow pass (~19 `<tr>` re-renders). Could be eliminated by stabilizing `data`/`classes` props to `TableNative` via refs.
- **`rowDisabledPredicate` per-row XMLUI expression cost**: Each VirtualTableRow render calls `lookupSyncCallback(predicate)(item)`, evaluating an XMLUI expression. With 38 calls per click, this contributes significantly to the 167ms total.
- **`debugPrevRef` block**: Dead debugging code in `TableNative.tsx`. Should be removed.
- **`stableSetColumnSizing`**: Defensive shallow-compare wrapper for `setColumnSizing`. Can be simplified back to plain `setColumnSizing`.

---

## Original Session Summary (For Reference)

```
## Context: Table Performance Optimization (like TileGrid)

Branch: yurii/table-tilegrid-optimization
Docs: myworkdriveclient/docs/table-perf-plan.md (full plan)
Reference: myworkdriveclient/docs/perf-investigation.md (TileGrid §1–§11)

### What's Done
- TileGrid fully optimized: ~5ms per click (§1–§11 in perf-investigation.md)
- Table.tsx already has: O(1) sync expression, useRowSelection with useRef, VirtualTableRow stable via useMemo(…,[]), ViewWrapper height="100%"

### What's Missing in Table.tsx
1. No `pendingOwnWriteRef` — own clicks create new syncAdapter object → memo bust → full re-render
2. No `startTransition` — handler() blocks main thread ~220ms for XMLUI tree re-render
3. No `stableRenderChildFnRef` — renderChild is new ref each cycle → columns/cells recreated
4. No `refreshOn` / `renderVersion` — no way to skip unnecessary XMLUI reactive cycles
5. No telemetry — no console.count or performance.mark in Table pipeline
6. MobileTableWrapper height not verified

### Execution Order
Phase 0: Add telemetry → measure baseline
Phase 1: pendingOwnWriteRef (own-write suppression)
Phase 2: startTransition (defer XMLUI tree re-render)
Phase 3: stableRenderChildFnRef + refreshOn + renderVersion
Phase 4: MobileTableWrapper height check
Phase 5: Validate + measure results

### Key Files
- xmlui/src/components/Table/Table.tsx (~850 lines)
- xmlui/src/components/Table/TableNative.tsx (~1975 lines)
- xmlui/src/components/Table/useRowSelection.tsx
- myworkdriveclient/src/components/pages/FilesPage/FilesTableView.xmlui
- myworkdriveclient/src/components/shared/ViewWrapper.xmlui
```
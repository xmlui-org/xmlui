# TileGrid Performance Investigation

## Symptoms (original)

- **Ctrl+Click accumulation lag**: In "Selected" mode, Ctrl+clicking tiles becomes progressively slower
  with each additional selected item.
- **400ms per-click baseline**: Even a single click on a tile produced browser Violation warnings
  (`blur: 400ms`, `focus: 400ms`, `click: 400ms`) from `chunk-FOST5MTV.js`. Happened in BOTH
  select mode and non-select mode.

---

## Root Causes Found and Fixed

### 1. O(n²) expression compilation in `syncWithVar` ✅ FIXED

**File**: `xmlui/src/components/TileGrid/TileGrid.tsx` (also `Table.tsx`)

**Problem**: `syncAdapter.update` embedded the full selected-IDs array as JSON inside the XMLUI
expression string on every click. Because `ephemeral: true` disables the expression cache, the
string was parsed from scratch each time. With N selected items the string grew by one ID per
click → O(n²) total parse cost.

**Fix**: Data passed through a `window` variable; expression string stays constant `O(1)`:
```typescript
const windowKey = `__tgSync_${syncVarName}`;
(window as any)[windowKey] = selectedIds;
handler = lookupActionRef.current(`{${syncVarName} = {selectedIds: window.${windowKey}}}`, { ephemeral: true });
```

---

### 2. Unstable `itemRenderer` reference ✅ FIXED

**File**: `xmlui/src/components/TileGrid/TileGrid.tsx`

**Problem**: `itemRenderer` was an inline arrow function recreated on every render of
`TileGridWithSync`, defeating `TileGridNative`'s `memo()`.

**Fix**: Wrapped in `useMemo` with deps `[itemTemplate, idKey]`.

---

### 3. `MemoizedItem` comparator — refined approach ✅ FIXED (see §9 for history)

**File**: `xmlui/src/components/container-helpers.tsx`

**Final state**: Custom `memo` comparator that shallow-compares `contextVars` values **and**
checks a `renderVersion` prop. See §9 for the full evolution.

---

### 4. Extra render cycles from `syncState` as `useState` ✅ FIXED

**File**: `xmlui/src/components/Table/useRowSelection.tsx`

**Problem**: `syncState` was a `useState`, causing 2 extra React render cycles per click.

**Fix**: Converted to `useRef` + `requestAnimationFrame`-based reset (`scheduleSyncReset`).

---

### 5. Virtualizer rendering ALL tiles (no effective virtualization) ✅ FIXED

**Root cause**: `ViewWrapper`'s `VStack` had no `height` constraint → TileGrid's div expanded
to full content height → Virtualizer saw all rows as "visible" → mounted all 521 tiles on first
interaction → **403ms blocking on first click**.

**Discovery method**: `console.count("[MemoizedItem] render")` showed 521 sequential renders
(counter 1–521) before the 403ms `render+commit`. No comparator "skip" logs → initial mounts
(not re-renders). Per-tile cost: 403ms / 521 = ~0.77ms/tile.

**Fix** (`myworkdriveclient/src/components/shared/ViewWrapper.xmlui`):
```xml
<VStack marginLeft="$space-5" marginRight="$space-4" height="100%">
```

With `height="100%"`, the VStack is constrained to the parent Stack's height. TileGrid's div
gets a fixed height. Virtualizer now only renders visible tiles (~12–22 at a time) instead of
all 521. Initial mount: ~12 tiles × 0.77ms ≈ **9ms** instead of 403ms.

---

### 6. `renderChild` is a new function reference on every XMLUI render cycle ✅ FIXED

**File**: `xmlui/src/components/TileGrid/TileGrid.tsx`

**Problem**: `renderChild` is recreated by the XMLUI runtime on every reactive update (any global
variable change — selection, focus, etc.). `TileGridWithSync` stored it in a ref
(`renderChildRef.current`) but passed the current value at call time to each `MemoizedItem`.
The comparator saw `prev.renderChild !== next.renderChild` for every visible tile → all
re-rendered.

**Fix**: A **stable wrapper function** created once (`stableRenderChildFnRef.current`), never
reassigned, that internally delegates to `renderChildRef.current`:
```typescript
const stableRenderChildFnRef = useRef<typeof renderChild>(
  (node: any, ctx: any) => renderChildRef.current(node, ctx),
);
// Pass stableRenderChildFnRef.current (stable reference) to MemoizedItem — not renderChildRef.current
```

The comparator now sees the same reference every render → passes → tiles only re-render
when their `renderVersion` or `contextVars` actually change.

---

### 7. `selectMode` stale in tile closures after memo optimization ✅ FIXED

**Problem (regression from §3/§6)**: `MemoizedItem`'s custom comparator correctly skipped
re-renders when only `renderChild` changed. But XMLUI compiles event-handler closures during
each React render of a tile. When `selectMode` flipped to `true` and the tile was NOT re-rendered
(comparator blocked it), the closure inside the tile held the stale `selectMode = false` value.

**Symptom**: `handleFilesItemClick` console-logged `selectMode: false` while the UI showed
checkboxes (visual selectMode=true). Clicking a folder tile could navigate (instead of select)
because the old closure value was used.

**Root cause detail**: XMLUI's reactive system signals re-renders by creating a new `renderChild`
function on each reactive cycle. By making `renderChild` stable and blocking re-renders through
the custom comparator, we also blocked XMLUI's mechanism for propagating reactive state changes
into tile interiors.

**Fix**: Added a `renderVersion` counter in `TileGridWithSync` that increments on every XMLUI
reactive cycle (every `renderChild` change). This counter is passed to each `MemoizedItem` via a
`renderVersion` prop. The comparator fails when `renderVersion` changes → tiles re-render and
pick up the latest reactive state.

---

### 8. External selection changes (select-all) not reflected in tile checkboxes ✅ FIXED

**File**: `xmlui/src/components/TileGrid/TileGrid.tsx`

**Problem**: `syncAdapterHolderRef.current.value` was mutated in-place when `catalogSelection`
changed externally. `TileGridNative` (wrapped in `memo()`) received the same object reference
for `syncWithAppState` → its `memo()` passed → it did NOT re-render → `useRowSelection`'s
`appStateSelection` value was never re-evaluated → the `useEffect` that syncs external selection
into internal state never fired → tile checkboxes stayed unchecked.

**Root cause**: Previously, `stableItemRenderer` did not exist — `itemRenderer` was a new
function on every `TileGridWithSync` render, forcing `TileGridNative` to always re-render and
accidentally refreshing `appStateSelection`. With `stableItemRenderer`, `TileGridNative` only
re-renders when its props actually change.

**Fix**: Create a new `syncAdapter` object (new reference) when `currentValue` changes, so
`TileGridNative.memo()` detects the prop change and re-renders:
```typescript
} else if (currentValue !== syncAdapterHolderRef.current.value) {
  syncAdapterHolderRef.current = {
    value: currentValue,
    update: syncAdapterHolderRef.current.update,  // stable — keep same fn
  };
}
```

---

### 9. All tiles re-render on every click ✅ FIXED

**Problem**: Every tile click caused **all visible tiles** to re-render (~80ms for 24 tiles).

**Root cause — two-phase analysis**:

**Phase A (§8 regression):** `syncAdapter.update` writes `catalogSelection` → XMLUI reactive cycle
→ new `syncAdapter` object → `TileGridNative.memo()` fails → second full re-render of all tiles.

**Phase B (discovered during §9):** XMLUI fires an additional reactive cycle on **every click
event** (focus tracking, event processing). This cycle happens *before* `syncAdapter.update`
even runs — so even with own-write suppression, all tiles still re-rendered on every click:
```
[TileGrid] renderVersion++ → 4 (external XMLUI cycle)  ← triggered by click itself
[TileGridMemoizedItem] render: 1–24                     ← all 24 visible tiles
[TileGridNative] render+commit: 83.8ms
[TileGridMemoizedItem] render: 25                       ← only 1 tile (own-write suppressed ✓)
[TileGridNative] render+commit: 2.6ms
```

The initial approach (incrementing `renderVersion` on any `renderChild` reference change) was
too broad — it incremented on every XMLUI reactive cycle including benign click/focus events.

---

**Fix** (`TileGrid.tsx` + `FilesIconView.xmlui`):

#### `TileGrid.tsx` — `TileGridMemoizedItem` + `refreshOn` prop + suppress own-write

`MemoizedItem` in `container-helpers.tsx` is shared by ~20 framework components; adding a
custom comparator there would risk stale-closure bugs in all of them. Instead, a
`TileGridMemoizedItem` wrapper with its own comparator is defined locally in `TileGrid.tsx`:

```typescript
const TileGridMemoizedItem = memo(
  ({ node, renderChild, layoutContext, contextVars }: TileGridItemProps) => (
    <MemoizedItem node={node} renderChild={renderChild}
                  layoutContext={layoutContext} contextVars={contextVars} />
  ),
  (prev, next) => {
    if (prev.renderVersion !== next.renderVersion) return false;
    if (prev.node !== next.node) return false;
    // renderChild and layoutContext are stable refs — no need to compare
    // shallow compare contextVars values ($item, $selected, etc.)...
  },
);
```

`renderVersion` only increments when the **`refreshOn` prop changes value** — not on every
XMLUI reactive cycle. The app binds this prop to the specific global variable whose change
should invalidate tile closures (e.g. `selectMode`):

```typescript
// In TileGridWithSync render:
const refreshOn = extractValue(node.props.refreshOn);
const shouldForceRefresh = node.props.refreshOn === undefined || prevRefreshOnRef.current !== refreshOn;
if (shouldForceRefresh) {
  prevRefreshOnRef.current = refreshOn;
  renderVersionRef.current++;
  // Also replace syncAdapter so TileGridNative.memo() fails → tiles re-render immediately.
  if (syncAdapterHolderRef.current) {
    syncAdapterHolderRef.current = { ...syncAdapterHolderRef.current };
  }
}
```

Own-write suppression (§8 mechanism, simplified — no `isOwnWriteCycleRef` needed):

```typescript
// In syncAdapter.update, before handler():
pendingOwnWriteRef.current = true;

// At top of each TileGridWithSync render:
const pendingOwnWrite = pendingOwnWriteRef.current;
pendingOwnWriteRef.current = false;  // consume immediately

// In syncAdapter value check:
} else if (currentValue !== syncAdapterHolderRef.current.value) {
  if (pendingOwnWrite) {
    syncAdapterHolderRef.current.value = currentValue;  // in-place, TileGridNative not notified
  } else {
    syncAdapterHolderRef.current = { value: currentValue, update: ... };  // new object
  }
}
```

#### `myworkdriveclient/src/components/pages/FilesPage/FilesIconView.xmlui`

```xml
<TileGrid
  syncWithVar="catalogSelection"
  refreshOn="{selectMode}"
  ...
```

**Result per action:**

| Action | Before §9 | After §9 |
|--------|-----------|----------|
| Tile click in select mode | all tiles / ~80ms | 1 tile / ~5ms |
| `selectMode` change | all tiles / ~80ms | all tiles / ~80ms (correct, closures must refresh) |
| select-all | all tiles (via `$selected` change) | all tiles (unchanged) |

---

---

### 10. XMLUI full-tree re-render on every global variable change ✅ FIXED

**Symptom**: Browser Violations persisted — `click: 229ms`, `focus: 221ms` — even after §9 brought
TileGrid's own `render+commit` to ~6ms. The violation source was `chunk-FOST5MTV.js:18643`,
which is React's `scheduleMicrotask` inside `ensureRootIsScheduled` — the React scheduler itself.

**Root cause**:

`syncAdapter.update` → `handler()` sets `catalogSelection` via XMLUI's expression engine →
`useGlobalVariables` (global-variables.ts) detects `componentStateWithApis` changed →
`globalDepValueMap` changes → `currentGlobalVars` is re-evaluated (ALL 16 globals in Globals.xs) →
`stableCurrentGlobalVars` gets a new object reference → propagates as `globalVars` prop to
**every `ComponentWrapper` in the tree** → `ComponentWrapper.memo()` sees new `globalVars` →
entire XMLUI tree re-renders.

`handler()` runs inside a `useEffect` (sync effect in useRowSelection). React 18 batches state
updates from effects and flushes them at the next DOM event. So the 220ms blocking appeared as a
`focus` violation on the *next* click, not the current `click` violation:

```
[Violation] 'focus' handler took 221ms     ← previous click's XMLUI tree re-render, flushed here
[TileGridMemoizedItem] render: 1           ← current click's TileGrid render (fast)
[TileGridNative] render+commit: 6.0ms
[TileGrid] syncAdapter.update | execute: 1.9ms
[Violation] 'click' handler took 229ms     ← current click's XMLUI tree re-render
```

**Fix** (`TileGrid.tsx`): Wrap `handler()` in `startTransition()`:

```typescript
import { memo, useMemo, useRef, startTransition } from "react";

// In syncAdapter.update:
pendingOwnWriteRef.current = true;
startTransition(() => { handler?.(); });
```

`startTransition` marks the XMLUI tree re-render as non-urgent (concurrent). React yields to
the browser between chunks of work instead of blocking. The tile checkbox updates immediately
(from `useRowSelection`'s own state), while the PageToolbar / ChangeListeners / rest of the tree
update in a deferred, interruptible pass — no main-thread blocking, no violations.

---

### 11. Double render on file click in navigation mode ✅ FIXED

**File**: `myworkdriveclient/src/components/shared/IconTile.xmlui`

**Problem**: In navigation mode, clicking a file tile triggered two full `syncAdapter.update`
cycles:
1. `handleFilesItemClick` called `gridRef.clearSelection()` → `syncAdapter.update` with `ids: 0`
2. Then called `gridRef.selectId(item.id)` → `syncAdapter.update` with `ids: 1`

Each cycle produced a full `render+commit` (~4–5ms each) plus two `sync effect` calls.
Log evidence:
```
[TileGridMemoizedItem] render: 1
[TileGridNative] render+commit: 4.5ms
[TileGrid] syncAdapter.update | ids: 0      ← clearSelection()
[TileGrid] sync effect | ids: 0
[TileGridMemoizedItem] render: 2
[TileGridNative] render+commit: 4.2ms
[TileGrid] syncAdapter.update | ids: 1      ← selectId()
[TileGrid] sync effect | ids: 1
```

**Root cause**: For folders, `emitEvent('tileClick')` was the right path (navigate, no selection).
For files (non-folders), the click still went through `onTileClick` / `handleFilesItemClick`
which called `clearSelection` + `selectId` as two separate operations instead of letting
TileGrid handle it as a single toggle.

**Fix**: In `IconTile.xmlui`, extend `bubbleEvents` and suppress `onClick` for non-folder items,
same as in `selectMode`:

```xml
<!-- Before -->
bubbleEvents="{selectMode ? ['click'] : []}"
onClick="{selectMode ? undefined : emitEvent('tileClick')}"

<!-- After -->
bubbleEvents="{selectMode || !$props.item.isFolder ? ['click'] : []}"
onClick="{selectMode || !$props.item.isFolder ? undefined : emitEvent('tileClick')}"
```

File clicks now bubble to TileGrid's native click handler (single `setSelectedRowIds` call
→ one `syncAdapter.update` → one `render+commit`). Folder clicks still emit `tileClick`
→ `handleFilesItemClick` → `Actions.navigate()` (unchanged).

---

## Measured Results (before all fixes → after §1–§11)

| Metric | Before | After §1–§11 |
|--------|--------|--------------|
| `render+commit` per tile click | 403ms | ~5ms |
| MemoizedItem renders per click | 521 (all tiles) | 1 (only clicked tile) |
| Browser Violations | `focus: 400ms`, `click: 400ms` | eliminated |
| Ctrl+click accumulation | O(n²) — grows with N selected | O(1) — constant |
| Select-all checkbox sync | broken | working (§8) |
| selectMode click behaviour | broken after §6 | working (§7) |
| XMLUI tree re-render per click | ~220ms blocking | deferred (§10) |
| File click render cycles | 2 × 4.5ms = 9ms | 1 × 5ms (§11) |

---

---

## Debug Logs

| File | What it logs |
|------|-------------|
| `TileGrid.tsx` | `[TileGridMemoizedItem] render` — tile render counter |
| `TileGrid.tsx` | `[TileGrid] renderVersion++` — refreshOn change detection |
| `TileGrid.tsx` | `[TileGrid] syncAdapter.update` — compile + execute time + `performance.mark tg:*` |
| `TileGridNative.tsx:189` | `[TileGridNative] render+commit` — React render + DOM commit time |
| `TileGridNative.tsx:485,532` | `[TileGrid] click→toggleRow` / `rows.map()` timing |
| `useRowSelection.tsx:310` | `[TileGrid] sync effect` — sync update call time |

---

## TODO: Compare and Rationalize Optimizations (`Table` vs `TileGrid`)

1. **`__v` Versioning (Porting `Table` fix to `TileGrid`)**: 
   `Table.tsx` uses a highly reliable `__v` version tracking mechanism injected into the synced array: `(window as any)[windowKey] = { selectedIds, __v: thisVersion }`. This absolutely guarantees own-write suppression during `startTransition` and concurrent renders, fixing the "dropping own-writes" issue reliably. `TileGrid.tsx`, however, currently still relies strictly on a naive boolean: `pendingOwnWriteRef.current = true; startTransition(...)` which causes lag and rendering artifacts when clicks happen too fast.
   - **Action**: We must port the `__v` mechanism from `Table.tsx` to `TileGrid.tsx` next to fix the remaining latency and own-write dropping bugs in `TileGrid`.


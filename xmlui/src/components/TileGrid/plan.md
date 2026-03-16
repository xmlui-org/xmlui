# TileGrid Component — Implementation Plan

## Overview

A new core XMLUI component that renders a data array as a responsive, virtualized tile grid with built-in selection. Fills the gap between `List` (virtualized, single-column) and `Items` (non-virtualized, any layout). Uses `virtua` (already a dependency) for row-level virtualization and `ResizeObserver` for responsive column calculation.

### Key Features
- Responsive column count: `cols = floor((containerWidth + gap) / (itemWidth + gap))`
- Row-level virtualization via `virtua` (same engine as `List`)
- Built-in selection (mirrors Table's `useRowSelection`)
- Keyboard shortcuts (cut/copy/paste/delete/selectAll via `useTableKeyboardActions`)
- Selection checkboxes per tile with configurable position (`topStart`, `topEnd`, `bottomStart`, `bottomEnd`)
- Template context variables: `$item`, `$itemIndex`, `$isFirst`, `$isLast`, `$selected`
- AppState synchronization via `syncWithAppState`
- Theme variables for tile backgrounds, hover, selected states, border radius

---

## ✅ Step 1 — Scaffold: Metadata + Renderer Stub + Empty Native Component

**Goal**: Get the component folder created, metadata defined, renderer stubbed, and the project compiling with a minimal no-op native component.

**Files to create:**
- `TileGrid.tsx` — metadata (`createMetadata`) with all props, events, APIs, context vars, theme vars; renderer stub via `createComponentRenderer`
- `TileGridNative.tsx` — `forwardRef` component with typed `Props`, `defaultProps`, renders a simple `<div>` placeholder
- `TileGrid.module.scss` — SCSS module with theme variables for tile backgrounds, hover/selected states, border radius

**Files to modify:**
- `ComponentProvider.tsx` — register `tileGridComponentRenderer`

**Props (metadata):**

| Prop | Type | Description |
|---|---|---|
| `data` | `array` | Data array to render |
| `itemWidth` | `string` | Fixed tile width (e.g. `"120px"`) |
| `itemHeight` | `string` | Fixed tile height (e.g. `"140px"`) |
| `gap` | `string` | Gap between tiles (e.g. `"12px"`) |
| `loading` | `boolean` | Shows placeholder/loading state |
| `itemsSelectable` | `boolean` | Enables selection mode |
| `enableMultiSelection` | `boolean` | Multi-select (default `true`) |
| `syncWithAppState` | `any` | AppState ref for selectedIds sync |
| `checkboxPosition` | `string` | Position of selection checkbox: `"topStart"` \| `"topEnd"` \| `"bottomStart"` \| `"bottomEnd"` (default: `"topStart"`) |
| `idKey` | `string` | Property name to use as unique ID (default: `"id"`) |

**Events (metadata):**

| Event | Parameters |
|---|---|
| `selectionDidChange` | `(selectedItems)` |
| `itemDoubleClick` | `(item)` |
| `cutAction` | `(item, selectedItems, selectedIds)` |
| `copyAction` | `(item, selectedItems, selectedIds)` |
| `pasteAction` | `(item, selectedItems, selectedIds)` |
| `deleteAction` | `(item, selectedItems, selectedIds)` |
| `selectAllAction` | `(selectedItems, selectedIds)` |

**Context variables:**
- `$item`, `$itemIndex`, `$isFirst`, `$isLast`, `$selected`

**Theme variables:**
- `backgroundColor-TileGrid-item`
- `backgroundColor-TileGrid-item--hover`
- `backgroundColor-TileGrid-item--selected`
- `backgroundColor-TileGrid-item--selected-hover`
- `borderRadius-TileGrid-item`

**Verify**: Project compiles, no TypeScript/lint errors.

**E2E test**: Basic rendering test — component mounts with data and renders tiles.

---

## ✅ Step 2 — Grid Layout with ResizeObserver + Column Calculation

**Goal**: Implement responsive column calculation and render items in a static (non-virtualized) CSS grid.

**Implementation in `TileGridNative.tsx`:**
1. Use the codebase's `useResizeObserver` hook (from `components-core/utils/hooks.tsx`) to measure the container width
2. Compute `cols = Math.max(1, Math.floor((containerWidth + gapPx) / (itemWidthPx + gapPx)))`
3. Slice `data` into rows of `cols` items each
4. Render each row as a `<div>` with `display: flex` and `gap`
5. Each tile is a fixed-size wrapper around the rendered template (via `MemoizedItem` + `renderChild`)
6. Pass `$item`, `$itemIndex`, `$isFirst`, `$isLast`, `$selected` (always `false` for now) as context variables

**Verify**: Tiles render in a responsive grid; resizing the container changes column count.

**E2E tests**:
- Tiles render with correct count
- Template context variables (`$item`, `$itemIndex`) are accessible

---

## ✅ Step 3 — Virtualization with `virtua`

**Goal**: Replace the static grid with row-level virtualization using `virtua`'s `Virtualizer`.

**Implementation:**
1. Wrap the row list in a scrollable container with explicit height handling (follow `ListNative` pattern)
2. Use `Virtualizer` from `virtua` — each virtual item is one row of tiles
3. Row height = `itemHeight` (fixed), enabling O(1) scroll position calculation
4. Only visible rows are in the DOM
5. Handle `useHasExplicitHeight` for determining scroll behavior (like List)

**Verify**: Large datasets render smoothly; DOM only contains visible rows.

**E2E tests**:
- Large dataset (e.g. 1000 items) renders without visible lag
- Scrolling reveals more tiles

---

## ✅ Step 4 — Selection Logic

## ✅ Step 5 — Selection Checkbox UI

## ✅ Step 6 — Keyboard Shortcuts

**Goal**: Wire keyboard actions for cut/copy/paste/delete/selectAll.

**Implementation:**
1. Adapt keyboard action handling similar to `useTableKeyboardActions` in Table
2. Component wrapper div is focusable (`tabIndex={0}`)
3. Wire: Ctrl/Cmd+A (selectAll), Ctrl/Cmd+X (cut), Ctrl/Cmd+C (copy), Ctrl/Cmd+V (paste), Delete (delete)
4. Each action calls its corresponding event handler with `(focusedItem, selectedItems, selectedIds)`
5. Handle `onItemDoubleClick` on tile double-click

**Verify**: Keyboard shortcuts trigger the correct events.

**E2E tests**:
- Ctrl+A selects all tiles
- Delete key fires deleteAction
- Double-click fires itemDoubleClick

---

## ✅ Step 7 — syncWithVar + Loading Placeholder

**Goal**: Implement `syncWithVar` (same pattern as Table) and a loading placeholder.

**Implementation:**
1. Replace `syncWithAppState` with `syncWithVar` in metadata (string: variable name)
2. Build a `syncWithAppState`-compatible adapter in the renderer (like Table's `TableWithColumns`)
3. Pass `lookupAction` down to `TileGridNative` to enable the adapter
4. Loading state: when `loading` is true, render shimmer/placeholder tiles

---

## 🔄 Step 8 — Changeset

**Goal**: Add a changeset for the new component.

Create `.changeset/add-tilegrid-component.md`:
```
---
"xmlui": patch
---

Add TileGrid component — a responsive, virtualized tile grid with built-in selection and keyboard shortcuts.
```

Verify: `npx changeset status` passes.

---

## File Summary

| File | Action |
|---|---|
| `xmlui/src/components/TileGrid/TileGrid.tsx` | Create — metadata + renderer |
| `xmlui/src/components/TileGrid/TileGridNative.tsx` | Create — React implementation |
| `xmlui/src/components/TileGrid/TileGrid.module.scss` | Create — styles + theme vars |
| `xmlui/src/components/TileGrid/TileGrid.spec.ts` | Create — E2E tests |
| `xmlui/src/components/ComponentProvider.tsx` | Modify — register component |
| `.changeset/add-tilegrid-component.md` | Create — changeset |

## Dependencies
- `virtua` — already in `xmlui/package.json` (v0.48.2)
- `useRowSelection` — reuse from `Table/useRowSelection.tsx`
- `useResizeObserver` — reuse from `components-core/utils/hooks.tsx`
- `ThemedToggle` — reuse from `Checkbox/Checkbox`
- `MemoizedItem` — reuse from `container-helpers.tsx`
- `useTableKeyboardActions` — adapt pattern from `Table/TableNative.tsx`

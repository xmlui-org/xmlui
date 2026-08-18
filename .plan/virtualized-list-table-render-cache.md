# Virtualized List and Table Render Cache Plan

## Goal

Reduce visible flashing while a user scrolls virtualized `List` and `Table` content, especially when dragging the scrollbar and rows enter from the top or bottom.

The feature should keep the performance benefits of virtualization while giving recently rendered rows a chance to remain mounted long enough to avoid remount/measurement flash. It should also expose a public escape hatch for applications that prefer minimum DOM size over smoother scroll continuity.

## Feasibility Summary

This can be done.

Both `List` and `Table` use `virtua`'s `Virtualizer`, and the installed `virtua` version already supports:

- `bufferSize`: extra pixel space rendered before and after the viewport.
- `keepMounted`: a list of indexes that should stay mounted even when off screen.
- `cache`: measurement restoration on mount, useful for a narrower class of remount cases.

The most compatible approach is to build a small XMLUI-owned policy layer that computes `keepMounted` indexes from recently visible row identities, with optional `bufferSize` tuning. This avoids replacing the virtualizer and lets existing scroll APIs, outside-scroll mode, dynamic heights, and table row measurement keep working.

There is one important limit: caching already rendered rows only helps rows that have already been mounted. If the user drags the scrollbar from row 10 to row 10,000, those destination rows have never been prepared. For that case, increasing/predictively adapting the virtualizer buffer is the only direct mitigation inside the current architecture.

## Recommended Public API

Add the same props to `List` and `Table`:

```xml
<List renderCache="{true}" />
<Table renderCache="{true}" />
```

Recommended default:

- `renderCache`: `true`

Reason: a bounded cache gives the smoother default users expect without retaining the whole data set. The feature must be strictly bounded by default, so default-on does not quietly turn virtualization into full rendering.

Optional companion props:

```xml
<List renderCache="{true}" renderCacheSize="{80}" virtualBufferSize="{400}" />
<Table renderCache="{true}" renderCacheSize="{80}" virtualBufferSize="{400}" />
```

Semantics:

- `renderCache`: enables or disables retaining recently mounted rows.
- `renderCacheSize`: maximum number of row indexes to keep mounted outside the normal virtualized range.
- `virtualBufferSize`: forwards to `virtua`'s `bufferSize`; useful for preparing never-seen rows just outside the viewport.

Initial defaults:

- `renderCache`: `true`
- `renderCacheSize`: `80`
- `virtualBufferSize`: leave unset so `virtua` keeps its current default, unless testing shows the scrollbar-drag case needs a modest XMLUI default such as `400`.

Rejected for first pass:

- An unbounded "cache every rendered row forever" mode by default. It can degrade large lists into thousands of mounted rows.
- Caching React elements while unmounted. React element object caching does not preserve mounted state, layout measurement, effects, image decoding state, or async component readiness; the visible flash is primarily a mount/measurement problem.

## Internal Design

### Shared Hook

Create a shared hook, likely under `xmlui/src/components-core/utils/virtualization-cache.ts` or close to the components if we want to keep it private at first:

```ts
type VirtualizedRenderCacheOptions<T> = {
  enabled: boolean;
  maxSize: number;
  rowCount: number;
  getRowId: (index: number) => string | number | undefined;
  getVisibleRange: () => { startIndex: number; endIndex: number } | null;
  revision: unknown;
};

type VirtualizedRenderCache = {
  keepMountedIndexes: readonly number[];
  noteVisibleRange: (range: { startIndex: number; endIndex: number }) => void;
  clear: () => void;
};
```

Responsibilities:

- Track recently visible row identities in LRU order.
- Convert retained row identities back to current indexes on every rows/data revision.
- Drop entries that no longer exist after data refresh, filtering, sorting, grouping, or pagination.
- Always include only valid indexes in `keepMounted`.
- Keep the currently visible range out of the retained set if `virtua` already mounts it; this keeps the prop smaller.
- Clear or rebuild on major structural revisions where identity meaning changes, such as `idKey`, grouping mode, or column/page model changes.

Use row identity instead of raw index wherever possible. Index-based retention breaks under sorting, prepends, deletes, grouping expansion, and pagination.

### List Integration

Files:

- `xmlui/src/components/List/List.tsx`
- `xmlui/src/components/List/ListReact.tsx`
- `xmlui/src/components/List/List.defaults.ts`
- `xmlui/src/components/List/List.md`
- `xmlui/src/components/List/List.spec.ts`

Implementation notes:

- Add metadata/defaults for `renderCache`, `renderCacheSize`, and `virtualBufferSize`.
- Extract the props in `ListWithSelection` and pass them to `ListNative`.
- In `ListNative`, compute row identity from the existing `rows` array:
  - normal item: `String(row[idKey])`
  - section header: `section:${row.id}`
  - section footer: `section-footer:${row.id}`
  - fallback only in dev/problem cases: `index:${rowIndex}`
- Feed visible range changes from `computeVisibleRange()` / `reportVisibleRange()` into the cache hook.
- Pass `keepMounted={keepMountedIndexes}` to `<Virtualizer>`.
- Pass `bufferSize={virtualBufferSize}` only when the prop is set.
- Preserve `shift`, `startMargin`, outside-scroll remount key, fixed item measurement, bottom anchoring, and current scroll APIs.

### Table Integration

Files:

- `xmlui/src/components/Table/Table.tsx`
- `xmlui/src/components/Table/TableReact.tsx`
- `xmlui/src/components/Table/Table.defaults.ts`
- `xmlui/src/components/Table/Table.md`
- `xmlui/src/components/Table/Table.spec.ts`

Implementation notes:

- Add the same metadata/defaults and prop extraction.
- Extend `TableProps` with `renderCache`, `renderCacheSize`, and `virtualBufferSize`.
- Compute row identity from the current virtualized row model:
  - primary: `row.id` from TanStack, already used as the child key.
  - fallback: source row `idKey` if needed.
- Include the same cache revision inputs as existing row rendering:
  - data/rows model changes
  - pagination changes
  - sorting/filtering changes
  - `idKey`
  - column render/layout version when it changes row shape
- Pass `keepMounted` and optional `bufferSize` into the table `<Virtualizer as="tbody">`.
- Do not recreate `VirtualTableRow`; the current stable custom item identity is load-bearing for `virtua` measurement.

## Invalidation Rules

Clear or prune the cache when:

- `renderCache` turns false.
- `renderCacheSize` becomes `0` or invalid.
- `idKey` changes.
- `rows.length` changes and retained identities no longer map to current rows.
- `List` grouping expands/collapses and section rows enter/leave the row model.
- `Table` pagination changes page.
- `Table` sorting changes row order.
- `refreshOn`/render version changes because templates may need fresh closures.

Prefer pruning over clearing when row identities still exist. For example, sorting should keep the retained identities but map them to new indexes; a full data replacement with matching IDs can still benefit from the cache.

## Testing Plan

### Unit-Level Hook Tests

Add tests for the shared hook/helper if extracted as pure logic:

- LRU keeps only the configured maximum.
- Visible range updates add indexes in order without duplicates.
- Reordering by stable row IDs remaps retained entries to new indexes.
- Removed rows are pruned.
- Disabled mode returns an empty `keepMounted` list.
- `maxSize=0` returns an empty list.

### List E2E / Component Tests

Extend `xmlui/src/components/List/List.spec.ts`:

- With `renderCache=true`, scroll down, scroll back up, and assert a recently seen offscreen row stays mounted via DOM count or a test marker.
- With `renderCache=false`, assert DOM count remains close to current virtualized behavior.
- Verify `renderCacheSize` caps the retained rows.
- Verify grouped lists do not confuse item rows with section headers/footers.
- Verify prepending with `shift` still maintains scroll position.
- Verify duplicate/empty `idKey` warnings still fire and cache falls back safely.

### Table E2E / Component Tests

Extend `xmlui/src/components/Table/Table.spec.ts`:

- With `renderCache=true`, scroll a large table and assert retained recently seen rows stay mounted.
- With `renderCache=false`, assert current virtualization DOM bounds.
- Verify sorting remaps retained identities instead of retaining wrong rows.
- Verify pagination prunes retained rows from the old page.
- Verify row selection/focus classes update for retained rows.
- Verify dynamic row height measurement still works.

### Visual/Regression Scenario

Add a test fixture with deliberately slow row content, such as an image or component that becomes ready after a short delay, then compare:

- baseline virtualized scroll
- `renderCache=true`
- `renderCache=true` plus higher `virtualBufferSize`

Automated screenshot assertions may be brittle; prefer DOM lifecycle counters and a targeted Playwright trace/manual QA note unless a stable visual metric is available.

## Documentation

Update `List.md` and `Table.md` with:

- What `renderCache` does.
- The memory/performance tradeoff.
- Why it helps previously seen rows but cannot pre-render arbitrary unseen scrollbar jumps.
- How `virtualBufferSize` helps fast scrolling into never-seen rows.
- Guidance:
  - Keep the default for normal apps.
  - Disable it for extremely heavy row templates, embedded videos, or very memory-constrained views.
  - Increase `renderCacheSize` or `virtualBufferSize` only after profiling.

Because this adds public props and metadata, regenerate the language-server metadata snapshot:

```sh
npm --prefix xmlui run check:metadata-snapshot
```

If it reports changes in `xmlui/src/language-server/xmlui-metadata-generated.js`, include the generated file and rerun the check.

## Changeset

Add a patch changeset for `xmlui` because this changes framework-facing component APIs:

```md
---
"xmlui": patch
---

Add bounded render caching controls for virtualized List and Table rows to reduce scroll remount flashing.
```

## Implementation Order

1. Add pure cache/index-retention helper with tests.
2. Wire `List` props, defaults, metadata, docs, and `Virtualizer keepMounted`.
3. Add focused `List` tests for retention, disable path, cap behavior, grouping, and prepending.
4. Wire `Table` props, defaults, metadata, docs, and `Virtualizer keepMounted`.
5. Add focused `Table` tests for retention, disable path, cap behavior, sorting, pagination, selection, and dynamic heights.
6. Run component tests for List/Table.
7. Regenerate metadata snapshot.
8. Add changeset.

## Open Questions

- Should `virtualBufferSize` be public in the same change, or should the first implementation keep it internal and add it only if QA shows cache alone is insufficient?
- Is `renderCacheSize=80` the right default for both components, or should `Table` start lower because table rows can contain many cells and interactive controls?
- Should retained rows include section headers and footers, or only real data rows? Including them is smoother for grouped lists, but it consumes cache capacity.
- Do we want a diagnostic warning in development when retained DOM count grows above a threshold because row templates are heavy?

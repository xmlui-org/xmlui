# List and Table Data Refresh State Preservation Plan

## Goal

Extend the Tree data-refresh preservation feature set to `List` and `Table` so backend-backed collections can refresh after insert, update, or delete operations without losing the user's current view state or causing visible flashing.

The goal is API consistency across collection components:

```xml
<List dataRefreshMode="preserve-state" data="{items}" />
<Table dataRefreshMode="preserve-state" data="{rows}" />
```

and a matching one-shot API:

```xml
<Button onClick="
  list.preserveStateOnNextDataRefresh({ operation: 'insert' });
  createItem.execute();
" />
```

The feature should remain opt-in. Existing apps should keep today's reset/re-render behavior unless they set `dataRefreshMode="preserve-state"` or call the one-shot API before a refresh.

As with Tree, the refresh should avoid unnecessary visual flashing. The user should see the old collection view until refreshed data and reconciled state are ready, then see the updated view in a single visible commit as far as React and the virtualizer allow.

## Current Context

### Shared Observations

- `List` and `Table` both already use stable source row identity through `idKey`.
- Both components are virtualized through `virtua` and already expose scroll APIs.
- Both have row selection managed by shared selection infrastructure.
- Both are commonly bound to backend-backed `data` / `DataSource` values.
- Both can visually jump when refreshed data changes row count near the current scroll position.
- The Tree implementation already introduced a public vocabulary worth reusing:
  - `dataRefreshMode`
  - `"reset"`
  - `"preserve-state"`
  - `preserveStateOnNextDataRefresh(options?)`
  - `operation: "insert" | "delete" | "update"`
  - `scrollTarget: rowId | "first-inserted" | "preserve"`

### List

- `List` is implemented in:
  - `xmlui/src/components/List/List.tsx`
  - `xmlui/src/components/List/ListReact.tsx`
  - `xmlui/src/components/List/List.defaults.ts`
- It supports grouping through `groupBy`, `availableGroups`, `defaultGroups`, and `groupsInitiallyExpanded`.
- It stores group expansion state locally in `expanded`.
- It uses `useRowSelection`.
- It exposes scroll APIs:
  - `scrollToTop`
  - `scrollToBottom`
  - `scrollToIndex`
  - `scrollToId`
  - `getItemCount`
  - `getVisibleRange`
- It has existing logic for bottom anchoring and virtualizer `shift`.
- It already documents `idKey` as row identity, including data-quality warnings for duplicate or empty IDs.

### Table

- `Table` is implemented in:
  - `xmlui/src/components/Table/Table.tsx`
  - `xmlui/src/components/Table/TableReact.tsx`
  - `xmlui/src/components/Table/Table.defaults.ts`
- It uses TanStack Table for row models, selection, pagination, column sizing, and pinning.
- It uses `useRowSelection`.
- It exposes scroll APIs:
  - `scrollToTop`
  - `scrollToBottom`
  - `scrollToIndex`
  - `scrollToId`
  - `getItemCount`
  - `getVisibleRange`
- It has additional state that is not present in List:
  - pagination
  - sort state
  - column sizing
  - column pinning
  - inferred columns
  - visible row model after sorting/pagination
- It should receive the feature after List because its state boundary is more complex.

## Proposed Public API

Use the same API names and values for `List` and `Table` as Tree.

Declarative prop:

```xml
<List dataRefreshMode="preserve-state" data="{items}" />
<Table dataRefreshMode="preserve-state" data="{rows}" />
```

Values:

- `reset` - default. Preserve current behavior.
- `preserve-state` - when `data` changes after initial load, reconcile the refreshed collection with current view state by stable source row ID.

One-shot API:

```ts
preserveStateOnNextDataRefresh(options?: DataRefreshOptions): void
```

Options:

```ts
type DataRefreshOptions = {
  operation?: "insert" | "delete" | "update";
  scrollTarget?: string | number | "first-inserted" | "preserve";
  animation?: boolean | "default" | "none" | DataRefreshAnimationOptions;
};

type DataRefreshAnimationOptions = {
  insert?: "none" | "highlight" | "fade-slide";
  update?: "none" | "highlight" | "pulse";
  delete?: "none" | "fade-collapse" | "highlight-collapse";
  duration?: number;
};
```

Semantics:

- Calling `preserveStateOnNextDataRefresh()` promotes only the next observed `data` refresh to preserve-state behavior, even when `dataRefreshMode="reset"`.
- After that refresh, the component returns to its declarative `dataRefreshMode`.
- Omitted options preserve the current scroll position.
- `operation: "insert"` infers inserted row IDs from `postRefreshIds - preRefreshIds`, then scrolls the first inserted visible row into view only if it is outside the current viewport.
- `operation: "delete"` preserves the current scroll position.
- `operation: "update"` preserves the current scroll position unless `scrollTarget` is supplied.
- `scrollTarget: rowId` explicitly scrolls that row into view after reconciliation if it exists in the current visible row model.
- `scrollTarget: "first-inserted"` uses insert inference even when `operation` is omitted.
- `scrollTarget: "preserve"` forces scroll preservation.
- `animation` optionally marks inserted, updated, and deleted rows with a short visual effect. Omitted means no refresh animation in the first implementation unless a component-level animation prop enables it.

## Optional Refresh Animation Options

Animation is useful, but it must not undermine the anti-flash goal. The animation should clarify which row changed after the preserved refresh, not replay the whole refresh or make the collection visibly reset.

### Option A: Semantic Row-State Classes (Preferred)

Add a component-level prop and one-shot API option that apply transient row state classes/data attributes after reconciliation:

```xml
<List dataRefreshMode="preserve-state" dataRefreshAnimation="highlight" />
<Table dataRefreshMode="preserve-state" dataRefreshAnimation="highlight" />
```

```xml
<Button onClick="
  table.preserveStateOnNextDataRefresh({
    operation: 'update',
    scrollTarget: selectedId,
    animation: { update: 'highlight', duration: 900 }
  });
  updateRow.execute();
" />
```

Behavior:

- Inserted row: render final row in place and briefly apply an inserted style, for example `data-refresh-state="inserted"` or a part/class such as `row--inserted`.
- Updated row: briefly apply an updated style to the existing row.
- Deleted row: prefer no default motion, or optionally keep a lightweight tombstone row just long enough for a collapse animation when the row is currently visible.
- Default animation style should be a short background highlight/fade, not layout-heavy motion.
- Respect `prefers-reduced-motion`; reduce to a non-moving highlight or no animation.

Why preferred:

- It is consistent across List and Table.
- It works with virtualization because rows remain keyed by stable IDs.
- It leaves visual design to theme variables/classes.
- It keeps the refresh as one data/state commit and avoids whole-list flashing.
- It can be extended later without changing preservation semantics.

Suggested public API:

```ts
type DataRefreshAnimation =
  | "none"
  | "highlight"
  | {
      insert?: "none" | "highlight" | "fade-slide";
      update?: "none" | "highlight" | "pulse";
      delete?: "none" | "fade-collapse" | "highlight-collapse";
      duration?: number;
    };
```

`dataRefreshAnimation` component prop:

- default: `"none"`
- applies to preserved refreshes from either `dataRefreshMode="preserve-state"` or the one-shot API
- one-shot `options.animation` overrides the component prop for that refresh

### Option B: Event-Only Hooks

Expose events instead of built-in animation:

```ts
dataRefreshDidAnimate?(event: {
  insertedIds: string[];
  updatedIds: string[];
  deletedIds: string[];
}): void
```

or a more direct event:

```ts
dataRefreshDidReconcile?(event: {
  operation?: "insert" | "delete" | "update";
  insertedIds: string[];
  updatedIds: string[];
  deletedIds: string[];
}): void
```

Users could animate externally through state, custom templates, or imperative DOM hooks.

Pros:

- Minimal core visual policy.
- Useful for analytics or custom UX.

Cons:

- Harder for normal XMLUI users to apply clean animations.
- More likely to cause duplicate state or flashing in app code.
- Does not provide a polished default.

Recommendation: useful as a later complement, not the first animation API.

### Option C: Template-Driven Transition Slot

Add a special refresh-transition context variable or wrapper around row templates:

```xml
<List dataRefreshAnimation="custom">
  <property name="itemTemplate">
    <Card when="{$refreshState === 'inserted'}" ... />
  </property>
</List>
```

Possible injected variables:

- `$refreshState`: `"inserted" | "updated" | "deleting" | null`
- `$refreshAnimationDuration`

Pros:

- Maximum customization.
- Fits XMLUI's template model.

Cons:

- Adds template complexity.
- Risks layout changes inside virtualized rows.
- Harder to make consistent between List and Table cells/rows.

Recommendation: defer until there is clear demand.

### Animation Detection Rules

For animation, the component needs to know which rows changed:

- Inserted IDs: `postRefreshIds - preRefreshIds`.
- Deleted IDs: `preRefreshIds - postRefreshIds`.
- Updated IDs:
  - Preferred first implementation: derive from explicit operation/target when possible, or compare row object references by ID.
  - More accurate later implementation: optional `versionField`, `updatedAtField`, or comparator callback.

For `operation: "update"` without an explicit target, animate rows whose source row object changed by reference for an existing ID. This works well for immutable data updates and avoids expensive deep comparison.

For `operation: "delete"`, deleted rows no longer exist in the new data. If delete animation is enabled, only animate visible deleted rows and keep tombstones for at most the animation duration. If that introduces scroll instability, fallback to no delete motion and rely on scroll preservation.

### Animation Guardrails

- Default should be `"none"` unless product direction chooses otherwise.
- The recommended first built-in animation is `"highlight"`.
- Do not animate every row on refresh.
- Do not animate unchanged rows.
- Do not delay data correctness for animation.
- Do not let delete animation reintroduce the scroll jump this feature is meant to remove.
- Do not fire consumer `scroll` events because an animation temporarily changes row height.
- Use fixed-height or non-layout-changing effects by default.
- Honor `prefers-reduced-motion`.

### Animation Theme Variables

Built-in refresh animations must be customizable through component theme variables. The first implementation should expose operation-specific variables for both `List` and `Table` rather than hard-coding colors, durations, or easing.

Recommended variable set for `List`:

- `backgroundColor-rowInserted-List`
- `backgroundColor-rowUpdated-List`
- `backgroundColor-rowDeleted-List`
- `outlineColor-rowInserted-List`
- `outlineColor-rowUpdated-List`
- `outlineColor-rowDeleted-List`
- `animationDuration-rowInserted-List`
- `animationDuration-rowUpdated-List`
- `animationDuration-rowDeleted-List`
- `animationEasing-rowInserted-List`
- `animationEasing-rowUpdated-List`
- `animationEasing-rowDeleted-List`
- `animationTranslateY-rowInserted-List`
- `animationTranslateY-rowDeleted-List`

Recommended variable set for `Table`:

- `backgroundColor-rowInserted-Table`
- `backgroundColor-rowUpdated-Table`
- `backgroundColor-rowDeleted-Table`
- `outlineColor-rowInserted-Table`
- `outlineColor-rowUpdated-Table`
- `outlineColor-rowDeleted-Table`
- `animationDuration-rowInserted-Table`
- `animationDuration-rowUpdated-Table`
- `animationDuration-rowDeleted-Table`
- `animationEasing-rowInserted-Table`
- `animationEasing-rowUpdated-Table`
- `animationEasing-rowDeleted-Table`
- `animationTranslateY-rowInserted-Table`
- `animationTranslateY-rowDeleted-Table`

Default values should be restrained:

- inserted: subtle success/primary highlight
- updated: subtle info/warning highlight
- deleted: subtle danger/neutral highlight, only if delete animation is enabled
- duration: roughly `600ms` to `900ms`
- easing: theme-consistent standard easing
- translate distance: `0px` for the preferred first `highlight` animation; non-zero only for explicit motion variants

Theme variable guidance:

- Keep row height stable for default animation values.
- For Table, apply variables at the row level and ensure selection/pinned cells inherit or receive compatible backgrounds.
- For `prefers-reduced-motion`, duration and transform variables should effectively resolve to no motion while retaining an optional non-moving color cue.
- Document these variables in the generated Theme Variables section and in the how-to article.

## Shared Implementation Shape

Create shared collection refresh types/utilities where practical, rather than duplicating Tree-specific type names:

- Add shared types to an appropriate abstraction file, for example:
  - `xmlui/src/components-core/abstractions/dataRefreshAbstractions.ts`, or
  - a collection-specific abstraction file if preferred by local conventions.
- Keep Tree's existing public API stable. If shared types are introduced, Tree can gradually adopt aliases without changing docs or runtime behavior.

Candidate shared helpers:

- `getSourceIdSet(items, idKey)`
- `diffInsertedIds(previousIds, currentIds)`
- `pruneSelectedIdsBySourceIds(selectedIds, currentIds)`
- `isPreserveScrollTarget(target)`
- `shouldInferFirstInserted(options)`
- scroll metric capture:
  - `scrollPosition`
  - `scrollSize`
  - `viewportSize`
- temporary end-padding calculation for delete/shrink preservation.
- refresh animation state calculation:
  - inserted IDs
  - updated IDs
  - deleted IDs
  - expiration timers / animation cleanup

Do not introduce a large generic state reconciler unless the List and Table implementations prove similar enough. Shared small utilities are safer than forcing all three components into one abstraction too early.

## List Behavior Rules

When preservation is active and refreshed List data arrives:

1. Rebuild the rows from the latest `data` / `items`.
2. Match rows by `idKey`.
3. Preserve row selection only for IDs still present and still selectable.
4. Drop selection for deleted rows in uncontrolled selection state.
5. Preserve group expanded/collapsed state by group key.
6. If a group key disappears, drop its expansion entry.
7. If a group key later reappears, apply normal default group expansion behavior unless there is still preserved state for that key.
8. Preserve focused row by source row ID when possible.
9. Preserve scroll position by default.
10. For insert intent, find the first inserted visible row in post-refresh row order and scroll it into view if needed.
11. For delete intent, keep the old scroll position and prevent browser/virtualizer clamping from causing a visible jump where possible.
12. Respect `scrollAnchor="bottom"` chat-style behavior. Bottom anchoring should continue to work and should not be disabled by preservation unless an explicit scroll target is supplied.
13. Keep pagination-related behavior out of List unless `pageInfo` requires special handling. Existing paged/infinite behavior should remain authoritative.
14. Avoid a render where refreshed data appears with reset group expansion or cleared selection before preserved state is applied.

List state to preserve:

- scroll position
- selected row IDs that still exist and remain selectable
- focused row ID if still present
- group expansion state
- current bottom-follow intent when `scrollAnchor="bottom"` and the user has not scrolled away

List state not to preserve in the first implementation:

- hover state
- transient checkbox hover/press state
- pending page fetch flags
- rendered item measurement cache, unless required to prevent visible jumps

## Table Behavior Rules

When preservation is active and refreshed Table data arrives:

1. Rebuild the TanStack row model from the latest data.
2. Match rows by `idKey`.
3. Preserve row selection only for IDs still present and still selectable.
4. Drop selection for deleted rows in uncontrolled selection state.
5. Preserve focused row by source row ID when possible.
6. Preserve scroll position by default.
7. For insert intent, find the first inserted row in the current post-refresh row model and scroll it into view if it is on the current page and outside the viewport.
8. If the inserted row is not in the current paginated row model, preserve scroll/page by default.
9. For delete intent, keep the old scroll position and prevent visible scroll clamping where possible.
10. Preserve current pagination state when possible.
11. If current page index is out of range after deletion, clamp to the last valid page.
12. Preserve current sort state.
13. Preserve column sizing and pinning.
14. Preserve inferred columns only indirectly through existing inference. If the refreshed data shape changes, column inference may legitimately update the layout.
15. Avoid a render where refreshed data appears with reset selection/page/sort before preserved state is applied.

Table state to preserve:

- scroll position
- selected row IDs that still exist and remain selectable
- focused row ID if still present
- pagination state, clamped when necessary
- sort state
- column sizing
- column pinning

Table state not to preserve in the first implementation:

- active cell edit sessions
- open tooltips/popovers/menus inside cells
- hover state
- transient checkbox press state
- inferred-column layout when the refreshed data shape legitimately changes
- explicit page jump to an inserted row that lands on a different page, unless a future option requests it

## Scroll and Anti-Flash Strategy

Reuse the Tree lessons:

1. Capture scroll metrics before the refresh:
   - scroll offset
   - total scroll size
   - viewport size
2. Restore scroll in a layout effect before paint when possible.
3. For delete/shrink refreshes, add temporary end padding when the previous scroll position would otherwise exceed the new maximum scroll position.
4. Clear temporary end padding on the next genuine user interaction:
   - wheel
   - pointer down
   - touch start
   - keyboard navigation
5. Disable browser scroll anchoring on the component scroll wrapper if it can cause competing browser-level adjustments.
6. Avoid scroll events caused by the component's own preservation logic from being reported as user scroll events.
7. For insert/explicit target scrolls, perform target scrolling only after the virtualizer has the reconciled row list.
8. If the target row is already fully visible, do not scroll.

The desired visible sequence:

1. Old collection view remains visible during backend/refetch latency.
2. Refreshed data and preserved state are reconciled.
3. New collection view appears in one visible update.
4. Optional target scroll happens only when requested and necessary.

## Implementation Steps

### Phase 1: Shared Types and Naming

1. Add shared refresh option types.
2. Decide whether Tree keeps its `TreeDataRefreshOptions` exported name or aliases the shared type.
3. Add default `dataRefreshMode: "reset"` to List and Table defaults.
4. Add shared animation option types if Option A is approved.
5. Add default `dataRefreshAnimation: "none"` to List and Table defaults if built-in animation is included in the first implementation.
6. Add animation theme variables to the List and Table SCSS modules and metadata via `parseScssVar`.
7. Add default theme variable values for inserted, updated, and deleted row animation states.
8. Add metadata descriptions for `dataRefreshMode`, `dataRefreshAnimation`, and `preserveStateOnNextDataRefresh`.
9. Update the language-server metadata snapshot after component metadata changes.
10. Add a patch changeset.

### Phase 2: List

1. Add `dataRefreshMode` to `ListMd.props`.
2. Thread `dataRefreshMode` through `List.tsx` into `ListNative`.
3. Add API metadata for `preserveStateOnNextDataRefresh`.
4. Add a `dataRefreshMode` prop to `DynamicHeightListProps`.
5. Add refs for:
   - previous data/items identity
   - whether initial data has arrived
   - latest captured List view state
   - latest source row IDs
   - latest scroll metrics
   - pending one-shot refresh state/options
   - pending scroll target
6. Define a List view-state shape:
   - selected IDs
   - focused row ID
   - group expansion state
   - scroll position
   - bottom-follow state, if needed
7. Register `preserveStateOnNextDataRefresh(options?)`.
8. On data refresh, decide between reset and preserve.
9. In preserve mode:
   - prune selection by current IDs and selectable predicates
   - reapply group expansion state for existing groups
   - restore focus by row ID when present
   - prepare scroll preservation or target scroll
10. Add temporary end-padding handling for delete/shrink cases.
11. Add optional refresh animation support using transient row state classes/data attributes if Option A is approved.
    - Mark inserted and updated rows without changing layout.
    - Only keep deleted-row tombstones if delete animation can be done without scroll instability.
    - Clear animation state after the configured duration.
    - Drive colors, duration, easing, and any transform distance from List theme variables.
    - Respect `prefers-reduced-motion`.
12. Ensure programmatic preservation scrolls do not fire consumer `scroll` events as user scrolls.
13. Add tests.

### Phase 3: Table

1. Add `dataRefreshMode` to `TableMd.props`.
2. Thread `dataRefreshMode` through `Table.tsx` into `Table`.
3. Add API metadata for `preserveStateOnNextDataRefresh`.
4. Add a `dataRefreshMode` prop to `TableProps`.
5. Add refs for:
   - previous data identity
   - whether initial data has arrived
   - latest captured Table view state
   - latest source row IDs
   - latest scroll metrics
   - pending one-shot refresh state/options
   - pending scroll target
6. Define a Table view-state shape:
   - selected IDs
   - focused row ID
   - pagination state
   - sort state
   - column sizing
   - column pinning
   - scroll position
7. Register `preserveStateOnNextDataRefresh(options?)`.
8. On data refresh, decide between reset and preserve.
9. In preserve mode:
   - prune selection by current IDs and selectable predicates
   - clamp pagination when row count/page count shrinks
   - keep sorting, column sizing, and pinning
   - restore focus by row ID when present
   - prepare scroll preservation or target scroll
10. For insert intent:
   - infer inserted IDs by source row ID
   - choose first inserted row in current post-refresh row model
   - do not switch pages in the first implementation
11. Add temporary end-padding handling for delete/shrink cases.
12. Add optional refresh animation support using transient row state classes/data attributes if Option A is approved.
    - Mark inserted and updated rows at the row level, not per cell.
    - Avoid delete collapse animation unless it is stable with virtualization and pagination.
    - Clear animation state after the configured duration.
    - Drive colors, duration, easing, and any transform distance from Table theme variables.
    - Ensure selection cells and pinned cells stay visually coherent during row animation.
    - Respect `prefers-reduced-motion`.
13. Ensure programmatic preservation scrolls do not fire consumer `scroll` events as user scrolls.
14. Add tests.

### Phase 4: Documentation

1. Update `xmlui/src/components/List/List.md`.
2. Update `xmlui/src/components/Table/Table.md`.
3. Create or update a website how-to article that demonstrates the new feature set for `List` and `Table`.
   - Preferred article shape: a collection-refresh how-to that covers `Tree`, `List`, and `Table` together if that keeps the docs cohesive.
   - Acceptable fallback: a new focused List/Table how-to if the existing Tree article should remain Tree-specific.
   - The article must include backend-style mutation flows with `DataSource` refetching, not only direct array mutation.
   - Include insert, update, and delete buttons.
   - Include enough rows to make scroll preservation visible.
   - Demonstrate the one-shot API with `dataRefreshMode="reset"` so users see how to opt in per operation.
   - Demonstrate default scroll preservation, insert intent, delete intent, and at least one explicit `scrollTarget`.
   - If refresh animation is implemented, demonstrate the preferred `highlight` animation for inserted and updated rows.
   - Explain that delete animation is optional and may be disabled by default to protect scroll stability.
   - Call out stable `idKey` values as a requirement for correct preservation.
4. Update website navigation when adding a new how-to page.
   - Add the article to `website/src/Main.xmlui` in both the `NavPanel` and `Pages` sections.
   - Preserve the existing website ordering conventions.
5. Add website example E2E coverage for the how-to article.
   - Verify insert, update, and delete work sequentially in the same running example.
   - Verify preserved selection for rows that still exist.
   - Verify delete near the bottom does not cause a visible scroll jump.
   - Verify insert intent scrolls the inserted row into view only when it starts outside the viewport.
6. Add component documentation links to the how-to.
   - Add a `dataRefreshMode` prop section in `xmlui/src/components/List/List.md` with a link to the how-to.
   - Add a `dataRefreshMode` prop section in `xmlui/src/components/Table/Table.md` with a link to the how-to.
   - If refresh animation is implemented, add `dataRefreshAnimation` prop documentation in both component docs with a link to the how-to.
   - If refresh animation is implemented, document the animation theme variables in both component docs and in the how-to article.
   - Add a short link from the main refresh-preservation prose/examples in both component docs.
   - If the docs extractor has prefix-matching issues like `data` vs `dataRefreshMode`, add explicit empty or intentional prop sections so the generated content lands under the correct heading.
7. Regenerate website reference docs.
   - Run `npm run generate-docs -w xmlui`.
   - Review generated `website/content/docs/reference/components/List.md` and `website/content/docs/reference/components/Table.md`.
   - Keep unrelated generated drift out of the final diff.
8. Update metadata snapshots if prop/API metadata changed.

## Test Plan

### Shared Tests

For both List and Table:

- Default `dataRefreshMode="reset"` keeps current behavior.
- `dataRefreshMode="preserve-state"` preserves selection and scroll on data refresh.
- `preserveStateOnNextDataRefresh()` preserves only the next refresh when mode is `reset`.
- A later refresh without the API follows reset behavior.
- Insert intent scrolls the first inserted visible row into view only when needed.
- Delete intent preserves scroll position.
- Explicit `scrollTarget: rowId` scrolls the row into view when present.
- Explicit missing `scrollTarget` preserves scroll and does not throw.
- Deleted selected rows are removed from uncontrolled selection.
- Controlled/synchronized selection remains caller-owned where applicable.
- A DataSource refetch after a backend-style mutation works, not just direct array replacement.
- Anti-flash coverage verifies there is no visible reset/empty intermediate state.
- When refresh animation is enabled, inserted rows receive the inserted state only for the configured duration.
- When refresh animation is enabled, updated rows receive the updated state only for the configured duration.
- Delete animation, if enabled, does not change the final data outcome and does not cause an extra scroll jump.
- Animation theme variables override built-in colors, durations, easing, and transform distances.
- `prefers-reduced-motion` suppresses motion-heavy animation while preserving any non-moving state indication chosen for accessibility.

### List-Specific Tests

- Preserves collapsed/expanded groups across refresh.
- Drops expansion state for deleted groups.
- Uses default group expansion for newly inserted groups.
- Preserves selection across grouped list refresh.
- Insert intent chooses the first inserted visible item in grouped visual order.
- Inserted item inside a collapsed group does not force-open the group in the first implementation.
- `scrollAnchor="bottom"` keeps bottom-follow behavior for append-style refreshes.
- Delete near the bottom does not cause a visible scroll jump.
- `scroll` event is not fired as a user event by preservation scroll restoration.
- Refresh animation state is applied to regular item rows, not group headers or footers, unless a future API explicitly supports group animation.
- List animation theme variables apply to inserted and updated row states.

### Table-Specific Tests

- Preserves selected row IDs across refresh.
- Preserves current page when still valid.
- Clamps current page after deletion reduces total page count.
- Preserves sort state across refresh.
- Preserves column sizing across refresh.
- Preserves pinned columns across refresh.
- Insert intent scrolls first inserted row into view when it is on the current page.
- Insert intent does not switch pages when the first inserted row lands elsewhere.
- Explicit `scrollTarget` on a row outside the current page does not throw and preserves current scroll/page in the first implementation.
- Delete near the bottom does not cause a visible scroll jump.
- Inferred-column shape changes are allowed to reflow; tests should not assert stable column layout when row shape changes.
- Refresh animation state is applied to the table row and remains visually consistent across pinned/selection cells.
- Table animation theme variables apply to inserted and updated row states, including coherent pinned/selection cell backgrounds.

## Verification Commands

Run focused component tests:

```bash
npx playwright test xmlui/src/components/List/List.spec.ts --reporter=line
npx playwright test xmlui/src/components/Table/Table.spec.ts --reporter=line
```

Run any new how-to website example tests:

```bash
npx playwright test xmlui/tests-e2e/how-to-examples/<new-spec>.spec.ts --reporter=line
```

The how-to spec should be named after the article slug and should include `@website` examples so the docs sample remains executable.

Run metadata checks:

```bash
npm --prefix xmlui run check:metadata-snapshot
npx changeset status
```

If docs are regenerated:

```bash
npm run generate-docs -w xmlui
```

Review generated docs carefully because the generator may surface pre-existing source/doc drift in unrelated generated reference pages. Keep the final diff scoped to the List/Table refresh feature and its docs.

## Recommended Order

1. Implement List first.
2. Validate the shared API and scroll-preservation helpers on List.
3. Add the preferred non-layout-changing highlight animation on List after core preservation is stable.
4. Implement Table using the proven subset.
5. Add Table animation using the same row-state approach only after Table scroll/pagination preservation is stable.
6. Add docs/how-to examples after both components are stable.

List is the better first target because it is closer to Tree: virtualized rows, stable IDs, selection, scroll, and group expansion. Table should follow once the shared refresh vocabulary is proven, because pagination, sorting, and column state add more policy decisions.

## Open Questions

1. Should the shared type be named `DataRefreshOptions`, `CollectionDataRefreshOptions`, or remain component-specific aliases?
2. Should `Table` ever switch pages automatically for insert intent, or should page changes always require an explicit future option?
3. Should `List` insert intent open a collapsed group containing the inserted row, or preserve group state strictly?
4. Should `List` and `Table` expose `getViewState()` / `setViewState()` equivalents, or keep the first implementation limited to refresh preservation?
5. Should synchronized selection (`syncWithVar` / `syncWithAppState`) be pruned automatically during preserve refresh, or should external selection remain fully caller-owned?
6. Should the how-to cover Tree/List/Table together, or should List/Table get a separate focused article? Either way, implementing this plan requires a website how-to article and links from List/Table `dataRefreshMode` component docs to that article.
7. Should refresh animation ship in the first List/Table implementation or as a follow-up after preservation semantics are proven?
8. Should delete animation be limited to a non-layout-changing highlight/removal indication in v1, avoiding collapse/tombstone behavior?
9. Should update detection rely on immutable row object reference changes in v1, or should the API include an explicit `updatedIds`, `versionField`, or comparator option?
10. Should Tree adopt the same `dataRefreshAnimation` prop later so all three collection components share the complete refresh UX vocabulary?

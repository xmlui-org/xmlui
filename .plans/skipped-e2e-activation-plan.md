# Skipped E2E Activation Plan

## Scope

This plan audits the skipped E2E/component Playwright tests reported by the
latest full XMLUI E2E gate and records how to turn useful skipped component
coverage into active tests without destabilizing the remaining rebuild work.

Latest observed full gate:

- Command: `npm --workspace xmlui run test:e2e`
- Result: `4576 passed`, `496 skipped`
- Source discovery: `npm --workspace xmlui exec -- playwright test --list`
  reported `5072` total tests in `187` files.

This document intentionally lives outside `.plans/rebuild-plan.md`; keep the
master rebuild plan focused on execution order and use this file as the detailed
skip-reduction backlog.

## Activation Principles

- Do not remove a skip only to increase the count. A re-enabled test must assert
  current XMLUI compatibility or a concrete migrated behavior.
- Prefer small groups by behavior surface: basic rendering, state update,
  accessibility, theming, API, overlay, keyboard, visual layout, then full old
  suite cleanup.
- Before re-enabling an old copied test, compare the test expectation with the
  original XMLUI source and old test intent in `/Users/dotneteer/source/xmlui`.
- If a copied test is valid but brittle, adapt selectors/drivers to the rewrite
  test harness while preserving user-visible behavior.
- If a skipped test is obsolete, delete or rewrite it with a short compatibility
  note instead of leaving a stale skip.
- Each activation slice should run the focused file or component bundle first,
  then the normal step-level checks. When a rebuild step is completed, run the
  full `npm --workspace xmlui run test:e2e` gate.

## High-Value Component Candidates

These skipped component tests look likely to be valid and productive after the
recent component closure work. Review these first in Phase 8.

| Area | Current Skip Surface | Why It Looks Productive | Review Step |
| --- | --- | --- | --- |
| `Footer` and `AppHeader` | Both use active allow-lists with copied-old pending skips. | Core App shell and layout are now much further along; remaining sticky/layout/theme cases should be reviewed for reactivation or deletion. | Phase 8 app-shell component sweep |

The pre-Phase 6 activation queue is complete. Remaining high-value component
skips should stay in Phase 8 unless a Phase 6 implementation change directly
touches that component surface.

Completed pre-Phase 6 activation:

- `FocusScope`: removed the stale Markdown/xmlui-pg fixme from
  `xmlui/src/components/FocusScope/FocusScope.spec.ts`, updated the nested
  playground markup to the rewrite's escaped Markdown authoring form, and
  verified the focused file with 5 passed and 0 skipped.
- `Pagination`: activated the old behavior/part composition coverage as a
  narrower animation-plus-parts regression in
  `xmlui/src/components/Pagination/Pagination.spec.ts`; tooltip and variant
  behavior remain deferred because the current compatibility contract rejects
  those props on `Pagination`.
- `Select`: activated the behavior/part composition coverage in
  `xmlui/src/components/Select/Select.spec.ts`, with the dropdown opened before
  asserting list-wrapper parts and then closed before tooltip hover checks.
- `Spinner`: activated the behavior/part composition coverage in
  `xmlui/src/components/Spinner/Spinner.spec.ts`.
- `Accordion`: removed the copied-old file-wide skip from
  `xmlui/src/components/Accordion/Accordion.spec.ts`; expand/collapse, header
  template, accessibility, keyboard, and null-expanded coverage now run, while
  four theme-variable matrix cases remain explicitly skipped until Accordion
  theme parity is swept.
- `Tabs`: replaced the copied-old file-wide skip in
  `xmlui/src/components/Tabs/Tabs.spec.ts` with a smoke/basic allow-list. Six
  tests now run for rendering, labels, default content, click switching,
  `activeTab`, and orientation; the remaining copied-old Radix/API/template/
  form/theme matrix remains deferred behind the allow-list reason.
- Focused verification for the five-slice pass:
  `npm --workspace xmlui exec -- playwright test src/components/Pagination/Pagination.spec.ts:1389 src/components/Select/Select.spec.ts:1532 src/components/Spinner/Spinner.spec.ts:292 src/components/Accordion/Accordion.spec.ts src/components/Tabs/Tabs.spec.ts --reporter=line`
  passed with 14 passed and 66 skipped.
- `Stack`: replaced the copied-old file-wide skip in
  `xmlui/src/components/Stack/Stack.spec.ts` with an allow-list for empty render
  and context-menu event coverage; broader scroller, dock, item-width, API, and
  geometry semantics remain deferred.
- `ExpandableItem`: replaced the copied-old file-wide skip in
  `xmlui/src/components/ExpandableItem/ExpandableItem.spec.ts` with an
  allow-list for basic render, summary text, initially-expanded state, and
  summary-click toggle coverage. Two stale summary-content assertions now use
  the active `summary` part rather than the old `.summaryContent` selector.
- `FormItemLabelClick`: replaced the copied-old file-wide skip in
  `xmlui/src/components/FormItem/FormItemLabelClick.spec.ts` with an allow-list
  for currently compatible shorthand and direct-bind label-click cases. The
  remaining child-template id-forwarding and several shorthand/direct wrapper
  cases remain deferred with a current reason.
- Final pre-Phase 6 focused verification:
  `npm --workspace xmlui exec -- playwright test src/components/Stack/Stack.spec.ts src/components/ExpandableItem/ExpandableItem.spec.ts src/components/FormItem/FormItemLabelClick.spec.ts --reporter=line`
  passed with 24 passed and 153 skipped.
- Full pre-Phase 6 completion gate:
  `npm --workspace xmlui run test:e2e` passed with 4576 passed and 496 skipped.

## Deferred But Still Valuable

These skips are useful compatibility targets, but they are more likely to need
implementation work or careful visual/interaction harnessing before activation.

| Area | Current Skip Surface | Reason To Defer | Review Step |
| --- | --- | --- | --- |
| `FlowLayout` | Width wrapping, star sizing, scroller fade, long-item, rowGap, and non-visual child layout skips. | P7D explicitly deferred broader layout-context and scroll-fade parity. | Phase 8 visual/layout sweep |
| `ScrollViewer` | Scroller fade and desktop overlay scrollbar skips. | Requires overlay scrollbar/fade visual parity and likely screenshot-style checks. | Phase 8 visual/layout sweep |
| `ResponsiveBar` | Overflow dropdown, dropdown text, reverse, alignment, willOpen, API, and behavior/part blocks. | P7D left broader overlay/dropdown matrix debt. | Phase 8 responsive/overlay sweep |
| `TileGrid` | Theme checkbox, row grouping, virtualization, selection, keyboard, sync, stretch, click-toggle, context menu, and refresh skips. | P7D left selection/virtualization/layout parity for later. | Phase 8 collection/layout sweep |
| `Splitter` and `HSplitter` | Conditional rendering, resize, constraints, resize events, rapid resize operations. | Requires robust drag/resize interaction parity and likely browser geometry stabilization. | Phase 8 interaction/layout sweep |
| `Pagination` | Boundary API, tooltip, and variant behavior skips. | API boundary behavior can be activated earlier; tooltip/variant behavior should wait until those props are implemented or intentionally documented as unsupported. | Phase 8 component API and behavior sweep |
| `Accordion` | Four theme-variable matrix tests remain skipped. | The copied-old smoke, keyboard, accessibility, and null-state cases are active; the remaining matrix expects original per-side token behavior. | Phase 8 component theme sweep |
| `Tabs` | Copied-old allow-list leaves Radix/API/template/form/theme matrix skipped. | Smoke and basic selection cases are active; deeper keyboard/API/headerTemplate/accordionView/keepMounted/theme parity needs a dedicated component sweep. | Phase 8 component compatibility sweep |
| `Stack` | Copied-old allow-list leaves scroller fade, theme, layout geometry, scroll APIs, itemWidth, and dock layout skipped. | Empty render and context-menu smoke coverage are active; geometry and scroll semantics should be swept with layout work. | Phase 8 layout compatibility sweep |
| `ExpandableItem` | Copied-old allow-list leaves icon/switch/API/theme/layout/form/behavior/accessibility matrix skipped. | Basic render, summary, initial state, and click toggle coverage are active; remaining cases need a dedicated component sweep. | Phase 8 component compatibility sweep |
| `FormItemLabelClick` | Copied-old allow-list leaves child-template id forwarding and several shorthand/direct wrapper cases skipped. | Many shorthand and direct-bind label-click cases are active; the deferred cases expose real remaining forwarding/wrapper compatibility gaps. | Phase 8 form/input compatibility sweep |
| `Card` | Link-vs-card click propagation skips. | Valid target, but should be reviewed with Link propagation and nested interactive content semantics. | Phase 8 interaction sweep |
| `DatePicker` | Mobile drawer and Ark month/year switching fixme. | Explicitly blocked until the DatePicker shell matches the original Ark structure. | Phase 8 or Phase 9 if still blocked |
| `Lifecycle` | Script throw/error and old Lifecycle suite transfer fixmes. | Needs script-runtime error semantics and lifecycle parity. | Phase 8 runtime compatibility sweep |
| `App-script-imports` | Entire script import suite skipped. | Script import/function declaration behavior is runtime/compiler compatibility, not a simple component activation. | Phase 8 compiler/runtime sweep |

## Remaining Copied-Old Allow-List Files

Several large copied-old component files use an allow-list pattern: active tests
run, and all unlisted tests are skipped in `beforeEach`. These should be
reviewed by diffing the active allow-list against actual test titles and
promoting the next valid cluster.

- `xmlui/src/components/AutoComplete/AutoComplete.spec.ts`
  - Many core, theme, behavior, validation, and nested overlay tests are already
    active.
  - Remaining skipped tests should be grouped by listbox keyboard behavior,
    grouping edge cases, async/filtering edge cases, and overlay clipping.
  - Review in Phase 8 selection/overlay sweep.

- `xmlui/src/components/DropdownMenu/DropdownMenu.spec.ts`
  - Basic menu, submenu, separator, keyboard, disabled, theme, API, nested modal,
    and icon cases are already active.
  - Remaining skipped cases should be grouped by full Radix parity, navigation
    semantics, advanced keyboard behavior, and separator filtering edge cases.
  - Review in Phase 8 overlay/menu sweep.

- `xmlui/src/components/ContextMenu/ContextMenu.spec.ts`
  - Review together with DropdownMenu, since shared menu styling was restored in
    H5B but full context-menu parity may still depend on Radix/menu semantics.
  - Review in Phase 8 overlay/menu sweep.

- `xmlui/src/components/Footer/Footer.spec.ts`
  - Basic content, accessibility, interaction, long/empty content, and a few
    theme cases are already active.
  - Remaining skipped cases should be grouped by sticky layout, Pages scrolling,
    App shell layout integration, and remaining theme variables.
  - Review in Phase 8 app-shell/layout sweep.

- `xmlui/src/components/AppHeader/AppHeader.spec.ts`
  - Basic title/logo/accessibility/focus/theme edge cases are already active.
  - Remaining skipped cases should be grouped by layout context integration,
    drawer/nav-panel interaction, logo/resource behavior, and theme variables.
  - Review in Phase 8 app-shell/navigation sweep.

## Remaining-Step Collection

### Phase 6: Extension Packages And External Authoring

No current skipped component tests from the 535-skip set directly belong to
Phase 6. Existing extension E2E coverage in `xmlui/tests/e2e/extensions.spec.ts`
is active. If Phase 6 adds package-level component fixture coverage, do not mix
it with this component skip backlog unless a skipped test explicitly exercises
extension component registration or extension theme metadata.

### Phase 7: Developer Tooling, Docs, Playground, And AI Integrations

No current skipped component tests directly belong to Phase 7. Phase 7 may use
the metadata additions from P8A, but the skipped component tests listed here are
runtime/component compatibility work. If docs/playground tests reveal stale
component examples, add new targeted tests rather than reclassifying old
component skips as tooling work.

### Phase 8: Full Compatibility Sweep

Review almost all skipped component tests here. Suggested Phase 8 slices:

1. `Low-Risk Copied-Old Smoke Activation`
   - `Accordion.spec.ts` theme-variable matrix follow-up
   - `Stack.spec.ts` scroller, theme, layout geometry, API, itemWidth, and dock follow-up
   - `Tabs.spec.ts` next copied-old cluster after smoke/basic activation
   - `ExpandableItem.spec.ts` icon, switch, accessibility, API, theme, layout, form, and behavior follow-up

2. `Form/Input Label And Behavior Reactivation`
   - `FormItemLabelClick.spec.ts` deferred child-template and wrapper forwarding cases
   - `Pagination.spec.ts` API boundary, tooltip, and variant behavior skips

3. `App Shell And Navigation Components`
   - Remaining `AppHeader.spec.ts`
   - Remaining `Footer.spec.ts`
   - `NavPanel.spec.ts`, `NavGroup.spec.ts`, and `NavLink.spec.ts` skipped
     copied-old cases

4. `Overlay And Menu Matrix`
   - Remaining `DropdownMenu.spec.ts`
   - Remaining `ContextMenu.spec.ts`
   - Remaining `AutoComplete.spec.ts` overlay/listbox cases
   - Card/Link click propagation cases

5. `Layout And Visual Geometry`
   - `FlowLayout.spec.ts`
   - `ScrollViewer.spec.ts`
   - `ResponsiveBar.spec.ts`
   - `TileGrid.spec.ts`
   - `Splitter.spec.ts` and `HSplitter.spec.ts`

6. `Runtime And Script Compatibility`
   - `App/App-script-imports.spec.ts`
   - `Lifecycle.spec.ts`

7. `DatePicker Ark/Mobile Shell`
   - `DatePicker.spec.ts` mobile drawer/month-year fixme, only after the shell
     structure is compatible enough to make the old test meaningful.

### Phase 9: Release Readiness And Migration Safety

Phase 9 should not be the main activation phase. Use it only for:

- confirming no stale `skip`/`fixme` markers remain without a release note or
  explicit follow-up issue;
- deleting obsolete copied-old tests that no longer represent public behavior;
- documenting deliberately deferred compatibility gaps in migration notes.

## Execution Checklist For Each Slice

1. Identify the skipped tests in the slice and compare with original XMLUI.
2. Run the skipped file with the skip guard temporarily removed or narrowed.
3. Classify each failure:
   - valid current implementation bug;
   - stale selector/test harness mismatch;
   - obsolete behavior;
   - genuinely blocked compatibility gap.
4. Activate passing or fixed tests in small groups.
5. Replace broad file-wide skips with active allow-lists or remove them.
6. Run the focused component bundle.
7. Run TypeScript, unit tests, metadata checks, and the scoped audits relevant
   to the touched area.
8. At step completion, run full `npm --workspace xmlui run test:e2e`.

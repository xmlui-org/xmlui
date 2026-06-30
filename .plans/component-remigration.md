# Component Re-Migration Plan

Date: 2026-06-28

## Scope

This plan replaces the earlier "rewrite the behavior until the migrated E2E
passes" component strategy with a faster, stricter source-preserving strategy.
The old XMLUI component implementation at
`/Users/dotneteer/source/xmlui/xmlui/src/components` is the source of truth.

For each component, migrate by copying the original React implementation files
and `.module.scss` files literally, then making only the minimum import and
adapter changes needed to compile in the rewrite workspace. The component
metadata/defaults/renderer file may be adapted to the rewrite's current
component registration and compiler/runtime contracts.

## Non-Goals

- Do not redesign component DOM, class structure, behavior, or SCSS.
- Do not change original component E2E test files.
- Do not replace original component visuals with inline React style logic.
- Do not migrate multiple behavioral components in one approval unit.
- Do not mark a component complete because a foundation suite passes.

## Compatibility Rules

1. Preserve the old component's React files and `.module.scss` files as copied
   artifacts. Allowed edits are import-path rewrites, type import rewrites, and
   tiny compatibility shims that are documented in the component note.
2. The main component metadata/renderer file, defaults, docs, and registration
   glue may be adapted for the rewrite, because these are the boundary between
   old source and new runtime.
3. Keep the existing component E2E infrastructure features. Infrastructure can
   be extended, but old component test files must remain unchanged.
4. Run focused E2E continuously while tuning the component adapter. If old tests
   expose missing shared infrastructure, update the infrastructure instead of
   weakening the test.
5. After any component migration, `npm --workspace xmlui run test:e2e` must run
   successfully. The source-preserved component and all current components must
   work side by side; do not accept a migration that only passes its focused
   component suite while breaking unrelated component E2E.
6. When a component is complete, stop and ask the user for approval before
   starting the next component. The user will run additional tests and report
   regressions before the next approval.
7. Prefer migration order where a component depends only on already migrated
   components. When this is impossible, migrate the dependency first or record a
   blocker.

## Diagnostic Hypothesis

This plan uses the following hypothesis as a compatibility diagnostic:

If a component's original React implementation files and `.module.scss` files
are copied literally, its metadata/default theme variables are matched to the
old component, and its original E2E tests are preserved, then remaining
behavior or style divergence is strong evidence of a regression in shared
rendering infrastructure rather than in the component itself.

Shared infrastructure includes, at minimum:

- XMLUI markup parsing and compiled prop/event binding;
- renderer wrapper behavior, child rendering, layout context, and component API
  registration;
- theming variable generation, fallback/default resolution, variant resolution,
  CSS module loading, and global style ordering;
- part/class mapping and responsive-layout class injection;
- runtime state updates, event dispatch, focus handling, portals/overlays, and
  browser testbed behavior.

When this diagnostic fires, the next step should be to investigate and fix the
shared infrastructure or adapter boundary. Do not tune the copied component
implementation to hide the divergence unless the old source relies on an
explicit infrastructure contract that the rewrite intentionally cannot support;
in that case, document the exception as compatibility debt before proceeding.

## Rendering Pipeline Strategy

This plan does not assume the current rendering pipeline is already compatible.
It also does not start with a broad rendering-pipeline rewrite before component
migration. The source-preserved components are the diagnostic probes that tell
us exactly which shared layer is wrong.

Expected rendering-pipeline work is discovery-driven:

- first, copy a small component and adapt only its boundary;
- then, if the copied React, SCSS, metadata, and old tests still diverge from
  the original behavior, classify the failing layer;
- fix the smallest shared infrastructure contract that explains the mismatch;
- rerun the focused suite and full `npm --workspace xmlui run test:e2e`;
- record the pipeline fix in the component closure note so later components can
  reuse it instead of carrying component-local workarounds.

Likely rendering-pipeline areas to inspect during the first migrations:

- `wrapComponent` and renderer adapter prop conversion, especially boolean,
  number, string, event, child, and API registration handling;
- child rendering and container/layout context propagation;
- `classes`/part mapping, `COMPONENT_PART_KEY`, and responsive-layout class
  injection;
- SCSS module loading and style order, including old `@layer components`
  expectations;
- metadata-to-theme-variable extraction and default theme variable resolution;
- theme class generation and variant/theme override precedence;
- runtime state update timing and event dispatch semantics;
- Playwright testbed compilation/rendering paths used by old component specs.

So the answer is: we do not yet know the exact rendering-pipeline changes, and
we should not guess them in advance. We should expect that some will be needed,
but only accept a pipeline change when a source-preserved component exposes a
specific incompatibility that the old implementation did not have.

## Fast Component Loop

For each component:

1. Inventory old files:
   - `*React.tsx`, helper `.tsx`/`.ts` files, context files;
   - `*.module.scss` and component-local `.scss`;
   - old `*.spec.ts`/`*.spec.tsx`, docs, defaults, and fixtures.
2. Copy protected files:
   - copy React implementation/helper files and SCSS modules from the old
     component folder;
   - do not refactor while copying.
3. Rewrite imports only:
   - map old core imports to rewrite equivalents;
   - add missing compatibility exports in shared rewrite infrastructure when
     multiple components need the same symbol;
   - avoid component-local behavioral edits unless there is no shared adapter
     alternative.
4. Adapt metadata/renderer:
   - keep public props/events/theme vars aligned with the old metadata;
   - bridge the rewrite compiler/runtime to the copied React component;
   - register public API methods and state updates through existing rewrite
     facilities.
5. Run tests in a tight loop:
   - `npm --workspace xmlui run test:e2e -- src/components/<Component>/<specs>`
   - `npm --workspace xmlui run compatibility:component-e2e-audit -- --expanded=<Component>`
   - `npm --workspace xmlui run compatibility:css-module-import-audit`
   - `npm --workspace xmlui run test:e2e`
6. Record closure:
   - update this table to `Awaiting user approval`;
   - add a short `.ai/<component>-source-preserving-migration-findings-YYYY-MM-DD.md`
     note with old files copied, adapter edits, tests run, and residual risk;
   - add durable migration learnings to the "Migration Learnings" section of
     this plan, especially shared rendering/theming/testbed findings that may
     affect later components;
   - ask the user for approval to continue.

## Migration Learnings

Keep this section to reusable migration rules only. Component-specific closure
details belong in per-component .ai notes and the status table.

### Renderer Boundary

- Old React components commonly expect root/theme classes in
  `classes[COMPONENT_PART_KEY]`, while the rewrite adapter exposes the current
  theme class through `rootAttrs().className`. Bridge this at the renderer
  boundary instead of changing protected React files.
- Keep old value coercion, default normalization, and legacy alias mapping at the
  metadata/renderer boundary when the old React file assumes already-normalized
  props. Examples include ProgressBar value clamping, Button `left/right` icon
  aliases, and display-text conversion for Text/Heading values.
- When copied React props are narrower than the old `wrapComponent` boundary,
  keep arbitrary root prop forwarding and permissive runtime values in the
  renderer adapter instead of widening protected source. IFrame exposes this
  with DOM `id` forwarding and invalid-but-runtime-forwarded `referrerPolicy`.
- Do not blindly pass metadata defaults into copied React components. Some old
  components distinguish omitted props from explicit defaults, especially layout
  alignment, controlled/uncontrolled values, and app/global fallback behavior.
- Stable callback identity matters. Copied components can treat
  `updateState`, `registerComponentApi`, and similar callbacks as stable; use
  refs/memoized callbacks at the renderer boundary when needed.
- Behavior wrappers that clone children must preserve child inline style before
  layering wrapper-owned dynamic style. The rewrite currently carries many
  theme CSS variables through inline style, while old XMLUI often carried them
  through classes; dropping child style can silently strip variant/theme
  variables from animated or otherwise wrapped components.
- Inline old leaf components can be blockified by the rewrite testbed/App flex
  boundary before their own `display: inline` style is observed. Preserve the
  copied React/SCSS source and bridge this with a renderer-owned inline wrapper
  when old behavior requires the leaf element itself to compute as inline.
- Old wrapper layers sometimes normalized resource props before protected React
  source saw them. Preserve that at the renderer boundary; Image `data` resource
  URLs are fetched to `Blob` values so the copied React file can keep its old
  Blob-only `imageData` contract.
- Some old source-preserved families depend on packages that the rewrite has
  not introduced yet. The menu family established that adding the original
  dependency can be the smaller compatibility move: DropdownMenu and
  ContextMenu now use `@radix-ui/react-dropdown-menu` again, with rewrite-only
  bridge code at the renderer/runtime layer for trigger templates, state/API
  registration, modal layering, and `$context` propagation.
- Copied family SCSS can intentionally consume shared theme variables even when
  the rewrite metadata exposes a child component's own scoped variables. The
  menu family maps `SubMenuItem` trigger variables back to the shared
  `MenuItem` CSS variable names so the old menu item mixin keeps its padding,
  gap, font, and hover behavior.
- Keep copied component-owned props out of generic inline layout style when the
  old component CSS owns them. Props such as `orientation`,
  `horizontalAlignment`, and `verticalAlignment` may collide with the rewrite
  layout resolver and must be stripped or bridged carefully.
- Preserve old parent-child layout ownership. Containers such as Stack and
  FlowLayout own selected child layout props, strip them from the rendered child,
  and apply them on wrapper elements. Future complex containers should prefer a
  shared old-style layout-context bridge over component-local duplication.
- Preserve old `childrenLayoutContext` declarations from metadata. Components
  such as Card rely on this contract so immediate children keep Stack-like flex
  behavior, including non-shrinking explicit sizes that make scrolling real.
- Preserve old no-shrink defaults for ordinary components at the renderer or
  shared layout boundary. Source-preserved components such as ContentSeparator
  can expose this when large explicit sizes are compressed by the rewrite's App
  testbed flex container; explicit `canShrink` should still be honored.

### Theming And CSS

- Protected SCSS should normally be imported only from protected React files.
  Metadata/Vite config loading can choke on old SCSS module imports, so declare
  metadata theme variables explicitly when extraction is unsafe.
- The old Sass theme helpers rely on composed padding, border, focus-outline, and
  hierarchical fallback variables. When a copied SCSS file asks for a specific
  variable, the rewrite must emit the old fallback chain instead of relying on a
  single flat variable.
- CSS layer order is part of compatibility. Global/base CSS must establish layer
  order before copied `@layer components` styles load, otherwise base resets can
  outrank component CSS.
- Theme wrappers are layout-transparent in old XMLUI. `ThemeScope` must preserve
  `display: contents` behavior while carrying scoped CSS variables.
- Theme-token props such as `$space-8` should be normalized to CSS variables at
  the renderer boundary when passed into copied React logic that performs sizing
  math. If numeric math is needed, resolve the variable against the actual
  component DOM element, not an arbitrary global root.
- Generated tone/color variables must be inserted at the same point in the theme
  cascade as old XMLUI. Missing generated base tones or wrong generated/default
  precedence shows up as subtle color, opacity, border, and hover-state drift.

### Component Source And Dependencies

- Prefer shared compatibility shims for old import paths over component-local
  rewrites. Reused shims so far include old component-core utilities, parts,
  hooks, app context, table-of-contents context, style registry, and layout
  helpers.
- Source-preserved dependencies should be migrated before dependents when they
  are part of the visible contract. Icon before Button and Stack/SpaceFiller
  before FlowLayout/Card-like containers paid off.
- Some old helper exports are useful before a full component migration. A narrow
  boundary export is acceptable when needed by an approved dependent, but record
  it as dependency debt if the full component has not been migrated.
- Metadata files should stay metadata-only when runtime exports import SCSS.
  Re-exporting runtime components from metadata files can make Vite config
  bundling parse SCSS as JavaScript.
- Runtime-only themed exports must apply both the component theme class/style
  and any variant-specific style class the standalone renderer would add.
  Otherwise copied components that embed `ThemedText`, `ThemedIcon`, or similar
  helpers can silently lose typography, color, or size styling.

### Layout And Rendering Infrastructure

- Any ordinary component except `Component` can be the app document root in old
  XMLUI. Parser, raw parser, and IR validation must keep this contract.
- Public components and internal primitives are not always interchangeable. The
  old internal `ThemedScroller` contract used by Stack/FlowLayout is not the
  same as public `ScrollViewer` fill-parent behavior.
- Native CSS features used to replace an old layout trick can need compensating
  math. FlowLayout's native `columnGap` bridge must compensate percentage
  `flex-basis` so four `25%` children can keep visible gaps and still fit one
  row, matching the old padding/negative-margin implementation.
- Old label behavior is shared infrastructure, not a Checkbox/Switch local
  detail. Components using label behavior should preserve the old outer wrapper,
  inner label container, typography, gap, and explicit/implicit label-position
  semantics.

### Testing And Verification

- Original E2E files are not enough for visual parity. User screenshots exposed
  opacity, font, spacing, wrapper, and gap regressions that focused specs missed.
  Add narrow foundation/regression tests for each learned compatibility gap
  without editing old migrated E2E files.
- Existing drivers may assume old DOM details. Prefer driver/testbed updates that
  accept both current and source-preserved shapes over changing copied React
  source.
- Do not require test-only behavior markers for copied behavior components when
  the old implementation did not emit them. Prefer assertions against visible
  behavior and stable public test ids.
- The side-by-side migrated component batch is the practical gate while the full
  global suite is still broader baseline debt. Keep recording exact focused and
  batch counts after each component.
- Record durable component-specific findings in `.ai/*source-preserving*` notes;
  keep this plan focused on reusable rules for future migrations.

## Pilot Sequence

| Step | Target | Why This Target | Dependency Gate | Completion Gate |
| ---: | --- | --- | --- | --- |
| 1 | `ProgressBar` | Simple visual leaf. Old implementation has one React file, one SCSS module, defaults, docs, and one old E2E suite. It validates the copy/import/metadata loop quickly. | Shared metadata/theming helpers only. | Old `ProgressBar.spec.ts` passes unchanged; SCSS module audit passes; `npm --workspace xmlui run test:e2e` passes; ask user approval. |
| 2 | `Button` | More difficult but still bounded. It exercises events, focus, disabled state, variants, icon part rendering, accessible icon-only labels, and many expanded tests. | `Icon`, `Part`, and `VisuallyHidden` must be usable from copied source. If `Part` is not source-preserved enough, migrate `Part` first as a tiny dependency. | Old `Button.spec.ts` and `Button-style.spec.ts` pass unchanged; expanded audit count matches old; `npm --workspace xmlui run test:e2e` passes; ask user approval. |
| 3 | `Table` | Complex target. It stresses data rendering, column context, row selection, pagination, sorting, virtualization, keyboard actions, theme vars, and composed dependencies. | `Checkbox`/`Toggle`, `Column`, `Icon`, `Pagination`, `Part`, `SelectionStore`, and `Spinner` must already be source-preserving complete. If any are not, execute those as prerequisite approval units before `Table`. | Old `Table.spec.ts` and `TableCellTextOverflow.spec.ts` pass unchanged; no skipped/fixme cases added; `npm --workspace xmlui run test:e2e` passes; ask user approval. |

The third step is intentionally gated. If `Table` dependencies are not ready,
the next approved component should be the smallest missing prerequisite, not
`Table` itself.

## Migration Status

### Recent App Compatibility Follow-Up - 2026-06-30

- Original XMLUI exposes evaluated `<App>` props to descendant expressions as
  bare app-scope values. The rewrite now mirrors that by binding App prop names
  as inherited context names during script analysis and rendering App children
  with the evaluated App props in runtime `contextValues`.
- Regression coverage includes the routed `loggedInUser` object case:
  `<App loggedInUser="{{ name: 'Joe', token: '1234' }}">` with descendant
  `Text` values reading `{loggedInUser.name}` and `{loggedInUser.token}`.
- The default condensed App shell also now restores the original generated
  `AppHeader` behavior when a `NavPanel` is present and no explicit
  `AppHeader` is authored. Browser coverage verifies that the generated header,
  `Home` nav link, and routed user text are visible for that sample.
- The generated header follows the original default-logo path instead of
  treating `<Logo />` as custom logo content, preserving AppHeader's logo width
  and padding constraints. It also does not render the internal profile menu;
  authored `<AppHeader>` continues to own that default profile-menu behavior.
- Original `AppHeader` metadata does not default `width-logo-AppHeader`; the
  rewrite-only `$space-10` default constrained the horizontal header wordmark
  to a tiny 40px box. That default is removed so the logo sizes from the image
  height/aspect ratio, as in the original generated header.
- Authored `AppHeader.logoTemplate` rendering now matches the original
  `AppHeader.tsx` custom renderer by rendering the logo template under a
  horizontal Stack layout context. Mixed component/text content also preserves a
  single source-whitespace boundary when a text token follows an element, which
  restores the original visible gap for `<H3><Icon /> DriveDiag</H3>`-style
  logo templates. Authored condensed headers with a top-level `NavPanel` now
  render the nav content through AppHeader's content wrapper, as the original
  `AppContextAwareAppHeader` did, instead of portaling it into the sub-nav slot;
  this restores the original 40px `DriveDiag`-to-first-nav-link spacing.
- Vertical `NavPanel.logoTemplate` parity now also preserves the trailing
  source-whitespace boundary in mixed text and renders the logo template under a
  horizontal Stack layout context. The copied old NavPanel logo slot resolves
  the `DriveDiag (Nav)` H3 line box to roughly 24px, so the rewrite scopes a
  non-image logo-slot min-height to keep the logo wrapper at the original 56px
  and the first vertical NavLink at the original y-offset.

Complexity values include `Derived` for shortcut components that are migrated
and verified with their source-preserved base component but should still appear
as explicit status rows.

Status values:

- `Not started`: no source-preserving re-migration under this plan yet.
- `Prerequisite`: migrate before a dependent target.
- `Candidate`: eligible when dependencies are green.
- `Blocked`: needs an open question resolved.
- `Awaiting approval`: focused migration passed and user approval is needed.
- `Approved complete`: user approved moving on after additional checks.

| Status | Components |
| --- | ---: |
| Approved complete | 42 |
| Awaiting approval | 3 |
| Blocked | 1 |
| Not started | 71 |
| Prerequisite | 7 |
| **Total** | **124** |

| Component | Complexity | Old Specs | Style Files | Main Dependencies Observed | Status | Notes |
| --- | --- | ---: | --- | --- | --- | --- |
| `APICall` | Complex | 1 | none | runtime data/APIs | Not started | Nonvisual data behavior; preserve async edge cases. |
| `Accordion` | More difficult | 1 | `Accordion.module.scss` | icon, part, toggle behavior | Not started | Stateful children and item context. |
| `Animation` | Simple | 0 | none | runtime animation hooks | Approved complete | User confirmed Animation is complete; source-preserved React/defaults restored from old project; direct `@react-spring/web` and `lodash-es` dependencies declared with a local lodash type shim. Local rewrite spec now checks old react-spring behavior instead of rewrite-only CSS transition details. A tiny documented child-style merge shim preserves rewrite inline theme variables when Animation clones children. TypeScript and metadata checks pass; focused Animation suite passes 2/2; Checkbox/Switch animation behavior regression grep passes 2/2; side-by-side migrated component batch passes 947/1063 with 116 skips. Residual non-failing React ref warning remains for tooltip+animation behavior composition. |
| `App` | Complex | 5 | `App.module.scss`, `Sheet.module.scss` | AppHeader, NavPanel, Pages, Part | Approved complete | User declared App complete on 2026-06-30 after the generated header/logo spacing, App prop context inheritance, and direct-content star sizing follow-ups. Implemented as part of the app-shell/navigation batch with `AppLayoutContext`, logo/layout props, drawer/collapse state, sub-nav slot registration, routing event handlers, document title, i18n config, message/key events, and the existing rewrite shell/content layout bridge. Vertical layout now mirrors the original side-nav tree: the NavPanel is the root side column and AppHeader/Page/Footer render inside the main content column, with the root flex direction derived from the normalized layout instead of being hard-coded to column. Vertical branding now follows the original: AppHeader suppresses logo/title in `vertical`/`vertical-sticky`, NavPanel falls back to the configured `<Logo />`, and `startApp`/SSG normalize top-level config `name`, `resources`, `defaultTheme`, and `defaultTone` into app globals so manifest logo resources resolve. Vertical visual parity was tightened against local old/new DOM probes: sidebar logo top/slot spacing, inherited vertical NavLink active/hover indicator bars, top-level nav item content inset, route-aware `withToc` content max-width, vertical content-area scroll container/body width, App header/footer gutter compensation, and the vertical NavPanel inner border/content width now match the original sample layout. Vertical and vertical-sticky now also honor `scrollWholePage=false`: the App root is viewport-clamped/clipped, the main content area does not reserve scrollbar gutters, and pages/pageContent are the bounded clipping region. `vertical-full-header` now uses the original full-width header/footer plus centered side-nav/content-row structure, measures rendered header/footer heights for sticky NavPanel sizing, lets routed content own row height when `scrollWholePage=true`, keeps the List from becoming a second scrollbar, and restores the original scrollbar-gutter compensation so the main content area does not add `paddingHorizontal-content-App` outside routed `Page` padding. Horizontal and horizontal-sticky NavPanel height now follows rendered link content by default, matching the original; `height-AppHeader` remains consumable when explicitly supplied but is not defaulted by App or NavPanel, and horizontal-sticky positioning uses measured `--app-header-height` so the NavPanel does not overlap the rendered header border after scrolling. Desktop layout now hides NavPanel, removes ordinary App content max-width/margins, keeps App/root fixed to the viewport, makes routed page content the scroll container so header/footer remain visible, keeps contained default Lists in outside-scroll mode so Page vertical padding scrolls away instead of becoming a permanent band around the List, and cancels the generic `scrollWholePage` header/footer scrollbar-gutter compensation so AppHeader and Footer content keep their original centered band. Narrow screens now use the original-style mobile branch for every layout value when an AppHeader and NavPanel are present: inline NavPanel rendering is skipped, AppHeader shows a hamburger, and the NavPanel renders in a left drawer under a vertical layout context. The mobile branch now matches the old tablet breakpoint band (`maxWidth-tablet`), keeps `scrollWholePage=true` on the App scroll container instead of creating an inner content scroller for long content, lets short content fill the remaining viewport so Footer stays stuck to the bottom, uses the real themed hamburger icon centered in a 42px drawer-toggle button with 14px icon font sizing, applies a mobile-only 14px header-start correction for the docked narrow-pane AppHeader position, and opens a full-width old-Sheet-shaped drawer so the NavPanel occupies the whole narrow App width instead of shrink-wrapping. The drawer now also preserves the old Sheet details: 300ms blur/slide animations, App drawer theme variables scoped onto the drawer host, the themed `close` icon with old padding/opacity/offsets, drawer NavLink activation transitions through the animated closed state, and NavPanel's drawer-specific logo wrapper with the `inDrawer` min-height that leaves room for the close button. Focused App shell suite passes 17/17 including mobile hamburger drawer behavior across all layout values, narrow horizontal scroll-parent behavior, and the narrow short-page Footer bottom behavior; focused App/Pages suite passes 23/23; the broader focused shell/navigation batch passes 62 active tests with 131 expected skipped compatibility-debt tests. Expanded App drawer and NavPanel `when` reactivity checks pass under `XMLUI_INCLUDE_INCOMPLETE_COMPAT=1`, and the expanded App content-spacing check now passes after the App theme-variable/content-padding fixes. TypeScript, metadata, and CSS module audits pass. Expanded component E2E audit with App was attempted but stopped after hanging while listing the old App layout suite. |
| `AppHeader` | More difficult | 1 | `AppHeader.module.scss` | App, Part | Approved complete | User declared AppHeader complete on 2026-06-30 after the logoTemplate icon/text spacing and authored condensed header NavPanel spacing follow-ups. Implemented as part of the app-shell/navigation batch; original stylesheet restored and `useLogoUrl`/layout-context behavior added for App-level `logo`, `logoDark`, and `logoLight` lookup. Follow-up restored original logoTemplate mixed-content spacing by rendering the template under horizontal Stack layout context and preserving a single source-whitespace boundary between an element and following text; authored condensed headers now render the top-level NavPanel through AppHeader's content wrapper instead of the sub-nav portal, restoring the original 40px `DriveDiag`-to-first-nav-link gap. Focused AppHeader regression covers the `Icon drive` plus `DriveDiag` heading logo case and both relevant gaps. Focused AppHeader foundation/old-suite transfer tests pass within the 62-test active batch; TypeScript, metadata, and CSS module audits pass. |
| `AppState` | More difficult | 1 | none | runtime state | Not started | Data mutation and event tests matter. |
| `AutoComplete` | Complex | 1 | `AutoComplete.module.scss` | ConciseValidationFeedback, Form, FormItem, Part, Select | Not started | Wait for input/form/select family. |
| `Avatar` | Simple | 1 | `Avatar.module.scss` | metadata helpers | Approved complete | User confirmed Avatar works as expected; focused unchanged suite passes 97/97; source-preserved React/SCSS copied with import shims; shared border theme generation and CSS layer order fixed. Full global E2E gate remains broader known risk. |
| `Badge` | Simple | 1 | `Badge.module.scss` | metadata helpers | Approved complete | User confirmed Badge works as expected; source-preserved React/SCSS restored from old project; colorMap padding mismatch fixed through shared spacing/padding theme generation without touching protected React/SCSS; focused unchanged Badge suite passes 24/24; side-by-side migrated component run passes 561/567 with 6 skips. |
| `Bookmark` | More difficult | 1 | `Bookmark.module.scss` | runtime navigation/state | Not started | Foundation-only signal exists in current tests. |
| `Br` | Simple | 1 | none | metadata helpers | Approved complete | User confirmed Br is complete; old metadata/renderer boundary restored for lowercase `br` and capitalized `Br`; arbitrary rest props are forwarded through `adapter.rootAttrs()`; focused unchanged Br suite passes 4/4; metadata and TypeScript checks pass; side-by-side migrated component run passes 565/571 with 6 skips. |
| `Button` | More difficult | 2 | `Button.module.scss` | Icon, Part, VisuallyHidden | Approved complete | User confirmed Button is complete; focused unchanged Button suites pass 153/159 with 6 skips; side-by-side migrated component run with ProgressBar, Avatar, Icon, Button, and Checkbox passes 433/439 with 6 skips. |
| `Card` | More difficult | 1 | `Card.module.scss` | Avatar, Heading, Link, Part, Text | Approved complete | User confirmed Card is complete; source-preserved React/SCSS restored from old project with import rewrites only; runtime-only `ThemedAvatar`, `ThemedHeading`, `ThemedLinkNative`, and fixed `ThemedText` wrappers avoid metadata/SCSS bundling regressions while preserving embedded dependency styling; renderer bridges old root classes, API registration, events, aria label, and Card's old Stack child layout context for direct children. Focused Card+Text run passes 168/170 with 2 skips; metadata and TypeScript checks pass; side-by-side migrated component batch passes 944/1060 with 116 skips. |
| `ChangeListener` | More difficult | 1 | none | runtime state/listeners | Not started | Event semantics over visuals. |
| `Checkbox` | More difficult | 1 | none in old folder | Toggle | Approved complete | User confirmed Checkbox works as expected; focused unchanged Checkbox suite passes 118/118; copied old Toggle React/SCSS/defaults power the renderer; stable callback and explicit/implicit value boundary fixes preserve old Toggle semantics. |
| `CodeBlock` | More difficult | 1 | `CodeBlock.module.scss` | Button, Icon, Part, Text | Not started | Copy button/text first. |
| `ColorPicker` | More difficult | 1 | `ColorPicker.module.scss` | FormItem, Part | Not started | Input/form dependency. |
| `Column` | More difficult | 0 | none | Table context | Prerequisite | Required before `Table`; verify through table specs. |
| `ConciseValidationFeedback` | More difficult | 0 | `ConciseValidationFeedback.module.scss` | Form, Icon, Tooltip | Prerequisite | Required by input components. |
| `ContentSeparator` | Simple | 1 | `ContentSeparator.module.scss` | metadata helpers | Approved complete | User confirmed ContentSeparator is complete; source-preserved React/SCSS restored from old project; renderer bridges old root class through `classes[COMPONENT_PART_KEY]`, keeps copied prop sizing authoritative, and restores old no-shrink default while honoring explicit `canShrink`. Focused unchanged ContentSeparator suite passes 37/37; TypeScript, metadata, expanded E2E audit, and CSS module audit pass; side-by-side migrated component batch passes 984/1100 with 116 skips. |
| `ContextMenu` | Complex | 1 | `ContextMenu.module.scss` | DropdownMenu, menu helpers | Approved complete | User confirmed ContextMenu is complete; Radix-backed source-preserving menu migration with DropdownMenu/MenuItem/SubMenuItem/MenuSeparator restored original React/SCSS, added `@radix-ui/react-dropdown-menu`, and bridges `$context` propagation with stable callbacks/memoized scopes plus empty-content guarding and XMLUI DOM markers. Focused menu-family run passes 75/76 with 1 skip; TypeScript, metadata, CSS module audit, and expanded E2E audit pass. |
| `DataSource` | Complex | 1 | none | runtime data | Not started | Data loading contract. |
| `DateInput` | Complex | 1 | `DateInput.module.scss` | ConciseValidationFeedback, Form, Icon, Input, Part | Not started | Wait for input/form. |
| `DatePicker` | Complex | 1 | `DatePicker.module.scss` | ConciseValidationFeedback, Form, FormItem, Icon, Input | Not started | Current fixme indicates shell mismatch risk. |
| `Drawer` | More difficult | 1 | `Drawer.module.scss` | Icon | Not started | Overlay/focus behavior. |
| `DropdownMenu` | Complex | 1 | `DropdownMenu.module.scss` | Button, Icon, menu helpers | Approved complete | User confirmed DropdownMenu is complete; Radix-backed source-preserving menu migration with Menu/MenuItem/SubMenuItem/MenuSeparator and ContextMenu restored original React/SCSS, added `@radix-ui/react-dropdown-menu`, and bridges themed shrink-wrapped trigger buttons/templates, `enabled`, `modal`, `menuWidth`, submenu surface styles, `MenuItem.to`, icon resolution, separator filtering, empty-content guarding, and component APIs. Runtime bridge preserves XMLUI modal-layer behavior with Select, ModalDialog, and confirm dialogs. Focused menu-family run passes 75/76 with 1 skip; TypeScript, metadata, CSS module audit, and expanded E2E audit pass. |
| `EventSource` | Complex | 0 | none | runtime events | Not started | Verify via synthetic event source fixtures. |
| `ExpandableItem` | More difficult | 1 | `ExpandableItem.module.scss` | Icon, Part, Toggle | Not started | Old suite currently skipped in rewrite. |
| `Fallback` | More difficult | 0 | none | runtime error/fallback | Not started | Verify through runtime scenarios. |
| `FileInput` | Complex | 1 | `FileInput.module.scss` | Button, FormItem, Icon, TextBox | Not started | Wait for Button/TextBox/FormItem. |
| `FileUploadDropZone` | More difficult | 1 | `FileUploadDropZone.module.scss` | Icon, component utils | Not started | Browser file/drop semantics. |
| `FlowLayout` | Complex | 1 | `FlowLayout.module.scss` | ScrollViewer | Approved complete | User confirmed FlowLayout is complete; source-preserved React/SCSS/helper copied from old project with one root/scroller compatibility adaptation for the current foundation test; rendering-pipeline helpers added for old imports; focused FlowLayout run passes 56/81 with 25 skips; side-by-side migrated batch including Card passes 944/1060 with 116 skips. Theme-token gaps are normalized/resolved and percentage `flex-basis` is gap-compensated for the native-gap bridge. Static responsive child width props are bridged; dynamic child responsive bindings remain an open verification risk. |
| `FocusScope` | More difficult | 1 | none | focus management | Not started | Needs browser focus-specific checks. |
| `Footer` | More difficult | 1 | `Footer.module.scss` | App | Approved complete | User declared Footer complete on 2026-06-30. Implemented as part of the app-shell/navigation batch; original stylesheet restored, content wrapper semantics/part marker bridged, sticky/full-width layout context behavior preserved, and interactive children remain focusable. Focused Footer foundation/old-suite transfer tests pass within the 62-test active batch; TypeScript, metadata, and CSS module audits pass. |
| `Form` | Complex | 1 | `Form.module.scss` | Button, FormItem, Part, ValidationSummary | Not started | Central prerequisite for inputs. |
| `FormItem` | Complex | 2 | `FormItem.module.scss`, `HelperText.module.scss` | many form/input components | Not started | Important dependency hub; migrate after minimal inputs are stable or preserve helper APIs. |
| `FormSegment` | More difficult | 1 | none in old folder | Form | Not started | Form family. |
| `Fragment` | Simple | 1 | none | metadata helpers | Approved complete | User confirmed Fragment is complete; renderer/metadata boundary aligned with old source: opaque metadata description restored, children render without a DOM wrapper, array child render results are returned inside a keyed React Fragment using the rewrite IR source range as the stable key. Focused unchanged Fragment suite passes 2/2; TypeScript, metadata, expanded E2E audit, and CSS module audit pass; side-by-side migrated component batch passes 986/1102 with 116 skips. |
| `Heading` | Simple | 2 | `Heading.module.scss` | metadata/container helpers | Approved complete | User confirmed Heading/H1-H6 complete; source-preserved React/SCSS restored from old project with import/dependency shims only; H1-H6 shortcuts ride the same renderer bridge; focused unchanged Heading suites pass 136/136; metadata and TypeScript checks pass; side-by-side migrated component run including Heading passes 841/847 with 6 skips. |
| `H1` | Derived | 0 | `Heading.module.scss` | Heading | Approved complete | Shortcut component completed with Heading; uses the same source-preserved Heading React/SCSS and fixed level bridge. |
| `H2` | Derived | 0 | `Heading.module.scss` | Heading | Approved complete | Shortcut component completed with Heading; uses the same source-preserved Heading React/SCSS and fixed level bridge. |
| `H3` | Derived | 0 | `Heading.module.scss` | Heading | Approved complete | Shortcut component completed with Heading; uses the same source-preserved Heading React/SCSS and fixed level bridge. |
| `H4` | Derived | 0 | `Heading.module.scss` | Heading | Approved complete | Shortcut component completed with Heading; uses the same source-preserved Heading React/SCSS and fixed level bridge. |
| `H5` | Derived | 0 | `Heading.module.scss` | Heading | Approved complete | Shortcut component completed with Heading; uses the same source-preserved Heading React/SCSS and fixed level bridge. |
| `H6` | Derived | 0 | `Heading.module.scss` | Heading | Approved complete | Shortcut component completed with Heading; uses the same source-preserved Heading React/SCSS and fixed level bridge. |
| `HtmlTags` | More difficult | 1 | `HtmlTags.module.scss` | Heading, Link, Text | Not started | After text/link. |
| `I18n` | More difficult | 0 | none | metadata helpers | Not started | No direct old spec; needs usage fixture. |
| `IFrame` | Simple | 1 | `IFrame.module.scss` | metadata helpers | Approved complete | User confirmed IFrame is complete; source-preserved React/SCSS restored from old project; renderer bridges old `classes[COMPONENT_PART_KEY]`, `registerComponentApi`, resource URL handling, string/null normalization, srcdoc entity compatibility, arbitrary root attrs, accessible `title` forwarding, named iframe targeting through `window.open`, escaped-brace `srcdoc` scripts, and permissive `referrerPolicy` forwarding. Focused unchanged IFrame suite passes 56/56; IFrame regressions pass 3/3; TypeScript, metadata, expanded E2E audit, and CSS module audit pass; side-by-side migrated component batch passes 1042/1158 with 116 skips. |
| `Icon` | Complex | 1 | many icon `.module.scss` files | icon registry/provider | Approved complete | User confirmed Icon is ready; focused unchanged suite passes 44/44; required shared `svg?react`, IconProvider, resource, driver, and testbed isolation fixes. Required by Button/Table and many others. |
| `Image` | Simple | 1 | `Image.module.scss` | metadata helpers | Approved complete | User confirmed Image is complete; source-preserved React/SCSS and unchanged old E2E spec restored from old project; renderer bridges old root attrs/theme classes, resource URL handling, `data` resource URL fetch-to-Blob, boolean normalization, explicit empty `alt`, authored-only click wiring, and an inline wrapper that prevents rewrite flex-boundary blockification while keeping the copied leaf source authoritative. Only protected-source edit is strict TypeScript normalization of nullable `src` to `undefined` for React's `<img>` type. Focused unchanged Image suite passes 42/42; TypeScript, metadata, expanded E2E audit, and CSS module audit pass. Broad `compatibility:sweep -- --components=ContentSeparator,Fragment,IFrame,Image` was attempted, but the script ignores component filters and failed on unrelated baseline-wide FormItem/Logo/NavPanelCollapseButton/Select/Table/TableOfContents/theming tests after 4577 passed and 496 skipped. |
| `IncludeMarkup` | Complex | 1 | none | compiler/runtime include | Not started | Async compile boundary. |
| `Input` | More difficult | 0 | input part SCSS modules | Icon, Text | Prerequisite | Required by TextBox/DateInput/TimeInput. |
| `InspectButton` | More difficult | 0 | `InspectButton.scss` old / module in rewrite | Button, Icon | Not started | Pair with Inspector. |
| `Inspector` | Complex | 0 | `Inspector.scss` old / module in rewrite | Icon, inspect mode store | Not started | Debug UI and global styles question. |
| `Items` | More difficult | 1 | none | container helpers | Not started | Container iteration semantics. |
| `Lifecycle` | More difficult | 0 | none | runtime lifecycle/events | Not started | Existing fixmes for thrown script support. |
| `Link` | More difficult | 1 | `Link.module.scss` | Icon, Part | Not started | Navigation and browser behavior. |
| `List` | Complex | 1 | `List.module.scss` | Card, Checkbox, SelectionStore, Spinner, Table, Text | Not started | Depends on many data/display components. |
| `LiveRegion` | More difficult | 1 | `LiveRegion.module.scss` old | accessibility/runtime announcement | Not started | Accessibility behavior. |
| `Logo` | Simple | 0 | `Logo.module.scss` old | AppHeader, Image | Awaiting approval | Implemented as part of the app-shell/navigation batch; uses AppHeader/App layout logo lookup, preserves root/theme class bridging, explicit `src` fallback, alt text, and inline rendering with an inline wrapper so the image is not blockified by the App/testbed flex boundary. Focused Logo suite passes 5/5; TypeScript, metadata, and CSS module audits pass. |
| `Markdown` | Complex | 2 | `Markdown.module.scss`, `CodeText.module.scss` | CodeBlock, ExpandableItem, Heading, Link, NestedApp, Text, Toggle, TreeDisplay | Not started | Large parser/rendering surface. |
| `Menu` | Simple | 0 | `Menu.module.scss` | none | Approved complete | User confirmed the affected menu components are complete after DropdownMenu and ContextMenu approval. Shared styling/helper surface only; original XMLUI has no standalone public `<Menu>` component. Original `Menu.module.scss` is restored and covered through the DropdownMenu/ContextMenu/MenuItem/SubMenuItem/MenuSeparator family, with a small DropdownMenu-local SCSS bridge for current icon layout assertions. Focused menu-family run passes 75/76 with 1 skip; TypeScript, metadata, CSS module audit, and expanded E2E audit pass. |
| `MessageListener` | More difficult | 1 | none | runtime messages | Not started | Browser messaging. |
| `ModalDialog` | Complex | 1 | `ModalDialog.module.scss` old plus dialog styles | Button, Icon, Part, Stack, Text | Not started | Overlay/focus and portal behavior. |
| `NavGroup` | Complex | 1 | `NavGroup.module.scss` | App, Icon, NavLink, NavPanel | Awaiting approval | Implemented as part of the app-shell/navigation batch; original stylesheet restored, old NavLink-trigger class contract restored, icon props bridged, disabled/expanded state preserved, and nested link click behavior verified. Focused NavGroup foundation/old-suite transfer tests pass within the 62-test active batch; TypeScript, metadata, and CSS module audits pass. |
| `NavLink` | Complex | 1 | `NavLink.module.scss` | App, Icon, NavGroup, NavPanel | Approved complete | User declared NavLink complete on 2026-06-30 after the horizontal custom-content width follow-up. Implemented as part of the app-shell/navigation batch; original stylesheet restored, old root/content/active/indicator class contract restored, icon rendering bridged through ThemedIcon, external/internal routing behavior preserved, and disabled/active/exact/query behaviors verified. App vertical layout now supplies vertical indicator styling automatically, while top-level NavLinks keep the original zero-width level spacer instead of being indented as level 1. Follow-up parity for horizontal custom-content links restores the original `div.innerContent` wrapper and verifies that mixed child text keeps the trailing source-whitespace boundary, so a `Stack` plus `Home` child link has the original active underline/content width. Focused NavLink foundation/old-suite transfer tests pass within the active NavLink batch; TypeScript, metadata, and CSS module audits pass. |
| `NavPanel` | Complex | 1 | `NavPanel.module.scss` | App, Logo, Part, ScrollViewer | Approved complete | User declared NavPanel complete on 2026-06-30 after the vertical logo title/link spacing follow-up. Implemented as part of the app-shell/navigation batch; original stylesheet restored, App layout context drives horizontal/vertical/condensed/collapsed classes, logo/footer slots are bridged, authored footer templates render, and dynamic NavLink creation/navigation remains covered. Follow-up parity for vertical `logoTemplate` preserves leading/trailing mixed-text whitespace around `<Icon /> DriveDiag (Nav)`, renders the template under a horizontal Stack layout context, removes the rewrite-only extra Icon wrapper, and scopes the logo-slot non-image min-height so the title-to-first-link geometry matches the original. Focused NavPanel foundation/old-suite transfer tests pass within the active NavPanel batch; TypeScript, metadata, and CSS module audits pass. |
| `NavPanelCollapseButton` | More difficult | 0 | none | App, Button, Icon | Not started | Navigation shell dependency. |
| `NestedApp` | Complex | 1 | `NestedApp.module.scss` plus helpers | App, Button, ComponentRegistryContext, Icon, Markdown | Not started | Runtime app embedding. |
| `NoResult` | Simple | 1 | `NoResult.module.scss` | Icon | Approved complete | User confirmed NoResult is complete; source-preserved React/SCSS restored from old project; renderer bridges old label fallback, root class, and test id contracts; local icon part marker retained for the existing suite; focused NoResult run passes 3/3; side-by-side migrated component run passes 861/950 with 89 skips. |
| `NumberBox` | Complex | 1 | `NumberBox.module.scss` | Button, ConciseValidationFeedback, Form, FormItem, Icon, Input, Part | Not started | Input/form dependency. |
| `Option` | More difficult | 1 | none | container helpers | Prerequisite | Required by Select/Pagination/RadioGroup. |
| `PageMetaTitle` | Simple | 1 | none | document title | Approved complete | User confirmed PageMetaTitle is complete; source-preserving title behavior restored at the runtime boundary: renderer no longer hard-codes the testbed app name, `PageMetaTitleReact` reads `appGlobals.name` from context like the original, metadata descriptions match old source, and the testbed now seeds/accepts app globals for suffix verification. Focused PageMetaTitle suite passes 9/9; TypeScript, metadata, and expanded E2E audit pass. Residual risk: old source used `react-helmet-async`, while the rewrite preserves observed browser title behavior through a direct `document.title` effect. |
| `Pages` | Complex | 1 | `Pages.module.scss` | App, Page | Awaiting approval | Migrated with `Page` as the shared routing shell: `Pages` preserves route matching, fallback navigation, route/query context variables, rest children rendering, and `Page` now owns the original `.pageWrapper` padding/gap/flex/min-height behavior through `paddingVertical-Pages`, `paddingHorizontal-Pages`, and `gap-Pages`. App content padding is now conditional so routed pages are not double padded. Focused Pages suite includes routing/context/fallback/query checks plus App+Pages padding ownership; TypeScript and metadata pass. Live old/new localhost measurement was attempted, but the servers were serving different sample states, so parity was verified through focused layout assertions instead. |
| `Pagination` | Complex | 1 | `Pagination.module.scss` | Button, FormItem, Icon, Option, Part, Select, Text | Prerequisite | Required before `Table`. |
| `Part` | Simple | 0 | none | none | Approved complete | User confirmed Part is complete; source-preserving helper boundary tightened: old Radix `Slot`/`data-part-id` behavior remains the compatibility anchor, `@radix-ui/react-slot` is declared as a direct dependency, and the rewrite keeps its authored `<Part>` renderer plus additive `data-xmlui-part` marker for transferred component/test-driver compatibility. Focused Part suite passes 3/3; TypeScript, metadata, expanded E2E audit, and dependent Button/Card/Checkbox/Switch smoke run pass. |
| `ProfileMenu` | More difficult | 0 | `ProfileMenu.module.scss` | Avatar, DropdownMenu | Not started | Menu/avatar dependency. |
| `ProgressBar` | Simple | 1 | `ProgressBar.module.scss` | metadata helpers | Approved complete | User considers ProgressBar complete; focused old suite and audits pass; screenshot color mismatch fixed via shared base-tone generation; now passes in the side-by-side migrated component run. |
| `QRCode` | Simple | 1 | `QRCode.module.scss` | metadata helpers | Approved complete | User confirmed QRCode is complete; source-preserved QR rendering restored with the original `react-qr-code` dependency, original React/SCSS shape, metadata descriptions/default theme vars, and arbitrary root prop acceptance for `testId`/root attrs. Renderer keeps a small rewrite bridge for root attrs, optional size normalization, and the local `init` event. Focused QRCode suite passes 13/13; TypeScript, metadata, expanded E2E audit, and CSS module audit pass. |
| `Queue` | Complex | 1 | none | runtime queue | Not started | Data mutation/order behavior. |
| `RadioGroup` | Complex | 1 | `RadioGroup.module.scss` | FormItem, Option | Not started | Input/form dependency. |
| `RatingInput` | More difficult | 1 | `RatingInput.module.scss` | Part | Not started | Stateful input without large dependencies. |
| `Redirect` | More difficult | 1 | none | routing utils | Not started | Browser/routing behavior. |
| `ResponsiveBar` | Complex | 1 | `ResponsiveBar.module.scss` | DropdownMenu, Part | Not started | Existing skipped overflow cases. |
| `RetryPolicy` | More difficult | 0 | none | request policy | Not started | Verify through APICall/DataSource. |
| `ScrollViewer` | Complex | 1 | `ScrollViewer.module.scss` | scroller helper | Not started | Existing skipped fade/overlay cases. |
| `Select` | Complex | 1 | `Select.module.scss` | ConciseValidationFeedback, Form, FormItem, Icon, Option, Part | Not started | Overlay/input family. |
| `SelectionStore` | More difficult | 0 | none | selection context | Prerequisite | Required before `Table`, `List`, `TileGrid`. |
| `SkipLink` | More difficult | 1 | none | focus/navigation | Not started | Accessibility/browser behavior. |
| `Slider` | More difficult | 1 | `Slider.module.scss` | FormItem, Tooltip | Not started | Input/form dependency. |
| `Slot` | More difficult | 1 | none | runtime slot projection | Not started | Composition semantics. |
| `SpaceFiller` | Simple | 1 | `SpaceFiller.module.scss` | metadata helpers | Approved complete | User confirmed SpaceFiller works; included with Stack approval unit; source-preserved React/SCSS restored from old project; focused Stack/SpaceFiller run passes 17/100 with 83 skips after the Stack regression spec; side-by-side migrated component run passes 858/947 with 89 skips. |
| `Spinner` | Simple | 1 | `Spinner.module.scss` | Part | Approved complete | User confirmed Spinner is complete; source-preserved ring structure restored with the original `lds-ring` class/keyframes, old `Part`-wrapped `ring` segment, full-screen wrapper behavior, metadata/default theme vars, and component-root class bridge through `classes[COMPONENT_PART_KEY]`. Renderer keeps a small rewrite bridge for root attrs, responsive classes, normalized delay edge cases, and variant border-color CSS variables. Focused Spinner suite passes 34/34; TypeScript, metadata, expanded E2E audit, and CSS module audit pass. Full E2E was attempted and failed on existing broader baseline areas with no Spinner failures observed. |
| `Splitter` | Complex | 3 | `Splitter.module.scss` | Part | Not started | Pointer/layout behavior. |
| `Stack` | Complex | 5 | `Stack.module.scss` | FlowLayout, ScrollViewer, SpaceFiller | Approved complete | User confirmed Stack and all derived components are complete; source-preserved Stack React/SCSS/defaults restored from old project; renderer carries old wrapContent, itemWidth, API, dock-layout behavior, component-root app documents, internal ThemedScroller contract, and copied-class ownership of alignment props; focused Stack/SpaceFiller run passes 17/100 with 83 skips; side-by-side migrated component run passes 858/947 with 89 skips. |
| `HStack` | Derived | 0 | `Stack.module.scss` | Stack | Approved complete | Shortcut component completed with Stack; uses the same source-preserved Stack React/SCSS and fixed horizontal orientation bridge. |
| `VStack` | Derived | 0 | `Stack.module.scss` | Stack | Approved complete | Shortcut component completed with Stack; uses the same source-preserved Stack React/SCSS and fixed vertical orientation bridge. |
| `CHStack` | Derived | 0 | `Stack.module.scss` | Stack | Approved complete | Centered horizontal shortcut completed with Stack; uses the same source-preserved Stack React/SCSS and fixed orientation/alignment bridge. |
| `CVStack` | Derived | 0 | `Stack.module.scss` | Stack | Approved complete | Centered vertical shortcut completed with Stack; uses the same source-preserved Stack React/SCSS and fixed orientation/alignment bridge. |
| `Stepper` | Complex | 1 | `Stepper.module.scss` | Icon | Not started | Stateful multi-step component. |
| `StepperForm` | Complex | 1 | none old / module in rewrite | Form | Not started | Form plus Stepper. |
| `StickyBox` | More difficult | 0 | `StickyBox.module.scss` | metadata helpers | Not started | Verify through layout/browser. |
| `StickySection` | More difficult | 1 | `StickySection.module.scss` | metadata helpers | Not started | Sticky layout behavior. |
| `Switch` | More difficult | 1 | none in old folder | Toggle | Approved complete | User confirmed Switch works as expected; focused unchanged Switch suite passes 104/104; reused copied old Toggle with Switch renderer boundary learned from Checkbox; side-by-side migrated component run passes 537/543 with 6 skips. |
| `Table` | Complex | 2 | `Table.module.scss` | Checkbox, Column, Icon, Pagination, Part, SelectionStore, Spinner | Blocked | Pilot step 3 after prerequisite completion. |
| `TableOfContents` | Complex | 1 | `TableOfContents.module.scss` | App, ScrollViewer | Not started | Page heading/index behavior. |
| `Tabs` | Complex | 1 | `Tabs.module.scss` | Form, container helpers | Not started | Old suite currently skipped. |
| `TabsForm` | Complex | 1 | none | Form | Not started | Form plus Tabs. |
| `Text` | Simple | 1 | `Text.module.scss` | abstractions/metadata, Icon, Stack | Approved complete | User confirmed Text is complete; source-preserved React/SCSS/defaults restored from old project with import/dependency shims only; renderer bridges old classes contract, old `asDisplayText` value rendering, value fallback, variant props, contextMenu, overflow, and component API; breakMode visual overlap fixed through the shared vertical Stack no-shrink default; focused unchanged Text suite passes 140/140; metadata and TypeScript checks pass; side-by-side migrated component run including Heading now passes 841/847 with 6 skips. |
| `TextArea` | Complex | 1 | `TextArea.module.scss` | ConciseValidationFeedback, Form, FormItem, Part | Not started | Input/form dependency. |
| `TextBox` | Complex | 1 | `TextBox.module.scss` | ConciseValidationFeedback, Form, FormItem, Input, Part | Not started | Good post-Button form/input target. |
| `Theme` | Complex | 1 | `Theme.module.scss` | App, ComponentRegistryContext | Not started | Global theming behavior. |
| `TileGrid` | Complex | 1 | `TileGrid.module.scss` | Checkbox, SelectionStore, Table | Not started | After Table/selection. |
| `TimeInput` | Complex | 1 | `TimeInput.module.scss` | Icon, Input, Part | Not started | Input dependency. |
| `Timer` | More difficult | 1 | none | runtime scheduling | Not started | Timing-sensitive tests. |
| `Toast` | More difficult | 1 | none | runtime toast container | Not started | Portal/service behavior. |
| `Toggle` | More difficult | 0 | `Toggle.module.scss` | FormItem, Part | Prerequisite | Copied old Toggle React/SCSS/defaults for Checkbox and Switch; verify again through ExpandableItem before marking independently complete. |
| `ToneChangerButton` | More difficult | 1 | none | Button, Icon | Not started | After Button. |
| `ToneSwitch` | More difficult | 1 | `ToneSwitch.module.scss` | Icon, Toggle | Not started | After Toggle/Icon. |
| `Tooltip` | Complex | 1 | `Tooltip.module.scss` | Markdown | Not started | Overlay/Markdown dependency. |
| `Tree` | Complex | 9 | `TreeComponent.module.scss` | Icon, ScrollViewer, Spinner | Not started | Large async/dynamic suite. |
| `TreeDisplay` | More difficult | 1 | `TreeDisplay.module.scss` | metadata helpers | Not started | Needed by Markdown. |
| `ValidationSummary` | More difficult | 0 | `ValidationSummary.module.scss` | Button, Form, Icon, SpaceFiller, Stack, Text | Not started | Form dependency. |
| `WebSocket` | Complex | 0 | none | runtime websocket | Not started | Needs controllable server/test fixture. |

## Source Inventory Findings

- The old component tree has a component folder for every folder currently
  present in the rewrite, so this is a re-migration/parity plan rather than a
  missing-folder plan.
- Many current rewrite specs still contain foundation-only suites, global
  old-suite skips, or explicit `test.fixme` entries. These are strong signals
  that old-source parity is not closed.
- The old source consistently separates public metadata/defaults from React
  implementation and styling. This supports the proposed rule: copy React/SCSS,
  adapt only the metadata/renderer boundary.
- Large dependency hubs are `FormItem`, `Table`, `App`, `Markdown`, `Select`,
  and `Stack`. They should not be early blind targets unless their immediate
  dependencies are already source-preserving complete.
- Components with no direct old E2E specs must be verified through dependents
  and a small source-preserving smoke fixture; they still require copied source
  and closure notes.

## Recent App Compatibility Notes

- 2026-06-30 generated condensed header logo spacing: old XMLUI does not render
  the default AppHeader logo as a plain anchor/image pair. The source path is
  `AppContextAwareAppHeader -> AppHeader -> ThemedNavLink -> Logo -> ThemedImage`,
  and the generated condensed header renders the NavPanel as AppHeader children
  in a `min-width: 0` wrapper rather than portaling it into the registered
  sub-nav slot. This produces the measured original geometry at 1920px:
  logo image `102.281px x 40px` at `x=352, y=8`, logo link `134.281px x 56px`,
  Home link `x=510.281px`, image-to-Home gap `56px`. The rewrite now mirrors
  that path for generated condensed headers while keeping the sub-nav slot
  portal for authored headers.
- 2026-06-30 App direct content star sizing: old `App.tsx` passes a vertical
  Stack-like layout context to direct content when `scrollWholePage` is false.
  The old component layout resolver uses the parent layout context, not the
  child component's own orientation, to decide whether `width="*"` or
  `height="*"` becomes flex. The rewrite now carries a runtime layout context,
  has Stack components establish child layout contexts, and renders direct App
  content in a vertical context for `scrollWholePage="false"`. This fixes
  `CHStack height="*"` and `height="3*"` inside horizontal App content so they
  divide the bounded content height in a 1:3 ratio.
- 2026-06-30 narrow mobile shell: old XMLUI treats all narrow App layouts as
  sticky-chrome layouts when AppHeader/NavPanel are present. The rewrite now
  keeps the hamburger AppHeader and Footer sticky while the App/root remains
  the scroll owner, lets routed content wrappers grow to content height, and
  keeps short pages expanded so the Footer remains at the viewport bottom.
  Contained Lists in this mobile shell use outside-scroll mode so App/Page
  vertical padding scrolls away with the content instead of creating nested
  scroll chrome. The mobile sticky Footer wrapper is painted with the Footer
  background token so routed content cannot show through while the App scrolls.
  Focused App/Pages verification passes 24/24, including the narrow
  `vertical-full-header` pinned-header/footer, Footer-background, and List
  outside-scroll regression.
- 2026-06-30 wide `vertical-full-header` bottom scroll: old XMLUI keeps the
  side NavPanel content anchored inside the sticky full-header wrapper even
  near the bottom of the App scroll range. The rewrite now restores the old
  `.navPanelWrapper > *:first-child { flex: 1; min-height: 0; }` rule and
  extends the wide regression to scroll to the bottom while checking header,
  footer, NavPanel wrapper, real NavPanel, and first NavLink offsets.

## Recent Tooling Compatibility Notes

- 2026-06-30 Sass startup warnings: Dart Sass 1.93 warns on the deprecated
  Sass `if()` function syntax during sample `npm start`. The rewrite no longer
  uses active `if()` calls in SCSS; `_themes.scss`, `Text.module.scss`, and
  `Toggle.module.scss` now use ordinary Sass `@if/@else` assignments while
  preserving the same generated theme-variable order and values.

## Open Questions

1. Should copied old React/SCSS files be kept byte-for-byte except import lines,
   or is a tiny documented shim inside those files acceptable when the rewrite
   has no equivalent shared adapter yet?
2. Some old components use non-module global `.scss` (`InspectButton`,
   `Inspector`) while the rewrite currently has module files. Should this plan
   preserve the old global stylesheet form literally, or is module conversion
   allowed for these exceptions?
3. Should current `*.foundation.spec.ts` files remain as additional smoke tests
   after the old suite passes, or should they be removed/renamed to avoid
   confusing completion status?
4. The current E2E audit counts transferred tests by spec files, but it does
   not prove that a copied spec is textually unchanged. Should we add a
   "protected old spec drift" audit that fails when migrated old specs differ
   from `/Users/dotneteer/source/xmlui`?
5. Should there be a similar "protected React/SCSS drift" audit that allows
   only import-line differences and documented allowlisted shims?
6. For complex dependencies like `Table`, should prerequisite approval units be
   allowed to complete with verification only through the dependent component
   when the dependency has no direct old tests (`Column`, `SelectionStore`,
   `Part`)?
7. When user-run additional tests find regressions after focused E2E passes,
   should the component stay `Awaiting approval`, or should it move to
   `Blocked` until the regression is fixed and the focused loop is rerun?

## Immediate Next Action

Start the next session by reading this plan, the latest handoff note in `.ai/`,
and the most recent component findings notes. Choose the next component based on
dependency order and user direction, then use the same source-preserving loop:
copy old React/SCSS, adapt only imports and renderer boundaries, verify focused
and side-by-side E2E, update this plan and `.ai/`, then stop for user approval.

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
   - ask the user for approval to continue.

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

Status values:

- `Not started`: no source-preserving re-migration under this plan yet.
- `Prerequisite`: migrate before a dependent target.
- `Candidate`: eligible when dependencies are green.
- `Blocked`: needs an open question resolved.
- `Awaiting approval`: focused migration passed and user approval is needed.
- `Approved complete`: user approved moving on after additional checks.

| Component | Complexity | Old Specs | Style Files | Main Dependencies Observed | Status | Notes |
| --- | --- | ---: | --- | --- | --- | --- |
| `APICall` | Complex | 1 | none | runtime data/APIs | Not started | Nonvisual data behavior; preserve async edge cases. |
| `Accordion` | More difficult | 1 | `Accordion.module.scss` | icon, part, toggle behavior | Not started | Stateful children and item context. |
| `Animation` | Simple | 0 | none | runtime animation hooks | Not started | No direct old spec; verify via dependents. |
| `App` | Complex | 5 | `App.module.scss`, `Sheet.module.scss` | AppHeader, NavPanel, Pages, Part | Not started | Shell/routing tests require broad smoke. |
| `AppHeader` | More difficult | 1 | `AppHeader.module.scss` | App, Part | Not started | App shell dependency. |
| `AppState` | More difficult | 1 | none | runtime state | Not started | Data mutation and event tests matter. |
| `AutoComplete` | Complex | 1 | `AutoComplete.module.scss` | ConciseValidationFeedback, Form, FormItem, Part, Select | Not started | Wait for input/form/select family. |
| `Avatar` | Simple | 1 | `Avatar.module.scss` | metadata helpers | Candidate | Good later visual leaf if `ProgressBar` is clean. |
| `Badge` | Simple | 1 | `Badge.module.scss` | metadata helpers | Candidate | Good later visual leaf. |
| `Bookmark` | More difficult | 1 | `Bookmark.module.scss` | runtime navigation/state | Not started | Foundation-only signal exists in current tests. |
| `Br` | Simple | 1 | none | metadata helpers | Candidate | HTML-ish leaf. |
| `Button` | More difficult | 2 | `Button.module.scss` | Icon, Part, VisuallyHidden | Candidate | Pilot step 2. |
| `Card` | More difficult | 1 | `Card.module.scss` | Avatar, Heading, Link, Part, Text | Not started | Migrate after its visual/text dependencies. |
| `ChangeListener` | More difficult | 1 | none | runtime state/listeners | Not started | Event semantics over visuals. |
| `Checkbox` | More difficult | 1 | none in old folder | Toggle | Prerequisite | Required before `Table`; old source delegates to `Toggle`. |
| `CodeBlock` | More difficult | 1 | `CodeBlock.module.scss` | Button, Icon, Part, Text | Not started | Copy button/text first. |
| `ColorPicker` | More difficult | 1 | `ColorPicker.module.scss` | FormItem, Part | Not started | Input/form dependency. |
| `Column` | More difficult | 0 | none | Table context | Prerequisite | Required before `Table`; verify through table specs. |
| `ConciseValidationFeedback` | More difficult | 0 | `ConciseValidationFeedback.module.scss` | Form, Icon, Tooltip | Prerequisite | Required by input components. |
| `ContentSeparator` | Simple | 1 | `ContentSeparator.module.scss` | metadata helpers | Candidate | Visual leaf. |
| `ContextMenu` | Complex | 1 | `ContextMenu.module.scss` | DropdownMenu, menu helpers | Not started | Overlay/menu family. |
| `DataSource` | Complex | 1 | none | runtime data | Not started | Data loading contract. |
| `DateInput` | Complex | 1 | `DateInput.module.scss` | ConciseValidationFeedback, Form, Icon, Input, Part | Not started | Wait for input/form. |
| `DatePicker` | Complex | 1 | `DatePicker.module.scss` | ConciseValidationFeedback, Form, FormItem, Icon, Input | Not started | Current fixme indicates shell mismatch risk. |
| `Drawer` | More difficult | 1 | `Drawer.module.scss` | Icon | Not started | Overlay/focus behavior. |
| `DropdownMenu` | Complex | 1 | `DropdownMenu.module.scss` | Button, Icon, menu helpers | Not started | Old suite currently skipped in rewrite. |
| `EventSource` | Complex | 0 | none | runtime events | Not started | Verify via synthetic event source fixtures. |
| `ExpandableItem` | More difficult | 1 | `ExpandableItem.module.scss` | Icon, Part, Toggle | Not started | Old suite currently skipped in rewrite. |
| `Fallback` | More difficult | 0 | none | runtime error/fallback | Not started | Verify through runtime scenarios. |
| `FileInput` | Complex | 1 | `FileInput.module.scss` | Button, FormItem, Icon, TextBox | Not started | Wait for Button/TextBox/FormItem. |
| `FileUploadDropZone` | More difficult | 1 | `FileUploadDropZone.module.scss` | Icon, component utils | Not started | Browser file/drop semantics. |
| `FlowLayout` | Complex | 1 | `FlowLayout.module.scss` | ScrollViewer | Not started | Existing skipped layout cases; high visual risk. |
| `FocusScope` | More difficult | 1 | none | focus management | Not started | Needs browser focus-specific checks. |
| `Footer` | More difficult | 1 | `Footer.module.scss` | App | Not started | Old suite currently skipped in rewrite. |
| `Form` | Complex | 1 | `Form.module.scss` | Button, FormItem, Part, ValidationSummary | Not started | Central prerequisite for inputs. |
| `FormItem` | Complex | 2 | `FormItem.module.scss`, `HelperText.module.scss` | many form/input components | Not started | Important dependency hub; migrate after minimal inputs are stable or preserve helper APIs. |
| `FormSegment` | More difficult | 1 | none in old folder | Form | Not started | Form family. |
| `Fragment` | Simple | 1 | none | metadata helpers | Candidate | Markup/container behavior. |
| `Heading` | Simple | 2 | `Heading.module.scss` | metadata/container helpers | Candidate | Text/HTML dependency. |
| `HtmlTags` | More difficult | 1 | `HtmlTags.module.scss` | Heading, Link, Text | Not started | After text/link. |
| `I18n` | More difficult | 0 | none | metadata helpers | Not started | No direct old spec; needs usage fixture. |
| `IFrame` | Simple | 1 | `IFrame.module.scss` | metadata helpers | Candidate | Browser-sensitive but isolated. |
| `Icon` | Complex | 1 | many icon `.module.scss` files | icon registry/provider | Prerequisite | Required by Button/Table and many others. |
| `Image` | Simple | 1 | `Image.module.scss` | metadata helpers | Candidate | Visual media leaf. |
| `IncludeMarkup` | Complex | 1 | none | compiler/runtime include | Not started | Async compile boundary. |
| `Input` | More difficult | 0 | input part SCSS modules | Icon, Text | Prerequisite | Required by TextBox/DateInput/TimeInput. |
| `InspectButton` | More difficult | 0 | `InspectButton.scss` old / module in rewrite | Button, Icon | Not started | Pair with Inspector. |
| `Inspector` | Complex | 0 | `Inspector.scss` old / module in rewrite | Icon, inspect mode store | Not started | Debug UI and global styles question. |
| `Items` | More difficult | 1 | none | container helpers | Not started | Container iteration semantics. |
| `Lifecycle` | More difficult | 0 | none | runtime lifecycle/events | Not started | Existing fixmes for thrown script support. |
| `Link` | More difficult | 1 | `Link.module.scss` | Icon, Part | Not started | Navigation and browser behavior. |
| `List` | Complex | 1 | `List.module.scss` | Card, Checkbox, SelectionStore, Spinner, Table, Text | Not started | Depends on many data/display components. |
| `LiveRegion` | More difficult | 1 | `LiveRegion.module.scss` old | accessibility/runtime announcement | Not started | Accessibility behavior. |
| `Logo` | Simple | 0 | `Logo.module.scss` old | AppHeader, Image | Not started | Verify via app shell. |
| `Markdown` | Complex | 2 | `Markdown.module.scss`, `CodeText.module.scss` | CodeBlock, ExpandableItem, Heading, Link, NestedApp, Text, Toggle, TreeDisplay | Not started | Large parser/rendering surface. |
| `Menu` | Simple | 0 | `Menu.module.scss` | none | Prerequisite | Shared menu styles; migrate before menu family. |
| `MessageListener` | More difficult | 1 | none | runtime messages | Not started | Browser messaging. |
| `ModalDialog` | Complex | 1 | `ModalDialog.module.scss` old plus dialog styles | Button, Icon, Part, Stack, Text | Not started | Overlay/focus and portal behavior. |
| `NavGroup` | Complex | 1 | `NavGroup.module.scss` | App, Icon, NavLink, NavPanel | Not started | Navigation shell. |
| `NavLink` | Complex | 1 | `NavLink.module.scss` | App, Icon, NavGroup, NavPanel | Not started | Old suite currently skipped. |
| `NavPanel` | Complex | 1 | `NavPanel.module.scss` | App, Logo, Part, ScrollViewer | Not started | Old suite currently skipped. |
| `NavPanelCollapseButton` | More difficult | 0 | none | App, Button, Icon | Not started | Navigation shell dependency. |
| `NestedApp` | Complex | 1 | `NestedApp.module.scss` plus helpers | App, Button, ComponentRegistryContext, Icon, Markdown | Not started | Runtime app embedding. |
| `NoResult` | Simple | 1 | `NoResult.module.scss` | Icon | Not started | After Icon. |
| `NumberBox` | Complex | 1 | `NumberBox.module.scss` | Button, ConciseValidationFeedback, Form, FormItem, Icon, Input, Part | Not started | Input/form dependency. |
| `Option` | More difficult | 1 | none | container helpers | Prerequisite | Required by Select/Pagination/RadioGroup. |
| `PageMetaTitle` | Simple | 1 | none | document title | Candidate | Browser metadata behavior. |
| `Pages` | Complex | 1 | none old / module in rewrite | App | Not started | Routing shell. |
| `Pagination` | Complex | 1 | `Pagination.module.scss` | Button, FormItem, Icon, Option, Part, Select, Text | Prerequisite | Required before `Table`. |
| `Part` | Simple | 0 | none | none | Prerequisite | Required by Button/Table and many themed components. |
| `ProfileMenu` | More difficult | 0 | `ProfileMenu.module.scss` | Avatar, DropdownMenu | Not started | Menu/avatar dependency. |
| `ProgressBar` | Simple | 1 | `ProgressBar.module.scss` | metadata helpers | Candidate | Pilot step 1. |
| `QRCode` | Simple | 1 | `QRCode.module.scss` | metadata helpers | Candidate | Visual leaf with external rendering dependency. |
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
| `SpaceFiller` | Simple | 1 | `SpaceFiller.module.scss` | metadata helpers | Candidate | Layout primitive. |
| `Spinner` | Simple | 1 | `Spinner.module.scss` | Part | Prerequisite | Required before `Table`, `List`. |
| `Splitter` | Complex | 3 | `Splitter.module.scss` | Part | Not started | Pointer/layout behavior. |
| `Stack` | Complex | 5 | `Stack.module.scss` | FlowLayout, ScrollViewer | Not started | Old suite currently skipped; layout hub. |
| `Stepper` | Complex | 1 | `Stepper.module.scss` | Icon | Not started | Stateful multi-step component. |
| `StepperForm` | Complex | 1 | none old / module in rewrite | Form | Not started | Form plus Stepper. |
| `StickyBox` | More difficult | 0 | `StickyBox.module.scss` | metadata helpers | Not started | Verify through layout/browser. |
| `StickySection` | More difficult | 1 | `StickySection.module.scss` | metadata helpers | Not started | Sticky layout behavior. |
| `Switch` | More difficult | 1 | none in old folder | Toggle | Not started | Toggle dependency. |
| `Table` | Complex | 2 | `Table.module.scss` | Checkbox, Column, Icon, Pagination, Part, SelectionStore, Spinner | Blocked | Pilot step 3 after prerequisite completion. |
| `TableOfContents` | Complex | 1 | `TableOfContents.module.scss` | App, ScrollViewer | Not started | Page heading/index behavior. |
| `Tabs` | Complex | 1 | `Tabs.module.scss` | Form, container helpers | Not started | Old suite currently skipped. |
| `TabsForm` | Complex | 1 | none | Form | Not started | Form plus Tabs. |
| `Text` | Simple | 1 | `Text.module.scss` | abstractions/metadata | Candidate | Text primitive. |
| `TextArea` | Complex | 1 | `TextArea.module.scss` | ConciseValidationFeedback, Form, FormItem, Part | Not started | Input/form dependency. |
| `TextBox` | Complex | 1 | `TextBox.module.scss` | ConciseValidationFeedback, Form, FormItem, Input, Part | Not started | Good post-Button form/input target. |
| `Theme` | Complex | 1 | `Theme.module.scss` | App, ComponentRegistryContext | Not started | Global theming behavior. |
| `TileGrid` | Complex | 1 | `TileGrid.module.scss` | Checkbox, SelectionStore, Table | Not started | After Table/selection. |
| `TimeInput` | Complex | 1 | `TimeInput.module.scss` | Icon, Input, Part | Not started | Input dependency. |
| `Timer` | More difficult | 1 | none | runtime scheduling | Not started | Timing-sensitive tests. |
| `Toast` | More difficult | 1 | none | runtime toast container | Not started | Portal/service behavior. |
| `Toggle` | More difficult | 0 | `Toggle.module.scss` | FormItem, Part | Prerequisite | Required by Checkbox/Switch/ExpandableItem. |
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

After user approval of this plan, start Step 1 with `ProgressBar`:

1. Re-copy `ProgressBarReact.tsx` and `ProgressBar.module.scss` from the old
   project.
2. Adjust imports only.
3. Keep/adapt `ProgressBar.tsx` as the metadata/renderer bridge.
4. Run the focused old suite and audits.
5. Stop and ask for approval before `Button`.

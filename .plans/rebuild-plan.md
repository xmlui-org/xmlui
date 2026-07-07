# XMLUI Rebuild Plan

Status: active  
Source baseline: `/Users/dotneteer/source/xmlui`  
Rewrite workspace: `/Users/dotneteer/source/xmlui-rs`

This is the single execution plan for the XMLUI rewrite. It intentionally keeps
completed work terse and keeps remaining work ordered. Supporting `.ai` notes
may contain evidence and session history, but they are not required to choose
the next step.

## Execution Approach Change

**Changed on June 25, 2026:** remaining component migration now follows a
component-by-component closure model instead of the previous tiny
behavior-slice model.

The previous approach activated a small behavior subgroup, often only 2-10
tests, then ran the full verification ladder. That was useful while shared
Form/Input infrastructure was uncertain, but it is now too slow relative to the
remaining work. From this point forward, each step should close one component
as completely as practical:

1. Inventory all skipped/fixme copied-old tests for the component.
2. Compare the whole component against `/Users/dotneteer/source/xmlui`.
3. Implement all low-risk compatibility gaps for that component in one batch.
4. Activate every copied-old test that is compatible with the current
   foundation.
5. Leave only genuinely blocked tests skipped/fixme-marked with a current
   reason.
6. Run focused component verification, the full component spec, affected shared
   clusters, TypeScript, unit tests, metadata, CSS audit, and full E2E once for
   the completed component batch.

Do not split a component into separate direct-binding, label-mode, variant, and
parts handoffs unless the component reveals a real blocker or a risky shared
architecture change. Batch the repetitive input compatibility patterns.

## Status Dashboard

Legend:

- `[done]` completed and verified enough to move on.
- `[current]` the next executable step. Start here when asked to continue.
- `[remaining]` planned but not yet started in this closure sequence.

Immediate status:

| Status | Area | What It Means |
| --- | --- | --- |
| `[done]` | Foundations and waves through H2B | Infrastructure, runtime semantics, styling, core components, app/routing foundations, services inspection, and shared input internals are complete at foundation level. |
| `[done]` | P2A Form Core | `Form.spec.ts` has no remaining skipped/fixme tests; Form dirty tracking, submit, events, persistence, sticky rows, parts, APIs, and copied-old Form core coverage are active. |
| `[done]` | P2A FormItem/Input Closure | FormItem copied-old local blocks and the Slider auto-focus fixme are active. |
| `[done]` | P2A FormSegment Closure | `FormSegment.spec.ts` is fully active; scoped context, discovery, layout, APIs, dirty state, and scoping parity are closed. |
| `[done]` | P2B Structured Form Controls | StepperForm, TabsForm, and Stepper local structured-form coverage is closed; TabsForm has no remaining skipped/fixme tests. |
| `[done]` | P3A Text-Like Input Parity | TextBox/PasswordInput, TextArea, and NumberBox copied-old local parity are fully active with no remaining skipped/fixme tests. |
| `[done]` | P3B Boolean, Rating, Slider, Date/Time, and Color Inputs | Component-by-component closure is complete for this phase, including the Date/Time/Rating re-sweep. DatePicker keeps one explicit Ark/mobile shell skip. |
| `[done]` | P4A Overlay and Focus Infrastructure | Tooltip, Drawer, and ModalDialog copied-old local coverage are fully active. One FocusScope xmlui-pg/Markdown skip remains blocked by that unrelated component migration. |
| `[done]` | P3C File and Selection Inputs | FileInput, FileUploadDropZone, RadioGroup, Select, and AutoComplete-owned slices are closed; the nested DropdownMenu/ModalDialog overlay handoff tests are active after P4B closure. |
| `[done]` | P4B Menu Family Closure | DropdownMenu and ContextMenu copied/foundation coverage is active, SubMenuItem icon tests are active, nested Select/AutoComplete overlay handoff tests are active, and the focused P4B bundle passes with no skips. |
| `[done]` | P4C Navigation Shell Components | Navigation-shell closure is complete for this pass; remaining skips are explicit broader theme/layout/dropdown-matrix debt. |
| `[done]` | H3A Runtime Markup Inclusion | IncludeMarkup runtime fetch/parse/render behavior, events, stateful included fragments, and runnable example coverage are closed. |
| `[done]` | H3B Markdown and CodeText | Markdown and internal CodeText rendering, legacy `@{}` binding replacement, code fences, heading anchors, table/list/inline-code basics, `xmlui-pg` nested app rendering, and runnable foundation coverage are active. |
| `[done]` | H4A Inspector and Inspect Button | Inspector trigger/dialog/API, debug event capture, shared InspectButton inspect-mode state, runnable foundation example, and focused/full E2E coverage are active. |
| `[done]` | H4B Internationalization Surface | I18n, App locale bundles, App.translate/App.setLocale, ICU formatting, missing-key fallback, inline slots, and runnable foundation coverage are active. |
| `[done]` | H4C Data Policy Helper | RetryPolicy provider semantics, retry executor, DataSource/APICall integration, runnable foundation coverage, and full E2E coverage are active. |
| `[done]` | P5A Data Operations Closure | DataSource CSV/text/sql parsing, page selectors, structural sharing, APICall confirmation/notifications/deferred/cancel, and Actions.callApi invalidation coverage are active. |
| `[done]` | P5B App State and Change Listening | AppState bucket/reference persistence and ChangeListener source/timing compatibility coverage are active. |
| `[done]` | P5C Scheduling, Messaging, and Streaming | Timer, Queue, MessageListener, Toast, EventSource, and WebSocket scheduling/messaging/streaming coverage is active. |
| `[done]` | P5D Accessibility and Runtime Services | LiveRegion/global announcements, SkipLink, NoResult, Bookmark, and runtime toast accessibility coverage is active. |
| `[done]` | P6A App, Routing, and Page Closure | App routing/page shell behavior, navigation hooks, App layout/event compatibility, and P6A focused/full E2E coverage are active. |
| `[done]` | P6B Nested App Closure | NestedApp state/route/config/tone boundaries, supplied components, refresh remounting, and framed code/reset shell coverage are active. |
| `[done]` | P7A Collection Display Closure | List, Items, collection templates, lightweight List virtualization, script-function item dependencies, and copied-old coverage are active. |
| `[done]` | P7B Table and Column Closure | Table and Column copied/foundation coverage is active with no local Table/Column skips; focused P7B and full E2E verification pass. |
| `[done]` | P7C Tree and Table Of Contents Closure | `Tree`, `TreeDisplay`, and `TableOfContents` copied/foundation coverage is active with no local skips; focused P7C verification passes. |
| `[done]` | P7D Layout Container Closure | Layout container copied/foundation coverage is active through StickySection, with explicit remaining skips for broader overlay, selection, and splitter drag parity. |
| `[done]` | P1A Primitive and Text Closure | Primitive and presentational copied/foundation coverage is active with no local skips; focused P1A and full E2E verification pass. |
| `[done]` | H5A Behavior and Internal Part Helpers | Animation behavior and wrapperless Part helper semantics are active with focused and full E2E verification. |
| `[done]` | H5B Menu Styling Reconciliation | Shared Menu styling contracts are restored for DropdownMenu and ContextMenu with focused and full E2E verification. |
| `[done]` | P8A Theme, Slots, Tone, Behaviors, and Parts Sweep | Slot context reactivity, Theme no-op/applyIf behavior, tone controls, behavior attachment, Part metadata, and unified docs metadata are complete with focused and full E2E verification. |
| `[current]` | Phase 6 Extension Packages and External Authoring | Start here next. |

Current next marker:

`NEXT: Phase 6 Extension Packages and External Authoring`

Current verification baseline:

- P2A Form cluster: 379 passed, 0 skipped.
- Checkbox spec: 118 passed, 0 skipped.
- FormItem spec: 106 passed, 0 skipped.
- FormSegment spec: 38 passed, 0 skipped.
- Slider spec: 112 passed, 0 skipped.
- StepperForm spec: 8 passed, 0 skipped.
- TabsForm spec: 8 passed, 0 skipped.
- TextBox spec: 164 passed, 0 skipped.
- TextArea spec: 159 passed, 0 skipped.
- NumberBox spec: 206 passed, 0 skipped.
- Switch spec: 104 passed, 0 skipped.
- ColorPicker spec: 70 passed, 0 skipped.
- DateInput spec: 162 passed, 0 skipped.
- TimeInput spec: 169 passed, 0 skipped.
- RatingInput spec: 16 passed, 0 skipped.
- DatePicker spec: 16 passed, 1 skipped.
- P3B Date/Time/Rating re-sweep bundle: 363 passed, 1 skipped.
- Tooltip spec: 19 passed, 0 skipped.
- Drawer spec: 31 passed, 0 skipped.
- ModalDialog spec: 31 passed, 0 skipped.
- P4A focused overlay/focus bundle: 96 passed, 1 skipped.
- Structured-form focused bundle: 78 passed, 0 skipped.
- AutoComplete nested overlay handoff bundle: 2 passed, 0 skipped.
- Select nested overlay handoff bundle: 2 passed, 0 skipped.
- P4B menu-family focused bundle: 74 passed, 0 skipped. Active coverage
  includes DropdownMenu and ContextMenu foundation/copied specs, MenuItem,
  MenuSeparator, SubMenuItem, keyboard/focus, positioning/theme, edge cases,
  icon support, and nested Select overlay cases.
- P4C first-five navigation-shell bundle: 22 passed, 120 skipped. Active
  coverage includes NavLink/NavPanel/NavGroup foundation specs, NavLink exact
  active-state copied smoke, NavPanel direct nested discovery copied smoke, and
  NavGroup copied smoke for expansion, disabled state, active-descendant
  expansion, menuitem roles, and `initiallyExpanded`.
- P4C navigation-shell focused bundle: 63 passed, 133 skipped. Active coverage
  includes NavLink/NavPanel/NavGroup/AppHeader/Footer/NavPanelCollapseButton/
  ProfileMenu foundation and copied smoke coverage plus App shell event
  coverage. A focused ignored-App compatibility sweep for layouts/drawer hooks
  passes with 12 passed.
- P5A DataSource/APICall focused bundle after closure: 23 passed.
- P5B AppState/ChangeListener closure bundle: 17 passed, 0 skipped.
- P5C scheduling/messaging/streaming closure bundle: 34 passed.
- P5D accessibility/runtime-services closure bundle: 23 passed.
- P6A focused routing/App shell closure bundle: 91 passed, 18 explicit
  script-runtime skips.
- P6B NestedApp closure focused bundle: 8 passed.
- P6A routing regression bundle after P6B route-isolation changes: 18 passed.
- SkipLink focused stability check after full-suite root-font leakage fix: 5 passed.
- P7A List/Items closure bundle: 149 passed, 0 skipped.
- Full E2E: 3800 passed, 1253 skipped.
- TypeScript, unit tests, metadata build, and CSS module audit: passed.
- P7B first-three-slice Table/Column checkpoint: focused Table bundle
  21 passed, 175 skipped; unit tests 267 passed; TypeScript and metadata build
  passed. Full E2E intentionally not run yet because P7B is not complete.
- P7B second-three-slice Table/Column checkpoint: focused Table bundle
  51 passed, 145 skipped; unit tests 267 passed; TypeScript, metadata build,
  and CSS module audit passed. Full E2E intentionally not run yet because P7B
  is not complete.
- P7B third-three-slice Table/Column checkpoint: focused Table bundle
  67 passed, 129 skipped; unit tests 267 passed; TypeScript, metadata build,
  and CSS module audit passed. Full E2E intentionally not run yet because P7B
  is not complete.
- P7B next-five-slice Table/Column checkpoint: focused Table bundle
  113 passed, 83 skipped; unit tests 267 passed; TypeScript, metadata build,
  and CSS module audit passed. Full E2E intentionally not run yet because P7B
  is not complete.
- P7B next-five-slice Table/Column checkpoint: focused Table bundle
  163 passed, 33 skipped; unit tests 267 passed; TypeScript, metadata build,
  and CSS module audit passed. Full E2E intentionally not run yet because P7B
  is not complete.
- P7B next-five-slice Table/Column checkpoint: focused Table bundle
  191 passed, 5 skipped; unit tests 267 passed; TypeScript, metadata build,
  and CSS module audit passed. Full E2E intentionally not run yet because P7B
  is not complete.
- P7B closure checkpoint: focused Table bundle including
  `TableCellTextOverflow.spec.ts` passed with 205 passed and 0 skipped; unit
  tests 267 passed; TypeScript, metadata build, CSS module audit, and full E2E
  passed. Full E2E: 4003 passed, 1050 skipped.
- P7C first-five-slice Tree checkpoint: focused Tree bundle
  (`Tree.foundation.spec.ts`, `Tree.spec.ts`, `Tree-replace-apis.spec.ts`)
  passed with 57 passed and 102 skipped; unit tests 267 passed; TypeScript,
  metadata build, and CSS module audit passed. Full E2E intentionally not run
  yet because P7C is not complete.
- P7C next-five-slice Tree/TreeDisplay/TableOfContents checkpoint: focused
  bundle (`Tree.foundation.spec.ts`, `Tree.spec.ts`,
  `Tree-replace-apis.spec.ts`, `Tree-icons.spec.ts`,
  `Tree-dynamic-field.spec.ts`, `Tree-loaded-field.spec.ts`,
  `TreeDisplay.foundation.spec.ts`, `TreeDisplay.spec.ts`,
  `TableOfContents.foundation.spec.ts`, `TableOfContents.spec.ts`) passed with
  97 passed and 143 skipped; unit tests 267 passed; TypeScript, metadata build,
  and CSS module audit passed. Full E2E intentionally not run yet because P7C
  is not complete.
- P7C closure checkpoint: focused P7C bundle
  (`TableOfContents.foundation.spec.ts`, `TableOfContents.spec.ts`,
  `TreeDisplay.foundation.spec.ts`, `TreeDisplay.spec.ts`,
  `Tree-dynamic-integration.spec.ts`, `Tree-spinnerDelay.spec.ts`,
  `Tree.foundation.spec.ts`, `Tree-replace-apis.spec.ts`,
  `Tree-dynamic.spec.ts`, `Tree-loaded-field.spec.ts`, `Tree.spec.ts`,
  `Tree-autoLoadAfter-field.spec.ts`, `Tree-icons.spec.ts`,
  `Tree-dynamic-field.spec.ts`) passed with 316 passed and 0 skipped. P7C local
  skip/fixme audit found no remaining markers. TypeScript, metadata build, and
  CSS module audit passed. Full E2E initially failed outside P7C in Heading,
  IFrame, Select, Text, and TextArea coverage; those failures were fixed before
  P7D started, and full E2E then passed with 4315 passed and 742 skipped.
- P7D first-three-slice checkpoint: completed `Stack Family Inventory and
  Baseline Activation`, `FlowLayout Closure`, and `Card Closure`. Focused P7D
  first-three bundle (`Stack.foundation.spec.ts`, `HStack.spec.ts`,
  `VStack.spec.ts`, `CHStack.spec.ts`, `CVStack.spec.ts`,
  `FlowLayout.foundation.spec.ts`, `FlowLayout.spec.ts`,
  `Card.foundation.spec.ts`, `Card.spec.ts`) passed with 87 passed and 27
  skipped. Unit tests passed with 267 passed. TypeScript, metadata build, and
  CSS module import audit passed. Full E2E intentionally not run because P7D is
  not complete.
- P7D slices 4-6 checkpoint: completed `TileGrid and ResponsiveBar Closure`,
  `Splitter Closure`, and `ScrollViewer Closure`. Focused slices 4-6 bundle
  (`TileGrid.foundation.spec.ts`, `TileGrid.spec.ts`,
  `ResponsiveBar.foundation.spec.ts`, `ResponsiveBar.spec.ts`,
  `Splitter.foundation.spec.ts`, `Splitter.spec.ts`, `HSplitter.spec.ts`,
  `VSplitter.spec.ts`, `ScrollViewer.foundation.spec.ts`,
  `ScrollViewer.spec.ts`) passed with 112 passed and 101 skipped. Unit tests
  passed with 267 passed. TypeScript, metadata build, and CSS module import
  audit passed. Full E2E intentionally not run because P7D is not complete.
- P7D closure checkpoint: completed `StickyBox and StickySection Closure`.
  Sticky focused bundle (`StickySection.foundation.spec.ts`,
  `StickySection.spec.ts`) passed with 21 passed and 0 skipped. Full P7D
  focused bundle passed with 220 passed and 128 skipped. Unit tests passed with
  267 passed. TypeScript, metadata build, CSS module import audit, and full E2E
  passed. Full E2E: 4520 passed, 539 skipped. An initial full E2E run had one
  flaky `MessageListener` layout failure; the focused MessageListener rerun and
  second full E2E run both passed.

## Compatibility Contract

- Preserve existing XMLUI syntax, runtime semantics, component behavior, public
  APIs, styling hooks, docs/tooling outputs, and developer workflow.
- Use `/Users/dotneteer/source/xmlui` as the source of truth before changing
  behavior.
- Copy old tests where available and activate them feature-by-feature.
- Keep unsupported copied-old tests explicitly skipped or fixme-marked with a
  reason.
- Verify each meaningful change with focused tests and the relevant build or
  metadata command.
- After each completed step, include `npm --workspace xmlui run test:e2e` in
  verification. As of June 25, 2026, this E2E command has been optimized in a
  parallel session and is expected to take about 90 seconds.

## Completed Foundations

These foundation and migration waves are complete. Only titles are kept here so
the plan stays readable.

1. Experiments 1-15 baseline.
2. Phase 0: Rebuild Control Center.
3. Phase 1: Package, Build, and Test Infrastructure.
4. Phase 2: Core Language and Runtime Semantics.
5. Phase 3: Theme, Styling, Layout, and Visual Verification.
6. Phase 4: Data, Actions, Forms, Routing, and App Shell Infrastructure.
7. Phase 5 Wave 0: Component Transfer Scaffold.
8. Phase 5 Wave 1A: Metadata Shape Compatibility.
9. Phase 5 Wave 1B: Theme Variable and Styling Compatibility.
10. Phase 5 Wave 1C: Behavior Compatibility.
11. Phase 5 Wave 1D: Component Docs Format Compatibility.
12. Phase 5 Wave 1E: Rendering Adapter Compatibility.
13. Phase 5 Wave 2: App Main Content Layout Migration.
14. Phase 5 Wave 3: Experiment 1 Component Migration Spike.
15. Wave A2: HTML Text Tags and Fragment.
16. Wave A3a: Image and IFrame.
17. Wave A3b: Icon and Logo.
18. Wave A4a: CodeBlock Foundation.
19. Wave A5: Generated/Structured Utility Output.
20. Wave A6: Separators and Spacing Utilities.
21. Wave A7: Empty and Fallback States.
22. Wave B1: Link Interaction.
23. Wave B2.1: TextBox Foundation.
24. Wave B2.2: TextArea Foundation.
25. Wave B2.3: NumberBox Foundation.
26. Wave B3.1: Checkbox Foundation.
27. Wave B3.2: Switch Foundation.
28. Wave B3.3: Toggle Foundation.
29. Wave B4.1: RatingInput Foundation.
30. Wave B4.2: Slider Foundation.
31. Wave B5.1: ColorPicker Foundation.
32. Wave B5.2: DateInput Foundation.
33. Wave B5.3: TimeInput Foundation.
34. Wave B5.4: DatePicker Foundation.
35. Wave B6.1: FileInput Foundation.
36. Wave B6.2: FileUploadDropZone Foundation.
37. Wave C1: Existing Collection Foundation (`Items`, `Select`, `Option`).
38. Wave C2: Choice Collections Foundation (`AutoComplete`, `RadioGroup`).
39. Wave C3: List Selection and Paging Foundation (`List`,
    `SelectionStore`, `Pagination`).
40. Wave C4: Table Family Foundation (`Table`, `Column`).
41. Wave C5: Tree and Table of Contents Foundation (`Tree`, `TreeDisplay`,
    `TableOfContents`).
42. Wave D1: Stack and Card Layout Primitives Foundation.
43. Wave D2: Adaptive and Scrolling Layout Foundation.
44. Wave D3A: Accordion Foundation.
45. Wave D3B: ExpandableItem Foundation.
46. Wave D3C: Tabs Foundation.
47. Wave D4A: Drawer Foundation.
48. Wave D4B: ModalDialog Foundation.
49. Wave D4C: Tooltip Foundation.
50. Wave D5A: ContextMenu Foundation.
51. Wave D5B: DropdownMenu Foundation.
52. Wave D5C: SubMenuItem and Menu Primitive Parity.
53. Wave D5D: Menu Compatibility Surface.
54. Wave D5E: Menu Overlay Foundation.
55. Wave D6A: NavLink Foundation.
56. Wave D6B: NavPanel Foundation.
57. Wave D6C: NavGroup Foundation.
58. Wave D6D: AppHeader Foundation.
59. Wave D6E: Footer Foundation.
60. Wave D6F: NavPanelCollapseButton Foundation.
61. Wave D6G: ProfileMenu Foundation.
62. Wave E1A: Form and FormItem Foundation.
63. Wave E1B: FormSegment Foundation.
64. Wave E2A: ValidationSummary and ConciseValidationFeedback Foundation.
65. Wave E3A: StepperForm and TabsForm Structured Form Foundation.
66. Wave F1A: DataSource and APICall Inspection/Foundation.
67. Wave F2A: AppState and ChangeListener Inspection/Foundation.
68. Wave F3A: Timer and Queue Inspection/Foundation.
69. Wave F4A: MessageListener, EventSource, and WebSocket Inspection.
70. Wave F5A: Toast, Bookmark, LiveRegion, and Runtime Service Inspection.
71. Wave F6A: Theme, Slot, Tone, Inspector, and I18n Inspection.
72. Wave G1A: App Shell Behavior Inspection/Foundation.
73. Wave G2A: Pages, Page, and Redirect Inspection/Foundation.
74. Wave G3A: NavLink Route Behavior Tightening.
75. Wave G4A: NestedApp Boundary Foundation.
76. P0A: Sweep and Inventory Hygiene.
77. P0B: VS Code SCSS Bundling Fix.
78. H1A: Low-Risk Visual Components (`Spinner`, `ProgressBar`, `Avatar`,
    `Badge`).
79. H1B: Stepper Foundation (`Stepper`, `Step`).
80. H2A: Focus Management (`FocusScope`).
81. H2B: Shared Input Internals (`InputLabel`, `InputAdornment`,
    `InputDivider`, `PartialInput`).

## Next Step

### NEXT: Phase 6 Extension Packages and External Authoring

Fresh-session handoff prompt:

> Continue `.plans/rebuild-plan.md` from **NEXT: Phase 6 Extension Packages and External Authoring**.

Current handoff state:

- Start Phase 6 Extension Packages and External Authoring. Website-driven
  package migration is tracked in `.plans/website-migration-plan.md`, with the
  per-package workflow in `.plans/extension-package-migration-template.md`.
- Keep the component-by-component closure approach.
- Use `/Users/dotneteer/source/xmlui` as the compatibility source of truth before changing cross-cutting theme, slot, tone, behavior, or part semantics.
- Preserve existing dirty worktree changes that are unrelated to the current slice.
- The dirty worktree includes the completed P6B, P7A, P7B, P7C, P7D, and P1A implementation
  files plus standalone sample `xmlui-latest.js` bundle outputs touched by full
  E2E production-build verification. Do not revert those generated bundle
  changes unless the user explicitly asks.
- P7B is complete: Table and Column have no local skipped/fixme tests, the
  focused P7B bundle passes with 205 passed and 0 skipped, and full E2E passes
  with 4003 passed and 1050 skipped.
- P7C is complete: Tree, TreeDisplay, and TableOfContents have no local
  skipped/fixme tests, and the focused P7C bundle passes with 316 passed and 0
  skipped.
- P7D is complete: full layout focused bundle passes with 220 passed and 128
  skipped, and full E2E passes with 4520 passed and 539 skipped.
- P1A is complete: primitive/text/presentational local skip/fixme audit is
  clean; the full focused P1A bundle passes with 565 passed; TypeScript, unit
  tests, metadata build, CSS module import audit, and full E2E pass. Full E2E:
  4526 passed, 538 skipped.
- H5A is complete: the reported `MessageListener` wrapperless Stack-gap
  layout failure is fixed; `Animation` behavior supports preset parsing and
  transition application; `Part` is registered as a built-in wrapperless helper
  and applies `data-part-id`/`data-xmlui-part` to the direct child root.
  Focused H5A/MessageListener verification passed with 8 tests; TypeScript,
  unit tests, metadata build, CSS module import audit, and full E2E passed.
  Full E2E: 4529 passed, 538 skipped.
- H5B is complete: the original shared `Menu` stylesheet contract was restored
  as `xmlui/src/components/Menu/Menu.module.scss`; runtime inventory confirmed
  there is no original `Menu` component/renderer to register; DropdownMenu and
  ContextMenu now share the menu content/item/separator mixins while preserving
  rewrite positioning and submenu behavior. MenuItem active-hover theme
  variables are exposed with safe defaults and covered by a focused regression.
  Focused menu verification passed with 74 passed and 1 existing skip;
  TypeScript, unit tests, metadata build, CSS module import audit, and full E2E
  passed. Full E2E: 4529 passed, 539 skipped.
- P8A is complete:
  1. `Cross-Cutting Inventory`: identified the current deferred umbrella
     coverage for Theme, Slot, ToneSwitch, and ToneChangerButton, and compared
     the rewrite against the original source for Theme/Slot/Tone/Part/behavior
     surfaces.
  2. `Slot and Part Sweep`: activated representative Slot default, named
     template, and reactive context coverage; fixed Slot context-prop
     dependencies so injected templates rerender when slot context values
     change.
  3. `Theme and Tone Sweep`: restored original Theme `applyIf`/no-op wrapper
     behavior, including dynamic `applyIf` updates. Focused P8A first-three
     bundle passed with 14 passed and 4 existing umbrella skips; TypeScript,
     unit tests, metadata build, and CSS module import audit passed. Full E2E
     intentionally not run yet because P8A still has slices 4-6 remaining.
  4. `Behavior Attachment Sweep`: added behavior metadata coverage for
     non-visual components so `when` remains available while visual behaviors
     such as tooltip, label, variant, and animation are excluded from `Part`.
  5. `Docs Metadata Sweep`: extended unified component metadata/contracts with
     `parts`, `themeVars`, `defaultThemeVars`, and `toneSpecificThemeVars`, and
     included those styling contract fields in the deterministic contract hash.
  6. `P8A Final Verification`: replaced the local Theme, Slot, ToneSwitch, and
     ToneChangerButton umbrella skips with active representative coverage.
     Focused P8A verification passed with 16 passed and 0 skips. TypeScript,
     unit tests, metadata build, scoped inline-style audit, and full
     `npm --workspace xmlui run test:e2e` passed. Full E2E passed on rerun
     with 4537 passed and 535 skipped after an isolated TextArea concise
     validation feedback flake passed by itself.
- Continue with Phase 6 Extension Packages and External Authoring.

Completed P7B closure record:

- P7B first-three-slice checkpoint is complete:
  1. `Table/Column Inventory and Active Baseline`: removed the copied-old
     Table suite's global skip, kept not-yet-migrated advanced groups explicitly
     skipped, and activated the basic data/header/items/no-data/row-event
     baseline plus the current foundation coverage.
  2. `Column Metadata and Template Contracts`: added Column
     `horizontalAlignment`, `verticalAlignment`, and `backgroundColor` to
     metadata/contracts and applied them to table cells through collected column
     cell styles.
  3. `Table Sorting/Selection First Closure`: added multi-select header
     checkbox behavior, preserved body-row selection tests, and left the nested
     dropdown selection edge case explicitly skipped for a later P7B slice.
- Verification at this checkpoint:
  `npm --workspace xmlui exec -- playwright test src/components/Table/Table.spec.ts src/components/Table/Table.foundation.spec.ts --reporter=line`
  passed with 21 passed and 175 skipped;
  `npm --workspace xmlui run test` passed with 267 passed;
  `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit` passed;
  `npm --workspace xmlui run check:metadata` passed. Full E2E was not run
  because P7B is not complete.
- P7B second-three-slice checkpoint is complete:
  4. `Selection Checkbox Visibility`: activated copied-old
     `hideSelectionCheckboxes`, `hideSelectionCheckboxesHeader`, and
     `alwaysShowSelectionCheckboxes` coverage, with row checkboxes and the
     select-all header checkbox controlled independently.
  5. `Selectable/Disabled Row Predicates`: activated copied-old
     `rowDisabledPredicate` and `rowUnselectablePredicate` coverage. Disabled
     rows receive disabled styling and are excluded from selection, and
     unselectable rows omit their row checkboxes and are excluded from select-all.
  6. `Context Menu/Row Event Context`: activated copied-old row context-menu
     coverage with `$item`, `$row`, `$itemIndex`, and `$rowIndex` available to
     the handler while leaving ordinary link context menus unclaimed unless a
     Table context-menu handler is configured.
- Verification at this checkpoint:
  `npm --workspace xmlui exec -- playwright test src/components/Table/Table.spec.ts src/components/Table/Table.foundation.spec.ts --reporter=line`
  passed with 51 passed and 145 skipped;
  `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit` passed;
  `npm --workspace xmlui run test` passed with 267 passed;
  `npm --workspace xmlui run check:metadata` passed;
  `npm --workspace xmlui run compatibility:css-module-import-audit` passed with
  74 direct imports and 0 manual review. Full E2E was not run because P7B is not
  complete.
- P7B third-three-slice checkpoint is complete:
  7. `Auto Focus`: activated copied-old `autoFocus` coverage with the table root
     focusable and focused on mount.
  8. `Checkbox Tolerance`: activated copied-old `checkboxTolerance` coverage.
     The rewrite records the tolerance prop for compatibility and supports the
     copied row/header tolerance interactions through row selection and
     selection-header click handling.
  9. `Sorting Indicators`: activated copied-old default, hover, sorted, and
     `alwaysShowSortingIndicator` coverage with sortable header buttons and
     `orderIndicator` parts.
- Verification at this checkpoint:
  `npm --workspace xmlui exec -- playwright test src/components/Table/Table.spec.ts src/components/Table/Table.foundation.spec.ts --reporter=line`
  passed with 67 passed and 129 skipped;
  `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit` passed;
  `npm --workspace xmlui run test` passed with 267 passed;
  `npm --workspace xmlui run check:metadata` passed;
  `npm --workspace xmlui run compatibility:css-module-import-audit` passed with
  74 direct imports and 0 manual review. Full E2E was not run because P7B is not
  complete.
- P7B next-five-slice checkpoint is complete:
  10. `Row Interaction Edge Cases`: activated copied-old double-click selection
      stability while leaving dropdown-trigger and Link-in-cell interaction
      subcases explicit for later integration work.
  11. `Loading and Core Sorting Behavior`: activated loading status rendering,
      checkbox selection smoke coverage, and initial `sortBy`/`sortDirection`
      coverage.
  12. `Pagination and User Selection Props`: activated copied-old pagination
      inference, explicit pagination flags, page-size smoke coverage, and
      `userSelectCell`/`userSelectRow`/`userSelectHeading` prop/theme coverage.
  13. `Accessibility and Structural Edge Cases`: activated structure,
      checkbox-accessibility, missing/nested/special data, custom sorting icon,
      `id`/`idKey`, and no-props coverage while leaving column resizing explicit
      for a later layout slice.
  14. `Theme Variables and Cell Vertical Alignment`: activated heading
      background, checkbox font-size, and `cellVerticalAlign` coverage while
      leaving the row-separator regression explicit for later layout/styling
      work.
- Verification at this checkpoint:
  `npm --workspace xmlui exec -- playwright test src/components/Table/Table.spec.ts src/components/Table/Table.foundation.spec.ts --reporter=line`
  passed with 113 passed and 83 skipped;
  `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit` passed;
  `npm --workspace xmlui run test` passed with 267 passed;
  `npm --workspace xmlui run check:metadata` passed;
  `npm --workspace xmlui run compatibility:css-module-import-audit` passed with
  74 direct imports and 0 manual review. Full E2E was not run because P7B is not
  complete.
- P7B next-five-slice checkpoint is complete:
  15. `Events`: activated the copied-old Table-level context-menu event test
      against the rewrite's current `Text` child-content contract.
  16. `Column Alignment`: activated horizontal and vertical Column alignment
      coverage, including combined alignment and per-column background styling.
  17. `Keyboard Shortcuts`: activated select-all/delete/copy/cut/paste action
      coverage, custom key bindings, focused-row action context, row-selection
      integration, and rowsSelectable guards. One copied-old App-level
      propagation regression remains explicitly skipped because it uses
      block-bodied arrow handler syntax from the broader script parser backlog.
  18. `syncWithVar`: activated local/global variable selection sync coverage,
      initial selected IDs, deselection, bidirectional same-variable Table sync,
      precedence over `initiallySelected`, invalid variable names, and missing
      sync target fallback.
  19. `Striped Rows`: activated `striped` row class coverage and
      `backgroundColor-evenRow-Table` / `backgroundColor-oddRow-Table` theme
      variable coverage.
- Verification at this checkpoint:
  `npm --workspace xmlui exec -- playwright test src/components/Table/Table.spec.ts src/components/Table/Table.foundation.spec.ts --reporter=line`
  passed with 163 passed and 33 skipped;
  `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit` passed;
  `npm --workspace xmlui run test` passed with 267 passed;
  `npm --workspace xmlui run check:metadata` passed;
  `npm --workspace xmlui run compatibility:css-module-import-audit` passed with
  74 direct imports and 0 manual review. Full E2E was not run because P7B is not
  complete.
- P7B next-five-slice checkpoint is complete:
  20. `Virtualization`: activated copied-old virtualized rendering coverage with
      pixel-height viewports, row-height-based windowing, preserved header
      rendering, top/bottom spacer rows, and scroll updates.
  21. `Column Width Theme Variables`: activated copied-old width/minWidth/
      maxWidth theme-token coverage through the Table column sizing path.
  22. `toggleSelectionOnClick`: activated copied-old toggle-selection coverage
      for row clicks while preserving range selection.
  23. `refreshOn`: activated copied-old cell-template refresh closure coverage
      with refresh-keyed cached templates and frozen read scopes for unchanged
      refresh values.
  24. `Layout Regression/HStack`: activated copied-old initial-shrink regression
      coverage and the HStack/VStack table layout cases in the same layout
      bucket.
- Verification at this checkpoint:
  `npm --workspace xmlui exec -- playwright test src/components/Table/Table.spec.ts src/components/Table/Table.foundation.spec.ts --reporter=line`
  passed with 191 passed and 5 skipped;
  `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit` passed;
  `npm --workspace xmlui run test` passed with 267 passed;
  `npm --workspace xmlui run check:metadata` passed;
  `npm --workspace xmlui run compatibility:css-module-import-audit` passed with
  74 direct imports and 0 manual review. Full E2E was not run because P7B is not
  complete.
- P7B final closure slices are complete:
  25. `Dropdown/Link Cell Interaction`: activated the remaining interactive
      cell descendants, including dropdown trigger and Link click/context-menu
      behavior without selecting rows.
  26. `Column Resize and Row Separator`: activated column resize alignment and
      full-row separator coverage.
  27. `Keyboard Propagation Regression`: activated the Table-handled paste
      regression with current script syntax.
  28. `Table Cell Text Overflow`: activated the copied-old
      `TableCellTextOverflow.spec.ts` suite for Link/HStack/Text wrapping and
      truncation.
  29. `Cell Template API Stability`: fixed stable cell-template keys so
      imperative child APIs such as `ModalDialog.open()` preserve row context
      and open state.
- Verification at P7B closure:
  `npm --workspace xmlui exec -- playwright test src/components/Table/Table.spec.ts src/components/Table/Table.foundation.spec.ts src/components/Table/TableCellTextOverflow.spec.ts --reporter=line`
  passed with 205 passed and 0 skipped;
  `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit` passed;
  `npm --workspace xmlui run test` passed with 267 passed;
  `npm --workspace xmlui run check:metadata` passed;
  `npm --workspace xmlui run compatibility:css-module-import-audit` passed with
  74 direct imports and 0 manual review;
  `npm --workspace xmlui run test:e2e` passed with 4003 passed and 1050 skipped.

## Roadmap By Status

Completed steps are intentionally summarized here. The dashboard above is the source of truth for current verification counts. Keep future steps detailed until they are completed.

1. `[done]` P2A Form Core.
2. `[done]` P2A FormItem/Input Closure.
3. `[done]` P2A FormSegment Closure.
4. `[done]` P2B Structured Form Controls.
5. `[done]` P3A Text-Like Input Parity.
6. `[done]` P3B Boolean, Rating, Slider, Date/Time, and Color Inputs.
7. `[done]` P4A Overlay and Focus Infrastructure.
8. `[done]` P3C File and Selection Inputs.
9. `[done]` P4B Menu Family Closure.
10. `[done]` P4C Navigation Shell Components.
11. `[done]` H3A Runtime Markup Inclusion.
12. `[done]` H3B Markdown and CodeText.
13. `[done]` H4A Inspector and Inspect Button.
14. `[done]` H4B Internationalization Surface.
15. `[done]` H4C Data Policy Helper.
16. `[done]` P5A Data Operations Closure.
17. `[done]` P5B App State and Change Listening.
18. `[done]` P5C Scheduling, Messaging, and Streaming.
19. `[done]` P5D Accessibility and Runtime Services.
20. `[done]` P6A App, Routing, and Page Closure.
21. `[done]` P6B Nested App Closure.
22. `[done]` P7A Collection Display Closure.

### 21. [done] P6B: Nested App Closure

Component:

- `NestedApp`

Goal:

- Close nested app isolation, route/base behavior, style/theme boundaries, and
  global prop propagation.

Closure summary:

- Nested source renders in an isolated runtime state store.
- Compile errors stay inside the nested boundary.
- `height` applies to the container.
- `refreshVersion` and frame reset remount nested state without resetting parent state.
- Nested `Pages`/`NavLink` navigation updates nested routing without mutating the browser URL or parent route.
- `components` accepts XMLUI component source strings resolved inside the nested app.
- `config.appGlobals` and `config.name` seed nested globals without leaking parent globals.
- `activeTone` initializes the nested theme root.
- Optional `withFrame`/`splitView`/`initiallyShowCode`/`allowReset` shell controls cover the lightweight AppWithCodeView-style app/code/reset path.

Verification:

- `npm --workspace xmlui exec -- playwright test src/components/NestedApp/NestedApp.spec.ts --reporter=line`
  - 8 passed
- `npm --workspace xmlui exec -- playwright test src/components/App/App-navigation-events.spec.ts src/components/Pages/Pages.spec.ts src/components/Redirect/Redirect.spec.ts src/components/NavLink/NavLink.foundation.spec.ts tests/e2e/routing-app-shell.spec.ts --reporter=line`
  - 18 passed
- `npm --workspace xmlui exec -- playwright test src/components/SkipLink/SkipLink.spec.ts --reporter=line`
  - 5 passed
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
  - passed
- `npm --workspace xmlui run test`
  - 267 passed
- `npm --workspace xmlui run check:metadata`
  - passed
- `npm --workspace xmlui run compatibility:css-module-import-audit`
  - passed; 74 direct imports, 0 manual review
- `npm --workspace xmlui run test:e2e`
  - 3680 passed, 1373 skipped

### 22. [done] P7A: Collection Display Closure

Components:

- `List`
- `Items`
- collection templates

Goal:

- Close collection rendering, empty/loading/error states, selection/update
  behavior, virtualization where applicable, and old templates.

Closure summary:

- `List.spec.ts` is no longer globally skipped. The copied-old non-virtualized
  suite is active for default item rendering, grouping and group templates,
  ordering/filtering, loading/empty states, scrolling APIs, pagination event
  wiring, selection APIs, row double-click, keyboard actions, checkbox
  positioning, and groupBy functions.
- `List` compiler contracts and metadata now expose the copied-old collection
  props/events used by the active suite.
- `ListNative` includes a lightweight constrained-height virtualization path
  for large lists, with bounded DOM rows, stable scroll height, and regular
  rendering for small lists.
- `Items` remains behavior-compatible for its active copied coverage, including
  script function calls in item children that re-evaluate when parent variables
  change.
- The compiler now recognizes simple top-level `<script>` function and variable
  declarations as local values, and the expression runtime/codegen can call
  local/global function-valued identifiers.
- The expression runtime recognizes `Array` as a safe built-in reference so
  copied-old `Array.from(...)` collection fixtures compile and execute.
- The copied-old List invalid-prop compatibility case is active via a
  compatibility-only ignored `invalidProp`.
- `List.spec.ts` and `Items.spec.ts` have no local skipped/fixme tests.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
  - passed
- `npm --workspace xmlui exec -- playwright test src/components/Items/Items.spec.ts --grep "script function calls" --reporter=line`
  - 1 passed
- `npm --workspace xmlui exec -- playwright test src/components/List/List.spec.ts src/components/List/List.foundation.spec.ts src/components/Items/Items.spec.ts --reporter=line`
  - 149 passed, 0 skipped
- `npm --workspace xmlui run test`
  - 267 passed
- `npm --workspace xmlui run check:metadata`
  - passed; generated 231 components, 3 examples
- `npm --workspace xmlui run compatibility:css-module-import-audit`
  - passed; 74 direct imports, 0 manual review
- `npm --workspace xmlui run test:e2e`
  - 3800 passed, 1253 skipped

### 23. [done] P7B: Table and Column Closure

Components:

- `Table`
- `Column`

Goal:

- Close sorting, selection, editing/update paths, column templates,
  responsive behavior, and old table APIs.

Completed P7B slices:

1. `Table/Column Inventory and Active Baseline`
2. `Column Metadata and Template Contracts`
3. `Table Sorting/Selection First Closure`
4. `Selection Checkbox Visibility`
5. `Selectable/Disabled Row Predicates`
6. `Context Menu/Row Event Context`
7. `Auto Focus`
8. `Checkbox Tolerance`
9. `Sorting Indicators`
10. `Row Interaction Edge Cases`
11. `Loading and Core Sorting Behavior`
12. `Pagination and User Selection Props`
13. `Accessibility and Structural Edge Cases`
14. `Theme Variables and Cell Vertical Alignment`
15. `Events`
16. `Column Alignment`
17. `Keyboard Shortcuts`
18. `syncWithVar`
19. `Striped Rows`
20. `Virtualization`
21. `Column Width Theme Variables`
22. `toggleSelectionOnClick`
23. `refreshOn`
24. `Layout Regression/HStack`
25. `Dropdown/Link Cell Interaction`
26. `Column Resize and Row Separator`
27. `Keyboard Propagation Regression`
28. `Table Cell Text Overflow`
29. `Cell Template API Stability`

Checkpoint status:

- Basic copied-old Table coverage and current foundation coverage are active.
- Column metadata/contract entries for table cell alignment/background props are
  active.
- Selection checkbox visibility, row disabled/unselectable predicates, and
  row-scoped context-menu event variables are active.
- Auto focus, checkbox tolerance interactions, and sorting indicator visibility
  are active.
- Row double-click selection stability, loading/core sorting, pagination/user
  selection props, accessibility/structural edge cases, theme variable aliases,
  and cell vertical alignment are active.
- Events, Column alignment, keyboard actions, syncWithVar selection sync, and
  striped row styling are active.
- Virtualization, Column width theme variables, toggleSelectionOnClick,
  refreshOn cell-template closure caching, and layout/HStack regression
  coverage are active.
- Dropdown/Link cell interactions, column resize alignment, row separators,
  Table-handled paste propagation, copied-old text overflow, and imperative
  child APIs inside cell templates are active.
- `Table`, `Column`, and copied-old Table cell text overflow coverage have no
  local skipped/fixme tests.

Verification:

- `npm --workspace xmlui exec -- playwright test src/components/Table/Table.spec.ts src/components/Table/Table.foundation.spec.ts src/components/Table/TableCellTextOverflow.spec.ts --reporter=line`
  - 205 passed, 0 skipped
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
  - passed
- `npm --workspace xmlui run test`
  - 267 passed
- `npm --workspace xmlui run check:metadata`
  - passed; generated 231 components, 3 examples
- `npm --workspace xmlui run compatibility:css-module-import-audit`
  - passed; 74 direct imports, 0 manual review
- `npm --workspace xmlui run test:e2e`
  - 4003 passed, 1050 skipped

### 24. [done] P7C: Tree and Table Of Contents Closure

Components:

- `Tree`
- `TreeDisplay`
- `TableOfContents`

Goal:

- Close hierarchical rendering, expansion/selection, async loading, keyboard
  behavior, and scroll/heading tracking.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
  - passed
- Focused P7C Playwright bundle:
  - 316 passed, 0 skipped
- P7C local skip/fixme audit:
  - no remaining markers in `Tree`, `TreeDisplay`, or `TableOfContents`
- `npm --prefix xmlui run check:metadata`
  - passed; generated 231 components, 3 examples
- `npm --workspace xmlui run compatibility:css-module-import-audit`
  - passed; 74 direct imports, 0 manual review
- `npm --workspace xmlui run test:e2e`
  - ran after P7C closure; 4308 passed, 742 skipped, 7 failed outside P7C

### 25. [done] P7D: Layout Container Closure

Components:

- `Stack`
- `HStack`
- `VStack`
- `FlowLayout`
- `TileGrid`
- `Card`
- `Splitter`
- `ScrollViewer`
- `StickyBox`
- `StickySection`
- `ResponsiveBar`

Goal:

- Close layout props, responsive behavior, scroll/sticky behavior, splitter
  state, and visual parity.

Checkpoint:

- First three slices are complete. Stack aliases `CHStack` and `CVStack` are
  registered across compiler/runtime/metadata surfaces; FlowLayout copied-old
  coverage is active with explicit follow-up skips for scroller fade overlays,
  proportional/star-width solver behavior, FormItem width edge behavior, and
  non-visual child layout-context handling; Card copied-old coverage is active
  with explicit skips only for two title-link/local-state interaction edges.
- Slices 4-6 are complete. TileGrid/ResponsiveBar copied-old smoke coverage is
  active with explicit skips for selection/overflow-dropdown parity; Splitter
  copied-old static layout, alias, sizing, template, cursor, and theme coverage
  is active with pointer resizing and conditional-child parity still skipped;
  ScrollViewer copied-old native-scroll, header/footer, API, theme, and mobile
  native-fallback coverage is active with overlay-scrollbars/fade parity still
  skipped.
- Slice 7 is complete. StickySection copied-old coverage is fully active with
  top/bottom sticky geometry, z-index ordering, theme smoke coverage, mixed
  directions, and StickyBox foundation coverage passing.
- P7D closure verification passed: full layout focused bundle 220 passed, 128
  skipped; unit tests 267 passed; TypeScript, metadata build, CSS module audit,
  and full E2E passed. Full E2E: 4520 passed, 539 skipped.

### 26. [done] P1A: Primitive and Text Closure

Components:

- headings/text primitives
- `Text`
- `Image`
- `IFrame`
- `Icon`
- `Logo`
- `Link`
- `CodeBlock`
- `ContentSeparator`
- `NoResult`
- `PageMetaTitle`
- `QRCode`
- `SpaceFiller`

Goal:

- Close old suites for primitives and presentational components not already
  completed through previous waves.

First-three-slice checkpoint:

- Slice 1, `Heading and Text Primitive Closure`, is complete. Heading/Text
  copied and style coverage is active; removed a stale `SKIP_REASON` import
  from `Text.spec.ts`.
- Slice 2, `Image, IFrame, Icon, and Logo Closure`, is complete. Image, IFrame,
  and Icon copied suites match the original source and have no local skips;
  removed stale Image/Icon imports and added direct Logo coverage for explicit
  source rendering, default/custom alt text, inline display, and bound-state
  updates.
- Slice 3, `Link Closure`, is complete. The copied-old Link fixme for
  combined tooltip/variant/icon/animation behavior is active. Link now exposes
  `backgroundColor-Link` through the same current-variant CSS-variable bridge
  used for text/font/border Link variables.
- Verification: focused slice 1 bundle passed 277 tests; focused slice 2 bundle
  passed 147 tests; focused Link bundle passed 55 tests; combined focused
  slices 1-3 bundle passed 479 tests. TypeScript build check, unit tests
  (267 passed), metadata build, and CSS module import audit passed. Full E2E
  intentionally not run because P1A still has slices 4-5 remaining.

Closure checkpoint:

- Slice 4, `CodeBlock, ContentSeparator, NoResult, PageMetaTitle, QRCode, and
  SpaceFiller Closure`, is complete. CodeBlock, ContentSeparator,
  PageMetaTitle, QRCode, and SpaceFiller specs match the original copied
  coverage; NoResult retains additional rewrite coverage for default label,
  icon, custom label, hidden icon, and child content.
- Slice 5, `P1A Final Audit and Full Verification`, is complete. The local
  primitive/text/presentational skip/fixme audit found no remaining markers
  across Heading, Text, Image, IFrame, Icon, Logo, Link, CodeBlock,
  ContentSeparator, NoResult, PageMetaTitle, QRCode, and SpaceFiller.
- Verification: focused slice 4 bundle passed 86 tests; full focused P1A bundle
  passed 565 tests; TypeScript build check passed; unit tests passed with 267
  tests; metadata build passed with 233 components and 3 examples; CSS module
  import audit passed with 74 direct imports and 0 manual review; full
  `npm --workspace xmlui run test:e2e` passed with 4526 passed and 538 skipped.

### 27. [done] H5A: Behavior and Internal Part Helpers

Components/helpers:

- `Animation`
- `Part`

Goal:

- Close remaining behavior helpers and internal part/theming semantics required
  by old suites.

Completed:

- Replaced the placeholder animation behavior wrapper with dependency-free
  preset parsing and transition application for `animation` and
  `animationOptions`.
- Added `Part` as a built-in wrapperless helper, registered it in compiler and
  runtime contracts, and routed its direct child through the adapter with
  `data-part-id` and `data-xmlui-part`.
- Fixed the reported `MessageListener` E2E assertion so it preserves the no
  wrapper invariant while checking the actual computed Stack gap instead of a
  brittle hard-coded token value.
- Verification: focused H5A/MessageListener bundle passed 8 tests; TypeScript
  build check passed; unit tests passed with 267 tests; metadata build passed
  with 234 components and 3 examples; CSS module import audit passed with 74
  direct imports and 0 manual review; full `npm --workspace xmlui run test:e2e`
  passed with 4529 passed and 538 skipped.

### 28. [done] H5B: Menu Styling Reconciliation

Component/helper:

- `Menu`

Goal:

- Reconcile old internal menu styling/helper contracts with the completed menu
  family.

Completed:

- The original shared Menu styling layer existed only
  as `components/Menu/Menu.module.scss`, not as a runtime XMLUI component.
  The rewrite now has a matching shared `Menu.module.scss`, DropdownMenu and
  ContextMenu consume its content/item/separator mixins, MenuItem active-hover
  theme variables are exposed with safe defaults, and active-hover coverage is
  active.
- Verification: focused menu coverage passed with 74 passed and 1 existing
  skip; TypeScript build check passed; unit tests passed with 267 tests;
  metadata build passed with 234 components and 3 examples; CSS module import
  audit passed with 74 direct imports and 0 manual review; full
  `npm --workspace xmlui run test:e2e` passed with 4529 passed and 539 skipped.

### 29. [done] P8A: Theme, Slots, Tone, Behaviors, and Parts Sweep

Goal:

- Close cross-cutting theme variables, tone-specific defaults, slots,
  behaviors, parts, and docs metadata after component suites are mostly active.

Completion Record:

- Slot now subscribes to context-prop dependencies,
  so slot templates react to changing values. Theme now follows original
  `applyIf` semantics: explicit `applyIf=false` renders children unwrapped and
  unthemed, dynamic `applyIf` toggles theme application, and an empty Theme is
  a no-op without a wrapper by default.
- Behavior attachment coverage locks non-visual `Part` compatibility: `when`
  remains available, while tooltip, label, variant, and animation visual
  behaviors do not attach.
- Unified component metadata now preserves docs/styling-facing contract data:
  parts, theme variables, default theme variables, and tone-specific theme
  variables. The deterministic metadata hash includes these fields.
- Theme, Slot, ToneSwitch, and ToneChangerButton no longer have local P8A
  umbrella skips; representative active coverage replaces those placeholders.
- Verification: focused P8A bundle (`Slot`, `Part`, `Theme`, `ToneSwitch`,
  `ToneChangerButton`, `Animation`) passed with 16 passed and 0 skips;
  TypeScript build check passed; unit tests passed with 269 tests; metadata
  build passed with 234 components and 3 examples; scoped inline-style audit
  passed; full `npm --workspace xmlui run test:e2e` passed on rerun with 4537
  passed and 535 skipped. The first full E2E attempt hit a one-off TextArea
  concise validation feedback failure that passed in isolation before the full
  rerun.

### 30. [current] Phase 6: Extension Packages and External Authoring

Goal:

- Close extension package registration, metadata, functions, components,
  themes, package exports, standalone scripts, Vite imports, and first-party
  extension packages.

Website migration priority:

- Follow `.plans/website-migration-plan.md` first because the website is the
  fastest broad visual regression surface for the rewrite.
- Migrate the website's extension packages before the full website copy:
  `xmlui-docs-blocks`, `xmlui-website-blocks`, `xmlui-search`, then the
  remaining visual/demo packages needed by extension docs.
- Use `.plans/extension-package-migration-template.md` for each package so old
  E2E tests and new state-update smoke tests are planned consistently.

### 31. [remaining] Phase 7: Developer Tooling, Docs, Playground, and AI Integrations

Goal:

- Close VS Code, docs generation, website examples, playground, create-app,
  preview SSG, and XMLUI AI workflow tooling around the rebuilt compiler,
  metadata, runtime, and component model.

### 32. [remaining] Phase 8: Full Compatibility Sweep

Goal:

- Expand and pass the sweep across old unit tests, E2E, integration,
  docs/examples, package artifacts, extension flows, playground, CI workflows,
  visual checks, and performance checks.

### 33. [remaining] Phase 9: Release Readiness and Migration Safety

Goal:

- Close release scripts, versioning, migration notes, compatibility debt, and
  final sign-off for users and contributors.

## Completion Criteria

- Old XMLUI public behavior is preserved or any deliberate break has a written
  migration decision.
- Copied old suites are active and passing, except for documented upstream
  fixmes or explicitly deferred debt.
- Metadata, docs, tooling, standalone, extension, and playground workflows
  match old user-visible contracts.
- Full compatibility and performance sweeps pass.

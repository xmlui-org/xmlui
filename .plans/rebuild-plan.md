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
| `[current]` | P6B Nested App Closure | Start here next. |

Current next marker:

`NEXT: P6B Nested App Closure`

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
- Full E2E: 3675 passed, 1373 skipped.
- TypeScript, unit tests, metadata build, and CSS module audit: passed.

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

### NEXT: P6B Nested App Closure

Fresh-session handoff prompt:

> Continue `.plans/rebuild-plan.md` from **NEXT: P6B Nested App Closure**.

Current handoff state:

- Start with P6B Nested App Closure.
- Keep the component-by-component closure approach.
- Use `/Users/dotneteer/source/xmlui` as the compatibility source of truth before changing NestedApp behavior.
- Preserve existing dirty worktree changes that are unrelated to the current slice.
- Run focused NestedApp/App/routing verification as needed, then TypeScript, unit tests, metadata, CSS audit, and full `npm --workspace xmlui run test:e2e` before completing the step.

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

### 21. [current] P6B: Nested App Closure

Component:

- `NestedApp`

Goal:

- Close nested app isolation, route/base behavior, style/theme boundaries, and
  global prop propagation.

### 22. [remaining] P7A: Collection Display Closure

Components:

- `List`
- `Items`
- collection templates

Goal:

- Close collection rendering, empty/loading/error states, selection/update
  behavior, virtualization where applicable, and old templates.

### 23. [remaining] P7B: Table and Column Closure

Components:

- `Table`
- `Column`

Goal:

- Close sorting, selection, editing/update paths, column templates,
  responsive behavior, and old table APIs.

### 24. [remaining] P7C: Tree and Table Of Contents Closure

Components:

- `Tree`
- `TreeDisplay`
- `TableOfContents`

Goal:

- Close hierarchical rendering, expansion/selection, async loading, keyboard
  behavior, and scroll/heading tracking.

### 25. [remaining] P7D: Layout Container Closure

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

### 26. [remaining] P1A: Primitive and Text Closure

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

### 27. [remaining] H5A: Behavior and Internal Part Helpers

Components/helpers:

- `Animation`
- `Part`

Goal:

- Close remaining behavior helpers and internal part/theming semantics required
  by old suites.

### 28. [remaining] H5B: Menu Styling Reconciliation

Component/helper:

- `Menu`

Goal:

- Reconcile old internal menu styling/helper contracts with the completed menu
  family.

### 29. [remaining] P8A: Theme, Slots, Tone, Behaviors, and Parts Sweep

Goal:

- Close cross-cutting theme variables, tone-specific defaults, slots,
  behaviors, parts, and docs metadata after component suites are mostly active.

### 30. [remaining] Phase 6: Extension Packages and External Authoring

Goal:

- Close extension package registration, metadata, functions, components,
  themes, package exports, standalone scripts, Vite imports, and first-party
  extension packages.

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

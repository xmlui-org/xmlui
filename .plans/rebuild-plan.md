# XMLUI Rebuild Plan

Status: active  
Source baseline: `/Users/dotneteer/source/xmlui`  
Rewrite workspace: `/Users/dotneteer/source/xmlui-rs`

This is the single execution plan for the XMLUI rewrite. It intentionally keeps
completed work terse and keeps remaining work ordered. Supporting `.ai` notes
may contain evidence and session history, but they are not required to choose
the next step.

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

## Completed Work

Only titles are kept here so the plan stays readable.

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

## Current Status

### P2A: Form Core - In Progress

Active copied-old coverage:

- `FormItem.spec.ts`: Basic Functionality.
- `FormSegment.spec.ts`: Basic Rendering.
- `Form.spec.ts`: initial Basic Functionality, `hideButtonRow`, core
  `hideButtonRowUntilDirty`, `enableSubmit`, `data`, inherited item label
  settings, `enabled`, `buttonRowTemplate`, local Events subset, local APIs
  subset, Context Variables, and the currently active `onValidate Integration`
  subset.

Current `onValidate Integration` active cases:

- multiple fields with `onValidate` show messages on submit;
- `validationMode="onChanged"` runs real-time custom validation;
- `customValidationsDebounce` delays change-time validation;
- submit waits for async `onValidate`;
- submit is blocked while async validation is in flight and the Save button
  shows `Validating...`;
- async validation failure blocks submit;
- validation messages appear in the correct timing order.

Compatibility support added during this step:

- XMLUI script assignment supports member targets such as
  `testState.sequence = ...`, matching copied-old handler behavior.

Latest verified P2A state:

- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.foundation.spec.ts src/components/FormItem/FormItem.foundation.spec.ts src/components/FormSegment/FormSegment.foundation.spec.ts src/components/Form/Form.spec.ts src/components/FormItem/FormItem.spec.ts src/components/FormSegment/FormSegment.spec.ts`
  - 125 passed
  - 254 skipped
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
  - passed
- `npm --workspace xmlui test`
  - 267 passed
- `npm --workspace xmlui run build:metadata`
  - passed
- `npm --workspace xmlui run compatibility:css-module-import-audit`
  - passed

## Next Step

### NEXT: P2A Form Core - Built-In/Custom `onValidate` Order

Fresh-session handoff prompt:

> Continue `.plans/rebuild-plan.md` from **NEXT: P2A Form Core -
> Built-In/Custom `onValidate` Order**.

Task:

1. Inspect the copied-old test in
   `xmlui/src/components/Form/Form.spec.ts`:
   `onValidate with built-in validations run in correct order for multiple
   fields`.
2. Compare with the original test/source under
   `/Users/dotneteer/source/xmlui/xmlui/src/components/Form`.
3. Activate only that test or a narrowly named subgroup around it.
4. Preserve the remaining deferred `onValidate` tests until their prerequisites
   are implemented.
5. Make the smallest compatibility change required.
6. Run focused Playwright for the activated test.
7. Run the P2A Form cluster.
8. Run TypeScript, unit tests, metadata build, and CSS module import audit.
9. Update this plan with the result and move this NEXT marker forward.

Likely files:

- `xmlui/src/components/Form/Form.spec.ts`
- `xmlui/src/components/Form/FormReact.tsx`
- `xmlui/src/components/Form/FormContext.tsx`
- `xmlui/src/components/FormItem/FormItemReact.tsx`
- `xmlui/src/compiler/scriptSemantics.ts`
- `xmlui/src/compiler/codegen/script.ts`
- `xmlui/src/parser/script/parser.ts`

## Remaining Work In Sequence

### 1. Finish P2A: Form Core

Continue activating copied-old Form/FormItem/FormSegment tests by feature group:

1. `onValidate with built-in validations run in correct order for multiple
   fields`.
2. `multiple fields with onValidate complete before form submission completes`.
3. `changing field value re-triggers onValidate in real-time`.
4. `onValidate validation state persists across field changes`.
5. Submit URL and method.
6. Accessibility.
7. Theme variables and validation display styling.
8. Edge cases.
9. Original legacy form integration tests.
10. Form API `getData` deep clone/filtering and `noSubmit`.
11. Persistence, `dataAfterSubmit`, sticky button row, value preservation, and
    `type="items"` UDC cases.
12. Remaining FormItem validation/type/accessibility/theme/edge cases.
13. Remaining FormSegment scoped context, discovery, layout, APIs, and dirty
    state.

### 2. P2B: Structured Form Controls

Components:

- `StepperForm`
- `TabsForm`
- `FormSegment`
- `Stepper`

Goal:

- Close structured form navigation, invalid-segment routing, submit/reset
  semantics, and old stacked/accordion visual modes.

Verification:

- Focused copied-old E2E for `StepperForm`, `TabsForm`, `FormSegment`, and
  `Stepper`.

### 3. P3A: Text-Like Input Parity

Components:

- `TextBox`
- `PasswordInput`
- `TextArea`
- `NumberBox`

Goal:

- Close value editing, caret behavior, form binding, validation, variants,
  parts, behaviors, and labels.

### 4. P3B: Boolean, Rating, Slider, Date/Time, and Color Inputs

Components:

- `Checkbox`
- `Switch`
- `RatingInput`
- `Slider`
- `ColorPicker`
- `DateInput`
- `DatePicker`
- `TimeInput`

Goal:

- Close form binding, validation, theme-variable state matrix,
  keyboard/mobile behavior, and picker parity.

### 5. P4A: Overlay and Focus Infrastructure

Components and services:

- `ModalDialog`
- `Drawer`
- `Tooltip`
- popover/portal/focus primitives used by menus and pickers

Goal:

- Close portal behavior, focus trapping/restoration, escape/outside-click,
  stacking, keyboard behavior, and overlay accessibility.

### 6. P3C: File and Selection Inputs

Components:

- `FileInput`
- `Select`
- `AutoComplete`

Goal:

- Close file handling, dropdown behavior, selection state, form binding,
  validation, keyboard navigation, and overlay integration.

### 7. P4B: Menu Family Closure

Components:

- `DropdownMenu`
- `ContextMenu`
- `MenuItem`
- internal/missing `Menu` helper

Goal:

- Close trigger behavior, keyboard navigation, focus handling, nested menus,
  context positioning, and styling parity.

### 8. P4C: Navigation Shell Components

Components:

- `NavPanel`
- `NavGroup`
- `NavLink`
- `NavPanelCollapseButton`
- `AppHeader`
- `Footer`
- `ProfileMenu`

Goal:

- Close app-shell navigation, active route state, collapse/expand behavior,
  profile menu behavior, and responsive shell layout.

### 9. H3A: Runtime Markup Inclusion

Component:

- `IncludeMarkup`

Goal:

- Close runtime markup loading, compilation boundary behavior, error handling,
  state updates, and examples.

### 10. H3B: Markdown and CodeText

Components:

- `Markdown`
- `CodeText`

Goal:

- Close markdown rendering, XMLUI code fences, syntax highlighting, runtime
  examples, and old Markdown/FocusScope prerequisite tests.

### 11. H4A: Inspector and Inspect Button

Components:

- `Inspector`
- `InspectButton`

Goal:

- Close runtime inspection UI, debug metadata, modal integration, and relevant
  examples.

### 12. H4B: Internationalization Surface

Component:

- `I18n`

Goal:

- Close translation lookup, formatting, fallback behavior, and update paths.

### 13. H4C: Data Policy Helper

Component:

- `RetryPolicy`

Goal:

- Close retry policy integration for data/request components.

### 14. P5A: Data Operations Closure

Components and services:

- `DataSource`
- `APICall`
- `Actions.callApi`
- request lifecycle and invalidation helpers

Goal:

- Close old data operation suites, cancellation, mock data, polling, retry, and
  request status behavior.

### 15. P5B: App State and Change Listening

Components and services:

- `AppState`
- listeners/change handlers
- state persistence where applicable

Goal:

- Close app-level state synchronization, event ordering, and update behavior.

### 16. P5C: Scheduling, Messaging, and Streaming

Components and services:

- `Timer`
- `Queue`
- event source/websocket-style runtime helpers
- toast/pub-sub behavior where tied to scheduling

Goal:

- Close delayed work, repeated work, queue processing, messaging, streaming,
  cancellation, and update paths.

### 17. P5D: Accessibility and Runtime Services

Components and services:

- `LiveRegion`
- `NoResult`
- toast/service helpers
- skip/bookmark helpers where not already closed

Goal:

- Close runtime service accessibility, announcements, and user-visible update
  paths.

### 18. P6A: App, Routing, and Page Closure

Components:

- `App`
- `Pages`
- `Page`
- `Redirect`
- route-aware links/nav behavior

Goal:

- Close routing, guards, redirects, active route state, page metadata, and app
  shell integration.

### 19. P6B: Nested App Closure

Component:

- `NestedApp`

Goal:

- Close nested app isolation, route/base behavior, style/theme boundaries, and
  global prop propagation.

### 20. P7A: Collection Display Closure

Components:

- `List`
- `Items`
- collection templates

Goal:

- Close collection rendering, empty/loading/error states, selection/update
  behavior, virtualization where applicable, and old templates.

### 21. P7B: Table and Column Closure

Components:

- `Table`
- `Column`

Goal:

- Close sorting, selection, editing/update paths, column templates,
  responsive behavior, and old table APIs.

### 22. P7C: Tree and Table Of Contents Closure

Components:

- `Tree`
- `TreeDisplay`
- `TableOfContents`

Goal:

- Close hierarchical rendering, expansion/selection, async loading, keyboard
  behavior, and scroll/heading tracking.

### 23. P7D: Layout Container Closure

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

### 24. P1A: Primitive and Text Closure

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

### 25. H5A: Behavior and Internal Part Helpers

Components/helpers:

- `Animation`
- `Part`

Goal:

- Close remaining behavior helpers and internal part/theming semantics required
  by old suites.

### 26. H5B: Menu Styling Reconciliation

Component/helper:

- `Menu`

Goal:

- Reconcile old internal menu styling/helper contracts with the completed menu
  family.

### 27. P8A: Theme, Slots, Tone, Behaviors, and Parts Sweep

Goal:

- Close cross-cutting theme variables, tone-specific defaults, slots,
  behaviors, parts, and docs metadata after component suites are mostly active.

### 28. Phase 6: Extension Packages and External Authoring

Goal:

- Close extension package registration, metadata, functions, components,
  themes, package exports, standalone scripts, Vite imports, and first-party
  extension packages.

### 29. Phase 7: Developer Tooling, Docs, Playground, and AI Integrations

Goal:

- Close VS Code, docs generation, website examples, playground, create-app,
  preview SSG, and XMLUI AI workflow tooling around the rebuilt compiler,
  metadata, runtime, and component model.

### 30. Phase 8: Full Compatibility Sweep

Goal:

- Expand and pass the sweep across old unit tests, E2E, integration,
  docs/examples, package artifacts, extension flows, playground, CI workflows,
  visual checks, and performance checks.

### 31. Phase 9: Release Readiness and Migration Safety

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

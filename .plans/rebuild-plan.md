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
- After each completed step, include `npm --workspace xmlui run test:e2e` in
  verification. As of June 25, 2026, this E2E command has been optimized in a
  parallel session and is expected to take about 90 seconds.

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
  subset, Context Variables, `onValidate Integration`, Submit URL and Method,
  Accessibility, Theme Variables, Edge Cases, and the initial Original legacy
  form integration slice. The first deferred legacy integration subgroup is
  also active: button-row templates, primitive/object/empty-array data inputs,
  labels/order, REST submit requests, client-side submit blocking, and invisible
  required fields, backend validation summaries, smart CRUD create submit, and
  modal-context data URL. The Form API `getData` subgroup is active, including
  copied-old deep-clone cases that use object spread, `delete`, local
  declarations, and repeated API calls. The first `FormItem type="items"`
  slice is active: submit with object child fields, submit with empty nested
  `bindTo`, nested label width/position, default/custom `gap-Form` spacing,
  and user-defined component children inside item rows.

Current `onValidate Integration` active cases:

- multiple fields with `onValidate` show messages on submit;
- `validationMode="onChanged"` runs real-time custom validation;
- `customValidationsDebounce` delays change-time validation;
- submit waits for async `onValidate`;
- submit is blocked while async validation is in flight and the Save button
  shows `Validating...`;
- async validation failure blocks submit;
- validation messages appear in the correct timing order;
- built-in required, length, and pattern validations run before custom
  `onValidate`;
- submit-time validation waits for all copied-old multi-field `onValidate`
  handlers;
- change-time validation re-runs `onValidate` for each value change;
- validation state persists independently across fields.

Compatibility support added during this step:

- XMLUI script assignment supports member targets such as
  `testState.sequence = ...`, matching copied-old handler behavior.
- FormItem forwards length and pattern validation props into form registration;
  Form validates required, length, and pattern constraints before custom
  `onValidate`.
- Form accepts `submitUrl` and `submitMethod`; URL submission defaults to
  `POST` for new/null data and `PUT` for existing object data.
- Form metadata and renderer expose `submitUrl`/`submitMethod`, including
  copied-old lowercase compatibility spellings.
- Test-bed fixtures include a minimal `apiInterceptor.operations` route
  shim; `FormDriver` includes `waitForSubmitResponse`.
- Form values support dot-path `bindTo` reads/writes while preserving flat field
  names.
- `FormItem type="select"` and `type="radioGroup"` reuse the Select/RadioGroup
  option extraction path and preserve copied-old option test IDs.
- Copied-old malformed Form `data="{invalidJson}"` is normalized in the testbed
  legacy markup shim so production unresolved-identifier diagnostics remain
  intact.
- Runtime XMLUI references include `JSON`, so copied-old handlers such as
  `args => output = JSON.stringify(args)` work through the normal event path.
- `swapCancelAndSave` now matches the original built-in button order:
  Cancel/Save by default, Save/Cancel when swapped.
- Test `FormDriver` supports legacy label-aware button lookup, Enter-submit
  from the first form control, and `getSubmitRequest`.
- `getData()` and `validate().data` return cleaned deep-cloned form data,
  excluding `noSubmit`, `undefined`, and `__UNBOUND_FIELD__` values.
- URL string `data` values fetch relative endpoints, populate form values, and
  reset the dirty/error/cache baseline after load.
- Backend submit validation responses normalize `issues` into Form summary and
  field validation status state, including warning severity.
- The testbed API interceptor supports old-suite `Errors.HttpError`,
  initialized `$state`, `$requestBody`, `$pathParams`, arrow handlers, and
  path-parameter route patterns.
- URL-backed Form `data` is used as the built-in submit URL fallback when
  `submitUrl` is omitted, matching the original internal `_data_url` behavior.
- FormItem `initialValue` fills both `undefined` and `null` loaded field values.
- XMLUI script syntax supports object spread in object literals and unary
  `delete`; `getData()` is allowed as a compiled expression method call so
  copied-old Form API handlers can build and mutate cloned data objects.
- `FormItem type="items"` exposes `addItem`/`removeItem`, renders row children
  with `$item`/`$itemIndex` context, scopes nested FormItem `bindTo` paths into
  array items, preserves empty nested `bindTo` as the row value, and uses the
  component stylesheet `itemsStack` class for item-row spacing.
- Form dot-path writes preserve and create arrays for numeric path segments
  such as `arrayItems.0.name`.
- The App baseline no longer applies the hyphenated `font-size` theme token as
  the app root CSS `font-size`, preserving copied-old `$space-4`/`gap-Form`
  behavior under XMLUI's default theme.
- The testbed fixture supports copied-old `components` sources and compiles
  them as user-defined components for focused component tests.
- TextBox direct `bindTo` reads and writes through the current Form context,
  including scoped `FormItem type="items"` row prefixes used by UDC children.
- TextBox legacy `data-part-id="input"` now lands on the native input instead
  of the input wrapper, matching copied-old selectors.

Latest verified P2A state:

- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.foundation.spec.ts src/components/FormItem/FormItem.foundation.spec.ts src/components/FormSegment/FormSegment.foundation.spec.ts src/components/Form/Form.spec.ts src/components/FormItem/FormItem.spec.ts src/components/FormSegment/FormSegment.spec.ts`
  - 212 passed
  - 167 skipped
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
  - passed
- `npm --workspace xmlui test`
  - 267 passed
- `npm --workspace xmlui run build:metadata`
  - passed
- `npm --workspace xmlui run compatibility:css-module-import-audit`
  - passed
- `npm --workspace xmlui run test:e2e`
  - 2800 passed
  - 2144 skipped

## Next Step

### NEXT: P2A Form Core - Form Persistence, dataAfterSubmit, Sticky Rows, and Value Preservation

Fresh-session handoff prompt:

> Continue `.plans/rebuild-plan.md` from **NEXT: P2A Form Core - Form
> Persistence, dataAfterSubmit, Sticky Rows, and Value Preservation**.

Current handoff state:

- This is the next executable step. A new session receiving "Go on with the
  next step" should start here.
- Do not restart earlier Form work. The latest verified P2A state above is the
  baseline.
- There are unrelated dirty worktree files, including standalone sample
  `xmlui-latest.js` outputs and prior component/runtime edits. Do not revert
  files unless the user explicitly asks.
- Playwright/E2E may need unsandboxed execution because local dev-server
  binding can fail in the sandbox.

Completed immediately before this marker:

- Activated the copied-old `FormItem type="items"` follow-up slice:
  `submit with type 'items'`, `submit with type 'items', empty bindTo`,
  nested `labelWidth`, nested `labelPosition`, default/custom `gap-Form`
  spacing, and UDC children with scoped row `bindTo`.
- Added the `type="items"` row API/rendering path, array-preserving form path
  writes, testbed UDC registration, TextBox scoped direct `bindTo`, and the app
  baseline font-size compatibility fix required by default row spacing.

Step goal:

Activate the next coherent copied-old Form subgroup after the completed
`type="items"` follow-ups. Recommended order:

1. Inspect copied-old persistence, `dataAfterSubmit`, sticky button row, and
   value-preservation cases.
2. Choose one narrow prerequisite subgroup and activate only tests covered by
   that subgroup.
3. Keep unrelated FormItem/FormSegment closure work deferred.

Task checklist:

1. Inspect the remaining skipped copied-old tests in
   `xmlui/src/components/Form/Form.spec.ts`, especially persistence,
   `dataAfterSubmit`, sticky button row, and value preservation.
2. Compare with the original test/source under
   `/Users/dotneteer/source/xmlui/xmlui/src/components/Form`.
3. Choose one narrow, coherent prerequisite subgroup and activate only the tests
   covered by that subgroup.
4. Preserve unrelated deferred Form tests until their prerequisites are
   implemented.
5. Make the smallest compatibility change required.
6. Run focused Playwright for the activated test.
7. Run the P2A Form cluster.
8. Run TypeScript, unit tests, metadata build, CSS module import audit, and
   `npm --workspace xmlui run test:e2e`.
9. Update this plan with the result and move this NEXT marker forward.

Likely files:

- `xmlui/src/components/Form/Form.spec.ts`
- `xmlui/src/components/Form/FormReact.tsx`
- `xmlui/src/components/Form/FormContext.tsx`
- `xmlui/src/components/App/AppReact.tsx`
- `xmlui/src/components/TextBox/TextBoxReact.tsx`
- `xmlui/src/components/TextBox/TextBox.renderer.tsx`
- `xmlui/src/testing/ComponentDrivers.ts`
- `xmlui/src/testing/fixtures.ts`

Original-reference paths:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Form`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/FormItem`
- `/Users/dotneteer/source/xmlui/xmlui/src/parsers`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core`

Verification commands:

- Focused Playwright for each activated test, for example:
  `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts -g "Form persistence|dataAfterSubmit|stickyButtonRow|Value preservation"`
- P2A Form cluster:
  `npm --workspace xmlui exec -- playwright test src/components/Form/Form.foundation.spec.ts src/components/FormItem/FormItem.foundation.spec.ts src/components/FormSegment/FormSegment.foundation.spec.ts src/components/Form/Form.spec.ts src/components/FormItem/FormItem.spec.ts src/components/FormSegment/FormSegment.spec.ts`
- TypeScript:
  `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- Unit tests:
  `npm --workspace xmlui test`
- Metadata:
  `npm --workspace xmlui run build:metadata`
- CSS audit:
  `npm --workspace xmlui run compatibility:css-module-import-audit`
- Full E2E after the completed step:
  `npm --workspace xmlui run test:e2e`

## Remaining Work In Sequence

### 1. Finish P2A: Form Core

Completed in this P2A phase:

- Submit URL and method.
- Accessibility.
- Theme variables and validation display styling.
- Edge cases.
- Original legacy form integration initial slice.
- Deferred original legacy form integration active subgroup.
- Form API `getData` deep clone/filtering and `noSubmit`.
- Async URL-backed Form `data` and undefined/null field initialization.
- Backend validation summary mapping.
- Smart CRUD create submit response.
- Modal-context data URL and data URL submit fallback.
- Copied-old Form API script syntax prerequisites for object spread, `delete`,
  and repeated `getData()` calls.
- First `FormItem type="items"` slice: add/submit, empty nested `bindTo`,
  nested label inheritance, default/custom gap spacing, and UDC children.

Continue activating copied-old Form/FormItem/FormSegment tests by feature group:

1. Persistence, `dataAfterSubmit`, sticky button row, and value preservation.
3. Remaining FormItem validation/type/accessibility/theme/edge cases.
4. Remaining FormSegment scoped context, discovery, layout, APIs, and dirty
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

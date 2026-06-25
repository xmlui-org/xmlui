# XMLUI Rebuild Plan

Status: active  
Source baseline: `/Users/dotneteer/source/xmlui`  
Rewrite workspace: `/Users/dotneteer/source/xmlui-rs`

This is the single execution plan for the XMLUI rewrite. It intentionally keeps
completed work terse and keeps remaining work ordered. Supporting `.ai` notes
may contain evidence and session history, but they are not required to choose
the next step.

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
| `[current]` | P2A FormItem Closure | Continue with direct input/FormItem parity, now focused on variants/parts and remaining type parity for FormItem-dependent inputs. |
| `[remaining]` | FormSegment Closure | Finish scoped context, discovery, layout, APIs, and dirty-state parity after the FormItem/input closure work. |
| `[remaining]` | P2B and later phases | Structured forms, inputs, overlays, menus, navigation, data operations, routing, collections, tooling, docs, extensions, sweeps, and release readiness remain ordered below. |

Current next marker:

`NEXT: P2A FormItem Closure - Input Variants, Parts, and Remaining Type Parity`

Current verification baseline:

- P2A Form cluster: 257 passed, 122 skipped.
- Full E2E: 2865 passed, 2079 skipped.
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

## Detailed Current Status

### P2A: Form Core - Done

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
  `dataAfterSubmit` is active for `keep`, `reset`, and `clear`, and value
  preservation across unmount/remount is active for conditional fields and
  multi-step `FormSegment` flows. Form persistence and sticky button row
  coverage is active: localStorage autosave/restore/submit/cancel cleanup,
  `doNotPersistFields`, non-persisted storage keys, scroll-container sticky
  rows, and ModalDialog sticky row positioning.

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
- Form metadata, renderer, and submit handling support `dataAfterSubmit` with
  copied-old `keep`, `reset`, and `clear` behavior after successful submit.
- Form remembers registered field metadata for cleaned `getData()` and submit
  payload construction across conditional unmount/remount while validation
  still considers only currently mounted fields.
- Direct `TextBox bindTo` controls register with the enclosing Form so cleaned
  submit data includes those fields even without a `FormItem` wrapper.
- Test `InputComponentDriver.field` resolves native input, textarea, select,
  and contenteditable controls whether the component root is the field itself
  or a wrapper.
- Form supports copied-old `persist`, `storageKey`, `doNotPersistFields`, and
  `keepOnCancel` behavior using localStorage temporary saves.
- Form supports `stickyButtonRow` with original-style `stickyForm` and
  `stickyButtonRow` stylesheet classes plus button-row background/padding theme
  variables.
- Built-in Form buttons expose `submitButton` and `cancelButton` part hooks, so
  copied-old drivers can find custom-labeled save/cancel buttons.
- Select metadata, compiler contract, renderer, and native control accept
  direct `bindTo` and bridge values into the current Form context, matching
  copied-old direct Select usage in Form/ModalDialog tests.
- Built-in Form buttons also expose copied-old `data-part-id` hooks, and the
  cancel button is omitted when `cancelLabel=""`.
- Form event coverage is active for `onSuccess`, `onWillSubmit` object
  transformations, `noSubmit` filtering, and nested ModalDialog form submit
  behavior.
- Form submit handling stops propagation so nested form submits do not trigger
  enclosing forms.
- ModalDialog renders through a React portal, hides background siblings from
  accessibility queries while open, and provides ModalDialog/Form integration
  so a single Form cancel inside the dialog requests modal close.
- XMLUI script method-call compatibility includes `console.log(...)`, matching
  copied-old handlers and examples that use console logging in event handlers.
- Checkbox and Slider direct `bindTo` controls read/write through the current
  Form context and register with the Form, including component API `setValue`.
- `FormItem type="slider"` renders the real Slider control, so
  `hideButtonRowUntilDirty` dirty tracking works for Slider keyboard changes.
- Direct Checkbox and Slider labels honor `requireLabelMode`, inherit
  `Form itemRequireLabelMode`, and avoid duplicated labels when rendered inside
  a Form.

Latest verified P2A state:

- `npm --workspace xmlui exec -- playwright test src/components/Checkbox/Checkbox.spec.ts src/components/Slider/Slider.spec.ts -g "requireLabelMode|does not duplicate label"`
  - 18 passed
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.foundation.spec.ts src/components/FormItem/FormItem.foundation.spec.ts src/components/FormSegment/FormSegment.foundation.spec.ts src/components/Form/Form.spec.ts src/components/FormItem/FormItem.spec.ts src/components/FormSegment/FormSegment.spec.ts`
  - 257 passed
  - 122 skipped
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
  - passed
- `npm --workspace xmlui test`
  - 267 passed
- `npm --workspace xmlui run build:metadata`
  - passed
- `npm --workspace xmlui run compatibility:css-module-import-audit`
  - passed
- `npm --workspace xmlui run test:e2e`
  - 2865 passed
  - 2079 skipped

## Next Step

### NEXT: P2A FormItem Closure - Input Variants, Parts, and Remaining Type Parity

Fresh-session handoff prompt:

> Continue `.plans/rebuild-plan.md` from **NEXT: P2A FormItem Closure -
> Input Variants, Parts, and Remaining Type Parity**.

Current handoff state:

- This is the next executable step. A new session receiving "Go on with the
  next step" should start here.
- Do not restart earlier Form work. `Form.spec.ts` has no remaining
  skipped/fixme tests; the latest verified P2A state above is the baseline.
- There are unrelated dirty worktree files, including standalone sample
  `xmlui-latest.js` outputs and prior component/runtime edits. Do not revert
  files unless the user explicitly asks.
- Playwright/E2E may need unsandboxed execution because local dev-server
  binding can fail in the sandbox.

Completed immediately before this marker:

- Activated the final two Form dirty-visibility tests:
  Checkbox and Slider changes now reveal `hideButtonRowUntilDirty` button rows.
- Activated direct `bindTo syncs $data and value` tests for Checkbox and
  Slider.
- Added direct Checkbox/Slider Form-context binding and registration, and
  routed `FormItem type="slider"` through the real Slider control.
- Activated direct Checkbox/Slider `requireLabelMode` tests, including
  explicit input override, Form-level `itemRequireLabelMode` inheritance,
  required and optional label indicators, and no duplicate labels inside Forms.

Step goal:

Move into the broader FormItem/input closure group now that local Form core
coverage is closed.

Known remaining skipped/fixme candidates in this closure group:

- `Checkbox.spec.ts`: custom `inputTemplate` block and four variant/parts
  fixmes (`handles variant`, variant theme variables, variant parts, combined
  behaviors with parts).
- `Slider.spec.ts`: one remaining fixme near auto-focus behavior.
- `FormItem.spec.ts`: skipped Type, Validation, Template, Event,
  Validation Behavior, Accessibility, Theme Variable, Edge Case, Phone Pattern,
  and Regex blocks.

1. Inspect remaining skipped/fixme tests in `FormItem.spec.ts`,
   `Checkbox.spec.ts`, and `Slider.spec.ts`, especially variant/parts and
   type-parity cases that depend on Form/FormItem integration.
2. Compare with the original source/tests for FormItem and the affected input
   components before activating each subgroup.
3. Choose a narrow coherent subgroup, preferably Checkbox/Slider variant and
   part parity now that direct input label-mode inheritance is active.

Task checklist:

1. Inspect remaining copied-old skipped/fixme tests in
   `xmlui/src/components/FormItem/FormItem.spec.ts`,
   `xmlui/src/components/Checkbox/Checkbox.spec.ts`, and
   `xmlui/src/components/Slider/Slider.spec.ts`.
2. Compare with original tests/source under
   `/Users/dotneteer/source/xmlui/xmlui/src/components/FormItem`,
   `/Users/dotneteer/source/xmlui/xmlui/src/components/Checkbox`, and
   `/Users/dotneteer/source/xmlui/xmlui/src/components/Slider`.
3. Pick one prerequisite subgroup and activate only the tests covered by it.
4. Preserve unrelated FormSegment deferred tests until their prerequisites are
   implemented.
5. Make the smallest compatibility change required.
6. Run focused Playwright for the activated test.
7. Run the P2A Form cluster.
8. Run TypeScript, unit tests, metadata build, CSS module import audit, and
   `npm --workspace xmlui run test:e2e`.
9. Update this plan with the result and move this NEXT marker forward.

Likely files:

- `xmlui/src/components/Form/Form.spec.ts`
- `xmlui/src/components/Form/FormContext.tsx`
- `xmlui/src/components/FormItem/FormItem.spec.ts`
- `xmlui/src/components/FormItem/FormItemReact.tsx`
- `xmlui/src/components/Checkbox/CheckboxReact.tsx`
- `xmlui/src/components/Checkbox/Checkbox.renderer.tsx`
- `xmlui/src/components/Checkbox/Checkbox.spec.ts`
- `xmlui/src/components/Slider/SliderReact.tsx`
- `xmlui/src/components/Slider/Slider.renderer.tsx`
- `xmlui/src/components/Slider/Slider.spec.ts`
- `xmlui/src/testing/ComponentDrivers.ts`
- `xmlui/src/testing/fixtures.ts`

Original-reference paths:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/FormItem`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Checkbox`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Slider`

Verification commands:

- Focused Playwright for each activated test, for example:
  `npm --workspace xmlui exec -- playwright test src/components/Checkbox/Checkbox.spec.ts src/components/Slider/Slider.spec.ts -g "variant|parts"`
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

## Roadmap By Status

### 1. [done] P2A: Form Core

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
- `dataAfterSubmit` and value preservation across conditional unmount/remount.
- Form persistence and sticky button row.
- Form events/onWillSubmit/nested ModalDialog submit behavior and
  `Behaviors and Parts`.
- Final Form dirty-visibility tail for Checkbox and Slider changes.
- Direct Checkbox and Slider `bindTo` API/data synchronization.
- Direct Checkbox and Slider `requireLabelMode` inheritance/override label
  parity.

Next P2A closure group:

1. `[current]` FormItem/input validation, type, accessibility, and
   variant/parts cases.

### 2. [current] P2A: FormItem/Input Closure

Components:

- `FormItem`
- direct-bound input controls used inside forms, starting with `Checkbox` and
  `Slider`

Goal:

- Close remaining FormItem/input validation, type, accessibility, and
  variant/parts cases.
- Keep this step focused on copied-old tests whose prerequisites are already
  satisfied by Form core and direct input binding.

Verification:

- Focused copied-old tests for each activated FormItem/input subgroup.
- P2A Form cluster, TypeScript, unit tests, metadata, CSS audit, and full E2E
  after each completed subgroup.

### 3. [remaining] P2A: FormSegment Closure

Component:

- `FormSegment`

Goal:

- Close scoped context, field discovery, layout props, APIs, and dirty-state
  parity after the FormItem/input closure work.

### 4. [remaining] P2B: Structured Form Controls

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

### 5. [remaining] P3A: Text-Like Input Parity

Components:

- `TextBox`
- `PasswordInput`
- `TextArea`
- `NumberBox`

Goal:

- Close value editing, caret behavior, form binding, validation, variants,
  parts, behaviors, and labels.

### 6. [remaining] P3B: Boolean, Rating, Slider, Date/Time, and Color Inputs

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

### 7. [remaining] P4A: Overlay and Focus Infrastructure

Components and services:

- `ModalDialog`
- `Drawer`
- `Tooltip`
- popover/portal/focus primitives used by menus and pickers

Goal:

- Close portal behavior, focus trapping/restoration, escape/outside-click,
  stacking, keyboard behavior, and overlay accessibility.

### 8. [remaining] P3C: File and Selection Inputs

Components:

- `FileInput`
- `Select`
- `AutoComplete`

Goal:

- Close file handling, dropdown behavior, selection state, form binding,
  validation, keyboard navigation, and overlay integration.

### 9. [remaining] P4B: Menu Family Closure

Components:

- `DropdownMenu`
- `ContextMenu`
- `MenuItem`
- internal/missing `Menu` helper

Goal:

- Close trigger behavior, keyboard navigation, focus handling, nested menus,
  context positioning, and styling parity.

### 10. [remaining] P4C: Navigation Shell Components

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

### 11. [remaining] H3A: Runtime Markup Inclusion

Component:

- `IncludeMarkup`

Goal:

- Close runtime markup loading, compilation boundary behavior, error handling,
  state updates, and examples.

### 12. [remaining] H3B: Markdown and CodeText

Components:

- `Markdown`
- `CodeText`

Goal:

- Close markdown rendering, XMLUI code fences, syntax highlighting, runtime
  examples, and old Markdown/FocusScope prerequisite tests.

### 13. [remaining] H4A: Inspector and Inspect Button

Components:

- `Inspector`
- `InspectButton`

Goal:

- Close runtime inspection UI, debug metadata, modal integration, and relevant
  examples.

### 14. [remaining] H4B: Internationalization Surface

Component:

- `I18n`

Goal:

- Close translation lookup, formatting, fallback behavior, and update paths.

### 15. [remaining] H4C: Data Policy Helper

Component:

- `RetryPolicy`

Goal:

- Close retry policy integration for data/request components.

### 16. [remaining] P5A: Data Operations Closure

Components and services:

- `DataSource`
- `APICall`
- `Actions.callApi`
- request lifecycle and invalidation helpers

Goal:

- Close old data operation suites, cancellation, mock data, polling, retry, and
  request status behavior.

### 17. [remaining] P5B: App State and Change Listening

Components and services:

- `AppState`
- listeners/change handlers
- state persistence where applicable

Goal:

- Close app-level state synchronization, event ordering, and update behavior.

### 18. [remaining] P5C: Scheduling, Messaging, and Streaming

Components and services:

- `Timer`
- `Queue`
- event source/websocket-style runtime helpers
- toast/pub-sub behavior where tied to scheduling

Goal:

- Close delayed work, repeated work, queue processing, messaging, streaming,
  cancellation, and update paths.

### 19. [remaining] P5D: Accessibility and Runtime Services

Components and services:

- `LiveRegion`
- `NoResult`
- toast/service helpers
- skip/bookmark helpers where not already closed

Goal:

- Close runtime service accessibility, announcements, and user-visible update
  paths.

### 20. [remaining] P6A: App, Routing, and Page Closure

Components:

- `App`
- `Pages`
- `Page`
- `Redirect`
- route-aware links/nav behavior

Goal:

- Close routing, guards, redirects, active route state, page metadata, and app
  shell integration.

### 21. [remaining] P6B: Nested App Closure

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

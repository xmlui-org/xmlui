# Missing Component Migration Plan

Date: 2026-06-24

This plan covers two related Phase 5 closure tracks:

- original XMLUI component folders that still do not have a matching folder in
  the rewrite workspace after Phase 5 Waves G1-G4;
- already-created component folders that are still foundation/partial
  migrations with copied old E2E suites skipped or explicit `test.fixme`
  compatibility debt.

Original baseline:

- `/Users/dotneteer/source/xmlui/xmlui/src/components`

Rewrite baseline:

- `/Users/dotneteer/source/xmlui-rs/xmlui/src/components`

## Scope A: Missing Folders

Migrate these 16 missing original component folders:

- `Animation`
- `Avatar`
- `Badge`
- `FocusScope`
- `I18n`
- `IncludeMarkup`
- `Input`
- `InspectButton`
- `Inspector`
- `Markdown`
- `Menu`
- `Part`
- `ProgressBar`
- `RetryPolicy`
- `Spinner`
- `Stepper`

## Scope B: Partial Components

Several components already have source-adjacent folders but are not complete.
They have one or more of these signals:

- active `*.foundation.spec.ts` tests that only cover a small first slice;
- copied old `Component.spec.ts` suites with global `test.skip`;
- copied old suites with many explicit `test.fixme` cases;
- `.ai/*findings*.md` notes that say the component is foundation-only,
  deferred, or not full old parity.

The practical closure work is to turn those foundation slices into old-suite
parity by migrating the shared infrastructure they depend on and then
unskipping old test groups feature-by-feature.

## Compatibility Rules

- Preserve the original component folder shape: metadata in `Component.tsx`,
  React implementation in `ComponentReact.tsx` where the old component uses
  that pattern, `Component.module.scss`, `Component.md`, copied E2E specs, and
  component-local helper files.
- Copy old E2E test cases literally where old component specs exist. Test
  infrastructure may change, but the test cases should remain recognizable.
- If an old test cannot run yet because a prerequisite is missing, mark it with
  an explicit `test.fixme` or skip plus a local reason. Do not leave knowingly
  failing tests.
- Use direct SCSS module imports in React implementation files. Do not use
  literal class-name maps or visual inline style objects.
- Every slice must add or point to a runnable example for `npm run dev`, unless
  the component is nonvisual and only meaningful through another component.
- After every slice, run focused E2E for the migrated component and ask the user
  to run the full E2E suite when the slice touches broad styling, focus,
  routing, or runtime services.

## Old Artifact Inventory

| Component | Old direct E2E spec? | Old file count | Notes |
| --- | ---: | ---: | --- |
| `Animation` | no | 2 | Behavior helper; likely migrated with behavior/runtime animation support. |
| `Avatar` | yes | 6 | Stable visual component. |
| `Badge` | yes | 6 | Stable visual component with value/theme mapping. |
| `FocusScope` | yes | 5 | Focus-management infrastructure; needs robust browser tests. |
| `I18n` | no | 2 | Experimental nonvisual text/translation helper. |
| `IncludeMarkup` | yes | 4 | Runtime markup loading/compilation; depends on async source loading and compiler boundary behavior. |
| `Input` | no | 9 | Shared input internals: label, adornment, divider, partial input. Migrate as infrastructure for input parity, not as user-facing component. |
| `InspectButton` | no | 2 | Inspector companion component; migrate with `Inspector`. |
| `Inspector` | no | 4 | Experimental runtime inspection UI; depends on modal/dialog and debug metadata. |
| `Markdown` | yes, plus `CodeText` spec | 12 | Large stable component; includes nonstandard XMLUI markdown/code-fence behavior. |
| `Menu` | no | 1 | Styling/helper artifact for menu family; reconcile with existing DropdownMenu/MenuItem implementation. |
| `Part` | no | 1 | Internal part/theming helper; migrate only when a concrete compatibility test needs it. |
| `ProgressBar` | yes | 6 | Stable visual component. |
| `RetryPolicy` | no | 4 | Experimental policy component; likely used by data/request components. |
| `Spinner` | yes | 6 | Stable visual component. |
| `Stepper` | yes | 8 | Experimental multi-step UI; stateful API/events. |

## Migration Slices

## Practical Completion Order

Use this order unless a focused bug or user-visible blocker requires a detour:

1. **Tooling unblock:** fix the VS Code esbuild SCSS-module loader issue before
   claiming broad compatibility sweep health. The component code now correctly
   imports SCSS modules, but `tools/vscode` cannot bundle those imports yet.
2. **Missing visual components:** complete H1A (`Spinner`, `ProgressBar`,
   `Avatar`, `Badge`) because these are isolated, visible, and have old direct
   specs.
3. **Shared input internals:** complete H2B (`Input`) before trying to close
   TextBox/TextArea/NumberBox/Checkbox/Switch/DateInput/TimeInput/Select
   form-label and adornment tests.
4. **Form core closure:** complete P2A-P2C below for `Form`, `FormItem`, and
   `FormSegment`; this unlocks many skipped/fixme input tests.
5. **Input-family parity:** close P3A-P3C for text, boolean, numeric/date/time,
   file, and selection controls.
6. **Overlay/focus/menu closure:** complete H2A (`FocusScope`) and P4A-P4C for
   modal, drawer, tooltip, context/dropdown menu, and select/autocomplete
   overlay parity.
7. **Data/runtime helpers:** complete H4C (`RetryPolicy`) and P5A-P5D for
   `DataSource`, `APICall`, listeners, timers, queue, event source, websocket,
   toast, bookmark, and skip/live-region behavior.
8. **Routing/app shell closure:** complete P6A-P6C for `App`, `Pages`, `Page`,
   `Redirect`, navigation, `NestedApp`, and app shell region behavior.
9. **Data-display/layout closure:** complete P7A-P7D for list/table/tree,
   table-of-contents, stack/flow/tile/card, scroll/sticky/splitter/responsive
   layout.
10. **Markdown and advanced helpers:** complete H3A-H5B, especially
    `IncludeMarkup`, `Markdown`, `Inspector`, `I18n`, `Animation`, `Part`, and
    `Menu` reconciliation.
11. **Final old-suite pass:** run full component E2E and remove stale
    foundation-only tests or rename them as smoke tests after old suites pass.

The ordering is intentionally dependency-first. It is better to unlock 200
skipped input/form tests by migrating `Input` and `FormItem` properly than to
polish one leaf component while shared test debt remains blocked.

### H1A: Low-Risk Visual Components

Components:

- `Spinner` - completed on 2026-06-24.
- `ProgressBar` - completed on 2026-06-24.
- `Avatar` - completed on 2026-06-24.
- `Badge` - completed on 2026-06-24.

Goal:

- Establish the missing visual component folders with source-adjacent metadata,
  SCSS module styling, docs, renderer registration, compiler contracts, and
  copied old E2E specs.

Implementation notes:

- Start one component at a time in this order: `Spinner`, `ProgressBar`,
  `Avatar`, `Badge`.
- `Spinner` migration copied the old docs/defaults/spec, implemented the
  source-adjacent runtime files, registered the component in compiler/runtime
  metadata, added the combined runnable example, and passed its focused copied
  old E2E suite.
- `ProgressBar` migration copied the old docs/defaults/spec, added the
  compatible E2E driver fixture, implemented the source-adjacent runtime files,
  registered compiler/runtime metadata, extended the combined runnable example
  with a state-mutating progress path, and passed its focused copied old E2E
  suite.
- `Avatar` migration copied the old docs/defaults/spec, added the compatible
  E2E driver fixture, implemented source-adjacent runtime files, registered
  compiler/runtime metadata, extended the combined runnable example with a
  state-mutating avatar path, and passed all 97 copied old E2E tests. The old
  shorthand border theme variables stay in the SCSS module; decomposed
  color/style/width border theme variables are applied as a selective dynamic
  compatibility bridge from the renderer so the two old theme-variable families
  do not override each other accidentally.
- `Badge` migration copied the old docs/defaults/spec, added the compatible
  E2E driver fixture, implemented source-adjacent runtime files, registered
  compiler/runtime metadata, extended the combined runnable example with a
  state-mutating status path, and passed all 24 copied old E2E tests. Metadata
  is intentionally decoupled from `BadgeReact.tsx` so metadata generation does
  not import the SCSS module through the React implementation.
- These components should be good candidates for direct migration because they
  are stable visual components with old direct specs.
- Add a single combined runnable example:
  `?example=missingVisualComponentsFoundation`.
- Preserve theme variable metadata by extracting it from the SCSS module where
  practical. If tone-specific defaults from the old project cannot yet fit the
  rewrite metadata shape, record that debt in `.ai/`.

Verification:

- Focused component E2E for each migrated component.
- Unit/typecheck:
  `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- CSS import audit:
  `npm --workspace xmlui run compatibility:css-module-import-audit`
- Manual visual check with `npm run dev` and
  `?example=missingVisualComponentsFoundation`.

H1A is complete.

### H1B: Stepper Foundation

Components:

- `Stepper` - completed on 2026-06-24.
- `Step` - completed on 2026-06-24.

Goal:

- Migrate the old `Stepper` folder and its `Step` subcomponent with active-step
  state, step navigation, events, and public API methods.

Implementation notes:

- Copy `Stepper.spec.ts` from the old project before implementation.
- Inspect existing `Tabs`, `TabsForm`, and form-state migration before choosing
  the runtime state approach.
- Add a runnable example `?example=stepperFoundation` with user-visible state
  mutation.
- Copied the old `Stepper.spec.ts`, defaults, and docs; added source-adjacent
  metadata, renderer, React implementation, SCSS module styling, compiler
  contract, runtime registry entries, and the `?example=stepperFoundation`
  route.
- The `didChange` old suite required multi-parameter arrow callback support
  such as `(idx, id) => ...`; the script parser now preserves multiple
  arrow-parameter identifiers and the existing IR/codegen path handles them.
- Stepper API methods (`next`, `prev`, `reset`, `setActiveStep`, `activeStep`)
  use a stable registered API object and emit `didChange` outside React state
  updater callbacks to avoid render-time runtime invalidation warnings.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run build:metadata`
- `npm --workspace xmlui exec -- playwright test src/components/Stepper/Stepper.spec.ts`
  passed all 62 copied old E2E tests.
- CSS import audit remains covered by the broader Phase 5 audit pass.

H1B is complete.

### H2A: Focus Management

Components:

- `FocusScope` - focus core completed on 2026-06-24; one copied old
  Markdown/xmlui-pg prerequisite test remains explicitly skipped until
  `Markdown` is migrated.

Goal:

- Migrate focus trapping, restore-focus, and auto-focus behavior.

Implementation notes:

- Copy old `FocusScope.spec.ts` literally first.
- Check current modal/dialog/focus behavior before implementation, because
  this component may expose framework-wide focus assumptions.
- Keep implementation browser-driven; unit tests are not enough for focus trap
  behavior.
- Copied old docs/defaults/spec and migrated the old focus-scope stack/hook
  into `xmlui/src/component-core/accessibility`.
- Added source-adjacent metadata, renderer, React implementation, SCSS module,
  compiler/runtime registration, and `?example=focusScopeFoundation`.
- Preserved the old real wrapper `div` with `tabIndex=-1`; do not replace it
  with `display: contents`, because focus trapping depends on normal DOM focus
  and event semantics.
- The old nested `Markdown`/`xmlui-pg` FocusScope test is marked `test.fixme`
  with an explicit reason until the Markdown component migration reaches that
  feature.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run build:metadata`
- `npm --workspace xmlui test`
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui exec -- playwright test src/components/FocusScope/FocusScope.spec.ts`
  passed 4 copied old tests with 1 explicit Markdown prerequisite skip.
- `npm --workspace xmlui exec -- playwright test src/components/ModalDialog/ModalDialog.foundation.spec.ts src/components/Drawer/Drawer.foundation.spec.ts src/components/DropdownMenu/DropdownMenu.foundation.spec.ts`
  passed all 12 representative overlay foundation tests.

H2B completion note, 2026-06-24:

- Added the internal `Input` folder with migrated `InputLabel`,
  `InputAdornment`, `InputDivider`, and `PartialInput` primitives plus SCSS
  modules and focused unit smoke coverage.
- Kept `Input` internal. It has no public component contract, renderer,
  metadata, or component-folder barrel because the old folder is shared
  infrastructure rather than a user-facing XMLUI component.
- Added the missing `search` icon used by old input-adornment examples/tests.
- Attempted broad `TextBox`/`NumberBox` adoption and rolled it back after
  focused E2E showed component-specific adornment visibility, positioning, and
  theme-variable semantics were not preserved. Future adoption must happen
  component-by-component inside the relevant input-family parity slices.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run build:metadata`
- `npm --workspace xmlui test`
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui exec -- playwright test src/components/TextBox/TextBox.spec.ts src/components/NumberBox/NumberBox.spec.ts`
  passed 328 tests with 42 explicit skips.

P2A is now in progress; see the P2A progress note below for the current next
explicit step. Use the completed H2B primitives as available infrastructure,
but do not retrofit them into existing input components without focused old E2E
coverage for that component.

### H2B: Shared Input Internals

Components:

- `Input`

Goal:

- Migrate shared input building blocks used by input-like components:
  `InputLabel`, `InputAdornment`, `InputDivider`, and `PartialInput`.

Implementation notes:

- This folder is infrastructure, not a normal user-facing component.
- Do not expose new public components unless the old metadata or docs prove
  they were public.
- Use this slice to reduce duplication and improve compatibility in `TextBox`,
  `PasswordInput`, `NumberBox`, `TextArea`, `DateInput`, `TimeInput`,
  `ColorPicker`, `FileInput`, `Select`, and `AutoComplete`.

Verification:

- Existing focused E2E for at least `TextBox`, `NumberBox`, `DateInput`,
  `TimeInput`, and `Select` after adopting the shared internals.
- CSS import audit.

### H3A: Runtime Markup Inclusion

Components:

- `IncludeMarkup`

Goal:

- Migrate runtime markup inclusion and compilation semantics.

Implementation notes:

- Copy old `IncludeMarkup.spec.ts` literally first.
- Inspect how the old component fetches source, reports `loaded` and `error`,
  handles component definitions, and composes included markup into the current
  runtime tree.
- Reuse the compiler/runtime module path used by `NestedApp`, but do not create
  an isolated app state boundary unless old behavior requires it.
- Add a runnable example `?example=includeMarkupFoundation` with a mocked or
  local included source and a visible state update.

Verification:

- Focused `IncludeMarkup` E2E.
- Vite dev, production build, standalone build, and SSG sanity checks if the
  component fetches or compiles source at runtime.

### H3B: Markdown and CodeText

Components:

- `Markdown`
- `CodeText`

Goal:

- Migrate XMLUI markdown rendering, including the old nonstandard behavior and
  `xmlui-pg` code fence support.

Implementation notes:

- This is intentionally after `NestedApp` and `IncludeMarkup`, because old
  markdown playground/code-fence behavior renders nested XMLUI apps.
- Copy old `Markdown.spec.ts` and `CodeText.spec.ts` literally first.
- Inspect old `MarkdownReact.tsx`, `utils.ts`, `parse-binding-expr.ts`, and
  docs before implementation.
- Decide explicitly which markdown engine and syntax plugins are compatibility
  requirements. Do not replace the old behavior with generic Markdown-only
  rendering.
- Add a runnable example `?example=markdownFoundation` with plain Markdown,
  inline bindings, code text, and one XMLUI playground/code-fence case.

Verification:

- Focused `Markdown` and `CodeText` E2E.
- Focused `NestedApp` E2E because markdown can embed nested apps.
- Typecheck, unit tests, CSS import audit.

### H4A: Inspector and Inspect Button

Components:

- `Inspector`
- `InspectButton`

Goal:

- Migrate the experimental inspector UI and programmatic open/close API.

Implementation notes:

- Inspect old `InspectorReact.tsx`, `InspectButton.tsx`, runtime metadata, and
  debug bridge behavior.
- This slice may need a small runtime inspection service rather than component
  local state only.
- Reuse migrated `ModalDialog` and `Button` rather than duplicating overlay
  behavior.
- Add a runnable example `?example=inspectorFoundation`.

Verification:

- New focused E2E if the old project has no direct inspector spec.
- Existing debug/metadata tests.
- Manual browser check because inspection UI is visual and interactive.

### H4B: Internationalization Surface

Components:

- `I18n`

Goal:

- Migrate the experimental `I18n` component surface.

Implementation notes:

- Inspect old docs and runtime locale/config behavior before implementation.
- If the required locale/config infrastructure is not present, create metadata
  and a fixture-backed foundation only, then record explicit debt.
- Add a runnable example `?example=i18nFoundation` with visible text changing
  through state or locale data.

Verification:

- New focused E2E because the old folder has no direct spec.
- Any config/loading tests needed by the implementation.

### H4C: Data Policy Helper

Components:

- `RetryPolicy`

Goal:

- Migrate retry-policy metadata and behavior where used by data/request
  components.

Implementation notes:

- Inspect old `RetryPolicyReact.tsx` and current `DataSource`/`APICall`
  managed fetching implementation.
- Do not implement it as a visual component unless the old behavior requires
  visible output.
- Add focused E2E through `DataSource` or `APICall`, not an isolated fake, if
  that is how the old component is consumed.

Verification:

- Data operation E2E with deterministic mocked failures and retry timing.
- Runtime data unit tests for retry scheduling.

### H5A: Behavior and Internal Part Helpers

Components:

- `Animation`
- `Part`

Goal:

- Migrate internal/helper semantics only when they are needed by a concrete
  component parity test.

Implementation notes:

- `Animation` should be aligned with the existing behavior system instead of
  becoming an unrelated visual component.
- `Part` should be aligned with the current theme part and component part
  metadata model.
- These should not be claimed complete without at least one parent component
  proving the integration.

Verification:

- Parent-component E2E that exercises animation or part targeting.
- CSS/theme artifact report updates where applicable.

### H5B: Menu Styling Reconciliation

Components:

- `Menu`

Goal:

- Reconcile the old `Menu` stylesheet helper with the already migrated menu
  family (`DropdownMenu`, `MenuItem`, `MenuSeparator`, `SubMenuItem`,
  `ContextMenu`).

Implementation notes:

- The old folder only has `Menu.module.scss`, so determine whether this is a
  shared style artifact rather than a component.
- Do not add a public `Menu` component unless the old metadata or docs prove
  one exists.
- If it is style-only, move the relevant classes/variables into the migrated
  menu components and document that `Menu` is represented by those folders.

Verification:

- Focused menu-family E2E.
- CSS import audit and style artifact report.

## Partial Component Closure Slices

The slices below close components that already exist in the rewrite workspace
but are still partial/foundation migrations. Each slice should start by reading
the current component folder, copied old specs, and the matching `.ai` findings
note.

### P0A: Sweep and Inventory Hygiene

Components:

- all existing component folders

Goal:

- Replace stale status in `.ai/compatibility-inventory.md` with generated or
  manually verified current status.
- Produce a short list of copied old specs that are globally skipped and a list
  of explicit `test.fixme` cases grouped by component and prerequisite.

Implementation notes:

- Do not change runtime behavior in this slice.
- Add a script/report if it is cheaper than manually maintaining the status.
- Distinguish:
  - missing folder;
  - folder exists, no copied old suite;
  - copied suite globally skipped;
  - copied suite partially active with fixmes;
  - old suite fully active and passing.

Verification:

- `npm --workspace xmlui run compatibility:component-transfer`
- Generated report committed/recorded in `.ai` or `.compatibility-report`.

### P0B: VS Code SCSS Bundling Fix

Components:

- all migrated components with `*.module.scss` imports
- `tools/vscode`

Goal:

- Fix the current `compatibility:sweep` VS Code build failure:
  `No loader is configured for ".scss" files`.

Status:

- Completed on 2026-06-24.
- `tools/vscode/esbuild.js` now handles plain `*.module.scss` imports by
  exporting a stable class-name map for the extension bundle.
- Findings recorded in
  `.ai/vscode-scss-module-bundling-findings-2026-06-24.md`.

Implementation notes:

- Preserve the direct SCSS module import pattern in components. Do not revert
  components to literal style maps.
- Add an esbuild plugin/loader in `tools/vscode/esbuild.js` that stubs or
  transforms component SCSS modules for extension bundling.
- Keep the extension language-support bundle behavior compatible with the old
  VS Code extension.

Verification:

- `npm --workspace xmlui-vscode run build`
- `npm --workspace xmlui-vscode run test`
- `npm --workspace xmlui run compatibility:css-module-import-audit`

### P1A: Primitive and Text Closure

Components:

- `Text`
- `Heading`, `H1`-`H6`
- `Br`
- `Fragment`
- `HtmlTags`
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
- plus missing visual components from H1A where relevant

Goal:

- Close the old suites for primitives and presentational components that do not
  require form, overlay, data, or routing services.

Implementation notes:

- Many primitive tests are sensitive to inline/block layout, overflow,
  `maxLines`, `hasOverflow`, resource URL resolution, and theme parts.
- Re-enable copied old tests by feature group, not entire files blindly.
- Keep foundation tests only as smoke coverage after the old suites are active.

Verification:

- Focused E2E for each component group.
- Visual example: `?example=primitiveTextHeading`,
  `?example=htmlTagsFragment`, `?example=imageIFrameMedia`,
  `?example=iconLogoMedia`, and any new missing visual example.

### P2A: Form Core

Components:

- `Form`
- `FormItem`
- `FormSegment`
- shared `Input` internals from H2B

Goal:

- Close submit/reset, validation, child control binding, label layout,
  persistence, and `$data` semantics enough to unfix form-dependent tests in
  inputs and structured forms.

Implementation notes:

- Copy/activate old `Form.spec.ts`, `FormItem.spec.ts`,
  `FormItemLabelClick.spec.ts`, and `FormSegment.spec.ts` feature-by-feature.
- The old input suites contain many `bindTo`, `requireLabelMode`, duplicate
  label, concise/verbose validation, and form-submit fixmes. Treat those as
  acceptance criteria for this slice.
- Avoid implementing one-off form behavior in individual input components.

Verification:

- Focused form E2E plus a representative input matrix:
  `TextBox`, `TextArea`, `NumberBox`, `Checkbox`, `Switch`, `DateInput`,
  `TimeInput`, `ColorPicker`, `FileInput`, `Select`.

P2A progress note, 2026-06-24:

- Activated the copied-old `FormItem.spec.ts` **Basic Functionality** group.
- Activated the copied-old `FormSegment.spec.ts` **Basic Rendering** group.
- Activated the copied-old `Form.spec.ts` initial **Basic Functionality**
  render/button-label/order tests and the **hideButtonRow property** group.
- Activated the copied-old `Form.spec.ts` core
  **hideButtonRowUntilDirty property** tests. The custom `buttonRowTemplate`
  and typed-control cases in that group remain explicitly skipped until those
  slices are active.
- Activated the copied-old `Form.spec.ts` **enableSubmit property** group.
- Activated the copied-old `Form.spec.ts` **data property** group.
- Kept later copied-old FormItem/FormSegment groups explicitly skipped by
  feature area rather than hiding them behind whole-file skips.
- Fixed the compatibility gaps exposed by those groups:
  - `FormItem` metadata and renderer now pass `requireLabelMode`.
  - `FormItemReact` renders old-compatible required and optional label markers.
  - unlabeled FormItems use the old `width: fit-content` behavior.
  - test drivers accept both wrapper and direct-input targets for input
    controls, and `FormItemDriver.textBox` is available for old layout tests.

Verification:

- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.foundation.spec.ts src/components/FormItem/FormItem.foundation.spec.ts src/components/FormSegment/FormSegment.foundation.spec.ts src/components/FormItem/FormItem.spec.ts src/components/FormSegment/FormSegment.spec.ts`
  passed 30 active tests with 122 explicit copied-suite skips.
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.foundation.spec.ts src/components/FormItem/FormItem.foundation.spec.ts src/components/FormSegment/FormSegment.foundation.spec.ts src/components/Form/Form.spec.ts src/components/FormItem/FormItem.spec.ts src/components/FormSegment/FormSegment.spec.ts`
  passed 45 active tests with 334 explicit copied-suite skips after enabling
  the Form render/button and `hideButtonRow` groups.
- The same combined P2A focused command passed 54 active tests after adding
  `hideButtonRowUntilDirty` support.
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "enableSubmit property"`
  passed 11 copied-old `enableSubmit` tests.
- The same combined P2A focused command passed 65 active tests with 314
  explicit copied-suite skips after activating `enableSubmit`.
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "data property"`
  passed 4 copied-old `data` tests; the grep also reported 4 skipped API tests
  whose names contain "data property".
- The same combined P2A focused command passed 69 active tests with 310
  explicit copied-suite skips after activating `data property`.
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui test`
- `npm --workspace xmlui run build:metadata`
- `npm --workspace xmlui run compatibility:css-module-import-audit`

Next explicit step: continue P2A by activating the copied-old `Form.spec.ts`
inherited item label setting groups: `itemLabelPosition`,
`itemLabelWidth`, `itemLabelBreak`, and `itemRequireLabelMode`. Keep the rest
of `Form.spec.ts` explicitly skipped until each feature group is made green.

### P2B: Structured Form Controls

Components:

- `StepperForm`
- `TabsForm`
- `FormSegment`
- missing `Stepper` from H1B

Goal:

- Close structured form navigation, invalid-segment routing, submit/reset
  semantics, and old stacked/accordion visual modes.

Implementation notes:

- Do this after P2A and H1B so the real old `Stepper` can be reused instead of
  keeping a local foundation substitute.

Verification:

- Focused `StepperForm`, `TabsForm`, `FormSegment`, and `Stepper` E2E.

### P3A: Text-Like Input Parity

Components:

- `TextBox`
- `PasswordInput`
- `TextArea`
- `NumberBox`

Goal:

- Close old suites for value editing, caret behavior, form binding, validation,
  variants, parts, behaviors, and labels.

Implementation notes:

- Requires P2A and H2B.
- Do not keep duplicated label/form logic in each component after shared input
  internals exist.

Verification:

- Full old suites for these components with no global skips and only old
  upstream-accepted fixmes where the old project also had them.

### P3B: Boolean, Rating, Slider, Date/Time, and Color Inputs

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

- Close form binding, validation, theme-variable state matrix, keyboard/mobile
  behavior, and picker parity.

Implementation notes:

- Requires P2A and H2B.
- `DatePicker` mobile drawer and view switching should be coordinated with
  overlay/focus closure.

Verification:

- Full old suites and focused examples for each input group.

### P3C: File and Selection Inputs

Components:

- `FileInput`
- `FileUploadDropZone`
- `Select`
- `Option`
- `AutoComplete`
- `RadioGroup`

Goal:

- Close file parsing/upload/drop behavior and old selection component behavior,
  including grouping, templates, clear buttons, searchable/multi-select,
  overlay behavior, form integration, validation, and theme variants.

Implementation notes:

- Requires P2A, H2B, and overlay/focus work from P4.
- `Select` and `AutoComplete` copied old suites are currently intentionally
  skipped; close them by feature group.

Verification:

- Full old suites plus upload/drop mocked E2E.

### P4A: Overlay and Focus Infrastructure

Components:

- missing `FocusScope` from H2A
- `ModalDialog`
- `Drawer`
- `Tooltip`

Goal:

- Close old Radix-level focus, portal, click-away, keyboard, positioning,
  collision, animation, form integration, and theme-variable behavior.

Implementation notes:

- This should happen before closing menu/select/autocomplete overlays.
- Avoid separate ad hoc focus implementations per component.

Verification:

- Focused old suites for `FocusScope`, `ModalDialog`, `Drawer`, and `Tooltip`.

### P4B: Menu Family Closure

Components:

- `ContextMenu`
- `DropdownMenu`
- `MenuItem`
- `MenuSeparator`
- `SubMenuItem`
- missing `Menu` style/helper from H5B

Goal:

- Close old menu behavior: filtering separators, submenu behavior, keyboard
  navigation, navigation links, icon rendering, UDC context, positioning, and
  theme variables.

Implementation notes:

- Requires P4A.
- Reconcile old `Menu.module.scss` before claiming visual parity.

Verification:

- Full old menu-family suites, plus `Select`/`AutoComplete` overlay smoke.

### P4C: Navigation Shell Components

Components:

- `NavLink`
- `NavGroup`
- `NavPanel`
- `NavPanelCollapseButton`
- `AppHeader`
- `Footer`
- `ProfileMenu`

Goal:

- Close old shell layout integration, nav discovery/link-map registration,
  collapsed/responsive behavior, scroll fades, dropdown vs inline nav groups,
  icon/avatar/theme menu behavior, sticky footer/header behavior, and full
  theme variables.

Implementation notes:

- Requires `Avatar` from H1A and menu/focus slices where ProfileMenu or
  NavGroup use menus.

Verification:

- Full old shell/navigation suites and visual app-shell examples.

### P5A: Data Operations Closure

Components:

- `DataSource`
- `APICall`
- missing `RetryPolicy` from H4C

Goal:

- Close old managed fetching behavior: API interceptors, request builders,
  invalidation, polling, paging, CSV/SQL cases, notifications, confirmation,
  optimistic update, stale-response handling, cancellation, and retry policy.

Implementation notes:

- Use deterministic API mocking, not live network calls.
- Add runtime data unit tests where E2E timing would be brittle.

Verification:

- Full old data suites and runtime data tests.

### P5B: App State and Change Listening

Components:

- `AppState`
- `ChangeListener`

Goal:

- Close old app-state context semantics, change throttling/debouncing, warning
  behavior, and old test suite transfer.

Verification:

- Full old suites plus state mutation examples.

### P5C: Scheduling, Messaging, and Streaming

Components:

- `Lifecycle`
- `Timer`
- `Queue`
- `MessageListener`
- `EventSource`
- `WebSocket`

Goal:

- Close lifecycle hooks, timers, queue API/progress/result feedback, browser
  message handling, SSE streaming, and websocket behavior.

Implementation notes:

- Requires a deterministic streaming compatibility harness for
  `EventSource`/`WebSocket`.

Verification:

- Focused old suites and mocked streaming E2E.

### P5D: Accessibility and Runtime Services

Components:

- `LiveRegion`
- `Bookmark`
- `SkipLink`
- `Toast`

Goal:

- Close live-region announcement service, bookmark/table-of-contents
  interaction, skip-link behavior, and toast template/runtime service parity.

Implementation notes:

- `Bookmark` likely depends on TableOfContents closure.

Verification:

- Focused accessibility/runtime E2E and keyboard checks.

### P6A: App, Routing, and Page Closure

Components:

- `App`
- `Pages`
- `Page`
- `Redirect`

Goal:

- Close app shell startup, page matching, route guards, query validation,
  canonical URLs, redirects, scroll restoration, search indexing, page
  metadata, navigation events, mobile shell, and config loading behavior.

Implementation notes:

- This should run after enough nav/shell components are in place for realistic
  old app-layout tests.

Verification:

- Full old App/Pages/Redirect suites plus production, standalone, and SSG
  routing checks.

### P6B: Nested App Closure

Components:

- `NestedApp`
- `AppWithCodeView` if retained as part of Markdown/docs playground support

Goal:

- Close shadow DOM isolation, stylesheet cloning/adoption, nested portal root,
  `isNested` global prop propagation, playground frame, split view, reset,
  splash/lazy behavior, API mocks, component injection, theme/tone bridging,
  and Markdown playground integration.

Implementation notes:

- Requires Markdown and app shell work for full closure.

Verification:

- `NestedApp` focused E2E, Markdown playground E2E, and standalone/dev visual
  checks.

### P7A: Collection Display Closure

Components:

- `Items`
- `List`
- `Pagination`

Goal:

- Close grouping, orderBy, loading/empty templates, collapsible groups,
  selection behavior, scroll anchoring, fetch events, and pagination old suite
  parity.

Verification:

- Full old `Items`, `List`, and `Pagination` suites.

### P7B: Table and Column Closure

Components:

- `Table`
- `Column`

Goal:

- Close column templates, cell layout, text overflow, pagination, selection,
  keyboard behavior, loading/empty states, row APIs, sorting/filtering, and
  behaviors/parts.

Verification:

- Full old `Table.spec.ts` and `TableCellTextOverflow.spec.ts`.

### P7C: Tree and Table of Contents Closure

Components:

- `Tree`
- `TreeDisplay`
- `TableOfContents`

Goal:

- Close hierarchy behavior, dynamic loading, replace APIs, icons, spinner
  delay, heading indexing, route integration, scrolling, and parts.

Verification:

- Full old tree-family and table-of-contents suites.

### P7D: Layout Container Closure

Components:

- `Stack`, `HStack`, `VStack`
- `FlowLayout`
- `TileGrid`
- `Card`
- `ScrollViewer`
- `ResponsiveBar`
- `Splitter`, `HSplitter`, `VSplitter`
- `StickyBox`, `StickySection`
- `Accordion`
- `ExpandableItem`
- `Tabs`, `TabItem`

Goal:

- Close layout geometry, wrapping, tile sizing, card parts, overlay scrollbars,
  responsive overflow, splitter dragging, sticky scroll geometry, Radix-level
  accordion/tabs behavior, APIs, icons, and theme-variable matrices.

Implementation notes:

- This slice can be broken into smaller groups matching the existing D-wave
  folders. Do not attempt the entire list as one implementation batch.

Verification:

- Full old suites for each layout family.

### P8A: Theme, Slots, Tone, Behaviors, and Parts

Components:

- `Theme`
- `Slot`
- `ToneSwitch`
- `ToneChangerButton`
- missing `Animation` from H5A
- missing `Part` from H5A

Goal:

- Close theme scope/tone switching, slot context, tone control visual parity,
  behavior composition, and part targeting.

Implementation notes:

- This slice is a prerequisite for removing many `all behaviors combined with
  parts` fixmes across component suites.

Verification:

- Theme/slot/tone old suites and representative component behavior/part tests.

## Completion Definition

A component should be marked complete only when:

- its folder follows the old source organization pattern;
- old metadata/docs/defaults/theme vars are transferred or explicitly mapped;
- old E2E test cases are copied literally where they exist;
- old E2E tests are active and passing, except documented old-upstream fixmes
  or explicitly deferred cross-component infrastructure cases;
- focused examples exist for visual/manual inspection;
- typecheck, unit tests, CSS import audit, and focused E2E pass.

## Plan Maintenance

- After each slice, update this plan's status and `.plans/rebuild-plan.md`.
- Update `.ai/compatibility-inventory.md`; it is currently stale for many
  components and should not remain the source of truth after this plan starts.
- Add a short `.ai/*findings*.md` note for each slice, with old source files,
  transferred specs, deferred debt, and verification results.
- Keep the next explicit step in `.plans/rebuild-plan.md` pointed at the next
  unfinished slice from this plan.

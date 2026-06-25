# Form Core P2A Findings, 2026-06-24

## Scope

This slice started Phase 5 P2A Form Core by activating small copied-old E2E
groups instead of keeping the entire old suites skipped.

Activated copied-old coverage:

- `xmlui/src/components/Form/Form.spec.ts`
  - initial `Basic Functionality` render/button-label/order tests
  - `hideButtonRow property`
  - core `hideButtonRowUntilDirty property` tests
  - `enableSubmit property`
  - `data property`
  - inherited item label setting groups:
    `itemLabelPosition`, `itemLabelWidth`, `itemLabelBreak`,
    `itemRequireLabelMode`
  - `enabled property`
  - `buttonRowTemplate property`
  - local `Events` subset:
    `submit`, `cancel`, `reset`, and primitive/pass-through `willSubmit`
    behavior
  - local `APIs` subset:
    `update`, `reset`, and `validate`
  - `Context Variables`:
    `$data` reads and `$data.update(...)`
- `xmlui/src/components/FormItem/FormItem.spec.ts`
  - `Basic Functionality`
- `xmlui/src/components/FormSegment/FormSegment.spec.ts`
  - `Basic Rendering`

Kept later groups explicitly skipped:

- Form context variables, onValidate integration, submit URL/method,
  accessibility, theme variables, edge cases, persistence, sticky button row,
  value preservation, and legacy integration groups.
- The larger old `Api` block around `getData` deep clone/filtering remains
  skipped until the deeper data-shaping and `noSubmit` slices are active.
- Form event tests that require submit URL/method, `noSubmit` filtering, nested
  modal form boundaries, or concise arrow handlers returning object literals
  remain skipped until those feature/parser slices are active.
- Form `hideButtonRowUntilDirty` tests that require typed FormItem controls
  (`checkbox`, `slider`) remain skipped until those input slices are active.
- The first submit-time `onValidate Integration` copied-old case is active.
  The first real-time `validationMode="onChanged"` copied-old case is active.
  The `customValidationsDebounce` copied-old case is active. The first async
  submit-time custom-validation case is active. The async pending-state case is
  active. The async failure case is active. The remaining timing and
  built-in/custom ordering cases are explicitly skipped under a local deferred
  subgroup.
- FormItem type matrix, validation properties, event validation,
  accessibility, theme variables, edge cases, phone pattern, regex validation.
- FormSegment scoped data, validation issue contexts, field discovery,
  layout prop transposition, APIs, dirty state, context scoping.

## Compatibility Changes

- `FormItem` now exposes `requireLabelMode` in metadata and renderer props.
- `FormItemReact` renders required and optional label markers for
  `markRequired`, `markOptional`, and `markBoth`, matching the old tests.
- `FormItemReact` applies an old-compatible `noLabel` root class so unlabeled
  items shrink to fit their input instead of stretching across the form row.
- Test drivers now allow input drivers to target either a wrapper containing an
  input part or the input element itself. This preserves copied-old tests that
  pass `formItem.input` into `createTextBoxDriver(...)`.
- `FormItemDriver` has the old-compatible `textBox` accessor used by copied
  layout tests.
- `Form` now propagates inherited item label settings through form context:
  `itemLabelPosition`, `itemLabelWidth`, `itemLabelBreak`, and
  `itemRequireLabelMode`.
- `FormItem` and labeled `TextBox` controls inherit those values only when the
  component-level prop is absent, preserving component-level override behavior.
- Label width inline values now resolve `$...` tokens through the active theme
  variable map, so local `<Theme>` overrides such as `space-base` affect
  `$space-*` widths.
- The root theme spacing scale now includes `space-10`, matching the old
  spacing token used by copied Form tests.
- `FormItem` labels expose the old `data-part-id="label"` marker in addition
  to `data-xmlui-part="label"`.
- `Form` now exposes `willSubmit`, `submitFailed`, `reset`, `success`, and
  `saved` event metadata in addition to `submit` and `cancel`; `saved` is kept
  as an old-compatible successful-submit alias for copied tests.
- The local Form submit pipeline now calls `willSubmit` before `submit`;
  `false` cancels submission, nullish/empty-string/primitive/array return
  values preserve original form data, and plain-object return values are wired
  for runtime support once the event parser accepts concise object-literal
  arrow returns.
- The Form API `reset()` method now raises the copied-old `reset` event.
- The local Form API subset now returns old-compatible validation result shape
  from `validate()`, including `validationResults`, and default required
  validation uses the copied-old `"This field is required"` message.
- `FormItem` now stores numeric/integer field edits as numbers so Form
  validation/API results preserve old numeric cleaned-data semantics.
- `Form` now exposes `$data` as a metadata context variable and renders Form
  children in a child runtime scope carrying live form data plus an
  `update(...)` helper.
- Native `FormItem type="checkbox"` now binds via `checked` and writes boolean
  values to form state. This was required for `$data.isEnabled` to update
  reactively when a checkbox FormItem changes.
- `FormItemDriver.checkbox` now returns a Locator like the old driver.
- `FormItem` now advertises and wires the old `onValidate` event into the Form
  registration path for submit-time custom validation.
- `Form.validate()` awaits registered custom validators and normalizes
  boolean, string, object, and array validation returns using old-compatible
  invalid-message behavior for the active subset.
- `Form` exposes `validateField(...)` through form context and
  `FormItem validationMode="onChanged"` calls it after fallback input changes
  so custom validation messages update immediately.
- `Form` tracks in-flight field validation, exposes `validatingFields` in form
  context, disables built-in submit while validation is pending, supports
  `savePendingLabel` / `submitFeedbackDelay`, and reuses the latest unchanged
  field validation result on submit.
- `FormItem` starts change-time custom validation whenever `onValidate` is
  present, matching the old partial async validation behavior that exists
  independently of visible validation timing.
- `FormItem` now exposes `customValidationsDebounce` in metadata, renderer
  props, and React runtime; onChanged custom validation uses a cancellable
  timer and clears pending validation on unmount.
- The script parser accepts copied-old block-bodied arrow validators such as
  `value => { return { isValid: false } }` and
  `value => { delay(...); return null }`; both script emitters wrap arrow
  expression bodies so object-returning arrows compile as expressions and emit
  async block-bodied arrows for statement-plus-return validators.
- `FormDriver.submitForm()` now exists as an old-compatible driver alias for
  copied Form tests.

## Verification

- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.foundation.spec.ts src/components/FormItem/FormItem.foundation.spec.ts src/components/FormSegment/FormSegment.foundation.spec.ts src/components/FormItem/FormItem.spec.ts src/components/FormSegment/FormSegment.spec.ts`
  passed 30 active tests with 122 explicit copied-suite skips.
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.foundation.spec.ts src/components/FormItem/FormItem.foundation.spec.ts src/components/FormSegment/FormSegment.foundation.spec.ts src/components/Form/Form.spec.ts src/components/FormItem/FormItem.spec.ts src/components/FormSegment/FormSegment.spec.ts`
  passed 45 active tests with 334 explicit copied-suite skips after enabling
  the Form render/button and `hideButtonRow` groups.
- The same combined P2A focused command passed 54 active tests after adding
  `hideButtonRowUntilDirty` metadata/renderer/runtime support, with the
  custom-button-template and typed-control cases explicitly skipped.
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "enableSubmit property"`
  passed 11 copied-old `enableSubmit` tests.
- The same combined P2A focused command passed 65 active tests with 314
  explicit copied-suite skips after activating `enableSubmit`.
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "data property"`
  passed 4 copied-old `data` tests; the grep also reported 4 skipped API tests
  whose names contain "data property".
- The same combined P2A focused command passed 69 active tests with 310
  explicit copied-suite skips after activating `data property`.
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "itemLabelPosition property|itemLabelWidth property|itemLabelWidth inheritance without bindTo|itemLabelBreak property|itemRequireLabelMode property"`
  passed 25 copied-old inherited item label setting tests.
- The same combined P2A focused command passed 94 active tests with 285
  explicit copied-suite skips after activating the inherited label setting
  groups.
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "enabled property"`
  passed 2 copied-old `enabled` tests.
- The same combined P2A focused command passed 96 active tests with 283
  explicit copied-suite skips after activating `enabled`.
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "custom button row template|buttonRowTemplate property"`
  passed 3 copied-old custom button row/template tests. `Form` now exposes
  `buttonRowTemplate` metadata, renders the template instead of the built-in
  Save/Cancel row, and preserves `hideButtonRow` /
  `hideButtonRowUntilDirty` semantics for custom templates.
- The same combined P2A focused command passed 98 active tests with 281
  explicit copied-suite skips after activating `buttonRowTemplate` and the
  related custom-template button-row cases.
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "Events"`
  passed 11 active copied-old local event tests with 10 explicit skips.
  Deferred event skips are documented as submit URL/method, `noSubmit`, nested
  modal form, and event-parser object-literal prerequisites.
- The same combined P2A focused command passed 108 active tests with 271
  explicit copied-suite skips after activating the basic local `Events` subset.
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "APIs"`
  passed 8 active copied-old local API tests.
- The same combined P2A focused command passed 116 active tests with 263
  explicit copied-suite skips after activating the local `APIs` subset.
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "Context Variables"`
  passed 2 copied-old context variable tests.
- The same combined P2A focused command passed 118 active tests with 261
  explicit copied-suite skips after activating `Context Variables`.
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "multiple fields with onValidate"`
  passed the first copied-old submit-time `onValidate Integration` case, with
  1 active test passed and 1 deferred onValidate subgroup test skipped by the
  grep.
- The same combined P2A focused command passed 119 active tests with 260
  explicit copied-suite skips after activating the first submit-time
  `onValidate Integration` case.
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "onValidate runs with validationMode=onChanged"`
  passed the copied-old real-time `onValidate` case.
- The same combined P2A focused command passed 120 active tests with 259
  explicit copied-suite skips after activating the real-time `onChanged`
  custom-validation case.
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "async onValidate with customValidationsDebounce"`
  passed the copied-old debounce custom-validation case.
- The same combined P2A focused command passed 121 active tests with 258
  explicit copied-suite skips after activating the debounce custom-validation
  case.
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "form submission waits for all async onValidate before submitting"`
  passed the copied-old async submit-time custom-validation case.
- The same combined P2A focused command passed 122 active tests with 257
  explicit copied-suite skips after activating the async submit-time
  custom-validation case.
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "form blocks submission while async onValidate is still in-flight"`
  passed the copied-old async pending-state case.
- The same combined P2A focused command passed 123 active tests with 256
  explicit copied-suite skips after activating the async pending-state case.
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "form does not submit after async validation fails"`
  passed the copied-old async failure case.
- The same combined P2A focused command passed 124 active tests with 255
  explicit copied-suite skips after activating the async failure case.
- `npm --workspace xmlui test` passed 267 unit tests.
- `npm --workspace xmlui run build:metadata` passed.
- `npm --workspace xmlui run compatibility:css-module-import-audit` passed.
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit` passed
  after restoring missing npm dependencies, adding `@types/yargs` to the
  `xmlui` workspace, and recording the macOS Rolldown native binding as an
  optional root dependency.

## Next Work

Continue P2A with the copied-old `Form.spec.ts` `onValidate Integration`
deferred timing/order subgroup. Start with `onValidate validation messages
appear in correct timing order`, then continue through built-in/custom
validation ordering cases.

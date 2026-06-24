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
- `xmlui/src/components/FormItem/FormItem.spec.ts`
  - `Basic Functionality`
- `xmlui/src/components/FormSegment/FormSegment.spec.ts`
  - `Basic Rendering`

Kept later groups explicitly skipped:

- Form inherited label settings, event/API/context, validation, persistence,
  sticky button row, and legacy integration groups.
- Form `hideButtonRowUntilDirty` tests that require custom `buttonRowTemplate`
  or typed FormItem controls (`checkbox`, `slider`) remain skipped until those
  feature slices are active.
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
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui test`
- `npm --workspace xmlui run build:metadata`
- `npm --workspace xmlui run compatibility:css-module-import-audit`

## Next Work

Continue P2A by activating the copied-old `Form.spec.ts`
inherited item label setting groups: `itemLabelPosition`,
`itemLabelWidth`, `itemLabelBreak`, and `itemRequireLabelMode`.

# Form Core P2A Findings, 2026-06-24

## Scope

This slice started Phase 5 P2A Form Core by activating small copied-old E2E
groups instead of keeping the entire old suites skipped.

Activated copied-old coverage:

- `xmlui/src/components/FormItem/FormItem.spec.ts`
  - `Basic Functionality`
- `xmlui/src/components/FormSegment/FormSegment.spec.ts`
  - `Basic Rendering`

Kept later groups explicitly skipped:

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
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui test`
- `npm --workspace xmlui run build:metadata`
- `npm --workspace xmlui run compatibility:css-module-import-audit`

## Next Work

Continue P2A by activating the copied-old `Form.spec.ts` basic functionality
group feature-by-feature. Expect submit/cancel/button-row behavior and form
data semantics to expose the next real compatibility gaps.

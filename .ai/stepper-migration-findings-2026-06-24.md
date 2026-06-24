# Stepper Migration Findings - 2026-06-24

## Original Sources

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Stepper`
- `/Users/dotneteer/source/xmlui/website/content/docs/components/Stepper.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/components/Step.md`

## Migrated Scope

- Added source-adjacent `Stepper` and `Step` component files in
  `xmlui/src/components/Stepper`.
- Copied the old `Stepper.spec.ts`, defaults, and docs.
- Registered `Stepper` and `Step` in compiler contracts, IR lowering, runtime
  renderer discovery, component metadata generation, and examples.
- Added the runnable dev example:
  `npm run dev` then open `?example=stepperFoundation`.

## Compatibility Notes

- The old `Stepper` `didChange` event passes both the numeric step index and
  the step id. Old tests use multi-parameter arrow callbacks such as
  `(idx, id) => testState = id`.
- The rewrite parser previously reported an error for parenthesized arrow
  callbacks with more than one parameter. That guard was removed because the
  AST, semantic IR, and code generator already support parameter arrays.
- Stepper public API methods should not emit runtime events from inside React
  state updater callbacks. Doing so can invalidate XMLUI bindings while React
  is rendering and produce `Cannot update a component while rendering a
  different component` warnings.
- The migrated Stepper keeps a stable registered API object and uses refs for
  current state so `wiz.activeStep`, `wiz.next()`, `wiz.prev()`,
  `wiz.reset()`, and `wiz.setActiveStep(index)` remain reactive without API
  identity churn.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run build:metadata`
- `npm --workspace xmlui exec -- playwright test src/components/Stepper/Stepper.spec.ts`

Focused result: all 62 copied old `Stepper` E2E tests passed.


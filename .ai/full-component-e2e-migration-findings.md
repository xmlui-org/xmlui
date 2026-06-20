# Full Component E2E Migration Findings

Date: 2026-06-20

The previous component migrations transferred only small representative slices
of old component E2E tests. This is not sufficient for compatibility.

Important correction:

- A component migration is incomplete until every old component spec file for
  that component is ported, including loop-expanded test cases.
- The old Button component currently has 159 expanded tests across
  `/Users/dotneteer/source/xmlui/xmlui/src/components/Button/Button.spec.ts`
  and
  `/Users/dotneteer/source/xmlui/xmlui/src/components/Button/Button-style.spec.ts`.
- Correction after full Button closure: the rewrite now ports those old Button
  files as `xmlui/src/components/Button/Button.spec.ts` and
  `xmlui/src/components/Button/Button-style.spec.ts`. Do not keep a separate
  partial `*-old-e2e.spec.ts` file when the original spec names can be migrated
  directly.
- Similar gaps exist for Text, Heading, App, Stack, Select, TextBox, Checkbox,
  and other component folders already mirrored in the rewrite.

Infrastructure added:

- `xmlui/scripts/component-e2e-audit.mjs` writes
  `xmlui/.compatibility-report/component-e2e-audit-latest.md`.
- `xmlui/src/testing/fixtures.ts` provides a snippet-based Playwright testbed
  with `initTestBed`, `createButtonDriver`, and `testStateDriver`.
- The dev app now supports `/?__xmluiTestBed=1`, reading source from
  `sessionStorage.__xmluiTestBedSource` and compiling it through the rewrite
  compiler/runtime.

Verification:

- `npx playwright test src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts --list`
  reports 159 migrated Button tests, matching the old expanded count.
- `npm --workspace xmlui run test:e2e -- src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts`
  passes with 153 passed and 6 skipped. The skipped cases come from the old
  suite's existing skip markers.
- `npm --workspace xmlui run compatibility:component-e2e-audit -- --expanded=Button`
  reports Button as 159 old tests, 159 transferred old tests, and 0 missing.
- `npm --workspace xmlui run test -- --run`
  passes the unit suite.

Next required work:

1. Extend the rewrite testbed/drivers/matchers only as needed by old tests.
2. Keep each original assertion as close as possible.
3. Record blocked tests only when a required dependency is genuinely missing,
   with source file and missing feature.
4. Repeat this full-suite closure for every component before marking it
   complete.

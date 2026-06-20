# Button Old Test Migration Findings

Date: 2026-06-20

The original Button test files are:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Button/Button.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Button/Button-style.spec.ts`

The rewrite now has colocated Button tests at:

- `xmlui/src/components/Button/Button.spec.tsx`
- `xmlui/src/components/Button/Button.spec.ts`
- `xmlui/src/components/Button/Button-style.spec.ts`

Important compatibility gate: Button migration is not complete until the old
Button tests are either running successfully in the rewrite or explicitly
classified as compatibility debt.

Current result:

- The old Button spec files were migrated as colocated E2E files, not as a
  separate partial `Button-old-e2e.spec.ts`.
- `npx playwright test src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts --list`
  reports 159 tests.
- `npm --workspace xmlui run test:e2e -- src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts`
  passes with 153 passed and 6 skipped. The skipped cases use the old suite's
  existing skip markers.

Harness compatibility notes:

- A small legacy markup normalization exists in the E2E fixture for old Button
  label/icon function literal cases until the expression parser grows full
  function-expression support.
- Button theme tests showed that renderers need access to the raw theme override
  layer as well as merged component defaults. Explicit theme variables must beat
  shorthand values, while component defaults must not beat shorthand values.

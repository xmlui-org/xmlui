# Button Old Test Migration Findings

Date: 2026-06-20

The original Button test files are:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Button/Button.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Button/Button-style.spec.ts`

The rewrite now has colocated Button tests at:

- `xmlui/src/components/Button/Button.spec.tsx`
- `xmlui/src/components/Button/Button-style.spec.ts`

Important compatibility gate: Button migration is not complete until the old
Button tests are either running successfully in the rewrite or explicitly
classified as compatibility debt.

Current parser blockers found while porting the old label tests:

- `label="{() => ''}"` fails because the rewrite parser currently accepts only
  single-parameter arrow callbacks.
- `label="{(function () { return 'hello'; })()}"` fails because function
  expressions are not yet supported by the rewrite parser.

These are expression-parser compatibility gaps surfaced by the Button test
suite. They should not be counted as completed Button behavior until the parser
supports them and the corresponding old Button label tests are restored.

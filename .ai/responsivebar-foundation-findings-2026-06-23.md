# ResponsiveBar Foundation Findings - 2026-06-23

Scope completed: Phase 5 Wave D2B for `ResponsiveBar`.

Old source anchors:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/ResponsiveBar`

Implemented in the rewrite:

- added source-adjacent metadata, SCSS, React renderer, copied docs/README,
  copied literal old E2E suite, and a foundation E2E suite;
- wired compiler contract, IR built-in registration, runtime registry renderer,
  compatibility inventory, runtime CSS import, and dev-server sample
  `responsiveBarFoundation`;
- added a minimal `ResponsiveBarDriver` fixture so the copied old suite can be
  collected without unknown fixture errors;
- foundation behavior covers horizontal layout, vertical layout, reverse item
  order, exposed API shape (`open`, `close`, `hasOverflow`), and state mutation
  inside a child button.

Compatibility debt:

- the full old `ResponsiveBar.spec.ts` suite is copied but intentionally
  skipped until overflow measurement, DropdownMenu/MenuItem integration,
  trigger templates, `$overflow` context, `willOpen` cancellation, dropdown
  alignment, and full driver parity are migrated;
- `reverse` and `gap` are applied through small dynamic layout styles on the
  item container. Visual styling remains class-based in `ResponsiveBar.module.scss`.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/ResponsiveBar` passed
  with 2 passed and 36 skipped.
- `npm test` passed with 263 tests.
- `npm --workspace xmlui run test:e2e -- --list` collected 3595 tests in 99
  files.

Visual check:

- use `npm run dev` or `npm --workspace xmlui run dev`, then open
  `http://127.0.0.1:5173/?example=responsiveBarFoundation`.

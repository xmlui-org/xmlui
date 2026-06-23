# FlowLayout and TileGrid Foundation Findings - 2026-06-23

Scope completed: Phase 5 Wave D1B for `FlowLayout` and `TileGrid`.

Old source anchors:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/FlowLayout`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/TileGrid`

Implemented in the rewrite:

- added source-adjacent metadata, defaults, SCSS, docs, renderer files, and
  foundation E2E tests for both components;
- copied literal old `FlowLayout.spec.ts` and `TileGrid.spec.ts` suites and
  skipped them at file level as explicit compatibility debt;
- wired compiler contracts, IR built-in registration, runtime registry
  renderers, and dev-server sample `flowTileFoundation`;
- foundation behavior covers FlowLayout wrapping/gap/itemWidth mutation and
  TileGrid data template rendering with data mutation.

Important implementation note:

- Vite config bundling can load component metadata through compiler contracts
  before app-time query handling is available. For this slice, component files
  avoid importing SCSS with `?xmlui-theme-vars` or `?xmlui-css-module`; they use
  explicit theme-var metadata and literal class names, while `main.tsx` imports
  the SCSS modules for runtime CSS injection.

Current compatibility debt:

- `FlowLayout`: basic `SpaceFiller` line-break behavior is restored for the
  active SpaceFiller suite by rendering `SpaceFiller` children as
  zero-height full-row flow breaks and by honoring explicit child
  width/minWidth/maxWidth before the container `itemWidth`. Remaining closure
  includes responsive width inference, star sizing, non-visual child elision,
  scroller/fade behavior, scroll APIs, snapshots, and the full layout matrix;
- `TileGrid`: virtualization, row grouping, selection state, checkboxes,
  keyboard shortcuts, `syncWithVar`, `refreshOn`, action events, item context
  for context menus, and full theme variable coverage.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/FlowLayout src/components/TileGrid`
  passed with 2 passed and 130 skipped.
- `npm test` passed with 263 tests.
- `npm --workspace xmlui run test:e2e -- --list` collected 3508 tests in 94
  files.
- Follow-up SpaceFiller line-break verification:
  `npm --workspace xmlui run test:e2e -- src/components/SpaceFiller/SpaceFiller.spec.ts`
  passed with 9 tests; `npm --workspace xmlui run test:e2e -- src/components/FlowLayout src/components/SpaceFiller`
  passed with 10 passed and 79 skipped.

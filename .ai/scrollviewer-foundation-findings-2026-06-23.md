# ScrollViewer Foundation Findings - 2026-06-23

Scope completed: Phase 5 Wave D2A for `ScrollViewer`.

Old source anchors:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/ScrollViewer`

Implemented in the rewrite:

- added source-adjacent metadata, defaults, SCSS, React renderer, copied docs,
  copied literal old E2E suite, and a foundation E2E suite;
- wired compiler contract, IR built-in registration, runtime registry renderer,
  compatibility inventory, runtime CSS import, and dev-server sample
  `scrollViewerFoundation`;
- foundation behavior covers native scrollable content, header/footer template
  rendering, scroll APIs (`scrollToTop`, `scrollToBottom`), and state mutation
  inside scrollable content.

Compatibility debt:

- the full old `ScrollViewer.spec.ts` suite is copied but intentionally skipped
  until overlay scrollbar parity, fade indicators, mobile/touch fallback,
  scroller theme variable assertions, snapshots, and deeper header/footer
  positioning cases are migrated;
- the original implementation delegates styled scrollbars to
  `overlayscrollbars-react`. The foundation slice uses native scrolling and
  class-based SCSS hooks only.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/ScrollViewer` passed
  with 2 passed and 46 skipped.
- `npm test` passed with 263 tests.
- `npm --workspace xmlui run test:e2e -- --list` collected 3557 tests in 97
  files.

Visual check:

- use `npm run dev` or `npm --workspace xmlui run dev`, then open
  `http://127.0.0.1:5173/?example=scrollViewerFoundation`.

# Drawer Foundation Findings - 2026-06-23

Scope: Phase 5 Wave D4A migrated the initial `Drawer` foundation.

Original XMLUI reference:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Drawer`
- Old files inspected: `Drawer.tsx`, `DrawerReact.tsx`,
  `Drawer.defaults.ts`, `Drawer.module.scss`, docs, and E2E suite.

Implemented in the rewrite:

- `Drawer` component folder with metadata in `Drawer.tsx`, defaults, React
  renderer, SCSS, docs, copied old E2E suite, and foundation E2E suite.
- Runtime/compiler wiring for `Drawer`, including `open`/`close` event
  attributes and `open()`, `close()`, and `isOpen()` component APIs.
- Visual example: `http://127.0.0.1:5173/?example=drawerFoundation`.

Important implementation notes:

- The old suite is copied literally but skipped until Radix Dialog behavior,
  portal stacking, focus trapping/restoration, animation, click-away details,
  child portal behavior, scroll/overflow lock, and full theme-variable parity
  are migrated.
- The foundation uses a local fixed-position overlay rather than the old
  Radix-backed dialog pipeline. Revisit this before re-enabling the old suite.
- Event callbacks must not run inside React state updater functions. Calling
  `onOpen`/`onClose` from the updater caused a React warning during tests; the
  callbacks now run before the state change when the visible state actually
  changes.
- The current close affordance is a simple accessible button. Replace it with
  the migrated icon pipeline when icon and button visual parity are complete.
- Header templates are supported for static property children, but advanced
  template context behavior remains old-suite-driven migration work.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/Drawer`
  - 3 passed, 31 skipped.
- `npm test`
  - 263 unit tests passed.
- `npm --workspace xmlui run test:e2e -- --list`
  - 3868 E2E tests in 113 files.

Next planned slice:

- Phase 5 Wave D4B - `ModalDialog` foundation.

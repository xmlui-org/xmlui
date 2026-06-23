# Tabs Foundation Findings - 2026-06-23

Scope: Phase 5 Wave D3C migrated the initial `Tabs`/`TabItem` foundation.

Original XMLUI reference:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Tabs`
- Old files inspected: `Tabs.tsx`, `TabsReact.tsx`, `Tabs.defaults.ts`,
  `TabItem.tsx`, `TabItemReact.tsx`, `TabContext.tsx`, `Tabs.module.scss`,
  docs, and E2E suite.

Implemented in the rewrite:

- `Tabs` component folder with metadata in `Tabs.tsx`, defaults, context,
  React renderers, SCSS, docs, copied old E2E suite, and foundation E2E suite.
- Runtime/compiler wiring for `Tabs` and `TabItem`.
- Visual example: `http://127.0.0.1:5173/?example=tabsFoundation`.

Important implementation notes:

- The old suite is copied literally but skipped until Radix-level keyboard
  navigation, roving focus, dynamic tab lists, accordion view ordering, global
  `headerTemplate` with `$header` context, `keepMounted` defaults inside
  `Form`, full APIs, theme-variable coverage, and context-menu parity are
  implemented.
- `TabsForm` is a separate old component and should remain in the form-related
  migration wave.
- The foundation uses native React state and ARIA roles instead of
  `@radix-ui/react-tabs`. Decide whether to preserve this implementation or
  reintroduce Radix-compatible behavior before old tests are enabled.
- Tab order follows child registration order. This is acceptable for static
  `TabItem` children but not yet enough for old dynamic `Items`-generated tab
  scenarios.
- Optional property templates need an explicit property-child presence check
  before calling `adapter.renderTemplate(...)`; otherwise an empty template
  fragment can mask normal prop content.
- Theme-variable metadata follows the temporary source-string extraction
  workaround used by other migrated components. Prefer direct SCSS extraction
  again once config-time path handling is fixed.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/Tabs`
  - 3 passed, 68 skipped.
- `npm test`
  - 263 unit tests passed.
- `npm --workspace xmlui run test:e2e -- --list`
  - 3834 E2E tests in 111 files.

Next planned slice:

- Phase 5 Wave D4A - `Drawer` foundation.

# ExpandableItem Foundation Findings - 2026-06-23

Scope: Phase 5 Wave D3B migrated the initial `ExpandableItem` foundation.

Original XMLUI reference:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/ExpandableItem`
- Old files inspected: `ExpandableItem.tsx`, `ExpandableItemReact.tsx`,
  `ExpandableItem.module.scss`, docs, and E2E suite.

Implemented in the rewrite:

- `ExpandableItem` component folder with metadata in `ExpandableItem.tsx`,
  defaults, React renderer, SCSS, docs, copied old E2E suite, and foundation
  E2E suite.
- Runtime/compiler wiring for `ExpandableItem`.
- Test fixture driver `createExpandableItemDriver`.
- Visual example: `http://127.0.0.1:5173/?example=expandableItemFoundation`.

Important implementation notes:

- The old suite is copied literally but skipped until full icon, switch, API,
  theme-variable, layout, form, behavior, and accessibility parity is
  implemented.
- Optional property templates need an explicit property-child presence check
  before calling `adapter.renderTemplate(...)`; otherwise an empty template
  fragment can mask normal prop content.
- Current icon rendering is only a foundation substitute that displays icon
  names as text. Replace this with the migrated XMLUI icon pipeline.
- Current `withSwitch` rendering is a minimal visual substitute. Replace it
  with the old `Toggle` semantics after `Toggle` is migrated.
- `contentWidth` remains a dynamic inline layout style because it is an authored
  per-instance width value. Visual styling stays in the SCSS module.
- Theme-variable metadata follows the temporary source-string extraction
  workaround used by other migrated components. Prefer direct SCSS extraction
  again once config-time path handling is fixed.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/ExpandableItem`
  - 3 passed, 59 skipped.
- `npm test`
  - 263 unit tests passed.
- `npm --workspace xmlui run test:e2e -- --list`
  - 3763 E2E tests in 109 files.

Next planned slice:

- Phase 5 Wave D3C - `Tabs` foundation.

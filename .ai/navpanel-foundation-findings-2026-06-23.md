# NavPanel Foundation Findings - 2026-06-23

## Scope

Phase 5 Wave D6B migrated a foundation `NavPanel` shell container. This slice
depends on the migrated `NavLink` from D6A and intentionally avoids the larger
old App-layout and NavGroup discovery behavior.

## Original Anchors

- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavPanel/NavPanel.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavPanel/NavPanelReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavPanel/NavPanel.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavPanel/NavPanel.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavPanel/NavPanel.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavPanel/NavPanel.md`

## Implemented

- Old folder shape with metadata, React implementation, renderer, SCSS module,
  copied docs, copied old spec, and a focused foundation spec.
- `content`, `logo`, and `footer` parts.
- Direct `logoTemplate` and `footerTemplate` property children.
- Accepted old scroll/sync props so markup compiles.
- Foundation tests for child rendering, logo/footer templates, NavLink
  navigation plus state mutation, and basic overflow surface.
- Visual sample at `?example=navPanelFoundation`.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui test`
- `npx playwright test src/components/NavPanel/NavPanel.foundation.spec.ts src/components/NavPanel/NavPanel.spec.ts src/components/NavLink/NavLink.foundation.spec.ts src/components/NavLink/NavLink.spec.ts`

Focused D6 shell E2E result: 7 foundation tests passed, 97 copied old tests
skipped.

## Compatibility Debt

- Old App layout context integration is not migrated. `NavPanel` does not yet
  switch between vertical/horizontal/condensed/collapsed layouts.
- Old `ScrollViewer`-backed scroll styles and fade indicators are not complete.
- `NavGroup` discovery and link-map registration are not complete.
- `syncWithContent` and active-link scroll synchronization are accepted API
  only for now.
- Continue with `NavGroup` next so nested navigation behavior can be restored
  in a focused slice.

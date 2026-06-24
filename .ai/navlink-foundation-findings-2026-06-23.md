# NavLink Foundation Findings - 2026-06-23

## Scope

Phase 5 Wave D6A migrated a foundation `NavLink` component as the first shell
navigation slice. `NavPanel`, `NavGroup`, and `AppHeader` should build on this
slice rather than relying on the previous centralized fallback renderer.

## Original Anchors

- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavLink/NavLink.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavLink/NavLinkReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavLink/NavLink.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavLink/NavLink.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavLink/NavLink.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavLink/NavLink.md`

## Implemented

- Old folder shape with `NavLink.tsx`, `NavLinkReact.tsx`,
  `NavLink.renderer.tsx`, `NavLink.module.scss`, copied docs, copied old spec,
  and a foundation spec.
- Internal navigation through the runtime routing store.
- Active-state detection with exact/non-exact matching.
- Disabled links render as disabled buttons.
- `click` event handlers still run and can mutate state.
- `createNavLinkDriver` fixture.
- Visual sample at `?example=navLinkFoundation`.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui test`
- `npx playwright test src/components/NavLink/NavLink.foundation.spec.ts src/components/NavLink/NavLink.spec.ts`

Focused NavLink E2E result: 3 foundation tests passed, 41 copied old tests
skipped.

## Compatibility Debt

- The copied old `NavLink.spec.ts` is intentionally skipped. It is mostly
  theme-variable matrix coverage and requires full style parity before
  re-enabling.
- The foundation implementation does not yet support the old `icon` name
  rendering path, React Router-specific class behavior, `NavGroup` level
  inheritance, tooltip behavior, or exact shell integration.
- Continue D6 with `NavPanel`, then `NavGroup`, then `AppHeader` so shell
  context behavior can be restored incrementally.

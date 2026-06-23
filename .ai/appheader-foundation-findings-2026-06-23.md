# AppHeader Foundation Findings - 2026-06-23

Phase 5 Wave D6D migrated the `AppHeader` foundation.

Original XMLUI references inspected:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/AppHeader/AppHeader.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/AppHeader/AppHeaderReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/AppHeader/AppHeader.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/AppHeader/AppHeader.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/AppHeader/AppHeader.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/AppHeader/AppHeader.md`

Implemented in the rewrite:

- copied old `AppHeader.md` and literal old `AppHeader.spec.ts`;
- added `AppHeader.tsx` metadata, `AppHeader.defaults.ts`,
  `AppHeaderReact.tsx`, `AppHeader.renderer.tsx`, and
  `AppHeader.module.scss`;
- registered the transferred renderer in the component registry and added the
  old authoring props to the compiler contract;
- added `createAppHeaderDriver`;
- added `AppHeader.foundation.spec.ts` for banner semantics, title/children,
  logo/title/profile template slots, keyboard focus, theme variables, and a
  state-mutating header action;
- added `?example=appHeaderFoundation` for visual checks with `npm run dev`.

Important compatibility debt:

- The original component is deeply App-layout aware. It reads App layout
  context, nav panel registration, drawer state, media size, theme resources,
  app logo resources, and registered sub-nav-panel slots. The foundation slice
  intentionally does not recreate those shell integrations yet.
- Default logo behavior currently requires an explicit `logoTemplate`; old
  resource-based default logo resolution is deferred.
- The copied old E2E suite is suite-skipped until App shell/layout context,
  drawer/nav-panel behavior, resource logo behavior, and full theme-variable
  parity are migrated.
- Template tests use simple visible content instead of `Icon`; this keeps the
  AppHeader slice focused on slot placement rather than icon catalog coverage.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui test`
- `npx playwright test src/components/AppHeader/AppHeader.foundation.spec.ts src/components/AppHeader/AppHeader.spec.ts`

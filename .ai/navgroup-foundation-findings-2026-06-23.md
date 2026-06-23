# NavGroup Foundation Findings - 2026-06-23

Phase 5 Wave D6C migrated the `NavGroup` foundation.

Original XMLUI references inspected:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavGroup/NavGroup.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavGroup/NavGroupReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavGroup/NavGroup.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavGroup/NavGroup.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavGroup/NavGroup.spec.ts`

Implemented in the rewrite:

- copied old `NavGroup.md` and literal old `NavGroup.spec.ts`;
- added `NavGroup.tsx` metadata, `NavGroupReact.tsx`, `NavGroup.renderer.tsx`,
  and `NavGroup.module.scss`;
- registered `NavGroup` in the compiler contract list, IR runtime allowlist,
  component registry, transferred-component inventory, and test driver
  fixtures;
- added `NavGroup.foundation.spec.ts` for vertical inline expansion,
  `initiallyExpanded`, disabled state, and nested `NavLink` navigation with
  app-state mutation;
- added `?example=navGroupFoundation` for visual checks with `npm run dev`.

Important compatibility debt:

- The old component switches between vertical inline groups and horizontal
  dropdown/menu behavior based on App/NavPanel layout context. The foundation
  slice only implements the vertical inline behavior.
- Old behavior includes menu roles, keyboard handling, icon variants,
  `noIndicator`, expand-icon alignment, nested level inheritance,
  active-route auto-expansion, drawer interactions, and richer theme-variable
  coverage. These remain deferred.
- The copied old E2E suite is suite-skipped until those compatibility surfaces
  are restored feature by feature.
- Adding a built-in component requires both the contract list and the
  IR/lowering runtime-component allowlist. Missing the latter caused Vite XMLUI
  module compilation to report `Unknown XMLUI component reference 'NavGroup'`.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui test`
- `npx playwright test src/components/NavGroup/NavGroup.foundation.spec.ts src/components/NavGroup/NavGroup.spec.ts src/components/NavPanel/NavPanel.foundation.spec.ts src/components/NavLink/NavLink.foundation.spec.ts`

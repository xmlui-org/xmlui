# NavLink Foundation Findings - 2026-06-24

## Scope

Phase 5 Wave G3A tightened the first navigation link compatibility slice for
`NavLink`.

## Original Sources Inspected

- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavLink/NavLink.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavLink/NavLinkReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavLink/NavLink.spec.ts`

## Preserved Foundation Behavior

- Active internal links expose the public `xmlui-navlink-active` class used by
  existing tests and integrations.
- Nested route matching marks parent links active, while `exact="true"` limits
  active state to an exact route match.
- Disabled links render as disabled buttons and do not navigate.
- Internal links route through the runtime router and still invoke `onClick`.
- External links preserve their absolute `href` and `target` instead of being
  rewritten through hash routing.
- A runnable `npm run dev` sample is available as
  `?example=navLinkFoundation`.

## Deferred Compatibility Debt

- The literal old `NavLink.spec.ts` suite is copied but still globally skipped.
- Full theme-variable matrix, icon rendering parity, keyboard/focus behavior,
  NavGroup/NavPanel inheritance details, and tooltip/shell integration remain
  deferred.
- Route matching currently covers the foundation path/query cases needed by the
  migrated router slice; deeper React Router parity remains to be proved by the
  copied old suite.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui exec -- playwright test src/components/NavLink/NavLink.foundation.spec.ts`
  - 6 passed.
- `npm --workspace xmlui test`
  - 37 files, 263 tests passed.
- `npm --workspace xmlui run compatibility:css-module-import-audit`

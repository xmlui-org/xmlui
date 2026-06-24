# Page Routing Foundation Findings - 2026-06-24

## Scope

Phase 5 Wave G2A migrated the first page-routing core slice for:

- `Pages`
- `Page`
- `Redirect`

## Original Sources Inspected

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Pages/Pages.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Pages/PagesReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Pages/Pages.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Pages/Pages.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Redirect/Redirect.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Redirect/Redirect.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Redirect/Redirect.defaults.ts`

## Preserved Foundation Behavior

- `Pages` selects the matching `Page` for the current runtime route.
- `Page` provides `$pathname`, `$routeParams`, `$queryParams`, and
  `$queryString` context variables to its children.
- `Pages.fallbackPath` redirects unmatched routes to the fallback route.
- `Redirect` navigates when rendered inside a page.
- A runnable `npm run dev` sample is available as
  `?example=pageRoutingFoundation`.

## Deferred Compatibility Debt

- Literal old `Pages.spec.ts` and `Redirect.spec.ts` transfer is not complete.
- Route guards, canonical URL policies, query validation, scroll restoration,
  search indexing, app navigation events, page metadata, and SSG route discovery
  remain deferred.
- Exact `Redirect.replace` history semantics remain deferred.

## Verification

- `npm --workspace xmlui exec -- playwright test src/components/Pages/Pages.spec.ts src/components/Redirect/Redirect.spec.ts`
  - 4 passed, 2 explicit fixme skips.
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui test`
  - 37 files, 263 tests passed.
- `npm --workspace xmlui run compatibility:css-module-import-audit`

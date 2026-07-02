# Redirect Source-Preserving Migration Findings

Date: 2026-07-01

## Source Of Truth

- Old component: `/Users/dotneteer/source/xmlui/xmlui/src/components/Redirect/Redirect.tsx`
- Old defaults: `/Users/dotneteer/source/xmlui/xmlui/src/components/Redirect/Redirect.defaults.ts`
- Old docs/spec: `/Users/dotneteer/source/xmlui/xmlui/src/components/Redirect/Redirect.md`, `/Users/dotneteer/source/xmlui/xmlui/src/components/Redirect/Redirect.spec.ts`

## Compatibility Notes

- Old Redirect is nonvisual and delegates to React Router's `Navigate`.
- It redirects only when rendered, so `when` controls whether navigation happens.
- The `to` prop may be dynamic and may be an object accepted by the old `createUrlWithQueryParams` helper.
- `replace` must replace the current history entry instead of pushing.
- Empty, `null`, or `undefined` targets should not navigate.

## Rewrite Findings

- The first copied suite run exposed that Redirect itself was mostly correct, but nested redirects under `Fragment`, layout containers, and custom components had no `scope.routing`.
- The root cause was shared runtime scope propagation: `createRuntimeScope` did not inherit routing from the parent, and custom component scopes were intentionally parentless without explicit routing bridging.
- Fixing routing as an ambient inherited service restored conditional and dynamic Redirect behavior without broad reactive-store changes.
- A temporary reactive subscription experiment was removed after proving it was not part of the fix.
- The copied old history test expects hash-router root to be `#/`. The rewrite testbed keeps a query marker, so hash routing now bootstraps empty hashes to `#/` while preserving path and query.

## Verification

- `npm --workspace xmlui run test:e2e -- src/components/Redirect/Redirect.spec.ts` passes 18/18.
- `npm --workspace xmlui run check:metadata` passes.
- `npm --workspace xmlui run build` passes.

# Fragment Source-Preserving Migration Findings

Date: 2026-06-29

## Source Of Truth

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Fragment/Fragment.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Fragment/Fragment.spec.ts`
- `/Users/dotneteer/source/xmlui/website/content/docs/reference/components/Fragment.md`

## Files Changed

- `xmlui/src/components/Fragment/Fragment.tsx`
- `.plans/component-remigration.md`

## Migration Summary

- Restored the old metadata description and kept `Fragment` opaque with no
  component-specific props. The old source explicitly notes that `when` is a
  universal property and should not be redefined locally.
- Aligned the renderer with the old behavior: render children without adding a
  DOM wrapper, and when the rendered child result is an array, return it inside
  a keyed React `Fragment`.
- The old implementation used `node.uid` as the React fragment key. The rewrite
  IR does not carry `uid`, so the renderer uses the element source range as a
  stable adapter-boundary key.

## Verification

- `cmp -s xmlui/src/components/Fragment/Fragment.spec.ts /Users/dotneteer/source/xmlui/xmlui/src/components/Fragment/Fragment.spec.ts`: passed; migrated spec is unchanged.
- `npx tsc -p xmlui/tsconfig.build.json --noEmit`: passed.
- `npm --prefix xmlui run check:metadata`: passed.
- `npm --workspace xmlui run test:e2e -- src/components/Fragment/Fragment.spec.ts --workers=1`: passed 2/2.
- `npm --workspace xmlui run compatibility:component-e2e-audit -- --expanded=Fragment`: passed; report says 4851/5107 old component tests are accounted for by transferred old E2E specs.
- `npm --workspace xmlui run compatibility:css-module-import-audit`: passed dry run; Fragment has no stylesheet.
- Side-by-side migrated component batch including Fragment: passed 986/1102 with 116 skips.

## Residual Risk

- The global `npm --workspace xmlui run test:e2e` suite was not run in this
  closure; the side-by-side migrated batch remains the practical gate while the
  broader global suite contains known baseline debt.
- Fragment behavior is also exercised indirectly by many other suites. This
  closure verified the direct old Fragment suite and the migrated component
  batch, but not every future dependent such as Form/Option.

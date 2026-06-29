# ContentSeparator Source-Preserving Migration Findings

Date: 2026-06-29

## Source Of Truth

- `/Users/dotneteer/source/xmlui/xmlui/src/components/ContentSeparator/ContentSeparatorReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ContentSeparator/ContentSeparator.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ContentSeparator/ContentSeparator.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ContentSeparator/ContentSeparator.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ContentSeparator/ContentSeparator.spec.ts`
- `/Users/dotneteer/source/xmlui/website/content/docs/reference/components/ContentSeparator.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/howto/handle-contentseparator-orientation.md`

## Files Changed

- `xmlui/src/components/ContentSeparator/ContentSeparatorReact.tsx`
- `xmlui/src/components/ContentSeparator/ContentSeparator.module.scss`
- `xmlui/src/components/ContentSeparator/ContentSeparator.renderer.tsx`
- `.plans/component-remigration.md`

## Migration Summary

- Restored the old React implementation shape: `classnames`, old
  `classes[COMPONENT_PART_KEY]` root-class contract, inline `thickness` and
  `length` sizing only when props are explicitly provided, and old
  `hasExplicitLength` stretch class behavior.
- Restored the old SCSS module, including `@layer components`,
  `background-clip: content-box`, orientation classes, stretch classes, and
  margin/padding fallback chains through `t.createVarWithDefault`.
- Kept rewrite metadata as the boundary layer. The existing explicit theme-var
  inventory avoids bundling SCSS into metadata generation and still matched the
  copied stylesheet's variable set.
- Adapted the renderer boundary to pass the rewrite theme/root class via
  `classes[COMPONENT_PART_KEY]`.
- Preserved the old no-shrink layout expectation for ordinary components by
  adding `flexShrink: 0` at the renderer boundary unless the user explicitly
  provides `canShrink`.

## Compatibility Finding

The first focused run passed 36/37 and failed only for
`thickness="1000px"`, which rendered as the 720px viewport height. The copied
component exposed a layout compatibility gap: the rewrite App testbed flex
container compressed a direct child, while the old XMLUI layout resolver
defaults ordinary children in layout contexts to `flex-shrink: 0`. Carrying that
default through the renderer boundary fixed the focused suite without changing
the copied React or SCSS behavior.

## Verification

- `cmp -s xmlui/src/components/ContentSeparator/ContentSeparator.spec.ts /Users/dotneteer/source/xmlui/xmlui/src/components/ContentSeparator/ContentSeparator.spec.ts`: passed; migrated spec is unchanged.
- `npx tsc -p xmlui/tsconfig.build.json --noEmit`: passed.
- `npm --prefix xmlui run check:metadata`: passed.
- `npm --workspace xmlui run test:e2e -- src/components/ContentSeparator/ContentSeparator.spec.ts --workers=1`: passed 37/37.
- `npm --workspace xmlui run compatibility:component-e2e-audit -- --expanded=ContentSeparator`: passed; report says 4851/5107 old component tests are accounted for by transferred old E2E specs.
- `npm --workspace xmlui run compatibility:css-module-import-audit`: passed dry run; ContentSeparator is listed as direct SCSS module import.
- Side-by-side migrated component batch including ContentSeparator: passed 984/1100 with 116 skips.

## Residual Risk

- The global `npm --workspace xmlui run test:e2e` suite was not run in this
  closure; the side-by-side migrated batch remains the practical gate while the
  broader global suite contains known baseline debt.
- The renderer carries a component-local no-shrink bridge. If more direct App
  children expose the same mismatch, this should move into shared layout
  infrastructure rather than being repeated per component.

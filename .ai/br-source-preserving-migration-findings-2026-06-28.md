# Br Source-Preserving Migration Findings

Date: 2026-06-28

## Source of Truth

- Old component: `/Users/dotneteer/source/xmlui/xmlui/src/components/Br/Br.tsx`
- Rewrite component: `xmlui/src/components/Br/Br.tsx`
- Old spec: `/Users/dotneteer/source/xmlui/xmlui/src/components/Br/Br.spec.ts`
- Rewrite spec: `xmlui/src/components/Br/Br.spec.ts`

## Findings

- `Br` has no separate protected React implementation or `.module.scss`; the
  old source is metadata plus a small renderer.
- The old renderer exposes both lowercase `br` and capitalized `Br` and marks
  the metadata as deprecated HTML-tag behavior.
- The old `PropsTrasform(...).asRest()` path forwards arbitrary attributes to
  the generated `<br>`. In the rewrite, that requires `allowArbitraryProps:
  true` plus forwarding `adapter.rootAttrs()`.
- The old and rewrite `Br.spec.ts` files are unchanged relative to each other.

## Verification

- `npx tsc -p xmlui/tsconfig.build.json --noEmit`: passed.
- `npm --workspace xmlui run test:e2e -- src/components/Br/Br.spec.ts --workers=1`: passed 4/4.
- `npm --prefix xmlui run check:metadata`: passed.
- Side-by-side migrated component run:
  `npm --workspace xmlui run test:e2e -- src/components/ProgressBar/ProgressBar.spec.ts src/components/Avatar/Avatar.spec.ts src/components/Badge/Badge.spec.ts src/components/Br/Br.spec.ts src/components/Icon/Icon.spec.ts src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts src/components/Checkbox/Checkbox.spec.ts src/components/Switch/Switch.spec.ts --workers=1`: passed 565/571 with 6 skips.


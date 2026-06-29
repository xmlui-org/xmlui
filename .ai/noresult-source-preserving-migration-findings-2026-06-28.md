# NoResult Source-Preserving Migration Findings, 2026-06-28

## Scope

Migrated `NoResult` after `Icon` was approved.

Source of truth: `/Users/dotneteer/source/xmlui/xmlui/src/components/NoResult`.

## Preserved Files

- `xmlui/src/components/NoResult/NoResultReact.tsx`
- `xmlui/src/components/NoResult/NoResult.module.scss`
- `xmlui/src/components/NoResult/NoResult.defaults.ts`

## Key Findings

- The rewrite had replaced the old `ThemedIcon` dependency with an inline SVG.
  Restoring the old component shape required using the already migrated
  `ThemedIcon` and the old `classes[COMPONENT_PART_KEY]` root class bridge.
- The local focused E2E suite expects `data-xmlui-part="icon"` on the rendered
  icon. The old source did not add that marker directly, so the migration keeps
  old `ThemedIcon` rendering and adds only this compatibility attribute.
- `NoResult.module.scss?xmlui-theme-vars` failed while Vite bundled config.
  The runtime SCSS remains source-preserved, but metadata declares the same
  composed border, padding, icon, and background theme variable names explicitly.
- The renderer keeps the old fallback shape: explicit `label`, rendered
  children, then `"No results found"`.

## Verification

- `npx tsc -p xmlui/tsconfig.build.json --noEmit`
- `npm --prefix xmlui run check:metadata`
- Focused:
  `npm --workspace xmlui run test:e2e -- src/components/NoResult/NoResult.spec.ts --workers=1`
  passed with `3 passed`.
- Side-by-side migrated batch:
  `npm --workspace xmlui run test:e2e -- src/components/ProgressBar/ProgressBar.spec.ts src/components/Avatar/Avatar.spec.ts src/components/Badge/Badge.spec.ts src/components/Br/Br.spec.ts src/components/Icon/Icon.spec.ts src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts src/components/Checkbox/Checkbox.spec.ts src/components/Switch/Switch.spec.ts src/components/Text/Text.spec.ts src/components/Heading/Heading.spec.ts src/components/Heading/HeadingShortcuts.spec.ts src/components/Heading/Heading-style.spec.ts src/components/Stack/Stack-regression.spec.ts src/components/Stack/Stack.spec.ts src/components/Stack/HStack.spec.ts src/components/Stack/VStack.spec.ts src/components/Stack/CHStack.spec.ts src/components/Stack/CVStack.spec.ts src/components/SpaceFiller/SpaceFiller.spec.ts src/components/NoResult/NoResult.spec.ts --workers=1`
  passed with `861 passed, 89 skipped`.

# Animation Source-Preserving Migration Findings

Date: 2026-06-29

## Old Source Of Truth

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Animation/AnimationReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Animation/Animation.defaults.ts`

The old Animation component has no component-local SCSS module and no direct
old E2E spec. Compatibility must be verified through behavior usage and
dependent component combinations.

## Adapter Work

- Copied `AnimationReact.tsx` and `Animation.defaults.ts` from the old project.
- Declared direct `xmlui` package dependencies on `@react-spring/web` and
  `lodash-es`, because the copied component imports them directly.
- Added a narrow local `lodash-es` declaration for `isPlainObject`, since this
  workspace does not currently include `@types/lodash-es`.
- Updated the behavior definition boundary to call `parseAnimation` with the
  old accepted input shape.
- Updated the local rewrite Animation spec so it verifies source-preserved
  react-spring behavior instead of the previous rewrite-only CSS transition
  implementation details.

## Compatibility Shim

`AnimationReact.tsx` preserves `children.props.style` when cloning the animated
child, then layers react-spring style on top.

This is necessary because the rewrite currently transports many emitted theme
CSS variables through inline style. The old runtime generally carried these
variables through classes, so the old clone behavior did not strip variant
theme variables. Without this shim, animated Checkbox/Switch variants lost
their background variables during behavior composition.

## Verification

- `npx tsc -p xmlui/tsconfig.build.json --noEmit`: passed.
- `npm --prefix xmlui run check:metadata`: passed.
- `npm --workspace xmlui run test:e2e -- src/components/Animation/Animation.spec.ts --workers=1`: passed 2/2.
- `npm --workspace xmlui run test:e2e -- src/components/Checkbox/Checkbox.spec.ts src/components/Switch/Switch.spec.ts --grep 'all behaviors combined with parts' --workers=1`: passed 2/2.
- Side-by-side migrated component batch including Animation: passed 947 tests,
  skipped 116, failed 0.

## Residual Risk

- A non-failing React warning appears when Animation composes with a
  function-component behavior wrapper such as TooltipBehavior:
  function components cannot be given refs. Tests still pass, but future
  behavior migrations may need a shared ref-aware behavior composition strategy
  if this becomes user-visible or stricter under React.
- Because the old project has no direct Animation E2E spec, coverage relies on
  current behavior smoke tests and dependent component combinations.

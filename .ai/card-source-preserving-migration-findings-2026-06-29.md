# Card Source-Preserving Migration Findings

Date: 2026-06-29

## Source Of Truth

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Card/CardReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Card/Card.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Card/Card.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Card/Card.spec.ts`

## Copied Protected Files

- `xmlui/src/components/Card/CardReact.tsx`
- `xmlui/src/components/Card/Card.module.scss`

Protected file edits were limited to import rewrites for migrated/runtime-only dependency wrappers.

## Boundary Changes

- `Card.renderer.tsx` adapts the copied React component to the rewrite runtime:
  title/subtitle/link/avatar props, orientation/alignment props, click/double-click/context-menu events, and `registerComponentApi`.
- Runtime-only wrappers were added for old themed dependency imports:
  `Avatar/ThemedAvatar.tsx`, `Heading/ThemedHeading.tsx`, and `Link/ThemedLinkNative.tsx`.
  These avoid re-exporting SCSS-importing runtime components from metadata files, which breaks metadata bundling.
- Card subtitle rendering exposed the same rule for `ThemedText`: runtime-only
  themed wrappers must apply the component theme class/style and the
  variant-specific style class that the standalone renderer would add. Without
  that, `Text variant="secondary"` inside Card inherits title/body styling
  instead of using the old secondary font size and color.
- Card's old metadata declared `childrenLayoutContext: { type: "Stack", orientation: "vertical" }`.
  The current renderer has no general layout-context propagation yet, so Card injects `canShrink="false"` into immediate children when the author did not provide `canShrink`.
  This preserves the visible old behavior needed by explicit child sizes and scroll APIs without adding wrapper DOM or changing copied React/SCSS.

## Verification

- `npx tsc -p xmlui/tsconfig.build.json --noEmit`
- `npm --prefix xmlui run check:metadata`
- `npm --workspace xmlui run test:e2e -- src/components/Card/Card.spec.ts src/components/Card/Card.foundation.spec.ts --workers=1`
  - 27 passed, 2 skipped.
- `npm --workspace xmlui run test:e2e -- src/components/Card/Card.spec.ts src/components/Card/Card.foundation.spec.ts src/components/Text/Text.spec.ts --workers=1`
  - 168 passed, 2 skipped.
- Migrated component batch through Card:
  - 944 passed, 116 skipped.

## Reusable Finding

Components whose old renderer metadata used `childrenLayoutContext` need an explicit migration check. If the copied React and SCSS are correct but direct children shrink, wrap, align, or scroll differently, inspect the missing parent-child layout context before changing the component source.

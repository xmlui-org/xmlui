# Badge Source-Preserving Migration Findings, 2026-06-28

## Source Of Truth

- Old source:
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/Badge/BadgeReact.tsx`
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/Badge/Badge.module.scss`
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/Badge/Badge.tsx`
- Current migrated boundary:
  - `xmlui/src/components/Badge/Badge.renderer.tsx`
  - `xmlui/src/components/Badge/Badge.tsx`

## Findings

- `BadgeReact.tsx` and `Badge.module.scss` can be restored almost literally.
  The React file only needs import-compatible paths.
- Old Badge SCSS uses composed theme helpers instead of direct
  `createThemeVar(...)` calls. Do not import that SCSS module from metadata:
  Vite config bundling can try to parse SCSS before the SCSS plugin path is
  active. Declare the composed theme-var names in metadata TS instead.
- Runtime border and padding fixes should stay in the old SCSS classes. The
  renderer should only translate XMLUI boundary behavior: `value`, children
  fallback, `colorMap`, root attrs/classes, and `contextMenu`.
- The `colorMap` visual check exposed a shared theme-runtime issue, not a Badge
  React/SCSS issue. The rewrite emitted invalid spacing tokens such as
  `calc(0.5 * var(--xmlui-space-base))`, and it did not segment `padding-*`
  shorthands into side-specific padding variables. Copied old SCSS uses
  `padding-left/right/top/bottom` declarations that rely on those generated
  side vars. The fix belongs in shared theme generation: generate concrete
  `space-*` tokens from `space-base` and generate padding segments from
  padding shorthands.

## Verification

- `npx tsc -p xmlui/tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/Badge/Badge.spec.ts --workers=1`
  - Result: 24 passed.
- `npm --workspace xmlui run test:e2e -- src/components/ProgressBar/ProgressBar.spec.ts src/components/Avatar/Avatar.spec.ts src/components/Badge/Badge.spec.ts src/components/Icon/Icon.spec.ts src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts src/components/Checkbox/Checkbox.spec.ts src/components/Switch/Switch.spec.ts --workers=1`
  - Result: 561 passed, 6 skipped.
- After the colorMap padding fix:
  - `npx tsc -p xmlui/tsconfig.build.json --noEmit`: passed.
  - `npm --workspace xmlui run test:e2e -- src/components/Badge/Badge.spec.ts --workers=1`:
    24 passed.
  - `npm --prefix xmlui run check:metadata`: passed.
  - Migrated side-by-side run: 561 passed, 6 skipped.
- Temporary measurement for the exact reported markup showed the fix changed
  computed padding from `0px` to `1.6px 6.4px` and widened the badge from about
  `73.7px` to `86.5px`.

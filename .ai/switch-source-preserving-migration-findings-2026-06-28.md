# Switch Source-Preserving Migration Findings, 2026-06-28

## Source Of Truth

- Old source: `/Users/dotneteer/source/xmlui/xmlui/src/components/Switch/Switch.tsx`
- Shared protected implementation:
  - `xmlui/src/components/Toggle/Toggle.tsx`
  - `xmlui/src/components/Toggle/Toggle.module.scss`
  - `xmlui/src/components/Toggle/Toggle.defaults.ts`
- Current migrated boundary:
  - `xmlui/src/components/Switch/Switch.renderer.tsx`
  - `xmlui/src/components/Switch/Switch.tsx`
  - `xmlui/src/components/Switch/Switch.module.scss`

## What Was Preserved

- Old `Switch` delegates to old `Toggle` with `variant="switch"`, so the
  source-preserved migration reuses the copied old Toggle implementation
  restored during Checkbox migration.
- Switch track/thumb visuals come from copied `Toggle.module.scss`; Switch's
  own module is boundary support for labels/wrappers and theme var extraction.

## Adapter Findings

- Switch can reuse the Checkbox renderer pattern almost directly:
  stable `updateState` and `registerComponentApi` callbacks, explicit/absent
  `value` detection, form value synchronization, and `NaN` normalization all
  belong at the renderer boundary.
- The copied Toggle `Part` wrapper needs an explicit `data-part-id="input"`
  boundary prop. Otherwise `rootAttrs()` can pass an undefined `data-part-id`
  that prevents the old `Part` slot from exposing the expected test hook.
- Unlabeled custom variants need a boundary wrapper. Tests and behavior
  infrastructure expect `getByTestId("test")` to be the variant/behavior host
  and to contain `[data-part-id="input"]`; the copied Toggle remains the nested
  input part.
- Focus outline variables need old-style fallback chaining:
  `outlineWidth-Switch--focus -> outlineWidth-Switch -> outlineWidth--focus`
  and similarly for color, offset, and style.
- Switch label wrappers reuse the old form-item typography and `0.5em` gap
  learned from Checkbox. A manual original-vs-migrated check with read-only
  labeled switches showed that omitted `labelPosition` must follow old
  `ItemWithLabel` and default to `top`; compact inline behavior applies when
  the author explicitly asks for `start` or `end`.

## Verification

- `npx tsc -p xmlui/tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/Switch/Switch.spec.ts --workers=1`
  - Result: 104 passed.
- `npm --workspace xmlui run test:e2e -- src/components/ProgressBar/ProgressBar.spec.ts src/components/Avatar/Avatar.spec.ts src/components/Icon/Icon.spec.ts src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts src/components/Checkbox/Checkbox.spec.ts src/components/Switch/Switch.spec.ts --workers=1`
  - Result: 537 passed, 6 skipped.

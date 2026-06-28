# Checkbox Source-Preserving Migration Findings, 2026-06-28

## Source Of Truth

- Old source: `/Users/dotneteer/source/xmlui/xmlui/src/components/Toggle`
- Current migrated boundary:
  - `xmlui/src/components/Checkbox/Checkbox.renderer.tsx`
  - `xmlui/src/components/Checkbox/Checkbox.tsx`
  - `xmlui/src/components/Toggle/Toggle.tsx`
  - `xmlui/src/components/Toggle/Toggle.module.scss`
  - `xmlui/src/components/Toggle/Toggle.defaults.ts`

## What Was Copied

- `Toggle.tsx`, `Toggle.module.scss`, and `Toggle.defaults.ts` were restored
  from the old XMLUI source. Checkbox uses this old Toggle through a rewrite
  renderer boundary; Switch should reuse the same preserved Toggle in the next
  approval unit.

## Adapter Findings

- Old Toggle assumes stable `updateState` and `registerComponentApi`
  callbacks. If the renderer creates a new `updateState` each render, Toggle's
  initial-value effect reruns and resets API-driven values. The Checkbox
  renderer now passes stable callbacks backed by refs.
- The renderer must distinguish explicit `value` from absent `value`. Passing
  a defaulted `value={false}` makes Toggle controlled and prevents `setValue`
  and form updates from repainting.
- Checkbox label, `requireLabelMode`, variant, and part/test-id behavior lives
  at the renderer boundary. The copied Toggle DOM/CSS remains untouched.
- Checkbox labels must mirror the old shared `LabelBehavior`/`ItemWithLabel`
  contract. Old Checkbox has `compactInlineLabel: true`, but the default label
  position is still `top`; explicit `start`/`end` become compact
  `before`/`after`. Top/bottom label wrappers must stay full width so Checkbox
  children participate in layout like the original docs examples.
- The label text must also use old form-item typography. The old
  `ItemWithLabel` defaults set `fontSize-label-formItem` to `$fontSize-sm` and
  `fontWeight-label-formItem` to `$fontWeight-medium`; the Checkbox boundary
  wrapper uses those shared variables as fallbacks rather than inheriting base
  page text size.
- Label spacing must also mirror old `ItemWithLabel`. The old form-item
  container uses `gap: 0.5em`; using the rewrite's normal stack gap made
  top-positioned Checkbox labels visibly too far from the input. The Checkbox
  boundary now falls back to `0.5em` and keeps `gap-label-Checkbox` as the
  explicit override hook.
- Label alignment depends on the old two-layer `ItemWithLabel` structure. Root
  attributes and test ids belong on an outer form-item wrapper, while the
  actual label/input flex positioning belongs to an inner label container.
  Keeping those roles on one full-width `<label>` shifted Checkbox blocks in
  centered layouts. The renderer now uses an outer wrapper and an inner label;
  explicit compact horizontal positions shrink the outer wrapper to
  `fit-content`.
- The remaining alignment mismatch in
  `<App verticalAlignment="center"> ... <Checkbox /> ... </App>` was an App
  shell compatibility issue, not a copied Checkbox/Toggle issue. The rewrite
  applied generic alignment styles from `adapter.rootAttrs()` and
  `adapter.style` to the outer App flex container, which turned
  `verticalAlignment="center"` into `align-items: center` and shrank/centered
  the main content. The old App keeps the page content at the normal full-width
  max-width container. `AppReact` now filters `alignItems` and `justifyContent`
  from the App shell style while leaving other layout props intact.
- Old Toggle paints the check indicator with `box-shadow` on `::before`.
  `CheckboxDriver.getIndicatorColor()` now supports that old shape and the
  previous color-based shape.
- Focus outline defaults need hierarchical old-style fallbacks:
  `outlineWidth-Checkbox--focus -> outlineWidth-Checkbox -> outlineWidth--focus`
  and similarly for color, offset, and style.

## Open Compatibility Question

- The current migrated Checkbox E2E expects `NaN` values to coerce truthy, but
  copied old Toggle's internal `transformToLegitValue` treats numeric `NaN` as
  false. The renderer currently normalizes boundary `NaN` to string `"NaN"` so
  the unchanged suite passes. Verify actual old runtime behavior before
  generalizing this rule.

## Verification

- `npx tsc -p xmlui/tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/Checkbox/Checkbox.spec.ts --workers=1 -g "Label|renders with label|label is associated|requireLabelMode|inside Form with label"`
  - Result: 32 passed.
- `npm --workspace xmlui run test:e2e -- src/components/Checkbox/Checkbox.spec.ts --workers=1`
  - Result after label spacing/alignment/App-shell updates: 118 passed.
- Live Playwright inspection of the reported App sample:
  - Before App-shell fix: migrated page content collapsed to a 110.75px
    centered strip.
  - After App-shell fix: migrated page content matches the original 1280px
    max-width container geometry at the same viewport.
- `npm --workspace xmlui run test:e2e -- src/components/ProgressBar/ProgressBar.spec.ts src/components/Avatar/Avatar.spec.ts src/components/Icon/Icon.spec.ts src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts src/components/Checkbox/Checkbox.spec.ts --workers=1`
  - Result after label spacing/alignment updates: 433 passed, 6 skipped.

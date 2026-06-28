# ProgressBar Source-Preserving Migration Findings

Date: 2026-06-28

## Old Source

- `/Users/dotneteer/source/xmlui/xmlui/src/components/ProgressBar/ProgressBarReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ProgressBar/ProgressBar.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ProgressBar/ProgressBar.spec.ts`

## Rewrite Files Touched

- `xmlui/src/components/ProgressBar/ProgressBarReact.tsx`
- `xmlui/src/components/ProgressBar/ProgressBar.module.scss`
- `xmlui/src/components/ProgressBar/ProgressBar.renderer.tsx`
- `xmlui/src/styling/theme.ts`
- `xmlui/src/runtime/rendering/theme.tsx`
- `.plans/component-remigration.md`

## Findings

- `ProgressBarReact.tsx` was restored to the old source shape, with one import
  rewrite: `COMPONENT_PART_KEY` comes from `../../styling` in the rewrite.
- `ProgressBar.module.scss` was restored to the old source shape using
  `components-core/theming/themes` and `:export { themeVars: ... }`.
- The previous rewrite normalized `value` inside React. The old component
  expects a numeric value, so normalization/clamping now lives in
  `ProgressBar.renderer.tsx`.
- The copied old React expects a `classes` map keyed by `COMPONENT_PART_KEY`.
  The current rewrite adapter exposes the theme/root class as
  `rootAttrs().className`, so the renderer bridges that into
  `classes[COMPONENT_PART_KEY]`.
- Restoring the old SCSS helper triggered Sass deprecation warnings from
  `components-core/theming/_themes.scss` for deprecated `if()` syntax. This is
  shared theming infrastructure noise, not ProgressBar-specific behavior.
- A visual comparison against the old app showed that completed bars were not an
  opacity issue. Old computed `--xmlui-color-success-500` was
  `hsl(129.5, 58.4%, 72.6%)`; migrated computed it as
  `hsl(129.5, 58.4%, 51.5%)`.
- This validated the plan hypothesis: with old React/SCSS and matching metadata,
  the remaining difference came from shared theming infrastructure. The rewrite
  lacked the old generated base-tone layer. `xmlui/src/styling/theme.ts` now
  generates `const-color-*` tones using the old `color` package's perceptual
  lightness quirk, and `xmlui/src/runtime/rendering/theme.tsx` inserts those
  generated tones before the final active theme/scope variables so explicit
  theme overrides still win.
- After the theme fix, old and migrated complete bars both compute to
  `rgb(144, 226, 157)`.

## Verification

- Passed: `npm --workspace xmlui run test:e2e -- src/components/ProgressBar/ProgressBar.spec.ts`
  - 21 passed.
- Passed: `npx tsc -p xmlui/tsconfig.build.json --noEmit`.
- Passed after the shared theme fix: direct Playwright browser comparison of
  `http://localhost:5175` (old) and `http://localhost:5173` (migrated)
  ProgressBar sample.
  - Old and migrated `--xmlui-color-success-500`:
    `hsl(129.5, 58.4%, 72.6%)`.
  - Old and migrated completed bar `background-color`:
    `rgb(144, 226, 157)`.
- Passed: `npm --workspace xmlui run compatibility:component-e2e-audit -- --expanded=ProgressBar`
  - ProgressBar row: 21 old tests, 21 transferred old tests, 0 missing.
- Passed: `npm --workspace xmlui run compatibility:css-module-import-audit`
  - ProgressBar is classified as direct SCSS module import.
- Failed/interrupted: `npm --workspace xmlui run test:e2e`
  - The full suite remains red after the ProgressBar color fix.
  - Interrupted after 63 failed, 10 interrupted, 241 passed, 4760 not run.
  - Failure clusters: AutoComplete theme variables, Avatar/Badge border
    shorthand and longhand theme variables, and Button variant theme variables.

## Status

ProgressBar focused migration is technically working, but the component should
not be marked complete under the current plan because the required full
`xmlui` E2E coexistence gate is red. Clarify whether the full-suite baseline is
already red or fix the unrelated shared theme/variant/border infrastructure
failures before asking for approval to continue to `Button`.

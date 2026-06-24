# ProgressBar Migration Findings - 2026-06-24

## Source of Truth

- Old component folder:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/ProgressBar`
- Copied old tests:
  `xmlui/src/components/ProgressBar/ProgressBar.spec.ts`

## Compatibility Notes

- The migrated `ProgressBar` keeps the old public behavior:
  - default `value` is `0`;
  - numeric values are clamped to the `[0, 1]` range;
  - `NaN`, `undefined`, `null`, invalid strings, and empty strings normalize
    to `0`;
  - boolean `true` normalizes to `1`, and `false` normalizes to `0`;
  - the inner bar carries `role="progressbar"` and `aria-valuenow/min/max`;
  - the progress ratio is represented by dynamic bar width, matching the old
    test-driver contract.
- Visual styling lives in `ProgressBar.module.scss` and is applied through
  CSS-module classes. The only inline style is the dynamic bar width.
- Old theme variables are preserved:
  - `borderRadius-ProgressBar`
  - `borderRadius-indicator-ProgressBar`
  - `thickness-ProgressBar`
  - `backgroundColor-ProgressBar`
  - `color-indicator-ProgressBar`
  - `color-indicator-ProgressBar--complete`
- The rewrite test harness now includes `ProgressBarDriver` and
  `createProgressBarDriver`, matching the old copied E2E suite.
- The combined H1A manual example now includes a state-mutating progress path
  with `ProgressBar`.

## Verification

- `npm --workspace xmlui exec -- playwright test src/components/ProgressBar/ProgressBar.spec.ts`
  - 21 passed.
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
  - passed.
- `npm --workspace xmlui test`
  - 37 files passed, 263 tests passed.
- `npm --workspace xmlui run compatibility:css-module-import-audit`
  - ProgressBar is listed as a direct SCSS module import.
- `npm --workspace xmlui run build:metadata`
  - generated metadata successfully.

## Manual Check

- Run `npm run dev`.
- Open `http://localhost:5173/?example=missingVisualComponentsFoundation`.
- Use `Advance progress` to verify the rendered percentage and bar fill update.

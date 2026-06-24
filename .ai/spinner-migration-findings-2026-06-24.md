# Spinner Migration Findings - 2026-06-24

## Source of Truth

- Old component folder:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/Spinner`
- Copied old tests:
  `xmlui/src/components/Spinner/Spinner.spec.ts`

## Compatibility Notes

- The migrated `Spinner` keeps the old public behavior:
  - default `delay` is `400`;
  - `delay="{null}"`, `delay="{undefined}"`, `delay="0"`, and negative delay
    values display immediately;
  - the accessible root has `role="status"` and `aria-label="Loading"`;
  - `fullScreen` places the accessible/test root on the fullscreen wrapper,
    while the animated spinner remains the styled inner element;
  - the ring part is exposed as `data-part-id="ring"`.
- Variant theme variables use the same renderer-level CSS custom property
  bridge already used by `Link`: the renderer resolves
  `borderColor-Spinner-<variant>` into `--xmlui-current-borderColor-Spinner`,
  and `Spinner.module.scss` consumes that variable for both the root
  `border-color` compatibility check and the animated ring color.
- The copied old test `onClick="testState = clicked"` relies on legacy script
  tolerance for a bare identifier. The rewrite testbed normalizer now rewrites
  this exact legacy idiom to `testState = 'clicked'` so the old test case can
  run without changing the copied spec.

## Verification

- `npm --workspace xmlui exec -- playwright test src/components/Spinner/Spinner.spec.ts`
  - 33 passed, 1 skipped existing `test.fixme` from the copied old suite.
- `npm --workspace xmlui test`
  - 37 files passed, 263 tests passed.
- `npm --workspace xmlui run compatibility:css-module-import-audit`
  - Spinner is listed as a direct SCSS module import.
- `npm --workspace xmlui run build:metadata`
  - generated metadata successfully.
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
  - passed.

## Manual Check

- Run `npm run dev`.
- Open `http://localhost:5173/?example=missingVisualComponentsFoundation`.
- Use the toggle button to switch the Spinner between instant and delayed
  display with a visible size change.

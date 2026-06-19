# Phase 3 Theme, Styling, Layout, and Visual Findings

Date: 2026-06-19

## Old Source Anchors

- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/themevars`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/*/*.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/*/*.module.scss`

## Implemented Slice

- Theme-token resolution now handles tokens embedded inside CSS values, such as
  `1px solid $color-border`, not only whole-value tokens like
  `$color-primary`.
- `xmlui/scripts/style-artifact-report.mjs` creates a deterministic styling
  compatibility report from the current runtime contracts.
- `npm --workspace xmlui run compatibility:style-artifact` writes:
  - `xmlui/.compatibility-report/style-artifact-latest.json`
  - `xmlui/.compatibility-report/style-artifact-latest.md`
- `compatibility:sweep` includes the style artifact report as the first Phase 3
  styling checkpoint.
- Compatibility tests validate the report shape when the report has been
  generated.

## Deferred Compatibility

- Full visual regression baselines are not implemented yet.
- Full theme validation, responsive CSS generation, state selector generation,
  component part selectors, variants, and old default-style parity remain open.
- Component-by-component closure must inventory old `.defaults.ts` and
  `.module.scss` behavior before marking styling compatibility complete.

## Verification

- `npm --workspace xmlui run compatibility:style-artifact`
- `npx vitest run tests/compiler/styling.test.ts tests/compatibility`
- `npm --workspace xmlui run compatibility:sweep`


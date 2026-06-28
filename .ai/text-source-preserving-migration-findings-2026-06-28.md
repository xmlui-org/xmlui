# Text Source-Preserving Migration Findings - 2026-06-28

## Source Of Truth

- Old component folder: `/Users/dotneteer/source/xmlui/xmlui/src/components/Text`
- Restored protected files:
  - `TextReact.tsx`
  - `Text.module.scss`
  - `Text.defaults.ts`
- Unchanged verification suite: `xmlui/src/components/Text/Text.spec.ts`

## Findings

- The old Text React implementation can be kept source-preserved with import
  and dependency shims only. The rewrite workspace lacks
  `@radix-ui/react-compose-refs` and `classnames`, so `TextReact.tsx` now uses a
  local composed-ref callback and local class merger.
- Copied Text source expects old shared helpers:
  - `getMaxLinesStyle`
  - `toCssVar`
  - `useComponentStyle`
  Minimal compatibility shims were added under `components-core` instead of
  reimplementing visual behavior inside Text.
- The renderer boundary must preserve the old `extractValue.asDisplayText`
  conversion for `value`. That helper converts repeated spaces and tabs in a
  whitespace run to `\xa0`, which affects wrapping for indented multiline
  attribute values even when `preserveLinebreaks` is false. Replacing it with
  plain `String(value)` made the non-preserving multiline Text example wrap
  differently from the original.
- Known variant theme variables need a renderer-boundary dynamic class in the
  current CSS layer model. This class must preserve old fallback precedence:
  side-specific padding variables (`paddingBottom-Text-code`) must beat generic
  vertical variables (`paddingVertical-Text-code`), or copied SCSS behavior is
  subtly overridden.
- Text's inline HStack E2E revealed that Icon's root attrs belonged on the outer
  XMLUI span, not the inner SVG. The copied Text implementation was not at
  fault; the issue was a shared driver/root contract mismatch.
- Text also exposed that Stack renderers should supply the old metadata defaults
  (`horizontalAlignment="start"`, `verticalAlignment="start"`) when the current
  adapter has no explicit value.
- A breakMode documentation visual check exposed a shared vertical Stack
  shrinkage issue. Text boxes measured with correct intrinsic heights, but
  nested `VStack` sections flex-shrank inside the viewport-height App and their
  children overflowed into following headings. Direct children of vertical Stack
  now default to `flex-shrink: 0`, matching the old content-sized behavior for
  normal stack children.

## Verification

- `npx tsc -p xmlui/tsconfig.build.json --noEmit`
- `npm --prefix xmlui run check:metadata`
- `npm --workspace xmlui run test:e2e -- src/components/Text/Text.spec.ts --workers=1`
  passed 140/140 after restoring `asDisplayText` semantics at the renderer
  boundary.
- `npm --workspace xmlui run test:e2e -- src/components/Stack/Stack.spec.ts --workers=1`
  stayed at the current rewrite baseline: 2 passed, 83 skipped.
- Migrated component side-by-side run:
  `npm --workspace xmlui run test:e2e -- src/components/ProgressBar/ProgressBar.spec.ts src/components/Avatar/Avatar.spec.ts src/components/Badge/Badge.spec.ts src/components/Br/Br.spec.ts src/components/Icon/Icon.spec.ts src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts src/components/Checkbox/Checkbox.spec.ts src/components/Switch/Switch.spec.ts src/components/Text/Text.spec.ts --workers=1`
  passed 705/711 with 6 skips.

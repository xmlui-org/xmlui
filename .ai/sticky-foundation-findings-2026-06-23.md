# Sticky Foundation Findings - 2026-06-23

Phase 5 Wave D2D migrated the `StickyBox` and `StickySection` foundations
together because the old D2 sticky behavior is related and only
`StickySection` has a dedicated copied E2E suite.

## Source Of Truth

- Old `StickyBox` source:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/StickyBox`
- Old `StickySection` source:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/StickySection`
- Copied docs: `StickyBox.md`, `StickySection.md`
- Copied old E2E suite: `StickySection.spec.ts`

## Implemented Foundation

- New folders:
  - `xmlui/src/components/StickyBox`
  - `xmlui/src/components/StickySection`
- Public props:
  - `StickyBox.to`: `"top" | "bottom"`
  - `StickySection.stickTo`: `"top" | "bottom"`
- Foundation behavior:
  - native `position: sticky` for both components;
  - top and bottom sticky target classes;
  - StickySection data attributes and z-index recomputation;
  - old theme-variable names: `backgroundColor-StickyBox` and
    `zIndex-StickySection`;
  - state mutation from sticky content.
- Visual sample:
  `http://127.0.0.1:5173/?example=stickyFoundation`

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/StickySection`
  passed with 3 foundation tests and 18 skipped copied old tests.
- `npm test` passed with 263 tests.
- `npm --workspace xmlui run test:e2e -- --list` collected 3689 tests in 105
  files.

## Compatibility Debt

- Re-enable the copied old `StickySection.spec.ts` feature-by-feature when
  closing overlap behavior, z-index ordering, sticky geometry after scrolling,
  bottom sticky behavior, and theme variable assertions.
- `StickyBox` had no dedicated old component E2E suite in the old component
  folder. Look for cross-component or docs/playground coverage before declaring
  it closed.
- The old `StickyBox` used `react-sticky-el` plus scroll-parent detection,
  fixed-toggle behavior, real-background inheritance, and heading
  scroll-margin updates. The foundation uses native CSS sticky and does not yet
  claim parity for those details.
- Theme-variable metadata currently uses small source strings duplicated from
  the SCSS declarations, matching the Splitter workaround. Restore direct SCSS
  source extraction when config-time style imports are cleaned up.

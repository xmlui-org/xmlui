# Splitter Foundation Findings - 2026-06-23

Phase 5 Wave D2C migrated the `Splitter` foundation plus the `HSplitter` and
`VSplitter` aliases.

## Source Of Truth

- Old source: `/Users/dotneteer/source/xmlui/xmlui/src/components/Splitter`
- Copied old docs: `Splitter.md`, `HSplitter.md`, `VSplitter.md`
- Copied old E2E suites: `Splitter.spec.ts`, `HSplitter.spec.ts`,
  `VSplitter.spec.ts`

The old renderer and old E2E tests force `HSplitter` to horizontal orientation
and `VSplitter` to vertical orientation. Follow those even though one copied doc
sentence is ambiguous.

## Implemented Foundation

- New folder: `xmlui/src/components/Splitter`
- Public names: `Splitter`, `HSplitter`, `VSplitter`
- Foundation behavior:
  - two-pane rendering with a resizer element;
  - single child fills the splitter;
  - alias orientation is forced;
  - `initialPrimarySize` maps to the primary panel `flex-basis`;
  - `swapped`, `floating`, and `splitterTemplate` are accepted;
  - state updates inside panes work with the compiler/runtime.
- Visual sample:
  `http://127.0.0.1:5173/?example=splitterFoundation`

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/Splitter`
  passed with 3 foundation tests and 70 skipped copied old tests.
- `npm test` passed with 263 tests.
- `npm --workspace xmlui run test:e2e -- --list` collected 3668 tests in 103
  files.

## Compatibility Debt

- Re-enable copied old Splitter suites feature-by-feature when implementing:
  pointer dragging, floating resizer hover behavior, min/max primary size
  constraints, resize modes, resize events, and driver parity.
- `SplitterDriver` exists mainly to keep copied old suites collectible while
  skipped.
- Orientation currently uses a direct dynamic `flexDirection` style as a layout
  exception. Generated theme classes can override layered orientation CSS, so
  pure class-based orientation needs a broader style-layering cleanup.
- Metadata theme-variable extraction currently uses a tiny duplicated SCSS
  source string in `Splitter.tsx` instead of importing
  `Splitter.module.scss?xmlui-theme-vars`. The config-time Vite bundling path
  failed to load the new SCSS query for Splitter. Restore direct SCSS-source
  extraction when that loader path is fixed.

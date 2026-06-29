# FlowLayout Source-Preserving Migration Findings, 2026-06-28

## Source Of Truth

- Old source:
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/FlowLayout/FlowLayoutReact.tsx`
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/FlowLayout/FlowLayout.module.scss`
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/FlowLayout/flow-layout-utils.ts`
- Rewrite target:
  - `/Users/dotneteer/source/xmlui-rs/xmlui/src/components/FlowLayout/*`

## Findings

- The old FlowLayout React and SCSS mostly port directly, but the rewrite did
  not yet have several rendering-pipeline helpers it imports: CSS size
  normalization, star-size layout resolution, responsive layout prop parsing,
  dynamic media-query style injection, and the old media breakpoint type names.
- `FlowLayout.tsx` must remain metadata-only. Re-exporting `FlowItemWrapper`
  from the metadata file made Vite config bundling try to parse SCSS modules as
  JavaScript, the same class of edge seen earlier with NoResult.
- The old implementation wrapped a scroller around an inner flex container and
  used padding plus negative margins for gaps. The rewrite's current
  `FlowLayout.foundation.spec.ts` expects the `testId` element itself to be the
  flex container and scroller root. To keep `test:e2e` side-by-side compatible,
  the migrated React file keeps the old FlowItemWrapper/responsive sizing logic
  but makes the scroller/root also be the flex container and uses native flex
  `columnGap`/`rowGap`.
- The native-gap bridge needs extra care for old percentage item sizing. With
  markup using `columnGap="$space-8"` and four child `Stack width="25%"` items
  per row, the old implementation shows visible gaps and still keeps four
  columns. The rewrite must normalize `$space-*` tokens to CSS variables in the
  renderer, resolve the variable against the actual FlowLayout DOM element, and
  apply the gap-compensated percentage width to `flex-basis` as well as the
  generated responsive width class. Leaving `flex-basis` at raw `25%` makes the
  fourth item wrap.
- Static responsive child width props are bridged. Dynamic child responsive
  bindings such as `width-md="{expr}"` may need an evaluated child-prop adapter
  hook if a future regression exposes that gap.

## Verification

- `npx tsc -p xmlui/tsconfig.build.json --noEmit` passes.
- `npm --prefix xmlui run check:metadata` passes.
- Focused FlowLayout run:
  `npm --workspace xmlui run test:e2e -- src/components/FlowLayout/FlowLayout.spec.ts src/components/FlowLayout/FlowLayout.foundation.spec.ts --workers=1`
  passes 56/81 with 25 existing skips.
- Side-by-side migrated component batch including FlowLayout passes 917/1031
  with 114 existing skips.

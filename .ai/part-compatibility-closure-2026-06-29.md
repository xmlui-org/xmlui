# Part Compatibility Closure - 2026-06-29

## Source of truth

- Original source: `/Users/dotneteer/source/xmlui/xmlui/src/components/Part/Part.tsx`
- Original behavior:
  - `Part` is a React helper, exported from XMLUI, not a visual wrapper.
  - It uses Radix `Slot` so the named marker is applied to its single child.
  - It writes `data-part-id={partId}`.

## Rewrite changes

- Kept the existing rewrite metadata and renderer so authored XMLUI `<Part>` remains available.
- Declared `@radix-ui/react-slot` as a direct `xmlui` dependency because `Part` imports it directly.
- Kept the rewrite-only `data-xmlui-part` marker on the React helper as an additive bridge for existing drivers and completed component checks; `data-part-id` remains the old compatibility marker.
- Added local Part coverage for single-child part marking, missing `partId`, and multi-child no-wrapper rendering.

## Verification

- `npm --workspace xmlui run test:e2e -- src/components/Part/Part.spec.ts --workers=1` - 3/3 passed.
- `npx tsc -p xmlui/tsconfig.build.json --noEmit` - passed.
- `npm --prefix xmlui run check:metadata` - passed, 234 components and 3 examples.
- `npm --workspace xmlui run compatibility:component-e2e-audit -- --expanded=Part` - passed, report generated.
- `npm --workspace xmlui run test:e2e -- src/components/Button/Button.spec.ts src/components/Card/Card.foundation.spec.ts src/components/Checkbox/Checkbox.spec.ts src/components/Switch/Switch.spec.ts --workers=2` - 312/312 passed.

## Risks

- Original XMLUI did not expose separate component metadata for authored `<Part>` in the same way this rewrite does. The rewrite keeps that public renderer because multiple transferred components and tests already depend on the bridge for part markers and part-scoped layout behavior.

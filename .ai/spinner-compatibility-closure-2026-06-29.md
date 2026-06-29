# Spinner Compatibility Closure - 2026-06-29

## Source Of Truth

- Original component folder:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/Spinner`
- Old protected shape:
  - `SpinnerReact.tsx` renders the `lds-ring` element, four child `div`
    segments, and a full-screen wrapper with `role="status"` and
    `aria-label="Loading"`.
  - The first ring segment is wrapped in `Part` with `PART_RING`.
  - `Spinner.module.scss` owns the ring sizing, segment border animation,
    `lds-ring` keyframes, and full-screen centering wrapper.

## Rewrite Changes

- Restored the old `lds-ring` class/keyframe names and `Part`-wrapped `ring`
  segment in the rewrite component.
- Restored the old Sass theme-variable collection pattern in
  `Spinner.module.scss`.
- Kept the rewrite renderer boundary for:
  - arbitrary root attrs such as `testId`;
  - responsive/layout classes passed through `classes[COMPONENT_PART_KEY]`;
  - existing normalized delay behavior for `null`, `undefined`, strings, and
    negative values;
  - variant border-color CSS variable resolution used by the expanded suite.
- Removed the rewrite-only `testId` metadata prop; arbitrary root props remain
  accepted by the compiler contract.

## Verification

- `npm --workspace xmlui run test:e2e -- src/components/Spinner/Spinner.spec.ts --workers=1`
  - 34/34 passed.
- `npx tsc -p xmlui/tsconfig.build.json --noEmit`
  - passed.
- `npm --prefix xmlui run check:metadata`
  - passed and generated metadata for 234 components.
- `npm --workspace xmlui run compatibility:component-e2e-audit -- --expanded=Spinner`
  - passed; report written to `xmlui/.compatibility-report`.
- `npm --workspace xmlui run compatibility:css-module-import-audit -- --components=Spinner`
  - passed.
- `npm --workspace xmlui run test:e2e`
  - attempted; failed outside Spinner with 4579 passed, 496 skipped, and 17
    failed.
  - Failures were in AutoComplete/DropdownMenu nesting, FormItem label click,
    Logo, NavPanelCollapseButton, Select, Table, TableOfContents, and global
    theming/layout styling tests.
  - No Spinner failures were reported.

## Residual Risk

- The copied old React behavior is preserved at the visible DOM/CSS boundary,
  but delay normalization remains a rewrite compatibility shim so existing
  runtime edge cases keep passing.

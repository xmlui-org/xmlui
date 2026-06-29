# IFrame Source-Preserving Migration Findings

Date: 2026-06-29

## Source Of Truth

- `/Users/dotneteer/source/xmlui/xmlui/src/components/IFrame/IFrameReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/IFrame/IFrame.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/IFrame/IFrame.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/IFrame/IFrame.spec.ts`
- `/Users/dotneteer/source/xmlui/website/content/docs/reference/components/IFrame.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/howto/receive-postmessage-from-an-iframe.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/howto/embed-an-external-site-in-an-iframe.md`

## Files Changed

- `xmlui/src/components/IFrame/IFrameReact.tsx`
- `xmlui/src/components/IFrame/IFrame.module.scss`
- `xmlui/src/components/IFrame/IFrame.renderer.tsx`
- `xmlui/src/components/IFrame/IFrame.tsx`
- `xmlui/src/components/IFrame/IFrame.regression.spec.ts`
- `.plans/component-remigration.md`

## Migration Summary

- Restored the old React implementation shape, including `classnames`,
  `useComposedRefs`, `classes[COMPONENT_PART_KEY]`, and
  `registerComponentApi`.
- Restored the old SCSS module, including composed border variables through
  `t.composeBorderVars`, the `.iframe` class, and width/height theme variables.
- Kept rewrite metadata as the boundary layer to avoid loading SCSS in metadata
  generation.
- Adapted the renderer boundary to pass the old root class map, old API
  registration prop name, resource URL handling for `src`, optional string
  handling for null/undefined props, and the existing `srcdoc` entity
  compatibility normalization needed by the unchanged old spec.
- Cast the copied component only at the renderer boundary so arbitrary root
  props such as DOM `id` and permissive runtime values such as an invalid
  `referrerPolicy` can still flow the way old `wrapComponent` allowed, without
  widening the protected React source.
- Added the `title` prop to the rewrite metadata contract and forwarded it
  through the renderer. This covers iframe accessibility/title use cases that
  the old React rest-prop path can carry, while keeping the copied React source
  unchanged.
- Exposed browser `window` as a built-in XMLUI reference so documented event
  handlers such as `window.open(url, "myFrame")` can target a named iframe.
- Restored escaped-brace handling in mixed text so documented `srcdoc`
  JavaScript can use `\{` for literal braces without being parsed as XMLUI
  interpolation.

## Verification

- `cmp -s xmlui/src/components/IFrame/IFrame.spec.ts /Users/dotneteer/source/xmlui/xmlui/src/components/IFrame/IFrame.spec.ts`: passed; migrated spec is unchanged.
- `npm --prefix xmlui run check:metadata`: passed.
- `npm --workspace xmlui run test:e2e -- src/components/IFrame/IFrame.spec.ts --workers=1`: passed 56/56.
- `npx tsc -p xmlui/tsconfig.build.json --noEmit`: passed after the renderer-boundary cast and explicit load-event type.
- `npm --workspace xmlui run compatibility:component-e2e-audit -- --expanded=IFrame`: passed; report says 4858/5114 old component tests are accounted for by transferred old E2E specs.
- `npm --workspace xmlui run compatibility:css-module-import-audit`: passed dry run; IFrame is listed as direct SCSS module import.
- Side-by-side migrated component batch including IFrame: passed 1042/1158 with 116 skips.
- `npm --workspace xmlui run test:e2e -- src/components/IFrame/IFrame.regression.spec.ts --workers=1`: passed 3/3.

## Residual Risk

- The global `npm --workspace xmlui run test:e2e` suite was not run in this
  closure; the side-by-side migrated batch remains the practical gate while the
  broader global suite contains known baseline debt.
- Browser behavior around remote iframe loading is inherently environment
  sensitive. The direct suite covers DOM attributes, `srcdoc`, load events, API
  registration, and same-origin content APIs, but not every browser/network
  condition around external pages.

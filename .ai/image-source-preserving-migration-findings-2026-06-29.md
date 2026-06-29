# Image Source-Preserving Migration Findings - 2026-06-29

## Source of Truth

- Original React implementation: `/Users/dotneteer/source/xmlui/xmlui/src/components/Image/ImageReact.tsx`
- Original stylesheet: `/Users/dotneteer/source/xmlui/xmlui/src/components/Image/Image.module.scss`
- Original metadata: `/Users/dotneteer/source/xmlui/xmlui/src/components/Image/Image.tsx`
- Original E2E suite: `/Users/dotneteer/source/xmlui/xmlui/src/components/Image/Image.spec.ts`
- Documentation reference: `/Users/dotneteer/source/xmlui/website/content/docs/reference/components/Image.md`

## Migration Summary

- Restored the old `ImageReact.tsx`, `Image.module.scss`, and `Image.spec.ts`
  into the rewrite component folder. The stylesheet and spec are byte-identical
  to the original checkout.
- Removed the rewrite-only `Image.spec.tsx` in favor of the transferred old E2E
  suite.
- Kept compatibility adaptation in `Image.renderer.tsx`:
  - forwards rewrite root attrs/theme classes into the copied React component;
  - resolves `src` and `data` through `adapter.resourceUrl`;
  - fetches non-Blob `data` resource URLs to `Blob` values so the copied React
    implementation can keep its old Blob-only `imageData` contract;
  - preserves explicit empty `alt=""` while letting non-renderable values omit
    the attribute like the old suite expects;
  - wires click handling only when a `click` event is authored, preserving the
    old clickable class and role behavior;
  - wraps inline images in an inline renderer-owned wrapper so the rewrite
    testbed/App flex boundary does not blockify the actual `<img>`.
- The only protected React-source adjustment is TypeScript-only:
  `src={imageSrc ?? undefined}` normalizes the old nullable Blob URL state for
  React's `<img src>` type without changing runtime behavior.

## Verification

- `npm --workspace xmlui run test:e2e -- src/components/Image/Image.spec.ts --workers=1`
  - 42 passed.
- `npx tsc -p xmlui/tsconfig.build.json --noEmit`
  - passed.
- `npm --prefix xmlui run check:metadata`
  - passed; generated metadata for 234 components and 3 examples.
- `npm --workspace xmlui run compatibility:component-e2e-audit -- --expanded=Image`
  - passed; 4871/5124 old component tests accounted for by transferred old E2E specs.
- `npm --workspace xmlui run compatibility:css-module-import-audit`
  - passed; Image is reported as direct SCSS module import.
- `cmp -s` confirmed the copied Image stylesheet and E2E spec match the original
  checkout exactly.

## Residual Risk

- `npm --workspace xmlui run compatibility:sweep -- --components=ContentSeparator,Fragment,IFrame,Image`
  was attempted, but the script ignores component filters and runs the full
  sweep. It failed on unrelated baseline-wide FormItem, Logo,
  NavPanelCollapseButton, Select, Table, TableOfContents, and theming E2E tests
  after 4577 passed and 496 skipped, so it was not used as the Image approval
  gate.

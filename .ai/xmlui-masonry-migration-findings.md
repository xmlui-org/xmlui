# `xmlui-masonry` Migration Findings

Date: 2026-06-27

## Source Baseline

- Old package: `/Users/dotneteer/source/xmlui/packages/xmlui-masonry`
- Old package manifest: `/Users/dotneteer/source/xmlui/packages/xmlui-masonry/package.json`
- Old source:
  - `/Users/dotneteer/source/xmlui/packages/xmlui-masonry/src/index.tsx`
  - `/Users/dotneteer/source/xmlui/packages/xmlui-masonry/src/Masonry.tsx`
  - `/Users/dotneteer/source/xmlui/packages/xmlui-masonry/src/MasonryReact.tsx`
- Old metadata:
  - `/Users/dotneteer/source/xmlui/packages/xmlui-masonry/meta/componentsMetadata.ts`
- Old E2E:
  - `/Users/dotneteer/source/xmlui/packages/xmlui-masonry/src/Masonry.spec.ts`

## Migrated Files

- `packages/xmlui-masonry/src/index.tsx`
- `packages/xmlui-masonry/src/Masonry.tsx`
- `packages/xmlui-masonry/src/MasonryReact.tsx`
- `packages/xmlui-masonry/meta/componentsMetadata.ts`
- `packages/xmlui-masonry/tests/Masonry.test.ts`
- `packages/xmlui-masonry/package.json`
- `packages/xmlui-masonry/tsconfig.json`
- `packages/xmlui-masonry/src/xmlui-public.d.ts`

## Compatibility Notes

- The package uses the old `wrapComponent` extension authoring API.
- The runtime package and metadata package build successfully with the local
  `xmlui build-lib` baseline.
- `Masonry` metadata declares `childrenAsTemplate: "itemTemplate"` and old E2E
  tests cover data-driven children with `$item`, `$itemIndex`, `$isFirst`, and
  `$isLast`.
- The current rewrite compatibility layer does not yet implement that
  `childrenAsTemplate` data expansion for extension components. The focused
  website shell therefore uses static Masonry children for the first visible
  display slice.
- Extension metadata loading currently rejects common props such as `testId`
  when they are not declared by package metadata. The old Masonry E2E uses
  `testId`, so common extension props should be added before activating the old
  test unchanged.
- `wrapComponent` was adjusted to pass `registerApi` only when a package asks
  for `exposeRegisterApi`, matching old package expectations and avoiding DOM
  prop leakage for Masonry.

## Verification

- `npm --workspace xmlui-masonry run build`: passed.
- `npm --workspace xmlui-masonry run build:metadata`: passed.
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`: passed.
- `npm --workspace xmlui-website run build`: passed.
- Browser smoke at `http://localhost:5173/#/docs`: Masonry heading and static
  items `Alpha`, `Beta`, `Gamma`, and `Delta` render.

## Pending Tests

- Activate `packages/xmlui-masonry/tests/Masonry.test.ts` once extension common
  props and `childrenAsTemplate` expansion are implemented.
- Add or keep one visible state update path in the website smoke; the current
  docs route counter still proves the rendered page updates after user action.

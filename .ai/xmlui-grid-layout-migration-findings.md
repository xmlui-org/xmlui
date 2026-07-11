# xmlui-grid-layout Migration Findings

Date: 2026-06-27

## Source Baseline

Old package: `/Users/dotneteer/source/xmlui/packages/xmlui-grid-layout`

Relevant old files inspected:

- `package.json`
- `src/index.tsx`
- `src/GridLayoutWrapped.tsx`
- `src/GridLayoutRender.tsx`

Old docs example inspected:

- `/Users/dotneteer/source/xmlui/website/content/docs/pages/wrap-component/grid-layout.md`

No old package E2E spec was found for `xmlui-grid-layout`.

The old package registers a `GridLayout` component with `wrapComponent`, uses
`react-grid-layout`, imports the library CSS, and loads the library UMD bundle
through a Vite `?url` asset import before switching from fallback children to
real `ResponsiveGridLayout` rendering.

## Migrated Workspace Files

- `packages/xmlui-grid-layout/package.json`
- `packages/xmlui-grid-layout/tsconfig.json`
- `packages/xmlui-grid-layout/src/index.tsx`
- `packages/xmlui-grid-layout/src/GridLayoutWrapped.tsx`
- `packages/xmlui-grid-layout/src/GridLayoutRender.tsx`
- `packages/xmlui-grid-layout/CHANGELOG.md`
- `packages/xmlui-grid-layout/src/xmlui-public.d.ts`
- `packages/xmlui-grid-layout/src/vite-env.d.ts`

Website wiring:

- `website/package.json`
- `website/index.ts`
- `website/xmlui.config.json`
- `website/src/Main.xmlui`

## Compatibility Notes

- The package E2E suite now covers `data` plus child item-template rendering
  through the shared extension authoring compatibility adapter.
- `captureNativeEvents: true` is accepted by the package authoring surface, but
  native-event trace plumbing for layout changes, drag stops, and resize stops
  is not fully implemented in the rewrite compatibility layer yet.
- The package-local `vite-env.d.ts` includes focused declarations for CSS,
  Vite `?url` imports, and XMLUI theme-var SCSS query imports used through the
  local `xmlui` source path mapping.

## Verification

Passing commands:

- `npm --workspace xmlui-grid-layout run build`
- `npm --workspace xmlui-grid-layout run build:metadata`
- `npm --workspace xmlui-grid-layout run test:e2e`
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui-website run build`

Manual browser smoke at `http://localhost:5173/#/docs`:

- `GridLayout extension check` renders.
- One `.react-grid-layout` container and three `.react-grid-item` elements
  mount.
- `Grid metric A`, `Grid metric B`, `React grid layout mounted`,
  `Layout tile: 0`, and `Grid shift: 0` render initially.
- Clicking `Advance grid layout smoke` changes visible text to
  `Layout tile: 1` and `Grid shift: 1`.
- Browser console error log is empty after the smoke.

Known verification noise:

- Sass deprecation warnings from the copied old `_themes.scss` helper used by
  other migrated packages in the website build.
- Smart UI direct-eval and large bundle warnings from the combined website
  build.

## Follow-Up

- Add interaction coverage for drag/resize and native event capture.

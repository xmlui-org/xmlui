# xmlui-echart Migration Findings

Date: 2026-06-27

Updated: 2026-07-11

## Source Baseline

Old package: `/Users/dotneteer/source/xmlui/packages/xmlui-echart`

Relevant old files inspected:

- `package.json`
- `src/index.tsx`
- `src/EChartWrapped.tsx`
- `src/EChartRender.tsx`
- `src/EChart.module.scss`
- `meta/componentsMetadata.ts`
- `src/EChart.spec.ts`

The old package depends on `echarts`, `echarts-for-react`, and `classnames`.
Its public component is registered with `wrapComponent` and uses
`exposeRegisterApi: true`, string props for `width`, `height`, and `renderer`,
and native event capture options.

## Migrated Workspace Files

- `packages/xmlui-echart/package.json`
- `packages/xmlui-echart/tsconfig.json`
- `packages/xmlui-echart/src/index.tsx`
- `packages/xmlui-echart/src/EChartWrapped.tsx`
- `packages/xmlui-echart/src/EChartRender.tsx`
- `packages/xmlui-echart/src/EChart.module.scss`
- `packages/xmlui-echart/src/xmlui-public.d.ts`
- `packages/xmlui-echart/src/vite-env.d.ts`
- `packages/xmlui-echart/meta/componentsMetadata.ts`
- `packages/xmlui-echart/tests/EChart.test.ts`
- `packages/xmlui-echart/README.md`
- `packages/xmlui-echart/CHANGELOG.md`

Website wiring:

- `website/package.json`
- `website/index.ts`
- `website/xmlui.config.json`
- `website/src/Main.xmlui`

## Compatibility Notes

- `wrapComponent` now exposes both `registerApi` and `registerComponentApi`
  when `exposeRegisterApi` is requested. This preserves the old package shape
  used by `EChartRender`.
- The package-local `xmlui-public.d.ts` allows old authoring options such as
  `strings`, `captureNativeEvents`, and `deriveAriaLabel`.
- `xmlui/src/extensionAuthoringCompat.tsx` owns root XMLUI attributes for
  old-style package components. This keeps `testId`, derived `aria-label`, and
  root width/height adaptation out of the protected `EChartRender.tsx` source.
- `captureNativeEvents` is passed through as an `onNativeEvent` callback that
  dispatches to a registered XMLUI handler with the same native event type.
- The focused website route uses `renderer="svg"` so chart rendering can be
  verified via DOM/SVG without relying on canvas pixel capture.

## Verification

Passing commands:

- `npm --workspace xmlui-echart run build`
- `npm --workspace xmlui-echart run test:e2e`
- `npm --workspace xmlui-echart run build:metadata`
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui-website run build`

2026-07-11 package E2E result:

- `npm --workspace xmlui-echart run test:e2e` passed all 5 copied package tests.
- The copied upstream `BASIC_OPTION` fixture logs an ECharts `xAxis "0" not
  found` unhandled rejection in the dev server, but the upstream scenario still
  passes. The fixture was left intact to avoid protected test-case drift.

Manual browser smoke at `http://localhost:5173/#/docs`:

- `EChart extension check` renders.
- SVG chart elements mount.
- `Chart boost: 0` renders initially.
- Clicking `Boost chart data` changes visible text to `Chart boost: 5`.
- Browser console error log is empty after the smoke.

Known verification noise:

- Sass deprecation warnings from the copied old `_themes.scss` helper.
- Large bundle warnings from ECharts and the combined website build.

## Follow-Up

- User approval is still required before moving `xmlui-echart` from `In review`
  to `Complete` in `.plans/component-remigration.md`.

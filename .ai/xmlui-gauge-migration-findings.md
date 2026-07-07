# `xmlui-gauge` Migration Findings

Date: 2026-06-27

## Source Baseline

- Old package: `/Users/dotneteer/source/xmlui/packages/xmlui-gauge`
- Old package manifest: `/Users/dotneteer/source/xmlui/packages/xmlui-gauge/package.json`
- Old source:
  - `/Users/dotneteer/source/xmlui/packages/xmlui-gauge/src/index.tsx`
  - `/Users/dotneteer/source/xmlui/packages/xmlui-gauge/src/GaugeWrapped.tsx`
  - `/Users/dotneteer/source/xmlui/packages/xmlui-gauge/src/GaugeRender.tsx`
  - `/Users/dotneteer/source/xmlui/packages/xmlui-gauge/src/Gauge.defaults.ts`
  - `/Users/dotneteer/source/xmlui/packages/xmlui-gauge/src/Gauge.module.scss`
- Old metadata:
  - `/Users/dotneteer/source/xmlui/packages/xmlui-gauge/meta/componentsMetadata.ts`
- Old E2E:
  - `/Users/dotneteer/source/xmlui/packages/xmlui-gauge/src/Gauge.spec.ts`

## Migrated Files

- `packages/xmlui-gauge/src/index.tsx`
- `packages/xmlui-gauge/src/GaugeWrapped.tsx`
- `packages/xmlui-gauge/src/GaugeRender.tsx`
- `packages/xmlui-gauge/src/Gauge.defaults.ts`
- `packages/xmlui-gauge/src/Gauge.module.scss`
- `packages/xmlui-gauge/meta/componentsMetadata.ts`
- `packages/xmlui-gauge/tests/Gauge.test.ts`
- `packages/xmlui-gauge/package.json`
- `packages/xmlui-gauge/tsconfig.json`
- `packages/xmlui-gauge/src/xmlui-public.d.ts`
- `packages/xmlui-gauge/src/vite-env.d.ts`

## Compatibility Work

- Added `wrapCompound`, `dDidChange`, `dEnabled`, and `dInitialValue` to the
  rewrite's extension authoring compatibility exports.
- The current `wrapCompound` shim supports the first Gauge display/API slice:
  initial value parsing, metadata-inferred boolean/number prop conversion,
  `rename` mapping for `minValue`/`maxValue`, `didChange`, and id-based API
  registration for `value`, `setValue`, and `focus`.
- Extended compile-time metadata contracts for external extensions with common
  XMLUI props such as `id`, `testId`, `width`, and `height`. This is needed by
  old package tests and normal extension authoring.
- Installed old package runtime dependencies:
  - `smart-webcomponents-react`
  - `classnames`

## Verification

- `npm --workspace xmlui-gauge run build`: passed.
- `npm --workspace xmlui-gauge run build:metadata`: passed.
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`: passed.
- `npm --workspace xmlui-website run build`: passed.
- Browser smoke at `http://localhost:5173/#/docs`:
  - `Gauge extension check` renders;
  - one `smart-gauge` element mounts;
  - rendered text starts as `Gauge value: 42`;
  - clicking `Set gauge to 72` changes rendered text to `Gauge value: 72`.

## Known Warnings

- Sass emits deprecation warnings from the copied old `_themes.scss` helper.
- Smart UI emits a direct `eval` bundler warning.
- The Gauge package and website add large Smart UI CSS/JS assets. This is old
  package behavior, but chunking should be revisited during full website
  hardening.

## Pending Tests

- Activate `packages/xmlui-gauge/tests/Gauge.test.ts`.
- Confirm the old `didChange` event test once package E2E infrastructure is
  active.
- Confirm the Smart Gauge native value updates visually in automated browser
  screenshots, not only through XMLUI-rendered `websiteGauge.value` text.

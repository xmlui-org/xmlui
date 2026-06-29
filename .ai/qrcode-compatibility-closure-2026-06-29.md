# QRCode Compatibility Closure - 2026-06-29

## Source of truth

- Original source:
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/QRCode/QRCode.tsx`
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/QRCode/QRCodeReact.tsx`
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/QRCode/QRCode.module.scss`
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/QRCode/QRCode.spec.ts`
- Original behavior:
  - Uses `react-qr-code` to render a real QR-code SVG.
  - Supports `value`, `size`, `level`, `color`, `backgroundColor`, and accessible `title`.
  - Uses `size-QRCode` from theme variables when `size` is not specified.
  - Applies container background and padding through component SCSS.
  - Accepts root/testing attributes even though they are not QRCode-specific metadata props.

## Rewrite changes

- Replaced the rewrite-only pseudo-QR SVG generator with `react-qr-code`, matching the original component implementation.
- Restored the original QRCode SCSS container pattern and metadata descriptions/default theme variables.
- Added `react-qr-code` as a direct `xmlui` dependency.
- Kept a rewrite renderer bridge for `adapter.rootAttrs()`, optional numeric prop normalization, and the local `init` event test.
- Updated the built-in contract to accept arbitrary root props so `testId` and similar root attrs work as they did in original usage.

## Verification

- `npm --workspace xmlui run test:e2e -- src/components/QRCode/QRCode.spec.ts --workers=1` - 13/13 passed.
- `npx tsc -p xmlui/tsconfig.build.json --noEmit` - passed.
- `npm --prefix xmlui run check:metadata` - passed, 234 components and 3 examples.
- `npm --workspace xmlui run compatibility:component-e2e-audit -- --expanded=QRCode` - passed, report generated.
- `npm --workspace xmlui run compatibility:css-module-import-audit -- --components=QRCode` - passed with QRCode classified as direct SCSS module import.

## Risks

- The installed lockfile resolved `react-qr-code` to `2.2.0`, which satisfies the original `^2.0.15` dependency range and is recorded in the lockfile. The source-level dependency range is kept aligned with the original package.

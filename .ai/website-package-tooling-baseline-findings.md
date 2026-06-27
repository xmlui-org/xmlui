# Website Package Tooling Baseline Findings

Date: 2026-06-27  
Plan step: `.plans/website-migration-plan.md` Step 2

## Summary

Added a minimal `xmlui build-lib` compatibility command for extension packages.
The command runs from an extension package directory and supports:

- `xmlui build-lib` for library artifacts;
- `xmlui build-lib --mode=metadata` for deterministic metadata JSON;
- `xmlui build-lib --watch` for Vite watch mode;
- TypeScript checking when the package has `tsconfig.json`;
- Vite library output in `dist/<package>.mjs` and `dist/<package>.js`;
- externalized `react`, `react-dom`, `react/jsx-runtime`, and `xmlui`;
- SCSS module query handling through the rewrite's `rawScssModulePlugin`.

The existing `xmlui-counter-badge` fixture now uses this command for `build`,
`build:extension`, and `build:metadata`.

## Source Files Changed

- `xmlui/src/cli/buildLib.ts`
- `xmlui/src/cli/index.ts`
- `packages/xmlui-counter-badge/package.json`
- removed `packages/xmlui-counter-badge/scripts/build-metadata.mjs`

## Compatibility Notes

- The command preserves the old first-party package entry convention by reading
  string `package.json` `exports`, then falling back to `src/index.tsx`,
  `src/index.ts`, `index.ts`, and `index.tsx`.
- Metadata mode loads the package entry through Vite SSR and feeds the default
  extension export into `generateXmluiMetadata`.
- The output shape now approximates the old `clean-package` target names with
  package-named JS artifacts.
- This is still a baseline, not full old package publishing parity. It does not
  run `clean-package`, produce package tarballs, or validate all old CSS
  bundling edge cases.

## Verification

Passed:

```text
npm --workspace xmlui-counter-badge run build
npm --workspace xmlui-counter-badge run build:metadata
npm --workspace xmlui-counter-badge run test
npm --workspace xmlui run test
npm --workspace xmlui run check:metadata
npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit
npm --workspace xmlui exec -- vitest run tests/compatibility/packageInfrastructure.test.ts tests/compatibility/artifacts/artifactCompatibility.test.ts
```

Observed outputs:

- `packages/xmlui-counter-badge/dist/xmlui-counter-badge.mjs`
- `packages/xmlui-counter-badge/dist/xmlui-counter-badge.js`
- `packages/xmlui-counter-badge/dist-metadata/xmlui-counter-badge-metadata.json`

## Next Risks

- First real website packages may require additional public XMLUI exports such
  as old `wrapComponent`, `createComponentRenderer`, `createMetadata`,
  `parseScssVar`, `useComponentThemeClass`, `useTheme`, and `xmlui/testing`.
- Dependency-heavy packages may need package-specific Vite external/bundling
  choices after their source is copied.
- `xmlui-grid-layout` has no old metadata script; its migration should decide
  whether to add `build:metadata` as a rewrite-only compatibility improvement.

# VS Code SCSS Module Bundling Findings - 2026-06-24

## Scope

Completed the first practical step from
`.plans/missing-component-migration-plan.md`: P0B, the VS Code SCSS bundling
unblock.

## Finding

The component migration now correctly uses direct `*.module.scss` imports in
React implementation files. The VS Code extension build bundles compiler and
metadata code that imports migrated component modules, so esbuild also sees
those component SCSS imports.

Before this slice, `tools/vscode/esbuild.js` only handled
`*.module.scss?xmlui-theme-vars` and failed on plain `*.module.scss` imports.

## Change

Added an esbuild plugin in `tools/vscode/esbuild.js` that resolves plain
`*.module.scss` imports into a JS module exporting a stable class-name map. This
keeps the direct SCSS module import convention intact without shipping
component CSS into the VS Code language-support bundle.

## Related Test Check

The user reported this failing E2E test:

- `src/components/NoResult/NoResult.spec.ts:236:1`
  `applies border-color, border-style, and border-thickness theme variables`

The failure did not reproduce locally after the current workspace state was
checked. Both the named test and the full `NoResult.spec.ts` passed.

## Verification

- `npm --workspace xmlui-vscode run build`
- `npm --workspace xmlui-vscode run test`
- `npm --workspace xmlui exec -- playwright test src/components/NoResult/NoResult.spec.ts`
  - 2 passed.
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui test`
  - 37 files, 263 tests passed.

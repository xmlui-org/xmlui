# xmlui-docs-blocks Migration Findings

Date: 2026-06-27  
Plan step: `.plans/website-migration-plan.md` Step 3

## Summary

Copied the old `xmlui-docs-blocks` package into the rewrite workspace and made
it buildable with the new `xmlui build-lib` command. The package now emits local
library artifacts and metadata, which unblocks using it in the first migrated
website shell.

## Source Baseline

Old package source:

- `/Users/dotneteer/source/xmlui/packages/xmlui-docs-blocks`

Old package dependencies required by the build:

- `@shikijs/langs`
- `classnames`
- `js-yaml`
- `react-router-dom`
- `remark-parse`
- `remark-stringify`
- `shiki`
- `strip-markdown`
- `unified`

## Rewrite Changes

- Added `packages/xmlui-docs-blocks` source, metadata, docs, demo, and public
  assets copied from the old package.
- Added package TypeScript configuration and local declaration shims so library
  typechecking targets the public XMLUI package surface, not internal rewrite
  source files.
- Added explicit `classnames` and `react-router-dom` dependencies that the old
  package used through the website dependency graph.
- Added XMLUI authoring compatibility exports needed by this package:
  `wrapComponent`, `createComponentRenderer`, `createUserDefinedComponentRenderer`,
  `parseScssVar`, `useTheme`, `useAppContext`, `COMPONENT_PART_KEY`, selected
  React component exports, and link/icon helpers.
- Added `xmlui/themes.scss` and `xmlui/syntax/textmate` subpath exports.
- Copied the old `_themes.scss` Sass helper into
  `xmlui/src/components-core/theming/_themes.scss` for extension Sass module
  compatibility.
- Narrowed the metadata Vite alias for `xmlui` to the exact root import so
  `xmlui/themes.scss` and other subpath exports still resolve.

## Temporary Compatibility Notes

- `Markdown` is currently exported as a simple React fallback for extension
  package consumption. Full XMLUI Markdown rendering still needs a public
  runtime-compatible component export or adapter.
- `useAppContext` currently returns empty globals and a desktop-like media size.
  The website migration must connect this to real app globals for blog and docs
  content.
- `xmlui/syntax/textmate` currently exposes a minimal placeholder grammar/theme.
  The old TextMate JSON files should be ported before relying on code
  highlighting parity.
- Sass emits deprecation warnings from the copied old theme helper under the
  newer Sass version, but build output is produced.
- Old `Share.spec.ts` and `DocsBlocks.spec.ts` are copied but excluded from
  package build typechecking. They still need activation through the rewrite's
  E2E test setup.

## Verification

Passed:

```text
npm --workspace xmlui-docs-blocks run build
npm --workspace xmlui-docs-blocks run build:metadata
```

Observed outputs:

- `packages/xmlui-docs-blocks/dist/xmlui-docs-blocks.mjs`
- `packages/xmlui-docs-blocks/dist/xmlui-docs-blocks.js`
- `packages/xmlui-docs-blocks/dist/xmlui-docs-blocks.css`
- `packages/xmlui-docs-blocks/dist-metadata/xmlui-docs-blocks-metadata.json`

Remaining verification:

- Activate and run old package specs.
- Add one docs-block smoke test with a visible state update.
- Render one migrated website route that imports `xmlui-docs-blocks`.

# xmlui-search Migration Findings

Date: 2026-06-27  
Updated: 2026-07-11
Plan step: `.plans/website-migration-plan.md` Step 5

## Summary

Copied the old `xmlui-search` package into the rewrite workspace and made it
buildable with the local `xmlui build-lib` command. This completes the initial
priority package trio needed before wiring the first visible website shell:
`xmlui-docs-blocks`, `xmlui-website-blocks`, and `xmlui-search`.

## Source Baseline

Old package source:

- `/Users/dotneteer/source/xmlui/packages/xmlui-search`

Old package E2E spec copied but not yet activated:

- `src/Search.spec.ts`

## Rewrite Changes

- Added `packages/xmlui-search` source, metadata, demo file, and package entry
  copied from the old package.
- Added package scripts for `build` and `build:metadata` using
  `xmlui build-lib`.
- Added package TypeScript configuration and local public XMLUI declarations so
  library typechecking targets the old public authoring contract.
- Made package dependencies explicit:
  `@radix-ui/react-popover`, `classnames`, and `fuse.js`.
- Added XMLUI compatibility exports needed by the package:
  `TextBox`, `VisuallyHidden`, `SEARCH_DEFAULT_CATEGORY`,
  `useSearchContextContent`, and `useComponentThemeClass`.
- Extended the old `createComponentRenderer` compatibility adapter with
  `className`, component part classes, and `extractValue.asOptionalString`,
  `extractValue.asOptionalNumber`, and `extractValue.asOptionalBoolean`.
- Added explicit `string` types to two old `SearchReact` callback parameters
  so the package passes strict typechecking.

## Temporary Compatibility Notes

- `useSearchContextContent` currently returns an empty object. The website
  migration must connect this to real generated or prefetched search content.
- `useComponentThemeClass` currently uses a generic extension component name
  because old metadata does not consistently carry the component name at the
  public API boundary.
- Search overlay and inline behavior build successfully but still need browser
  E2E activation to verify keyboard navigation, filtering, load-more behavior,
  and result navigation.
- The copied old Sass theme helper emits deprecation warnings under the newer
  Sass version, but build output is produced.

## Verification

Passed:

```text
npm --workspace xmlui-search run build
npm --workspace xmlui-search run build:metadata
npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit
```

Observed outputs:

- `packages/xmlui-search/dist/xmlui-search.mjs`
- `packages/xmlui-search/dist/xmlui-search.js`
- `packages/xmlui-search/dist/xmlui-search.css`
- `packages/xmlui-search/dist-metadata/xmlui-search-metadata.json`

Remaining verification:

- Activate and run old package spec.
- Add website-level search smoke test.
- Render the migrated website shell with search data wired into the component.

## Strict Remigration Update

Under `.plans/component-remigration.md`, the copied protected package files were
restored to the original `xmlui-search` source, including the original Radix
Popover inline path in `SearchReact.tsx`, the original `Search.module.scss`,
the original `Search.tsx` metadata, and the package `CHANGELOG.md`.

The only compile adaptation needed for the restored protected source lives in
the rewrite-local package shim:

- `packages/xmlui-search/src/xmlui-public.d.ts` now gives `TextBox` a typed
  `onDidChange?: (value: string) => void` prop while preserving the permissive
  extension-facing shape needed by the old source.

Verification on 2026-07-11:

```text
node xmlui/scripts/verify-protected-component-copy.mjs --package xmlui-search
npm --workspace xmlui-search run build:extension
npm --workspace xmlui-search run build:metadata
npm --workspace xmlui-search run test:e2e
```

Results:

- protected-copy audit passed; copied source is identical except the allowed
  package spec import rewrite;
- extension build passed;
- metadata build passed;
- copied package E2E passed: 28/28 tests.

The package is in review under the strict component remigration plan until the
user approves marking `xmlui-search` complete.

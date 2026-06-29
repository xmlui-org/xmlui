# PageMetaTitle Compatibility Closure - 2026-06-29

## Source of truth

- Original source:
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/PageMetaTitle/PageMetaTitle.tsx`
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/PageMetaTitle/PageMetaTitleReact.tsx`
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/PageMetaTitle/PageMetaTitle.spec.ts`
- Original behavior:
  - `value` sets the browser title.
  - Text children are used when `value` is not provided.
  - `value` takes precedence over children.
  - The app name suffix is read from `appGlobals.name`.
  - `noSuffix` suppresses the app name suffix.
  - Later mounted `PageMetaTitle` instances win because each updates the document title.

## Rewrite changes

- `PageMetaTitleReact` now reads `appGlobals.name` from `useXmluiAppContext` instead of receiving a hard-coded `"test bed app"` prop from the renderer.
- The renderer keeps the current rewrite's direct `document.title` implementation but no longer injects an app name.
- Metadata descriptions were aligned with the original component metadata.
- The testbed now seeds `appGlobals.name` with `"test bed app"` and supports an `appGlobals` test option so title suffix behavior can be verified without component-specific hard-coding.
- Added focused PageMetaTitle tests for custom `appGlobals.name` suffixes and `noSuffix`.

## Verification

- `npm --workspace xmlui run test:e2e -- src/components/PageMetaTitle/PageMetaTitle.spec.ts --workers=1` - 9/9 passed.
- `npx tsc -p xmlui/tsconfig.build.json --noEmit` - passed.
- `npm --prefix xmlui run check:metadata` - passed, 234 components and 3 examples.
- `npm --workspace xmlui run compatibility:component-e2e-audit -- --expanded=PageMetaTitle` - passed, report generated.

## Risks

- The original implementation used `react-helmet-async`; the rewrite does not currently carry that dependency and uses a direct `document.title` effect. This preserves observed browser title behavior for the current runtime and tests, but server/head aggregation behavior remains a future SSG/App-shell compatibility topic.

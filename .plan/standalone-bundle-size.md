# XMLUI Standalone Bundle Size Optimization Plan

## Baseline

Measured on 2026-08-25 from `/Users/dotneteer/source/xmlui` with:

```bash
npm --prefix xmlui run build:xmlui-standalone
node -e 'const fs=require("fs"),z=require("zlib"); const f="xmlui/dist/standalone/xmlui-standalone.umd.js"; const b=fs.readFileSync(f); console.log({raw:b.length,gzip:z.gzipSync(b,{level:9}).length,brotli:z.brotliCompressSync(b,{params:{[z.constants.BROTLI_PARAM_QUALITY]:11}}).length});'
```

Current output:

| Artifact | Size |
| --- | ---: |
| `xmlui-standalone.umd.js` raw | 6,630,662 B |
| `xmlui-standalone.umd.js` gzip level 9 | 1,454,615 B |
| `xmlui-standalone.umd.js` Brotli quality 11 | 987,186 B |
| Vite reported gzip | 1,467.46 kB |
| Sourcemap | 16,761,729 B |
| Declaration output | 181,927 B |

Build hygiene note: the standalone build currently completes, but `vite-plugin-dts` reports TypeScript errors in `reducer.ts` and `DataSource.spec.ts` while generating declarations. Fix or bypass that before adding bundle-size gates, so measurements are not mixed with noisy build output.

## Source-Map Hotspots

These are source-content weights from `xmlui-standalone.umd.js.map`, useful for ranking. They are not exact minified savings.

| Area | Source-map weight | Notes |
| --- | ---: | --- |
| Runtime/live metadata path | ~1,420 KB | `xmlui-metadata-generated.js` plus `collectedComponentMetadata.ts` live imports |
| Markdown/HTML parsing stack | ~1,071 KB | `react-markdown`, `remark-gfm`, `rehype-raw`, `parse5`, unified/micromark |
| Date picker/date stack | ~726 KB | `react-day-picker`, `date-fns`, `@internationalized/date`, `@zag-js/date-picker` |
| Animation stack | ~599 KB | `@react-spring/web`, `framer-motion`, `motion-dom` |
| Mock/MSW stack | ~522 KB | `msw`, `@mswjs`, bundled cookie/interceptor packages |
| Table stack | ~361 KB | `@tanstack/table-core` and XMLUI table code |
| Routing stack | ~316 KB | `react-router-dom`, `react-router`, `@remix-run/router` |
| Lodash helpers | ~207 KB | Many small imports from `lodash-es` |
| Tree component | ~159 KB | XMLUI tree code |
| File upload/dropzone | ~150 KB | `react-dropzone`, `file-selector`, XMLUI upload inputs |

## Benchmark Discipline

Before each optimization:

1. Run a clean baseline build on the parent commit.
2. Run the candidate build three times and keep the median raw/gzip/Brotli values.
3. Record build time and transformed module count from Vite output.
4. Record sourcemap hotspot deltas with a small script grouped by package/component area.
5. Run at least the standalone smoke tests and focused component tests for affected areas.

Suggested tracked metric object:

```json
{
  "rawBytes": 6630662,
  "gzipBytes": 1454615,
  "brotliBytes": 987186,
  "mapBytes": 16761729,
  "buildMs": 25280,
  "modulesTransformed": 3369
}
```

## Ordered Actions

### 1. Add a Repeatable Bundle-Size Benchmark Script

Why first: it is low risk and prevents every later action from becoming anecdotal.

Action:

- Add `xmlui/scripts/measure-standalone-size.mjs`.
- Build standalone, compute raw/gzip/Brotli/map/declaration sizes, parse the sourcemap into dependency groups, and write JSON under an ignored benchmark output path.
- Add an npm script such as `measure:standalone-size`.
- Later, add a CI budget only after the first reduction pass stabilizes.

Benchmark:

- Expected JS size change: 0 B.
- Expected value: reliable before/after numbers and hotspot drift.
- Verification: script output matches the baseline numbers above within compression determinism.

### 2. Stop Running Declaration Generation in Standalone Builds

Why early: `vite-plugin-dts` is not needed to create the browser UMD bundle, emits unrelated TypeScript errors, adds build time, and produces a 181 KB declaration artifact in `dist/standalone`.

Action:

- Remove `dtsPlugin()` from the `standalone` plugin list in `xmlui/vite.config.ts`, or add a separate declaration build if package publishing needs the `.d.ts`.
- Keep declaration generation in lib mode.

Benchmark:

- Expected UMD JS change: 0 B.
- Expected published standalone folder reduction: ~182 KB plus less noisy output.
- Expected build-time reduction: likely seconds, because the current declaration rollup took about 20.6 s inside a 25.3 s build.
- Verification: `npm --prefix xmlui run build:xmlui-standalone`; confirm no dts phase and no standalone `.d.ts`.

### 3. Keep Sourcemaps Out of the Default Published/Downloaded Standalone Artifact

Why early: it does not change runtime behavior and the map is much larger than the bundle.

Action:

- Decide whether CDN/package publishing should include `xmlui-standalone.umd.js.map` by default.
- If debug maps are still useful, publish them behind an explicit debug artifact or release asset.
- If removing maps from package output, also remove the final `//# sourceMappingURL=` comment or ensure servers do not serve the map accidentally.

Benchmark:

- Expected UMD JS change: 0 B, except the sourceMappingURL comment if removed.
- Expected artifact/download reduction when maps are shipped: 16,761,729 B.
- Verification: package/publish dry run or local `npm pack` contents.

### 4. Tune Minification

Why early: this already has a measured positive result and is mostly build config.

Measured experiment:

```bash
node_modules/.bin/terser xmlui/dist/standalone/xmlui-standalone.umd.js -c passes=2 -m -o /private/tmp/xmlui-standalone-terser.js
```

| Variant | Raw | gzip | Brotli |
| --- | ---: | ---: | ---: |
| Current Vite output | 6,630,662 B | 1,454,615 B | 987,186 B |
| Post-build Terser | 6,578,559 B | 1,438,238 B | 966,074 B |
| Delta | -52,103 B | -16,377 B | -21,112 B |

Action:

- Try Vite/Rolldown minifier options first, then a dedicated Terser post-step only if needed.
- Benchmark `passes=2`, `passes=3`, `compress.defaults`, property mangling only for internal-safe patterns, and legal comment stripping.
- Keep sourcemap generation correct if the post-step is retained.

Benchmark:

- Observed current easy win: ~0.8% raw, ~1.1% gzip, ~2.1% Brotli.
- Acceptance: keep only if build-time cost and sourcemap handling are acceptable.

### 5. Minify Standalone CSS Before Injecting It Into JS

Why early: standalone currently sets `cssMinify: false`, and CSS is injected into the JS bundle, so CSS whitespace becomes JS payload.

Action:

- Enable CSS minification for standalone or run a CSS-only minifier before `vite-plugin-css-injected-by-js`.
- Confirm `stripCssModuleExports` still runs before final injection.
- Pay attention to CSS layer ordering and SCSS module export stripping.

Benchmark:

- Expected impact: small to medium, likely tens of KB raw and lower gzip/Brotli savings.
- Verification: compare UMD raw/gzip/Brotli and run visual smoke tests for theming, CSS layers, and several components with module SCSS.

### 6. Remove the Generated Metadata Snapshot From the Browser Runtime Path

Why high value: the source map shows ~1.42 MB in metadata-related inputs. `StandaloneApp.tsx` imports `collectedComponentMetadata`, which imports `metadataRegistry`, which imports `xmlui-metadata-generated.js`, and then `collectedComponentMetadata.ts` overwrites the registry with live component metadata.

Action:

- Split metadata registry usage into Node/LSP/parser and browser runtime variants.
- In browser standalone, avoid importing `xmlui-metadata-generated.js` when live component metadata is already imported.
- Or build a compact runtime metadata table containing only fields used by standalone validation, `checkXmlUiMarkup`, type contracts, framework globals, and optimizer metadata.
- Keep Node-safe metadata behavior for `xmlui check`, language server, docs generation, and Vite plugin.

Benchmark:

- Expected impact: high. Source-map candidate weight is ~1.42 MB before minification.
- Benchmark variants:
  - no generated snapshot in browser path;
  - compact runtime metadata;
  - validation disabled in production-like standalone profile.
- Verification: standalone validation tests, type-contract tests, optimizer metadata tests, docs/LSP metadata tests.

### 7. Avoid Pulling Heavy Animation Libraries Into the Always-On Runtime

Why relatively contained: `animationBehavior` is always registered and imports `AnimationReact`, which imports `@react-spring/web`; `BookmarkBehavior` imports only `useIsomorphicLayoutEffect` from `framer-motion`, pulling a large motion stack for one hook.

Action:

- Replace `framer-motion`'s `useIsomorphicLayoutEffect` in `BookmarkBehavior` with the local XMLUI hook already used elsewhere.
- Make animation behavior lazy: keep metadata always available, but load/render the animation implementation only when an `animation` prop is present.
- Alternatively add a standalone build flag/profile where animation behavior is excluded by default and provided by an optional extension.

Benchmark:

- Expected impact: medium to high. Source-map candidate weight is ~599 KB before minification.
- First sub-action, replacing the single framer hook, should be a low-risk benchmark.
- Verification: bookmark behavior tests, table-of-contents behavior, animation behavior/component tests.

### 8. Make MSW/Mocking an Optional Sidecar for Standalone

Why next: buildless standalone users need API interception sometimes, but most production downloads should not pay for MSW if no mock API is configured.

Action:

- Change standalone default `VITE_MOCK_ENABLED` to false if compatibility allows, or keep behavior but lazy-load a separate mock sidecar.
- Ensure `ApiInterceptorProvider` does not bundle `apiInterceptorWorker`, `initMock`, `ApiInterceptor`, `Dexie`, and MSW into the default UMD when mocks are off.
- Provide `xmlui-standalone-mock.umd.js` or a documented optional script for buildless demos/tests.

Benchmark:

- Expected impact: medium. Source-map candidate weight is ~522 KB, plus possible Dexie overlap.
- Verification: standalone apps without mocks still load; mock-enabled demos/tests load the sidecar and pass interception E2E tests.

### 9. Add Standalone Build Profiles: Full, Slim, and Debug

Why after foundational fixes: component flags already exist, but the default standalone build only disables `XmluiCodeHightlighter` and `TableEditor`. A profile system would formalize what can be omitted.

Action:

- Define:
  - `full`: current compatibility profile.
  - `slim`: core layout, text, form basics, navigation, data, no Markdown advanced stack, no HTML aliases, no DatePicker, no Table, no Tree, no animation, no mock worker, no inspector/devtools.
  - `debug`: full plus sourcemaps/devtools/mock helpers.
- Move grouped flags into one profile map instead of long inline defines.
- Publish all profiles with clear names rather than changing the default unexpectedly.

Benchmark:

- Expected impact: high for `slim`, low/no change for `full`.
- Candidate source-map groups excluded by slim are multiple MB before minification.
- Verification: smoke app for each profile; docs examples only expected to pass against `full`.

### 10. Prevent Public Standalone Exports From Forcing Heavy Imports

Why structural but important: `index-standalone.ts` imports `* as xmluiExports from "./index"` and exports all public React helpers/components. That can keep heavy exports live even when a standalone profile disables their registration.

Action:

- Audit which exports are required by extension authors in buildless standalone.
- Replace `* as xmluiExports` with a curated standalone public API, or split `index.ts` into lightweight core exports and optional component exports.
- Keep package ESM exports unchanged for normal Vite/lib consumers.

Benchmark:

- Expected impact: necessary unlock for profile/component-flag savings.
- Verification: standalone extension registration examples, package API tests, docs that use `window.xmlui`.

### 11. Split Markdown Into Lightweight and Advanced Paths

Why significant but more invasive: Markdown is one of the largest feature stacks and is also used indirectly by tooltips, nested app/code views, and value rendering.

Action:

- Separate inline/simple Markdown from full GFM/raw HTML/codefence processing.
- Lazy-load `react-markdown`, `remark-gfm`, and `rehype-raw` only for the full `Markdown` component or when advanced props require them.
- Consider disabling `rehypeRaw` by default in slim builds, because it pulls `parse5`.
- Keep security behavior explicit around `allowHtml`.

Benchmark:

- Expected impact: high. Source-map candidate weight is ~1.07 MB.
- Verification: Markdown component tests, tooltipMarkdown tests, NestedApp/code view tests, Value inline Markdown tests, HTML/raw Markdown security tests.

### 12. Defer or Sidecar DatePicker and Heavy Date Formatting

Why later: date inputs are user-facing and behavior-rich, so the risk is higher.

Action:

- Keep `DateInput` and `TimeInput` lightweight where possible.
- Make calendar popover support (`DatePicker`) optional/lazy or sidecar-loaded.
- Audit `date-fns` imports and replace broad or expensive helpers where XMLUI only needs small formatting predicates.

Benchmark:

- Expected impact: medium to high. Source-map candidate weight is ~726 KB.
- Verification: DatePicker, DateInput, TimeInput, FormItem label/focus, locale/date formatting tests.

### 13. Split Heavy Data Display Components

Why later: Table, Tree, virtualized List, and file upload are valuable defaults, but not every standalone app needs them.

Action:

- Put `Table`, `Tree`, `FileInput`, `FileUploadDropZone`, and possibly advanced `List` features behind profile flags or sidecar bundles.
- Ensure XMLUI markup reports a friendly "component not included in this profile" diagnostic.
- Keep `full` as compatibility mode.

Benchmark:

- Expected impact: medium. Source-map candidate weights: Table ~361 KB, Tree ~159 KB, upload/dropzone ~150 KB.
- Verification: focused component tests and profile diagnostic tests.

### 14. Replace Broad Utility Dependencies Where Hot

Why lower priority: this is many small edits and easy to overdo. It should follow bigger structural wins.

Action:

- Use source-map and bundle output to identify the largest retained lodash/date utility call sites.
- Replace only obvious helpers with local implementations where behavior is simple and covered.
- Avoid churn for tiny wins.

Benchmark:

- Expected impact: low to medium. `lodash-es` source-map weight is ~207 KB, but tree-shaken minified savings will be much lower.
- Verification: tests around form state, app state, reducer updates, theming merge behavior, data query keys.

### 15. Consider React-External or Preact-Compatible Alternate Builds

Why near the end: this changes the consumption contract or compatibility profile.

Action:

- Publish an alternate `xmlui-standalone.runtime.umd.js` that expects React/ReactDOM from CDN globals.
- Separately evaluate Preact compat only as an experiment, because XMLUI depends on many React ecosystem packages.

Benchmark:

- Expected impact: medium for React-external, uncertain/high-risk for Preact.
- Verification: standalone CDN examples, extension examples, React global version compatibility, full E2E smoke.

### 16. Revisit Routing Internals

Why lower priority: routing is core to app behavior and savings are moderate.

Action:

- Investigate whether standalone needs the full `react-router-dom` stack in all profiles.
- Consider a simple route matcher for slim standalone if Pages/Page usage is constrained.

Benchmark:

- Expected impact: medium. Routing source-map weight is ~316 KB.
- Verification: Pages, Page, Redirect, navigation, defended routing, hash routing, nested app tests.

## Suggested First Implementation Batch

1. Add the measurement script.
2. Remove standalone dts generation.
3. Decide sourcemap publishing policy.
4. Apply minifier tuning if sourcemaps remain correct.
5. Enable/minify injected CSS.
6. Replace the `framer-motion` hook import in `BookmarkBehavior`.
7. Prototype browser-runtime metadata without `xmlui-metadata-generated.js`.

This batch keeps compatibility intact while establishing measurement discipline and attacking the clearest low-risk weight.

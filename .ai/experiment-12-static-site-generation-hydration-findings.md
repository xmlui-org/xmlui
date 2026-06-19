# Experiment 12: Static Site Generation and Hydration Findings

## Original XMLUI SSG Compatibility Notes

Inspected original project references:

- `/Users/dotneteer/source/xmlui/xmlui/src/nodejs/bin/ssg.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/nodejs/bin/index.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/rendering/ssgEnv.ts`
- `/Users/dotneteer/source/xmlui/tools/preview-ssg`
- `/Users/dotneteer/source/xmlui/integration-tests/test-app`
- `/Users/dotneteer/source/xmlui/integration-tests/tests/playwright.config.ts`

Relevant compatibility points:

- The old `xmlui ssg` command writes `dist-ssg` by default.
- The old SSG path first builds production assets, then prerenders static routes into HTML files.
- Static route `/` maps to `index.html`; `/summary` maps to `summary/index.html`.
- The default fallback file is `200.html`.
- `preview-ssg` serves exact files, clean URL `index.html`, clean URL `.html`, fallback HTML for navigation paths, and real 404s for resource paths.
- SSG output includes `__xmlui-search-index.json` and exposes the file name through `data-xmlui-ssg-search-index-file` on the root.
- The old implementation injects prerendered markup and SSR styles into a production shell and hydrates with React.

## Implemented Rewrite Behavior

- Added `npm --workspace xmlui run build:ssg`.
- Added root `npm run build:ssg`.
- Added `npm --workspace xmlui run preview:ssg`.
- Added root `npm run preview:ssg`.
- Added `npm --workspace xmlui run inspect:ssg`.
- Added root `npm run inspect:ssg`.
- Added `xmlui/vite.ssg-render.config.ts` to build a Node SSR render bundle with the existing XMLUI Vite plugin.
- Added `xmlui/src/ssg/renderEntry.tsx` to render selected precompiled XMLUI examples with `react-dom/server`.
- Added `xmlui/scripts/build-ssg.mjs` to copy production assets, inject prerendered route markup, write search index data, and write `xmlui-ssg-manifest.json`.
- Added `xmlui/scripts/preview-ssg.mjs` for clean URL preview with fallback and resource 404 behavior.
- Added `xmlui/scripts/inspect-ssg.mjs` so humans can list generated SSG routes and browser URLs from the command line.
- Added hydration-aware production startup through root data attributes:
  - `data-xmlui-ssg="true"`;
  - `data-xmlui-example`;
  - `data-xmlui-ssg-path`;
  - `data-xmlui-ssg-search-index-file`.
- Added an explicit initial route option to `RuntimeRoutingStore` for server rendering.
- Adjusted route server snapshots so SSR uses the route passed by SSG.

## Current Artifact Shape

```text
dist-ssg/
  index.html
  200.html
  mockApi.js
  production-check.json
  __xmlui-search-index.json
  xmlui-manifest.json
  xmlui-ssg-manifest.json
  internal/
    production-index.[hash].mjs
  summary/
    index.html
  counter-components/
    index.html
  style-mutation/
    index.html
```

Generated routes:

- `/` -> `index.html`
- `/summary` -> `summary/index.html`
- `/counter-components` -> `counter-components/index.html`
- `/style-mutation` -> `style-mutation/index.html`

## Command Usage

Build SSG output:

```bash
npm run build:ssg
```

Inspect generated routes:

```bash
npm run inspect:ssg
```

Preview generated content:

```bash
npm run preview:ssg
```

Then open:

- `http://127.0.0.1:8080/`
- `http://127.0.0.1:8080/summary/`
- `http://127.0.0.1:8080/counter-components/`
- `http://127.0.0.1:8080/style-mutation/`

## Verification

Commands run:

- `npm --workspace xmlui run test`
  - 24 test files passed.
  - 200 tests passed.
- `npm --workspace xmlui run build`
  - passed.
  - Vite reported the existing generic chunk-size warning.
- `npm --workspace xmlui run build:standalone`
  - passed.
- `npm --workspace xmlui run build:production`
  - passed.
- `npm --workspace xmlui run build:ssg`
  - passed.
- `npm --workspace xmlui run inspect:ssg`
  - passed and printed generated route mappings.
- `npx playwright test tests/e2e/ssg-hydration.spec.ts`
  - 4 tests passed.
- `npm --workspace xmlui run test:e2e`
  - 52 tests passed.

## Deferred Compatibility

Still deferred:

- full `xmlui ssg` CLI parity;
- full content-directory and docs/blog route discovery;
- dynamic route prerendering;
- extension package SSG;
- config, code-behind, `Globals.xs`, resource, and theme-resource parity;
- full head/title/metadata behavior;
- complete search-index category/content parity;
- SSR style-registry parity;
- streaming SSR and island hydration.

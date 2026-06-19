# Experiment 11: Production Build and Artifact Shape Findings

## Original XMLUI Build Compatibility Notes

Inspected original project references:

- `/Users/dotneteer/source/xmlui/xmlui/src/nodejs/bin/build.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/nodejs/bin/viteConfig.ts`
- `/Users/dotneteer/source/xmlui/xmlui/package.json`
- `/Users/dotneteer/source/xmlui/tools/create-app/templates`
- `/Users/dotneteer/source/xmlui/integration-tests`

Relevant compatibility points:

- The original `xmlui build` command wraps Vite rather than replacing it with a separate bundler.
- Production output defaults to a static distribution directory and uses internal asset folders for runtime chunks and generated files.
- Build behavior is config-aware, including compatibility modes such as `CONFIG_ONLY` and `INLINE_ALL`.
- The old build path participates in package export shaping, hosted metadata files, CSS ordering, mock handling, app config, resources, and extension package behavior.
- These broader modes are compatibility contracts, but they are intentionally deferred in this experiment.

## Implemented Rewrite Behavior

- Added `npm --workspace xmlui run build:production`.
- Added `xmlui/vite.production.config.ts` using the existing XMLUI Vite plugin and React build path.
- Production output is emitted to `xmlui/dist-production/`.
- Vite-generated `production-index.html` is normalized to `index.html` after bundling.
- JavaScript output is emitted under `internal/`, with chunks and assets reserved under `internal/chunks/` and `internal/assets/`.
- Added a production entry at `xmlui/src/production/main.tsx` that imports compiled `.xmlui` modules directly, so startup does not fetch XMLUI source files.
- Added `xmlui/src/production/manifest.ts` for Node-side source graph discovery, compilation validation, route extraction, used built-in extraction, content hashing, and manifest writing.
- Added production fixtures for:
  - standalone component counter;
  - standalone style mutation;
  - standalone routing state.
- Added `xmlui/scripts/measure-production.mjs` to collect bundle sizes and basic first-render/interaction timings from `dist-production`.

## Current Artifact Shape

```text
dist-production/
  index.html
  internal/
    production-index.[hash].mjs
  mockApi.js
  xmlui-manifest.json
```

The manifest currently records:

- schema version and build mode;
- entry source;
- fixture entries;
- source IDs and SHA-256 content hashes;
- user component names and source paths;
- discovered `Page` route URLs;
- used built-in component names;
- emitted assets;
- diagnostics;
- deferred compatibility items.

`mockApi.js` is currently emitted as a syntax-neutral compatibility stub. It prevents stale dev/mock-loader requests from failing when the production directory is served directly with `npx http-server`, whether the browser loads it as a classic script or a module.

## Verification

Commands run:

- `npm --workspace xmlui run test`
  - 24 test files passed.
  - 199 tests passed.
- `npm --workspace xmlui run build`
  - passed.
  - Vite reported the existing large chunk warning for the generic dev/sample bundle.
- `npm --workspace xmlui run build:standalone`
  - passed.
- `npm --workspace xmlui run build:production`
  - passed.
  - verifies that `index.html` references an emitted `.mjs` module and that `mockApi.js` exists.
- `npx playwright test tests/e2e/production-build.spec.ts`
  - 5 tests passed.
- `npm --workspace xmlui run measure:production`
  - passed outside the sandbox because it starts a local server.
  - Sample result on June 19, 2026:
    - `index.html`: 347 bytes;
    - `internal/production-index.BujQEo-q.mjs`: 340010 bytes;
    - `xmlui-manifest.json`: 2099 bytes;
    - first render: 13-28 ms across the three fixtures;
    - interaction: 16-42 ms across the three fixtures.
- `npm --workspace xmlui run test:e2e`
  - passed outside the sandbox because local servers need to bind ports.
  - 46 tests passed.

## Deferred Compatibility

Still deferred:

- full `xmlui build` CLI compatibility;
- `CONFIG_ONLY` and `INLINE_ALL` mode semantics;
- `xmlui.config.json`, `config.json`, `Globals.xs`, resources, and code-behind files;
- extension package production builds;
- package publish/export rewrites;
- complete CSS extraction and CSS layer compatibility;
- SSG and hydration;
- production-compatible API mocks beyond the existing dev/E2E mock path.

# Experiment 12: Static Site Generation and Hydration

Status: Implemented

## Purpose

Experiment 12 adds the first static-site-generation path on top of the compiler-first runtime. The goal is to prerender implemented XMLUI routes into static HTML that displays meaningful content before JavaScript loads, then hydrate the same markup with runtime modules containing precompiled expression and event functions.

This experiment must reuse the production build graph and runtime document shape from Experiment 11. It should not create another XMLUI compiler path.

## Compatibility Baseline

Original XMLUI SSG is a public deployment contract. Before implementation, inspect and record a concise `.ai/experiment-12-static-site-generation-hydration-findings.md` note from:

- `/Users/dotneteer/source/xmlui/xmlui/src/nodejs/bin/ssg.ts`;
- `/Users/dotneteer/source/xmlui/xmlui/src/nodejs/bin/index.ts`;
- `/Users/dotneteer/source/xmlui/xmlui/src/nodejs/discoverRoutes`;
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/StandaloneApp.tsx`;
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/rendering/ssgEnv.ts`;
- `/Users/dotneteer/source/xmlui/xmlui/src/components/App/SearchContext.tsx`;
- `/Users/dotneteer/source/xmlui/tools/preview-ssg`;
- `/Users/dotneteer/source/xmlui/integration-tests/test-app`;
- `/Users/dotneteer/source/xmlui/integration-tests/tests`.

Observed original compatibility points to preserve or intentionally defer:

- `xmlui ssg` writes static output to `dist-ssg` by default.
- SSG builds normal production assets first, then prerenders route-specific HTML pages.
- The old build mode uses `INLINE_ALL` semantics for SSG.
- Static routes are discovered from XMLUI pages/content; parameterized routes are deferred to the client.
- `/` writes `index.html`; `/path` writes `path/index.html`.
- The default fallback file is `200.html`, and route/fallback name collisions are diagnosed.
- `preview-ssg <directory> [--port <port>] [--fallback <file>]` serves clean URLs, supports fallback for navigation routes, and returns real 404s for resource files.
- SSG injects prerendered root markup into the built shell.
- SSG injects SSR style content and CSS links so pages are styled before JavaScript loads.
- SSG carries head/title/html/body attributes produced during rendering.
- SSG writes search index data as `__xmlui-search-index.json` and exposes the file through a root data attribute.
- Hydration uses React hydration instead of remounting when prerendered markup is present.

## Current Rewrite Baseline

Already implemented:

- Vite dev compiles `.xmlui` modules through `xmluiPlugin`.
- Production build compiles XMLUI modules before runtime and emits `dist-production`.
- Production build emits `xmlui-manifest.json` with fixtures, sources, components, routes, used built-ins, and assets.
- The runtime can render implemented components, mutate state, run async handlers, route with hash routes, fetch mock data, and apply theme/style changes.
- Production fixtures already cover:
  - user-defined component counters;
  - expression-backed style mutation;
  - routing with global state mutation.

Missing for SSG:

- Node-side React server rendering entry.
- Static output directory and per-route HTML writing.
- Hydration entry that reuses prerendered DOM.
- CSS/head/search-index artifact handling.
- `preview-ssg`-compatible server script in this workspace.
- E2E tests that disable JavaScript or inspect pre-hydration HTML.

## Scope

Implement a first SSG pipeline that:

- builds production assets from the Experiment 11 production build;
- discovers implemented static routes from compiled XMLUI graph metadata;
- prerenders selected production fixtures to static HTML pages;
- writes `dist-ssg/` with production assets, prerendered route files, fallback HTML, search-index stub/data, and an SSG manifest;
- hydrates prerendered markup with the same runtime modules and compiled functions used by production;
- verifies that visible content and styling exist before interaction;
- verifies that hydration preserves state updates and event handlers after JavaScript loads;
- provides a preview server compatible with the old `preview-ssg` clean-URL/fallback/resource-404 behavior for the implemented subset.

The first implementation should target these fixtures:

- `routingState`: prerender `/` and `/summary`, then hydrate and mutate global state.
- `styleMutation`: prerender initial styled content, then hydrate and mutate expression-backed styles.
- `counterComponents`: prerender component instances, then hydrate and mutate component-local state.

Each fixture must include a user-visible data modification path after hydration.

## Non-Goals

This experiment does not complete:

- full `xmlui ssg` CLI compatibility;
- full `discoverRoutes` parity for content directories, generated docs/blog pages, or dynamic route params;
- complete `Head`, metadata, search, and helmet-style behavior;
- extension package loading in SSG;
- code-behind, config, theme-resource, or `Globals.xs` parity;
- streaming SSR;
- partial/island hydration;
- old Remix/server-client snapshot workflow;
- full visual parity for all old docs/website pages.

Those items should be recorded as deferred compatibility work, not silently approximated.

## Artifact Shape

Initial output should be:

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
    chunks/
      *.mjs
    assets/
      *
  summary/
    index.html
```

For multi-fixture experimental output, routes may initially be scoped under fixture paths if needed:

```text
dist-ssg/
  counter-components/index.html
  style-mutation/index.html
  routing-state/index.html
  routing-state/summary/index.html
```

Choose one shape during implementation and document it in this plan before writing tests. Prefer the shape that most closely matches old XMLUI route semantics once the fixture entry model is clear.

`xmlui-ssg-manifest.json` should include:

- schema version;
- source production manifest path/hash;
- route list and generated HTML file paths;
- fallback file name;
- search index file name;
- prerender diagnostics;
- hydration entry asset;
- CSS/style delivery notes;
- deferred compatibility notes.

## Architecture Direction

Split SSG into reusable pieces:

- **Route source**: consume production route metadata and/or compiler graph metadata.
- **Server render module**: use React server rendering with the same runtime document modules.
- **Shell application**: apply prerendered markup to the production `index.html` shell.
- **Hydration runtime**: call a runtime hydration API instead of unconditional client mount.
- **Style capture**: preserve current runtime styling behavior and add enough SSR style support for first paint.
- **Search index extraction**: start with a simple HTML text index, then align with old categories/content behavior later.
- **Preview server**: implement clean path resolution, fallback behavior, and resource 404 behavior.

The implementation should feed discoveries back into:

- production manifest shape;
- route metadata;
- runtime render/hydrate boundary;
- built-in component contracts that need SSR-safe behavior;
- CSS/theming delivery rules.

## Implementation Steps

### Step 1: Original SSG Audit

Create `.ai/experiment-12-static-site-generation-hydration-findings.md`.

Capture:

- old `xmlui ssg` command options and defaults;
- `dist-ssg` output structure;
- route discovery rules;
- fallback file behavior;
- search index behavior;
- CSS/style injection rules;
- hydration behavior;
- `preview-ssg` request resolution and cache headers;
- integration-test expectations.

Verification:

- Findings note separates implemented, approximated, and deferred compatibility.

### Step 2: SSG Contracts and Manifest Types

Add typed contracts for:

- SSG build options;
- discovered static routes;
- route-to-output-file mapping;
- prerender results;
- SSG manifest;
- diagnostics and deferred compatibility notes.

Verification:

- Unit tests validate default options: `outDir = dist-ssg`, `fallbackFile = 200.html`, `searchIndexFile = __xmlui-search-index.json`.
- Unit tests validate route-to-file mapping for `/`, `/summary`, and nested routes.

### Step 3: Route Discovery for the Implemented Subset

Reuse production manifest/compiler metadata to discover static `Page url="..."` routes.

Rules for this experiment:

- include string literal routes such as `/` and `/summary`;
- exclude parameterized routes such as `/items/:id`;
- exclude routes backed by unsupported dynamic expressions;
- detect collisions with fallback file names;
- preserve fixture/source metadata in diagnostics.

Verification:

- Unit tests cover static routes, nested routes, fallback collision, duplicate routes, and skipped dynamic routes.

### Step 4: Hydration-Aware Runtime Entry

Add a runtime API that can:

- render into an empty root for normal production;
- hydrate an already prerendered root for SSG;
- fall back to render when no prerendered marker exists;
- keep event handlers, state initialization, routing, and data mutation semantics identical after hydration.

Verification:

- Unit tests or React test fixtures assert the runtime chooses hydration only when the root has the SSG marker.
- E2E asserts clicking a prerendered button updates the hydrated UI.

### Step 5: Server Render Entry

Add a Node-side SSG render module that can render the implemented runtime document graph to an HTML string for a route.

Initial constraints:

- use `react-dom/server`;
- render deterministic initial state;
- avoid browser-only APIs during server render;
- provide a route location context equivalent to the client router for hash/path matching;
- return markup, title/head placeholders, style metadata, and diagnostics.

Verification:

- Unit tests render `routingState` route `/` and `/summary` to strings containing the expected headings and state text.
- Unit tests render `styleMutation` to markup containing stable component attributes and initial text.

### Step 6: Shell HTML Injection

Apply prerender results to the production shell:

- copy or reuse production `index.html`;
- inject markup into `#root`;
- add an SSG marker attribute to `#root`;
- preserve module scripts and assets;
- preserve the production diagnostic files from Experiment 11;
- add search-index data attributes where needed.

Verification:

- Unit tests assert injected HTML has exactly one `#root`, keeps module script references, and contains no `.xmlui` source references.

### Step 7: CSS and Theme First Paint

Add first-paint styling for the implemented subset.

Initial strategy:

- preserve runtime inline styles and CSS custom properties already rendered as element styles/attributes;
- copy production CSS assets when present;
- record missing CSS extraction or style-registry parity as deferred work.

Verification:

- E2E with JavaScript disabled asserts `styleMutation` prerendered page displays initial text and expected static styles where browser inspection is reliable.
- E2E with JavaScript enabled asserts hydration can still mutate style expressions.

### Step 8: SSG Build Script

Add an experimental command:

- `npm --workspace xmlui run build:ssg`;
- root `npm run build:ssg`;
- output to `xmlui/dist-ssg`;
- internally run or reuse `build:production`;
- write `xmlui-ssg-manifest.json`;
- write `200.html` fallback by default.

Verification:

- Build script passes.
- Output shape test asserts required files exist.
- Build fails on route/fallback collision.

### Step 9: Preview SSG Server

Add a local preview command compatible with the old tool for the implemented subset:

- `npm --workspace xmlui run preview:ssg`;
- root `npm run preview:ssg`;
- serve `dist-ssg`;
- exact file match;
- clean path to `path/index.html`;
- clean path to `path.html`;
- SPA fallback to `200.html` for navigation paths;
- real 404 for resource file extensions;
- no-cache headers for development preview.

Verification:

- Unit tests for request-resolution helper.
- E2E serves `dist-ssg` and checks `/`, `/summary`, a missing navigation route, and a missing resource path.

### Step 10: Search Index Stub and Extraction

Implement the first search-index artifact:

- write `__xmlui-search-index.json`;
- include route path, title from first `H1`, collapsed text content, and a simple category;
- attach the search-index filename to the prerendered root with the old data attribute name: `data-xmlui-ssg-search-index-file`.

Verification:

- Unit tests assert search entries for prerendered routes.
- E2E fetches `__xmlui-search-index.json` and validates route/title/content basics.

### Step 11: SSG Fixtures

Promote representative fixtures:

- routing state fixture with `/` and `/summary`;
- style mutation fixture;
- component counter fixture.

Each fixture must prove:

- prerendered static HTML contains meaningful initial content;
- JavaScript hydration attaches event handlers;
- user-visible data mutation works after hydration.

Verification:

- E2E with JavaScript disabled checks first paint content for every fixture.
- E2E with JavaScript enabled checks hydrated updates for every fixture.

### Step 12: Performance and Hydration Signals

Add non-gating measurement:

- generated HTML byte sizes;
- production asset byte sizes reused by SSG;
- first content availability with JavaScript disabled;
- hydration time until first interactive click succeeds;
- count of `.xmlui` source network requests.

Verification:

- Script emits JSON or Markdown.
- Results are stored in the `.ai` findings note.

### Step 13: Documentation and Closure

Update this plan and `.ai/experiment-12-static-site-generation-hydration-findings.md` with:

- implemented artifact shape;
- command usage;
- old compatibility points preserved;
- intentionally deferred SSG contracts;
- verification results;
- hydration constraints discovered during implementation.

Verification:

- `npm --workspace xmlui run test`;
- `npm --workspace xmlui run build`;
- `npm --workspace xmlui run build:production`;
- `npm --workspace xmlui run build:ssg`;
- `npx playwright test tests/e2e/ssg-hydration.spec.ts`;
- `npm --workspace xmlui run test:e2e` when feasible.

## Success Criteria

Experiment 12 is successful when:

- `dist-ssg` is generated from precompiled XMLUI modules;
- at least one routed fixture writes multiple route HTML files;
- prerendered HTML contains meaningful visible content before JavaScript loads;
- hydration attaches event handlers without replacing the author-facing behavior;
- every SSG fixture includes and verifies a post-hydration data mutation path;
- no `.xmlui` source files are fetched by generated SSG pages;
- `preview:ssg` supports clean URLs, fallback HTML, and resource 404 behavior;
- search-index and SSG manifest artifacts are emitted;
- existing unit, production-build, standalone, and E2E tests still pass.

## Implementation Result

Implemented on June 19, 2026.

Added:

- `xmlui/vite.ssg-render.config.ts`;
- `xmlui/src/ssg/renderEntry.tsx`;
- `xmlui/scripts/build-ssg.mjs`;
- `xmlui/scripts/preview-ssg.mjs`;
- `xmlui/scripts/inspect-ssg.mjs`;
- `npm --workspace xmlui run build:ssg`;
- `npm --workspace xmlui run preview:ssg`;
- `npm --workspace xmlui run inspect:ssg`;
- root `npm run build:ssg`;
- root `npm run preview:ssg`;
- root `npm run inspect:ssg`;
- `xmlui/tests/e2e/ssg-hydration.spec.ts`;
- server-render initial route support in `RuntimeRoutingStore`;
- hydration startup selection in the production entry through SSG root data attributes.

The implemented artifact shape is:

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

- `/` -> `index.html`;
- `/summary` -> `summary/index.html`;
- `/counter-components` -> `counter-components/index.html`;
- `/style-mutation` -> `style-mutation/index.html`.

Command-line checks:

- `npm run build:ssg` builds the generated SSG output.
- `npm run inspect:ssg` prints the generated route-to-file mapping and browser URLs.
- `npm run preview:ssg` rebuilds and serves the generated SSG output on `http://127.0.0.1:8080`.

Verification completed:

- `npm --workspace xmlui run test`: 24 files, 200 tests passed.
- `npm --workspace xmlui run build`: passed, with the existing generic Vite chunk-size warning.
- `npm --workspace xmlui run build:standalone`: passed.
- `npm --workspace xmlui run build:production`: passed.
- `npm --workspace xmlui run build:ssg`: passed.
- `npm --workspace xmlui run inspect:ssg`: passed.
- `npx playwright test tests/e2e/ssg-hydration.spec.ts`: 4 tests passed.
- `npm --workspace xmlui run test:e2e`: 52 tests passed.

## Risks and Open Questions

- The current runtime may assume browser-only APIs in places that server rendering will expose quickly.
- React hydration is stricter than client rendering; markup mismatches may require stable IDs, deterministic initial state, and route-context cleanup.
- Hash routing and path-based SSG routes may need a compatibility decision for this experiment.
- CSS/theming first paint may require a real style registry instead of relying on current runtime styles.
- Data operations need an SSG policy: prerender with mock/static data, skip fetches, or serialize prefetched data.
- Search-index parity can grow large; the first version should be intentionally narrow.
- `preview-ssg` should be recreated carefully because fallback behavior affects real hosting workflows.

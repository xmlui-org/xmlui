# Experiment 11: Production Build and Artifact Shape

Status: Implemented

## Purpose

Experiment 11 turns the compiler-first runtime into a production build pipeline. The goal is to precompile XMLUI application sources during build, emit optimized JavaScript and metadata artifacts, preserve the author-facing behavior already proven in Vite and standalone modes, and begin measuring startup and interaction performance against the rewrite goals.

This experiment must not create a third compiler path. Production build should reuse the same source compiler core used by Vite dev and standalone runtime compilation, while changing when source discovery, validation, code generation, optimization, and artifact emission happen.

## Compatibility Baseline

Original XMLUI production build is a public contract, not just an internal implementation detail. Before implementation, inspect and record a concise `.ai/` note from:

- `/Users/dotneteer/source/xmlui/xmlui/src/nodejs/bin/build.ts`;
- `/Users/dotneteer/source/xmlui/xmlui/src/nodejs/bin/viteConfig.ts`;
- `/Users/dotneteer/source/xmlui/xmlui/src/nodejs/vite-xmlui-plugin`;
- `/Users/dotneteer/source/xmlui/xmlui/package.json`;
- `/Users/dotneteer/source/xmlui/tools/create-app/templates`;
- `/Users/dotneteer/source/xmlui/integration-tests/test-app`;
- `/Users/dotneteer/source/xmlui/integration-tests/tests`.

Observed original compatibility points to preserve or intentionally defer:

- `xmlui build` wraps Vite and supports app-level build options.
- Build modes include at least `CONFIG_ONLY` and `INLINE_ALL`.
- Production output defaults to `dist`.
- Vite output uses stable internal folders such as `internal/`, `internal/chunks/`, and `internal/img/`.
- Options include flat distribution, relative root, mock toggles, hosting metadata files, and config-driven app data.
- `xmlui.config.json`, `config.json`, themes, resources, API interceptor definitions, and generated app metadata participate in build behavior.
- Package publishing rewrites exports to `dist/lib`, `dist/nodejs`, and `dist/standalone` artifacts.
- CSS layer order and CSS chunk behavior are compatibility-sensitive.

## Current Rewrite Baseline

Already implemented:

- `.xmlui` files compile in Vite dev/build through `xmluiPlugin`.
- `compileXmluiSource` provides a browser-safe source compiler core.
- `compileXmluiModule` emits Vite modules with structural runtime documents and compiled expression/event functions.
- Standalone mode fetches source files and compiles them in the browser.
- `build:standalone` emits `dist/standalone/xmlui-latest.js`.
- Existing `npm --workspace xmlui run build` is a generic Vite app build, not yet a compatibility-shaped XMLUI production build.

## Scope

Implement a first production build pipeline that:

- discovers an XMLUI app graph at build time;
- precompiles XMLUI sources to runtime modules;
- validates component references and contracts before Vite emits assets;
- emits a production app bundle that no longer fetches XMLUI source files at startup;
- emits a manifest describing the compiled XMLUI sources, components, routes, and used built-ins;
- preserves the old static hosting shape where practical;
- adds tests that compare production output behavior with Vite dev and standalone samples.

The build should initially target the implemented feature set:

- expressions and event handlers;
- async handler execution;
- reactive variables and derived variables;
- user-defined components;
- built-ins through Experiment 9;
- data operations and managed fetching;
- hash routing;
- theme variables and dynamic style updates;
- standalone-compatible app samples promoted into production fixtures.

## Non-Goals

This experiment does not complete:

- full package publishing with all old `clean-package` export rewrites;
- full CLI replacement;
- SSG and hydration;
- complete `xmlui.config.json` semantics;
- full code-behind support;
- extension package production builds;
- full CSS extraction and visual-test parity;
- all old hosting metadata modes.

Those should be represented as extension points and deferred compatibility items.

## Build Modes

Add explicit experimental production build modes:

- **precompiled app mode**: source graph is compiled during build and emitted as JavaScript runtime data/functions;
- **config-only compatibility mode**: reserved for old `CONFIG_ONLY` behavior, initially documented/deferred;
- **inline-all compatibility mode**: reserved for old `INLINE_ALL` behavior, initially approximated by fully bundled runtime modules.

The first implementation can expose one command, but the architecture should not block old mode names.

## Artifact Shape

Initial output under `xmlui/dist-production/` or a clearly named experimental directory should include:

```text
dist-production/
  index.html
  internal/
    index.[hash].js
    chunks/
      *.js
    assets/
      *
  xmlui-manifest.json
```

The manifest should include:

- build schema version;
- entry source path;
- source IDs and content hashes;
- component names and source paths;
- referenced component graph;
- used built-in components;
- route patterns discovered from `Pages`/`Page` for the implemented subset;
- emitted JS/CSS asset filenames when available;
- diagnostics summary;
- feature flags/deferred compatibility notes.

Generated XMLUI source files should not be copied into production output unless a compatibility mode explicitly requires them.

## Architecture Direction

Split production build into small reusable pieces:

- **App graph discovery**: Node-side source discovery starting from `Main.xmlui`.
- **Compiler graph**: compile all XMLUI sources with known component references and contract validation.
- **Runtime module emission**: emit precompiled runtime document modules with generated expression/event functions.
- **Manifest emission**: serialize compiler metadata and artifact references.
- **Vite integration**: let Vite optimize emitted modules, React runtime, CSS, and static assets.
- **Artifact validation**: inspect output shape and compare runtime behavior in browser tests.

Vite dev, standalone, and production should share:

- parser;
- compiler IR;
- expression/event function generation;
- runtime document shape;
- contract validation;
- component reference discovery semantics where applicable.

## Implementation Steps

### Step 1: Original Build Audit

Create `.ai/experiment-11-production-build-artifact-shape-findings.md`.

Capture:

- old commands and options;
- generated directories and filenames;
- `CONFIG_ONLY` and `INLINE_ALL` behavior;
- package export shape;
- CSS output rules;
- hosting metadata behavior;
- integration-test expectations.

Verification:

- Findings note links inspected source files and separates implemented vs deferred contracts.

### Step 2: Production Build Contract Module

Add typed production-build contracts:

- build options;
- artifact manifest shape;
- source graph shape;
- build diagnostics;
- build result summary.

Verification:

- Unit tests validate manifest schema basics and stable defaults.

### Step 3: Node Source Graph Discovery

Extract a Node-side app graph discovery helper from the standalone sibling-component convention:

- start at `Main.xmlui`;
- discover uppercase user components;
- load `${ComponentName}.xmlui` transitively;
- detect duplicate component definitions;
- detect missing component files;
- preserve source IDs and filesystem paths.

Verification:

- Unit tests cover direct, repeated, transitive, missing, and duplicate components.

### Step 4: Compiler Graph

Compile the complete discovered source graph with a final known-component set.

Verification:

- Unit tests assert unknown component references fail before Vite output.
- Unit tests assert compiled app and component runtime documents match Vite module behavior for representative samples.

### Step 5: Manifest Generation

Generate `xmlui-manifest.json` from compiler graph metadata.

Verification:

- Unit tests snapshot or structurally assert source IDs, hashes, component names, used built-ins, route patterns, and diagnostics.

### Step 6: Production Entry Module

Add a generated or static production entry that imports precompiled XMLUI modules and calls the existing runtime mount path.

Verification:

- Build a production fixture and confirm browser startup does not fetch `.xmlui` files.
- E2E verifies visible content and mutations.

### Step 7: Vite Production Config

Add an experimental production build config/script, for example:

- `npm --workspace xmlui run build:production`;
- output to `dist-production`;
- preserve old-style `internal/` naming where practical;
- inject/copy manifest.

Verification:

- Build script passes.
- Output shape test asserts required files exist.

### Step 8: CSS and Theme Artifact Handling

Define the first CSS delivery rules:

- preserve current runtime styling behavior;
- ensure theme variables and layout styles work in production;
- record what remains for extracted CSS/SSG.

Verification:

- E2E checks style mutation and theme variable samples in production output.

### Step 9: Route Discovery Metadata

Extract implemented route patterns from `Pages`/`Page` into the manifest.

Verification:

- Unit tests cover static routes and parameter routes.
- Production E2E covers hash routing with state.

### Step 10: Performance Harness

Add a small measurement harness for production builds:

- startup time until first XMLUI render marker;
- expression evaluation count/timing for counter and style mutation samples;
- event handler execution timing for repeated clicks;
- bundle size summary.

Verification:

- Script emits JSON or Markdown summary.
- Results are not treated as pass/fail yet except for successful collection.

### Step 11: Production Fixtures

Promote a few existing examples to production fixtures:

- component counter;
- style mutation;
- routing state;
- one data operation fixture if API mocking can be made production-compatible.

Every fixture must include at least one data mutation path.

Verification:

- E2E tests run against built production output.
- Tests assert no `.xmlui` network requests occur after page load.

### Step 12: Documentation and Closure

Update this plan and the `.ai/` findings note with:

- implemented artifact shape;
- command usage;
- deferred compatibility contracts;
- verification results;
- performance observations.

Verification:

- `npm --workspace xmlui run test`;
- `npm --workspace xmlui run build`;
- `npm --workspace xmlui run build:standalone`;
- `npm --workspace xmlui run build:production`;
- `npm run test:e2e`.

## Success Criteria

Experiment 11 is successful when:

- production build compiles XMLUI sources before runtime;
- built apps run without fetching `.xmlui` source files;
- output artifact shape is stable and tested;
- manifest captures source graph, component graph, route metadata, and diagnostics;
- representative production fixtures support data mutation and match Vite/standalone behavior;
- startup and interaction measurements can be collected;
- existing unit, build, standalone, and E2E tests still pass.

## Implementation Result

Implemented on June 19, 2026.

Added:

- `xmlui/vite.production.config.ts` for the experimental production build.
- `npm --workspace xmlui run build:production`.
- Root `npm run build:production` forwarding to the XMLUI workspace.
- `xmlui/production-index.html` and `xmlui/src/production/main.tsx`.
- `xmlui/src/production/manifest.ts` for source graph discovery, compiler validation, content hashes, component metadata, route metadata, used built-ins, emitted assets, diagnostics, and deferred compatibility notes.
- `xmlui/scripts/measure-production.mjs` for non-gating bundle/startup/interaction measurements.
- `xmlui/tests/compiler/production.test.ts`.
- `xmlui/tests/e2e/production-build.spec.ts`.

The implemented artifact shape is:

```text
dist-production/
  index.html
  internal/
    production-index.[hash].mjs
  mockApi.js
  xmlui-manifest.json
```

The production app imports compiled `.xmlui` modules through the existing Vite XMLUI plugin. It does not fetch `.xmlui` source files at runtime.

`mockApi.js` is emitted as a no-op ES module compatibility stub so stale dev/mock-loader requests do not fail with a module MIME error when the folder is served directly with `npx http-server`.

Production fixtures:

- `counterComponents`: user-defined component composition and local data mutation.
- `styleMutation`: expression-backed style mutation.
- `routingState`: hash routing with global state mutation preserved across pages.

Deferred compatibility is explicitly recorded in `.ai/experiment-11-production-build-artifact-shape-findings.md` and in the manifest.

Verification completed:

- `npm --workspace xmlui run test`: 24 files, 199 tests passed.
- `npm --workspace xmlui run build`: passed, with the existing generic Vite chunk-size warning.
- `npm --workspace xmlui run build:standalone`: passed.
- `npm --workspace xmlui run build:production`: passed.
- `npx playwright test tests/e2e/production-build.spec.ts`: 5 tests passed.
- `npm --workspace xmlui run measure:production`: passed outside the sandbox; sample collection succeeded.
- `npm --workspace xmlui run test:e2e`: 46 tests passed outside the sandbox.

## Risks and Open Questions

- The old build has many compatibility switches; the first rewrite build must avoid pretending to support all of them.
- Output naming may become a public contract quickly, so experimental directories should be clearly named until compatibility is confirmed.
- Generated functions rely on `Function`-style code generation in standalone; production modules should prefer statically emitted functions to preserve CSP options later.
- Route discovery and SSG needs may feed back into the manifest shape.
- CSS extraction could conflict with runtime theme scoping unless the manifest records enough styling metadata.
- Performance comparisons need stable baselines from old XMLUI and a small React equivalent before conclusions are meaningful.

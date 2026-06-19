# Experiment 10: Standalone Runtime Compilation

Status: Implemented for the initial standalone runtime compilation slice

## Purpose

Experiment 10 adds the first buildless XMLUI execution model to the rewrite. A static `index.html` should load a standalone XMLUI framework bundle, fetch `Main.xmlui` and related component files from the hosted app folder, compile them in the browser, and run the app without Vite or a production build.

The implementation must reuse the same parser, compiler IR, expression/event compilation, runtime document shape, and React runtime used by Vite mode. Standalone mode may have a different source discovery and module-linking layer, but it must not become a second compiler.

The public startup pattern must match the original XMLUI standalone model: users load the standalone engine with a plain script tag, the engine starts automatically on `DOMContentLoaded`, and `Main.xmlui` is discovered by convention. A manual render API can exist for tests and tooling, but it must not replace the canonical no-code HTML startup path.

## Compatibility Baseline

The original XMLUI framework treats standalone/buildless apps as a public execution model. Compatibility targets:

- a static app folder can be served by any ordinary static host;
- `index.html` loads the XMLUI runtime bundle with a plain script tag;
- no user-authored JavaScript is required for the common full-app startup path;
- the runtime starts automatically from a `DOMContentLoaded` listener;
- the runtime first checks for `[data-xmlui-src]` island targets and otherwise starts the full app;
- the full-app startup looks for `#root`, creates it if missing, hydrates if it already contains HTML, and otherwise creates a React root;
- the runtime finds and loads `Main.xmlui`;
- user-defined component files are discovered and loaded without a bundler;
- extension/runtime scripts can be loaded after the XMLUI engine as ordinary script tags;
- author-facing XMLUI behavior matches Vite mode for the implemented component and scripting subset;
- browser diagnostics are understandable when fetch, parse, compile, or runtime startup fails.

Observed original syntax:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>XMLUI App</title>
  <script src="xmlui/xmlui-latest.js"></script>
  <script src="xmlui/xmlui-extension.js"></script>
</head>
<body>
</body>
</html>
```

The extension script is optional and represents the old extension loading model: extension UMD bundles register with the standalone extension manager after the engine is loaded.

Reference areas in the original project to inspect before implementation:

- `/Users/dotneteer/source/xmlui/xmlui/src/index-standalone.ts` for UMD startup and `DOMContentLoaded` behavior;
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/StandaloneApp.tsx` for `startApp`, source loading, config, code-behind, and `#root` behavior;
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/Islands/activateIslands.tsx` for `[data-xmlui-src]` island startup;
- `/Users/dotneteer/source/xmlui/tools/create-xmlui-hello-world/index.js` for generated no-build HTML syntax;
- `/Users/dotneteer/source/xmlui/integration-tests` for standalone fixtures and smoke tests;
- `/Users/dotneteer/source/xmlui/website/content/docs` for user-facing standalone setup documentation.

Current rewrite baseline:

- Vite mode compiles `.xmlui` files through `xmlui/src/vite-plugin/xmluiPlugin.ts`.
- `compileXmluiModule` currently mixes source compilation with Node filesystem sibling-component discovery.
- Runtime startup already accepts an `XmluiModule` through `renderXmluiApp`.
- Runtime modules currently contain structural XMLUI data plus compiled expression/event functions.

## Scope

Implement the smallest standalone path that can run the existing experimental samples from a static folder:

- a browser-safe compilation entry that compiles one XMLUI source string into runtime document data;
- a standalone source loader that fetches `Main.xmlui`;
- component-file discovery for the initial subset;
- browser-side linking of app and component modules;
- a standalone auto-start entry point that listens for `DOMContentLoaded`;
- a `startApp`-equivalent internal API that follows the original `#root` lookup/create/hydrate/create-root behavior;
- a standalone bundle build script;
- a static sample app folder that runs without Vite transforms;
- unit and E2E tests proving parity with Vite mode for representative examples.

This experiment should initially support the already implemented runtime feature set:

- expressions and event handlers;
- async handler semantics;
- reactive variables and derived variables;
- user-defined components;
- built-ins added through Experiment 9;
- data operations with the existing mockable example path where possible;
- routing in hash mode;
- theme variables and dynamic style updates.

## Non-Goals

This experiment does not complete:

- production precompilation or optimized artifact shape;
- SSG or hydration;
- full old app configuration support;
- full extension package compatibility;
- full code-behind loading;
- full island rendering;
- HMR;
- source maps good enough for browser debugging;
- all old standalone diagnostics and overlay behavior.

Those should be kept as explicit extension points rather than implemented opportunistically.

## Design Direction

Split standalone into three layers:

1. **Browser-safe compiler core**
   - Parses a source string.
   - Builds compiler IR.
   - Validates contracts.
   - Emits runtime document data and compiled expression/event functions.
   - Does not use Node filesystem APIs.

2. **Standalone source graph loader**
   - Fetches `Main.xmlui`.
   - Discovers component dependencies.
   - Fetches component files.
   - Tracks source URLs, cache keys, diagnostics, and fetch failures.

3. **Standalone runtime bootstrap**
   - Links app and component runtime documents into an `XmluiModule`.
   - Registers a `DOMContentLoaded` listener.
   - Checks for `[data-xmlui-src]` island targets before full-app startup.
   - Mounts the app with the existing React runtime.
   - Looks for `#root`, creates it if missing, hydrates if non-empty, and otherwise creates a React root.
   - Reports startup errors into the DOM and console.

Vite mode should eventually call the same source-to-runtime-document compiler core. Vite may keep Node-specific file discovery, imports, and source maps, but parsing, validation, and runtime document generation should be shared.

## Original Standalone Loading Semantics

The first implementation should preserve the original semantic order even while deferring some resources:

1. Load the standalone bundle through a script tag.
2. On `DOMContentLoaded`, inspect `document.querySelectorAll("[data-xmlui-src]")`.
3. If island targets exist, acknowledge the island path and report a deferred diagnostic for now.
4. Otherwise start the full app.
5. Find `#root`; if absent, create `<div id="root">` under `document.body`.
6. Fetch `Main.xmlui` from the document-root app folder by default.
7. Optionally attempt `config.json` and `Globals.xs` later; in this first slice, design the loader so those probes can be added without changing public startup.
8. Discover, fetch, compile, and link component files.
9. Render through the existing runtime.

The old runtime also supports precompiled `runtime` objects, config-only mode, configured theme files, API interceptor definitions, `Main.xmlui.xs`, component code-behind files, and source tracking. These are compatibility targets but not required in the first standalone slice.

## Component Discovery Strategy

The first slice should support predictable sibling-component discovery:

- Start from `Main.xmlui`.
- Compile/inspect the app source and collect uppercase user-defined component references that are not built-ins.
- Fetch `${ComponentName}.xmlui` from the same directory as `Main.xmlui`.
- Compile each fetched component.
- Repeat transitively for component references found inside component files.
- Detect cycles and duplicate component names.

This mirrors the current experimental Vite convention and is enough for the existing samples. It is intentionally narrower than the old standalone runtime, which can also load configured component paths from `config.json` and later discover missing app components. A later experiment can extend discovery to config files, folders, packages, namespaces, code-behind files, and extension registrations.

## Standalone Public API

The canonical user-facing startup syntax is script-tag based and automatic:

```html
<script src="xmlui/xmlui-latest.js"></script>
```

The standalone bundle should expose a global compatible with the old UMD bundle shape as much as the current rewrite allows. The old extension ecosystem expects an engine-level standalone extension manager; extension UMD bundles are loaded after the engine and register themselves with that manager. In the first slice, preserve the global namespace and registration hook shape even if extension rendering is deferred.

Add small explicit APIs under `xmlui/src/standalone` for tests, integration fixtures, and future tooling:

- `loadStandaloneXmluiApp(options)`:
  - `entry?: string`, default `"Main.xmlui"`;
  - `baseUrl?: string | URL`, default current document URL;
  - `fetch?: typeof window.fetch`, useful for tests;
  - `diagnostics?: "throw" | "render" | "console"` or a callback.
- `renderStandaloneXmluiApp(options)`:
  - includes the loader options;
  - `container: HTMLElement`;
  - returns a startup result with loaded sources, diagnostics, and module metadata.
- `startApp(runtime?, extensions?, extensionManager?)`:
  - follows the original public function shape where practical;
  - registers extensions with the standalone manager;
  - uses `#root` lookup/create/hydrate/create-root behavior.

These APIs are secondary to the automatic `DOMContentLoaded` startup path. They should be stable enough for tests but should not force app authors to write startup JavaScript.

## Static Folder Shape

Add an experimental standalone fixture, for example:

```text
xmlui/standalone-samples/counter/
  index.html
  Main.xmlui
  IncrementButton.xmlui
  xmlui/
    xmlui-latest.js
```

The fixture `index.html` should use the original no-code shape:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Standalone XMLUI Experiment</title>
  <script src="xmlui/xmlui-latest.js"></script>
</head>
<body>
</body>
</html>
```

The folder should be servable as static files. A second fixture may include an explicit `<div id="root"></div>` to verify that the engine uses an existing root, and a third fixture may omit `#root` to verify auto-creation.

The fixture must include at least one data modification path, such as a counter button or style mutation toggle, to satisfy the experiment rule that new experiments touch state mutation.

## Implementation Steps

### Step 1: Original Standalone Audit

Inspect the old standalone runtime behavior and record a concise `.ai/` note.

Capture:

- generated app folder shape;
- canonical script-tag HTML syntax;
- automatic `DOMContentLoaded` startup behavior;
- `#root` lookup, auto-creation, hydration, and create-root behavior;
- `[data-xmlui-src]` island detection behavior;
- how `Main.xmlui` is located;
- component discovery/loading behavior;
- extension script loading behavior;
- startup error behavior;
- any standalone-specific user-facing options.

Verification:

- `.ai/experiment-10-standalone-runtime-compilation-findings.md` links the inspected files/docs and records implemented vs deferred compatibility behavior.

### Step 2: Split Browser-Safe Compiler Core

Create a compiler entry that accepts `{ id, source, knownComponents? }` and returns a runtime document object without Node filesystem discovery or ESM import generation.

Keep the existing Vite `compileXmluiModule` working by refactoring it to use this core plus its current Node sibling discovery/import emitter.

Verification:

- Unit tests prove Vite compilation output is unchanged for representative apps.
- Unit tests prove the browser-safe entry compiles app and component sources without touching filesystem APIs.

### Step 3: Runtime Document Linking

Add a linker that creates an `XmluiModule` from one compiled app document plus compiled component documents.

Verification:

- Unit tests compile `Main.xmlui` plus `IncrementButton.xmlui`, link them, and assert component registration matches Vite behavior.

### Step 4: Component Reference Discovery

Expose or add a reusable helper that collects user-defined component references from parsed/IR/runtime documents.

Verification:

- Unit tests cover direct, repeated, nested, transitive, and unknown component references.
- Built-ins such as `Theme`, `Button`, `Pages`, and `NavLink` must not be fetched as components.

### Step 5: Standalone Source Loader

Implement a browser-safe loader that fetches XMLUI source files, resolves URLs relative to the entry file, and prevents duplicate fetches.

Verification:

- Unit tests use an injected fake `fetch`.
- Tests cover missing `Main.xmlui`, missing component files, non-OK HTTP responses, duplicate component references, and transitive component references.

### Step 6: Standalone Compile Graph

Combine the loader and compiler core into a graph compiler:

- fetch entry;
- discover references;
- fetch missing components;
- compile components;
- link module;
- return diagnostics and source metadata.

Verification:

- Unit tests compile a small app graph entirely through fake fetch.
- Unknown or missing components produce actionable diagnostics.

### Step 7: Standalone Auto-Start Bootstrap

Add a standalone entry module that mirrors the old `index-standalone.ts` behavior:

- expose React/runtime globals only if needed by the current extension model;
- create or expose a standalone extension manager;
- register a `DOMContentLoaded` listener;
- detect `[data-xmlui-src]` island targets first;
- call `startApp(undefined, undefined, extensionManager)` for the normal full-app path;
- support explicit `startApp` and `renderStandaloneXmluiApp` APIs for tests without making them required in app HTML.

Verification:

- Unit tests cover option defaults, `#root` handling, and error handling where possible.
- Browser tests confirm script loading alone starts the app.
- Browser tests confirm a missing `#root` is created automatically.
- Browser tests confirm the explicit API exists after loading the standalone bundle.

### Step 8: Standalone Bundle Build

Add a package script that builds the standalone bundle, for example `npm --workspace xmlui run build:standalone`.

The bundle should include:

- parser/compiler core needed in the browser;
- runtime renderer;
- built-in components;
- standalone auto-start bootstrap;
- extension-manager registration hook compatible with the old script loading model, even if extension behavior is initially minimal.

Verification:

- Build script passes.
- Bundle is emitted to a stable experimental path such as `xmlui/dist/standalone/xmlui.js`.
- Generated files are not committed unless a plan explicitly says otherwise.

### Step 9: Static Standalone Sample

Add an experimental static sample that uses the standalone bundle and XMLUI source files.

The first sample should include:

- an `index.html` that only loads `xmlui/xmlui-latest.js`;
- `Main.xmlui`;
- at least one user-defined component file;
- an event handler that mutates state and updates visible output;
- one styling or theming feature from Experiment 9 if practical.

Verification:

- Manual run instructions are documented.
- E2E starts a static server for the sample and verifies automatic startup, rendered output, and mutation.
- E2E includes a fixture with no `#root` to prove auto-creation.

### Step 10: Parity Fixtures

Run a small parity matrix between Vite examples and standalone equivalents.

Initial parity targets:

- local counter;
- user-defined component counter;
- style mutation;
- hash routing with state if feasible.

Verification:

- E2E tests pass for at least two standalone fixtures, including one user-defined component case and one mutation case.

### Step 11: Diagnostics and Error UI

Add a minimal standalone error reporter.

It should show:

- failed URL;
- HTTP status or fetch error;
- parse/compile diagnostic message;
- component name for missing component files where known.

Verification:

- Unit tests cover diagnostic formatting.
- E2E covers a missing component or missing entry file fixture.

### Step 12: Documentation and Closure

Update the plan and `.ai/` note with what was implemented and deferred.

Verification:

- `npm --workspace xmlui run test` passes.
- `npm --workspace xmlui run build` passes.
- standalone build script passes.
- `npm run test:e2e` passes with the new standalone tests.

## Success Criteria

Experiment 10 is successful when:

- a no-build static folder can load the standalone XMLUI bundle with `<script src="xmlui/xmlui-latest.js"></script>`, fetch `Main.xmlui`, fetch component files, compile them in the browser, and mount the app without user-authored startup JavaScript;
- startup happens automatically on `DOMContentLoaded`;
- `#root` is used when present and created when absent;
- standalone and Vite mode share the same compiler core and runtime document shape;
- at least one standalone app with user-defined components and state mutation works in the browser;
- missing source files and compile errors produce useful diagnostics;
- all existing tests continue to pass;
- the implementation leaves clear extension points for config, extension scripts, code-behind files, production builds, and SSG.

## Implementation Result

Implemented:

- browser-safe XMLUI source compiler entry shared by Vite and standalone;
- direct runtime document materialization with generated expression and event functions;
- standalone source graph loader that fetches `Main.xmlui`, discovers sibling component references, fetches transitive component files, recompiles with a known component set, and links an `XmluiModule`;
- standalone bootstrap that exposes a script-global `window.xmlui`, installs automatic `DOMContentLoaded` startup, checks `[data-xmlui-src]` before full-app startup, creates `#root` when missing, and renders through the existing runtime;
- minimal standalone extension manager registration hook;
- standalone IIFE build script emitting `dist/standalone/xmlui-latest.js`;
- static standalone samples for component counters, style mutation, and hash routing state;
- plain static server and sample preparation scripts for E2E verification;
- unit tests for standalone graph loading and missing component diagnostics;
- E2E tests for script-only startup, auto-created `#root`, user-defined components, data mutation, expression-backed style updates, and hash routing.

Deferred:

- real island rendering;
- `config.json`, `Globals.xs`, themes from config, API interceptor, and code-behind loading;
- full extension component registration/rendering;
- source maps and production artifact optimization;
- SSG/hydration parity beyond the `#root` hydration hook.

Verification:

- `npm --workspace xmlui run test` passed with 23 files and 195 tests.
- `npm --workspace xmlui run build` passed; Vite still reports the existing large chunk warning.
- `npm --workspace xmlui run build:standalone` passed and emitted `dist/standalone/xmlui-latest.js`.
- `npm run test:e2e` passed with 42 tests.

## Risks and Open Questions

- Browser-side compiler bundle size may grow quickly as parser/compiler features expand.
- Current generated expression/event functions may rely on code-generation patterns that need review for CSP-sensitive standalone hosting.
- Component discovery by filename is enough for current samples but not enough for the full old app model.
- Extension script compatibility may require load ordering and global registration semantics that should be copied from observed old behavior.
- Standalone source maps and browser-debuggable XMLUI source locations are deferred but should not be blocked by this design.
- Static hosts differ in MIME types and path handling; tests should use conservative URL resolution.

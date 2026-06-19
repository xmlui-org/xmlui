# Experiment 14: Extension Packages and Public API Compatibility

Status: Implemented

## Purpose

Experiment 14 proves that the rewrite can host XMLUI extension packages without
forcing external authors to learn a new public API. The first target is not full
first-party package parity; it is a small but real compatibility layer that can
load extension components, functions, themes, metadata, and package build
artifacts in both Vite dev mode and standalone/production-like modes.

This experiment follows Experiment 13: metadata must remain compiler-owned and
shared by runtime, tooling, docs, and package builds.

## Compatibility Baseline

Original XMLUI extension behavior to preserve:

- Extension packages commonly default-export an object shaped like:

  ```ts
  export default {
    namespace: "XMLUIExtensions",
    components: [componentRenderer],
    themes: [themeDefinition],
    functions: { helperName },
    themeNamespacePrefix: "PackagePrefix",
  };
  ```

- `xmlui/src/abstractions/ExtensionDefs.ts` defines `Extension` with optional
  `namespace`, `components`, `themes`, `functions`, and
  `themeNamespacePrefix`.
- `StandaloneExtensionManager` stores registered extensions, invokes
  subscribers for existing and future registrations, and accepts either one
  extension or an extension array.
- Public package imports from `xmlui` include renderer helpers, wrapper helpers,
  component/theme types, selected built-in React components, hooks, metadata
  helpers, `StandaloneExtensionManager`, `startApp`, and standalone app types.
- First-party packages use scripts such as:

  ```text
  xmlui build-lib
  xmlui build-lib --mode=metadata
  ```

- Package `clean-package` publish rewrites expose built artifacts like:

  ```json
  {
    ".": {
      "import": "./dist/xmlui-search.mjs",
      "require": "./dist/xmlui-search.js"
    },
    "./*.css": {
      "import": "./dist/*.css"
    }
  }
  ```

- Extension metadata participates in editor completions, hover, diagnostics,
  docs/reference generation, and package build validation.
- Namespaced markup must resolve extension components without breaking existing
  core component lookup.
- Extension functions are added to app/global function scope.
- Extension themes and theme namespace prefixes affect CSS variable names and
  validation.

Inspected original references:

- `/Users/dotneteer/source/xmlui/xmlui/src/abstractions/ExtensionDefs.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/abstractions/ComponentDefs.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/index.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/StandaloneExtensionManager.ts`
- `/Users/dotneteer/source/xmlui/packages/xmlui-gauge/src/index.tsx`
- `/Users/dotneteer/source/xmlui/packages/xmlui-gauge/package.json`
- `/Users/dotneteer/source/xmlui/packages/xmlui-search/src/index.tsx`
- `/Users/dotneteer/source/xmlui/packages/xmlui-search/package.json`

## Current Rewrite Baseline

Already implemented:

- monorepo workspace layout with `xmlui` and `tools/vscode`;
- parser/compiler/codegen/runtime for current XMLUI subset;
- user-defined components;
- built-in component contracts and metadata generation;
- Vite dev mode, standalone runtime compilation, production build, SSG;
- metadata artifact generation and docs-reference output;
- VS Code diagnostics/completions/hover powered by shared metadata;
- theming and layout props for the current built-in subset.

Gaps:

- no `packages/*` workspace for extension packages in the rewrite;
- no public `xmlui` compatibility export surface for extension authors;
- no `Extension` type or extension registry in the new runtime;
- no extension component contract ingestion by parser/compiler/runtime;
- no namespace resolution for extension components;
- no extension functions in expression/event scope;
- no extension themes or `themeNamespacePrefix` validation;
- no package build command equivalent to `xmlui build-lib`;
- no metadata build mode for extension packages;
- no migrated first-party extension package fixture.

## Scope

Implement the first extension compatibility slice:

- define a rewrite-side public extension API compatible with the original shape;
- support runtime registration of extension packages in Vite, production, SSG,
  and standalone entry points;
- add namespace-aware component lookup for extension components;
- allow extension components to render in the current runtime;
- include extension component metadata in generated metadata artifacts,
  completions, hover, diagnostics, docs-reference output, and manifests;
- expose extension functions to expressions and event handlers;
- support minimal extension theme registration and theme namespace prefix
  validation;
- create a first-party extension package fixture and port one small extension;
- add tests covering display and data modification through extension APIs.

The first migrated package should be intentionally small. Prefer a new
compatibility fixture package or a minimal port inspired by `xmlui-gauge` or
`xmlui-search` before attempting a dependency-heavy package.

## Non-Goals

This experiment does not complete:

- all original `xmlui` named exports;
- full React renderer compatibility for arbitrary old extension internals;
- all first-party extension packages;
- npm publishing automation;
- complete `clean-package` behavior;
- all old CSS bundling edge cases;
- full extension package documentation website generation;
- extension package hot module replacement parity;
- package registry/download support.

Those are compatibility targets after this slice proves the architecture.

## Architecture Direction

Add three layers:

1. **Public Compatibility API**
   - Export stable `Extension`, `ComponentExtension`, component renderer,
     metadata, theme, and registration types from the rewrite package.
   - Add compatibility helpers only when a fixture proves they are required.
   - Keep unsupported old exports visible in the plan as deferred shims rather
     than silently changing package authoring patterns.

2. **Extension Registry and Compiler Integration**
   - Register extensions into one runtime/compiler registry.
   - Normalize components into the current contract/metadata shape.
   - Normalize themes/functions into runtime startup configuration.
   - Resolve component names through core names, user-defined components,
     extension names, and namespace-qualified aliases.

3. **Package Tooling**
   - Add `packages/*` workspace support.
   - Provide a minimal `build-lib` command or package script equivalent.
   - Generate extension metadata artifacts that can be merged into app metadata.
   - Verify package artifacts with tests before attempting broader ports.

## Extension Component Model

For the first slice, support two component implementation forms:

- **Native rewrite component renderer**: a component function compatible with
  the current runtime render contract.
- **Compatibility renderer wrapper**: a small adapter for old-style renderer
  definitions where practical.

The plan should not pretend that arbitrary old React extension components work
until the required old runtime hooks and wrappers are present. Instead, build a
compatibility fixture that names each required old API explicitly.

## Data Modification Requirement

This experiment must include extension-driven state modification. Add at least
one extension sample where:

- an extension component renders state from XMLUI variables or props;
- the extension component raises an event or invokes a registered API;
- the XMLUI event handler mutates local/global state;
- the rendered result changes after the interaction.

Example target:

```xml
<App var.count="{0}">
  <CounterBadge value="{count}" onIncrement="count++" />
</App>
```

The component may be loaded from an extension package and can be namespaced when
that syntax is implemented.

## Implementation Steps

### Step 1: Original API Inventory and Findings

Create `.ai/experiment-14-extension-packages-public-api-compatibility-findings.md`.

Record:

- original `Extension` and component renderer types;
- public exports used by first-party packages;
- package script and artifact conventions;
- standalone registration behavior;
- namespace and theme prefix behavior;
- extension metadata build behavior;
- which old APIs are implemented now, shimmed, or deferred.

Verification:

- Findings note cites inspected original files and representative packages.

### Step 2: Workspace and Package Skeleton

Add monorepo support for extension packages:

- create `packages/`;
- add a tiny first-party fixture package, for example
  `packages/xmlui-counter-badge`;
- add package scripts for build, test, and metadata generation;
- keep generated package outputs ignored.

Verification:

- root workspace commands see the package;
- package build/test scripts can run independently.

### Step 3: Public Extension API Types

Add exported extension-facing types in `xmlui/src`:

- `Extension`;
- `ComponentExtension`;
- component renderer compatibility type;
- theme definition subset;
- extension metadata type;
- extension registration/startup options.

Update `xmlui/src/index.ts` or the current package entry to export the supported
subset.

Verification:

- Type tests compile a fixture extension importing from `xmlui`;
- tests assert unsupported old exports are not accidentally required by the
  first migrated fixture.

### Step 4: Extension Registry

Implement a runtime/compiler extension registry:

- register one extension or an array;
- preserve subscription behavior compatible with `StandaloneExtensionManager`;
- expose registered components/functions/themes to app startup;
- support idempotence or document duplicate behavior according to old behavior;
- preserve registration order when resolving names.

Verification:

- unit tests cover subscription replay, multiple registrations, arrays, and
  duplicate-name diagnostics.

### Step 5: Component Contract Normalization

Normalize extension component declarations into the existing compiler contract
registry:

- component name;
- props;
- events;
- APIs;
- templates/context variables where supported;
- arbitrary prop support;
- source/package metadata.

Verification:

- compiler diagnostics accept known extension props/events;
- compiler diagnostics reject unknown extension props/events;
- metadata artifact includes extension components.

### Step 6: Namespace Resolution

Implement namespace-aware component resolution for the subset needed by old
packages:

- unqualified extension components when registered globally;
- namespace-qualified syntax when declared in XMLUI markup;
- collision diagnostics for ambiguous names;
- behavior when extension namespace is missing.

Potential syntax to preserve from the old model:

```xml
<App xmlns:ext="XMLUIExtensions">
  <ext:CounterBadge />
</App>
```

Verification:

- parser/compiler tests cover namespaced and unqualified extension components;
- E2E fixture renders both forms when supported.

### Step 7: Runtime Rendering Adapter

Render extension components in the current runtime:

- pass resolved props and event handlers;
- pass children/default slot where supported;
- expose component APIs if the current runtime supports refs/APIs;
- preserve update scheduling and async event handler behavior.

Verification:

- E2E test renders extension component output;
- clicking extension UI triggers XMLUI event mutation and updates rendered text;
- repeated updates do not break local/global state isolation.

### Step 8: Extension Functions

Register extension `functions` into expression/event scope:

- functions are available without imports after extension registration;
- async functions can be awaited or auto-awaited according to existing handler
  semantics;
- diagnostics identify unknown extension functions.

Verification:

- unit tests compile expressions/events using extension functions;
- E2E sample mutates data using a function result.

### Step 9: Extension Themes and Prefix Validation

Support the minimal theme subset needed by extension packages:

- register extension themes;
- merge them with current theme registry;
- apply `themeNamespacePrefix` when producing or validating extension theme vars;
- warn/error when prefix is missing according to current compatibility policy.

Verification:

- unit tests verify theme registration and prefix diagnostics;
- E2E sample shows extension component styling changes through theme variables
  or a scoped theme.

### Step 10: Metadata Merge and Tooling

Extend Experiment 13 metadata generation:

- include extension components/functions/themes;
- mark metadata entries with package/source information;
- expose extension completions and hover;
- generate docs-reference pages for extension components;
- include extension metadata in production/SSG manifests.

Verification:

- `build:metadata` includes the fixture extension when configured;
- VS Code completion/hover tests include the extension component;
- production/SSG manifest tests record extension metadata.

### Step 11: Package Build Compatibility

Add a minimal `build-lib` equivalent:

- package command builds extension JS artifacts;
- metadata mode emits extension metadata without app runtime output;
- CSS files are copied or bundled when present;
- output shape approximates old package exports.

Verification:

- fixture package creates `dist/*.mjs`;
- metadata mode creates an extension metadata artifact;
- generated package can be imported by an app fixture.

### Step 12: Vite Dev Integration

Load extension packages in Vite dev mode:

- app fixture imports/registers extension package;
- compiler receives extension contracts before compiling XMLUI source;
- hot reload can be minimal but should not require restarting the dev server for
  ordinary source changes if the current architecture can support it cheaply.

Verification:

- E2E dev-server sample renders extension component;
- extension event mutates XMLUI state.

### Step 13: Standalone and Production Integration

Load extension packages in standalone and production builds:

- standalone app can register extension before startup;
- production build precompiles app with extension contracts;
- SSG can render extension output when the component is server-renderable;
- diagnostics explain unsupported non-SSG-safe extension behavior.

Verification:

- production E2E sample renders extension component and mutation works;
- standalone sample loads extension bundle and mutation works;
- SSG test either prerenders the extension sample or records an explicit
  unsupported diagnostic.

### Step 14: Port One First-Party Extension

Port one small first-party extension or an intentionally reduced package based
on a real package:

- prefer a dependency-light component;
- preserve default export shape;
- preserve package scripts where possible;
- record every shim required.

Verification:

- migrated extension package build passes;
- app fixture imports it through the public API;
- metadata and docs output include it.

### Step 15: Documentation and Closure

Update this plan and the `.ai` findings note with:

- implemented public API subset;
- shims and deferred exports;
- package artifact shape;
- commands;
- verification results;
- next compatibility targets.

Verification:

Run, as applicable:

```text
npm --workspace xmlui run test
npm --workspace xmlui run build:metadata
npm --workspace xmlui run build:docs-reference
npm --workspace xmlui run build:production
npm --workspace xmlui run build:ssg
npm --workspace xmlui run test:e2e
npm --workspace xmlui-vscode run test
npm --workspace xmlui-vscode run build
npm --workspace xmlui-counter-badge run build
npm --workspace xmlui-counter-badge run build:metadata
```

## Success Criteria

Experiment 14 is successful when:

- a package-shaped XMLUI extension can import the supported public API from
  `xmlui`;
- the extension can be registered in Vite dev, production, standalone, and
  SSG-aware flows where supported;
- extension components participate in compiler contracts and runtime rendering;
- extension functions are callable from expressions/event handlers;
- extension metadata feeds diagnostics, completions, hover, docs, and manifests;
- at least one extension-driven sample mutates XMLUI state and updates the UI;
- a first-party extension fixture builds both runtime and metadata artifacts;
- all relevant tests pass.

## Implementation Result

Implemented on June 19, 2026.

This experiment completed the first extension package compatibility slice. The
rewrite now has a supported extension-facing API in `xmlui/src/extensions` and
re-exports that subset from `xmlui/src/index.ts`.

Implemented:

- old-style extension object support with `namespace`, `components`, `themes`,
  `functions`, and `themeNamespacePrefix`;
- `StandaloneExtensionManager` replay and registration behavior;
- monorepo `packages/*` workspace support;
- `packages/xmlui-counter-badge` fixture package with runtime build, metadata
  build, and tests;
- parser support for namespace syntax;
- namespace resolution from `xmlns:ext="XMLUIExtensions"` to
  `XMLUIExtensions.CounterBadge`;
- extension component contract normalization;
- extension component runtime rendering;
- extension function calls from compiled event handlers;
- Vite dev, production, SSG, and standalone extension registration;
- extension metadata in generated metadata and docs-reference outputs;
- extension-driven state mutation samples and E2E coverage.

Verification passed:

```text
npm --workspace xmlui run test
npm --workspace xmlui-counter-badge run test
npm --workspace xmlui-counter-badge run build
npm --workspace xmlui-counter-badge run build:metadata
npm --workspace xmlui run build
npm --workspace xmlui run build:metadata
npm --workspace xmlui run build:docs-reference
npm --workspace xmlui-vscode run build
npm --workspace xmlui-vscode run test
npm --workspace xmlui run build:production
npm --workspace xmlui run build:ssg
npm --workspace xmlui run test:e2e
```

Observed totals:

- XMLUI compiler tests: 26 files, 209 tests passed.
- Fixture package tests: 1 file, 1 test passed.
- VS Code tests: 2 files, 13 tests passed.
- E2E tests: 54 tests passed.
- Metadata generation: 26 components, 3 examples.

Compatibility findings were recorded in
`.ai/experiment-14-extension-packages-public-api-compatibility-findings.md`.

## Risks and Open Questions

- Old extension packages may rely on many React-specific exports that do not map
  cleanly to the new renderer.
- Namespace behavior touches parser, compiler, metadata, runtime lookup, and
  tooling; it should be implemented once with shared source-location support.
- Extension package CSS and theme variable behavior may require a richer build
  pipeline than the current app builds.
- SSG compatibility may be limited for browser-only extension components.
- Full public `xmlui` export parity could pull in large old abstractions too
  early; implement only exports proved necessary by migrated packages.
- Metadata mode for packages may need a stable package manifest schema before it
  can become a public contract.
- First-party packages with heavy third-party dependencies should wait until the
  minimal compatibility package proves the core shape.

# Experiment 13: Tooling and Metadata Unification

Status: Implemented

## Purpose

Experiment 13 creates a single compiler-owned metadata source for XMLUI tooling. The goal is to stop duplicating component contracts, diagnostics, completions, docs-reference data, and example inventories across runtime, compiler, VS Code, docs generation, tests, and future extension packages.

The first implementation should prove that the compiler metadata model can drive:

- component and prop/event/template completions;
- type-contract diagnostics;
- semantic metadata for hover/docs;
- generated docs-reference artifacts;
- metadata snapshots used by tests and package builds.

This experiment should build on the existing parser, compiler IR, component contract registry, and VS Code syntax/diagnostic work. It should not create a separate language-service parser or separate docs metadata model.

## Compatibility Baseline

Original XMLUI tooling is part of the public developer experience. Before implementation, inspect and record a concise `.ai/experiment-13-tooling-metadata-unification-findings.md` note from:

- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/coreComponentMetadata.ts`;
- `/Users/dotneteer/source/xmlui/xmlui/src/components/collectedComponentMetadata.ts`;
- `/Users/dotneteer/source/xmlui/xmlui/src/components/metadata-helpers.ts`;
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/ud-metadata.ts`;
- `/Users/dotneteer/source/xmlui/xmlui/src/language-server`;
- `/Users/dotneteer/source/xmlui/xmlui/src/language-server/xmlui-metadata-generated.js`;
- `/Users/dotneteer/source/xmlui/xmlui/src/language-server/services/completion.ts`;
- `/Users/dotneteer/source/xmlui/xmlui/src/language-server/services/hover.ts`;
- `/Users/dotneteer/source/xmlui/xmlui/src/language-server/services/type-contract-diagnostic.ts`;
- `/Users/dotneteer/source/xmlui/xmlui/src/language-server/services/a11y-diagnostic.ts`;
- `/Users/dotneteer/source/xmlui/tools/vscode`;
- `/Users/dotneteer/source/xmlui/website/content/docs/reference/components`;
- `/Users/dotneteer/source/xmlui/website/navSections/components.json`;
- `/Users/dotneteer/source/xmlui/website/public/resources/components.json`.

Observed original compatibility points to preserve or intentionally defer:

- VS Code extension starts an XMLUI language server and supports `.xmlui` syntax highlighting.
- VS Code exposes completions for core component names and component members.
- VS Code exposes hover docs for core components.
- VS Code diagnostics include parser, build validation, type-contract, reactive-graph, and accessibility categories.
- Type-contract diagnostics are checked against component metadata used by XMLUI itself.
- Strictness can escalate diagnostics through app-level flags in the old framework.
- Docs reference pages and website navigation are generated or maintained from component metadata.
- Component metadata includes props, events, APIs, context variables, templates, accepted children, deprecations, enum/value types, default values, descriptions, examples, and theme/style surface.
- Extension packages participate in metadata and docs generation.

## Current Rewrite Baseline

Already implemented:

- Parser and script parser preserve source locations and expose semantic-token helpers.
- Compiler IR records source spans, declarations, dependencies, events, writes, built-ins, user components, and diagnostics.
- Component contracts exist in `xmlui/src/compiler/contracts`.
- `contractRegistryToLspMetadata` exports a small LSP-oriented metadata shape.
- VS Code extension currently has TextMate syntax highlighting, semantic-token support, parser/IR diagnostics, tests, and `build:vsix`.
- Runtime built-ins and compiler contracts have started converging on original XMLUI prop/event names.
- Production and SSG manifests already consume compiler metadata for routes, sources, components, built-ins, diagnostics, and assets.

Gaps:

- Metadata shape is too small for docs, hover, rich completions, and type contracts.
- VS Code diagnostics do not yet use one shared compiler diagnostics pipeline.
- VS Code completions/hover are not yet driven by generated metadata in this workspace.
- Docs-reference generation does not exist in the rewrite workspace.
- Metadata snapshots are not generated as build artifacts.
- Extension package metadata is deferred.

## Scope

Implement the first unified metadata pipeline that:

- defines a durable metadata schema for implemented built-ins and user components;
- generates a JSON metadata artifact from compiler contracts and compiler IR;
- consumes the same artifact in VS Code diagnostics/completions/hover helpers;
- generates minimal docs-reference markdown or JSON from the same artifact;
- exports metadata from package build scripts for downstream tools;
- adds tests proving compiler, VS Code, docs generation, and build artifacts agree.

The first implementation should cover the implemented subset:

- `App`, layout components, text/heading/button components;
- form/input components currently implemented;
- `Items`, template slots, context variables;
- `DataSource`, `APICall`, managed fetching/action APIs;
- routing components: `Pages`, `Page`, `NavPanel`, `NavLink`;
- theming/styling props and layout props;
- user-defined components discovered from fixtures;
- expression/event diagnostics already supported by the compiler.

Every fixture used in this experiment should include at least one data modification path, either through event handlers, input changes, managed fetching refetch, or component-local state updates.

## Non-Goals

This experiment does not complete:

- full old language-server parity;
- full VS Code extension feature parity;
- complete docs website generation;
- all original component metadata fields for unimplemented components;
- extension package metadata registration;
- full accessibility diagnostics;
- reactive-cycle diagnostics beyond what the current compiler can prove;
- formatting/refactoring/code actions;
- package publishing/export rewrites for all metadata consumers.

Those should be extension points and deferred compatibility items.

## Unified Metadata Shape

Add a versioned metadata artifact, initially named:

```text
xmlui/metadata/xmlui-metadata.json
```

or generated into:

```text
xmlui/dist-metadata/xmlui-metadata.json
```

Choose one during implementation and keep generated outputs ignored unless the plan explicitly decides otherwise.

Initial schema:

```ts
type XmluiMetadataArtifact = {
  schemaVersion: 1;
  generatedAt: string;
  components: XmluiComponentMetadata[];
  globals: XmluiGlobalMetadata[];
  diagnostics: XmluiDiagnosticMetadata[];
  examples: XmluiExampleMetadata[];
  source: {
    compilerVersion: string;
    contractHash: string;
  };
};
```

Component metadata should include:

- name;
- kind: built-in, user, extension;
- category/group;
- description and docs path where available;
- props with type, required, default, enum values, deprecation, expression support, docs;
- events with attribute name, payload docs, async behavior notes;
- templates with slot/context-variable metadata;
- context variables;
- exposed APIs/methods;
- layout/style/theme-part support;
- child/parent constraints for the implemented subset;
- source references for generated user components and built-ins;
- examples and fixtures that demonstrate data mutation.

The schema should be explicitly versioned so VS Code, docs, and build tools can detect incompatible changes.

## Architecture Direction

Build a single metadata pipeline:

- **Compiler contracts** remain the source of component prop/event/template/API facts.
- **Compiler IR** contributes user-component definitions, source ranges, local declarations, globals, dependencies, routes, diagnostics, examples, and usage metadata.
- **Metadata generator** normalizes both into a stable artifact.
- **Language-service adapter** maps metadata into completion, hover, and diagnostic helpers.
- **Docs adapter** maps metadata into reference markdown/JSON and navigation.
- **Build adapter** emits metadata artifacts as part of package/tooling builds.
- **Test helpers** snapshot or structurally assert metadata so drift is caught.

Avoid direct imports from VS Code into compiler internals where a stable metadata adapter would do. VS Code may still use parser/token APIs for semantic tokens, but component facts should come from the shared metadata artifact or generator.

## Implementation Steps

### Step 1: Original Metadata and Tooling Audit

Create `.ai/experiment-13-tooling-metadata-unification-findings.md`.

Capture:

- old component metadata fields and helper APIs;
- language-server completion behavior;
- hover behavior;
- type-contract diagnostic behavior;
- docs/reference generation inputs and outputs;
- VS Code packaging expectations;
- generated metadata artifacts and their consumers;
- what must be preserved now vs deferred.

Verification:

- Findings note links inspected files and separates implemented, approximated, and deferred contracts.

### Step 2: Metadata Schema Module

Add a `xmlui/src/metadata` module with:

- schema TypeScript types;
- schema version constant;
- stable sort/order helpers;
- artifact validation helpers;
- deterministic hash helpers.

Verification:

- Unit tests validate schema defaults, deterministic ordering, and hash stability.

### Step 3: Contract-to-Metadata Generator

Convert `XmluiComponentContract` registry entries into the unified metadata shape.

Include:

- components;
- props;
- events and event attribute names;
- templates;
- context variables;
- APIs;
- arbitrary prop support;
- layout prop support;
- source category.

Verification:

- Unit tests assert representative metadata for `Button`, `Items`, `DataSource`, `Page`, and `NavLink`.
- Tests prove prop/event names match current runtime behavior.

### Step 4: User Component Metadata Extraction

Use parser/compiler IR to extract metadata for user-defined components:

- component name;
- props read from `$props`;
- declared vars/globals/methods/events where known;
- default children/template slots where currently supported;
- source locations;
- referenced child components.

Verification:

- Unit tests extract metadata from existing user-component fixtures.
- At least one fixture includes data modification after user interaction.

### Step 5: Diagnostics Unification

Create a shared diagnostics adapter that converts parser, compiler IR, contract, and metadata diagnostics into one shape with:

- code;
- category/source;
- severity;
- source span;
- message;
- related information when available;
- suggested fix placeholder.

Verification:

- Unit tests assert parser errors, unknown components, unknown props, invalid event attributes, and unsupported expressions produce stable diagnostics.
- Existing VS Code diagnostic tests are updated to consume the shared adapter.

### Step 6: Completion Model

Add metadata-driven completion helpers for:

- component names after `<`;
- prop names inside an opening tag;
- event attributes such as `onClick`;
- `var.` and `global.` declaration prefixes;
- template names where supported;
- context variables inside expressions for `Page`, `Items`, and `DataSource`;
- component APIs/references where currently known.

Verification:

- Unit tests cover completion positions in representative snippets.
- VS Code tests assert completion labels and replacement ranges.

### Step 7: Hover Model

Add metadata-driven hover helpers for:

- component names;
- props;
- events;
- templates;
- context variables;
- APIs.

Verification:

- Unit tests assert hover content for `Button`, `DataSource`, `Page.url`, and `$routeParams`.
- Hover output should be useful but concise; full docs rendering can wait.

### Step 8: VS Code Integration

Update `tools/vscode` to consume metadata adapters:

- diagnostics use shared diagnostic collection;
- completions use metadata completion helpers;
- hover uses metadata hover helpers;
- semantic tokens continue to use parser/token APIs;
- VSIX build includes the required metadata or can load it from the workspace package.

Verification:

- `npm --workspace xmlui-vscode run test` passes.
- `npm --workspace xmlui-vscode run build` passes.
- `npm --workspace xmlui-vscode run build:vsix` passes when dependencies are present.

### Step 9: Metadata Artifact Generation Script

Add command-line generation:

- `npm --workspace xmlui run build:metadata`;
- root `npm run build:metadata`;
- writes the metadata artifact and a short summary;
- fails if artifact validation fails.

Verification:

- Unit test or script test reads generated artifact and validates schema version, component count, and representative component records.
- Generated artifact is either ignored or intentionally tracked according to the decision recorded in this plan.

### Step 10: Docs Reference Generator

Add a minimal docs adapter:

- generate component reference markdown or JSON from unified metadata;
- generate a component navigation JSON equivalent for the implemented subset;
- preserve enough shape to later feed the website.

Initial output can go to an experimental folder, for example:

```text
xmlui/dist-docs-reference/
  components.json
  nav-components.json
  components/
    Button.md
    DataSource.md
```

Verification:

- Unit/script tests assert generated docs contain props, events, templates, APIs, and examples for representative components.

### Step 11: Build and Manifest Integration

Connect metadata to existing build outputs:

- production manifest may include metadata artifact path/hash;
- SSG manifest may include metadata artifact path/hash;
- VS Code build can use the same metadata artifact;
- future package export shape is documented.

Verification:

- Production/SSG manifest tests assert metadata fields when generated.
- Existing production/SSG E2E tests still pass.

### Step 12: Metadata Drift Tests

Add drift checks:

- runtime built-ins without metadata fail tests;
- metadata props/events not accepted by contracts fail tests;
- contract props/events not documented in metadata fail tests;
- VS Code completion fixtures and docs generator use the same component set.

Verification:

- Unit tests fail on deliberately missing representative metadata in test-only fixtures.

### Step 13: Fixture Coverage

Add or promote fixtures that exercise metadata-driven tooling:

- component with local state mutation;
- component with props and default children;
- `Items` context variables and template slot;
- routing context variables;
- data operation/refetch mutation;
- event and prop diagnostics.

Verification:

- Existing E2E mutation behavior remains covered.
- Tooling tests use the same fixtures for completions/hover/diagnostics.

### Step 14: Documentation and Closure

Update this plan and `.ai/experiment-13-tooling-metadata-unification-findings.md` with:

- implemented metadata schema;
- generated artifact shape;
- commands;
- compatibility preserved;
- deferred compatibility;
- verification results.

Verification:

- `npm --workspace xmlui run test`;
- `npm --workspace xmlui run build`;
- `npm --workspace xmlui run build:metadata`;
- `npm --workspace xmlui-vscode run test`;
- `npm --workspace xmlui-vscode run build`;
- `npm --workspace xmlui run build:production`;
- `npm --workspace xmlui run build:ssg`;
- `npm --workspace xmlui run test:e2e` when feasible.

## Success Criteria

Experiment 13 is successful when:

- one versioned metadata schema drives compiler, VS Code, docs, and build artifacts for the implemented subset;
- metadata is generated from compiler contracts/IR, not duplicated by hand in VS Code/docs;
- VS Code completions and hover use the shared metadata;
- diagnostics share one conversion/source model across compiler and VS Code;
- docs-reference artifacts can be generated from the same metadata;
- metadata drift tests protect runtime/contract/tooling consistency;
- representative fixtures include user-visible data mutation paths;
- existing unit, VS Code, production, SSG, and E2E checks still pass.

## Implementation Result

Implemented on June 19, 2026.

The first unified metadata slice is complete for the current experimental
runtime subset. The compiler now owns `xmlui/src/metadata`, which provides a
versioned metadata schema, contract-to-metadata generation, user component
metadata extraction, unified diagnostics, completions, hover helpers, artifact
validation, and deterministic JSON output.

Generated commands and artifacts:

```text
npm --workspace xmlui run build:metadata
  -> xmlui/dist-metadata/xmlui-metadata.json

npm --workspace xmlui run build:docs-reference
  -> xmlui/dist-docs-reference/components.json
  -> xmlui/dist-docs-reference/nav-components.json
  -> xmlui/dist-docs-reference/components/*.md
```

VS Code now consumes the shared metadata adapters for diagnostics, completions,
and hover. Semantic tokens remain parser-driven.

Production and SSG builds copy `xmlui-metadata.json` into their output folders
and record it in the generated manifests with a hash.

Compatibility findings were recorded in
`.ai/experiment-13-tooling-metadata-unification-findings.md`.

Verification passed:

```text
npm --workspace xmlui run test
npm --workspace xmlui-vscode run test
npm --workspace xmlui run build:metadata
npm --workspace xmlui run build:docs-reference
npm --workspace xmlui-vscode run build
npm --workspace xmlui run build:production
npm --workspace xmlui run build:ssg
npm --workspace xmlui run test:e2e
```

Observed totals:

- XMLUI compiler tests: 25 files, 204 tests passed.
- VS Code tests: 2 files, 13 tests passed.
- E2E tests: 52 tests passed.
- Metadata generation: 24 components, 3 examples.

## Risks and Open Questions

- The old metadata model is broad; copying all fields too early would freeze a shape before extension packages are understood.
- Docs generation may need richer prose than compiler contracts naturally contain.
- Completion ranges and cursor-context logic may require deeper syntax-node utilities than the current parser exposes.
- Type-contract severity and strictness flags may need app/config analysis not yet implemented.
- Accessibility and reactive-cycle diagnostics may need additional compiler passes.
- Extension package metadata should influence the schema, but Experiment 14 owns full extension compatibility.
- Generated metadata can become a public contract quickly, so versioning and validation matter from the beginning.

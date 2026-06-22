# Post-Component Tooling and Website Migration Plan

Status: draft  
Source baseline: `/Users/dotneteer/source/xmlui`  
Depends on: `.plans/rebuild-plan.md` through Phase 5 component migration  
Assumption: all XMLUI components have been migrated, their original E2E tests
have been transferred, and component-level compatibility gates pass.

## 1. Purpose

This plan describes the step-by-step migration of the remaining XMLUI ecosystem
after component migration: non-component language features, package exports,
extensions, build tooling, create-app, VS Code, docs generation, playground,
website, preview/SSG tooling, AI integrations, and final release checks.

The goal is to migrate these surfaces without destabilizing the completed
component work. Each step should introduce a small compatibility fixture before
scaling to the full old project surface.

## 2. Compatibility Contract

The old XMLUI checkout is the source of truth:

- `/Users/dotneteer/source/xmlui/xmlui`
- `/Users/dotneteer/source/xmlui/tools/create-app`
- `/Users/dotneteer/source/xmlui/tools/vscode`
- `/Users/dotneteer/source/xmlui/tools/preview-ssg`
- `/Users/dotneteer/source/xmlui/tools/xmlui-claude`
- `/Users/dotneteer/source/xmlui/tools/xmlui-codex`
- `/Users/dotneteer/source/xmlui/website`
- `/Users/dotneteer/source/xmlui/playground`
- `/Users/dotneteer/source/xmlui/packages`
- `/Users/dotneteer/source/xmlui/integration-tests`
- old root scripts and CI-facing commands.

For every migrated surface, record:

- old source files, docs, tests, scripts, and generated artifacts;
- old command names, inputs, outputs, exit behavior, and user-visible messages;
- missing small language/tooling features discovered during migration;
- verification commands and remaining compatibility risks.

## 3. Risk Strategy

Do not migrate the website or tooling as one large copy.

Instead:

1. Inventory small non-component features first.
2. Add focused compatibility fixtures for each risky feature.
3. Close package exports and CLI shape before external consumers.
4. Migrate one consumer at a time.
5. Keep the compatibility sweep green after each slice, or record an explicit
   debt entry with an owner phase.

The highest-risk hidden dependencies are small XMLUI language/runtime features
used by docs and tooling, not components themselves.

Examples:

- inline `<script>` helper tags;
- `import` and `export` inside XMLUI script/code-behind files;
- paired `.xmlui.xs` files;
- `Globals.xs`;
- route constraints;
- app config/runtime config loading;
- resource URL resolution;
- markdown code fences, especially `xmlui-pg`;
- Markdown-generated playgrounds and tree display fences;
- extension auto-registration through script tags;
- theme package loading;
- icon and resource registries;
- inspector hooks;
- language-server metadata shape;
- standalone/SSG hosted metadata files;
- generated package artifact shape.

## 4. Migration Sequence

### Phase 6A: Non-Component Feature Inventory

Create a durable inventory of XMLUI features not already closed by component
migration.

Tasks:

- Search the old docs, examples, playground, integration tests, and tools for
  non-component XMLUI syntax and runtime hooks.
- Build `.ai/non-component-compatibility-inventory.md`.
- Add a compatibility-debt row for every unsupported feature.
- Create one tiny fixture per high-risk feature.

Initial feature list:

- `<script>`;
- script `import`/`export`;
- `.xmlui.xs` code-behind;
- `Globals.xs`;
- app config;
- route constraints;
- standalone script loading;
- extension script loading;
- `xmlui-pg` code fences;
- markdown tree/code fences;
- generated docs metadata;
- language-server metadata;
- inspector integration.

Exit criteria:

- Every discovered non-component feature has a source anchor and status.
- Missing features are either implemented or logged as compatibility debt.

### Phase 6B: Scripting and Code-Behind Closure

Close XMLUI scripting semantics before migrating website examples.

Tasks:

- Review old scripting docs:
  `/Users/dotneteer/source/xmlui/website/content/docs/pages/scripting.md`.
- Review helper tag docs:
  `/Users/dotneteer/source/xmlui/website/content/docs/pages/helper-tags.md`.
- Review old parser/compiler/runtime implementation for script and code-behind
  handling.
- Implement or finish support for inline `<script>`.
- Implement script `import`/`export` behavior compatible with the old project.
- Implement `.xmlui.xs` pairing and module resolution.
- Implement `Globals.xs`.
- Ensure async helper calls interact correctly with compiled event handlers.
- Surface diagnostics consistently in Vite, standalone, production, SSG, and
  VS Code.

Exit criteria:

- Old scripting docs examples compile and run.
- Focused unit/E2E tests cover script imports, code-behind, globals, and
  diagnostics.

### Phase 6C: Package Exports, CLI, and Artifact Shape

Mirror the old public package and command surface.

Old package anchors:

- `/Users/dotneteer/source/xmlui/package.json`;
- `/Users/dotneteer/source/xmlui/xmlui/package.json`;
- old `xmlui/src/nodejs`;
- old `xmlui/src/language-server`;
- old syntax packages.

Public exports to verify:

- `xmlui`;
- `xmlui/parser`;
- `xmlui/nodejs`;
- `xmlui/vite-xmlui-plugin`;
- `xmlui/language-server`;
- `xmlui/syntax/monaco`;
- `xmlui/syntax/textmate`;
- `xmlui/testing`;
- CSS and SCSS exports.

Commands to verify:

- `xmlui start`;
- `xmlui build`;
- standalone build;
- production build;
- SSG build;
- metadata build;
- docs generation support commands.

Exit criteria:

- Local consumer fixtures can import every old public export.
- `npm pack` artifact shape is compared against the old package.
- CLI smoke tests cover old command names and common options.

### Phase 6D: Extension Package Compatibility

Migrate extension authoring and packaging before the website, because the docs
and integration tests rely on extension behavior.

Old anchors:

- `/Users/dotneteer/source/xmlui/packages`;
- `/Users/dotneteer/source/xmlui/integration-tests/extension`;
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/wrap-component`;
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/managed-react/themevars-namespace.md`.

Tasks:

- Preserve extension metadata shape.
- Preserve `wrapComponent` and `wrapCompound` public helpers.
- Preserve extension component registration.
- Preserve extension theme variable namespace behavior.
- Preserve extension UMD auto-registration through `<script>` tags.
- Preserve Vite import behavior for extension packages.
- Migrate first-party extension package builds in small slices.

Exit criteria:

- Old extension integration tests pass.
- A script-loaded extension works in standalone mode.
- A Vite-imported extension works in dev and production mode.

### Phase 7A: create-xmlui-app

Migrate the project generator early because it provides a clean external
consumer of the rebuilt package.

Old anchor:

- `/Users/dotneteer/source/xmlui/tools/create-app`.

Tasks:

- Preserve prompts, defaults, generated files, package scripts, and user-visible
  output.
- Generate an app using the rebuilt framework.
- Verify dev, production, standalone, and test scripts where applicable.

Exit criteria:

- Generated app structure matches the old contract.
- Generated app runs with `npm run dev`.
- Generated app builds successfully.

### Phase 7B: VS Code Extension and Language Server

Complete editor support after package exports and scripting diagnostics are
stable.

Old anchor:

- `/Users/dotneteer/source/xmlui/tools/vscode`.

Tasks:

- Preserve syntax highlighting for `.xmlui` and related script/code-behind
  files.
- Preserve diagnostics, completions, hovers, metadata docs, and component
  contract checks.
- Support scripting/code-behind diagnostics.
- Preserve package settings and server discovery behavior.
- Preserve `build:vsix`.

Exit criteria:

- VS Code tests pass.
- Extension build passes.
- VSIX build passes.
- Manual smoke app shows syntax, diagnostics, completion, and hover behavior.

### Phase 7C: Docs Generation Pipeline

Migrate generated docs before migrating the website shell.

Old anchors:

- `/Users/dotneteer/source/xmlui/xmlui/scripts/generate-docs`;
- `/Users/dotneteer/source/xmlui/website/content/docs/reference`;
- `/Users/dotneteer/source/xmlui/website/navSections`.

Tasks:

- Generate component reference docs from metadata.
- Generate behavior docs.
- Generate theme variable docs.
- Generate context variable summaries.
- Generate extension reference docs.
- Validate examples extracted from docs.

Exit criteria:

- Generated docs are deterministic.
- Generated docs diff is reviewable.
- Example validation passes.

### Phase 7D: Playground

Migrate the playground before the full website.

Old anchor:

- `/Users/dotneteer/source/xmlui/playground`.

Tasks:

- Preserve playground app shell and embedded runtime behavior.
- Preserve example loading and metadata.
- Preserve playground extension loading.
- Preserve inspector hooks where supported.
- Preserve embedded routing behavior.
- Preserve code editor/source-map behavior as far as the old public behavior
  exposes it.

Exit criteria:

- Playground builds.
- Playground can run representative component, scripting, data, routing,
  extension, and markdown examples.

### Phase 7E: Website Migration

Migrate the website in slices after docs generation and playground work.

Old anchor:

- `/Users/dotneteer/source/xmlui/website`.

Suggested slices:

1. Static shell, nav, and content routing.
2. Generated reference pages.
3. Static docs pages without playgrounds.
4. Docs examples with ordinary XMLUI snippets.
5. `xmlui-pg` code fences and embedded playground previews.
6. Markdown tree/code fence extensions.
7. Extension docs and extension demos.
8. Blog/content build.
9. SSG/static hosting output.

Exit criteria:

- Website builds.
- Website E2E examples pass.
- Broken links and missing generated pages are reported.
- Representative visual smoke pages are reviewed.

### Phase 7F: preview-ssg and Static Preview Tooling

Migrate preview tooling after website SSG output exists.

Old anchor:

- `/Users/dotneteer/source/xmlui/tools/preview-ssg`.

Tasks:

- Preserve CLI behavior.
- Preserve directory serving behavior.
- Preserve routing fallback behavior.
- Preserve hosted metadata file behavior.
- Verify direct static serving where users commonly use `npx http-server`.

Exit criteria:

- Old preview command behavior is covered by integration tests.
- Website and generated app SSG output can be previewed.

### Phase 7G: AI Tool Integrations

Migrate AI integrations last, after docs, metadata, examples, and commands are
stable.

Old anchors:

- `/Users/dotneteer/source/xmlui/tools/xmlui-claude`;
- `/Users/dotneteer/source/xmlui/tools/xmlui-codex`.

Tasks:

- Preserve plugin/skill packaging shape.
- Preserve XMLUI setup guidance.
- Preserve trace/documentation helpers.
- Point generated references at the rebuilt metadata and docs.

Exit criteria:

- Plugin packages build.
- Main documented AI workflows work against the rebuilt workspace.

## 5. Final Sweep

Expand `npm --workspace xmlui run compatibility:sweep` or add a root-level
successor command that covers:

- framework unit tests;
- all component E2E tests;
- website example E2E tests;
- create-app integration;
- extension integration;
- VS Code tests and VSIX build;
- playground build;
- docs generation;
- standalone build;
- SSG build and preview;
- package artifact diff;
- public API diff;
- performance baseline;
- visual smoke or visual regression checks.

The final migration is not complete until every old command either passes or
has a documented, approved compatibility deviation.

## 6. Immediate Next Step

Start with Phase 6A.

Create `.ai/non-component-compatibility-inventory.md` by scanning the old docs,
website, playground, tools, packages, and integration tests for non-component
XMLUI features. Pay special attention to small language features such as script
`import`, inline `<script>`, `.xmlui.xs`, `Globals.xs`, and `xmlui-pg` markdown
fences, because these can silently block website and tooling migration later.

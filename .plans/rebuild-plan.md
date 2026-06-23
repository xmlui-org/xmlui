# XMLUI Rebuild Plan

Status: active draft  
Source baseline: `/Users/dotneteer/source/xmlui`  
Assumption: Experiments 1-15 in `.plans/master-plan.md` have been successfully
executed for the experimental subset, and their findings are available as the
implementation baseline. Experiment 15 created the first repeatable
compatibility sweep; it does not mean the rewrite is fully compatible yet.

This document is the single narrative rebuild plan. Supporting `.ai` files are
memory, inventories, and evidence logs for agents, but the intended rebuild
sequence and blocking decisions must be readable from this file alone. If a
supporting note changes the plan, fold the decision back into this document.

## 1. Purpose

This plan turns the completed experiments into an incremental rebuild program
whose end state is 100% public interface and behavior compatibility with the
current XMLUI framework.

The plan covers two tracks:

- rebuild the main XMLUI infrastructure: package shape, build pipeline,
  compiler/runtime integration, theming, data access, routing, forms, test
  harnesses, tooling, docs, playground, standalone mode, SSG, extension
  packaging, and release checks;
- rebuild every component one by one, preserving props, events, methods,
  context variables, slots/templates, style/theme behavior, diagnostics, and
  runtime edge cases from the original framework.

The old XMLUI checkout remains the compatibility contract. Every step must cite
the old source files, tests, docs, metadata, examples, or generated artifacts
that define the behavior being rebuilt.

## 2. Non-Goals

- Do not intentionally change user-facing XMLUI syntax, semantics, component
  APIs, package exports, generated app layouts, or command behavior.
- Do not replace established tooling contracts with cleaner new ones unless a
  separate migration decision records the break and compatibility shim.
- Do not batch large groups of unrelated components without ported tests and
  reviewable compatibility notes.
- Do not treat visual similarity as enough for component compatibility; DOM
  shape, events, accessibility, state transitions, APIs, and styling hooks are
  part of the contract where the old framework exposes them.

## 3. Starting Baseline

The completed experiments are assumed to provide these foundations:

- shared parser, compiler IR, expression compiler, event compiler, generated
  structural modules, and source-aware diagnostics;
- explicit state slots, reactive dependency graph, derived variables, async
  handler scheduling, mutation invalidation, and component API references;
- user-defined component support with props, default children, slots, template
  properties, event emission, and methods;
- initial built-ins: `App`, `H1`/heading subset, `Button`, `Text`, `Stack`,
  `HStack`, `VStack`, `Items`, `TextBox`, `Checkbox`, `Select`, and `Option`;
- managed data operations: `DataSource`, `APICall`, `Actions.callApi`, basic
  request lifecycle, cancellation, cache invalidation, mock data, and refetch;
- Vite dev, standalone compilation, production build, SSG/hydration, routing,
  theming/layout, metadata, tooling, extension-package experiments, and an
  initial full compatibility sweep;
- unit and E2E harnesses that can port old XMLUI test cases with minimal edits.

Experiment 15 produced these durable control artifacts:

- `.ai/compatibility-inventory.md`: seeded compatibility surface and component
  inventory, mapped to old sources and rebuild phases;
- `.ai/compatibility-debt.md`: seeded compatibility debt log with stable IDs;
- `.ai/experiment-15-full-compatibility-sweep-findings.md`: first sweep
  findings and operational notes;
- `xmlui/scripts/compatibility-sweep.mjs`: command runner for the current
  compatibility gate;
- `xmlui/scripts/performance-baseline.mjs`: first-pass performance and artifact
  size baseline;
- `xmlui/tests/compatibility/`: initial source-anchored compatibility tests and
  artifact-shape checks.

The first verified sweep on June 19, 2026 passed for the current experimental
surface:

- compiler/runtime unit tests: 209 passing tests;
- compatibility unit tests: 8 passing tests;
- metadata build: 26 components and 3 mutation-capable examples;
- production build, SSG build, docs-reference generation, VS Code build/tests,
  extension fixture build/tests/metadata, and E2E suite: all passing;
- E2E suite: 54 passing tests.

Current sweep commands:

```text
npm --workspace xmlui run compatibility:sweep
npm --workspace xmlui run compatibility:perf
```

Operational note: the full sweep starts local Playwright/Vite servers. In
sandboxed agent execution it may need explicit permission to bind localhost
ports.

Before implementing any phase below, update this section if later experiment or
sweep results differ from these assumptions.

Phase 5 reset note: after Wave 0, the earlier Wave A-D implementation attempt
was rolled back because source-adjacent renderers without old metadata,
theming/default styles, behavior wrappers, docs format, and rendering adapter
semantics could not preserve the original component outlook. The replanned
Phase 5 therefore rebuilds those shared component systems first, then migrates
`App` main content layout, then proves the model with the original
Experiment 1 counter components before broader component waves continue.

## 4. Sequential Execution Order

Execute the rebuild in this order. Later sections provide the detailed scope,
old source anchors, tasks, and exit criteria for each step.

1. Phase 0: Rebuild Control Center

   Maintain the compatibility inventory, debt log, verification command matrix,
   and closure templates. Keep these files synchronized throughout the rebuild.

2. Phase 1: Package, Build, and Test Infrastructure

   Stabilize package scripts, workspaces, build outputs, test harnesses,
   integration smoke commands, and the compatibility sweep as the normal gate.

3. Phase 2: Core Language and Runtime Semantics

   Close parser, scripting, expression/event compilation, runtime state,
   reactive graph, rendering semantics, user-defined components, diagnostics,
   source maps, and code-behind/config gaps.

4. Phase 3: Theme, Styling, Layout, and Visual Verification

   Rebuild shared theme variable resolution, layout props, CSS/style artifact
   reporting, component part semantics, responsive props, and visual-regression
   foundations.

5. Phase 4: Data, Actions, Forms, Routing, and App Shell Infrastructure

   Close shared data operations, actions, form context, routing, app shell,
   runtime services, lifecycle, accessibility, and inspector dependencies that
   components rely on.

6. Phase 5 Wave 0: Component Transfer Scaffold

   Keep the completed component module registry and source-organization
   scaffold as the baseline. Do not treat existing experimental centralized
   built-ins as completed component transfers.

7. Phase 5 Wave 1A: Metadata Shape Compatibility - completed

   Rebuild the old component metadata shape as the source of truth for props,
   events, APIs, context vars, parts, theme vars, behaviors, docs, validation,
   LSP metadata, and generated reference content.

8. Phase 5 Wave 1B: Theme Variable and Styling Compatibility - completed

   Rebuild old component outlook principles: default theme variables,
   `*.defaults.ts`, `*.module.scss`, component theme classes, parts, tones,
   scoped overrides, and responsive layout styling.

9. Phase 5 Wave 1C: Behavior Compatibility - completed

   Rebuild shared behavior metadata, condition evaluation, docs integration,
   and attachment for behaviors such as tooltip, label, validation, variant,
   form binding, animation, bookmark, live region, and pub/sub.

10. Phase 5 Wave 1D: Component Docs Format Compatibility - completed

    Preserve the old `ComponentName.md` additional-docs convention and generate
    component reference pages from old-shaped metadata plus markdown additions.

11. Phase 5 Wave 1E: Rendering Adapter Compatibility - completed

    Rebuild the gist of the old `wrapComponent`/component adapter pipeline
    while replacing interpreter/proxy internals with compiled expressions,
    compiled event handlers, and the new reactive graph.

12. Phase 5 Wave 2: App Main Content Layout Migration

    Migrate `App` as the first proof component, limited to main content layout:
    vertical stack behavior, padding, gap, layout props, theme variables,
    default styling, docs, old layout tests, and a runnable visual sample that
    can be inspected from the dev server.

13. Phase 5 Wave 3: Experiment 1 Component Migration Spike

    Migrate the exact components needed by the original counter experiments,
    including `Button`, `Text` or text rendering, `Heading`/`H1`, and any
    minimal layout primitive needed to validate metadata, styling, behaviors,
    docs, rendering adapter, and compiled data mutation together.

14. Phase 5 Wave 4: Replanned Component Migration Waves A-G

    Continue the broader component families only after the proof spike passes.
    Close each component through the infrastructure-backed closure loop with
    old-shaped metadata, default styling, behaviors, docs, source-adjacent
    tests, visual/theme checks, and mutation coverage where applicable.

15. Phase 6: Extension Packages and External Authoring

    Rebuild extension package registration, metadata, functions, components,
    themes, package exports, standalone scripts, Vite imports, and first-party
    extension packages. After Phase 5 component migration is complete, use
    `.plans/post-component-tooling-website-migration-plan.md` as the detailed
    execution plan for Phase 6 and the following ecosystem phases.

16. Phase 7: Developer Tooling, Docs, Playground, and AI Integrations

    Rebuild VS Code, docs generation, website examples, playground, create-app,
    preview SSG, and XMLUI AI workflow tooling around the rebuilt compiler,
    metadata, runtime, and component model. Use
    `.plans/post-component-tooling-website-migration-plan.md` for the
    step-by-step migration order and risk gates.

17. Phase 8: Full Compatibility Sweep

    Expand the sweep to old unit, E2E, integration, docs-example, package,
    extension, playground, CI workflow, artifact, visual, and performance
    parity checks. Triage every failure.

18. Phase 9: Release Readiness and Migration Safety

    Mirror the old release process, verify package/artifact contents, record
    known deviations, provide rollback/side-by-side testing instructions, and
    freeze compatibility shims for the release candidate.

## 5. Compatibility Closure Rules

Each infrastructure area and component must go through the same closure loop:

1. Inventory old behavior from `/Users/dotneteer/source/xmlui`.
2. Record source-of-truth files in `.ai/compatibility-inventory.md`, a
   component closure note, or this plan.
3. Port or adapt old tests before or alongside implementation.
4. Implement the smallest compatible slice.
5. Run unit, E2E, integration, visual, and packaging checks appropriate to the
   surface.
6. Record deferred gaps, intentional deviations, and remaining risks in
   `.ai/compatibility-debt.md`.
7. Mark the surface complete only when old tests pass or documented old tests
   are proven obsolete.

Every compatibility-sensitive change should either keep
`npm --workspace xmlui run compatibility:sweep` passing or add a debt entry
explaining why a failure is expected and which rebuild phase will close it.

For components, the inventory must include:

- `.tsx`, `*React.tsx`, `.defaults.ts`, `.module.scss`, `.md`, and `.spec.ts`
  files where present;
- public props, events, methods, exposed APIs, context variables, and
  slots/templates;
- default prop values, aliases, internal props that must not be advertised, and
  accepted child/component relationships;
- theme variables, component parts, CSS classes, layout behavior, responsive
  props, accessibility behavior, focus/keyboard behavior, and error states;
- docs examples, website examples, playground examples, and integration-test
  usage.

## 6. Phase 0: Rebuild Control Center

Status: operational; keep this phase maintained throughout the rebuild.

Create the process scaffolding before broad implementation.

Tasks:

- Maintain `.ai/compatibility-inventory.md`, which now links framework areas
  and the original component set to old source files, rewrite status, and
  rebuild phases.
- Maintain `.ai/compatibility-debt.md`, which now records known gaps, blocked
  surfaces, and deferred compatibility work with stable IDs.
- Use `.ai/rebuild-control-center.md` as the short orientation note for future
  agents entering the rebuild.
- Keep the component tracking table aligned with
  `/Users/dotneteer/source/xmlui/xmlui/src/components`.
- Refine status labels as implementation matures: `not-started`,
  `inventoried`, `tests-ported`, `implemented`, `parity-tested`, `closed`,
  `deferred`.
- Use `.ai/component-compatibility-closure-template.md` before closing any
  non-experimental component.
- Keep `.ai/verification-command-matrix.md` current as the minimum required
  verification command set for each surface:
  parser/compiler unit, runtime unit, E2E, visual/theme, integration, package,
  docs, VS Code metadata, compatibility sweep, and performance baseline.

Exit criteria:

- Every old component and infrastructure area has an owner row in the inventory.
- The first component closure note can be produced without inventing structure.
- The compatibility debt log has no unclassified known gaps.
- `npm --workspace xmlui run compatibility:sweep` and
  `npm --workspace xmlui run compatibility:perf` are documented as standard
  control commands.

Phase 0 completion note: the initial control center files exist. Future phases
must keep them synchronized rather than treating Phase 0 as a one-time setup.

## 7. Phase 1: Package, Build, and Test Infrastructure

Status: initial command surface implemented; full old integration parity still
tracked as compatibility debt.

Stabilize the repo and command surface before rebuilding broad behavior.

Old sources to inventory:

- root `package.json`, workspace configuration, CI workflows, release scripts;
- `xmlui/package.json`, build outputs, exports, TypeScript configs, Vite plugin;
- `integration-tests/`, `xmlui/src/testing`, and Playwright/Vitest setup;
- `tools/create-app`, `tools/preview-ssg`, `tools/vscode`,
  `tools/xmlui-claude`, and `tools/xmlui-codex`.

Tasks:

- Match package names, exports, peer dependencies, dependency boundaries, and
  published artifact shape.
- Recreate root scripts and package scripts, including `build-xmlui`,
  `build-vscode-extension`, `build-extensions`, `build-docs`,
  `build-playground`, `generate-docs`, `test`, `test-smoke`, and
  `test-integration`.
- Make Vite dev, production build, standalone, SSG, docs, playground, and
  extension builds consume the shared compiler artifacts.
- Port old unit and E2E fixtures into a single compatibility harness that can
  run the old test intent against the new runtime.
- Add fixture comparison for generated JS, CSS, metadata, source maps, package
  exports, generated app templates, and SSG output.
- Add CI-friendly commands that fail on untriaged compatibility gaps.
- Expand the Experiment 15 sweep so it can include integration tests,
  create-app output checks, package export checks, and release-artifact checks
  as those surfaces are rebuilt.
- Keep old root and `xmlui` package command names available as aliases or
  debt-backed placeholders so public command compatibility is explicit while
  missing surfaces are rebuilt.

Exit criteria:

- A generated app can be created, served, tested, built, and smoke-tested using
  the same user-facing commands as the old framework.
- The test harness can run old component tests incrementally without bespoke
  setup per component.
- The compatibility sweep is part of the normal CI-facing verification path.

Current Phase 1 result:

- root aliases exist for `build-xmlui`, `build-vscode-extension`,
  `build-extensions`, `build-docs`, `generate-docs`, `test-smoke`, and
  `test-integration`;
- `build-playground` exists as an explicit `COMP-0006` placeholder until the
  playground is rebuilt;
- `xmlui` package aliases exist for `build:xmlui`, `build:xmlui-standalone`,
  `build:xmlui-metadata`, `test:unit`, `check:metadata`, and `generate-docs`;
- `scripts/phase1-integration-smoke.mjs` is the first integration command
  placeholder and validates the command/debt/inventory surface;
- `.ai/phase-1-package-build-test-infrastructure-findings.md` records the
  implemented slice and remaining debt.

## 8. Phase 2: Core Language and Runtime Semantics

Status: initial event-tag and compatibility-test slice implemented; code-behind,
full config loading, and old/new performance oracle remain compatibility debt.

Close the behavior behind XMLUI authoring before expanding components.

Areas:

- markup parsing: `.xmlui`, `.xmlui.xs`, `.xmlui.xm`, `Globals.xs`,
  `config.json`, and `config.ts`;
- expressions and handlers: optional member access defaults, functions,
  callbacks, async behavior, statement scheduling, diagnostics, banned globals,
  source maps, and error locations;
- scope and state: local `var`, global variables, reactive variables,
  component APIs, context variables, `$props`, slots/templates, data references,
  assignment semantics, cycles, and invalidation;
- rendering: structural node rendering, conditional rendering, layout props,
  responsive props, `when`, fragments, text binding, event binding, lifecycle,
  errors, and cleanup;
- user-defined components: boundaries, scope isolation, default children,
  named slots, template properties, event emission, exposed methods, metadata,
  and diagnostics.

Tasks:

- Port old parser, analyzer, scripting, state, rendering, and UDC tests.
- Build golden compatibility fixtures for edge cases that currently lack tests.
- Ensure runtime diagnostics match old user-visible messages where practical.
- Benchmark expression and handler execution against the old interpreter and
  keep the master-plan performance target visible in CI.
- Extend `compatibility:perf` beyond command durations into old/new oracle
  measurements for expression evaluation, handler execution, invalidation, and
  startup.
- Preserve documented child `<event name="...">...</event>` syntax by lowering
  event tags into parent event handlers without rendering the event tag itself.

Exit criteria:

- Core old tests pass before component-specific behavior is enabled broadly.
- New component work can depend on stable parser/compiler/runtime contracts.

Current Phase 2 result:

- child event tags compile into parent events and mutate state through the same
  runtime path as `onClick`;
- event and method tag script bodies bypass mixed-text parsing;
- source-anchored null-safe member-read compatibility coverage exists;
- `.ai/phase-2-core-language-runtime-semantics-findings.md` records the slice
  and remaining debt.

## 9. Phase 3: Theme, Styling, Layout, and Visual Verification

Rebuild the styling contract as shared infrastructure rather than per-component
ad hoc work.

Old sources to inventory:

- `xmlui/src/components-core/theming`;
- `xmlui/src/components-core/themevars`;
- component `.defaults.ts` and `.module.scss` files;
- docs and visual examples for themes, parts, layout, responsive props, and
  CSS injection;
- website and playground theme usage.

Tasks:

- Recreate theme variable resolution, default themes, theme scopes, component
  parts, variant handling, and override precedence.
- Recreate core layout props, spacing, alignment, sizing, breakpoints,
  responsive props, and CSS generation/injection.
- Add visual regression fixtures for default theme, common custom themes,
  dark/light behavior where supported, responsive layout, and SSG first paint.
- Make docs metadata and VS Code metadata describe the same theme variables and
  component parts used by runtime.
- Add theme/style artifact checks to the compatibility sweep as the first
  repeatable styling inventory; expand it with stable CSS and visual baselines
  as the old theme/component-part contracts are rebuilt.

Exit criteria:

- Visual and CSS parity checks exist before layout-heavy components are closed.
- Component closure can cite reusable theme/layout tests instead of duplicating
  infrastructure tests.

Current Phase 3 result:

- theme references are resolved both when the whole value is a token
  (`$color-primary`) and when the token appears inside a CSS value such as
  `1px solid $color-border`;
- `compatibility:style-artifact` emits a deterministic styling compatibility
  report from the current runtime contracts;
- `compatibility:sweep` includes the style artifact report, and compatibility
  tests validate the generated report shape when it exists;
- `.ai/phase-3-theme-styling-layout-visual-findings.md` records the initial
  slice and the remaining visual/theme parity debt.

## 10. Phase 4: Data, Actions, Forms, Routing, and App Shell Infrastructure

Close shared features that many components depend on.

Tasks:

- Data and actions: finish `DataSource`, `APICall`, `Actions`, request
  builders, cache invalidation, upload/download modes, polling, cancellation,
  confirmation, notifications, optimistic updates, paging selectors,
  CSV/SQL modes, tracing, inspector hooks, and stale-response behavior.
- Forms: rebuild form context, validation, validators, form item binding,
  submit/reset, dirty/touched tracking, form-scoped events, server errors,
  accessibility feedback, and nested form behavior.
- Routing: finish `Pages`, `Page`, `NavLink`, `Redirect`, hash/history routing,
  route params, query params, navigation events, nested apps, defended routing,
  page metadata, and SSG route discovery.
- App shell: close `App` layout, mobile layout, navigation, search, headers,
  footers, sheets, page titles, index collection, and standalone app loading.
- Runtime services: toasts, modals, queues, timers, event sources, websockets,
  message listeners, lifecycle, i18n, concurrency, audit, accessibility, and
  inspector/devtools integration.

Exit criteria:

- Components that depend on forms, routing, data, app shell, or runtime services
  can be implemented without temporary compatibility shims.
- Old E2E and integration tests for app creation, routing, data operations,
  forms, and standalone mode pass or have recorded deferrals.

Current Phase 4 result:

- the runtime exposes an app-scoped `toast` reference to compiled expressions
  and event handlers, matching the documented `toast()`, `toast.success()`,
  `toast.error()`, `toast.loading()`, and `toast.dismiss()` surface;
- `XmluiRoot` renders a managed toast host without requiring app markup;
- `runtimeToast` verifies toast calls together with data mutation from compiled
  handlers;
- `compatibility:runtime-artifact` emits a deterministic report for data,
  routing, app shell, forms, and runtime-service slices;
- `compatibility:sweep` includes the runtime artifact report, and
  compatibility tests validate the generated report shape when it exists;
- `.ai/phase-4-runtime-services-data-routing-forms-findings.md` records the
  implemented slice and the remaining Phase 4 debt.

## 11. Phase 5: Component Transfer and Rebuild Waves

Transfer components one by one, using the original component source
organization as the default shape. A component is not complete merely because a
runtime renderer exists. It is complete only when its component folder contains
the transferred public contract: implementation, metadata, renderer/wrapper,
tests, docs, style/default information where applicable, and a closure note.

Source organization rule:

- Use `/Users/dotneteer/source/xmlui/xmlui/src/components/<ComponentName>` as
  the compatibility template for each component.
- Create the rewrite component under
  `xmlui/src/components/<ComponentName>/`.
- Keep component-owned code in that folder: implementation, renderer adapter,
  metadata, default styles/theme variables, docs source, tests, fixtures, and
  component-local helpers.
- Keep `xmlui/src/components` free of shared infrastructure files/folders; it
  should contain component folders only.
- Keep shared component infrastructure under `xmlui/src/component-core`.
  Central runtime files may load component modules, but they must not become
  the primary home of component behavior.
- Existing experimental built-ins are compatibility scaffolding. During Phase 5
  they must either move behind component modules or remain explicitly marked as
  temporary debt.
- After every Phase 5 wave, either create a runnable visual example or point to
  an existing one that exercises that wave's result. Record the command and
  route, such as `npm run dev` plus a `?example=...` URL, so the wave can be
  checked visually outside the automated tests.
- Deviations from the old file shape are allowed only when recorded in the
  component closure note with the reason and compatibility risk.

Suggested component folder shape:

```text
xmlui/src/components/Button/
  Button.tsx
  ButtonReact.tsx
  Button.defaults.ts
  Button.module.scss
  Button.md
  Button.spec.tsx
  Button-style.spec.ts
  index.ts
```

The exact filenames may follow the old component when that improves
traceability. The important rule is that the component owns the same categories
of artifacts the original component owned, and component-specific tests are
colocated beside the component files.

### Wave 0: Component Transfer Scaffold

Status: implemented as the initial scaffold; component behavior migration remains
Wave A-G work.

Before Wave A implementation resumes, create the component transfer scaffold.

Tasks:

- Define the component module contract consumed by the runtime registry:
  component name, renderer, metadata, default styles/theme parts, docs metadata,
  and test fixture registration.
- Refactor the central built-in registry so it imports component modules instead
  of owning component implementations directly.
- Define the mapping from old XMLUI component artifacts to rewrite artifacts:
  metadata factory, renderer/wrapper, React implementation, default styles,
  SCSS/theme parts, docs markdown, docs examples, unit specs, E2E specs, and
  test utilities.
- Decide and document where transferred tests live. Port component-specific
  tests directly beside the component files, following the original component
  folder pattern. Do not create `__tests__` folders for migrated component
  tests; if a test cannot be ported yet, record the old source and the reason in
  the component closure note.
- Add a component closure note template section for source organization:
  old files inventoried, transferred files, simplified files, deleted/obsolete
  old internals, runnable tests, deferred tests, docs status, metadata status,
  and verification commands.
- Add compatibility checks that fail or warn when a component is marked
  `closed` without metadata, docs/test inventory, and a runnable verification
  path.
- Migrate the experimental partial components into the new folder structure
  before claiming them as Phase 5 progress.

Exit criteria:

- A new component can be transferred without inventing file layout or registry
  wiring.
- The registry delegates to per-component modules.
- The first component closure note can cite both old and rewrite files in the
  same source-organization categories.
- The inventory can distinguish `partial-centralized` from
  `transferred-folder`, `tests-ported`, `parity-tested`, and `closed`.

Current Wave 0 result:

- `xmlui/src/components` defines the component transfer module contract,
  runtime component module registry, transfer conventions, and source-adjacent
  placeholder folders for the experimental runtime-backed components.
- The runtime renderer looks up built-ins through the component module registry
  instead of importing the legacy built-in renderer table directly.
- Existing experimental renderers still point at
  `xmlui/src/runtime/rendering/builtins.tsx` and are explicitly marked
  `partial-centralized`; they are not closed component transfers.
- The scaffold handles component-folder aliases such as the `H1` runtime tag
  mapping to the original `Heading` component folder.
- `.ai/component-compatibility-closure-template.md` now records source
  organization, transferred tests, runnable tests, and deviations.
- `npm --workspace xmlui run compatibility:component-transfer` validates the
  closure guard and is included in `compatibility:sweep`.

### Per-Component Closure Loop

For each component in Waves A-G:

1. Inventory the original component folder, including `.tsx`, `*React.tsx`,
   metadata, defaults, SCSS, docs, unit specs, E2E specs, test helpers, and
   generated docs metadata.
2. Copy or reference the original tests before implementation. Keep an
   archival transferred version close to the component and create runnable
   ports in the rewrite test infrastructure.
3. Transfer docs and docs examples into the component folder or the docs
   generation source expected by the new tooling. Docs are part of closure, not
   a later cleanup task.
4. Implement the component through the per-component module. Internals may be
   simplified, but the public props, events, methods, context variables,
   accepted children, API refs, DOM behavior, accessibility, styling hooks, and
   diagnostics must follow the old component.
5. Register the component through the shared registry by importing its module.
   Do not add new component-specific behavior directly to the central renderer.
6. Compare generated metadata with the old metadata and record any deliberate
   simplification or deferred metadata field.
7. Run the ported unit/E2E tests and any visual/theme checks needed by the
   component.
8. Keep at least one state mutation path in tests when the component can mutate
   local state, global state, form state, data state, or component API state.
9. Record exact old files, rewrite files, deferred behavior, obsolete old tests,
   and verification commands in `.ai/<component>-compatibility-closure.md`.
10. Update `.ai/compatibility-inventory.md` and
    `.ai/compatibility-debt.md`.

Completion rule: a component cannot be marked `closed` while copied old tests
are failing, unported, or silently ignored. Any old test that will not be
ported must be listed in compatibility debt as `obsolete-old-test`,
`intentional-deviation`, or a phase-scoped `known-gap`.

### Wave 1: Metadata, Theme, Behavior, Docs, and Rendering Infrastructure

Status: required before Wave A component migration resumes.

The initial Wave A-D attempt proved that a component folder plus a renderer is
not enough. XMLUI component compatibility includes the old visual styling
contract and the component authoring/documentation model. Before migrating
individual components, rebuild the shared component infrastructure so migrated
components can preserve old semantics, principles, and visible interfaces while
still using the new compiler/runtime internals.

Old source anchors:

- metadata: `/Users/dotneteer/source/xmlui/xmlui/src/abstractions/ComponentDefs.ts`,
  `/Users/dotneteer/source/xmlui/xmlui/src/components/metadata-helpers.ts`,
  `/Users/dotneteer/source/xmlui/xmlui/src/components-core/renderers.ts`;
- renderer adapter: `/Users/dotneteer/source/xmlui/xmlui/src/components-core/wrapComponent.tsx`,
  `/Users/dotneteer/source/xmlui/xmlui/src/components-core/rendering/ComponentAdapter.tsx`;
- theming: `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming`,
  `/Users/dotneteer/source/xmlui/xmlui/src/components-core/themevars`,
  component `*.defaults.ts` and `*.module.scss` files;
- behaviors: `/Users/dotneteer/source/xmlui/xmlui/src/components-core/behaviors`;
- docs: component `ComponentName.md` files and generated docs under
  `/Users/dotneteer/source/xmlui/website/content/docs/reference/components`.

#### Wave 1A: Metadata Shape Compatibility

Goal: Preserve the old component metadata model closely enough that component
metadata can be migrated instead of re-invented.

Status: completed. The rewrite now has old-shaped component metadata types,
descriptor helpers, representative metadata for `App`, `Button`, `Text`, and
`Stack`, and a bridge that derives current compiler/LSP contracts from that
metadata.

Tasks:

- [x] Recreate the old `ComponentMetadata`, `ComponentPropertyMetadata`,
  `ComponentEventMetadata`, API, context-var, parts, theme-var, and behavior
  metadata shape in the rewrite.
- [x] Keep helper functions such as `createMetadata`, `dClick`, `dContextMenu`,
  `dComponent`, `dEnabled`, `dLabel`, and related descriptor helpers where they
  preserve old authoring/readability semantics.
- [x] Map metadata to the current compiler contract and LSP metadata as a derived
  artifact, not as the source of truth.
- [x] Preserve metadata fields that affect docs, validation, theme variables,
  behaviors, default values, strict enums, internal markers, `nonVisual`,
  `status`, and `specializedFrom`.
- [x] Add metadata parity tests against a small old-framework oracle fixture for
  `App`, `Button`, `Text`, and `Stack`.

Exit criteria:

- [x] A migrated component can expose old-shaped metadata and the rewrite can derive
  compiler validation, docs metadata, and VS Code metadata from it.
- [x] No component migration after Wave 1A hand-writes a smaller bespoke contract
  unless the closure note records a deliberate compatibility decision.

#### Wave 1B: Theme Variable and Styling Compatibility

Goal: Rebuild the theming principles that make migrated components look like
the old components by default and respond to old theme variables.

Status: completed for shared infrastructure. The rewrite now has reusable old-style theme variable
utilities for SCSS-exported declarations, `$var` reference resolution,
base/tone/component default merging, hierarchical component variable fallback,
scoped component theme CSS properties, and responsive part/state layout style
resolution. Per-component visual parity remains part of each component migration
closure after renderers adopt this infrastructure.

Tasks:

- [x] Recreate the old theme-variable naming and resolution semantics:
  `$var` references, hierarchical/component variables, tone-specific variables,
  default theme variables, and component-supplied theme var declarations.
- [x] Preserve the component-level pattern:
  `Component.defaults.ts` for default props and metadata defaults;
  `Component.module.scss` as the source of theme-var declarations and default
  CSS structure when the component uses SCSS in the old project.
- [x] Decide the implementation mechanism for the rewrite:
  either compile the old-style SCSS/CSS-module artifacts into runtime classes,
  or convert their semantics into generated CSS while preserving public class,
  part, theme-var, and default style behavior.
- [x] Recreate `useComponentThemeClass` semantics: component metadata contributes
  theme vars, the active theme resolves them to CSS custom properties, and the
  component receives a generated class that scopes those variables.
- [x] Preserve part styling and responsive layout semantics used by old
  `COMPONENT_PART_KEY`, `Part`, state selectors, and breakpoint-specific layout
  props.
- [x] Add style-contract tests before component migration:
  default app/text/button/stack appearances;
  theme var override;
  scoped theme override;
  component part selector;
  responsive layout prop.

Exit criteria:

- [x] A migrated component can use old-shaped `*.defaults.ts`, `*.module.scss`,
  metadata theme vars, and `useComponentThemeClass`-style hooks to produce the
  default style contract required for later visual parity checks.
- [x] Component migration cannot be marked `parity-tested` without default style
  and theme-var checks when the old component had styles/theme variables.

#### Wave 1C: Behavior Compatibility

Goal: Preserve the old behavior system as a shared wrapper layer rather than
duplicating behavior props inside every component.

Status: completed for shared infrastructure. The rewrite now has old-style
behavior metadata, condition evaluation against old-shaped component metadata,
contract-derived behavior props for migrated components, and a shared behavior
attachment function. Full behavior visuals remain part of each migrated
component's rendering closure.

Tasks:

- [x] Recreate the behavior metadata and attachment model for at least the common
  behavior surface: tooltip, label, validation, variant, form binding,
  animation, bookmark, live region, and pub/sub where applicable.
- [x] Preserve behavior trigger props and docs generation so component reference
  pages list supported behaviors as before.
- [x] Implement behavior condition evaluation against old-shaped component metadata
  (`visual`, `nonVisual`, `hasProp`, `hasEvent`, `hasApi`, `isType`, etc.).
- [x] Attach behaviors in the rendering pipeline after the component renderer has
  produced its base React node and before the node is returned to its parent.
- [x] Add tests proving that a migrated component can receive tooltip/label/variant
  behavior without the component renderer knowing those props directly.

Exit criteria:

- [x] Behavior props are validated, documented, rendered, and tested through the
  shared behavior layer.
- [x] Individual component renderers do not absorb behavior-specific responsibilities
  unless the old component did so explicitly.

#### Wave 1D: Component Docs Format Compatibility

Goal: Preserve the old `ComponentName.md` additional-docs convention and keep
generated docs compatible with the current website/reference style.

Status: completed for shared infrastructure. The rewrite can parse old
component docs marker blocks, combine additional markdown with generated
metadata sections, list applicable behaviors, and generate docs reference files
through the existing `build:docs-reference` command.

Tasks:

- [x] Document and implement the old component docs markdown format, including
  examples, special sections, behavior listings, property/event/API generated
  sections, and additional explanatory content.
- [x] Ensure migrated component docs are copied or transformed from the original
  component folder before the component is considered transferred.
- [x] Keep generated docs output structurally comparable to
  `/Users/dotneteer/source/xmlui/website/content/docs/reference/components`.
- [x] Add docs-generation tests that compare representative generated output for
  `App`, `Button`, `Text`, and `Stack` at the section/title level.

Exit criteria:

- [x] Component docs can be generated from old-shaped metadata plus
  `ComponentName.md`.
- [x] A component closure note must list docs status and generated reference status.

#### Wave 1E: Rendering Adapter Compatibility

Goal: Migrate the gist of the old managed rendering pipeline while fitting the
new compiler/runtime architecture.

Status: completed for shared infrastructure. The rewrite now has a lightweight
`wrapComponent` adapter that evaluates compiled props/events, renders children
and templates, provides standard XMLUI attributes, merges layout/theme styles,
registers component APIs, coerces resource URLs, and attaches shared behaviors.

Tasks:

- [x] Recreate a lightweight `wrapComponent`/component-adapter layer that handles
  old-visible responsibilities:
  prop extraction and coercion, event lookup, template rendering,
  layout context, child rendering context, stateful value conventions,
  component API registration, resource URL extraction, class/style merging,
  behavior attachment, lifecycle hooks, diagnostics, and inspector/test
  identifiers.
- [x] Keep only responsibilities still needed after compilation:
  use compiled expression/event functions instead of interpreter callbacks;
  keep reactive dependencies from the compiler/runtime graph instead of old
  proxy-based dependency collection;
  remove old optimization or container concepts that were only compensating for
  interpreted expressions or proxy change detection.
- [x] Preserve visible errors, diagnostics, and fallback rendering for unknown or
  invalid components where old behavior was user-visible.
- [x] Define the boundary between renderer adapter and component implementation:
  shared XMLUI concerns live in the adapter; component-specific DOM and state
  live in the component folder.
- [x] Add adapter tests with a dummy component covering prop extraction, children,
  templates, events, API registration, behavior attachment, theme class, and
  diagnostics.

Exit criteria:

- [x] Migrated components use the adapter instead of duplicating XMLUI-wide
  concerns.
- [x] Central runtime files are orchestration only; old-visible component behavior
  is either in shared adapter infrastructure or component-owned files.

### Wave 2: App Main Content Layout Migration

Start component migration only after Wave 1A-E exit criteria pass.

First component: `App`, focused only on main content layout compatibility.

Scope:

- Transfer old `App` metadata shape, docs, defaults, relevant styles/theme
  variables, and the old tests that cover main content layout.
- Preserve visible main-content layout behavior: vertical stack, content
  padding, gap/spacing, layout props, theme variables, DOM/test identifiers,
  and docs examples related to this slice.
- Add or identify a dev-server example that visually exercises this migrated
  App content layout and a data mutation that changes visible layout or content.
- Exclude app shell behavior such as navigation, routing, headers, footers,
  mobile shell, search, page metadata, index collection, and standalone startup;
  these remain Wave G.

Verification:

- Ported old `App` layout tests pass.
- A visual/theme fixture proves default content layout and theme-var override.
- At least one mutation test changes a value that affects rendered content or
  layout so the compiled data-update path remains covered.
- The wave's visual sample can be opened with `npm run dev` or an equivalent
  command and a documented URL.

### Wave 3: Experiment 1 Component Migration Spike

After the `App` layout slice works through the new infrastructure, migrate the
exact components needed by the original increment-button Experiment 1 to prove
the migration concept end to end.

Components:

- `Button`;
- `Text` or text-node rendering, depending on the old component boundary used
  by the sample;
- `Heading`/`H1`;
- any minimal layout primitive that the old component implementation requires
  through the adapter or theme system.

Scope:

- Migrate old-shaped metadata, defaults, SCSS/theme vars, docs, renderer
  adapter usage, behavior compatibility, and tests for only the subset needed
  by the Experiment 1 counter apps.
- Preserve old visible semantics for the sample: label/children precedence,
  click event behavior, disabled/enabled basics, default styling, heading
  rendering, theme variables, and docs metadata.
- Keep source file naming compatible with the old component folders. If the old
  project has `Button.tsx`, `ButtonReact.tsx`, `Button.defaults.ts`,
  `Button.module.scss`, `Button.md`, and `Button.spec.ts`, the rewrite should
  keep corresponding names unless a closure note records why the implementation
  uses a different internal file.
- Keep `xmlui/src/components` reserved for component folders only. Shared
  component infrastructure such as metadata helpers, behavior definitions,
  registries, transfer inventory, and future component-wide utilities belongs
  under `xmlui/src/component-core`.
- Port component-specific tests beside the component files, following the old
  project pattern (`Button.spec.ts`, `Button-style.spec.ts`,
  `App-layout.spec.ts`, etc.). Do not create `__tests__` folders for migrated
  component tests.
- Do not treat newly written focused compatibility tests as migrated old tests.
  A component wave is not complete until the relevant old component specs have
  been inspected, either ported beside the component or recorded in the closure
  note as intentionally deferred with a reason.
- Test the three Experiment 1 apps unchanged or as close to unchanged as the
  current parser/compiler allows.

Verification:

- Ported old component tests for the selected subset pass.
- Experiment 1 counter apps render with old-compatible component styling.
- Click handlers mutate data and update rendered output.
- Metadata/docs/theming/behavior fixtures pass for these components.

### Wave 4: Replanned Component Migration Waves

After Wave 3 proves the migration model, continue with the original component
families. The ordering below can remain, but each component must now go through
the infrastructure-backed closure loop, not the earlier renderer-only transfer.

#### Wave A: Primitive Text, Media, and Utility Components

Wave A is intentionally split into smaller closure-sized chunks. Each chunk must
finish the full component migration loop for its components:

- inspect the original component folder and docs;
- transfer component-owned metadata, defaults, SCSS theme variables, renderer,
  docs, and colocated tests;
- transfer all original component E2E tests into the migrated component folder,
  including tests from every old `*.spec.ts` file and every loop-expanded test
  case, keeping assertions as close to the original as the current harness
  allows;
- add or point to a visual example runnable with `npm run dev`;
- include at least one state/data mutation path when the component can
  participate in mutation;
- run focused unit/E2E tests and the compatibility sweep;
- record any blocked old E2E test with the original source file, missing
  dependency, and follow-up wave.

Before declaring any component complete, run or update the component E2E audit:

```text
npm --workspace xmlui run compatibility:component-e2e-audit
```

The audit report is written to
`xmlui/.compatibility-report/component-e2e-audit-latest.md`. A component is not
closed while this report, an expanded old test listing, or a component closure
note shows missing old tests.

`App` main content layout is no longer part of this wave; it is the dedicated
Wave 2 proof component.

##### Wave A1: Text and Heading Family

Components:

- `Text`;
- `Heading`;
- `H1`, `H2`, `H3`, `H4`, `H5`, `H6`.

Compatibility focus:

- value and child text precedence;
- whitespace collapsing and `preserveLinebreaks`;
- value coercion for primitive, array, object, null, and undefined values;
- semantic heading levels and shortcut-level override behavior;
- text variants and HTML element mapping owned by `Text`;
- max-line clipping, ellipses, overflow APIs, selection behavior, and
  component API references through `id`.

Status: incomplete. The current implementation has useful source-adjacent
metadata, defaults, SCSS theme declarations, docs, renderers, focused tests,
and visual examples, but it does not yet transfer all old E2E tests. Migrated component
folders include metadata, defaults, SCSS theme declarations, docs, renderers,
colocated unit/E2E tests, transferred old component E2E coverage, and the
`primitiveTextHeading`, `textOldCompatibility`, and `headingOldCompatibility`
visual/test examples. Original E2E sources transferred:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Text/Text.spec.ts`;
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Heading/Heading.spec.ts`;
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Heading/HeadingShortcuts.spec.ts`.

##### Wave A2: HTML Text Tags and Fragment

Components:

- `HtmlTags`;
- `Br`;
- `Fragment`.

Compatibility focus:

- old HTML tag component aliases and semantic DOM output;
- text-flow behavior around inline tags and line breaks;
- child rendering without extra wrapper DOM for `Fragment`;
- parser/compiler treatment of lower-case or alias tag names used by the old
  framework.

Closure requires transferred old E2E tests for these components or a recorded
blocker if tests depend on not-yet-migrated surrounding components.

Status: incomplete until the audit is reconciled for every component in the
chunk. Migrated component
folders include old-shaped metadata, docs, renderers, colocated transferred E2E
tests, and a runnable `htmlTagsFragment` dev example. The rewrite now has a
shared HTML tag inventory in `component-core`, supports lower-case HTML wrapper
components in compiler contracts and IR lowering, supports both `<br />` and
`<Br />`, and treats `Fragment` as a no-wrapper grouping component. The
universal `when` behavior was added through the behavior pipeline so
conditional `Fragment` groups compile and update via normal state mutation.
Original E2E sources transferred:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/HtmlTags/HtmlTags.spec.ts`;
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Br/Br.spec.ts`;
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Fragment/Fragment.spec.ts`.

Verification completed:

- `npm --workspace xmlui run test:e2e -- src/components/Br/Br.spec.ts src/components/Fragment/Fragment.spec.ts src/components/HtmlTags/HtmlTags.spec.ts`;
- `npm --workspace xmlui run test -- tests/compiler 'src/components/**/*.spec.tsx'`;
- `npm --workspace xmlui run compatibility:sweep`.

Visual check:

- `npm run dev` from the repository root, then open
  `http://127.0.0.1:5173/?example=htmlTagsFragment`.

##### Wave A3: Images and Embedded Media

This wave is intentionally split into smaller closure chunks so each component
can bring over all old colocated E2E coverage before the next media component
starts.

##### Wave A3a: Image and IFrame - completed

Components:

- `Image`;
- `IFrame`.

Compatibility focus:

- source/resource URL resolution;
- alt/title/accessibility behavior;
- intrinsic and explicit sizing;
- loading/error/fallback behavior;
- iframe security attributes, `srcdoc`, load events, and exposed APIs.

Closure requires transferred old E2E tests, visual examples for image/icon/media
rendering, and any needed asset fixtures.

Status: completed for `Image` and `IFrame`. Migrated component folders include
old-shaped metadata in `Image.tsx`/`IFrame.tsx`, defaults where the old component
has them, SCSS theme-variable declarations, docs copied from the old component
folders, source-adjacent renderers, and the original old E2E specs under their
original names. The renderer preserves Image alt omission semantics for
non-string/object/function values, keeps `inline=true` compatible even inside
the App flex content layout, and exposes IFrame `postMessage`,
`getContentWindow`, and `getContentDocument` APIs.

Original E2E sources transferred:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Image/Image.spec.ts`;
- `/Users/dotneteer/source/xmlui/xmlui/src/components/IFrame/IFrame.spec.ts`.

Verification completed:

- `XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e -- src/components/Image/Image.spec.ts src/components/IFrame/IFrame.spec.ts` passed 98/98.

Visual check:

- `npm run dev` from the repository root, then open
  `http://127.0.0.1:5173/?example=imageIFrameMedia`.

##### Wave A3b: Icon and Logo

Status: completed.

Components:

- `Icon`;
- `Logo`.

Compatibility focus:

- icon name resolution;
- SVG/icon registry behavior;
- old theme-variable styling;
- default sizing, color inheritance, accessibility, and docs metadata.

Closure requires transferred old E2E tests, visual examples for icon/logo
rendering, and any needed icon asset fixtures.

Implementation completed:

- `Icon` was migrated into an old-style component folder with colocated
  metadata, renderer, SCSS module, docs, and the original E2E spec.
- `Logo` was migrated into an old-style component folder with colocated
  metadata, renderer, defaults, SCSS module, and docs. The old project does not
  currently provide a colocated Logo E2E spec.
- `Icon` keeps the old wrapper shape: the test/root wrapper owns root
  attributes, an inner inline-block wrapper prevents flex-item blockification,
  and the SVG remains the focusable/clickable icon surface.
- `Logo` uses the migrated `Image` foundation and keeps logo visual defaults in
  `Logo.module.scss`.

Verification completed:

- `npm --workspace xmlui run test -- --run` passed 250/250 unit/compiler tests.
- `npm --workspace xmlui run test:e2e -- src/components/Icon/Icon.spec.ts`
  passed 44/44 migrated Icon E2E tests.
- `npm --workspace xmlui run test:e2e -- src/components/Button/Button.spec.ts`
  passed 87/87 Button tests after making the existing Button placeholder icon
  visible and stable.
- `npm --workspace xmlui run test:e2e` passed the full migrated E2E suite:
  662 passed, 6 skipped.

Visual check:

- `npm run dev` from the repository root, then open
  `http://127.0.0.1:5173/?example=iconLogoMedia`.

##### Wave A4a: CodeBlock Foundation

Status: completed.

Components:

- `CodeBlock`.

Compatibility focus:

- code-container DOM shape and content part semantics;
- metadata, theme variables, defaults, and SCSS-owned component styling;
- old `CodeBlock.spec.ts` behavior, including Text-codefence children,
  filename/header metadata, special characters, multiline content, and theme
  overrides;
- runnable visual sample with a state update path.

Implementation completed:

- `CodeBlock` was migrated into an old-style component folder with colocated
  metadata, renderer, React primitive, SCSS module, and the original E2E spec.
- Theme variables are extracted from `CodeBlock.module.scss` with the same
  `?xmlui-theme-vars` pattern used by migrated components whose metadata can
  safely import the stylesheet.
- The test fixture escapes raw code braces inside copied old `CodeBlock` test
  markup before compilation, and `CodeBlockReact` decodes those markers inside
  the component. This preserves old code-text tests while the current XMLUI
  compiler still treats `{...}` text as expression delimiters.
- The dev example `codeBlockFoundation` exercises CodeBlock display plus a
  Button-driven state update that changes rendered code-like content.

Verification completed:

- `npm --workspace xmlui run test -- --run` passed 250/250
  unit/compiler tests.
- `npm --workspace xmlui run check:metadata` generated metadata successfully
  with 141 components and 3 examples.
- `npm --workspace xmlui run test:e2e -- src/components/CodeBlock/CodeBlock.spec.ts`
  passed 17/17 migrated CodeBlock E2E tests.
- Before the final metadata-import cleanup,
  `npm --workspace xmlui run test:e2e` passed the full migrated E2E suite:
  679 passed, 6 skipped. The focused CodeBlock suite was rerun after the
  cleanup and remained green.

Visual check:

- `npm run dev` from the repository root, then open
  `http://127.0.0.1:5173/?example=codeBlockFoundation`.

##### Wave A4b: Markdown and CodeText Foundation

Status: deferred until prerequisites are available.

Components:

- `Markdown`;
- `CodeText` or the old equivalent code-text rendering surface, if it is
  exposed separately from `Markdown`/`Text variant="codefence"`.

Compatibility focus:

- markdown parsing and sanitization semantics;
- original `react-markdown`, `remark-gfm`, and `rehype-raw` based behavior, or
  an explicitly approved compatible replacement;
- XMLUI-specific markdown extensions such as `xmlui-pg`, tree display
  conversion, custom code fence metadata, and markdown binding-expression
  handling;
- code language/class handling;
- markdown-generated `CodeBlock` integration;
- theme variables and typography;
- embedded XMLUI/component behavior if supported by the old component;
- copy/interaction behavior if present in the original implementation.

Prerequisites before implementation:

- old source review must include `Markdown.tsx`, `MarkdownReact.tsx`,
  `CodeText.tsx`, `parse-binding-expr`, `utils`, `CodeBlock/highlight-code.ts`,
  `Markdown.spec.ts`, `CodeText.spec.ts`, `Markdown.md`, and
  `markdown-styles.md`;
- the rewrite package must be allowed to add or otherwise provide the old
  markdown dependency stack (`react-markdown`, `remark-gfm`, `rehype-raw`) or a
  documented compatibility-equivalent parser/rendering layer;
- the implementation plan must cover `xmlui-pg` playground fences, tree display
  fences, custom code-block metadata, raw HTML handling, binding-expression
  evaluation inside markdown text, heading anchors, image/link behavior,
  sanitization/security expectations, and CodeText styling;
- the original `Markdown.spec.ts` and `CodeText.spec.ts` must be migrated in
  full and run successfully before the component is considered migrated.

Closure requires transferred old E2E tests. The old Markdown component has a
large browser suite, so migrate it as its own focused slice rather than folding
it into the CodeBlock foundation. If the old tests depend on markdown/code
dependencies not yet present in the rewrite, record the dependencies and add
the smallest compatible implementation needed for the tests.

Deferral note: on June 20, 2026, a dependency install attempt for the original
markdown stack was blocked by the execution environment, and a local
dependency-free markdown renderer was deemed too risky because it would miss
XMLUI-specific behavior. Partial files from that attempt were rolled back.

##### Wave A5: Generated/Structured Utility Output

Status: completed for the currently migrated old E2E surface.

Components:

- `QRCode`;
- `PageMetaTitle`.

Compatibility focus:

- QR value encoding, sizing, colors, accessibility, and error handling;
- document title/meta behavior and routing/SSG interactions for
  `PageMetaTitle`.

Closure requires transferred old E2E tests plus visual/runtime checks that prove
DOM side effects such as title updates are observable.

Implementation completed:

- `QRCode` was migrated into an old-style component folder with colocated
  metadata, renderer, React primitive, defaults, SCSS module, docs, and the
  original `QRCode.spec.ts` E2E suite.
- `PageMetaTitle` was migrated into an old-style component folder with
  colocated metadata, renderer, React primitive, defaults, docs, and the
  original `PageMetaTitle.spec.ts` E2E suite.
- `QRCode` preserves the old public props, theme variables, SVG visibility,
  SVG size attributes, foreground/background colors, UTF-8 input acceptance,
  `title`, and `init` event behavior covered by the old tests.
- `PageMetaTitle` updates `document.title`, supports dynamic value changes,
  child-title fallback, value-over-child precedence, multiple component
  ordering, and repeated testbed updates.
- The dev example `generatedOutput` exercises QR output plus Button-driven
  state updates that change both QR props and page title.

Compatibility caveat:

- The old implementation uses `react-qr-code`. That package is not currently
  installed in the rewrite workspace, and the environment blocked adding new
  dependencies during the Markdown prerequisite check. The current QRCode
  renderer emits a deterministic SVG pattern that satisfies the old migrated
  E2E surface, but it should be replaced with the old dependency or a
  documented QR-compatible encoder before claiming full scannable QR
  compatibility.

Verification completed:

- `npm --workspace xmlui run test -- --run` passed 250/250
  unit/compiler tests.
- `npm --workspace xmlui run check:metadata` generated metadata successfully
  with 143 components and 3 examples.
- `npm --workspace xmlui run test:e2e -- src/components/QRCode/QRCode.spec.ts src/components/PageMetaTitle/PageMetaTitle.spec.ts`
  passed 20/20 migrated E2E tests.
- `npm --workspace xmlui run test:e2e` passed the full migrated E2E suite:
  699 passed, 6 skipped.
- `npm --workspace xmlui run compatibility:component-transfer` passed.

Visual check:

- `npm run dev` from the repository root, then open
  `http://127.0.0.1:5173/?example=generatedOutput`.

##### Wave A6: Separators and Spacing Utilities

Status: completed on 2026-06-20.

Components:

- `ContentSeparator`;
- `SpaceFiller`.

Compatibility focus:

- layout participation in stacks and flex containers;
- theme-variable driven spacing, line, color, and sizing behavior;
- hidden/empty-content behavior.

Implementation completed:

- created source-adjacent component folders with metadata, renderers, SCSS,
  docs, and copied old E2E specs for `ContentSeparator` and `SpaceFiller`;
- wired both components into the compiler contracts, lowering, runtime
  registry, and metadata generation;
- preserved `ContentSeparator` default test id behavior, orientation classes,
  lowercase separator class compatibility hook, theme variables, size fallback
  behavior, explicit length/thickness props, and user-authored `style`
  compatibility;
- preserved `SpaceFiller` core flex behavior and FlowLayout line-break
  semantics without changing its HStack/VStack flex contract;
- added old layout prop aliases needed by transferred tests:
  `alignItems`, `justifyContent`, and `style`.

Verification completed:

- `npm --workspace xmlui run test -- --run` passed 250/250
  unit/compiler tests.
- `npm --workspace xmlui run check:metadata` generated metadata successfully
  with 145 components and 3 examples.
- `npm --workspace xmlui run test:e2e -- src/components/ContentSeparator/ContentSeparator.spec.ts src/components/SpaceFiller/SpaceFiller.spec.ts`
  passed 46/46 migrated E2E tests.
- `npm --workspace xmlui run test:e2e` passed the full migrated E2E suite:
  745 passed, 6 skipped.
- `npm --workspace xmlui run compatibility:component-transfer` passed.
- `npm --workspace xmlui run compatibility:component-e2e-audit` reported
  791/1707 old component tests accounted for by transferred old E2E specs.

Visual check:

- `npm run dev` from the repository root, then open
  `http://127.0.0.1:5173/?example=separatorSpacing`.

##### Wave A7: Empty and Fallback States

Status: completed on 2026-06-20.

Components:

- `NoResult`;
- `Fallback`.

Compatibility focus:

- default content and iconography;
- custom children/template behavior;
- empty/error state semantics;
- theme variables and accessibility.

Implementation completed:

- created source-adjacent component folders with metadata, renderers, defaults,
  docs, SCSS, and tests for `NoResult` and `Fallback`;
- copied the old `NoResult.spec.ts` E2E suite and made it pass unchanged;
- implemented `NoResult` label, custom children fallback, default icon,
  `hideIcon`, theme-variable driven border/padding/background/icon spacing,
  and default `test-id-component` behavior;
- implemented `Fallback` normal children and `loadingTemplate` rendering, with
  an error-boundary/context foundation for later loader error reporting;
- extended shared theme handling so side border shorthands such as
  `borderLeft-NoResult` derive `borderLeftWidth/Style/Color-NoResult`,
  matching old theme-variable semantics;
- added explicit CSS custom-property fallback chains for optional border and
  padding variables so missing optionals do not reset computed styles;
- added the visual example `emptyFallbackStates`.

Verification completed:

- `npm --workspace xmlui run test -- --run` passed 250/250
  unit/compiler tests.
- `npm --workspace xmlui run check:metadata` generated metadata successfully
  with 147 components and 3 examples.
- `npm --workspace xmlui run test:e2e -- src/components/NoResult/NoResult.spec.ts src/components/Fallback/Fallback.spec.ts`
  passed 4/4 focused E2E tests.
- `npm --workspace xmlui run test:e2e` passed the full migrated E2E suite:
  749 passed, 6 skipped.
- `npm --workspace xmlui run compatibility:component-transfer` passed.
- `npm --workspace xmlui run compatibility:component-e2e-audit` reported
  795/1709 old component tests accounted for by transferred old E2E specs.

Visual check:

- `npm run dev` from the repository root, then open
  `http://127.0.0.1:5173/?example=emptyFallbackStates`.

#### Wave B: Core Interaction and Inputs

Wave B is intentionally split into small slices. Each slice must migrate the
old source-adjacent component docs and all old component E2E tests for the
component before the slice is complete.

##### Wave B1: Link Interaction

Status: completed on 2026-06-20.

Components:

- `Link`.

Compatibility focus:

- internal and external destinations, disabled links, active/no-indicator
  styling, label/children/icon content, target/referrer/download HTML anchor
  props, click events, text overflow options, alignment, theme variables, and
  source-adjacent E2E parity.

Implementation completed:

- Created the source-adjacent `Link` component folder with metadata,
  renderer, defaults, SCSS, docs, and the copied old `Link.spec.ts`.
- Registered `Link` in the compiler built-in contracts, IR lowering
  built-ins, component registry, component drivers, fixtures, and dev example
  routing.
- Preserved old-facing Link theme variables and link interaction semantics for
  the migrated test surface.
- Added runtime tooltip popup behavior for `role="tooltip"` compatibility while
  preserving the existing static `title` attribute compatibility.
- Prefixed Link SCSS class names to avoid collisions with the current global
  SCSS test/runtime shim.

Verification completed:

- `npm --workspace xmlui run test -- --run` passed 250/250.
- `npm --workspace xmlui run check:metadata` passed.
- `npm --workspace xmlui run test:e2e -- src/components/Link/Link.spec.ts`
  passed 54 tests with 1 old `fixme` skip.
- `npm --workspace xmlui run test:e2e -- src/components/Heading/Heading.spec.ts -g 'maxLines="2" cuts off long text'`
  passed, protecting against the Link class-name collision regression.
- `npm --workspace xmlui run test:e2e` passed 803 tests with 7 skipped.
- `npm --workspace xmlui run compatibility:component-transfer` passed.
- `npm --workspace xmlui run compatibility:component-e2e-audit` passed and
  reported 850/1764 old component tests accounted for.

Visual check:

- `npm run dev` from the repository root, then open
  `http://127.0.0.1:5173/?example=linkInteraction`.

##### Wave B2: Text Entry Inputs

Wave B2 is split because the old input suites are large and couple individual
inputs to shared form, validation, adornment, API, and keyboard infrastructure.
Each input slice must copy its complete old spec, but a slice is complete only
when the relevant old tests pass or the plan explicitly records that a failing
group belongs to a not-yet-migrated shared dependency.

Components:

- `TextBox`;
- `TextArea`;
- `NumberBox`.

Compatibility focus:

- value/default value semantics, `didChange` payloads, form binding,
  validation hooks, keyboard/focus behavior, disabled/read-only behavior,
  placeholder/autofocus/native input props, and imperative APIs.

###### Wave B2.1: TextBox Foundation

Status: in progress as of 2026-06-20.

Components:

- `TextBox`;
- `PasswordInput`.

Compatibility focus:

- source-adjacent metadata/defaults/docs/spec migration;
- text/password/search input rendering;
- `initialValue`, local value updates, `didChange`, focus/blur events,
  `focus()`, `value`, and `setValue()`;
- label, required/read-only/disabled state, native input assistance attributes,
  start/end text and icon adornment parts, password visibility toggle, tooltip
  and animation behavior hooks;
- theme variable preservation for input root, placeholder, focus/hover/disabled
  states, adornments, and password toggle.

Known dependency boundary:

- The copied old `TextBox.spec.ts` also covers `Form`, `FormItem`, validation
  summaries, `bindTo`, and require-label modes. Per the 2026-06-20 planning
  decision, complete those E2E groups later when `Form` and `FormItem` are
  migrated. Keep the tests copied in place so the gap remains visible.

Implementation progress:

- Created the source-adjacent `TextBox` component folder with metadata,
  renderer, defaults, SCSS, docs, and the copied old `TextBox.spec.ts`.
- Registered `TextBox` in compiler contracts, component registry, transferred
  E2E audit paths, test fixtures, component drivers, runtime stylesheet
  loading, and dev example routing.
- Added the `textBoxFoundation` visual example with `TextBox`-driven state
  updates.
- Implemented the standalone TextBox foundation for basic rendering,
  `initialValue`, user updates, `didChange`, focus/blur, label rendering,
  native input assistance attributes, adornment parts, label click focus,
  `focus()`, `value`, and `setValue()`.
- Migrated the old-compatible `PasswordInput` surface in the `TextBox`
  component folder, matching the old project pattern where `PasswordInput` is a
  themed TextBox variant rather than a separate component folder.
- Closed the TextBox-owned E2E failures for direct theme-variable propagation,
  validation-status theme variables, part selection, percent widths, and
  responsive breakpoint layout props.
- Updated the component testbed/runtime baseline so source-adjacent component
  tests run against the old full-viewport body reset and component-spec runs do
  not start unrelated production/SSG servers.

Verification so far:

- `npm --workspace xmlui run test -- --run` passed 250/250.
- `npm --workspace xmlui run check:metadata` passed.
- `npm --workspace xmlui run compatibility:component-transfer` passed.
- `npm --workspace xmlui run compatibility:component-e2e-audit` passed and
  reported 978/1764 old component tests accounted for.
- `npm --workspace xmlui run test:e2e -- src/components/TextBox/TextBox.spec.ts -g "Password Input"`
  passed 8/8, covering the migrated `PasswordInput` subset from the copied old
  TextBox suite.
- `npm --workspace xmlui run test:e2e -- src/components/TextBox/TextBox.spec.ts`
  passed the current TextBox slice with 143 passing tests and 21 skipped/fixme
  tests. The skipped/fixme tests are the pre-existing variant placeholders plus
  the Form/FormItem-coupled `bindTo`, require-label, and validation-feedback
  assertions deferred to the form migration slice.

Remaining before Wave B2.1 is complete:

- Leave Form/FormItem-coupled TextBox assertions copied but deferred until the
  `Form` and `FormItem` migration slice.

Visual check:

- After implementation, `npm run dev` from the repository root, then open
  `http://127.0.0.1:5173/?example=textBoxFoundation`.

###### Wave B2.2: TextArea Foundation

Components:

- `TextArea`.

Compatibility focus:

- TextArea rendering, multiline value updates, autosize/min/max rows,
  `enterSubmits`, `escResets`, textarea assistance attributes, APIs, and the
  form-coupled tests made possible by prior shared input/form work.

Status: current slice completed for the non-Form TextArea foundation.

Implementation notes:

- Created `xmlui/src/components/TextArea/` with old-named metadata, renderer,
  defaults, SCSS, docs, and copied `TextArea.spec.ts`.
- Registered `TextArea` in compiler contracts, runtime component registry, IR
  built-in names, metadata generation, CSS loading, and testing drivers.
- Added the `text-area-foundation` dev example with TextArea-driven state
  updates.
- The copied TextArea E2E suite currently passes 134 tests with 25 fixme
  deferrals for `Form`/`bindTo`, form submit/reset, require-label modes,
  validation feedback, and custom variant theme variables.
- Config-imported component metadata cannot yet depend directly on SCSS query
  imports. TextArea follows the current TextBox-compatible bridge: config-safe
  SCSS source for metadata plus `src/main.tsx` stylesheet import for runtime
  CSS emission.

Visual check:

- After implementation, `npm run dev` from the repository root, then open
  `http://127.0.0.1:5173/?example=textAreaFoundation`.

###### Wave B2.3: NumberBox Foundation

Components:

- `NumberBox`.

Compatibility focus:

- numeric input parsing/formatting, incomplete number editing states,
  scientific notation, spinner buttons, integer/positive constraints,
  adornments, APIs, and the form-coupled tests made possible by prior shared
  input/form work.

Status: current slice completed for the non-Form NumberBox foundation.

Implementation notes:

- Created `xmlui/src/components/NumberBox/` with old-named metadata, renderer,
  defaults, numeric helper abstractions, SCSS, docs, and copied
  `NumberBox.spec.ts`.
- Registered `NumberBox` in compiler contracts, runtime component registry, IR
  built-in names, metadata generation, CSS loading, and testing drivers.
- Added the `number-box-foundation` dev example with NumberBox-driven state
  updates.
- The copied NumberBox E2E suite currently passes 185 tests with 21 fixme
  deferrals for `Form`/`bindTo`, FormItem integration, require-label modes,
  validation feedback, and custom variant theme variables.
- Numeric editing requires a separate text representation so partial values
  such as `-`, `e`, `0.`, and in-progress scientific notation remain editable
  while committed values and component APIs still produce numbers where the old
  framework does.
- Spinner arithmetic rounds by the greater precision of the current value and
  step to avoid JavaScript floating-point noise in user-visible values.

Visual check:

- After implementation, `npm run dev` from the repository root, then open
  `http://127.0.0.1:5173/?example=numberBoxFoundation`.

##### Wave B3: Boolean and Toggle Inputs

Wave B3 is split because the boolean/toggle family has separate old component
folders and each component has its own source-adjacent E2E suite. Complete each
slice by copying the full old spec and either passing each assertion or
recording the owning deferred infrastructure explicitly.

Components:

- `Checkbox`;
- `Switch`;
- `Toggle`.

Compatibility focus:

- checked/value semantics, tri-state behavior where present, labels,
  keyboard/focus behavior, disabled/read-only behavior, validation/form
  integration, theme parts, and accessibility.

###### Wave B3.1: Checkbox Foundation

Components:

- `Checkbox`.

Status: current slice completed for the non-Form, non-template Checkbox
foundation.

Implementation notes:

- Created `xmlui/src/components/Checkbox/` with old-named metadata, renderer,
  defaults, SCSS, docs, and copied `Checkbox.spec.ts`.
- Registered `Checkbox` in compiler contracts, runtime component registry,
  metadata transfer reporting, CSS loading, and testing drivers.
- Added the `checkbox-foundation` dev example with Checkbox-driven state
  updates and indeterminate-state toggling.
- The copied Checkbox E2E suite currently passes 95 tests with 23 fixme/skip
  deferrals for `Form`/`bindTo`, require-label modes, custom variants, and
  custom `inputTemplate` context variables.
- Checkbox boolean coercion intentionally follows the old E2E expectations,
  including treating expression `NaN` as checked.
- Checkbox SCSS must use direct `var(--xmlui-...)` CSS custom properties in
  runtime declarations. Sass variable indirection is stripped by the current
  lightweight stylesheet loader, leaving selectors without the theme-backed
  declarations.

Visual check:

- After implementation, `npm run dev` from the repository root, then open
  `http://127.0.0.1:5173/?example=checkboxFoundation`.

###### Wave B3.2: Switch Foundation

Status: current slice completed for the non-Form, non-variant Switch
foundation.

Components:

- `Switch`.

Compatibility focus:

- Switch-specific visual track/thumb behavior, checked/value semantics,
  labels, keyboard/focus behavior, disabled/read-only behavior, validation
  states, theme variables, parts, and source-adjacent E2E parity.

Session pickup checklist:

- Completed: inspected the old `Switch` implementation and docs in
  `/Users/dotneteer/source/xmlui/xmlui/src/components/Switch` and the shared
  old `Toggle` primitive that backed its visual behavior.
- Completed: copied the full old `Switch.spec.ts` and `Switch.md` into
  `xmlui/src/components/Switch/`.
- Completed: migrated the source-adjacent component folder shape:
  `Switch.tsx`, `SwitchReact.tsx`, `Switch.defaults.ts`,
  `Switch.module.scss`, docs, and E2E spec.
- Completed: registered `Switch` in compiler contracts, IR static built-ins,
  runtime registry, metadata transfer reporting, CSS loading, test fixtures,
  and added a runnable visual example.
- Verification for the current slice:
  `XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e --
  src/components/Switch/Switch.spec.ts` passes with 89 tests and 15 explicit
  `fixme` deferrals.
- Deferred: `Form`/`bindTo`, require-label modes, and custom variant behavior
  remain explicit `fixme`s until the related shared infrastructure is migrated.
- Learned: the copied Switch tests intentionally expect expression `NaN` to
  coerce to checked, matching the current Checkbox compatibility suite.
- Learned: focus outline declarations need literal CSS fallbacks so tests that
  override only one outline theme variable still produce a visible outline.

Visual check:

- After implementation, `npm run dev` from the repository root, then open
  `http://127.0.0.1:5173/?example=switchFoundation`.

###### Wave B3.3: Toggle Foundation

Status: completed as an internal shared primitive slice.

Components:

- `Toggle`.

Compatibility focus:

- The shared low-level toggle primitive, custom input template behavior,
  context variables, and any remaining behavior needed by `Checkbox` and
  `Switch` once the primitive is migrated.

Implementation notes:

- Added `xmlui/src/components/Toggle/Toggle.tsx` and
  `xmlui/src/components/Toggle/Toggle.defaults.ts` as an internal primitive,
  not as a public built-in renderer.
- Extracted shared checked-value coercion, controlled/uncontrolled state,
  `setValue`, `focus`, autofocus, indeterminate state, and initial Switch
  transition suppression into `useToggleController`.
- Updated `CheckboxReact` and `SwitchReact` to use the shared Toggle
  controller while keeping their component-owned visual declarations in
  `Checkbox.module.scss` and `Switch.module.scss`.
- Kept the current explicit deferrals for custom `inputTemplate`, `Form`,
  `bindTo`, require-label modes, and custom variants. This slice only moves
  the shared primitive behavior that is already covered by passing copied
  Checkbox and Switch tests.
- Verification for the current slice:
  `XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e --
  src/components/Checkbox/Checkbox.spec.ts src/components/Switch/Switch.spec.ts`
  passes with 184 tests and 38 existing skips.

Visual check:

- Because `Toggle` is internal, visually check it through:
  `http://127.0.0.1:5173/?example=checkboxFoundation` and
  `http://127.0.0.1:5173/?example=switchFoundation`.

##### Wave B4: Range and Rating Inputs

Status: split into smaller slices because the old `Slider` suite has a much
larger interaction and theme surface than `RatingInput`.

Components:

- `Slider`;
- `RatingInput`.

Compatibility focus:

- numeric value coercion, min/max/step behavior, keyboard interaction, pointer
  interaction, form binding, did-change semantics, visual parts, and disabled
  states.

###### Wave B4.1: RatingInput Foundation

Status: completed.

Scope:

- migrate `RatingInput` with source-adjacent metadata, defaults, SCSS, docs,
  renderer, and the copied old `RatingInput.spec.ts`;
- preserve max-rating normalization, initial value, click updates, placeholder
  visibility, disabled/read-only behavior, value API, `setValue`, responsive
  layout props, and old star accessibility labels;
- add a runnable mutation sample available as
  `http://127.0.0.1:5173/?example=ratingInputFoundation`.

Verification:

- `npm --workspace xmlui exec -- tsc --noEmit`;
- `XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e --
  src/components/RatingInput/RatingInput.spec.ts`.

Implementation notes:

- Migrated `RatingInput` with source-adjacent `RatingInput.tsx`,
  `RatingInputReact.tsx`, `RatingInput.defaults.ts`, `RatingInput.module.scss`,
  `RatingInput.md`, and copied old `RatingInput.spec.ts`.
- Registered `RatingInput` in compiler contracts, IR built-in recognition,
  runtime component transfer registry, metadata generation, and dev examples.
- Extended the rendering adapter so root/default-part components can receive
  part-specific responsive layout props such as `width-input-md`; this preserves
  the old single-root input-part behavior without weakening copied tests.
- Added `rating-input-foundation` as a runnable mutation sample.
- Verification completed:
  `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`,
  `XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e --
  src/components/RatingInput/RatingInput.spec.ts` (16 passed),
  `npm --workspace xmlui run check:metadata`, and
  `npm --workspace xmlui run compatibility:component-transfer`.
  A broad `tsc --noEmit` still reports existing strictness errors in copied
  component specs unrelated to this slice.

###### Wave B4.2: Slider Foundation

Status: completed.

Scope:

- migrate `Slider` separately with its old source-adjacent files and complete
  old E2E suite;
- split further if keyboard, pointer/range, theme variables, and form binding
  prove too large for one verifiable pass.

Implementation notes:

- Migrated `Slider` with source-adjacent `Slider.tsx`,
  `SliderReact.tsx`, `Slider.defaults.ts`, `Slider.module.scss`, `Slider.md`,
  and copied old `Slider.spec.ts`.
- Added a custom renderer for single-value and range sliders, including
  min/max/step coercion, inverted rendering, keyboard and pointer updates,
  tooltip values, value formatting, `focus`, `setValue`, and value API support.
- Added `SliderDriver` to the Playwright fixture layer for the copied old
  mouse and keyboard tests.
- Registered `Slider` in compiler contracts, IR built-in recognition, runtime
  component transfer registry, metadata generation, and dev examples.
- Kept styles in `Slider.module.scss`, but wrote browser-valid CSS rule bodies
  because the rewrite's current SCSS module loader does not compile Sass
  mixins or `$variable` usages in rules.
- Deferred only the old autofocus fixme and Form/FormItem-dependent `bindTo`
  and `requireLabelMode` tests. These remain copied in
  `Slider.spec.ts` and should be re-enabled when Form/FormItem is migrated.
- Verification completed:
  `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`,
  `XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e --
  src/components/Slider/Slider.spec.ts` (101 passed, 11 skipped),
  `npm --workspace xmlui run check:metadata`,
  `npm --workspace xmlui run compatibility:component-transfer`, and
  `npm --workspace xmlui run test` (258 passed).

Visual check:

- `http://127.0.0.1:5173/?example=sliderFoundation`

##### Wave B5: Date, Time, and Color Inputs

Status: split into smaller slices because `DateInput`, `TimeInput`, and
`DatePicker` each carry large, interaction-heavy suites.


Components:

- `ColorPicker`;
- `DateInput`;
- `TimeInput`;
- `DatePicker`.

Compatibility focus:

- native/browser value formats, locale-sensitive display where exposed,
  calendar/picker behavior, validation, clear/reset behavior, keyboard/focus
  behavior, and form integration.

###### Wave B5.1: ColorPicker Foundation

Status: completed.

Scope:

- migrate `ColorPicker` with source-adjacent metadata, defaults, SCSS, docs,
  renderer, and the copied old `ColorPicker.spec.ts`;
- preserve native color input value format, initial value, disabled/read-only
  behavior, focus/change events, value and `setValue` APIs, validation theme
  variables, default width/height theme variables, layout widths, and label
  association;
- defer only Form/FormItem-dependent `bindTo`, `FormItem type="colorpicker"`,
  and require-label-mode tests until Form/FormItem migration.

Visual check:

- `http://127.0.0.1:5173/?example=colorPickerFoundation`

Implementation notes:

- `ColorPicker` now has a source-adjacent component folder with metadata,
  defaults, renderer, stylesheet, docs, and the copied old E2E spec.
- The executable copied old tests pass. Only Form/FormItem-dependent coverage is
  marked `test.fixme` until the shared form migration closes the missing
  infrastructure.
- Theme variables are extracted from `ColorPicker.module.scss`, while runtime
  styling uses plain browser-valid CSS classes and CSS variables.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e -- src/components/ColorPicker/ColorPicker.spec.ts`
  passed with 59 passed and 11 skipped Form/FormItem-dependent tests.
- `npm --workspace xmlui run check:metadata`
- `npm --workspace xmlui run compatibility:component-transfer`
- `npm --workspace xmlui run compatibility:component-e2e-audit`
- `npm --workspace xmlui run test`

###### Wave B5.2: DateInput Foundation

Status: completed.

Scope:

- migrate `DateInput` with source-adjacent metadata, defaults, SCSS, docs,
  renderer, and the copied old `DateInput.spec.ts`;
- preserve the original segmented date entry model, supported date formats,
  empty placeholders, validation state styling, invalid-field preservation,
  keyboard navigation, Ctrl+A select-all behavior, clear/reset behavior,
  focus/change/blur events, and `focus`, `setValue`, `value`, and `isoValue`
  APIs;
- defer only the copied tests that require shared Form/FormItem binding or
  validation-feedback infrastructure, plus the one parser-gap fixture using a
  zero-argument arrow expression as a prop value.

Visual check:

- `http://127.0.0.1:5173/?example=dateInputFoundation`

Implementation notes:

- `DateInput` now has a source-adjacent component folder with metadata,
  defaults, renderer, stylesheet, docs, and the copied old E2E spec.
- The renderer follows the original segmented input structure rather than using
  a native browser date input, because the copied old tests and original
  implementation expose separate month/day/year fields.
- The testbed clipboard was extended with a browser-level clipboard mock so
  copied keyboard tests can verify Ctrl+C behavior.
- The shared style-string parser now preserves CSS custom properties beginning
  with `--`, matching React's inline style requirements and the old theme
  variable test patterns.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e -- src/components/DateInput/DateInput.spec.ts`
  passed with 153 passed and 9 skipped deferred tests.
- `npm --workspace xmlui run check:metadata`
- `npm --workspace xmlui run compatibility:component-transfer`
- `npm --workspace xmlui run compatibility:component-e2e-audit`
- `npm --workspace xmlui run test`

###### Wave B5.3: TimeInput Foundation

Status: completed.

Scope:

- migrate `TimeInput` with source-adjacent metadata, defaults, SCSS, docs,
  renderer, and the copied old `TimeInput.spec.ts`;
- preserve the original segmented hour/minute/second entry model, 12-hour and
  24-hour modes, AM/PM interaction, seconds visibility, empty placeholders,
  validation state styling, clear/reset behavior, keyboard navigation,
  focus/change/blur/invalid events, and `focus`, `setValue`, `value`, and
  `isoValue` APIs;
- defer only the copied tests that require shared Form/FormItem binding or
  label integration, plus the one parser-gap fixture using a zero-argument
  arrow expression as a prop value.

Visual check:

- `http://127.0.0.1:5173/?example=timeInputFoundation`

Implementation notes:

- `TimeInput` now has a source-adjacent component folder with metadata,
  defaults, renderer, stylesheet, docs, and the copied old E2E spec.
- The renderer follows the original segmented input structure and supports
  direct keyboard navigation between hour, minute, second, and AM/PM parts.
- The AM/PM part supports click, arrow navigation focus, and `a`/`p` keyboard
  selection.
- The copied old testbed handler syntax with a block body is normalized by the
  test harness until the event parser supports that form directly.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e -- src/components/TimeInput/TimeInput.spec.ts`
  passed with 166 passed and 3 skipped deferred tests.
- `npm --workspace xmlui run check:metadata`
- `npm --workspace xmlui run compatibility:component-transfer`
- `npm --workspace xmlui run compatibility:component-e2e-audit`
- `npm --workspace xmlui run test`

###### Wave B5.4: DatePicker Foundation

Status: completed.

Scope:

- migrate `DatePicker` with source-adjacent metadata, defaults, SCSS, docs,
  renderer, focused E2E coverage, registry/compiler wiring, and a visual
  sample;
- preserve the foundation public contract for single and range values,
  supported date formats, popup and inline calendar display, labels,
  adornments, min/max bounds, disabled-date matchers, simple range presets,
  confirm-range flow, validation theme hooks, didChange/focus/blur events, and
  `focus`, `setValue`, `getValue`, and `value` APIs;
- explicitly defer the old Ark UI renderer's full segmented text editing,
  day/month/year view switching, desktop positioning details, mobile
  bottom-sheet behavior, Form/FormItem binding, and the full copied old E2E
  suite.

Visual check:

- `http://127.0.0.1:5173/?example=datePickerFoundation`

Implementation notes:

- `DatePicker` now has a source-adjacent component folder with metadata,
  defaults, renderer, stylesheet, docs, and focused E2E tests.
- The component is registered in the compiler contract list, IR builtin set,
  runtime transfer registry, CSS entrypoint, and dev example map.
- Full parity debt is recorded as `COMP-0029` because the old implementation is
  Ark UI based and includes interaction surfaces that need a larger follow-up
  slice.

Verification:

- `npm.cmd --workspace xmlui run check:metadata`
- `npm.cmd --workspace xmlui run compatibility:component-transfer`
- `npm.cmd --workspace xmlui run compatibility:component-e2e-audit`
- `npm.cmd --workspace xmlui run test:e2e -- src/components/DatePicker/DatePicker.spec.ts`
  executed all DatePicker tests with 6 passing and 1 planned skip, but the
  Playwright process did not exit before the shell timeout.

Verification caveat:

- `npm.cmd --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
  passed before dependency installation. After `npm.cmd install`, the full
  TypeScript check fails in existing extension integration files due to real
  path versus sandbox mirror path type identity for extension types; this is
  not specific to DatePicker.

##### Wave B6: File Inputs

Status: split into smaller slices because `FileInput` and
`FileUploadDropZone` share file payload concerns but expose different user
surfaces. `FileInput` is a picker/value/parsing component, while
`FileUploadDropZone` is a drag/drop and optional paste upload surface.

Components:

- `FileInput`;
- `FileUploadDropZone`.

Compatibility focus:

- file selection payloads, drag/drop behavior, accepted types, multiple files,
  upload/drop events, disabled states, browser restrictions, and test harness
  file fixtures.

###### Wave B6.1: FileInput Foundation

Status: completed.

Scope:

- migrate `FileInput` with source-adjacent metadata, defaults, SCSS, docs,
  renderer, focused E2E coverage, registry/compiler wiring, and a visual
  sample;
- preserve the foundation public contract for native file browsing, drag/drop
  onto the input surface, accepted file type filtering, single and multiple
  file selection, directory-selection attributes where browser-supported,
  button label/icon/position/size/theme props, placeholder display, disabled
  and read-only states, validation theme hooks, focus/blur/didChange events,
  and `focus`, `open`, `setValue`, `getFields`, `inProgress`, and `value`
  APIs;
- include test-harness file fixtures for selected file names, multiple files,
  accepted extensions, drag/drop, focus/blur, disabled/read-only behavior, and
  API-driven value updates;
- explicitly defer full Form/FormItem binding, submit serialization, advanced
  CSV/JSON parsing parity, Papa Parse option parity, parse-error event
  coverage, large-file progress behavior, and browser-specific directory
  picker verification until the shared form and file-parsing compatibility
  slices are ready.

Old sources to inventory:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/FileInput/FileInput.tsx`;
- `/Users/dotneteer/source/xmlui/xmlui/src/components/FileInput/FileInputReact.tsx`;
- `/Users/dotneteer/source/xmlui/xmlui/src/components/FileInput/FileInput.defaults.ts`;
- `/Users/dotneteer/source/xmlui/xmlui/src/components/FileInput/FileInput.module.scss`;
- `/Users/dotneteer/source/xmlui/xmlui/src/components/FileInput/FileInput.md`;
- original `FileInput` tests, docs examples, form-upload how-to examples, and
  parse-as-CSV/JSON examples.

Visual check:

- `http://127.0.0.1:5173/?example=fileInputFoundation`

Verification target:

- `npm.cmd --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm.cmd --workspace xmlui run check:metadata`
- `npm.cmd --workspace xmlui run compatibility:component-transfer`
- `npm.cmd --workspace xmlui run compatibility:component-e2e-audit`
- `npm.cmd --workspace xmlui run test:e2e -- src/components/FileInput/FileInput.spec.ts`

Implementation notes:

- `FileInput` now has a source-adjacent component folder with metadata,
  defaults, SCSS, docs, renderer, focused E2E tests, and a runnable visual
  mutation sample.
- The foundation uses native browser file input behavior plus explicit
  drag/drop handling instead of adding the old `react-dropzone` and Papa Parse
  dependencies in this slice.
- Basic CSV/JSON parsing exists to exercise `parseAs`, `inProgress`, and
  `getFields`, but full Papa Parse option parity and parse-error coverage are
  tracked as `COMP-0030`.
- The XMLUI method-call whitelist now includes `getFields` and `getValue`, so
  documented component API reads can be used in expressions where the current
  codegen supports the call target.

Verification:

- `npm.cmd --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm.cmd --workspace xmlui run check:metadata`
- `npm.cmd --workspace xmlui run compatibility:component-transfer`
- `npm.cmd --workspace xmlui run compatibility:component-e2e-audit`
- `XMLUI_REUSE_DEV_SERVER=0 npm.cmd --workspace xmlui run test:e2e -- src/components/FileInput/FileInput.spec.ts --reporter=line`
  passed with 9 passed and 1 planned skip.
- `npm.cmd --workspace xmlui run test` passed with 250 tests after creating
  the missing `D:\tmp` directory required by existing compiler tests on this
  Windows shell.

###### Wave B6.2: FileUploadDropZone Foundation

Status: completed on 2026-06-23.

Scope:

- migrate `FileUploadDropZone` with source-adjacent metadata, defaults, SCSS,
  docs, renderer, the full old E2E suite, registry/compiler wiring, and a
  visual sample;
- preserve the foundation public contract for drag-over/drop state, upload
  event payloads, accepted MIME type filtering, maximum file count behavior,
  optional paste uploads, paste suppression from text inputs and editable
  elements, enabled/disabled state, default icon/text rendering, children
  rendering where supported, and dropping-state theme variables;
- include test-harness file fixtures for dropped files, rejected file types,
  maximum-count handling, disabled drops, paste-enabled uploads, paste-disabled
  suppression, and upload event payload shape;
- explicitly defer full upload workflow examples, backend integration examples,
  Form/FormItem interactions, visual regression across theme packs, and
  browser/OS clipboard edge cases until the shared file and form surfaces are
  broader.

Old sources to inventory:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/FileUploadDropZone/FileUploadDropZone.tsx`;
- `/Users/dotneteer/source/xmlui/xmlui/src/components/FileUploadDropZone/FileUploadDropZoneReact.tsx`;
- `/Users/dotneteer/source/xmlui/xmlui/src/components/FileUploadDropZone/FileUploadDropZone.defaults.ts`;
- `/Users/dotneteer/source/xmlui/xmlui/src/components/FileUploadDropZone/FileUploadDropZone.module.scss`;
- `/Users/dotneteer/source/xmlui/xmlui/src/components/FileUploadDropZone/FileUploadDropZone.md`;
- original `FileUploadDropZone` tests, docs examples, form-upload how-to
  examples, and theme-variable default references.

Visual check:

- `http://127.0.0.1:5173/?example=fileUploadDropZoneFoundation`

Verification target:

- `npm.cmd --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm.cmd --workspace xmlui run check:metadata`
- `npm.cmd --workspace xmlui run compatibility:component-transfer`
- `npm.cmd --workspace xmlui run compatibility:component-e2e-audit`
- `npm.cmd --workspace xmlui run test:e2e -- src/components/FileUploadDropZone/FileUploadDropZone.spec.ts`

Verification completed on 2026-06-23:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run check:metadata`
- `npm --workspace xmlui run compatibility:component-transfer`
- `npm --workspace xmlui run compatibility:component-e2e-audit`
- `npm --workspace xmlui run test:e2e -- src/components/FileUploadDropZone/FileUploadDropZone.spec.ts`
  passed with 37 passed. The suite is the transferred old
  `FileUploadDropZone.spec.ts`, not a reduced focused replacement.

Notes:

- the visual sample is available at
  `http://127.0.0.1:5173/?example=fileUploadDropZoneFoundation`;
- the migrated old tests include upload handlers such as
  `files => testState = files.map(f => f.name)` and pass in the current E2E
  path. Broader async-aware callback semantics remain part of the event
  compiler compatibility backlog, but they do not block this component slice.

#### Wave C: Selection and Collection Components

##### Wave C1: Existing Collection Foundation

Components:

- `Items` - completed on 2026-06-23 with all 26 old E2E cases migrated;
  25 pass and one old E2E case is marked `fixme`
  because it depends on old `<script>` function support that is not yet
  implemented in the rewrite compiler/testbed;
- `Select` - foundation slice completed on 2026-06-23. The current native
  select behavior was moved out of the central builtins renderer and into the
  source-adjacent component folder with metadata, defaults, SCSS, docs,
  registry wiring, driver support, and foundation E2E tests. This is not full
  old-suite closure yet;
- `Option` - foundation slice completed on 2026-06-23 together with `Select`.
  The component folder now has source-adjacent metadata/defaults/docs and
  contributes option descriptors to the native Select foundation. This is not
  full old-suite closure yet.

Compatibility focus:

- current experimental collection components must be re-closed against old
  metadata, docs, theme variables, and complete old E2E tests before deeper
  collection work starts.

`Items` verification completed on 2026-06-23:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run check:metadata`
- `npm --workspace xmlui run compatibility:component-transfer`
- `npm --workspace xmlui run compatibility:component-e2e-audit`
- `npm --workspace xmlui run test:e2e -- src/components/Items/Items.spec.ts`
  passed with 25 passed and 1 `fixme`.

Visual check:

- use `npm run dev` or `npm --workspace xmlui run dev`, then open
  `http://127.0.0.1:5173/?example=builtinsItems`.

Next component in Wave C1:

- Full `Select`/`Option` closure remains pending. The next Select/Option slice
  must migrate the old Radix-style dropdown/option context semantics far enough
  to start copying the literal old `Select.spec.ts` and `Option.spec.ts` cases
  instead of relying on the temporary foundation specs.

`Select`/`Option` foundation verification completed on 2026-06-23:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/Select/Select.foundation.spec.ts src/components/Option/Option.foundation.spec.ts`
  passed with 5 passed.

`Select`/`Option` compatibility debt:

- the old `Select.spec.ts` suite is large and covers dynamic `Items` options,
  Form/FormItem integration, validation feedback, searchable and multi-select
  dropdowns, grouping, clear button parts, overlay/modal z-index behavior,
  nested dropdown menus, custom templates, label layout, and scroll indicators;
- the old `Option.spec.ts` suite also covers Select, AutoComplete, and
  RadioGroup integration. The AutoComplete and RadioGroup-dependent cases must
  wait until those components exist;
- future closure must copy those old E2E test cases literally, changing
  infrastructure/drivers as needed but not replacing the old cases with
  reduced coverage.

##### Wave C2: Choice Collections

Components:

- `AutoComplete` - foundation slice completed on 2026-06-23. The component now
  has source-adjacent metadata, defaults, SCSS, docs, renderer, compiler
  contract, registry wiring, and foundation E2E tests. This is not full
  old-suite closure yet;
- `RadioGroup` - foundation slice completed on 2026-06-23. The component now
  has source-adjacent metadata, defaults, SCSS, docs, renderer, compiler
  contract, registry wiring, and foundation E2E tests. This is not full
  old-suite closure yet.

Compatibility focus:

- option filtering, selected value semantics, labels, keyboard navigation,
  disabled option behavior, popover/list behavior, and form integration.

`AutoComplete` foundation verification completed on 2026-06-23:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/AutoComplete/AutoComplete.foundation.spec.ts`
  passed with 5 passed.

`AutoComplete` compatibility debt:

- the full old `AutoComplete.spec.ts` suite has not been copied into the
  rewrite yet. Future closure must copy those old E2E cases literally and make
  them pass, or record exact blockers;
- the old implementation uses Radix popover, option context, grouping,
  templates, validation feedback, form context, multi-select badges, nested
  overlay behavior, and richer keyboard navigation. The foundation slice uses a
  native input/listbox while preserving the first visible filtering, selection,
  disabled-option, and creatable-value semantics.

`RadioGroup` foundation verification completed on 2026-06-23:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/RadioGroup/RadioGroup.foundation.spec.ts`
  passed with 4 passed.

`RadioGroup` compatibility debt:

- the full old `RadioGroup.spec.ts` suite has not been copied into the rewrite
  yet. Future closure must copy those old E2E cases literally and make them
  pass, or record exact blockers;
- the old implementation uses Radix RadioGroup and `OptionTypeProvider`. The
  foundation slice uses native radio inputs while preserving the first visible
  semantics, but full closure still needs label-position behavior, form
  integration, keyboard navigation parity, validation visuals, behavior/part
  tests, and API parity from the old suite.

##### Wave C3: List Selection and Paging

Components:

- `List` - foundation slice completed on 2026-06-23. The component now has
  source-adjacent metadata, defaults, SCSS, docs, renderer, compiler contract,
  registry wiring, API registration, item-template context variables, basic
  grouping, basic selection, and foundation E2E tests. This is not full
  old-suite closure yet;
- `SelectionStore` - foundation slice completed on 2026-06-23. The deprecated,
  non-visual component now has source-adjacent metadata, defaults, docs,
  renderer, compiler contract, registry wiring, API registration, selection
  context, and foundation E2E tests. The old component folder has no old E2E
  spec file to copy;
- `Pagination` - foundation slice completed on 2026-06-23. The component now
  has source-adjacent metadata, defaults, SCSS, docs, renderer, compiler
  contract, registry wiring, and foundation E2E tests. This is not full
  old-suite closure yet.

Compatibility focus:

- item context variables, item templates, selection state, paging state,
  sorting/filtering hooks where present, and API references.

`Pagination` foundation verification completed on 2026-06-23:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/Pagination/Pagination.foundation.spec.ts`
  passed with 4 passed.

`Pagination` compatibility debt:

- the full old `Pagination.spec.ts` suite has not been copied into the rewrite
  yet. Future closure must copy those old E2E cases literally and make them
  pass, or record exact blockers;
- the old implementation composes XMLUI Button, Text, Icon, Select, Part, and
  FormItem helper pieces. The foundation slice uses native controls while
  preserving the first visible page calculation, page change, page-size change,
  simplified mode, positioning, and API semantics.

`SelectionStore` foundation verification completed on 2026-06-23:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/SelectionStore/SelectionStore.foundation.spec.ts`
  passed with 2 passed.

`SelectionStore` compatibility note:

- the original `SelectionStore` component is deprecated and has no
  source-adjacent E2E spec file in the old component folder. Later `List` and
  `Table` closure slices must still verify their SelectionStore integration
  through their own literal old E2E suites.

`List` foundation verification completed on 2026-06-23:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/List/List.foundation.spec.ts`
  passed with 4 passed.

`List` compatibility debt:

- the full old `List.spec.ts` suite has not been copied into the rewrite yet.
  Future closure must copy those old E2E cases literally and make them pass, or
  record exact blockers;
- the old implementation uses `virtua`, lodash utilities, group header/footer
  sections, scroll anchoring, pageInfo, SelectionStore integration, keyboard
  actions, selection checkbox positioning, and extensive virtualization tests.
  The foundation slice preserves the first visible data/template/context and
  selection-event semantics only.

##### Wave C4: Table Family

Components:

- `Table`;
- `Column`.

Compatibility focus:

- column definitions, cell/header templates, sorting, selection, paging,
  loading/empty states, sizing, keyboard behavior, and table APIs.

##### Wave C5: Tree and Table of Contents

Components:

- `Tree`;
- `TreeDisplay`;
- `TableOfContents`.

Compatibility focus:

- hierarchy data shape, expand/collapse state, selection, item templates,
  keyboard navigation, document-heading discovery, and route/hash integration.

#### Wave D: Layout and Container Components

##### Wave D1: Stack and Card Layout Primitives

Components:

- `Stack`;
- `HStack`;
- `VStack`;
- `FlowLayout`;
- `TileGrid`;
- `Card`.

Compatibility focus:

- existing experimental layout primitives must be re-closed against old
  metadata, docs, SCSS, theme variables, layout aliases, and all old E2E
  tests.

##### Wave D2: Adaptive and Scrolling Layout

Components:

- `ResponsiveBar`;
- `Splitter`;
- `ScrollViewer`;
- `StickyBox`;
- `StickySection`.

Compatibility focus:

- responsive behavior, splitter sizing, overflow/scroll semantics, sticky
  positioning, resize events, and nested layout interactions.

##### Wave D3: Disclosure and Tab Containers

Components:

- `Accordion`;
- `ExpandableItem`;
- `Tabs`.

Compatibility focus:

- controlled/default selected state, keyboard navigation, disclosure events,
  lazy/eager children behavior, theme parts, and accessibility.

##### Wave D4: Overlay Foundations

Components:

- `Drawer`;
- `ModalDialog`;
- `Tooltip`.

Compatibility focus:

- portals, z-index layers, focus trapping, dismissal, modal/non-modal behavior,
  positioning, keyboard handling, and accessibility.

##### Wave D5: Menus and Context Overlays

Components:

- `ContextMenu`;
- `DropdownMenu`;
- `Menu`.

Compatibility focus:

- trigger behavior, nested menu structure, keyboard navigation, disabled
  entries, selection events, placement, dismissal, and focus restoration.

##### Wave D6: Shell Navigation Containers

Components:

- `AppHeader`;
- `Footer`;
- `NavPanel`;
- `NavGroup`;
- `NavPanelCollapseButton`;
- `ProfileMenu`.

Compatibility focus:

- shell layout regions, responsive/mobile behavior, collapse state, navigation
  grouping, profile/menu interaction, theme parts, and app-shell integration.

#### Wave E: Forms and Validation Components

##### Wave E1: Form Foundation

Components:

- `Form`;
- `FormItem`;
- `FormSegment`.

Compatibility focus:

- value binding, form context, submit/reset lifecycle, disabled/read-only
  propagation, labels/help text, field-level validation, and API references.

##### Wave E2: Validation Display

Components:

- `ValidationSummary`;
- `ConciseValidationFeedback`.

Compatibility focus:

- validation message collection, error rendering, field association,
  accessibility announcements, and form submit timing.

##### Wave E3: Structured Forms

Components:

- `StepperForm`;
- `TabsForm`.

Compatibility focus:

- step/tab state, validation gating, submit/reset behavior, navigation events,
  disabled states, and nested form item interaction.

#### Wave F: Data, Side-Effect, and Runtime Service Components

##### Wave F1: Data Providers and Calls

Components:

- `DataSource`;
- `APICall`;
- `RetryPolicy`.

Compatibility focus:

- current experimental data components must be re-closed against old tests;
  request lifecycle, caching, retries, cancellation, refresh, error state, and
  API references must match old behavior.

##### Wave F2: App State and Lifecycle Listeners

Components:

- `AppState`;
- `ChangeListener`;
- `Lifecycle`.

Compatibility focus:

- non-visual API registration, listener ordering, cleanup, app state
  persistence, initial invocation behavior, and event timing.

##### Wave F3: Scheduling and Queues

Components:

- `Timer`;
- `Queue`.

Compatibility focus:

- scheduling cadence, cancellation, queue ordering, concurrency behavior,
  lifecycle cleanup, and event handler interaction.

##### Wave F4: Messaging and Streaming

Components:

- `EventSource`;
- `WebSocket`;
- `MessageListener`.

Compatibility focus:

- connection lifecycle, reconnection where present, message payloads,
  subscription cleanup, errors, and app event dispatch.

##### Wave F5: User Feedback and Accessibility Services

Components:

- `Toast`;
- `Bookmark`;
- `LiveRegion`;
- `SkipLink`;
- `FocusScope`;
- `Animation`.

Compatibility focus:

- announcements, focus boundaries, skip targets, bookmark behavior, animation
  lifecycle, visual feedback, and accessibility semantics.

##### Wave F6: Theme and Inspection Runtime

Components:

- `ToneChangerButton`;
- `ToneSwitch`;
- `Theme`;
- `Part`;
- `Slot`;
- `InspectButton`;
- `Inspector`;
- `I18n`.

Compatibility focus:

- theme scoping, tone changes, part/slot semantics, inspector visibility and
  metadata, localization lookup, and runtime service APIs.

#### Wave G: Routing, App Composition, and Navigation Components

##### Wave G1: Remaining App Shell Behavior

Components:

- `App`.

Compatibility focus:

- `App` shell behavior beyond the Wave A main-content layout slice: startup,
  navigation regions, headers, footers, mobile shell, search, index collection,
  page metadata, and standalone/Vite differences.

##### Wave G2: Page Routing Core

Components:

- `Pages`;
- `Page`;
- `Redirect`.

Compatibility focus:

- page startup, navigation events, route matching, route/query context
  variables, redirects, SSG route discovery, and page metadata.

##### Wave G3: Navigation Components

Components:

- `NavLink`.

Compatibility focus:

- active route matching, disabled state, navigation side effects, styling,
  keyboard/focus behavior, and route/query compatibility.

##### Wave G4: Nested App Boundary

Components:

- `NestedApp`.

Compatibility focus:

- nested app startup, state/theme/router boundaries, package loading,
  lifecycle cleanup, and standalone/Vite behavior.

Each wave should close components in small batches that can keep
`compatibility:sweep` useful. If a component requires infrastructure from a
later phase or wave, mark it as blocked in compatibility debt instead of
placing partial behavior in the wrong layer.

## 12. Phase 6: Extension Packages and External Authoring

Detailed continuation plan:

- `.plans/post-component-tooling-website-migration-plan.md`

After all Phase 5 components are complete, future AI-assisted work should read
that plan before executing Phase 6 or later ecosystem migration tasks. It
breaks this phase into smaller gates for non-component feature inventory,
scripting/code-behind closure, package exports, CLI/artifact shape, and
extension compatibility.

Tasks:

- Rebuild extension registration for components, functions, themes, metadata,
  standalone scripts, Vite imports, package exports, and namespace rules.
- Port first-party extension packages from `packages/*` one at a time.
- Verify extension authoring examples and package build outputs.
- Preserve old extension package contracts even if the internal renderer API is
  different; add shims only where they are public compatibility requirements.

Exit criteria:

- At least one representative first-party extension and one generated extension
  fixture work in Vite, production build, standalone, docs metadata, and tests.
- The existing `xmlui-counter-badge` fixture remains green in
  `compatibility:sweep` while original first-party packages are ported.

## 13. Phase 7: Developer Tooling, Docs, Playground, and AI Integrations

Detailed continuation plan:

- `.plans/post-component-tooling-website-migration-plan.md`

Future AI-assisted work should use the detailed continuation plan for the exact
order of create-app, VS Code, docs generation, playground, website,
preview-SSG, and AI-tooling migration. The list below remains the high-level
scope.

Tasks:

- Rebuild metadata generation as a compiler output shared by runtime, docs,
  language server, VS Code, and tests.
- Rebuild VS Code diagnostics, completions, hover, syntax highlighting,
  packaging, and `.vsix` artifact shape.
- Rebuild docs generation and website examples so reference pages execute
  against the new runtime.
- Rebuild playground behavior, templates, examples, diagnostics, and sharing.
- Rebuild `tools/create-app` templates and generated project commands.
- Rebuild `tools/preview-ssg`.
- Preserve XMLUI Claude/Codex plugin workflows where they are part of the
  developer experience, including CLI/MCP assumptions from the XMLUI setup
  tooling.

Exit criteria:

- Old docs, playground, create-app, preview-ssg, VS Code, and AI-tooling smoke
  tests pass against the new implementation.
- Missing tooling surfaces no longer appear as blocked entries in
  `.ai/compatibility-debt.md`.

## 14. Phase 8: Full Compatibility Sweep

Tasks:

- Continue using the Experiment 15 sweep infrastructure as the base command.
- Run old unit, E2E, integration, docs-example, package, extension, playground,
  and CI workflow tests against the new implementation.
- Run generated artifact comparisons for package exports, CLI outputs, app
  templates, SSG output, docs metadata, VS Code package contents, and extension
  packages.
- Run visual regression checks for representative docs/component pages.
- Run performance benchmarks for startup, expression evaluation, event
  execution, data operations, routing, render invalidation, SSG, and production
  bundle size.
- Triage every failure into fixed gap, documented intentional deviation, or
  obsolete old test.
- Capture old-framework oracle results or stable old artifacts where direct
  old/new execution would be noisy or hard to isolate.

Exit criteria:

- No untriaged compatibility gaps remain.
- All intentional deviations have migration notes and user-facing rationale.
- The new framework can replace the old framework in representative real apps
  without user-visible surprises.
- `compatibility:sweep` and `compatibility:perf` both pass with all rebuilt
  surfaces enabled, and their reports are suitable as release evidence.

## 15. Phase 9: Release Readiness and Migration Safety

Tasks:

- Prepare a release checklist that mirrors the old release process.
- Verify package versioning, changesets, generated docs, CI workflows, npm
  package contents, VS Code package contents, extension packages, and smoke
  tests.
- Add compatibility report artifacts that summarize closed surfaces and known
  deviations.
- Add rollback or side-by-side testing instructions for early adopters.
- Freeze public compatibility shims until a deliberate post-rebuild migration
  plan exists.

Exit criteria:

- A release candidate can be built and tested using the same public commands
  and expected artifacts as the old framework.

## 16. Condensed Execution Checklist

1. Maintain and refine the compatibility inventory and debt log created by
   Experiment 15.
2. Stabilize package/build/test infrastructure and promote the compatibility
   sweep into the normal verification path.
3. Close parser, scripting, state, rendering, UDC, and diagnostics semantics.
4. Close theming/layout infrastructure.
5. Close data/actions/forms/routing/app-shell infrastructure.
6. Keep Phase 5 Wave 0 scaffold as the component transfer baseline.
7. Implement Phase 5 Wave 1 shared component infrastructure:
   metadata shape, theme/default styling, behaviors, component docs format, and
   the managed rendering adapter.
8. Migrate `App` main content layout as the first proof component.
9. Migrate the exact Experiment 1 counter components to prove default outlook,
   metadata, docs, behaviors, styling, and compiled mutation semantics together.
10. Continue replanned component waves A through G, closing each component
   individually through the infrastructure-backed closure loop.
11. Close extension packages.
12. Close docs, playground, VS Code, create-app, preview-ssg, and AI tooling.
13. Run and expand the full compatibility sweep continuously, not only at the
   end.
14. Prepare release readiness artifacts.

## 17. Definition of 100% Compatibility

The rebuild reaches 100% compatibility when:

- old user-authored XMLUI apps run without source changes across Vite,
  standalone, production, SSG, docs, playground, and extension contexts;
- old public package exports, CLI commands, generated templates, build outputs,
  metadata, VS Code behavior, and release artifacts are preserved;
- every old component has matching public props, events, APIs, slots/templates,
  context variables, theme parts, styling behavior, accessibility behavior,
  diagnostics, and documented examples;
- old unit, E2E, integration, package, docs, playground, and extension tests
  pass or have documented obsolete-test decisions;
- every intentional incompatibility has a migration plan approved separately
  from this rebuild plan.

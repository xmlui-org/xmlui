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
    default styling, docs, and old layout tests.

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
    extension packages.

16. Phase 7: Developer Tooling, Docs, Playground, and AI Integrations

    Rebuild VS Code, docs generation, website examples, playground, create-app,
    preview SSG, and XMLUI AI workflow tooling around the rebuilt compiler,
    metadata, runtime, and component model.

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
- Keep central runtime files as registry and orchestration glue only. They may
  load component modules, but they must not become the primary home of
  component behavior.
- Existing experimental built-ins are compatibility scaffolding. During Phase 5
  they must either move behind component modules or remain explicitly marked as
  temporary debt.
- Deviations from the old file shape are allowed only when recorded in the
  component closure note with the reason and compatibility risk.

Suggested component folder shape:

```text
xmlui/src/components/Button/
  Button.tsx
  Button.metadata.ts
  Button.renderer.tsx
  Button.defaults.ts
  Button.md
  __tests__/
    Button.spec.ts
    transferred/
      Button.original.spec.ts
  index.ts
```

The exact filenames may follow the old component when that improves
traceability, for example `ButtonNative.tsx`, `ButtonReact.tsx`, or old
metadata/default filenames. The important rule is that the component owns the
same categories of artifacts the original component owned.

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
- Decide and document where verbatim transferred tests live. Prefer
  `xmlui/src/components/<ComponentName>/__tests__/transferred/` for
  source-adjacent archival copies, with runnable ports beside them or in the
  shared E2E harness when browser orchestration requires it.
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
- Exclude app shell behavior such as navigation, routing, headers, footers,
  mobile shell, search, page metadata, index collection, and standalone startup;
  these remain Wave G.

Verification:

- Ported old `App` layout tests pass.
- A visual/theme fixture proves default content layout and theme-var override.
- At least one mutation test changes a value that affects rendered content or
  layout so the compiled data-update path remains covered.

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

Components:

- `Text`, `Heading`, `HtmlTags`, `Br`,
  `Fragment`, `Image`, `Icon`, `Logo`, `IFrame`, `Markdown`, `CodeBlock`,
  `QRCode`, `PageMetaTitle`, `ContentSeparator`, `SpaceFiller`, `NoResult`,
  `Fallback`.

Compatibility focus:

- text/content rendering, markdown and code behavior, HTML tag mapping,
  media loading, alt/title semantics, sizing/layout props, metadata, and docs
  examples.

`App` main content layout is no longer part of this wave; it is the dedicated
Wave 2 proof component.

#### Wave B: Core Interaction and Inputs

Components:

- `Button`, `Link`, `TextBox`, `TextArea`, `NumberBox`, `Checkbox`, `Switch`,
  `Toggle`, `Slider`, `RatingInput`, `ColorPicker`, `DateInput`,
  `TimeInput`, `DatePicker`, `FileInput`, `FileUploadDropZone`.

Compatibility focus:

- value and initial-value semantics, `didChange` payloads, keyboard/focus
  behavior, validation hooks, form binding, disabled/enabled semantics,
  imperative APIs, accessibility, and native-browser edge cases.

#### Wave C: Selection and Collection Components

Components:

- `Items`, `List`, `Select`, `Option`, `AutoComplete`, `RadioGroup`,
  `SelectionStore`, `Pagination`, `Table`, `Column`, `Tree`, `TreeDisplay`,
  `TableOfContents`.

Compatibility focus:

- item context variables, templates, selection state, sorting/filtering,
  paging, option enablement, keyboard navigation, virtual/list rendering where
  present, table column contracts, and API references.

#### Wave D: Layout and Container Components

Components:

- `Stack`, `HStack`, `VStack`, `FlowLayout`, `TileGrid`, `Card`,
  `ResponsiveBar`, `Splitter`, `ScrollViewer`, `StickyBox`,
  `StickySection`, `Accordion`, `ExpandableItem`, `Tabs`, `Drawer`,
  `ModalDialog`, `Tooltip`, `ContextMenu`, `DropdownMenu`, `Menu`,
  `AppHeader`, `Footer`, `NavPanel`, `NavGroup`,
  `NavPanelCollapseButton`, `ProfileMenu`.

Compatibility focus:

- child layout, theme parts, responsive behavior, overlays, portals,
  z-index/focus trapping, dismissal behavior, keyboard navigation, mobile
  layout, nested interactive children, and CSS parity.

#### Wave E: Forms and Validation Components

Components:

- `Form`, `FormItem`, `FormSegment`, `ValidationSummary`,
  `ConciseValidationFeedback`, `StepperForm`, `TabsForm`.

Compatibility focus:

- value binding, validation lifecycle, submit/reset behavior, labels/help text,
  disabled/read-only propagation, multi-step state, tabbed forms, error
  rendering, server validation, and accessibility.

#### Wave F: Data, Side-Effect, and Runtime Service Components

Components:

- `DataSource`, `APICall`, `AppState`, `ChangeListener`, `Lifecycle`,
  `Timer`, `Queue`, `Toast`, `EventSource`, `WebSocket`, `MessageListener`,
  `RetryPolicy`, `Bookmark`, `LiveRegion`, `SkipLink`, `FocusScope`,
  `Animation`, `ToneChangerButton`, `ToneSwitch`, `Theme`, `Part`, `Slot`,
  `InspectButton`, `Inspector`, `I18n`.

Compatibility focus:

- non-visual API registration, lifecycle ordering, retries, polling, streaming,
  subscriptions, cleanup, app state persistence, accessibility announcements,
  theme scoping, inspector behavior, and event timing.

#### Wave G: Routing, App Composition, and Navigation Components

Components:

- `App`, `Pages`, `Page`, `NavLink`, `Redirect`, `NestedApp`.

Compatibility focus:

- `App` shell behavior beyond the Wave A main-content layout slice: startup,
  navigation regions, headers, footers, mobile shell, search, index collection,
  page metadata, and standalone/Vite differences;
- page startup, navigation events, route matching, route/query context
  variables, nested app boundaries, SSG route discovery, and page metadata.

Each wave should close components in small batches that can keep
`compatibility:sweep` useful. If a component requires infrastructure from a
later phase or wave, mark it as blocked in compatibility debt instead of
placing partial behavior in the wrong layer.

## 12. Phase 6: Extension Packages and External Authoring

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

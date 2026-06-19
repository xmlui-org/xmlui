# XMLUI Rebuild Plan

Status: active draft  
Source baseline: `/Users/dotneteer/source/xmlui`  
Assumption: Experiments 1-15 in `.plans/master-plan.md` have been successfully
executed for the experimental subset, and their findings are available as the
implementation baseline. Experiment 15 created the first repeatable
compatibility sweep; it does not mean the rewrite is fully compatible yet.

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

## 4. Compatibility Closure Rules

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

## 5. Phase 0: Rebuild Control Center

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

## 6. Phase 1: Package, Build, and Test Infrastructure

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

## 7. Phase 2: Core Language and Runtime Semantics

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

## 8. Phase 3: Theme, Styling, Layout, and Visual Verification

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

## 9. Phase 4: Data, Actions, Forms, Routing, and App Shell Infrastructure

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

## 10. Phase 5: Component Rebuild Waves

Implement components one by one. Within each wave, close each component
individually before relying on it as complete.

### Wave A: Primitive Text, Media, and Utility Components

Components:

- `App` main-content layout subset, `Text`, `Heading`, `HtmlTags`, `Br`,
  `Fragment`, `Image`, `Icon`, `Logo`, `IFrame`, `Markdown`, `CodeBlock`,
  `QRCode`, `PageMetaTitle`, `ContentSeparator`, `SpaceFiller`, `NoResult`,
  `Fallback`.

Compatibility focus:

- `App` main content layout only: vertical stack behavior, content padding,
  gap/spacing, and layout props that affect the primary app content area;
- text/content rendering, markdown and code behavior, HTML tag mapping,
  media loading, alt/title semantics, sizing/layout props, metadata, and docs
  examples.

The Wave A `App` slice deliberately excludes app shell behavior such as
navigation, routing, headers, footers, mobile shell, search, page metadata,
index collection, and standalone startup. Those remain Wave G responsibilities.

### Wave B: Core Interaction and Inputs

Components:

- `Button`, `Link`, `TextBox`, `TextArea`, `NumberBox`, `Checkbox`, `Switch`,
  `Toggle`, `Slider`, `RatingInput`, `ColorPicker`, `DateInput`,
  `TimeInput`, `DatePicker`, `FileInput`, `FileUploadDropZone`.

Compatibility focus:

- value and initial-value semantics, `didChange` payloads, keyboard/focus
  behavior, validation hooks, form binding, disabled/enabled semantics,
  imperative APIs, accessibility, and native-browser edge cases.

### Wave C: Selection and Collection Components

Components:

- `Items`, `List`, `Select`, `Option`, `AutoComplete`, `RadioGroup`,
  `SelectionStore`, `Pagination`, `Table`, `Column`, `Tree`, `TreeDisplay`,
  `TableOfContents`.

Compatibility focus:

- item context variables, templates, selection state, sorting/filtering,
  paging, option enablement, keyboard navigation, virtual/list rendering where
  present, table column contracts, and API references.

### Wave D: Layout and Container Components

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

### Wave E: Forms and Validation Components

Components:

- `Form`, `FormItem`, `FormSegment`, `ValidationSummary`,
  `ConciseValidationFeedback`, `StepperForm`, `TabsForm`.

Compatibility focus:

- value binding, validation lifecycle, submit/reset behavior, labels/help text,
  disabled/read-only propagation, multi-step state, tabbed forms, error
  rendering, server validation, and accessibility.

### Wave F: Data, Side-Effect, and Runtime Service Components

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

### Wave G: Routing, App Composition, and Navigation Components

Components:

- `App`, `Pages`, `Page`, `NavLink`, `Redirect`, `NestedApp`.

Compatibility focus:

- `App` shell behavior beyond the Wave A main-content layout slice: startup,
  navigation regions, headers, footers, mobile shell, search, index collection,
  page metadata, and standalone/Vite differences;
- page startup, navigation events, route matching, route/query context
  variables, nested app boundaries, SSG route discovery, and page metadata.

For each component:

- port old specs first, preserving test markup and assertions where practical;
- port docs examples as executable smoke fixtures;
- compare generated metadata with old metadata;
- run keyboard/focus checks for interactive components;
- run visual/theme checks for styled components;
- record exact old files and any deferred behavior in
  `.ai/<component>-compatibility-closure.md`;
- update `.ai/compatibility-inventory.md` and `.ai/compatibility-debt.md` when
  the component status changes;
- keep at least one state mutation path in the component's tests when the
  component can mutate or participate in mutable data.

## 11. Phase 6: Extension Packages and External Authoring

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

## 12. Phase 7: Developer Tooling, Docs, Playground, and AI Integrations

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

## 13. Phase 8: Full Compatibility Sweep

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

## 14. Phase 9: Release Readiness and Migration Safety

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

## 15. Suggested Incremental Order

1. Maintain and refine the compatibility inventory and debt log created by
   Experiment 15.
2. Stabilize package/build/test infrastructure and promote the compatibility
   sweep into the normal verification path.
3. Close parser, scripting, state, rendering, UDC, and diagnostics semantics.
4. Close theming/layout infrastructure.
5. Close data/actions/forms/routing/app-shell infrastructure.
6. Implement component waves A through G, closing each component individually.
7. Close extension packages.
8. Close docs, playground, VS Code, create-app, preview-ssg, and AI tooling.
9. Run and expand the full compatibility sweep continuously, not only at the
   end.
10. Prepare release readiness artifacts.

## 16. Definition of 100% Compatibility

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

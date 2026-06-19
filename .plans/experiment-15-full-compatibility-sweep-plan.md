# Experiment 15: Full Compatibility Sweep

Status: Planned

## Purpose

Experiment 15 is the transition point between isolated migration experiments
and the broader rebuild program described in `.plans/rebuild-plan.md`.

The goal is not to complete all XMLUI compatibility work in one step. The goal
is to build the sweep machinery that can prove, measure, and continuously track
compatibility against the original XMLUI framework. The output should tell us
which surfaces are already compatible, which gaps are known and actionable,
which old tests need porting, and which parts of the original architecture are
still required.

This experiment should produce a repeatable compatibility report, not merely a
one-time manual audit.

## Relationship to the Rebuild Plan

`.plans/rebuild-plan.md` assumes the experiments have created enough compiler,
runtime, tooling, SSG, production, metadata, VS Code, and extension-package
infrastructure to begin a systematic rebuild.

This experiment implements the control loop needed by that plan:

- create the inventory and status model used by rebuild phases;
- define compatibility closure gates for each framework surface;
- identify the first old tests and artifacts that can be run against the new
  implementation;
- record every remaining incompatibility as structured compatibility debt;
- establish the reporting format that future rebuild phases will keep current.

The sweep should feed directly into rebuild-plan Phase 0 and Phase 8. If this
experiment finds that the rebuild-plan assumptions are too optimistic, update
`.plans/rebuild-plan.md` before implementation continues.

## Compatibility Baseline

Primary source of truth:

- original checkout: `/Users/dotneteer/source/xmlui`;
- rewrite checkout: `/Users/dotneteer/source/xmlui-rs`.

Original areas to inventory:

- root package/workspace scripts and CI workflows;
- `xmlui/` framework package, compiler/runtime, components, metadata, tests,
  Vite plugin, standalone runtime, SSG, package exports, and build artifacts;
- `integration-tests/` app creation and end-to-end workflow tests;
- `tools/create-app/` project scaffolding and generated project behavior;
- `tools/vscode/` language support, packaging, and `.vsix` artifact shape;
- `tools/preview-ssg/` static preview behavior;
- `tools/xmlui-claude/` and `tools/xmlui-codex/` AI workflow integration
  contracts;
- `packages/*` extension package authoring, exports, metadata, themes, and
  tests;
- `website/` docs/reference generation, examples, and build behavior;
- `playground/` runtime, templates, diagnostics, examples, and sharing;
- `.github/workflows/`, release scripts, changesets, generated docs, and smoke
  checks.

Current rewrite foundations available from earlier experiments:

- XMLUI markup parser and expression/event parser;
- expression and async handler compilation to JavaScript functions;
- compiler IR for script execution, metadata, routes, diagnostics, and
  generated modules;
- runtime state model, reactive graph, rendering pipeline, user-defined
  components, built-ins, data operations, routing, theming, standalone,
  production build, SSG, metadata, VS Code integration, and extension package
  slice;
- unit and E2E harnesses that can already run current experimental fixtures.

## Scope

Build a compatibility sweep harness and initial report covering:

- old unit tests that can be ported with low friction;
- old E2E and integration tests that exercise public workflows;
- docs examples and metadata/reference artifacts;
- package exports and generated files;
- create-app output and command behavior;
- VS Code extension syntax, diagnostics, completions, hover, and packaging;
- standalone, Vite dev, production build, and SSG artifact behavior;
- extension package metadata and runtime registration;
- performance and size baselines for the old and new implementations.

The sweep must classify every result as one of:

- `pass`: compatible enough for the tested surface;
- `known-gap`: incompatible and needs implementation;
- `intentional-deviation`: incompatible by deliberate documented decision;
- `obsolete-old-test`: old test no longer represents a public contract;
- `blocked`: cannot run yet because required infrastructure is missing;
- `needs-investigation`: failure observed but root cause is not known.

## Non-Goals

This experiment does not:

- complete all component compatibility work;
- port every old test immediately;
- rebuild missing tools such as `create-app` or `preview-ssg` if they are not
  present yet;
- change public behavior to satisfy tests without first confirming the old
  behavior is the intended compatibility contract;
- treat a visual smoke test as full component parity;
- replace the rebuild plan's component-by-component closure process.

## Required Work Products

Create or update these durable artifacts:

- `.ai/compatibility-inventory.md`: index of compatibility surfaces, old source
  anchors, rewrite implementation anchors, status, and owner notes.
- `.ai/compatibility-debt.md`: structured list of gaps, deviations, blocked
  tests, and obsolete-test decisions.
- `.ai/experiment-15-full-compatibility-sweep-findings.md`: narrative findings
  from the first sweep run.
- `xmlui/tests/compatibility/`: compatibility harness utilities and smoke
  fixtures that compare old expectations with the new runtime.
- `xmlui/tests/compatibility/fixtures/`: copied or adapted old app fragments
  with minimal edits and source references.
- `xmlui/tests/compatibility/artifacts/`: artifact comparison tests for
  metadata, exports, production output, SSG output, VS Code package contents,
  and extension package metadata where appropriate.
- `xmlui/scripts/compatibility-sweep.mjs`: single command entry point for the
  initial sweep.
- `xmlui/scripts/performance-baseline.mjs`: benchmark entry point for startup,
  expression evaluation, handler execution, data operations, routing,
  invalidation, production output, and SSG.

Generated sweep output should go under an ignored report directory such as
`xmlui/.compatibility-report/`.

## Data Modification Requirement

The sweep must include compatibility checks that mutate application state, not
only static rendering. At minimum, include fixtures for:

- compiled event handler mutating a local variable;
- compiled event handler mutating a global variable from a child component;
- async handler with observable progress or completion state;
- data operation updating rendered state after a mocked API response;
- form or input fixture mutating bound state, when form infrastructure is
  available;
- extension component raising an event that mutates XMLUI state.

Each fixture should assert the initial rendered state, perform the user action,
and assert the mutated rendered state.

## Architecture Direction

Use the new implementation as the test target and the old implementation as the
compatibility oracle.

The sweep should avoid running the old and new frameworks in the same browser
page unless a specific comparison needs it. Prefer these comparison modes:

1. **Source-anchored ported tests**
   - Copy old tests or examples into rewrite fixtures.
   - Preserve markup and user assertions as literally as practical.
   - Add a comment or metadata field pointing to the old source file.

2. **Artifact comparisons**
   - Generate old and new artifacts separately.
   - Compare stable public outputs: package exports, metadata component names,
     command output shape, file names, route lists, SSG HTML markers, VS Code
     package manifest fields, and extension metadata.
   - Avoid comparing unstable implementation internals unless they are part of
     the public contract.

3. **Behavioral E2E checks**
   - Use Playwright for user-visible workflows.
   - Reuse the rewrite's existing API mock infrastructure.
   - Keep old test names or source references in the new test titles.

4. **Performance baselines**
   - Run old and new benchmarks with the same fixture source.
   - Store measured results as reports, not hard-coded pass/fail thresholds at
     first.
   - Add thresholds only after noise and representative workloads are known.

## Triage Model

Every failure must be triaged into a compatibility debt entry with:

- stable ID, for example `COMP-0001`;
- source surface: parser, compiler, runtime, component, data, routing, tooling,
  docs, playground, extension, package, or release;
- old source anchor;
- rewrite source anchor when present;
- reproduction command;
- expected old behavior;
- observed rewrite behavior;
- classification;
- severity: `blocker`, `high`, `medium`, `low`;
- planned owner phase from `.plans/rebuild-plan.md`;
- decision notes;
- verification needed to close.

Failure triage should happen in the same PR/change set as new sweep coverage.
Untriaged failures are not acceptable experiment output.

## Implementation Steps

### Step 1: Inventory Schema and Seed Inventory

Create `.ai/compatibility-inventory.md` with tables for:

- package/build/test commands;
- language semantics;
- runtime services;
- components;
- data/actions/forms/routing/app shell;
- theming/layout/styling;
- tooling/docs/playground;
- extension packages;
- generated artifacts and release outputs.

Seed each row with:

- old path;
- rewrite path or `missing`;
- current status;
- existing tests;
- planned rebuild phase.

Verification:

- Inventory includes every major surface named in `.plans/rebuild-plan.md`.
- Component rows are generated or checked against
  `/Users/dotneteer/source/xmlui/xmlui/src/components`.

### Step 2: Compatibility Debt Log

Create `.ai/compatibility-debt.md` with the triage fields above.

Seed known gaps from previous experiments, including:

- incomplete component set;
- incomplete public `xmlui` export surface;
- incomplete create-app, preview-ssg, docs, playground, and release workflows;
- partial extension package compatibility;
- incomplete visual/theme parity;
- incomplete old test migration.

Verification:

- Every known non-goal from Experiments 1-14 has either a debt row or an
  explicit rebuild-plan phase.

### Step 3: Sweep Command Skeleton

Add `xmlui/scripts/compatibility-sweep.mjs`.

The command should:

- run selected unit tests;
- run selected E2E tests;
- run metadata generation;
- run production build;
- run SSG build;
- run VS Code build/test if available;
- optionally run extension package tests/builds;
- write a JSON and Markdown report under `xmlui/.compatibility-report/`.

Initial command behavior should be conservative:

- continue collecting results after a failure;
- record command, exit code, duration, stdout/stderr summary, and report path;
- exit non-zero if any result is `known-gap`, `needs-investigation`, or
  unexpected command failure.

Verification:

- `npm --workspace xmlui run compatibility:sweep` runs and produces a report.
- Failed commands are summarized without hiding later command results.

### Step 4: Package Script Integration

Add package scripts:

- `xmlui/package.json`: `compatibility:sweep`;
- root `package.json`: workspace-level compatibility command if useful.

Keep the command separate from normal `test` until the sweep is stable.

Verification:

- Command can be run from repo root and from `xmlui/`.

### Step 5: Low-Friction Old Unit Test Ports

Pick a small, representative set of old unit tests or fixtures from:

- parser/markup behavior;
- expression parsing and evaluation;
- event handler mutation;
- component rendering for already implemented built-ins;
- metadata generation.

Port them into `xmlui/tests/compatibility/` with source references.

Rules:

- preserve old XMLUI markup where possible;
- change harness setup only where necessary;
- avoid broad rewrites that hide semantic differences.

Verification:

- Ported tests pass or create debt entries.
- Each test title or fixture metadata cites the old source file.

### Step 6: E2E Compatibility Smoke Set

Create E2E smoke fixtures for:

- local variable counter;
- global variable mutation from a component;
- async handler execution;
- data/API state update with mock API;
- route navigation and query state;
- theme/layout mutation;
- extension component event mutation;
- standalone sample;
- production build sample;
- SSG hydrated sample.

Verification:

- E2E smoke tests pass in the new runtime.
- Any unsupported old behavior becomes a debt entry.

### Step 7: Artifact Comparison Harness

Add comparison utilities for stable public artifacts:

- generated metadata component names, props, events, APIs, and theme variables;
- package export keys and package file lists;
- production output file shape;
- SSG route list and static HTML markers;
- standalone sample file names and bootstrap script behavior;
- VS Code package manifest and language contribution fields;
- extension package metadata output.

Do not require byte-for-byte equality unless the old artifact is documented as
stable.

Verification:

- At least metadata, production output, SSG output, and extension metadata have
  initial artifact checks.

### Step 8: Original Command Inventory

Inspect old root and package scripts and record:

- command name;
- old working directory;
- old output artifacts;
- old exit behavior;
- rewrite equivalent;
- status.

Prioritize:

- `test`;
- `test-smoke`;
- `build-xmlui`;
- `build-vscode-extension`;
- `build-extensions`;
- `build-docs`;
- `build-playground`;
- `generate-docs`;
- integration-test commands;
- create-app commands.

Verification:

- Inventory explains which old commands are runnable now, missing, or deferred.

### Step 9: Performance Baseline Harness

Add `xmlui/scripts/performance-baseline.mjs`.

Measure at least:

- expression evaluation throughput;
- event handler execution throughput;
- async handler yielding overhead;
- state invalidation and derived variable recomputation;
- initial render of representative apps;
- route navigation;
- data operation lifecycle with mock fetch;
- production bundle size;
- SSG render time and output size.

The first version should report numbers without enforcing strict thresholds
except for obvious smoke failures.

Verification:

- `npm --workspace xmlui run compatibility:perf` writes JSON/Markdown results.
- Report includes old/new comparison slots even when old numbers are not yet
  captured.

### Step 10: Docs, Website, and Playground Smoke Inventory

Create initial checks for:

- docs-reference generation from shared metadata;
- docs examples that can be executed as XMLUI fixtures;
- website build status, if the rewrite has website scaffolding;
- playground example list and runtime startup, if present;
- deferred rows for missing website/playground rebuild surfaces.

Verification:

- Missing docs/playground surfaces are tracked as compatibility debt instead of
  informal TODOs.

### Step 11: Extension Package Sweep

Extend the Experiment 14 extension fixture coverage:

- package build;
- package metadata build;
- Vite registration;
- production registration;
- standalone registration;
- SSG registration;
- namespace-qualified component usage;
- extension function usage;
- extension event mutating XMLUI state.

Add old first-party package inventory rows for `packages/*`.

Verification:

- Fixture package passes all current contexts.
- Each old package is listed with status and blocking dependencies.

### Step 12: First Sweep Report

Create `.ai/experiment-15-full-compatibility-sweep-findings.md`.

Include:

- commands run;
- pass/fail summary by surface;
- high-severity gaps;
- blocked surfaces;
- intentional deviations, if any;
- obsolete-test candidates, if any;
- performance and artifact summary;
- recommended next rebuild phase.

Verification:

- The report links to generated sweep output.
- Every failed or blocked result has a compatibility debt row.

### Step 13: Rebuild Plan Feedback

Review `.plans/rebuild-plan.md` after the first sweep.

Update it only if the sweep changes:

- starting baseline assumptions;
- phase ordering;
- component wave grouping;
- closure rules;
- release readiness criteria;
- definition of 100% compatibility.

Verification:

- Rebuild plan and sweep findings do not contradict each other.

## Verification Commands

The final implementation should run:

```text
npm --workspace xmlui run test
npm --workspace xmlui run test:e2e
npm --workspace xmlui run build
npm --workspace xmlui run build:metadata
npm --workspace xmlui run build:docs-reference
npm --workspace xmlui run build:production
npm --workspace xmlui run build:ssg
npm --workspace xmlui-vscode run build
npm --workspace xmlui-vscode run test
npm --workspace xmlui-counter-badge run test
npm --workspace xmlui-counter-badge run build
npm --workspace xmlui-counter-badge run build:metadata
npm --workspace xmlui run compatibility:sweep
npm --workspace xmlui run compatibility:perf
```

If a command is missing or blocked, the sweep report must explain why and add a
compatibility debt entry.

## Exit Criteria

The experiment is complete when:

- compatibility inventory exists and covers every rebuild-plan surface;
- compatibility debt log exists and contains all known gaps;
- sweep command runs and produces machine-readable and human-readable reports;
- performance baseline command runs and produces a report;
- initial old-test ports and E2E smoke tests cover static display and data
  modification;
- artifact comparison checks exist for at least metadata, production, SSG, VS
  Code, and extension metadata;
- every failed, blocked, obsolete, or intentionally deviating result is triaged;
- `.plans/rebuild-plan.md` has been reviewed and updated if the sweep changes
  its assumptions.

## Risks

- Old tests may depend on implementation internals rather than public behavior.
  The triage model must separate real compatibility gaps from obsolete tests.
- Byte-for-byte artifact comparisons can create noise. Compare stable public
  shape first, then tighten where users or release tooling depend on exact
  output.
- Running old and new toolchains in one workspace can produce confusing
  generated files. Reports should write to ignored directories and identify
  their source checkout explicitly.
- Performance numbers can be noisy. The first benchmark pass should collect
  comparable baselines before enforcing thresholds.
- A broad sweep can become a dumping ground. Keep every gap tied to a rebuild
  phase and closure criterion.

## Open Questions

- Should the old framework be invoked directly by the sweep command, or should
  old results be captured separately and checked in as stable oracle artifacts?
- Which old tests are public-contract tests versus implementation tests?
- Which generated artifacts require exact file names and byte-stable content?
- What is the minimum representative real app set for replacement confidence?
- Which intentional deviations, if any, are acceptable before a release
  candidate?

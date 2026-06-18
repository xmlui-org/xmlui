# XMLUI Verification Harness Plan

Status: draft  
Parent plan: `.plans/master-plan.md`, section `10. Verification Harness`

## Scope

This plan covers the verification slice for the first XMLUI rewrite
experiment. The goal is to make tests easier to write, easier to port from the
old XMLUI suite, and explicit about which compatibility behaviors are covered
or deferred.

The implementation should not add new framework behavior. It should organize
the existing compiler/unit/E2E checks into reusable harnesses that can support
future experiments and old-test migration.

Required now:

- a unit-test harness for parser, compiler IR, dependency extraction, code
  generation, runtime state, rendering pipeline, and contracts;
- an E2E harness that can run XMLUI snippets and sibling component definitions
  through the Vite dev server;
- a dev-server example path for each target app;
- compatibility manifests that map implemented behavior to old XMLUI semantics;
- a deferred-test registry for old cases that cannot run yet because the
  feature is out of scope;
- focused tests for the three initial counter apps;
- a concise verification command matrix for future agents.

Out of scope for this slice:

- full old `initTestBed` infrastructure;
- all old component drivers;
- cross-browser matrix;
- production build verification beyond the existing `vite build`;
- screenshot/visual regression infrastructure;
- performance benchmark suite;
- testing features not implemented by the first experiment.

## Compatibility Baseline

Old XMLUI testing source to learn from:

- `/Users/dotneteer/source/xmlui/xmlui/src/testing/fixtures.ts`;
- `initTestBed(markup, { components })`;
- Playwright user-visible assertions;
- old component specs for globals, shadowing, compound components, and binding
  updates;
- parser/transform unit tests for `var.*`, `global.*`, text expressions,
  props, and `<Component name="...">`.

Compatibility lessons to keep:

- Old tests are compatibility assets. Preserve markup snippets, visible text,
  and interaction sequences whenever practical.
- Test infrastructure may change, but the test case intent should remain easy
  to compare against old XMLUI.
- Deferred tests should stay visible with a reason, not disappear.
- E2E tests should assert user-visible behavior, not implementation details.
- Unit tests should expose the new Compiler IR and generated function boundary
  rather than recreating old `ComponentDef` assertions.

Do not copy the old shared-page reinit machinery, driver library, theme
fixtures, resources, extension loading, globals `.xs` support, clipboard
helpers, or full StandaloneApp setup for this experiment.

## Current Starting Point

The rewrite already has:

- compiler-focused unit tests under `xmlui/tests/compiler/`;
- parser and LSP-facing parser tests;
- code-generation tests;
- runtime-state tests;
- rendering-pipeline tests;
- Managed React contract tests;
- three Playwright E2E counter tests under `xmlui/tests/e2e/`;
- example apps under `xmlui/src/examples/`;
- `npm --workspace xmlui run test`;
- `npm --workspace xmlui run build`;
- `npm --workspace xmlui run test:e2e`;
- VS Code extension tests, type-check, and bundle build.

The missing piece is a coherent harness layer. Current tests know too much
about setup details and do not yet provide an `initTestBed`-like adapter for
snippets and sibling components.

## Design Principles

- Verification helpers should make compatibility intent more visible, not hide
  behavior behind clever abstractions.
- Keep old snippets and expected text close to the test body.
- Use temp directories for snippet-based Vite apps so tests can model sibling
  `.xmlui` components without changing committed examples.
- Keep unit harnesses pure and fast; reserve Playwright for browser behavior.
- Prefer small helper APIs over a large old-style fixture system.
- Record deferred old tests with explicit feature gaps.
- Every future experiment should be able to add both focused unit tests and
  focused E2E tests through these harnesses.

## Proposed Harness Units

Add test helper modules under `xmlui/tests/helpers/`:

- `compilerHarness.ts`
  - parse XMLUI source;
  - build Compiler IR;
  - run contract validation;
  - compile to generated module source;
  - return diagnostics in a stable assertion-friendly shape.

- `snippetFixtures.ts`
  - write `Main.xmlui` plus sibling component files into a temp directory;
  - return file paths, source map, and cleanup function;
  - preserve old snippets as plain strings.

- `e2eHarness.ts`
  - provide a lightweight `initXmluiTestBed(page, snippet, options)` helper;
  - support `components: Record<string, string>` or array form;
  - navigate the existing Vite dev server to a testbed route or generated
    example route;
  - expose helpers for visible text and button clicks without component-driver
    machinery.

- `compatibilityManifest.ts`
  - list implemented compatibility behaviors;
  - list deferred old test cases and reasons;
  - provide structured data for future docs/blog notes.

- `assertions.ts`
  - small assertion helpers for generated functions, diagnostics, and visible
    counter state.

Names can change during implementation, but the helper responsibilities should
stay small and test-facing.

## Testbed Shape

The initial `initXmluiTestBed` equivalent should support:

```ts
await initXmluiTestBed(page, {
  main: `
    <App var.count="{0}">
      <Button onClick="count++">Count: {count}</Button>
    </App>
  `,
  components: {
    IncrementButton: `
      <Component name="IncrementButton" var.count="{0}">
        <Button onClick="count++">{$props.label || 'Count'}: {count}</Button>
      </Component>
    `,
  },
});
```

Initial implementation options:

- use committed examples for the existing three counter apps;
- or add a dedicated dev-server testbed route that can load snippet fixtures
  from generated files;
- or compile snippets directly in tests for unit-level assertions and keep E2E
  on committed examples until dynamic snippet loading is needed.

The plan should prefer the smallest reliable approach that preserves the
old-test migration path.

## Compatibility Manifest

Create a structured manifest such as `.ai/verification-compatibility-manifest.md`
or `.ai/verification-compatibility-manifest.json` containing:

- implemented behaviors:
  - local `var` state and `count++`;
  - global variables;
  - local shadowing over globals;
  - user-defined components;
  - repeated component instance local isolation;
  - repeated component instances sharing global state;
  - parser handling of `var.*`, `global.*`, text expressions, props, and
    `<Component name="...">`;
- tests that cover each behavior;
- old XMLUI test categories mapped to current coverage;
- deferred categories with reason and required future feature.

The manifest should be concise enough for future writing and explicit enough
for future agents to resume test migration.

## Implementation Steps

Each step should be independently implementable and tested. A step is complete
only when focused tests pass and existing compiler, runtime, VS Code, and E2E
checks still pass when relevant.

1. Old test harness notes
   - Inspect old `initTestBed`, test fixtures, and a few relevant old specs.
   - Record concise findings in `.ai/verification-harness-old-architecture.md`.
   - Tests: none required.

2. Compiler harness helpers
   - Add helpers to parse source, build IR, run contracts, compile generated
     module source, and collect diagnostics.
   - Tests: helper output for valid local counter and invalid contract source.

3. Snippet fixture helpers
   - Add temp-directory helpers for `Main.xmlui` plus sibling components.
   - Preserve source strings and file paths for Vite-style compilation tests.
   - Tests: fixture creates files, component names map to filenames, cleanup
     works or is safely optional.

4. Unit compatibility cases
   - Re-express the three counter examples through the compiler harness.
   - Assert parse, IR, dependencies, generated functions, contracts, runtime
     descriptor shape, and source IDs.
   - Tests: local counter, user-component counters, global/shadowing counter.

5. Lightweight E2E harness
   - Add `initXmluiTestBed` or equivalent helper for Playwright.
   - Start with committed examples if dynamic snippets would require too much
     dev-server work.
   - Tests: refactor current three counter E2Es to use the helper while keeping
     visible assertions almost unchanged.

6. Old-test portability examples
   - Port or mirror a small number of old-test-style cases into the new helper
     shape.
   - Keep source snippets and expectations close to old style.
   - Tests: at least local var, global var, shadowing, and repeated component
     cases represented through the new harness.

7. Deferred test registry
   - Add a structured list of old categories that cannot run yet.
   - Record missing feature, old test source reference, and future experiment.
   - Tests: registry shape/required fields.

8. Compatibility manifest
   - Add `.ai/verification-compatibility-manifest.*` mapping implemented
     behaviors to tests and deferred categories.
   - Tests: optional snapshot or schema check.

9. Verification command matrix
   - Document the command matrix for framework tests, framework build,
     extension tests, extension type-check/build, and E2E.
   - Include the known localhost sandbox note for Playwright.
   - Tests: none required.

10. CI-ready npm scripts
    - Add or normalize package scripts only if useful, such as
      `test:compiler`, `test:e2e`, or `verify`.
    - Avoid broad script churn.
    - Tests: run the affected scripts.

11. Full verification run
    - Run the full matrix and ensure helper refactors did not weaken coverage.
    - Tests: all current unit/build/extension/E2E checks.

12. Compatibility and omission closure
    - Record preserved behavior, intentional omissions, and the next
      incremental experiment handoff in
      `.ai/verification-harness-compatibility-closure.md`.
    - Mark this plan complete when checks pass.

## Test Requirements

Required coverage:

- compiler harness valid/invalid sources;
- temp snippet fixture file creation;
- unit compatibility coverage for all three counter examples;
- E2E harness coverage for all three counter examples;
- deferred-test registry shape;
- compatibility manifest shape;
- full existing compiler, build, extension, and E2E checks.

## Risks

- Recreating the old `initTestBed` wholesale would pull in unrelated framework
  machinery. Keep the new harness narrow.
- Dynamic snippet E2E loading can be more complex than useful at this stage.
  Prefer committed examples until the dev-server architecture needs dynamic
  snippets.
- Over-abstracted helpers can make compatibility intent harder to see. Keep
  snippets and expected text near each test.
- Deferred tests can become a graveyard if they lack reasons and owners. Each
  deferred entry should name the missing feature.
- Harness refactors can accidentally reduce coverage. Preserve current E2E
  visible assertions.

## Deferred Features

- full old TestBed fixture;
- component driver library;
- extension bundle loading in tests;
- globals `.xs` test support;
- resources/themes fixture support;
- cross-browser matrix;
- screenshot/visual regression;
- performance benchmark suite;
- production build E2E;
- SSG verification;
- old suite bulk migration automation.

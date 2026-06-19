# Experiment 15 Findings: Full Compatibility Sweep

Status: implemented

Experiment 15 creates the first repeatable compatibility sweep for the rewrite.
It is intentionally a control loop rather than a claim of full compatibility.

## Implemented Sweep Shape

- `.ai/compatibility-inventory.md` records the compatibility surfaces from the
  original checkout and maps them to rewrite status and rebuild phases.
- `.ai/compatibility-debt.md` records known gaps and blocked surfaces using
  stable compatibility IDs.
- `xmlui/scripts/compatibility-sweep.mjs` runs current verification commands
  and writes JSON/Markdown reports under `xmlui/.compatibility-report/`.
- `xmlui/scripts/performance-baseline.mjs` records first-pass performance and
  artifact-size measurements under the same report directory.
- `xmlui/tests/compatibility/` contains initial source-anchored compatibility
  tests and artifact checks.

## Initial Scope

The first sweep covers the experimental surfaces that already exist:

- compiler/parser/runtime unit tests;
- compatibility smoke tests with state mutation;
- metadata, production, SSG, VS Code, and extension package artifact shape;
- E2E workflows including local/global mutation, async handlers, data updates,
  routing, theming, standalone, production, SSG, and extension events;
- performance measurements for expressions, event handlers, reactive updates,
  production output, and SSG output.

## Known Limits

The sweep does not yet run the old framework directly. The old checkout remains
the source anchor, while old/new side-by-side execution is deferred until stable
oracle artifacts or isolated workspaces are prepared.

The most important blocked surfaces are tracked in
`.ai/compatibility-debt.md`: create-app, preview-ssg package parity, website,
playground, integration tests, release workflows, full component parity,
forms, and original first-party extension packages.

## Report Locations

Generated reports are ignored by git:

- `xmlui/.compatibility-report/compatibility-sweep-latest.json`
- `xmlui/.compatibility-report/compatibility-sweep-latest.md`
- `xmlui/.compatibility-report/performance-baseline-latest.json`
- `xmlui/.compatibility-report/performance-baseline-latest.md`

## First Verified Run

The first full compatibility sweep completed successfully on June 19, 2026.

Command:

```text
npm --workspace xmlui run compatibility:sweep
```

Result:

- compiler/runtime unit checks: pass, 209 tests;
- compatibility unit checks: pass, 8 tests;
- metadata build: pass, 26 components and 3 examples;
- production build and verification: pass;
- SSG build: pass, generated `/`, `/summary`, `/counter-components`,
  `/style-mutation`, and `/extension-counter-badge`;
- docs-reference generation: pass;
- VS Code build and tests: pass, 13 tests;
- extension fixture test/build/metadata: pass;
- E2E suite: pass, 54 tests.

Generated sweep report:

- `xmlui/.compatibility-report/compatibility-sweep-latest.md`
- `xmlui/.compatibility-report/compatibility-sweep-latest.json`

The first performance baseline also completed successfully.

Command:

```text
npm --workspace xmlui run compatibility:perf
```

Result:

- script semantics unit duration: pass;
- codegen unit duration: pass;
- compatibility unit duration: pass;
- production output size recorded;
- SSG output size recorded.

Operational note: the sweep starts Playwright/Vite local servers. In sandboxed
agent execution this can fail with `listen EPERM` on localhost; rerun the same
command with permission to bind local ports.

## Rebuild Plan Feedback

The sweep reinforces the existing ordering in `.plans/rebuild-plan.md`:

1. Keep Phase 0 focused on inventory and closure mechanics.
2. Keep Phase 1 focused on package/build/test infrastructure before component
   waves.
3. Treat Phase 5 component work as component-by-component closure, not a broad
   batch rewrite.
4. Keep Phase 8 as the final broad sweep after missing tools and component
   waves mature.

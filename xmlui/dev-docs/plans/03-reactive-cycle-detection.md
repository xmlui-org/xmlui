# Reactive Cycle Detection — Implementation Plan

**Date:** 2026-04-30
**Status:** Proposal
**Source:** [`managed-react.md` §17 row "Reactive cycle detection"](./managed-react.md)

---

## Goal

Close the only remaining **Absent** row in the consolidated managed-framework
scorecard:

> **Reactive cycle detection — Absent.** No static cycle analysis on
> var ↔ DataSource graph.

A reactive cycle in XMLUI is any closed walk in the dependency graph whose
nodes are reactive `var` declarations, `DataSource`/`APICall` loaders,
code-behind functions, and (transitively) `appGlobals`/`AppState` keys read
from those nodes. Today such cycles compile, mount, and only manifest at
runtime as one of:

- An infinite re-render loop (`var a = b + 1; var b = a + 1;`).
- A redundant DataSource refetch storm (loader `A` writes a var that is read
  by loader `B`'s URL, whose response is read by loader `A`'s URL).
- A "stuck `undefined`" chain that the
  [`prevent-undefined-requests-in-chained-datasources`](../../tests-e2e/prevent-undefined-requests-in-chained-datasources.spec.ts)
  spec patches case-by-case but cannot detect ahead of time.

Make these structurally observable — first as a **warn-mode** diagnostic
through the existing trace pipeline, then as a parse-time / build-time error
through the LSP and the Vite plugin. The work is split into small,
independently shippable, independently testable steps in priority order:

1. **Collect** the dependency graph from existing visitors (highest priority;
   pure data; no UX).
2. **Detect** cycles on the collected graph (algorithmic core).
3. **Report** through the existing diagnostic surfaces (trace, LSP, Vite).
4. **Tighten** with a strict mode that fails the build.

Every step lands behind a single `App.appGlobals.strictReactiveGraph` switch
(see Step 0) so the rollout can stage warn → opt-in → default-on without
touching call sites again.

---

## Conventions

- **Source of truth for dependency edges:**
  [`collectVariableDependencies()`](../../src/components-core/script-runner/visitors.ts)
  for expression-level deps; the same function powers
  [`useVars()`](../../src/components-core/state/variable-resolution.ts) at
  runtime, so the analyzer and the runtime see the same edges by construction.
- **Source of truth for nodes:** the `ComponentDef` tree produced by
  [`parseXmlUiMarkup()`](../../src/parsers/xmlui-parser/transform.ts) and
  walked by
  [`walkComponentDefTree()`](../../src/components-core/ud-metadata.ts). Nodes
  are `var` declarations (from `vars` and `functions`), `loaders` (DataSources
  and APICalls), and the code-behind script extracted by
  `ScriptExtractor.extractInlineScript()`.
- **Existing cycle infrastructure to reuse — do not reinvent:**
  - [`udcCycleDetection.ts`](../../src/components-core/udcCycleDetection.ts)
    (compound-component cycles).
  - [`CircularDependencyDetector`](../../src/parsers/scripting/CircularDependencyDetector.ts)
    (module-import cycles).
  - [`collectFnVarDeps`](../../src/components-core/rendering/collectFnVarDeps.ts)
    (function-dependency flattening with cycle-safe traversal).
  - These three files document the conventions for `visitedPath` / `stack`
    handling and error-message formatting; the new graph builder must produce
    a comparable `RecursionError`-shaped object so the trace UI can render it
    uniformly.
- **New module location:**
  `xmlui/src/components-core/reactive-graph/` (new directory) — keeps the
  graph builder, cycle finder, and diagnostic formatter separate from the
  script-runner internals so they can be imported by the Vite plugin and the
  LSP without dragging in evaluator code.
- **Error type:** new `ReactiveCycleError extends Error` carrying
  `{ cycle: string[], nodes: ReactiveNodeDescriptor[] }` where
  `ReactiveNodeDescriptor` includes the source URI, range (line/col), kind
  (`"var" | "loader" | "function" | "prop"`), and the owning component's
  `uid`. Caught by the existing diagnostic pipelines.
- **Reporting mode:** when `strictReactiveGraph === false` (default during
  rollout) the cycle finder does **not** throw; it emits a
  `kind: "reactive-cycle"` trace entry and lets the app run. In strict mode
  it throws at build time (Vite) and surfaces an LSP diagnostic; at runtime
  the warn entry is upgraded to `console.error` plus a one-shot toast.
- **Test layout:** unit tests live in
  `xmlui/tests/components-core/reactive-graph/` next to the existing
  `collectFnVarDeps.test.ts`; one spec file per step. End-to-end tests for
  the LSP and Vite-plugin paths live in `xmlui/tests-e2e/`.

Each step lists: scope, files touched, tests, acceptance criteria,
dependencies.

---

## Step 0 — Switch + Graph Module Skeleton

**Priority:** 0 (foundational; nothing else lands without this)

### Scope

- Add `App.appGlobals.strictReactiveGraph: boolean` (default `false`).
- Create `xmlui/src/components-core/reactive-graph/` with three exported
  surfaces, all empty stubs in this step:

  ```ts
  // graph.ts
  export type ReactiveNodeKind = "var" | "loader" | "function" | "prop";
  export interface ReactiveNode {
    id: string;          // Stable `${componentUid}.${name}` identifier.
    kind: ReactiveNodeKind;
    uri?: string;        // Source URI when known (LSP / Vite).
    range?: { line: number; col: number };
    deps: string[];      // Edges out — populated by Step 1.x.
  }
  export interface ReactiveGraph {
    nodes: Map<string, ReactiveNode>;
    add(node: ReactiveNode): void;
    edge(from: string, to: string): void;
  }
  export function createReactiveGraph(): ReactiveGraph;
  ```

  ```ts
  // findCycles.ts
  export interface CycleHit {
    cycle: string[];                     // Node ids in traversal order.
    nodes: ReactiveNode[];               // Resolved nodes for diagnostics.
  }
  export function findCycles(graph: ReactiveGraph): CycleHit[];
  ```

  ```ts
  // diagnostics.ts
  export class ReactiveCycleError extends Error {
    constructor(public readonly hit: CycleHit) { super(formatCycle(hit)); }
  }
  export function formatCycle(hit: CycleHit): string;
  ```

- Wire `"reactive-cycle"` into the
  [`XsLogEntry.kind`](../../src/components-core/inspector/inspectorUtils.ts)
  union and document `strictReactiveGraph` on `appGlobals` in
  [`standalone.ts`](../../src/components-core/abstractions/standalone.ts).

### Files

- `xmlui/src/components-core/reactive-graph/graph.ts` (new)
- `xmlui/src/components-core/reactive-graph/findCycles.ts` (new)
- `xmlui/src/components-core/reactive-graph/diagnostics.ts` (new)
- `xmlui/src/components-core/reactive-graph/index.ts` (new — barrel)
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`

### Tests

- `reactive-graph/graph.test.ts`
  - Empty graph is empty.
  - `add()` then `edge()` populates `deps`.
  - Duplicate edges deduplicated.
- `reactive-graph/findCycles.test.ts`
  - Empty graph → `[]`.
  - Single self-loop returns one `CycleHit` with one node.
  - Two-node mutual cycle returns the cycle in stable order
    (smallest id first, then walked forward).
  - Acyclic graph → `[]`.
  - Tarjan-style SCC traversal: a 4-node SCC is reported as a single hit, not
    multiple overlapping hits.

### Acceptance

- All existing tests pass unchanged.
- Default behaviour of any app is unchanged.
- A unit test can construct a graph, call `findCycles`, and observe the
  algorithm's output shape — the data structure the rest of the plan builds on.

---

# Phase 1 — Collect (Highest Priority)

These steps populate the graph from existing parse output. No UX changes
yet; the analyzer is invocable from tests and from a developer-only entry
point.

## Step 1.1 — Collect `var` Nodes and Their Direct Dependencies

**Priority:** 1 (the simplest closed loop — `var a = b; var b = a;` — must
be detectable before anything else)

### Scope

- Add `xmlui/src/components-core/reactive-graph/collectComponentDefGraph.ts`.
- Walk a `ComponentDef` tree via `walkComponentDefTree()`. For every
  `vars` entry:
  1. Parse the expression once with the scripting parser (via
     `parseStatements()` or the cached entry that
     [`variable-resolution.ts`](../../src/components-core/state/variable-resolution.ts)
     already uses).
  2. Call `collectVariableDependencies()` to get the `string[]` of identifier
     deps.
  3. Add a `ReactiveNode { kind: "var", id: \`${uid}.${name}\` }` and an
     edge from this node to every dep id that resolves inside the same
     component or a visible ancestor (use the existing scope-resolution
     helper in
     [`expression-eval` § scope ladder](../guide/06-expression-eval.md)).
- Identifiers that resolve to `appContext` globals or unknown roots are
  skipped (they are leaf inputs, not graph nodes).

### Files

- `xmlui/src/components-core/reactive-graph/collectComponentDefGraph.ts`
  (new — exports `collectVarNodes(root: ComponentDef): ReactiveGraph`)

### Tests

- `collectComponentDefGraph.vars.test.ts`
  - One var with no deps → one node, no edges.
  - `var a = 1; var b = a + 1` → two nodes, edge `b → a`.
  - `var a = b; var b = a` → two nodes, two edges, cycle of length 2.
  - Identifier resolving to `appContext.toast` is **not** added as a node.

### Acceptance

A `.xmlui` file with a self-referential var pair produces a graph that
`findCycles()` reports correctly. Existing apps still build.

---

## Step 1.2 — Collect Code-Behind Function Nodes

**Priority:** 1

### Scope

- For every entry in `componentDef.functions`, add a
  `ReactiveNode { kind: "function" }` and edges to every dep returned by
  `collectVariableDependencies()` over the function body.
- Reuse [`collectFnVarDeps`](../../src/components-core/rendering/collectFnVarDeps.ts)
  to flatten function-to-function calls so a `var` reading
  `fn1() + fn2()` ends up with edges to whatever both functions transitively
  read. The existing `visitedPath` Set in `collectFnVarDeps` already
  short-circuits cycles silently — the new analyzer must instead **record**
  the cycle as a `CycleHit` so it can be reported.

### Files

- `xmlui/src/components-core/reactive-graph/collectComponentDefGraph.ts`
  (extended)

### Tests

- `collectComponentDefGraph.functions.test.ts`
  - `function fn() { return v; } var v = 1; var w = fn();` → edge
    `w → fn → v`, no cycle.
  - `function fn1() { return fn2(); } function fn2() { return fn1(); }` —
    two function nodes; the cycle is reported (today this would only be
    silently truncated by `collectFnVarDeps`).

### Acceptance

Function-mediated cycles are no longer silently absorbed.

---

## Step 1.3 — Collect Loader (DataSource / APICall) Nodes

**Priority:** 1 (this is the headline use case; the row in the assessment
calls out "var ↔ DataSource graph" specifically)

### Scope

- For every entry in `componentDef.loaders`, add a
  `ReactiveNode { kind: "loader", id: \`${uid}.${loaderId}\` }`.
- For each binding-shaped loader prop (`url`, `body`, `queryParams`,
  `headers`, `mockData`, `transformResult`, `when`, …), parse and collect
  deps the same way as for vars.
- Add **outgoing** edges from the loader to every dep (loader reads).
- Add **incoming** edges from every var or function whose expression reads
  the loader's `data`, `value`, `error`, `inProgress`, or any exposed
  method's return value. Detect these by matching the loader's id as an
  identifier root in the dep walk (`<DataSource id="users" />` → expression
  `users.value` → identifier root `users`).

### Files

- `xmlui/src/components-core/reactive-graph/collectComponentDefGraph.ts`
  (extended)
- New helper `xmlui/src/components-core/reactive-graph/loaderDeps.ts` —
  enumerates the binding-shaped loader prop names from the `DataSource` and
  `APICall` metadata so this list cannot drift.

### Tests

- `collectComponentDefGraph.loaders.test.ts`
  - `<DataSource id="u" url="/users/{currentId}" />` and
    `var currentId = u.value?.[0]?.id` — cycle of length 2 detected.
  - `<DataSource when="{ready}" url="/x" />` with `var ready = true` —
    no cycle.
  - APICall whose `body` reads a var that reads the call's `data` — cycle
    detected.

### Acceptance

The exact pathology the assessment named — "no static cycle analysis on
var ↔ DataSource graph" — is now detectable. The algorithmic core is in
place; the UX work follows in Phase 3.

---

## Step 1.4 — Collect `displayWhen` and `when` as Conditional Edges

**Priority:** 2

### Scope

- Edges that originate inside a `when` / `displayWhen` / `visible` /
  conditional ternary expression are tagged `conditional: true`.
- The cycle finder records cycles that consist **entirely** of conditional
  edges as `severity: "info"` (still reportable but not blocking in strict
  mode), since the runtime may never actually traverse them. Cycles with at
  least one unconditional edge stay at `severity: "warn"`.

### Files

- `xmlui/src/components-core/reactive-graph/graph.ts` (extend `edge()` to
  accept `{ conditional?: boolean }`)
- `xmlui/src/components-core/reactive-graph/findCycles.ts` (compute
  severity per cycle)

### Tests

- `findCycles.severity.test.ts`
  - Pure unconditional cycle → `severity: "warn"`.
  - Pure conditional cycle → `severity: "info"`.
  - Mixed cycle → `severity: "warn"`.

### Acceptance

The analyzer distinguishes "definitely will loop" from "might loop" and
strict mode does not block the second category.

> **Note on `AppState` cross-container cycles.** An earlier draft of this
> plan included a Step 1.4 that turned each `appStateKeys` bucket into a
> synthetic node and tracked `AppState.get` / `AppState.set` reads to detect
> cycles spanning multiple components. That step has been **dropped**:
> `AppState` is scheduled for deprecation in the next minor release, so
> investing in static analysis for it would be wasted work. Cycles that flow
> exclusively through `AppState` will surface only as runtime infinite-loop
> symptoms until users migrate off it; cycles that touch any in-component
> `var` or `loader` along the way are still caught by Steps 1.1–1.3.

---

# Phase 2 — Detect (Algorithmic Core)

The cycle finder lives behind `findCycles()` (Step 0). Phase 2 replaces the
naïve DFS stub with a production algorithm and adds the diagnostics needed
for human-readable reports.

## Step 2.1 — Tarjan SCC Implementation

**Priority:** 1

### Scope

- Replace the Step-0 stub of `findCycles()` with Tarjan's
  strongly-connected-components algorithm. Every SCC of size ≥ 2 — and every
  self-loop — is one `CycleHit`.
- Stable ordering: nodes inside a cycle are reported starting from the
  lexicographically smallest id and walking forward; ties are broken by
  source URI then range.

### Files

- `xmlui/src/components-core/reactive-graph/findCycles.ts`

### Tests

- `findCycles.tarjan.test.ts`
  - Acyclic DAG → `[]`.
  - Single self-loop → 1 hit.
  - Two-node mutual cycle → 1 hit.
  - 4-node SCC overlapping a 3-node SCC sharing 2 nodes → 1 hit reporting
    the larger SCC; the algorithm does not double-count.
  - 1000-node graph with 50 cycles — completes in < 50 ms (perf smoke).

### Acceptance

Cycle output is deterministic, complete, and minimal.

---

## Step 2.2 — Human-Readable Diagnostic Formatter

**Priority:** 2

### Scope

- `formatCycle(hit: CycleHit): string` produces:

  ```
  Reactive cycle detected (3 nodes):
    var Form#users.currentId   (Main.xmlui:14:7)
      → DataSource Form#users.list   (Main.xmlui:8:5)
      → var Form#users.currentId
  ```

- Provide a JSON form for LSP diagnostics:
  `{ message, range, relatedInformation: [{ location, message }] }`.

### Files

- `xmlui/src/components-core/reactive-graph/diagnostics.ts`

### Tests

- `formatCycle.test.ts`
  - Single self-loop renders with one row.
  - Multi-node cycle renders with `→` connectors and the cycle is closed.
  - Conditional cycle prefixed with `(conditional)` annotation.

### Acceptance

A cycle diagnostic alone tells the developer which file, which lines, and
which kinds of nodes participate.

---

# Phase 3 — Report (Wire Into Existing Surfaces)

These steps connect the analyzer to the diagnostic surfaces that already
ship: the trace pipeline, the LSP, and the Vite plugin.

## Step 3.1 — Runtime Warn-Mode Trace Entry

**Priority:** 1 (smallest possible UX surface; lets us collect data from
real apps before flipping anything)

### Scope

- During application startup,
  [`AppContent.tsx`](../../src/components-core/rendering/AppContent.tsx)
  receives the resolved `ComponentDef` tree. Add a one-time call to
  `collectVarNodes()` + `findCycles()` after the tree is fully resolved
  (after late-merge of code-behind, after `collectFnVarDeps`, before the
  first render commit).
- For each `CycleHit`, push a `kind: "reactive-cycle"` entry into the trace
  with the `formatCycle()` text and the structured `cycle` array. Suppress
  duplicates within a session by a hash of the cycle ids.
- Expose a developer entry point on the inspector overlay
  ([`Inspector.tsx`](../../src/components/Inspector/Inspector.tsx)) that lists
  detected cycles in a dedicated tab.

### Files

- `xmlui/src/components-core/rendering/AppContent.tsx`
- `xmlui/src/components/Inspector/InspectorNative.tsx`
- `xmlui/src/components-core/inspector/inspectorUtils.ts`

### Tests

- `AppContent.reactiveCycle.test.tsx`
  - A toy app with a known `var a = b; var b = a` produces a single
    `reactive-cycle` trace entry on first render.
  - Re-mounting the same app does not duplicate the entry within the same
    session.
- E2E: `tests-e2e/reactive-cycle-warn.spec.ts`
  - Inspector tab lists the cycle.

### Acceptance

Existing apps surface their cycles in the trace immediately on first run,
without throwing. Warn-mode rollout phase begins.

---

## Step 3.2 — Strict Mode at Runtime

**Priority:** 2

### Scope

- When `App.appGlobals.strictReactiveGraph === true`, every `CycleHit`
  with `severity: "warn"` triggers:
  - A `pushXsLog({ kind: "reactive-cycle", severity: "error", ... })`
    entry.
  - A single `console.error` per cycle id hash.
  - A one-shot dismissable toast (`toast.error(formatCycle(hit))`) so
    developers see the failure even with the inspector closed.
- `severity: "info"` (pure-conditional) cycles never throw and never toast,
  but still log.

### Files

- `xmlui/src/components-core/rendering/AppContent.tsx` (extend the Step 3.1
  call)

### Tests

- `AppContent.reactiveCycle.strict.test.tsx`
  - With `strictReactiveGraph: true`, the unconditional cycle from Step 3.1
    fires a `console.error` and a toast.
  - The conditional cycle from Step 1.4 does not.

### Acceptance

Apps that have audited their warn-mode entries can opt in to fail-loud
behaviour without code changes.

---

## Step 3.3 — LSP Diagnostic Provider

**Priority:** 2

### Scope

- Add `xmlui/src/language-server/services/reactive-cycle-diagnostic.ts`.
- After the existing parse-diagnostic step in
  [`diagnostic.ts`](../../src/language-server/services/diagnostic.ts), build
  the dependency graph for the current document plus any documents in the
  same `Project` reachable through compound-component references, then call
  `findCycles()` and convert each hit to one or more LSP `Diagnostic`s.
- Severity mapping:
  - `severity: "warn"` → LSP `DiagnosticSeverity.Warning`.
  - `severity: "info"` → LSP `DiagnosticSeverity.Information`.
- `relatedInformation` carries the other nodes' source ranges so VS Code
  shows a "→ jump to other end of cycle" link.

### Files

- `xmlui/src/language-server/services/reactive-cycle-diagnostic.ts` (new)
- `xmlui/src/language-server/services/diagnostic.ts` (call the new
  provider)
- `xmlui/src/language-server/base/project.ts` (ensure the project document
  store is reachable from the diagnostic call site if it is not already)

### Tests

- `reactive-cycle-diagnostic.test.ts`
  - A document with a known cycle yields a `Warning` diagnostic at the
    `var` declaration with `relatedInformation` pointing at the loader.
  - A document without cycles yields no extra diagnostics.
  - Cross-document cycle through a compound component yields diagnostics in
    both files.

### Acceptance

Authors see cycle warnings in the editor without running the app.

---

## Step 3.4 — Vite Plugin Hook

**Priority:** 2

### Scope

- In
  [`vite-xmlui-plugin.ts`](../../src/nodejs/vite-xmlui-plugin.ts), after
  `xmlUiMarkupToComponent()` returns the parsed tree, register the
  per-file `ComponentDef` in a plugin-scoped map.
- In the plugin's `buildEnd()` hook, merge all per-file definitions into a
  single virtual application root, build the graph, run `findCycles()`, and:
  - In warn mode (default): call `this.warn(formatCycle(hit))` per cycle.
  - In strict mode (`strictReactiveGraph: true` resolved from the app's
    `config.json` at build time): call `this.error(formatCycle(hit))` so the
    build fails.
- The plugin must not block on this work for individual `transform()` calls
  (per-file analysis is fine; the cross-file pass runs once at the end).

### Files

- `xmlui/src/nodejs/vite-xmlui-plugin.ts`

### Tests

- `tests/nodejs/vite-plugin.reactive-cycle.test.ts` (new)
  - A two-file fixture with a cycle produces a `this.warn` call.
  - With strict mode, the build fails with the cycle text in the error.

### Acceptance

Vite-mode apps catch cycles at `npm run build` time.

---

# Phase 4 — Tighten

These steps polish the rollout into a default-on guarantee.

## Step 4.1 — Documentation and Migration Guide

**Priority:** 3

### Scope

- Update [managed-react.md](./managed-react.md) §17 row to **Strong**.
- Update [.ai/xmlui/expression-eval.md](../../../.ai/xmlui/expression-eval.md)
  with a new `## Reactive cycle detection` section pointing at this plan
  and the new diagnostic kinds.
- Update [.ai/xmlui/inspector-debugging.md](../../../.ai/xmlui/inspector-debugging.md)
  Event Kinds table with `"reactive-cycle"`.
- Update [xmlui/dev-docs/guide/06-expression-eval.md](../guide/06-expression-eval.md)
  and [xmlui/dev-docs/guide/19-inspector-debugging.md](../guide/19-inspector-debugging.md)
  with the same.

### Acceptance

The "Absent" row in the assessment is no longer accurate, and the
documentation matches the implementation.

---

## Step 4.2 — Default Strict in Next Major

**Priority:** 4

### Scope

- Flip `strictReactiveGraph` default to `true` in the next major release.
- Keep the `false` escape hatch for one release; remove it in the
  release after.

### Acceptance

Reactive cycles become a structural failure, not a runtime symptom.

---

## Rollout (Per the DOM API Plan's §A.6 Pattern)

Independent of the steps above, the rollout schedule is:

1. **Phase 1 (warn).** Land Steps 0 + 1.1–1.4 + 2.1–2.2 + 3.1 with
   `strictReactiveGraph` defaulting to `false`. Every detected cycle
   produces a trace entry; nothing throws. Ship for one minor release;
   teams audit their apps using the inspector tab.
2. **Phase 2 (opt-in strict).** Land Steps 3.2 + 3.3 + 3.4. Apps that opt
   in by setting `strictReactiveGraph: true` get hard enforcement at
   runtime, in the editor, and at build time. Step 4.1 syncs the
   documentation in the same release.
3. **Phase 3 (default strict).** Step 4.2 — flip the default in the next
   major release. Keep the `false` escape hatch for one release; remove
   it after.

Each *implementation* step is independently mergeable and independently
testable; the *rollout* phases bundle them for release.

---

## Step Dependency Graph

```
Step 0 ─┬─> Step 1.1 ─┐
        ├─> Step 1.2  ├─> Step 2.1 ──> Step 2.2 ─┬─> Step 3.1
        ├─> Step 1.3  │                            ├─> Step 3.2
        └─> Step 1.4 ─┘                            ├─> Step 3.3
                                                  └─> Step 3.4
                                                        │
                                                        └─> Step 4.1
                                                              │
                                                              └─> Step 4.2
```

---

## Resolved Decisions

1. **Inspector UX.** Detected cycles get a dedicated tab in the inspector
   overlay, with a count badge on the inspector toggle button. The trace
   stream still receives the same `kind: "reactive-cycle"` entries, so
   automation can consume them programmatically.
2. **`<NestedApp>` boundaries.** The analyzer does not chase across them.
   Each nested app has its own `AppContent` and its own resolved tree; a
   cross-app cycle would require walking the host's component-pack
   registry, which is out of scope.
3. **`AppState` cross-container cycles.** Not detected by static analysis.
   `AppState` is scheduled for deprecation in the next minor release;
   investing in `AppState`-aware graph edges (the original Step 1.4) would
   be wasted work. Users on `AppState` will see runtime symptoms only
   until they migrate.
4. **Migration tooling / CLI.** No standalone `xmlui audit-reactive-graph`
   CLI in this plan. The Vite-plugin hook (Step 3.4) gives projects a
   build-time gate without a separate tool, and the LSP diagnostics
   (Step 3.3) cover authoring time. No `--fix` mode — cycle-breaking
   suggestions are domain-specific and the user base is small enough that
   a manual fix path is acceptable.

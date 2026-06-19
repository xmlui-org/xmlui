# Experiment 4: Reactive Graph and Derived Variables Plan

Status: implemented  
Parent plan: `.plans/master-plan.md`, section `7. Incremental Experiment Roadmap`

## Purpose

Experiments 1 through 4A proved that the rewrite can parse XMLUI markup,
compile expressions and event handlers to JavaScript functions, mutate local
and global state explicitly, and run event handlers asynchronously with
cooperative scheduling.

Experiment 4 adds the first real reactive graph. The goal is to support
`var.*` and `global.*` initializers that depend on other state, props, and later
component APIs, without returning to proxy-based change detection.

The experiment answers this question:

Can compiler-produced dependency metadata drive derived variable invalidation
and recomputation in a Svelte-style runtime while preserving XMLUI's existing
reactive variable semantics?

## Implementation Closure

Implemented in the experimental framework:

- source/derived binding metadata for parsed expressions, Compiler IR, runtime
  descriptors, and generated modules;
- graph-ordered initialization for local and global state;
- explicit runtime reactive graph records keyed by local owner/global/prop;
- eager recomputation for derived locals/globals after source writes;
- transitive derived chains;
- reactive-until-assigned behavior for explicitly written derived variables;
- source-aware cycle diagnostics for local/global derived initializer cycles;
- prop-driven derived locals in user-defined component instances;
- async handlers observing recomputed derived values after awaited source
  writes;
- samples and E2E tests for derived locals, chains, globals, override behavior,
  and prop-driven derived locals.

## Scope

Support the current runtime subset plus derived values:

- local `var.name="{expr}"` values that depend on other locals, globals, and
  props;
- global `global.name="{expr}"` values that depend on other globals;
- component-local derived values in repeated user-defined component instances;
- derived values consumed by text, prop, and event-handler expressions;
- invalidation propagation from a write target to every derived value and
  rendered binding that depends on it;
- the old XMLUI "reactive until assigned" rule for derived variables;
- cycle detection and diagnostics for the implemented subset;
- tests and samples where handlers modify source data and the UI updates
  through derived variables.

Initial target examples:

```xml
<App var.count="{1}" var.double="{count * 2}">
  <Text value="{'double: ' + double}" />
  <Button onClick="count++">Increment: {count}</Button>
</App>
```

```xml
<App var.price="{10}" var.quantity="{2}" var.total="{price * quantity}">
  <Text value="{'total: ' + total}" />
  <Button onClick="quantity++">Add item: {quantity}</Button>
</App>
```

```xml
<App var.count="{1}" var.double="{count * 2}">
  <Text value="{'double: ' + double}" />
  <Button onClick="double = 99">Override double</Button>
  <Button onClick="count++">Increment count</Button>
</App>
```

After overriding `double`, later `count++` changes should not recompute
`double`, unless a future reset/rebind feature is explicitly introduced.

## Non-Goals

- Do not compile rendering.
- Do not add broad component APIs yet; reserve the graph shape for APIs but
  implement only vars/globals/props in this experiment.
- Do not implement loaders, data sources, forms, routing, themes, or APICall.
- Do not implement two-way binding syntax beyond event-handler assignments
  already supported.
- Do not implement full transactional batching or concurrent conflict
  resolution beyond the current async handler model.
- Do not expose arbitrary globals to derived expressions.
- Do not replace all runtime dependency bookkeeping at once; keep the minimal
  graph needed for the current runtime.

## Compatibility Baseline

Before implementation, inspect the old XMLUI behavior in
`/Users/dotneteer/source/xmlui`, especially:

- the state container/reducer logic that initializes local variables;
- `computedUses` or equivalent dependency tracking;
- reactive cycle detection diagnostics;
- behavior when a derived variable is explicitly assigned in a handler;
- interaction between globals, locals, props, and repeated component instances.

The old project findings already noted these compatibility points:

- XMLUI has reactive variables that can depend on other variables;
- the old implementation uses dependency analysis plus container state merging;
- proxy mutation tracking should be replaced by compiler-directed invalidation;
- the old "reactive until assigned" variable rule must be preserved.

Record any additional findings in `.ai/experiment-4-reactive-graph-findings.md`
before changing runtime behavior.

## Terminology

- **Source variable**: a mutable local/global whose initializer has no state
  dependencies, or a variable that has been explicitly assigned.
- **Derived variable**: a local/global whose initializer expression depends on
  another local/global/prop/API value and has not been explicitly assigned.
- **Reactive edge**: a compiler/runtime edge from a dependency to a derived
  variable or rendered binding.
- **Invalidation**: marking a derived value or rendered binding stale because a
  dependency changed.
- **Recomputation**: executing the compiled initializer expression for a stale
  derived variable.
- **Reactive owner**: the component instance or global store scope that owns a
  variable and its derived graph.

## Semantics Direction

Derived variable initializers are compiled expression functions, not runtime
interpreted AST.

Initialization order should be graph-driven:

1. initialize literal/source locals and globals;
2. evaluate derived values whose dependencies are available;
3. detect missing, unresolved, or cyclic dependencies with source-aware
   diagnostics;
4. render bindings from the initialized state.

Runtime updates should be explicit:

1. an event handler writes a local/global through `ctx.writeLocal` or
   `ctx.writeGlobal`;
2. the state store marks that variable dirty;
3. the reactive graph finds dependent derived values;
4. derived values still in reactive mode are recomputed in dependency order;
5. rendered bindings depending on changed state are notified through the
   existing invalidation path.

The first implementation may recompute affected derived values eagerly during
the write cycle. Lazy recomputation is allowed only if tests prove rendered
bindings and event handlers observe the same values.

## Reactive-Until-Assigned Rule

For compatibility, a derived variable stays reactive until user code assigns to
that same variable.

Example:

```xml
<App var.count="{1}" var.double="{count * 2}">
  <Button onClick="count++">Count: {count}, double: {double}</Button>
  <Button onClick="double = 99">Override</Button>
</App>
```

Expected behavior:

- initially `double === 2`;
- after `count++`, `double === 4`;
- after `double = 99`, `double === 99`;
- after another `count++`, `double` remains `99`.

Implementation direction:

- keep per-variable metadata: `mode: "source" | "derived" | "assigned"`;
- writes to a derived variable switch it to `assigned`;
- invalidation ignores assigned variables as recomputation targets;
- assigned variables still notify their own dependents when written.

## Graph Model

Use compiler metadata already produced for expressions:

- initializer `dependencies`;
- event-handler `writes`;
- expression/render binding `dependencies`;
- stable local owner IDs and global names.

Add runtime graph records such as:

```ts
type ReactiveVariableNode = {
  kind: "local" | "global";
  ownerId?: string;
  name: string;
  mode: "source" | "derived" | "assigned";
  dependencies: NormalizedRuntimeDependency[];
  evaluate: CompiledExpression["execute"];
};

type ReactiveGraph = {
  variablesByKey: Map<string, ReactiveVariableNode>;
  dependentsByKey: Map<string, Set<string>>;
};
```

The exact type names can differ, but the runtime should have an explicit graph
that can be tested without rendering.

Dependency keys should include ownership:

- local: `local:<ownerId>:<name>`;
- global: `global:<name>`;
- prop: `prop:<ownerId>:<name>` or equivalent instance-scoped key.

When a dependency path is more precise than a root, keep the root invalidation
simple for now. This experiment can invalidate `user` dependents when
`user.name` changes; fine-grained object path updates can come later.

## Cycle Detection

Detect cycles among derived locals/globals before or during graph construction.

Examples:

```xml
<App var.a="{b + 1}" var.b="{a + 1}" />
```

```xml
<App global.a="{b + 1}" global.b="{a + 1}" />
```

Diagnostics should:

- include stable diagnostic codes for reactive cycles;
- include source spans for at least one variable declaration in the cycle;
- name the cycle path when practical, for example `a -> b -> a`;
- prevent infinite initialization/recomputation loops;
- be reusable by build, unit tests, and future VS Code/LSP diagnostics.

## Source and Generated Metadata

Derived variable metadata should remain visible in compiler/runtime descriptors:

- source text and source ranges for initializers;
- dependencies;
- whether the initializer is source/literal or derived;
- stable binding IDs where compiler IR already has them;
- diagnostics for cycles and unsupported dependencies.

Generated Vite modules should continue to carry structural runtime data plus
compiled expression functions. No runtime string evaluation should be
introduced.

## Proposed Samples

Add samples under `xmlui/src/examples/`:

- `reactive-derived-basic`: count and double;
- `reactive-derived-chain`: count, double, message, and perhaps total;
- `reactive-derived-globals`: global count shared through components with a
  derived global display value;
- `reactive-derived-override`: verifies reactive-until-assigned.

Each sample must include data modification through event handlers, not just
display-only derived expressions.

## Implementation Steps

Each step should be independently testable. Run all relevant tests after every
step; at minimum `npm --workspace xmlui run test` after each compiler/runtime
step, and E2E after adding samples.

### 1. Old Behavior Audit

- Inspect the old XMLUI source for derived variable initialization,
  dependency tracking, cycle detection, and assignment behavior.
- Confirm whether globals and locals both follow the reactive-until-assigned
  rule.
- Confirm how props participate in local derived variables inside UDCs.
- Record findings and compatibility decisions in
  `.ai/experiment-4-reactive-graph-findings.md`.

Verification:

- AI findings document exists and cites the old files inspected.

### 2. Define Derived Binding Metadata

- Extend compiler/runtime binding descriptors so `var.*` and `global.*`
  initializers can be classified as source or derived.
- Preserve compiled expression functions and dependency metadata.
- Keep descriptor shape compatible with existing examples.

Verification:

- Unit tests for literal/source variables vs dependency-bearing derived
  variables.
- IR/adapter round-trip tests preserve the new metadata.
- `npm --workspace xmlui run test`.

### 3. Add Reactive Graph Construction

- Build a graph from initialized runtime scopes and parsed binding metadata.
- Add key normalization for local, global, and prop dependencies.
- Store graph records per runtime owner where repeated component instances
  remain isolated.

Verification:

- Unit tests construct a graph for `count -> double`.
- Unit tests verify repeated component instances get separate local graph keys.
- `npm --workspace xmlui run test`.

### 4. Graph-Ordered Initialization

- Initialize source values first.
- Evaluate derived values in dependency order.
- Ensure text/render bindings see initialized derived values on first render.
- Keep current literal initialization behavior unchanged.

Verification:

- Unit tests for `var.count="{1}" var.double="{count * 2}"`.
- E2E or rendering-pipeline test shows `double: 2` on initial render.
- `npm --workspace xmlui run test`.

### 5. Invalidation and Eager Recompute

- On `writeLocal`/`writeGlobal`, mark dependents dirty.
- Recompute affected derived variables that are still in `derived` mode.
- Notify existing render dependency subscriptions after derived values change.
- Ensure multi-step async handlers observe updated derived values after awaits
  and writes.

Verification:

- Unit tests for `count++` updating `double`.
- E2E sample click updates visible derived text.
- `npm --workspace xmlui run test`.

### 6. Derived Chains

- Support transitive dependencies such as `count -> double -> message`.
- Recompute in topological order.
- Avoid duplicate recomputation when multiple changed inputs affect the same
  derived variable.

Verification:

- Unit tests for chained derived variables.
- Recompute counter tests prove each affected derived value runs once per
  invalidation wave where practical.
- `npm --workspace xmlui run test`.

### 7. Reactive Until Assigned

- Track derived variable mode.
- Switch a derived variable to `assigned` when an event handler writes to it.
- Prevent future dependency changes from recomputing that variable.
- Continue invalidating dependents of the assigned variable when it is written.

Verification:

- Unit and E2E tests for `double = 99` followed by `count++`.
- Tests cover both local and global derived variables if globals support
  derived initialization in this step.
- `npm --workspace xmlui run test`.

### 8. Cycle Detection Diagnostics

- Detect local and global derived cycles during graph construction.
- Produce source-aware diagnostics and prevent app startup for invalid graphs.
- Avoid infinite recomputation if a cycle slips through.

Verification:

- Unit tests for direct and indirect cycles.
- Build/parse tests assert diagnostic code, message, and span.
- `npm --workspace xmlui run test`.

### 9. Props as Derived Dependencies

- Support UDC local derived variables depending on `$props`.
- Recompute derived locals when parent-provided props change through parent
  state updates.
- Preserve component instance isolation.

Verification:

- Component sample where parent count is passed as prop and child derives
  display text from it.
- E2E test clicks parent button and observes child derived value update.
- `npm --workspace xmlui run test`.

### 10. Async Handler Interaction

- Verify derived recomputation across async handler boundaries from Experiment
  4A.
- Ensure `delay(); count++; status = message` observes recomputed `message`.
- Preserve scheduler policies with derived invalidation.

Verification:

- Unit test with awaited `delay` followed by source write and derived read.
- E2E test for an async button updating derived UI.
- `npm --workspace xmlui run test`.

### 11. Samples and Routing

- Add the proposed samples under `xmlui/src/examples/`.
- Register query-string routing in `xmlui/src/main.tsx`.
- Keep sample text concise and focused on behavior, not feature explanation.

Verification:

- E2E tests for all sample routes.
- `npm --workspace xmlui run test:e2e`.

### 12. Final Verification and Closure

- Run:
  - `npm --workspace xmlui run test`;
  - `npm --workspace xmlui run build`;
  - `npm --workspace xmlui run test:e2e`;
  - VS Code extension tests/build only if parser/token/diagnostic surfaces
    change.
- Mark this plan implemented.
- Record learnings in `.ai/experiment-4-reactive-graph-closure.md`.

## Success Criteria

Experiment 4 succeeds when:

- derived local and global variables initialize from compiled expressions;
- source writes recompute dependent derived variables in graph order;
- transitive derived chains update correctly;
- explicitly assigned derived variables stop recomputing from their original
  initializer;
- cycles are diagnosed with source-aware errors;
- repeated component instances keep isolated derived local graphs;
- props can drive derived locals in user-defined components;
- async handlers can update source variables and observe recomputed derived
  values;
- unit, build, and E2E verification pass.

## Risks and Open Questions

- The exact old behavior for derived globals may differ from locals; confirm in
  the audit before locking tests.
- Prop-driven derived values may require render-scope invalidation changes if
  props are currently evaluated as plain values only at mount time.
- Eager recomputation is simpler but may over-compute; capture recomputation
  counts to decide whether lazy evaluation is needed later.
- The current runtime dependency normalization may need richer owner identity
  for prop keys.
- Cycle diagnostics need a stable diagnostic-code namespace that future LSP
  support can reuse.

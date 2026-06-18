# XMLUI Runtime State Model Plan

Status: implemented  
Parent plan: `.plans/master-plan.md`, section `7. Runtime State Model`

## Scope

This plan covers the next runtime slice: replacing the current ad hoc
React-state scaffolding with a small XMLUI-owned state model. The runtime must
continue to render structural XMLUI node data produced by the compiler, and it
must execute generated expression and event functions without reintroducing an
interpreter hot path.

The first implementation still targets Vite dev-server mode and the three
counter examples:

- a local counter declared on `App`;
- repeated user-defined component instances with isolated local counters;
- an app-global counter shared by components, plus a local variable that
  shadows the global name.

Required now:

- app-global store owned by the root app instance;
- component-instance store for each `App` or user-defined component instance
  that declares `var.*`;
- lexical lookup rule: local state first, then parent local state where
  relevant, then global state, then `$props` where explicitly accessed;
- local shadowing over globals;
- isolated local state for repeated user-defined component instances;
- shared global state across component instances;
- explicit mutation and invalidation APIs used by generated event functions;
- subscription metadata for compiled bindings so later rendering work can avoid
  broad recomputation.

Out of scope for this slice:

- a full fine-grained renderer;
- slots, loaders, conditionals, routing, forms, theming, and component APIs;
- context variables other than `$props`;
- parent `uses` boundaries;
- async data operations;
- old `StateContainer`/`Container` compatibility APIs;
- reducer action enums, immer, proxy wrapping, or action-string interpreters;
- production build optimization and SSG.

## Compatibility Baseline

The old XMLUI implementation remains the behavioral compatibility contract for
state ownership and lookup, but not for internal architecture. Relevant old
concepts to learn from are:

- state layer ordering;
- mutation routing;
- user-defined component instance isolation;
- global variable behavior;
- Managed React ownership, where authors never touch React state directly.

Do not copy the old `StateContainer`/`Container` pair. For this experiment,
the compatibility goal is observable behavior in authored XMLUI, not preserving
old runtime classes, action enums, or proxy mechanisms.

## Current Starting Point

The current runtime proves the counter scenarios with React `useState`, but it
keeps too many concerns in `xmlui/src/runtime/index.tsx`:

- root globals and root locals are separate `useState` bags;
- scoped elements and component instances create their own local bags;
- lookup walks parent scopes manually;
- writes route through `writeName`, `writeLocal`, and `writeGlobal`;
- generated event functions call explicit context helpers;
- invalidation metadata is preserved but not yet used for subscriptions.

This is good enough as a bootstrap, but the next slice should make state a
runtime-owned model with explicit APIs, stable instance identity, mutation
routing, and testable invalidation records.

## Design Principles

- Keep rendering out of the compiler and state storage out of generated code.
- Generated functions may read and write through explicit context helpers only.
- State slots should be addressed by kind, owner instance, and name rather than
  by accidental object traversal.
- Runtime state should preserve XMLUI lexical rules while hiding React details
  from XMLUI authors.
- React should be an adapter over the XMLUI state model, not the state model
  itself.
- The first invalidation implementation may still trigger React rerenders
  broadly, but it must record dependency granularity by slot.
- Preserve a clean path toward fine-grained binding subscriptions in the next
  rendering-pipeline experiment.
- Keep the API small and unit-testable outside React wherever practical.

## Proposed Runtime State Units

Build the state model as small modules under `xmlui/src/runtime/`:

- `state/types.ts`
  - state slot keys, state owner IDs, dependency keys, mutation records,
    invalidation records, and subscription callback types.

- `state/store.ts`
  - root-global store;
  - local instance stores;
  - read/write APIs;
  - listener registration and invalidation emission.

- `state/scope.ts`
  - lexical runtime scope objects;
  - local, parent, global, and props lookup;
  - mutation routing for generated `writeLocal` and `writeGlobal` helpers.

- `state/initialization.ts`
  - initialization of global/local slots from compiled bindings;
  - temporary initialization scopes for expressions that read props or parent
    state during setup.

- `state/react.tsx`
  - a thin React bridge using `useSyncExternalStore` or a similarly explicit
    subscription boundary;
  - hooks for app root, scoped elements, and component instances.

Names can change during implementation, but these responsibilities should stay
separate from rendering concerns.

## Runtime State Concepts

Use explicit concepts instead of anonymous state bags:

- `StateOwnerId`
  - stable runtime identity for the app root, each scoped element, and each
    user-defined component instance.

- `StateSlotKey`
  - `{ kind: "local" | "global"; ownerId?: StateOwnerId; name: string }`.
  - globals do not need an owner ID beyond the app root.

- `RuntimeScope`
  - points at its local owner, parent scope, global store, and props.
  - owns lookup rules but not rendering.

- `RuntimeStateStore`
  - stores slot values;
  - applies writes;
  - emits invalidation records;
  - supports subscription by slot key and possibly by owner.

- `RuntimeExecutionContext`
  - the object passed to generated expression/event functions;
  - exposes `props`, `readLocal`, `readGlobal`, `writeLocal`, and
    `writeGlobal`.

The state model should be independent of React nodes and JSX so unit tests can
exercise lookup, writes, invalidation, and initialization directly.

## Invalidation Model

Generated bindings and events already carry dependencies, writes, and
invalidations. The runtime should preserve that metadata in executable state
operations:

- expression bindings subscribe to the slots they read;
- event handlers emit invalidations for the slots they write;
- local invalidations target the resolved owner instance, not every component
  with the same local name;
- global invalidations target the app-global slot and notify all subscribers;
- `$props` dependencies are tracked separately so component prop changes can
  invalidate affected bindings later.

For this slice, it is acceptable if React still rerenders a component subtree
after an invalidation. The important architectural result is that invalidation
events are explicit and slot-scoped.

## Component Instance Rules

User-defined component instances must be independent:

- each rendered component reference creates a new local owner for the component
  root;
- component local initialization runs once per instance unless the component is
  unmounted/remounted;
- component props are evaluated in the parent scope;
- component body expressions read component locals first, then parent/global
  state according to the resolved compiler metadata and runtime lookup helpers;
- repeated instances of the same component definition do not share local
  stores;
- global writes made inside a component affect the root-global store.

The runtime should not require component authors to think about React state,
keys, hooks, or store ownership.

## Runtime Boundary With Rendering

This plan may touch `xmlui/src/runtime/index.tsx`, but only to route existing
rendering through the new state model. The rendering surface should remain tiny:

- `App`, `H1`, `Button`;
- text and mixed text;
- user-defined component references;
- `Button` `onClick`.

Do not introduce a new rendering pipeline in this slice. The next plan should
own binding-level render subscriptions, DOM update strategy, and renderer
decomposition.

## Implementation Steps

Each step should be independently implementable and tested. A step is complete
only when focused tests pass and existing compiler, runtime, VS Code, and E2E
checks still pass when relevant.

1. Old runtime-state compatibility notes — completed
   - Inspect the original XMLUI state layer ordering, mutation routing,
     component-local isolation, and global behavior.
   - Record concise findings in `.ai/runtime-state-old-architecture.md`.
   - Tests: none required.

2. State model types — completed
   - Add types for owner IDs, slot keys, dependency keys, state snapshots,
     writes, invalidations, subscriptions, and runtime scopes.
   - Keep these types independent from React and compiler internals where
     possible.
   - Tests: slot-key normalization and equality helpers.

3. Runtime state store — completed
   - Implement global and local slot storage with explicit read/write methods.
   - Support creating and disposing local owners.
   - Emit mutation and invalidation records for writes.
   - Tests: root globals, local owners, repeated owner isolation, writes, and
     disposal.

4. Runtime scope lookup — completed
   - Implement lexical lookup and mutation routing through `RuntimeScope`.
   - Preserve local-first lookup, parent-local lookup where applicable, global
     fallback, `$props`, and local shadowing over globals.
   - Tests: local reads, inherited parent locals, global fallback, shadowing,
     unknown writes, and props reads.

5. Initialization pipeline — completed
   - Initialize global and local state slots from compiled bindings using
     generated expression functions.
   - Support initialization expressions that need props or parent/global reads.
   - Tests: `{0}` locals/globals, component local initialization with props,
     and shadowed local initialization.

6. Generated execution context adapter — completed
   - Build `RuntimeExecutionContext` objects from `RuntimeScope`.
   - Route generated `readLocal`, `readGlobal`, `writeLocal`, and
     `writeGlobal` calls through the state model.
   - Tests: generated expression execution, local/global event writes, and
     invalidation records.

7. Subscription and invalidation registry — completed
   - Add subscription APIs keyed by dependency metadata.
   - Track which expressions/text/event-driven bindings depend on each state
     slot.
   - Emit scoped invalidations without requiring proxy-based change detection.
   - Tests: local subscription isolation, global subscription fan-out, and
     unsubscribe behavior.

8. React bridge — completed
   - Introduce a thin hook layer that subscribes React rendering to the runtime
     state model.
   - Prefer `useSyncExternalStore` if it keeps the bridge simple and stable.
   - Keep React hooks out of store/scope modules.
   - Tests: hook-level rendering tests if local infrastructure supports them,
     otherwise component-level runtime tests plus E2E coverage.

9. Integrate root app state — completed
   - Replace root globals/root locals in `XmluiRoot` with the runtime state
     store and root scope.
   - Preserve existing `createXmluiModule` and `renderXmluiApp` public entry
     points.
   - Tests: local counter runtime behavior and existing compiler/runtime unit
     tests.

10. Integrate scoped elements and component instances — completed
    - Route `ScopedElement` and `ComponentInstance` through explicit local
      owners.
    - Ensure repeated component references create isolated local state.
    - Tests: repeated component counter behavior and component prop evaluation.

11. Preserve generated-function fast path — completed
    - Remove avoidable runtime fallback use from the hot path for generated
      modules while keeping compatibility fallback for legacy descriptors.
    - Confirm generated event handlers cause state writes through the state
      model, not through direct React setters.
    - Tests: generated-function execution, no interpreter-cache path for
      generated modules, and fallback coverage for legacy descriptors.

12. E2E validation and closure — completed
    - Run all three counter scenarios in Vite dev-server mode.
    - Record preserved behavior, intentional omissions, and the next rendering
      pipeline handoff in `.ai/runtime-state-compatibility-closure.md`.
    - Tests: full compiler/unit/build/extension/E2E checks.

## Test Requirements

Required coverage:

- state owner creation and disposal;
- local/global slot reads and writes;
- lexical lookup and local shadowing;
- repeated component-instance isolation;
- shared global state across component instances;
- `$props` reads through the generated execution context;
- initialization from compiled bindings;
- invalidation records emitted from generated event writes;
- subscription fan-out for globals and isolation for locals;
- runtime integration for all three counter examples;
- E2E behavior in Vite dev-server mode.

## Risks

- Moving too much rendering logic into the state model would blur the next
  experiment boundary. Keep this slice focused on state, lookup, mutation, and
  invalidation.
- React bridge design can accidentally re-render too broadly. Broad rerendering
  is acceptable initially only if slot-level dependency metadata is preserved.
- Instance identity must be stable enough for repeated components but should
  not depend on fragile array indexes long term.
- Initialization expressions can become tricky when they read parent state or
  props. Keep the first implementation explicit and well tested.
- Keeping the old fallback executor too long can hide generated-function
  regressions. Tests should prove the generated path is used.

## Deferred Features

- fine-grained binding recomputation;
- render-subtree scheduling;
- slots and helper tags;
- loaders and async data;
- component APIs and action registry;
- parent `uses` boundaries;
- context variables beyond `$props`;
- forms and validation state;
- routing state;
- proxy-based compatibility shims;
- production and SSG state hydration.

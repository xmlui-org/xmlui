# XMLUI Rendering Pipeline Plan

Status: implemented  
Parent plan: `.plans/master-plan.md`, section `8. Rendering Pipeline`

## Scope

This plan covers the next runtime slice: turning the current tiny recursive
renderer into an explicit XMLUI rendering pipeline. The pipeline should render
structural XMLUI node data emitted by the compiler, use the runtime state model
for state and invalidation, and keep generated expression/event functions as
the executable script boundary.

The first implementation still targets Vite dev-server mode and the three
counter examples:

- local counter;
- repeated user-defined component counters with isolated local state;
- shared global counter with local shadowing.

Required now:

- a small recursive renderer for structural XMLUI nodes;
- built-in renderers for `App`, `H1`, and `Button`;
- text and prop binding evaluation through generated expression functions;
- binding-level dependency registration against runtime state slots;
- recomputation of only bindings affected by an invalidated slot, or a durable
  recorded dependency graph that enables that as the next refinement;
- user-defined component instantiation with resolved props and isolated local
  state owners;
- `Button` `onClick` event attachment through generated event functions;
- clear render errors for unknown components and unsupported nodes.

Out of scope for this slice:

- compiler-generated rendering code;
- full DOM diffing or custom host rendering;
- slots;
- `when`;
- loaders;
- theming;
- provider stacks beyond the React root and tiny XMLUI runtime context;
- behavior chains, component APIs, routing, forms, and async data;
- full old metadata/type-contract validation.

## Compatibility Baseline

Old XMLUI rendering concepts to learn from:

- `renderChild`, which is the central child-rendering indirection;
- `ComponentWrapper`, which decides component wrapping and preserves memoized
  render boundaries;
- `CompoundComponent`, which instantiates user-defined component bodies with
  props and parent render context;
- `computedUses`, which narrows reactivity to the state a subtree actually
  reads.

Do not copy the old provider stack, behavior chain, component adapter surface,
container wrapper mechanics, layout context, theming, or slot system. The
compatibility lesson to keep is that rendering is runtime-owned, recursive,
component-aware, and optimized by dependency information rather than by proxy
inspection.

## Current Starting Point

The runtime currently renders in `xmlui/src/runtime/index.tsx`:

- `XmluiRoot` creates the runtime state store and root scope;
- `NodeRenderer` dispatches text nodes, scoped elements, and elements;
- `renderElement` handles `App`, `H1`, `Button`, and user-defined component
  references;
- `ComponentInstance` evaluates props and creates a component local owner;
- text and props are evaluated inline during React render;
- the runtime state store emits slot-scoped invalidations, but React still
  subscribes broadly to store revisions.

This is sufficient behaviorally, but the rendering concerns are still mixed
with state setup, expression evaluation, event execution, and component
registration. The next work should separate a rendering pipeline without
changing XMLUI author-facing behavior.

## Design Principles

- Rendering remains a runtime responsibility. The compiler must not emit React
  components, render functions, DOM instructions, or render-node factories.
- The renderer consumes structural node data and generated binding/event
  functions.
- State lookup, mutation, and invalidation stay in the runtime state model.
- Binding evaluation should be explicit and testable outside broad React
  rerenders where possible.
- Initial fine-grained rendering can be conservative, but dependency
  registration must be precise by state slot and owner.
- User-defined component instantiation should be a normal rendering operation,
  not a compiler special case.
- The first renderer registry should be tiny and local: `App`, `H1`, `Button`,
  and user-defined component references.
- Keep error handling minimal but useful for developers.

## Proposed Rendering Units

Split rendering responsibilities under `xmlui/src/runtime/`:

- `rendering/types.ts`
  - runtime render node input types, render context, renderer registry,
    binding subscription metadata, and render error types.

- `rendering/bindings.ts`
  - evaluate prop, text, and mixed-text bindings;
  - normalize dependency metadata into runtime state slot subscriptions;
  - cache binding values by binding identity and dependency revision where
    practical.

- `rendering/components.tsx`
  - user-defined component instantiation;
  - prop evaluation in parent scope;
  - component local owner lifecycle;
  - component body rendering.

- `rendering/builtins.tsx`
  - renderers for `App`, `H1`, and `Button`;
  - `Button` event attachment through generated event handlers.

- `rendering/renderer.tsx`
  - recursive `XmluiNodeRenderer`;
  - child rendering;
  - renderer lookup;
  - unknown-component and unsupported-node errors.

- `rendering/reactive.tsx`
  - React hooks that subscribe a binding or subtree to state slots;
  - bridge from runtime invalidations to binding recomputation.

Names can change during implementation, but these responsibilities should stop
accumulating in `runtime/index.tsx`.

## Binding Evaluation Model

Bindings should become first-class runtime records:

- each prop binding, local/global initializer, text expression, and event
  handler carries dependency metadata from compiler/codegen;
- dependency metadata is translated into runtime slot keys using the current
  scope owner;
- local dependencies subscribe to the resolved local owner slot;
- global dependencies subscribe to the app-global slot;
- `$props` dependencies are tracked separately for component prop changes;
- literal text segments never subscribe;
- mixed text recomputes only expression segments whose dependency revisions
  changed, or records enough metadata to do so in the next step.

The implementation may initially use React rerenders as the actual update
mechanism, but tests must prove the dependency graph is precise enough to avoid
unrelated binding recomputation later.

## Component Instantiation Rules

User-defined components must continue to behave like the initial examples:

- component props are evaluated in the parent runtime scope;
- the component root creates an isolated local owner per rendered instance;
- component-local state initializes from the component definition bindings;
- component body rendering uses the component scope;
- repeated component references do not share local values;
- component event handlers can mutate globals through the shared app store.

Do not introduce slots or projected children in this slice. If the old
`CompoundComponent` behavior raises slot-related questions, record them as
deferred.

## Built-In Renderer Rules

The initial built-ins are intentionally small:

- `App`
  - renders its children and owns no DOM element itself.

- `H1`
  - renders children inside an `h1`.

- `Button`
  - evaluates the optional `label` prop if there are no children;
  - renders children when present;
  - attaches `onClick` to the generated `click` event handler;
  - leaves styling and accessibility contracts to later component metadata
    work.

Unknown components should produce a clear developer-facing error that includes
the component name and, where available, source metadata.

## Implementation Steps

Each step should be independently implementable and tested. A step is complete
only when focused tests pass and existing compiler, runtime, VS Code, and E2E
checks still pass when relevant.

1. Old rendering compatibility notes — completed
   - Inspect old `renderChild`, `ComponentWrapper`, and `CompoundComponent`
     behavior relevant to recursive rendering, component instantiation, and
     dependency narrowing.
   - Record concise findings in `.ai/rendering-pipeline-old-architecture.md`.
   - Tests: none required.

2. Rendering type surface — completed
   - Add render context, built-in renderer, component renderer, binding
     evaluation, render error, and dependency subscription types.
   - Keep these types runtime-owned and independent from compiler phases except
     for the descriptor shapes already emitted by codegen.
   - Tests: type-level construction fixtures where useful.

3. Binding dependency normalization — completed
   - Translate compiler dependency metadata into runtime dependency keys using
     the current runtime scope.
   - Resolve local dependencies to the correct owner instance and globals to
     the root-global slot.
   - Tests: local dependency, inherited parent local dependency, global
     dependency, shadowed local, and `$props` dependency metadata.

4. Binding evaluator module — completed
   - Move prop, expression, mixed-text, and fallback legacy evaluation out of
     `runtime/index.tsx`.
   - Keep generated function execution as the fast path.
   - Tests: literal values, generated expression values, mixed text, props,
     fallback legacy IR execution, and missing compiled expression errors.

5. Binding subscription hooks — completed
   - Add React hooks that subscribe to the normalized dependency keys of a
     binding.
   - Preserve broad store revision fallback only where dependency metadata is
     absent.
   - Tests: local invalidation triggers matching binding, unrelated local owner
     does not trigger it, global invalidation fans out, unsubscribe works.

6. Built-in renderer registry — completed
   - Move `App`, `H1`, and `Button` rendering into a tiny registry.
   - Ensure `Button` event execution goes through the generated event handler
     and runtime state context.
   - Tests: registry lookup, child rendering, label prop fallback, click event
     attachment, and unknown built-in errors.

7. Recursive node renderer — completed
   - Move `NodeRenderer`, child rendering, text rendering, and unknown
     component dispatch into `rendering/renderer.tsx`.
   - Keep structural node order stable.
   - Tests: render tree snapshots or React element shape tests for `App`,
     `H1`, `Button`, text, and unknown components.

8. User-defined component renderer — completed
   - Move component instance logic into `rendering/components.tsx`.
   - Keep parent-scope prop evaluation and per-instance local owner lifecycle.
   - Tests: repeated component instance isolation, prop evaluation, global
     writes from component scope, and owner disposal.

9. Runtime entry-point cleanup — completed
   - Reduce `runtime/index.tsx` to public entry points, module creation, root
     store/scope setup, and renderer invocation.
   - Preserve `createXmluiModule` and `renderXmluiApp`.
   - Tests: existing runtime/compiler tests and public type checks.

10. Binding recomputation instrumentation — completed
    - Add lightweight counters or debug hooks that can prove which bindings are
      recomputed after invalidation.
    - Keep this test-only or development-only, not a public API.
    - Tests: local counter recomputes its own text binding, component counter
      updates do not recompute sibling local text bindings, global updates
      notify all global-dependent bindings.

11. E2E validation — completed
    - Run all three counter scenarios in Vite dev-server mode.
    - Confirm behavior remains unchanged after renderer extraction and
      dependency-aware subscriptions.
    - Tests: Playwright local, component, and global/shadowing counters.

12. Compatibility and omission closure — completed
    - Record preserved behavior, intentional omissions, and the next Managed
      React contracts handoff in `.ai/rendering-pipeline-compatibility-closure.md`.
    - Mark this plan complete when checks pass.
    - Tests: full compiler/unit/build/extension/E2E matrix.

## Test Requirements

Required coverage:

- binding dependency normalization by runtime owner;
- generated expression and event fast path;
- mixed text and prop evaluation;
- local/global subscription behavior;
- built-in renderer registry;
- recursive child rendering;
- user-defined component instantiation;
- repeated component local isolation;
- global state sharing;
- unknown component/render error messages;
- E2E behavior for all three counter examples.

## Risks

- It is easy to accidentally turn this into a full renderer rewrite. Keep the
  public behavior and built-in surface tiny.
- Dependency subscriptions can become over-engineered before the framework has
  enough features. Normalize and test the dependency graph first; optimize
  recomputation incrementally.
- React hook placement matters. Keep hooks inside React-facing modules and keep
  store/scope modules pure.
- Component owner identity is currently React-instance based. This is adequate
  for the initial examples, but future keyed lists will need stronger identity
  rules.
- Legacy fallback expression execution can hide generated-function regressions.
  Tests should keep proving generated functions are used for generated modules.

## Deferred Features

- slots and child projection;
- `when` and conditional rendering;
- loaders and async lifecycle;
- component APIs;
- behavior chains;
- theming and layout context;
- error boundaries beyond minimal developer errors;
- DOM/style prop normalization;
- accessibility and type-contract validation;
- fine-grained DOM updates outside React;
- SSG hydration behavior.

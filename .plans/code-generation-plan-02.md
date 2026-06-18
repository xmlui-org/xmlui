# XMLUI Code Generation Plan

Status: draft  
Parent plan: `.plans/master-plan.md`, section `6. Code Generation`

## Scope

This plan covers the next compiler slice: turning XMLUI expressions and event
handlers in `XmluiModuleIr` into JavaScript functions. The compiler must not
compile rendering. Rendering remains the responsibility of the runtime and the
later rendering-pipeline plan.

The first implementation targets Vite dev-server mode only. It should preserve
the current user-facing authoring model while replacing the current
runtime-recompile path with generated expression and event functions.

Required now:

- generate modules for app and component `.xmlui` files;
- generate expression functions with explicit context parameters;
- generate event functions with explicit read/write/invalidation calls;
- compile `count++` into a resolved local/global write;
- attach generated functions to expression, mixed-text, and event bindings in
  the runtime descriptor/module;
- keep XMLUI node structure as data for the runtime renderer;
- preserve sibling component import behavior in Vite dev-server mode;
- preserve source IDs and diagnostics suitable for editor/build feedback.

Out of scope for this slice:

- standalone browser loader mode;
- production bundle optimization beyond ordinary Vite bundling;
- static-site generation;
- code-behind `.xs` modules;
- source-map file emission beyond a simple generated map placeholder;
- full metadata-driven prop/event validation;
- old analyzer, accessibility, type-contract, and reactive-cycle build passes;
- rendering-related code generation;
- generated component factories or render functions;
- slots, loaders, conditionals, routing, forms, theming, and component APIs.

## Compatibility Baseline

Old XMLUI turns `.xmlui` files into JavaScript modules through the Vite plugin
at `/Users/dotneteer/source/xmlui/xmlui/src/nodejs/vite-xmlui-plugin.ts`.

Compatibility behaviors to preserve now:

- `.xmlui` files are valid Vite module inputs.
- App files import sibling component files.
- Transform-time parser and semantic diagnostics fail the module transform.
- Generated modules carry enough source identity for warnings, debugging, and
  future source maps.
- Runtime behavior of the three counter examples remains unchanged.

Compatibility behaviors deferred:

- old `dataToEsm` output shape for code-behind and analyzer metadata;
- inline `<script>` and external code-behind imports;
- analyzer warnings and strict build modes;
- reactive-cycle aggregation at `buildEnd`;
- accessibility and type-contract summaries;
- optimizer metadata extraction for extension packages.

## Current Starting Point

The rewrite already has:

- parser and semantic analysis for the initial subset;
- `XmluiModuleIr` with source spans, scopes, dependencies, writes, invalidations,
  and compiled source strings;
- `compilerIrToRuntimeDocument`, which adapts IR back to the current runtime
  descriptor;
- `compileXmluiModule`, which currently emits a module that calls
  `createXmluiModule(document, components)`;
- runtime caches that re-create executable expression/event closures from
  semantic IR when expressions/events first run.

The next step is to make generated JavaScript functions the executable artifact
for expressions and event handlers. The runtime should still receive the XMLUI
node tree as data and render it recursively; it should simply call precompiled
functions instead of compiling semantic script IR during rendering.

## Design Principles

- Code generation starts from `XmluiModuleIr`, not parser CST and not the
  compatibility runtime descriptor.
- Code generation is limited to expression and event handler functions.
- The compiler must not emit React components, render functions, render node
  factories, DOM instructions, or rendering-specific control flow.
- Generated functions should call explicit runtime helpers such as
  `ctx.readLocal`, `ctx.writeLocal`, `ctx.readGlobal`, `ctx.writeGlobal`, and
  `ctx.props`.
- Generated modules should be deterministic so tests can snapshot them.
- Generated code should be readable in dev mode; minification is left to Vite.
- Avoid dynamic `Function`, `eval`, `with`, and string-fed interpreters.
- Keep generated code small enough for the initial subset; do not design for
  every old XMLUI feature in this slice.
- Preserve diagnostics and source IDs even when the runtime no longer receives
  parser AST objects.

## Proposed Generated Module Shape

For each `.xmlui` source file, emit an ES module like this conceptual shape:

```ts
import { createXmluiModule } from "/src/runtime/index.tsx";
import component0 from "./IncrementButton.xmlui";

const document = {
  version: 1,
  kind: "app",
  sourceId: "/absolute/path/Main.xmlui",
  root: {
    kind: "element",
    type: "App",
    bindings: {
      locals: {
        count: {
          evaluate: (ctx) => 0,
        },
      },
    },
    children: [
      /* ordinary runtime-rendered XMLUI node data */
    ],
  },
};

const module = createXmluiModule(document, [component0]);

export default module;
```

The exact shape should be decided during implementation, but it must separate:

- serializable metadata useful for diagnostics/devtools;
- executable expression and event functions attached to binding/event records;
- component imports and component registration;
- runtime-facing node structure that is still rendered by the runtime.

## Runtime Boundary

Prefer an incremental boundary:

1. Keep `createXmluiModule` as the module entry point unless implementation
   discovers a strong reason for a second entry point.
2. Let generated modules pass a descriptor that stores JavaScript functions
   directly on bindings/events.
3. Keep current runtime rendering responsibilities (`App`, `H1`, `Button`,
   component instance handling) in the runtime.
4. Remove the old runtime expression/event caches only after compiled modules
   are proven with tests.

This avoids mixing compiler work with state and rendering work. The next
master-plan sections can then evolve the runtime state model and rendering
pipeline independently.

## Code Generation Units

Build code generation as small modules:

- `codegen/types.ts`
  - runtime-facing compiled binding/event descriptor types;
  - generated expression/event function signatures;
  - source metadata shape.

- `codegen/emitter.ts`
  - indentation, identifier allocation, string escaping, stable import names,
    and deterministic object/function emission.

- `codegen/script.ts`
  - expression and event function emission from semantic script IR;
  - no runtime closure fallback;
  - tests for literal expressions, local/global reads, `$props`, logical OR,
    and postfix writes.

- `codegen/bindings.ts`
  - attach generated expression functions to prop, local, global, and text
    binding descriptors;
  - attach generated event functions to event descriptors;
  - preserve ordinary node shape for the runtime renderer.

- `codegen/module.ts`
  - top-level ES module generation;
  - sibling imports;
  - diagnostics and validation failure handling;
  - integration with `compileXmluiModule`.

Names can change if the implementation discovers a clearer local convention,
but the separation should remain.

## Generated Function Semantics

Expression functions should have a signature equivalent to:

```ts
(ctx) => unknown
```

where `ctx` exposes:

- `props`;
- `readLocal(name)`;
- `readGlobal(name)`.

Event functions should have a signature equivalent to:

```ts
(ctx) => void
```

where `ctx` additionally exposes:

- `writeLocal(name, value)`;
- `writeGlobal(name, value)`;
- invalidation metadata attached beside the function, not discovered by
  executing it.

Initial generated examples:

- `{0}` becomes `(ctx) => 0`;
- `{count}` becomes `(ctx) => ctx.readLocal("count")` or
  `(ctx) => ctx.readGlobal("count")` according to binding resolution;
- `{$props.label || 'Click to increment'}` becomes
  `(ctx) => (ctx.props?.["label"] || "Click to increment")`;
- `count++` becomes an event function that writes
  `Number(ctx.readLocal("count")) + 1` or
  `Number(ctx.readGlobal("count")) + 1`.

## Source Maps And Diagnostics

For this slice:

- preserve `sourceId`, original source spans, and IR IDs in generated metadata;
- keep transform diagnostics as parser/semantic/IR diagnostics;
- return an empty Vite source map only if no better map exists yet;
- record the source-map design gap in the plan before moving to production
  builds.

Later, generated expression/event functions should carry source mappings back
to the expression/event span, especially for browser debugging in Vite dev mode.

## Implementation Steps

Each step should be independently implementable and tested. A step is complete
only when focused tests pass and existing compiler, runtime, VS Code, and E2E
checks still pass when relevant.

1. Old code-generation compatibility notes — completed
   - Inspect old Vite transform output, XMLUI build entry points, and any
     expression-result compatibility helpers such as `extractParam`.
   - Record concise findings in `.ai/`.
   - Tests: none required.

2. Generated runtime descriptor types — completed
   - Add types for compiled expression bindings, mixed-text segments, event
     handlers, and source metadata.
   - Keep these separate from `XmluiModuleIr` and the old runtime descriptor.
   - Tests: type construction fixtures for prop/local/global/text bindings and
     events.

3. Code emitter foundation — completed
   - Add deterministic code-emission helpers for imports, identifiers, object
     literals, function expressions, arrays, string escaping, and indentation.
   - Tests: stable output snapshots and escaping edge cases.

4. Script function generator — completed
   - Move expression/event code emission from string snippets into a generator
     that emits complete JavaScript functions.
   - Support literals, local/global reads, `$props.member`, logical OR, and
     postfix `++`.
   - Tests: generated source snapshots and execution tests through explicit
     fake contexts.

5. Binding and text code generation — completed
   - Generate compiled binding entries for props, locals, globals, and text.
   - Generate mixed-text evaluators without interpreter fallback.
   - Preserve dependency metadata for invalidation.
   - Tests: `{0}`, `{count}`, `$props.label || ...`, literal text, and mixed
     text in the three counter examples.

6. Event code generation — completed
   - Generate compiled event entries with executable event functions, writes,
     invalidations, dependencies, and source metadata.
   - Reject invalid event write targets at generation time.
   - Tests: local `count++`, global `count++`, shadowed local `count++`, and
     invalid write diagnostic behavior.

7. Runtime descriptor attachment — completed
   - Walk `XmluiModuleIr` and produce the normal runtime node tree with compiled
     expression and event functions attached to bindings/events.
   - Preserve child order, source IDs, IR IDs, props, events, declarations, and
     component references as data.
   - Tests: descriptor shape and compiled binding/event attachment for all
     three counter examples.

8. Runtime compiled-function execution — completed
   - Execute generated expression/event functions directly.
   - Keep `createXmluiModule` working for compatibility during the transition.
   - Tests: runtime unit tests for state initialization, prop evaluation, text
     evaluation, local/global writes, and component instance isolation.

9. Vite module integration — completed
   - Update `compileXmluiModule` to emit generated modules through the new code
     generator.
   - Preserve sibling component imports and transform diagnostics.
   - Tests: module output snapshots, parser/semantic/IR diagnostic propagation,
     and generated import order.

10. Dev-mode debugging metadata — completed
    - Carry source IDs, source spans, IR IDs, dependency metadata, and generated
      function labels into the compiled module shape.
    - Keep a documented source-map placeholder if full mappings are deferred.
    - Tests: metadata snapshots and diagnostic range stability.

11. E2E counter validation — completed
    - Run the three counter scenarios in Vite dev-server mode with generated
      modules.
    - Confirm repeated component instances keep isolated local state and shared
      globals remain shared.
    - Tests: Playwright coverage for local counter, component counters, and
      global/shadowed counter.

12. Compatibility and omission closure — completed
    - Record what old transform behaviors are preserved and what remains
      deferred.
    - Update this plan with completed steps and next runtime-state/rendering
      experiments.
    - Tests: full compiler/unit/build/extension/E2E checks.

## Test Requirements

Required coverage:

- deterministic code emitter output;
- generated script function source and execution;
- local/global/prop read codegen;
- local/global event write codegen;
- mixed text codegen;
- compiled binding/event descriptor construction;
- runtime execution without expression/event re-compilation;
- Vite module output snapshots;
- parser, semantic, and IR diagnostics still surfaced by transform;
- sibling component import behavior;
- E2E behavior for all initial counter examples.

## Risks

- Accidentally moving rendering logic into generated code would blur the
  compiler/runtime boundary. Keep this slice focused only on generated
  executable bindings and events.
- Generated JavaScript may become hard to debug without source maps. Preserve
  spans and IDs now so source maps can be added cleanly.
- Runtime descriptors with attached functions may duplicate IR facts. Treat the
  generated descriptor as a temporary runtime boundary, not a replacement for
  Compiler IR.
- Component references require module linking discipline. The initial sibling
  import approach is acceptable for Vite dev mode but not enough for standalone
  or production builds.

## Deferred Features

- Full source-map emission;
- generated production chunks and pre-analysis;
- standalone app loader;
- SSG output;
- code-behind modules;
- build analyzers and strict modes;
- metadata-driven validation;
- slots and helper tags;
- conditional rendering and loaders;
- component APIs, context variables, and action registry;
- complete old Vite plugin option compatibility.

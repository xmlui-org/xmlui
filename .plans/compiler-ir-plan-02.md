# XMLUI Compiler IR Plan

Status: draft  
Parent plan: `.plans/master-plan.md`, section `5. Compiler IR`

## Scope

This plan covers the next compiler slice: replacing the current bootstrap
document shape with a typed XMLUI compiler IR that can serve as the shared
contract for expression/event code generation, runtime state, diagnostics,
editor services, tests, and later production/SSG builds.

The first implementation should still target the initial counter experiments,
but the IR architecture must be durable enough to grow toward full XMLUI:

- `App` documents;
- user-defined `<Component>` documents;
- built-in elements needed now: `H1` and `Button`;
- user-defined component references;
- text and mixed text parts;
- props;
- local variables declared with `var.*`;
- globals declared with `global.*`;
- events declared with `on*`;
- lexical scopes;
- expression read dependencies;
- event write targets and invalidation metadata;
- source spans and diagnostics suitable for LSP and source maps.

The IR should become the compiler boundary. Parser trees remain concrete syntax
for editing and recovery; semantic script IR remains the expression/event
subtree; this Compiler IR owns XMLUI document/component/module structure. It
does not imply rendering compilation; XMLUI node rendering remains a runtime
responsibility.

## Compatibility Baseline

The old project remains the compatibility contract. Relevant old concepts:

- `ComponentDef` and `CompoundComponentDef` in
  `/Users/dotneteer/source/xmlui/xmlui/src/abstractions/ComponentDefs.ts`;
- `computedUses` dependency metadata and reactive-cycle analysis;
- Vite transform output and runtime `ComponentDef` consumption;
- language-server diagnostics that consume parsed component trees;
- metadata-driven checks that validate components, props, events, accessibility,
  versioning, and reactive cycles.

Do not copy the full old `ComponentDef` surface into the new IR. The old shape
contains runtime renderer descriptors, behavior metadata, loaders, component
APIs, action registry integration, theming, layout context, slots, and many
other features that are outside the first experiment.

The compatibility lesson to keep now: a single structured component tree is the
shared artifact for runtime, build tools, diagnostics, and editor features. The
rewrite should preserve that single-source-of-truth property, but with a
compiler-first IR rather than a runtime-first data structure.

## Current Starting Point

The current experimental compiler already produces `XmluiDocument`,
`XmluiElement`, `XmluiText`, mixed text segments, parsed bindings, semantic
script IR, dependency metadata, write metadata, invalidation metadata, and
generated expression/event source strings.

This is a useful bootstrap, but it is not yet a real Compiler IR:

- raw user-facing strings and compiled expression/event metadata live side by
  side;
- element identity is implicit;
- document/module identity is minimal;
- lexical scope information is computed during analysis but not represented as
  durable IR;
- props, variables, globals, events, and children are record-shaped runtime
  fields rather than typed binding declarations;
- dependency metadata is attached to expressions/events but not summarized at
  the node/component/document level;
- user-defined component references are represented as ordinary elements;
- there is no explicit IR version, phase boundary, or validation pass.

The next work should formalize these concepts without breaking the current
runtime slice.

## IR Design Principles

- The IR is not the parser CST. It should retain source spans and references,
  but not parser-only trivia or recovery nodes.
- The IR is not the final runtime object. It may contain compiler-only metadata
  such as scopes, dependencies, source spans, diagnostics, and generated
  expression/event source strings.
- The IR must be serializable enough for Vite/dev-server module output, with a
  clear separation between serializable structural descriptors and generated
  expression/event functions.
- The IR must preserve compatibility-facing raw values where needed for error
  messages and debugging.
- Every declaration, binding, dependency, write, node, and component definition
  must carry source identity and spans.
- The IR should use stable IDs so source maps, diagnostics, invalidation,
  runtime profiling, test snapshots, and future devtools can refer to the same
  node across compiler phases.
- The IR should make explicit what is currently implicit: document kind,
  component definition, component reference, lexical scope, state slots, prop
  declarations, expression dependencies, event writes, and invalidation.

## Proposed IR Layers

Use layered IR types instead of one all-purpose object:

1. `XmluiModuleIr`
   - Represents one source file.
   - Contains `sourceId`, `filename`, `kind`, root definition, diagnostics, and
     referenced component names.
   - Distinguishes app modules from component modules.

2. `XmluiDefinitionIr`
   - Represents an `App` or user-defined component definition.
   - Contains definition ID, name, root node, top-level scope, declarations,
     dependencies, and public component contract metadata.

3. `XmluiNodeIr`
   - Represents runtime-renderable node data.
   - Variants for built-in element, component reference, and text.
   - Contains node ID, type/name, source span, own scope ID, bindings, events,
     children, and dependency summaries.

4. `XmluiBindingIr`
   - Represents props, local variables, globals, and mixed text/expression
     values.
   - Keeps raw value, parsed expression or mixed segments, semantic expression
     IR, generated expression source, dependency metadata, and source spans.

5. `XmluiEventIr`
   - Represents an event handler.
   - Keeps raw source, semantic event IR, generated event-handler source,
     dependency metadata, write metadata, invalidation metadata, and source
     spans.

6. `XmluiScopeIr`
   - Represents lexical visibility and ownership.
   - Lists local slots, global slots, props, parent scope, component scope, and
     any implicit-global policy for separately compiled components.

7. `XmluiDependencySummary`
   - Summarizes reads and writes at node, definition, and module levels.
   - Classifies dependencies by local state, global state, props, unresolved,
     and later context/component APIs.

The current script semantic IR remains nested inside binding/event IR. Do not
merge expression/event compiler internals into the XMLUI node IR.

## Initial IR Surface

Required now:

- app module with root `App` definition;
- component module with one named user-defined component;
- built-in element nodes for `App`, `H1`, and `Button`;
- component reference nodes for PascalCase user components;
- text nodes with literal and expression segments;
- prop bindings including literal strings, expression values, and mixed text;
- local state declarations from `var.*`;
- global state declarations from `global.*`;
- event bindings from `on*`;
- scope IDs and parent-scope links;
- dependency summaries for expression reads;
- write/invalidation summaries for events;
- source spans for all IR entities;
- diagnostics surfaced through the same source span model.

Out of scope for this slice:

- slots;
- helper tags such as `<property>`, `<event>`, `<variable>`, and `<global>`;
- loaders;
- `when`;
- responsive props;
- layout props;
- component APIs;
- action registry;
- metadata-driven prop/event validation;
- theming;
- routing;
- forms;
- SSG-only metadata.

## Compiler Pipeline

The pipeline should become explicit:

1. Parse markup into CST.
2. Transform CST into a raw XMLUI AST-like structure.
3. Build lexical scopes and state slot declarations.
4. Bind expressions and events against scopes.
5. Lower into `XmluiModuleIr`.
6. Validate the IR.
7. Emit dev-server/runtime structural descriptors. These descriptors may carry
   generated expression/event functions, but the compiler must not emit
   rendering code or render functions.

Each phase should have a small API and tests. Avoid adding more behavior to the
current `parseXmlui` function until its responsibilities are separated.

## Runtime Compatibility Strategy

The existing tiny runtime can keep its public input temporarily, but the new IR
should become the source object it consumes. Migration should be incremental:

- first create IR alongside the current `XmluiDocument`;
- then add a compatibility adapter from `XmluiModuleIr` to the current runtime
  descriptor;
- then switch Vite module generation to emit IR-derived descriptors with
  generated expression/event functions;
- finally remove duplicated raw runtime fields when the runtime can consume IR
  directly.

This keeps the counter examples running throughout the work.

## VS Code And LSP Contract

Compiler IR should support editor features without becoming VS Code-specific:

- diagnostics should reference IR entities and source spans;
- semantic tokens can use IR binding classifications where available;
- hover and completion can later inspect node type, prop/event declarations,
  scope entries, and dependencies;
- definition/rename can use stable declaration IDs and dependency references;
- folding/formatting should continue to use parser CST rather than Compiler IR;
- partial IR should be possible for documents with recoverable syntax/semantic
  errors.

The extension should adapt shared IR/diagnostic data to VS Code protocol types.

## Implementation Steps

Each step should be independently implementable and leave the repository
working. A step is complete only when focused tests pass and existing compiler,
runtime, VS Code, and E2E checks still pass when relevant.

1. Old IR compatibility notes — completed
   - Inspect old `ComponentDef`, `CompoundComponentDef`, `computedUses`, Vite
     transform output, and language-server diagnostic consumers.
   - Record concise findings in `.ai/`.
   - Tests: none required, but findings must cite old source files.

2. IR type skeleton — completed
   - Add typed IR modules for module, definition, node, binding, event, scope,
     dependency summary, IDs, and source references.
   - Keep the current `XmluiDocument` types intact while the new IR grows.
   - Tests: type-level construction helpers and minimal snapshot fixtures.

3. Stable ID and source-reference model — completed
   - Add deterministic IDs for modules, definitions, nodes, bindings, events,
     scopes, state slots, and props.
   - Use source ID plus structural path or parse order so tests are stable.
   - Tests: identical input creates stable IDs; sibling/repeated nodes get
     distinct IDs; spans map to the original source file.

4. Raw XMLUI transform phase — completed
   - Split the current parser-to-runtime transform into a raw XMLUI structural
     transform before semantic analysis.
   - Preserve elements, attributes, text, child order, and source spans.
   - Tests: the three counter examples produce expected raw structures.

5. Scope and declaration IR — completed
   - Lower `var.*`, `global.*`, props, and component definitions into explicit
     declaration and scope IR.
   - Represent parent scope links and component implicit-global policy.
   - Tests: local scope, global scope, component props, shadowing, inherited
     locals, and repeated component instances.

6. Binding IR — completed
   - Lower prop, variable, global, and text bindings into `XmluiBindingIr`.
   - Preserve raw values, parsed expression/mixed segments, semantic IR,
     generated expression source, source spans, and dependencies.
   - Tests: literal props, expression props, mixed text, variable initializers,
     global initializers, and `$props.label || ...`.

7. Event IR — completed
   - Lower `on*` handlers into `XmluiEventIr`.
   - Preserve raw source, semantic event IR, generated event-handler source,
     dependencies, writes, invalidations, and source spans.
   - Tests: local `count++`, global `count++`, local-shadowed `count++`,
     invalid event target diagnostics.

8. Node and definition IR — completed
   - Lower built-in elements, user-defined component references, and text nodes
     into `XmluiNodeIr`.
   - Distinguish component definition roots from component reference nodes.
   - Tests: app root, component root, `H1`, `Button`, `IncrementButton`, text
     nodes, child order, and source spans.

9. Dependency summaries — completed
   - Aggregate expression reads and event writes at binding, event, node,
     definition, and module levels.
   - Keep granularity by local, global, props, unresolved, and later extension
     kinds.
   - Tests: summary snapshots for all three counter examples.

10. IR validation — completed
    - Add a validation pass for the initial subset: missing component names,
      invalid roots, unresolved component references where known, invalid
      declarations, unresolved reads, invalid writes, and duplicate state slots
      if detectable.
    - Tests: validation diagnostics retain stable codes and source ranges.

11. Runtime compatibility adapter — completed
    - Add an adapter from `XmluiModuleIr` to the current runtime descriptor.
    - Keep existing runtime behavior unchanged while allowing compiler tests to
      assert against the new IR.
    - Tests: adapter output matches current descriptor for the three examples.

12. Vite module integration — completed
    - Update `compileXmluiModule` to build IR and emit IR-derived descriptors.
    - Preserve sibling component import behavior.
    - Tests: generated module includes stable IR-derived expression/event
      metadata and source IDs.

13. VS Code diagnostic integration — completed
    - Feed IR validation diagnostics into the existing VS Code diagnostic
      adapter.
    - Keep the extension thin and protocol-adapter-only.
    - Tests: extension diagnostics for missing component name, unresolved
      expression, invalid event write, and malformed markup.

14. Compatibility and omission closure — completed
    - Record implemented IR compatibility and deferred old `ComponentDef`
      fields in `.ai/`.
    - Update this plan with completed steps and known next experiments.
    - Tests: full compiler/unit/build/extension/E2E checks.

## Test Requirements

Required coverage:

- IR type construction for app and component modules;
- deterministic IDs and source spans;
- raw transform snapshots for all counter examples;
- explicit scope/declaration IR;
- binding IR for props, vars, globals, mixed text, and expression values;
- event IR for local/global writes and invalid targets;
- node IR for built-ins, component references, and text;
- dependency summaries by local/global/props/write kind;
- validation diagnostics with source ranges;
- compatibility adapter snapshots;
- `compileXmluiModule` integration;
- VS Code diagnostic integration;
- E2E counter behavior still passing.

## Risks

- The IR may become too close to the current bootstrap runtime descriptor if the
  refactor is too timid.
- The IR may become too close to old `ComponentDef` if compatibility pressure is
  handled by copying fields instead of modeling compiler facts.
- Separately compiled component files need a clear policy for app-global
  references. The current implicit-global rule is acceptable for the first
  experiment but should later be replaced by module linking.
- Stable IDs need careful design so they are deterministic enough for tests and
  source maps without becoming brittle after harmless markup edits.

## Deferred Features

- Full metadata-driven prop/event validation;
- slots and template props;
- helper tags;
- loaders and data dependencies;
- `when` and conditional rendering;
- routing and SSG route discovery;
- theming and layout;
- component APIs and context variables;
- production optimizations;
- source-map file emission;
- full LSP hover/completion/definition/rename.

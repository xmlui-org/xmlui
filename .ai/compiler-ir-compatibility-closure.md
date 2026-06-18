# Compiler IR Compatibility Closure

Date: 2026-06-18

## Implemented Compatibility

- The compiler now lowers analyzed XMLUI documents into `XmluiModuleIr` before
  dev-server emission.
- The IR represents app/component modules, definition roots, built-in nodes,
  user component references, text nodes, props, locals, globals, events, scopes,
  dependencies, writes, invalidations, stable IDs, and source spans.
- Expression and event entries preserve the semantic script IR, compiled source,
  dependencies, and original parser AST references required to reconstruct the
  current runtime descriptor.
- `compilerIrToRuntimeDocument` adapts `XmluiModuleIr` back to the existing
  `XmluiDocument` shape, so the runtime behavior remains unchanged for the
  initial counter experiments.
- `compileXmluiModule` now parses, lowers, validates, adapts, and emits
  IR-derived descriptors while preserving sibling component imports.
- The VS Code diagnostic adapter can consume IR validation diagnostics when the
  caller provides project component knowledge.

## Validation Added

- Adapter round-trips cover the local counter, component counter, and
  global/shadowing counter examples.
- Module compilation surfaces parser, semantic, and IR validation failures.
- VS Code tests cover parser diagnostics, semantic diagnostics, invalid writes,
  and IR component-reference diagnostics.

## Deferred Old Architecture Surface

The following old `ComponentDef` concepts remain intentionally omitted from this
slice:

- slots and template props;
- metadata-driven prop/event/accessibility validation;
- loaders, APIs, action registry, and context variables;
- theme, layout, and responsive metadata;
- routing and SSG route discovery;
- reactive cycle validation beyond the initial dependency/write summaries;
- production source-map file emission;
- direct runtime consumption of `XmluiModuleIr`.

## Next Natural Experiment

The next experiment can move from compatibility emission toward a runtime that
consumes the IR directly. That should start with an IR module linker for
resolving component references and app-global dependencies across separately
compiled `.xmlui` files.

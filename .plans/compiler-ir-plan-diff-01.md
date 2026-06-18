# Compiler IR Plan Diff 01

Snapshot: `compiler-ir-plan-01.md`  
Previous snapshot: none

## Prompt

Take a snapshot. Then create a detailed plan for the "5. Compiler IR" section
of the master plan. From now on, the new document is the subject of snapshots.

## Edits

- Created `.plans/compiler-ir-plan.md` from the master-plan Compiler IR scope.
- Defined the IR scope, compatibility baseline, design principles, proposed IR
  layers, runtime compatibility strategy, VS Code/LSP contract, implementation
  steps, tests, risks, and deferred features.
- Set the active snapshot subject to `.plans/compiler-ir-plan.md`.

## Prompt

What does "IR" mean in Compiler IR?

## Edits

- No plan edits were required. The answer clarified that IR means
  "Intermediate Representation."

## Prompt

Continue with Steps 1, 2, and 3.

## Edits

- Added old-architecture research notes in `.ai/`.
- Implemented the initial Compiler IR type skeleton.
- Added stable IR IDs and source-reference helpers.
- Added focused unit tests for minimal IR construction, stable IDs, and source
  references.

## Prompt

Continue and implement Steps 4, 5, and 6.

## Edits

- Added the raw XMLUI transform phase.
- Lowered scopes, local declarations, global declarations, props, and bindings
  into Compiler IR.
- Added tests for raw structures, scopes, declarations, bindings, mixed text,
  component props, globals, and shadowing.

## Prompt

Continue with Steps 7 through 10.

## Edits

- Lowered event handlers into `XmluiEventIr`.
- Added node and definition IR for built-ins, text, and component references.
- Added dependency summaries at binding, event, node, definition, and module
  levels.
- Added IR validation diagnostics for roots, missing names, unresolved
  components, unresolved reads, invalid writes, and duplicate declarations.

## Prompt

Complete the remaining part of the implementation.

## Edits

- Added a runtime compatibility adapter from `XmluiModuleIr` back to the
  current runtime descriptor.
- Updated Vite module compilation to parse, lower, validate, adapt, and emit
  IR-derived descriptors.
- Wired IR validation diagnostics into the VS Code diagnostic adapter.
- Added adapter, compiler, and VS Code tests for the counter examples and IR
  diagnostics.
- Added `.ai/compiler-ir-compatibility-closure.md`.
- Marked all Compiler IR plan steps complete.

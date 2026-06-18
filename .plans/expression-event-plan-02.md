# XMLUI Expression and Event Parsing Plan

Status: draft  
Parent plan: `.plans/master-plan.md`, section `4. Expression and Event Parsing`

## Scope

This plan covers the next compiler-facing slice after the markup parser. The
goal is to turn XMLUI expressions and event handlers from parsed syntax into a
small, XMLUI-specific semantic IR that can be checked, compiled to JavaScript
functions, tested, and reused by language-server features. This plan does not
cover rendering compilation.

The first implementation should support only the syntax needed by the initial
counter experiments:

- numeric literals;
- string literals;
- identifier reads;
- `$props.member` reads;
- logical OR (`||`);
- postfix increment (`count++`);
- expression statements for event handlers.

The architecture must be ready to grow into the full XMLUI expression and event
parser. It should keep script source locations, token classifications,
diagnostics, dependency metadata, and scope information precise enough for both
compiler output and LSP features.

## Compatibility Baseline

The old XMLUI implementation remains the source of truth for semantics. Before
changing behavior, compare against the original project for:

- scripting parser behavior and diagnostics;
- dependency collection for expressions and handlers;
- `computedUses` and related reactive metadata;
- XMLUI's default optional member access semantics;
- expression and handler evaluation in managed React containers;
- VS Code syntax highlighting and language-service expectations for embedded
  XMLUI script.

For this first slice, do not copy the old interpreter architecture. Keep the
Managed React principle that XMLUI script is parsed, checked, and compiled by
the framework instead of being executed as ad hoc user JavaScript strings.

## Architecture Direction

The current parser already has a script scanner, script parser, AST, source
spans, diagnostics, token lookup, and LSP-facing token adapters. This plan
should build on that foundation rather than replacing it.

The new layer should introduce a semantic script pipeline:

1. scan XMLUI script into tokens;
2. parse tokens into a recoverable script AST;
3. bind names against an XMLUI scope model;
4. collect read dependencies and write targets;
5. lower the checked AST into XMLUI expression/event IR;
6. compile the expression/event IR into JavaScript function bodies for the
   runtime slice;
7. expose diagnostics and semantic information to the VS Code extension.

Parser and semantic stages should stay separate. The parser should continue to
accept incomplete or malformed input for editor scenarios, while semantic
checking should produce recoverable diagnostics and partial metadata where
possible.

## Source and LSP Contract

Expression and event parsing must preserve the same source model as markup
parsing:

- every token, AST node, semantic IR node, dependency, and diagnostic points
  back to a `SourceSpan`;
- embedded script spans map to the containing `.xmlui` source file rather than
  a detached synthetic file;
- scanner-only tokenization remains available for syntax highlighting;
- parsed AST and semantic IR remain available for hover, completion,
  diagnostics, definition, rename, and folding work later;
- syntax errors and semantic errors return partial results instead of throwing;
- token lookup should work inside identifiers, `$props` paths, string literals,
  operators, and event-handler statements.

VS Code support should continue to use parser-owned metadata. Extension code
may translate metadata to VS Code types, but it should not define independent
XMLUI script semantics.

## Initial Semantic IR

Introduce a small XMLUI-owned IR that can grow with the language:

- `LiteralExpression` for numbers and strings;
- `IdentifierRead` for `count`;
- `ScopedMemberRead` for `$props.label`;
- `LogicalExpression` for `left || right`;
- `PostfixUpdate` for `count++`;
- `ExpressionStatement` for event handlers;
- `EventHandler` as a checked statement list;
- dependency metadata for each expression and handler;
- write-target metadata for update expressions.

Metadata should classify dependencies as:

- local state;
- global state;
- props;
- unresolved;
- reserved/special scope such as `$props`.

For now, `$props.member` is the only special member-read form required. The IR
shape should still allow later support for `$context`, component APIs, data
sources, function calls, optional member access, array/object literals, and
assignment forms.

## Name Resolution and Scope

The semantic checker should consume an XMLUI scope description produced by the
compiler pipeline. For the initial examples, the scope must represent:

- local variables declared with `var.*`;
- globals declared with `global.*`;
- component props accessed through `$props`;
- lexical shadowing where local state hides global state;
- event-handler write permissions for mutable local/global state.

Resolution rules should produce stable metadata:

- reads resolve to the closest local binding, then globals, then special scopes
  such as `$props`;
- writes must resolve to mutable local or global state for now;
- unresolved reads should produce diagnostics but keep a partial IR node;
- unresolved writes should be rejected early when practical;
- `$props` member reads should be read-only.

This scope model should not become a flat runtime state object. It should be a
compiler-facing representation that can later generate explicit state slots and
reactive invalidation.

## JavaScript Compilation Target

For the initial runtime slice, compile checked expression/event IR into
JavaScript functions that receive a small explicit execution context rather than
relying on `eval` or dynamic global lookup. The compiler must not emit rendering
code, React components, render functions, DOM instructions, or render-node
factories.

The generated shape should make future optimization straightforward:

- expression functions return values;
- event functions perform known state writes through explicit setters or
  generated invalidation hooks;
- dependencies and writes are emitted next to generated code;
- source-map hooks are planned from the start, even if the first output only
  carries spans in metadata.

Generated script code should be simple before it is clever. The important result
is that the runtime calls compiled expression/event functions and does not
interpret XMLUI script ASTs on every render or event.

## VS Code Extension Plan

Extend the existing `tools/vscode` package alongside parser/compiler work:

- update semantic token collection to use the richer script AST/semantic
  metadata for identifiers, `$props`, member names, literals, operators, and
  write targets;
- keep TextMate grammar support as a fast fallback for XMLUI markup and
  embedded script regions;
- add diagnostics surfaced from script parse and semantic checks for unresolved
  names, invalid write targets, and malformed handlers;
- add tests for semantic highlighting of expression text, expression
  attributes, and `on*` event attributes;
- keep extension logic thin: translate parser/compiler metadata into VS Code
  tokens and diagnostics without duplicating parser rules.

This is not yet a full language server. The extension work should prepare the
path for one by preserving protocol-shaped data and avoiding VS Code-specific
logic in parser or compiler packages.

## Implementation Steps

Each step should be independently implementable and leave the repository in a
working state. A step is complete only when its focused unit tests pass and
existing parser, compiler, runtime, and VS Code tests still pass.

1. Original behavior notes — completed
   - Inspect the old scripting parser, dependency collection, optional member
     access behavior, and VS Code language support for overlapping syntax.
   - Record concise findings in this plan or `.ai/`.
   - Tests: none required, but findings must point to source files or docs.

2. Script AST hardening — completed
   - Review the current script AST for the initial syntax subset.
   - Ensure every node has stable kind, span, child relationships, and useful
     diagnostics for incomplete editor input.
   - Add missing recovery cases for `$props.`, `count++`, unterminated strings,
     and incomplete logical expressions.
   - Tests: AST shape, source spans, token lookup, and recovery snapshots.

3. Scope model — completed
   - Add compiler-facing scope types for locals, globals, props, special names,
     shadowing, mutability, and source spans of declarations.
   - Build the initial scope from parsed XMLUI component/app attributes.
   - Tests: local scope, global scope, `$props`, shadowing, duplicate names if
     the current compiler can detect them safely.

4. Semantic binding — completed
   - Bind identifier reads and `$props.member` reads against the scope model.
   - Preserve unresolved nodes with diagnostics.
   - Mark dependency kind and resolved declaration metadata.
   - Tests: `count`, `$props.label`, shadowed `count`, unresolved reads, and
     source ranges for diagnostics.

5. Event write analysis — completed
   - Identify write targets for postfix increment.
   - Accept mutable local/global state writes.
   - Reject `$props.label++`, unknown targets, and non-assignable expressions.
   - Tests: `count++` for local/global targets, unresolved writes, prop writes,
     and malformed update expressions.

6. Expression/event semantic IR — completed
   - Lower the checked AST into XMLUI-owned IR nodes for literals, reads,
     logical OR, postfix updates, and expression statements.
   - Attach dependency and write metadata to the IR.
   - Tests: IR snapshots for all three counter examples and focused expression
     cases.

7. JavaScript expression compilation — completed
   - Compile literal, identifier, `$props.member`, and logical OR expressions
     into JavaScript functions using explicit context access.
   - Preserve XMLUI-compatible fallback behavior where it is required by the
     initial examples.
   - Tests: compiled function output for `{0}`, `{count}`, string literals, and
     `$props.label || 'Click to increment'`.

8. JavaScript event-handler compilation — completed
   - Compile `count++` handlers into functions that update explicit mutable
     state slots and report invalidation metadata.
   - Keep the compiled shape ready for future statement lists and async work.
   - Tests: local counter increments, global counter increments, shadowed local
     counter increments, and rejected write targets.

9. Compiler pipeline integration — completed
   - Replace any remaining expression/event-specific runtime interpretation in
     the first experiment with semantic analysis plus compiled functions.
   - Keep the existing runtime-facing IR stable where possible.
   - Tests: existing unit tests for `parseXmlui`, `compileXmluiModule`, and the
     three counter E2E examples.

10. Diagnostics integration — completed
    - Thread script parse and semantic diagnostics through markup transform,
      Vite build output, and test helpers.
    - Keep source ranges mapped to the original `.xmlui` files.
    - Tests: unresolved expression, invalid event target, malformed event
      handler, and mixed text expression diagnostics.

11. VS Code semantic tokens — completed
    - Extend semantic token generation to distinguish XMLUI script identifiers,
      special variables, member names, literals, operators, and write targets
      using parser/semantic metadata.
    - Tests: token snapshots for text expressions, expression attributes,
      `onClick="count++"`, `$props.label`, and shadowing where metadata is
      available.

12. VS Code diagnostics — completed
    - Surface parser and semantic diagnostics in the extension for open
      `.xmlui` documents.
    - Keep diagnostics protocol-shaped in shared code and only adapt them in
      `tools/vscode`.
    - Tests: extension-level diagnostic conversion for parse errors,
      unresolved names, and invalid writes.

13. Compatibility and omission notes — completed
    - Compare the implemented subset with the old project for overlapping
      syntax and record intentional omissions.
    - Ensure the plan names deferred items before closing the experiment.
    - Tests: regression tests for any compatibility differences discovered
      inside the implemented subset.

## Test Requirements

This experiment is invalid without unit tests and editor-facing tests.

Required coverage:

- script parser recovery for the initial syntax subset;
- source spans for all expression and event nodes;
- scope creation from `var.*`, `global.*`, and component props;
- local/global/probe resolution and shadowing;
- dependency collection for identifier and `$props.member` reads;
- write-target collection for `count++`;
- semantic diagnostics for unresolved names and invalid writes;
- compiled expression functions for all initial binding forms;
- compiled event functions for all initial event forms;
- Vite/compiler integration for all three counter examples;
- VS Code semantic tokens for markup-embedded expressions and event handlers;
- VS Code diagnostics for script parse and semantic errors.

## Deferred Features

Do not implement these in this slice unless a test or compatibility finding
forces them:

- async handlers;
- statement queues;
- imports;
- user-defined functions;
- arrow callbacks;
- member assignment;
- arrays and objects;
- calls beyond what later experiments require;
- ternary conditionals;
- nullish coalescing;
- full optional chaining;
- banned globals and sandbox enforcement;
- timers and browser global policy;
- full source-map emission;
- full language server completion, hover, rename, or definition.

The architecture should leave space for these features, but the first
experiment should stay narrow and measurable.

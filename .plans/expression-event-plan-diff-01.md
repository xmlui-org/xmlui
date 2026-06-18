# Expression/Event Plan Diff 01

## Prompt

Use `.plans/master-plan.md` and, according to section `4. Expression and Event
Parsing`, create a plan. Split the entire task into smaller, testable steps.
Also plan to extend the existing VS Code extension with the new markup syntax.
Although the parser initially focuses only on a few syntax elements, make sure
its architecture is ready to become the full expression parser in the future and
also supports LSP.

## Edits

- Created `.plans/expression-event-plan.md`.
- Defined the expression/event parsing scope, compatibility baseline, LSP
  contract, initial semantic IR, scope model, JavaScript compilation target,
  VS Code extension plan, implementation steps, test requirements, and deferred
  features.

## Prompt

From now on, the subject of snapshots is the new plan. Continue with Steps 1
and 2.

## Edits

- Recorded original XMLUI scripting architecture findings in
  `.ai/expression-event-old-architecture.md`.
- Hardened script AST cursor lookup with previous-node information for editor
  scenarios.
- Added recovery-focused parser tests for incomplete member access, postfix
  updates, unterminated strings, incomplete logical expressions, and cursor
  lookup between child nodes.
- Updated `AGENTS.md` so unqualified snapshots default to
  `.plans/expression-event-plan.md`.
- Marked Steps 1 and 2 complete.

## Prompt

Continue with Steps 3 and 4.

## Edits

- Added a compiler-facing XMLUI scope model for locals, globals, `$props`,
  inherited local scopes, mutability, declaration spans, and shadowing.
- Added semantic binding for identifier reads and `$props.member` reads.
- Added recoverable unresolved-read diagnostics and dependency metadata.
- Added semantic tests for scope creation, resolution, `$props`, logical
  dependencies, shadowing, inherited locals, and unresolved identifiers.
- Marked Steps 3 and 4 complete.

## Prompt

Continue with Steps 5 and 6.

## Edits

- Added event write analysis for postfix updates.
- Accepted local/global writes and rejected `$props` writes, unresolved writes,
  and non-assignable postfix targets.
- Added XMLUI semantic IR nodes for literals, identifier reads, scoped member
  reads, logical expressions, postfix updates, expression statements, and event
  handlers.
- Added IR lowering tests for local counters, component label fallbacks, and
  global counter handlers.
- Marked Steps 5 and 6 complete.

## Prompt

Continue with Steps 7 and 8.

## Edits

- Added JavaScript compilation output for expression IR using explicit context
  reads.
- Added JavaScript compilation output for event-handler IR using explicit
  local/global writes.
- Added invalidation metadata for compiled event handlers.
- Added tests for compiled literals, local/global reads, `$props` fallback
  expressions, local/global increments, shadowing, and invalid write targets.
- Marked Steps 7 and 8 complete.

## Prompt

Continue with Steps 9 and 10.

## Edits

- Integrated semantic analysis and compiled metadata into the XMLUI compiler
  pipeline.
- Added semantic IR, dependencies, writes, invalidations, and generated source
  strings to parsed expressions, mixed-text expressions, and events.
- Updated the runtime to execute compiled IR through explicit context hooks
  instead of dynamic `Function(...)` or `with(scope)`.
- Threaded parser and semantic diagnostics through parse and module compilation.
- Added tests for compiled metadata and diagnostic surfacing.
- Marked Steps 9 and 10 complete.

## Prompt

Continue with the remaining compiler implementation.

## Edits

- Extended VS Code semantic tokens to distinguish XMLUI special names, member
  names, and write targets.
- Added parser/compiler-backed VS Code diagnostics for XMLUI documents.
- Added extension tests for semantic token categories and diagnostics.
- Added `.ai/expression-event-compatibility-closure.md` documenting the
  implemented compatibility surface and intentional omissions.
- Verified the runtime/compiler/extension paths and marked Steps 11, 12, and
  13 complete.

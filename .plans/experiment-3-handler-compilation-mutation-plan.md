# Experiment 3: Handler Compilation and Mutation Semantics Plan

Status: implemented  
Parent plan: `.plans/master-plan.md`, section `7. Incremental Experiment Roadmap`

## Purpose

Experiment 1 proved that `count++` handlers can mutate local/global state
through explicit runtime helpers. Experiment 2 broadened expression compilation
and added update-oriented samples where `count++` drives recomputation of
compiled expressions.

Experiment 3 expands event handlers from a single postfix update into a small
compiled statement language. The goal is to learn whether compiled handlers can
replace the old interpreted statement queue while preserving XMLUI mutation
semantics, diagnostics, dependency metadata, invalidation, and source identity.

The experiment answers this question:

Can XMLUI event handlers with assignments, blocks, conditionals, loops, local
variables, function calls, and multiple statements compile to JavaScript
functions while keeping every state write explicit and runtime-routed?

## Scope

Add event-handler support for:

- assignment statements: `count = count + 1`;
- compound assignments: `count += 1`, `count -= 1`, `count *= 2`,
  `count /= 2`, `count %= 2`;
- prefix and postfix updates: `++count`, `count++`, `--count`, `count--`;
- multi-statement handlers separated by semicolons;
- statement blocks: `{ ... }`;
- `if` / `else` statements;
- `while` loops with a safety guard;
- `for` loops with simple initializer/test/update clauses if old behavior and
  implementation complexity stay reasonable;
- handler-local `let` and `const` declarations;
- expression statements using the Experiment 2 expression subset;
- allowlisted function and method calls inside handlers;
- explicit state writes for local and global variables.

Every sample in this experiment must include user-visible data modification and
tests proving the rendered result changes after interaction.

## Non-Goals

- Do not compile rendering.
- Do not add async handlers, `await`, promises, timers, imports, classes,
  generators, destructuring, spread/rest, template literals, `try`/`catch`,
  `switch`, labels, `break`/`continue`, or `return` unless an old XMLUI
  compatibility check proves one is essential for this experiment.
- Do not support arbitrary browser globals or arbitrary function calls.
- Do not implement path-level object/array mutation as a broad feature unless a
  narrow fixture requires it. Prefer whole-state-slot assignment first.
- Do not reintroduce the old interpreter, `eval`, `new Function`, `with`, or
  string-fed runtime execution.
- Do not replace the VS Code extension with a full language server yet.

## Compatibility Baseline

The old XMLUI implementation remains the behavior contract. Relevant notes:

- `.ai/expression-event-old-architecture.md`
- `.ai/expression-event-compatibility-closure.md`
- `.ai/code-generation-compatibility-closure.md`
- `.ai/experiment-2-broader-expression-compatibility-closure.md`

Before implementation, inspect these old XMLUI areas:

- `/Users/dotneteer/source/xmlui/xmlui/src/parsers/scripting/Parser.ts`
  for statement grammar, recovery behavior, and AST shapes.
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/script-runner/`
  for handler execution, assignment, member access, call restrictions, and
  statement queue behavior.
- Old tests covering event handlers, state updates, and action execution.

Compatibility points to preserve:

- Parser errors should be diagnostics, not ordinary control flow.
- Handler statements should run in source order.
- A write in one statement should be visible to later statements in the same
  handler when old XMLUI semantics promise it.
- State writes must route through XMLUI runtime helpers so invalidation and
  subscriptions stay explicit.
- `$props` and other read-only scopes must reject writes.
- Local variables should shadow globals for both reads and writes.
- Handler-local `let`/`const` should shadow XMLUI state only within the handler
  block where old XMLUI does so.

## Mutation Semantics Direction

Generated event functions keep the current shape:

```ts
(ctx) => void
```

The event context remains explicit:

- `ctx.readLocal(name)`;
- `ctx.writeLocal(name, value)`;
- `ctx.readGlobal(name)`;
- `ctx.writeGlobal(name, value)`;
- `ctx.props`;
- optional helper calls for allowed runtime behavior, such as
  `ctx.call(...)`, `ctx.assign(...)`, or `ctx.loopGuard(...)` if direct
  JavaScript would bypass XMLUI semantics.

Generated code must never assign XMLUI state with plain JavaScript variables
such as `count = ...`. XMLUI state assignments must compile to helper calls:

```js
ctx.writeLocal("count", ctx.readLocal("count") + 1);
ctx.writeGlobal("total", ctx.readGlobal("total") + 1);
```

Handler-local variables may compile to native JavaScript variables:

```js
let next = ctx.readLocal("count") + 1;
ctx.writeLocal("count", next);
```

## Statement-To-Statement Visibility

This experiment must explicitly verify visibility between statements:

```xml
<Button onClick="count = count + 1; doubled = count * 2" />
```

The second statement must see the updated `count` if old XMLUI behavior expects
that. If old behavior batches writes differently, record it and match the old
contract.

The runtime store currently makes writes immediately visible. If that differs
from old XMLUI, introduce a handler transaction model only after documenting the
compatibility need.

## Write Target Policy

Initially accepted write targets:

- identifiers resolving to mutable local state;
- identifiers resolving to mutable global state;
- handler-local `let` variables;
- handler-local variables in compound assignments and update expressions.

Initially rejected write targets:

- `$props.member`;
- unresolved identifiers;
- read-only bindings;
- arbitrary member/index paths such as `user.name = 'Ada'`, unless a deliberate
  narrow object-mutation slice is planned;
- call results or complex expressions such as `(a || b) = value`.

Rejected writes should produce diagnostics with source spans and partial IR for
editor recovery.

## Function Call Policy

Reuse Experiment 2's allowlist for expression calls. Handler calls should remain
allowlisted and should never expose arbitrary browser globals.

Initial accepted calls:

- allowlisted array/string methods already supported by Experiment 2;
- explicitly introduced safe helper calls if needed by fixtures.

Initial rejected calls:

- `window.*`, `document.*`, `eval`, `Function`, timers, and unknown global
  functions;
- arbitrary unresolved identifiers such as `save()` unless the experiment
  introduces a deliberate callable binding model.

Unsupported calls should produce diagnostics instead of falling back to runtime
execution.

## Source and Diagnostics Contract

Every new statement node, semantic IR node, write target, dependency,
diagnostic, and generated event function should preserve source identity mapped
to the containing `.xmlui` file.

Diagnostics should cover:

- malformed blocks and statements;
- invalid declaration forms;
- assignment to read-only or unresolved names;
- unsupported member/index writes;
- unsupported calls;
- loop syntax errors;
- loop guard failures if runtime protection is added.

The VS Code extension should continue to consume parser/compiler metadata and
should not grow a second event-handler parser.

## Proposed Runtime Samples

### Assignment Updates

```xml
<App var.count="{0}" var.doubled="{0}">
  <H1>Assignment handler updates</H1>
  <Text value="{'count: ' + count}" />
  <Text value="{'doubled: ' + doubled}" />
  <Button onClick="count = count + 1; doubled = count * 2">
    Update: {count}
  </Button>
</App>
```

This proves assignment, multi-statement execution, and statement-to-statement
visibility.

### Conditional Updates

```xml
<App var.count="{0}" var.label="{'idle'}">
  <H1>Conditional handler updates</H1>
  <Text value="{label}" />
  <Button onClick="count += 1; if (count > 1) { label = 'many' } else { label = 'one' }">
    Count: {count}
  </Button>
</App>
```

This proves compound assignment, `if`/`else`, block statements, and visible
rendered updates.

### Local Handler Variables

```xml
<App var.count="{0}" var.total="{0}">
  <H1>Handler locals</H1>
  <Text value="{'total: ' + total}" />
  <Button onClick="let next = count + 1; count = next; total = total + next">
    Add next: {count}
  </Button>
</App>
```

This proves handler-local `let`, state assignment after local calculation, and
multi-slot invalidation.

### Loop Guard Fixture

```xml
<App var.count="{0}" var.total="{0}">
  <H1>Loop handler updates</H1>
  <Text value="{'total: ' + total}" />
  <Button onClick="let i = 0; while (i < 3) { total += count + i; i++ }">
    Run loop
  </Button>
</App>
```

This proves loop compilation while forcing a bounded loop in tests. Add a
runtime loop guard before enabling untrusted loops.

## Implementation Steps

Each step must leave the repository buildable. Run at least
`npm --workspace xmlui run test` after each completed implementation step.
Run E2E once runtime samples are added. Run VS Code tests when parser/editor
metadata changes.

### 1. Old Behavior Audit

- Inspect old parser statement grammar and script-runner behavior for
  assignments, blocks, conditionals, loops, local declarations, function calls,
  and statement queues.
- Record old behavior and deliberate omissions in `.ai/`.
- Decide whether statement-to-statement state visibility is immediate or
  batched in old XMLUI.

Verification:

- AI note exists with old source references and decisions.

### 2. Statement Token Expansion

- Add scanner tokens for missing statement syntax:
  `let`, `const`, `if`, `else`, `while`, `for`, `++`, `--`, `+=`, `-=`, `*=`,
  `/=`, `%=`, block braces, semicolons, and any missing loop punctuation.
- Preserve LSP classifications.

Verification:

- Scanner tests for all new tokens and embedded source spans.
- `npm --workspace xmlui run test`.

### 3. Statement AST

- Add AST nodes for:
  - `BlockStatement`;
  - `IfStatement`;
  - `WhileStatement`;
  - optional `ForStatement`;
  - `VariableDeclaration`;
  - `VariableDeclarator`;
  - `AssignmentExpression`;
  - `UpdateExpression` or extend existing postfix node;
  - `ExpressionStatement`.
- Keep event-handler parse mode recoverable for incomplete editor input.

Verification:

- Parser tests for each statement shape and recovery case.
- `npm --workspace xmlui run test`.

### 4. Handler Scope Model

- Add handler-local lexical scopes for `let`/`const` and block nesting.
- Make handler locals shadow XMLUI state reads/writes within their block.
- Track mutability so `const` assignment diagnostics work.
- Preserve current XMLUI scope resolution for locals/globals/props.

Verification:

- Semantic tests for local shadowing, `const` write rejection, and XMLUI state
  fallback.
- `npm --workspace xmlui run test`.

### 5. Write Analysis

- Extend write target analysis for:
  - direct assignment;
  - compound assignment;
  - prefix/postfix increments and decrements;
  - handler-local writes;
  - local/global XMLUI state writes.
- Reject `$props`, unresolved names, read-only names, and unsupported
  member/index writes.

Verification:

- Semantic tests for accepted/rejected writes.
- Write metadata includes invalidation targets for local/global state.
- `npm --workspace xmlui run test`.

### 6. Handler IR

- Extend semantic IR with statement nodes separate from expression nodes.
- Keep expression IR reusable from Experiment 2.
- Represent state writes explicitly in IR rather than encoding them as raw
  JavaScript.
- Preserve source spans on every statement and write.

Verification:

- IR shape tests for assignment, compound assignment, block, if/else, local
  declaration, and loop fixtures.
- `npm --workspace xmlui run test`.

### 7. Generated Handler Code

- Extend `codegen/script.ts` to emit JavaScript for new handler IR.
- Route XMLUI state writes through `ctx.writeLocal`/`ctx.writeGlobal`.
- Emit handler-local variables as native JavaScript only for semantic local
  declarations.
- Preserve source-readable dev output.

Verification:

- Generated source tests.
- Execution tests using fake contexts.
- `npm --workspace xmlui run test`.

### 8. Statement Visibility Tests

- Add tests proving later statements see earlier writes according to the old
  compatibility decision.
- If a transaction model is needed, add it behind the event execution boundary
  and keep invalidation explicit.

Verification:

- Unit tests execute compiled handlers and inspect state after each scenario.
- `npm --workspace xmlui run test`.

### 9. Loop Guard

- Add a conservative runtime loop guard before enabling `while` or `for`.
- Make guard failures diagnostic or runtime errors with source metadata.
- Choose a small default iteration limit for the experiment, then document it.

Verification:

- Tests for bounded loops and guard failures.
- `npm --workspace xmlui run test`.

### 10. Function Calls in Handlers

- Reuse Experiment 2 allowlisted call semantics.
- Ensure method calls cannot mutate XMLUI state except through explicit
  assignment/write statements.
- Reject unsupported call targets with diagnostics.

Verification:

- Tests for allowed methods and rejected arbitrary calls.
- `npm --workspace xmlui run test`.

### 11. VS Code Extension Updates

- Extend semantic tokens for statement keywords, declarations, block syntax,
  write targets, and handler-local variables.
- Surface diagnostics for invalid writes, unsupported calls, malformed blocks,
  and unsupported statements.
- Keep extension logic as a thin adapter over parser/compiler metadata.

Verification:

- `npm --workspace xmlui-vscode run test`.
- `npm --workspace xmlui-vscode run build`.

### 12. Runtime Samples

- Add the proposed update samples under `xmlui/src/examples`.
- Wire them in `xmlui/src/main.tsx` with query names such as:
  - `?example=handlerAssignments`;
  - `?example=handlerConditionals`;
  - `?example=handlerLocals`;
  - `?example=handlerLoops`.
- Keep samples small and focused.

Verification:

- `npm --workspace xmlui run build`.

### 13. E2E Update Coverage

- Add Playwright tests for every new sample.
- Tests must click controls and assert rendered state changes.
- Preserve existing Experiment 1 and 2 E2E tests.

Verification:

- `npm --workspace xmlui run test:e2e`.

### 14. Closure Note

- Record implemented syntax, mutation semantics, omissions, compatibility
  decisions, and verification commands in `.ai/`.
- Mark this plan implemented only after all verification passes.

Verification:

- Closure note exists and links to source/tests.

## Success Criteria

Experiment 3 is successful when:

- event handlers compile assignments, compound assignments, blocks,
  conditionals, local declarations, and at least one bounded loop form;
- every XMLUI state write is explicit and compiler-routed through runtime
  helpers;
- statement-to-statement visibility matches documented old XMLUI behavior;
- invalid writes and unsupported calls produce diagnostics;
- generated handlers do not rely on runtime AST interpretation;
- dependency/write/invalidation metadata remains available to the runtime;
- VS Code syntax highlighting and diagnostics understand the new handler
  syntax;
- runtime samples demonstrate visible data modification;
- E2E tests prove those modifications update rendered output;
- all existing Experiment 1 and 2 behavior remains green.

## Risks and Open Questions

- Old XMLUI may batch handler writes in ways that differ from the current
  immediate store writes.
- Member/index assignment may become necessary for realistic apps, but it risks
  reintroducing proxy-style mutation tracking if not scoped carefully.
- Loops require a guard to avoid freezing the app during development.
- Handler-local scoping must be precise or local variables may accidentally
  shadow XMLUI state writes.
- Allowlisted calls may need metadata from future component contracts.
- Diagnostic recovery for nested blocks can become noisy; prefer fewer,
  accurate diagnostics over cascades.

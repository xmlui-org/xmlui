# Experiment 2: Broader Expression Compilation Plan

Status: implemented  
Parent plan: `.plans/master-plan.md`, section `7. Incremental Experiment Roadmap`

Implementation closure: `.ai/experiment-2-broader-expression-compatibility-closure.md`

## Purpose

Experiment 1 proved that the rewrite can compile the expression and event
handler subset needed by counter apps while keeping rendering in the runtime.
Experiment 2 broadens expression compilation enough to stress the compiler
architecture without expanding the event-handler statement language yet.

The experiment answers this question:

Can XMLUI's broader expression semantics be compiled to JavaScript functions
with precise source locations, diagnostics, and dependency metadata, without
falling back to the old interpreted execution model?

## Scope

Add expression support for:

- boolean, null, and undefined literals;
- array literals;
- object literals with simple properties, shorthand properties, and string keys;
- arithmetic operators: `+`, `-`, `*`, `/`, `%`;
- comparison operators: `<`, `<=`, `>`, `>=`, `==`, `!=`, `===`, `!==`;
- logical operators: existing `||`, plus `&&`;
- nullish coalescing: `??`;
- unary operators: `!`, unary `+`, unary `-`;
- conditional expressions: `condition ? whenTrue : whenFalse`;
- parenthesized expressions;
- member access chains, including XMLUI default optional member access;
- optional member access: `value?.member`;
- indexed access: `items[index]`;
- optional indexed access: `items?.[index]`;
- function calls for explicitly allowed functions;
- optional calls for explicitly allowed functions;
- basic arrow callbacks for allowlisted higher-order functions such as
  `items.map(item => item.label)` and `items.filter(item => item.visible)`.

This plan covers expression parsing, semantic binding, dependency collection,
IR lowering, JavaScript code generation, diagnostics, tests, and VS Code
language support for the broadened expression subset.

## Non-Goals

- Do not compile rendering.
- Do not add broad event-handler statement support. That belongs to Experiment
  3, except for reusing expression parsing where existing event syntax needs it.
- Do not add async expressions, `await`, generator syntax, classes, `new`,
  imports, destructuring, spread/rest, template literals, assignment
  expressions, or sequence expressions in this experiment.
- Do not expose arbitrary browser globals or arbitrary JavaScript built-ins.
- Do not introduce `eval`, `new Function`, `with`, or string-fed runtime
  interpretation.
- Do not replace the current VS Code extension with a full language server yet.

## Compatibility Baseline

The old XMLUI implementation remains the behavior contract. Relevant old
architecture findings are recorded in:

- `.ai/expression-event-old-architecture.md`
- `.ai/expression-event-compatibility-closure.md`
- `.ai/code-generation-compatibility-closure.md`
- `.ai/initial-experiment-compatibility-closure.md`

Important compatibility points:

- The old scripting parser is JavaScript-like and stores parser errors rather
  than treating ordinary parse failures as fatal control flow.
- Dependency collection preserves member paths when possible.
- XMLUI supports default optional member access through evaluation options.
  This means `parent.member` may behave like `parent?.member` for reads in
  XMLUI expressions.
- Editor support should be driven by parser/compiler metadata, not by a
  separate expression parser in the VS Code extension.

Before implementing each expression feature, inspect the matching old behavior
in `/Users/dotneteer/source/xmlui` when semantics are uncertain.

## Source and Diagnostics Contract

Every new syntax node, semantic IR node, dependency, diagnostic, and generated
function should keep source identity that maps back to the containing `.xmlui`
file.

Diagnostics should:

- recover enough parser structure for editor features when possible;
- include spans for unsupported syntax, malformed operators, invalid member
  access, invalid calls, and unresolved identifiers;
- avoid duplicate cascaded errors when one syntax issue explains the rest;
- be reusable by both compiler tests and the VS Code extension.

Generated expression metadata should continue to include:

- XMLUI source text;
- compiled JavaScript source body;
- dependency metadata;
- source spans;
- stable generated names or IDs where already present.

## Expression Semantics Direction

Generated expression functions keep the current shape:

```ts
(ctx) => unknown
```

The context remains explicit:

- `ctx.props`;
- `ctx.readLocal(name)`;
- `ctx.readGlobal(name)`;
- future-safe helper calls such as `ctx.call(...)`, `ctx.member(...)`, or
  `ctx.optionalMember(...)` if XMLUI semantics cannot be represented safely as
  direct JavaScript.

Use direct JavaScript only when it matches XMLUI semantics. Use small runtime
helpers when XMLUI behavior differs from native JavaScript, especially for:

- default optional member access;
- restricted function calls;
- method-style calls that must preserve receiver semantics;
- callback scopes and dependency collection.

## Function Call Policy

Function calls are the main safety boundary for this experiment.

The compiler should support only allowlisted calls. Initial candidates:

- functions passed through `$props` only if explicitly represented as callable
  props in the runtime context;
- locally resolved function values only when the current compatibility slice can
  prove they are intentionally callable;
- array methods needed by fixtures: `map`, `filter`, `find`, `some`, `every`,
  and `includes`;
- string methods needed by fixtures: `toLowerCase`, `toUpperCase`, `includes`,
  `startsWith`, and `endsWith`.

Unsupported calls should produce diagnostics with a partial IR node, not silently
fall back to runtime evaluation.

## Dependency Metadata

Dependency collection must remain precise enough for the rendering pipeline:

- `count + 1` depends on `count`.
- `user.name` depends on `user.name` when that path can be represented.
- `items[index]` depends on `items` and `index`.
- `$props.items.map(item => item.label)` depends on `$props.items`; callback
  parameter `item` is local to the callback and must not become a state
  dependency.
- `selected?.label ?? fallbackLabel` depends on `selected.label` or at least
  `selected`, and on `fallbackLabel`.

When exact path dependency is ambiguous, prefer a conservative root dependency
over an incorrect path dependency. Record these cases in tests.

## Proposed Fixtures

Add focused XMLUI examples or test fixtures before broad runtime app work:

```xml
<App var.count="{1}">
  <Text value="{count + 1}" />
</App>
```

```xml
<App var.user="{{ name: 'Ada', profile: null }}">
  <Text value="{user.profile.title ?? user.name}" />
</App>
```

```xml
<App var.items="{[{ label: 'One' }, { label: 'Two' }]}" var.visible="{true}">
  <Text value="{items.map(item => item.label).join(', ')}" />
</App>
```

```xml
<App var.count="{2}">
  <Text value="{count > 1 ? 'many' : 'one'}" />
</App>
```

Use the real component names only if the current runtime supports them. If not,
keep these as compiler fixtures until the runtime grows the needed built-ins.

## Implementation Steps

Each step should be independently testable and leave the repository buildable.
Prefer compiler-unit coverage first, then VS Code token/diagnostic coverage,
then runtime/E2E fixtures for expressions that can already render.

### 1. Old Behavior Audit

- Inspect the old parser, dependency visitor, and evaluator for the expression
  syntax targeted by this experiment.
- Record any XMLUI-specific deviations from native JavaScript in `.ai/`.
- Decide which calls are safe to allow in this experiment.

Verification:

- Add or update an AI note with source-file references and decisions.

### 2. Token and Scanner Expansion

- Add tokens for the missing operators and punctuation:
  `?`, `:`, `??`, `?.`, `[`, `]`, `{`, `}`, `,`, arithmetic operators,
  comparison operators, `!`, and `=>`.
- Preserve token classifications for LSP/VS Code.
- Add recovery tokens for malformed or incomplete operator sequences.

Verification:

- Unit tests for token sequences and source spans.
- VS Code semantic-token tests for the new token kinds.

### 3. Parser Precedence Framework

- Replace or extend the current expression parser with a precedence-aware
  parser that can grow toward the old JavaScript-like grammar.
- Keep existing literals, identifiers, `$props.member`, `||`, and postfix
  update behavior unchanged.
- Parse parenthesized expressions without losing source spans.

Verification:

- Unit tests for operator precedence and associativity:
  `a + b * c`, `(a + b) * c`, `a || b && c`, `a ?? b || c` diagnostics if
  mixing rules require parentheses.

### 4. Literal Syntax

- Add AST and IR support for boolean, null, undefined, arrays, and objects.
- Support object string keys and simple identifiers.
- Support object shorthand only when the shorthand name resolves as an
  expression dependency.

Verification:

- Parser, semantic, IR, and codegen tests for literals.
- Diagnostics for malformed arrays/objects and unsupported spread.

### 5. Arithmetic, Comparison, Logical, Unary, and Conditional Operators

- Add AST and IR nodes for unary, binary, logical, nullish, and conditional
  expressions.
- Preserve short-circuit semantics for `&&`, `||`, `??`, and ternaries.
- Generate JavaScript expressions only when native JavaScript matches XMLUI
  semantics.

Verification:

- Compiler tests that execute generated functions.
- Dependency tests proving both sides of expressions are collected where
  statically referenced.

### 6. Member and Index Access

- Add member-chain and index-access parsing:
  `user.name`, `user.profile.title`, `items[index]`.
- Add optional access parsing:
  `user?.name`, `items?.[index]`.
- Implement XMLUI default optional member access for ordinary member reads.
  Prefer a helper if direct JavaScript would throw where XMLUI should return
  `undefined`.

Verification:

- Generated-code tests for null/undefined receivers.
- Dependency tests for root and member-path tracking.
- Diagnostics for invalid member/index syntax.

### 7. Call Expressions and Allowlist

- Parse call expressions and optional calls.
- Implement semantic validation for allowed call targets.
- Generate helper-routed calls when needed to enforce the allowlist or preserve
  receiver semantics.
- Produce diagnostics for unsupported calls.

Verification:

- Tests for allowed array/string methods.
- Tests rejecting arbitrary globals such as `window.alert()` and unknown
  function calls.
- Tests for optional calls returning `undefined` when the receiver is missing.

### 8. Arrow Callback Parsing

- Parse single-parameter arrow callbacks and parenthesized single-parameter
  callbacks.
- Treat callback parameters as local lexical bindings inside the callback body.
- Defer multi-parameter, block-body, async, and destructured callbacks unless a
  compatibility fixture requires them.

Verification:

- Parser and semantic tests for `items.map(item => item.label)`.
- Dependency tests proving callback parameters do not resolve as XMLUI state.
- Diagnostics for unsupported callback forms.

### 9. IR Lowering

- Extend semantic IR with the new expression nodes.
- Keep IR independent from JavaScript output details.
- Preserve dependency and source metadata on every node.

Verification:

- IR shape tests for each expression family.
- Round-trip or snapshot-style tests where helpful, kept small enough to review.

### 10. JavaScript Code Generation

- Extend `codegen/script.ts` to emit the new expression subset.
- Add runtime helper imports only if direct context methods are insufficient.
- Keep generated source readable in dev mode and deterministic in tests.

Verification:

- Generated source tests for representative expressions.
- Execution tests using fake contexts.
- Build tests ensuring generated modules are valid under Vite.

### 11. Runtime Helper Boundary

- Add expression runtime helpers only for semantic gaps, such as optional
  member reads or allowlisted calls.
- Keep helpers small, deterministic, and independent from rendering.
- Avoid bringing back AST interpretation through helpers.

Verification:

- Unit tests for each helper.
- Compiler tests proving generated code calls helpers only for intended cases.

### 12. VS Code Extension Updates

- Extend semantic tokens for new expression syntax, operators, literals,
  member names, call targets, and callback parameters.
- Surface parser and semantic diagnostics for new unsupported or malformed
  syntax.
- Keep the extension as a thin adapter over parser/compiler metadata.

Verification:

- VS Code extension tests for highlighting and diagnostics.
- No separate grammar-only semantics for the new expression features.

### 13. Compiler Integration Fixtures

- Add `.xmlui` compiler fixtures that exercise the broadened expression subset
  in props, vars, globals, and mixed text.
- Ensure generated modules include compiled functions and dependency metadata.
- Preserve existing counter samples and tests.

Verification:

- `npm --workspace xmlui run test`
- Targeted compile-module tests for new fixtures.

### 14. Runtime Demonstration Sample

- Add one small Vite-runnable sample only after the expression features compile
  and the runtime can display them with existing built-ins.
- Prefer a compact expression showcase over a new app framework surface.

Verification:

- E2E test proves the sample renders computed values correctly.
- Existing E2E tests for counters still pass.

### 15. Closure Note

- Record implemented expression features, deferred syntax, compatibility risks,
  and verification commands in `.ai/`.
- Update this plan if implementation discoveries change the chosen call policy
  or optional-member helper strategy.

Verification:

- Closure note exists and links to relevant source/tests.

## Success Criteria

Experiment 2 is successful when:

- the planned expression subset compiles to JavaScript functions;
- generated functions execute without runtime AST interpretation;
- dependencies remain available for the rendering pipeline;
- XMLUI default optional member access is preserved for implemented member
  reads;
- unsafe or unsupported calls produce diagnostics rather than executing
  arbitrary JavaScript;
- VS Code syntax highlighting and diagnostics understand the new expression
  syntax;
- focused compiler tests and at least one runtime/E2E demonstration pass;
- existing Experiment 1 counter behavior remains unchanged.

## Risks and Open Questions

- Old XMLUI expression semantics may differ from native JavaScript in more
  places than optional member access.
- Function call allowlisting may need component metadata or type contracts
  earlier than expected.
- Arrow callbacks introduce lexical scopes; careless dependency collection could
  mistake callback parameters for XMLUI state.
- Member-path dependency precision may become difficult for dynamic indexes.
- The first implementation should prefer conservative invalidation over an
  incorrect fine-grained dependency path.

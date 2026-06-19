# Experiment 2 Broader Expression Compatibility Closure

Date: 2026-06-18

Experiment 2 has been implemented for the planned compiler/runtime slice.

## Implemented Surface

- Broadened script scanning for arithmetic, comparison, nullish, optional
  access, ternary, arrow, array/object, and index/call punctuation.
- Extended parser AST support for:
  - arrays and objects;
  - unary, binary, logical, nullish, and conditional expressions;
  - optional member access and optional index access;
  - call expressions;
  - single-parameter arrow callbacks.
- Extended semantic binding and Compiler IR for the new expression shapes.
- Preserved callback lexical parameters so `item` in
  `items.map(item => item.label)` is not treated as XMLUI state.
- Preserved dependency metadata for XMLUI state roots and member paths when
  statically representable.
- Added default optional member/index read behavior for compiled expressions.
- Added allowlisted method calls for the initial expression fixtures:
  `map`, `filter`, `find`, `some`, `every`, `includes`, `join`,
  `toLowerCase`, `toUpperCase`, `startsWith`, and `endsWith`.
- Unsupported expression call targets now produce semantic diagnostics instead
  of falling back to arbitrary JavaScript execution.
- Kept rendering runtime-owned. The compiler still emits only expression and
  event-handler functions.
- Added a minimal `Text` built-in so expression-valued props can be demonstrated
  in the Vite sample without inventing rendering codegen.
- Added the Vite sample `?example=expressions` at
  `xmlui/src/examples/broader-expressions/Main.xmlui`.
- Added update-oriented samples:
  - `?example=expressionUpdates` at
    `xmlui/src/examples/expression-updates/Main.xmlui`;
  - `?example=expressionComponents` at
    `xmlui/src/examples/expression-update-components/Main.xmlui`.
- These update samples use compiled `count++` handlers to mutate state and
  broader compiled expressions to recompute displayed values after mutation.
- Extended parser and VS Code semantic-token coverage for the new expression
  syntax.
- Updated `AGENTS.md` so future experiments must include at least one
  user-visible data modification path and tests proving the rendered result
  changes.

## Deliberate Omissions

- No broad event-handler statement expansion; this remains Experiment 3.
- No async, `await`, imports, destructuring, spread/rest, template literals,
  classes, `new`, assignment expressions beyond existing parser support, or
  sequence expressions.
- No arbitrary global/browser function calls.
- No full language-server process; VS Code remains a parser-backed extension
  adapter.
- Dependency paths for dynamic index access remain conservative.

## Verification

Final verification passed:

```text
npm --workspace xmlui run test
npm --workspace xmlui-vscode run test
npm --workspace xmlui run build
npm --workspace xmlui-vscode run build
npm --workspace xmlui run test:e2e
```

The E2E suite now includes the broader expression sample, the update-oriented
expression samples, and the three Experiment 1 counter samples.

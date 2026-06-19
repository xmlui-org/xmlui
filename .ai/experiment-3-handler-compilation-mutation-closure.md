# Experiment 3: Handler Compilation and Mutation Semantics Closure

Date: 2026-06-19

## Result

Experiment 3 is implemented. XMLUI event handlers now support a small compiled
statement language for the Vite dev-server experiment:

- direct assignment: `count = count + 1`;
- compound assignment: `+=`, `-=`, `*=`, `/=`, `%=`;
- prefix/postfix updates: `++count`, `count++`, `--count`, `count--`;
- semicolon-separated statement lists;
- block statements;
- `if` / `else`;
- guarded `while` loops;
- handler-local `let` and `const`;
- expression statements using the Experiment 2 expression subset;
- allowlisted method calls inside handler expressions.

Every XMLUI local/global state write is represented as a semantic write target
and executed through `ctx.writeLocal` or `ctx.writeGlobal`. Handler-local
variables are the only values that compile or execute as native lexical
variables.

## Compatibility Decisions

The original XMLUI implementation uses the scripting parser in
`/Users/dotneteer/source/xmlui/xmlui/src/parsers/scripting/Parser.ts` and the
statement queue in
`/Users/dotneteer/source/xmlui/xmlui/src/components-core/script-runner/process-statement-sync.ts`.
That queue runs statements in source order and makes assignment effects
available to later statements. The experiment follows that immediate visibility
model.

The old runtime supports a broader JavaScript-like statement set. This
experiment deliberately implements only the mutation slice needed to learn
whether compiled handlers can replace interpretation. Unsupported calls and
invalid writes remain diagnostics instead of falling back to runtime execution.

## Implementation Notes

- The scanner and parser now expose statement tokens and AST nodes that remain
  suitable for the VS Code extension and later LSP work.
- Semantic lowering separates handler statements from expression IR while
  reusing expression nodes from Experiment 2.
- Write metadata records local/global/handler-local targets, operators, source
  spans, dependencies, invalidations, and diagnostics.
- Generated handler source is readable JavaScript, but runtime execution still
  uses structured IR execution rather than `eval` or `new Function`.
- The IR executor preserves handler-local block shadowing and writes to the
  nearest declared lexical binding.
- `while` loops have a 10,000-iteration guard in generated source and IR
  execution.
- Invalidation metadata is deduplicated per local/global binding.

## Runtime Samples

New samples:

- `?example=handlerAssignments`;
- `?example=handlerConditionals`;
- `?example=handlerLocals`;
- `?example=handlerLoops`.

They live under `xmlui/src/examples` and are wired in `xmlui/src/main.tsx`.

## Intentional Omissions

- No rendering compilation.
- No `for`, `do/while`, `switch`, `try/catch`, `break`, `continue`, `return`,
  async/await, imports, destructuring, spread/rest, template literals, classes,
  generators, or arbitrary browser globals.
- No broad member/index mutation such as `user.name = 'Ada'`.
- No arbitrary function calls.

## Verification

Passed:

- `npm --workspace xmlui run test`
- `npm --workspace xmlui run build`
- `npm --workspace xmlui-vscode run test`
- `npm --workspace xmlui-vscode run build`
- `npm --workspace xmlui run test:e2e`

The E2E run required unsandboxed local-server permission because Vite binds to
`127.0.0.1:5173`.

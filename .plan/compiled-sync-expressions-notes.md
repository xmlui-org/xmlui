# Compiled sync expressions - implementation notes

## Step 3 - compiler artifact skeleton

- Affected modules: `xmlui/src/components-core/script-compiler/*`.
- Observation: scripting AST nodes already carry token positions through `startToken` and `endToken`, so the first compiler artifact model can preserve source ranges without changing the parser.
- Observation: the AST node `type` value is not a plain string from TypeScript's point of view; compiler diagnostics should normalize it before storing or throwing errors.
- Decision: keep `CompiledScriptArtifact` serializable and instantiate native `Function` objects in a separate runtime step.
- Future impact: this supports later source maps and Vite build-time compilation because build output can carry only JSON-safe artifacts.

## Step 4 - pure binding expression codegen

- Affected modules: `xmlui/src/components-core/script-compiler/targets/binding-sync.ts`, `xmlui/src/components-core/script-runner/sync-runtime.ts`.
- Observation: object literal identifier keys follow XMLUI interpreter semantics (`{ id: value }` uses `"id"` as a property key), so the compiler cannot treat every identifier-shaped AST node as a variable read.
- Observation: `collectVariableDependencies` currently reports computed member access as a combined dependency such as `user[key]`, not as independent `user` and `key` dependencies.
- Decision: the compiled artifact keeps using the existing dependency collector unchanged in this step; dependency granularity changes should be handled in the planned change-detection test matrix, not hidden inside initial codegen.
- Future impact: the computed member dependency shape matters for change detection and should be revisited before runtime compiled mode is enabled broadly.

# Compiled sync expressions - implementation notes

## Step 3 - compiler artifact skeleton

- Affected modules: `xmlui/src/components-core/script-compiler/*`.
- Observation: scripting AST nodes already carry token positions through `startToken` and `endToken`, so the first compiler artifact model can preserve source ranges without changing the parser.
- Observation: the AST node `type` value is not a plain string from TypeScript's point of view; compiler diagnostics should normalize it before storing or throwing errors.
- Decision: keep `CompiledScriptArtifact` serializable and instantiate native `Function` objects in a separate runtime step.
- Future impact: this supports later source maps and Vite build-time compilation because build output can carry only JSON-safe artifacts.


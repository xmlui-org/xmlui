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

## Step 5 - function calls and arrow/IIFE codegen

- Affected modules: `xmlui/src/components-core/script-compiler/targets/binding-sync.ts`, `xmlui/src/components-core/script-compiler/runtime.ts`, `xmlui/src/components-core/script-runner/sync-runtime.ts`.
- Observation: member calls must evaluate the receiver exactly once and pass that same object as `this`; otherwise expressions like `text.toUpperCase()` or mutating calls like `items.push(...)` diverge from the interpreter.
- Observation: arrow arguments and block-local `let`/`const` declarations need a compiler-local lexical scope; treating every identifier as a runtime container lookup breaks callback expressions such as `items.map(item => item.id)`.
- Decision: compiled function invocation goes through `runtime.call(...)`, which delegates to the shared `callSyncFunction(...)` helper for banned-function and Promise checks.
- Decision: compiled function calls emit the same will/did function-call update hook for non-local receiver roots, while arrow-local receiver roots do not dirty parent state.
- Future impact: event/code-behind compilation will need a richer target-specific call helper because async, cancellation, transactional commit, and handler scheduling cannot share the binding target's sync-only `runtime.call(...)` unchanged.

## Step 6 - statement subset and timeout guards

- Affected modules: `xmlui/src/components-core/script-compiler/targets/binding-sync.ts`, `xmlui/src/components-core/script-compiler/runtime.ts`, `xmlui/src/components-core/script-runner/sync-runtime.ts`.
- Observation: native JavaScript cannot be preempted externally, so compiled sync timeout must be generated into the code at function entry, statement boundaries, and loop bodies.
- Observation: the shared `deleteSyncTarget(...)` helper originally returned only a dirty/change descriptor; compiled JavaScript `delete` expressions also need the boolean operator result.
- Decision: the shared delete helper now stores the JavaScript delete result in the change descriptor's `newValue`, preserving existing path/action/kind semantics while allowing compiled `delete` to return the correct value.
- Decision: the current statement compiler supports a deliberately scoped subset: block, expression, return, simple let/const, if/else, throw, while, do/while, for, for/of, for/in, break, and continue. Try/catch/finally, switch, function declaration hoisting, destructuring declarations, and reactive `var` remain unsupported in compiled mode for now.
- Future impact: the timeout guard insertion points are a precursor to source-map-aware codegen and should move into a reusable statement/code writer layer before event/code-behind compilation.

## Step 7 - parse-time compiled artifact opt-in

- Affected modules: `xmlui/src/components-core/script-runner/ParameterParser.ts`, `xmlui/src/components-core/script-runner/AttributeValueParser.ts`, `xmlui/src/abstractions/scripting/Compilation.ts`.
- Observation: parse-time compilation cannot be enabled unconditionally yet because unsupported compiled statement nodes would make existing valid XMLUI markup fail during parse.
- Decision: both parameter and attribute parsers accept an opt-in `compileBindings` parse option and keep their default output compatible with existing callers.
- Decision: compiled artifacts are stored next to the parsed expression (`ExpressionSection.compiled` and `PropertySegment.compiled`) and remain JSON-serializable, with no `nativeFn`.
- Future impact: runtime and Vite build-time integration can use the same artifact field; the next step should decide where app-level `xmluiConfig.compileBindings` flows into these parser options.

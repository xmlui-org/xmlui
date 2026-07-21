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

## Step 8 - runtime switch

- Affected modules: `xmlui/src/components-core/script-runner/eval-tree-sync.ts`, `xmlui/src/components-core/script-compiler/targets/binding-sync-executor.ts`.
- Observation: the public sync binding entry points can switch on `evalContext.options.compileBindings` without changing callers; existing config propagation through `extractParam` is enough for app-level opt-in.
- Decision: flag `false` or absent uses only the interpreter; flag `true` uses only compiled execution. Unsupported compiled nodes throw `UnsupportedCompiledScriptNodeError` with no interpreter fallback.
- Decision: compiled runtime execution uses a small module-level artifact cache keyed by target, source id/source text or AST node id, compiler version, and relevant eval options.
- Observation: dirty-root update hooks emitted by compiled assignments can drive the same dependency intersection model as the interpreter path; a unit smoke test now verifies that only bindings whose dependencies intersect the dirty root set are selected.
- Future impact: parse-time artifacts are not consumed by the runtime switch yet; later Vite/build-time work should instantiate those serialized artifacts directly instead of recompiling from source/AST.

## Step 9 - E2E compiled-binding mode

- Affected modules: `xmlui/src/testing/fixtures.ts`, `xmlui/src/testing/compile-bindings-env.ts`, `xmlui/package.json`.
- Decision: `XMLUI_COMPILE_BINDINGS=true` enables `xmluiConfig.compileBindings` for E2E testbeds by default.
- Decision: an individual spec can still override the mode with `xmluiConfig: { compileBindings: false }`, because the fixture merge applies the environment default before spreading the test-provided config.
- Decision: the first scripted E2E target is `test:e2e:compiled-bindings`, covering `binding-regression.spec.ts` and `scripting.spec.ts`.
- Future impact: once compiled binding coverage is broader, the same environment helper can be used by additional E2E scripts or a two-pass classic/compiled runner.

## E2E finding - top-level arrow bindings must stay lazy

- Affected modules: `xmlui/src/components-core/script-runner/eval-tree-sync.ts`, `xmlui/tests-e2e/binding-regression.spec.ts`.
- Observation: enabling compiled bindings for E2E exposed failures where `var.*` arrow functions were compiled into native JavaScript functions. Event handlers then called those native functions directly, bypassing the XMLUI async/event statement execution semantics.
- Decision: when `compileBindings` is enabled, top-level `T_ARROW_EXPRESSION` bindings still use the interpreter path and produce XMLUI lazy arrow objects. Nested arrows used as callbacks or IIFEs may still be compiled within a compiled expression.
- Future impact: compiling top-level function values should wait until event handlers and code-behind are compiled together, or until there is an adapter that preserves the event pipeline semantics.

## E2E finding - compiled calls must invoke lazy XMLUI arrows

- Affected modules: `xmlui/src/components-core/script-compiler/runtime.ts`, `xmlui/src/components-core/script-runner/eval-tree-sync.ts`, `xmlui/src/components-core/script-runner/BindingTreeEvaluationContext.ts`, `xmlui/tests-e2e/binding-regression.spec.ts`.
- Observation: after top-level arrow bindings stay lazy, a compiled binding can still call those arrow objects, for example `progressLabel(progressFn, current, total)`. Treating them as native JavaScript functions loses the interpreter's XMLUI arrow semantics.
- Decision: compiled binding execution installs a temporary `compiledArrowInvoker` on the evaluation context. The compiled runtime uses that callback when `runtime.call(...)` receives an XMLUI arrow object, then still applies the shared synchronous Promise check.
- Future impact: event and code-behind compilation should provide a target-specific arrow invoker instead of reusing the binding-only sync invoker, because those targets will need async handler scheduling, cancellation, and transaction semantics.

## E2E finding - value arrows and callback arrows are different

- Affected modules: `xmlui/src/components-core/script-compiler/targets/binding-sync.ts`, `xmlui/src/components-core/script-compiler/runtime.ts`, `xmlui/src/components/Markdown/Markdown.spec.ts`.
- Observation: native JavaScript functions disappear from `JSON.stringify(...)`, while XMLUI lazy arrow objects are rendered by existing framework serialization as `[xmlui function]`. Compiling `{ a: () => {} }` to a native function therefore changed Markdown output from `{"a":"[xmlui function]"}` to `{}`.
- Decision: arrow expressions now compile context-sensitively. Value positions produce XMLUI lazy arrow objects through `runtime.arrow(...)`; JavaScript function argument positions still produce native callbacks for methods such as `items.map(item => item.id)`. Lazy arrow arguments passed by identifier are wrapped by `runtime.call(...)` when calling native JavaScript functions.
- Future impact: event/code-behind compilation should keep this distinction explicit in the target API; "arrow as value" and "arrow as callback" are separate semantics, not just codegen style.

## E2E finding - special numeric literals must survive codegen

- Affected modules: `xmlui/src/components-core/script-compiler/targets/binding-sync.ts`, `xmlui/src/components/Checkbox/Checkbox.spec.ts`, `xmlui/src/components/Switch/Switch.spec.ts`, `xmlui/src/components/Items/Items.spec.ts`, `xmlui/src/components/RadioGroup/RadioGroup.spec.ts`.
- Observation: `JSON.stringify(NaN)` and `JSON.stringify(Infinity)` return `null`, so using JSON serialization for all number literals silently changed `NaN`/`Infinity` binding values.
- Decision: compiled literal emission now prints `NaN`, `Infinity`, and `-Infinity` as JavaScript numeric literals instead of passing them through `JSON.stringify(...)`.
- Future impact: source-map/build-time artifact work should keep literal emission centralized so JavaScript's non-JSON numeric values are handled consistently across targets.

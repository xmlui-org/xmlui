# Compiled async event handlers - implementation notes

## Step 1 - configuration and empty integration point

- Affected modules: `xmlui/src/components-core/script-runner/BindingTreeEvaluationContext.ts`, `xmlui/src/components-core/script-runner/eval-options.ts`, `xmlui/src/components-core/container/event-handlers.ts`, `xmlui/src/testing/*`.
- Decision: the app-level switch is `xmluiConfig.compileEventHandlers`, with E2E support through `XMLUI_COMPILE_EVENT_HANDLERS=true`.
- Decision: the event dispatcher now builds eval options through `createEventEvalOptions(...)`, but still always executes the existing async AST interpreter.
- Decision: code-behind compilation belongs to the same switch, so the option is documented as covering asynchronous event handlers and code-behind functions.
- Observation: event eval options already need more than the compiled flag (`defaultToOptionalMemberAccess`, DOM sandbox mode, console access, UDC options, sandbox logging), so keeping event option construction centralized should reduce drift once the compiled executor is introduced.
- Future impact: the compiled event executor can switch on the propagated option without rethreading config through the dispatcher, and E2E can opt into the mode with one environment variable.

## Step 2 - event-async artifact skeleton

- Affected modules: `xmlui/src/components-core/script-compiler/targets/event-async.ts`, `xmlui/src/components-core/script-compiler/targets/event-async-executor.ts`, `xmlui/src/parsers/xmlui-parser/transform.ts`.
- Decision: the compiled target name is `event-async`; earlier placeholder target names (`event-handler`, `code-behind`) are not part of the public artifact union.
- Decision: event handler compilation happens at parse time when `XmluiParserOptions.compileEventHandlers` is true, and the resulting artifact is stored on `ParsedEventValue.compiled`.
- Decision: the first generated artifact is intentionally executable only as an unsupported skeleton. Running it throws `UnsupportedCompiledScriptNodeError`, with source id and source range preserved.
- Observation: statement source ranges currently follow the scripting AST token ranges; an expression statement's range may exclude the trailing semicolon.
- Future impact: parse-time artifacts are now available for Vite build-time compilation, source maps, and browser debug plumbing before the async runtime/codegen is implemented.

## Step 3 - async event runtime helper contract

- Affected modules: `xmlui/src/components-core/script-compiler/event-runtime.ts`, `xmlui/src/components-core/script-compiler/targets/event-async-executor.ts`.
- Decision: `eventAsyncRuntime` is a standalone target runtime, shared by the unsupported executor skeleton and future generated event code.
- Decision: the first helper surface covers `start`, `beforeStatement`, `afterStatement`, `yield`, `checkCancel`, identifier/member reads, `complete`, `call`, `construct`, and write/pre-post/delete helpers.
- Decision: `call(...)` is async by contract. It rejects banned functions, invokes lazy XMLUI arrows through `executeArrowExpression`, uses existing async array proxies, and completes nested promises with `completePromise()`.
- Observation: generated event code will need to pass root names into `call(...)` and write helpers so runtime hooks can preserve state-update notification semantics.
- Future impact: Step 4 can start emitting a tiny statement subset against this runtime without re-deciding Promise completion, cancellation, yield, or async callback semantics.

## Step 4 - minimal executable statement subset

- Affected modules: `xmlui/src/components-core/script-compiler/targets/event-async.ts`, `xmlui/tests/components-core/compiled-events/event-async-basic.test.ts`.
- Decision: `event-async` artifacts now emit an async IIFE instead of the unsupported skeleton for supported nodes.
- Decision: the first supported statement subset is expression statement, return, block, simple `let`/`const`, if/else, identifier/member assignment, prefix/postfix, binary/unary expressions, member reads, and function invocation.
- Decision: every emitted statement calls `runtime.beforeStatement(...)` and `runtime.afterStatement(...)`; return statements store the return value, run the completion hook, then return.
- Observation: member writes and member calls need async IIFEs so receiver/member expressions can be completed before calling runtime helpers.
- Observation: unsupported nodes now fail at compile time in compiled mode, matching the accepted no-fallback decision.
- Future impact: the next expansion can add loops/try/switch/function declarations while preserving the same statement-boundary shape.

## Step 5 - dispatcher switch behind compileEventHandlers

- Affected modules: `xmlui/src/components-core/container/event-handlers.ts`, `xmlui/src/components-core/script-compiler/targets/event-async.ts`.
- Decision: `runCodeAsync` now selects compiled execution when `evalContext.options.compileEventHandlers` is true; otherwise it keeps using `processStatementQueueAsync`.
- Decision: parsed markup events use `ParsedEventValue.compiled` when present. Dynamic string handlers have no parse-time artifact, so the dispatcher compiles them through the same `event-async` executor/cache using the raw parsed statements.
- Decision: the compiled path runs the same dispatcher lifecycle, timeout, cancellation, transaction buffer, state-change logging, and `onStatementCompleted` hook setup as the interpreter path.
- Observation: bare event references such as `onClick="doIt"` need event-handler semantics, not plain identifier evaluation. The event expression-statement emitter now calls identifier/member chains with `evalContext.eventArgs`.
- Observation: unsupported compiled nodes now surface when a compiled handler is executed if no parse-time artifact caught them earlier.
- Future impact: once parser options are wired from app config in build/standalone loaders, markup handlers can rely entirely on parse-time artifacts; dynamic string handlers will remain a runtime-compile edge case unless those sources get their own parse-time owner.

## Step 6 - statement boundary and event-loop parity

- Affected modules: `xmlui/tests/components-core/compiled-events/event-async-basic.test.ts`.
- Decision: the Step 6 test coverage is scoped to the statement kinds currently supported by the `event-async` code generator. Loop-body yield parity remains attached to the loop codegen expansion in Step 7.
- Decision: boundary tests model the dispatcher contract directly through `onStatementStarted` and `onStatementCompleted`, including the local context refresh that normally happens after state commit.
- Observation: compiled handlers now have regression coverage for per-statement boundaries, event-loop yield without state changes, refreshed `localContext` visibility in the next statement, and `$cancel` abort between statements.
- Future impact: timeout and transactional parity should get dispatcher-level tests once more control-flow nodes are available, because their observable behavior depends on `runWithTimeout` and transaction buffer handling rather than only the code generator runtime hooks.

## Step 7a - while/do-while control flow

- Affected modules: `xmlui/src/components-core/script-compiler/targets/event-async.ts`, `xmlui/tests/components-core/compiled-events/event-async-control-flow.test.ts`.
- Decision: Step 7 is split into smaller safe slices. The first slice adds `while`, `do while`, `break`, and `continue`; `for`, `for..in/of`, `switch`, `try/catch/finally`, `throw`, function declarations, and destructuring remain unsupported until their own parity tests are added.
- Decision: loop codegen uses native labeled JavaScript control flow. `break` and `continue` statements still run `beforeStatement` and `afterStatement` before transferring control, so the event-loop yield contract is preserved.
- Observation: the loop guard itself is emitted as a statement boundary on every condition check, including the final false condition.
- Observation: the Step 6 loop-body-yield matrix item is now covered by a compiled-event loop test.
- Future impact: the remaining Step 7 slices can reuse the same label-stack approach for `for` loops, but `try/finally` needs separate handling because `break`, `continue`, and `return` must execute `finally` blocks before completing.

## Step 7b - classic for loops

- Affected modules: `xmlui/src/components-core/script-compiler/targets/event-async.ts`, `xmlui/tests/components-core/compiled-events/event-async-control-flow.test.ts`.
- Decision: classic `for` loops now compile through the same labeled native loop model as `while`. `for..in` and `for..of` remain unsupported for a later slice.
- Decision: `for` initializer and updater expression statements use plain expression semantics, not event-handler bare-reference invocation semantics.
- Decision: `for (let ...)` declarations are compiled inside a generated block scope, and their names are visible only to the loop condition, body, and update expression.
- Observation: `continue` jumps to a generated body label so the update expression still runs before the next guard check, matching interpreter behavior.
- Future impact: sequence expressions in update clauses are still unsupported through the expression emitter, so cases like `i++, j++` need expression-level coverage before broadening the for-loop parity set.

## Step 7c - for-in and for-of loops

- Affected modules: `xmlui/src/components-core/script-compiler/targets/event-async.ts`, `xmlui/tests/components-core/compiled-events/event-async-control-flow.test.ts`.
- Decision: `for..in` and `for..of` are emitted as explicit iterator/key loops instead of direct native `for..in/of` syntax, so the compiled runtime can yield at every XMLUI loop guard boundary.
- Decision: `for (id in/of expr)` assigns through native local assignment when `id` is an outer compiled local, otherwise through `runtime.assignId(...)` so localContext writes still use the event runtime path.
- Decision: `let` and `const` loop bindings are emitted inside a per-iteration block, preserving body visibility and avoiding redeclaration across iterations.
- Observation: nullish `for..in` values are skipped like the interpreter; non-iterable `for..of` values throw a developer-facing error.
- Future impact: const reassignment diagnostics inside compiled loop bodies currently rely on native JavaScript const behavior only for generated block locals; deeper parity around XMLUI const tracking should be revisited with destructuring/function scope work.

## Step 7d - throw statements and literal values

- Affected modules: `xmlui/src/components-core/script-compiler/event-runtime.ts`, `xmlui/src/components-core/script-compiler/targets/event-async.ts`, `xmlui/tests/components-core/compiled-events/event-async-control-flow.test.ts`, `xmlui/tests/components-core/script-compiler/event-runtime.test.ts`.
- Decision: compiled `throw` statements use a runtime helper that wraps the completed throw value in `ThrowStatementError`, matching the async interpreter's observable error shape.
- Decision: `throw` runs the statement completion hook and yields before raising the wrapped error.
- Decision: minimal async array/object literal codegen is now supported because existing throw parity cases use object literals. Spread properties/elements and object accessors remain unsupported.
- Observation: literal values complete every element/property value through `runtime.complete(...)`, so promises nested in thrown object literals resolve before the throw occurs.
- Future impact: this prepares the error path for `try/catch/finally`, but try/finally control-transfer parity remains a separate larger slice.

## Step 7e - switch statements

- Affected modules: `xmlui/src/components-core/script-compiler/targets/event-async.ts`, `xmlui/tests/components-core/compiled-events/event-async-control-flow.test.ts`.
- Decision: `switch` is emitted as an explicit first-match index calculation followed by fallthrough execution from that index. This preserves the interpreter behavior where the first `default` case encountered is also the first match.
- Decision: the label stack now tracks generic control labels. `break` targets the innermost loop or switch, while `continue` scans outward to the innermost loop label.
- Decision: switch dispatch itself is a statement boundary and yields before any matching case body statements execute.
- Observation: switch-in-loop, switch-local break, and switch-contained continue now have compiled-event parity tests.
- Future impact: try/finally must still override plain native control transfer so `finally` blocks run before break/continue/return complete.

## Step 7f - try/catch/finally baseline

- Affected modules: `xmlui/src/components-core/script-compiler/targets/event-async.ts`, `xmlui/src/components-core/script-compiler/event-runtime.ts`, `xmlui/tests/components-core/compiled-events/event-async-control-flow.test.ts`, `xmlui/tests/components-core/script-compiler/event-runtime.test.ts`.
- Decision: baseline `try/catch/finally` uses native async JavaScript `try` statements, with XMLUI statement boundaries emitted before entering the try body and inside each nested statement.
- Decision: catch bindings use `runtime.catchValue(...)`, so `ThrowStatementError` exposes its original `errorObject` to `catch (err)`, while native errors remain unchanged.
- Observation: normal completion, caught XMLUI errors, rethrow, return, break, and continue through finally now have compiled-event parity coverage.
- Observation: the interpreter's try-state machine was changed to match JavaScript completion semantics for finally blocks: `return`, `break`, and `continue` from an active `finally` suppress a previously pending throw.
- Future impact: nested try/finally should still be audited before claiming full try/finally coverage across the complete E2E suite, but the previously recorded finally-return-over-error gap is now closed.

### Resolved try/finally parity difference

The compiled implementation uses native JavaScript `try/catch/finally`, while the interpreter uses an explicit queued try-state machine in `process-statement-async.ts` and `process-statement-sync.ts`. The interpreter previously differed from native JavaScript for one important finally-completion case; it has now been aligned with JavaScript and the compiled path.

- `try { throw error } finally { return value }`
  - Previous interpreter behavior: the original `ThrowStatementError` was still thrown, while `evalContext.mainThread.returnValue` was set to `value`.
  - JavaScript / current interpreter / current compiled behavior: the `return value` from `finally` suppresses the thrown error and completes normally with `value`.
  - Updated interpreter coverage: `xmlui/tests/components-core/scripts-runner/process-try.test.ts` and `process-try-sync.test.ts`, test name `try - finally with return`.
  - Compiled coverage: `xmlui/tests/components-core/compiled-events/event-async-control-flow.test.ts`, test name `lets finally return suppress pending throws`.

- `try { return first } finally { return second }`
  - Interpreter behavior: completes normally with `second`.
  - Native JS / current compiled behavior: completes normally with `second`.
  - Existing interpreter coverage: `try - finally with second return`.

- `try { throw error } catch { return first } finally { return second }`
  - Interpreter behavior: completes normally with `second`.
  - Native JS / current compiled behavior: completes normally with `second`.
  - Existing interpreter coverage: `try - catch, finally with second return`.

- `try { throw error } finally { break }` and `try { throw error } finally { continue }`
  - JavaScript / current interpreter / current compiled behavior: the `break` or `continue` from `finally` suppresses the pending throw and transfers control normally.
  - Interpreter coverage: `try - finally with break suppresses pending throw` and `try - finally with continue suppresses pending throw` in both async and sync try test files.
  - Compiled coverage: `lets finally break and continue suppress pending throws`.

Implementation note: the interpreter now clears pending `errorToThrow` values for active `finally` scopes when a `return`, `break`, or `continue` statement is processed from a finally block. A new regression should be added before changing this behavior again, because the compiled target intentionally relies on native JavaScript try/finally semantics here.

## Step 7g - function declarations

- Affected modules: `xmlui/src/components-core/script-compiler/targets/event-async.ts`, `xmlui/tests/components-core/compiled-events/event-async-functions.test.ts`.
- Decision: regular function declarations now compile to native `async function` declarations. This keeps event-handler semantics inside the declared function body: every statement can await runtime helpers and yield through `runtime.afterStatement(...)`.
- Decision: function declaration names are collected as compiled locals, so calls before the declaration position resolve through JavaScript hoisting instead of `runtime.id(...)`.
- Decision: this first slice supports simple identifier parameters only. Destructured parameters and rest parameters still throw `UnsupportedCompiledScriptNodeError` until they get dedicated codegen and parity tests.
- Observation: compiled function declarations now have parity coverage for hoisting, async function body work, outer state reads/writes, recursion, and statement boundaries inside function bodies.
- Observation: the full unit suite exposed duplicate try/finally expectations under `xmlui/tests/parsers/scripting`; those were updated to the same JavaScript-compatible finally semantics as the component-core script-runner tests.
- Future impact: code-behind compilation can build on this shape, but module/import function declarations will need serialization and scope-boundary review before enabling broad code-behind artifact generation.

## Step 7h - destructuring declarations

- Affected modules: `xmlui/src/components-core/script-compiler/targets/event-async.ts`, `xmlui/tests/components-core/compiled-events/event-async-destructuring.test.ts`.
- Decision: `let` and `const` declarations now support array and object destructuring patterns, including object aliases and nested array/object patterns.
- Decision: declaration initializers are still emitted through `await runtime.complete(...)` before native JavaScript destructuring runs, so promise-returning initializer expressions preserve XMLUI's implicit async event-handler semantics.
- Decision: generated code uses `runtime.destructure(...)` to read every destructured value through optional member access before binding locals. This keeps nullish and missing nested sources aligned with the interpreter instead of native JavaScript destructuring throws.
- Decision: destructured identifiers are collected as compiled locals, including aliases and nested names. This keeps local shadowing semantics aligned with the interpreter and prevents destructured names from resolving through `evalContext.localContext`.
- Observation: compiled-event parity coverage now includes array patterns, object aliases, nested mixed patterns, local shadowing, async initializer completion, missing nested object values, and nullish array sources.
- Validation: `npm --workspace xmlui run test:unit -- tests/components-core/compiled-events/event-async-destructuring.test.ts` passed with 7 tests.
- Validation: `npm --workspace xmlui run test:unit -- tests/components-core/compiled-events` passed with 64 tests.
- Validation: `npm --workspace xmlui run test:unit -- tests/components-core/script-compiler` passed with 107 tests.
- Validation: `npx tsc --noEmit -p xmlui/tsconfig.json` passed.
- Observation: running `tests/components-core/compiled-events tests/components-core/script-compiler` in one Vitest invocation did not produce failures but did not terminate promptly; the same two target groups passed when run separately.
- Future impact: destructured function parameters remain intentionally unsupported in compiled event handlers until they get a separate scope/codegen slice.

## Step 7i - var main-thread rule and Step 7 closure

- Affected modules: `xmlui/src/components-core/script-compiler/targets/event-async.ts`, `xmlui/tests/components-core/compiled-events/event-async-var.test.ts`, `xmlui/tests/components-core/script-compiler/event-async.test.ts`.
- Decision: `var` statements now compile as event statement boundaries. At top level they are no-op execution statements, matching the async statement runner's runtime behavior; the reactive dependency side remains handled by the existing visitor/analyzer pipeline.
- Decision: `var` inside compiled function bodies emits a runtime error only when the function body executes: `'var' declarations are not allowed within functions`. This keeps declaration-time behavior aligned with the interpreter.
- Observation: a rejected function-body `var` runs the started boundary but does not run the completed/yield hook, matching `processStatementQueueAsync`.
- Observation: the legacy unsupported-node compiler test no longer uses `var`; it now uses an unsupported conditional expression so the structured unsupported-path coverage remains meaningful.
- Validation: `npm --workspace xmlui run test:unit -- tests/components-core/compiled-events/event-async-var.test.ts` passed with 5 tests.
- Validation: `npm --workspace xmlui run test:unit -- tests/components-core/compiled-events` passed with 69 tests.
- Validation: the Step 7 compiled-event files also pass when run individually: control-flow 41 tests, functions 6 tests, destructuring 7 tests, var 5 tests.
- Validation: `npm --workspace xmlui run test:unit -- tests/components-core/script-compiler` passed with 107 tests.
- Validation: `npx tsc --noEmit -p xmlui/tsconfig.json` passed.
- Observation: a later repeated one-shot `tests/components-core/compiled-events` invocation again did not terminate promptly and was interrupted; the individually run Step 7 files passed immediately.
- Step 7 status: the planned Step 7 statement coverage is now complete for while, do/while, for, for/of, for/in, break, continue, switch, throw, try/catch/finally, function declaration hoisting, destructuring `let`/`const`, and the `var` main-thread rule.
- Future impact: expression-level language gaps such as conditional expressions, sequence expressions, template literals, and arrow/callback/code-behind semantics belong to the next planned phases rather than Step 7 statement-control coverage.

## Step 8a - inline arrow callbacks for async array proxies

- Affected modules: `xmlui/src/components-core/script-compiler/event-runtime.ts`, `xmlui/src/components-core/script-compiler/targets/event-async.ts`, `xmlui/tests/components-core/compiled-events/event-async-arrow-and-codebehind.test.ts`.
- Decision: event expressions now support `T_ARROW_EXPRESSION` values through `runtime.arrow(...)`, which creates the same lazy XMLUI arrow object shape as the interpreter and captures the current logical-thread closures.
- Decision: `eventAsyncRuntime.complete(...)` returns XMLUI arrow objects unchanged. This avoids recursively walking and mutating arrow AST/closure objects while completing ordinary arrays and objects as before.
- Decision: inline arrow expressions passed directly as function arguments compile to native `async` JavaScript callbacks instead of lazy arrow objects. This is required for callbacks such as `items.forEach((item) => { sum += item; })` to close over compiled JS locals like `sum`.
- Observation: the generated native callback still emits XMLUI statement boundaries inside expression and block bodies, so callback body statements keep the event-loop yield contract.
- Observation: async array proxy coverage now includes `map`, `filter`, `forEach`, `find`, `findIndex`, `some`, `every`, and `flatMap` with inline callbacks.
- Validation: `npm --workspace xmlui run test:unit -- tests/components-core/compiled-events/event-async-arrow-and-codebehind.test.ts` passed with 5 tests.
- Validation: `npm --workspace xmlui run test:unit -- tests/components-core/script-compiler` passed with 107 tests.
- Validation: `npx tsc --noEmit -p xmlui/tsconfig.json` passed.
- Future impact: lazy arrows stored in compiled locals or state, direct arrow invocation, destructured/rest arrow parameters, and code-behind/import function compilation still need separate Step 8 slices.

## Step 8b - local arrow declarations and direct invocation

- Affected modules: `xmlui/src/components-core/script-compiler/targets/event-async.ts`, `xmlui/tests/components-core/compiled-events/event-async-arrow-and-codebehind.test.ts`.
- Decision: simple `let`/`const` arrow initializers now compile to native `async` JavaScript function values instead of lazy XMLUI arrow objects. This lets local arrow declarations close over compiled JS locals.
- Decision: direct inline arrow invocations such as `((value) => value * base)(3)` compile through the same native arrow path, so they can capture compiled locals and still await XMLUI expression completion for arguments and return values.
- Observation: expression-bodied and block-bodied native arrows reuse the event statement emitter inside the arrow body, so body statements keep boundary/yield behavior and `var` remains forbidden inside arrow bodies.
- Validation: `npm --workspace xmlui run test:unit -- tests/components-core/compiled-events/event-async-arrow-and-codebehind.test.ts` passed with 8 tests.
- Validation: `npm --workspace xmlui run test:unit -- tests/components-core/script-compiler` passed with 107 tests.
- Validation: `npx tsc --noEmit -p xmlui/tsconfig.json` passed.
- Future impact: assignments of arrows into `localContext`/state and destructured/rest arrow parameters still need dedicated parity handling; native JS arrows cannot be serialized into future build-time artifacts the same way lazy XMLUI arrows can, so source-map/debug work should keep this distinction visible.

## Step 8c - native arrow parameters

- Affected modules: `xmlui/src/components-core/script-compiler/targets/event-async.ts`, `xmlui/tests/components-core/compiled-events/event-async-arrow-and-codebehind.test.ts`.
- Decision: native compiled arrow callbacks now accept identifier parameters, destructured object/array parameters, and a trailing rest parameter.
- Decision: destructured arrow parameters bind through `runtime.destructure(...)`, the same helper used for destructured `let`/`const` declarations. This preserves XMLUI optional-member behavior for missing or nullish nested values instead of using native JavaScript destructuring throws.
- Decision: rest parameters are supported only as the final parameter and only with an identifier target, matching the parser shapes currently exercised by XMLUI arrow functions.
- Observation: destructured parameter names are registered as compiled locals for the arrow body, so reads resolve to native callback-scope values rather than falling through to `evalContext.localContext`.
- Validation: `npm --workspace xmlui run test:unit -- tests/components-core/compiled-events/event-async-arrow-and-codebehind.test.ts` passed with 11 tests.

## Step 8d - code-behind/lazy arrows and Step 8 closure

- Affected modules: `xmlui/src/components-core/script-compiler/event-runtime.ts`, `xmlui/src/components-core/script-compiler/targets/event-async.ts`, `xmlui/tests/components-core/compiled-events/event-async-arrow-and-codebehind.test.ts`.
- Decision: `runtime.arrow(...)` now constructs lazy XMLUI arrow objects with the current logical-thread closures and preserves the non-enumerable `closureEvalContext`, so compiled event code can call code-behind style functions through the existing async arrow executor.
- Decision: `ArrowExpressionStatement` sources compile to a direct lazy-arrow call with `evalContext.eventArgs`, matching handler expressions whose source is a bare arrow expression.
- Decision: code-behind functions and imported/aliased code-behind functions remain represented as XMLUI lazy arrows in `localContext`; the compiled event runtime invokes them through `runtime.call(...)` and `executeArrowExpression(...)`, so implicit async completion stays in the interpreter-compatible path.
- Observation: native arrows are used where compiled JavaScript locals must be captured (`let`/`const` arrow declarations, direct inline arrow invocation, and inline callback arguments). Lazy XMLUI arrows are used where the value must behave like a runtime XMLUI arrow object, especially code-behind/imported functions and general arrow expression values.
- Validation: `npm --workspace xmlui run test:unit -- tests/components-core/compiled-events/event-async-arrow-and-codebehind.test.ts` passed with 14 tests.
- Validation: `npm --workspace xmlui run test:unit -- tests/components-core/script-compiler` passed with 107 tests.
- Validation: `npx tsc --noEmit -p xmlui/tsconfig.json` passed.
- Step 8 status: the planned arrow/callback/code-behind slice is complete for inline callback arguments, local arrow declarations, direct inline arrow calls, destructured/rest arrow parameters, `ArrowExpressionStatement` event-argument invocation, and code-behind/imported lazy arrow calls. The full E2E suite remains intentionally unrun by the agent; it should be exercised through the root `test-compiled-bindings` flow after the user enables the new switch.

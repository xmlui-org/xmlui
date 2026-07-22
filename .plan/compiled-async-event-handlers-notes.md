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

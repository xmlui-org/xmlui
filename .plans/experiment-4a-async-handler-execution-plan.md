# Experiment 4A: Async Handler Execution and Scheduling Plan

Status: implemented  
Parent plan: `.plans/master-plan.md`, section `7. Incremental Experiment Roadmap`

## Purpose

Experiment 3 proved that XMLUI event handlers can compile to structured
JavaScript functions for assignments, local variables, conditionals, loops, and
state writes. Those handlers currently run synchronously in the experimental
runtime.

Experiment 4A makes event handlers asynchronous by default. The goal is to
preserve XMLUI's existing authoring model:

- authors do not write `async` or `await`;
- promise-returning calls are awaited automatically;
- sequential handler statements stay sequential even when calls are async;
- long-running handlers yield often enough that the browser can process UI work
  and other event handlers can start;
- state writes, invalidation, diagnostics, and source identity remain
  compiler-driven.

The experiment answers this question:

Can compiled XMLUI handlers behave like the old async statement queue without
returning to AST interpretation?

## Implementation Closure

Implemented in the experimental framework:

- compiled and generated event handlers now return `Promise<void>`;
- expression bindings remain synchronous;
- handler directive prologues support `"async"`, `"sync"`, `"block"`, and
  `"queue"` metadata, with diagnostics for unknown/conflicting directives;
- runtime scheduling preserves the default parallel policy and implements
  drop-while-running and FIFO queue behavior for same-event starts;
- `delay(ms)`, runtime method calls, recursive call-result completion, and
  cooperative loop yielding are available through event contexts;
- new samples cover async sequencing, responsive loop yielding, and scheduling
  directives;
- unit, build, and E2E verification pass for the implemented scope.

## Old XMLUI Behavior Summary

The old framework is the compatibility reference. Important sources:

- `/Users/dotneteer/source/xmlui/website/content/docs/pages/scripting.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/xmlui-config.md`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/container/event-handlers.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/script-runner/process-statement-async.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/script-runner/eval-tree-async.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/script-runner/eval-tree-common.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/script-runner/asyncProxy.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/concurrency/`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/scheduler/`

Observed compatibility points:

- XMLUI docs say `async` / `await` are not supported because event handlers are
  already async and the engine awaits async calls.
- Explicit `await` is rejected by the old evaluator with
  `XMLUI does not support the await operator.`
- Async function declarations and async arrow functions are rejected.
- Event handlers are processed by an async statement queue. Every statement is
  awaited before the next statement runs.
- Promise completion is recursive. The old `completePromise` awaits promises,
  promise chains, promise values inside arrays, and promise values inside plain
  object properties.
- Function invocation awaits promise-returning functions automatically.
- Arrow callbacks become async functions internally.
- Array methods that do not understand async callbacks are proxied:
  `map`, `filter`, `forEach`, `every`, `find`, `findIndex`, `flatMap`, `some`,
  `reduce`, `reduceRight`, and newer `findLast` variants when available.
- Sequential async operations are written without `await`, for example:
  `api.execute(); delay(100); testState = api.getStatus();`.
- After a statement completes, state changes are applied and React is allowed to
  process the resulting update. When many statements complete without state
  changes, the old runtime yields after a threshold to prevent main-thread
  starvation.
- The old runtime has an ambient `defaultHandlerTimeoutMs` configuration, with
  `<= 0` disabling timeout.
- The old concurrency layer exposes cancellation reasons:
  `user`, `supersede`, `timeout`, and `unmount`.
- The old dispatcher supports handler policies:
  `parallel`, `single-flight`, `queue`, and `drop-while-running`.
- The old app scheduler supports `concurrent` and `fifo` modes. The default
  mode is `concurrent`.
- Richer features such as transactional handlers, structured errors,
  Inspector traces, and deterministic replay exist in the old source but are
  broader than the first 4A implementation needs.

## Scope

Make all compiled event handlers async:

```ts
(ctx) => Promise<void>
```

Add support for:

- async compiled handler source and async direct IR execution;
- implicit awaiting of call expression results in handlers;
- recursive promise completion for arrays and objects returned from calls;
- a runtime `delay(ms)` helper for compatibility fixtures;
- cooperative yielding at statement boundaries and loop iterations;
- a default concurrent scheduler that allows another handler to start after the
  running handler yields;
- timeout and cancellation scaffolding sufficient for tests and future data
  operations;
- an event-handler directive prologue design that can read leading string
  literals such as `"sync"`, `"async"`, `"block"`, or `"queue"` as
  compilation/execution options;
- runtime and generated-source tests proving handlers return promises and run
  statements sequentially across async calls;
- E2E samples proving a delayed or long-running handler does not block another
  button from updating visible state.

## Non-Goals

- Do not compile rendering.
- Do not implement full APICall, DataSource, loaders, forms, or managed fetch.
- Do not implement the full old concurrency policy surface unless a narrow
  fixture requires it. Plan the shape, but prefer `parallel`/concurrent default
  first.
- Do not implement transaction buffering in this experiment.
- Do not implement `try`/`catch`, `return`, `break`, `continue`, `for`,
  `for..of`, `for..in`, `switch`, or code-behind async behavior unless a
  compatibility fixture forces it.
- Do not allow explicit `await`, `async function`, or `async` arrow syntax.
- Do not use `eval`, `new Function`, or a runtime AST interpreter.
- Do not expose arbitrary browser globals, `setTimeout`, `fetch`, `window`, or
  `document` to user scripts.
- Do not change today's default concurrency behavior. Without an explicit
  directive or event property, repeated invocations of the same handler should
  continue to use the old default: concurrent/parallel execution.

## Async Semantics Direction

Event handlers are always promise-returning. A caller may fire-and-forget for
ordinary UI events, but the function itself must return a `Promise` so forms,
validators, lifecycle hooks, and future data operations can await completion.

Generated handler source should look conceptually like this:

```js
async (ctx) => {
  await ctx.enterStatement(...);
  const result = await ctx.call(api, api.execute, []);
  await ctx.complete(result);
  await ctx.yieldIfNeeded(...);
  ctx.writeLocal("status", await ctx.call(api, api.getStatus, []));
}
```

The exact helper names can differ, but the compiled output must make async
boundaries explicit.

Expression bindings remain synchronous for now. This experiment changes event
handler compilation and execution only.

## Event Handler Directive Prologue

Future XMLUI event handlers should be able to start with one or more string
literal directives, similar in spirit to JavaScript's `"use strict"` prologue.
These directives are consumed by the XMLUI compiler/runtime as handler options
and are not ordinary expression statements.

Examples:

```xml
<Button onClick='"async"; delay(100); count++' />
<Button onClick='"block"; delay(1000); saveCount = saveCount + 1' />
<Button onClick='"queue"; delay(1000); saveCount = saveCount + 1' />
<Button onClick='"sync"; count++' />
```

Multiple options may be supported later by comma-separated, semicolon-separated,
or repeated string-literal directives. The precise syntax should be decided in
the implementation plan step, but the compiler architecture should reserve the
concept now.

Initial directive meanings:

- `"async"`: force async execution. In 4A this is the same as the default, but
  it is useful as explicit documentation and future-proofing.
- `"sync"`: request synchronous execution. This should be accepted only when the
  handler body is statically known to be sync-safe: no async calls, no long or
  infinite loop risk, and no helper that requires yielding. If the compiler
  cannot prove this, emit a diagnostic and fall back only by explicit design.
- `"block"`: while the same component/event handler is running, ignore new
  invocations of that same handler. This maps to the old policy named
  `drop-while-running`, but the XMLUI directive name should remain author
  friendly.
- `"queue"`: while the same component/event handler is running, enqueue new
  invocations of that same handler and run them FIFO after the current one
  completes.

Default behavior:

- If no directive or event property is present, preserve old XMLUI behavior:
  handlers are async and repeated invocations run concurrently/parallel.
- Existing explicit event properties such as `handlerPolicy:click` should remain
  compatible. The plan should decide precedence. A conservative rule is:
  per-event property overrides directive, directive overrides component-level
  default, and all of them override the global default.

Directive diagnostics:

- Unknown directives should produce source-span diagnostics.
- Conflicting directives such as `"sync"; "async"` should produce diagnostics.
- Concurrency directives such as `"block"` and `"queue"` should apply to the
  same event handler identity: component instance plus event name.
- Directives must be represented in compiler metadata so VS Code, build
  diagnostics, runtime traces, and generated source maps all agree.

## Cooperative Yielding Direction

The old runtime yields after many statement completions when no state writes
occur, and naturally yields when awaiting promise-returning calls. The compiled
runtime needs a similar cooperative scheduler.

Initial policy:

- call `await ctx.yieldIfNeeded()` after each top-level statement;
- call `await ctx.loopYield()` inside each loop guard or each loop iteration;
- call `await ctx.yieldAfterWrite()` or reuse `yieldIfNeeded` after state writes
  that schedule rendering;
- reset the no-write counter when a state write occurs;
- use a configurable threshold such as 100 statement/iteration steps before a
  zero-delay macrotask yield;
- make the yield primitive use a browser-friendly macrotask (`setTimeout(0)`,
  `MessageChannel`, or equivalent runtime abstraction) so user input can be
  processed.

Important limitation:

JavaScript cannot preempt arbitrary synchronous code once it starts running.
Responsiveness comes from compiler-inserted yields at known statement and loop
boundaries, and from awaited promise-returning calls. This is why loop
instrumentation is required.

## Implicit Await and Calls

Old XMLUI's "smart async" behavior comes from:

- awaiting every expression result during async evaluation;
- recursively completing promises in arrays and objects;
- wrapping arrow callbacks as async functions;
- proxying JavaScript array methods whose callback APIs do not await promises.

Initial new implementation:

- Add an async handler expression emitter/evaluator separate from synchronous
  display-expression emission.
- In handler mode, call expressions should compile through a runtime helper such
  as `await ctx.call(receiver, fn, args)`.
- `ctx.call` should:
  - reject unsupported calls using the existing call policy;
  - preserve `this` for method calls;
  - invoke the function;
  - await the return value;
  - recursively complete promises in arrays and plain objects.
- Arrow callbacks passed to allowlisted array methods should be async callbacks
  in handler mode.
- Array methods with async callbacks should go through async proxies for:
  `map`, `filter`, `forEach`, `some`, `every`, `find`, `findIndex`,
  `flatMap`, `reduce`, and `reduceRight`.

## Cancellation and Timeout Direction

The old framework exposes `$cancel`, cancellation reasons, and handler timeouts.
This experiment should introduce a small compatible foundation:

- each handler invocation gets an `AsyncHandlerRun` record;
- each run has a cancellation token with `aborted`, `reason`,
  `throwIfAborted()`, and `onAbort(cb)`;
- `ctx.yieldIfNeeded`, `ctx.loopYield`, and `ctx.call` should check
  cancellation;
- `defaultHandlerTimeoutMs` is represented in runtime config, defaulting to
  `30000`;
- `<= 0` disables timeout;
- on timeout, abort the token with reason `timeout` and reject the handler with a
  cancellation error;
- for 4A, cancellation may be surfaced through test-visible diagnostics and
  rejected promises. Full `App.onError` / Inspector behavior can wait.

## Scheduling Direction

Start with the default behavior old XMLUI documents and implements today:

- scheduler mode: `concurrent`;
- handler policy: `parallel`;
- independent handler invocations may overlap once the first one yields.

Directive mapping:

- no directive: `async` + `parallel`;
- `"async"`: `async` + inherited/default policy;
- `"sync"`: sync execution path if statically safe;
- `"block"`: async execution + `drop-while-running`;
- `"queue"`: async execution + `queue`.

Add the runtime shape so future experiments can extend it:

```ts
type HandlerSchedulerMode = "concurrent" | "fifo";
type HandlerPolicy = "parallel" | "single-flight" | "queue" | "drop-while-running";
```

4A should implement enough to prove:

- ordinary handlers start concurrently after yields;
- `"block"` and `"queue"` directives can be represented in metadata and mapped
  to scheduler policy, even if one of them is initially unit-tested before broad
  UI use;
- no event handler blocks another forever when it reaches compiler-inserted
  yield points.

## Runtime Samples

### Async Delay Sequence

```xml
<App var.status="{'idle'}" var.count="{0}">
  <H1>Async handler sequence</H1>
  <Text value="{status}" />
  <Button onClick="status = 'starting'; delay(50); count++; status = 'done ' + count">
    Run async
  </Button>
</App>
```

This proves implicit await and statement-to-statement sequencing across
`delay`.

### Responsive Long Loop

```xml
<App var.slow="{0}" var.fast="{0}">
  <H1>Responsive handlers</H1>
  <Text value="{'slow: ' + slow}" />
  <Text value="{'fast: ' + fast}" />
  <Button onClick="while (true) { slow++ }">Start slow loop</Button>
  <Button onClick="fast++">Fast click: {fast}</Button>
</App>
```

This proves a compiler-instrumented infinite loop yields often enough that the
second button can still run. The sample should not rely on the slow loop
finishing.

### Directive Policies

```xml
<App var.count="{0}">
  <H1>Handler directives</H1>
  <Text value="{'count: ' + count}" />
  <Button onClick='"block"; delay(100); count++'>Block duplicate clicks</Button>
  <Button onClick='"queue"; delay(100); count++'>Queue duplicate clicks</Button>
</App>
```

This proves directive parsing and same-handler invocation policy without
changing the default behavior for handlers that do not opt in.

### Async Array Callback

```xml
<App var.items="{[1, 2, 3]}" var.total="{0}">
  <H1>Async callbacks</H1>
  <Text value="{'total: ' + total}" />
  <Button onClick="let values = items.map(item => { delay(10); return item * 2 }); total = values.reduce((sum, item) => sum + item, 0)">
    Calculate
  </Button>
</App>
```

This proves async callbacks in array methods are awaited without author-written
`await`.

Use the exact XMLUI syntax only if the current parser supports block-bodied
arrow callbacks and `return` when 4A starts. Otherwise, keep the first runtime
fixture to expression-bodied callbacks and add parser expansion as a planned
step.

## Implementation Steps

Each step should leave the repository buildable. Run
`npm --workspace xmlui run test` after each implementation step. Run VS Code
tests when parser/editor metadata changes. Run E2E after runtime samples are
added.

### 1. Old Behavior Audit Note

- Record the old async handler behavior in `.ai/`, with source references to
  the docs, async statement queue, async evaluator, async proxies, timeout, and
  scheduler/coordinator files.
- Decide the 4A compatibility slice and explicitly defer richer old behavior.

Verification:

- AI note exists and names implemented/deferred behavior.

### 2. Async Handler Type Contract

- Change compiled event handlers from sync functions to async/promise-returning
  functions.
- Update public types: `CompiledEventHandler.execute`, generated event function
  source metadata, runtime parsed event execution, and tests.
- Ensure every event handler path returns `Promise<void | unknown>`, even for
  simple `count++`.

Verification:

- Unit tests assert `compiled.execute(ctx)` returns a promise.
- Existing synchronous mutation tests are updated to `await` execution.
- `npm --workspace xmlui run test`.

### 3. Directive Prologue Parser and Metadata

- Detect leading string-literal expression statements in event-handler bodies.
- Interpret known directives: `"sync"`, `"async"`, `"block"`, and `"queue"`.
- Remove recognized directive statements from executable handler IR.
- Store directives in event-handler metadata and generated/runtime event
  descriptors.
- Add diagnostics for unknown or conflicting directives.
- Preserve today's default behavior when no directive is present.

Verification:

- Parser/compiler tests for single, repeated, unknown, and conflicting
  directives.
- Metadata tests for directive-to-policy mapping.
- `npm --workspace xmlui run test`.

### 4. Runtime Async Context

- Add async handler context helpers:
  - `complete(value)`;
  - `call(receiver, fn, args, metadata)`;
  - `yieldIfNeeded(metadata)`;
  - `loopYield(metadata)`;
  - `delay(ms)`;
  - cancellation token access.
- Keep XMLUI state reads/writes explicit through existing local/global helpers.
- Add config defaults for `defaultHandlerTimeoutMs`, yield threshold, and
  scheduler mode, even if initially internal.

Verification:

- Unit tests for `complete` with promises, nested arrays, and nested objects.
- Unit tests for `delay` and cancellation checks.
- `npm --workspace xmlui run test`.

### 5. Runtime Scheduler and Handler Policy

- Add minimal same-handler invocation tracking keyed by component instance plus
  event name.
- Preserve default `parallel` behavior.
- Map directive/runtime policy:
  - `"block"` to drop-while-running behavior;
  - `"queue"` to FIFO behavior;
  - `"async"` to default async behavior;
  - `"sync"` to the sync-safe execution path when available.
- Keep the API shape compatible with future `handlerPolicy:<eventName>` props.

Verification:

- Unit tests for default parallel behavior.
- Unit tests for `"block"` dropping repeated invocations while one is running.
- Unit tests for `"queue"` running repeated invocations in order.
- `npm --workspace xmlui run test`.

### 6. Async Statement Execution

- Update direct IR execution for event handlers to await each statement.
- Await variable initializers, assignment right-hand sides, branch tests, loop
  tests, expression statements, and update expressions when needed.
- Insert cooperative yields after statements and inside loops.
- Preserve handler-local lexical scoping from Experiment 3.

Verification:

- Unit tests for sequential async statements:
  `status = 'start'; delay(1); status = 'done'`.
- Unit tests for loop yielding and cancellation.
- `npm --workspace xmlui run test`.

### 7. Async Code Generation

- Generate async JavaScript handler functions.
- Emit `await` only in generated JavaScript, never require it from XMLUI source.
- Emit call expressions through async helpers in handler mode.
- Keep display-expression code generation synchronous.
- Include directive metadata and mapped policy in generated event descriptors.

Verification:

- Generated source tests show `async`, `await ctx.call`, and loop yields.
- Generated functions execute with fake async contexts.
- `npm --workspace xmlui run test`.

### 8. Implicit Await for Calls

- Implement `ctx.call` semantics for allowlisted functions/methods.
- Preserve receiver semantics for method calls.
- Await promise-returning calls.
- Recursively complete promises inside arrays and objects.
- Reject unsupported calls as diagnostics or compile/runtime errors consistent
  with earlier experiments.

Verification:

- Unit tests for `delay(1); count++`.
- Unit tests for promise-returning helper calls.
- Unit tests for nested promise completion.
- `npm --workspace xmlui run test`.

### 9. Async Array Method Proxies

- Add handler-mode async proxies for supported array methods.
- Ensure callback parameters remain lexical locals.
- Ensure callback bodies can use XMLUI state reads and promise-returning helper
  calls.
- Keep expression-mode array calls synchronous unless a later experiment changes
  expression semantics.

Verification:

- Unit tests for async `map`, `filter`, `some`, and `reduce` fixtures.
- Tests prove callback-local variables do not become state dependencies.
- `npm --workspace xmlui run test`.

### 10. Cooperative Infinite Loop Responsiveness

- Replace the fixed synchronous loop guard from Experiment 3 with async loop
  instrumentation that can both yield and enforce cancellation/timeout.
- Keep a safety guard for tests that intentionally cancel or time out.
- Ensure `while (true) { ... }` yields on every threshold, allowing another
  button click to run.

Verification:

- Unit test starts a non-terminating compiled handler, waits for at least one
  yield, starts another handler, and verifies the second handler completes.
- Timeout test aborts the first handler.
- `npm --workspace xmlui run test`.

### 11. Runtime `runEvent` Integration

- Update `runEvent` to return a promise.
- Button handlers may fire-and-forget with error reporting, but tests and future
  components can await completion.
- Add minimal error handling for rejected handler promises.
- Ensure state invalidation still happens after async writes.

Verification:

- Runtime unit tests await `runEvent`.
- Existing E2E tests still pass.
- `npm --workspace xmlui run test`.

### 12. VS Code and Parser Diagnostics

- Confirm explicit `await` and `async` remain unsupported in XMLUI source.
- Highlight/diagnose handler directive prologues without treating them as
  ordinary runtime string expressions.
- Add parser/editor tests if the scanner already tokenizes those keywords or if
  diagnostics need clearer messages.
- Ensure handler async-ness is represented in compiler metadata, not by a second
  parser in the VS Code extension.

Verification:

- `npm --workspace xmlui-vscode run test`.
- `npm --workspace xmlui-vscode run build`.

### 13. Runtime Samples

- Add focused examples under `xmlui/src/examples`:
  - `async-sequence`;
  - `async-responsive-loop`;
  - `async-directives`;
  - `async-array-callbacks` if parser support is sufficient.
- Wire the examples in `xmlui/src/main.tsx`.
- Every sample must visibly mutate data.

Verification:

- `npm --workspace xmlui run build`.

### 14. E2E Coverage

- Add Playwright tests proving:
  - delayed handlers update visible text in sequence;
  - another button remains clickable after a long/infinite handler starts;
  - default repeated clicks remain parallel/concurrent;
  - `"block"` drops repeated same-handler starts while running;
  - `"queue"` serializes repeated same-handler starts;
  - async callbacks update visible computed results where supported.
- Preserve all Experiment 1-3 E2E tests.

Verification:

- `npm --workspace xmlui run test:e2e`.

### 15. Closure Note

- Record implemented async semantics, old-behavior references, intentional
  omissions, and verification commands in `.ai/`.
- Mark this plan implemented only after all verification passes.

Verification:

- Closure note exists and links to source/tests.

## Success Criteria

Experiment 4A succeeds when:

- every event handler execution path returns a `Promise`;
- simple handlers from Experiments 1-3 still work when awaited;
- async calls are awaited implicitly without XMLUI authors writing `await`;
- generated JavaScript contains async/await internally while XMLUI source
  rejects explicit `await`;
- absent directives, repeated handlers keep today's default concurrent/parallel
  behavior;
- directive prologues can opt into `"sync"`, `"async"`, `"block"`, and
  `"queue"` semantics at least at the metadata/runtime-policy level;
- long or infinite loops yield cooperatively so other event handlers can start;
- cancellation/timeout scaffolding can stop a long-running handler;
- state writes remain explicit and invalidation metadata remains available;
- runtime samples demonstrate visible data modification;
- E2E tests prove UI responsiveness during a long-running handler;
- unit, build, VS Code, and E2E verification pass.

## Risks and Open Questions

- Cooperative scheduling cannot preempt arbitrary synchronous native helper
  code. Only compiler-instrumented XMLUI statements and known runtime helpers can
  yield.
- Immediate state writes across concurrent handlers may expose race behavior.
  Transactional handlers are deferred unless tests force the issue.
- Async array proxies may require more parser support for block-bodied callbacks
  and `return`.
- Timeout behavior can reject a handler promise, but underlying user code only
  stops at cancellation checks or awaited cancellable helpers.
- The old framework has richer Inspector traces and structured errors than this
  experiment should implement immediately.
- Future DataSource/APICall work may require the 4A context helpers to grow
  `Actions`, `$param`, `$cancel.signal`, and component API integration.

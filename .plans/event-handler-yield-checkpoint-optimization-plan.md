# Event Handler Yield Checkpoint Optimization Plan

Status: complete for the module-local shared-helper experiment  
Parent plans: `.plans/expression-event-plan.md`, `.plans/code-generation-plan.md`,
`.plans/experiment-4a-async-handler-execution-plan.md`

## Implementation Progress

Implemented in the first slice:

- `"sync"` handlers suppress cooperative yield checkpoint generation.
- Default/`"async"` handlers still use the shared module-level yield helper.
- Generated modules emit the shared helper only when at least one event/method
  handler needs async yield checkpoints.
- The benchmark example now exposes both concepts on the same page:
  `/?example=handlerLoopBenchmark`.
- The benchmark keeps the same single-loop work for both buttons:
  `while (i <= 300000) { sum += i; i++ }`.

Measured locally through Playwright after this slice:

```text
async elapsed ms: 165.79999995231628
sync elapsed ms: 1.5999999642372131
sum: 45000150000
```

Implemented in the Step 1-3 slice:

- Added shared event-handler analysis helpers:
  `expressionContainsCall`, `isCheapExpression`, `statementNeedsCheckpoint`,
  and `loopNeedsPacing`.
- Added the `"dedicatedYield"` directive to event-handler directive parsing and
  semantic metadata.
- Added an `XS206` diagnostic for the incompatible
  `"sync"; "dedicatedYield"` combination.
- Added an initial `XS207` sync-safety diagnostic for known async-capable calls
  such as `delay`, `emitEvent`, and `navigate` inside `"sync"` handlers. Cheap
  timing calls such as the benchmark's `now()` remain allowed. Loop policy
  remains deliberately open so the current sync-loop benchmark can continue
  measuring the experiment.
- Updated generated-module event handler codegen so default/`"async"` handlers
  use the shared helper, `"sync"` handlers omit yield checkpoints, and
  `"dedicatedYield"` handlers use inline/private helper emission.
- Added tests for directive preservation, conflict diagnostics, dedicated helper
  emission, mixed shared/dedicated modules, and sync checkpoint omission.
- Completed the shared helper scaffolding pass with module-local shared helper
  emission and per-invocation state.
- Added generated-code checkpoint pruning for cheap handler-local statements.
- Added loop-level checkpoint gating with a generated collision-safe counter
  checked every 256 iterations.
- Mirrored the cheap-statement and loop-gating behavior in the IR fallback
  executor.

Still pending from this plan:

- None for this module-local shared-helper experiment.

Follow-up work outside this plan:

- Decide a fuller `"sync"` loop policy and bounded-loop analysis.
- Consider moving the shared yield helper from generated module-local source to
  an imported runtime helper once runtime-boundary compatibility is ready.

Final automated Playwright measurement after completing Steps 4-9:

```text
async elapsed ms: 1.699999988079071
sync elapsed ms: 1.600000023841858
async sum: 45000150000
sync sum: 45000150000
```

The benchmark result is recorded in
`.ai/event-handler-yield-benchmark-findings.md`.

## Scope

This plan covers a focused optimization for compiled XMLUI event handlers:
reduce unnecessary `__xmluiYieldIfNeeded()` calls while preserving cooperative
event-loop yielding for long-running handlers.

The current compiled handler model inserts a time-based yield checkpoint after
nearly every statement. That is correct but expensive for tight loops made of
simple arithmetic statements. The benchmark example
`xmlui/src/examples/handler-loop-benchmark/Main.xmlui` demonstrates this with:

```xml
status = 'running';
let start = now();
let sum = 0;
let i = 0;
while (i <= 300000) {
  sum += i;
  i++;
}
let end = now();
result = sum;
elapsed = end - start;
status = 'done';
```

The goal is to keep responsiveness while avoiding checkpoint calls after
statements that are known to be cheap.

## Current Behavior To Preserve

- Event handlers compile to JavaScript functions with explicit `ctx` helpers.
- XMLUI state writes still route through `ctx.writeLocal` and `ctx.writeGlobal`.
- Event handlers remain async-capable even when source syntax does not include
  `async` or `await`.
- `__xmluiYieldIfNeeded()` yields only after at least 100ms elapsed since the
  previous yield timestamp.
- The structured IR fallback executor in `scriptSemantics.ts` must match the
  generated JavaScript behavior.
- The old fixed 10,000-iteration guard has been removed; long loops now rely on
  time-based cooperative yielding.

## Proposed Direction

Introduce a small event-handler statement/expression cost classifier. The code
generator and IR fallback executor should use this classifier to decide whether
a statement needs a checkpoint after it.

Candidate cost categories:

```ts
type StatementCost =
  | "trivial"
  | "sync-cheap"
  | "stateful"
  | "call"
  | "loop";
```

Initial rule of thumb:

- skip checkpoints for cheap handler-local arithmetic and declarations;
- keep checkpoints around calls that may run runtime/user code or suspend;
- keep enough loop-level checkpoints to prevent long loops from monopolizing
  the event loop;
- be conservative around XMLUI local/global writes until invalidation cost is
  better characterized.
- skip checkpoint generation entirely for `"sync"` handlers, but only when the
  existing directive contract can prove the handler is sync-safe.

## Directive Interaction

Experiment 4A introduced event-handler directive prologues such as `"async"`,
`"sync"`, `"block"`, and `"queue"`. This plan adds a proposed yield-codegen
directive, `"dedicatedYield"`, for handlers that should use private yield
machinery instead of the shared/module helper. The checkpoint optimizer should
respect these options instead of treating every handler as the same async shape.

### `"async"` And Default Handlers

Handlers with no directive and handlers with explicit `"async"` should keep the
cooperative-yield machinery. These are the handlers that benefit from
time-based checkpoints and loop-level pacing.

### `"sync"` Handlers

Handlers with a `"sync"` directive should not emit or execute
`__xmluiYieldIfNeeded` checkpoints. If a handler is truly synchronous, adding an
`await` checkpoint contradicts the directive and keeps the generated function in
the async execution model.

This should be guarded by static analysis:

- accepted `"sync"` handlers must contain no async-capable calls such as
  `delay`, `emitEvent`, `navigate`, `ctx.call`, `ctx.callFunction`, API calls,
  or unknown extension/runtime functions;
- accepted `"sync"` handlers should contain no loops unless loop bounds are
  known to be small or a later plan defines a synchronous loop budget;
- accepted `"sync"` handlers can contain cheap local declarations,
  handler-local arithmetic, pure XMLUI reads, and probably direct XMLUI writes;
- if the compiler cannot prove sync safety, it should emit a diagnostic rather
  than silently falling back to async behavior.

Initial implementation may keep the current async function wrapper for
compatibility, but it should still omit yield checkpoints for `"sync"` handlers.
A later cleanup can emit a truly synchronous function when all runtime call
sites can consume it safely.

### `"block"` And `"queue"` Handlers

`"block"` and `"queue"` are scheduling policies, not cost policies. They should
compose with the async/default checkpoint optimizer. For example:

- `"queue"` should still run queued invocations FIFO;
- `"block"` should still drop re-entrant invocations while running;
- both policies should still allow cooperative yielding if the handler is async
  and long-running.

If a future syntax allows combining `"sync"` with `"block"` or `"queue"`, the
plan should explicitly decide whether that combination is meaningful.

### `"dedicatedYield"` Handlers

`"dedicatedYield"` requests handler-private yield helper code instead of the
shared/module-level helper. This is mainly a compiler/runtime tuning directive:
most handlers should use the shared helper, but a performance-sensitive or
debugging-sensitive handler can opt into a dedicated helper.

Expected semantics:

- the handler still uses per-invocation yield state;
- the helper function itself is emitted inside or next to that handler rather
  than shared by all handlers in the XMLUI module;
- the directive does not change scheduling policy, so it composes with
  `"async"`, `"block"`, and `"queue"`;
- it should be rejected or ignored with a diagnostic when combined with
  `"sync"`, because `"sync"` handlers do not use yield checkpoints at all.

Example:

```xml
<Button onClick='"async"; "dedicatedYield"; status = "running"; while (i < 300000) { i++ }' />
```

Implementation preference:

- default async handlers use the shared helper;
- `"dedicatedYield"` handlers use the existing inline helper strategy;
- the directive should be recorded in handler metadata so generated source,
  debugging output, and future tooling can explain why the helper was not
  shared.

## Shared Yield Helper Direction

The current generated code emits a fresh `__xmluiYieldIfNeeded` helper and a
fresh timestamp variable in every compiled event handler. That is easy to read,
but it becomes code-size overhead when an app has hundreds of handlers.

Prefer moving toward a shared helper with per-invocation state:

```ts
type XmluiYieldState = {
  lastYield: number;
};

async function xmluiYieldIfNeeded(ctx: CompiledEventContext, state: XmluiYieldState): Promise<void> {
  const now = xmluiNow();
  if (now - state.lastYield < 100) {
    return;
  }
  await (ctx.yieldIfNeeded ?? xmluiDefaultYield)();
  state.lastYield = xmluiNow();
}
```

Each handler invocation would create only its own state:

```js
const __xmluiYieldState = ctx.createYieldState?.() ?? { lastYield: __xmluiNow() };
```

Then generated checkpoints become compact calls:

```js
await __xmluiYieldIfNeeded(ctx, __xmluiYieldState);
```

Potential locations for the singleton helper:

- imported runtime helper in generated Vite modules;
- property on the event context, such as `ctx.yield.checkpoint(state)`;
- generated module-local singleton shared by all event handlers in one XMLUI
  module.

Recommended first step: use a generated module-local singleton for Vite/module
codegen if importing a runtime helper would require larger runtime-boundary
changes. The longer-term design should be a runtime helper so standalone,
production, and IR fallback execution use one implementation.

The helper must keep state per handler invocation. A process-global timestamp
would incorrectly couple independent handlers and could suppress yielding in one
handler because another handler yielded recently.

`"dedicatedYield"` is the escape hatch from this sharing strategy. It should
force the handler generator back to inline/private helper emission while leaving
ordinary handlers on the shared helper path.

## Checkpoints That Can Likely Be Omitted

### Handler-Local Declarations With Cheap Initializers

Skip checkpoints for declarations whose initializer contains no calls:

```js
let i = 0;
let sum = count + 1;
```

Keep checkpoints when initializer contains a call or async-capable helper:

```js
let start = now();
let data = api.execute();
```

### Handler-Local Assignment And Update Statements

Skip checkpoints when the target is a handler-local variable and the right side
contains no calls:

```js
i++;
sum += i;
sum = sum + i;
```

### Pure Expression Statements

Skip checkpoints for expressions made only of literals, identifiers, member or
index reads, arithmetic, comparison, boolean logic, arrays, and objects.

### Block Statements

Skip checkpoints after `BlockStatement` itself. Blocks do no runtime work; their
children decide whether checkpoints are needed.

### Pure XMLUI Reads

Skip checkpoints for statements that only read XMLUI state through
`ctx.readLocal` or `ctx.readGlobal`. These reads are synchronous and cheap.

## Checkpoints To Keep Initially

### Calls That May Suspend Or Run Runtime/User Code

Keep checkpoints before or after calls such as:

- `delay(...)`;
- `emitEvent(...)`;
- `navigate(...)`;
- `api.execute()`;
- `Actions.callApi(...)`;
- unknown extension functions;
- arbitrary object method calls.

### XMLUI State Writes

Initially keep checkpoints after XMLUI local/global writes because they can
trigger invalidation and render scheduling:

```js
count = count + 1;
result = sum;
status = 'done';
```

Later optimization can skip some state-write checkpoints inside loops if tests
show invalidation behavior stays responsive.

### Potentially Large Array/String Operations

Do not automatically classify array iteration methods as cheap:

```js
items.map(...)
items.filter(...)
items.reduce(...)
```

These can hide large loops.

## Cheap Calls To Consider

Some calls can be classified as cheap once explicitly allowlisted:

- `Math.abs`, `Math.floor`, `Math.ceil`, `Math.round`, `Math.trunc`;
- `Math.min`, `Math.max`, `Math.sign`;
- `Math.sqrt`, `Math.pow`, `Math.sin`, `Math.cos`, and similar numeric helpers;
- small string operations already known to be sync, such as
  `toLowerCase()`, `toUpperCase()`, `startsWith()`, `endsWith()`, and
  `includes()`.

This should be a deliberate allowlist, not a blanket rule for all method calls.

## Loop-Level Pacing Idea

For tight loops, emit a cheap counter gate and only run the timestamp check
occasionally:

```js
while (i <= 300000) {
  sum += i;
  i++;

  if ((++__xmluiLoopCheckpoint & 255) === 0) {
    await __xmluiYieldIfNeeded();
  }
}
```

The exact interval should be tested. `255`/`256` is a good first candidate
because it uses a cheap bitmask and avoids frequent timestamp reads.

Loop-level pacing should be emitted for loops even when the loop body contains
only cheap statements. If the body contains calls or XMLUI writes, the child
statements may still force additional checkpoints.

## Proposed Implementation Steps

1. Add cost analysis helpers `[implemented]`
   - Add helper functions near script code generation or in a shared compiler
     module:
     - `expressionContainsCall(ir)`;
     - `isCheapExpression(ir)`;
     - `statementNeedsCheckpoint(statement)`;
     - `loopNeedsPacing(statement)`.
   - Keep the helpers shared by generated-code emission and IR fallback
     execution if practical.

2. Add the `"dedicatedYield"` directive to parser/semantic metadata `[implemented]`
   - Extend directive recognition to include `"dedicatedYield"`.
   - Preserve it in `XmluiHandlerOptions.directives`.
   - Add diagnostics for unknown spellings and for incompatible combinations,
     especially `"sync"; "dedicatedYield"` unless a later design gives that
     combination a meaning.
   - Add focused tests for accepted and rejected directive combinations.

3. Respect handler directives `[implemented, with initial sync call diagnostics]`
   - If `ir.options.executionMode === "sync"`, omit yield checkpoints.
   - If directives include `"dedicatedYield"`, select the inline/private yield
     helper codegen path for that event handler.
   - Otherwise, select the shared/module yield helper path.
   - Add or tighten diagnostics so `"sync"` is accepted only for sync-safe
     handlers. The current implementation rejects function calls; loop policy
     remains pending because the benchmark intentionally measures sync loops.
     Known async-capable calls are already diagnosed.
   - Add tests proving `"sync"; count++` omits checkpoint calls and async
     helpers, while `"sync"; delay(1)` is rejected or explicitly diagnosed.
   - Add tests proving `"dedicatedYield"; count++` contains private helper code
     while ordinary `count++` handlers reference the shared helper.

4. Extract or share yield helper scaffolding `[implemented with module-local helper]`
   - Replace per-handler helper source with a shared helper when possible.
   - Keep per-invocation state so independent handlers do not affect each
     other's yield cadence.
   - Decide whether the first implementation uses module-local helper emission
     or an imported runtime helper.
   - Ensure shared helper emission still occurs when at least one handler uses
     the shared path.
   - Ensure modules whose handlers all use `"sync"` or `"dedicatedYield"` do
     not emit an unused shared helper.
   - Mirror the same state shape in the IR fallback executor.

5. Skip checkpoints for cheap statements in generated JavaScript `[implemented]`
   - Change `emitEventStatement` so it only appends
     `await __xmluiYieldIfNeeded()` when the statement needs a checkpoint.
   - Do not emit checkpoints after block wrappers.
   - Preserve checkpoints around call-bearing statements and XMLUI writes.

6. Add loop-level checkpoint gating `[implemented]`
   - Emit a loop-local or handler-local checkpoint counter.
   - For cheap loop bodies, emit a gated `await __xmluiYieldIfNeeded()`.
   - Avoid name collisions with user handler-local variables.

7. Match behavior in IR fallback execution `[implemented with Steps 5-6]`
   - Apply the same cost decisions in `executeEventStatement`.
   - Add loop-level pacing to fallback `WhileStatement` execution.

8. Add focused tests `[implemented]`
   - Generated source for the benchmark loop should not contain checkpoints
     after `sum += i` and `i++`.
   - Generated loop source should contain the gated checkpoint.
   - Calls such as `now()` should still force a checkpoint.
   - XMLUI writes such as `result = sum` should still force a checkpoint.
   - `"sync"` handlers should omit checkpoint calls.
   - `"dedicatedYield"` handlers should use private helper emission.
   - Async/default handlers should share helper scaffolding instead of
     duplicating a full helper body in every event handler.
   - Mixed modules should support both shared and dedicated handlers without
     name collisions.
   - Fallback execution should yield in long cheap loops when the timestamp
     threshold is crossed.

9. Verify with benchmark and build `[implemented]`
   - Run compiler/unit tests.
   - Run `npm --workspace xmlui run build`.
   - Run the browser benchmark at
     `/?example=handlerLoopBenchmark` before and after the change.
   - Record elapsed times in an AI note if the result materially changes.

## Verification Commands

```text
npm --workspace xmlui run test -- tests/compiler/scriptSemantics.test.ts tests/compiler/parseXmlui.test.ts tests/compiler/compileXmluiModule.test.ts
npm --workspace xmlui run build
```

Optional browser check:

```text
http://localhost:5173/?example=handlerLoopBenchmark
```

## Risks And Open Questions

- Skipping checkpoints too aggressively could make long handlers less
  responsive.
- XMLUI state writes can be cheap individually but expensive through
  invalidation; keep them checkpointed until measured.
- Array iteration methods can hide large work and should not be treated as
  cheap by default.
- Time-based checks inside very tight loops still cost something; loop-level
  pacing should reduce timestamp reads substantially.
- Source readability should remain acceptable in generated dev output.
- `"sync"` semantics must not accidentally admit async-capable calls. A false
  positive here would make author-facing execution behavior surprising.
- A singleton yield helper must not use singleton mutable timing state. The
  helper can be shared, but timestamp state must remain per handler invocation.
- Moving helper code into runtime imports may affect generated module shape,
  standalone loading, or source snapshots; start with the smallest compatible
  boundary.
- `"dedicatedYield"` is intentionally a codegen/runtime-tuning directive. It
  should not leak into ordinary author guidance unless a real user-facing need
  emerges.
- Having both shared and dedicated helper modes increases generated-source
  complexity; tests should cover mixed modules to avoid name collisions and
  unused helper emission.

## Success Criteria

- The benchmark loop compiles to a single `while (i <= 300000)` loop.
- Cheap arithmetic statements inside the benchmark loop no longer emit
  per-statement yield checkpoints.
- Long loops still yield cooperatively through gated time checks.
- Calls and XMLUI state writes remain safely checkpointed.
- `"sync"` handlers do not emit or execute yield checkpoints.
- Apps with many event handlers do not duplicate the full yield helper body in
  every handler.
- `"dedicatedYield"` handlers can opt back into private helper emission without
  changing scheduling semantics.
- Existing compiler/runtime tests pass.

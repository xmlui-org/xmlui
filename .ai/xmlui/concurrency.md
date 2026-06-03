# Cooperative concurrency and cancellation (Plan #06)

Reference for agents working on event-handler scheduling, cancellation, timeouts, or transactional state writes.

## Core files

| File | Purpose |
|---|---|
| `xmlui/src/components-core/concurrency/token.ts` | `CancellationToken`, `CancellationReason`, `HandlerCancelledError`, `createCancellationToken()` |
| `xmlui/src/components-core/concurrency/policy.ts` | `HandlerPolicy`, `HandlerInvocation`, `HandlerEntryDecision`, `HandlerCoordinator`, `createHandlerCoordinator()` |
| `xmlui/src/components-core/concurrency/coordinator.ts` | Real `HandlerCoordinator` runtime; `getDefaultHandlerCoordinator()`, `setDefaultCoordinatorSink()` |
| `xmlui/src/components-core/concurrency/timeout.ts` | `runWithTimeout()` helper |
| `xmlui/src/components-core/concurrency/transactional.ts` | `createTransactionalBuffer()`, `detectSnapshotConflict()` |
| `xmlui/src/components-core/concurrency/diagnostics.ts` | `ConcurrencyCode`, `ConcurrencyDiagnostic` |
| `xmlui/src/components-core/concurrency/index.ts` | Public barrel — re-export from here |
| `xmlui/src/components-core/container/event-handlers.ts` | Dispatcher: coordinator integration, timeout race, `$cancel` injection, transactional commit/discard |
| `xmlui/src/components-core/appContext/app-utils.ts` | `appCancel()` — `App.cancel()` global |

## What shipped (Phases 1–4)

- **`$cancel` token** — injected into every async handler's `localContext` (`event-handlers.ts` ~L248). `AbortSignal`-shaped: `aborted`, `reason`, `throwIfAborted()`, `onAbort()`, `signal`.
- **`HandlerCancelledError`** — thrown when an aborted handler hits the `100`-statement yield-point. The dispatcher swallows it on the `onError` channel (cancellation is contract, not error).
- **`HandlerCoordinator`** — module-level singleton. Per-`(componentUid, eventName)` running slot. Four policies enforced in `coordinator.ts`.
- **`handlerPolicy` / `handlerPolicy:<eventName>`** — declared on `LookupActionOptions`, threaded by `ComponentAdapter.memoedLookupEventHandler`. Per-event wins over component-level.
- **`runWithTimeout()`** — races handler promise against `setTimeout`. `handlerTimeoutMs` (per-event override) → `appGlobals.defaultHandlerTimeoutMs` (default `30000`). `<= 0` disables.
- **Transactional handlers** — `transactional` / `transactional:<eventName>` redirects writes from `statePartChanged` to `createTransactionalBuffer()`; replayed on success, discarded on error/cancel.
- **`App.cancel(componentUid?, eventName?)`** — wraps `getDefaultHandlerCoordinator().abortRunning(..., "user")`. Pushes a `kind:"concurrency"` / `code:"concurrency-handler-cancelled"` info trace.
- **`appGlobals.strictConcurrency`** (default `false`) read site: `onTimeout` callback in `event-handlers.ts`. When `true` the timeout escalates from `warn` to `error`, emits `console.error`, and routes through `appContext.signError`.
- **`appGlobals.defaultHandlerTimeoutMs`** (default `30000`) — ambient ceiling.
- **`kind:"concurrency"`** registered on `XsLogEntry`.

## Cancellation reason matrix

| `$cancel.reason` | Set by |
|---|---|
| `"user"` | `App.cancel()` / dispatcher `finally` while mounted |
| `"supersede"` | `single-flight` coordinator path (`current.abort("supersede")`) |
| `"timeout"` | `runWithTimeout()` → `abort("timeout")` |
| `"unmount"` | Dispatcher `finally` when `!mountedRef.current` |

## Key invariants

- `parallel` (the implicit default) is a fast-path — the coordinator does **not** track the invocation. `App.cancel()` cannot abort `parallel` handlers; they must observe `$cancel` cooperatively.
- The dispatcher always calls `coordinator.exit(invocation)` from `finally` — never drop this; queued waiters depend on it.
- `HandlerCancelledError` is **swallowed** by the dispatcher catch block — never surface it on the `onError` channel.
- Concurrency traces with codes `concurrency-handler-cancelled`/`-superseded`/`-dropped` are **always** info-level (expected outcomes). Only `concurrency-handler-timeout` and `concurrency-transactional-conflict` escalate under strict mode.
- Module-level coordinator singleton: tests must call `__resetDefaultCoordinatorForTests()` between cases to avoid cross-test pollution.

## Diagnostic codes

All carry `kind: "concurrency"`:

| Code | Severity (default / strict) |
|---|---|
| `concurrency-handler-cancelled` | info / info |
| `concurrency-handler-superseded` | info / info |
| `concurrency-handler-dropped` | info / info |
| `concurrency-handler-timeout` | warn / error |
| `concurrency-transactional-conflict` | warn / error |

## When making changes

- Adding a new coordinator policy → update `HandlerPolicy` union in `policy.ts`, the dispatch logic in `coordinator.ts`, and the policy table in `dev-docs/guide/29-concurrency.md`.
- Adding a new `ConcurrencyCode` → register on `inspectorUtils.ts` doc comment, update the severity table here and in `29-concurrency.md`.
- Touching `event-handlers.ts` `runCodeAsync` → preserve the `try { coordinator.enter } / finally { coordinator.exit }` symmetry; queued waiters leak otherwise.
- Strict-default flip belongs to Wave 8 / next major (Plan §5.2). Do **not** flip it incidentally.

## Tests

- `xmlui/tests/components-core/concurrency/token.test.ts`
- `xmlui/tests/components-core/concurrency/coordinator.test.ts`
- `xmlui/tests/components-core/concurrency/timeout.test.ts`
- `xmlui/tests/components-core/concurrency/transactional.test.ts`
- `xmlui/tests/components-core/concurrency/app-cancel.test.ts`

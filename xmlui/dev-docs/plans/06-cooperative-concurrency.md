# Cooperative Concurrency and Cancellation — Implementation Plan

**Date:** 2026-04-30
**Status:** Proposal
**Source:** [`managed-react.md` §7 "Concurrency and Cancellation"](./managed-react.md) and the §17 scorecard row **"Concurrency / cancellation — Predictable, uncoordinated."**

---

## Goal

Close the §17 scorecard row:

> **Concurrency / cancellation — Predictable, uncoordinated.**
> Path to managed: *Cooperative cancellation token; in-flight guard primitive.*

Today
[`processStatementQueueAsync()`](../../src/components-core/script-runner/process-statement-async.ts)
evaluates handler statements one at a time, checkpointing state and
yielding to the main thread every 100 statements. The evaluator is
correct and predictable in isolation: sync expressions throw if they
encounter a Promise, parallel array predicates run through `Promise.all`,
and `map`/`forEach` await sequentially.

What is missing — verbatim from §7 — is the *coordination* surface:

1. **No structured cancellation in user code.** `AbortController` exists
   internally for fetches but is not exposed to handlers. There is no
   `$cancellation` token an action can cooperatively check.
2. **No deduplication of rapid event fires.** Five clicks in 300 ms run
   five handlers in parallel; the framework offers no `singleFlight` or
   "in-flight guard" primitive.
3. **No happens-before contract between handlers.** Two simultaneous
   handlers interleave their state writes; last write wins.
4. **No timeout policy.** A handler that awaits a hung promise pins the
   handler queue indefinitely.

This plan converts each gap into a small, independently shippable,
independently testable step in priority order:

1. **`$cancel` token** — an `AbortSignal`-shaped value injected into
   every handler's evaluation context.
2. **Per-component handler discipline** — declarative `handlerPolicy`
   prop selects between `parallel` (today's behaviour),
   `single-flight` (cancel-and-restart), `queue` (FIFO serialisation),
   and `drop-while-running` (debounce-by-completion).
3. **Handler timeout** — bounded handler lifetime with an `AbortError`
   delivered through the same `$cancel` token.
4. **State-write coordination** — optional `transactional` wrapper
   that batches a handler's container-state writes into a single
   reducer dispatch, restoring a happens-before contract.

Every step lands behind a single `App.appGlobals.strictConcurrency`
switch (see Step 0) so the rollout can stage warn → opt-in → default-on
without touching call sites.

---

## Conventions

- **Source of truth for handler execution:**
  [`processStatementQueueAsync`](../../src/components-core/script-runner/process-statement-async.ts)
  for the inner loop and
  [`event-handlers.ts`](../../src/components-core/container/event-handlers.ts)
  for the per-component dispatch site. The cancellation hook lands in
  the inner loop (one yield-point check per 100-statement chunk); the
  policy hook lands in the dispatch site (decides whether to start a
  new handler instance at all).
- **Source of truth for the evaluation context:**
  `RunTimeEvalContext` constructed by `event-handlers.ts`. The
  `$cancel` token is added there; `processStatementQueueAsync` reads
  it through the existing `evalContext` argument.
- **Existing infrastructure to reuse — do not reinvent:**
  - The `RestApiProxy` `AbortController` pattern is the model for
    `$cancel`. Same shape, exposed to user code.
  - The `event-handler-cache` already keys handlers by `(uid, eventName)`
    — that cache becomes the natural home for the per-handler "currently
    running" map (Step 2).
  - The
    [`signError`](../../src/components-core/rendering/error-rendering.tsx)
    pipeline is the existing surface for handler errors; cancellation
    errors flow through the same path with a `kind: "concurrency"`
    trace entry.
- **New module location:**
  `xmlui/src/components-core/concurrency/` (new directory) — keeps the
  cancellation primitive, the policy dispatcher, and the diagnostic
  formatter together so unit tests do not need a full container fixture.
- **Diagnostic shape:** new `ConcurrencyDiagnostic` carrying
  `{ code: ConcurrencyCode, severity: "error" | "warn", componentUid,
  eventName, durationMs?, message }` where `ConcurrencyCode ∈
  { "handler-cancelled", "handler-timeout", "handler-dropped",
  "handler-superseded", "transactional-conflict" }`.
- **Reporting mode:** when `strictConcurrency === false` (default
  during rollout) violations emit warn-level entries through the trace.
  In strict mode, `handler-timeout` and `transactional-conflict`
  upgrade to `console.error` plus a one-shot toast. Cancellation,
  drop, and supersession are **always** info-level — they are
  expected outcomes of the policies, not failures.
- **Test layout:** unit tests under
  `xmlui/tests/components-core/concurrency/`; one spec per step.
  End-to-end tests under `xmlui/tests-e2e/concurrency/`.

Each step lists: scope, files touched, tests, acceptance criteria,
dependencies.

---

## Step 0 — Switch + Concurrency Module Skeleton

**Priority:** 0 (foundational; nothing else lands without this)

### Scope

- Add `App.appGlobals.strictConcurrency: boolean` (default `false`) and
  `App.appGlobals.defaultHandlerTimeoutMs: number` (default `30000`).
- Create `xmlui/src/components-core/concurrency/` with three exported
  surfaces, all empty stubs:

  ```ts
  // token.ts
  export interface CancellationToken {
    readonly aborted: boolean;
    readonly reason?: "user" | "supersede" | "timeout" | "unmount";
    throwIfAborted(): void;
    onAbort(cb: () => void): void;
    readonly signal: AbortSignal;   // for fetch() / native APIs
  }
  export function createCancellationToken(): {
    token: CancellationToken;
    abort(reason: CancellationToken["reason"]): void;
  };
  ```

  ```ts
  // policy.ts
  export type HandlerPolicy =
    | "parallel"           // today's behaviour
    | "single-flight"      // cancel running, start new
    | "queue"              // FIFO serialise
    | "drop-while-running"; // ignore if one already running
  export interface HandlerInvocation {
    componentUid: string;
    eventName: string;
    policy: HandlerPolicy;
    timeoutMs?: number;
  }
  export interface HandlerCoordinator {
    enter(inv: HandlerInvocation): { token: CancellationToken; proceed: boolean };
    exit(inv: HandlerInvocation): void;
  }
  export function createHandlerCoordinator(): HandlerCoordinator;
  ```

  ```ts
  // diagnostics.ts
  export type ConcurrencyCode =
    | "handler-cancelled"
    | "handler-timeout"
    | "handler-dropped"
    | "handler-superseded"
    | "transactional-conflict";
  export interface ConcurrencyDiagnostic {
    code: ConcurrencyCode;
    severity: "error" | "warn" | "info";
    componentUid: string;
    eventName: string;
    durationMs?: number;
    message: string;
  }
  ```

- Wire `"concurrency"` into the
  [`XsLogEntry.kind`](../../src/components-core/inspector/inspectorUtils.ts)
  union and document the two new appGlobals keys in
  [`standalone.ts`](../../src/components-core/abstractions/standalone.ts).

### Files

- `xmlui/src/components-core/concurrency/token.ts` (new)
- `xmlui/src/components-core/concurrency/policy.ts` (new)
- `xmlui/src/components-core/concurrency/diagnostics.ts` (new)
- `xmlui/src/components-core/concurrency/index.ts` (new — barrel)
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`

### Tests

- `concurrency/token.test.ts`
  - Fresh token is not aborted.
  - `abort("user")` flips `aborted` and sets `reason`.
  - `onAbort` callbacks fire exactly once on abort, even if registered
    after abort.
  - `signal` is a real `AbortSignal` (passes `signal instanceof
    AbortSignal`).

### Acceptance

- `strictConcurrency` and `defaultHandlerTimeoutMs` read through
  `App.appGlobals` in markup.
- New module compiles; barrel exports are stable.
- No existing test changes behaviour.

### Dependencies

None.

---

## Phase 1 — `$cancel` Token in User Handlers

The token is the foundational primitive — every other phase consumes
it. Once it exists, users can cooperatively check it inside long
loops, pass `.signal` to `App.fetch` for cancellable network requests,
and react to the four cancellation reasons.

### Step 1.1 — Inject `$cancel` into the Evaluation Context

**Priority:** 1

#### Scope

- Extend `RunTimeEvalContext` with a `$cancel: CancellationToken` slot.
- In
  [`event-handlers.ts`](../../src/components-core/container/event-handlers.ts),
  create a fresh token per handler invocation; expose it as
  `evalContext.$cancel`. The token aborts on:
  - The component's `onUnmount`
    ([managed-lifecycle-vocabulary plan](./04-managed-lifecycle-vocabulary.md)
    Step 1.1 wiring; until that ships, fall back to the existing
    `event-handler-cache` eviction).
  - Explicit `App.cancel(handlerName?)` (Step 1.3).
- In
  [`processStatementQueueAsync`](../../src/components-core/script-runner/process-statement-async.ts),
  check `evalContext.$cancel.aborted` at the existing 100-statement
  yield-point. If aborted, throw a sentinel `HandlerCancelledError`
  caught by the dispatcher and reported as a `kind: "concurrency"`
  trace entry (`code: "handler-cancelled"`).
- `App.fetch`'s `init.signal` defaults to `evalContext.$cancel.signal`
  when invoked from a handler — so a fetch is automatically cancelled
  on handler abort with no per-call wiring.

#### Files

- `xmlui/src/components-core/container/event-handlers.ts`
- `xmlui/src/components-core/script-runner/process-statement-async.ts`
- `xmlui/src/components-core/script-runner/eval-tree-common.ts`
  (expose `$cancel` as a non-bannable identifier)
- `xmlui/src/components-core/RestApiProxy.ts` (default-signal wiring)

#### Tests

- `concurrency/cancel-token.test.ts`
  - A handler that polls `$cancel.aborted` in a loop exits when the
    token aborts.
  - `App.fetch` invoked without an explicit signal inherits
    `$cancel.signal`; aborting the token aborts the fetch.
  - `$cancel.throwIfAborted()` throws synchronously when aborted.
- `tests-e2e/concurrency/cancel.spec.ts`
  - End-to-end: a long-running handler aborts on component unmount.

#### Acceptance

- `$cancel` is reachable from every handler with no per-handler opt-in.
- Existing handlers (which never reference `$cancel`) behave exactly
  as today.
- Aborting after the handler completes is a no-op (no late writes).

#### Dependencies

Step 0.

---

### Step 1.2 — `App.cancel()` Global

**Priority:** 2

#### Scope

- Add `App.cancel(componentUid?, eventName?)` to the global namespace
  (alongside `App.fetch`, `Clipboard.copy`, etc.).
- With no arguments: aborts every running handler in the current page.
- With a `componentUid`: aborts handlers on that component.
- With both: aborts handlers for the named event on that component.
- Implemented by walking the handler coordinator's running-set
  (introduced as a stub in Step 0; populated in Step 2.1).

#### Files

- `xmlui/src/components-core/AppContext.tsx` (or wherever the
  `App.*` namespace is registered)
- `xmlui/src/components-core/concurrency/policy.ts`
  (expose `abortRunning(componentUid?, eventName?)`)

#### Tests

- `concurrency/app-cancel.test.ts`
  - `App.cancel()` aborts a running handler.
  - `App.cancel(otherUid)` does not affect handlers on different
    components.

#### Acceptance

- Documented in `.ai/xmlui/app-context.md`.

#### Dependencies

Step 1.1, Step 2.1 (for the running-set walk; until 2.1 ships, this
step's no-arg variant is a no-op with a warn).

---

### Step 1.3 — Cancellation Reason Surface

**Priority:** 3

#### Scope

- `$cancel.reason` reads as one of `"user" | "supersede" | "timeout" |
  "unmount"`. The dispatcher sets it according to the cancellation
  origin:
  - `"user"` — `App.cancel()` invoked from script.
  - `"supersede"` — superseded by a `single-flight` policy (Step 2.1).
  - `"timeout"` — exceeded `handlerTimeoutMs` (Phase 3).
  - `"unmount"` — component unmounted.
- Handlers can branch on the reason to avoid emitting a "save failed"
  toast when the cause was a deliberate cancellation.

#### Files

- `xmlui/src/components-core/concurrency/token.ts` (already supports
  reason; this step wires the dispatcher to set it)
- `xmlui/src/components-core/container/event-handlers.ts`

#### Tests

- `concurrency/cancel-reason.test.ts`
  - Each reason is set correctly when triggered by the corresponding
    source.

#### Acceptance

- A handler that catches a `HandlerCancelledError` can read
  `e.reason` to disambiguate.

#### Dependencies

Step 1.1.

---

## Phase 2 — Handler Policy

The policy machinery decides whether a fresh handler invocation
proceeds, supersedes a running one, queues behind it, or is dropped.
The default stays `parallel` to preserve today's behaviour.

### Step 2.1 — `handlerPolicy` Prop and Coordinator Wiring

**Priority:** 4

#### Scope

- Add a universal optional prop on every component:
  `handlerPolicy?: "parallel" | "single-flight" | "queue" | "drop-while-running"`.
  When set, applies to **every** event handler on that component.
  When set per-event via `handlerPolicy:{eventName}` (e.g.
  `handlerPolicy:onClick="single-flight"`), applies to that event only.
- Implemented in
  [`event-handlers.ts`](../../src/components-core/container/event-handlers.ts)
  via the `HandlerCoordinator` from Step 0:
  - Each new invocation calls `coordinator.enter(inv)`.
  - For `parallel`: `proceed: true`, fresh token.
  - For `single-flight`: aborts the running token with
    `reason: "supersede"`, `proceed: true`, fresh token.
  - For `queue`: awaits the running invocation's completion before
    `proceed: true`.
  - For `drop-while-running`: `proceed: false`, emits
    `code: "handler-dropped"` info trace.
  - On completion, the dispatcher calls `coordinator.exit(inv)`.

#### Files

- `xmlui/src/components-core/container/event-handlers.ts`
- `xmlui/src/components-core/concurrency/policy.ts` (fill in coordinator)
- `xmlui/src/components-core/component-hooks.ts` (declare
  `handlerPolicy` as a base-metadata prop)

#### Tests

- `concurrency/policy-parallel.test.ts` — five rapid clicks ⇒ five
  handler runs.
- `concurrency/policy-single-flight.test.ts` — five rapid clicks ⇒
  four supersession traces + one completed run.
- `concurrency/policy-queue.test.ts` — five rapid clicks ⇒ five runs
  in order, none overlap.
- `concurrency/policy-drop.test.ts` — five rapid clicks during a slow
  handler ⇒ one run + four drop traces.
- `tests-e2e/concurrency/click-spam.spec.ts` — Playwright
  click-spam scenarios for each policy.

#### Acceptance

- The default policy stays `parallel`; existing apps see no behaviour
  change.
- Each policy is reachable from markup and produces the expected
  trace stream.
- Per-event override (`handlerPolicy:onClick`) takes precedence over
  the component-level setting.

#### Dependencies

Step 1.1.

---

### Step 2.2 — `<Button busyOnClick>` Convenience

**Priority:** 5

#### Scope

- Buttons commonly want `single-flight` *plus* a busy-state
  indicator. Add a one-line opt-in:
  `<Button busyOnClick="true" />` ⇒ implies
  `handlerPolicy:onClick="single-flight"` and exposes a `$busy`
  context variable (`true` while the click handler is running).
- Pure metadata + small render-time wiring; no new policy logic.

#### Files

- `xmlui/src/components/Button/Button.tsx` (metadata + prop wiring)
- `xmlui/src/components/Button/ButtonReact.tsx` (consume `$busy`)

#### Tests

- `Button.spec.ts` — `busyOnClick` button shows spinner while handler
  is running; second click during run is dropped (the
  `single-flight`-with-busy combo behaves like
  `drop-while-running` to the user, because supersession is hidden
  by the busy state).

#### Acceptance

- The 90 % use case ("disable the submit button while saving") is a
  one-line markup change.

#### Dependencies

Step 2.1.

---

## Phase 3 — Handler Timeout

A hung promise should not pin the handler queue forever. The
`defaultHandlerTimeoutMs` from Step 0 (default 30 s) becomes the
ambient ceiling; per-handler overrides via `handlerTimeoutMs:onClick`.

### Step 3.1 — Bounded Handler Lifetime

**Priority:** 6

#### Scope

- In
  [`event-handlers.ts`](../../src/components-core/container/event-handlers.ts),
  race the handler promise against
  `setTimeout(..., handlerTimeoutMs)`.
- On timeout, abort the token with `reason: "timeout"` and emit a
  `code: "handler-timeout"` warn (or error in strict).
- A timed-out handler that completes after the timeout has its writes
  **discarded** (via the transactional wrapper from Phase 4 once that
  ships; before Phase 4, the writes proceed but a warn fires).
- `handlerTimeoutMs: 0` disables the timeout for that handler — for
  long-poll patterns that genuinely need it.

#### Files

- `xmlui/src/components-core/container/event-handlers.ts`
- `xmlui/src/components-core/concurrency/policy.ts` (timeout helper)

#### Tests

- `concurrency/timeout.test.ts`
  - Handler awaiting `new Promise(() => {})` aborts after
    `defaultHandlerTimeoutMs`.
  - Per-handler `handlerTimeoutMs` overrides the default.
  - `handlerTimeoutMs: 0` disables timeout.

#### Acceptance

- Hung handlers no longer pin the queue indefinitely.
- Existing well-behaved handlers (which complete in milliseconds)
  see no behaviour change.

#### Dependencies

Step 1.1, Step 2.1.

---

## Phase 4 — Transactional State Writes

The "happens-before" gap calls out interleaved writes from
simultaneous handlers. The fix is opt-in: handlers marked
`transactional` batch their container-state writes into a single
reducer dispatch on completion, with conflict detection.

### Step 4.1 — `transactional` Handler Mode

**Priority:** 7

#### Scope

- New per-event modifier:
  `transactional:onClick="true"` (or
  `transactional="true"` for all events on a component).
- Implementation in
  [`event-handlers.ts`](../../src/components-core/container/event-handlers.ts):
  - Snapshot the relevant container state at handler entry.
  - Buffer all `state.x = ...` writes during the handler in a
    pending-writes map instead of dispatching to the reducer.
  - On successful completion, dispatch the buffered writes as a
    single reducer action.
  - On cancellation / timeout, discard the buffered writes.
  - On conflict (snapshotted state differs from current state at
    commit time, because a parallel handler wrote in the meantime),
    emit `code: "transactional-conflict"` warn, retry once, and on
    second conflict, fail with a `console.error`.
- Trade-off documented: transactional handlers are slightly slower
  (one extra dispatch instead of N) but safer.

#### Files

- `xmlui/src/components-core/container/event-handlers.ts`
- `xmlui/src/components-core/concurrency/transactional.ts` (new —
  buffer + commit logic)

#### Tests

- `concurrency/transactional.test.ts`
  - Two parallel handlers writing to the same key: without
    `transactional`, last write wins; with `transactional` on both,
    one retries and both writes land in order.
  - Cancelled transactional handler discards writes.
- `tests-e2e/concurrency/transactional.spec.ts`
  - End-to-end "double increment" scenario.

#### Acceptance

- `transactional` is opt-in; default behaviour unchanged.
- Single-handler use does not measurably regress (one extra dispatch
  per handler).

#### Dependencies

Step 1.1.

---

## Phase 5 — Documentation & Strict Mode

### Step 5.1 — Concurrency Chapter

**Priority:** 8

#### Scope

- New `xmlui/dev-docs/guide/29-concurrency.md` chapter and matching
  `.ai/xmlui/concurrency.md` reference.
- Updates [`managed-react.md` §7](./managed-react.md) to mark the
  asymmetry resolved.
- Updates the §17 scorecard row from
  *"Predictable, uncoordinated"* to
  *"Predictable, coordinated — `$cancel` token, four handler policies,
  bounded lifetime, transactional writes."*
- Updates [`AGENTS.md` documentation map](../../../AGENTS.md).

#### Files

- `xmlui/dev-docs/guide/29-concurrency.md` (new)
- `.ai/xmlui/concurrency.md` (new)
- `xmlui/dev-docs/plans/managed-react.md`
- `AGENTS.md`

#### Acceptance

- Both chapters cover the four mechanisms (token, policy, timeout,
  transactional) with at least one worked example each.
- A "decision tree" section: "Which policy should I use?" — with
  recommendations per common use case (form submit ⇒
  `single-flight`, search input ⇒ `single-flight` + debounce,
  background sync ⇒ `queue`, optimistic counter ⇒ `transactional`).

#### Dependencies

Steps 1.x, 2.x, 3.1, 4.1.

---

### Step 5.2 — Default Stricter Policy in Next Major

**Priority:** 9 (post-feedback)

#### Scope

- After at least one minor cycle of warn-mode telemetry, flip
  `App.appGlobals.strictConcurrency` default to `true` in the next
  major release.
- Consider — but do not commit to in this plan — flipping the default
  `handlerPolicy` for `<Button onClick>` from `parallel` to
  `single-flight`. Subject to telemetry showing low breakage rate.
- Add a changeset and migration note.

#### Files

- `xmlui/src/components-core/abstractions/standalone.ts` (default flip)
- `.changeset/strict-concurrency-default.md`
- `xmlui/dev-docs/guide/29-concurrency.md` (migration section)

#### Acceptance

- All in-repo example apps and the docs site pass under strict mode.

#### Dependencies

Step 5.1.

---

## Rollout

| Phase | Steps | Behaviour | When |
|---|---|---|---|
| **Token foundation** | 0, 1.1, 1.2, 1.3 | `$cancel` available; `App.cancel()` works; reason surfaced | Next minor |
| **Policies** | 2.1, 2.2 | `handlerPolicy` and `busyOnClick` available; default stays `parallel` | Next minor + 1 |
| **Timeout** | 3.1 | Default 30 s ceiling on handlers; warn on timeout | Next minor + 1 |
| **Transactional** | 4.1 | Opt-in transactional handlers | Next minor + 2 |
| **Docs + strict default** | 5.1, 5.2 | Guide chapter; `strictConcurrency: true` default | Next major |

Each step is independently revertible: removing the `$cancel`
injection from `event-handlers.ts` reverts to today's behaviour;
removing the coordinator call falls back to direct execution.

---

## Step Dependency Graph

```
Step 0 (switch + skeleton)
   │
   └─> Step 1.1 ($cancel token)
          │
          ├─> Step 1.2 (App.cancel)
          ├─> Step 1.3 (cancel reason)
          ├─> Step 2.1 (handlerPolicy)
          │      │
          │      └─> Step 2.2 (busyOnClick)
          │
          ├─> Step 3.1 (handler timeout)
          └─> Step 4.1 (transactional writes)
                                                
                 ┌──────────────────────────┐
                 ▼                          │
              Step 5.1 (docs) ──> Step 5.2 (strict default)
```

---

## Resolved Decisions

These are the design choices baked into the plan. Each has an
alternative noted for future revisitation.

1. **`$cancel` is a real `AbortSignal`-shaped object.** Same shape as
   the web platform, so `App.fetch(url, { signal: $cancel.signal })`
   is the natural pattern. Alternative considered: a custom
   "Cancellation" object with no `AbortSignal` interop — rejected
   because it would force users to translate at every fetch site.

2. **Default policy stays `parallel`.** The §17 scorecard pitches
   coordination as opt-in for now to avoid breaking apps that rely on
   today's interleaved behaviour. The next major may flip the
   `<Button>` default to `single-flight` after telemetry, but the
   cross-component default stays `parallel`.

3. **`transactional` is opt-in, not the default.** Buffering writes
   has a small but non-zero cost and changes observability semantics
   (other handlers see the snapshot, not in-flight writes). Most
   handlers do not need it; pessimistic by default would surprise
   developers.

4. **Timeouts default to 30 seconds.** Long enough to cover slow
   networks and large data operations, short enough that a
   genuinely-hung handler does not silently break the page. Opt-out
   via `handlerTimeoutMs: 0` for long-poll patterns.

5. **`single-flight` plus `busyOnClick` together hide supersession.**
   The 90 %-case button-spam scenario is a click-during-busy that
   should be ignored, not cancel-and-restart. `busyOnClick` collapses
   the policy to "drop-while-busy" visually while still using
   `single-flight` semantics under the hood — so a programmatically
   re-issued click (e.g. from a separate trigger) still supersedes
   correctly.

6. **No `Promise.race`-style structured concurrency primitive.**
   Users compose `Promise.all` and `Promise.race` directly via the
   sandbox's existing async-array methods. A first-class
   "structured task" abstraction is heavier than the §7 gap warrants.

7. **`strictConcurrency` default flip waits for a major.** Same
   rationale as the other plans — the warn-mode telemetry window is
   needed before failing builds.

---

## Out of Scope

- **Web Worker offload.** Heavy computation in handlers does not
  belong in the main thread; a managed `<Worker>` component is a
  separate plan that depends on the existing sandbox boundary.
- **Backpressure on `<DataSource>` polling.** DataSource refetch
  storms are addressed by the
  [reactive-cycle-detection plan](./03-reactive-cycle-detection.md);
  rate-limiting individual loaders is a separate concern.
- **Distributed cancellation across `<NestedApp>`.** Nested apps
  have independent dispatchers; cross-app cancellation requires a
  parent-pinned token bus, deferred until a concrete use case exists.
- **`async`/`await` syntax extensions in markup.** Today's evaluator
  already supports `await` inside script-extracted code-behind; no
  new syntax is needed for this plan.
- **Memory model documentation.** §7 names the absence of a
  documented memory model as a gap. With `transactional` providing
  a per-handler atomicity primitive, the remaining doc work is to
  describe *when* writes become visible to other handlers — a
  documentation-only follow-up after Step 4.1 ships.

# Concurrent-State Determinism — Implementation Plan

**Date:** 2026-04-30
**Status:** Proposal
**Source:** [`managed-react.md` §16 "Determinism and Reproducibility"](./managed-react.md) and the §17 scorecard row **"Determinism — Visual, not concurrent."**

---

## Goal

Close the §17 scorecard row:

> **Determinism — Visual, not concurrent.**
> Path to managed: *Document or constrain handler interleaving.*

Today XMLUI is *visually* deterministic (memoised extraction
with explicit dependency tracking; stable JSON-keyed CSS class
hashing; metadata-driven prop ordering) but offers **no
documented order** for concurrent handler interleaving. Two
clicks on two buttons, a `<DataSource>` reload landing while a
form is submitting, a `setInterval` firing during route
navigation — none of these have a published ordering guarantee.
The `cooperative-concurrency`
([06-cooperative-concurrency.md](./06-cooperative-concurrency.md))
plan ships *handler-level* `handlerPolicy` controls
(`single-flight | queue | drop-while-running`); this plan ships
the **system-level** ordering and reproducibility contract that
sits underneath them.

§16 names three concrete non-determinism sources:

1. **Async handler interleaving** — no documented order between
   concurrent handlers.
2. **Floating-point in spacing tokens** (`space-1_5`) varies
   marginally across renderers.
3. **Object iteration order** for symbol keys (XMLUI uses
   string keys throughout, so mostly safe in practice).

This plan delivers four pieces:

1. **Documented happens-before contract** for handler chains,
   state writes, and effect propagation — a single short
   ordering spec that every component author and app author can
   point at.
2. **Deterministic scheduler** — a single FIFO queue per
   `traceId` (per-interaction) for state-mutating handlers,
   with `<App scheduler="fifo | concurrent">` to opt back into
   today's behaviour.
3. **Replay-from-trace harness** — given a captured
   `XsLogEntry` stream from
   [audit-grade-observability](./15-audit-grade-observability.md),
   the harness re-executes the same sequence of inputs and
   asserts the same sequence of state diffs and renders. This
   is what makes "deterministic" *testable*.
4. **Floating-point + iteration-order audits** — fixed-precision
   spacing token serialisation, ordered-key iteration helper,
   `physical-spacing-token` analyzer rule.

Every step lands behind `App.appGlobals.strictDeterminism:
boolean` (see Step 0). Strict mode flips:

- The default scheduler from `concurrent` to `fifo`.
- The default spacing-token serialisation from native
  `toString` to fixed-precision.
- `determinism-*` diagnostics from `warn` to `error`.

---

## Conventions

- **Source of truth for the existing reactive engine:**
  [`container-state.md`](../../../.ai/xmlui/container-state.md)
  (the six-layer state composition + reducer pipeline) and
  [`expression-eval.md`](../../../.ai/xmlui/expression-eval.md)
  (the dependency tracker that drives memoised re-evaluation).
- **Source of truth for handler invocation:**
  [`action-execution.md`](../../../.ai/xmlui/action-execution.md)
  — the `ApiBoundComponent`, the action invoker, the nested
  action stack. The deterministic scheduler inserts itself at
  the action invoker's enqueue point.
- **Source of truth for trace context:** the `traceId` /
  `spanId` shape introduced by
  [audit-grade-observability](./15-audit-grade-observability.md)
  Phase 1. The scheduler partitions its queues by `traceId` so
  two independent user interactions never serialise against
  each other.
- **Cross-plan composition:**
  - The
    [cooperative-concurrency](./06-cooperative-concurrency.md) plan
    ships per-handler `handlerPolicy`. This plan ships the
    *underlying* scheduler those policies run on; the policies
    in that plan compose with the FIFO scheduler here without
    any change to their public surface.
  - The
    [structured-exception-model](./07-structured-exception-model.md)
    plan ships `AppError` propagation. The scheduler's
    error-rethrow path uses that contract; an error in handler
    *N* of a queued chain does not silently skip handlers
    *N+1…M* without raising the chain-level error.
  - The
    [reactive-cycle-detection](./03-reactive-cycle-detection.md)
    plan ships cycle detection on the dependency graph. The
    scheduler's "did this handler chain converge?" check
    leverages the same fixpoint detector.
  - The
    [audit-grade-observability](./15-audit-grade-observability.md)
    plan provides the `traceId` partitioning and the trace
    capture format that the replay harness consumes.
- **New module location:**
  `xmlui/src/components-core/scheduler/` (new directory) holds
  the FIFO scheduler, the trace partitioner, and the replay
  harness. `scheduler/index.ts` is the barrel.
- **New trace `kind: "scheduler"`** for scheduler events
  (`enqueue`, `dequeue`, `coalesce`, `reorder-detected`,
  `convergence-failed`).
- **Diagnostic codes** (open union `DeterminismDiagCode`):
  `determinism-handler-reordered`,
  `determinism-state-write-after-render`,
  `determinism-floating-point-token`,
  `determinism-iteration-order-symbol`,
  `determinism-replay-divergence`,
  `determinism-convergence-failed`.
- **Test layout:** unit tests under
  `xmlui/tests/components-core/scheduler/`; replay-harness
  fixtures under `xmlui/tests-e2e/determinism/replay/`.

Each step lists: scope, files touched, tests, acceptance
criteria, dependencies.

---

## Step 0 — Switch + Scheduler Module Skeleton

**Priority:** 0

### Scope

- Add `App.appGlobals.strictDeterminism: boolean` (default
  `false`; flips to `true` in the next major).
- Create `xmlui/src/components-core/scheduler/` with stubs:

  ```ts
  // diagnostics.ts
  export type DeterminismDiagCode =
    | "determinism-handler-reordered"
    | "determinism-state-write-after-render"
    | "determinism-floating-point-token"
    | "determinism-iteration-order-symbol"
    | "determinism-replay-divergence"
    | "determinism-convergence-failed";

  export interface DeterminismDiagnostic {
    code: DeterminismDiagCode;
    severity: "error" | "warn" | "info";
    message: string;
    traceId?: string;
    data?: unknown;
  }
  ```

  ```ts
  // queue.ts
  export interface ScheduledTask {
    traceId: string;
    spanId: string;
    enqueuedAt: number;          // logical clock
    handler: () => Promise<void>;
    label: string;               // for trace
  }
  export interface Scheduler {
    enqueue(task: ScheduledTask): void;
    drain(traceId: string): Promise<void>;
    mode: "fifo" | "concurrent";
  }
  export function createScheduler(mode: "fifo" | "concurrent"): Scheduler;
  ```

  ```ts
  // happens-before.ts
  /**
   * Documents and (under strict mode) enforces:
   *  H1: Within a trace, state writes happen-before any
   *      render that observes them.
   *  H2: Within a trace, handlers chained from one event
   *      run in source order.
   *  H3: Between traces, no ordering guarantee — but two
   *      traces never share a write window.
   */
  export interface HappensBeforeRecord {
    traceId: string;
    edges: ReadonlyArray<{ before: string; after: string }>;
  }
  ```

  ```ts
  // replay.ts
  export interface ReplayInput {
    traces: ReadonlyArray<XsLogEntry>;
    snapshot?: AppSnapshot;
  }
  export interface ReplayResult {
    diverged: boolean;
    divergenceAt?: number;       // entry index
    expected?: XsLogEntry;
    actual?: XsLogEntry;
  }
  export function replay(input: ReplayInput): Promise<ReplayResult>;
  ```

  ```ts
  // index.ts — barrel
  ```

- Wire `"scheduler"` into the
  [`XsLogEntry.kind`](../../src/components-core/inspector/inspectorUtils.ts)
  union and document the new appGlobals key in
  [`standalone.ts`](../../src/components-core/abstractions/standalone.ts).

### Files

- `xmlui/src/components-core/scheduler/diagnostics.ts` (new)
- `xmlui/src/components-core/scheduler/queue.ts` (new)
- `xmlui/src/components-core/scheduler/happens-before.ts` (new)
- `xmlui/src/components-core/scheduler/replay.ts` (new)
- `xmlui/src/components-core/scheduler/index.ts` (new — barrel)
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`

### Tests

- `scheduler/queue.test.ts` — empty queue drains; FIFO and
  concurrent modes round-trip a synthetic task.

### Acceptance

- `strictDeterminism` reads through `App.appGlobals`.
- New module compiles; barrel exports stable.
- No existing test changes behaviour.

### Dependencies

None.

---

## Phase 1 — Happens-Before Specification

### Step 1.1 — Document the happens-before contract

**Priority:** 1

#### Scope

- Write `xmlui/dev-docs/guide/39-determinism.md` with a single
  short happens-before specification. The spec covers:

  | Edge | Before | After | Guarantee |
  |---|---|---|---|
  | H1 | Any state write inside handler `h` | Any render that observes a value transitively dependent on that write | Always |
  | H2 | Source-order handler `i` of an event | Source-order handler `i+1` of the same event | Always |
  | H3 | Resolution of a `var.x` write | Re-evaluation of any expression depending on `x` | Always (single trace) |
  | H4 | Completion of a queued handler chain rooted at trace `T` | Start of any handler chain rooted at trace `T'` enqueued strictly after `T` | Strict scheduler only |
  | H5 | Render commit at frame `F` | Any state read at frame `F+1` | Always (React invariant) |
  | H6 | `<DataSource>` settle (success or error) | Any handler chained via `onSuccess`/`onError` | Always |
  | H7 | Two traces with overlapping logical clocks | *No ordering guarantee under default mode* | Default behaviour — strict scheduler upgrades to "no overlap" |

- The spec is the *contract*. The rest of the plan implements
  the enforcement (Step 2.1) and the audit (Steps 4.1–4.2).

#### Files

- `xmlui/dev-docs/guide/39-determinism.md` (new)
- `xmlui/dev-docs/plans/managed-react.md` (cross-link from §16)

#### Tests

- N/A (documentation only).

#### Acceptance

- Doc is referenced from
  [`AGENTS.md`](../../../AGENTS.md) and from
  [container-state.md](../../../.ai/xmlui/container-state.md).
- Every edge has a worked example: markup snippet + expected
  trace output.

#### Dependencies

Step 0.

---

### Step 1.2 — `determinism-state-write-after-render` diagnostic

**Priority:** 2

#### Scope

- A state write that arrives during a render commit (a handler
  invoked inside a render function — already discouraged but
  not enforced) fires
  `determinism-state-write-after-render` (severity `warn`;
  strict `error`).
- Detection: the renderer sets a `renderInProgress` flag; state
  reducer checks the flag and emits the diagnostic on a write.
- This catches bugs where layout effects synchronously mutate
  state and inadvertently trigger re-renders mid-commit.

#### Files

- `xmlui/src/components-core/Container.tsx`
  (the renderer commit hook)
- `xmlui/src/components-core/scheduler/happens-before.ts`

#### Tests

- A synthetic component that writes state from inside a render
  callback fires the diagnostic.

#### Acceptance

- Existing components in the docs site produce zero
  diagnostics (any genuine violation is fixed in the same PR).

#### Dependencies

Step 1.1.

---

## Phase 2 — Deterministic Scheduler

### Step 2.1 — FIFO scheduler per `traceId`

**Priority:** 3

#### Scope

- The action invoker
  ([action-execution.md](../../../.ai/xmlui/action-execution.md))
  routes every handler enqueue through `Scheduler.enqueue`.
- Default scheduler mode: `"concurrent"` (today's behaviour;
  no observable change).
- New mode `"fifo"` partitions tasks by `traceId` and runs
  tasks within the same trace strictly in enqueue order. Two
  different traces drain in parallel — independence between
  user interactions is preserved.
- `<App scheduler="fifo | concurrent">` exposes the choice in
  markup; `App.appGlobals.strictDeterminism` flips the default
  to `"fifo"`.
- A handler chain that exceeds a configurable budget
  (`<App scheduler maxQueuedPerTrace="64">`) without
  converging fires `determinism-convergence-failed` (severity
  `warn`; strict `error`); the chain is force-cancelled per
  the [cooperative-concurrency](./06-cooperative-concurrency.md)
  `$cancel` contract.

#### Files

- `xmlui/src/components-core/scheduler/queue.ts`
- The action invoker source
- `xmlui/src/components-core/Container.tsx`

#### Tests

- Two clicks on the same button under FIFO mode produce
  strictly serialised handler traces.
- Two clicks on different buttons (different `traceId`s)
  under FIFO mode show interleaved traces (independence
  preserved).
- A runaway handler chain hits `maxQueuedPerTrace` and is
  cancelled.

#### Acceptance

- Today's docs site behaves identically under default
  (`concurrent`) mode.
- Switching to `fifo` mode produces deterministic traces for
  the showcase examples in the docs site.

#### Dependencies

Step 0; alignment with
[cooperative-concurrency](./06-cooperative-concurrency.md)
(`$cancel` contract).

---

### Step 2.2 — Reorder detection diagnostic

**Priority:** 4

#### Scope

- Under default (`concurrent`) mode the scheduler still records
  enqueue / dequeue order; if the dequeue order differs from
  the enqueue order *within the same trace*, fires
  `determinism-handler-reordered` (severity `info`; strict
  `warn`).
- This is observability without enforcement — apps that have
  not opted into FIFO mode get visibility into where reordering
  happens before opting in.

#### Files

- `xmlui/src/components-core/scheduler/queue.ts`

#### Tests

- A synthetic micro-task race that reorders two enqueued
  handlers fires the diagnostic.

#### Acceptance

- Diagnostic carries `traceId`, expected order, actual order.

#### Dependencies

Step 2.1.

---

## Phase 3 — Floating-Point + Iteration-Order Audits

### Step 3.1 — Fixed-precision spacing-token serialisation

**Priority:** 5

#### Scope

- Spacing tokens (`$space-1_5`, `$space-2_5`, etc.) today
  serialise via native floating-point `toString`, producing
  marginally different values across rendering engines (e.g.
  `0.1 + 0.2 → "0.30000000000000004"` vs `"0.3"`).
- New helper
  `xmlui/src/components-core/utils/serializeSpacing.ts` rounds
  to 4 decimal places (`(x * 10000) | 0) / 10000`) and pads
  trailing zeros.
- The CSS variable emitter
  ([theming-styling.md](../../../.ai/xmlui/theming-styling.md))
  routes every numeric token through this helper.
- A `determinism-floating-point-token` analyzer rule (rides on
  the [build-validation-analyzers](./13-build-validation-analyzers.md)
  pipeline; severity `info`; strict `warn`) catches markup that
  bypasses the helper (`style="margin: {0.1 + 0.2}rem"` —
  produces a trailing-precision warning).

#### Files

- `xmlui/src/components-core/utils/serializeSpacing.ts` (new)
- The theme variable emitter
- `xmlui/src/components-core/analyzer/rules/determinism-floating-point-token.ts`
  (new)

#### Tests

- `serializeSpacing(0.1 + 0.2) === "0.3"`.
- The diagnostic fires on the markup pattern above.

#### Acceptance

- Visual snapshot tests across Chromium / Firefox / WebKit
  produce byte-identical spacing values for the same source
  markup.

#### Dependencies

Step 0; alignment with
[build-validation-analyzers](./13-build-validation-analyzers.md).

---

### Step 3.2 — Ordered-key iteration helper

**Priority:** 6

#### Scope

- A new `orderedKeys(obj)` helper returns keys in a stable
  order: numeric strings ascending, then non-numeric strings in
  insertion order, then symbols sorted by `description`.
- Markup `<Items data="{user.profile}">` and equivalent
  iteration sites route through this helper, so iteration is
  deterministic regardless of engine quirks for symbol keys.
- A `determinism-iteration-order-symbol` analyzer rule
  (severity `info`; strict `warn`) fires when an expression
  iterates an object that contains symbol keys without going
  through the helper.

#### Files

- `xmlui/src/components-core/utils/orderedKeys.ts` (new)
- The `<Items>` component renderer
- `xmlui/src/components-core/analyzer/rules/determinism-iteration-order-symbol.ts`
  (new)

#### Tests

- An object with mixed numeric / string / symbol keys iterates
  in the documented order.

#### Acceptance

- Today's apps see no behaviour change (XMLUI uses string keys
  throughout, per §16); the helper is preventative.

#### Dependencies

Step 0.

---

## Phase 4 — Replay Harness

### Step 4.1 — Replay-from-trace executor

**Priority:** 7

#### Scope

- `replay(input)` takes an `XsLogEntry` array (captured by
  [audit-grade-observability](./15-audit-grade-observability.md)
  Phase 4 OTLP sink, or by the inspector's "Save trace"
  button) plus an optional initial snapshot, and re-executes
  the input events (`click`, `change`, `navigate`,
  `app:fetch` mocked from the recorded response) against the
  same app build.
- The harness compares the produced `XsLogEntry` stream
  against the captured one; the first divergence (different
  kind, different ordered values, different `traceId`
  topology) produces `determinism-replay-divergence` and
  returns `{ diverged: true, divergenceAt, expected, actual }`.
- The harness mocks network at the `App.fetch` boundary —
  recorded responses are replayed; outbound requests that
  weren't recorded are an error.
- New CLI subcommand `xmlui replay <trace-file>` runs the
  harness against a project; integration with the
  [build-validation-analyzers](./13-build-validation-analyzers.md)
  CI surface so PRs can include "regression replay" steps.

#### Files

- `xmlui/src/components-core/scheduler/replay.ts`
- `xmlui/scripts/cli/replay.ts` (new)

#### Tests

- A captured trace replayed against the same app build
  produces zero divergence.
- A captured trace replayed against an app build that changed
  a handler diverges at the first observable difference.

#### Acceptance

- The harness is the *empirical test* of the happens-before
  spec: if the spec holds and FIFO scheduling is engaged, any
  trace replays bit-identically.

#### Dependencies

Steps 1.1, 2.1, 3.1, 3.2; alignment with
[audit-grade-observability](./15-audit-grade-observability.md)
(trace capture format).

---

### Step 4.2 — Inspector "Replay this trace" surface

**Priority:** 8

#### Scope

- Inspector overlay gains a "Replay" button per trace: clones
  the app's current state into a snapshot, replays the trace,
  and surfaces the divergence point inline (with a side-by-side
  diff of the divergent entries).
- "Save trace as fixture" exports the trace to a JSON file
  apps can commit as a regression test (see
  [testing-conventions.md](../../../.ai/xmlui/testing-conventions.md)
  for the existing E2E layout).

#### Files

- The inspector UI
  (`xmlui/src/components-core/inspector/`)

#### Tests

- E2E: capturing a trace, mutating the app, and replaying
  produces a visible divergence panel.

#### Acceptance

- Apps gain "record-replay" regression testing without
  writing custom test scaffolding.

#### Dependencies

Step 4.1.

---

## Phase 5 — Documentation & Strict Default

### Step 5.1 — Determinism Chapter

**Priority:** 9

#### Scope

- Step 1.1 already shipped the happens-before chapter; this
  step extends it with the scheduler reference, the floating-
  point and iteration-order audits, and the replay harness.
- Updates [`managed-react.md` §16](./managed-react.md):
  - Mark *"Async handler interleaving"* as resolved
    (Phase 2 FIFO scheduler).
  - Mark *"Floating-point in spacing tokens"* as resolved
    (Phase 3 fixed-precision serialisation).
  - Mark *"Object iteration order for symbol keys"* as resolved
    (Phase 3 `orderedKeys` helper).
- Updates the §17 scorecard row from
  *"Visual, not concurrent"* to
  *"Sealed — happens-before contract, FIFO scheduler,
  fixed-precision tokens, replay harness."*
- Updates [`AGENTS.md` documentation map](../../../AGENTS.md).

#### Files

- `xmlui/dev-docs/guide/39-determinism.md` (extend)
- `xmlui/dev-docs/plans/managed-react.md`
- `AGENTS.md`

#### Acceptance

- Chapter contains a worked example for each phase: H1–H7 trace
  walkthrough, FIFO vs concurrent comparison, spacing-token
  byte-equality demo, replay-divergence walkthrough.

#### Dependencies

Phases 1–4.

---

### Step 5.2 — Default `strictDeterminism: true` in Next Major

**Priority:** 10 (post-feedback)

#### Scope

- After at least one minor cycle of warn-mode telemetry, flip
  the default in the next major: `strictDeterminism: true`.
- Effects under strict:
  - `<App scheduler>` defaults to `"fifo"`.
  - Spacing-token serialisation defaults to fixed-precision.
  - All `determinism-*` diagnostics escalate one level
    (capped at `error`).
- Changeset + migration note.

#### Files

- `xmlui/src/components-core/abstractions/standalone.ts`
- `.changeset/strict-determinism-default.md`
- `xmlui/dev-docs/guide/39-determinism.md` (migration section)

#### Tests

- Existing test suite passes with the default flipped.
- `xmlui/tests-e2e/determinism/strict-mode.spec.ts` covers
  each diagnostic under strict.

#### Acceptance

- All in-repo example apps and the docs site pass under strict
  determinism mode.

#### Dependencies

Step 5.1.

---

## Rollout

| Phase | Steps | Behaviour | When |
|---|---|---|---|
| **Foundations** | 0 | Switch + scheduler module skeleton | Next minor |
| **Happens-before spec** | 1.1, 1.2 | Doc chapter; state-write-after-render diag | Next minor + 1 |
| **Scheduler** | 2.1, 2.2 | FIFO scheduler; reorder detection | Next minor + 2 |
| **Audits** | 3.1, 3.2 | Fixed-precision tokens; ordered-key iteration | Next minor + 2 |
| **Replay** | 4.1, 4.2 | Replay executor; inspector "Replay" surface | Next minor + 3 |
| **Docs + strict default** | 5.1, 5.2 | Guide chapter; strict default in next major | Next major |

Each step is independently shippable: the happens-before doc
ships first as a contract; the scheduler can ship without
replay; replay can ship without strict mode.

---

## Step Dependency Graph

```
Step 0 (switch + skeleton)
   │
   ├─> Step 1.1 (happens-before doc)
   │      │
   │      ├─> Step 1.2 (state-write-after-render diag)
   │      │
   │      └─> Step 2.1 (FIFO scheduler)              ← cooperative-concurrency ($cancel)
   │             │
   │             └─> Step 2.2 (reorder detection diag)
   │
   ├─> Step 3.1 (fixed-precision tokens)             ← build-validation-analyzers
   │
   ├─> Step 3.2 (ordered-key iteration)              ← build-validation-analyzers
   │
   └─> Step 4.1 (replay executor)                    ← needs 1.1, 2.1, 3.1, 3.2; audit-grade-observability
            │
            └─> Step 4.2 (inspector replay UI)
                       │
                       ▼
                Step 5.1 (docs)
                       │
                       └─> Step 5.2 (strict default)
```

---

## Resolved Decisions

These are the design choices baked into the plan. Each has an
alternative noted for future revisitation.

1. **Happens-before contract is the primary deliverable.** A
   short, citable spec (Step 1.1) is more valuable than the
   scheduler itself — the scheduler is one *implementation* of
   the contract. Alternative considered: ship the scheduler
   without writing the spec — rejected because the spec is what
   makes determinism *teachable* and *auditable*.

2. **Scheduler partitions by `traceId`, not by component.**
   Two unrelated user interactions never serialise against
   each other — the FIFO guarantee applies *within* a trace,
   not across the app. Alternative considered: global FIFO —
   rejected because it would convert all parallel UI
   interactions into a single queue (UI freezes during a slow
   handler block all other interactions).

3. **Default scheduler mode stays `concurrent`.** Backwards
   compatibility wins until the major flip. Apps that need
   determinism today opt in via `<App scheduler="fifo">`.
   Alternative considered: default to `fifo` immediately —
   rejected because subtle handler ordering changes break apps
   that accidentally relied on concurrent interleaving.

4. **Reorder detection is observability without enforcement.**
   `determinism-handler-reordered` fires under default
   (`concurrent`) mode but does *not* serialise the handlers —
   it just records the deviation from enqueue order. This lets
   apps audit before opting in. Alternative considered: only
   detect under FIFO — rejected because under FIFO there are no
   reorders to detect.

5. **Replay mocks at the `App.fetch` boundary, not at
   `XMLHttpRequest`.** Since
   [managed-react.md §1 (2026-04)](./managed-react.md) bans
   raw `fetch`/`XHR`/`WebSocket`/`EventSource`, mocking at
   `App.fetch` covers all sanctioned outbound HTTP. Alternative
   considered: mock at the network layer — rejected as
   unnecessary given the existing centralisation.

6. **Spacing tokens round to 4 decimal places.** Below visual
   threshold, comfortably above floating-point noise.
   Alternative considered: 6 decimals — rejected as overkill.
   Alternative considered: 2 decimals — rejected because some
   spacing tokens (`space-0_125`) need 3 places.

7. **Ordered iteration helper is a *helper*, not a runtime
   transform.** XMLUI uses string keys throughout (per §16);
   the helper exists so apps that introduce symbol keys (rare,
   but possible via `<DataSource>` returning custom shapes) get
   determinism without surprise. Alternative considered:
   transform every iteration site — rejected as performance
   overhead for a rare case.

8. **Convergence budget is per-trace, configurable.** A
   handler chain that re-enqueues itself indefinitely is a bug;
   the budget catches it. Default `64` is high enough for any
   legitimate chain. Alternative considered: fixed 1000 —
   rejected as too high to catch tight loops.

9. **Replay diverges on the first observable difference, not
   the last.** Early divergence is the *cause*; later
   divergences are downstream effects. Alternative considered:
   collect all divergences — rejected because most are
   downstream noise.

10. **Strict-mode flip waits for a major.** Same rationale as
    every other §17 plan — warn-mode telemetry is needed
    before failing on `determinism-handler-reordered` and the
    long tail of trace divergences from third-party
    components.

11. **No happens-before guarantee across React Suspense
    boundaries.** A suspended subtree may resume in any order
    relative to the rest of the app. The spec documents this
    explicitly; the scheduler does not attempt to serialise
    across Suspense (would defeat its purpose). Alternative
    considered: serialise — rejected.

---

## Out of Scope

- **Thread-level concurrency.** XMLUI runs single-threaded in
  the browser event loop; "concurrent" here means *interleaved
  micro-tasks*, not actual parallelism. Web Worker integration
  is a separate plan.
- **Build determinism** (`/deterministic`-style guarantees over
  the build output). The Vite plugin already produces
  deterministic output for a given input; this plan is
  runtime-determinism, not build-determinism.
- **Render-output determinism across React versions.** React's
  internal scheduler has its own non-determinism (e.g.
  concurrent rendering priorities); this plan ships
  determinism *within the XMLUI layer above React*, not the
  React layer itself. Apps that need render-output determinism
  pin React versions.
- **Time-travel debugging.** The replay harness re-executes
  forward; backwards-stepping requires a different
  architecture (snapshot per step) and is deferred.
- **Distributed-system happens-before** (Lamport clocks,
  vector clocks). XMLUI is single-process; the H1–H7 contract
  is sufficient.
- **Auto-fix codemods** for `determinism-floating-point-token`
  / `determinism-iteration-order-symbol`. Authors fix
  manually; matches the
  [build-validation-analyzers](./13-build-validation-analyzers.md)
  rationale.
- **Visual regression testing** as part of replay. Replay
  asserts on the *trace stream* (state diffs, handler order),
  not pixel output. Pixel testing belongs to the existing
  Playwright snapshot machinery.

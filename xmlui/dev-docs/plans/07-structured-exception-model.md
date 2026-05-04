# Structured Exception Model — Implementation Plan

**Date:** 2026-04-30
**Status:** Proposal
**Source:** [`managed-react.md` §6 "Exception Safety and Error Propagation"](./managed-react.md) and the §17 scorecard row **"Exception model — Contained, not structured."**

---

## Goal

Close the §17 scorecard row:

> **Exception model — Contained, not structured.**
> Path to managed: *Structured error type; retry/fallback policies.*

XMLUI's exception **containment** is strong:
[`ErrorBoundary`](../../src/components-core/rendering/ErrorBoundary.tsx)
catches render-time exceptions and resets on navigation,
[`event-handlers.ts`](../../src/components-core/container/event-handlers.ts)
routes handler errors through `signError()` to a toast, the
`LOADER_ERROR` action surfaces loader failures as `$error` for
declarative reaction, and parse errors render a full-page diagnostic.
One bad component does not crash the app.

What is missing — verbatim from §6 — is the *vocabulary*:

1. **No structured error type.** Errors are `Error` instances or
   strings. There is no `ProblemDetails`-equivalent carrying code,
   category, retryability, or correlation ID.
2. **No framework-level retry, fallback, or circuit-breaker.** A
   failed `DataSource` shows `$error` and stops; the user wires retry
   by hand. Polly (.NET) and Spring Retry (JVM) have no XMLUI
   counterpart.
3. **Async errors in event handlers are swallowed by the toast
   pipeline** with no global `unhandledHandlerError` event for
   app-level telemetry.
4. **`ErrorBoundary` does not propagate metadata** — only message +
   stack reach the trace; custom thrown-object fields are dropped.

This plan converts each gap into a small, independently shippable,
independently testable step in priority order:

1. **`AppError`** — a structured error type with code, category,
   retryability, correlation, and metadata-preserving propagation.
2. **`onError` global** — app-level telemetry sink that fires for
   every unhandled handler / loader / boundary error.
3. **`<RetryPolicy>`** — declarative retry / backoff / circuit-breaker
   wrapping `DataSource`, `APICall`, and `<WebSocket>` /
   `<EventSource>` reconnects.
4. **`<Fallback>`** — declarative fallback UI for failed loaders that
   composes with `ErrorBoundary` and `$error`.

Every step lands behind a single `App.appGlobals.strictErrors` switch
(see Step 0) so the rollout can stage warn → opt-in → default-on
without touching call sites.

---

## Conventions

- **Source of truth for error containment:** today's three sites —
  [`ErrorBoundary.tsx`](../../src/components-core/rendering/ErrorBoundary.tsx),
  [`event-handlers.ts`](../../src/components-core/container/event-handlers.ts),
  and the
  [`LOADER_ERROR`](../../src/components-core/rendering/containers.ts)
  reducer action. Each becomes the *consumer* of `AppError` rather
  than `Error`; no new containment site is introduced.
- **Source of truth for the global error sink:**
  [`AppContext`](../../src/components-core/rendering/AppContent.tsx)
  already exposes `signError`. The new `onError` event is registered
  alongside it as the canonical telemetry hook.
- **Existing infrastructure to reuse — do not reinvent:**
  - `RestApiProxy`'s
    [`AbortController`](../../src/components-core/RestApiProxy.ts) and
    the [cooperative-concurrency `$cancel` token](./06-cooperative-concurrency.md)
    are the foundation for `<RetryPolicy>`'s timeout/abort behaviour.
  - The `LOADER_ERROR` action already attaches `$error` to a
    container; `<Fallback>` reads the same shape and renders an
    alternative subtree — no new state surface.
  - The
    [`signError`](../../src/components-core/rendering/error-rendering.tsx)
    pipeline becomes the single dispatch path; everything else
    (toast, `onError`, trace) hangs off it.
- **New module location:**
  `xmlui/src/components-core/errors/` (new directory) — keeps
  `AppError`, the retry policy machinery, and the diagnostic formatter
  together so the LSP and the Vite plugin can import them without the
  React tree.
- **Diagnostic shape:** new `ErrorDiagnostic` carrying
  `{ code: ErrorDiagnosticCode, severity: "error" | "warn",
  componentUid?, source: ErrorSource, message, correlationId? }` where
  `ErrorSource ∈ { "render" | "handler" | "loader" | "lifecycle"
  | "fetch" | "user" }` and
  `ErrorDiagnosticCode ∈ { "unhandled-error" | "retry-exhausted"
  | "circuit-open" | "fallback-rendered" | "rethrow-cycle" }`.
- **Reporting mode:** when `strictErrors === false` (default during
  rollout) `signError(plainError)` accepts both `Error` and `AppError`
  (auto-wrapping `Error` into `AppError` with `code: "unknown"`,
  `category: "internal"`). In strict mode, throwing a plain `Error`
  from script logs a `kind: "errors"` warn with a "did you mean
  `throw new AppError(...)`?" hint.
- **Test layout:** unit tests under
  `xmlui/tests/components-core/errors/`; one spec per step.
  End-to-end tests under `xmlui/tests-e2e/errors/`.

Each step lists: scope, files touched, tests, acceptance criteria,
dependencies.

---

## Step 0 — Switch + Errors Module Skeleton

**Priority:** 0 (foundational; nothing else lands without this)

### Scope

- Add `App.appGlobals.strictErrors: boolean` (default `false`) and
  `App.appGlobals.errorCorrelationIdHeader: string` (default
  `"X-Correlation-Id"`).
- Create `xmlui/src/components-core/errors/` with three exported
  surfaces, all empty stubs:

  ```ts
  // app-error.ts
  export type ErrorCategory =
    | "network"          // transport-level failures
    | "validation"       // user input / schema
    | "authorization"    // 401/403
    | "not-found"        // 404 / missing resource
    | "conflict"         // 409 / optimistic concurrency
    | "rate-limit"       // 429
    | "server"           // 5xx
    | "internal"         // bug; non-retryable
    | "user-cancelled";  // explicit user action
  export interface AppErrorInit {
    code: string;                      // app-specific machine code
    category: ErrorCategory;
    message: string;                   // human-readable
    retryable?: boolean;               // default by category
    correlationId?: string;            // server-issued tracing id
    cause?: unknown;                   // chained cause; preserved
    data?: Record<string, unknown>;    // structured metadata
  }
  export class AppError extends Error {
    readonly code: string;
    readonly category: ErrorCategory;
    readonly retryable: boolean;
    readonly correlationId?: string;
    readonly data: Readonly<Record<string, unknown>>;
    constructor(init: AppErrorInit);
    toJSON(): Record<string, unknown>;
    static from(unknown: unknown): AppError;
  }
  ```

  ```ts
  // policy.ts
  export interface RetryPolicySpec {
    attempts: number;             // total attempts incl. first
    backoff: "fixed" | "linear" | "exponential";
    delayMs: number;              // base delay
    jitter?: boolean;             // default true
    onlyCategories?: ReadonlyArray<ErrorCategory>;  // restrict
    timeoutMs?: number;           // hard ceiling per attempt
  }
  export interface CircuitBreakerSpec {
    failureThreshold: number;     // failures to open the circuit
    resetMs: number;              // time before half-open probe
  }
  export function executeWithPolicy<T>(
    op: (signal: AbortSignal) => Promise<T>,
    spec: RetryPolicySpec & { circuitBreaker?: CircuitBreakerSpec },
    cancel: AbortSignal,
  ): Promise<T>;
  ```

  ```ts
  // diagnostics.ts
  export type ErrorDiagnosticCode =
    | "unhandled-error" | "retry-exhausted" | "circuit-open"
    | "fallback-rendered" | "rethrow-cycle";
  export type ErrorSource =
    | "render" | "handler" | "loader" | "lifecycle" | "fetch" | "user";
  export interface ErrorDiagnostic {
    code: ErrorDiagnosticCode;
    severity: "error" | "warn" | "info";
    componentUid?: string;
    source: ErrorSource;
    message: string;
    correlationId?: string;
  }
  ```

- Wire `"errors"` into the
  [`XsLogEntry.kind`](../../src/components-core/inspector/inspectorUtils.ts)
  union and document the two new appGlobals keys in
  [`standalone.ts`](../../src/components-core/abstractions/standalone.ts).

### Files

- `xmlui/src/components-core/errors/app-error.ts` (new)
- `xmlui/src/components-core/errors/policy.ts` (new)
- `xmlui/src/components-core/errors/diagnostics.ts` (new)
- `xmlui/src/components-core/errors/index.ts` (new — barrel)
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`

### Tests

- `errors/app-error.test.ts`
  - `new AppError({code, category, message})` round-trips through
    `toJSON()`.
  - `AppError.from(stringValue)` produces `category: "internal",
    code: "unknown"`.
  - `AppError.from(existingAppError)` is identity.
  - `cause` is preserved; nested causes are walked by `toJSON()`.

### Acceptance

- `strictErrors` and `errorCorrelationIdHeader` read through
  `App.appGlobals` in markup.
- New module compiles; barrel exports are stable.
- No existing test changes behaviour.

### Dependencies

None. The cooperative-concurrency plan's `$cancel` token is referenced
later (Phase 3) but not required for Step 0.

---

## Phase 1 — `AppError` Plumbing

The new error type only matters once the existing containment sites
*produce* and *propagate* it. This phase wires those three sites
(`ErrorBoundary`, `event-handlers`, `LOADER_ERROR`) without changing
any external behaviour — the toast still appears, `$error` still
populates, the boundary still resets.

### Step 1.1 — `signError` Auto-Wraps to `AppError`

**Priority:** 1

#### Scope

- Update
  [`signError`](../../src/components-core/rendering/error-rendering.tsx)
  to accept `Error | AppError | string | unknown` and normalise to
  `AppError` via `AppError.from()`.
- Update
  [`event-handlers.ts`](../../src/components-core/container/event-handlers.ts)
  to read `correlationId` from the in-flight `App.fetch` response (if
  any) and attach it to the wrapped error.
- Existing `signError(e: Error)` call sites compile unchanged
  (TypeScript widening covers them).

#### Files

- `xmlui/src/components-core/rendering/error-rendering.tsx`
- `xmlui/src/components-core/container/event-handlers.ts`
- `xmlui/src/components-core/RestApiProxy.ts` (extract
  correlation-id header into the thrown error)

#### Tests

- `errors/signError.test.ts`
  - `signError("oops")` produces a single `AppError` with
    `code: "unknown"`, `category: "internal"`, `message: "oops"`.
  - `signError(new TypeError("x"))` preserves the cause via
    `AppError.cause`.
  - `signError(new AppError({...}))` does not double-wrap.
- `tests-e2e/errors/correlation.spec.ts`
  - A failed `App.fetch` response carrying `X-Correlation-Id: abc-123`
    propagates `correlationId: "abc-123"` to the toast and to the
    `kind: "errors"` trace entry.

#### Acceptance

- All existing toast / `$error` flows continue to work.
- The trace pipeline now sees `AppError.toJSON()` payloads (richer
  than today's message-only entries).

#### Dependencies

Step 0.

---

### Step 1.2 — `LOADER_ERROR` Carries `AppError`

**Priority:** 2

#### Scope

- The
  [`LOADER_ERROR` action](../../src/components-core/rendering/containers.ts)
  payload becomes `AppError` (was `Error`).
- The container's `$error` becomes
  `{ message, code, category, retryable, correlationId, data }`
  instead of an unstructured value. Markup that reads `$error.message`
  continues to work; markup gains the ability to read
  `$error.retryable`, `$error.code`, etc.
- DataSource and APICall map HTTP status to `ErrorCategory` at the
  proxy boundary:
  - `400/422` → `"validation"`
  - `401/403` → `"authorization"`
  - `404` → `"not-found"`
  - `409` → `"conflict"`
  - `429` → `"rate-limit"`
  - `5xx` → `"server"` (retryable by default)
  - Network failure / timeout → `"network"` (retryable)

#### Files

- `xmlui/src/components-core/rendering/containers.ts`
- `xmlui/src/components-core/LoaderComponent.tsx`
- `xmlui/src/components-core/RestApiProxy.ts`

#### Tests

- `errors/loader-error.test.ts`
  - A 404 response produces `$error.category === "not-found"` and
    `$error.retryable === false`.
  - A 503 response produces `$error.category === "server"` and
    `$error.retryable === true`.
- `tests-e2e/errors/loader-error.spec.ts`
  - Markup `<Text when="{$error.category === 'authorization'}">Login required</Text>`
    renders correctly.

#### Acceptance

- Existing `$error.message` references continue to work.
- New `$error.*` fields are documented in
  [`.ai/xmlui/data.md`](../../../.ai/xmlui/data.md).

#### Dependencies

Step 1.1.

---

### Step 1.3 — `ErrorBoundary` Preserves Metadata

**Priority:** 3

#### Scope

- Update
  [`ErrorBoundary`](../../src/components-core/rendering/ErrorBoundary.tsx)
  to call `AppError.from(error)` on capture and forward the wrapped
  error to the trace + the global `signError` pipeline. Today the
  boundary logs message + stack only.
- Boundary state stores the full `AppError` (was `Error`); subtrees
  rendered after error read it via the existing fallback render
  prop.

#### Files

- `xmlui/src/components-core/rendering/ErrorBoundary.tsx`

#### Tests

- `errors/boundary.test.ts`
  - A component that throws `new AppError({code:"x"})` from `render`
    has its `AppError` reach the trace verbatim (including `data`).
  - A component that throws a plain string has its message preserved
    and the wrapped error has `code: "unknown"`.

#### Acceptance

- No regression in existing boundary tests.
- Boundary trace entries are `AppError.toJSON()` shaped.

#### Dependencies

Step 1.1.

---

## Phase 2 — App-Level `onError` Sink

§6 names the absence of `unhandledHandlerError` as the third gap.
This phase adds it as a markup-level event on `<App>` that fires for
every error normalised by `signError`.

### Step 2.1 — `<App onError>` and `App.errors` Stream

**Priority:** 4

#### Scope

- Add an `onError` event to `<App>`:
  `<App onError="{(err) => Telemetry.report(err)}" />`. The handler
  receives the full `AppError` (with `source`, `componentUid`, and
  `correlationId` attached on the `data` bag).
- The `onError` handler runs **after** the toast is shown by default;
  it can `event.preventDefault()` to suppress the toast (for errors
  the app reports through its own UI).
- A read-only `App.errors` reactive value exposes the most recent N
  errors (`N = 50`, configurable via
  `App.appGlobals.errorBufferSize`) — useful for "show recent errors"
  developer affordances and inspector debugging.
- The Inspector overlay gains an "Errors" tab that reads
  `App.errors`.

#### Files

- `xmlui/src/components-core/AppContent.tsx`
- `xmlui/src/components-core/AppContext.tsx` (expose `App.errors`)
- `xmlui/src/components-core/inspector/Inspector.tsx` (new tab)

#### Tests

- `errors/app-on-error.test.ts`
  - `signError(...)` triggers `onError` with the `AppError`.
  - `event.preventDefault()` suppresses the toast.
  - `App.errors` accumulates up to `errorBufferSize`, then evicts FIFO.
- `tests-e2e/errors/app-on-error.spec.ts`
  - End-to-end: a thrown loader error reaches a markup `onError` and
    is visible in the Inspector "Errors" tab.

#### Acceptance

- Documented in `.ai/xmlui/app-context.md`.
- Apps without `onError` see no behaviour change (toast still fires).

#### Dependencies

Step 1.1.

---

## Phase 3 — `<RetryPolicy>` Declarative Resilience

The §17 path-to-managed names retry/fallback policies as the second
deliverable. This phase ships a single declarative wrapper component
that composes with `DataSource`, `APICall`, `<WebSocket>`, and
`<EventSource>`.

### Step 3.1 — `<RetryPolicy>` Component

**Priority:** 5

#### Scope

- New built-in component
  `xmlui/src/components/RetryPolicy/RetryPolicy.tsx` following the
  standard two-file pattern.
- Renders its child unchanged but **wraps** the child's effective
  loader/fetch invocation in `executeWithPolicy()` from Step 0. The
  child must be one of: `DataSource`, `APICall`, `WebSocket`,
  `EventSource`. Other children produce a parse-time
  `unknown-retry-target` warn (via the
  [verified-type-contracts plan](./01-verified-type-contracts.md)
  surfaces).
- Props mirror `RetryPolicySpec`:
  `<RetryPolicy attempts="3" backoff="exponential" delayMs="500"
  onlyCategories="network,server" />`.
- Optional `circuitBreaker` prop:
  `<RetryPolicy circuitBreaker="{ failureThreshold: 5, resetMs: 30000 }" />`.
- Emits `kind: "errors"` traces for each retry attempt and a final
  `code: "retry-exhausted"` warn (or `code: "circuit-open"` info)
  when applicable.
- Cancellation-aware: when the child's lifecycle aborts (component
  unmount, `App.cancel()`), the policy aborts immediately via the
  shared `$cancel` token.

#### Files

- `xmlui/src/components/RetryPolicy/RetryPolicy.tsx` (new)
- `xmlui/src/components/RetryPolicy/RetryPolicyReact.tsx` (new)
- `xmlui/src/components/RetryPolicy/RetryPolicy.md` (new)
- `xmlui/src/components/RetryPolicy/RetryPolicy.spec.ts` (new)
- `xmlui/src/components/ComponentRegistry.ts` (registration)
- `xmlui/src/components-core/errors/policy.ts` (fill in
  `executeWithPolicy`)

#### Tests

- `errors/policy.test.ts`
  - Three failures then success → operation resolves.
  - Three failures then fourth failure → `retry-exhausted`.
  - `onlyCategories: ["network"]` does not retry a `validation` error.
  - Circuit breaker opens after `failureThreshold` and rejects
    immediately during `resetMs`, then probes once.
  - `cancel.signal` aborts mid-backoff.
- `RetryPolicy.spec.ts` (Playwright):
  - `<RetryPolicy attempts="3"><DataSource url="/api/flaky"/></RetryPolicy>`
    succeeds on the third try; trace shows three `info` entries.

#### Acceptance

- Composes with all four eligible child types.
- Default behaviour (no `<RetryPolicy>` wrapper) unchanged.
- Documented in `RetryPolicy.md` with a decision table:
  - **`network`/`server` errors** → retry with exponential backoff.
  - **`rate-limit`** → retry with `delayMs` honouring `Retry-After`
    header (Step 3.2 handles header parsing).
  - **`validation`/`authorization`/`not-found`/`conflict`** → never
    retry by default.

#### Dependencies

Step 1.2 (loader categorisation),
[cooperative-concurrency](./06-cooperative-concurrency.md) Step 1.1
(`$cancel` token).

---

### Step 3.2 — `Retry-After` Header Honouring

**Priority:** 6

#### Scope

- When a `429` response carries a `Retry-After` header (seconds or
  HTTP date), `executeWithPolicy` overrides the computed backoff for
  the next attempt with the header value, capped at `60_000 ms`.
- Pure addition to the policy machinery; no new component surface.

#### Files

- `xmlui/src/components-core/errors/policy.ts`
- `xmlui/src/components-core/RestApiProxy.ts` (surface the header
  on the wrapped `AppError.data.retryAfterMs`)

#### Tests

- `errors/retry-after.test.ts`
  - 429 with `Retry-After: 2` waits 2 s before retry.
  - 429 with HTTP-date header parses correctly.
  - Header value > 60 s clamps to 60 s.

#### Acceptance

- Honouring `Retry-After` is on by default; opt-out via
  `<RetryPolicy honourRetryAfter="false" />`.

#### Dependencies

Step 3.1.

---

## Phase 4 — `<Fallback>` Declarative Fallback UI

`$error` is sufficient for inline error rendering, but typical apps
want a structured fallback for whole subtrees. `<Fallback>` is the
declarative counterpart to React's `<ErrorBoundary fallback>`.

### Step 4.1 — `<Fallback>` Component

**Priority:** 7

#### Scope

- New built-in component `xmlui/src/components/Fallback/`.
- Renders `slot="default"` (the "happy path" subtree). When any
  descendant throws or any descendant `DataSource`/`APICall` produces
  a non-recovered error, switches to `slot="error"` with the
  `AppError` exposed as `$error` in scope.
- Optional `slot="loading"` for the suspense-style "still fetching"
  state.
- Reads the same `LOADER_ERROR` reducer state as Step 1.2; no new
  state surface.
- Composes with `<RetryPolicy>`: `<RetryPolicy>` retries first; if
  exhausted, the error propagates to the nearest `<Fallback>`.

#### Files

- `xmlui/src/components/Fallback/Fallback.tsx` (new)
- `xmlui/src/components/Fallback/FallbackReact.tsx` (new)
- `xmlui/src/components/Fallback/Fallback.md` (new)
- `xmlui/src/components/Fallback/Fallback.spec.ts` (new)
- `xmlui/src/components/ComponentRegistry.ts` (registration)

#### Tests

- `Fallback.spec.ts` (Playwright):
  - Happy path renders default slot.
  - Failed `DataSource` inside renders error slot with `$error.code`
    visible.
  - `<RetryPolicy>` inside `<Fallback>` retries before the fallback
    fires.

#### Acceptance

- `<Fallback>` works without any `<ErrorBoundary>` knowledge.
- Documented decision tree in `Fallback.md`:
  - **Inline error message** → use `$error` in markup.
  - **Subtree fallback** → wrap in `<Fallback>`.
  - **App-wide unhandled** → use `<App onError>`.

#### Dependencies

Step 1.2 (loader categorisation), Step 1.3 (boundary metadata
preservation).

---

## Phase 5 — Documentation & Strict Mode

### Step 5.1 — Errors Chapter

**Priority:** 8

#### Scope

- New `xmlui/dev-docs/guide/30-errors.md` chapter and matching
  `.ai/xmlui/errors.md` reference.
- Updates [`managed-react.md` §6](./managed-react.md) to mark the
  asymmetry resolved.
- Updates the §17 scorecard row from
  *"Contained, not structured"* to
  *"Contained and structured — `AppError`, `<RetryPolicy>`,
  `<Fallback>`, `<App onError>`."*
- Updates [`AGENTS.md` documentation map](../../../AGENTS.md).

#### Files

- `xmlui/dev-docs/guide/30-errors.md` (new)
- `.ai/xmlui/errors.md` (new)
- `xmlui/dev-docs/plans/managed-react.md`
- `AGENTS.md`

#### Acceptance

- Both chapters cover the four mechanisms (`AppError`, `onError`,
  `<RetryPolicy>`, `<Fallback>`) with at least one worked example
  each.
- A "category cookbook" table maps every `ErrorCategory` to expected
  user remediation and policy defaults.

#### Dependencies

Steps 1.x, 2.1, 3.1, 4.1.

---

### Step 5.2 — Default `strictErrors: true` in Next Major

**Priority:** 9 (post-feedback)

#### Scope

- After at least one minor cycle of warn-mode telemetry, flip
  `App.appGlobals.strictErrors` default to `true` in the next major.
- In strict mode, `throw "string"` from a handler emits a warn; users
  are nudged toward `throw new AppError({...})`.
- Add a changeset and migration note.

#### Files

- `xmlui/src/components-core/abstractions/standalone.ts` (default flip)
- `.changeset/strict-errors-default.md`
- `xmlui/dev-docs/guide/30-errors.md` (migration section)

#### Acceptance

- All in-repo example apps and the docs site pass under strict mode.

#### Dependencies

Step 5.1.

---

## Rollout

| Phase | Steps | Behaviour | When |
|---|---|---|---|
| **`AppError` plumbing** | 0, 1.1, 1.2, 1.3 | All containment sites produce `AppError`; `$error.*` richer | Next minor |
| **App-level sink** | 2.1 | `<App onError>` and `App.errors` shipped; Inspector tab | Next minor |
| **Resilience** | 3.1, 3.2 | `<RetryPolicy>` available; `Retry-After` honoured | Next minor + 1 |
| **Fallback UI** | 4.1 | `<Fallback>` available | Next minor + 1 |
| **Docs + strict default** | 5.1, 5.2 | Guide chapter; `strictErrors: true` default | Next major |

Each step is independently revertible: removing the
`AppError.from()` call from `signError` reverts to today's
unstructured behaviour without touching markup; removing
`<RetryPolicy>` registration falls back to no-retry.

---

## Step Dependency Graph

```
Step 0 (switch + skeleton)
   │
   └─> Step 1.1 (signError auto-wraps)
          │
          ├─> Step 1.2 (LOADER_ERROR carries AppError)
          │      │
          │      ├─> Step 3.1 (<RetryPolicy>)
          │      │      │
          │      │      └─> Step 3.2 (Retry-After header)
          │      │
          │      └─> Step 4.1 (<Fallback>)
          │
          ├─> Step 1.3 (ErrorBoundary metadata)
          │      │
          │      └─> Step 4.1 (<Fallback>)
          │
          └─> Step 2.1 (<App onError> + App.errors)

   ┌─────────────────────────────────────────┐
   ▼                                         │
Step 5.1 (docs) ─────> Step 5.2 (strict default)
```

---

## Resolved Decisions

These are the design choices baked into the plan. Each has an
alternative noted for future revisitation.

1. **`AppError` is a class, not a tagged union.** A class lets users
   `throw new AppError({...})` with familiar JS ergonomics and
   preserves stack traces. Alternative considered: a discriminated
   union of `{ code, category, ... }` plain objects — rejected
   because it loses stack capture and forces users to learn a custom
   throw syntax.

2. **Categories are a closed list.** Nine categories cover the
   common HTTP / runtime taxonomy. Alternative considered: open
   `category: string` — rejected because retry policies key off the
   category set, and an open list breaks default-policy mapping.

3. **`signError` auto-wraps for backward compatibility.** Existing
   `signError(new Error("x"))` call sites compile and run unchanged;
   the wrapper produces an `AppError` with `code: "unknown"`,
   `category: "internal"`. This is the same backward-compat strategy
   the [verified-type-contracts plan](./01-verified-type-contracts.md)
   uses for `valueType` widening.

4. **`<RetryPolicy>` wraps known children only.** The four eligible
   child types (`DataSource`, `APICall`, `<WebSocket>`,
   `<EventSource>`) cover every framework-managed long-lived resource
   from the [DOM-API hardening plan](./17-dom-api-hardening.md). A
   generic "wrap anything" mode is rejected because it would re-open
   the door to ad-hoc effect logic that the
   [managed-lifecycle-vocabulary plan](./04-managed-lifecycle-vocabulary.md)
   deliberately closes.

5. **`<Fallback>` is a separate component, not a prop on every
   container.** Containers stay focused on layout/state; error
   fallback is structurally distinct and benefits from its own slot
   vocabulary (`error`, `loading`, `default`).

6. **`onError` runs after the toast by default.** Telemetry should
   not silence user-visible feedback unless the app explicitly
   `preventDefault()`s. Alternative considered: pre-toast hook with
   "swallow" semantics — rejected because it makes the default
   surface invisible.

7. **No `cause` chain unwrapping in `toJSON()`.** `toJSON()` walks
   `cause` at most three levels deep to bound serialisation cost.
   Deeper chains truncate with a marker; full chain remains
   accessible via property walk for debugger inspection.

8. **`strictErrors` default flip waits for a major.** Same rationale
   as the other plans — string `throw` exists in user code today.

---

## Out of Scope

- **Server-side error reporting transport.** §6 calls out OTLP /
  HTTP exporters as a managed-framework feature. The hooks land
  here (`<App onError>` is the natural attachment point) but the
  exporter implementation is a separate
  `xmlui-telemetry` extension package.
- **PII redaction policy for trace entries.** Belongs to a future
  "audit logging" plan referenced in the §17 row of the same name.
- **Distributed tracing context propagation** (W3C Traceparent).
  Honoured at the `App.fetch` layer when present, but full
  propagation across `<NestedApp>` boundaries is deferred until a
  cross-app messaging primitive exists.
- **Error budget / SLO tracking.** Application-level concern,
  outside framework scope.
- **Custom user-defined `ErrorCategory` extensions.** Rejected per
  Resolved Decision 2; revisit only if a clear external use case
  emerges.

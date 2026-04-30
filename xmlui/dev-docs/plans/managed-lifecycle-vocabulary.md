# Managed Lifecycle Vocabulary — Implementation Plan

**Date:** 2026-04-30
**Status:** Proposal
**Source:** [`managed-react.md` §5 "Resource Lifecycle and Cleanup"](../managed-react.md) and the §17 scorecard row **"Resource lifecycle — Strong for framework, asymmetric for user code."**

---

## Goal

Close the asymmetry called out in the consolidated scorecard:

> **Resource lifecycle — Strong for framework, asymmetric for user code.**
> Path to managed: *Sandbox-safe lifecycle vocabulary for UDCs.*

Today, every long-lived resource that XMLUI itself owns has automatic
teardown — HTTP via [`RestApiProxy`](../../src/components-core/RestApiProxy.ts)
(AbortController), DataSources via React Query, registered handlers via
[`event-handler-cache`](../../src/components-core/container/event-handler-cache.ts),
loaders via
[`LoaderComponent.onUnmount`](../../src/components-core/LoaderComponent.tsx),
and the DOM-API hardening pass added declarative
[`<WebSocket>`](../../src/components/WebSocket/WebSocketReact.tsx) and
[`<EventSource>`](../../src/components/EventSource/EventSourceReact.tsx)
wrappers whose `useEffect` teardown closes the underlying socket on unmount.

Two gaps remain for **user code**:

1. **No universal `onUnmount` event on components.** Only loaders expose a
   teardown hook. A user-defined component that needs to react to its own
   disposal — to flush a draft, persist a position, emit a final analytics
   event — has no declarative way to do so.
2. **No declarative effect primitive.** Any side effect that does not have a
   dedicated managed component (`<Timer>`, `<DataSource>`, `<APICall>`,
   `<WebSocket>`, `<EventSource>`) forces users into a custom React
   component, which exits the managed surface entirely. This is the same
   pressure that produced the `WebSocket`/`EventSource` components in the
   DOM-API hardening pass — but generalised, instead of solved one resource
   at a time.
3. **No flush hook for state containers.** Containers tear down on React
   unmount with no opportunity to drain pending writes (to a future
   managed `localStorage`/`session` wrapper, or to a `<DataSource>`
   mutation queue) before disposal.

Make the lifecycle vocabulary *symmetric* between framework and user code,
without re-exposing raw `useEffect` or arbitrary timers. The work is split
into small, independently shippable, independently testable steps in
priority order:

1. **Universal lifecycle events** on every container/wrapper component
   (highest priority; pure markup surface; reuses existing event-handler
   pipeline).
2. **Declarative `<Lifecycle>` effect primitive** for one-shot mount/unmount
   side effects that do not fit any existing managed component.
3. **Container disposal hook** (`onBeforeDispose`) for the flush case.
4. **Document the managed lifecycle surface** as a first-class chapter in
   the dev guide.

Every step lands behind a single `App.appGlobals.strictLifecycle` switch
(see Step 0) so the rollout can stage warn → opt-in → default-on without
touching call sites again.

---

## Conventions

- **Source of truth for component teardown:**
  [`ComponentAdapter.tsx`](../../src/components-core/rendering/ComponentAdapter.tsx)
  and [`ComponentWrapper.tsx`](../../src/components-core/rendering/ComponentWrapper.tsx)
  already thread an `onUnmount(uid)` callback through every rendered
  component for cleanup of the
  [`event-handler-cache`](../../src/components-core/container/event-handler-cache.ts).
  The new universal `onUnmount` event hooks into the **same** callback so
  the managed and user-visible teardown points are identical by
  construction.
- **Source of truth for event execution:** the existing event-handler
  pipeline in
  [`event-handlers.ts`](../../src/components-core/container/event-handlers.ts).
  Lifecycle handlers are ordinary action handlers — they are parsed,
  scoped, and cancelled exactly like `onClick`. No new evaluator path.
- **Async contract for `onUnmount`:** synchronous-only execution. React's
  unmount commit phase is synchronous; awaiting a promise after unmount
  risks writing to a torn-down container. The dispatcher rejects async
  handlers in `onUnmount` with a `kind: "lifecycle"` trace entry. Use
  `onBeforeDispose` (Step 3) for the async-flush case, which fires *before*
  React commits the unmount.
- **Existing infrastructure to reuse — do not reinvent:**
  - The `LoaderComponent.onUnmount` pattern for the cache-eviction wiring.
  - [`Timer`](../../src/components/Timer/TimerReact.tsx),
    [`WebSocket`](../../src/components/WebSocket/WebSocketReact.tsx),
    and [`EventSource`](../../src/components/EventSource/EventSourceReact.tsx)
    as the canonical "managed long-lived resource" pattern — `<Lifecycle>`
    (Step 2) is a generalisation of their shape, not a parallel mechanism.
- **New module location:**
  `xmlui/src/components-core/lifecycle/` (new directory) — keeps the
  dispatcher, the disposal coordinator, and the `<Lifecycle>` renderer
  separate from the rendering internals so the unit tests do not need a
  full container fixture.
- **Trace kind:** new `kind: "lifecycle"` entry in the
  [`XsLogEntry`](../../src/components-core/inspector/inspectorUtils.ts)
  union, carrying `{ phase: "mount" | "unmount" | "beforeDispose",
  componentUid: string, durationMs?: number, error?: string }`. Surfaced
  by the existing inspector pipeline.
- **Reporting mode:** when `strictLifecycle === false` (default during
  rollout) violations (async `onUnmount`, exceeded `onBeforeDispose`
  budget, throw inside `onMount`) emit a warn-level trace entry and let
  the app run. In strict mode they upgrade to `console.error` plus a
  one-shot toast; in build/LSP they surface as diagnostics.
- **Test layout:** unit tests under
  `xmlui/tests/components-core/lifecycle/`; one spec per step. End-to-end
  tests for the universal events and `<Lifecycle>` markup live under
  `xmlui/tests-e2e/lifecycle/`.

Each step lists: scope, files touched, tests, acceptance criteria,
dependencies.

---

## Step 0 — Switch + Lifecycle Module Skeleton

**Priority:** 0 (foundational; nothing else lands without this)

### Scope

- Add `App.appGlobals.strictLifecycle: boolean` (default `false`).
- Create `xmlui/src/components-core/lifecycle/` with three exported
  surfaces, all empty stubs in this step:

  ```ts
  // dispatcher.ts
  export type LifecyclePhase = "mount" | "unmount" | "beforeDispose";
  export interface LifecycleEvent {
    phase: LifecyclePhase;
    componentUid: string;
    abortSignal?: AbortSignal;
  }
  export interface LifecycleDispatcher {
    register(uid: string, phase: LifecyclePhase, handler: () => unknown | Promise<unknown>): void;
    fire(event: LifecycleEvent): Promise<void>;
    dispose(uid: string): void;
  }
  export function createLifecycleDispatcher(): LifecycleDispatcher;
  ```

  ```ts
  // diagnostics.ts
  export class LifecycleViolationError extends Error {
    constructor(
      public readonly componentUid: string,
      public readonly phase: LifecyclePhase,
      public readonly reason: "async-onUnmount" | "throw" | "timeout",
    ) { super(formatViolation(componentUid, phase, reason)); }
  }
  ```

  ```ts
  // index.ts — barrel
  ```

- Wire `"lifecycle"` into the
  [`XsLogEntry.kind`](../../src/components-core/inspector/inspectorUtils.ts)
  union and document `strictLifecycle` on `appGlobals` in
  [`standalone.ts`](../../src/components-core/abstractions/standalone.ts).

### Files

- `xmlui/src/components-core/lifecycle/dispatcher.ts` (new)
- `xmlui/src/components-core/lifecycle/diagnostics.ts` (new)
- `xmlui/src/components-core/lifecycle/index.ts` (new — barrel)
- `xmlui/src/components-core/inspector/inspectorUtils.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`

### Tests

- `lifecycle/dispatcher.test.ts`
  - Empty dispatcher fires no handlers.
  - `register()` then `fire()` invokes the handler exactly once.
  - `dispose(uid)` purges all handlers for the uid.
  - Synchronous-only enforcement: an async handler registered for
    `unmount` causes `fire()` to resolve and emit one
    `LifecycleViolationError` with `reason: "async-onUnmount"`.

### Acceptance

- `strictLifecycle` reads through `App.appGlobals` in markup.
- New module compiles; barrel exports are stable.
- All new files pass typecheck and lint.
- No existing test changes behaviour.

### Dependencies

None.

---

## Phase 1 — Universal Lifecycle Events on Every Component

The shipping vocabulary today is **`onUnmount` for loaders only**. This
phase promotes it to a first-class event on every container and wrapper
component, alongside a symmetric `onMount`.

### Step 1.1 — `onMount` and `onUnmount` Event Plumbing

**Priority:** 1 (highest user-visible value)

#### Scope

- Extend
  [`ComponentAdapter.tsx`](../../src/components-core/rendering/ComponentAdapter.tsx)
  to call the dispatcher's `fire({ phase: "mount", componentUid: uid })`
  inside the existing `useEffect(() => { ... return () => { ... } }, [])`.
  The cleanup branch fires `unmount` and then calls the existing
  `onUnmount(uid)` cache eviction.
- Mirror the same wiring in
  [`ComponentWrapper.tsx`](../../src/components-core/rendering/ComponentWrapper.tsx)
  for components that bypass the adapter.
- Register handlers from markup: when the parser sees `onMount` /
  `onUnmount` event attributes on any component, it routes them to the
  dispatcher (alongside the normal handler cache) keyed by the owning
  component's `uid`.
- Document the events on the **base component metadata**
  ([`base-component-metadata.ts`](../../src/components-core/component-hooks.ts))
  so they appear on every component without per-component opt-in. This
  parallels how `id` and `testId` are universal.

#### Files

- `xmlui/src/components-core/rendering/ComponentAdapter.tsx`
- `xmlui/src/components-core/rendering/ComponentWrapper.tsx`
- `xmlui/src/components-core/component-hooks.ts` (or wherever the base
  metadata is defined — confirm during implementation)
- `xmlui/src/components-core/lifecycle/dispatcher.ts` (fill in real impl)

#### Tests

- `lifecycle/onMount.test.ts`
  - Mounting a component with `onMount="state.x = 1"` runs the handler
    after first commit (assertion via `act` + state read).
  - Re-rendering does **not** re-fire `onMount`.
- `lifecycle/onUnmount.test.ts`
  - Unmounting a component with `onUnmount="state.cleaned = true"` runs
    the handler synchronously before React drops the node.
  - Conditional rendering (`when` toggling false) fires `onUnmount` once,
    with no double-fire on re-mount.
- `tests-e2e/lifecycle/universal-events.spec.ts`
  - End-to-end smoke for `onMount`/`onUnmount` on `Stack`, `Form`,
    `Page`, and a UDC.

#### Acceptance

- `onMount`/`onUnmount` work on every component with no per-component
  metadata declaration.
- `onUnmount` runs before the `event-handler-cache` evicts the uid (so
  the handler can still read state).
- Async handlers in `onUnmount` produce a warn (or strict-mode error)
  and are not awaited.
- No regressions in existing unmount-sensitive specs (DataSource
  cleanup, Timer cleanup, NestedApp teardown).

#### Dependencies

Step 0.

---

### Step 1.2 — `onError` Event for Lifecycle and Action Failures

**Priority:** 2

#### Scope

- A throw inside `onMount` is currently silent except for the global
  `signError` toast. Introduce a per-component `onError` event that
  receives `{ source: "mount" | "unmount" | "beforeDispose" | "action",
  error: { message, stack? } }` and runs through the same dispatcher.
- When no `onError` is declared, the existing toast pipeline fires
  unchanged. When `onError` is declared, the toast is suppressed (the
  user's handler is the override).
- Documented on base metadata alongside `onMount`/`onUnmount`.

#### Files

- `xmlui/src/components-core/lifecycle/dispatcher.ts`
- `xmlui/src/components-core/container/event-handlers.ts`
- `xmlui/src/components-core/component-hooks.ts`

#### Tests

- `lifecycle/onError.test.ts`
  - `onMount` throws → `onError` fires with `source: "mount"`.
  - `onError` itself throws → falls back to `signError` toast and emits
    a `kind: "lifecycle"` warn entry.

#### Acceptance

- `onError` is opt-in per component; no behaviour change when absent.
- `onError` cannot suppress strict-mode `LifecycleViolationError`
  diagnostics (those still surface in the trace and in strict-mode
  toasts).

#### Dependencies

Step 1.1.

---

## Phase 2 — `<Lifecycle>` Declarative Effect Primitive

For long-lived effects that do **not** fit any existing managed
component (`<Timer>`, `<DataSource>`, `<APICall>`, `<WebSocket>`,
`<EventSource>`), introduce a small primitive that runs `onMount` and
`onUnmount` actions inside a controlled scope.

`<Lifecycle>` is **not** a hatch back to raw effects. It deliberately
exposes only the action surface: there is no `useRef`, no DOM access, no
returned cleanup function. The "resource" the user owns is whatever
managed state the action handlers read and write — typically container
state, a sibling `<DataSource>`'s `refetch()`, or a one-shot call like
`Log.info()` or `App.session.set()`.

### When you would actually reach for `<Lifecycle>`

The rule of thumb: if a more specific managed component fits, use that
instead. `<Lifecycle>` exists for the leftover "I need *something* to
happen exactly once when this part of the page appears, and *something
else* to happen when it goes away" cases.

A realistic scenario: **a help-drawer page** that should refresh a
"recently viewed articles" list when it opens, log an analytics event,
and — on close — write the user's last-read article back to a managed
DataSource so the next session picks up where they left off.

No single existing component covers all three. `<DataSource>` reloads on
parameter change but doesn't fire telemetry; `<APICall>` runs on
invocation, not on mount; `<Timer>` runs on a schedule. `<Lifecycle>`
composes them:

```xml
<Page when="{state.helpDrawerOpen}">
  <DataSource id="recent" url="/api/articles/recent" />
  <APICall id="saveBookmark" method="POST" url="/api/bookmarks" />

  <Lifecycle
    onMount="
      recent.refetch();
      Log.info('help-drawer opened', { user: App.user.id });
    "
    onUnmount="
      saveBookmark.execute({ articleId: state.lastReadArticle });
      Log.info('help-drawer closed', { duration: App.now() - state.openedAt });
    "
  />

  <ArticleList items="{recent.value}" onSelect="{(a) => state.lastReadArticle = a.id}" />
</Page>
```

When `state.helpDrawerOpen` flips to `true`, the `<Page>` mounts, the
`<Lifecycle>` `onMount` fires once (refetch + log), and the user reads
articles. When the drawer closes (`when` flips to `false`), the page
unmounts, the `<Lifecycle>` `onUnmount` fires (bookmark save + log).
Without `<Lifecycle>`, the user would have to wire each of those into a
different place: the refetch into `onPageVisible` (which doesn't exist),
the save into a click handler on the close button (brittle — misses
drawer dismissal via Escape or navigation), and the analytics event
into… nowhere.

The `key` prop covers the "re-arm" case. A common example: a chat
session that should reset its read-receipt cursor whenever the active
conversation changes:

```xml
<Lifecycle
  key="{state.activeConversationId}"
  onMount="markRead.execute({ conversationId: state.activeConversationId })"
  onUnmount="flushUnreadCounter.execute({ conversationId: state.activeConversationId })"
/>
```

When `activeConversationId` changes, the dispatcher fires `onUnmount`
for the old value, then `onMount` for the new one — declaratively, with
the correct value captured at each phase. This is the same shape as a
React `useEffect` with a dependency array, but expressed in markup with
no escape into closures.

### Step 2.1 — `<Lifecycle>` Component

**Priority:** 3

#### Scope

- New built-in component
  `xmlui/src/components/Lifecycle/Lifecycle.tsx` and
  `LifecycleReact.tsx` following the standard two-file pattern.
- Renders `null` (no DOM output). Registers `onMount`, `onUnmount`,
  `onError` handlers with the dispatcher under its own `uid`.
- Optional `key` prop: when `key` changes, the component re-runs
  `onUnmount → onMount` (the canonical "re-arm an effect" pattern, made
  declarative).
- Metadata file `Lifecycle.md` describing the contract, including the
  synchronous-only constraint on `onUnmount` and the async contract on
  `onMount` (which **may** await; cancellation is provided through the
  dispatcher's `AbortSignal` from Step 0).

#### Files

- `xmlui/src/components/Lifecycle/Lifecycle.tsx` (new)
- `xmlui/src/components/Lifecycle/LifecycleReact.tsx` (new)
- `xmlui/src/components/Lifecycle/Lifecycle.md` (new)
- `xmlui/src/components/Lifecycle/Lifecycle.spec.ts` (new)
- `xmlui/src/components/ComponentRegistry.ts` (registration)

#### Tests

- `Lifecycle.spec.ts` — end-to-end:
  - Mount fires `onMount` exactly once.
  - Conditional unmount fires `onUnmount` exactly once.
  - Changing `key` re-runs the cycle.
  - `onMount` await respects unmount: the dispatcher's `AbortSignal` is
    aborted on unmount, so an awaited operation in `onMount` that checks
    the signal can short-circuit.
- Unit: `lifecycle/lifecycle-component.test.ts` validates dispatcher
  registration / disposal.

#### Acceptance

- `<Lifecycle onMount="..." onUnmount="..." />` works in markup.
- `key` re-arming behaves like the React equivalent.
- No DOM output.
- Documented as the recommended escape hatch for "I genuinely need a
  one-shot side effect" — with the `<Timer>` / `<WebSocket>` /
  `<EventSource>` / `<DataSource>` decision tree in `Lifecycle.md`
  pointing users to the more specific component first.

#### Dependencies

Step 1.1 (shares the dispatcher).

---

## Phase 3 — Container Disposal Hook (Flush Before Unmount)

Containers tear down on React unmount with no opportunity to flush. This
is the finalizer-equivalent gap called out in §5.

### Step 3.1 — `onBeforeDispose` on Containers

**Priority:** 4

#### Scope

- Container components
  ([`Container.tsx`](../../src/components-core/container/Container.tsx),
  `Page`, `Form`, `App`, `NestedApp`) gain an `onBeforeDispose` event.
- Fired by the dispatcher **before** React commits the unmount, with a
  bounded budget (default 250 ms; configurable via
  `App.appGlobals.disposeTimeoutMs`).
- May be async. The dispatcher races the handler against the budget;
  exceeding the budget emits a `LifecycleViolationError` with
  `reason: "timeout"` and lets the unmount proceed.
- Use case: flush a pending write to a managed `<DataSource>`
  mutation, persist scroll position via `App.session` (future), emit a
  final telemetry event through the existing trace.

#### Files

- `xmlui/src/components-core/container/Container.tsx`
- `xmlui/src/components-core/lifecycle/dispatcher.ts`
- `xmlui/src/components-core/abstractions/standalone.ts`
  (for `disposeTimeoutMs`)

#### Tests

- `lifecycle/onBeforeDispose.test.ts`
  - Async `onBeforeDispose` resolves before unmount commit.
  - Exceeding `disposeTimeoutMs` emits a violation and unmounts anyway.
  - `App` `onBeforeDispose` fires on `beforeunload` (browser tab close)
    via the existing `App.fetch` Gate's lifecycle.

#### Acceptance

- `onBeforeDispose` is opt-in per container.
- Containers without the handler unmount with **zero** added latency.
- Handler timeout is observable in the trace and in strict-mode toasts.

#### Dependencies

Step 1.1 (dispatcher).

---

## Phase 4 — Documentation & Strict Mode

### Step 4.1 — Lifecycle Chapter in the Guide

**Priority:** 5

#### Scope

- New `xmlui/dev-docs/guide/26-lifecycle.md` chapter and matching
  `.ai/xmlui/lifecycle.md` reference.
- Updates [`managed-react.md` §5](../managed-react.md) to mark the
  asymmetry resolved (or scoped to "no generic free-form effect"
  depending on what shipped).
- Updates the §17 scorecard row from
  *"Strong for framework, asymmetric for user code"* to
  *"Symmetric — universal `onMount`/`onUnmount`/`onError` events,
  declarative `<Lifecycle>` primitive, container `onBeforeDispose`."*
- Updates [`AGENTS.md` documentation map](../../AGENTS.md) with the new
  AI doc.

#### Files

- `xmlui/dev-docs/guide/26-lifecycle.md` (new)
- `.ai/xmlui/lifecycle.md` (new)
- `xmlui/dev-docs/managed-react.md`
- `AGENTS.md`

#### Tests

- Doc lint: `npm run lint:docs` (if present); else manual review.

#### Acceptance

- Both chapters cover the four primitives (universal events,
  `<Lifecycle>`, `onBeforeDispose`, `strictLifecycle`) with at least one
  worked example each.
- Decision-tree section: "When should I use `<Lifecycle>` vs `<Timer>`
  vs `<WebSocket>` vs `<DataSource>`?" — pointing readers to the most
  specific component first.

#### Dependencies

Steps 1.1, 1.2, 2.1, 3.1.

---

### Step 4.2 — Default `strictLifecycle: true` in Next Major

**Priority:** 6 (post-feedback)

#### Scope

- After at least one minor cycle of warn-mode telemetry, flip
  `App.appGlobals.strictLifecycle` default to `true` in the next major
  release.
- Add a changeset and migration note: async `onUnmount` handlers must be
  rewritten to use `onBeforeDispose`.

#### Files

- `xmlui/src/components-core/abstractions/standalone.ts` (default flip)
- `.changeset/strict-lifecycle-default.md`
- `xmlui/dev-docs/guide/26-lifecycle.md` (migration section)

#### Tests

- Existing test suite must pass with the default flipped.
- A new spec under `xmlui/tests-e2e/lifecycle/strict-mode.spec.ts`
  covers each violation kind producing the expected diagnostic.

#### Acceptance

- Strict mode is the default in the next major.
- All in-repo example apps and the docs site pass under strict mode.

#### Dependencies

Step 4.1.

---

## Rollout

| Phase | Steps | Behaviour | When |
|---|---|---|---|
| **Warn-mode opt-in** | 0, 1.1, 1.2 | Universal events ship; violations warn through trace only | Next minor |
| **Effect primitive** | 2.1 | `<Lifecycle>` available; documented as the escape hatch | Next minor + 1 |
| **Disposal hook** | 3.1 | Containers can flush; `onBeforeDispose` documented | Next minor + 1 |
| **Docs + strict default** | 4.1, 4.2 | Guide chapter lands; strict default in next major | Next major |

Each step is independently revertible: removing the dispatcher
registration in `ComponentAdapter` reverts to today's loader-only
unmount behaviour without touching markup.

---

## Step Dependency Graph

```
Step 0 (switch + skeleton)
   │
   ├─> Step 1.1 (universal onMount/onUnmount)
   │      │
   │      ├─> Step 1.2 (onError)
   │      ├─> Step 2.1 (<Lifecycle>)
   │      └─> Step 3.1 (onBeforeDispose)
   │
   └─────────────────────────────────────────> Step 4.1 (docs)
                                                  │
                                                  └─> Step 4.2 (strict default)
```

---

## Resolved Decisions

These are the design choices baked into the plan. Each has an
alternative noted for future revisitation.

1. **Synchronous-only `onUnmount`.** React commits unmount
   synchronously; awaiting after unmount risks writing to a torn-down
   container. Async-flush is provided by the separate `onBeforeDispose`
   hook (Step 3.1) that fires before commit. Alternative considered:
   allow async `onUnmount` with a "best effort" promise pool — rejected
   because it makes the failure mode (a write that lands after the
   container reducer is gone) silent.

2. **`<Lifecycle>` is action-only, not effect-returning.** The
   primitive deliberately does not expose a returned cleanup callback or
   any ref-style escape. The cleanup channel is the symmetric
   `onUnmount` handler, which reads and writes the same managed state.
   Alternative considered: a JSX-style `effect={() => () => {...}}` —
   rejected because it re-introduces arbitrary closures with captured
   identity, which is precisely what the DOM-API hardening pass spent
   considerable effort eliminating.

3. **No new "Disposable" abstraction in user code.** Users do not
   register `IDisposable`-style objects with the framework. The managed
   resource list stays closed: `<Timer>`, `<DataSource>`, `<APICall>`,
   `<WebSocket>`, `<EventSource>`, `<Lifecycle>`. New resource kinds
   join the list as dedicated components (the same path that produced
   `<WebSocket>` and `<EventSource>`).

4. **`onBeforeDispose` only on containers, not on every component.**
   Granting flush rights to every leaf component would expand the
   unmount-commit budget unpredictably. Containers are the natural unit
   of state ownership; if a leaf needs to flush, it does so via its
   parent container's hook.

5. **`strictLifecycle` default flip waits for a major.** Same rationale
   as `strictReactiveGraph` — async `onUnmount` handlers exist in
   user code today and the migration is non-trivial.

---

## Out of Scope

- **Cooperative cancellation tokens for event handlers.** Belongs to the
  separate "Concurrency / cancellation" gap in §17 — see a future
  `concurrency-tokens.md` plan. The `AbortSignal` exposed to
  `<Lifecycle onMount>` here is a narrow, single-use signal for the
  mount/unmount race only, not a general handler-cancellation token.
- **Container `onMount`/`onError` server-side hooks.** No SSR pipeline
  exists in XMLUI today; revisit when one does.
- **Container-state flush on tab-close (`beforeunload`).** Handled
  incidentally by Step 3.1 when `App` is the unmounting container, but
  full beacon-style background sync requires a managed
  `<BackgroundSync>` component out of scope for this plan.

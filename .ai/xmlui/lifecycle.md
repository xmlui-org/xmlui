# Lifecycle vocabulary (Plan #04)

Reference for agents working on lifecycle hooks, cleanup, or the `<Lifecycle>` component.

## Core files

| File | Purpose |
|---|---|
| `xmlui/src/components-core/lifecycle/diagnostics.ts` | `LifecyclePhase`, `LifecycleViolationReason`, `LifecycleViolationError` |
| `xmlui/src/components-core/lifecycle/dispatcher.ts` | `createLifecycleDispatcher()`, `fireBeforeDispose()`, `reportLifecycleEvent()`, `reportLifecycleViolation()` |
| `xmlui/src/components-core/lifecycle/index.ts` | Public re-exports |
| `xmlui/src/components-core/rendering/ComponentAdapter.tsx` | Wires canonical `onMount`/`onUnmount` visibility lifecycle, legacy `onInit`/`onCleanup` aliases, `onError`, and `onBeforeDispose` |
| `xmlui/src/components/Lifecycle/` | `<Lifecycle>` metadata + renderer |

## What shipped (Phases 1–4)

- **`LifecycleViolationError`** — typed `Error` subclass with `reason: "async-onUnmount" | "throw" | "timeout"`.
- **`createLifecycleDispatcher()`** — `register/fire/dispose` + `fireBeforeDispose()` (async, budget-raced).
- **`reportLifecycleEvent` / `reportLifecycleViolation`** — push `kind:"lifecycle"` trace entries.
- **`kind:"lifecycle"`** registered on `XsLogEntry` in `inspectorUtils.ts`.
- **`appGlobals.strictLifecycle`** (default `true`) + **`appGlobals.disposeTimeoutMs`** (default `250`).
- **Universal `onMount`/`onUnmount`** on every component via `ComponentAdapter`. These are the canonical visibility lifecycle events (`when` absent/true or false → true; true → false or parent teardown).
- **Legacy aliases:** `onInit` aliases `onMount`; `onCleanup` aliases `onUnmount`. If both canonical and legacy names are declared, only the canonical handler runs and a lifecycle warning is emitted.
- Async `onUnmount` emits `async-onUnmount` violation; handler is **not** awaited.
- **`onError`** event per component (`source: "mount"|"unmount"|"beforeDispose"|"action"`); suppresses global `signError` toast when declared.
- **`<Lifecycle>`** non-visual component (`stateful: false`, `keyValue` re-arming via `useEffect([keyValue])`).
- **`onBeforeDispose`** on container components — races handler against `disposeTimeoutMs` budget; always allows unmount.

## Key invariants

- `onUnmount` **must be synchronous** — React's commit phase is sync. Async returns trigger `async-onUnmount` violation.
- `onBeforeDispose` **may be async** — it is fired before React begins teardown, with a timeout budget.
- `strictLifecycle !== false` (i.e. default `true`) escalates violations from `warn` to `error` and shows a one-shot toast.
- Violation traces always flow through `reportLifecycleViolation`; never `console.error` directly.

## Violation reasons

| `reason` | When |
|---|---|
| `"async-onUnmount"` | `onUnmount` returned a Promise |
| `"throw"` | Handler threw |
| `"timeout"` | `onBeforeDispose` exceeded `disposeTimeoutMs` |

## `strictLifecycle` switch

Read site: `ComponentAdapter.tsx`:
```ts
const strictLifecycle = appContext.appGlobals?.strictLifecycle !== false;
```
Default is `true` (strict on). Apps can set `strictLifecycle: false` in `appGlobals` for a warn-only audit window.

## Trace entry shape

```ts
// success
{ kind:"lifecycle", severity:"info", phase, componentUid, componentType?, componentLabel?, durationMs? }
// violation
{ kind:"lifecycle", severity:"warn"|"error", phase, componentUid, reason, componentType?, componentLabel? }
```

## Tests

- `xmlui/tests/components-core/lifecycle/` — dispatcher + diagnostics unit tests
- `xmlui/tests/components/Lifecycle/` — `<Lifecycle>` component unit tests

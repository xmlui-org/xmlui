# 28 — Managed Lifecycle Vocabulary

> Source: `components-core/lifecycle/`, `components-core/rendering/ComponentAdapter.tsx`

---

## Overview

XMLUI provides a symmetric lifecycle vocabulary so that user-defined component
trees can safely set up and tear down resources — just as the framework has
always done internally.

| Primitive | Phase it covers | Where declared |
|---|---|---|
| `onMount` | When the component enters the displayed XMLUI tree (`when` absent/true or false → true) | Any component prop |
| `onUnmount` | When the component leaves the displayed XMLUI tree (`when` true → false or parent teardown) | Any component prop |
| `onError` | When a lifecycle phase or action handler throws | Any component prop |
| `<Lifecycle>` | Re-armable mount/unmount inside a component tree | `components/Lifecycle/` |
| `onBeforeDispose` | Async flush *before* React begins tearing down | Container components |

---

## Universal events: `onMount` / `onUnmount` / `onError`

Every XMLUI component (rendered through `ComponentAdapter`) exposes three
lifecycle events without any metadata opt-in. `onMount` and `onUnmount` are the
canonical names. The older `onInit` and `onCleanup` attributes are compatibility
aliases for `onMount` and `onUnmount`.

If both names are declared on the same component, XMLUI runs only the canonical
handler and emits a lifecycle warning:

```xml
<Stack
  onMount="Log.info('canonical')"
  onInit="Log.info('legacy')"
/>
```

In this case only `onMount` runs.

### Wiring (`ComponentAdapter.tsx`)

```
resolve mount handler:
  onMount if present, otherwise legacy onInit

resolve unmount handler:
  onUnmount if present, otherwise legacy onCleanup

on visible transition:
  false/undefined -> true  fire mount
  true -> false            fire unmount

on React teardown:
  fire onBeforeDispose
  if still visible, fire unmount once
```

### Sync contract

`onUnmount` **must be synchronous**. React's commit phase is synchronous;
an async `onUnmount` would attempt to write into a torn-down container.

| Handler | Async allowed? | What happens if async? |
|---|---|---|
| `onMount` | ✅ Yes | Promise is awaited; rejection routes to `onError` |
| `onUnmount` | ❌ No | Violation emitted (`reason:"async-onUnmount"`); handler is **not** awaited |
| `onBeforeDispose` | ✅ Yes | Raced against `disposeTimeoutMs` budget; violation on timeout |

### `onError` event

```xml
<TextBox
  onMount="initWebSocket()"
  onError="toast('Mount failed: ' + $event.error.message)"
/>
```

`$event` shape:

```ts
{ source: "mount" | "unmount" | "beforeDispose" | "action", error: { message: string, stack?: string } }
```

- Declaring `onError` on a component **suppresses the global `signError`
  toast** for `source:"action"` errors from that component.
- The event is wired through `memoedLookupEventHandler("error")` alongside
  `mount` / `unmount` / `beforeDispose`.

---

## `<Lifecycle>` component

`<Lifecycle>` is a **non-visual, non-stateful** component that fires
`onMount` / `onUnmount` / `onError` declaratively. Its `keyValue` prop
re-arms the effect whenever the value changes — enabling reactive cleanup.

```xml
<!-- Re-arm whenever $selectedId changes -->
<Lifecycle
  keyValue="{$selectedId}"
  onMount="subscribeToItem($selectedId)"
  onUnmount="unsubscribeFromItem($selectedId)"
/>
```

### `keyValue` semantics

`keyValue` drives an internal `useEffect` with `[keyValue]` as the dep list.
When `keyValue` changes React:
1. Runs the old `onUnmount` cleanup.
2. Runs the new `onMount` setup.

### When to use `<Lifecycle>` vs `onMount` on a regular component

| Scenario | Use |
|---|---|
| One-time setup tied to the component lifetime | `onMount` / `onUnmount` on the component itself |
| Setup that must repeat when a value changes | `<Lifecycle keyValue="...">` |
| Cleanup shared across multiple sibling components | `<Lifecycle>` as a dedicated node |

### Implementation notes

- `stateful: false` — no state container; zero React re-renders from this node.
- Registered in `ComponentProvider` / `ComponentRegistry` like any other component.
- `keyValue` change is detected via a second `useEffect([keyValue])` that
  calls the `onMount`/`onUnmount` handlers through `memoedLookupEventHandler`.

---

## `onBeforeDispose`

`onBeforeDispose` is available on **container** components (components whose
rendered subtree may hold subscriptions or in-flight promises). It is the
correct hook for async cleanup (as opposed to `onUnmount`, which is sync-only).

```xml
<Card
  onBeforeDispose="await flushPendingWrites()"
/>
```

The handler is raced against `appGlobals.disposeTimeoutMs` (default `250 ms`).

```
fireBeforeDispose(handler, { timeoutMs, strict, componentUid, ... })
  ├─ sync handler   → trace success immediately
  └─ async handler  → race Promise vs setTimeout(timeoutMs)
       ├─ Promise wins   → clearTimeout; trace success
       └─ setTimeout wins → emit violation(reason:"timeout"); handler ignored
```

A `reason:"throw"` violation is emitted if the handler itself throws.

---

## `strictLifecycle`

Set `App.appGlobals.strictLifecycle = false` to downgrade violations from
`error` to `warn`. The default is `true` (strict mode on).

| `strictLifecycle` | Violation severity | Toast shown? |
|---|---|---|
| `true` (default) | `error` | Yes (one-shot per session) |
| `false` | `warn` | No |

---

## Trace entries

All lifecycle activity is pushed to the `pushXsLog` circular buffer as
`kind:"lifecycle"` entries.

**Success entry** (`severity:"info"`):
```ts
{ kind:"lifecycle", severity:"info", phase, componentUid, componentType?, componentLabel?, durationMs? }
```

**Violation entry** (`severity:"warn"|"error"`):
```ts
{ kind:"lifecycle", severity:"warn"|"error", phase, componentUid, reason, componentType?, componentLabel? }
```

---

## `LifecycleViolationError`

`LifecycleViolationError` (from `components-core/lifecycle/diagnostics.ts`) is
a typed `Error` subclass thrown only in strict mode.

| `reason` | Meaning |
|---|---|
| `"async-onUnmount"` | `onUnmount` returned a Promise |
| `"throw"` | Handler threw an exception |
| `"timeout"` | `onBeforeDispose` exceeded `disposeTimeoutMs` |

---

## Module map

| File | Purpose |
|---|---|
| `components-core/lifecycle/diagnostics.ts` | `LifecyclePhase`, `LifecycleViolationReason`, `LifecycleViolationError` |
| `components-core/lifecycle/dispatcher.ts` | `createLifecycleDispatcher()`, `fireBeforeDispose()`, `reportLifecycleEvent()`, `reportLifecycleViolation()` |
| `components-core/lifecycle/index.ts` | Public re-exports |
| `components-core/rendering/ComponentAdapter.tsx` | Wires `useEffect` → `onMount`/`onUnmount`/`onError`/`onBeforeDispose` |
| `components/Lifecycle/` | `<Lifecycle>` component (metadata + renderer) |

---

## Tests

- `tests/components-core/lifecycle/` — unit tests for `dispatcher.ts` and `diagnostics.ts`
- `tests/components/Lifecycle/` — unit tests for the `<Lifecycle>` component

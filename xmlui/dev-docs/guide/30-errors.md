# 30. Structured Exception Model

> **Companion to [17. Error Handling Strategy](17-error-handling.md).**
> Chapter 17 explains *where* errors are caught (the five containment
> domains). This chapter explains *what shape* they arrive in once
> caught, and the three declarative tools built on top of that shape:
> `<App onError>`, `<RetryPolicy>`, and `<Fallback>`.

## Why This Matters

XMLUI's containment strategy guarantees errors do not crash the app, but
historically every consumer received a different value: handler `catch`
blocks got a thrown `Error` or string; `LOADER_ERROR` payloads carried
the original `Response`; `ErrorBoundary` got React's error info plus a
stack. Subscribers had to defensively duck-type each one.

The structured exception model normalises every caught error
into a single `AppError` type at every chokepoint. Downstream consumers
— toast pipeline, `$error` markup, trace entries, telemetry sinks, and
the new retry/fallback components — read the same shape.

---

## The `AppError` Type

Defined in `xmlui/src/components-core/errors/app-error.ts`:

```ts
class AppError extends Error {
  readonly code: string;
  readonly category: ErrorCategory;
  readonly retryable: boolean;
  readonly correlationId?: string;
  readonly data: Record<string, unknown>;

  toJSON(): AppErrorPayload;
  static from(value: unknown): AppError;
}
```

`AppError.from(value)` is the universal normalisation entry point. It is
idempotent on existing `AppError`s, preserves the original throwable as
`cause`, and wraps strings/objects with `code: "unknown"`,
`category: "internal"`. Every error-catching site in
`components-core/` calls it.

### Categories

`ErrorCategory` is a closed union:

| Value | Default `retryable` |
|---|---|
| `"network"` | `true` |
| `"validation"` | `false` |
| `"authorization"` | `false` |
| `"not-found"` | `false` |
| `"conflict"` | `false` |
| `"rate-limit"` | `true` |
| `"server"` | `true` |
| `"user-cancelled"` | `false` |
| `"internal"` | `false` |

`categorizeHttpStatus(status)` maps an HTTP status code to the
corresponding category. The mapping is centralised so the proxy
(`RestApiProxy`) and any custom loader code use identical rules.

---

## Normalisation Sites

| Site | File | Function |
|---|---|---|
| Handler / action errors | `container/event-handlers.ts` | `signError(e)` → `AppError.from(e)` |
| Loader errors | `rendering/containers.ts` (`LOADER_ERROR`) + `LoaderComponent.tsx` | Payload becomes `AppError` |
| Render errors | `rendering/ErrorBoundary.tsx` | `componentDidCatch` calls `AppError.from()` |
| Lifecycle errors | `ComponentAdapter.tsx` | `onError` event payload contains an `AppError` |

`$error` in markup (loader-driven) and `event.error` in handlers now
hold the same shape.

---

## `<App onError>` and the `App.errors` Stream

Wired in `AppContent.tsx` (search for `App.errors`). Every call to
`signError` does three things:

1. Push to the FIFO buffer exposed as `App.errors` (capped at
   `appGlobals.errorBufferSize`, default 50).
2. Dispatch the `onError` event declared on `<App>` (if any). The event
   payload is `{ error: AppError }`; calling `preventDefault()`
   suppresses the default toast.
3. Emit a `kind: "errors"` trace entry through the observability
   pipeline.

The Inspector overlay has an "Errors" tab that reads `App.errors`.

---

## `<RetryPolicy>` — Declarative Resilience

`xmlui/src/components/RetryPolicy/` registers a non-visual wrapper
component that re-runs failing loader descendants per
`RetryPolicySpec`. The underlying engine is `executeWithPolicy()` in
`components-core/errors/policy.ts`:

```ts
function executeWithPolicy<T>(
  op: (signal: AbortSignal) => Promise<T>,
  spec: RetryPolicySpec,
  cancel: AbortSignal,
): Promise<T>;
```

Spec fields: `attempts`, `backoff` (`fixed`/`linear`/`exponential`),
`delayMs`, `jitter` (±25%), `onlyCategories`, `timeoutMs`,
`honourRetryAfter`, `circuitBreaker` (`{failureThreshold, resetMs}`).

`Retry-After` honouring: when an HTTP 429 response carries a
`Retry-After` header (seconds or HTTP-date), `RestApiProxy` parses it
into `AppError.data.retryAfterMs`. `executeWithPolicy` overrides the
computed backoff with that value, capped at 60 000 ms.

Cancellation: the cooperative `$cancel` token aborts both
in-flight attempts and mid-backoff timers.

Each retry emits a `kind: "errors"` trace `info`; exhaustion emits a
`code: "retry-exhausted"` warn; an open circuit emits `code:
"circuit-open"`.

---

## `<Fallback>` — Declarative Recovery UI

`xmlui/src/components/Fallback/` swaps in an `errorTemplate` (and
optional `loadingTemplate`) when a descendant loader produces a
non-recovered `AppError`. The `$error` context variable is the
normalised `AppError`.

Composition with `<RetryPolicy>` is unidirectional: retry first, then
fall back. There is no need for an explicit React `ErrorBoundary` —
`<Fallback>` reads the same `LOADER_ERROR` reducer state used by
`$error` in inline markup, so subtree-wide recovery uses the same
plumbing as inline `<Text when="{$error.category === ...}">`.

---

## `strictErrors` Switch

`App.appGlobals.strictErrors` (default `true`) controls whether any non-`AppError` value that reaches `signError`
emits a `kind:"errors"` warn in the trace pipeline with a migration hint.
Set it to `false` for warn-only migration mode:

```json
{ "appGlobals": { "strictErrors": false } }
```

`App.appGlobals.errorCorrelationIdHeader` (default
`"X-Correlation-Id"`) is the response header `RestApiProxy` looks for
when populating `AppError.correlationId`.

---

## Adding a New Normalisation Site

If you introduce a new error-catching surface (a new transport, a new
async primitive), follow the three-line rule:

```ts
} catch (raw) {
  const err = AppError.from(raw);
  signError(err, { source: "my-transport", componentUid });
}
```

`signError` handles the buffer, the `<App onError>` dispatch, the
trace emission, and the toast. Do not duplicate that pipeline.

---

## Files

| File | Role |
|---|---|
| `xmlui/src/components-core/errors/app-error.ts` | `AppError` class, `categorizeHttpStatus` |
| `xmlui/src/components-core/errors/policy.ts` | `executeWithPolicy`, `parseRetryAfter` |
| `xmlui/src/components-core/errors/diagnostics.ts` | `ErrorDiagnostic` shape, trace helpers |
| `xmlui/src/components-core/errors/RetryPolicyContext.ts` | React context bridging the wrapper to the engine |
| `xmlui/src/components/RetryPolicy/` | `<RetryPolicy>` component |
| `xmlui/src/components/Fallback/` | `<Fallback>` component |
| `xmlui/src/components-core/rendering/AppContent.tsx` | `App.errors` buffer, `<App onError>` dispatch |
| `xmlui/src/components-core/rendering/error-rendering.tsx` | `signError` |

---

## Related

- [17. Error Handling Strategy](17-error-handling.md) — containment domains
- [28. Lifecycle](28-lifecycle.md) — per-component `onError` event
- [19. Inspector & Debugging](19-inspector-debugging.md) — Errors tab and trace pipeline

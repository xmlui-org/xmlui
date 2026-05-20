# Structured Exception Model — AI Reference

Companion to [error-handling.md](error-handling.md). That doc covers the
five containment domains (where errors are caught); this doc covers the
normalised `AppError` shape that flows out of every chokepoint and the
declarative tools layered on top.

## TL;DR

- Every caught error is normalised to `AppError` via `AppError.from()`.
- Loader `$error`, handler `event.error`, `<App onError>`, and
  `<Fallback>` all read the same shape.
- `<RetryPolicy>` retries with backoff + jitter + `Retry-After` honouring.
- `<Fallback>` swaps in `errorTemplate` when a descendant loader fails.
- `App.errors` is a FIFO buffer; `<App onError>` is the global sink.
- `strictErrors` (default `false`) is the warn-mode forward-compat switch.

## AppError shape

`xmlui/src/components-core/errors/app-error.ts`

```ts
class AppError extends Error {
  code: string;            // e.g. "http-404", "timeout", "unknown"
  category: ErrorCategory; // closed union (see below)
  retryable: boolean;
  correlationId?: string;
  data: Record<string, unknown>; // e.g. { status, retryAfterMs, ... }
  toJSON(): AppErrorPayload;
  static from(value: unknown): AppError; // idempotent
}

type ErrorCategory =
  | "network" | "validation" | "authorization" | "not-found"
  | "conflict" | "rate-limit" | "server"
  | "user-cancelled" | "internal";
```

`categorizeHttpStatus(status)` returns the category for an HTTP status.
400/422 → validation; 401/403 → authorization; 404 → not-found; 409 →
conflict; 429 → rate-limit; 5xx → server; else → internal.

## Normalisation sites

- `event-handlers.ts` — `signError(e)` is the universal entry point for
  handler / lifecycle errors. Auto-wraps via `AppError.from()`.
- `LoaderComponent.tsx` — wraps loader failures into `AppError` before
  dispatching `LOADER_ERROR`. `$error` payload is now structured.
- `ErrorBoundary.tsx` — `componentDidCatch` normalises via
  `AppError.from()` and forwards to `signError`.
- `RestApiProxy.ts` — extracts `X-Correlation-Id` (or the header named by
  `appGlobals.errorCorrelationIdHeader`) and parses `Retry-After` into
  `AppError.data.retryAfterMs`.

## RetryPolicy component

`xmlui/src/components/RetryPolicy/`. Non-visual wrapper. Eligible
children: `DataSource`, `APICall`, `WebSocket`, `EventSource`. Props:

```xml
<RetryPolicy
  attempts="3"
  backoff="exponential"    <!-- fixed | linear | exponential -->
  delayMs="500"
  jitter="true"
  onlyCategories="network,server"
  timeoutMs="0"
  honourRetryAfter="true"
  circuitBreaker="{ { failureThreshold: 5, resetMs: 30000 } }"
/>
```

Engine: `executeWithPolicy<T>(op, spec, cancel)` in
`components-core/errors/policy.ts`. Emits `kind:"errors"` traces for
each retry; `code: "retry-exhausted"` warn on exhaustion;
`code: "circuit-open"` info when the breaker rejects.

## Fallback component

`xmlui/src/components/Fallback/`. Two named templates:

- `errorTemplate` — rendered when a descendant loader produces an
  unrecovered `AppError`. `$error` context variable available.
- `loadingTemplate` — rendered when the `isLoading` prop is truthy.

Composes with `<RetryPolicy>` — retries run first; only the
unrecovered error reaches `<Fallback>`.

## App-level surface

- `<App onError="...">` — handler receives `event.error` (AppError).
  `event.preventDefault()` suppresses the toast.
- `App.errors` — read-only FIFO buffer of recent `AppError`s
  (`appGlobals.errorBufferSize`, default 50).
- Inspector overlay has an "Errors" tab reading `App.errors`.

## AppGlobals keys

- `strictErrors: boolean` (default `true`). When `true`, warns when a
  handler throws a non-`AppError`. Set to `false` for migration mode.
- `errorBufferSize: number` (default 50). Size of the `App.errors`
  buffer.
- `errorCorrelationIdHeader: string` (default `"X-Correlation-Id"`).
  Response header name that becomes `AppError.correlationId`.

## When to use what

| Need | Use |
|---|---|
| Inline error message in markup | `$error` from loader |
| Retry transient failures | `<RetryPolicy>` |
| Subtree recovery UI | `<Fallback>` with `errorTemplate` |
| Global telemetry sink | `<App onError>` |
| Per-component error handling | per-component `onError` event |
| Historic error list / debugging | `App.errors` + Inspector "Errors" tab |

## Tests

- `xmlui/tests/components-core/errors/app-error.test.ts` — type behaviour
- `xmlui/tests/components-core/errors/policy.test.ts` — retry + circuit
- `tests-e2e/errors/` — end-to-end correlation, loader-error, app-on-error

## Related references

- [error-handling.md](error-handling.md) — containment strategy
- [lifecycle.md](lifecycle.md) — per-component `onError`
- [data-operations.md](data-operations.md) — DataSource/APICall
- [inspector-debugging.md](inspector-debugging.md) — Errors tab

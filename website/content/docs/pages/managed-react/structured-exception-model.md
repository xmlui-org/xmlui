# Structured Exception Model

XMLUI gives every error in your app a structured shape. Whether an error
comes from a failed fetch, a thrown handler, a render-time exception, or a
lifecycle hook, it arrives as an `AppError` with a machine-readable `code`,
a semantic `category`, a `retryable` flag, and an optional
`correlationId`. On top of this shape you get three declarative tools:
`<App onError>` for global telemetry, `<RetryPolicy>` for automatic
retries, and `<Fallback>` for declarative recovery UI.

## What problems this prevents

- Network blips no longer require you to wire up retry-with-backoff by
  hand for each `DataSource` — wrap the loader in `<RetryPolicy>` and the
  policy handles attempt counts, jitter, and `Retry-After` honouring.
- 4xx vs 5xx vs offline failures no longer all look the same — every
  loader exposes `$error.category` (`"validation"`, `"authorization"`,
  `"not-found"`, `"conflict"`, `"rate-limit"`, `"server"`, `"network"`,
  `"user-cancelled"`, `"internal"`) so your markup can branch correctly.
- Telemetry no longer needs to subscribe to a hidden toast pipeline —
  declare `<App onError>` once and every handler error, loader error, and
  render error flows through it.
- Subtree recovery no longer requires custom React error boundaries —
  wrap the failing branch in `<Fallback>` and supply an `errorTemplate`
  to render in place of the failed children.
- 429 throttling no longer needs ad-hoc backoff math — `<RetryPolicy>`
  honours the server's `Retry-After` header automatically (capped at 60
  seconds).
- Correlation IDs from server responses (`X-Correlation-Id`) are
  automatically attached to errors, so a single trace can follow a
  request from the browser to the backend.

## How it works

A single chokepoint normalises every error into an `AppError` before it
reaches you. Loader failures map HTTP status to a semantic `category`;
handler throws are wrapped; render exceptions are caught and forwarded.
The normalised `AppError` then flows through three independent channels
in parallel: the per-component `onError` event, the optional `<App
onError>` global sink, and `<Fallback>` subtrees that listen for failed
descendant loaders. Each channel is opt-in; if you do nothing, the
existing toast pipeline still fires.

## The `AppError` shape

Whenever you read `$error` (from a loader), or receive an error through
an event handler, the value has this shape:

| Field | Type | Meaning |
|---|---|---|
| `code` | string | Machine-readable code (e.g. `"http-404"`, `"timeout"`). |
| `category` | string | Semantic category — drives retry defaults and branch logic. |
| `message` | string | Human-readable message. |
| `retryable` | boolean | Whether the policy considers this error retryable by default. |
| `correlationId` | string? | Server-issued correlation id, when present. |
| `data` | object | Extra structured fields (status, headers, `retryAfterMs`, ...). |

### Categories

| Category | Typical source | Retryable by default? |
|---|---|---|
| `"network"` | TCP/DNS failure, timeout, CORS | yes |
| `"validation"` | HTTP 400, 422 | no |
| `"authorization"` | HTTP 401, 403 | no |
| `"not-found"` | HTTP 404 | no |
| `"conflict"` | HTTP 409 (optimistic concurrency) | no |
| `"rate-limit"` | HTTP 429 (honours `Retry-After`) | yes |
| `"server"` | HTTP 5xx | yes |
| `"user-cancelled"` | Aborted via `$cancel` | no |
| `"internal"` | Wrapped non-`Error` throws, bugs | no |

## Reading `$error` from loaders

Every `DataSource` and `APICall` exposes the structured error as
`$error`:

```xmlui copy
<App>
  <DataSource id="user" url="/api/me" />
  <Text when="{user.$error?.category === 'authorization'}"
        value="Please log in." />
  <Text when="{user.$error?.category === 'not-found'}"
        value="Account not provisioned yet." />
  <Text when="{user.$error}" value="{user.$error.message}" />
</App>
```

## Automatic retries with `<RetryPolicy>`

Wrap any loader-driven subtree in `<RetryPolicy>` to get attempt-count,
backoff, jitter, and category-filtered retries:

```xmlui copy
<RetryPolicy
  attempts="4"
  backoff="exponential"
  delayMs="500"
  onlyCategories="network,server,rate-limit"
>
  <DataSource id="report" url="/api/reports/daily" />
</RetryPolicy>
```

- `attempts` is the **total** number of tries, not the number of retries.
- `backoff` is `"fixed"`, `"linear"`, or `"exponential"`.
- `jitter` is on by default (±25%).
- `onlyCategories` restricts which errors trigger a retry. By default
  only `retryable: true` categories are retried.
- A `Retry-After` header on a 429 response overrides the computed delay
  (cap: 60 s, override with `honourRetryAfter="false"`).

### Circuit breaker

For repeated failures, supply an optional `circuitBreaker`:

```xmlui copy
<RetryPolicy
  attempts="3"
  backoff="linear"
  delayMs="1000"
  circuitBreaker="{ { failureThreshold: 5, resetMs: 30000 } }"
>
  <DataSource id="flaky" url="/api/flaky" />
</RetryPolicy>
```

After 5 consecutive failures the policy fast-fails for 30 seconds, then
probes once. This protects backends from retry storms.

## Declarative fallback UI with `<Fallback>`

When a subtree's primary loaders fail, `<Fallback>` swaps in an
`errorTemplate` (and optionally a `loadingTemplate`):

```xmlui copy
<Fallback>
  <property name="errorTemplate">
    <Card>
      <H3 value="We hit a snag." />
      <Text value="{$error.message}" />
      <Text when="{$error.correlationId}"
            value="Reference: {$error.correlationId}" />
    </Card>
  </property>
  <DataSource id="orders" url="/api/orders/recent" />
  <List data="{orders}" />
</Fallback>
```

`<Fallback>` composes with `<RetryPolicy>` — retries happen first; if
exhausted, the error propagates to the nearest `<Fallback>`.

## Global telemetry with `<App onError>`

Declare `onError` on `<App>` once and every error in the app flows
through it:

```xmlui copy
<App onError="Log.error('app-error', event.error)">
  <!-- ... -->
</App>
```

The handler receives `event.error` (the `AppError`). Calling
`event.preventDefault()` suppresses the default toast — useful when your
app reports errors through its own UI.

The most recent errors are also exposed on `App.errors` (FIFO buffer,
default size 50, configurable via `xmluiConfig.errorBufferSize`). The
Inspector overlay has an "Errors" tab that reads this buffer.

## Per-component `onError`

Every component supports an `onError` event (see [Managed Lifecycle
Vocabulary](managed-lifecycle-vocabulary.md)). When declared, it
suppresses the default toast for that component's errors and gives you
the structured `AppError` directly:

```xmlui copy
<APICall id="save" method="POST" url="/api/save"
         onError="toast('Save failed: ' + event.error.message)" />
```

## Enabling strict mode

`xmluiConfig.strictErrors` is `true` by default. When on, throwing a
plain string or non-`AppError` value from a handler emits a `kind:"errors"`
warn diagnostic, nudging code toward `throw new AppError({...})`. To
temporarily silence the warning while migrating, set it to `false`:

```json
{
  "xmluiConfig": {
    "strictErrors": false
  }
}
```

## Related

- [Managed Lifecycle Vocabulary](managed-lifecycle-vocabulary.md) — `onError` event on every component
- [Fetch Lifecycle](fetch-lifecycle.md) — how loaders abort in-flight requests
- [Observability Substrate](observability-substrate.md) — the trace pipeline that captures every error

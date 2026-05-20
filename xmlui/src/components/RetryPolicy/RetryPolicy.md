%-DESC-START

`RetryPolicy` wraps `DataSource` (and other loader-backed components) with a
configurable retry / backoff / circuit-breaker policy. When the wrapped
fetch raises an `AppError`, the policy decides whether to retry, wait,
fail fast, or open a circuit before the error bubbles up to the
component's `$error` channel.

```xmlui-pg copy display name="Example: retrying a flaky endpoint"
<App>
  <RetryPolicy attempts="3" backoff="exponential" delayMs="500"
               onlyCategories="network,server">
    <DataSource id="flaky" url="/api/flaky"/>
  </RetryPolicy>
</App>
```

### Decision table

| Error category                                | Default behaviour                                         |
| --------------------------------------------- | ---------------------------------------------------------- |
| `network`, `server`                           | Retry with the configured backoff (default exponential).  |
| `rate-limit`                                  | Retry; the next delay honours an HTTP `Retry-After` header (capped at 60 s). |
| `validation`, `authorization`, `not-found`, `conflict` | Never retried by default (use `onlyCategories` to override). |
| `user-cancelled`                              | Rethrown immediately; the policy never resumes a cancelled operation. |

### Circuit breaker

Pass an explicit `circuitBreaker` object to fail fast after repeated
failures:

```xmlui-pg copy display name="Example: opening a circuit after 5 failures"
<App>
  <RetryPolicy attempts="2" delayMs="200"
               circuitBreaker="{ failureThreshold: 5, resetMs: 30000 }">
    <DataSource id="external" url="/api/external"/>
  </RetryPolicy>
</App>
```

After `failureThreshold` consecutive failures the circuit opens; further
calls reject immediately with `code: "circuit-open"` for `resetMs`
milliseconds, after which a single probe attempt is allowed.

%-DESC-END

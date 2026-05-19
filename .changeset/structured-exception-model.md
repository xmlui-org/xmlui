---
"xmlui": patch
---

Structured exception model (plan #07): `<App onError>` event + `App.errors`
ring buffer + `App.setErrorHandler` API; `LOADER_ERROR` now carries a
structured `AppError` (HTTP status → semantic category, `$error.code`,
`$error.category`, `$error.retryable`, `$error.data`); new `<RetryPolicy>`
component (configurable attempts / backoff / circuit-breaker, honours
HTTP `Retry-After`); new `<Fallback>` component (declarative error /
loading slots that compose with `<RetryPolicy>`).

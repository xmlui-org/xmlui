# Centralized HTTP

All HTTP traffic from an XMLUI app flows through a single gate. Built-in
data components (`DataSource`, `APICall`) and the sanctioned `App.fetch()`
global delegate to the framework's request proxy, which adds CSRF and
transaction headers and enforces an origin allowlist. Raw `fetch`,
`XMLHttpRequest`, `WebSocket`, `EventSource`, and `navigator.sendBeacon`
are not reachable from expressions.

## What problems this prevents

- A handler cannot accidentally call `fetch(...)` directly and bypass the
  CSRF and transaction headers your backend expects.
- An expression cannot open an `XMLHttpRequest`, `WebSocket`,
  `EventSource`, or beacon connection to an arbitrary host.
- Cross-origin requests to hosts you did not explicitly allow are rejected
  before they hit the network, even if a URL is computed at runtime.
- Every outbound HTTP call appears in the trace pipeline, so security
  review and audit logging cover one well-defined surface instead of
  scattered network primitives.

## How it works

The framework's request proxy is the only network entry point for built-in
components and for the `App.fetch()` global. It injects the configured
CSRF token and transaction headers and checks the destination against
`xmluiConfig.allowedOrigins`. Same-origin requests are always permitted;
cross-origin requests are rejected before the network is touched. The
managed `<WebSocket>` and `<EventSource>` components apply the same
allowlist to streaming connections.

## Configuring the origin allowlist

List the cross-origin hosts your app is allowed to call in
`xmluiConfig.allowedOrigins`. Same-origin requests do not need to appear
in the list.

```json
{
  "xmluiConfig": {
    "allowedOrigins": [
      "https://api.example.com",
      "https://cdn.example.com"
    ]
  }
}
```

Any request to a host that is neither same-origin nor on the list is
rejected with a clear diagnostic and recorded in the trace.

## Related

- [DataSource](/docs/components/DataSource)
- [APICall](/docs/components/APICall)
- [DOM API Isolation](/docs/managed-react/dom-api-isolation)
- [Fetch Lifecycle](/docs/managed-react/fetch-lifecycle)
- [Managed React Overview](/docs/managed-react/overview)

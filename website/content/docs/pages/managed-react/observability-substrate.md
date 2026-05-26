# Observability Substrate

XMLUI captures every state change, navigation, API call, and sandbox event
into a single, structured trace. The same pipeline drives the Inspector
overlay you use during development and the audit trail you can ship to a
backend in production — there is no second instrumentation layer to set up.

## What problems this prevents

- Diagnosing a reactive cascade no longer requires sprinkling `console.log`
  statements through your markup; the trace already shows which variable,
  loader, or handler fired and in what order.
- A failing API call, a navigation, or a sandbox warning is recorded with
  enough structure (kind, source location, timing) to reproduce the
  problem without re-running the user's session.
- Production incidents can be replayed from the trace stream instead of
  reconstructed from screenshots and stack traces.
- Security-relevant events — banned DOM access, fetch attempts to
  disallowed origins, clipboard writes, navigations — are visible in one
  place rather than scattered across the browser console.

## How it works

The framework writes structured entries into a circular in-memory buffer
through a single internal `pushXsLog()` call. Every interesting event has
a well-known `kind` value (for example `app:fetch`, `navigate`,
`clipboard:copy`, `ws:connect`, `sandbox:warn`, `log:info`,
`reactive-cycle`). The Inspector overlay renders the buffer live during
development. The audit pipeline can sample and forward the same entries
to an OTLP/JSON sink in production.

Trace entries are emitted by the framework itself — you do not annotate
your components to participate. New trace kinds are added as new managed
features ship, so the audit surface grows automatically with the
framework.

## Using the Inspector

Open the Inspector overlay in development to watch the trace stream as
your app runs. Each entry shows its kind, timestamp, source location (if
known), and structured payload. Filtering by `kind` is the fastest way to
focus on a specific subsystem — for example showing only `app:fetch`
entries while debugging a network problem.

## Related

- [Managed React Overview](/docs/managed-react/overview)
- [DOM API Isolation](/docs/managed-react/dom-api-isolation)
- [Centralized HTTP](/docs/managed-react/http-centralization)

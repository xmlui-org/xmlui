# Audit-Grade Observability

The observability substrate captures every state change, API call, and
navigation as a structured trace entry. **Audit-grade observability**
turns that stream into a compliance-ready audit trail: it redacts PII,
enforces sampling and retention, correlates work across navigations and
fetches with W3C Trace Context, and forwards everything to an OTLP/JSON
backend (or to a sink you register yourself).

It is the *same* trace stream that drives the Inspector in development.
You don't run two pipelines.

## What problems this prevents

- A trace shipped off-browser can no longer carry plaintext passwords,
  tokens, credit-card numbers, or `Authorization` headers — the redactor
  drops or masks them before the entry leaves the page.
- Backend logs no longer disagree with the browser timeline: every
  outgoing fetch carries a `traceparent` header that ties the
  server-side span back to the browser entry that started it.
- Production volume no longer drowns out signal — head sampling decides
  per-trace whether to keep all entries, and tail sampling holds entries
  in memory just long enough to flush them only when an error fires.
- A misconfigured redaction policy is no longer silent: the audit
  pipeline emits its own self-diagnostics (`audit-redaction-missing`,
  `audit-policy-conflict`, `audit-sink-failure`, `audit-pii-leaked`,
  `audit-correlation-missing`, `audit-buffer-overflow`) so you can see,
  and in strict mode block, leaks before they ship.

## How it works

Every internal `pushXsLog()` call passes the resulting entry through the
audit pipeline:

1. **Redaction** — runs the entry's leaf paths against your declared
   `RedactionRule[]` (dot-paths with `*` and `**` wildcards). Conflicts
   resolve by aggressiveness: `drop > hash > mask`.
2. **Content-PII scan** — if a string slipped through the structural
   rules but matches a built-in heuristic (email, JWT, credit-card, SSN,
   API-key, IPv4, phone) or one you registered, the pipeline emits
   `audit-redaction-missing`. With strict mode on, the entry is also
   dropped and `audit-pii-leaked` records the leak.
3. **Sampling** — applies the configured head and tail sampling rules.
4. **Sink delivery** — forwards surviving entries to the OTLP/JSON sink,
   the console sink, or a custom sink you registered by name.

Framework-internal entries (`versioning`, `forms`, `audit`, `build`,
`errors`, `lifecycle`, `sandbox:warn`, `log:*`, `i18n`) bypass redaction
and PII scanning by design — their payloads are framework-produced
diagnostic strings, never user data.

## Declaring a policy

Add an `auditPolicy` to your `<App>` (object literal):

```xmlui
<App
  auditPolicy="{{
    redact: [
      { selector: 'headers.Authorization', mode: 'drop' },
      { selector: 'payload.email',         mode: 'hash' },
      { selector: '**.password',           mode: 'mask' }
    ],
    sample: { head: { rate: 0.1 }, tail: { keepIfErrorIn: ['fetch:fail'] } },
    retention: { bufferSize: 500, onOverflow: 'drop-oldest' },
    sink: { kind: 'otlp', endpoint: 'https://otel.example.com/v1/traces' }
  }}"
/>
```

`config.json` also accepts the same shape under
`xmluiConfig.auditPolicy`. The framework normalises both into the same
internal representation.

## Strict mode (on by default)

Strict audit logging is **enabled by default**. In strict mode:

- `audit-redaction-missing` and `audit-policy-conflict` are reported as
  errors instead of warnings.
- An entry that fails PII scanning is **dropped** and recorded as
  `audit-pii-leaked`, so it never reaches any sink.

To downgrade to warn-only mode during migration, set
`strictAuditLogging: false` in `config.json`:

```json
{
  "xmluiConfig": {
    "strictAuditLogging": false,
    "auditPolicy": { /* ...as above... */ }
  }
}
```

> **Tip:** Start with `strictAuditLogging: false` to surface
> `audit-redaction-missing` warnings without dropping entries, add the
> needed redaction rules, then remove the override to restore strict
> mode.

## Registering a custom sink

When a built-in transport doesn't fit, register a sink factory and
reference it from policy by name:

```xmlui
<App onReady="App.registerAuditSink('my-collector', cfg => ({
  push: entry => fetch(cfg.endpoint ?? '/audit', {
    method: 'POST',
    body: JSON.stringify(entry)
  }),
  flush: () => Promise.resolve()
}))">
  ...
</App>
```

Then declare it:

```xmlui
auditPolicy="{{
  sink: { kind: 'custom', endpoint: 'my-collector' }
}}"
```

The string in `endpoint` is the name passed to `registerAuditSink`.

## Registering a custom PII heuristic

```xmlui
<App onReady="App.registerAuditHeuristic('internal-id', /^INT-[0-9]{6}$/)" />
```

Values that match the pattern will fire `audit-redaction-missing` unless
a redaction rule already covers their path.

## Correlation with backend traces

When a fetch leaves the browser via the framework's HTTP layer, the
pipeline injects a `traceparent` header in W3C Trace Context format. The
server-side span derives its `traceId` from the same value, so the
end-to-end trace can be assembled from browser + backend logs without
any custom plumbing.

## Filtering the Inspector

The Inspector toolbar exposes one-click **filter pills** above the
trace stream — `audit`, `versioning`, `lifecycle`, `errors`, `log:warn`,
`log:info`. Clicking a pill hides every event whose kind starts with
that token; clicking again restores it. Use them to silence noisy
internal diagnostic kinds while you focus on application traces, or to
isolate just the audit-pipeline diagnostics during a redaction review.

## Related

- [Observability Substrate](/docs/managed-react/observability-substrate)
- [Centralized HTTP](/docs/managed-react/http-centralization)
- [Structured Exception Model](/docs/managed-react/structured-exception-model)

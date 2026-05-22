# DOM API Isolation

Expressions in XMLUI markup run inside a sandbox that hides the raw
browser DOM and platform APIs. Direct access to dangerous primitives is
denied; the safe operations you actually need are exposed as sanctioned
replacements on `App.*`, `Log.*`, `Clipboard.*`, and managed components
like `<WebSocket>` and `<EventSource>`.

## What problems this prevents

- An expression cannot mutate the DOM directly (`innerHTML`,
  `appendChild`, `document.write`, `MutationObserver`, …), so React stays
  the single source of truth for what the user sees.
- Background-execution and storage primitives (`Worker`, `SharedWorker`,
  `localStorage`, `indexedDB`, `caches`, `cookieStore`, service workers,
  `BroadcastChannel`) are not reachable, eliminating an entire class of
  invisible state and side-channel scheduling.
- Sensor and capability APIs (`geolocation`, `mediaDevices`, `bluetooth`,
  `usb`, `serial`, `credentials`, `Notification`) are blocked at the
  expression level; opt-in components remain the only path to them.
- Navigation cannot be hijacked by an expression writing `window.location`
  or opening pop-ups; routing goes through the framework's `navigate()`
  global, which is itself traced.
- Network constructors (`XMLHttpRequest`, `WebSocket`, `EventSource`,
  `sendBeacon`) are blocked; HTTP traffic flows through `App.fetch()` and
  managed streaming components.

## How it works

The script-runner installs a property-access guard at every member read,
member write, and call evaluation point. The guard consults a denylist of
99 globally banned identities — covering DOM mutation, observers,
concurrency primitives, storage, sensors, navigation, raw network
constructors, crypto, and performance APIs. The full set of sanctioned
replacements (`App.fetch`, `App.randomBytes`, `App.now`/`mark`/`measure`,
`App.environment`, `Log.*`, `Clipboard.copy`, `<WebSocket>`,
`<EventSource>`, the `navigate()` global) is wired into the global
expression scope so handlers have a clean API for every legitimate use
case.

## Strict mode

The sandbox warns by default and throws in strict mode. In warn mode, a
blocked access still proceeds but emits a `sandbox:warn` trace entry that
points at the call site and suggests a replacement. In strict mode, the
access throws a `BannedApiError` and the handler fails through the normal
error pipeline.

```json
{
  "appGlobals": {
    "strictDomSandbox": true
  }
}
```

`console` is a special case: it is in the denylist but allowed by default
for developer ergonomics. Set `appGlobals.allowConsole` to `false` to
include it in the sandbox enforcement:

```json
{
  "appGlobals": {
    "allowConsole": false
  }
}
```

When `allowConsole` is `false`, expressions should use `Log.debug`,
`Log.info`, `Log.warn`, and `Log.error` instead — these route through the
trace pipeline and stay visible in the Inspector.

## Related

- [Code Injection Prevention](/docs/managed-react/code-injection-prevention)
- [XSS Protection](/docs/managed-react/xss-protection)
- [Centralized HTTP](/docs/managed-react/http-centralization)
- [Observability Substrate](/docs/managed-react/observability-substrate)
- [Managed React Overview](/docs/managed-react/overview)

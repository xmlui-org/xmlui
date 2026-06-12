# UDC Sandbox

A User-Defined Component (UDC) — a compound component you author with
`<Component name="…">` — is now a real trust boundary, not just a markup
convenience. You can declare the props, events, methods, and slots the
UDC exposes; list the managed primitives it is allowed to call; mark it
`trusted` or `untrusted`; ship a `udc.manifest.json` alongside it; and
audit every UDC in your app from the CLI. Used together, these turn
"that third-party component is doing *what*?" from a code-review chore
into a build-time check.

## What problems this prevents

- A UDC quietly reading `var.parentSecret` from the page that hosts it
  no longer goes unnoticed. The scope gate emits `udc-scope-leak` when
  the UDC's expressions reach for an identifier outside its declared
  prop / slot / app-globals surface, and refuses the read entirely
  under strict mode.
- A "money input" UDC suddenly calling `App.fetch` after an upgrade no
  longer ships without a review. List `capabilities="…"` on the UDC
  header and any unlisted managed primitive (`App.fetch`,
  `<WebSocket>`, `navigate`, `Clipboard.copy`, `App.randomBytes`,
  `Log.*`, `App.environment`, `App.now`/`mark`/`measure`) fires
  `udc-capability-missing`.
- A parent embedding a third-party UDC can no longer accidentally grant
  it more power than the author asked for. Call-site
  `capabilities="…"` *narrows* the declared set; widening attempts are
  rejected as `udc-capability-undeclared` at parse time.
- A UDC pack you installed last week no longer drifts away from its
  published contract without a warning. The framework compares the
  shipped `udc.manifest.json` to the actual implementation on load and
  emits `udc-manifest-mismatch` when they disagree.
- A typo like `$props.amout` in a UDC body no longer renders as
  `undefined`; with explicit `<Prop>` declarations the framework emits
  `udc-prop-undeclared` naming the offending reference.
- An "I'll review the third-party pack before shipping" promise no
  longer relies on memory. `xmlui udc audit` enumerates every UDC, its
  trust level, and its declared + effective capabilities;
  `--fail-on-untrusted` blocks CI when an unreviewed UDC slips in.

## How it works

A UDC's `<Component>` header now accepts explicit `<Prop>`, `<Event>`,
`<Method>`, and `<Slot>` declarations plus `capabilities="…"` and
`trust="trusted | untrusted"` attributes; the parser turns these into a
`UdcContract` attached to the component definition. When a UDC is
instantiated, the runtime installs a scope gate over its container so
identifier reads outside the declared surface emit `udc-scope-leak`,
and routes every managed-primitive access (`App.fetch`, `navigate`, …)
through a capability check that consults the contract. Diagnostics
surface as `kind:"udc"` entries on the trace; under strict mode they
escalate to thrown `UdcScopeError` / `UdcCapabilityError` instances
that flow through the structured-exception model.

## Declaring a UDC's contract

```xmlui
<Component
    name="MoneyInput"
    capabilities="log"
    trust="trusted"
>
    <Prop name="amount" type="number" required="true" />
    <Prop name="currency" type="string" defaultValue="USD" />
    <Event name="changed" />
    <Method name="reset" />
    <Slot name="footer" />

    <TextBox
        value="{$props.amount}"
        onDidChange="(v) => emitEvent('changed', { amount: v })"
    />
</Component>
```

When declarations are present they replace the parse-time inference
walk that today guesses the prop list from `$props.<member>` references.
A UDC with no declaration block still works exactly as before — the
inferred contract is used and no `udc-prop-undeclared` diagnostics
fire. Mixed mode is rejected: if you declare any `<Prop>` you must
declare every prop the UDC reads.

## Capabilities

The capability set is a closed enum drawn from the framework's
sanctioned managed primitives:

| Capability | Gates |
|---|---|
| `fetch` | `App.fetch`, `<DataSource>`, `<APICall>` |
| `websocket` | `<WebSocket>` |
| `eventsource` | `<EventSource>` |
| `navigate` | `navigate(...)` |
| `clipboard` | `Clipboard.copy`, `Clipboard.read` |
| `randomBytes` | `App.randomBytes` |
| `log` | `Log.*` |
| `mark` | `App.now`, `App.mark`, `App.measure` |
| `environment` | `App.environment` |

When `capabilities` is omitted, all capabilities are granted (the
backwards-compatible default). When it is present, only the listed
capabilities resolve.

```xmlui
<!-- UDC author declares: -->
<Component name="EmployeePicker" capabilities="fetch, log">
    <Prop name="department" type="string" />
    <!-- ... -->
</Component>

<!-- Parent narrows the effective set at the call site: -->
<EmployeePicker department="sales" capabilities="log" />

<!-- Rejected at parse time — parent cannot grant more than the author asked: -->
<EmployeePicker department="sales" capabilities="fetch, clipboard" />
```

The effective capability set is the intersection of the UDC declaration
and the call-site override. Declaring a capability the UDC never uses
emits `udc-capability-undeclared` so capability sets stay tight and
reviewable.

## Trust modes

Mark a UDC `trust="untrusted"` when its source is a third-party pack,
a user-supplied file, or any other origin you do not fully control.
Pair that with `xmluiConfig.udcTrust` to decide what the app does about
untrusted UDCs globally:

| `udcTrust` | Behaviour for `trust="untrusted"` UDCs |
|---|---|
| `"open"` (default) | The trust attribute is informational only. |
| `"review"` | Every untrusted UDC emits `udc-untrusted-violation` listing missing declarations and implicit (unlisted) capabilities, so CI surfaces the unreviewed surface. |
| `"strict"` | Untrusted UDCs run with strict scope + capability enforcement unconditionally, regardless of `xmluiConfig.strictUdcSandbox`. |

```json
{
  "xmluiConfig": {
    "udcTrust": "review"
  }
}
```

Untrusted UDCs must carry an explicit declaration block and an explicit
`capabilities=""` (an empty list is a valid declaration). An untrusted
UDC that falls back to inference is rejected.

## Third-party manifest

A UDC shipped as part of a package can declare its contract in a
sibling `udc.manifest.json`:

```json
{
    "name": "MoneyInput",
    "version": "1.2.3",
    "contract": {
        "props": [
            { "name": "amount", "type": "number", "required": true },
            { "name": "currency", "type": "string", "defaultValue": "USD" }
        ],
        "events": ["changed"],
        "methods": ["reset"],
        "slots": [{ "name": "footer" }],
        "capabilities": ["log"]
    },
    "trust": "untrusted"
}
```

The framework compares the manifest with the UDC's actual declarations
at load time. Any drift — extra prop, removed event, widened
capabilities — fires `udc-manifest-mismatch` so a malicious upgrade
that quietly adds `fetch` cannot ship past review.

## Auditing every UDC in your app

```bash
npx xmlui udc audit            # prints a table
npx xmlui udc audit --json     # machine-readable
npx xmlui udc audit --fail-on-untrusted   # exits non-zero on CI
```

The audit table lists, for every UDC in the app, its declared
capabilities, trust level, and originating file — the same surface the
review pipeline reads.

## Diagnostic codes

| Code | When it fires | Default | Strict |
|---|---|---|---|
| `udc-prop-undeclared` | `$props.foo` referenced but no `<Prop name="foo">`. | info | error |
| `udc-prop-shape-mismatch` | Caller passes a value whose type does not match the declared `<Prop type>`. | warn | error |
| `udc-event-undeclared` | UDC fires an event with no matching `<Event>` declaration. | warn | error |
| `udc-method-undeclared` | UDC exposes a method with no matching `<Method>` declaration. | warn | error |
| `udc-slot-undeclared` | A slot is used / consumed with no matching `<Slot>` declaration. | warn | error |
| `udc-scope-leak` | UDC reads an identifier outside its declared surface. | warn | error |
| `udc-capability-missing` | UDC calls a managed primitive not in its `capabilities` list. | warn | error |
| `udc-capability-undeclared` | Capability declared / requested at call site is not in the UDC's declared set. | info | warn |
| `udc-manifest-mismatch` | Implementation contract differs from the shipped `udc.manifest.json`. | warn | error |
| `udc-untrusted-violation` | Untrusted UDC missing required declarations under `udcTrust: "review" \| "strict"`. | warn | error |

## Enabling strict mode

Set `xmluiConfig.strictUdcSandbox` to `true` to escalate the table above
from warn / info to error and to throw `UdcScopeError` /
`UdcCapabilityError` from offending reads instead of merely tracing
them:

```json
{
  "xmluiConfig": {
    "strictUdcSandbox": true,
    "udcTrust": "strict"
  }
}
```

Strict mode flips to the default in the next major release. Turning it
on early is the recommended path for apps that load third-party UDC
packs.

## Related

- [Verified Type Contracts](/docs/managed-react/verified-type-contracts)
  — the `type` strings on `<Prop>` declarations use the same coercion
  table.
- [Build-Validation Analyzers](/docs/managed-react/build-validation-analyzers)
  — UDC diagnostics ship through the same LSP / Vite / CLI surfaces.
- [Structured Exception Model](/docs/managed-react/structured-exception-model)
  — `UdcScopeError` / `UdcCapabilityError` arrive as `AppError`
  instances.
- [DOM-API Isolation](/docs/managed-react/dom-api-isolation) — the
  capability list is the same closed enum as the sanctioned managed
  primitives.

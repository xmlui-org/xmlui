# UDC Sandbox — AI Reference

Plan #14 establishes a declarative contract + runtime gates for user-defined components (UDCs).
A UDC's `<Component>` declaration enumerates its props, events, methods, slots, and capabilities
in markup; three runtime gates enforce every boundary the contract draws.

## Core Files

| File | Role |
|------|------|
| `xmlui/src/components-core/udc-sandbox/contract.ts` | `UdcContract` shape (built by parser) |
| `xmlui/src/components-core/udc-sandbox/capability.ts` | Closed `Capability` enum + host mapper |
| `xmlui/src/components-core/udc-sandbox/scope-gate.ts` | `buildScopeGate(parentScope, contract)` proxy |
| `xmlui/src/components-core/udc-sandbox/validators.ts` | `validateUdcPropReferences()` |
| `xmlui/src/components-core/udc-sandbox/manifest.ts` | `loadManifest()`, `compareManifest()`, `serializeContract()` |
| `xmlui/src/components-core/udc-sandbox/report.ts` | `collectUdcReport()` / `formatUdcAuditReport()` |
| `xmlui/src/components-core/udc-sandbox/diagnostics.ts` | `UdcDiagCode` union + helpers |
| `xmlui/src/components-core/udc-sandbox/index.ts` | Barrel |
| `xmlui/src/components-core/CompoundComponent.tsx` | Host binding: scope gate + capability mapper |
| `xmlui/src/components-core/rendering/Container.tsx` | Forwards `udcContract` into eval options |
| `xmlui/src/components-core/rendering/StateContainer.tsx` | Same for state-bearing UDCs |
| `xmlui/src/components-core/analyzer/rules/udc-slot-undeclared.ts` | Consumer-side slot rule |
| `xmlui/scripts/cli/udc-audit.ts` | CI audit CLI |
| `xmlui/scripts/cli/udc-declare.ts` | Migration scaffolder CLI |

## Contract Shape

```ts
interface UdcContract {
  props:        Record<string, PropContract>;
  events:       Record<string, EventContract>;
  methods:      Record<string, MethodContract>;
  slots:        string[];
  capabilities: Capability[];
  trust:        "trusted" | "untrusted";
}
```

UDCs **without** a contract get a PASS_THROUGH scope gate and an IMPLICIT capability set
(legacy escape hatch). All gates are no-ops in that mode.

## The Three Gates

1. **Scope gate** (`buildScopeGate`) — filters parent globals to `props ∪ uses`. Out-of-contract
   reads emit `udc-scope-leak`.
2. **Capability gate** (`capability.ts`) — host APIs consult `udcCapabilityMapper` then assert
   membership in `contract.capabilities`. Missing emits `udc-capability-missing` and (in strict)
   throws `UdcCapabilityError` before the side effect.
3. **Prop-reference validator** (`validateUdcPropReferences`) — walks the body once at mount and
   flags `$props.<name>` references not in `contract.props`.

## Capability Enum

```
fetch | websocket | eventsource | navigate | clipboard | randomBytes | log | mark | environment
```

Closed union — any new host capability must be added here AND wired through the mapper.

## App Globals

| Global | Type | Default | Effect |
|--------|------|---------|--------|
| `strictUdcSandbox` | `boolean` | **`true`** (W8-1, plan #14 Step 6.2) | Escalates `info`/`warn` UDC diagnostics to `error`; blocks side effects with missing capability. Opt out with `={false}`. |
| `udcTrust` | `"open"\|"review"\|"strict"` | `"open"` | Behaviour for `trust="untrusted"` UDCs. `"review"`/`"strict"` emit `udc-untrusted-violation` per missing declaration / implicit capability set. |

## Trust Modes

`trust="trusted"` (default) and `trust="untrusted"` declared on `<Component>`. Untrusted UDCs
follow `appGlobals.udcTrust`. `compareManifest()` diffs a UDC's `udc.manifest.json` against the
parser-built contract and emits `udc-manifest-mismatch` on any drift (extra capability, removed
prop, slot rename, trust downgrade).

## Manifest File

Sibling of the `.xmlui` source under `udc.manifest.json` or `<name>.udc.manifest.json`.
`loadManifest(udcName, contract, { sourceFile, searchDirs })` guards `fs` access in `try`/`catch`
so browser bundles silently get `null`.

## Diagnostic Codes (kind: `"udc"`)

| Code | Severity (default → strict) | When |
|------|------------------------------|------|
| `udc-prop-undeclared` | info → error | `$props.x` accessed where `x` not in contract |
| `udc-scope-leak` | warn → error | Out-of-contract parent global read |
| `udc-capability-missing` | warn → error | Host API used without declared capability |
| `udc-untrusted-violation` | warn → error | Untrusted UDC has implicit declarations/capabilities under `udcTrust="review"`/`"strict"` |
| `udc-manifest-mismatch` | error | `compareManifest()` drift |
| `udc-slot-undeclared` | warn → error | Consumer `slot="x"` not in parent's declared slot set |

All entries are dispatched via `pushXsLog({ kind: "udc", code, severity, udc, trust, message, data })`.

## CLI

```bash
# CI audit — fails if any untrusted UDC lacks explicit review
node xmlui/scripts/cli/udc-audit.ts [dir] [--format gnu|json] [--fail-on-untrusted]

# Migration scaffolder — infers <Prop> blocks from $props.x references
node xmlui/scripts/cli/udc-declare.ts <file-or-dir> [--write] [--format gnu|json]
```

Both standalone scripts; no central `xmlui` CLI dispatcher exists yet.

## Inspector / Telemetry

`collectUdcReport()` reads `window._xsLogs` for `kind:"udc"` entries grouped by UDC name; consumed
by the Inspector "UDC permissions" panel (devtools package) and the audit CLI.
`formatUdcAuditReport(report)` produces a Markdown summary for CI logs.

## Cross-References

- **End-user docs:** `website/content/docs/pages/managed-react/udc-sandbox.md`
- **Dev-guide chapter:** [`xmlui/dev-docs/guide/35-udc-sandbox.md`](../../xmlui/dev-docs/guide/35-udc-sandbox.md)
- **Plan record:** [`xmlui/dev-docs/plans/14-udc-sandbox.md`](../../xmlui/dev-docs/plans/14-udc-sandbox.md)

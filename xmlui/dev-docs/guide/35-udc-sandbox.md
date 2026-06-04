# 35. UDC Sandboxing

> **Internal architecture chapter for the UDC (user-defined component)
> sandbox.** For the application-developer-facing guide, see
> [website/content/docs/pages/managed-react/udc-sandbox.md].

## Why This Matters

User-defined components (UDCs) are written by application authors in
`.xmlui` files. Without isolation, every UDC could:

- read any parent global as if it were its own state;
- call any side-effecting host capability (`fetch`, `navigate`,
  `clipboard`, …) the framework exposes;
- silently grow its public surface as authors added `$props.x`
  references inside the body, with no checksum or review trail.

The sandbox makes the contract between a UDC and its host
*declarative*: the UDC enumerates its props, events, methods, slots, and
capabilities in markup, and the runtime enforces every boundary that
contract draws.

---

## Subsystem Layout

```
xmlui/src/components-core/udc-sandbox/
├── contract.ts              UdcContract type, parser-built shape
├── capability.ts            Capability enum + host-capability mapper
├── scope-gate.ts            buildScopeGate(parentScope, contract)
├── validators.ts            validateUdcPropReferences(...)
├── manifest.ts              load + compare udc.manifest.json
├── report.ts                collectUdcReport() / formatUdcAuditReport()
├── diagnostics.ts           UdcDiagCode union + helpers
└── index.ts                 barrel
```

The sandbox is a *pure data layer*. Three call sites in
`components-core/` (`CompoundComponent.tsx`,
`rendering/Container.tsx`, `rendering/StateContainer.tsx`) bind the
sandbox into the render pipeline; everything else is invoked
declaratively by those bindings.

---

## The Contract

`<Component>` declarations in `.xmlui` accept four optional declaration
sections: `<Prop>`, `<Event>`, `<Method>`, and `<Slot>`. The parser
(`xmlui/src/parsers/xmlui-parser/transform.ts`) collects them into a
`UdcContract`:

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

A UDC *without* declarations has no contract on its
`CompoundComponentDef`. Such legacy UDCs travel through a
`PASS_THROUGH` scope gate and an `IMPLICIT` capability set — useful as
a backwards-compatibility escape hatch, but inert against the sandbox.

---

## The Three Gates

### 1. Scope Gate

`buildScopeGate(parentScope, contract)` returns a filtered proxy of the
parent globals that exposes *only* the names listed in
`contract.props ∪ contract.uses`. Any read of an undeclared identifier
emits `udc-scope-leak` (warn → error in strict). `CompoundComponent.tsx`
installs this proxy as the UDC's parent scope before any expression
evaluation.

### 2. Capability Gate

`capability.ts` defines the closed enum:

```
fetch | websocket | eventsource | navigate | clipboard
  | randomBytes | log | mark | environment
```

Host APIs in `AppContext` (`navigate`, `Actions.callApi`, `fetch`
shims, etc.) consult `evalContext.options?.udcCapabilityMapper` to
resolve their capability tag, then call into `validators.ts` to assert
membership in `contract.capabilities`. Missing capabilities emit
`udc-capability-missing`; in strict mode the host throws
`UdcCapabilityError` *before* the side-effect runs.

### 3. Prop-Reference Validator

`validateUdcPropReferences()` runs once per UDC mount. It walks every
expression node in the body and flags `$props.<name>` references whose
`<name>` is not in `contract.props`. Severity is `info` by default,
`error` in strict.

The walker reuses `collectPropsFromComponentDef` (the same routine that
powers metadata inference) so the analyzer rule
`udc-prop-undeclared`, the runtime validator, and the
`xmlui udc declare` scaffolder all see the same set of references.

---

## Trust Modes & Manifest Comparison

`trust="untrusted"` on a `<Component>` declaration tells the host that
the UDC came from an out-of-org source (a marketplace install,
third-party plugin, untrusted include). Untrusted UDCs honour the
host-wide `appGlobals.udcTrust` setting:

| `udcTrust`  | Behaviour for untrusted UDCs |
|-------------|-------------------------------|
| `"open"`    | Same gates as trusted UDCs.   |
| `"review"`  | Per missing declaration / implicit capability, emit `udc-untrusted-violation` (warn). |
| `"strict"`  | Same as `"review"` but escalates to `error`; treats the UDC as if `strictUdcSandbox` were on. |

`compareManifest(currentContract, persistedManifest)` performs the
publish-time diff. When the UDC's `udc.manifest.json` on disk
disagrees with the parser-built contract (extra capability, removed
prop, slot rename, trust downgrade), the function emits
`udc-manifest-mismatch` and blocks the publish in CI.

`loadManifest(udcName, contract, { sourceFile, searchDirs })` looks for
the manifest as a sibling of the source file under the names
`udc.manifest.json` or `<udcName>.udc.manifest.json`. The function
guards the `fs` import inside a `try`/`catch` so browser bundles
silently get `null` instead of a build error.

---

## Render-Pipeline Integration Points

| Site | Role |
|------|------|
| `CompoundComponent.tsx` | Resolves the contract, computes `strictUdcSandbox`, installs scope gate + capability mapper into the eval context. |
| `rendering/Container.tsx` | Forwards `udcContract` from the def onto `EvalTreeOptions` so descendant expressions inherit the gate. |
| `rendering/StateContainer.tsx` | Same plumbing for state-bearing UDCs. |
| `script-runner/eval-tree-common.ts` | Reads `options.strictUdcSandbox` when emitting sandbox diagnostics from the expression evaluator. |

The three host bindings ensure both *evaluator-driven* references
(`{$props.x}`) and *handler-driven* side effects (`fetch(...)` inside
an `event="foo"`) flow through the same gates.

---

## Reactive Diagnostics

Every sandbox diagnostic is dispatched through `pushXsLog` with
`kind: "udc"`, plus:

| Field        | Value                                       |
|--------------|---------------------------------------------|
| `code`       | A `UdcDiagCode` from `diagnostics.ts`       |
| `severity`   | `"info"` / `"warn"` / `"error"`             |
| `udc`        | The declared component name                 |
| `trust`      | The trust mode of the offending UDC         |
| `message`    | Human-readable summary                      |
| `data`       | Code-specific payload (capability, name, …) |

`collectUdcReport()` (in `report.ts`) reads the trace buffer and groups
findings by UDC name for the Inspector "UDC permissions" panel and the
`xmlui udc audit` CLI. The same data is rendered as a Markdown summary
by `formatUdcAuditReport()`.

---

## CLI Tooling

Two scripts live under `xmlui/scripts/cli/`:

- **`udc-audit.ts`** — walks a directory of `.xmlui` files, parses each
  UDC, and prints (or returns as JSON) the trust posture and capability
  set per UDC. `--fail-on-untrusted` exits non-zero when any untrusted
  UDC lacks an explicit review, which gates CI.
- **`udc-declare.ts`** — migration scaffolder. For each UDC with no
  declaration block, infers the set of `$props.<name>` references and
  prints (or with `--write`, inserts) the corresponding
  `<Prop name="…"/>` block at the top of the component body. Authors
  refine the types, mark required props, and add `capabilities="…"`
  before promoting to strict mode.

Both scripts are standalone (no central `xmlui` CLI dispatcher exists
yet — they are invoked as `node xmlui/scripts/cli/udc-audit.ts …`),
matching the established pattern used by `xmlui replay`.

---

## Analyzer Rule

`xmlui/src/components-core/analyzer/rules/udc-slot-undeclared.ts`
catches *consumer-side* slot misuse: when a parent UDC declares its
slot set, any `slot="x"` attribute on its children whose `x` is not in
the declared list emits `udc-slot-undeclared`. The rule respects the
trust/strict-mode escalation. UDCs that declare no slots opt out
(legacy behaviour), so adopting the rule is incremental.

---

## Strict Default

`appGlobals.strictUdcSandbox` defaults to
**`true`** at the three host bindings. The flip is safe because:

- `buildScopeGate()` and `validateUdcPropReferences()` only fire when
  the UDC declares a contract; UDCs with no `<Prop>` block stay on
  PASS_THROUGH gates regardless of strict mode.
- The capability gate only escalates when a missing capability is
  *also* declared as required by the contract.
- No in-repo UDC has opted into the contract surface yet, so the
  production app surface is unchanged.

Authors who need the legacy warn-only behaviour during migration set
`appGlobals.strictUdcSandbox={false}` on `<App>`.

---

## Cross-References

- **End-user docs page:** [`website/content/docs/pages/managed-react/udc-sandbox.md`](../../../website/content/docs/pages/managed-react/udc-sandbox.md)
- **Related chapter:** [`11-user-defined-components.md`](11-user-defined-components.md) — UDC semantics outside the sandbox
- **Related chapter:** [`19-inspector-debugging.md`](19-inspector-debugging.md) — how `pushXsLog` powers Inspector panels

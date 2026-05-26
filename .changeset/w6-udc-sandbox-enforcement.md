---
"xmlui": patch
---

UDC sandbox: ship runtime enforcement for scope, capabilities, and trust modes (plan #14 W6-1, W6-2, W6-3).

Managed-React UDCs whose `<Component>` root carries a non-empty
`UdcContract` (i.e., declares any `<Prop>`, `<Event>`, `<Method>`,
or `<Slot>` block) now run inside a real security boundary:

- **Scope gate (W6-1):** parent globals are filtered against the
  contract via `buildScopeGate()`; out-of-contract reads emit a
  `udc-scope-leak` diagnostic (warn by default; error in strict
  mode). With `App.appGlobals.strictUdcSandbox: true`, leak reads
  throw `UdcScopeError`.
- **Capability gate (W6-2):** all `App.*`, `Clipboard`, `navigate`,
  and `Log` reads (whether bare identifier or member access) pass
  through `assertCapability()`. Missing capabilities emit
  `udc-capability-missing` and throw `UdcCapabilityError` in
  strict mode. Call-site `capabilities=` narrowing is enforced
  through `narrowCapabilities()` and emits
  `udc-capability-undeclared` when a parent tries to widen.
- **Trust modes (W6-3):** `trust="untrusted"` interacts with the
  new `App.appGlobals.udcTrust` switch (`"open"` / `"review"` /
  `"strict"`). Review and strict modes emit
  `udc-untrusted-violation` per missing declaration and per
  implicit-capability set. Manifest comparison
  (`compareManifest()`) emits `udc-manifest-mismatch` with a
  normalized JSON diff when a deployed UDC drifts from its
  pinned `udc.manifest.json`.

Also ships a new CLI: `node xmlui/scripts/cli/udc-audit.ts [dir]`
walks `.xmlui` sources, prints every UDC's trust posture and
declared capabilities, and supports `--fail-on-untrusted` for CI
gating. Add `--format json` for machine-readable output.

UDCs that ship no declaration blocks are unchanged — the contract
is empty and the gates short-circuit, preserving existing
behavior.

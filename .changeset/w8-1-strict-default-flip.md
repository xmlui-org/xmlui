---
"xmlui": patch
---

W8-1 (targeted): flip strict-mode defaults from `false` to `true` for the two plans whose remaining work is documentation/UI only.

- Plan #03 (Reactive cycle detection): `appGlobals.strictReactiveGraph` now defaults to `true`. Detected reactive cycles emit `error`-severity traces and a one-shot `toast.error()` per cycle unless apps explicitly set `strictReactiveGraph: false`.
- Plan #16 (Concurrent-state determinism): `appGlobals.strictDeterminism` now defaults to `true`. The handler scheduler defaults to `"fifo"` mode with deterministic per-trace ordering; reorder/convergence diagnostics escalate to errors. Set `strictDeterminism: false` (or `scheduler: "concurrent"` explicitly) to restore the previous behavior.

Other strict switches (`strictConcurrency`, `strictTheming`, `strictForms`, `strictI18n`, `strictRouting`, `strictLifecycle`, `strictVersioning`, `strictTypeContracts`, `strictAccessibility`, `strictAuditLogging`, `strictUdcSandbox`) remain at `false` pending the rest of their plan phases.

---
"xmlui": patch
---

W6-7 (Plan #03 Reactive Cycle Detection — Phase 2 enforcement).

Builds on the W2-7 warn-only probe with three new enforcement surfaces:

- **Runtime (Step 3.2):** when `appGlobals.strictReactiveGraph === true`,
  `warn`-severity cycle hits in `AppContent` escalate to `severity:"error"`,
  fire a `console.error`, and surface a single dismissable `toast.error()`
  per cycle id (`info`-severity / pure-conditional cycles never toast).
- **LSP (Step 3.3):** new
  `xmlui/src/language-server/services/reactive-cycle-diagnostic.ts`
  exports `getReactiveCycleDiagnostics(component)`; the existing
  `getDiagnostics()` pipeline calls it after the parse + analyzer step.
  Cycles surface as `DiagnosticSeverity.Warning` (or `Information` for
  conditional cycles) with `code:"reactive-cycle"` and
  `source:"xmlui-reactive-graph"`.
- **Vite plugin (Step 3.4):** `vite-xmlui-plugin` gained an opt-in
  `reactiveCycles?: "off" | "warn" | "strict"` option (default `"warn"`,
  or `"strict"` when `analyze: "strict"`). Per-file cycle analysis runs
  inside `transform`; cycles emit `this.warn(...)` (or `this.error(...)`
  in strict mode, failing the build), with session-scoped dedupe by
  cycle hash. Cross-file `buildEnd` pass is left as a follow-up.

Tests: `tests/language-server/services/reactive-cycle-diagnostic.test.ts`,
`tests/nodejs/vite-plugin.reactive-cycle.test.ts` (9 new tests).

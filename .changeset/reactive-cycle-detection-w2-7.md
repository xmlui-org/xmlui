---
"xmlui": patch
---

Add reactive cycle detection (warn-only probe — Plan #03 Phase 1). On app
startup, the runtime now statically analyses the dependency graph between
`var` declarations, code-behind `function`s, and `DataSource` / `APICall`
loaders and reports any closed loops as a `kind:"reactive-cycle"` Inspector
trace entry plus a single `console.warn` per unique cycle. Detection is
warn-only by default; setting `App.appGlobals.strictReactiveGraph: true`
escalates each cycle to `console.error`. The detector never throws and never
blocks rendering.

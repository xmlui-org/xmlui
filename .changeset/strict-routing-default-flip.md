---
"xmlui": patch
---

**Plan #10 Step 4.2 — `strictRouting` default flipped to `true`.**

`appGlobals.strictRouting` now defaults to `true`. Defended-routing
diagnostics (`constraint-rejected`, `unknown-constraint`,
`duplicate-constraint`, `non-canonical-url`, `guard-bypass-attempt`)
escalate from warn-severity traces to errors, and the `nonCanonicalUrl`
policy defaults to `"redirect"` rather than `"warn"`. Apps that need
the previous warn-only behaviour can opt out:

```jsonc
{ "appGlobals": { "strictRouting": false } }
```

This closes plan #10 (`xmlui/dev-docs/plans/10-defended-routing.md`).

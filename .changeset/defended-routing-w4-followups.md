---
"xmlui": patch
---

**Defended routing — Plan #10 W4 follow-ups.**

- Custom route constraints now fall back to the forms validator registry
  (`App.registerValidator`). Unknown names emit a `unknown-constraint`
  diagnostic and fall back to `string`; thrown exceptions and `Promise`
  returns are treated as `constraint-rejected` (routing is sync-only).
- Same-origin anchor and GET-form interception is available as opt-in via
  `appGlobals.interceptExternalNavigation: true`. When enabled,
  `<a href>` clicks and `<form>` submissions route through
  `appContext.navigate()` so the `willNavigate` guard, page guards, and
  navigation traces observe them. Cross-origin links, modifier-key
  clicks, `target≠_self`, `download`, `rel=external`, non-GET forms, and
  `data-xmlui-bypass-router` opt-outs are passed through.
- Documented `appGlobals` for defended routing in `standalone.ts`,
  added a diagnostic-code reference and custom-constraint section to
  `dev-docs/guide/13-routing.md` and `.ai/xmlui/routing.md`, and shipped
  a user-facing `Defended Routing` docs page on the website.

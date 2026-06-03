---
"xmlui": patch
---

Cooperative concurrency: ship `App.cancel()` global for aborting tracked
handlers, propagate `appGlobals.strictConcurrency` to timeout enforcement
(escalates `concurrency-handler-timeout` to error trace + `console.error`
+ `signError`), and add docs (dev-guide chapter, AI reference, and
user-facing website page).

---
"xmlui": patch
---

Forms: add `<Form csrfToken>` and `<Form idempotencyKey>` props. When set, the built-in submit handler attaches them as the `X-CSRF-Token` and `Idempotency-Key` headers (header names override via `appGlobals.csrfHeaderName` / `appGlobals.idempotencyHeaderName`). Custom `onSubmit` handlers can read the values through new context variables `$formCsrfToken`, `$formIdempotencyKey`, `$formHeaders`, and the per-attempt `AbortSignal` via `$formCancel.signal`. Setting `appGlobals.requireFormCsrf = true` makes mutating submits without a token emit the `csrf-token-missing` diagnostic (escalated under `strictForms`).

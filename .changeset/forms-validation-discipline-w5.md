---
"xmlui": patch
---

Forms validation discipline (plan #09, W5-1..W5-4):

- New validator registry (`components-core/forms/`): `registerValidator`, `lookupValidator`, `hasValidator`, `runValidator`. Sync + async support, parameterised, multi-validator chains; nine builtins ship and auto-register (`required`, `email`, `url`, `phone`, `numericRange`, `integer`, `isoDate`, `length`, `strongPassword`).
- New `appGlobals.strictForms` flag (default `false`) controls diagnostic severity (warn vs error). New `kind:"forms"` trace entries with codes `unknown-validator`, `duplicate-validator`, `server-error-unmapped`, `submit-while-busy`, `csrf-token-missing`, `validator-throw`, `deprecated-alias`.
- `<FormItem>` gains `validator`, `validatorParams`, `validatorInvalidMessage`, `validatorInvalidSeverity`. The legacy `pattern` / `patternInvalidMessage` / `patternInvalidSeverity` are aliased (one-shot `deprecated-alias` warn per name).
- `App.registerValidator()` exposed for custom validators from markup.
- New experimental `<FormValidator>` component for cross-field validation. Validators self-register via `FormValidatorRegistryContext`, run after `preValidate`, first-failure-wins, and surface per-field / general errors through the existing `BACKEND_VALIDATION_ARRIVED` action.
- `<Form>` submit catch path now extracts RFC 7807 / Spring / Laravel / legacy `GenericBackendError` validation problems and maps them to per-field or general errors; unknown field names emit `server-error-unmapped`. New `submitError(error, problem)` event.
- New `submitPolicy` prop on `<Form>` (`single-flight` default, `drop-while-running`, `queue` reserved). Dropped submits emit `submit-while-busy` and fire the new `submitDropped(reason)` event. New `Form.cancel()` API aborts the per-submit `AbortController` (cooperative — handlers must observe `$cancel`).

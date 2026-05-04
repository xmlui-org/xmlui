---
"xmlui": patch
---

Add structured exception model skeleton (plan #07 Step 0): `components-core/errors/` module with `AppError` class, `RetryPolicySpec`/`CircuitBreakerSpec` types, `ErrorDiagnostic` type; `strictErrors` and `errorCorrelationIdHeader` appGlobals keys documented; `kind:"errors"` registered in the Inspector trace.

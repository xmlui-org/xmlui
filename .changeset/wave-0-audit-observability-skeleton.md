---
"xmlui": patch
---

Add audit-grade observability skeleton (plan #15 Step 0): `components-core/audit/` module with `AuditPolicy`, `RedactionRule`, `SamplingRule`, `RetentionRule`, `SinkConfig`, pass-through `redact`/`sample` stubs, W3C `TraceContext` correlation stubs, and no-op sink factories; `strictAuditLogging` appGlobals key documented; `kind:"audit"` registered in the Inspector trace.

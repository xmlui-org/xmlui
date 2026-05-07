---
"xmlui": patch
---

Add component metadata `audit` classification flag (W3-5 / Plan #15 Step 2.1): extends `PropertyDef` with an `audit` field (including `fieldPolicies` for per-key object overrides), annotates `TextBox.initialValue`, `PasswordInput.initialValue`, `APICall.headers`, and `Form.data` with their PII classifications, and adds `buildBaselineRules()` to the audit redactor to derive baseline `RedactionRule[]` from component metadata.

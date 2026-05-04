---
"xmlui": patch
---

Wave 1 — Build-validation analyzer: identifier + expression + cross-binding rules

Adds Phase 1 analyzer rules (`id-unknown-component`, `id-unknown-prop`, `id-unknown-event`) that validate component tags, attribute names, and event handlers against the component registry and component metadata. Adds Phase 2 expression rules (`expr-dead-conditional`, `expr-handler-no-value`) that detect literal/tautological conditions and bare identifier event handlers. Adds Phase 3 stubs (`id-undefined-component-ref`, `id-undefined-form-ref`) for cross-binding validation. Adds `_utils.ts` with shared helpers (Levenshtein distance, closest-match, walkComponentDef, framework/behavior prop allow-lists). Adds `getComponentNames()` to `ComponentRegistry`. See `dev-docs/plans/13-build-validation-analyzers.md`.

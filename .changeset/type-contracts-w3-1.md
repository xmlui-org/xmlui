---
"xmlui": patch
---

Type-contract scaffolding (Wave 3-1). Adds the `strictTypeContracts`
appGlobals switch (default `false`), the new `components-core/type-contracts/`
module (`TypeContractDiagnostic`, `verifyComponentDef()` skeleton), refined
`PropertyValueType` members (`integer`, `color`, `length`, `url`, `icon`,
`id-ref`), the unified `coercionRules` decision table shared by the verifier
and the runtime extractor, and the `asInteger` / `asColor` / `asLength` /
`asUrl` / `asIcon` helpers on `ValueExtractor`. No existing behaviour
changes.

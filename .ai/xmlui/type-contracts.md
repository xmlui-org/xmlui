# Type Contracts

Verified type contracts check parsed `ComponentDef` trees against component metadata. The verifier lives in `xmlui/src/components-core/type-contracts/` and is intentionally pure: callers decide whether diagnostics become LSP warnings, Vite warnings/errors, or runtime trace entries.

## Surfaces

- LSP: `xmlui-type-contract` diagnostics are added in `language-server/services/diagnostic.ts`.
- Vite: `viteXmluiPlugin({ typeContracts: "off" | "warn" | "strict" })` checks parsed `.xmlui` files and summarizes diagnostics in `buildEnd`.
- Runtime: expression-valued props are checked after resolution by `emitRuntimeTypeContractDiagnostics()` from `ComponentAdapter`.

## Strict Mode

`App.appGlobals.strictTypeContracts` defaults to `true`. Set it to `false` to keep rollout-style warnings while migrating an older app. In strict mode, error-capable diagnostics escalate from `warn` to `error`; deprecated props remain warnings.

## Diagnostic Codes

| Code | Cause | Strict behavior |
|---|---|---|
| `unknown-component` | Component is absent from the registry | error |
| `unknown-prop` | Prop is not declared in component metadata | error |
| `wrong-type` | Literal or resolved value fails `valueType` | error |
| `missing-required` | Required prop is absent | error |
| `value-not-in-enum` | Value is outside `availableValues` | error |
| `unknown-event` | Event is not declared in metadata | error |
| `unknown-exposed-method` | Method reference targets an undeclared API | error |
| `deprecated-prop` | Prop has `deprecationMessage` | warn |

## Rules

- `availableValues` takes precedence over `valueType`.
- Static verification skips expression-valued props; runtime warning mode handles them.
- Keep coercion and verification aligned through `coercionRules`.
- Do not add ad hoc per-component validators; refine the component metadata instead.

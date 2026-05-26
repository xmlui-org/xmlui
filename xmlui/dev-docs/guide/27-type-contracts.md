# Type Contracts

XMLUI component metadata is now an enforceable contract. The same metadata that powers documentation and editor completions is used to warn about unknown props, missing required props, invalid enum values, wrong literal value types, and deprecated props.

## Verification Pipeline

The pure verifier in `components-core/type-contracts/` accepts a parsed `ComponentDef` tree and a component metadata registry. It produces stable `TypeContractDiagnostic` objects; it does not log, throw, or import React.

The verifier is surfaced in three places:

- The language server emits `xmlui-type-contract` diagnostics in the Problems panel.
- The Vite plugin exposes `typeContracts: "off" | "warn" | "strict"` and prints a build summary by diagnostic code.
- Runtime warning mode checks expression-valued props after they resolve and emits `kind: "type-contract"` trace entries.

## Value Rules

`PropertyValueType` includes the refined values `integer`, `color`, `length`, `url`, `icon`, and `id-ref`. The verifier and runtime value extraction share the `coercionRules` table so accepted values do not drift between build-time and runtime.

When `availableValues` is present, it is authoritative and checked before the broader `valueType`.

## Strict Mode

`App.appGlobals.strictTypeContracts` defaults to `true`. Set it to `false` to keep rollout-style warnings while migrating an older app. Strict mode escalates unknown props, wrong types, missing required props, invalid enum values, unknown events, and unknown methods to errors. Deprecation diagnostics remain warnings.

## Example

```xml
<Button labe="Save" variant="vibrant" />
```

This produces:

- `unknown-prop` with a suggestion for `label`
- `value-not-in-enum` for `variant`

```xml
<NumberBox initialValue="{state.value}" />
```

If `state.value` resolves to a non-number at runtime, XMLUI emits one `type-contract` trace entry per component, prop, code, and value.

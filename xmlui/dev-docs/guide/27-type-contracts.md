# Type Contracts

Type contracts turn XMLUI component metadata into an enforceable interface.
The same metadata that powers generated docs and editor completions is also
used to detect unknown props, missing required props, invalid enum values,
wrong literal value types, unknown events, and deprecated props.

This guide is for framework developers. If you are changing metadata, the
parser, the rendering pipeline, the Vite plugin, or component prop extraction,
this is the document that explains where contract checks happen and which part
of the pipeline owns each decision.

## Mental Model

XMLUI has two moments when it can verify a component contract:

1. **Before rendering, after markup is parsed.** At this point XMLUI has a
   `ComponentDef` tree and component metadata, but expression-valued props such
   as `value="{state.count}"` have not been evaluated yet. This is the static
   verifier path used by the language server and Vite plugin.
2. **During component rendering, once expressions can be resolved.** At this
   point `ComponentAdapter` has the current component instance, the current
   state, the component metadata descriptor, and a `ValueExtractor`. It
   registers a post-commit runtime diagnostic effect for expression-valued
   props.

The split is intentional. Static verification catches mistakes that are visible
from the markup alone. Runtime verification catches values that only become
known after XMLUI evaluates reactive expressions.

```text
.xmlui source
  |
  v
XMLUI parser
  |
  v
ComponentDef tree
  |
  +--> verifyComponentDef()
  |      |
  |      +--> Language server diagnostics
  |      |
  |      +--> Vite warnings/errors
  |
  +--> renderChild()
         |
         v
       ComponentAdapter
         |
         v
       ValueExtractor resolves expressions
         |
         v
       emitRuntimeTypeContractDiagnostics()
         |
         v
       Inspector trace + optional toast
```

## Core Files

| File | Role |
|---|---|
| `xmlui/src/components-core/type-contracts/verifier.ts` | Pure static verifier. Walks a `ComponentDef` tree and returns diagnostics. |
| `xmlui/src/components-core/type-contracts/runtime.ts` | Runtime checker for expression-valued props after they resolve in `ComponentAdapter`. |
| `xmlui/src/components-core/type-contracts/diagnostics.ts` | Diagnostic code and payload types. |
| `xmlui/src/components-core/type-contracts/rules/coerce.ts` | Shared value-verification and coercion table. |
| `xmlui/src/components-core/type-contracts/rules/*` | Refined value rules such as `integer`, `color`, `length`, `url`, `icon`, and `id-ref`. |
| `xmlui/src/components-core/type-contracts/suggestions.ts` | Levenshtein helper for `unknown-prop` suggestions. |
| `xmlui/src/language-server/services/type-contract-diagnostic.ts` | LSP adapter from type-contract diagnostics to `vscode-languageserver` diagnostics. |
| `xmlui/src/nodejs/vite-xmlui-plugin.ts` | Build-time integration and diagnostic summary. |
| `xmlui/src/components-core/rendering/ComponentAdapter.tsx` | Runtime integration point for expression-valued props. |

The verifier is deliberately independent from React, logging, file I/O, and the
inspector. It accepts a parsed tree plus a metadata registry and returns a flat,
sorted list of `TypeContractDiagnostic` objects. Callers decide whether those
diagnostics become editor problems, build warnings, build errors, trace entries,
console errors, or toasts.

## Static Verification

Static verification is handled by `verifyComponentDef()` in
`components-core/type-contracts/verifier.ts`.

Inputs:

- A root `ComponentDef`.
- A `ReadonlyMap<string, ComponentMetadata>` registry.
- `VerifyOptions`, currently `strict` and `skipUnknown`.

Output:

- A flat array of `TypeContractDiagnostic` objects sorted by source range.

The verifier walks the whole component tree recursively. For each node it:

1. Looks up `node.type` in the metadata registry.
2. Checks required props declared with `isRequired`.
3. Checks every literal prop against component metadata.
4. Allows layout props and responsive layout variants even though they are not
   declared per component.
5. Checks deprecated props and emits warning-level diagnostics.
6. Checks event names against `metadata.events`.
7. Recurses into children.

Expression-valued props are skipped for type and enum checks because their
actual value is not known yet:

```xml
<NumberBox initialValue="{state.quantity}" />
```

The string contains a binding expression, so the static verifier does not guess
whether `state.quantity` will resolve to a number. That check belongs to the
runtime path.

### What Static Verification Catches

```xml
<Button labe="Save" variant="vibrant" />
```

If `Button` metadata declares `label` and a finite set of `variant` values, the
static verifier reports:

- `unknown-prop` for `labe`, with a suggestion for `label` when the edit
  distance is close enough.
- `value-not-in-enum` for `variant` if `"vibrant"` is not declared in
  `availableValues`.

```xml
<Form onSubmitt="submit()" />
```

If the component metadata declares `submit` but not `submitt`, the verifier
reports `unknown-event`.

```xml
<Image />
```

If `Image` metadata marks `src` as required, the verifier reports
`missing-required`.

### Static Verification Boundaries

The verifier does not execute expressions, import React, call component
renderers, inspect the DOM, or instantiate containers. It also does not make
network calls or read files. That purity matters because the same function runs
in editor tooling, build tooling, tests, and any future CLI surfaces.

Unknown components can be skipped by passing `skipUnknown: true`. The LSP and
Vite integration currently do this because unknown-component diagnostics are
also handled by the broader analyzer pipeline.

## Language Server Surface

The language server calls the static verifier from
`language-server/services/type-contract-diagnostic.ts`.

Pipeline:

1. The language server parses the `.xmlui` document into a `ComponentDef` or
   `CompoundComponentDef`.
2. It unwraps compound definitions to the root component when needed.
3. It calls `verifyComponentDef(root, metadataProvider.componentMetadataMap(),
   { strict, skipUnknown: true })`.
4. It maps each `TypeContractDiagnostic` to a `vscode-languageserver`
   `Diagnostic`.
5. When a diagnostic has a suggestion, the replacement hint is stored in the
   diagnostic `data` field.

The result appears in the editor Problems panel with source
`xmlui-type-contract`.

## Vite Build Surface

The Vite plugin calls the static verifier after XMLUI parsing in
`xmlui/src/nodejs/vite-xmlui-plugin.ts`.

The plugin option is:

```ts
viteXmluiPlugin({
  typeContracts: "off" | "warn" | "strict",
});
```

Behavior:

- `"off"` disables the type-contract pass.
- `"warn"` runs the verifier and emits Vite warnings.
- `"strict"` runs the verifier and fails the build on error-severity contract
  violations.

At build end the plugin prints a summary grouped by diagnostic code. This is
useful in CI because individual warnings can scroll away in a large build log.

Static Vite checks happen before React rendering. They only know the parsed
definition tree and metadata. They do not have component state, loader results,
form state, or resolved expression values.

## Runtime Rendering Surface

Runtime checks happen in `ComponentAdapter`, after the rendering pipeline has
enough information to evaluate expression-valued props.

The relevant setup order inside `ComponentAdapter` is:

1. Create the `ValueExtractor` with current state, app context, reference-tracked
   APIs, variables, function dependencies, and UDC evaluation options.
2. Look up the component renderer and metadata descriptor through
   `ComponentRegistry`.
3. Register a React effect that calls `emitRuntimeTypeContractDiagnostics()`
   with the current `ComponentDef`, metadata descriptor, `ValueExtractor`, app
   context, and component UID.
4. Continue normal renderer-context assembly, renderer invocation, behavior
   attachment, theme classes, and API-bound wrapping.

React runs the diagnostic effect after the render commits. That timing is
important: runtime type-contract checks are observability and developer-feedback
diagnostics, not a pre-render guard. They do not prevent the renderer from being
called and they do not replace component-level defensive handling.

The runtime checker only examines props whose raw markup value contains a
binding expression. For each expression-valued prop it:

1. Looks up the prop metadata.
2. Resolves the prop with `extractValue(rawValue, true)`.
3. Checks `availableValues` first, then `valueType`.
4. Emits a `kind: "type-contract"` inspector trace entry if the resolved value
   violates the contract.
5. Deduplicates by component UID, prop, diagnostic code, and actual value so a
   reactive re-render does not spam the inspector with identical diagnostics.
6. In strict mode, also writes a console error and shows a one-shot toast.

Example:

```xml
<NumberBox initialValue="{state.quantity}" />
```

If `state.quantity` later resolves to `"many"`, the runtime checker reports a
`wrong-type` diagnostic for `initialValue`.

Runtime type-contract checks are diagnostic. They do not block the renderer call
or coerce the value on behalf of the component. Components still receive values
through the normal `ValueExtractor` and component renderer path.

## Relationship to Value Extraction

Type contracts and value extraction share the same rule table so that accepted
values stay aligned across static verification, runtime diagnostics, and
component prop extraction.

The important file is `components-core/type-contracts/rules/coerce.ts`.

- `verifyValue()` answers "does this value satisfy the metadata contract?"
- `coerceValue()` performs the coercion used by extraction paths.
- `coercionRules` is the shared table that keeps the two operations in sync.

When adding a new `PropertyValueType`, update the shared rules rather than
adding one-off checks in the verifier or in a component renderer.

## Value Rules

`PropertyValueType` includes broad types like `string`, `number`, `boolean`,
and `any`, plus refined values such as:

- `integer`
- `color`
- `length`
- `url`
- `icon`
- `id-ref`
- `hash` (`Record<string, any>`)

When `availableValues` is present, it is authoritative and checked before the
broader `valueType`. This produces more helpful diagnostics. For example, a
button variant outside the allowed set should report `value-not-in-enum`, not a
generic string-type success.

## Strict Mode

`App.appGlobals.strictTypeContracts` defaults to `true`.

Set it to `false` when migrating an older app and you want warnings instead of
errors while you clean up markup.

Strict mode escalates these diagnostics to errors:

- `unknown-component`
- `unknown-prop`
- `wrong-type`
- `missing-required`
- `value-not-in-enum`
- `unknown-event`
- `unknown-exposed-method`

Deprecation diagnostics remain warnings because deprecated APIs are still valid
during their migration window.

The Vite plugin also has its own `typeContracts` option. Treat that as the
build-time policy and `strictTypeContracts` as the app/runtime policy. In a
strict CI setup, use `typeContracts: "strict"` so invalid markup fails before it
ships.

## Diagnostic Codes

| Code | Cause | Typical surface |
|---|---|---|
| `unknown-component` | Component type is absent from the registry. | Analyzer/static verifier, depending on caller options |
| `unknown-prop` | Prop is not declared in component metadata and is not a layout prop. | LSP, Vite |
| `wrong-type` | Literal or resolved value fails `valueType`. | LSP/Vite for literals, runtime for expressions |
| `missing-required` | Required prop is absent. | LSP, Vite |
| `value-not-in-enum` | Literal or resolved value is outside `availableValues`. | LSP/Vite for literals, runtime for expressions |
| `unknown-event` | Event is not declared in component metadata. | LSP, Vite |
| `unknown-exposed-method` | Method reference targets an undeclared component API. | Static surfaces |
| `deprecated-prop` | Prop has `deprecationMessage`. | LSP, Vite |

## Authoring Metadata for Contracts

The checker can only enforce what metadata declares. When adding or changing a
component:

1. Declare every public prop in component metadata.
2. Mark truly required props with `isRequired`.
3. Use the narrowest useful `valueType`.
4. Prefer `availableValues` for finite option sets.
5. Add `deprecationMessage` when keeping a legacy prop during migration.
6. Declare public events in `events`.
7. Keep renderer-side extraction consistent with metadata.

Avoid ad hoc validator logic in individual components when the rule belongs in
metadata. Component-specific runtime validation is still appropriate for
semantic constraints that metadata cannot express, but basic shape, type, enum,
and presence checks should live in the contract.

## Debugging Checklist

When a contract check appears missing or surprising:

1. Confirm the component has metadata and is registered under the same type name
   used in the markup.
2. Check whether the prop is a literal or an expression. Literal values are
   static; expression values are runtime.
3. Check whether the prop is a layout prop. Layout props are globally allowed
   even if absent from component metadata.
4. Check whether the component sets `allowArbitraryProps`.
5. Check `availableValues` before `valueType`; enum diagnostics intentionally
   win.
6. Check the relevant strictness switch:
   `typeContracts` for Vite, `strictTypeContracts` for app/runtime behavior.
7. For runtime diagnostics, check the Inspector for `kind: "type-contract"`.

## Testing

Focused tests live under:

- `xmlui/tests/components-core/type-contracts/`

The most useful test layers are:

- Pure verifier tests for tree walking and diagnostic codes.
- Rule tests for refined value types and coercion consistency.
- Runtime tests for expression-valued props and inspector trace emission.

When changing a component's metadata, also consider whether generated metadata,
docs, language-server behavior, or Vite diagnostics need updated tests.

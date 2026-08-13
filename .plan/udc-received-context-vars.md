# UDC Received Context Variables

> Status: implemented.
> Scope: let user-defined components explicitly receive selected runtime context variables, including variables injected by container components such as `Table`/`Column`.

## Feasibility Verdict

This can work, but only as an explicit contract. The current runtime already proves the idea in a narrow form: `CompoundComponent` forwards a hardcoded set of context variables (`$item`, `$itemIndex`, `$isFirst`, `$isLast`, `$context`) through the user-defined component boundary.

The requested `RedColumn` case needs a generalized version of that behavior for `$cell`. It also needs slot-aware propagation, because `<Slot />` renders caller-provided children through `parentRenderContext.renderChild`, not through the UDC body scope alone.

## Proposed Public API

Use a definition-level attribute on `<Component>`:

```xml
<Component name="RedColumn" receivesContextVars="$cell, $row, $rowIndex">
  <Column bindTo="{$props.bindTo}">
    <Stack backgroundColor="red">
      <Slot />
    </Stack>
  </Column>
</Component>
```

Then this should render the cell values:

```xml
<RedColumn bindTo="name">
  <Text>{$cell}</Text>
</RedColumn>
```

Definition-level is the safest initial surface because the component author controls which ambient variables the UDC relies on. A later call-site narrowing attribute could be added separately if needed.

Supported forms:

- `<Component receivesContextVars>` means boolean `true`: receive all available context variables.
- `receivesContextVars="true"` and `receivesContextVars="{true}"` also receive all available context variables.
- `receivesContextVars="false"` and `receivesContextVars="{false}"` opt out of any newly declared received variables.
- `receivesContextVars="$cell"` receives a single context variable.
- `receivesContextVars="$cell, $rowIndex"` receives a comma-separated list. Each named context variable must include its leading `$`.

Do not support `receivesContextVars="*"`. Use boolean `true` for the all-context case so wildcard semantics do not become a second spelling.

## Compatibility Contract

- UDCs without `receivesContextVars` keep the current isolation behavior.
- Existing hardcoded propagation stays intact for compatibility.
- Received vars are opt-in and copied only when they exist in the caller's current `RendererContext.contextVars`.
- Received vars are context variables only: require `$name` syntax, reject non-context names, and never allow reserved UDC locals such as `$props`.
- UDC local vars and framework-provided locals keep precedence over received context vars.
- Slot props keep precedence over received context vars when both provide the same `$name`, because slot props are the current explicit bidirectional data-flow mechanism.

## Current Code Path

- `ColumnReact` renders custom cell children through `MemoizedItem` with `$item`, `$row`, `$itemIndex`, `$rowIndex`, `$colIndex`, and `$cell`.
- `ComponentAdapter` extracts `$`-prefixed keys from the current state into `RendererContext.contextVars`.
- `CompoundComponent` receives those context vars but currently filters them through `PROPAGATED_CONTEXT_VARS`.
- `CompoundComponent` builds the synthetic UDC `Container` and passes a `ParentRenderContext` to support slots.
- `slotRenderer` uses `parentRenderContext.renderChild(...)` for transposed slot content, so UDC-received context vars must be carried into that slot render path too.

## Data Model Changes

Add `receivesContextVars?: boolean | readonly string[]` to `CompoundComponentDef`.

Extend `UdcContract` with the same information:

```ts
receivesContextVars?: boolean | ReadonlySet<string>;
```

Also extend serialized UDC manifest contracts so packaged UDCs can detect drift:

```ts
receivesContextVars?: boolean | string[];
```

Parser normalization:

- Treat a key-only attribute, `"true"`, and `"{true}"` as `true`.
- Treat `"false"` and `"{false}"` as boolean `false`.
- Split comma-separated strings.
- Trim whitespace.
- Require every named context variable to include its leading `$`.
- Prefix `$` when omitted, matching the existing slot `provides` parser behavior.
- Deduplicate while preserving set semantics.
- Reject empty values, invalid identifiers, arbitrary expressions, wildcard `"*"`, and reserved/local names such as `$props`, `$self`, `$this` with parser diagnostic `T033`.

## Runtime Design

In `CompoundComponent`:

1. Rename the current hardcoded list to `LEGACY_PROPAGATED_CONTEXT_VARS`.
2. Build `receivedContextVars` from:
   - the legacy list, for compatibility
   - `compound.receivesContextVars`
   - `effectiveContract.receivesContextVars`
   - or all available context variables when the declaration is `true`
3. Copy only those keys from `RendererContext.contextVars`.
4. Merge the copied values into the UDC synthetic container vars after `$props` but before UDC-local `vars`.
5. Pass the copied values into `buildScopeGate(...)` so strict UDC sandboxing allows reads of declared received vars.
6. Add the copied values and the receive specification to the `ParentRenderContext` created for slots, because container components such as `Column` can introduce `$cell` after the UDC instance is initially rendered.

In slot rendering:

1. Extend `ParentRenderContext` with optional `contextVars?: Record<string, any>`.
2. Extend `SlotItem` so it can merge already-prefixed context vars with slot props.
3. For default and named slot content, wrap parent-provided content whenever either slot props or received context vars are present.
4. Merge order inside the slot wrapper should be:
   - received context vars
   - slot props converted to `$propName`

This lets slot content still render in the caller's scope while also seeing the UDC's explicitly received runtime context.

## Parser And Build-System Touch Points

- `xmlui/src/abstractions/ComponentDefs.ts`
  Add the new `CompoundComponentDef` field and update `ParentRenderContext`.

- `xmlui/src/parsers/xmlui-parser/transform.ts`
  Parse `receivesContextVars` in `collectCompoundComponent()` and attach it to the `CompoundComponentDef`. Include it in the generated `contract` only when the component already declares a UDC contract through declarations, capabilities, or trust; `receivesContextVars` alone must not activate scope-contract enforcement.

- `xmlui/src/components-core/udc-sandbox/contract.ts`
  Add the contract field and parsing/serialization support.

- `xmlui/src/components-core/udc-sandbox/scope.ts`
  Treat declared received context vars as allowed UDC boundary reads.

- `xmlui/src/components-core/udc-sandbox/manifest.ts`
  Include `receivesContextVars` in `serializeContract()` and manifest comparison normalization.

- `xmlui/src/components-core/CompoundComponent.tsx`
  Replace hardcoded propagation with declaration-driven filtering and pass received vars into the slot parent context.

- `xmlui/src/components-core/rendering/ComponentAdapter.tsx`
  Update `slotRenderer()` to use received parent context vars when rendering slot content, and to collect current context vars from the slot render site according to the parent's receive specification.

- `xmlui/src/components/SlotItem.tsx`
  Support both prefixed context vars and slot prop conversion without breaking existing slot behavior.

- `xmlui/src/parsers/xmlui-parser/xmlui-serializer.ts`
  Preserve `receivesContextVars` when serializing compound component definitions.

- `xmlui/src/nodejs/vite-xmlui-plugin.ts`
  Audit normalization/stripping paths so the new field is not dropped from built-mode component modules.

## Optimizer Considerations

The optimizer already treats `node.contextVars` and metadata `contextVars` as locally provided injected variables. UDC received variables are different: they are copied from a parent runtime context into the synthetic UDC container.

Implementation should avoid relying on stale `computedUses` in the UDC body. `CompoundComponent` already strips stale top-level `computedUses` when it restructures the body at runtime; tests should prove this remains true when received vars are involved.

Add optimizer coverage for:

- a UDC body reading a received variable directly, such as `<Text>{$cell}</Text>`
- a UDC slot rendering parent content that reads a received variable
- nested UDCs where an inner received `$cell` shadows an outer `$cell`
- no wildcard or accidental parent local variable leakage

## Tests

Unit/parser:

- Parse `<Component receivesContextVars>`, `"true"`, and `"{true}"` into `true`.
- Parse `"false"` and `"{false}"` as a valid empty declaration.
- Parse `<Component receivesContextVars="$cell, $rowIndex">` into `["$cell", "$rowIndex"]`.
- Parse contracts with declarations plus `receivesContextVars`.
- Manifest serialization/comparison includes received context vars.
- Invalid expressions, wildcard, trailing comma, and reserved names are rejected with parser diagnostic `T033`.

Runtime/E2E:

- Regression for the motivating `RedColumn` example with `$cell` in the default slot.
- UDC body direct read works:

```xml
<Component name="CellText" receivesContextVars="$cell">
  <Text>{$cell}</Text>
</Component>
```

- Named slot content receives `$cell`.
- Without `receivesContextVars="$cell"`, the old empty/undefined behavior remains.
- Slot props override received vars when both define the same variable.
- Existing legacy forwarded vars still work without declarations.

Suggested focused commands:

```bash
npm run test:unit -w xmlui -- udc-sandbox
npm run test:unit -w xmlui -- computedUses
npx playwright test xmlui/tests-e2e/compound-component.spec.ts --reporter=line
npx playwright test xmlui/src/components/Table/Table.spec.ts --grep "context variable|custom" --reporter=line
npx tsc --noEmit -p xmlui/tsconfig.json
```

Because this is user-facing framework behavior, add a patch changeset after implementation.

## Implementation Steps

1. Add parser/type support for `CompoundComponentDef.receivesContextVars` and `UdcContract.receivesContextVars`.
2. Add contract serialization/manifest comparison support.
3. Implement runtime filtering in `CompoundComponent`, preserving the legacy propagated list.
4. Extend `ParentRenderContext` and `SlotItem` so transposed slot content can receive the filtered vars.
5. Add parser/unit tests.
6. Add focused E2E regressions for Table/Column custom cells with UDC slots.
7. Run focused unit/E2E/type-check commands.
8. Update UDC and Slot documentation with the new opt-in context variable boundary.
9. Add a patch changeset.

# User-Defined Components (UDCs)

Internal architecture for how `.xmlui`-file components are parsed, registered, and rendered. For user-facing syntax, see `.ai/xmlui/markup.md`.

## Overview

User-defined components (UDCs) are **compound components** — they have a public interface (props, events, slots) and an internal implementation (XMLUI markup). They are rendered through a different pipeline branch than built-in components: `ComponentAdapter` detects `isCompoundComponent === true`, skips behavior application, and delegates to `CompoundComponent`.

## Lifecycle: Definition → Registration → Rendering

```
.xmlui file
  → XML parser (transform.ts: collectCompoundComponent)
  → CompoundComponentDef { name, component: ComponentDef, api?, codeBehind? }
  → createUserDefinedComponentRenderer(metadata, def, codeBehind?)
  → CompoundComponentRendererInfo { compoundComponentDef, metadata }
  → ComponentProvider.registerCompoundComponentRenderer()
  → ComponentRegistryEntry { renderer, isCompoundComponent: true, metadata }
  → ComponentAdapter detects isCompoundComponent → CompoundComponent
```

## Parsing (`transform.ts`)

`collectCompoundComponent()` extracts from `<Component>`:

| Attribute/Child | Target |
|----------------|--------|
| `name="MyComp"` | `CompoundComponentDef.name` |
| `method:methodName="expression"` | `CompoundComponentDef.api` |
| `var:varName="value"` | merged into `nestedComponent.vars` |
| `codeBehind="MyComp.xmlui.xs"` | `CompoundComponentDef.codeBehind` |
| `on*` attributes | `CompoundComponentDef.events` (via `parseEvent`) |
| `<variable>` children | merged into `nestedComponent.vars` |
| Single root element (or multi wrapped in Fragment) | `CompoundComponentDef.component` |

**Name requirement:** Component name must match filename for standalone/buildless mode. Built mode is more relaxed.

**Event attribute parsing:** `onValueChanged` → strips `on`, lowercases first char → stored as `events["valueChanged"]`.

## Code-Behind Scripts (`.xmlui.xs`)

- Declared via `codeBehind` attribute on `<Component>` tag
- Parsed by `collectCodeBehindFromSource()` in `code-behind-collect.ts`
- Returns `CollectedDeclarations { vars, functions, moduleErrors?, hasInvalidStatements? }`
- Merged in `createUserDefinedComponentRenderer()`: code-behind overrides inline definitions

```typescript
// renderers.ts — merge order: inline vars/functions THEN code-behind (code-behind wins)
component.vars = { ...component.vars, ...codeBehind.vars };
component.functions = { ...component.functions, ...codeBehind.functions };
```

## Registration (`ComponentProvider.tsx`)

`registerCompoundComponentRenderer()`:

1. Auto-generates metadata via `generateUdComponentMetadata()`:
   - Walks the component tree collecting `$props.<member>` references → prop names
   - Walks layout property values collecting theme var references → theme vars
2. Merges auto-generated metadata with any explicitly provided metadata
3. Creates renderer function that returns `<CompoundComponent compound={...} api={...} scriptCollected={...} {...rendererContext} />`
4. Registers with `isCompoundComponent: true`

## Rendering Pipeline

### CompoundComponent (`CompoundComponent.tsx`)

React `forwardRef` component. Responsibilities:

1. **Property resolution** — evaluates all props in parent scope via `extractValue`. Arrow functions resolved via `lookupSyncCallback`.
2. **Container assembly** — wraps internal implementation in `{ type: "Container", vars, loaders, functions, api, scriptCollected, children: [componentDef] }`
3. **Implicit variable injection** — adds to container scope:
   - `$props` — resolved property object
   - `emitEvent(eventName, ...args)` — fires parent event handler
   - `hasEventHandler(eventName)` — checks if parent registered a handler
   - `updateState(key, value)` — programmatic state mutation
4. **Parent render context** — created only when parent provides templates or children:
   ```typescript
   { renderChild: parentRenderChild, props: node.props, children: node.children }
   ```
5. **Rendering** — calls `renderChild(containerNode, layoutContext, parentRenderContext)`

### Behavior Skip

```typescript
// ComponentAdapter.tsx — compound components skip the behavior chain
if (!isCompoundComponent) {
  for (const behavior of behaviors) { ... }
}
```

Behaviors (Variant, Tooltip, etc.) apply only to the inner built-in components within the UDC's markup, not to the UDC wrapper itself.

## Slot Transposition

### Slot Types

| Type | Declaration | Parent provides via | Content source |
|------|------------|-------------------|---------------|
| Default (unnamed) | `<Slot />` | Direct children between component tags | `parentRenderContext.children` |
| Named | `<Slot name="headerTemplate" />` | `<property name="headerTemplate">...</property>` | `parentRenderContext.props[templateName]` |

**Named slot constraint:** name must end with `"Template"` suffix. Validated by `slotRenderer()` — non-compliant names render `InvalidComponent`.

### slotRenderer() (`ComponentAdapter.tsx`)

Decision tree:

1. Named slot + parent has template → render parent template with slot props
2. Named slot + no parent template → render default slot children
3. Default slot + parent has children → render parent children (with or without slot props)
4. Default slot + no parent children → render default slot children
5. No content → return `undefined`

### Slot Properties (Bidirectional Data Flow)

Slot props enable component → parent data flow:

```xml
<!-- Component definition -->
<Slot name="itemTemplate" item="{$item}" index="{$index}" />

<!-- Parent usage -->
<MyList>
  <property name="itemTemplate">
    <Text>#{$index}: {$item}</Text>   <!-- $index and $item come from slot props -->
  </property>
</MyList>
```

**Processing:**
1. All props except `name` extracted as slot properties
2. Arrow function props (`_ARROW_EXPR_` marker) resolved via `lookupAction()`
3. Passed to `SlotItem`

### SlotItem (`SlotItem.tsx`)

Wraps slot content in a Container with context variables:

```typescript
// Transforms: { item: "Apple", index: 0 }
// Into:       { type: "Container", contextVars: { $item: "Apple", $index: 0 }, children: [...] }
```

**Memoization:** `React.memo` + `useShallowCompareMemoize` on slot props + `useMemo` on containerized node.

### Scope Model

Three scopes in play during slot transposition:

1. **Parent scope** — parent's variables, IDs, event handlers (used when rendering slot content)
2. **Component scope** — component's `$props`, vars, methods (used when evaluating slot property expressions)
3. **Slot content scope** — parent scope + slot-provided `$` context variables

`parentRenderContext.renderChild` ensures slot content is rendered in parent scope. Slot properties bridge data from component scope to slot content scope.

## Event Emission

```typescript
// CompoundComponent.tsx
const emitEvent = useEvent((eventName, ...args) => {
  const handler = lookupEventHandler(eventName);
  return handler?.(...args);
});
```

- `emitEvent('valueChanged', data)` → looks up handler for `valueChanged` event
- Parent writes `onValueChanged="..."` → parsed as `valueChanged` event → matched

## Component API (Methods)

Declared via `method:` attribute prefix on `<Component>`:

```xml
<Component name="MyGrid" method:getSelectedRows="rows.filter(r => r.selected)">
```

In `Container.tsx`, each method is looked up as an action and registered via `registerComponentApi()`:
- Accessible to parent as `myGridId.getSelectedRows()`
- Accessible internally via `$self` symbol

## Auto-Generated Metadata (`ud-metadata.ts`)

`generateUdComponentMetadata()`:
- Walks component tree, collects all `$props.<member>` references → discovers prop names
- Collects theme var references from layout property values → discovers theme vars
- Returns `ComponentMetadata { status: "stable", description, props, themeVars }`
- Merged with any explicit metadata (explicit wins on overlap)

## Key Files

| File | Purpose |
|------|---------|
| `components-core/renderers.ts` | `createUserDefinedComponentRenderer()` factory |
| `components-core/CompoundComponent.tsx` | Runtime bridge: props, events, container, slots |
| `components-core/rendering/ComponentAdapter.tsx` | `slotRenderer()`, compound detection, behavior skip |
| `components-core/rendering/SlotItem.tsx` | Slot prop → context var transformation |
| `components-core/ud-metadata.ts` | `generateUdComponentMetadata()` auto-introspection |
| `components/ComponentProvider.tsx` | `registerCompoundComponentRenderer()` registration |
| `parsers/xmlui-parser/transform.ts` | `collectCompoundComponent()` XML parsing |
| `parsers/scripting/code-behind-collect.ts` | `.xmlui.xs` code-behind parsing |
| `components-core/rendering/Container.tsx` | API method registration |
| `components-core/state/state-layers.ts` | `mergeComponentApis()` state integration |

## Anti-Patterns

- **Slot name without `Template` suffix** — `<Slot name="header">` fails validation. Must be `<Slot name="headerTemplate">`.
- **Accessing parent variables directly in component implementation** — component scope is isolated. Use `$props` to pass data from parent.
- **Applying behaviors to UDC tag** — behaviors skip compound components. Apply them to the UDC's inner elements instead.
- **Mutating `$props` inside component** — `$props` is a resolved snapshot. Mutations don't propagate back to parent. Use `emitEvent()`.
- **Mismatched filename/component name** — breaks standalone mode component discovery. `ActionBar.xmlui` must contain `<Component name="ActionBar">`.

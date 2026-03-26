# Plan: Auto-Generate Metadata for User-Defined Components

## Problem

Theme variable optimization in `ThemeNative.tsx` filters out CSS variables scoped to specific components, keeping only variables for:
- Base (no-component) variables
- Compound (user-defined) components (`registeredComponent?.isCompoundComponent`)
- Hardcoded exceptions (`Input`, `Heading`, `Footer`)

However, user-defined components registered via `compoundComponents` in `ContributesDefinition` are registered **without metadata** — the call `{ compoundComponentDef: def }` passes no `metadata` field. This means:
1. Their `themeVars` are never collected into `ComponentRegistry.themeVars` (the `Set<string>` used in `ThemeProvider.tsx` to scope which hierarchical variables are resolved).
2. Theme variables like `width-MyComp`, `textColor-md-MyComp`, etc., are not recognized by the optimization pipeline.

The current workaround (`isCompoundComponent` pass-through in ThemeNative) is coarse: it lets *all* compound component variables through, but the hierarchical variable matching in `ThemeProvider.tsx` still doesn't resolve them because they're not in `componentThemeVars`.

## Solution Overview

Auto-generate `ComponentMetadata` for user-defined components by statically analyzing their `CompoundComponentDef` tree. The generated metadata will include:
- `props` — extracted from `$props.<member>` patterns in child expressions
- `themeVars` — extracted from `$<themeVar>` references in layout property string values
- `status` / `description` — fixed values

Then, pass this metadata during registration so `registerComponentRenderer` collects the `themeVars` into the global set, enabling proper theme variable optimization.

---

## Steps

### Step 1: Create the `extractPropsFromExpression` helper

**File**: `xmlui/src/components-core/ud-metadata.ts` (new)

Create a function that walks an `Expression` AST and collects all `$props.<member>` references:

```ts
function extractPropsFromExpression(expr: Expression): string[]
```

- Walk the expression tree recursively.
- When a `MemberAccessExpression` is found where `obj` is an `Identifier` with `name === "$props"`, collect `member`.
- Return deduplicated list of property names.

**Testing**:
- **Unit test file**: `xmlui/tests/components-core/ud-metadata.test.ts`
- Test cases:
  - Simple `$props.foo` → `["foo"]`
  - Nested `$props.bar + $props.baz` → `["bar", "baz"]`
  - No `$props` references → `[]`
  - `$props` used without member access (e.g., just `$props`) → `[]`
  - Deeply nested expressions (conditional, function calls containing `$props.x`) → `["x"]`
  - Optional chaining `$props?.foo` → `["foo"]`

---

### Step 2: Create the `extractThemeVarsFromValue` helper

**File**: `xmlui/src/components-core/ud-metadata.ts`

Create a function that extracts theme variable references from a string value:

```ts
function extractThemeVarsFromValue(value: string): string[]
```

Theme variable references in layout property values follow the pattern `$<themeVar>` where `<themeVar>` matches `[a-zA-Z][a-zA-Z0-9_-]*`. The `$` must be preceded by a whitespace or be at the start of the string, and followed by a word boundary (whitespace, end of string, or non-alphanumeric).

This is the same pattern used by `resolveThemeVarToCssVars` in `ThemeProvider.tsx`: `/\$([a-zA-Z0-9_-]+)/gi`.

**Testing**:
- **Unit test file**: `xmlui/tests/components-core/ud-metadata.test.ts`
- Test cases:
  - `"$color-surface-100"` → `["color-surface-100"]`
  - `"$space-2 $space-4"` → `["space-2", "space-4"]`
  - `"10px"` → `[]`
  - `"rgb(from $color-secondary-500 r g b / 0.6)"` → `["color-secondary-500"]`
  - `"$border-radius"` → `["border-radius"]`
  - Empty/undefined → `[]`

---

### Step 3: Create the `walkComponentDefTree` helper

**File**: `xmlui/src/components-core/ud-metadata.ts`

Create a function that recursively walks a `ComponentDef` tree and invokes a visitor for each node:

```ts
function walkComponentDefTree(
  def: ComponentDef,
  visitor: (node: ComponentDef) => void,
): void
```

- Visit `def` itself.
- Recurse into `def.children` (if array of `ComponentDef`).
- Recurse into `def.props` values that are `ComponentDef` objects (template props).
- Recurse into `def.events` values that contain nested `ComponentDef` objects.
- Recurse into `def.loaders` (if present).
- Recurse into `def.slots` (if present, each slot value is `ComponentDef[]`).

Note: There is an existing `visitComponent` in `markup-check.ts`, but it requires a `metadataHandler` dependency. Our walker should be simpler and standalone — no metadata lookup needed.

**Testing**:
- **Unit test file**: `xmlui/tests/components-core/ud-metadata.test.ts`
- Test cases:
  - Single node with no children → visits 1 node
  - Node with 2 children → visits 3 nodes
  - Nested children (depth 3) → visits all nodes
  - Node with `loaders` → visits loader nodes
  - Props containing `ComponentDef` values → visits them

---

### Step 4: Create `collectPropsFromComponentDef`

**File**: `xmlui/src/components-core/ud-metadata.ts`

Walk a `ComponentDef` tree and collect all `$props.<member>` references from:
1. **Props values**: For each `prop` value in every node, if the value is a `ParsedPropertyValue` (has `segments`), walk its expression segments for `$props.<member>`.
2. **Event values**: Same analysis for event handler expressions.

```ts
function collectPropsFromComponentDef(def: ComponentDef): string[]
```

Uses `walkComponentDefTree` + `extractPropsFromExpression`.

For each visited node:
- Iterate `node.props` entries. For each value:
  - If it's a `ParsedPropertyValue` (has `__PARSED` and `segments`), iterate segments.
  - For each segment with `expr`, call `extractPropsFromExpression(segment.expr)`.
- Iterate `node.events` entries similarly.
- Iterate `node.vars` entries similarly (variables can reference `$props` too).

Return deduplicated property names.

**Testing**:
- **Unit test file**: `xmlui/tests/components-core/ud-metadata.test.ts`
- Test cases:
  - ComponentDef with `props: { label: ParsedPropertyValue referencing $props.title }` → `["title"]`
  - ComponentDef with event handler referencing `$props.onSave` → `["onSave"]`
  - Deep nesting: child's child references `$props.deep` → `["deep"]`
  - No `$props` references → `[]`
  - Mixed: some props have string literals, some have expressions → only expression ones collected

---

### Step 5: Create `collectThemeVarsFromComponentDef` ✅ DONE

**File**: `xmlui/src/components-core/ud-metadata.ts`

Walk a `ComponentDef` tree and collect all theme variable references from layout property values.

```ts
function collectThemeVarsFromComponentDef(
  def: ComponentDef,
  componentName: string,
): Record<string, string>
```

For each visited node:
- Iterate `node.props` entries.
  - For each prop key, check if it's a layout property by calling `parseLayoutProperty(key)`.
  - If the parse succeeds (returns `ParsedLayout`, not string), and the prop value is a plain string (not an expression), call `extractThemeVarsFromValue(value)`.
  - For each extracted theme var, add it to the result record as `themeVarName: ""` (value is empty, same convention as `parseScssVar` output — keys are what matter).

Return the collected `Record<string, string>`.

Note: We need to generate theme var keys in the format matching what `ThemeProvider.tsx` expects. Core components use SCSS-exported keys (e.g., `backgroundColor-Badge`). For user-defined components, the keys should include the component name suffix when the referenced var implies it. The simplest approach is to collect the raw `$<themeVar>` names — these are the dependency references that need to exist in the resolved theme.

**Testing**:
- **Unit test file**: `xmlui/tests/components-core/ud-metadata.test.ts`
- Test cases:
  - Node with `padding: "$space-2"` → `{ "space-2": "" }`
  - Node with `backgroundColor: "$color-surface-100"` → `{ "color-surface-100": "" }`
  - Node with `padding: "10px"` → `{}` (no theme var reference)
  - Node with `padding: "{$props.padding}"` → `{}` (expression, not plain string)
  - Node with `textColor: "$my-color $my-other"` → `{ "my-color": "", "my-other": "" }`
  - Non-layout prop (e.g., `label`) with `$something` → not collected

---

### Step 6: Create `generateUdComponentMetadata` ✅ DONE

**File**: `xmlui/src/components-core/ud-metadata.ts`

The main entry point function:

```ts
export function generateUdComponentMetadata(
  compoundDef: CompoundComponentDef,
): ComponentMetadata
```

1. Call `collectPropsFromComponentDef(compoundDef.component)` to get prop names.
2. Call `collectThemeVarsFromComponentDef(compoundDef.component, compoundDef.name)` to get theme vars.
3. Build and return:

```ts
{
  status: "stable",
  description: `User-defined component: ${compoundDef.name}`,
  props: Object.fromEntries(propNames.map(name => [name, { description: "" }])),
  themeVars: collectedThemeVars,
}
```

**Testing**:
- **Unit test file**: `xmlui/tests/components-core/ud-metadata.test.ts`
- Test cases:
  - Full compound component with props and theme vars → metadata has both
  - Compound component with no `$props` or theme vars → minimal metadata (empty props, empty themeVars)
  - Component name appears in description

---

### Step 7: Wire metadata generation into registration

**File**: `xmlui/src/components/ComponentProvider.tsx`

Modify the compound component registration path to auto-generate metadata when none is provided.

In the constructor, where `compoundComponents` are registered:

```ts
// BEFORE:
contributes.compoundComponents?.forEach((def) => {
  this.registerAppComponent({ compoundComponentDef: def });
});

// AFTER:
contributes.compoundComponents?.forEach((def) => {
  this.registerAppComponent({
    compoundComponentDef: def,
    metadata: generateUdComponentMetadata(def),
  });
});
```

Also update `registerCompoundComponentRenderer` to merge auto-generated metadata with any explicitly provided metadata (explicit takes priority):

```ts
private registerCompoundComponentRenderer(
  { compoundComponentDef, metadata }: CompoundComponentRendererInfo,
  namespace: string,
) {
  const autoMetadata = generateUdComponentMetadata(compoundComponentDef);
  const mergedMetadata = metadata
    ? { ...autoMetadata, ...metadata }
    : autoMetadata;
  
  const component = {
    type: compoundComponentDef.name,
    renderer: ...,
    isCompoundComponent: true,
    metadata: mergedMetadata,
  };
  this.registerComponentRenderer(component, namespace);
}
```

This ensures:
- App-level compound components (standalone & Vite) get auto-generated metadata.
- Extension-provided compound components that already have explicit metadata keep theirs (with auto-generated as fallback).
- `registerComponentRenderer` then calls `this.themeVars.add(key)` for all theme var keys, integrating them into the optimization pipeline.

**Testing**:
- **Unit test**: Mock a `CompoundComponentDef` and verify that after registration, `componentRegistry.componentThemeVars` contains the expected theme var keys.
- **Regression test**: Ensure existing core component theme vars are still collected correctly.

---

### Step 8: Verify ThemeNative filtering still works

**File**: `xmlui/src/components/Theme/ThemeNative.tsx`

The existing `isCompoundComponent` check in ThemeNative serves as a safety net. With metadata now populated, the primary optimization path through `ThemeProvider.tsx` (the `componentThemeVars` set) will correctly include user-defined component theme vars.

Review whether the `isCompoundComponent` pass-through is still needed:
- **Keep it for now** — it acts as a fallback for theme vars that aren't statically analyzable (e.g., dynamic expressions that reference theme vars at runtime).
- Add a code comment explaining its purpose.

**Testing**:
- **E2E test**: Create a user-defined component that uses theme variables (e.g., `backgroundColor: "$color-surface-100"`) and verify the variables are rendered as CSS custom properties.
- **E2E regression**: Verify existing apps with user-defined components still render correctly.

---

### Step 9: Handle edge cases

Consider and test these edge cases:

1. **Compound component referencing another compound component's theme vars**: If `MyComp` uses `<OtherComp backgroundColor="$bg-OtherComp"/>`, the theme var `bg-OtherComp` should be collected.
2. **Code-behind vars**: Variables defined in code-behind that are merged into `component.vars` may contain `$props` references — these are already captured since we walk the full `ComponentDef` tree after code-behind merge.
3. **Slot content**: Props passed through `<Slot/>` aren't part of the compound component's own definition tree — they come from the caller. This is correct: the caller's context should provide those theme vars.
4. **Circular references**: User-defined components can reference themselves. The `walkComponentDefTree` should not infinite-loop — this is safe because the `ComponentDef` tree is finite (it's a parsed structure, not a runtime component graph).

**Testing**:
- Unit tests for each edge case above.

---

## Files Modified

| File | Change |
|---|---|
| `xmlui/src/components-core/ud-metadata.ts` | **New** — metadata extraction utilities |
| `xmlui/tests/components-core/ud-metadata.test.ts` | **New** — unit tests |
| `xmlui/src/components/ComponentProvider.tsx` | Wire auto-generated metadata into registration |
| `xmlui/src/components/Theme/ThemeNative.tsx` | Add clarifying comment (no logic change) |

## Files Read (not modified)

| File | Purpose |
|---|---|
| `xmlui/src/abstractions/ComponentDefs.ts` | `ComponentMetadata`, `ComponentDef`, `CompoundComponentDef` types |
| `xmlui/src/abstractions/RendererDefs.ts` | `CompoundComponentRendererInfo` type |
| `xmlui/src/components/ComponentRegistryContext.tsx` | `ComponentRegistryEntry` type |
| `xmlui/src/components-core/script-runner/ScriptingSourceTree.ts` | Expression AST types |
| `xmlui/src/components-core/script-runner/visitors.ts` | `collectVariableDependencies` (reference for AST walking) |
| `xmlui/src/components-core/theming/parse-layout-props.ts` | `parseLayoutProperty` |
| `xmlui/src/components-core/theming/ThemeProvider.tsx` | Theme var resolution pipeline |
| `xmlui/src/components-core/theming/hvar.ts` | `parseHVar` |
| `xmlui/src/parsers/xmlui-parser/transform.ts` | `collectCompoundComponent` — how `CompoundComponentDef` is built |
| `xmlui/src/components-core/script-runner/AttributeValueParser.ts` | `ParsedPropertyValue` structure |

## Risk Assessment

- **Low risk**: Steps 1–6 are pure functions with no side effects, fully unit-testable.
- **Medium risk**: Step 7 changes the registration path. Mitigated by: (a) auto-generated metadata only fills in what's missing, (b) explicit metadata always wins, (c) existing `isCompoundComponent` filter in ThemeNative remains as fallback.
- **No breaking changes**: The public API (`ContributesDefinition`, `CompoundComponentRendererInfo`) is unchanged. `metadata` remains optional.

## Execution Order

Steps 1–6 can be implemented and tested independently (pure functions). Step 7 is the integration point. Step 8 is validation. Step 9 handles edge cases.

Recommended: implement steps 1–3 first (helpers), then 4–5 (composition), then 6 (entry point), then 7 (wiring), then 8–9 (validation).

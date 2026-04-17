# wrapComponent — The Integration Workhorse

## What It Does

`wrapComponent` takes a React component + a `WrapComponentConfig` and returns a `ComponentRendererDef` ready for registration. It replaces the manual boilerplate of `createComponentRenderer`: extracting every prop via `extractValue`, wiring every event via `lookupEventHandler`, etc.

Anything in `node.props` that is NOT explicitly handled is forwarded automatically via `extractValue()`. New props added to the native component "just work" without touching the wrapper.

**Source:** `xmlui/src/components-core/wrapComponent.tsx`

## Signature

```typescript
function wrapComponent<TMd extends ComponentMetadata>(
  type: string,
  Component: React.ComponentType<any>,
  metadata: TMd,
  config: WrapComponentConfig = {},
): ComponentRendererDef
```

## When to Use Which

| Pattern | When to use |
|---------|------------|
| `wrapComponent` | ≥90% of cases. React component that accepts ordinary props. |
| `wrapCompound` | Controlled input that manages its own local state and exposes `onChange`/`registerApi` interface (no direct XMLUI plumbing). |
| `createComponentRenderer` | Complex layout logic, non-standard child rendering, conditions that change which React element is returned at the top level. |

The codebase is actively migrating from `createComponentRenderer` to `wrapComponent`. When extending an existing `createComponentRenderer` component, prefer migrating it.

## WrapComponentConfig Reference

All fields are optional. Omit everything that doesn't need special treatment — the auto-detection handles the rest.

### Prop type extraction

| Field | Type | Auto-detected from | Behaviour |
|-------|------|--------------------|-----------|
| `booleans` | `string[]` | `valueType: "boolean"` in metadata | `extractValue.asOptionalBoolean(raw)` |
| `numbers` | `string[]` | `valueType: "number"` | `extractValue.asOptionalNumber(raw)` |
| `strings` | `string[]` | `valueType: "string"` | `extractValue.asOptionalString(raw)` |
| `resourceUrls` | `string[]` | `isResourceUrl: true` in metadata | `extractResourceUrl(raw)` |

> **Critical:** auto-detection reads `propMeta.valueType`. Props declared with `d()` helper (no `valueType`) are NOT auto-typed — they get raw `extractValue()`. Always set `valueType` in metadata.

### Events

```typescript
events?: string[] | Record<string, string>
```

- Array form: `["click", "gotFocus"]` → React props `onClick`, `onGotFocus` (on + capitalize)
- Object form: `{ didChange: "onDidChange" }` → explicit React prop name
- Auto-detected from all keys in `metadata.events`; explicit config overrides convention
- Events get auto-tracing in verbose mode (`value:change`, `focus:change` trace kinds)

### Callbacks

```typescript
callbacks?: string[] | Record<string, string>
```

Props resolved via `lookupSyncCallback()` instead of `extractValue`. Use for props that execute inline JavaScript expressions synchronously (not event handlers).

- Array form: `["renderIcon"]` → same XMLUI and React name
- Object form: `{ renderIcon: "renderIconProp" }` → different React prop name

### Templates (static children)

```typescript
templates?: string[] | Record<string, string>
```

Props of `valueType: "ComponentDef"` rendered to React nodes via `renderChild()` and passed as static children.

- Auto-detected from `valueType: "ComponentDef"` in metadata props (unless in `renderers` or `exclude`)
- Array form: `["emptyListTemplate"]` → same prop name passed to native component
- Object form: `{ emptyListTemplate: "emptyList" }` → renamed React prop

### Renderers (render-prop callbacks)

```typescript
renderers?: Record<string, RendererConfig>
```

`ComponentDef` props converted to render-prop callbacks. The callback wraps the template in `MemoizedItem` with context variables from its runtime arguments.

```typescript
export type RendererConfig = {
  reactProp?: string;  // defaults to: "XxxTemplate" → "XxxRenderer"
  contextVars:
    | (string | null)[]            // positional: args[i] → contextVars[name]
    | ((...args: any[]) => Record<string, any>);  // computed
};
```

**Examples:**

```typescript
// Positional: optionTemplate(item, selectedValue) → { $item, $selectedValue }
renderers: {
  optionTemplate: {
    contextVars: ["$item", "$selectedValue"],
  },
}

// Skip arg position with null:
renderers: {
  rowTemplate: {
    contextVars: ["$row", null, "$rowIndex"],  // args[1] is skipped
  },
}

// Computed (function form):
renderers: {
  rowTemplate: {
    contextVars: (row, index, data) => ({
      $row: row,
      $rowIndex: index,
      $isFirst: index === 0,
      $isLast: index === data.length - 1,
    }),
  },
}
```

### Renaming

```typescript
rename?: Record<string, string>  // XMLUI prop name → React prop name
```

Example: `{ minValue: "min", maxValue: "max" }` — markup uses `minValue`, native component receives `min`.

### Excluding

```typescript
exclude?: string[]
```

Props listed here are neither forwarded nor type-extracted. Use for props handled entirely inside `customRender`.

### State binding (controlled components)

```typescript
stateful?: boolean
```

Auto-detected as `true` when `metadata.props.initialValue` or `metadata.events.didChange` exists.

When stateful:
- `props.value = state.value` passed to native component
- `props.updateState = updateState` passed to native component
- `props.initialValue = extractValue(node.props.initialValue)` passed to native component
- `initialValue` added to `specialProps` (not forwarded via generic path)

### Other options

| Field | Type | Default | Use |
|-------|------|---------|-----|
| `exposeRegisterApi` | `boolean` | `false` | Pass `registerComponentApi` to native component |
| `passUid` | `boolean` | `false` | Pass `node.uid` as `uid` prop (for anchor/bookmark use) |
| `captureNativeEvents` | `boolean` | `false` | Pass `onNativeEvent` callback; captures any library event and traces it |
| `contentClassName` | `boolean` | `false` | Pass `classes[COMPONENT_PART_KEY]` as `contentClassName` (portal components) |
| `childrenLayoutContext` | `LayoutContext` | — | Layout context for `renderChild(node.children, ...)` |
| `deriveAriaLabel` | `(props) => string \| undefined` | — | Derive `aria-label` from resolved props (e.g., `props.placeholder`) |

### Custom rendering

```typescript
customRender?: (props: Record<string, any>, context: RendererContext) => React.ReactNode
```

When provided: called instead of `<Component {...props} />`. All prop extraction (events, booleans, templates, etc.) still runs first; the result is in `props`. Children are NOT automatically rendered — `customRender` must handle them.

Use when the rendered element or child layout depends on runtime values (e.g., different layouts by `orientation`).

## Auto-forwarding Logic

Execution order inside the generated renderer:

1. Always-on plumbing: `className`, `classes`, optionally `registerComponentApi`, `uid`
2. State props: `value`, `updateState`, `initialValue` (if stateful)
3. Events: wired with auto-tracing
4. Callbacks: via `lookupSyncCallback`
5. Native event capture: `onNativeEvent` (if `captureNativeEvents` and verbose mode)
6. Resource URL props: via `extractResourceUrl`
7. Static templates: via `renderChild` → static React node
8. Render-prop renderers: via `MemoizedItem` callback
9. `contentClassName` for portals
10. Generic forwarding: all remaining `node.props` not in `specialProps` or `excludeSet`
    - `booleanSet` → `asOptionalBoolean`
    - `numberSet` → `asOptionalNumber`
    - `stringSet` → `asOptionalString`
    - others → raw `extractValue`
11. `aria-label` cascade: explicit > `deriveAriaLabel` > `metadata.defaultAriaLabel` > `props.label`

## Props Blocked from Forwarding

These are always added to `specialProps` and never forwarded to the native component:

| Blocked prop | Reason |
|-------------|--------|
| `id` | XMLUI id — used for component API access, not a DOM attribute |
| `ref` | Never forward as a React string ref |
| `style` | Contains XMLUI theme variable strings; layout processor owns this |
| Layout props (`width`, `height`, `padding`, etc.) | Layout resolver owns these via CSS className |
| `bindTo` | Consumed by `formBindingBehavior` |
| `onValidate` | Consumed by `validationBehavior` |
| `bubbleEvents` | Consumed by `ComponentAdapter` |
| `aria-label` | Handled by the aria-label cascade |

## wrapCompound

`wrapCompound` is `wrapComponent` extended for components that manage their own local state internally (no direct `updateState`/`value` threading). The native `RenderComponent` receives:

- `value` — current value (parsed, synced)
- `onChange(newValue)` — call to update value
- `registerApi(apis)` — call to register component APIs
- All other forwarded props

It uses a `CallbackSync` (outer, unmemoized) + `MemoizedInner` split to solve the stale-closure problem with `React.memo`.

Additional config fields:

```typescript
type WrapCompoundConfig = WrapComponentConfig & {
  parseInitialValue?: (raw: any, props: Record<string, any>) => any;
  formatExternalValue?: (value: any, props: Record<string, any>) => any;
};
```

## Common Patterns

### Simple visual component

```typescript
export const avatarComponentRenderer = wrapComponent(
  "Avatar",
  AvatarNative,
  AvatarMd,
  {
    resourceUrls: ["src"],
    events: ["click"],
  },
);
```

### Controlled input with API

```typescript
export const textBoxComponentRenderer = wrapComponent(
  "TextBox",
  TextBoxNative,
  TextBoxMd,
  {
    events: ["gotFocus", "lostFocus"],   // didChange is auto-detected from metadata
    exposeRegisterApi: true,
    deriveAriaLabel: (props) => props.placeholder,
  },
);
// isStateful = true auto-detected (metadata has didChange + initialValue)
```

### Component with render-prop template

```typescript
export const selectComponentRenderer = wrapComponent(
  "Select",
  SelectNative,
  SelectMd,
  {
    exposeRegisterApi: true,
    contentClassName: true,
    renderers: {
      optionTemplate: {
        contextVars: ["$item"],
      },
    },
  },
);
```

### Component needing rename

```typescript
export const sliderComponentRenderer = wrapComponent(
  "Slider",
  SliderNative,
  SliderMd,
  {
    rename: { minValue: "min", maxValue: "max" },
  },
);
```

### Component with custom rendering

```typescript
export const stackComponentRenderer = wrapComponent(
  "Stack",
  StackNative,
  StackMd,
  {
    exclude: ["orientation"],
    customRender(props, { node, extractValue, renderChild, classes }) {
      const orientation = extractValue(node.props.orientation) ?? "vertical";
      return (
        <StackNative
          {...props}
          orientation={orientation}
          classes={classes}
        >
          {renderChild(node.children, { type: "Stack", orientation })}
        </StackNative>
      );
    },
  },
);
```

## Migration Pitfalls

When converting `createComponentRenderer` to `wrapComponent`:

| Problem | Root cause | Fix |
|---------|-----------|-----|
| Wrong valueType | `type` instead of `valueType`, or `d()` shorthand | Always use full object form with `valueType` |
| Children not rendered | Layout context passed to `renderChild` | Use `childrenLayoutContext` (static only) or `customRender` |
| Prop name mismatch | XMLUI name ≠ React name | Use `rename: { xmluiName: "reactName" }` |
| Unsupported extractors | `asSize()`, `asDisplayText()` have no equivalent | Stay with `createComponentRenderer` |
| Computed/derived props | Default depends on another prop, or multi-prop merge | Stay with `createComponentRenderer` |
| Complex render logic | Conditional JSX, per-child wrapChild, dynamic prop subsetting | Stay with `createComponentRenderer` |

**Pre-migration checklist:** All props use `valueType` (not `type`/`d()`); no cross-prop defaults; children layout context is static or absent; single unconditional JSX path.

## Anti-Patterns

| Anti-pattern | Fix |
|-------------|-----|
| `valueType` missing on props → wrong type extraction | Always set `valueType: "boolean"/"string"/"number"` in metadata props |
| Using `d()` for typed props → no auto-detection | Use full `{ description: "...", valueType: "string" }` syntax |
| Forwarding layout props to DOM | Never add `width`/`height`/`padding`/etc. to component Props interface; they're handled by layout resolver |
| Passing `style` to native component | Blocked by wrapComponent — use `className`/`classes` instead |
| Event handler prop name mismatch | Check: array form `"click"` → prop `onClick`; object form needed for non-standard names |
| Calling hooks in `customRender` | Not allowed — `customRender` runs in renderer context, not React component |
| Missing `exposeRegisterApi: true` when native calls `registerComponentApi` | Native component receives `undefined` and APIs are never registered |

## Key Files

| Concern | File |
|---------|------|
| `wrapComponent` + `wrapCompound` implementation | `xmlui/src/components-core/wrapComponent.tsx` |
| `WrapComponentConfig` type | same file |
| `RendererConfig` type | same file |
| `MemoizedItem` (template rendering) | `xmlui/src/components/container-helpers.tsx` |
| Migration pitfalls reference | Guide 05 (`xmlui/dev-docs/guide/05-wrapcomponent.md`) |

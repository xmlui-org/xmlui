# wrapComponent — The Integration Workhorse

`wrapComponent` is the primary way to make a React component XMLUI-aware. Where `createComponentRenderer` requires writing every prop extraction and event binding by hand, `wrapComponent` handles the plumbing automatically. You declare the exceptions; everything else is forwarded.

Built-in components under `xmlui/src/components/` use it, including components with custom rendering needs. Raw `createComponentRenderer` is now reserved for lower-level renderer infrastructure and unusual framework plumbing, not ordinary component authoring.

---

## The Core Idea

When XMLUI renders a component, it calls the renderer function with a context containing raw prop values (which may be binding expression ASTs, not plain values). The renderer's job is to evaluate those expressions and pass resolved values to the React component.

Without `wrapComponent`, this is mechanical repetition:

```typescript
// Manual renderer — lots of boilerplate
({ node, extractValue, lookupEventHandler, registerComponentApi, classes }) => (
  <ButtonNative
    label={extractValue.asDisplayText(node.props.label)}
    variant={extractValue.asOptionalString(node.props.variant)}
    enabled={extractValue.asOptionalBoolean(node.props.enabled)}
    registerComponentApi={registerComponentApi}
    onClick={lookupEventHandler("click")}
    classes={classes}
  />
)
```

With `wrapComponent`, you declare the type information once in metadata, and the wrapper does the rest:

```typescript
// wrapComponent — the metadata drives everything
export const buttonComponentRenderer = wrapComponent("Button", ButtonNative, ButtonMd, {
  exposeRegisterApi: true,
  events: ["click"],
});
// enabled (boolean), variant (string), label (string) are all
// auto-extracted from ButtonMd's valueType declarations.
```

---

## Auto-detection from Metadata

`wrapComponent` reads `valueType` from each prop's metadata definition and applies the right extractor automatically for the three primitive coercions it owns:

| `valueType` in metadata | Extractor used                                   |
| ----------------------- | ------------------------------------------------ |
| `"boolean"`             | `extractValue.asOptionalBoolean(raw)`            |
| `"number"`              | `extractValue.asOptionalNumber(raw)`             |
| `"string"`              | `extractValue.asOptionalString(raw)`             |
| `"ComponentDef"`        | `renderChild(raw)` (rendered as static template) |
| `isResourceUrl: true`   | `extractResourceUrl(raw)`                        |
| anything else / missing | `extractValue(raw)` — raw value                  |

Refined metadata types such as `"integer"`, `"length"`, `"color"`, `"url"`, `"icon"`, `"id-ref"`, and `"string[]"` are important for tooling, diagnostics, documentation, and manual renderers, but `wrapComponent` does not auto-select their specialized extractors. They fall through to raw `extractValue(raw)` unless the prop is also listed in `booleans`, `numbers`, `strings`, `resourceUrls`, `templates`, or `renderers`, or handled by `customRender`.

**The most common mistake when migrating to `wrapComponent`:** props declared with `d()` only get a `valueType` if you pass the third argument. `d("description")` by itself carries no type information, so the prop falls through to raw `extractValue`. Either use the explicit object form or pass `valueType` to `d()`:

```typescript
// Wrong — no valueType
maxLines: d("Maximum lines before truncation"),

// Correct
maxLines: {
  description: "Maximum lines before truncation.",
  valueType: "number",
  defaultValue: defaultProps.maxLines,
},

// Also correct
maxLines: d("Maximum lines before truncation", undefined, "number", defaultProps.maxLines),
```

Similarly, using `type` instead of `valueType` (a common copy-paste mistake) is not detected:

```typescript
// Wrong — "type" is not read by wrapComponent
active: { description: "...", type: "boolean" },

// Correct
active: { description: "...", valueType: "boolean" },
```

---

## Config Reference

### Events

```typescript
events?: string[] | Record<string, string>
```

Maps XMLUI event names to React handler props.

- **Array form** applies the `on` + capitalize convention: `["click"]` → `onClick`
- **Object form** for non-standard names: `{ didChange: "onDidChange" }`
- All keys in `metadata.events` are also auto-detected; the config extends or overrides them
- A React handler prop is only set when there is an XMLUI handler to call or verbose tracing has a semantic trace to emit. This preserves native components that test `!!onClick`.

```typescript
// These are equivalent:
events: ["click"];
events: {
  click: "onClick";
}
```

Events fire through a tracing wrapper in verbose/inspector mode, emitting semantic trace kinds (`value:change` for `didChange`, `focus:change` for `gotFocus`/`lostFocus`). Other metadata events are wired when an XMLUI handler is present, but do not get a semantic trace kind unless separate native-event capture handles them.

### Callbacks

```typescript
callbacks?: string[] | Record<string, string>
```

For props that execute inline JavaScript expressions synchronously — not event handlers, but compute-on-call props:

```typescript
callbacks: ["renderIcon"];
// or: { renderIcon: "renderIconProp" }  // XMLUI name → React prop name
```

Resolved via `lookupSyncCallback()` instead of `extractValue`.

### Templates and Renderers

Two ways to pass XMLUI component definitions as React props:

**`templates`** — renders the `ComponentDef` to a static React node and passes it:

```typescript
templates: ["emptyListTemplate"];
// XMLUI <MyComp emptyListTemplate="{...}"> → native receives emptyListTemplate as ReactNode
```

**`renderers`** — converts the `ComponentDef` to a render-prop callback. Use when the component iterates data and needs to render the template per item, with context variables:

```typescript
renderers: {
  optionTemplate: {
    contextVars: ["$item"],  // callback arg 0 becomes $item inside the template
  },
}
// Native: optionRenderer={(item) => <MemoizedItem ... />}
```

The default React prop name replaces `Template` with `Renderer` (e.g., `optionTemplate` → `optionRenderer`). Override with `reactProp`.

`ComponentDef`-typed props in metadata are auto-detected as static templates unless they appear in `renderers` or `exclude`.

When `metadata.childrenAsTemplate` is set, `wrapComponent` also understands the data-template convention. It consumes `data` and the named template prop internally, renders one `MemoizedItem` per data item, and injects `$item`, `$itemIndex`, `$isFirst`, and `$isLast`. If there is no array data, it renders the template prop as normal children. If that template prop is configured in `renderers`, this automatic children-as-template path is skipped.

### Controlled inputs (`stateful`)

When a component has `initialValue` in its props or `didChange` in its events, `wrapComponent` automatically detects it as stateful. In stateful mode it passes:

- `value={state.value}` — current value from the container
- `updateState={updateState}` — for the native component to report value changes back
- `initialValue={extractValue(node.props.initialValue)}` — the starting value

You rarely need to set `stateful: true` explicitly. Set `passUpdateState: false` when the component is stateful only because it declares `didChange`, but the native component never calls `updateState` itself.

### Other config options

| Option                  | Default | Use                                                                                 |
| ----------------------- | ------- | ----------------------------------------------------------------------------------- |
| `rename`                | —       | `{ minValue: "min" }` — XMLUI prop name → React prop name                           |
| `exclude`               | —       | Props to skip entirely (useful when `customRender` handles them)                    |
| `booleans`              | —       | Extra prop names to coerce with `extractValue.asOptionalBoolean`                    |
| `numbers`               | —       | Extra prop names to coerce with `extractValue.asOptionalNumber`                     |
| `strings`               | —       | Extra prop names to coerce with `extractValue.asOptionalString`                     |
| `stateful`              | auto    | Override stateful auto-detection from `initialValue`/`didChange`                    |
| `passUpdateState`       | `true`  | Set `false` to suppress `updateState` for stateful event-only components            |
| `exposeRegisterApi`     | `false` | Set `true` when the native component calls `registerComponentApi`                   |
| `passUid`               | `false` | Pass `node.uid` as `uid` prop (Bookmark and anchor components)                      |
| `resourceUrls`          | —       | Prop names containing logical resource URLs; resolved via `extractResourceUrl`      |
| `contentClassName`      | `false` | Pass the component-part CSS class as `contentClassName` (portal/overlay components) |
| `childrenLayoutContext` | —       | Layout context for `renderChild(node.children)`                                     |
| `captureNativeEvents`   | `false` | Pass `onNativeEvent` callback for tracing library events (ECharts, etc.)            |
| `deriveAriaLabel`       | —       | `(props) => string` — compute `aria-label` from already-extracted props             |

### Custom rendering

```typescript
customRender?: (props: Record<string, any>, context: RendererContext) => React.ReactNode
```

When provided, `customRender` is called instead of `<Component {...props} />`. All prop extraction still runs first, so `props` already has all resolved values. Children are **not** auto-rendered — `customRender` must handle them explicitly.

`customRender` is still part of the `wrapComponent` pattern. Use it when the component needs renderer-context services (`renderChild`, `lookupEventHandler`, `lookupEventHandler(..., { schedulerBypass: true })`, `registerComponentApi`, `uid`, `layoutContext`, specialized extractors, slot handling, or runtime child layout) that cannot be expressed through config alone.

After `customRender` returns, `wrapComponent` injects the resolved `aria-label` and `role` onto the root React element if they were resolved in `props` but not forwarded by the custom renderer. This keeps accessibility metadata from getting lost in custom paths.

Use when the rendered element or child layout depends on runtime values:

```typescript
customRender(props, { node, extractValue, renderChild }) {
  const orientation = extractValue(node.props.orientation) ?? "vertical";
  return (
    <StackNative {...props} orientation={orientation}>
      {renderChild(node.children, { type: "Stack", orientation })}
    </StackNative>
  );
},
```

**Hooks are not allowed in `customRender`** — it runs inside the renderer function, not as a React component.

---

## Props Blocked from Generic Forwarding

These are blocked from generic forwarding unless the component explicitly declares the same prop in metadata. When metadata declares a prop, the component owns the name and `wrapComponent` forwards it, except for props handled by dedicated template, renderer, callback, or resource URL paths.

| Prop                                                                                                    | Why blocked                                                             |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `id`                                                                                                    | XMLUI's component identity — not a DOM attribute                        |
| `ref`                                                                                                   | Never forwarded as a React ref string                                   |
| `style`                                                                                                 | Contains raw XMLUI theme variable strings; the layout processor owns it |
| Layout props (`width`, `height`, `padding`, `margin`, etc.) and responsive forms (`width-md`, etc.)     | Handled by the layout resolver via CSS className                        |
| `bindTo`                                                                                                | Consumed by the form binding behavior                                   |
| `onValidate`                                                                                            | Consumed by the validation behavior                                     |
| `bubbleEvents`                                                                                          | Consumed by `ComponentAdapter`                                          |
| Form behavior props (`noSubmit`, `itemIndex`, `labelPosition`, validation message/severity props, etc.) | Consumed by form and validation behaviors                               |
| Tooltip/label/pub-sub/animation/bookmark behavior props                                                 | Consumed by their behavior implementations                              |
| `updateState`                                                                                           | XMLUI-internal callback, never a DOM prop                               |
| `aria-label`                                                                                            | Handled by the aria-label cascade                                       |

A common mistake is defining layout props (like `width`) in a native component's `Props` interface. `wrapComponent` blocks them from reaching the native component because they're resolved to CSS classes by the layout system. Only declare such a prop in metadata when the component gives that name component-specific meaning and genuinely needs the raw value.

---

## wrapCompound — For Self-Managing State

`wrapCompound` is a variant for components where the React implementation manages value state internally (local `useState`) rather than delegating to the XMLUI container directly. The native `RenderComponent` receives a simplified interface:

- `value` — current value (parsed and formatted)
- `onChange(newValue)` — call to update value
- `registerApi(apis)` — call to register component APIs

The `RenderComponent` never imports anything from XMLUI. This is useful for wrapping third-party controlled inputs that have their own state.

Additional config:

```typescript
parseInitialValue?: (raw: any, props: Record<string, any>) => any
// Convert the raw initialValue (string from markup) to the native format.

formatExternalValue?: (value: any, props: Record<string, any>) => any
// Normalize values coming from outside (e.g., clamp to min/max).
```

---

## Choosing the Right Pattern

| Situation                                                                          | Use                                 |
| ---------------------------------------------------------------------------------- | ----------------------------------- |
| Standard React component with props and events                                     | `wrapComponent`                     |
| Controlled input; native component manages its own state                           | `wrapCompound`                      |
| Complex child rendering that varies by runtime values                              | `wrapComponent` with `customRender` |
| Runtime-dependent element selection, slots, or specialized extraction              | `wrapComponent` with `customRender` |
| Renderer infrastructure or behavior that cannot run through `wrapComponent` at all | `createComponentRenderer`           |

---

## Migration Pitfalls

When migrating a `createComponentRenderer` to `wrapComponent`, these problems recur across components.

### 1. Wrong or missing `valueType`

`wrapComponent` reads `valueType` (not `type`) to choose the correct extractor. Common causes:

- **`type` instead of `valueType`** — Link used `type: "boolean"` for `active`; wrapComponent ignores `type`.
- **`d()` without the third argument** — `d("description")` produces no `valueType`, so the prop falls through to raw `extractValue`. Use the object form or `d(description, availableValues, valueType, defaultValue)`.
- **Wrong `valueType` breaks native logic** — setting `valueType: "string"` on Image's `data` caused `asOptionalString()` to be called, which converted a `Blob` to a string, breaking `instanceof Blob` checks.

**Fix:** set `valueType` intentionally for typed props; omit `valueType` or use `valueType: "any"` when the native component needs the raw value (e.g., Blob or arbitrary object).

### 2. Children not rendered

`wrapComponent` auto-renders `node.children` only when children exist. If your original renderer passed a layout context to `renderChild`, use `childrenLayoutContext` (static object only). If the layout context requires runtime values, use `customRender`.

### 3. Prop name or semantic mismatch

- **`enabled` vs `disabled`** — XMLUI uses `enabled`; if the native expects `disabled`, change the native to accept `enabled` directly rather than adding an adapter.
- **XMLUI name ≠ React name** — use `rename: { data: "imageData" }`.
- **Resource URLs** — props resolved via `extractResourceUrl` need `isResourceUrl: true` in metadata.

### 4. Specialized extractors

`wrapComponent` auto-selects only `asOptionalBoolean`, `asOptionalNumber`, `asOptionalString`, `extractResourceUrl`, and `renderChild`/`MemoizedItem` for `ComponentDef` templates. It does not auto-select specialized helpers such as `asSize()`, `asDisplayText()`, `asInteger()`, `asColor()`, `asLength()`, `asUrl()`, `asIcon()`, `asLayoutProp()`, or `asStyleProp()`. Components requiring those semantics should use `customRender`, or explicit config (`strings`, `numbers`, etc.) when plain coercion is enough.

### 5. Computed or derived props

Use `customRender` when:

- A prop's default depends on another prop (Stack's `itemWidth` defaults from `orientation`)
- Multiple props merge into one React prop (Badge's `color` from `colorMap` + `value`)
- A prop is derived from engine-injected layout properties (`height`, `width`)
- Event lookup needs non-default options such as `{ schedulerBypass: true }`

### 6. Complex render logic

These patterns require `customRender`:

- Conditional JSX trees (Stack branches to DockLayout, FlowLayout, or Stack)
- Per-child `wrapChild` callbacks
- Multiple component variants sharing a render helper (VStack/HStack/CVStack/CHStack)
- Runtime prop subsetting via whitelist (Text's `VariantPropsKeys`)
- Slot or template fallback logic (AppHeader uses prop templates or slots)

### Pre-migration checklist

| Area       | Check                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------- |
| Metadata   | All props use `valueType`, not `type`; `d()` calls pass a `valueType` when typed               |
| Props      | Cross-prop defaults and multi-prop → single React prop logic are handled by `customRender`     |
| Children   | Static layout context uses `childrenLayoutContext`; runtime layout context uses `customRender` |
| Extractors | Specialized extractors are handled by `customRender`                                           |
| Render     | Dynamic JSX paths, slots, per-child wrapping, or prop subsetting are handled by `customRender` |

---

## Complete Example

A hypothetical `Rating` component with events, a template, and an API:

**Metadata (`Rating.tsx`):**

```typescript
export const RatingMd = createMetadata({
  status: "stable",
  description: "Star rating input.",
  props: {
    value: { description: "Current rating.", valueType: "number" },
    maxStars: { description: "Maximum stars.", valueType: "number", defaultValue: 5 },
    readOnly: { description: "Disable interaction.", valueType: "boolean", defaultValue: false },
    starTemplate: { description: "Custom star element.", valueType: "ComponentDef" },
  },
  events: {
    didChange: d("Fired when the rating changes."),
  },
  apis: {
    reset: { description: "Resets the rating to 0.", signature: "reset(): void" },
  },
  themeVars: parseScssVar(styles.themeVars),
});
```

**Renderer (`Rating.tsx`):**

```typescript
export const ratingComponentRenderer = wrapComponent("Rating", RatingNative, RatingMd, {
  exposeRegisterApi: true,
  // didChange auto-detected from metadata → isStateful: true
  // starTemplate auto-detected as ComponentDef template
  // readOnly/maxStars auto-detected from valueType: "boolean"/"number"
});
```

The wrapper auto-detects:

- `didChange` → stateful (`value`, `updateState`, `initialValue` passed)
- `readOnly` → `extractValue.asOptionalBoolean`
- `maxStars` → `extractValue.asOptionalNumber`
- `starTemplate` → `renderChild(raw)` as static template

---

## Key Takeaways

1. `wrapComponent` eliminates prop-extraction boilerplate by reading `valueType` from metadata for boolean, number, string, resource URL, and `ComponentDef` template handling. Other `valueType` values still matter, but they do not automatically pick a specialized extractor.
2. The difference between `templates` and `renderers`: templates render once to a static node; renderers create callbacks that render per-item with context variables.
3. Layout and behavior props are blocked from generic forwarding, but explicit metadata props take ownership of their names and are forwarded.
4. `stateful: true` is auto-detected from `initialValue` or `didChange` in metadata. In stateful mode, `value`/`updateState`/`initialValue` are wired automatically; `passUpdateState: false` suppresses only the `updateState` prop.
5. `customRender` is the preferred escape hatch for ordinary components that need renderer-context services, custom child rendering, specialized extractors, scheduler-bypass event lookup, or dynamic JSX. It runs in the renderer context, not as a React component. No hooks.
6. `wrapCompound` is for components whose React implementation manages local state. The native component gets `value`, `onChange`, and `registerApi` — no XMLUI imports required.
7. `exposeRegisterApi: true` must be set explicitly. Without it, `registerComponentApi` is `undefined` in the native component and no imperative APIs can be registered.

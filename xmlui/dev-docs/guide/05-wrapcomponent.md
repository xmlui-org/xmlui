# wrapComponent — The Integration Workhorse

`wrapComponent` is the primary way to make a React component XMLUI-aware. Where `createComponentRenderer` requires writing every prop extraction and event binding by hand, `wrapComponent` handles the plumbing automatically. You declare the exceptions; everything else is forwarded.

Most built-in components use it, and the codebase is actively migrating the remaining `createComponentRenderer` implementations over to it.

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
export const buttonComponentRenderer = wrapComponent(
  "Button",
  ButtonNative,
  ButtonMd,
  {
    exposeRegisterApi: true,
    events: ["click"],
  },
);
// enabled (boolean), variant (string), label (string) are all
// auto-extracted from ButtonMd's valueType declarations.
```

---

## Auto-detection from Metadata

`wrapComponent` reads `valueType` from each prop's metadata definition and applies the right extractor automatically:

| `valueType` in metadata | Extractor used |
|-------------------------|----------------|
| `"boolean"` | `extractValue.asOptionalBoolean(raw)` |
| `"number"` | `extractValue.asOptionalNumber(raw)` |
| `"string"` | `extractValue.asOptionalString(raw)` |
| `"ComponentDef"` | `renderChild(raw)` (rendered as static template) |
| `isResourceUrl: true` | `extractResourceUrl(raw)` |
| anything else / missing | `extractValue(raw)` — raw value |

**The most common mistake when migrating to `wrapComponent`:** props declared with the `d()` shorthand helper get no `valueType`, so they fall through to raw `extractValue`. Always write the full form for typed props:

```typescript
// Wrong — d() carries no valueType
maxLines: d("Maximum lines before truncation"),

// Correct
maxLines: {
  description: "Maximum lines before truncation.",
  valueType: "number",
  defaultValue: defaultProps.maxLines,
},
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

```typescript
// These are equivalent:
events: ["click"]
events: { click: "onClick" }
```

Events fire through a tracing wrapper in verbose/inspector mode, emitting semantic trace kinds (`value:change` for `didChange`, `focus:change` for `gotFocus`/`lostFocus`).

### Callbacks

```typescript
callbacks?: string[] | Record<string, string>
```

For props that execute inline JavaScript expressions synchronously — not event handlers, but compute-on-call props:

```typescript
callbacks: ["renderIcon"]
// or: { renderIcon: "renderIconProp" }  // XMLUI name → React prop name
```

Resolved via `lookupSyncCallback()` instead of `extractValue`.

### Templates and Renderers

Two ways to pass XMLUI component definitions as React props:

**`templates`** — renders the `ComponentDef` to a static React node and passes it:

```typescript
templates: ["emptyListTemplate"]
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

### Controlled inputs (`stateful`)

When a component has `initialValue` in its props or `didChange` in its events, `wrapComponent` automatically detects it as stateful. In stateful mode it passes:

- `value={state.value}` — current value from the container
- `updateState={updateState}` — for the native component to report value changes back
- `initialValue={extractValue(node.props.initialValue)}` — the starting value

You rarely need to set `stateful: true` explicitly.

### Other config options

| Option | Default | Use |
|--------|---------|-----|
| `rename` | — | `{ minValue: "min" }` — XMLUI prop name → React prop name |
| `exclude` | — | Props to skip entirely (useful when `customRender` handles them) |
| `exposeRegisterApi` | `false` | Set `true` when the native component calls `registerComponentApi` |
| `passUid` | `false` | Pass `node.uid` as `uid` prop (Bookmark and anchor components) |
| `resourceUrls` | — | Prop names containing logical resource URLs; resolved via `extractResourceUrl` |
| `contentClassName` | `false` | Pass the component-part CSS class as `contentClassName` (portal/overlay components) |
| `childrenLayoutContext` | — | Layout context for `renderChild(node.children)` |
| `captureNativeEvents` | `false` | Pass `onNativeEvent` callback for tracing library events (ECharts, etc.) |
| `deriveAriaLabel` | — | `(props) => string` — compute `aria-label` from already-extracted props |

### Custom rendering

```typescript
customRender?: (props: Record<string, any>, context: RendererContext) => React.ReactNode
```

When provided, `customRender` is called instead of `<Component {...props} />`. All prop extraction still runs first, so `props` already has all resolved values. Children are **not** auto-rendered — `customRender` must handle them explicitly.

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

## Props Never Forwarded

These are always blocked, regardless of what appears in `node.props`:

| Prop | Why blocked |
|------|------------|
| `id` | XMLUI's component identity — not a DOM attribute |
| `ref` | Never forwarded as a React ref string |
| `style` | Contains raw XMLUI theme variable strings; the layout processor owns it |
| Layout props (`width`, `height`, `padding`, `margin`, etc.) | Handled by the layout resolver via CSS className |
| `bindTo` | Consumed by the form binding behavior |
| `onValidate` | Consumed by the validation behavior |
| `bubbleEvents` | Consumed by `ComponentAdapter` |
| `aria-label` | Handled by the aria-label cascade |

A common mistake is defining layout props (like `width`) in a native component's `Props` interface. `wrapComponent` blocks them from reaching the native component because they're resolved to CSS classes by the layout system. Don't accept them in the native component.

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

| Situation | Use |
|-----------|-----|
| Standard React component with props and events | `wrapComponent` |
| Controlled input; native component manages its own state | `wrapCompound` |
| Complex child rendering that varies by runtime values | `wrapComponent` with `customRender` |
| Top-level element changes based on props (e.g., `as` prop) | `createComponentRenderer` |

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
export const ratingComponentRenderer = wrapComponent(
  "Rating",
  RatingNative,
  RatingMd,
  {
    exposeRegisterApi: true,
    // didChange auto-detected from metadata → isStateful: true
    // starTemplate auto-detected as ComponentDef template
    // readOnly/maxStars auto-detected from valueType: "boolean"/"number"
  },
);
```

The wrapper auto-detects:
- `didChange` → stateful (`value`, `updateState`, `initialValue` passed)
- `readOnly` → `extractValue.asOptionalBoolean`
- `maxStars` → `extractValue.asOptionalNumber`
- `starTemplate` → `renderChild(raw)` as static template

---

## Key Takeaways

1. `wrapComponent` eliminates prop-extraction boilerplate by reading `valueType` from metadata — but only if `valueType` is set correctly. The `d()` shorthand produces no type information and falls back to raw extraction.
2. The difference between `templates` and `renderers`: templates render once to a static node; renderers create callbacks that render per-item with context variables.
3. Layout props (`width`, `height`, `padding`, etc.) are always blocked from forwarding. The layout system resolves them to CSS class names — the native component should not accept them.
4. `stateful: true` is auto-detected from `initialValue` or `didChange` in metadata. In stateful mode, `value`/`updateState`/`initialValue` are wired automatically.
5. `customRender` runs in the renderer context, not as a React component. No hooks. It receives already-extracted props and must handle children itself.
6. `wrapCompound` is for components whose React implementation manages local state. The native component gets `value`, `onChange`, and `registerApi` — no XMLUI imports required.
7. `exposeRegisterApi: true` must be set explicitly. Without it, `registerComponentApi` is `undefined` in the native component and no imperative APIs can be registered.

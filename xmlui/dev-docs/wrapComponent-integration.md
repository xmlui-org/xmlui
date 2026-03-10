# wrapComponent Integration — Lessons Learned from Migrating Link and Card

## Background

`wrapComponent` is a higher-level wrapper that automatically handles prop extraction from an XMLUI node and passes the resolved values to a React component. Its goal is to eliminate the boilerplate of manual `createComponentRenderer` implementations (explicit `extractValue`, `lookupEventHandler`, etc. calls).

The first target was the `Avatar` component, followed by `Link` and `Card`.

---

## Challenge 1: `valueType` vs `type` in Metadata

`wrapComponent`'s auto-detection determines prop types based on the `valueType` field in the component metadata:

```ts
if (propMeta.valueType === "boolean") booleanSet.add(propName);
else if (propMeta.valueType === "number") numberSet.add(propName);
else if (propMeta.valueType === "string") stringSet.add(propName);
```

The Link metadata used `type: "boolean"` for `active` and `noIndicator` instead of `valueType: "boolean"` — so auto-detection skipped them, meaning they would be processed with plain `extractValue()` instead of `extractValue.asOptionalBoolean()`. Similarly, `maxLines` had no `valueType: "number"` set, only a text description.

**Fix:** Use `valueType` consistently in metadata (not `type`), and always declare the correct type for every prop:

```ts
maxLines: {
  description: "...",
  valueType: "number",  // was missing before
},
```

**Lesson:** If a prop arrives in the React component with the wrong type (e.g. string `"true"` instead of boolean `true`), first check whether the metadata uses `valueType` and not `type`.

---

## Challenge 2: Rendering Children

The original `wrapComponent` implementation never called `renderChild(node.children)`. This meant that for any component with XMLUI children (e.g. `<Link>some text</Link>`), the content was never rendered.

In Playwright tests this manifested as `visibility: hidden` / zero-size elements — the elements were present in the DOM (found via `data-testid`) but had no content and therefore zero height.

**Fix:** `renderChild` is now destructured from the renderer context and children are explicitly forwarded:

```ts
const { ..., renderChild } = context;

if (node.children && (Array.isArray(node.children) ? node.children.length > 0 : true)) {
  props.children = renderChild(node.children);
}
```

**Lesson:** `wrapComponent` only processes `node.props` automatically. `node.children` requires explicit handling — this has now been built into the general implementation, so all components using `wrapComponent` automatically get child rendering.

---

## Challenge 3: Prop Semantics Mismatch — `enabled` vs `disabled`

`LinkNative` expected a `disabled` boolean prop, but XMLUI metadata and markup use the `enabled` prop convention (defined via `dEnabled()`). Since `wrapComponent` cannot perform prop negation, an intermediate `LinkAdapter` was initially introduced:

```tsx
const LinkAdapter = forwardRef(({ enabled, label, children, ...props }, ref) => (
  <LinkNative {...props} disabled={enabled === false} ref={ref}>
    {label ?? children}
  </LinkNative>
));
```

**Fix:** The adapter can be eliminated by aligning `LinkNative`'s interface with the XMLUI convention — accept `enabled` directly and handle the negation internally:

```ts
// In Props type:
enabled?: boolean;  // instead of disabled

// Usage:
[styles.disabled]: !enabled,
```

The `label` prop was similarly added to `LinkNative` and handled there directly:

```tsx
const content = label ?? children;
```

**Lesson:** If an adapter only performs prop renaming or negation, it is better to align the native component's interface with the XMLUI convention instead. This simplifies the entire stack and removes an unnecessary layer. The `enabled` prop convention (`dEnabled()`) is widespread in XMLUI; native components should support it directly where possible.

---

## Challenge 4: Children with a Layout Context

Some components do not just pass children through — they wrap them in a specific layout. The original `Card` renderer used:

```tsx
{renderChild(node.children, {
  type: "Stack",
  orientation: "vertical",
})}
```

The layout context instructs the XMLUI engine to wrap the children in a vertical Stack. `wrapComponent` previously only called `renderChild(node.children)` with no layout context, so this information would have been lost.

**Fix:** A `childrenLayoutContext` option was added to `WrapComponentConfig`:

```ts
childrenLayoutContext?: LayoutContext;
```

`wrapComponent` now passes it through when rendering children:

```ts
props.children = renderChild(node.children, config.childrenLayoutContext);
```

The Card renderer becomes:

```ts
export const cardComponentRenderer = wrapComponent(
  COMP,
  ThemedCard,
  CardMd,
  {
    childrenLayoutContext: { type: "Stack", orientation: "vertical" },
  },
);
```

**Lesson:** When migrating a component that calls `renderChild` with a non-trivial layout context, use `childrenLayoutContext` in the `wrapComponent` config. If a component needs *different* layout contexts for different child slots, a manual `createComponentRenderer` is still required.

---

## Challenge 5: Recognising When `wrapComponent` Is Not the Right Tool — Stack

After migrating `Link` and `Card` successfully, `Stack` was the next candidate. Upon inspection it became clear that `wrapComponent` cannot handle it, for several compounding reasons.

**Runtime render-strategy branching.** The renderer is not a simple prop-passthrough — it decides *which* React tree to produce at runtime based on prop values:

```ts
if (allChildren.some(child => child.props?.dock != null)) {
  return renderDockLayout(...);          // completely different JSX tree
}
if (orientation === "horizontal" && wrapContent) {
  return <FlowLayout ...>;              // another distinct tree
}
return <Stack ...>;                     // default path
```

No configuration option in `wrapComponent` can express this kind of branching.

**Dynamic layout context.** The layout context passed to `renderChild` is assembled from runtime values:

```ts
renderChild(node.children, {
  type: "Stack",
  orientation,   // resolved at runtime
  itemWidth,     // resolved at runtime, with orientation-dependent defaults
})
```

`childrenLayoutContext` only accepts a static object, so it cannot carry dynamic values.

**Orientation-dependent `itemWidth` defaults.** The default for `itemWidth` depends on another prop:

```ts
const itemWidth = extractValue.asOptionalString(
  node.props?.itemWidth,
  orientation === "vertical" ? "100%" : "fit-content"
);
```

This cross-prop default logic cannot be expressed in metadata.

**Multiple specialized variants sharing a helper.** `VStack`, `HStack`, `CVStack`, and `CHStack` are all separate renderers that delegate to a shared `renderStack()` helper with fixed orientations and different defaults. Each variant is a renderer in its own right, not just a metadata alias.

**`wrapChild` callbacks in the layout context.** The DockLayout and FlowLayout paths use `wrapChild` functions that apply per-child DOM wrapping based on each child's individual props. This imperative child-level logic has no declarative equivalent in `wrapComponent`.

**Takeaway:** Before attempting a migration, audit the renderer for these signals that indicate `wrapComponent` is unsuitable:

- **Conditional return paths** — the renderer calls different render helpers or returns structurally different JSX depending on prop values
- **Dynamic layout context** — `renderChild` is called with a context object containing runtime-resolved values
- **Cross-prop defaults** — the default value of one prop is derived from another prop's resolved value
- **Per-child `wrapChild` logic** — the layout context contains a `wrapChild` callback that inspects individual child nodes
- **Shared render helpers across variants** — multiple component types call a common function with hard-coded overrides

Stack is the canonical example of a component that belongs in `createComponentRenderer` and should stay there.

---

## Summary — When Does `wrapComponent` Work Well?

`wrapComponent` is a good fit when:

- Prop names and types match what is declared in the metadata
- Every prop has a `valueType` set in the metadata
- XMLUI event names follow the convention that maps cleanly to React prop names (e.g. `click` → `onClick`)
- The native component directly accepts XMLUI prop conventions (`enabled`, `label`, etc.)
- Children either need no layout context or a single static one (`childrenLayoutContext`)
- The renderer has a single, unconditional render path

A manual `createComponentRenderer` is still needed when:

- The renderer branches into different JSX trees based on runtime prop values
- The layout context passed to `renderChild` contains runtime-resolved values
- Default values of props depend on other props' resolved values
- Per-child `wrapChild` callbacks are needed in the layout context
- Multiple component variants share a common render helper with hard-coded overrides
- The native component API cannot be modified (e.g. a third-party library component)

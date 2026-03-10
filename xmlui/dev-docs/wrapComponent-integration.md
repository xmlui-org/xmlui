# wrapComponent Integration — Lessons Learned from Migrating the Link Component

## Background

`wrapComponent` is a higher-level wrapper that automatically handles prop extraction from an XMLUI node and passes the resolved values to a React component. Its goal is to eliminate the boilerplate of manual `createComponentRenderer` implementations (explicit `extractValue`, `lookupEventHandler`, etc. calls).

The first target was the `Avatar` component, followed by `Link`.

---

## Challenge 1: `valueType` vs `type` in Metadata

### Problem

`wrapComponent`'s auto-detection determines prop types based on the `valueType` field in the component metadata:

```ts
if (propMeta.valueType === "boolean") booleanSet.add(propName);
else if (propMeta.valueType === "number") numberSet.add(propName);
else if (propMeta.valueType === "string") stringSet.add(propName);
```

The Link metadata used `type: "boolean"` for `active` and `noIndicator` instead of `valueType: "boolean"` — so auto-detection skipped them, meaning they would be processed with plain `extractValue()` instead of `extractValue.asOptionalBoolean()`.

Similarly, `maxLines` had no `valueType: "number"` set, only a text description.

### Fix

Use `valueType` consistently in metadata (not `type`), and always declare the correct type for every prop:

```ts
maxLines: {
  description: "...",
  valueType: "number",  // was missing before
},
```

### Lesson

If a prop arrives in the React component with the wrong type (e.g. string `"true"` instead of boolean `true`), first check whether the metadata uses `valueType` and not `type`.

---

## Challenge 2: Rendering Children

### Problem

The original `wrapComponent` implementation never called `renderChild(node.children)`. This meant that for any component with XMLUI children (e.g. `<Link>some text</Link>`), the content was never rendered.

In Playwright tests this manifested as `visibility: hidden` / zero-size elements — the elements were present in the DOM (found via `data-testid`) but had no content and therefore zero height.

### Fix

`renderChild` is now destructured from the renderer context and children are explicitly forwarded:

```ts
const { ..., renderChild } = context;

// ...

if (node.children && (Array.isArray(node.children) ? node.children.length > 0 : true)) {
  props.children = renderChild(node.children);
}
```

### Lesson

`wrapComponent` only processes `node.props` automatically. `node.children` requires explicit handling — this has now been built into the general implementation, so all components using `wrapComponent` automatically get child rendering.

---

## Challenge 3: Prop Semantics Mismatch — `enabled` vs `disabled`

### Problem

`LinkNative` expected a `disabled` boolean prop, but XMLUI metadata and markup use the `enabled` prop convention (defined via `dEnabled()`). Since `wrapComponent` cannot perform prop negation, an intermediate `LinkAdapter` was initially introduced:

```tsx
const LinkAdapter = forwardRef(({ enabled, label, children, ...props }, ref) => (
  <LinkNative {...props} disabled={enabled === false} ref={ref}>
    {label ?? children}
  </LinkNative>
));
```

### Fix

The adapter can be eliminated by aligning `LinkNative`'s interface with the XMLUI convention — accept `enabled` directly and handle the negation internally:

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

### Lesson

If an adapter only performs prop renaming or negation, it is better to align the native component's interface with the XMLUI convention instead. This simplifies the entire stack and removes an unnecessary layer. The `enabled` prop convention (`dEnabled()`) is widespread in XMLUI; native components should support it directly where possible.

---

## Summary — When Does `wrapComponent` Work Well?

`wrapComponent` is a good fit when:

- Prop names and types match what is declared in the metadata
- Every prop has a `valueType` set in the metadata
- XMLUI event names follow the convention that maps cleanly to React prop names (e.g. `click` → `onClick`)
- The native component directly accepts XMLUI prop conventions (`enabled`, `label`, etc.)

An adapter layer is only needed when:

- Complex logical transformation is required (beyond simple negation)
- Multiple props need to be combined into one
- The native component API cannot be modified (e.g. a third-party library component)

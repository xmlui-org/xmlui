# wrapComponent Integration — Lessons Learned from Migrating Link, Card, Spinner, Icon, and Image

## Background

`wrapComponent` is a higher-level wrapper that automatically handles prop extraction from an XMLUI node and passes the resolved values to a React component. Its goal is to eliminate the boilerplate of manual `createComponentRenderer` implementations (explicit `extractValue`, `lookupEventHandler`, etc. calls).

The first target was the `Avatar` component, followed by `Link`, `Card`, `Spinner`, `Icon`, and `Image`.

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

## Challenge 6: The `d()` Helper Carries No `valueType`

The `d()` helper is a convenience shorthand for declaring a prop with only a description string. It produces an object with no `valueType` field — so `wrapComponent`'s auto-detection skips it entirely, and the prop is forwarded with a plain `extractValue()` call regardless of its actual type.

This surfaced during the `Icon` migration, where `name`, `size`, and `fallback` were all declared with `d()`:

```ts
// Before — no valueType, wrapComponent cannot infer the type
name: d("The name of the icon to display."),
```

**Fix:** Convert every `d()` declaration that needs a specific type to the object form with an explicit `valueType`:

```ts
// After
name: {
  description: "The name of the icon to display.",
  valueType: "string",
},
```

**Lesson:** `d()` is fine for truly untyped props (e.g. `animation`, internal-only props), but should not be used for props with a known type. When migrating a component, scan all props for `d()` usage and convert those that have a meaningful type. This is a recurring pattern — it appeared in Link (`maxLines`), Icon (`name`, `size`, `fallback`), Image (`src`, `data`, `alt`, `aspectRatio`), and Card (`avatarUrl`).

---

## Challenge 7: Props Resolved via `extractResourceUrl` — `isResourceUrl`

Some props contain logical resource URLs that must be resolved through `extractResourceUrl` rather than plain `extractValue`. The `Image` component's `src` prop is the clearest example: the original renderer called `extractResourceUrl(node.props.src)` explicitly.

`wrapComponent` supports this natively — no manual renderer code is needed. There are two equivalent approaches:

**Option A — metadata flag (preferred):** Add `isResourceUrl: true` to the prop definition. `wrapComponent` reads this flag and automatically routes the prop through `extractResourceUrl`:

```ts
src: {
  description: "...",
  valueType: "string",
  isResourceUrl: true,
},
```

**Option B — config override:** Pass the prop name in `resourceUrls` in the `wrapComponent` config:

```ts
wrapComponent(COMP, ThemedImage, ImageMd, { resourceUrls: ["src"] });
```

Option A is preferred because the intent is expressed directly in the metadata, where it serves as documentation as well.

**Lesson:** For any prop that previously called `extractResourceUrl`, add `isResourceUrl: true` to its metadata entry. The auto-detection in `wrapComponent` handles the rest.

---

## Challenge 8: Prop Name Mismatch Between XMLUI and React — `rename`

XMLUI prop names and React component prop names are sometimes different. The `Image` component exposed this: the XMLUI markup uses `data`, but `ImageNative` expects `imageData`. The original renderer bridged this manually:

```ts
imageData={extractValue(node.props.data)}
```

`wrapComponent` handles this via the `rename` config option, which maps XMLUI prop names to React prop names:

```ts
wrapComponent(COMP, ThemedImage, ImageMd, {
  rename: { data: "imageData" },
});
```

`wrapComponent` extracts `node.props.data`, applies the appropriate type converter (from metadata), and forwards the value as `imageData` to the React component.

**Lesson:** When the XMLUI prop name differs from the React prop name, use `rename` in the config. Do not introduce an adapter component just for a name mapping — `rename` is the right tool for this.

---

## Observation: `valueType` Matters for `data` and `alt` — Native Filtering vs. `asOptionalString`

During the `Image` migration, setting `valueType: "string"` on `data` and `alt` caused two regressions.

**`data` prop:** `ImageNative` expects a `Blob | any` value, not a string. With `valueType: "string"`, `wrapComponent` called `extractValue.asOptionalString()`, which returned a string (or `undefined`) instead of the original Blob. The `instanceof Blob` check in `ImageNative` then always failed, so no blob URL was ever created.

**`alt` prop:** `ImageNative` passes the resolved value through `safeConvertPropToString`, a custom guard that rejects objects, arrays, and functions. With `valueType: "string"`, `extractValue.asOptionalString()` ran first and eagerly converted objects to `"[object Object]"`. Because `safeConvertPropToString` receives a string it always passes it through — the custom filtering was effectively bypassed.

**Fix:** Remove `valueType` from both props so plain `extractValue()` is used. The raw value reaches `ImageNative` unchanged, and the existing guards in the native component handle type checking correctly.

```ts
data: {
  description: `This property contains the binary data that represents the image.`,
  // No valueType — value is Blob | any, not a string
},
alt: {
  description: `This optional property specifies an alternate text for the image.`,
  // No valueType — safeConvertPropToString in ImageNative does the filtering
},
```

**Lesson:** Do not add `valueType: "string"` just because a prop conceptually "contains text". If the native component performs its own type validation or accepts non-string values, use plain `extractValue()` (no `valueType`) so the raw value arrives intact. `valueType` should only be set when the XMLUI-to-React type coercion is actually needed and safe.

---

## Observation: `extractValue.asSize()` and Layout-Derived Props Block Migration — ContentSeparator

`ContentSeparator` was a candidate for `wrapComponent` migration, but two blockers made it unsuitable.

**`extractValue.asSize()`** is not supported by `wrapComponent`. The `thickness` and `length` props must be extracted with `asSize`, which ensures proper CSS unit handling. `wrapComponent` only knows about `boolean`, `number`, `string`, and plain `extractValue` — there is no `size` type slot in `WrapComponentConfig`.

**`hasExplicitLength` — derived from layout-level props.** The renderer computes a synthetic `hasExplicitLength` prop from a combination of the declared `length` prop and the layout-injected `height` / `width` properties:

```ts
const hasExplicitLength = length !== undefined ||
  (orientation === "vertical" && node.props.height !== undefined) ||
  (orientation === "horizontal" && node.props.width !== undefined);
```

`height` and `width` are not declared in `ContentSeparatorMd` — they are layout properties injected by the XMLUI engine and available on `node.props` at renderer time. `wrapComponent` has no mechanism to access these, compute derived values from them, or pass the result as an additional prop.

This is a direct parallel to the `Stack` case (Challenge 5): the renderer computes a prop whose value depends on multiple other props at runtime. No declarative config option can express this logic.

**Takeaway:** `ContentSeparator` stays in `createComponentRenderer`. The two new disqualifying patterns to add to the pre-migration audit checklist are:

- **`extractValue.asSize()` usage** — `wrapComponent` has no size extractor; the prop would arrive without proper CSS unit coercion
- **Derived props from layout-level `node.props`** — synthetic props computed from `height`, `width`, or other engine-injected properties that are not declared in the component's metadata

---

## Observation: Multi-Prop Computed React Props Block Migration — Badge

`Badge` was audited for migration but is not a `wrapComponent` candidate. Three distinct blockers were identified.

**`extractValue.asDisplayText()`** — the `value` prop must be extracted with `asDisplayText`, a converter that `wrapComponent` does not support (only `boolean`, `number`, `string`, and plain `extractValue` are available).

**`color` — a React prop computed from two XMLUI props.** `BadgeNative` accepts a `color` prop, but there is no corresponding `color` prop in the XMLUI markup. Instead, `color` is derived at render time by combining the resolved `colorMap` object with the resolved `value` string, then transforming each color string through `resolveColor()`:

```ts
const colorMap = extractValue(node.props?.colorMap);
const resolvedColor = colorMap[value];
if (typeof resolvedColor === "string") {
  colorValue = resolveColor(resolvedColor);     // "$token" → "var(--token)"
} else if (isBadgeColors(resolvedColor)) {
  colorValue = {
    label: resolveColor(resolvedColor.label),
    background: resolveColor(resolvedColor.background),
  };
}
```

This is a many-to-one transformation: two XMLUI props are merged and transformed to produce one React prop. `wrapComponent` can rename one prop to another, but it has no mechanism to merge and transform multiple props into a single derived prop.

**Complex children fallback.** The children slot has three-level fallback logic:

```ts
{value || (node.children && renderChild(node.children)) || String.fromCharCode(0xa0)}
```

The rendered content is either the display text, XMLUI children, or a non-breaking space — chosen at runtime. `childrenLayoutContext` only controls how children are rendered when they exist; it cannot express this conditional selection logic.

**Takeaway:** `Badge` stays in `createComponentRenderer`. A new disqualifying pattern is confirmed: when a React prop is the result of a runtime transformation that combines or derives from multiple XMLUI props (beyond simple renaming or negation), `wrapComponent` is not suitable.

---

## Observation: Clean Migration Without a `ThemedX` Wrapper — ToneChangerButton and TreeDisplay

Two additional components were migrated cleanly with no new challenges.

**ToneChangerButton** had no `ThemedX` wrapper — the component handles its own rendering via `useThemes()` and delegates theming to the `Button` and `Icon` it renders internally. `wrapComponent` passed props directly to the `ToneChangerButton` function component without any adapter. The only fix needed was adding `valueType: "string"` to `lightToDarkIcon` and `darkToLightIcon`, which were previously declared without `valueType`.

**TreeDisplay** had an existing `ThemedTreeDisplay` wrapper but the original renderer was passing props directly to `TreeDisplay` (bypassing the wrapper), which meant the theme class was not being applied. The migration to `wrapComponent(COMP, ThemedTreeDisplay, TreeDisplayMd)` simultaneously fixed this gap and eliminated the boilerplate renderer. All props already had `valueType` set correctly.

**Lesson:** `wrapComponent` does not require a `ThemedX` wrapper. If a component handles theming internally (e.g. by composing already-themed components), pass the component function directly. Conversely, if a `ThemedX` wrapper exists, always prefer it over the bare native component — otherwise the theme class will not be applied.

**Secondary lesson (TreeDisplay):** When migrating, check whether the original renderer used the `ThemedX` wrapper or bypassed it. A bypass is a pre-existing bug — the migration is a good opportunity to fix it at no extra cost.

---

## Observation: Dynamic Whitelist-Based Prop Forwarding Blocks Migration — Text

`Text` was the next candidate after `TreeDisplay` but cannot be migrated. The decisive blocker is a pattern not seen before: **dynamic whitelist-based prop forwarding**.

The renderer filters `node.props` at runtime against a static whitelist (`VariantPropsKeys`) and spreads the matching entries onto the native component:

```ts
const variantSpecificProps: VariantProps = Object.fromEntries(
  Object.entries(variantSpecific)
    .filter(([key, _]) => VariantPropsKeys.includes(key as any))
    .map(([key, value]) => [key, extractValue(value)]),
);

return <Text ... {...variantSpecificProps}>;
```

This is fundamentally different from `wrapComponent`'s forwarding model. `wrapComponent` forwards every key present in `node.props` (with optional type coercion per key). The `Text` renderer actively selects a subset of props based on a runtime inclusion test — a level of filtering that has no equivalent in `WrapComponentConfig`.

The two additional blockers from `Badge` also appear here: `extractValue.asDisplayText(value)` and the `value || renderChild(node.children)` conditional children pattern.

**Takeaway:** `Text` stays in `createComponentRenderer`. The new disqualifying pattern: **dynamic prop subsetting** — when the renderer iterates `node.props` and selectively forwards only keys that pass a runtime test (whitelist, type check, or similar), `wrapComponent` cannot replicate this because its forwarding model is unconditional (all declared props are forwarded, none are filtered mid-flight).

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
- A prop must be extracted with `extractValue.asSize()` (no size extractor in `wrapComponent`)
- A synthetic prop is computed from layout-level `node.props` (`height`, `width`) that are not declared in the component's metadata
- A React prop is produced by combining or transforming multiple XMLUI props at runtime (beyond simple renaming or negation)
- A prop requires `extractValue.asDisplayText()` or other non-standard extractors not supported by `wrapComponent`
- The children slot has conditional selection logic (e.g. display text vs. children vs. fallback placeholder)
- The renderer dynamically subsets `node.props` using a runtime whitelist or type test before forwarding

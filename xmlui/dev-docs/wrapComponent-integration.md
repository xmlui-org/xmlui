# wrapComponent Integration — Lessons Learned

## Background

`wrapComponent` is a higher-level wrapper that automatically handles prop extraction from an XMLUI node and passes the resolved values to a React component. Its goal is to eliminate the boilerplate of manual `createComponentRenderer` implementations (explicit `extractValue`, `lookupEventHandler`, etc. calls).

The first target was the `Avatar` component, followed by `Link`, `Card`, `Spinner`, `Icon`, `Image`, `ToneChangerButton`, `TreeDisplay`. Components audited but kept in `createComponentRenderer`: `Stack`, `ContentSeparator`, `Badge`, `Text`.

---

## Problem 1: Wrong or Missing `valueType` in Metadata

`wrapComponent` determines prop types from the `valueType` field:

```ts
if (propMeta.valueType === "boolean") booleanSet.add(propName);
else if (propMeta.valueType === "number") numberSet.add(propName);
else if (propMeta.valueType === "string") stringSet.add(propName);
```

Three recurring causes of missing or wrong type detection:

**a) `type` instead of `valueType`** — Link used `type: "boolean"` for `active` and `noIndicator`. Auto-detection skips it, so plain `extractValue()` is used instead of `extractValue.asOptionalBoolean()`.

**b) `d()` helper carries no `valueType`** — `d()` produces only a description string with no type field. This appeared in Link (`maxLines`), Icon (`name`, `size`, `fallback`), Image (`src`, `data`, `alt`, `aspectRatio`), and Card (`avatarUrl`).

```ts
// Before — wrapComponent cannot infer the type
name: d("The name of the icon to display."),

// After
name: {
  description: "The name of the icon to display.",
  valueType: "string",
},
```

**c) Wrong `valueType` breaks native component logic** — During the Image migration, setting `valueType: "string"` on `data` caused `asOptionalString()` to be called, which returned a string instead of the original `Blob`, breaking the `instanceof Blob` check in `ImageNative`. Similarly, `valueType: "string"` on `alt` bypassed the `safeConvertPropToString` guard by eagerly converting objects to `"[object Object]"`.

Fix: remove `valueType` from both so plain `extractValue()` is used and the raw value reaches the native component unchanged.

**Checklist:**

- Always use `valueType`, never `type`
- Convert `d()` to the object form for every prop with a known type
- Do not add `valueType: "string"` if the native component performs its own type check or accepts non-string values

---

## Problem 2: Children Not Rendered

The original `wrapComponent` never called `renderChild(node.children)`. Components with XMLUI children (e.g. `<Link>some text</Link>`) rendered as zero-height hidden elements — present in the DOM via `data-testid` but with no content.

**Fix:** `renderChild` is now destructured from the renderer context and children are forwarded automatically:

```ts
if (node.children && (Array.isArray(node.children) ? node.children.length > 0 : true)) {
  props.children = renderChild(node.children);
}
```

**Extension — static layout context for children:** Some components wrap children in a specific layout. The original `Card` renderer passed a layout context to `renderChild`:

```tsx
renderChild(node.children, { type: "Stack", orientation: "vertical" })
```

A `childrenLayoutContext` option was added to `WrapComponentConfig`:

```ts
export const cardComponentRenderer = wrapComponent(
  COMP,
  ThemedCard,
  CardMd,
  { childrenLayoutContext: { type: "Stack", orientation: "vertical" } },
);
```

**Limitation:** `childrenLayoutContext` only accepts a static object. If a component needs runtime-resolved values in the layout context, or different contexts for different child slots, a manual `createComponentRenderer` is required.

---

## Problem 3: Prop Name or Semantic Mismatch

**a) `enabled` vs `disabled` convention** — `LinkNative` expected `disabled`, but XMLUI uses `enabled` (via `dEnabled()`). An intermediate `LinkAdapter` was initially introduced to negate the prop. The cleaner fix is to align the native component's interface with the XMLUI convention:

```ts
// In Props type — accept enabled directly
enabled?: boolean;

// Usage
[styles.disabled]: !enabled,
```

If an adapter only renames or negates a prop, remove it and change the native component instead.

**b) XMLUI prop name ≠ React prop name** — `Image` exposes `data` in markup but `ImageNative` expects `imageData`. Use the `rename` config option:

```ts
wrapComponent(COMP, ThemedImage, ImageMd, {
  rename: { data: "imageData" },
});
```

`wrapComponent` extracts `node.props.data`, applies type coercion from metadata, and forwards the value as `imageData`.

**c) Props resolved via `extractResourceUrl`** — `Image`'s `src` must go through `extractResourceUrl`, not plain `extractValue`. Add `isResourceUrl: true` to the metadata entry (preferred):

```ts
src: {
  description: "...",
  valueType: "string",
  isResourceUrl: true,
},
```

Alternatively, pass the prop name in `resourceUrls` in the config. The metadata flag is preferred as it serves as documentation.

---

## Problem 4: Unsupported Extractor Types

`wrapComponent` only supports `boolean`, `number`, `string`, and plain `extractValue`. Two extractors with no equivalent in `wrapComponent` are disqualifying blockers:

**`extractValue.asSize()`** — Used by `ContentSeparator` for `thickness` and `length` to ensure correct CSS unit handling. No `size` type slot exists in `WrapComponentConfig`.

**`extractValue.asDisplayText()`** — Used by `Badge` (the `value` prop) and `Text`. No display-text extractor is available in `wrapComponent`.

When a prop requires either of these extractors, the component cannot be migrated and must stay in `createComponentRenderer`.

---

## Problem 5: Computed or Derived Props

`wrapComponent` maps one XMLUI prop to one React prop. When a React prop is computed from multiple inputs, or derived from engine-injected properties, migration is blocked.

**a) Cross-prop defaults** — `Stack`'s `itemWidth` default depends on `orientation`:

```ts
const itemWidth = extractValue.asOptionalString(
  node.props?.itemWidth,
  orientation === "vertical" ? "100%" : "fit-content"
);
```

This cross-prop default logic has no equivalent in metadata.

**b) Multi-prop → single React prop** — `Badge`'s `color` React prop is derived at runtime by combining `colorMap` and `value`, then running each color string through `resolveColor()`. `wrapComponent` can rename one prop to another, but cannot merge or transform multiple props into a single derived prop.

**c) Derived from layout-level `node.props`** — `ContentSeparator` computes `hasExplicitLength` from `length`, `orientation`, and the engine-injected `height` / `width` properties, which are not declared in the component metadata. `wrapComponent` has no mechanism to read these or pass a synthetic derived prop to the native component.

---

## Problem 6: Complex Render Logic (Migration Blockers)

`wrapComponent` assumes a single, unconditional render path: extract props → forward to component. The following patterns make migration impossible:

**Conditional JSX trees** — `Stack`'s renderer branches into `renderDockLayout`, `FlowLayout`, or `Stack` depending on runtime prop values. No config option can express this structural branching.

**Dynamic layout context** — `Stack` assembles the layout context from runtime values (`orientation`, `itemWidth`). `childrenLayoutContext` only accepts a static object.

**Per-child `wrapChild` callbacks** — `Stack`'s DockLayout and FlowLayout paths use `wrapChild` functions that apply per-child DOM wrapping based on each child's individual props. This imperative logic has no declarative equivalent.

**Multiple variants sharing a render helper** — `VStack`, `HStack`, `CVStack`, and `CHStack` all delegate to a shared `renderStack()` helper with hard-coded overrides. Each is a renderer in its own right, not a metadata alias.

**Dynamic prop subsetting** — `Text` filters `node.props` at runtime against a static whitelist (`VariantPropsKeys`) and spreads only matching entries:

```ts
const variantSpecificProps = Object.fromEntries(
  Object.entries(variantSpecific)
    .filter(([key]) => VariantPropsKeys.includes(key as any))
    .map(([key, value]) => [key, extractValue(value)]),
);
```

`wrapComponent`'s forwarding model is unconditional — all declared props are forwarded. It cannot replicate a runtime inclusion test.

**Conditional children selection** — `Badge` and `Text` select content via:

```ts
{value || (node.children && renderChild(node.children)) || String.fromCharCode(0xa0)}
```

`childrenLayoutContext` controls how children render when they exist; it cannot express this three-level fallback selection.

---

## Problem 7: Theming — `ThemedX` Wrapper

`wrapComponent` does not require a `ThemedX` wrapper. Two lessons from `ToneChangerButton` and `TreeDisplay`:

- If a component handles theming internally (e.g. by composing already-themed components), pass the bare component function directly. `ToneChangerButton` uses `useThemes()` internally and needed no wrapper.
- If a `ThemedX` wrapper exists, always pass it to `wrapComponent`, not the bare native component — otherwise the theme class is not applied. `TreeDisplay`'s original renderer bypassed `ThemedTreeDisplay` (a pre-existing bug). The migration fixed it at no extra cost.

**Checklist when migrating:** verify whether the original renderer used `ThemedX` or bypassed it. A bypass is a bug — fix it as part of the migration.

---

## Pre-Migration Audit Checklist

Before attempting a migration, check the renderer for these signals:

### Metadata

- [ ] All props use `valueType`, not `type`
- [ ] No `d()` on props with a known type
- [ ] No prop requires a converter `wrapComponent` doesn't support (`asSize`, `asDisplayText`, etc.)

### Props

- [ ] No cross-prop defaults (default of one prop derived from another)
- [ ] No multi-prop → single React prop transformations
- [ ] No synthetic props derived from engine-injected `height`/`width` on `node.props`
- [ ] XMLUI→React name mismatches can be covered by `rename`
- [ ] `enabled`/`disabled` convention mismatch can be fixed in the native component

### Children

- [ ] Layout context for children is static (or none) — use `childrenLayoutContext`
- [ ] No conditional children selection logic

### Render structure

- [ ] Single, unconditional JSX return path
- [ ] No per-child `wrapChild` callbacks in the layout context
- [ ] No dynamic prop subsetting via runtime whitelist or type test
- [ ] Not one of multiple variants sharing a common render helper

---

## Summary — When `wrapComponent` Works Well vs. When It Doesn't

**Good fit:**

- Props map 1:1 from XMLUI to React (or need only renaming via `rename`)
- All props have `valueType` set correctly in metadata
- Event names follow the convention mapping cleanly to React prop names
- Native component accepts XMLUI conventions (`enabled`, `label`, etc.) directly
- Children need no layout context, or a single static one
- Single, unconditional render path

**Requires `createComponentRenderer`:**

- Renderer branches into different JSX trees based on runtime prop values
- Layout context passed to `renderChild` contains runtime-resolved values
- Default values of props depend on other props' resolved values
- Per-child `wrapChild` callbacks needed in the layout context
- Multiple component variants share a common render helper
- Prop requires `extractValue.asSize()` or `extractValue.asDisplayText()`
- Synthetic prop computed from layout-level `node.props` (`height`, `width`)
- React prop produced by combining or transforming multiple XMLUI props
- Children slot has conditional selection logic (display text vs. children vs. fallback)
- Renderer dynamically subsets `node.props` via a runtime whitelist or type test

---

## Templates, Renderers, and contentClassName

Three features added to `wrapComponent` (and `wrapCompound`) that unlock migration for components using `dComponent()` template props and portal-based dropdowns.

### Auto-Detection of ComponentDef Props

Props with `valueType: "ComponentDef"` in metadata are automatically detected. By default they are rendered as static React nodes via `renderChild()` and passed to the native component using the same prop name — no config needed.

```ts
// metadata has: emptyListTemplate: dComponent("..."),
// wrapComponent auto-detects it and does: renderChild(node.props.emptyListTemplate)
export const myRenderer = wrapComponent(COMP, MyComponent, MyMd);
```

### `templates` — Rename Static Template Props

Use when the React prop name differs from the XMLUI prop name:

```ts
wrapComponent(COMP, MyComponent, MyMd, {
  templates: { headerTemplate: "header" },
  // or array form to keep same name:
  // templates: ["headerTemplate"],
});
```

### `renderers` — Render-Prop Templates with Context Variables

Use for template props that the native component invokes as callbacks, passing runtime data (e.g., the current list item) to the XMLUI template via context variables.

```ts
wrapComponent(COMP, AutoComplete, AutoCompleteMd, {
  renderers: {
    // Positional form: args[0] → $item, args[1] → $selectedValue, args[2] → $inTrigger
    optionTemplate: {
      contextVars: ["$item", "$selectedValue", "$inTrigger"],
    },
  },
});
```

Convention: `optionTemplate` maps to React prop `optionRenderer` (replaces `Template` suffix with `Renderer`). Override with `reactProp`:

```ts
renderers: {
  itemTemplate: {
    reactProp: "renderItem",  // custom React prop name
    contextVars: ["$item"],
  },
}
```

Use `null` to skip a callback argument position:

```ts
contextVars: ["$item", null, "$index"]  // args[1] is skipped
```

For computed context variables, use a function:

```ts
renderers: {
  itemTemplate: {
    reactProp: "itemRenderer",
    contextVars: (item, _key, rowIndex, count, isSelected) => ({
      $item: item,
      $itemIndex: rowIndex,
      $isFirst: rowIndex === 0,
      $isLast: rowIndex === count - 1,
      $isSelected: isSelected,
    }),
  },
}
```

When a renderer is defined for a prop, auto-detection skips it (no duplicate handling). When the template prop is absent in markup, the render-prop callback is `undefined` — matching the manual pattern.

### `contentClassName` — Portal Theme Class Forwarding

Components with Radix portals (Select, AutoComplete, DatePicker) need theme classes forwarded to the portal content. Enable with:

```ts
wrapComponent(COMP, MyComponent, MyMd, {
  contentClassName: true,
});
// equivalent to: props.contentClassName = classes?.[COMPONENT_PART_KEY]
```

### Example: Complete AutoComplete-Style Migration

```ts
export const autoCompleteComponentRenderer = wrapComponent(
  COMP,
  AutoComplete,
  AutoCompleteMd,
  {
    contentClassName: true,
    exposeRegisterApi: true,
    renderers: {
      optionTemplate: {
        contextVars: ["$item", "$selectedValue", "$inTrigger"],
      },
    },
  },
);
```

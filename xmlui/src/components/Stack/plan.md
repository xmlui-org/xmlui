# Layout Context Propagation — Improvement Plan

## Current Mechanism

Layout context is a plain object (`LayoutContext`) defined in `RendererDefs.ts` that flows through the rendering pipeline:

```
Parent renderer  →  renderChild(children, layoutContext)
                        ↓
                    renderChild.tsx  →  ComponentWrapper
                        ↓
                    ComponentWrapper  →  stableLayoutContext ref  →  ContainerWrapper / ComponentAdapter
                        ↓
                    Container.tsx  →  stableRenderChild(children, layoutContextRef?.current, ...)
                        ↓
                    ComponentAdapter  →  rendererContext.layoutContext  (consumed by component renderers)
                                     →  resolveLayoutProps(props, layoutContext)  (CSS resolution)
                                     →  layoutContextRef.current.wrapChild()  (per-child wrapping)
```

The `LayoutContext` type is:
```typescript
type LayoutContext = {
  type?: string;              // "Stack", "DockLayout", "FlowLayout"
  wrapChild?: (ctx, rendered, metadata) => ReactNode;
  [key: string]: any;         // orientation, itemWidth, ignoreLayoutProps, etc.
};
```

## Identified Problems

### Problem 1: One-Level-Only Propagation

Layout context is **replaced** at each `renderChild` call — it does not accumulate. When a Stack passes `{ type: "Stack", orientation: "horizontal" }`, any intermediate component that calls `renderChild(node.children)` **without** a layout context argument drops the context entirely. The child sees `layoutContext === undefined`.

Affected components include: Table (Column cell templates), Tabs (TabItem), Accordion (AccordionItem), Tree, Form, Checkbox, AutoComplete, Toast, and all Chart components — any component using `MemoizedItem` without passing `layoutContext`.

### Problem 2: Table Cell Context Gap

Table columns render cell templates via `MemoizedItem` in `ColumnNative.tsx`:
```typescript
<MemoizedItem
  node={nodeChildren!}
  contextVars={{ $item: row, ... }}
  renderChild={renderChild}
  // ❌ layoutContext is NOT passed
/>
```

`MemoizedItem` supports an optional `layoutContext` prop, but Table/Column never provides it. A Stack inside a table cell has no knowledge that it's in a table cell, what orientation applies, etc.

### Problem 3: No Depth/Ancestry Information

The current layout context carries only the **immediate parent's** layout type and orientation. There is no history of the layout hierarchy. Components cannot know:
- How deeply nested they are in the layout tree
- What the ancestor chain of layout types looks like (e.g., "I'm in a Stack inside a Card inside another Stack")
- Whether they are inside a particular container (e.g., a Table, Modal, Form)

### Problem 4: Context Is Discarded by "Transparent" Components

Components like Tooltip, Bookmark, Footer pass through the `layoutContext` they receive from the renderer context, which is correct. But many components that should be "transparent" (merely nesting without creating a new layout) don't pass context at all — their `renderChild(node.children)` call has no second argument.

### Problem 5: `wrapChild` Is Not Composable

The `wrapChild` function from a parent layout replaces any wrapping from a grandparent. There is no mechanism to compose or chain `wrapChild` functions from multiple ancestors.

---

## Backward Compatibility

Each step is designed so that **existing behavior is preserved** after completion:

- **Step 1** is purely additive — a new helper function and refined type. No existing code is touched, so nothing can break.
- **Step 2** changes the *shape* of the context object Stack produces (adds `depth` and `parent` fields), but existing consumers only read `type`, `orientation`, and `itemWidth`. The extra fields are simply ignored by current code. No behavioral change.
- **Steps 3–4** fix bugs: components that previously received `layoutContext === undefined` now receive a context object. The only downstream consumer is `resolveLayoutProps`, which checks `type === "Stack"` for star sizing and flex-shrink. Since new context types like `"Table"`, `"TableCell"`, etc. don't match that check, the CSS resolution produces identical results. Behavior is preserved.
- **Step 5** wraps an existing static object with `createChildLayoutContext`, adding `depth`/`parent` — same argument as Step 2, extra fields are ignored.
- **Steps 6–7** are purely additive (new helpers/new opt-in consumers). No existing component changes behavior unless explicitly updated.

In summary: at the end of every step, the test suite should pass with no regressions.

---

## Improvement Plan

### Step 1: Define a Structured `LayoutContext` Type

**Goal:** Replace the weakly-typed `[key: string]: any` bag with well-defined fields, including a `parent` chain for depth and ancestry tracking.

**Changes:**
- In `RendererDefs.ts`, define a new structured `LayoutContext`:
  ```typescript
  type LayoutContext = {
    type?: string;
    orientation?: string;
    itemWidth?: string;
    ignoreLayoutProps?: string[];
    depth: number;          // 0 at root, incremented by each layout provider
    parent?: LayoutContext; // link to the enclosing layout context (or undefined at root)
    wrapChild?: (...) => ReactNode;
  };
  ```
- Add a helper: `createChildLayoutContext(parentContext, newFields)` that builds a new context with `depth = (parent?.depth ?? -1) + 1` and `parent = parentContext`.

**Testing:** Unit test for `createChildLayoutContext` — verify depth increments, parent chain is set, fields are merged.

---

### Step 2: Stack Provides Structured Context

**Goal:** Update the Stack component to use `createChildLayoutContext` instead of inline object literals.

**Changes:**
- In `Stack.tsx`, replace each `renderChild(node.children, { type: "Stack", orientation, itemWidth })` with:
  ```typescript
  renderChild(node.children, createChildLayoutContext(layoutContext, {
    type: "Stack",
    orientation,
    itemWidth,
  }))
  ```
- Same for DockLayout and FlowLayout variants.
- The renderer receives `layoutContext` from its `RendererContext`, which is the **incoming** context from the parent — this becomes the `parent` field of the new context.

**Testing:** E2E or unit test that renders a nested `Stack > Stack` and verifies the inner Stack's `layoutContext.depth === 1` and `layoutContext.parent.type === "Stack"`.

---

### Step 3: Table/Column Passes Layout Context to Cell Templates

**Goal:** Fix the Table cell context gap so that components inside table cells know they are in a Table context.

**Changes:**
- In `Table.tsx`, where `renderChild(node.children)` is called (line ~662/665), pass a Table-specific layout context:
  ```typescript
  renderChild(node.children, createChildLayoutContext(layoutContext, {
    type: "Table",
  }))
  ```
- In `ColumnNative.tsx`, pass the layout context to `MemoizedItem`:
  ```typescript
  <MemoizedItem
    node={nodeChildren!}
    contextVars={{ $item: row, ... }}
    renderChild={renderChild}
    layoutContext={createChildLayoutContext(undefined, { type: "TableCell" })}
  />
  ```
  Note: The Column component does not currently have access to the parent's layout context. This may require threading the `layoutContext` through the `Column` props or using a React context provider on the Table side.

**Testing:** Render a `Table > Column (with cellTemplate containing a Stack)`. Verify the Stack inside the cell sees `layoutContext.type === "TableCell"` and `layoutContext.parent.type === "Table"`.

---

### Step 4: Propagate Context Through "Transparent" Components

**Goal:** Components that don't create their own layout (Tooltip, Bookmark, Accordion, AccordionItem, TabItem, etc.) should forward the incoming `layoutContext` when rendering their children — **without touching each component's source code**.

**Key insight:** Instead of editing every transparent component, we can make the `renderChild` function automatically inherit the parent's context when no explicit context is passed. The change is a single fallback in `memoedRenderChild` inside `ComponentAdapter.tsx`:

```typescript
// ComponentAdapter.tsx — memoedRenderChild
const memoedRenderChild: RenderChildFn = useCallback(
  (children, layoutContext, pRenderContext) => {
    return renderChild(
      children,
      layoutContext ?? layoutContextRef.current,  // ← fallback to parent's context
      pRenderContext || parentRenderContext,
      uidInfoRef,
    );
  },
  [renderChild, parentRenderContext, uidInfoRef, layoutContextRef],
);
```

With this one-line change (`layoutContext ?? layoutContextRef.current`):
- **Transparent components** (call `renderChild(node.children)` with no second arg → `layoutContext` is `undefined`) automatically inherit the incoming context. Zero source changes needed.
- **Layout providers** (Stack, Card, Modal, etc.) pass an explicit context object → `??` short-circuits and the explicit context is used, as before.
- **Explicit context reset:** if a component ever needs to intentionally *block* propagation, it can pass `null` and we use `layoutContext !== undefined ? layoutContext : layoutContextRef.current` instead of `??`. (For now `??` is sufficient since no current component passes `null`.)

This also applies to `MemoizedItem` usages — `MemoizedItem` calls the same `renderChild` prop (which is `memoedRenderChild`), so when Column renders cells without passing `layoutContext`, the fallback kicks in and the Table's context flows through automatically.

**Changes:**
- In `ComponentAdapter.tsx`, modify `memoedRenderChild` to fall back to `layoutContextRef.current`.
- Spot-check a few components that **should** block propagation (e.g., Modal, Drawer) and verify they already pass an explicit context. If any don't but should, add an explicit context for them.

**Testing:** Render `Stack(horizontal) > Tooltip > SpaceFiller`. Verify the SpaceFiller inside Tooltip still sees the Stack's horizontal orientation (i.e., context passes through without any change to Tooltip's source).

---

### Step 5: Provide `layoutContext` Through `wrapComponent` Config

**Goal:** Extend the `wrapComponent`/`wrapCompound` helper so that components using the shorthand form can declare a layout context for children.

**Changes:**
- The existing `childrenLayoutContext` in `WrapComponentConfig` currently takes a static object. Update `wrapComponent.tsx` to wrap it with `createChildLayoutContext(rendererContext.layoutContext, config.childrenLayoutContext)` so the parent chain and depth are always maintained.
- Consider adding a `childrenLayoutContextFactory` callback for dynamic cases.

**Testing:** A component built with `wrapComponent` and `childrenLayoutContext: { type: "Stack", orientation: "vertical" }` (e.g., Card) should produce a context with correct depth and parent chain.

---

### Step 6: Add Ancestor Query Helpers

**Goal:** Provide utility functions that let components inspect the layout context chain.

**Location:** Create a dedicated file `xmlui/src/abstractions/layout-context-utils.ts`. This file co-locates with `RendererDefs.ts` (where `LayoutContext` is defined) and keeps the type definition file free of runtime logic. It imports only the `LayoutContext` type, so it has no circular-dependency risk. Both core infrastructure (`components-core/`) and component renderers (`components/`) can import from it.

**Changes:**
- Create `xmlui/src/abstractions/layout-context-utils.ts` with:
  ```typescript
  import type { LayoutContext } from "./RendererDefs";

  /** The depth of this context node (0 for root layout providers). */
  export function getLayoutDepth(ctx?: LayoutContext): number;

  /** Walk the parent chain and return the first ancestor with the given type. */
  export function findAncestorLayout(ctx: LayoutContext, type: string): LayoutContext | undefined;

  /** Whether any ancestor (including self) has the given type. */
  export function isInsideLayout(ctx: LayoutContext, type: string): boolean;

  /** Returns the type chain from root to self, e.g. ["Stack", "Table", "TableCell"]. */
  export function getLayoutPath(ctx: LayoutContext): string[];
  ```
- The `createChildLayoutContext` helper from Step 1 also lives in this file.
- Re-export from `RendererDefs.ts` for convenience so existing import paths work.

**Testing:** Unit tests for each helper with various context chains.

---

### Step 7: Consume Depth/Ancestry in Components

**Goal:** Use the depth information for visual or behavioral adaptation.

**Changes (examples):**
- Stack could use `depth` to adjust default styles (e.g., nested Stacks could reduce gaps).
- A component inside a Table cell could detect it's in a table and opt out of certain layout behaviors.
- SpaceFiller could verify it's actually inside a Stack and warn if not.

**Testing:** E2E tests validating depth-dependent behavior for specific use cases.

---

## Implementation Order and Dependencies

```
Step 1  (LayoutContext type + helper)
  ↓
Step 2  (Stack uses new helper)          ← can be tested independently after Step 1
  ↓
Step 3  (Table/Column context gap)       ← uses helper from Step 1
  ↓
Step 4  (Transparent component audit)    ← uses helper from Step 1
  ↓
Step 5  (wrapComponent integration)      ← uses helper from Step 1
  ↓
Step 6  (Query helpers)                  ← uses type from Step 1
  ↓
Step 7  (Consumer components)            ← uses helpers from Step 6
```

Steps 2–5 are independently testable after Step 1, and can be done in parallel if desired. Steps 6–7 are additive and can be deferred.

## Files to Modify

| Step | Files |
|------|-------|
| 1 | `xmlui/src/abstractions/RendererDefs.ts`, `xmlui/src/abstractions/layout-context-utils.ts` (new) |
| 2 | `xmlui/src/components/Stack/Stack.tsx` |
| 3 | `xmlui/src/components/Table/Table.tsx`, `xmlui/src/components/Column/ColumnNative.tsx` |
| 4 | `xmlui/src/components-core/rendering/ComponentAdapter.tsx` (single change) |
| 5 | `xmlui/src/components-core/wrapComponent.tsx` |
| 6 | `xmlui/src/abstractions/layout-context-utils.ts` (extend with query helpers) |
| 7 | Component renderers consuming depth (Stack, SpaceFiller, etc.) |

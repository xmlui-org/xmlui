# Stack Layout Enhancement Plan

## Current State Analysis

### Stack architecture
- `StackNative.tsx` — React component wrapping `Scroller` (from ScrollViewer), handles orientation, alignment, hover animation, scroll APIs.
- `Stack.tsx` — metadata + renderer; produces either a `<Stack>` or a `<FlowLayout>` (when `wrapContent=true` + horizontal).
- `Stack.module.scss` — base flexbox styles; no intrinsic sizing, `min-height: 0 / min-width: 0` already set.
- `Scroller.tsx` — wraps children in either a plain `<div>` (scrollStyle "normal") or an `OverlayScrollbarsComponent`.
- Layout props (`width`, `height`, `overflowX`, `overflowY`, `canShrink`, etc.) are resolved by `layout-resolver.ts` and injected as a className on each component via `ComponentAdapter`.

### Known issues / missing features
1. **Docking / self-sizing**: Stack has no `dock` prop. Users must use width/height layout props manually. No shorthand to dock to sides or stretch within the parent. Default width is determined by `itemWidth` on the *parent* stack — not a prop of Stack itself.
2. **Child display control**: `wrapContent` exists for horizontal stacks but applies globally. There is no per-child `canShrink` shorthand propagated from the parent, no `overflow` control specific to Stack (users rely on `overflowX`/`overflowY` layout props). Text truncation requires manual `wordBreak`/`textWrap`/`overflow` layout props on each `Text` child.
3. **Table cell overflow**: When Stack is inside a `<td>`, the cell's `div.cellContent` applies `overflow: hidden` and `max-width: 100%`, but Stack children default to `flexShrink: 0` (set in `layout-resolver.ts` for any item inside a flex container). A Stack inside a table cell thus pushes past the column width. Root cause: `layout-resolver.ts` forces `flexShrink: 0` for any child in an orientation context, and `cellContent` has no explicit `width: 100%`.
4. **Vertical auto-scroll**: Stack does not scroll vertically unless the user adds `height` + `overflowY="scroll"` layout props. There is no convenient `autoScroll` or `scrollable` prop.
5. **Scroller uses `overlayscrollbars`**: `scrollStyle` ≠ "normal" uses `OverlayScrollbarsComponent`. User wants Radix `ScrollArea` as an alternative primitive so scrollbar styling uses design tokens, not a separate library. Note: `@radix-ui/react-scroll-area` is **not yet** in `xmlui/package.json`.
6. **`scrollStyle` / `showScrollerFade` already exist on Stack** — these were recently added. The underlying `Scroller` already handles them (overlay scrollbars + fade indicators).

---

## Proposed Changes (Steps)

### Step 1 — `dock` child prop: DockPanel layout inside a Stack

`dock` is a prop set **on children** of a Stack, not on the Stack itself. When any direct child carries a `dock` prop, the parent Stack renderer switches from the standard flexbox path to a nested-flex **DockPanel layout**.

#### Prop values

| Value | Meaning |
|---|---|
| `"top"` | Placed at top of remaining space, full width, explicit height respected |
| `"bottom"` | Placed at bottom of remaining space, full width, explicit height respected |
| `"left"` | Placed at left of middle row, full middle-row height, explicit width respected |
| `"right"` | Placed at right of middle row, full middle-row height, explicit width respected |
| `"stretch"` | Fills all remaining space in the middle row; own `width` and `height` are ignored |

Children without a `dock` prop participate in the normal flex flow inside the middle row (if mixed usage is needed) or default to `"stretch"` behavior.

#### Algorithm (sequential, WPF DockPanel–style)

Children are processed **in declaration order**. Each one removes space from the remaining area in its dock direction:

```
<Stack height="500px">         ← parent; becomes the outer vertical flex
  <Stack id="st1" dock="top" height="100px"/>    → row 1 (top, 100 px)
  <Stack id="st2" dock="top" height="100px"/>    → row 2 (top, 100 px)
  <Stack id="st3" dock="bottom" height="100px"/> → last row (bottom, 100 px)
  <Stack id="st4" dock="left" width="50%"/>      → middle-row left, 50% wide
  <Stack id="st5" dock="stretch"/>               → middle-row, fills rest (ignores w/h)
</Stack>
```

#### CSS implementation — nested flex containers

The renderer groups children by dock direction and emits two wrapper `<div>` elements (no additional XMLUI components):

```
<div style="display:flex; flex-direction:column; [parent height]">   ← outer flex
  {children with dock="top", in order}        each: width:100%, explicit height
  <div style="display:flex; flex-direction:row; flex:1; min-height:0"> ← middle row
    {children with dock="left", in order}     each: explicit width, height:100%
    {children with dock="stretch" / undocked} each: flex:1
    {children with dock="right", in reverse order} each: explicit width, height:100%
  </div>
  {children with dock="bottom", in reverse order} each: width:100%, explicit height
</div>
```

Key CSS rules applied to each docked child by the renderer (merged into the child's existing layout class):

- `dock="top"` / `dock="bottom"`: `align-self: stretch; flex-shrink: 0`
- `dock="left"` / `dock="right"`: `align-self: stretch; flex-shrink: 0`
- `dock="stretch"`: `flex: 1; min-width: 0; min-height: 0` (width/height props of the child are not forwarded to the layout resolver → they are ignored)

#### Implementation location

`stackComponentRenderer` in `Stack.tsx` — new `renderDockLayout()` function, called when `node.children` contains at least one child whose props include a `dock` key.

The renderer reads each child's raw `dock` prop via `extractValue(child.props?.dock)` before calling `renderChild`. The actual children are rendered with `renderChild` in their respective slots, each with an appropriate layout context override (e.g. `ignoreLayoutProps: ["width"]` for stretch children).

#### Metadata

Add `dock` to `StackMd` props as a documented, non-CSS string prop (it is NOT added to `layoutOptionKeys` since it is not a CSS layout property — it is consumed by the parent renderer, not the child's own layout resolver). Propagate to `VStackMd`, `HStackMd`, `CVStackMd`, `CHStackMd`.

#### Dynamic resize behaviour

Because the entire DockPanel layout is **pure CSS flexbox** (no JS measurement or explicit pixel calculations), all docked regions reflow automatically whenever the parent container changes size — whether due to browser window resize, panel collapse/expand, or any other layout change. No `ResizeObserver` or JS dimension tracking is required.

Percentage widths (`width="50%"`) on `dock="left"` / `dock="right"` children are percentages of the **middle row flex container**, which itself fills the leftover space between the top and bottom docked items. Percentage heights on `dock="top"` / `dock="bottom"` are percentages of the **outer flex container** (the parent Stack). Both cases resize continuously as the parent reflows.

`dock="stretch"` uses `flex: 1` so it always fills the remaining middle-row space without needing explicit dimensions.

The only constraint: the **parent Stack must have a defined height** (via its own `height` layout prop, or by being stretched by its own parent). If the parent has no height the outer flex column has no bound; `dock="bottom"` items will render immediately after the top items and the middle row will have zero height. This is standard CSS flex behaviour and should be documented as a usage note.

#### Tests

- Unit spec: top + bottom docked children occupy correct bounds in a fixed-height parent.
- Unit spec: left + right docked children occupy correct bounds alongside a stretch child.
- Unit spec: `dock="stretch"` ignores explicit width/height.
- Unit spec: sequential top items stack from top; bottom items stack from bottom inward.
- E2E spec: resize the viewport — docked children reflow correctly without JS intervention.

### Step 2 — `overflow` and `canShrinkContent` props on Stack
Add two Stack-level props:
- `overflow`: `"visible" | "hidden" | "auto" | "scroll"` — shorthand that sets both `overflowX` and `overflowY` as inline styles. Simplifies the common case of `overflowX="hidden" overflowY="hidden"`.
- `canShrinkContent` (boolean, default `false`): when `true`, renders children with `flexShrink: 1` instead of `0` (overrides the `layout-resolver` default). Useful when Stack is inside a constrained container (table cell, another Stack) and should prevent children from inflating it.

Implement in renderer: pass the value to `Stack` native as an additional style prop influencing how it renders its flex children. The wrapping of children in the layout context carries this info.

**Tests**: spec asserting `overflow: hidden` (and both axes) appears; spec for `canShrinkContent`.

### Step 3 — Fix Stack overflow in table cells
Root cause: Stack children get `flexShrink: 0` from `layout-resolver.ts` **and** the `div.cellContent` in `Table.module.scss` does not force `width: 100%` on its child.

Fix in two places:
1. `Table.module.scss` — add `width: 100%` and `min-width: 0` to `.cellContent` so flex children respect the column width.
2. `Table.tsx` cellTemplate layout context — pass `{type: "TableCell"}` layout context when rendering the cell template so children inside do not blindly get `flexShrink: 0`. Alternatively, always set `min-width: 0` on Stack when it is the direct child of a flex/grid container (already partially handled by the `min-width: 0` in `.base`).

Investigation note: `min-width: 0` is already on `.base` in Stack SCSS, so the real fix is (1) above — forcing `cellContent` to `width: 100%`.

**Tests**: E2E or unit spec asserting a Stack inside a Table column renders within the column bounds.

### Step 4 — `scrollable` convenience prop for vertical auto-scroll
Add a boolean `scrollable` prop (default `false`) to Stack.
- When `true`: Stack sets `overflowY: auto` and ensures `height: 100%` is applied (or expands to fill available space) so vertical content scrolls inside the Stack rather than growing the page.
- Users still control exact height via the existing `height` layout prop; `scrollable` is just a shorthand to avoid having to also set `overflowY`.
- In the renderer: when `scrollable=true`, inject `{overflowY: "auto"}` into the Stack's `style` prop (merged after layout CSS so user's explicit `overflowY` takes precedence).
- Update scroll API methods (`scrollToTop`, `scrollToBottom`) — they already work; document that they require `scrollable=true` or an explicit height.

**Tests**: spec asserting vertical overflow occurs when `scrollable` is false (no scroll) and does not overflow when `scrollable` is true.

### Step 5 — Text truncation prop (`truncate`)
Add a `truncate` boolean prop to Stack (and expose it so it can also be set individually on `Text`).
- On Stack: when `true`, propagate `{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}` as a layout context hint, so all direct text children receive these styles automatically.
- The layout context already supports `ignoreLayoutProps`; extend it to carry optional `inheritedStyles` that children pick up when they have no explicit override.
- Alternatively (simpler): just apply these CSS props as an additional class on the Stack element itself — they cascade to text children by CSS inheritance (color, font, text-overflow do not cascade; however wrapping the Stack in an `overflow: hidden` element and applying CSS `text-overflow` requires the text node to be in the same block). Most reliable approach: expose `truncate` on `Text` component separately and document that Stack's `truncate` sets `overflow: hidden` on itself only.

After investigation, the recommended minimal approach:
- Stack `truncate` prop → adds `overflow: hidden; min-width: 0` to the Stack itself (stops it expanding) and adds a `.truncate` class (`white-space: nowrap; text-overflow: ellipsis; overflow: hidden`) that cascades.
- `Text` component gets a separate `truncate` prop that applies the same CSS directly.

**Tests**: spec for Stack `truncate` with long content; spec for `Text truncate`.

### Step 6 — Replace `overlayscrollbars` with Radix `ScrollArea` in Scroller
Add `@radix-ui/react-scroll-area` as a dependency (it aligns with the existing Radix family already used).
Refactor `Scroller.tsx`:
- `scrollStyle="normal"` → plain `<div>` (unchanged).
- `scrollStyle="overlay" | "whenMouseOver" | "whenScrolling"` → use `<ScrollArea.Root>` + `<ScrollArea.Viewport>` + `<ScrollArea.Scrollbar>` + `<ScrollArea.Thumb>` from `@radix-ui/react-scroll-area`.
  - `overlay` → `type="always"`
  - `whenMouseOver` → `type="hover"`
  - `whenScrolling` → `type="scroll"`
- Theme variables already defined in `ScrollViewer.module.scss` for handle/track/size are mapped to CSS targeting Radix's className parts (`[data-radix-scroll-area-scrollbar]`, etc.).
- Fade indicators (`showScrollerFade`) are reimplemented on top of `ScrollArea.Viewport` scroll events (same logic, different host element).
- The `OverlayScrollbarsComponent` import is removed; `overlayscrollbars-react` and `overlayscrollbars` become optional/removed dependencies.
- Ref forwarding: Radix `ScrollArea.Viewport` exposes its DOM node; forward the ref there so existing `scrollToTop` / `scrollToBottom` APIs continue to work.

**Tests**: unit/snapshot tests checking the correct Radix elements render for each `scrollStyle` value.

---

## Execution Order & Dependencies

```
Step 1 (dock)          → independent, metadata + renderer only
Step 2 (overflow/canShrinkContent) → independent
Step 3 (table cell fix) → independent (Table + minor CSS)
Step 4 (scrollable)    → independent
Step 5 (truncate)      → independent
Step 6 (Radix ScrollArea) → depends on nothing but is highest risk; do last
```

All steps are independent and can be executed in any order. The order above is suggested by increasing complexity / risk.

---

## Files Affected

| File | Steps |
|---|---|
| `Stack/Stack.tsx` (metadata + renderer) | 1, 2, 4, 5 |
| `Stack/StackNative.tsx` | 4, 5 |
| `Stack/Stack.module.scss` | 5 |
| `Stack/Stack.spec.ts` | 1, 2, 4, 5 |
| `components-core/descriptorHelper.ts` | — (no change; `dock` is NOT a layout CSS prop) |
| `Table/Table.module.scss` | 3 |
| `Table/Table.tsx` | 3 |
| `Table/Table.spec.ts` | 3 |
| `ScrollViewer/Scroller.tsx` | 6 |
| `ScrollViewer/ScrollViewer.module.scss` | 6 |
| `xmlui/package.json` | 6 (add `@radix-ui/react-scroll-area`) |

---

## Step Status

- [x] Step 1 — `dock` prop
- [x] Step 2 — `overflow` and `canShrinkContent` props
- [x] Step 3 — Table cell overflow fix
- [ ] Step 4 — `scrollable` convenience prop
- [ ] Step 5 — `truncate` prop
- [ ] Step 6 — Radix ScrollArea integration

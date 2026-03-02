# Plan: Replace Scroller with Radix Scroll Area in Stack

## Current Architecture

### StackNative.tsx
- The `<Stack>` component's root element is `<Scroller>` from `ScrollViewer/Scroller.tsx`.
- Props forwarded to `Scroller`: `scrollStyle`, `showScrollerFade`, `style`, `className`, event handlers.
- `containerRef` is forwarded to `Scroller` via `forwardRef` and used by the four `scrollTo*` APIs (`scrollToTop`, `scrollToBottom`, `scrollToStart`, `scrollToEnd`).

### Scroller.tsx (current implementation)
- `scrollStyle="normal"` → plain `<div ref={ref}>` — the forwarded ref works correctly.
- `scrollStyle="overlay" | "whenMouseOver" | "whenScrolling"` → `<div className={fadeContainer}><OverlayScrollbarsComponent>…</OverlayScrollbarsComponent>[fade overlays]</div>`
  - **Bug**: the forwarded `ref` is not attached to any element in these modes — it is captured by an internal `osInstanceRef` callback instead. This means `containerRef` is `null` in overlay modes and the `scrollTo*` APIs don't work.
- 20+ theme variables for scrollbar track/handle styling, transitions, and fade overlays — consumed via SCSS and applied to OverlayScrollbars' CSS custom properties.
- Fade overlay logic: two absolute-positioned `<div>`s toggled via React state, driven by `scroll`, `resize`, and `transitionend` event listeners on the OverlayScrollbars viewport.
- `transitionend` listener watches `grid-template-rows` / `opacity` transitions (NavGroup expand/collapse) and force-updates the OverlayScrollbars instance.

### FlowLayout (out of scope)
`FlowLayoutNative.tsx` also uses `Scroller`, but that is separate from the Stack refactoring. Cross-component cleanup can follow after this refactor is validated.

---

## Radix Scroll Area Mapping

| `scrollStyle` value | Current (OverlayScrollbars `autoHide`) | Radix `type` |
|---|---|---|
| `"normal"` | native `<div>` | native `<div>` (skip Radix entirely) |
| `"overlay"` | `autoHide: "never"` | `"always"` |
| `"whenMouseOver"` | `autoHide: "leave"` + 200 ms delay | `"hover"` |
| `"whenScrolling"` | `autoHide: "scroll"` + 400 ms delay | `"scroll"` |

Radix `scrollHideDelay` (ms) maps to our `autoHideDelay-whenMouseOver-Scroller` / `autoHideDelay-whenScrolling-Scroller` theme vars.

The Radix Scroll Area DOM structure:
```
<ScrollArea.Root>          ← outer wrapper, gets CSS classes
  <ScrollArea.Viewport>   ← the actual scrolling div, receives the forwarded ref
    {children}
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar orientation="vertical">
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
  <ScrollArea.Scrollbar orientation="horizontal">
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
  <ScrollArea.Corner />
</ScrollArea.Root>
```

Radix uses `[data-radix-scroll-area-viewport]` on the Viewport element (instead of OverlayScrollbars' `[data-overlayscrollbars-viewport]`). Tests that target the internal viewport selector must be updated.

---

## Theme Variable Impact

The existing `ScrollViewer.module.scss` theme variables are applied to OverlayScrollbars' CSS custom property names (`--os-size`, etc.). For Radix we apply the same XMLUI theme variables directly to the Radix `Scrollbar` and `Thumb` elements via CSS. The names of the XMLUI theme variables remain unchanged (no user-facing breaking change).

---

## Key Implementation Changes in StackNative.tsx

1. **Add Radix import**: `import * as ScrollArea from "@radix-ui/react-scroll-area"`.
2. **Remove `Scroller` import**.
3. For `scrollStyle !== "normal"`, replace `<Scroller>` with a local `<RadixScrollArea>` helper component (defined in the same file or in a small sibling file `StackScroller.tsx`).
4. Forward `containerRef` to `<ScrollArea.Viewport>` so all `scrollTo*` APIs work correctly (also fixes the existing bug where they silently fail in overlay modes).
5. Attach scroll / resize listeners for `showScrollerFade` to the Radix Viewport element directly via `ref.current.addEventListener(...)`.
6. Replicate the `transitionend` listener on the Radix Viewport for NavGroup expand/collapse compatibility.
7. Keep `scrollStyle="normal"` path as a plain `<div ref={containerRef}>` — no Radix involved.

---

## Step-by-Step Plan

### Step 1 — Add `@radix-ui/react-scroll-area` dependency [x]
- Run `npm i @radix-ui/react-scroll-area` inside `xmlui/`.
- Verify the package resolves and a trivial import doesn't break the build (`npm run build:xmlui-standalone`).
- No test changes required for this step.

### Step 2 — Introduce `StackScroller` (Radix-based scrollable wrapper) [x]
- Create `StackScroller.tsx` in the `Stack/` folder.
- Implement a `StackScroller` forwardRef component that accepts the exact same props as the `Scroller` (minus the OverlayScrollbars internals) and renders Radix Scroll Area for non-"normal" modes.
- Forward ref to the `ScrollArea.Viewport` element.
- Implement `showScrollerFade` using scroll and resize listeners directly on the Viewport ref.
- Implement the `transitionend` listener for NavGroup-style transitions.
- Add SCSS for Radix scrollbar/thumb styling using the existing XMLUI theme variables.
- **Tests**: Unit tests for each `scrollStyle` value verifying:
  - Correct Radix elements are rendered (`[data-radix-scroll-area-viewport]` present for non-"normal").
  - Plain `<div>` rendered for `scrollStyle="normal"`.
  - Fade overlays appear/disappear as expected.

### Step 3 — Wire `StackScroller` into `StackNative.tsx` [x]
- Replace the `<Scroller>` root element with `<StackScroller>` in `StackNative.tsx`.
- Remove the `Scroller` import.
- Verify that `containerRef` now correctly points to the Radix Viewport (scrollTo APIs work in all modes).
- **Tests**: Run all existing `Stack.spec.ts` tests. Update any assertions referencing `[data-overlayscrollbars-viewport]` to use `[data-radix-scroll-area-viewport]`.

### Step 4 — Fix scrollTo* API for overlay modes [x]
- The `scrollTo*` methods in `registerComponentApi` already target `containerRef.current`. Because Step 2 wires the ref to the Radix Viewport, they should now work for all `scrollStyle` values.
- Add unit tests proving `scrollToTop`, `scrollToBottom`, `scrollToStart`, `scrollToEnd` function correctly when `scrollStyle="overlay"`.

### Step 5 — Remove OverlayScrollbars from Stack's dependency tree [x]
- Verify `overlayscrollbars` and `overlayscrollbars-react` are not imported anywhere in Stack-related files.
- Check whether any other components still need OverlayScrollbars (ScrollViewer does — so do NOT remove it from `package.json`; just confirm there are no leftover imports from the Stack module).

### Step 6 — Update documentation and changeset [x]
- Update `Stack.md` if the DOM structure change needs documenting for theme/CSS customisers.
- Add a `patch` changeset: `"xmlui": patch` with a description noting the scrollbar backend change.

---

## Resources
- Component conventions: `xmlui/dev-docs/conv-create-components.md`
- E2E testing conventions: `xmlui/dev-docs/conv-e2e-testing.md`
- Rendering pipeline: `xmlui/dev-docs/standalone-app.md`
- Radix Scroll Area docs: https://www.radix-ui.com/primitives/docs/components/scroll-area
- Current `Scroller` impl: `xmlui/src/components/ScrollViewer/Scroller.tsx`
- Current `FlowLayout` Scroller usage: `xmlui/src/components/FlowLayout/FlowLayoutNative.tsx`

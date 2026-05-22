# Component Classification for `computedUses` Optimization

This document describes the strategy for identifying "heavy" components that require the automatic creation of a state container (`StateContainer`) to provide a `React.memo` boundary and reactive dependency narrowing.

## 1. Concept and Criteria

According to the `computedUses` architecture, components are categorized based on their impact on rendering performance. Without isolation (provided by an implicit container), heavy components would re-render on every change of *any* parent state variable, leading to significant delays in complex interfaces.

Criteria for a "heavy" component:
1.  **Data Multipliers:** The component accepts a data array and renders multiple sub-components or complex DOM nodes for each item (lists, tables, grids).
2.  **DOM Complexity:** The component has a deep or large DOM structure (calendars, complex dropdowns, trees).
3.  **Expensive Computation:** The component performs resource-intensive processing during render (Markdown parsing, complex layout calculations).

We do **not** isolate simple components (layouts like `VStack`, primitives like `Text`), as creating additional `StateContainers` for them only increases the React tree depth and memory overhead without real performance benefit.

---

## 2. Component Categories

### 🔴 Optimized (Heavy)
These components have the `isImplicitContainerByDefault: true` flag in their metadata. This activates *conditional* promotion to a container: if the component has actual dependencies on the parent state, it receives its own `StateContainer` and `computedUses`.

*   **`List`**, **`Table`**, **`DataGrid`**, **`TileGrid`**: Classic data iterators. They have the highest impact on performance.
*   **`Select`**, **`AutoComplete`**: Render potentially large lists of options.
*   **`Tree`**: Recursive structure with a large number of nodes.
*   **`Markdown`**: Performs expensive content parsing and on-the-fly component generation.
*   **`Form`**: Often contains many input fields and validation logic.
*   **`Tabs`**, **`Stepper`**: Coordinate the rendering of multiple panels.
*   **`ModalDialog`**, **`Drawer`**: High-level structural components that isolate their content.

### 🟡 Under Consideration (Medium Priority)
These components have some complexity but usually do not scale linearly with data to critical limits. Their isolation may be added later based on profiling results of real applications.

*   **`DatePicker`**, **`DateInput`**, **`ColorPicker`**: Render complex popups but are often lazily mounted or internally optimized.
*   **`ContextMenu`**, **`DropdownMenu`**: Renders a list of actions. The list is usually short, but re-rendering could be avoided.
*   **`FileUploadDropZone`**: Some DOM complexity, but mostly static until interaction.
*   **`Page`** *(layout)*: Strong candidate — see deep analysis below.
*   **`Splitter`** *(layout)*: Moderate candidate — see deep analysis below.

#### Page — Strong Candidate with Important Caveats

`Page` is the only layout component that warrants serious consideration as a heavy component.

**Pros:**

*   **Natural "screen" boundary.** A `Page` corresponds to a single route and typically owns hundreds of descendants. This is the most organic level for state scoping among all layout components.
*   **App-level dependencies are common.** Pages routinely read `user`, `locale`, `theme`, and navigation parameters from the App container. Without a `React.memo` shield, any change to App-level state cascades through the entire active screen.
*   **Mounting amortizes the cost.** A `Page` is created/destroyed on navigation, so an additional `StateContainer` is negligibly cheap compared to the full screen mount itself.
*   **Low instance count.** Only one `Page` is active at a time, unlike hundreds of `Stack` instances per page. The cumulative overhead is bounded.

**Where to be careful:**

1.  **`customRender` and the "Runtime Restructure" invariant (see §5 in [computed-uses-specification.md](./computed-uses-specification.md)).** `Page` is defined via `wrapComponent(...customRender)` in `Pages.tsx`. Internally, `RouteWrapper` creates an on-the-fly wrapper `{ type: "Fragment", uid, vars: EMPTY_OBJECT, children: [childRoute] }` and renders it through `renderChild`. This is exactly the class of runtime tree mutation where a statically-computed `computedUses` may become stale. Before enabling `isImplicitContainerByDefault`, verify that this restructure either (a) recomputes `computedUses`, or (b) explicitly discards it.
2.  **Partial container semantics may already exist.** The inner Fragment with `uid` and `vars: EMPTY_OBJECT` might already be treated as container-like (depending on the `isContainerLike` implementation). If `Page` de facto already becomes an implicit container through this mechanism, the flag changes nothing — an integration test should confirm this before claiming a win.
3.  **Explicit Owner conflict with `var.x` on Page.** When a user writes `<Page var.x="...">`, `Page` is already an Explicit Container. Implicit promotion becomes a no-op (correct behavior), but make sure `registerComponentApi` delegation (UID-escaping mechanism, §4 of specification) still works for `Page`'s descendants in both modes.
4.  **`TableOfContentsProvider` placement.** `Page` wraps its content in `<TableOfContentsProvider>`. If the new `StateContainer` lands *above* the TOC provider, nothing changes. If it lands *below*, verify that TOC registration of descendants does not depend on the parent container's identity.
5.  **Routing regression risk.** Any change to `Page`'s wrapping structure has potential to break navigation E2E tests. A full regression run of existing route tests is mandatory.

**Recommended test set before enabling:**

*   `Page` with nested `Form`/`Table` reading App-level vars — verify children Heavy components do not get double-isolated.
*   `<Page var.x="...">` — promotion must be a no-op (component is already an Explicit Container).
*   `Page` with no read-deps — promotion must be skipped (Case E in §3 of the specification).
*   Navigation between Pages, verifying TOC identity and API registration of descendants.

#### Splitter — Moderate Candidate, Deferred

**Pros:**

*   **Heavy interactive behavior.** Drag-resize generates events at ~60fps. Without a shield, these events propagate as parent re-renders.
*   **Two logically distinct content zones** (sidebar+main, navigator+editor) — changes in one panel should not affect the other.
*   **Internal DOM complexity.** ~18 use\*-hooks in `SplitterReact`, drag-overlay, resizer handle.

**Cons (why deferred):**

1.  **Only two child slots.** Multiplication factor is 2x, not 100x as in `List`. The benefit of a shield is bounded.
2.  **Heavy children already get their own shield.** When `Form`/`Table`/`Tabs` sit inside a panel, they are already Implicit Containers under the current optimization. An additional shield at the `Splitter` level adds little.
3.  **Global tree position.** `Splitter` typically lives at App-level (sidebar+main), pinned, with rare re-mounts. The cost of `StateContainer` is constant overhead.
4.  **Possible interaction with internal state.** `Splitter`'s drag state (divider position) lives inside `SplitterReact` across ~18 hooks. If those values are published via `registerComponentApi`, the shield is harmless. If they expect a fresh parent state on every drag tick (e.g., for clamp-to-container), verify that `fullParentStateRef` (§4 of the specification) supplies up-to-date values.

**Recommendation:** Leave `Splitter` without `isImplicitContainerByDefault` until **measured** scenarios appear (React DevTools profiles) where `Splitter`'s drag events cause frame-rate regressions due to a wide parent state. This matches the spirit of this section — *"may be added later based on profiling results"*.

### 🟢 Light (No Isolation Needed)
These components remain "bare" (without `StateContainer`), keeping the React tree flat and fast. The decision is final — adding `isImplicitContainerByDefault` to them would be counterproductive.

*   **Layouts**: `App`, `HStack`, `VStack`, `Stack`, `FlowLayout`, `Fragment`.
    *   `App` — already always an Explicit Container (root with vars/themes/routes); implicit promotion is non-applicable.
    *   `HStack`, `VStack`, `Stack` — mass components (hundreds of instances per page) with small subtrees. The cumulative `StateContainer` overhead would exceed the benefit, and any heavy children (`Form`, `Table`, etc.) already get their own shield.
    *   `FlowLayout` — carries a `deprecationMessage`; the planned replacement is `HStack` with `wrapContent={true}`. Investing in an API that is being removed is an anti-pattern.
    *   `Fragment` — renders no DOM, cannot serve as a boundary.
*   **Primitives**: `Text`, `Heading`, `Link`, `Icon`, `Avatar`, `Badge`, `ProgressBar`, `Spinner`, `Image`.
*   **Basic Inputs**: `Button`, `Checkbox`, `Switch`, `Slider`, `TextBox`, `TextArea`, `RadioGroup`.
*   **Logical Components**: `Timer`, `APICall`, `DataSource`, `AppState`, `ChangeListener`, `Redirect`.

---

## 3. Implementation Mechanism

Instead of hardcoded lists, the system uses component metadata (`ComponentMetadata`).

1.  If `isImplicitContainerByDefault: true` is set in the metadata, the `computedUses` optimizer considers the component as a candidate for isolation.
2.  If expression analysis shows that the component reads variables from the parent state (`nonDynamicReadDeps.size > 0`), it receives `computedUses` and becomes a container.
3.  If the component is completely static or only uses local/injected variables, it does **not** become a container to avoid unnecessary overhead.

This approach allows extending the list of heavy components (including those in extension packages) without interfering with the optimizer's core.

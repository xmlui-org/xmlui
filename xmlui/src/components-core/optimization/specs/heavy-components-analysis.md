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

### 🟡 Under Consideration (Medium Priority)
These components have some complexity but usually do not scale linearly with data to critical limits. Their isolation may be added later based on profiling results of real applications.

*   **`Form`**: May contain many fields and validation logic.
*   **`DatePicker`**, **`DateInput`**, **`ColorPicker`**: Render complex popups but are often lazily mounted or internally optimized.
*   **`Tabs`**, **`Stepper`**: Coordinate the rendering of multiple panels.
*   **`ModalDialog`**, **`Drawer`**: Structural components that are usually wrappers for other heavy content.

### 🟢 Light (No Isolation Needed)
These components remain "bare" (without `StateContainer`), keeping the React tree flat and fast.

*   **Layouts**: `App`, `HStack`, `VStack`, `Stack`, `Splitter`, `FlowLayout`, `Fragment`, `Page`.
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

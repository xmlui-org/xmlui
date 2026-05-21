# Analysis of XMLUI Components for `computedUses` Shielding

## 1. Context & Criteria

According to the `computedUses` design, "heavy" components are those that render large amounts of data or complex DOM structures. Without a `React.memo` shield (provided by an implicit `StateContainer`), these components would re-render every time *any* parent state variable changes. This causes severe performance degradation (e.g., 50+ renders per second). 

The criteria for a component to be considered "Heavy" and explicitly added to `IMPLICIT_CONTAINER_COMPONENT_NAMES` MVP list:
1. **Data Multipliers:** It accepts an array of data and renders multiple sub-components or complex DOM nodes per item (e.g., lists, grids, tables).
2. **DOM Complexity:** It renders a deeply nested or large DOM structure (e.g., complex pickers, calendars, trees).
3. **Expensive Computation:** It performs expensive processing on render (e.g., parsing markdown, complex layout calculations).

We do NOT want to shield simple layout components (like `VStack`, `HStack`) or simple primitives (`Text`, `Button`) because wrapping them in `StateContainer` adds unnecessary React tree depth and memory overhead, which defeats the purpose of the optimization.

---

## 2. Component Classification

### 🔴 Definitely Heavy (MVP Candidates for `IMPLICIT_CONTAINER_COMPONENT_NAMES`)

These components clearly iterate over data or have significant rendering overhead. They *must* be shielded.

*   **`Select`** *(Already implemented)*: Renders a dropdown list of options. Can easily have hundreds of items.
*   **`List`** *(Already implemented)*: Classic data multiplier.
*   **`Table`** *(Already implemented)*: Grid of data, potentially very large DOM size (rows × columns).
*   **`DataGrid`** *(Already implemented)*: Similar to Table, heavy DOM and logic.
*   **`Tree`**: Renders hierarchical data. Highly recursive, lots of DOM nodes. Unnecessary re-renders here are fatal.
*   **`TileGrid`**: Similar to `List`, renders a grid of child components based on a data array.
*   **`AutoComplete`**: Similar to `Select`, filters and renders a dropdown list of suggestions.
*   **`Markdown`**: Parses string into AST and renders corresponding React components. Parsing and rendering large text blocks on every parent state tick is very expensive.

### 🟡 Medium (Borderline / Monitor for future)

These components have some complexity (e.g., popups, internal state, multi-step rendering), but they usually don't scale infinitely with data like tables or lists. They might benefit from shielding if users complain about performance, but we can skip them in the MVP to avoid over-containerization.

*   **`Form`**: Often contains many input fields and validation logic. However, forms usually don't have thousands of fields. Shielding might be useful if validation is slow.
*   **`DatePicker` / `DateInput` / `TimeInput` / `ColorPicker`**: Render complex popup UIs (calendars, palettes). The popup itself is heavy, but it might be internally optimized or portaled.
*   **`Tabs` / `Stepper`**: They coordinate multiple child panes. Re-rendering might be slightly expensive depending on whether hidden tabs are unmounted or just hidden.
*   **`ModalDialog` / `Drawer`**: High-level structural components. Typically, they wrap other heavy components (which would have their own shields).
*   **`ContextMenu` / `DropdownMenu`**: Renders a list of actions. The list is usually short (<20 items), so re-rendering isn't a massive bottleneck.
*   **`FileUploadDropZone`**: Some DOM complexity, but mostly static until interaction.

### 🟢 Light (Do NOT shield)

These are primitives, simple wrappers, layout structures, or purely logical components. Adding `StateContainer` to these would add overhead for zero benefit.

*   **Layout & Structural**: `App`, `HStack`, `VStack`, `Stack`, `CHStack`, `CVStack`, `Splitter`, `VSplitter`, `HSplitter`, `FlowLayout`, `SpaceFiller`, `ContentSeparator`, `Fragment`, `Page`, `Pages`, `Theme`, `ScrollViewer`, `ResponsiveBar`.
*   **Primitives & Typography**: `Text`, `Heading`, `H1`-`H6`, `Link`, `Logo`, `Icon`, `Avatar`, `Badge`, `ProgressBar`, `Spinner`, `Tooltip`, `Image`, `IFrame`, `QRCode`.
*   **Basic Inputs**: `Button`, `Checkbox`, `Switch`, `ToneSwitch`, `ToneChangerButton`, `Slider`, `TextBox`, `TextArea`, `PasswordInput`, `NumberBox`, `RadioGroup`, `FileInput`.
*   **Logical (No DOM)**: `Timer`, `APICall`, `DataSource`, `AppState`, `ChangeListener`, `MessageListener`, `Redirect`.
*   **Sub-components (Rendered by parents)**: `Step`, `TabItem`, `FormItem`, `FormSegment`, `MenuItem`, `SubMenuItem`, `MenuSeparator`, `Option`, `Column`, `ExpandableItem`, `Items`, `Slot`.

---

## 3. Verdict for MVP

For the Minimum Viable Product of the `computedUses` Mandatory Shielding, the `IMPLICIT_CONTAINER_COMPONENT_NAMES` should contain exactly those components that can scale linearly or exponentially in DOM nodes based on data, plus those with expensive render-time parsing.

**Final MVP List:**
1.  `Select`
2.  `List`
3.  `Table`
4.  `DataGrid`
5.  `Tree`
6.  `TileGrid`
7.  `AutoComplete`
8.  `Markdown`

*(Note: `Form`, `DatePicker`, and others can be added later if profiling shows them to be bottlenecks in real-world apps).*
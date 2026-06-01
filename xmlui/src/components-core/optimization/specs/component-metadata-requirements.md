# Component Metadata Requirements for the `computedUses` Mechanism

This document explains at a high level what specific metadata components must provide for the narrowing and render optimization mechanism to function correctly.

---

## 1. What Metadata is Needed?

When a developer creates a component in XMLUI (via `createMetadata`), they must explicitly describe several things for the optimizer. This data is specified either in the `optimization: {}` block or directly within the event descriptions.

Main metadata fields:

1. **`isImplicitContainerByDefault: true`**
   - **For whom:** For "heavy" components (e.g., `Table`, `List`, `Form`, `Select`).
   - **What it does:** Tells the optimizer: "This component is complex. If it reads anything from the parent state, automatically wrap it in an isolating container so it doesn't re-render because of its neighbors."

2. **`childInjectedVars: ["$item", "$index", ...]`**
   - **For whom:** For any component (even "light" ones) that injects new variables for its child elements.
   - **Example:** The `List` component iterates through an array and provides access to `$item` for each row.
   - **What it does:** Tells the analyzer: "If you see the word `$item` inside my children, know that it is **my** local variable; do not look for it in the state of the entire application."

3. **`events[event_name].injectedVars: ["$data", "$error", ...]`**
   - **For whom:** For any event of any component that passes special arguments to the handler.
   - **Example:** The `onFetch` event in `DataLoader` provides the `$data` variable.
   - **What it does:** Similar to the previous one: warns the optimizer that `$data` inside `onFetch="{ ... }"` is a local event argument, not a global dependency.

---

## 2. What Happens if These Metadata are Forgotten?

The absence of this metadata **almost never breaks the application's logic visually** (the app won't crash to a white screen). However, it leads to **"silent degradation"** of performance.

### Situation A: Forgotten `isImplicitContainerByDefault` (for a heavy component)
- **Result:** Absence of optimization.
- **Explanation:** The component (e.g., a massive table) will not receive its own "buffer zone." It will re-render every time a cursor blinks or a timer ticks somewhere on the page.

### Situation B: Forgotten `childInjectedVars` or `injectedVars`
- **Result:** Appearance of "False dependencies" and potential unnecessary re-renders.
- **Explanation:** Imagine you created a `<Gallery>` component that gives children an `$image` variable. But you forgot to include `childInjectedVars: ["$image"]`.
  1. The optimizer scans the markup `<Text value="{$image.name}" />`.
  2. It sees `$image` and thinks: *"Oh, this is some external variable the component expects from the application!"*.
  3. It adds `$image` to the `computedUses` list for the entire page.
  4. The page starts constantly monitoring whether the global/external `$image` variable has changed. If someone else in another part of the app changes a variable with the same name, our gallery will unexpectedly re-render (because it subscribed to this external variable due to an analyzer error).
  5. During the actual render, the local `$image` will still "override" the external one (so the logic won't break), but the **rendering process will occur more often than necessary**.

---

## 3. Burden on Component Developers

This architecture indeed places a significant load on developers who create new components (especially in extensions).

**What is the problem (burden)?**
The requirement to specify `injectedVars` applies to **absolutely all components**, not just heavy ones.
Even if you are creating a tiny, primitive component (e.g., `<IconButton>`), but it has an `onHover="{ ... }"` event that passes an `$isHovered` variable, you are **obliged** to describe this in the metadata.

**Why it is difficult:**
- **Logic duplication:** The component developer must keep in mind that the variable needs not only to be written in the code (where the callback `dispatchEvent({ $isHovered: true })` is called) but also **duplicated as a string** in `createMetadata`.
- **Easy to forget:** If a developer forgets to do this, TypeScript will not show an error. Local testing of the component will be successful. The problem (unnecessary re-renders due to "false dependencies") will only surface when this component starts being used actively in large applications.

---

## 4. Error Protection Mechanisms

Since missing metadata could lead to "silent" performance degradation, the framework employs strict mechanisms to catch these omissions early. These mechanisms are designed to be robust against common development patterns and common mistakes.

### 4.1. Do existing tests protect developers from forgetting metadata?

**Yes, for injected variables.** The framework has multi-layered guards against forgetting `childInjectedVars` and `injectedVars`:

1. **Runtime Guards (`validateInjectedVars`) — 100% Accuracy**
   Unlike static analysis, this guard works with **real runtime values**. In development mode (`DEV`), the framework monitors the actual objects being injected into children or passed to event handlers. If it sees a key starting with `$` (e.g., `$item`) that isn't in the component's metadata, it throws an error immediately. This works regardless of how complex the component's internal file structure is or how the variable was calculated.

2. **AST-based Build-time Extraction**
   The system that extracts metadata for the optimizer uses a **full AST parser** (Babel), not regular expressions. 
   - **No Comment Hazards:** Since it operates on the Abstract Syntax Tree, it ignores comments entirely. You cannot "fool" the system with old commented-out code.
   - **Static Literal Enforcement:** It requires that `childInjectedVars` and `injectedVars` are defined as static string arrays. This ensures the optimizer can reliably "know" the dependencies without executing the code.

3. **Static Drift Detection (CI Protection)**
   Unit tests (e.g., `renderer-metadata-drift.test.ts`) scan the entire codebase at PR time.
   - **File Structure Awareness:** The scanner recursively traverses directories and identifies sibling files (e.g., it looks at both `Table.tsx` and `TableReact.tsx`) to ensure that variables defined in "rendering subfiles" are correctly matched against the main metadata.
   - **Source-to-Metadata Sync:** It cross-references the `contextVars` used in component renderers with the `optimization` block in `createMetadata`.

> **⚠️ High-Level Important Note:** While the runtime system has a fallback that automatically treats `contextVars` keys as injected variables, the **Vite plugin (build-time) does not yet have this fallback**. The build-time optimizer only extracts `childInjectedVars`. For consistent performance between development and production builds, developers **must** currently declare injected variables in both locations.

---

## 5. Ideas for Reducing Developer Burden

Even though runtime errors prevent "silent" bugs, developers still face the burden of **duplication**: they must define variables in the component's TypeScript types/logic and then repeat them as hardcoded strings in `createMetadata`.

High-level ideas to alleviate this burden in the future:

1. **Closing the "Vite Gap": Automated contextVars Extraction**
   Extend the build-time `static-extractor.ts` to automatically extract keys from the `contextVars` block. This would make the runtime fallback consistent across the entire build pipeline, making `childInjectedVars` optional for any variable already documented in `contextVars`.

2. **Auto-generation from TypeScript Interfaces**
   Instead of writing string arrays manually, a build step (or Vite plugin) could extract event payload types and context variable types from the component's TypeScript definitions and automatically inject the `optimization` block into the compiled code.

3. **Unified Definition API (Single Source of Truth)**
   Introducing a simpler API or wrapper function that registers both the runtime context/event variables and the optimizer metadata in a single place, eliminating the need to type the same variable name twice.

4. **Advanced AST Inference**
   The static analyzer could be enhanced to infer injected variables directly from the component's logic (e.g., automatically scanning calls to `dispatchEvent` or `renderChild`), eventually removing the need for manual metadata entirely for common patterns.

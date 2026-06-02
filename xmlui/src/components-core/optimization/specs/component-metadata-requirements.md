# Component Metadata Requirements for the `computedUses` Mechanism

This document explains at a high level what specific metadata components must provide for the narrowing and render optimization mechanism to function correctly.

---

## 1. What Metadata is Needed?

When a developer creates a component in XMLUI (via `createMetadata`), they must explicitly describe several things for the optimizer. This data is specified in the top-level `contextVars` field, the `optimization` field, or directly within the event descriptions.

Main metadata fields:

1. **`isImplicitContainerByDefault: true`** (inside `optimization: { ... }`)
   - **For whom:** For "heavy" components (e.g., `Table`, `List`, `Form`, `Select`).
   - **What it does:** Tells the optimizer: "This component is complex. If it reads anything from the parent state, automatically wrap it in an isolating container so it doesn't re-render because of its neighbors."

2. **`contextVars: { $item: d("..."), $isSelected: dInternal("...") }`** — the **single source** of child-injected variables (all components)
   - **Placement:** top-level field of `createMetadata(...)`, **not** inside `optimization: {}`.
   - **For whom:** For any component (even "light" ones) that injects new variables for its child elements.
   - **Example:** The `List` component iterates through an array and provides access to `$item` for each row.
   - **What it does:** Tells the analyzer: "If you see the word `$item` inside my children, know that it is **my** local variable; do not look for it in the state of the entire application." It also serves as the documentation source for these variables.
   - **Public vs internal:** declare a public var with `d("...")` (appears in docs); declare an internal one with `dInternal("...")` — it sets `isInternal: true` so the docs generator hides it, while the optimizer still sees the key.
   - `contextVars` is the only accepted declaration site for injected vars across **all** components. `optimization: {}` is used exclusively for `isImplicitContainerByDefault`. `childInjectedVars` has been removed from the framework entirely.

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

### Situation B: Forgotten `contextVars` (or `injectedVars`)
- **Result:** Appearance of "False dependencies" and potential unnecessary re-renders.
- **Explanation:** Imagine you created a `<Gallery>` component that gives children an `$image` variable. But you forgot to include `contextVars: { $image: d("...") }`.
  1. The optimizer scans the markup `<Text value="{$image.name}" />`.
  2. It sees `$image` and thinks: *"Oh, this is some external variable the component expects from the application!"*.
  3. It adds `$image` to the `computedUses` list for the entire page.
  4. The page starts constantly monitoring whether the global/external `$image` variable has changed. If someone else in another part of the app changes a variable with the same name, our gallery will unexpectedly re-render (because it subscribed to this external variable due to an analyzer error).
  5. During the actual render, the local `$image` will still "override" the external one (so the logic won't break), but the **rendering process will occur more often than necessary**.

---

## 3. Burden on Component Developers

The declaration requirements fall into two separate categories with different scopes and different duplication costs.

### `contextVars` — only for components that inject into child scope

Only components that push new `$`-variables into their children's scope need `contextVars`. Most primitive components (`Button`, `Text`, `Icon`) never need it. When it is needed, the declaration is **single-site**: one `contextVars: { $item: d("...") }` entry serves the optimizer, the Language Server, and the docs generator simultaneously.

**What to write:**
```ts
contextVars: {
  $item: d("The current item provided to each row template."),
  $isSelected: dInternal("Whether this item is currently selected."),
},
```

The implementation still needs to actually inject these values at render time, but on the metadata side there is only one place to declare them.

### Event `injectedVars` — applies to any component whose events pass `$`-variables

This is where duplication remains. Even a tiny, primitive component (e.g., `<IconButton>`) with an `onHover="{ ... }"` event that passes `$isHovered` must declare it in the event's metadata:

```ts
events: {
  hover: { description: "...", injectedVars: ["$isHovered"] },
},
```

**Why it is difficult:**
- **Duplication:** The variable must be written in the implementation (`dispatchEvent({ $isHovered: true })`) AND declared as a string in `createMetadata`.
- **Easy to forget:** TypeScript will not show an error for a missing declaration. Local testing will succeed. The problem (false dependencies, unnecessary re-renders) only surfaces when the component is used in a large application with active state.

---

## 4. Error Protection Mechanisms

Since missing metadata could lead to "silent" performance degradation, the framework employs strict mechanisms to catch these omissions early. These mechanisms are designed to be robust against common development patterns and common mistakes.

### 4.1. Do existing tests protect developers from forgetting metadata?

**Yes, for injected variables.** The framework has multi-layered guards against forgetting `contextVars` and `injectedVars`:

1. **Runtime Guards (`validateInjectedVars`) — 100% Accuracy**
   Unlike static analysis, this guard works with **real runtime values**. In development mode (`DEV`), the framework monitors the actual objects being injected into children or passed to event handlers. If it sees a key starting with `$` (e.g., `$item`) that isn't in the component's metadata, it throws an error immediately. This works regardless of how complex the component's internal file structure is or how the variable was calculated.

2. **AST-based Build-time Extraction**
   The system that extracts metadata for the optimizer uses a **full AST parser** (Babel), not regular expressions. 
   - **No Comment Hazards:** Since it operates on the Abstract Syntax Tree, it ignores comments entirely. You cannot "fool" the system with old commented-out code.
   - **Static Literal Enforcement:** It requires that `contextVars` and `injectedVars` are defined as static literals. This ensures the optimizer can reliably "know" the dependencies without executing the code.

3. **Static Drift Detection (CI Protection)**
   The CI pipeline ensures metadata consistency via three checks in `renderer-metadata-drift.test.ts` plus a snapshot guard:
   - **U-audit.1 / U-audit.1-ext (forward):** Scans `renderers: { slot: { contextVars: [...] } }` declarations across all components (core and extension packages) and asserts every listed `$`-key is declared in `metadata.contextVars`. AST-based via `static-extractor.ts`.
   - **U-audit.3 (reverse):** Scans component source files for direct `$`-variable injection sites — `<MemoizedItem contextVars={{ $x }}>` JSX and event-handler `{ context: { $x } }` blocks — and asserts each `$`-key is covered by metadata. Catches the class of bugs where injection code exists but the `contextVars`/`injectedVars` declaration was forgotten. AST-based via `extractInjectedKeysFromSource`.
   - **Snapshot Integrity (`check:metadata-snapshot`):** Enforces that the build-time snapshot (`xmlui-metadata-generated.js`) is identical to a fresh regeneration from source. Any drift between the committed snapshot and the source components fails CI.

4. **`contextVars` as the Single Source (Full Build-Path Support)**
   The framework treats all keys declared in the `contextVars` block as injected variables. This works consistently across both:
   - **Standalone Mode:** At runtime, the optimizer reads the full metadata registry.
   - **Vite Plugin Mode:** During build-time, the `static-extractor.ts` extracts keys from the `contextVars` source literal using AST parsing.
   
   All components declare every injected variable **once**, in `contextVars` (public via `d`,
   internal via `dInternal`). `optimization.childInjectedVars` has been removed from the
   framework entirely.

---

## 5. Ideas for Reducing Developer Burden

The remaining duplication burden is specifically the **event `injectedVars`** string arrays:
a developer writes `dispatchEvent({ $isHovered: true })` in the implementation and must
also write `injectedVars: ["$isHovered"]` in `createMetadata`. The `contextVars` duplication
has already been eliminated (single declaration with `d()`/`dInternal()`).

High-level ideas to eliminate the remaining event `injectedVars` duplication:

1. **Auto-generation from TypeScript Interfaces**
   A build step (or Vite plugin) could extract event payload types from the component's
   TypeScript definitions and automatically populate the per-event `injectedVars` arrays in
   the compiled metadata.

2. **Unified Definition API (Single Source of Truth)**
   Introducing a wrapper that registers both the runtime event callback signature and the
   optimizer `injectedVars` declaration in one call, eliminating the need to write the same
   variable name twice.

3. **Advanced AST Inference**
   The static analyzer could be enhanced to infer injected event variables directly from
   `dispatchEvent(...)` call sites in the component's logic, eventually removing the need for
   manual `injectedVars` declarations for common patterns.

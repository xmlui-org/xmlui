# Component Metadata Requirements for the `computedUses` Mechanism

This document explains at a high level what specific metadata components must provide for the narrowing and render optimization mechanism to function correctly.

---

## 1. What Metadata is Needed?

When a developer creates a component in XMLUI (via `createMetadata`), they must explicitly describe several things for the optimizer. This data is specified in the `contextVars` block, the `optimization: {}` block, or directly within the event descriptions.

Main metadata fields:

1. **`isImplicitContainerByDefault: true`** (inside `optimization: {}`)
   - **For whom:** For "heavy" components (e.g., `Table`, `List`, `Form`, `Select`).
   - **What it does:** Tells the optimizer: "This component is complex. If it reads anything from the parent state, automatically wrap it in an isolating container so it doesn't re-render because of its neighbors."

2. **`contextVars: { $item: d("..."), $isSelected: dInternal("...") }`** — the **single source** of child-injected variables (core components)
   - **For whom:** For any component (even "light" ones) that injects new variables for its child elements.
   - **Example:** The `List` component iterates through an array and provides access to `$item` for each row.
   - **What it does:** Tells the analyzer: "If you see the word `$item` inside my children, know that it is **my** local variable; do not look for it in the state of the entire application." It also serves as the documentation source for these variables.
   - **Public vs internal:** declare a public var with `d("...")` (appears in docs); declare an internal one with `dInternal("...")` — it sets `isInternal: true` so the docs generator hides it, while the optimizer still sees the key.
   - **Extension packages** that have not migrated may still declare these in `optimization: { childInjectedVars: ["$item", ...] }`; the optimizer reads both fields. For core components, `childInjectedVars` has been removed — `contextVars` is the only accepted declaration site (enforced by `renderer-metadata-drift.test.ts`).

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
- **Explanation:** Imagine you created a `<Gallery>` component that gives children an `$image` variable. But you forgot to include `contextVars: { $image: d("...") }` (or, for an extension package, `childInjectedVars: ["$image"]`).
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

> **Note — child-injected vars are now a single declaration.** The migration to
> `contextVars` as the single source means a core component declares each injected
> variable **once** (in `contextVars`, with `d`/`dInternal`) instead of duplicating it
> across both `optimization.childInjectedVars` and `contextVars`. This halves the
> child-injected-var duplication burden; the per-event `injectedVars` duplication
> described above still applies.

---

## 4. Error Protection Mechanisms

Since missing metadata could lead to "silent" performance degradation, the framework employs strict mechanisms to catch these omissions early. These mechanisms are designed to be robust against common development patterns and common mistakes.

### 4.1. Do existing tests protect developers from forgetting metadata?

**Yes, for injected variables.** The framework has multi-layered guards against forgetting `contextVars` (core), `childInjectedVars` (extensions), and `injectedVars`:

1. **Runtime Guards (`validateInjectedVars`) — 100% Accuracy**
   Unlike static analysis, this guard works with **real runtime values**. In development mode (`DEV`), the framework monitors the actual objects being injected into children or passed to event handlers. If it sees a key starting with `$` (e.g., `$item`) that isn't in the component's metadata, it throws an error immediately. This works regardless of how complex the component's internal file structure is or how the variable was calculated.

2. **AST-based Build-time Extraction**
   The system that extracts metadata for the optimizer uses a **full AST parser** (Babel), not regular expressions. 
   - **No Comment Hazards:** Since it operates on the Abstract Syntax Tree, it ignores comments entirely. You cannot "fool" the system with old commented-out code.
   - **Static Literal Enforcement:** It requires that `contextVars` (and, for extension packages, `childInjectedVars` / `injectedVars`) are defined as static literals. This ensures the optimizer can reliably "know" the dependencies without executing the code.

3. **Static Drift Detection (CI Protection)**
   The CI pipeline ensures metadata consistency via two independent checks:
   - **Source Integrity (`renderer-metadata-drift.test.ts`):** Scans components and identifies sibling files (e.g., `Table.tsx` and `TableReact.tsx`) to ensure variables defined in renderers are matched against the component's `metadata.contextVars` (AST-based extraction via `static-extractor.ts`). For core components, `childInjectedVars` is no longer accepted — only `contextVars`.
   - **Snapshot Integrity (`check:metadata-snapshot`):** Enforces that the build-time snapshot (`xmlui-metadata-generated.js`) is identical to a fresh regeneration from source. Any drift between the committed snapshot and the source components fails CI.

4. **`contextVars` as the Single Source (Full Build-Path Support)**
   The framework treats all keys declared in the `contextVars` block as injected variables. This works consistently across both:
   - **Standalone Mode:** At runtime, the optimizer reads the full metadata registry.
   - **Vite Plugin Mode:** During build-time, the `static-extractor.ts` extracts keys from the `contextVars` source literal using AST parsing.
   
   Core components declare every injected variable **once**, in `contextVars` (public via `d`,
   internal via `dInternal`); `optimization.childInjectedVars` has been removed from them.
   Extension packages may still use `childInjectedVars` until migrated — the optimizer reads
   both fields.

---

## 5. Ideas for Reducing Developer Burden

Even though runtime errors prevent "silent" bugs, developers still face the burden of **duplication**: they must define variables in the component's TypeScript types/logic and then repeat them as hardcoded strings in `createMetadata`.

High-level ideas to alleviate this burden in the future:

1. **Auto-generation from TypeScript Interfaces**
   Instead of writing string arrays manually, a build step (or Vite plugin) could extract event payload types and context variable types from the component's TypeScript definitions and automatically inject the `optimization` block into the compiled code.

2. **Unified Definition API (Single Source of Truth)**
   Introducing a simpler API or wrapper function that registers both the runtime context/event variables and the optimizer metadata in a single place, eliminating the need to type the same variable name twice.

3. **Advanced AST Inference**
   The static analyzer could be enhanced to infer injected variables directly from the component's logic (e.g., automatically scanning calls to `dispatchEvent` or `renderChild`), eventually removing the need for manual metadata entirely for common patterns.

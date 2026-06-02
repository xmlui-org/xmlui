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

Only components that push new `$`-variables into their children's scope need `contextVars`. Most primitive components (`Button`, `Text`, `Icon`) never need it.

**Two things always required:**
1. **Runtime injection** — the renderer must physically inject the value, e.g. `<MemoizedItem contextVars={{ $item: item }} />`.
2. **Metadata declaration** — `contextVars: { $item: d("...") }` tells the optimizer, Language Server, and docs generator about the key.

These two will always be separate — the runtime code has *values*, the metadata has *keys and descriptions*. What changed is that the **metadata side is now single-site**: one `contextVars` entry replaces what was previously two separate declarations (`childInjectedVars` + `contextVars`). The U-audit.1 and U-audit.3 CI tests enforce that runtime injection and metadata stay in sync.

**What to write:**
```ts
contextVars: {
  $item: d("The current item provided to each row template."),
  $isSelected: dInternal("Whether this item is currently selected."),
},
```

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

1. **Runtime Guards (`validateInjectedVars`)**
   Works with **real runtime values** in development mode (`DEV`). The framework monitors the actual objects being injected into children or passed to event handlers. If it sees a key starting with `$` (e.g., `$item`) that isn't in the component's metadata, it throws an error immediately — regardless of how the variable was calculated.
   **Caveat:** fires only in DEV mode and only when the injection code actually executes. A component that is never rendered or whose event never fires in DEV will not be caught by this guard.

2. **AST-based Build-time Extraction**
   The system that extracts metadata for the optimizer uses a **full AST parser** (Babel), not regular expressions. 
   - **No Comment Hazards:** Since it operates on the Abstract Syntax Tree, it ignores comments entirely. You cannot "fool" the system with old commented-out code.
   - **Static Literal Enforcement:** It requires that `contextVars` and `injectedVars` are defined as static literals. This ensures the optimizer can reliably "know" the dependencies without executing the code.

3. **Static Drift Detection (CI Protection)**
   The CI pipeline ensures metadata consistency via four checks in `renderer-metadata-drift.test.ts` plus a snapshot guard:
   - **U-audit.1 / U-audit.1-ext (forward, template slots):** Scans `renderers: { slot: { contextVars: [...] } }` declarations across all components (core and extension packages) and asserts every listed `$`-key is declared in `metadata.contextVars`. AST-based via `static-extractor.ts`.
   - **U-audit.2 (declared → source presence):** For every `$`-var declared in `events[*].injectedVars` or `unstableChildInjectedVars`, asserts it appears as a string literal somewhere in the component's source files. Catches declared-but-unused metadata variables.
   - **U-audit.3 (reverse, all injection sites):** Scans component source files for direct `$`-variable injection sites — `<MemoizedItem contextVars={{ $x }}>` JSX and event-handler `{ context: { $x } }` blocks — and asserts each `$`-key is covered by metadata. Catches the class of bugs where injection code exists but the metadata declaration was forgotten. AST-based via `extractInjectedKeysFromSource`. **Known gap:** only catches completely forgotten declarations; does not verify that a var is in the correct specific event's `injectedVars` (versus another event or `contextVars`), but from the optimizer's perspective all placements are equivalent.
   - **Snapshot Integrity (`check:metadata-snapshot`):** Enforces that the build-time snapshot (`xmlui-metadata-generated.js`) is identical to a fresh regeneration from source. Any drift between the committed snapshot and the source components fails CI.

4. **`contextVars` as the Single Source (Full Build-Path Support)**
   The framework treats all keys declared in the `contextVars` block as injected variables. This works consistently across both:
   - **Standalone Mode:** At runtime, the optimizer reads the full metadata registry.
   - **Vite Plugin Mode:** During build-time, the `static-extractor.ts` extracts keys from the `contextVars` source literal using AST parsing.
   
   All components declare every injected variable **once**, in `contextVars` (public via `d`,
   internal via `dInternal`). `optimization.childInjectedVars` has been removed from the
   framework entirely.

## 5. Managing Developer Burden: The Strategy of Safe Duplication

While the implementation-to-metadata gap remains (writing the key in code and the key+description in metadata), the framework's strategy is to prioritize **Safe Duplication over Fragile Automation**.

### Why "Safe Duplication" is the Intended State
The primary "burden" of duplication is the risk of desynchronization. Because **U-audit.3** and the **Runtime Guards** catch missing metadata during development and CI, the cost of duplication is reduced to simply "typing the name twice." 

Further automation (eliminating the manual declaration) is currently considered a lower priority for several reasons:

1.  **Metadata Richness:** `contextVars` requires human-written descriptions for the documentation generator and Language Server. Even if we could infer the `$key` from code, we would still need a place to write the `description`. Metadata is the natural home for this.
2.  **Explicit vs. Magic:** Explicit declarations in `createMetadata` serve as a clear contract for the component. Auto-generation adds "build-time magic" that can be difficult to debug when it fails or infers the wrong scope.
3.  **Verification is Sufficient:** The "Verify" step (CI tests) provides 90% of the value of automation (prevention of silent performance bugs) with 10% of the complexity.

### Comparison of Potential Next Steps

| Approach | Effort | Risk | Verdict |
| :--- | :--- | :--- | :--- |
| **Verify (Current)** | Low | None | **Recommended.** CI catches all mistakes; manual metadata remains the source of truth for docs. |
| **Unified API** | High | High | Changing the authoring model for all components to save a few lines of strings is likely not worth the migration cost. |
| **Auto-generation** | High | High | Inferring "intent to inject" from AST is fragile. Inferring from TS types doesn't provide the descriptions needed for documentation. |

**Conclusion:** The current system of **Manual Declaration + CI Enforcement** is the stable, intended architecture for XMLUI component metadata. It ensures performance without sacrificing the quality of documentation or the simplicity of the build pipeline.


# Implicit-Container Promotion for Heavy Components

> **Summary:** Heavy components (`Select`, `List`, `Table`, `DataGrid`, `Tree`, `TileGrid`, `AutoComplete`, `Markdown`) are promoted to implicit containers when they have real read dependencies from parent state. Static heavy components (without read-deps) remain "naked" in parent scope. This design balances performance shielding with state accessibility for render-time operations like `extractValue()`.

## 1. Promotion Logic

Heavy components are listed in `IMPLICIT_CONTAINER_COMPONENT_NAMES` and trigger implicit-container promotion under one condition:
- **`nonDynamicReadDeps.size > 0`** — The component has at least one real (non-filtered) read dependency from parent state.

When promoted, the component receives a `StateContainer` with `computedUses` pointing to those dependencies, providing both state scoping (narrow propagation) and performance shielding (`React.memo` boundary).

When NOT promoted (no read-deps, or only dynamic/filtered deps), the component remains unwrapped and uses parent state directly.

---

## 2. Five Cases Where Heavy Components Remain Unwrapped

---

## 2. Five Cases Where Heavy Components Remain Unwrapped

Even in heavy-component lists, promotion is skipped when `nonDynamicReadDeps` remains empty after filtering:

### Case A: Write-Only Targets
A component uses variables only on the left-hand side of assignments (e.g., `onClick="count = 0"`), never reads them.
*   **Effect:** Assignment targets are filtered out of read-deps. No read-deps remain → no promotion.
*   **Behavior:** Component uses parent state directly.

### Case B: Dynamic Variables Only (`$context`, `$item`, etc.)
A component references only dynamic runtime-injected variables (e.g., `<Items data="{items}">...$item...</Items>`).
*   **Effect:** Dynamic variables filtered from `nonDynamicReadDeps`. No static read-deps → no promotion.
*   **Behavior:** Dynamic vars are injected directly into scope; component doesn't need parent state scoping.

### Case C: Data Fetch Injections (`onFetch` with `$queryParams`)
An `onFetch` handler receives injected variables that don't come from parent state (Bug 21 fix).
*   **Effect:** Injected fetch vars filtered. No parent-state read-deps remain → no promotion.
*   **Behavior:** Component uses full parent state (no scoping), but fetch scope is isolated.

### Case D: Built-in Globals Only (`Math`, `JSON`, etc.)
A component uses only JavaScript standard library functions.
*   **Effect:** JS globals filtered. No read-deps → no promotion.
*   **Behavior:** Component uses parent state directly.

### Case E: Completely Static
A component has no property bindings (e.g., `<Select />`).
*   **Effect:** No identifiers used. `nonDynamicReadDeps.size === 0` → no promotion.
*   **Behavior:** Component renders as a static subtree within parent scope.

---

## 3. Design Principle: State Scoping vs Performance Shielding

The algorithm distinguishes two separate concerns:

| Concern | Trigger | Effect |
|---------|---------|--------|
| **State Scoping** | `nonDynamicReadDeps.size > 0` | Create `computedUses` array and narrow parent state passed to children |
| **Performance Shielding** | Component type in `IMPLICIT_CONTAINER_COMPONENT_NAMES` (when scoped) | Wrap component in `StateContainer` for `React.memo` boundary |

These are **coupled for heavy components**: When a heavy component has read-deps and gets scoped, it automatically receives a shield. When it has no read-deps, no scoping happens → no shield (component remains "naked").

**Why this design:** Scoping to an empty `computedUses=[]` would narrow parent state to `{}`, breaking render-time operations like `extractValue()` (used by Table's `syncWithVar` adapters). Rather than create a shield that hides needed state, we accept that truly static heavy components remain unshielded — which is acceptable because static components without read-deps are rare in practice (real apps pass `data={...}` or similar).

---

## 4. Related Architectural Patterns: computedUses as Tree Snapshot

Heavy-component promotion is one instance of a broader pattern where static AST analysis produces snapshots that must remain valid through runtime transformations.

### Comparison with Related Issues

| Pattern | Heavy-Component Scoping | Bug 24: Compound Restructure | Bug 25: Symbol UIDs |
|---------|---|---|---|
| **Core Tension** | State scoping (needed for correctness) vs performance shielding (needed for perf) | Static `computedUses` array vs runtime tree restructuring | Static string UID type vs runtime `Symbol` injection |
| **Trigger** | AST filters (write-only, `$context`, fetch-injected, JS globals, fully static) strip read-deps to 0 | `CompoundComponent` hoists `vars`/`loaders` to outer Container at runtime | Test utils or framework inject `Symbol`-type UIDs alongside string UIDs |
| **Symptom** | Static heavy components unshielded; rare but acceptable | Stale `computedUses` in hoisted subtree → `extractScopedState` hides moved vars → reads return `undefined` | Sort/filter operations crash when treating `Symbol` as string |
| **Solution** | Accept rare case (static components uncommon) + acknowledge future escape hatch | Strip `computedUses` from `rest` spread in `CompoundComponent.tsx` | Filter non-string UIDs (`Symbol`) in array operations; update types to `string \| symbol` |
| **Status** | Accepted design ✅ | Fixed in `CompoundComponent.tsx` ✅ | Fixed in `computedUses.ts` ✅ |

### Shared Design Rule

`computedUses` is a **snapshot** of a node's state dependencies at the moment of static analysis. This snapshot must remain valid through the entire component tree lifetime. Any mechanism that:

1. Decides promotion (this document: heavy components),
2. Restructures the tree (Bug 24: `CompoundComponent` hoisting),
3. Changes ancestor declarations (potential future concern), or
4. Injects runtime identifiers with mismatched types (Bug 25: `Symbol` vs `string` UIDs),

must **explicitly invalidate or recompute** affected snapshots — never silently rely on stale arrays. The antidote: clear invalidation points in code that mutates tree structure, type safety in array operations (filter `Symbol` out), and explicit tests that catch snapshot staleness.

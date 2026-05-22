# computedUses — Architectural Specification

> This document describes the `computedUses` feature: how it works, its architectural implementation, potential pitfalls, and future directions for improvement. For a full chronology of identified and fixed bugs during implementation, see [bugs-history.md](./bugs-history.md).

---

## 1. Problem and Concept

Consider an application:
```xml
<App
  var.oftenChanges="{0}"
  var.rarelyChanges="{Array.from({length: 1000}, (_, i) => i + 1)}"
>
  <Timer interval="{100}" onTick="oftenChanges++" />
  <Text value="Often changes: {oftenChanges}" />

  <Select>
    <Items data="{rarelyChanges}">
      <Option value="{$item}" label="|{$item}|" />
    </Items>
  </Select>
</App>
```

**Before optimization:** `Select` (and all its children) re-renders on **every** change of `oftenChanges` (10+ times per second) because it receives the full state from `App`: `parentState = { oftenChanges, rarelyChanges }`.

**Solution (`computedUses`):** Automatic static analysis of the AST (Abstract Syntax Tree) calculates the minimum list of external dependencies for each container. `Select` receives `computedUses = ["rarelyChanges"]`. During rendering, a state projection (`scopedParentState`) is created, which changes ONLY when `rarelyChanges` changes, isolating the component via `React.memo`.

---

## 2. Algorithm and Lifecycle (Runtime)

### Static Analysis: `computeUsesForTree`
The algorithm works bottom-up, traversing the `ComponentDef` tree before connecting the reactive graph:
1. Collects all identifiers used in the node (`usedHere`).
2. Retrieves identifiers "leaking" from children (`childDeps`).
3. Excludes **locally declared** variables (`vars`, `loaders`, `contextVars` like `$item`, functions).
4. Excludes **Built-in Globals** (`JS_STDLIB_GLOBALS` like `Math`, `JSON_STDLIB_GLOBALS`).
5. Excludes **Lexical Scoped Vars**. These are variables injected directly into the child context at render time (e.g., `$item` in `List` or `$queryParams` in `onFetch`). They are declared in component metadata (`childInjectedVars`) and event metadata (`injectedVars`), allowing the analyzer to ignore them as external dependencies.
6. Excludes **Unstable Global Variables** (`UNSTABLE_GLOBAL_VARS`). These are navigation keys (like `$pathname`) declared in root metadata (`unstableChildInjectedVars`).
7. Forms the `computedUses` list — a minimum set of parent state keys (including necessary child component UIDs that will register their API higher up the tree).

### Runtime Protection (Defense-in-depth)
- **`ComponentWrapper`:** Uses `extractScopedState(state, computedUses)` and memoizes the result via `useShallowCompareMemoize`. State updates are terminated here if dependencies haven't changed, and lower wrappers aren't even executed.
- **`ContainerWrapper`:** Receives the narrowed state `parentState={scopedParentState}` and is responsible for deploying the `StateContainer`. It checks if the node is a container (via `isContainerLike`, which considers the presence of `computedUses`).
- **`StateContainer`:** Registers reactive changes. State for children becomes fully isolated.

---

## 3. Implicit-Container Promotion for Heavy Components

Heavy components marked with the `isImplicitContainerByDefault: true` flag in metadata (such as `Select`, `List`, `Table`, `DataGrid`, `Tree`, `TileGrid`, `AutoComplete`, `Markdown`) are automatically promoted to implicit containers, but **only if they have genuine read-dependencies** on parent state (`nonDynamicReadDeps.size > 0`).

**Logic:**
1. If a heavy component reads parent variables (e.g., `<Select data="{items}" />`), it receives a container and `computedUses` for state narrowing.
2. If a heavy component is completely static (no read-deps, e.g., `<Select />`), it remains "bare" within the parent container.

**Why:** Mandatory wrapping (without read-deps) would create empty `computedUses=[]`, narrowing the parent state to `{}` (empty). This breaks render-time functions like `extractValue()`, which requires access to variables during render (e.g., `syncWithVar` adapters in Table).

**Future Direction:** The shield for completely static heavy components should be orthogonal to state narrowing — e.g., a separate `React.memo` without a `StateContainer`. See [todo-smart-containers.md](./todo-smart-containers.md) regarding the strategy to avoid "matryoshka" nesting.

---

## 4. Non-obvious Architectural Decisions and Invariants

### Explicit vs Implicit Owners (UID-escaping mechanism)
When a component (e.g., `<Select id="mySelect">`) calls `registerComponentApi`, where will `mySelect` end up?
- **Explicit Owner** (`type="Container"` or `uses` defined): Creates a full boundary — child API registers with this node.
- **Implicit Container** (container created for `vars`, or via Mandatory Shielding without explicit `uses`): Delegates `registerComponentApi` to its parent.
The `computedUses` algorithm ensures that child UIDs "bubble up" (as `childEscapingUIDs`) until they meet an Explicit Owner. If an Implicit Container limits its external state (`parentDependencies`), those UIDs it passed upward are forcibly **returned** to it. Otherwise, it would be "blind" to the API of its own descendants.

### State Object Ref: `fullParentStateRef` in Event Handlers
While state is narrowed for *rendering*, *event handlers* often need to write to variables they don't explicitly display (`onChange="val = 5"`).
To avoid "Variable not found in scope" errors, the **full parent state** is passed down through wrappers as a stable `MutableRefObject` (`fullParentStateRef`). The handler accesses it when the event occurs, but since it's a ref, React doesn't initiate cascading re-renders (the *useEvent* pattern).

### Lexical Scoping (Immutable Scope Propagation Mechanism)
Instead of hardcoded lists of "special" variables, the optimizer uses metadata to build the lexical scope during AST traversal:
- **Component Scope:** Container components (like `List`, `Table`, `ModalDialog`) declare `childInjectedVars`. All expressions in children of these components automatically filter these variables.
- **Event Scope:** Event handlers (like `onFetch` in `DataLoader`) declare `injectedVars`. Expressions inside a specific handler filter these variables.
- **Shadowing:** Metadata-driven scoping allows local variables (like `$queryParams` in `onFetch`) to naturally shadow global ones (like router `$queryParams`), preventing false parent dependencies.

### Code-Behind Exclusion (`scriptCollected` and `.xs` files)
The optimizer only checks the template (`.xmlui`). If a component has an `.xmlui.xs` file or uses `<script>`, functions inside may access anything in the parent state. Transitive AST analysis of code-behind is not currently performed, so state narrowing for such nodes (and their children: `nextDisableNarrowing`) is disabled. They always receive the full `parentState`.

**Function-Free Child Narrowing:** Built-in components (like `Select`) inside a user component with code-behind can still be narrowed IF they don't call any parent functions. This is determined via `dependsOnParentFunction` check during analysis.

### Symbols and UID types: Separating Internal State from Subscribable Names
In static analysis, UID variables are treated as `string`. However, at runtime, the framework stores **internal component state** under `Symbol(uid)` keys. This separation is critical for state narrowing.

**Context (`ContainerUtils.ts:extractScopedState`):**
During render, `extractScopedState(parentState, computedUses)` narrows parent state, keeping only string keys in `computedUses`, but **unconditionally preserves ALL Symbol-keyed entries**. Symbols are internal instance state, not external subscribable names; reactive narrowing applies only to string keys.

---

### Lexical Variables and UNSTABLE_GLOBAL_VARS Exclusion

In addition to Symbols, lexical context variables (prefixed with `$`) injected by the framework (e.g., `$item` from Column, `$param` from ModalDialog.open) must be preserved.

**Problem:** `computedUses` is calculated as *parent external dependencies*. It doesn't include lexical variables (e.g., `$item`) that live in the parent state but which the parent doesn't "own"—they are injected higher in the tree. Narrowing would otherwise strip them.

**Solution:** Preserve ALL `$`-prefixed keys EXCEPT `UNSTABLE_GLOBAL_VARS` (defined via `unstableChildInjectedVars` in metadata for `App` and other providers):

```ts
// ContainerUtils.ts:extractScopedState
for (const key of Object.keys(parentState)) {
  if (
    typeof key === "string" &&
    key.startsWith("$") &&
    !UNSTABLE_GLOBAL_VARS.has(key) &&
    !(key in picked)
  ) {
    picked[key] = (parentState as any)[key];
  }
}
```

**Why exclude UNSTABLE_GLOBAL_VARS:** Navigation keys (like `$pathname`, `$routeParams`, `$queryParams`, `$linkInfo`) are recomputed at every StateContainer. Their value objects have unstable references. Preserving them in narrowed state would cause `useShallowCompareMemoize` to trigger re-renders on every navigation, defeating the optimization. These keys are defined in `App` metadata.

---

## 5. Invariant: "Runtime Restructure"

**CRITICAL:** The static `computedUses` array is calculated for a specific tree topology. Any process (like `CompoundComponent.tsx`) that restructures the tree at runtime (e.g., moving `vars` or removing a wrapper) leaves the existing `computedUses` **invalid**, leading to state loss for children.
**Rule:** Always discard `computedUses` (`delete node.computedUses`) if the code generator creates or removes wrapper containers.

---

## 6. Optimization Guards (Validation)

### Runtime Validation (`validateInjectedVars`)
To protect against developer error (forgetting to update metadata when adding new injected variables), a runtime check exists in `__DEV__` mode.
- Whenever `ComponentAdapter` or `wrapComponent` injects context variables, it compares them against `injectedVars` / `childInjectedVars` metadata.
- If a mismatch is found (a variable starts with `$` but is not declared), a console error is issued.
- **Future:** This will be converted to a hard-fail (`throw`) in development to ensure metadata compliance.

---

## 7. TODO (Future Work)

1. **Filtering Framework Globals (False Promotion):**
   Using global functions like `toast` or `Actions.callApi` is currently treated as a dependency on external `parentState`. This causes "False Promotion" of light components. `XMLUI_GLOBAL_NAMES` should be added to the filter list (see `TODO - framework-globals-leak-proposal.md`).
2. **Lazy State Cloning in Event Handlers (Proxy):**
   Current implementation uses `cloneDeep` for state creation during events. On heavy pages, this causes delays. A `Proxy` with *Copy-on-Write* strategy would be more efficient.
3. **AST Analysis of `.xs` File Functions:**
   Enable state narrowing for components with code-behind by performing transitive AST analysis of function bodies in `.xs` files.
4. **Metadata Consolidation (DRY):**
   Merge `childInjectedVars` and `contextVars` in future refactorings to reduce duplication.
5. **Static AST Audit Test:**
   Implement a CI-enforced test that statically analyzes component source files to ensure metadata matches actual injections (see `TODO-metadata-protection-layers-2-and-4.md`).
6. **Pure Static Tracking:**
   Eliminate the `$`-prefix fallback in `extractScopedState` entirely once the analyzer is 100% accurate in tracking lexical scope, relying only on explicit `computedUses` lists.

---
*Note: To view render statistics in the browser during development, use the `window.__renderCounts` object.*

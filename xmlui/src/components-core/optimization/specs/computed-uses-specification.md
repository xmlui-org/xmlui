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
3. Excludes **locally provided** variables (`vars`, `loaders`, runtime `node.contextVars` like `$item`, functions). `node.contextVars` refers to `ComponentDef.contextVars` — a field set on wrapper nodes by renderers that create per-instance containers (e.g., ContextMenu creates a `Container` with `contextVars: { $context }`). Adding these to `localDeclared` prevents the container from reporting `$context` as an external dependency — it absorbs it as locally provided for children.
4. Excludes **Built-in Globals** (`JS_STDLIB_GLOBALS` like `Math`, `JSON_STDLIB_GLOBALS`).
5. Excludes **Lexical Scoped Vars**. These are variables injected directly into the child context at render time (e.g., `$item` in `List` or `$queryParams` in `onFetch`). They are declared in component metadata (`childInjectedVars`) and event metadata (`injectedVars`), allowing the analyzer to ignore them as external dependencies.
6. Excludes **Unstable Global Variables** (`UNSTABLE_GLOBAL_VARS`). These are navigation keys (like `$pathname`) declared in root metadata (`unstableChildInjectedVars`).
7. Forms the `computedUses` list — a minimum set of parent state keys (including necessary child component UIDs that will register their API higher up the tree).

#### Entry-point: `unwrapToComponentDef`
`computeUsesForTree` may be called with a `CompoundComponentDef` wrapper (e.g., from `StandaloneApp`) whose actual template lives in a `.component` chain. `unwrapToComponentDef()` follows the chain — without a hard depth cap — until it reaches a node that has a `type` string or a `children` array. 

#### AST parse cache (`astCache`)
Event-handler strings are parsed once and cached to avoid redundant AST work during boot-time traversal. The cache is an **LRU with a cap of 1 000 entries**, implemented cheaply via JavaScript `Map`'s insertion-order guarantee (delete + re-insert on hit; evict the first/oldest key at capacity). This bounds memory in long-running devserver/studio sessions where generated XMLUI could otherwise accumulate thousands of unique event strings.

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
- **Event Scope:** Event handlers (like `onFetch` in `DataLoader`) declare `injectedVars`. Expressions inside a specific handler filter these variables. To reduce boilerplate in `optimizer-metadata.ts`, the `withInjectedContext` utility allows specifying `eventsInheritChildVars`, which automatically copies `childInjectedVars` into the `injectedVars` of the specified event names (e.g., passing `$data` to `Form`'s `submit` event).
- **Shadowing:** Metadata-driven scoping allows local variables (like `$queryParams` in `onFetch`) to naturally shadow global ones (like router `$queryParams`), preventing false parent dependencies.

### Metadata Duplication: `OPTIMIZER_METADATA.childInjectedVars` vs. `metadata.contextVars` (intentional)

The same `$`-variable names appear in multiple places for the same component type. This is **not an oversight** — it is architecturally required.

#### Why `OPTIMIZER_METADATA` cannot be removed

The Vite plugin (`xmlui-parser.ts`) runs at **build time in pure Node.js**. It calls `computeUsesForTree(component, lookupOptimizerMetadata)` where `lookupOptimizerMetadata` reads directly from `OPTIMIZER_METADATA`. Component `.tsx` files cannot be imported in this context — they transitively import React, SCSS files, and DOM globals that are unavailable in Node.js.

This means `OPTIMIZER_METADATA` is the **only** source the Vite plugin path can read. Every `childInjectedVars`, `isImplicitContainerByDefault`, and per-event `injectedVars` entry must be present there or the build-time optimizer will misclassify child dependencies for that component.

#### Why `metadata.contextVars` also exists (and why it is NOT a drift anchor)

`metadata.contextVars` (`Record<string, ComponentPropertyMetadata>`) serves a different audience: the **Language Server** and documentation tooling. It stores descriptions, types, and availability of `$`-prefixed template variables — richer information than the bare string arrays in `OPTIMIZER_METADATA`.

Important: `metadata.contextVars` is **intentionally a subset** of `OPTIMIZER_METADATA.childInjectedVars`. Components document only "user-visible" context variables (those a developer would reference in markup), not internal ones like `$cell`, `$colIndex`, `$isFirst`, etc. This means `contextVars` cannot be used as a reliable bidirectional drift anchor — the check `childInjectedVars ⊆ contextVars.keys` would fail for many components by design.

Runtime metadata enrichment (`childInjectedVars`, `isImplicitContainerByDefault`, `unstableChildInjectedVars`) is now handled automatically by `mergeOptimizerInjectedVars` in `wrapComponent`/`wrapCompound` at registration time. Component `.tsx` files no longer need any manual spread — `OPTIMIZER_METADATA` is the single declaration point and the runtime descriptor is auto-enriched.

#### The three-source picture for a component like `List`

| Source | Who reads it | What it contains |
|--------|-------------|-----------------|
| `OPTIMIZER_METADATA.List.childInjectedVars` | Vite plugin (`lookupOptimizerMetadata`) | `["$item", "$itemIndex", ...]` — build-time optimizer |
| `metadata.childInjectedVars` (auto-enriched by `mergeOptimizerInjectedVars`) | Standalone runtime (`resolveOptimizerMetadata`) | same array — runtime optimizer |
| `metadata.contextVars` | Language Server, drift test, `validateInjectedVars` | `{ $item: d("..."), ... }` — documentation (intentional subset) |

All three must agree. The `renderer-metadata-drift.test.ts` CI test validates this agreement for renderer slots; `validateInjectedVars` validates it at runtime.

#### `...Object.keys(metadata?.contextVars ?? {})` in `computedUses.ts`

```typescript
const childInjected = [
  ...(metadata?.childInjectedVars ?? []),        // authoritative for both paths
  ...(metadata?.unstableChildInjectedVars ?? []),
  ...Object.keys(metadata?.contextVars ?? {}),   // safety-net for extension packages
];
```

For **core components** this third spread is redundant — `childInjectedVars` already contains the same keys (auto-enriched by `mergeOptimizerInjectedVars` at registration). Its purpose is extension packages:

Extension packages (`xmlui-masonry`, `xmlui-react-flow`, `xmlui-grid-layout`, etc.) have **no entry in `OPTIMIZER_METADATA`** (adding them would create a reverse dependency — core must not know about packages). In Standalone mode, `resolveOptimizerMetadata` returns the full component metadata including `contextVars`. Without this third spread, `$item` inside a `<Masonry>` item template would be counted as an external parent dependency, causing unnecessary re-renders.

In Vite plugin mode, extension package components have no `OPTIMIZER_METADATA` entry and no `contextVars` (the Vite path only sees `OPTIMIZER_METADATA`), so they over-subscribe — this is documented as acceptable graceful degradation until a runtime registration API for extension packages is implemented.

#### ⚠ Do not remove `childInjectedVars` from `OPTIMIZER_METADATA`

It may be tempting to remove `childInjectedVars` from `OPTIMIZER_METADATA` entries that already document the same variables in `metadata.contextVars`. **This breaks the Vite plugin path.** The `contextVars` reading in `computedUses.ts` only helps Standalone mode; the Vite plugin receives `undefined` for `metadata.contextVars` because `lookupOptimizerMetadata` returns only `OPTIMIZER_METADATA` entries which never contain `contextVars`. Removing `childInjectedVars` from OPTIMIZER_METADATA would cause the Vite-built app's optimizer to misclassify `$item` etc. as parent-scope dependencies.

### Lexical Scoping at Runtime: Local Vars Win over Outer Scope (`useVars`)

At render time, the actual values are merged in [`useVars`](../../src/components-core/state/variable-resolution.ts). When `useVars` iterates over `vars` (an ordered map of `{...node.functions, ...node.vars, ...parsedScriptPart.vars}`) it builds `ret` incrementally — each iteration resolves one var and stores it in `ret`. To evaluate the next var's expression, it constructs a `stateContext`:

```ts
const stateContext: ContainerState = { ...componentState, ...ret };
```

**Invariant:** the spread order is `componentState` first, then `ret`. Vars resolved locally in this container (in `ret`) **shadow** any same-named keys arriving from the outer `componentState`. Without this, a parent's `$props`/`$context`/`$item` leaking through narrowing would silently override what `CompoundComponent` (or `MemoizedItem`, or `Container.contextVars`) just placed into `ret` for this very container. The result was Bug 29 in `history-bugs.md`: a nested UDC's `var.x = "{$props.y}"` read the **outer** UDC's `$props` instead of its own.

**Why this matters across the framework, not only for UDCs:**
- `CompoundComponent` writes `$props: resolvedProps` into the inner Container's `node.vars`. Every nested UDC depends on `ret.$props` shadowing any outer `$props`.
- `<ContextMenu>` customRender creates a runtime Container with `contextVars: { $context }`. The inner template depends on this local `$context` shadowing any outer one.
- `<MemoizedItem>` per-row contextVars (`$item`, `$itemIndex`, `$row`, `$cell`, ...) must shadow the same names from an enclosing iterator.
- Form/FormItem/Queue similarly inject names (`$data`, `$value`, `$setValue`, `$completedItems`) into their own scope that must shadow upstream values.

**Interaction with `extractScopedState` preservation:** the Bug 28 fix preserves `$`-prefixed keys across narrowing so lexical names (e.g. `$item` from a parent `<Column>`) survive when an implicit container narrows state. That preservation is correct, but it means `componentState` will routinely carry names that *also* appear in `ret` for nested writers. The `{...componentState, ...ret}` spread order is therefore load-bearing: it's the only thing preventing parent-side framework names from corrupting locally-injected values.

**Why the order is safe:** `ret` only ever contains keys this container's own metadata defines (script `vars`, code-behind `functions`, `node.vars` written by the renderer). It cannot pollute `componentState` for *other* containers — each container has its own `ret`. Outer-scope keys this container does NOT redefine pass through unchanged from `componentState`.

**Cache implication:** [`obtainValue`](../../src/components-core/state/variable-resolution.ts) memoizes per-expression with `shallowCompare(newDeps, lastDeps)` where deps come from `pickFromObject(stateContext, dependencies)`. If `stateContext` ever lacks a needed `$`-key, `pickFromObject` returns `{}` (the dotted path resolves to `undefined`), `shallowCompare({}, {}) === true`, and the cache locks in the **first** computed value forever. The spread-order rule prevents this latent cache failure as a side benefit — once `ret.$props` reliably wins, the picked deps reflect the real value and cache invalidation works.

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

**Solution (two-pass):** `extractScopedState` preserves `$`-prefixed keys via two complementary passes:

**Pass 1 — hardcoded `FRAMEWORK_VARS` via the `in` operator** (Proxy-safe; handles non-enumerable keys):
```ts
// ContainerUtils.ts:extractScopedState
const FRAMEWORK_VARS = [
  "$item", "$itemIndex", "$isFirst", "$isLast", "$context", "$props",
  "$cell", "$row", "$rowIndex", "$isSelected", "$value", "$setValue",
  "$data", "$completedItems", "$queuedItems",
];
for (const key of FRAMEWORK_VARS) {
  if (key in parentState && !(key in picked)) {
    picked[key] = (parentState as any)[key];
  }
}
```

The `in` operator is required because some state objects may be Proxy instances (e.g., from reactive adapters) where common framework variables are accessible via property lookup but not enumerable via `Object.keys`. Using `in` ensures these are always picked up.

**Pass 2 — general `$`-prefix scan via `Object.keys`** (catches all other enumerable `$`-prefixed keys):
```ts
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

## 5.5. Invariant: "State Cleanliness Between Multi-Pass Analysis"

**CRITICAL:** The `computeUsesForTree` algorithm is called **multiple times** on overlapping or reused node objects:
1. In `xmlui-parser.ts:59` after parsing each `.xmlui` file (before `.xs` code-behind is merged)
2. In `StandaloneApp.tsx:733` for compound components (after `.xs` functions are attached)
3. Per-instance in `StandaloneApp.tsx:762-764` for each compound node reference

Between passes, node objects are **NOT cloned** — the same `ComponentDef` references are reused (e.g., `compound.component.children[i]`).

**Problem:** If pass 1 sets `node.computedUses` but later passes determine a different narrowing is needed (e.g., because `node.functions` was populated), the stale value from pass 1 survives. This causes incorrect narrowing at runtime.

**Mechanical Guard:** At the **start of `computeUsesInternal`** (before any analysis):
```ts
node.computedUses = undefined;
```

This ensures each traversal starts with clean state. The current pass becomes the single source of truth for `computedUses`. Stale values from previous passes are always cleared.

**Why mechanical (not conditional):** A conditional clear-only-if-needed approach would add control-flow complexity. Clearing unconditionally is safe (we recalculate immediately) and guarantees correctness regardless of code path or future refactoring.

**Real-world impact:** Without this guard, FileVersionsDrawer's Restore button threw `"Cannot read properties of undefined (reading 'close')"` because pass 1 (no `.xs`) narrowed the Table container to `computedUses=["handleRestore"]`, and pass 2 (with `.xs`) couldn't override it — the component reference `versionsDrawer` was filtered during state narrowing at runtime (Bug 30).

---

## 6. Optimization Guards (Validation)

### Optimizer Metadata Auto-Injection (`mergeOptimizerInjectedVars`)

Both `wrapComponent` and `wrapCompound` call `mergeOptimizerInjectedVars(type, metadata)` as their **first step** before constructing the renderer closure (lines 560 and 1104 in `wrapComponent.tsx`). This function (lines 14–46) bridges `OPTIMIZER_METADATA` into the runtime `ComponentMetadata`, filling gaps:

- If `OPTIMIZER_METADATA[type].childInjectedVars` exists but `metadata.childInjectedVars` does not → copies it in.
- For each event in `OPTIMIZER_METADATA[type].events`: if the component already exposes that event but has no `injectedVars` declared → copies the optimizer's `injectedVars` in.

This means `validateInjectedVars` will pass for every component registered via `wrapComponent`/`wrapCompound` even if the component author did not add any metadata spreading. **`OPTIMIZER_METADATA` is the single source of truth; the runtime descriptor is auto-enriched at registration by `mergeOptimizerInjectedVars`.**

### Runtime Validation (`validateInjectedVars`)
To protect against developer error (forgetting to update metadata when adding new injected variables), a runtime check exists in `__DEV__` mode.
- **`wrapComponent.tsx`** (lines 866, 887): calls `validateInjectedVars(node.type, metadata, contextVars)` — *without* `eventName` — whenever a renderer-slot callback injects contextVars into a `MemoizedItem`. This validates against `metadata.childInjectedVars` and `metadata.contextVars`.
- **`ComponentAdapter.tsx`** (line 395): calls `validateInjectedVars(safeNode.type, descriptor, actionOptions.context, eventName)` — *with* `eventName` — for event-handler context injections. This validates against `metadata.events[eventName].injectedVars` in addition to the child-level fields.
- If a mismatch is found (a variable starts with `$` but is not declared), a **hard-fail `throw`** is raised in development (gated by `import.meta.env?.DEV`). In production builds the same condition logs a `console.error` instead, so misconfigured extension components keep working with graceful degradation.
- The thrown error message names the offending `OPTIMIZER_METADATA.<Component>` entry, so the fix is immediate.

### Static Drift Check (CI-time)

In addition to the runtime `validateInjectedVars` hard-fail, a unit test in
[`xmlui/tests/components-core/optimization/renderer-metadata-drift.test.ts`](../../../tests/components-core/optimization/renderer-metadata-drift.test.ts)
statically walks every built-in component's `renderers.{slot}.contextVars`
declaration and asserts that each `$`-key is also declared in
`OPTIMIZER_METADATA[type].childInjectedVars` or the component's
`metadata.contextVars`. This catches drift at PR time (sub-second feedback),
not at the next E2E run that happens to exercise the affected renderer. The
test reads `.tsx` files as text and uses a narrow regex extractor — it
deliberately does NOT import the component modules (which would pull SCSS
and other Vite-only deps that don't load under vitest).

Renderers that compute `contextVars` via a callback (e.g. `Checkbox`'s
`inputTemplate` uses `contextVars: (vars) => vars`) cannot be audited
statically and are skipped; their contract is enforced only by the runtime
check.

The `RendererConfig.contextVars` field accepts two forms:
- **Positional array** `(string | null)[]`: maps callback arguments by position to variable names (`null` skips a position). E.g. `["$item", null, "$inTrigger"]` maps `args[0] → $item`, skips `args[1]`, maps `args[2] → $inTrigger`.
- **Function** `(...args) => Record<string, any>`: for computed variables (e.g., `$isFirst: index === 0`).

Only **two components** currently use the static array form in `wrapComponent` config (`AutoComplete`, `Fallback`). Most components inject contextVars directly in their renderer code via inline `renderChild(node, { contextVars: { $item, ... } })` calls, which bypass the static drift check and are covered only by `validateInjectedVars` at runtime.


### Framework Globals Filtering

The optimizer must distinguish between **parent UI state** and **framework globals** — values wired into every expression scope via React context (see `appContextFactory.ts`). Framework globals include utility functions, theme helpers, navigation APIs, etc.

**Without filtering:** A simple `onChange="Actions.callApi('save')"` would register `Actions` as an external read dependency, causing light components marked `isImplicitContainerByDefault` (Select, List, Table, etc.) to be unnecessarily promoted to full `StateContainer` wrappers. This creates overhead: context overhead, reducer queue setup, and state isolation that breaks sibling communication (e.g., `updateState` calls from outside the promoted container are blocked).

**Solution:** The `XMLUI_GLOBAL_NAMES` set (built once at module load in `appContextFactory.ts`) lists all framework globals:
- **Explicitly named** (40 keys): `Actions`, `toast`, `navigate`, `App`, `Log`, `confirm`, `delay`, theme setters, etc.
- **Derived via spreads** (auto-discovered): `dateFunctions` (e.g., `formatDate`, `now`), `mathFunctions` (e.g., `avg`, `sum`), `localStorageFunctions`, `miscellaneousUtils` (e.g., `capitalize`).

**Architecture:** Single source of truth is `buildAppContextValue(deps)` in `appContextFactory.ts`. The factory function defines the shape of the injected object. `XMLUI_GLOBAL_NAMES = Object.keys(buildAppContextValue(stub))` is computed once at module load and re-exported by `FrameworkGlobals.ts` for use by the `computedUses` optimizer.

**Filter implementation in `computedUses.ts`:**
```ts
const keepDep = (d: string) =>
  !localDeclared.has(d) &&
  !isBuiltinGlobal(d) &&
  !XMLUI_GLOBAL_NAMES.has(d) &&  // ← Framework globals filtered here
  !injectedVarsScope.has(d);
```

**Invariant:** If a new framework global is added to `appContextValue`, it must:
1. Be added to `AppContextDeps` interface in `appContextFactory.ts` (strict type-checking).
2. Be passed from `AppContent.tsx` when calling `buildAppContextValue()` (TypeScript will error if forgotten).
3. Automatically propagate to `XMLUI_GLOBAL_NAMES` (no manual list to maintain).

---

*Note: To view render statistics in the browser during development, use `window.__renderCounts` (per-label counters), `window.__topRenderCounts(n=10)` (top N most-rendered labels), and `window.__resetRenderCounts()` (zero all counters).*

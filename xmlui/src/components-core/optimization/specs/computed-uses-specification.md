# computedUses — Architectural Specification

> This document describes the `computedUses` feature: how it works, its architectural implementation, potential pitfalls, and future directions for improvement.

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

Without `computedUses`, `Select` (and all its children) re-renders on **every** change of `oftenChanges` (10+ times per second) because it receives the full state from `App`: `parentState = { oftenChanges, rarelyChanges }`.

`computedUses` is automatic static analysis of the AST (Abstract Syntax Tree) that calculates the minimum list of external dependencies for each container. `Select` receives `computedUses = ["rarelyChanges"]`. During rendering, a state projection (`scopedParentState`) is created that changes **only** when `rarelyChanges` changes, isolating the component via `React.memo`.

---

## 2. Algorithm and Lifecycle (Runtime)

### Static Analysis: `computeUsesForTree`
The algorithm works bottom-up, traversing the `ComponentDef` tree before connecting the reactive graph:
1. Collects all identifiers used in the node (`usedHere`).
2. Retrieves identifiers "leaking" from children (`childDeps`).
3. Excludes **locally provided** variables (`vars`, `loaders`, runtime `node.contextVars` like `$item`, functions). `node.contextVars` refers to `ComponentDef.contextVars` — a field set on wrapper nodes by renderers that create per-instance containers (e.g., ContextMenu creates a `Container` with `contextVars: { $context }`). Adding these to `localDeclared` prevents the container from reporting `$context` as an external dependency — it absorbs it as locally provided for children.
4. Excludes **ECMAScript / platform built-ins** (`JS_STDLIB_GLOBALS`: `Math`, `Array`, `Promise`, `fetch`, …). These are never stored in XMLUI parent state.
5. Excludes **Browser host globals** (`BROWSER_HOST_GLOBALS`: `window`, `document`, `navigator`). Deliberately minimal — ambiguous names like `location` or `history` are intentionally left out to avoid silently dropping legitimate state-variable deps (a developer could name a variable `location`, and filtering it would silently remove a real dependency).
6. Excludes **XMLUI framework globals** (`XMLUI_GLOBAL_NAMES`): `Actions`, `toast`, `navigate`, `App`, `Log`, theme helpers, date/math/storage utilities, etc. These are wired into every expression scope by `AppContent.buildAppContextValue()` and never live in parent state. Filtering them prevents `isImplicitContainerByDefault` components (Select, List, Table) from being falsely promoted to full `StateContainer`s simply because they call a framework function.
7. Excludes **App global names** (`appGlobalNames`): variables and functions declared in `Globals.xs`. They resolve through the global-vars layer (`useGlobalVariables`) at runtime — independent of parent state narrowing — so they must not enter `computedUses` or drive implicit-container promotion. Tracked separately as `globalDepsUsed` to populate `computedGlobalUses` (see §7).
8. Excludes **Lexical Scoped Vars**. These are variables injected directly into the child context at render time (e.g., `$item` in `List` or `$queryParams` in `onFetch`). They are declared in component metadata (`contextVars` for core components, `childInjectedVars` for extension packages) and event metadata (`injectedVars`), allowing the analyzer to ignore them as external dependencies.
9. Excludes **Unstable Global Variables** (`UNSTABLE_GLOBAL_VARS`). These are navigation keys (like `$pathname`) declared in root metadata (`unstableChildInjectedVars`).
10. Forms the `computedUses` list — a minimum set of parent state keys (including necessary child component UIDs that will register their API higher up the tree).

#### Entry-point: `unwrapToComponentDef`
`computeUsesForTree` may be called with a `CompoundComponentDef` wrapper (e.g., from `StandaloneApp`) whose actual template lives in a `.component` chain. `unwrapToComponentDef()` follows the chain — without a hard depth cap — until it reaches a node that has a `type` string or a `children` array. 

#### AST parse cache (`astCache`)
Event-handler strings are parsed once and cached to avoid redundant AST work during boot-time traversal. The cache is an **LRU with a cap of 1 000 entries**, implemented cheaply via JavaScript `Map`'s insertion-order guarantee (delete + re-insert on hit; evict the first/oldest key at capacity). This bounds memory in long-running devserver/studio sessions where generated XMLUI could otherwise accumulate thousands of unique event strings.

### Runtime Protection (Defense-in-depth)
- **`ComponentWrapper`:** Uses `extractScopedState(state, computedUses)` and memoizes the result via `useShallowCompareMemoize`. State updates are terminated here if dependencies haven't changed, and lower wrappers aren't even executed. Separately, `narrowGlobalVars(globalVars, computedGlobalUses)` (see Section 7) builds a narrow change-detection snapshot from `parentGlobalVars` and uses it to ref-stabilise the full object passed to `ContainerWrapper`.
- **`ContainerWrapper`:** Receives the narrowed state `parentState={scopedParentState}` and ref-stabilised `parentGlobalVars={globalVarsWithStableRef}`, and is responsible for deploying the `StateContainer`. It checks if the node is a container (via `isContainerLike`, which considers the presence of `computedUses`).
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

### Copy-on-Write State Isolation in Event Handlers (`createCoWStateProxy`)

When an event handler executes, it needs two things simultaneously: **isolation** (writes inside the handler must not mutate `stateRef.current` directly) and **change tracking** (so the framework can dispatch only the actual mutations via the reducer). Both are satisfied by `createCoWStateProxy` in `getComponentStateClone()`.

**`getComponentStateClone()` flow:**
1. `stateRef.current` is shallow-copied at the root: `const poj = { ...originalState }`. This gives each invocation its own root object, so injections (`$this`, `$cancel`, `context` overrides) don't affect the live state.
2. **Component API object tagging (`__componentApiKey__`).** Before creating the proxy, the function iterates `Object.getOwnPropertySymbols(originalState)` to find component API objects — values registered under `Symbol("uid")` keys (e.g. `Symbol("ds")`). For each such object it attaches a non-enumerable `__componentApiKey__` property. This lets the reducer detect API-object references in handler writes (e.g., `myGlobal = ds`) and keep the variable in sync with the live API across subsequent renders.

   **Immer-frozen API objects (invariant).** After each `produce()` call, Immer deep-freezes all objects in state — including component API objects. Because `poj = { ...originalState }` only shallow-copies the root, `poj[uid]` still points to the Immer-frozen original. A frozen object is non-extensible, so `Object.defineProperty(poj[uid], "__componentApiKey__", ...)` would throw `"object is not extensible"`. Therefore: `if (!Object.isExtensible(poj[desc])) poj[desc] = { ...poj[desc] }` — a shallow-copy produces a mutable instance before the property is attached. Getters are invoked on the original (snapshot values) and method references are preserved.
3. `createCoWStateProxy(poj, onWrite)` wraps the root copy in a CoW Proxy. `poj` is the "working state" — an extensible shallow copy whose nested properties still point to the original (potentially Immer-frozen) values.
4. The resulting proxy is passed as `evalContext.localContext` — the mutable state context seen by the script runner.

**Read path:** The `get` trap reads from `liveNode()` — the original until the first write. Sub-objects (arrays and plain objects) are lazily wrapped in their own sub-proxies so that nested writes are also intercepted. Read-heavy handlers pay zero cloning cost.

**Write path:** The `set` trap calls `ensureWritable()`, which shallow-clones the node on first write (`[...original]` or `{...original}`), then sets the property on the clone. The original is never mutated. Each write emits a `ProxyCallbackArgs` entry appended to the `changes` array.

**`changes` array dispatch:** After the handler resolves, `changes` (populated via `onWrite` callbacks) is fed into the reducer for a single batched state update. Each entry contains `{ action, path, pathArray, target, newValue, previousValue }`, matching the `ProxyCallbackArgs` contract, so the downstream dispatch pipeline requires no changes.

**Proxy target discipline (Immer-compatibility invariant):**
Immer freezes all state values (`Object.isFrozen(stateValue) === true`). The `Proxy` target cannot be the frozen original — a frozen object as the proxy target causes `[[Set]]` invariant violations and blocks `Array.prototype.push` (which writes `length`). Instead, the proxy uses a fresh extensible shallow copy (`proxyTarget`) as its JS target, while all reads go through `liveNode()` and all writes go through `ensureWritable()`. After each write, `syncTarget()` keeps `proxyTarget` in sync so that `ownKeys` and `getOwnPropertyDescriptor` invariant checks remain satisfied.

**`getOwnPropertyDescriptor` trap and frozen-value correctness:**
When a frozen sub-object is wrapped in a sub-proxy, the frozen original has `configurable: false` on its properties, but `proxyTarget` (extensible copy) has `configurable: true`. The JS engine enforces: *"a property cannot be reported as non-configurable unless there exists a corresponding non-configurable own property of the proxy target."* The trap therefore returns descriptors with `configurable`/`writable` flags sourced from `proxyTarget`, not from `liveNode()`.

**`COW_LIVE_NODE` symbol — preventing proxy leakage into Immer state:**
When a handler assigns one CoW sub-proxy to another key (`state.a = state.b`), the `set` trap would otherwise store a live Proxy object in the state tree. Immer would then freeze that Proxy, triggering invariant errors on future access. The private `COW_LIVE_NODE` symbol is an escape hatch: `extractRawValue(value)` checks `value[COW_LIVE_NODE]` — if the value is a CoW proxy, it returns the underlying `liveNode()` value instead of the proxy. All `set` inputs pass through `extractRawValue` before storage.

### Lexical Scoping (Immutable Scope Propagation Mechanism)
Instead of hardcoded lists of "special" variables, the optimizer uses metadata to build the lexical scope during AST traversal:
- **Component Scope:** Container components (like `List`, `Table`, `ModalDialog`) declare their injected vars in `contextVars` (core components; extension packages use `childInjectedVars`). All expressions in children of these components automatically filter these variables.
- **Event Scope:** Event handlers (like `onFetch` in `DataLoader`) declare `injectedVars` inline in the component's `createMetadata()` call, in the `events[eventName].injectedVars` field. Each event entry is self-contained — one place to look when adding or changing an event's injected variable set. Expressions inside a specific handler filter these variables.
- **Shadowing:** Metadata-driven scoping allows local variables (like `$queryParams` in `onFetch`) to naturally shadow global ones (like router `$queryParams`), preventing false parent dependencies.

### Inline Optimizer Fields in `ComponentMetadata` (single declaration, dual path)

Optimizer-relevant fields are declared **directly in each component's `createMetadata()`
call**. There is no separate central registry. The fields split across two positions:

- **`isImplicitContainerByDefault`** and (extension packages only) `childInjectedVars` /
  `unstableChildInjectedVars` live inside the `optimization: {}` group.
- **`contextVars`** is the single source of child-injected variables for **core** components
  (see "contextVars as the single source of injected vars" below). It sits at the top level
  of `createMetadata`, beside `props` / `events`.
- **Per-event `injectedVars`** sits inline on each event entry, beside `description` /
  `signature`.

#### Source-file shape: the `optimization: {}` block

`createMetadata` accepts an optional `optimization: {}` group. The `OptimizerInput` type
(in `metadata-helpers.ts`):

```typescript
type OptimizerInput = {
  isImplicitContainerByDefault?: boolean;
  childInjectedVars?: readonly string[];        // extension packages only (core uses contextVars)
  unstableChildInjectedVars?: readonly string[];
};
```

At call time, `createMetadata` spreads `optimization`'s keys into the result `ComponentMetadata`:
component-level optimizer fields become top-level fields of the metadata object the runtime
sees. The `events:` block passes through unchanged (its `injectedVars` is already in its final
position).

**Canonical example — a Form declaring its injected var via `contextVars`:**

```typescript
// xmlui/src/components/Form/Form.tsx
export const FormMd = createMetadata({
  status: "stable",
  description: "...",
  optimization: {
    isImplicitContainerByDefault: true,
  },
  contextVars: {
    $data: d("The form's current data object, injected into child scope."),
  },
  props: { /* ... */ },
  events: {
    submit:       { description: "...", signature: "...", injectedVars: ["$data"] },
    cancel:       { description: "...", signature: "...", injectedVars: ["$data"] },
    submitFailed: { description: "...", signature: "...", injectedVars: ["$data"] },
    // ...
  },
});
```

**Where each field lives:**

| Field | Position in source | Position at runtime (after `createMetadata`) |
|-------|-------------------|----------------------------------------------|
| `isImplicitContainerByDefault` | Inside `optimization: {}` | Top-level of `ComponentMetadata` |
| `contextVars` (core: injected vars) | Top-level of `createMetadata` | Same — unchanged |
| `childInjectedVars` (extensions only) | Inside `optimization: {}` | Top-level of `ComponentMetadata` |
| `unstableChildInjectedVars` | Inside `optimization: {}` | Top-level of `ComponentMetadata` |
| `events.{name}.injectedVars` | Inside `events.{name}` (alongside `description`) | Same — unchanged |

**Why `injectedVars` sits inline with the event (not inside `optimization`):** it is part of
the event's API contract (which variables the handler receives), not just an optimizer hint.
Keeping it alongside `description`/`signature` makes each event entry self-contained — one
place to look when adding/changing an event's API. This also keeps the merge step inside
`createMetadata` trivial (a single spread; no per-event merging).

#### The Vite plugin path: `static-extractor.ts`

The Vite plugin (`vite-xmlui-plugin.ts`) and the parser it calls (`xmlui-parser.ts`) both
run in pure Node.js and cannot import React component files. The plugin uses
`static-extractor.ts` to extract optimizer fields at build time by reading
component source files as plain text:

- `extractOptimizerMetadataFromDir(dir)` globs `*.tsx` files, parses each with
  `@babel/parser` (TypeScript + JSX plugins, `errorRecovery: true`), and walks the AST to
  find the first `createMetadata({...})` call expression. Optimizer fields are resolved
  **by key**, not by position — field order inside `optimization: {}` or an event entry is
  irrelevant. Non-static values (identifier references, spread expressions) are silently
  skipped.
  *Note:* The extractor pulls `childInjectedVars`, `unstableChildInjectedVars`, `isImplicitContainerByDefault`, event `injectedVars`, and **the keys of `contextVars`**.

- The Vite plugin accepts `optimizerSourceDirs?: string[]` to cover extension packages.
  Without this option, extension package components in Vite mode over-subscribe (graceful
  degradation).
- **Static-literal constraint:** all optimizer values must be **static string literal arrays**
  in source (no computed values, no spread, no identifier references). This is the
  established convention.

**Precedence chain when `optimizerSourceDirs` is provided.** The plugin composes:

```
extensionMetadata[type]     ← scanned from optimizerSourceDirs (last-dir-wins on collision)
  ?? coreComponentMetadata  ← engine-internal (DataLoader, ExternalDataLoader)
  ?? collectedComponentMetadata  ← public components
```

Extension keys colliding with each other emit a `console.warn` (last-dir-wins).
**Extension keys that shadow a built-in (core or public) component also emit a `console.warn`** —
if an extension declares a name matching a core or public built-in, the warning surfaces in
the Vite startup log. The extension still wins; the warning exists to surface accidental
overrides rather than silently clobbering metadata.

#### The Standalone runtime path: `getOptimizerMetadata`

`getOptimizerMetadata` (in `optimization/metadataLookup.ts`) is the unified lookup for
Standalone mode and all non-Vite callers. It searches two registries in order:

1. **`coreComponentMetadata`** (`components-core/coreComponentMetadata.ts`) — engine-internal
   components (`DataLoader`, `ExternalDataLoader`) that are intentionally absent from the
   public registry. `DataLoader` metadata lives in the separate `loader/DataLoaderMd.ts` file
   to avoid circular imports.
2. **`metadataRegistry`** (`language-server/metadataRegistry.ts`) — the shared live registry
   that backs both lookup paths. At startup it contains the generated static snapshot
   (`xmlui-metadata-generated.js`, pure JS, Node-safe). When `collectedComponentMetadata.ts`
   loads (browser / vitest), it calls `Object.assign(metadataRegistry, { Button: ButtonMd, ... })`
   — populating the same object in place. Afterwards `collectedComponentMetadata === metadataRegistry`
   (same reference), so test mutations such as `(collectedComponentMetadata as any).MyGrid = {...}`
   are immediately visible to `getOptimizerMetadata`.

`StandaloneApp.resolveOptimizerMetadata` delegates to `getOptimizerMetadata`:

```ts
// StandaloneApp.tsx
function resolveOptimizerMetadata(type: string) {
  return getOptimizerMetadata(type);
}
```

The Vite plugin (`vite-xmlui-plugin.ts`) also calls `getOptimizerMetadata` as the fallback
in its extension lookup composition (`extensionMetadata[type] ?? getOptimizerMetadata(type)`),
so both paths read from the same function and the same backing object.

#### `OptimizerMetadataView` — typed lookup contract

`OptimizerMetadataView` (in `ComponentDefs.ts`) is the strict subset of `ComponentMetadata`
the optimizer reads:

```typescript
export type OptimizerMetadataView = {
  isImplicitContainerByDefault?: boolean;
  childInjectedVars?: readonly string[];
  unstableChildInjectedVars?: readonly string[];
  /** Only the keys of contextVars are read (for extension-package components). */
  contextVars?: Record<string, unknown>;
  events?: Record<string, { description?: string; injectedVars?: readonly string[] }>;
};
```

All lookup functions are typed `(type: string) => OptimizerMetadataView | undefined`.
This prevents accidental coupling to unrelated metadata fields and documents exactly
what the optimizer may read.

#### `metadata.contextVars` as the single source of injected vars (core components)

`metadata.contextVars` (`Record<string, ComponentPropertyMetadata>`) is the **single
declaration** of every variable a core component injects into child scope. Each entry
carries a description (and, for internal vars, `isInternal: true`), serving the
**optimizer**, the **Language Server**, and documentation tooling from one place.

- **Public vars** are declared with `d("...")` — they appear in generated docs.
- **Internal vars** are declared with `dInternal("...")` — they carry `isInternal: true`,
  so the docs generator (`MetadataProcessor.mjs`, filter `!v.isInternal`) excludes them,
  while the optimizer still sees the key.

Core components **no longer declare `optimization.childInjectedVars`** — it was removed from
all 20 of them. The full set (including formerly-internal-only vars like `$cell`,
`$colIndex`, `$selectedValue`, `$inTrigger`) now lives in `contextVars`. The
`renderer-metadata-drift.test.ts` CI test enforces this: every `$`-key a renderer injects
must be declared in `metadata.contextVars` (no longer accepted in `childInjectedVars`).

> **`unstableChildInjectedVars` is untouched** — it remains the one explicit exception (different
> semantics; navigation keys like `$pathname`). The field and its optimizer support remain.

#### The injected-vars spread in `computedUses.ts`

```typescript
const childInjected = [
  ...(metadata?.childInjectedVars ?? []),        // extension packages only
  ...(metadata?.unstableChildInjectedVars ?? []),
  ...Object.keys(metadata?.contextVars ?? {}),   // PRIMARY for core components
];
```

The three spreads feed the same `childScope`, so the optimizer is agnostic to which field a
var was declared in. After the migration:

- For **core components**, the third spread (`contextVars` keys) is the **sole** source.
- For **extension packages** (`xmlui-masonry`, `xmlui-react-flow`, `xmlui-grid-layout`, etc.)
  that still declare `optimization.childInjectedVars`, the first spread covers them; if they
  document vars in `contextVars` instead, the third spread covers them.

**Full Build-Path Support:** This works consistently across both the Standalone runtime
(which reads the full metadata object) and the Vite plugin build-path. `static-extractor.ts`
extracts the keys of the `contextVars` object literal into the build-time metadata (via AST),
so both paths see the same injected-var set.

**Critical gap: extension packages that declare `renderers[slot].contextVars` but omit
`metadata.contextVars`.** If an extension component injects e.g. `$tooltip` via
`renderers: { tooltipTemplate: { contextVars: ["$tooltip"] } }` but its `createMetadata` call
declares `$tooltip` in neither `contextVars` nor `optimization.childInjectedVars`, none of the
spreads contribute it. The optimizer then treats `$tooltip` as an external parent dependency
(incorrectly), and runtime `validateInjectedVars` hard-fails in DEV mode with
`[XMLUI Lexical Scoping] Component X injected variables ($tooltip) into its template, but they
are NOT declared ...`

**Rule:** every component (core or extension) that injects a var via
`renderers[slot].contextVars` **must** declare that var in `metadata.contextVars` (core:
required; use `d`/`dInternal`) or, for extension packages, in
`optimization: { childInjectedVars: [...] }`.

#### The single-source picture for a component like `List`

| Source | Who reads it | What it contains |
|--------|-------------|------------------|
| `metadata.contextVars` (core components) | Optimizer (Vite via `static-extractor.ts` AND Standalone via `getOptimizerMetadata`), Language Server, drift test, `validateInjectedVars` | `{ $item: d("..."), $isSelected: dInternal("..."), ... }` — single source: optimizer keys + docs |
| `metadata.childInjectedVars` (extension packages only) | Optimizer (both paths) | `["$item", "$itemIndex", ...]` — optimizer keys for extensions |

The `renderer-metadata-drift.test.ts` CI test validates alignment between renderer slots
and `metadata.contextVars` (AST-based, via `static-extractor.ts`); `validateInjectedVars`
validates it at runtime.

### Lexical Scoping at Runtime: Local Vars Win over Outer Scope (`useVars`)

At render time, the actual values are merged in [`useVars`](../../src/components-core/state/variable-resolution.ts). When `useVars` iterates over `vars` (an ordered map of `{...node.functions, ...node.vars, ...parsedScriptPart.vars}`) it builds `ret` incrementally — each iteration resolves one var and stores it in `ret`. To evaluate the next var's expression, it constructs a `stateContext`:

```ts
const stateContext: ContainerState = { ...componentState, ...ret };
```

**Invariant:** the spread order is `componentState` first, then `ret`. Vars resolved locally in this container (in `ret`) **shadow** any same-named keys arriving from the outer `componentState`. Without this, a parent's `$props`/`$context`/`$item` leaking through narrowing would silently override what `CompoundComponent` (or `MemoizedItem`, or `Container.contextVars`) placed into `ret` for this container — causing a nested UDC's `var.x = "{$props.y}"` to read the **outer** UDC's `$props` instead of its own.

**Why this matters across the framework, not only for UDCs:**
- `CompoundComponent` writes `$props: resolvedProps` into the inner Container's `node.vars`. Every nested UDC depends on `ret.$props` shadowing any outer `$props`.
- `<ContextMenu>` customRender creates a runtime Container with `contextVars: { $context }`. The inner template depends on this local `$context` shadowing any outer one.
- `<MemoizedItem>` per-row contextVars (`$item`, `$itemIndex`, `$row`, `$cell`, ...) must shadow the same names from an enclosing iterator.
- Form/FormItem/Queue similarly inject names (`$data`, `$value`, `$setValue`, `$completedItems`) into their own scope that must shadow upstream values.

**Interaction with `extractScopedState` preservation:** `extractScopedState` preserves `$`-prefixed keys across narrowing so lexical names (e.g. `$item` from a parent `<Column>`) survive when an implicit container narrows state. That preservation means `componentState` will routinely carry names that *also* appear in `ret` for nested writers. The `{...componentState, ...ret}` spread order is therefore load-bearing: it's the only thing preventing parent-side framework names from corrupting locally-injected values.

**Why the order is safe:** `ret` only ever contains keys this container's own metadata defines (script `vars`, code-behind `functions`, `node.vars` written by the renderer). It cannot pollute `componentState` for *other* containers — each container has its own `ret`. Outer-scope keys this container does NOT redefine pass through unchanged from `componentState`.

**Cache implication:** [`obtainValue`](../../src/components-core/state/variable-resolution.ts) memoizes per-expression with `shallowCompare(newDeps, lastDeps)` where deps come from `pickFromObject(stateContext, dependencies)`. If `stateContext` ever lacks a needed `$`-key, `pickFromObject` returns `{}` (the dotted path resolves to `undefined`), `shallowCompare({}, {}) === true`, and the cache locks in the **first** computed value forever. The spread-order rule prevents this latent cache failure as a side benefit — once `ret.$props` reliably wins, the picked deps reflect the real value and cache invalidation works.

### Code-Behind Transitive Analysis (`scriptCollected` and `.xs` files)

The optimizer performs **transitive AST analysis** of code-behind function bodies to determine the actual parent-scope dependencies of each function.

#### `collectScriptFunctionDeps` — DFS function-body analysis

The helper `collectScriptFunctionDeps(functions, localNames)` in `computedUses.ts`:

1. For each `ArrowExpression` in the function map, wraps it as a fake `CodeDeclaration` — `{ [PARSED_MARK_PROP]: true, tree: arrowExpr }` — so that `depsOfValueWithReads` routes it through `collectVariableDependencies`. The `T_ARROW_EXPRESSION` handler in the scripting engine sets up parameter scope correctly, meaning function parameters are treated as local variables and only free vars (parent-scope refs) are returned.
2. Performs DFS with a **visited-set** to follow transitive calls between functions in the same code-behind block. Mutual recursion (`a` calls `b`, `b` calls `a`) is handled safely — the visited-set breaks the cycle and contributes only the deps discovered before the cycle.
   **Union-only cache invariant:** results are cached per function name inside one `collectScriptFunctionDeps` call. The cached value for `b` may be incomplete when first computed during `a`'s DFS (because `a` was still in the visited-set). This is safe only because the outer loop takes the *union* over all top-level function names — each function also receives an independent top-level pass that recovers any deps cut by the visited-set. Do not use cached per-function results directly; only the final union is correct.
3. Separately analyzes `scriptCollected.vars` initializer expressions via `addRecord`, because a code-behind var's initial value (e.g. `var count = appState.x + 1`) may reference parent state.

#### Narrowing split: node vs. children

The "disable narrowing" concern is split into two independent flags:

| Flag | Controls | Value |
|------|----------|-------|
| `disablesChildNarrowing` | `nextDisableNarrowing` passed to children | `true` when node has **any** code-behind |
| `ownHasScript` | `safeToNarrow` for **this node** | `true` when `hasInvalidStatements` OR `hasUnresolvableImports` (unresolved imports in standalone sync-path). |

Children of a code-behind node are still treated conservatively via `nextDisableNarrowing`; function-free children without parent-function calls can still be narrowed (the `dependsOnParentFunction` check controls this).

#### Fragment script hoisting

When the XMLUI parser encounters a `<script>` sibling alongside other component
children, it wraps the non-helper siblings in a synthetic `Fragment` and attaches
`scriptCollected` to that Fragment. `hoistScriptCollectedFromFragments` in
`transform.ts` then promotes the script up to the enclosing parent component **iff** it
is safe to do so, so that subsequent static analysis sees `scriptCollected` on the same
node it logically belongs to (the parent, not the synthetic Fragment).

Two gating rules — both AST-level, not textual — decide hoisting safety:

1. **No context-var reads.** `scriptCollectedReadsContextVars(sc)` walks each
   collected declaration's tree (`sc.vars[*].tree`, `sc.functions[*]` directly) via
   `collectVariableDependencies` and returns `true` if any identifier starts with `$`.
   A textual regex would false-positive on `$word` inside string literals or
   comments; the AST walk only sees real identifier nodes. If `true`, the Fragment
   keeps its script (context variables are component-specific and must stay at the
   iteration level). On AST-walk failure the helper conservatively returns `true`
   to avoid losing a dependency.

2. **No name collisions.** Before merging, the helper checks that no key in
   `child.scriptCollected.vars` / `functions` collides with the parent's existing
   declarations. A collision would cause a duplicate top-level declaration in the
   concatenated `script` text — fatal if that text is later re-parsed by
   `collectCodeBehindFromSourceWithImports` during the standalone import-resolution
   pass. On any collision the Fragment is left in place rather than risk the
   re-parse error.

When both gates pass, the Fragment's `scriptCollected.vars` and `functions` merge
into the parent (parent wins on overlap, which is moot because the no-collision
guard already excluded overlaps), the `script` text is concatenated for re-parse
fidelity, and `child.scriptCollected` / `child.script` are deleted to prevent
double-counting.

#### Script Analysis Guards (`hasInvalidStatements` and `hasUnresolvableImports`)

Static analysis narrowing is blocked for a node if its script dependency set is potentially incomplete:

- **`hasInvalidStatements`**: Set if the parser encounters unsupported top-level statements (e.g., `if`, `for`, or direct function calls). This blocks narrowing permanently for the component.
- **`hasUnresolvableImports`**: Set in Standalone mode during the initial synchronous parse when `import` statements are encountered. This initially blocks narrowing.

**Runtime Resolution Pass (Standalone Mode):**
To enable narrowing for components with imports in Standalone mode, `StandaloneApp.tsx` performs an asynchronous runtime pass (`collectImportsFromStandaloneSources`) before initial rendering. It resolves imports sequentially using `appDef.sources` (or network fetch), merges declarations into the `newAppDef` render tree, clears `hasUnresolvableImports`, and **triggers a re-computation** of `computedUses` for the tree using `appGlobalNames`.
- **Performance / idempotency (two complementary layers):**
  1. **`resolveRuntime` memoization** — wrapped in `useMemo([runtime])` so the
     compilation pass runs at most once per source-identity change.
  2. **Effect-level `lastImportResolutionKeyRef`** — the `useIsomorphicLayoutEffect`
     that drives `collectImportsFromStandaloneSources` holds a `useRef` storing the
     `{resolvedRuntime, standaloneAppDef, basePath}` tuple. On entry the effect
     strict-compares the current deps to the previously processed key and
     early-returns when they all match. The ref is updated **synchronously**
     immediately before the async IIFE, so React StrictMode's dev double-invoke
     (and any harmless re-render that fires the effect with unchanged deps)
     observes the populated value on the second pass and skips the async work
     entirely. Without this latch, every double-invoke would re-fetch every `.xs`
     module: each fresh `newAppDef` rebuild restores
     `scriptCollected.hasUnresolvableImports = true`, so the per-node guard
     inside `collectImportsFromStandaloneSources` cannot prevent re-fetches by
     itself.

  Combined, the two layers make the resolution pass idempotent *both* per-node
  (within one run) *and* across runs (under StrictMode and benign re-renders).
- **Tree Mutability:** The resolution pass directly mutates the `appDef` tree intended for rendering, distinct from the `projectCompilation` snapshot.

**Function-Free Child Narrowing:** Built-in components (like `Select`) inside a user component with code-behind can still be narrowed IF they don't call any parent functions. This is determined via the `dependsOnParentFunction` check during analysis.

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

### `computedGlobalUses` — opposite rule: LIFT, do not discard

The globals annotation is *not* sensitive to tree restructure. `Globals.xs` lives in the
global-vars layer regardless of where local `vars` sit, so the set of globals a body
reads is unchanged when its `vars` move to a synthesized wrapper. The set of globals
*written* by the body is similarly invariant — and irrelevant anyway, because
`computedGlobalUses` is reads-only (see §7).

`CompoundComponent.tsx` therefore extracts `computedGlobalUses` from the body during
the destructure and **lifts** it onto the synthesized wrapper `Container`:

```ts
const {
  loaders, vars, functions, scriptError,
  computedUses: _staleComputedUses,   // discarded — see invariant above
  computedGlobalUses,                  // lifted — restructure-invariant
  ...rest
} = compound;

return {
  type: "Container",
  ...,
  uses: scopedGlobalKeys,
  computedGlobalUses,                  // wrapper gets the same narrowing as a static container
};
```

Without this lift the runtime wrapper would carry no annotation and receive ALL
`parentGlobalVars`, defeating the optimization for every UDC instance.

---

## 5.5. Invariant: "State Cleanliness Between Multi-Pass Analysis"

**CRITICAL:** The `computeUsesForTree` algorithm is called **multiple times** on overlapping or reused node objects:
1. In `xmlui-parser.ts:59` after parsing each `.xmlui` file (before `.xs` code-behind is merged)
2. In `StandaloneApp.tsx` during `resolveRuntime` for compound components (after `.xs` functions are attached)
3. In `StandaloneApp.tsx` during runtime import resolution if any imports were resolved (after `.xs` imports are fetched and merged into the render tree)

Between passes, node objects are **NOT cloned** — the same `ComponentDef` references are reused (e.g., `compound.component.children[i]`).

**Problem:** If pass 1 sets `node.computedUses` but later passes determine a different narrowing is needed (e.g., because `node.functions` was populated), the stale value from pass 1 survives. This causes incorrect narrowing at runtime.

**Mechanical Guard:** At the **start of `computeUsesInternal`** (before any analysis):
```ts
node.computedUses = undefined;
```

This ensures each traversal starts with clean state. The current pass becomes the single source of truth for `computedUses`. Stale values from previous passes are always cleared.

**Why mechanical (not conditional):** Clearing unconditionally guarantees correctness regardless of code path or future refactoring — a conditional clear-only-if-needed approach would add control-flow complexity and risk leaving stale values. A `computedUses` value from pass 1 (before `.xs` functions are attached) that survived into the runtime pass would narrow the wrong state slice: for example, filtering out a component-API reference that is only visible once `.xs` is merged, causing event-handler invocations to fail with `"Cannot read properties of undefined"`.

---

## 6. Optimization Guards (Validation)

### Inline Optimizer Fields — no merge step required

Optimizer fields (`contextVars` for core components — or `childInjectedVars` for extension
packages, `isImplicitContainerByDefault`, `unstableChildInjectedVars`, event `injectedVars`)
are declared directly in each component's `createMetadata()` call.
The `ComponentMetadata` object passed to `wrapComponent` already contains all optimizer
fields. `validateInjectedVars` reads them directly; no enrichment step at registration time.

### Runtime Validation (`validateInjectedVars`) — Layer 4 (Runtime Hard-Fail)
To protect against developer error (forgetting to update metadata when adding new injected variables), a runtime check exists in `__DEV__` mode.
- **`wrapComponent.tsx`** (four call sites in renderer-slot/MemoizedItem injection paths): calls `validateInjectedVars(node.type, metadata, contextVars)` — *without* `eventName` — whenever a renderer-slot callback injects contextVars into a `MemoizedItem`. This validates against `metadata.childInjectedVars` and `metadata.contextVars`.
- **`ComponentAdapter.tsx`**: calls `validateInjectedVars(safeNode.type, descriptor, actionOptions.context, eventName)` — *with* `eventName` — for event-handler context injections. This validates against `metadata.events[eventName].injectedVars` in addition to the child-level fields.
- **Exemptions (`EVENT_PAYLOAD_RESERVED_NAMES`):** The framework injects standard variables into every event payload (e.g., `$event`, `$value`, `$oldValue`, `$newValue`). These universal keys are automatically exempt from the mismatch check and do not need to be declared in `injectedVars`.
- If a mismatch is found (a variable starts with `$` but is not declared), a **hard-fail `throw`** is raised in development (gated by `import.meta.env?.DEV`). In production builds the same condition logs a `console.error` instead, so misconfigured extension components keep working with graceful degradation.
- The thrown error message names the offending component and its inline `createMetadata()` declaration in `<Component>/<Component>.tsx`, so the fix is immediate.

### Static Drift Check (CI-time) — Layer 2 (Static AST Audit)

To ensure consistency between component implementation and registry declarations, a unit test in
[`xmlui/tests/components-core/optimization/renderer-metadata-drift.test.ts`](../../../tests/components-core/optimization/renderer-metadata-drift.test.ts)
performs two types of static analysis:

#### U-audit.1: Renderer contextVars vs. `metadata.contextVars`
Statically walks every built-in component's `renderers.{slot}.contextVars`
declaration and asserts that each `$`-key is also declared in the component's
`metadata.contextVars` (extraction is AST-based via `static-extractor.ts`, robust
to formatting). `childInjectedVars` is **no longer** an accepted declaration site
for core components. This catches drift at PR time, not at the next E2E run.
Renderers that compute `contextVars` via a callback cannot be audited statically
and rely on runtime validation. (The separate `U-audit.1-ext` block still enforces
`childInjectedVars` for extension packages under `packages/xmlui-*/`.)

**Scope limitation:** the test scans only `xmlui/src/components/` and `xmlui/src/components-core/`.
Extension packages in `packages/xmlui-*/` are **not covered**. Missing `childInjectedVars` in
those packages is caught only by the runtime `validateInjectedVars` hard-fail (DEV mode) and
by E2E tests that exercise the relevant template slot. If a package is mature and its
templates are covered by E2E, this is acceptable; otherwise, the audit should be extended
to include the package's source directory.

#### U-audit.2: Static String-Literal Presence Check
For every entry in `collectedComponentMetadata + coreComponentMetadata` that has non-empty
`childInjectedVars`, `unstableChildInjectedVars`, or event-level `injectedVars`, the test
verifies that every declared `$var` appears as a string literal somewhere in the component's
source files (including auto-discovered sibling `*.tsx` files in the same directory — no
hand-maintained special-case list needed).

This check catches the "forgotten variable" drift:
- Developer adds `$newVar` to inline `createMetadata()` but never actually uses it in the component.
- Catching this ensures the optimizer doesn't reserve names that aren't genuinely local, which could otherwise shadow legitimate parent variables.

Both audits read `.tsx` files as plain text via regex, avoiding the overhead of TS compilation or importing React modules.

#### U-audit.3: Static Metadata Snapshot Drift Check (CI-time)
To ensure the build-time metadata snapshot (`xmlui-metadata-generated.js`) remains identical to the source components, a CI guard (`check:metadata-snapshot`) enforces the invariant: **committed snapshot == regenerate(source)**.

This check:
1. Runs the full metadata build (`build:xmlui-metadata`).
2. Regenerates the snapshot file (`gen:langserver-metadata`).
3. Uses `git diff --exit-code` to fail CI if the regenerated file differs from the committed version.

This prevents the Standalone/Node path from using stale metadata when new optimizer fields (or props/events) are added to components.

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
  !isBuiltinGlobal(d) &&          // ECMAScript + universally available platform globals
  !isBrowserHostGlobal(d) &&      // window, document, navigator
  !isXmluiFrameworkGlobal(d) &&   // Actions, toast, navigate, …
  !appGlobalNames.has(d) &&       // Globals.xs vars + functions
  !injectedVarsScope.has(d);
```

**Invariant:** If a new framework global is added to `appContextValue`, it must:
1. Be added to `AppContextDeps` interface in `appContextFactory.ts` (strict type-checking).
2. Be passed from `AppContent.tsx` when calling `buildAppContextValue()` (TypeScript will error if forgotten).
3. Automatically propagate to `XMLUI_GLOBAL_NAMES` (no manual list to maintain).

#### `BROWSER_HOST_GLOBALS` — browser host-object filter

Browser host objects (`window`, `document`, `navigator`) resolve via `globalThis` at the end of the script engine's identifier resolution chain (`eval-tree-common.ts` — the chain is: local scope → `localContext` → `appContext` → `globalThis`). They never live in parent UI state, so they must not enter `computedUses` nor inflate `nonDynamicReadDeps` and falsely promote an implicit container.

**Deliberately minimal set:** Only `{window, document, navigator}` — unambiguous host objects that are never plausible XMLUI state-variable names. `location`, `history`, `screen`, `self`, `top`, `parent`, `frames` etc. are **intentionally excluded** — a developer could legitimately name a variable `screen` or `location`, so filtering those would silently drop real deps. The same reasoning applies to any ambiguous browser property: when in doubt, leave it out of the filter.

#### `appGlobalNames` — Globals.xs variables and functions

An app-level `Globals.xs` file declares reactive global state (variables and functions) accessible to all components. These resolve through the **global-vars layer** (`useGlobalVariables`) — a separate React-context layer that operates independently of `extractScopedState` narrowing. Consequently, Globals.xs names must not enter `computedUses` (they are never filtered by narrowing) and must not trigger implicit-container promotion.

**How names are supplied:** `computeUsesForTree` and `computeUsesForSubtree` accept an optional `appGlobalNames: ReadonlySet<string>` parameter (default `EMPTY_SET`). `resolveRuntime` builds this set from `globalsXs.vars` and `globalsXs.functions`. It is then memoized in `StandaloneApp.tsx` and explicitly passed into subsequent re-computation passes (e.g., after runtime import resolution) to prevent global variable names from leaking into parent-state dependencies.

**Why this is the authoritative pass:** The parse-time Vite plugin pass (`xmlui-parser.ts:61`) does not know Globals.xs and uses the default `EMPTY_SET`; its result is overwritten by the `resolveRuntime` pass and any subsequent runtime resolution passes (because `computeUsesInternal` mechanically clears `node.computedUses = undefined` before each traversal per Invariant 5.5). So the final state always reflects the correct filter.

**Zero hardcoding:** The set is derived directly from `globalsXs` at startup — no manual name list to maintain. Adding or removing a variable in `Globals.xs` automatically updates the filter on the next app reload.

> **`appGlobalNames` also drives `computedGlobalUses` narrowing** — the same set is used by
> the optimizer to identify which dep names belong to the globals layer and must be tracked
> separately. See Section 7 below.

---

## 7. Global Variables Narrowing (`computedGlobalUses`)

`computedGlobalUses` is the globals-layer counterpart to `computedUses`. Where
`computedUses` narrows `parentState` (local container state), `computedGlobalUses` drives
ref-stabilisation of `parentGlobalVars` (the `Globals.xs` channel). Each container carries
a sorted list of the Globals.xs variable names its subtree actually reads; `ComponentWrapper`
uses this list for change-detection (narrow snapshot via `useShallowCompareMemoize`) and
passes the **full** `globalVars` object to `ContainerWrapper`, updating its reference only
when a tracked global changes. This means a container that reads only `events` is
re-render-isolated from changes to `sortBy`.

### `computedGlobalUses` in the Data Flow

```
parentState      narrowed by computedUses              → scopedParentState       (ComponentWrapper)
parentGlobalVars FULL object, ref-stabilised by        → globalVarsWithStableRef (ComponentWrapper)
                 computedGlobalUses change-detection
```

Both projections are memoized with `useShallowCompareMemoize`. When neither the relevant
state slice nor the relevant globals slice changes, `ContainerWrapper.memo` sees the same
props and the subtree does not re-render.

### Static Analysis: `computeUsesInternal` Emits `computedGlobalUses`

`computeUsesInternal` returns a **4-tuple** `[parentDeps, escapingUIDs, parentDepsReads, globalDepsUsed]`.
The 4th element carries Globals.xs dep names upward through all return paths.

Steps during traversal:

1. `node.computedGlobalUses = undefined` is cleared unconditionally at entry (same
   mechanical-guard pattern as `node.computedUses`; see Invariant 5.5).
2. A `childGlobalDeps: Set<string>` accumulator collects global dep names from child
   subtrees alongside the existing `childDeps`.
3. After `processChildList`, an `isGlobalDep` predicate identifies names in
   **`usedHereReads`** (the reads-only set; see "Reads-only asymmetry" below) where
   `appGlobalNames.has(d)` and the name is not in `localDeclared` or
   `injectedVarsScope`. These, unioned with `childGlobalDeps`, form `globalDepsUsed`.
4. For container nodes (both implicit and explicit — the `node.uses` field controls
   *parent-state* narrowing only and is irrelevant here): if `globalDepsUsed` is
   non-empty **and `safeToNarrow` is true** (the same guard that protects `computedUses`),
   `node.computedGlobalUses = Array.from(globalDepsUsed).sort()`.

**`safeToNarrow` gate:** `computedGlobalUses` is subject to the same safety conditions
as `computedUses`:
- Nodes with `scriptCollected.hasInvalidStatements = true` have an incomplete dep set;
  a global read only in an unparsed statement would be absent from `globalDepsUsed`, so
  `computedGlobalUses` would silently strip it from `parentGlobalVars` at runtime.
- Nodes that depend on a parent-scope function while `nextDisableNarrowing = true` are
  also considered unsafe for the same reason.

In both cases `safeToNarrow = false` and `node.computedGlobalUses` is left `undefined`,
causing `ComponentWrapper` to pass the full un-narrowed `globalVars` downstream.

**Reads-only asymmetry with `computedUses`:**
`globalDepsUsed` is built from `usedHereReads` (the reads set), not `usedHere` (reads +
write targets). A write-only global — e.g. an event handler `myGlobal = 'x'` with no
read of `myGlobal` anywhere in the subtree — is therefore **not** annotated. This is
correct because `ComponentWrapper` uses a two-step gate (see below) that always forwards
the FULL `globalVars` to the child for evaluation; the narrowed snapshot is only used
for change detection. A write target remains reachable at runtime regardless of whether
it is in `computedGlobalUses`. Including write-only globals would only cause needless
re-renders whenever an external change to one produced a different snapshot, with no
visible effect on the subtree because it never reads the value.

Parent-state `computedUses` is the opposite: it lists `usedHere` (reads + writes)
because `extractScopedState(state, computedUses)` IS the actual evaluation scope, and
the script engine throws `"Left value variable not found in the scope"` if a write
target is missing from the narrowed state. Globals do not have this constraint because
they are evaluated against the full forwarded object — hence the asymmetry is principled,
not accidental.

**Why a separate 4th return value?**  
`keepDep` filters `appGlobalNames` out of `parentDependencies` — Globals.xs names must not
enter `computedUses`. Without explicit tracking they would be silently discarded after that
filter. The 4th element is their dedicated upward propagation path.

**Subtree coverage invariant:** `computedGlobalUses` on a container node is the **union**
of all global deps in its entire subtree. Narrowing at the container therefore never
starves a grandchild component — the grandchild's global reads are always included in the
ancestor's annotation.

### `getWrappedWithContainer` — forwarding to `ContainerWrapperDef`

`getWrappedWithContainer` in `ContainerWrapper.tsx` uses the same move-and-delete pattern
as `computedUses`:

```typescript
computedGlobalUses: node.computedGlobalUses,  // moved to ContainerWrapperDef
...
delete wrappedNode.computedGlobalUses;         // prevent isContainerLike re-detection
```

### `narrowGlobalVars` (`ContainerUtils.ts`)

```typescript
export function narrowGlobalVars(
  vars: Record<string, any>,
  uses: readonly string[],
): Record<string, any>
```

#### Key inclusion rules

| Key pattern | Included? | Rationale |
|-------------|-----------|-----------|
| `typeof value === "function"` | **Always** | Globals.xs functions may be called from any expression in the subtree; cannot be narrowed |
| `__tree_<name>` | Only when `name ∈ uses` (after transitive expansion) | AST metadata for `useGlobalVariables` dep-tracking; relevant only when the variable is in scope |
| all other value keys | Only when `key ∈ uses` (after transitive expansion) | Core narrowing: variables not in the subtree's read-set are excluded |

#### Transitive closure of `uses`

Before applying the inclusion rules, `narrowGlobalVars` expands `uses` transitively using an
**index-based worklist**: the initial `uses` array seeds a `worklist[]`; a loop walks it by
index (not by iterator), so newly discovered deps can safely be appended to the end and
processed in the same pass without mutating a live iterator. For each entry, if its
`__tree_<key>` AST is present, `collectVariableDependencies` extracts identifiers referenced
by that expression; any referenced name that exists in `vars` and is not yet in the set is
appended to the worklist and added to `usesSet`. Each dep is processed exactly once; no
`while(changed)` re-scan is needed.

**Why this is necessary:** `useGlobalVariables` builds a `depMap` keyed by `"x:y"` to
track when a dep `y` of global `x` changes. If `y` is narrowed out of `parentGlobalVars`,
`allCurrentGlobals.y` is `undefined`, the dep-map entry is always `undefined`, and
`useGlobalVariables` cannot detect that `y` changed — potentially serving a stale value for
`x`. Including transitive deps prevents this.

#### Function-key cache

`narrowGlobalVars` maintains a module-level `WeakMap` (`_globalFunctionKeysCache`) from
`vars` reference → `Set<string>` of function-typed keys. All containers rendered in the
same pass share the same `parentGlobalVars` reference; the first container populates the
cache and all subsequent containers reuse it without scanning the entire object again.

#### Result cache

A second module-level `WeakMap` (`_narrowCache`) caches the **full narrowed result**
object keyed on `(vars, usesKey)` where `usesKey = uses.join("\0")` (stable because
`computedGlobalUses` is always emitted sorted; `\0` avoids delimiter collisions).

```
_narrowCache: WeakMap<vars, Map<usesKey, narrowedObject>>
```

Benefit: containers that share the same `computedGlobalUses` list across a single render
pass (e.g. all rows in a file list all reading `["sortBy", "view"]`) receive the
**same object reference**. `useShallowCompareMemoize` in `ComponentWrapper` can then
short-circuit on identity before even doing a key-by-key comparison.

**Immutability contract:** every cached result is `Object.freeze`d in development builds.
Callers **must not mutate** the returned object — it is shared across all consumers with
the same `(vars, uses)` combination. An in-place write would silently corrupt every
other container in the same render pass.

**Snapshot immutability:** the cache is correct only because `globalVars` snapshots are
effectively immutable — `global-variables.ts` produces a new object reference via
`useShallowCompareMemoize` whenever any value changes, so the same object identity
always corresponds to the same content.

### `ComponentWrapper.tsx` applies the narrowing

```typescript
const nodeComputedGlobalUses = nodeWithTransformedDatasourceProp.computedGlobalUses;

// Step 1 — narrow snapshot for change-detection only.
// When computedGlobalUses is absent, return undefined so useShallowCompareMemoize
// takes the O(1) reference-identity fast-path instead of an O(n-globals) comparison.
const narrowedGlobalVarsForComparison = useShallowCompareMemoize(
  useMemo(
    () =>
      nodeComputedGlobalUses && globalVars
        ? narrowGlobalVars(globalVars, nodeComputedGlobalUses)
        : undefined,
    [globalVars, nodeComputedGlobalUses],
  ),
);
// Step 2 — pass the FULL globalVars to the child, but update its reference
// only when the narrow snapshot changes (or, when absent, whenever globalVars
// itself changes). This ensures write targets that are absent from
// computedGlobalUses (e.g. `view = 'large'`) are still present in the scope
// exposed to the child's expression evaluator.
// eslint-disable-next-line react-hooks/exhaustive-deps
const globalVarsWithStableRef = useMemo(() => globalVars, [narrowedGlobalVarsForComparison ?? globalVars]);
// ...
<ContainerWrapper parentGlobalVars={globalVarsWithStableRef} ... />
```

When an unrelated global changes, the narrowed comparison snapshot's contents are
identical, `useShallowCompareMemoize` returns the same reference, the outer `useMemo`
does not recompute, `globalVarsWithStableRef` keeps the same reference, and `ContainerWrapper.memo`
sees unchanged props — no re-render is triggered.

### Impact on downstream components

`useGlobalVariables` and `StateContainer` require no changes — they receive the full
`parentGlobalVars` object (`globalVarsWithStableRef`) with a ref-stabilised reference and
behave correctly. The existing `useShallowCompareMemoize` inside `useGlobalVariables`
provides reference stability once the input object stops changing.

When `computedGlobalUses` is `undefined` (no Globals.xs reads in the subtree),
`narrowedGlobalVarsForComparison` is `undefined`, so `globalVarsWithStableRef` tracks
`globalVars` directly — no narrowing overhead, correct pass-through semantics.

---

*Note: To view render statistics in the browser during development, use `window.__renderCounts` (per-label counters), `window.__topRenderCounts(n=10)` (top N most-rendered labels), and `window.__resetRenderCounts()` (zero all counters).*


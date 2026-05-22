# Code Review: `yurii/computedUses` branch vs `main` — Outstanding Items

> Analysis Date: 2026-05-15
> Last Update: 2026-05-22 (Trivial fixes applied — only unresolved items remain)
> Comparison: `0c42b6f3a5d7e86aff7b8119699bbadc2e7bdd31` (merge-base) → HEAD
> Resolved items (B1, D4, N1, N5, D8, C4) have been removed from this file.

---

## 🟠 Reference-identity / fragile patterns

### N2: Two divergent `depsOfValue` implementations

The static-analysis "dependency walker" exists in two places with **different signatures and behaviour**:

1. [computedUses.ts:177-230](xmlui/src/components-core/optimization/computedUses.ts#L177-L230) — returns `{ all: string[]; reads: string[] }`. Distinguishes assignment-targets from real reads (so write-only deps don't trigger implicit-container promotion). Handles `string`/`object.statements`/`isParsedValue` cases.
2. [visitors.ts:455-498](xmlui/src/components-core/script-runner/visitors.ts#L455-L498) — returns a flat `string[]` (the older variant). Imported by `collectComponentDefGraph.ts`.

**Risk:** The two functions are conceptually the same but emit different shapes; bug-fixes applied to one (e.g. the reads-vs-writes distinction) are silently absent from the other. The reactive-graph collector will continue using the coarser analysis indefinitely.

**Action:** Consolidate into a single utility (likely the richer `{ all, reads }` variant) and have both call sites depend on it. If full-shape unification is too invasive, at minimum cross-link the two with a doc comment so the duplication is visible.

---

### N3: Unbounded module-level `astCache` in `computedUses.ts`

[computedUses.ts:39-49](xmlui/src/components-core/optimization/computedUses.ts#L39-L49):

```ts
const astCache = new Map<string, Statement[]>();
function parse(source: string): Statement[] {
  if (astCache.has(source)) return astCache.get(source)!;
  ...
  astCache.set(source, statements);
  return statements;
}
```

- The cache is never evicted (no LRU, no size cap). Long-running studio/devserver sessions with hot-module reload can accumulate AST entries for source strings that are no longer referenced by any component.
- Cache key is the raw event-handler string — typical event handlers are short and repeated, so most of the time the cache stays bounded. But generated XMLUI (e.g. from a low-code editor) could push thousands of unique strings.

**Action:** Add a soft cap (e.g. 1000 entries, LRU) — or document the intended boot-time-only usage and ensure the cache is reset between app boots.

---

### N4: `computeUsesForTree` "drill-down" walks via `(actualRoot as any).component`

[computedUses.ts:598-613](xmlui/src/components-core/optimization/computedUses.ts#L598-L613):

```ts
let actualRoot: ComponentDef = root;
for (let i = 0; i < 3; i++) {
  const next = (actualRoot as any).component;
  if (!next) break;
  if ((next as any).type || Array.isArray((next as any).children)) {
    actualRoot = next;
    break;
  }
  actualRoot = next;
}
```

The hard-coded "loop 3 times" is a fragile attempt to handle both `CompoundComponentDef` (which has a `.component` field) and bare `ComponentDef` trees. Magic constants + `as any` casts encode an undocumented invariant ("CompoundComponent wrappers are nested at most 3 deep"). If the wrapping layout ever grows by one level, computedUses silently stops analyzing the inner tree.

**Action:** Replace with a type-guarded `unwrapToComponentDef(node)` helper that follows `.component` until it lands on a node with `type` or `children`, with no arbitrary depth cap. Or use a discriminated union and exhaustive narrowing.

---

### N6: Render-phase ref mutation also lives in `Container.tsx`

[Container.tsx:159-160](xmlui/src/components-core/rendering/Container.tsx#L159-L160):

```tsx
const componentStateRef = useRef<Record<string, any>>(componentState);
componentStateRef.current = componentState;
```

Same idempotent-write-during-render pattern as **R2**. Inline comment explains the intent ("Updated in render phase (idempotent assignment)"). Safe under React 18; same caveat about future React Cache / Server Components compatibility.

---

## 🔴 Performance regressions

### P3: Double work in `extractScopedState`

`ComponentWrapper` narrows the state to `scopedParentState`, passes it as `parentState` to `StateContainer`, which **again** runs `extractScopedState(parentState, node.uses ?? node.computedUses)` on the already-narrowed state:

- [ComponentWrapper.tsx:93-99](xmlui/src/components-core/rendering/ComponentWrapper.tsx#L93-L99)
- [StateContainer.tsx:169-174](xmlui/src/components-core/rendering/StateContainer.tsx#L169-L174)

Because both call sites wrap their result with `useShallowCompareMemoize`, the typical cycle (where `parentState` is stable) returns the previous ref and the work is skipped. But on every true change to the narrowed slice both calls run. Minor, but architecturally redundant.

**Optional fix:** Pass a "this state is already narrowed" sentinel from `ComponentWrapper` to `StateContainer`, or move narrowing entirely to one of the two layers.

---

### P4: `getWrappedWithContainer` re-evaluates `delete`/spread on every node identity change

[ContainerWrapper.tsx:184](xmlui/src/components-core/rendering/ContainerWrapper.tsx#L184):

```tsx
const containerizedNode = useMemo(() => getWrappedWithContainer(node), [node]);
```

This is correctly memoized on `node`. But `node` identity changes whenever `ComponentWrapper` recomputes `nodeWithTransformedDatasourceProp` (which depends on `nodeWithTransformedLoaders`, `resolvedDataPropIsString`, `uidInfoRef`). For DataSource-bearing or `raw_data`-bearing nodes this can flip on every parent render — the `delete` loop + spread inside `getWrappedWithContainer` then runs anew.

In a static tree this is harmless (the `node` reference comes from the parser and is stable). For trees that pass through `transformNodeWithDataSourceRefProp` / `transformNodeWithRawDataProp` it's not free.

**Action:** Watch in a profiler with a wide table; if it shows up, memoise the transformations more carefully.

---

## 🟠 Render-phase side effects

### R2: Render-phase ref mutation in `ComponentWrapper`

[ComponentWrapper.tsx:105-106](xmlui/src/components-core/rendering/ComponentWrapper.tsx#L105-L106):

```tsx
const fullParentStateRef = useRef<Record<string, any> | undefined>(undefined);
fullParentStateRef.current = (nodeUses || nodeComputedUses) ? state : undefined;
```

Side-effect during render. React 18 strict mode doubles renders — assignment is idempotent, OK. Concurrent rendering may interrupt — on retry, the same value is assigned (because `state` is the same prop). Safe today; React docs label render-phase side effects as "avoid" with future React Cache / Server Components in mind.

**Mitigation if needed later:** Move to `useInsertionEffect` or wrap in `useSyncExternalStore` semantics. Not urgent.

---

### R3: Dev-only render counter mutates `globalThis` in render

[StateContainer.tsx:176-187](xmlui/src/components-core/rendering/StateContainer.tsx#L176-L187):

```tsx
const renderCountRef = useRef(0);
if (process.env.NODE_ENV === "development") {
  renderCountRef.current += 1;
  ...
  (globalThis as any).__renderCounts ??= {};
  (globalThis as any).__renderCounts[label] = renderCountRef.current;
}
```

In strict mode React doubles the number of renders → counter is 2× inflated. Dead-code-eliminated in production builds, so this is dev-only ergonomic noise.

---

## 🟥 Potential Bugs

### B3: In-place mutation of `computedUses` — partly addressed

`computeUsesForTree` still mutates `node.computedUses` in-place. Called in [xmlui-parser.ts:59](xmlui/src/components-core/xmlui-parser.ts#L59), [StandaloneApp.tsx:733](xmlui/src/components-core/StandaloneApp.tsx#L733), and again for each compound component at [StandaloneApp.tsx:762-764](xmlui/src/components-core/StandaloneApp.tsx#L762-L764).

**Mitigation present:** `CompoundComponent.tsx:108` explicitly strips a stale `computedUses` from the cloned compound (`computedUses: _staleComputedUses, ...rest`). This is necessary because the compound's `vars`/`functions` get re-shaped before re-wrapping, and any pre-computed `computedUses` referenced the *old* topology — see `Invariant: "Runtime Restructure"` in the spec.

**Remaining risk:** No general invariant prevents other future code paths from restructuring a tree without dropping `computedUses`. The spec calls this out (§5) but it's a manual rule rather than a mechanical guard.

**Possible hardening:** Add a build-time assertion that nodes returned from any topology-rewrite helper do not carry `computedUses`. Or move `computedUses` off the node object entirely (e.g. WeakMap keyed by node).

---

## 🧹 Dirty code / duplication

### D3: `_savedVarDefs` / `_savedFunctionDefs` — implicit coupling via untyped fields

Confirmed live:
- write side: [ContainerWrapper.tsx:228-229](xmlui/src/components-core/rendering/ContainerWrapper.tsx#L228-L229)
- read side: [ModalDialog.tsx:160-161](xmlui/src/components/ModalDialog/ModalDialog.tsx#L160-L161)

The coupling is via underscore-convention property names + `(node as any)` cast. The comment on the write side ("two-pass rendering") is informative; the read side has no symmetric comment. Functionally works; future readers can easily delete or rename one side without realising the dependency.

**Action:** Either (a) declare the two fields on `ContainerWrapperDef` / `ComponentDef` so the cast can go, or (b) move them off the node into a side channel (per-render context or `MemoizedItem` prop).

---

### D5: `JS_STDLIB_GLOBALS` — manual list of ECMAScript globals

[computedUses.ts:85-119](xmlui/src/components-core/optimization/computedUses.ts#L85-L119). 50+ names hard-coded. The comment block (lines 64-84) explains *why* a curated list is preferred over `name in globalThis`. Stable list, but if a new ECMAScript intrinsic ships (e.g. Temporal v2) and an XMLUI app starts using it, the optimizer will treat it as a parent-state read and (worse) potentially promote a component to an implicit container.

**Optional:** Codegen this list from a known intrinsics table. Or accept the maintenance burden and add a brief "review on every ES update" reminder.

---

### D6: `gatherIdentifiers` fallback duplicated without scope tracking

The fallback walker now exists in **two places**:
- [visitors.ts:432-444](xmlui/src/components-core/script-runner/visitors.ts#L432-L444) (string-discriminator AST fallback for `depsOfValue` consumed by `collectComponentDefGraph`)
- [computedUses.ts:147-164](xmlui/src/components-core/optimization/computedUses.ts#L147-L164) (slightly more sophisticated — also skips the `member` of `MemberAccessExpression`)

This is the same kind of duplication as N2 above. The `computedUses.ts` version is strictly better (member-access aware) but isn't exported, so `collectComponentDefGraph` gets the coarser variant.

**Action:** Same as N2 — consolidate.

---

### D7: `OPTIMIZER_METADATA` re-export pattern across 20+ `.tsx` files

Examples:
- [List.tsx:349-350](xmlui/src/components/List/List.tsx#L349-L350): `isImplicitContainerByDefault: OPTIMIZER_METADATA.List.isImplicitContainerByDefault, childInjectedVars: OPTIMIZER_METADATA.List.childInjectedVars,`
- Same pattern repeats for Table, Select, Tree, TileGrid, AutoComplete, Markdown, Tabs, TabItem, Drawer, Stepper, Form, FormItem, FormSegment, ModalDialog, Items, Column, Checkbox, RadioGroup, APICall, DataSource, DataLoader.

This is a mechanical projection: 20+ call sites, all identical shape. The doc comment in `optimizer-metadata.ts` (lines 12-29) explains the architecture (`.tsx` imports SCSS → can't be loaded from the Vite plugin), so the projection is necessary today. Two minor improvements possible:

1. Codegen the `.tsx` field assignments from `OPTIMIZER_METADATA` so the mapping cannot drift.
2. Provide a typed helper `applyOptimizerMetadata("List", ...)` that the `.tsx` calls — the helper validates the type key against `OPTIMIZER_METADATA` and forwards the fields.

Not blocking; it just means a new component author has to remember two edits.

---

## 📊 Summary (Remaining Items Only)

| #   | Location                                                        | Problem                                                                       | Severity        |
|-----|-----------------------------------------------------------------|-------------------------------------------------------------------------------|-----------------|
| N2  | `computedUses.ts` ↔ `visitors.ts`                               | Two divergent `depsOfValue` implementations                                   | 🟠 Duplication   |
| N3  | `computedUses.ts:39-49`                                         | Unbounded module-level `astCache`                                             | 🟠 Fragile      |
| N4  | `computedUses.ts:598-613`                                       | `for (let i=0; i<3; i++)` drill-down with `as any`                            | 🟠 Fragile      |
| N6  | `Container.tsx:159-160`                                         | Same render-phase ref mutation as R2                                          | 📝 Note         |
| P3  | `ComponentWrapper` + `StateContainer`                           | Double `extractScopedState`                                                   | 🔵 Low priority |
| P4  | `ContainerWrapper.tsx:184`                                      | `getWrappedWithContainer` runs on every `node` identity flip                  | 🔵 Low priority |
| R2  | `ComponentWrapper.tsx:106`                                      | Render-phase ref mutation                                                     | 📝 Note         |
| R3  | `StateContainer.tsx:176-187`                                    | Dev profiler render counter strict-mode-doubled                               | 📝 Note         |
| B3  | `computedUses.ts`                                               | In-place mutation of `computedUses`                                           | 📝 Note         |
| D3  | `ContainerWrapper.tsx` ↔ `ModalDialog.tsx`                      | `_savedVarDefs` untyped                                                       | 🔵 Minor        |
| D5  | `computedUses.ts:85-119`                                        | `JS_STDLIB_GLOBALS` manual list                                               | 🔵 Minor        |
| D6  | `visitors.ts:432-444` + `computedUses.ts:147-164`               | `gatherIdentifiers` duplicated                                                | 🔵 Minor        |
| D7  | `optimizer-metadata.ts` + 20 `.tsx` re-exports                  | Manual projection of metadata into `.tsx` files                               | 🔵 Minor        |

---

## Priority of Actions

1. 🟠 **Recommended next:** N2 + D6 (consolidate duplicated walkers); N3 (bound `astCache`); N4 (eliminate the 3-deep magic loop).
2. 🔵 **Hygiene:** D3, D7.
3. 📝 **Defer:** P3, P4, R2, R3, N6, B3, D5 — already adequately mitigated, low-cost low-frequency, or React-version-specific.

The remaining items are all cleanup-grade — none should block merging.

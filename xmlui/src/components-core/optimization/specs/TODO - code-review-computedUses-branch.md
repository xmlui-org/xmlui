# Code Review: `yurii/computedUses` branch vs `main` — Outstanding Items

> Analysis Date: 2026-05-15
> Last Update: 2026-05-25 (D3 + D7 resolved — `ComponentDefCore` now declares `_savedVarDefs`/`_savedFunctionDefs`; `fromOptimizerMetadata()` helper replaces 20+ manual projection sites)
> Comparison: `0c42b6f3a5d7e86aff7b8119699bbadc2e7bdd31` (merge-base) → HEAD
> Resolved items (B1, D4, N1, N5, D8, C4, N2, D6, N3, N4) have been removed from this file.

---

## 🟠 Reference-identity / fragile patterns

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

### ✅ B3: In-place mutation of `computedUses` — RESOLVED (2026-05-25)

`computeUsesForTree` mutates `node.computedUses` in-place. Called in [xmlui-parser.ts:59](xmlui/src/components-core/xmlui-parser.ts#L59), [StandaloneApp.tsx:733](xmlui/src/components-core/StandaloneApp.tsx#L733), and again for each compound component at [StandaloneApp.tsx:762-764](xmlui/src/components-core/StandaloneApp.tsx#L762-L764).

**Mitigations:**
1. **Mechanical guard at start of `computeUsesInternal`:** Line 185 clears `node.computedUses = undefined` before any analysis. This ensures each traversal's result is the single source of truth. Stale values from prior passes are always cleared — no risk of survival between parse-time (before `.xs` merge) and runtime-time (after `.xs` merge) passes.
2. **Tree restructuring:** `CompoundComponent.tsx:108` explicitly strips stale `computedUses` from cloned compounds (`computedUses: _staleComputedUses, ...rest`), protecting against the "Runtime Restructure" invariant violation.

**Real-world bug (Bug 30):** FileVersionsDrawer component — when clicking Restore button inside Table, the handler threw `"Cannot read properties of undefined (reading 'close')"`. Root cause: pass 1 (parse-time, no `.xs`) set `Table.computedUses = ["handleRestore"]` narrowing parent state; pass 2 (runtime-time, with `.xs`) should have cleared it but couldn't without the mechanical guard — resulting in `versionsDrawer` being filtered from the Table's scoped state.

**Impact of fix:** Regression test added (`computedUses.test.ts` — "Bug 30: Stale computedUses..."). Verify: test passes (both pass 1 and pass 2 assertions correct).

---

## 🧹 Dirty code / duplication


---

### D5: `JS_STDLIB_GLOBALS` — manual list of ECMAScript globals

[computedUses.ts:85-119](xmlui/src/components-core/optimization/computedUses.ts#L85-L119). 50+ names hard-coded. The comment block (lines 64-84) explains *why* a curated list is preferred over `name in globalThis`. Stable list, but if a new ECMAScript intrinsic ships (e.g. Temporal v2) and an XMLUI app starts using it, the optimizer will treat it as a parent-state read and (worse) potentially promote a component to an implicit container.

**Optional:** Codegen this list from a known intrinsics table. Or accept the maintenance burden and add a brief "review on every ES update" reminder.

---

### ✅ D7: `OPTIMIZER_METADATA` re-export pattern — RESOLVED (2026-05-25)







---

## 📊 Summary (Remaining Items Only)

| #   | Location                                                        | Problem                                                                       | Severity        |
|-----|-----------------------------------------------------------------|-------------------------------------------------------------------------------|-----------------|
| N6  | `Container.tsx:159-160`                                         | Same render-phase ref mutation as R2                                          | 📝 Note         |
| P3  | `ComponentWrapper` + `StateContainer`                           | Double `extractScopedState`                                                   | 🔵 Low priority |
| P4  | `ContainerWrapper.tsx:184`                                      | `getWrappedWithContainer` runs on every `node` identity flip                  | 🔵 Low priority |
| R2  | `ComponentWrapper.tsx:106`                                      | Render-phase ref mutation                                                     | 📝 Note         |
| R3  | `StateContainer.tsx:176-187`                                    | Dev profiler render counter strict-mode-doubled                               | 📝 Note         |
| D5  | `computedUses.ts:85-119`                                        | `JS_STDLIB_GLOBALS` manual list                                               | 🔵 Minor        |

---

## Priority of Actions

1. 📝 **Defer:** P3, P4, R2, R3, N6, D5 — already adequately mitigated, low-cost low-frequency, or React-version-specific.

The remaining items are all cleanup-grade — none should block merging.

**Resolved (2026-05-25):**
- ✅ **B3** — Mechanical guard (clear `node.computedUses` at start of `computeUsesInternal`) ensures each pass is independent. Addresses "State Cleanliness Between Multi-Pass Analysis" invariant in the specification.
- ✅ **D3** — `_savedVarDefs` / `_savedFunctionDefs` declared on `ComponentDefCore`; `(node as any)` casts removed from ModalDialog read site.
- ✅ **D7** — `fromOptimizerMetadata("X")` typed helper introduced; 18 projection sites collapsed from 2 lines to 1 spread; orphan `OPTIMIZER_METADATA` import removed from `Checkbox.tsx`.

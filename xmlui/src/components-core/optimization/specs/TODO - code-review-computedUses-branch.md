# Code Review: `yurii/computedUses` branch vs `main` — Outstanding Items

> Analysis Date: 2026-05-15
> Last Update: 2026-05-25
> Comparison: `0c42b6f3a5d7e86aff7b8119699bbadc2e7bdd31` (merge-base) → HEAD
> Resolved items (B1, D3, D4, D7, N1, N2, N3, N4, N5, D6, D8, C4, P3, R3) have been removed from this file.

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

## 🧹 Dirty code / duplication

### D5: `JS_STDLIB_GLOBALS` — manual list of ECMAScript globals

[computedUses.ts:85-119](xmlui/src/components-core/optimization/computedUses.ts#L85-L119). 50+ names hard-coded. The comment block (lines 64-84) explains *why* a curated list is preferred over `name in globalThis`. Stable list, but if a new ECMAScript intrinsic ships (e.g. Temporal v2) and an XMLUI app starts using it, the optimizer will treat it as a parent-state read and (worse) potentially promote a component to an implicit container.

**Optional:** Codegen this list from a known intrinsics table. Or accept the maintenance burden and add a brief "review on every ES update" reminder.

---







---

## Summary (Remaining Items)

| #   | Location                                                        | Problem                                                                       | Severity        |
|-----|-----------------------------------------------------------------|-------------------------------------------------------------------------------|-----------------|
| N6  | `Container.tsx:159-160`                                         | Same render-phase ref mutation as R2                                          | 📝 Note         |
| P4  | `ContainerWrapper.tsx:184`                                      | `getWrappedWithContainer` runs on every `node` identity flip                  | 🔵 Low priority |
| R2  | `ComponentWrapper.tsx:106`                                      | Render-phase ref mutation                                                     | 📝 Note         |
| D5  | `computedUses.ts:85-119`                                        | `JS_STDLIB_GLOBALS` manual list                                               | 🔵 Minor        |

All remaining items are defer-grade — none should block merging.

## Resolved Items (This Session)

- **P3**: Removed redundant `extractScopedState` call in `StateContainer.tsx`. State is already scoped by `ComponentWrapper`, so the double extraction was unnecessary work. [StateContainer.tsx:169-174](xmlui/src/components-core/rendering/StateContainer.tsx#L169-L174)
- **R3**: Moved render-counter from render-phase mutation to `useLayoutEffect`, counting after commit instead of during render. Reduces confusion about side effects in render phase. [StateContainer.tsx:176-187](xmlui/src/components-core/rendering/StateContainer.tsx#L176-L187)


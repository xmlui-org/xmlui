# Code Review: `yurii/computedUses` branch vs `main`

> Analysis Date: 2026-05-15  
> Last Update: 2026-05-22 (Updated status of resolved tasks)  
> Comparison: `0c42b6f3a5d7e86aff7b8119699bbadc2e7bdd31` (merge-base) → HEAD  
> Focus: performance regressions, reference-identity issues, critical bugs, duplication

---

## 🔴 Performance regressions

### P3 (LOW): Double work in `extractScopedState`

`ComponentWrapper` narrows the state to `scopedParentState`, passes it as `parentState` to `StateContainer`, which **again** runs `extractScopedState(parentState, node.uses ?? node.computedUses)` on the already narrowed state:

`xmlui/src/components-core/rendering/StateContainer.tsx:166-170`
`xmlui/src/components-core/rendering/ComponentWrapper.tsx:93-98`

Due to memoization in the typical cycle (where `parentState` is stable), this double work is not performed—memo returns the previous ref. But with every true change of the scoped slice, both calls run. Minor, but architecturally redundant.

---

## 🟠 Reference-identity / props vs refs

### R2 (⚠️ note): Render-phase ref mutation

`xmlui/src/components-core/rendering/ComponentWrapper.tsx:106`

```tsx
fullParentStateRef.current = (nodeUses || nodeComputedUses) ? state : undefined;
```

Side-effect during render. React 18 strict mode doubles the render—assignment is idempotent, OK. Concurrent rendering might interrupt render—on retry, the same is assigned (because `state` comes the same). Safe for current React 18. But React documentation labels render-phase side effects as "avoid" as it may behave unexpectedly in the future with React Cache / Server Components.

---

### R3 (📝 minor): dev-only render counter mutates `globalThis` in render

`xmlui/src/components-core/rendering/StateContainer.tsx` — DEV-ONLY RENDER-COUNT PROFILER section:

```tsx
if (process.env.NODE_ENV === "development") {
  renderCountRef.current += 1;
  (globalThis as any).__renderCounts[label] = renderCountRef.current;
}
```

In strict mode, React doubles the number of renders → counter is 2× inflated. Does not affect prod (`process.env.NODE_ENV === "development"` is dead code in prod build).

---

## 🟥 Potential Bugs

### B1 (✅ DONE): Stale `stateRef.current` value in Container if memo blocked render

**Status:** RESOLVED (2026-05-21). Added `refreshStateRef()` in `createEventHandlers` (`event-handlers.ts`), which updates `stateRef.current` from `fullParentStateRef.current` directly before executing any code.

`stateRef.current` was updated in layout effect (`Container.tsx:165-168`) only when `Container` re-renders (identity of `componentState` changes). If `computedUses` worked (Container memo'd and **not** re-rendered during `oftenChanges` tick), `stateRef.current` remained the old object, even though `fullParentStateRef.current` could have new data.

**Scenario:** event handler in Select (which is inside Container) **read** `oftenChanges` via `stateRef.current` → saw the old value.

This was correct **only if** static analysis guaranteed catching all READ accesses. But there were cases where static analysis could **miss** (dynamic access `state[key]`, computed property names, eval-like constructs). In such cases, the handler would read a stale value—**silent staleness bug**.

**Fix:** added invalidation: `stateRef.current` is updated from the freshest refs via `refreshStateRef()` right before eval.

---

### B3 (📝): In-place mutation of `computedUses` — shared ComponentDef question

`computeUsesForTree` mutates `node.computedUses` in the tree in-place. Called in `xmlui-parser.ts:58` and `StandaloneApp.tsx`. If a ref to an old `ComponentDef` is stored somewhere and it repeatedly passes through processing, the old `computedUses` is overwritten. There is no specific bug now, but in-place mutation of an imported object is a pattern that may create problems in the future.

---

## 🧹 Dirty code / duplication

### D3 (📝): `_savedVarDefs` / `_savedFunctionDefs` — implicit coupling via untyped fields

`ContainerWrapper.tsx:234-235` writes, and `ModalDialog.tsx:158-159` reads via `as any` cast. Binding via underscore-convention + `as any` cast without typing. Works, but fragile. Better—separate interface or weak map.

---

### D4 (✅ DONE): `ROUTING_STATE_KEYS` — manual hardcode without compile-time enforcement

**Status:** RESOLVED (2026-05-22). Refactored to `UNSTABLE_GLOBAL_VARS` and moved to metadata-driven configuration in `ComponentMetadata.unstableChildInjectedVars`. Routing keys are now declared on the `App` component metadata.

---

### D5 (📝): `JS_STDLIB_GLOBALS` — manual list of ECMAScript globals

50+ names manually in `computedUses.ts`. Stable list, but not ideal.

---

### D6 (📝): `gatherIdentifiers` fallback without scope tracking

`xmlui/src/components-core/script-runner/visitors.ts:425-440`. Fallback walk collects **all** Identifier nodes without scope tracking. Not a correctness error, but **silent deoptimization**.

---

## 📊 Summary (Remaining Tasks)

| # | Location | Problem | Status |
|---|---|---|---|
| P3 | `ComponentWrapper` + `StateContainer` | Double `extractScopedState` | 🔵 Low priority |
| R2 | `ComponentWrapper.tsx` | Render-phase ref mutation | 📝 Note (React 18 OK) |
| R3 | `StateContainer.tsx` dev profiler | Strict mode doubles counter | 📝 Note (dev only) |
| ~~B1~~ | ~~`Container.tsx:167`~~ | ~~Stale `stateRef` in memo'd Container~~ | ✅ DONE |
| B3 | `computedUses.ts` | In-place mutation of `computedUses` | 📝 Note |
| D3 | `ContainerWrapper.tsx` ↔ `ModalDialog.tsx` | `_savedVarDefs` untyped | 🔵 Minor |
| ~~D4~~ | ~~`routing-state.ts:43`~~ | ~~`ROUTING_STATE_KEYS` hardcode~~ | ✅ DONE |
| D5 | `computedUses.ts` | `JS_STDLIB_GLOBALS` manual list | 🔵 Minor |
| D6 | `visitors.ts:425` | `gatherIdentifiers` fallback | 🔵 Minor |

---

## Priority of Actions

1. 🔵 **Refactoring:** P3, D3, D5-D6 if possible. Others are notes/low priority.

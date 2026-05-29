# TODO: computedGlobalUses — Future Improvements

Known limitations of the current `computedGlobalUses` / `narrowGlobalVars` narrowing
optimization and areas worth revisiting.

---

## 1. `disablesChildNarrowing` is too broad

**Where:** `computedUses.ts` — `disablesChildNarrowing` flag, propagated as `nextDisableNarrowing`.

**Problem:**  
When a node has a `<script>` section or `.xs` code-behind functions, narrowing is
disabled for **all of its descendants** — even descendants that don't call any of
those functions and don't use globals transitively through them.  
The concern is: "a child might call a parent function which in turn reads a global".
But this is only a problem when the child *actually* references a parent-scope function
name. For descendants with no such references this guard fires unnecessarily.

**Improvement:**  
`dependsOnParentFunction` is already computed per-container at the node level:
```ts
const dependsOnParentFunction = parentFunctionNames.size > 0 &&
  [...parentDependencies].some(d => parentFunctionNames.has(d));
```
`safeToNarrow` could use this finer-grained signal instead of the blanket
`nextDisableNarrowing`. The propagated flag would only need to suppress narrowing
in the specific subtree branch that provably calls a parent function.

**Note:** The same fix would also recover some lost `computedUses` narrowing
opportunities, not just `computedGlobalUses`.

---

## 2. Explicit containers (`uses !== undefined`) never get `computedGlobalUses`

**Where:** `computedUses.ts` — both `computedUses` and `computedGlobalUses` annotation
blocks are guarded by `node.uses === undefined`.

**Problem:**  
Explicit containers that declare `uses` (or have `type="Container"`) opt into a
developer-controlled state boundary. Currently they receive **all** `parentGlobalVars`
with no narrowing — the same problem that existed for parent-state before this feature.

**Improvement:**  
Explicit containers could still receive a `computedGlobalUses` annotation (it doesn't
conflict with `uses` semantics because globals are a separate channel). The annotation
block needs a separate guard that omits the `node.uses === undefined` condition:
```ts
// computedGlobalUses: also narrowable for explicit containers
if (globalDepsUsed.size > 0 && safeToNarrow) {
  node.computedGlobalUses = Array.from(globalDepsUsed).sort();
}
```

---

## 3. Globals.xs **functions** always pass through `narrowGlobalVars`

**Where:** `ContainerUtils.ts` — `narrowGlobalVars` uses `getGlobalFunctionKeys` and
unconditionally includes every function key in the result.

**Problem:**  
A large `Globals.xs` with many helper functions causes all of them to be included in
every container's `parentGlobalVars`, even containers that call none of them. The
`useShallowCompareMemoize` identity check cannot help here because functions are
always the same reference, but the object identity of `parentGlobalVars` changes
when any variable changes — triggering unnecessary work downstream.

**Improvement:**  
`collectScriptFunctionDeps` already tracks which functions a subtree *calls*
(transitively). The static analysis could emit a `computedGlobalFunctions?: string[]`
annotation listing only the function names actually invoked in the subtree.
`narrowGlobalVars` would then filter functions too, just like variables.

**Caveat:** Functions called *indirectly* via higher-order patterns
(e.g. `someOtherFn(myGlobalFn)`) are harder to track and would need a conservative
fallback.

---

## 4. Write-only globals are absent from `computedGlobalUses` (correctness)

**Where:** `computedUses.ts` — `isGlobalDep` predicate, `usedHereReads` tracking.

**Status:** Partially mitigated by the two-step `ComponentWrapper` approach
(narrowed snapshot for comparison only; full `globalVars` passed to child).

**Remaining gap:**  
`computedGlobalUses` currently only lists globals that are **read** in the subtree.
A container that writes `view = 'large'` but never reads `view` has
`computedGlobalUses` that does not include `view`. The two-step approach fixes the
runtime error (write succeeds), but the narrowed comparison snapshot does not
account for `view` changing externally — the container still re-renders when `view`
changes (because the full `globalVars` reference is updated by the two-step gate),
but only when one of its tracked read-deps changed.

**Improvement:**  
Track write targets separately (`usedHereWrites` set). Include them in
`computedGlobalUses` so both the comparison snapshot and runtime object agree.
The expression-dependency walker already models `T_ASSIGNMENT_EXPRESSION` — it
would need to expose the LHS identifier as a separate "write" category.

---

## 5. `safeToNarrow` gate applies identically to `computedGlobalUses` and `computedUses`

**Where:** `computedUses.ts` — single `safeToNarrow` boolean used for both annotations.

**Problem:**  
For `computedUses` (parent state narrowing), the `dependsOnParentFunction` guard makes
sense: if a child calls a parent function, that function might read/write parent-state
variables not visible in the static dep set.

For `computedGlobalUses` (global narrowing), this concern is **less severe** because:
- Globals.xs functions are *always* passed through `narrowGlobalVars` (limitation 3),
  so transitive global reads inside a parent function are still reachable.
- The annotation controls only the *variable* (non-function) subset.

**Improvement:**  
Use a separate `safeToNarrowGlobals` flag that does not include
`dependsOnParentFunction` (since global functions pass through unconditionally):
```ts
const safeToNarrowGlobals = !nextDisableNarrowing || !ownHasScript;
```

---

## 6. Parse-time pass produces incomplete `appGlobalNames`

**Where:** `computeUsesForTree` called from `vite-xmlui-plugin.ts` at build time.

**Problem:**  
The first (parse-time) call to `computeUsesForTree` passes `appGlobalNames = EMPTY_SET`
because `Globals.xs` has not been resolved yet. This means `computedGlobalUses`
annotations are not set at build time; the result is overwritten at boot time by the
authoritative `StandaloneApp` pass.

**Impact:** Low in practice — the boot-time pass overwrites the stale result.  
**Risk:** In Vite mode the second pass may run *after* first render, leaving a brief
window where `computedGlobalUses` is undefined and all globals pass through.

**Improvement:**  
Resolve `Globals.xs` names during the Vite plugin pass (it already has access to the
file system) and supply a valid `appGlobalNames` set to the build-time traversal.

---

## 7. `narrowGlobalVars` allocates a new object on every call

**Where:** `ContainerUtils.ts` — `narrowGlobalVars`.

**Problem:**  
Even when the set of relevant globals hasn't changed, `narrowGlobalVars` always
returns a fresh `{}` object. The `useShallowCompareMemoize` wrapper in
`ComponentWrapper` catches unchanged key-value pairs, but the allocation still
happens on every render where `globalVars` changes.

**Improvement:**  
Cache the last result keyed on `(vars, usesSet)`. A simple `Map<vars, Map<usesKey, result>>`
(or a `WeakMap` on the `vars` object) would let the function return the same object
reference when inputs are identical, short-circuiting `useMemo` before
`useShallowCompareMemoize` even runs.

---

## 8. `computedGlobalUses` not set for UDC templates

**Where:** `CompoundComponent.tsx` — `containerNode` construction and UDC template
rendering.

**Problem:**  
When rendering a User-Defined Component (UDC), `CompoundComponent.tsx` synthesises
a `containerNode` at runtime, bypassing the static analysis that normally annotates
`computedGlobalUses`. Global variables referenced inside UDC templates are not
tracked and those containers receive all `parentGlobalVars`.

**Improvement:**  
Run `computeUsesForTree` on the UDC's resolved template node during template
resolution (the point where `.xmlui` markup is parsed and code-behind is merged).
This requires `appGlobalNames` to be available at that stage.

---

## Summary table

| # | Area | Impact | Effort |
|---|------|--------|--------|
| 1 | `disablesChildNarrowing` too broad | High — blocks many descendants | Medium |
| 2 | Explicit containers miss `computedGlobalUses` | Low–Medium | Low |
| 3 | Functions always pass through | Medium — proportional to Globals.xs size | High |
| 4 | Write-only globals (correctness) | Low (mitigated) | Medium |
| 5 | Shared `safeToNarrow` gate | Low–Medium | Low |
| 6 | Parse-time `appGlobalNames` empty | Low | Medium |
| 7 | `narrowGlobalVars` allocation | Low | Low |
| 8 | UDC templates not analysed | Medium (UDC-heavy apps) | High |

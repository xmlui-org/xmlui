# TODO: computedGlobalUses — Future Improvements

Known limitations of the current `computedGlobalUses` / `narrowGlobalVars` narrowing
optimization and areas worth revisiting.

---

## 1. `disablesChildNarrowing` is too broad — **⚠️ Already handled**

**Where:** `computedUses.ts` — `disablesChildNarrowing` flag, propagated as `nextDisableNarrowing`.

**Original concern:**  
When a node has a `<script>` section or `.xs` code-behind functions, narrowing is
disabled for **all of its descendants** — even descendants that don't call any of
those functions and don't use globals transitively through them.

**Analysis (resolved):**  
This concern is already handled by the existing `safeToNarrow` formula:
```ts
const safeToNarrow = !nextDisableNarrowing || (!ownHasScript && !dependsOnParentFunction);
```
When `nextDisableNarrowing = true` (ancestor had code-behind), `safeToNarrow` is still
`true` as long as the current node has **no own invalid script** AND **does not call any
parent-scope function**. So function-free descendants that don't reference the parent's
functions ARE already narrowed.

The `dependsOnParentFunction` check already acts as the fine-grained per-container
signal described in the original "improvement" note. No code change needed.

---

## 2. Explicit containers (`uses !== undefined`) never get `computedGlobalUses` — ✅ **Done**

**Where:** `computedUses.ts`

**Status:** **Implemented.** The `node.uses === undefined` guard was removed from the
`computedGlobalUses` annotation block. Explicit containers (both `type="Container"` and
nodes with explicit `uses`) now receive `computedGlobalUses` when their subtree reads
globals. The `uses` property controls parent-*state* narrowing only; globals are a
separate channel that benefits from narrowing regardless.

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

## 5. `safeToNarrow` gate applies identically to `computedGlobalUses` and `computedUses` — **⛔ Incorrect proposal**

**Where:** `computedUses.ts` — single `safeToNarrow` boolean used for both annotations.

**Original suggestion:**  
Use a separate `safeToNarrowGlobals` that drops `dependsOnParentFunction`, since
"global functions pass through unconditionally".

**Why this is wrong:**  
Imagine a child B that calls parent function `doSort()`, and `doSort()` reads global
`sortBy`. The expression dep walker correctly sees B calls `doSort`, so
`dependsOnParentFunction = true` and `safeToNarrow = false` → B is not narrowed.

If we used `safeToNarrowGlobals = !nextDisableNarrowing || !ownHasScript` (ignoring
`dependsOnParentFunction`), B *would* be narrowed. B's `globalDepsUsed` does not
include `sortBy` (that was analyzed inside `doSort`, attributed to the *parent* node).
So B's `computedGlobalUses` would not contain `sortBy`, and B's `parentGlobalVars`
would not contain `sortBy`. When `doSort` runs inside B's scope and tries to read
`sortBy`, it would get `undefined` — a silent stale-data bug.

The `dependsOnParentFunction` guard is **equally necessary** for globals as it is for
parent state. No change should be made here.

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

## 7. `narrowGlobalVars` allocates a new object on every call — ✅ **Done**

**Where:** `ContainerUtils.ts`

**Status:** **Implemented.** A `WeakMap<vars, Map<cacheKey, result>>` cache was added.
`cacheKey` is `uses.join("\0")` (stable because `computedGlobalUses` is always emitted
sorted). The WeakMap is keyed on the `vars` object identity so entries are GC-ed when
a `globalVars` snapshot is no longer referenced. When multiple containers share the
same `computedGlobalUses` list and process the same `globalVars` snapshot (e.g. all
rows in a list during one render cycle), they now get the same narrowed-object
reference — `useShallowCompareMemoize` short-circuits on identity.

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

| # | Area | Impact | Effort | Status |
|---|------|--------|--------|--------|
| 1 | `disablesChildNarrowing` too broad | High — blocks many descendants | — | ⚠️ Already handled by `safeToNarrow` formula |
| 2 | Explicit containers miss `computedGlobalUses` | Low–Medium | Low | ✅ Done |
| 3 | Functions always pass through | Medium — proportional to Globals.xs size | High | Open |
| 4 | Write-only globals (correctness) | Low (mitigated) | Medium | Open |
| 5 | Shared `safeToNarrow` gate | Low–Medium | Low | ⛔ Incorrect proposal — see analysis |
| 6 | Parse-time `appGlobalNames` empty | Low | Medium | Open |
| 7 | `narrowGlobalVars` allocation | Low | Low | ✅ Done |
| 8 | UDC templates not analysed | Medium (UDC-heavy apps) | High | Open |

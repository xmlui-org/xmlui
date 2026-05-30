# TODO: computedGlobalUses — Future Improvements

Known limitations of the current `computedGlobalUses` / `narrowGlobalVars` narrowing
optimization and areas worth revisiting.

> **Companion review:** branch-wide findings (including items that also affect
> parent-state `computedUses`, not just the globals channel) live in
> [`code-review-branch-vs-main.md`](./code-review-branch-vs-main.md). This file
> tracks only the globals-narrowing channel.
>
> **Verified against code on 2026-05-29:** items 2 and 7 confirmed implemented;
> item 4 was found to be **inverted** and is rewritten below; item 8 has a
> cheaper fix than originally proposed. New item 9 added.

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

**Cross-ref:** same finding as §2.2 of `code-review-branch-vs-main.md`. Note that
the immediate re-render risk is bounded: the narrowed object is cached per
`(vars-identity, uses)` (item 7), so functions only cause an *extra* re-render
when a function reference actually changes between snapshots — which
`global-variables.ts` is believed (but not yet tested) to avoid. The standing
cost is snapshot size, not per-render churn.

---

## 4. Write-only globals inflate `computedGlobalUses` (minor over-render) — ✅ **Done**

**Where:** `computedUses.ts:528-530` — `globalDepsUsed` built from `usedHere`.

**Resolution:** Changed `globalDepsUsed` to iterate `usedHereReads` instead of
`usedHere`. Pure write-only globals are no longer included in the comparison
snapshot. Three regression tests added in `computedUses.test.ts` ("computedGlobalUses"
describe): write-only global is excluded; read+write global is kept; mixed case
annotates only the read. All 405 tests in the affected suites pass.

**Correction (the previous note had this inverted):**  
`globalDepsUsed` is populated from `usedHere`, which is the `all` set produced by
`depsOfValueWithReads` — i.e. reads **plus** assignment-only (write) targets
(`includeAssignmentTargets: true`). So a container that only writes a global
(`view = 'large'`, never reads `view`) **does** receive `view` in its
`computedGlobalUses`. There is no correctness gap: the write target is present in
both the annotation and (via the two-step gate) the runtime object.

**Actual (opposite) issue — minor pessimization:**  
Because write-only globals are included, they enter the change-detection snapshot
built by `narrowGlobalVars`. The container then re-renders whenever such a
write-only global changes externally — even though it never reads the value, so
the re-render produces no visible difference. The two-step `ComponentWrapper`
design already passes the full `globalVars` to the child for evaluation, so write
targets do **not** need to be in `computedGlobalUses` at all.

**Improvement (safe, ~1 line):**  
Build `globalDepsUsed` from the reads set instead of `usedHere`:
```ts
// computedUses.ts:528-530
// was: for (const d of usedHere) if (isGlobalDep(d)) globalDepsUsed.add(d);
for (const d of usedHereReads) if (isGlobalDep(d)) globalDepsUsed.add(d);
```
`childGlobalDeps` already propagates each child's `globalDepsUsed`, so making the
per-node set reads-only makes the whole subtree reads-only. A global that is both
read and written stays (it is in `usedHereReads`); only **pure** write-only
globals drop out of the comparison snapshot → fewer re-renders.

**Contrast with parent-state `computedUses`:** that one MUST keep write targets,
because `extractScopedState(state, computedUses)` is the actual evaluation scope
and the engine throws "Left value variable not found" if a write target is
missing. Globals differ only because the full object is always forwarded for
evaluation — which is exactly why reads-only is safe here but not for state.

**Test to add before changing:** assert a write-only global is absent from
`computedGlobalUses`, and that an external change to it does not re-render the
writer-only container.

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

## 8. UDC wrapper containers are not annotated with `computedGlobalUses` — ✅ **Done**

**Where:** `CompoundComponent.tsx` — the runtime-synthesised wrapper `containerNode`.

**Resolution:** Lifted `compound.computedGlobalUses` onto the synthesised wrapper
Container (and removed it from `rest` via destructuring, mirroring the
`computedUses: _staleComputedUses` strip). UDC instances now benefit from the
same global-narrowing as static containers — no extra analysis pass required.
The body's annotation is reused as-is because globals are NOT subject to the
Bug-24 staleness that affects `computedUses` (globals live in the global-vars
layer regardless of where local vars sit). No new unit test (would require a
React render harness); covered indirectly by the broader optimization +
udc-sandbox suites — all 405 tests pass.

**Mechanism (verified against code):**  
At boot, `StandaloneApp` runs `computeUsesForTree(compDef.component, …)` on the
compound **body**, so `compound.computedGlobalUses` IS computed. But at render
time `CompoundComponent.tsx` builds a fresh `{ type: "Container", … }` wrapper,
moves `vars`/`functions`/`loaders` onto it, and strips `computedUses` from the
body (`computedUses: _staleComputedUses`) to avoid the Bug-24 staleness. The body
(`rest`) is then left with no `vars`/`computedUses`, so `isContainerLike(rest)` is
false → the body renders without its own `StateContainer`. The **wrapper**
Container is the node that narrows, and it carries **no** `computedGlobalUses`, so
UDC instances receive ALL `parentGlobalVars`.

**Why the body's annotation is NOT stale for globals (unlike `computedUses`):**  
Bug 24 makes the body's `computedUses` stale because local `vars` move to the
wrapper and become external. Globals are different — they live in the global-vars
layer regardless of where local vars sit, so the set of globals the body reads is
unchanged by the restructure.

**Improvement (cheap — Low effort, was High):**  
Lift the already-computed body annotation onto the synthesised wrapper instead of
re-running analysis: add `computedGlobalUses: compound.computedGlobalUses` to the
returned container node (and drop it from `rest` for cleanliness, mirroring the
`computedUses` strip). This gives UDC wrappers the same global-narrowing benefit
as static containers, with no extra analysis pass and no need for `appGlobalNames`
at template-resolution time. Add a test: a UDC whose template reads exactly one of
several globals re-renders only when that one global changes.

---

## 9. NEW — `for`-loop init clause drops global (and state) reads — ✅ **Done**

**Where:** `script-runner/visitors.ts:144-146` (the shared dependency walker).

**Resolution:** Fix shipped as part of `code-review-branch-vs-main.md` §1.1
(missing `stmtDeps =` assignment). Two regression tests in `computedUses.test.ts`
under "computeUsesForTree — for-loop init dependency tracking". Both pass.

The `T_FOR_STATEMENT` `init` branch calls `stmtDeps.concat(...)` **without
assigning the result**, unlike `cond` / `upd` / `body`. `Array.concat` is
non-mutating, so any identifier referenced only in a `for (init)` clause is lost
from both the `reads` and `all` sets.

For globals: a global read only in a for-init
(`for (let i = startIndex; i < total; i++)` where `startIndex` ∈ Globals.xs) is
absent from `computedGlobalUses` → the container will not re-render when that
global changes. The same root cause affects parent-state `computedUses`.

**Fix (1 line):** `stmtDeps = stmtDeps.concat(collectDependencies([stmt.init], stmt, "for"));`
See `code-review-branch-vs-main.md` §1.1.

---

## Summary table

| # | Area | Impact | Effort | Status |
|---|------|--------|--------|--------|
| 1 | `disablesChildNarrowing` too broad | High — blocks many descendants | — | ⚠️ Already handled by `safeToNarrow` formula |
| 2 | Explicit containers miss `computedGlobalUses` | Low–Medium | Low | ✅ Done |
| 3 | Functions always pass through | Medium — proportional to Globals.xs size | High | Open (= review §2.2) |
| 4 | Write-only globals **over-render** (not a correctness gap) | Low | Low (~1 line) | ✅ Done — `usedHere` → `usedHereReads` + 3 tests |
| 5 | Shared `safeToNarrow` gate | Low–Medium | Low | ⛔ Incorrect proposal — see analysis |
| 6 | Parse-time `appGlobalNames` empty | Low | Medium | Open |
| 7 | `narrowGlobalVars` allocation | Low | Low | ✅ Done |
| 8 | UDC wrapper not annotated | Medium (UDC-heavy apps) | Low (lift body annotation) | ✅ Done — annotation lifted in `CompoundComponent.tsx` |
| 9 | `for`-init drops reads | Low (latent stale-render) | Low (~1 line) | ✅ Done — assignment fixed in `visitors.ts` + 2 tests |

# TODO: computedGlobalUses — Future Improvements

Known limitations of the current `computedGlobalUses` / `narrowGlobalVars` narrowing
optimization and areas worth revisiting.

> **Companion review:** branch-wide findings (including items that also affect
> parent-state `computedUses`, not just the globals channel) live in
> [`code-review-branch-vs-main.md`](./code-review-branch-vs-main.md). This file
> tracks only the globals-narrowing channel.

---

## 11. Unresolvable cross-`.xs` imports block `computedGlobalUses` (the 35) — FIXED

**Where:** `computedUses.ts` — `ownHasScript` includes
`scriptCollected.hasUnresolvableImports` (circa L461-463); `collectScriptFunctionDeps`
recursion only follows functions present in the **local** `functions` map
(`if (localNames.has(d) && d in functions)`).

**Status:** FIXED. Cross-`.xs` imports are now resolved in `StandaloneApp.tsx` (both dev
and fetch paths) before optimization. The `scriptCollected.functions` map is populated
with imported function bodies, allowing the §10 machinery to see their global reads.
Narrowing is only blocked for genuinely unresolvable references (Task 5).

**Problem.** When a `.xmlui`/`.xs` imports a helper from another `.xs`
(`import { publishEvent } from "./shared.xs"`), the imported function's **body is not in
`node.scriptCollected.functions`**, so `collectScriptFunctionDeps` treats the call as an
opaque leaf: it records the imported name as a dep but **cannot see the globals the
function reads internally**. `hasUnresolvableImports` is set → `ownHasScript = true` →
`safeToNarrow = false` → no `computedGlobalUses`. In myworkdrive this hits **35** of the
46 suppressed containers (mostly `Fragment`s that read `events` via `shared.xs` helpers;
note `Main.xmlui` itself imports `copyOrCut, publishEvent` from `shared.xs`).

**This extends the §10 machinery to cross-file function bodies.** §10 (parent-function
global reads propagation) is already implemented — it folds a parent code-behind
function's resolved global reads into children that call it. §11 applies the same fold
step to *imported* functions whose bodies live in another file. So §11 = §10 fold-in +
**import resolution**:

1. Resolve `.xs` imports during script collection so the imported function's analysed
   `{ all, reads }` (and especially its global reads) are available as a per-function
   read-set — the same shape §10 needs.
2. Once resolvable, fold the imported function's **global reads** into the caller's
   `globalDepsUsed` (reusing §10's machinery) and clear `hasUnresolvableImports` for that
   reference. Only genuinely unresolvable references (dynamic import paths, third-party,
   parse failures in the imported file) keep the conservative guard.

**Iceberg specific to imports:**
- **myworkdrive constraint (rule 17):** "imported `.xs` functions must be self-contained —
  cannot call sibling `.xs` functions (resolve to `undefined`)." That app rule simplifies
  resolution (no cross-`.xs` call chains to follow *inside* an imported helper) — but the
  resolver must not assume it for arbitrary apps; general code may chain imports.
- **Cycles & diamonds:** `a.xs` ↔ `b.xs` imports; the resolver needs cycle detection and a
  per-function memo (same union-vs-per-function caveat as §10.4(B)).
- **Build-mode vs dev-mode:** import resolution must produce identical read-sets in the
  Vite parse-time pass and the `StandaloneApp` boot pass, or the annotation will flip
  between passes (see §6). Prefer resolving once where `appGlobalNames` is authoritative.
- **Tracking commits:** related work already in flight — "unresolvable imports tracking"
  and "improve dependency tracking" — this item should converge with that effort rather
  than duplicate it.

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

## Summary table

| # | Area | Impact | Effort | Status |
|---|------|--------|--------|--------|
| 11 | Unresolvable cross-`.xs` imports block global-narrowing | **High** in import-heavy apps | High (needs import resolution) | **Implemented** |
| 3 | Functions always pass through | Medium — proportional to Globals.xs size | High | Open (= review §2.2) |
| 6 | Parse-time `appGlobalNames` empty | Low | Medium | Open |

---

# Field evidence — myworkdrive runtime audit (2026-06-01)

The items above were derived mostly from code review. This section adds **measured**
runtime data from a real app (myworkdrive), because it motivates the new items 10 and 11. 
All numbers come from instrumenting `computeUsesInternal` and reading `window.__renderCounts` 
in the dev server (the narrowing runs in the browser/`StandaloneApp` pass; the Vite 
parse-time pass does **not** run `computeUsesForTree` in dev — confirmed: no Node-side 
invocation).


## E.1 — Narrowing coverage across the whole app

Of **77** container definitions instantiated on the `/my-files` screen:

| Outcome | Count | Runtime effect |
|---|---|---|
| `computedGlobalUses` **set** | **2** | Protected — re-renders only on the globals it reads |
| Reads globals but **suppressed** by `safeToNarrow` | **46** | `computedGlobalUses` undefined → receives **all** globals → re-renders on **any** global change |
| Reads **no** globals → left `undefined` | **29** | Same as above (undefined → all globals forwarded) |

So **2 of 77** containers benefited from the globals channel at the time of this audit
(pre-§10). After §10, the 11 `dependsOnParentFunction` containers should also be
protected — raising the ceiling to up to **13 of 77** (exact count depends on how many
have resolvable parent functions in practice). A fresh audit is needed.

## E.2 — Why the 46 global-reading containers are suppressed

`ownHasScript = scriptCollected.hasInvalidStatements || scriptCollected.hasUnresolvableImports`.
Classifying the 46:

| Reason | Count | Notes |
|---|---|---|
| `hasInvalidStatements` (parser failure) | **0** | The "can't parse script bodies" era is over. `collectScriptFunctionDeps` parses fn bodies and extracts reads. **The old blanket guard is already gone.** |
| `hasUnresolvableImports` | **35** | **FIXED by §11 (implemented).** These containers now have their imports resolved and narrowing enabled. |
| `dependsOnParentFunction` only | **11** | **Fixed by §10 (implemented).** These containers now receive `parentFunctionDeps` and get `computedGlobalUses` set when all called parent functions are resolvable. Includes the heaviest components: `Table#filesTable` (reads `bookmarks,selectMode,sortBy,sortDirection`), `TileGrid#filesGrid` (`bookmarks,selectMode`), `Table#favoritesTable` (`sortBy,sortDirection`), `VStack` (`sortBy,sortDirection,view`), and the modal `Form`s (`isFileOperationInProgress`). Benchmark re-run needed to confirm the new ON-vs-OFF delta. |
| suppressed with no reason | **0** | No purely-wasteful suppression — every suppression has a cause. |

**Headline:** `invalidStatements = 0`. The guard people remember as "we couldn't parse
function bodies" is **not** what blocks narrowing today. The two live blockers are
**(a) unresolvable cross-file imports (35)** and **(b) parent-function calls (11)** —
both of which reduce to the *same* missing capability (§10/§11 below).

## E.3 — Benchmark: ON vs OFF re-render delta is 0% in 5 user scenarios

With the optimisation ON vs fully OFF (verified via a real toggle — module-eval flag,
`onMark=true`/`offMark=false`), the steady-state re-render counts are **identical**:

| Scenario | OPT ON | OPT OFF | Saved |
|---|---|---|---|
| Sort change | 124 | 124 | 0% |
| View switch | 28 | 28 | 0% |
| Right-click selection | 52 | 52 | 0% |
| Folder navigation | 88 | 88 | 0% |
| Favorites toggle (parent-state `bookmarks`) | 944 | 944 | 0% |

**Interpretation (pre-§10 baseline):** the 75 unprotected containers behaved identically ON vs OFF (both
had `computedGlobalUses === undefined`); only the 2 protected ones differed, and those
read the globals that actually change in each scenario, so they re-rendered anyway.
**The optimisation was correct and regression-free, but its measurable render saving was
0% until §10 unblocked the 11 `dependsOnParentFunction` containers.**

> **Note:** this benchmark was captured *before* §10 was implemented. A re-run is needed
> to quantify the new ON-vs-OFF delta for the 11 now-protected containers. The remaining
> 35 (`hasUnresolvableImports`) are still suppressed — pending §11.

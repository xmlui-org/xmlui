# TODO: computedGlobalUses — Future Improvements

Known limitations of the current `computedGlobalUses` / `narrowGlobalVars` narrowing
optimization and areas worth revisiting.

> **Companion review:** branch-wide findings (including items that also affect
> parent-state `computedUses`, not just the globals channel) live in
> [`code-review-branch-vs-main.md`](./code-review-branch-vs-main.md). This file
> tracks only the globals-narrowing channel.

---

## 11. Unresolvable cross-`.xs` imports block `computedGlobalUses` (the 35) — FULLY FIXED

**Sub-fix 11a — `parentFunctionDeps` guard (commit `a01ce0bf1`):**
After §11 cleared `hasUnresolvableImports`, `da036c780` had removed the
`if (globalReads.size > 0)` guard in `childParentFunctionDeps` building. Functions that
only write locals (e.g., `checkCancel` writing `isCancelRequested`) entered the map,
making `allCalledParentFnsResolvable = true` incorrectly → `computedGlobalUses` set where
it shouldn't be → runtime scope missing write-target → throw. Fixed: only add a function
to `parentFunctionDeps` when its `globalReads.size > 0`.

**Sub-fix 11b — compound component globalDepsUsed propagation (commit `73ba131ba`):**
Compound components are opaque to ancestor tree analysis. After §11 enabled narrowing for
`PasteItemsModal`, its `computedGlobalUses` was assembled without `isFileOperationInProgress`
(which `InProgressPanel` reads inside its own body, invisible to the ancestor's optimizer).
Result: `ComponentWrapper`'s `globalVarsWithStableRef` never updated when the global changed
→ progress panel stayed hidden. Fixed: two-pass analysis in `recomputeUsesForApp` (Pass 1:
collect compound `computedGlobalUses`; Pass 2: feed via enhanced `metadataLookup`) and new
`metadata.globalDepsUsed` field in `OptimizerMetadataView`.

See §9 of `computed-uses-specification.md` for the full architecture.

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
| 11 | Unresolvable cross-`.xs` imports block global-narrowing | **High** in import-heavy apps | High | **Fully fixed** (11a guard + 11b compound-propagation) |
| 3 | Functions always pass through `narrowGlobalVars` | Medium — proportional to Globals.xs size | High | Open |
| 6 | Parse-time `appGlobalNames` empty | Low | Medium | Open |
| **12** | **Most containers re-render even with narrowing ON** | Medium — see E.4 analysis | Medium | **Open — root cause identified** |

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

## E.4 — Post-§10 + §11 benchmark (2026-06-03)

After implementing §10 (parent-function global propagation), §11 (cross-`.xs` import
resolution), and the two-pass compound-globalDepsUsed fix, a fresh benchmark was run
using `benchmark-render-counts.spec.ts` (snapshot-delta methodology):

| Scenario | OPT ON | OPT OFF | Saved |
|---|---|---|---|
| S1 — sort (sortBy/sortDirection) | 62 | 66 | **4 (6%)** |
| S2 — view switch (view) | 14 | 16 | **2 (13%)** |
| S3 — right-click selection (catalogSelection) | 11 | 11 | **0 (0%)** |
| S4 — folder navigation (fileEntries + $queryParams) | 22 | 28 | **6 (21%)** |

**The only component actually protected:** `Drawer#versionsDrawer` — eliminated across
S1, S2, and S4 (4/2/6 renders respectively). All other re-renders (Fragment, VStack,
DesktopNameCell, Link, Badge, Button, DotMenuButton, Stack, FileDialogShell, App, Theme,
HStack) fire identically ON and OFF — they genuinely READ the changed globals in their
templates and must re-render.

**Why savings are still small:** The benchmark measures StateContainer re-renders only.
Most containers that fire DO read sortBy/view/fileEntries directly, so narrowing cannot
help them. The optimization is correct and regression-free; savings scale with the ratio
of "containers that don't read the changed global" to "containers that do." In this app
that ratio is currently low for the measured scenarios.

**S5 — Favorites toggle (bookmarks Globals.xs var), now measured:**

| Scenario | OPT ON | OPT OFF | Saved |
|---|---|---|---|
| S5 — bookmarks (add/remove favorite) | 118 | 127 | **9 (7%)** |

Components: same picture as S1–S4. Only `Drawer#versionsDrawer` is eliminated (9 renders);
all other containers (DesktopNameCell, Link, Badge, Button, DotMenuButton, VStack, HStack,
Fragment, Stack, FileDialogShell, App, Theme) fire identically ON and OFF.
The pre-§10 baseline of 944 renders came from a different measurement methodology or app
state — under snapshot-delta methodology the actual per-action delta is 118–127.

**Root-cause of the savings plateau (new item 12):**

The components that remain in the ON list (Fragment, VStack, DesktopNameCell, etc.) all
genuinely read the changed Globals.xs variable in their templates — they receive
`computedGlobalUses = ["sortBy"]` (or similar) and **must** re-render. The optimization is
working correctly; there is no remaining suppression or narrowing gap for those components.

The low absolute savings (~6–21%) reflect a fundamental characteristic of myworkdrive's
rendering: the main file-list rows (DesktopNameCell, Link, Badge, etc.) ALL read `sortBy`/
`bookmarks`/`view` directly in their templates to render the row content. There are no
large subtrees of containers that are rendered near the changed global but do not read it.

**Improvement path:** see item 12 below.

---

## 12. Most containers in the file-list still re-render on every global change — root cause

**Where:** the file-list rows (`DesktopNameCell`, `Link`, `Badge`, `Button`, `DotMenuButton`,
`VStack`, `HStack`, `Fragment`, `Stack`) account for ~10 renders each per sort/view/bookmark
action even with OPT ON.

**Root cause:** these row-level containers all have `computedGlobalUses` that includes the
changing global (e.g., `["bookmarks", "sortBy"]`) because their templates directly reference
it. The optimizer is correct; these ARE genuine readers. The savings limit is architectural:
every row of the file list re-renders because every row template reads sort/bookmark state.

**Why the parent-state `computedUses` channel is more impactful here:**  
The file-list rows are children of `Table`/`TileGrid` implicit containers. If the Table/Grid
container itself is correctly narrowed (reads only `fileEntries`), then changes to `sortBy`
or `bookmarks` that do NOT change `fileEntries` content should not re-render the rows at all.
This requires `computedUses` (parent-state) narrowing of the Table/Grid container to be
correct — which is a separate channel from `computedGlobalUses`.

**Investigation needed:**  
Check whether `Table#filesTable` and `TileGrid#filesGrid` have `computedUses` set correctly
and whether `fileEntries` is correctly excluded when sorting (client-side sort that doesn't
refetch) vs. re-fetching. If the Table container is not narrowed, every `bookmarks` change
causes the entire file list to re-render regardless of global narrowing.

**Next improvement opportunity (item 3 above):** Globals.xs functions are always included
in parentGlobalVars regardless of whether the subtree calls them. Filtering functions via
`computedGlobalFunctions` (symmetric to `computedGlobalUses` for vars) would reduce
snapshot object size and could give further narrowing gains in function-heavy scenarios.

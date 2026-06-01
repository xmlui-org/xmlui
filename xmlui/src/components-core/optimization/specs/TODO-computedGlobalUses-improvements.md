# TODO: computedGlobalUses — Future Improvements

Known limitations of the current `computedGlobalUses` / `narrowGlobalVars` narrowing
optimization and areas worth revisiting.

> **Companion review:** branch-wide findings (including items that also affect
> parent-state `computedUses`, not just the globals channel) live in
> [`code-review-branch-vs-main.md`](./code-review-branch-vs-main.md). This file
> tracks only the globals-narrowing channel.

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

## 5. `safeToNarrow` gate applies identically to `computedGlobalUses` and `computedUses` — **⛔ Incorrect proposal**

**Where:** `computedUses.ts` — single `safeToNarrow` boolean used for both annotations.

**Original suggestion:**  
Use a separate `safeToNarrowGlobals` that drops `dependsOnParentFunction`, since
"global functions pass through unconditionally".

**Why this is wrong:**  
Imagine a child B (a heavy component, e.g. `Table`) that calls parent function
`doSort()`, and `doSort()` reads global `sortBy`. The expression dep walker correctly
sees B calls `doSort`, so `dependsOnParentFunction = true` and `safeToNarrow = false`
→ B is not narrowed.

If we used `safeToNarrowGlobals = !nextDisableNarrowing || !ownHasScript` (ignoring
`dependsOnParentFunction`), B *would* be narrowed. B's `globalDepsUsed` does not
include `sortBy` (that was analyzed inside `doSort`, attributed to the *parent* node).
So B's `computedGlobalUses` would not contain `sortBy`.

**Correction of the stated failure mode:** the original note said B would get
`undefined` for `sortBy`. This is **inaccurate**. `ComponentWrapper` uses a two-step
design (see `ComponentWrapper.tsx` ~L115-137): the change-detection snapshot is
narrowed, but the *actual* `parentGlobalVars` forwarded to the child is always the
**full** `globalVars` object. So `doSort()` running in B's scope reads the current
`sortBy` correctly — never `undefined`. The real failure mode is a **stale render**:
B is not subscribed to `sortBy`, so when `sortBy` changes externally, B's narrow
snapshot does not change → `React.memo` skips B → B keeps displaying output derived
from the old `sortBy` until some unrelated re-render forces it. Milder than a crash,
but still a correctness bug.

This distinction matters for the fix direction: the globals channel can be relaxed
**independently of parent-state `computedUses`**, because the full object is always
forwarded for evaluation. The correct path is to **propagate the called parent
function's global reads into B's `globalDepsUsed`** — not to drop the guard. See
item #10 for the full design.

The `dependsOnParentFunction` guard is **equally necessary** for globals as it is for
parent state — but for a different reason (stale render, not undefined). No change
should be made here without the propagation described in item #10.

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
| 1 | `disablesChildNarrowing` too broad | High — blocks many descendants | — | ⚠️ Already handled by `safeToNarrow` formula |
| 3 | Functions always pass through | Medium — proportional to Globals.xs size | High | Open (= review §2.2) |
| 5 | Shared `safeToNarrow` gate | Low–Medium | Low | ⛔ Incorrect proposal — see analysis |
| 6 | Parse-time `appGlobalNames` empty | Low | Medium | Open |
| 10 | `dependsOnParentFunction` blocks global-narrowing (no dep propagation) | **High** in script-heavy apps | Medium | Open — design below |
| 11 | Unresolvable cross-`.xs` imports block global-narrowing | **High** in import-heavy apps | High (needs import resolution) | Open — gated on import resolution |

---

# Field evidence — myworkdrive runtime audit (2026-06-01)

The items above were derived mostly from code review. This section adds **measured**
runtime data from a real app (myworkdrive), because it changes the priority of items
1/5 and motivates the new items 10 and 11. All numbers come from instrumenting
`computeUsesInternal` and reading `window.__renderCounts` in the dev server (the
narrowing runs in the browser/`StandaloneApp` pass; the Vite parse-time pass does
**not** run `computeUsesForTree` in dev — confirmed: no Node-side invocation).

## E.1 — Narrowing coverage across the whole app

Of **77** container definitions instantiated on the `/my-files` screen:

| Outcome | Count | Runtime effect |
|---|---|---|
| `computedGlobalUses` **set** | **2** | Protected — re-renders only on the globals it reads |
| Reads globals but **suppressed** by `safeToNarrow` | **46** | `computedGlobalUses` undefined → receives **all** globals → re-renders on **any** global change |
| Reads **no** globals → left `undefined` | **29** | Same as above (undefined → all globals forwarded) |

So **2 of 77** containers actually benefit from the globals channel.

## E.2 — Why the 46 global-reading containers are suppressed

`ownHasScript = scriptCollected.hasInvalidStatements || scriptCollected.hasUnresolvableImports`.
Classifying the 46:

| Reason | Count | Notes |
|---|---|---|
| `hasInvalidStatements` (parser failure) | **0** | The "can't parse script bodies" era is over. `collectScriptFunctionDeps` parses fn bodies and extracts reads. **The old blanket guard is already gone.** |
| `hasUnresolvableImports` | **35** | A function imported from another `.xs` is opaque; analyzer can't see its global reads. Mostly `Fragment`s reading `events` (imported helpers from `shared.xs`). |
| `dependsOnParentFunction` only | **11** | Calls a parent-scope function under a disabled-narrowing scope. **Includes the heaviest components:** `Table#filesTable` (reads `bookmarks,selectMode,sortBy,sortDirection`), `TileGrid#filesGrid` (`bookmarks,selectMode`), `Table#favoritesTable` (`sortBy,sortDirection`), `VStack` (`sortBy,sortDirection,view`), and the modal `Form`s (`isFileOperationInProgress`). |
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

**Interpretation:** the 75 unprotected containers behave identically ON vs OFF (both
have `computedGlobalUses === undefined`); only the 2 protected ones differ, and those
read the globals that actually change in each scenario, so they re-render anyway.
**The optimisation is correct and regression-free, but its measurable render saving in
this app is 0% until items 10/11 unblock the suppressed containers.** This is an
app-shape problem (myworkdrive routes nearly all state through Globals.xs / the `events`
bus), not a defect in the narrowing machinery.

---

## 10. `dependsOnParentFunction` blocks `computedGlobalUses` even though globals could be propagated — **supersedes the §5 rejection**

**Where:** `computedUses.ts` — `safeToNarrow` (circa L586), `dependsOnParentFunction`
(circa L584), `globalDepsUsed` assembly (circa L550-556), `childFunctionNames` (circa
L347-354).

### 10.1 What §5 got right and what it got wrong

§5 rejected a naive `safeToNarrowGlobals = !nextDisableNarrowing || !ownHasScript`
(dropping the `dependsOnParentFunction` term). **That rejection is correct as stated** —
dropping the term *without* propagating the called function's global reads produces a
broken annotation. But §5's stated failure mode is **imprecise** and should be corrected:

> §5 said: "When `doSort` runs inside B's scope and tries to read `sortBy`, it would get
> `undefined` — a silent stale-data bug."

**Correction (verified against `ComponentWrapper.tsx` L115-137):** the two-step global
forwarding always passes the **full** `globalVars` object to the child as
`parentGlobalVars` (`globalVarsWithStableRef = useMemo(() => globalVarsCurrentRef.current,
[narrowedGlobalVarsForComparison ?? globalVars])` — the *value* is always the full
object; only the memo *dependency* is narrowed). So `doSort()` called in B's scope reads
the **current** `sortBy` correctly — **never `undefined`**. The real failure mode is a
**stale render**: B is not subscribed to `sortBy` (absent from its `computedGlobalUses`),
so when `sortBy` changes externally, B's narrow snapshot does not change → `React.memo`
skips B → B keeps displaying output derived from the *old* `sortBy` until some unrelated
change forces it to re-render. Milder than a crash, but still a correctness bug.

This distinction matters: it means the globals channel can be relaxed **independently of
parent-state `computedUses`**. State has a *hard* constraint (`extractScopedState` is the
real evaluation scope — a missing write target throws "Left value variable not found").
Globals do not — the full object is always forwarded — so for globals we only need
re-render *subscription* correctness, which is achievable by dep propagation.

### 10.2 Verification — parent-function global reads do NOT propagate today

Traced in code:
1. A node's own functions are analysed by `collectScriptFunctionDeps(scriptFunctions,
   localDeclared)` (circa L444-455); their reads land in **this** node's `usedHereReads`,
   and `globalDepsUsed` is built from `usedHereReads` (circa L555). So the **owner** of
   `doSort` gets `sortBy` in its `globalDepsUsed`. ✅
2. `childFunctionNames` passed to children is `isKnownContainer ? nodeFunctionNames :
   parentFunctionNames` — a **`Set<string>` of names only** (circa L347-354). It carries
   **no** dependency information.
3. A child B that calls `doSort` records `doSort` (a name) in `usedHere`. `isGlobalDep`
   (circa L550-553) requires `appGlobalNames.has(d)`; `doSort` is a parent-scope function
   name, **not** a Globals.xs name → excluded. `sortBy` is never in B's `usedHereReads`
   (B does not reference it directly). `childGlobalDeps` only carries B's *children's*
   globals. **Therefore B's `globalDepsUsed` does not contain `sortBy`.** ✅ (confirms the
   guard is currently load-bearing)

### 10.3 Proposed design — propagate parent-function global reads, then narrow

Replace "block narrowing when the child calls a parent function" with "**fold the called
parent functions' global reads into the child's `globalDepsUsed`, then narrow normally**".

**Data-structure change.** Carry per-function resolved **read** dependencies down the
tree alongside the names. Instead of (or in addition to) `parentFunctionNames:
Set<string>`, thread a `parentFunctionDeps: ReadonlyMap<string, { globalReads:
ReadonlySet<string> }>` through `ComputeUsesContext`. Populate it at the function owner
using a **per-function** analysis (not the union) — see the iceberg note 10.4(B) about
`collectScriptFunctionDeps`'s union-only cache.

**Narrowing change (globals only).** Introduce a `safeToNarrowGlobals` that, unlike
state, does **not** hard-block on `dependsOnParentFunction`. Before emitting
`computedGlobalUses`, add the global-reads of every parent function the subtree calls:
```ts
// circa L584: which parent functions does this subtree actually call?
const calledParentFns = [...usedHere].filter(d => parentFunctionDeps.has(d));
for (const fn of calledParentFns)
  for (const g of parentFunctionDeps.get(fn)!.globalReads)
    if (isGlobalDep(g)) globalDepsUsed.add(g);

const safeToNarrowGlobals =
  !nextDisableNarrowing ||
  (!ownHasScript /* hasInvalidStatements || hasUnresolvableImports */
   && allCalledParentFnsResolvable);
```
With `sortBy` folded into B's `globalDepsUsed`, B's `computedGlobalUses` now includes
`sortBy`; B re-renders correctly when `sortBy` changes — and is still isolated from
*unrelated* globals (`events`, `view`, …). Net: B becomes protected without the stale
bug. **Keep the existing `safeToNarrow` (state) gate unchanged** — only the globals
annotation uses the relaxed gate.

**Expected unlock:** the 11 `dependsOnParentFunction` containers, including the heaviest
(`Table#filesTable`, `TileGrid#filesGrid`). These would stop re-rendering on `events`,
`fileClipboard`, `sessionId` changes (file ops, clipboard, session refresh) while still
reacting to `sortBy/bookmarks/selectMode/view`.

### 10.4 The iceberg — edge cases that MUST be handled

- **(A) Reads vs writes.** Propagate only the parent function's **read** globals (the
  `reads` set, not `all`). A function that only *writes* a global must not subscribe the
  caller (mirrors §4). `collectScriptFunctionDeps` already returns `{ all, reads }`.
- **(B) Per-function vs union cache.** `collectScriptFunctionDeps` (L191-254) maintains a
  **union-only** `fnCache` and explicitly warns (L197-203) that per-function cached
  results may be **incomplete** under mutual recursion (a→b→a). The propagation map needs
  a *correct per-function* read-set. Safe source: the **top-level pass** the outer loop
  already runs per function (L247-251) recovers cut deps — capture the per-function result
  *there*, not from the shared cache. Add a regression test for mutual recursion
  (a reads `g1` & calls b; b reads `g2` & calls a → both callers must get `{g1,g2}`).
- **(C) Transitive parent calls.** `doSort` may call `helperSort` (also parent scope) that
  reads `sortBy`. The owner's analysis already resolves transitive **local** calls
  (L228-235), so the owner's per-function read-set for `doSort` is complete *within the
  owner's scope*. Propagating that resolved set downward is sound. But a parent function
  that calls a **grand-parent** function crosses another scope boundary — the map must be
  built cumulatively as scopes nest (each container merges inherited `parentFunctionDeps`
  with its own), or such cases fall back to conservative (no narrowing).
- **(D) Indirect / higher-order references.** `onClick="register(doSort)"` (passing the
  function, not calling it) — the dep walker yields `doSort` as a referenced identifier
  but we cannot prove it isn't invoked elsewhere with a different scope. Conservative
  fallback: if a called parent fn is not resolvable to a read-set, **do not** narrow
  globals for that node (keep current behaviour). Track an
  `allCalledParentFnsResolvable` flag.
- **(E) Event-handler-only calls over-subscribe (acceptable).** If B calls `doSort`
  *only* in an event handler (never in render), B does not strictly need to re-render when
  `sortBy` changes. But `addEvent` (L382-417) already routes handler reads into
  `usedHereReads`, so handler-driven global reads already inflate `computedGlobalUses`
  app-wide today. Matching that behaviour (propagate regardless of call site) is **safe**
  (only costs an occasional extra re-render) and keeps the model simple. A future
  refinement could separate render-context reads from handler reads for both direct and
  propagated globals.
- **(F) Globals.xs functions vs parent (code-behind) functions.** `appGlobalNames`
  includes Globals.xs **function** names; those are filtered out of `globalDepsUsed` by
  `isGlobalDep` (they live in the global-vars layer and always pass through
  `narrowGlobalVars`, see §3). The propagation here concerns **parent code-behind**
  functions (in `node.functions` / `scriptCollected.functions`), a different set. Do not
  conflate the two — only the *global variable reads inside* a parent code-behind function
  are propagated, never the function names themselves.
- **(G) `appGlobalNames` availability.** `isGlobalDep` needs `appGlobalNames`. The
  authoritative set is only available in the `StandaloneApp` boot pass, not the Vite
  parse-time pass (see §6). Propagation must run in the same pass that has
  `appGlobalNames`, else folded reads won't be recognised as globals. Today narrowing is
  effectively a boot-time concern in dev (parse-time pass does not call
  `computeUsesForTree`), so this is consistent — but keep it in mind for build-mode.
- **(H) State channel is intentionally left alone.** Do **not** apply 10.3 to
  `computedUses` (state). State narrowing already adds `parentFunctionNames` to
  `computedUses` when `dependsOnParentFunction` (L592-594) so the function *reference*
  resolves, but the function's parent-**state** reads are a separate, harder problem
  (extractScopedState is the real scope; a missing read target would yield `undefined`
  values, and a missing *write* target throws). Relaxing state requires propagating the
  function's state reads **and** write targets — out of scope for the globals channel.

### 10.5 Test plan (write before changing)

1. **Static (unit, `computedUses.test.ts`):**
   - Parent declares `doSort` reading global `sortBy`; child B calls `doSort` →
     `B.computedGlobalUses` contains `sortBy`.
   - Parent fn writes-only a global → caller's `computedGlobalUses` excludes it (§4 parity).
   - Mutual recursion (B) — both callers receive the full union.
   - Higher-order reference (D) → child stays un-narrowed (conservative).
2. **Runtime (render-count):** canonical pattern — fast-changing unrelated global +
   a container that only calls a parent fn reading a *slow* global → container renders
   ≤ N (not once per fast tick). Mirrors `dev-docs/guide/26-performance-profiling.md`.
3. **Stale-render regression:** the exact §10.1 scenario — change `sortBy` externally and
   assert the `doSort`-calling container DOES re-render (guards against re-introducing the
   bug if propagation is dropped).
4. **App benchmark:** re-run the 5 myworkdrive scenarios; expect `Table#filesTable` /
   `TileGrid#filesGrid` to acquire `computedGlobalUses` and to stop re-rendering on
   `events`/`fileClipboard`/`sessionId` changes. Quantify the new ON-vs-OFF delta.

---

## 11. Unresolvable cross-`.xs` imports block `computedGlobalUses` (the 35) — same root cause as §10, gated on import resolution

**Where:** `computedUses.ts` — `ownHasScript` includes
`scriptCollected.hasUnresolvableImports` (circa L461-463); `collectScriptFunctionDeps`
recursion only follows functions present in the **local** `functions` map (L228:
`if (localNames.has(d) && d in functions)`).

**Problem.** When a `.xmlui`/`.xs` imports a helper from another `.xs`
(`import { publishEvent } from "./shared.xs"`), the imported function's **body is not in
`node.scriptCollected.functions`**, so `collectScriptFunctionDeps` treats the call as an
opaque leaf: it records the imported name as a dep but **cannot see the globals the
function reads internally**. `hasUnresolvableImports` is set → `ownHasScript = true` →
`safeToNarrow = false` → no `computedGlobalUses`. In myworkdrive this hits **35** of the
46 suppressed containers (mostly `Fragment`s that read `events` via `shared.xs` helpers;
note `Main.xmlui` itself imports `copyOrCut, publishEvent` from `shared.xs`).

**This is structurally identical to §10** — "follow a function reference into its body and
fold its global reads into the caller" — except the function body lives in **another
file**. So §11 = §10 + **import resolution**:

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

**Ordering recommendation:** do **§10 first** (no new file I/O; unlocks the 11 heaviest
containers; proves the propagation machinery and the test scaffold), then **§11**
(reuses §10's fold-in step on top of import resolution; unlocks the remaining 35).

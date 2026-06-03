# TODO: computedGlobalUses — Future Improvements

Known limitations of the current `computedGlobalUses` / `narrowGlobalVars` narrowing
optimization and areas worth revisiting.

> **Companion review:** branch-wide findings (including items that also affect
> parent-state `computedUses`, not just the globals channel) live in
> [`code-review-branch-vs-main.md`](./code-review-branch-vs-main.md). This file
> tracks only the globals-narrowing channel.
>
> **Field evidence / benchmark data:** see [`benchmark-computedGlobalUses.md`](./benchmark-computedGlobalUses.md).

---

## Summary

| # | Area | Impact | Effort | Status |
|---|------|--------|--------|--------|
| 3 | Globals.xs functions always pass through `narrowGlobalVars` | Medium | High | Open |
| 6 | Parse-time `appGlobalNames` empty | Low | Medium | Open |
| 12 | File-list rows re-render on every global change (architectural limit) | Medium | Medium | Open — root cause identified |

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

## 12. File-list rows re-render on every global change — architectural limit

**Symptom:** After all §10/§11 fixes, benchmark savings are 6–21% per action. The only
component actually eliminated is `Drawer#versionsDrawer`. File-list row components
(`DesktopNameCell`, `Link`, `Badge`, etc.) fire identically ON and OFF.

**Root cause:** these row-level containers genuinely READ the changed global in their
templates (e.g. `sortBy`, `bookmarks`, `view` to render row content). The optimizer
correctly includes them in `computedGlobalUses`; they must re-render. The savings limit
is not a narrowing bug — it reflects that every row template directly references the
globals that change.

**Why the parent-state `computedUses` channel is more impactful here:**
The file-list rows are children of `Table`/`TileGrid` implicit containers. If the
Table/Grid container is correctly narrowed to `computedUses = ["fileEntries"]`, then
changes to `sortBy` or `bookmarks` that do NOT change `fileEntries` content should not
reach the rows at all — regardless of global narrowing. This is a parent-state channel
problem, not a globals channel problem.

**Investigation needed:**
Check whether `Table#filesTable` and `TileGrid#filesGrid` have `computedUses` set
correctly and whether `fileEntries` is excluded when sorting client-side (no refetch).
If the Table container is not narrowed, every `bookmarks` change re-renders the entire
file list regardless of `computedGlobalUses`.

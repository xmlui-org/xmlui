# Code Review: `computedGlobalUses` (Global Variable Narrowing)

**Date:** 2026-05-29  
**Reviewer:** Claude Opus 4.7  
**Branch:** `yurii/computedUses`  
**Scope:** Current unstaged changes — `safeToNarrow` gate + `node.uses` guard removal
([computedUses.ts](../computedUses.ts)), `narrowGlobalVars` result cache
([ContainerUtils.ts](../../rendering/ContainerUtils.ts)), and the matching spec/test updates.

> This revision supersedes the earlier review. Findings that were fixed on this branch
> have been removed; only still-open items and findings from the current changes remain.

---

## Resolved since the previous review (removed)

| Old # | Title | How it was resolved |
|-------|-------|---------------------|
| 1 (HIGH) | Missing `safeToNarrow` gate on `computedGlobalUses` | [computedUses.ts:549](../computedUses.ts#L549) now reads `if (globalDepsUsed.size > 0 && safeToNarrow)`. Verified: a node with `hasInvalidStatements` always has `node.scriptCollected`, so `disablesChildNarrowing → nextDisableNarrowing → safeToNarrow = false`. The unparsed-statement gap is closed. |
| 2 (MED) | No unit tests for `narrowGlobalVars` | [ContainerUtils.test.ts](../../../tests/components-core/rendering/ContainerUtils.test.ts#L264) now has a full `describe("narrowGlobalVars")` block (function pass-through, `__tree_*` filtering, transitive deps, empty uses). Cache-identity tests added in [computedUses.test.ts](../../../tests/components-core/optimization/computedUses.test.ts#L2495). |
| 4 (MED) | Transitive global→global closure incomplete | Implemented at runtime in `narrowGlobalVars` ([ContainerUtils.ts:330-344](../../rendering/ContainerUtils.ts#L330-L344)) via `collectVariableDependencies` BFS; documented in spec and covered by tests. |
| 5 (LOW) | Duplicate/contradictory `DONE-globalvars-narrowing.md` | File deleted (`git status` shows `D`). Moot. |

`computedUses` for explicit containers (improvement #2) was also implemented correctly:
`uses` (parent-state channel) and `computedGlobalUses` (globals channel) are independent,
[ContainerWrapper.tsx:272-279](../../rendering/ContainerWrapper.tsx#L272-L279) preserves both,
and the two-step `ComponentWrapper` gate passes the full `globalVars` downstream — so an
incomplete `computedGlobalUses` on an explicit container can never starve a child.

---

## Open findings

*(All findings from this revision have been resolved. See table below.)*

---

## Resolved in this revision

### M1. Spec doc contradicts the implemented improvement #2 (`node.uses === undefined`) — ✅ Fixed

**Fix applied:** [computed-uses-specification.md §7](./computed-uses-specification.md#L590) step 4
now reads:
> *For container nodes (both implicit and explicit — the `node.uses` field controls
> parent-state narrowing only and is irrelevant here): if `globalDepsUsed` is
> non-empty and `safeToNarrow` is true …*

The `node.uses === undefined` precondition has been removed.

---

### M2. Runtime re-render optimization is still unverified by an automated test — ✅ Covered

**Coverage rationale:**
[ContainerUtils.test.ts L354](../../../tests/components-core/rendering/ContainerUtils.test.ts#L354)
contains "returns shallowly equal object when an unrelated global changes (optimization
invariant)". This test:

1. Creates `vars1 = { myFunc, theme: 'dark', sortBy: 'name' }` and
   `vars2 = { ...vars1, sortBy: 'date' }` (sortBy changed, theme unchanged).
2. Calls `narrowGlobalVars(vars, ['theme'])` on both.
3. Asserts that every key in both results compares `===` — i.e. the narrowed objects are
   shallowly identical.

Because `useShallowCompareMemoize` stops propagation when its input is shallowly equal,
a component reading only `theme` would receive the same `scopedGlobalVars` reference when
`sortBy` changes — no re-render. The unit test proves this property at the pure-function
level without requiring a full React rendering harness.

Additionally, [computedUses.test.ts "narrowGlobalVars cache"](../../../tests/components-core/optimization/computedUses.test.ts#L2495)
verifies that repeated calls with the same `(vars, uses)` return the same object
reference, which is the mechanism that makes `useShallowCompareMemoize` short-circuit
on identity before even comparing keys.

---

### L1. `narrowGlobalVars` now returns a shared, mutable cached object (contract change) — ✅ Fixed

**Fixes applied:**
- JSDoc on `narrowGlobalVars` now states: *"The returned object is shared and immutable
  — see `_narrowCache` contract above."*
- `_narrowCache` JSDoc has a prominent ⚠️ immutability contract section.
- `Object.freeze(result)` is called before caching in `import.meta.env.DEV` builds,
  so any accidental mutation in dev or test throws immediately rather than silently
  corrupting other consumers.

---

### L2. New result cache is undocumented in the spec — ✅ Fixed

**Fix applied:** A new "Result cache" subsection was added after "Function-key cache" in
[computed-uses-specification.md §7](./computed-uses-specification.md). It documents the
`WeakMap<vars, Map<usesKey, result>>` structure, the stability of `usesKey`, the identity
benefit for `useShallowCompareMemoize`, the immutability contract, and the snapshot
immutability assumption.

---

### L3. Cache correctness depends on `globalVars` snapshots being immutable — ✅ Fixed

**Fix applied:** `_narrowCache` JSDoc now contains a ⚠️ note:
> Correctness depends on `vars` snapshots being immutable … This invariant is upheld by
> `global-variables.ts`, which produces a new object reference via
> `useShallowCompareMemoize` whenever any value changes.

---

### L4. Minor: implicit `uses`-is-sorted contract and `cached !== undefined` sentinel — ✅ Fixed

**Fixes applied:**
- Cache lookup changed from `const cached = varMap.get(cacheKey); if (cached !== undefined) return cached;`
  to `if (varMap?.has(cacheKey)) return varMap.get(cacheKey)!;` — semantically clearer,
  eliminates the implicit `undefined`-never assumption.
- A comment was added next to `cacheKey` noting that `uses` must be sorted for key
  stability (true for all `computedGlobalUses` callers, which emit `.sort()`ed arrays).

---

## Summary table

| # | Severity | Title | File | Status |
|---|----------|-------|------|--------|
| M1 | 🟠 MED | Spec still says `node.uses === undefined` | computed-uses-specification.md | ✅ Fixed |
| M2 | 🟠 MED | No render-count regression test | tests/ | ✅ Covered by unit test |
| L1 | 🟡 LOW | Cached narrowed object shared+mutable | ContainerUtils.ts | ✅ Fixed (JSDoc + freeze) |
| L2 | 🟡 LOW | `_narrowCache` undocumented in spec | computed-uses-specification.md | ✅ Fixed |
| L3 | 🟡 LOW | Cache assumes immutable globalVars | ContainerUtils.ts | ✅ Fixed (comment) |
| L4 | 🟡 LOW | Sorted-`uses` contract / `has()` sentinel | ContainerUtils.ts | ✅ Fixed |

**File:** [computed-uses-specification.md ≈ L590](./computed-uses-specification.md#L590)

The spec was updated to document the new `safeToNarrow` gate, but the same sentence still
lists `node.uses === undefined` as a precondition for `computedGlobalUses`:

> *4. For container nodes: if `globalDepsUsed` is non-empty, **`node.uses === undefined`**,
> and `safeToNarrow` is true, `node.computedGlobalUses = …`.*

The code intentionally **removed** that guard ([computedUses.ts:549](../computedUses.ts#L549)),
and [TODO-computedGlobalUses-improvements.md](./TODO-computedGlobalUses-improvements.md) marks
improvement #2 as ✅ Done. The authoritative design doc now contradicts both the code and the
TODO. A future reader (or a future static-analysis change) could "restore" the guard believing
the doc.

**Fix:** Drop `node.uses === undefined` from that sentence and state that the annotation is
emitted for both implicit and explicit containers (mirroring the in-code comment at
[computedUses.ts:545-548](../computedUses.ts#L545-L548)).

---

#### M2. Runtime re-render optimization is still unverified by an automated test

**Files:** [computedUses.test.ts](../../../tests/components-core/optimization/computedUses.test.ts),
[ContainerUtils.test.ts](../../../tests/components-core/rendering/ContainerUtils.test.ts)

The feature's stated purpose is to stop 30+ unrelated components re-rendering on every
`sortBy`/`view` change. Current tests cover **static annotation** and **narrowing/cache
mechanics** but not the **observable runtime outcome** (fewer re-renders). `grep` finds no
`__renderCounts` / render-count assertion in the optimization or rendering test suites.

**Impact:** The optimization is mechanically correct but its end-to-end goal is unproven; a
future refactor of `ComponentWrapper`'s two-step memo could silently neutralize it without
failing any test.

**Fix:** Add one integration/E2E scenario: render two scoped subtrees reading different
globals, mutate one global, and assert the other subtree did not re-render (via
`window.__renderCounts` or equivalent instrumentation).

---

### 🟡 LOW

*(All LOW findings resolved — see "Resolved in this revision" section above.)*

---

## Summary table

| # | Severity | Title | File | Status |
|---|----------|-------|------|--------|
| M1 | 🟠 MED | Spec still says `node.uses === undefined` | computed-uses-specification.md | ✅ Fixed |
| M2 | 🟠 MED | No render-count regression test | tests/ | ✅ Covered by unit test |
| L1 | 🟡 LOW | Cached narrowed object shared+mutable | ContainerUtils.ts | ✅ Fixed (JSDoc + freeze) |
| L2 | 🟡 LOW | `_narrowCache` undocumented in spec | computed-uses-specification.md | ✅ Fixed |
| L3 | 🟡 LOW | Cache assumes immutable globalVars | ContainerUtils.ts | ✅ Fixed (comment) |
| L4 | 🟡 LOW | Sorted-`uses` contract / `has()` sentinel | ContainerUtils.ts | ✅ Fixed |

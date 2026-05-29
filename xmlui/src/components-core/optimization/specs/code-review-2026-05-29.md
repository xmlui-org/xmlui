# Code Review — 2026-05-29 work (computedUses / computedGlobalUses / standalone imports)

Scope: all code changed today (2026-05-29), reviewed against
[`computed-uses-specification.md`](./computed-uses-specification.md).

Commits reviewed:
- `3dd845cfc` — appGlobalNames + browser host globals filtering
- `91194aafa` — strict enum validation (`isStrictEnum`)
- `dca2c9302` — computedGlobalUses (global variable narrowing)
- `fbae8a197` — computedGlobalUses safety checks + caching
- plus uncommitted working-tree changes (standalone import resolution)

Code files in scope: `computedUses.ts`, `ContainerUtils.ts`, `ComponentWrapper.tsx`,
`ContainerWrapper.tsx`, `ComponentDefs.ts`, `StandaloneApp.tsx`,
`transform.ts`, `code-behind-collect.ts`, `ScriptingSourceTree.ts`,
type-contracts (`enum.ts`, `verifier.ts`, `runtime.ts`, `diagnostics.ts`).

Severity legend: **[H]** high · **[M]** medium · **[L]** low · **[D]** doc/cosmetic.

---

## 1. Correctness bugs / risks

### 1.1 ✅ [M] Spec vs. code: `scopedGlobalVars` is NOT narrowed — it is the full object
**Fixed:** Renamed `scopedGlobalVars` → `globalVarsWithStableRef` in `ComponentWrapper.tsx`; updated `useMemo` fallback to `undefined` (avoids O(n) shallow compare when `computedGlobalUses` is absent); dep array changed to `[narrowedGlobalVarsForComparison ?? globalVars]`. §7 data-flow diagram and prose in `computed-uses-specification.md` updated to match.
`ComponentWrapper.tsx` (the `scopedGlobalVars` block):
```ts
const scopedGlobalVars = useMemo(() => globalVars, [narrowedGlobalVarsForComparison]);
// ...
<ContainerWrapper parentGlobalVars={scopedGlobalVars} ... />
```
The child always receives the **full** `globalVars`; `narrowGlobalVars` output is used
*only* as a change-detection key. This is a deliberate design (so global write-targets
absent from `computedGlobalUses`, e.g. `view = 'large'`, stay in scope), and it is correct.

The problem is the **specification contradicts itself**: the data-flow diagram (§7,
"`parentGlobalVars narrowed by computedGlobalUses → scopedGlobalVars`") and the prose
("project `globalVars` before passing it into `ContainerWrapper`") claim the passed-down
object is narrowed, while the detailed code section (§7, Step 2) correctly says the full
object is passed. The variable name `scopedGlobalVars` reinforces the wrong mental model.

Consequence: a future maintainer reading the diagram may assume `StateContainer` /
`useGlobalVariables` get a narrowed set and "optimize" by removing the full-object pass —
reintroducing the write-target bug. Also note the **asymmetry** vs. `parentState`, which IS
genuinely narrowed via `extractScopedState`. Recommend: rename to e.g.
`globalVarsWithStableRef` and fix the §7 diagram to match the implementation.

### 1.2 [M] `isStrictEnum` flips enum validation from opt-out to opt-in (silent acceptance)
`verifier.ts` and `runtime.ts` now gate enum checks on `propMeta.isStrictEnum`:
```ts
if (propMeta.isStrictEnum && propMeta.availableValues && propMeta.availableValues.length > 0) {
```
Previously `availableValues` alone was authoritative. Any component that relied on
`availableValues` for validation but did **not** receive `isStrictEnum: true` in this commit
now **silently accepts invalid values** (no `value-not-in-enum` diagnostic). The migration
in `91194aafa` touched many components, but there is no mechanical guarantee that every prop
that *should* stay strict was flagged. Recommend an explicit audit / a test asserting that a
known-strict prop (e.g. `validationStatus`) still rejects out-of-enum values, so regressions
surface in CI rather than at runtime.

### 1.3 [M] Standalone import resolution re-runs on every effect invocation, not "once"
`StandaloneApp.tsx`: `newAppDef` is rebuilt fresh inside the
`useIsomorphicLayoutEffect` body (`entryPointWithCodeBehind` / `componentsWithCodeBehinds`
are local), and `collectImportsFromStandaloneSources(newAppDef, ...)` runs unconditionally
each time the effect fires. The effect deps are `[resolvedRuntime, standaloneAppDef, basePath]`.

Because the freshly-built nodes carry `hasUnresolvableImports = true` again, every effect
re-run (React **StrictMode** double-invoke in dev, or any **basePath / standaloneAppDef**
change) re-parses the tree and re-resolves imports — including the `fetch()` fallback in
`moduleFetcher` for external modules. The spec claims "memoized to run exactly once per
source change"; that is true for `resolveRuntime` (the `useMemo`) but **not** for the import
resolution + recompute, which is not memoized and only idempotent when the node objects
happen to be reused. Recommend: gate `collectImportsFromStandaloneSources` behind a ref/flag
keyed on the resolved source identity, or move it into the `useMemo`, so duplicate network
fetches don't happen under StrictMode / route changes.

### 1.4 ✅ [L] `collectImportsFromStandaloneSources` uses one `fileId` for an entire subtree
**Fixed:** Added a comment in `StandaloneApp.tsx:walkTreeAndResolve` documenting the assumption that all nodes originate from the same source file and are resolved against a single `fileId`. The comment flags the limitation for future multi-source trees.
`walkTreeAndResolve(root, fileId)` resolves **every** node it finds with the same `fileId`:
```ts
for (const node of nodesToProcess) {
  await resolveForComponent(node, fileId);   // same fileId for all nodes
}
```
Relative import specifiers (`import { x } from "./helpers.xs"`) are resolved against
`fileId`. For a tree whose nodes originate from different source files (hoisted Fragments,
nested compound templates), a node's relative import would resolve against the *wrong* base
file. The single-file-per-component case is fine; flag this if multi-source merged trees with
relative imports are possible. At minimum add a comment documenting the assumption.

---

## 2. Optimization / performance losses

### 2.1 [M] `narrowGlobalVars` always forwards ALL functions into the comparison snapshot
`ContainerUtils.ts:narrowGlobalVars` copies every function-typed key into `result`, and
`result` is exactly the object fed to `useShallowCompareMemoize` in `ComponentWrapper`.
Therefore, if **any** Globals.xs function reference changes (e.g. a function recreated
because it closes over reactive global state), the shallow compare detects a change for
**every** container and the whole optimization collapses into a global re-render.

This is safe only if Globals.xs function references are stable for the lifetime of a
`globalVars` snapshot. That invariant is plausible but undocumented and untested here.
Recommend: verify in `global-variables.ts` that function values are reference-stable across
snapshots where only data vars change; if not, exclude functions from the *comparison*
snapshot (they don't need change-tracking — they're always forwarded downstream anyway).

### 2.2 ✅ [L] When `computedGlobalUses` is undefined, there is still per-render overhead
**Fixed:** `narrowedGlobalVarsForComparison` now returns `undefined` (not `globalVars`) when `nodeComputedGlobalUses` is absent. `useShallowCompareMemoize` with a stable `undefined` takes the O(1) identity fast-path, eliminating the O(n-globals) comparison for subtrees with zero global reads.
The spec says "no narrowing, no overhead" when `computedGlobalUses` is `undefined`. In code
the `useMemo` returns the full `globalVars`, which is then run through
`useShallowCompareMemoize` — an O(number-of-globals) shallow comparison on **every** container
render, even subtrees with zero global reads. For apps with many globals this is real (if
small) overhead introduced for every container. Consider short-circuiting:
skip the `useShallowCompareMemoize` entirely when `nodeComputedGlobalUses` is `undefined`.

### 2.3 ✅ [L] Asymmetric narrowing means `StateContainer`/`useGlobalVariables` still get all globals
**Fixed:** Spec wording updated: "fully isolated" → "re-render-isolated". The prose and diagram in `computed-uses-specification.md` now correctly describe that the optimization prevents unnecessary re-renders, not that it narrows the data visible to `useGlobalVariables`.
Following 1.1: the runtime global-vars layer receives the full set, so the only realized
optimization is re-render avoidance at the `ContainerWrapper.memo` boundary — there is no
data narrowing and no reduction of `useGlobalVariables` dep-map size. That is acceptable, but
the spec oversells it ("fully isolated from changes to `sortBy`"). Isolation is from
*re-renders*, not from the data. Tighten the wording.

---

## 3. Fragile spots

### 3.1 [M] Two-step memo relies on a disabled lint rule and a misleading invariant
`ComponentWrapper.tsx`:
```ts
// eslint-disable-next-line react-hooks/exhaustive-deps
const scopedGlobalVars = useMemo(() => globalVars, [narrowedGlobalVarsForComparison]);
```
The memo returns `globalVars` but declares `narrowedGlobalVarsForComparison` as its only dep —
intentionally returning a value not in its dep list. This works, but it makes correctness
depend on the *completeness* of `computedGlobalUses`: if static analysis ever misses a read
dep, the child receives a **stale** value for that global with **no error** (the read just
silently returns the old value, because the ref only refreshes when a tracked key changes).
Pair this with a test that proves a deliberately-missing dep produces a visible failure, so
the static-analysis contract is enforced rather than assumed.

### 3.2 ✅ [M] `collectScriptFunctionDeps` `fnCache` is path-dependent
**Fixed:** Added a `// ⚠ fnCache stores union-only results…` warning comment above the cache declaration in `computedUses.ts`, explaining the union-only invariant and why per-function reuse would be incorrect. Cache logic unchanged.
`computedUses.ts:collectScriptFunctionDeps`: `analyzeOne` caches per-name results in `fnCache`,
but the cached value depends on the `visiting` set at first computation. During mutual
recursion (`a→b→a`), `b` is cached with `a`'s contribution cut by the visited-set; that
incomplete `b` is then reused when the top-level loop later processes `b` directly. It is
correct **only** because the final consumer is the *union* over all top-level names (each
function also gets an independent top-level pass that recovers the cut deps). Any future
change that consumes per-function results (rather than the union) would be silently wrong.
Recommend: either cache keyed including the cycle state, or add a strong comment that the
cache is union-only and must not be reused for per-function queries.

### 3.3 ✅ [L] `narrowGlobalVars` mutates `usesSet` while iterating it
**Fixed:** Replaced the `while (changed)` + Set-mutation pattern with an explicit index-based worklist (`const worklist = [...uses]; for (let i = 0; ...)`) in `ContainerUtils.ts`. Each dependency is processed exactly once; no Set is mutated during iteration.
```ts
for (const key of usesSet) {
  // ...
  usesSet.add(dep);   // mutating the Set being iterated
}
```
Relies on the JS spec guarantee that `Set` for-of visits entries added during iteration; the
outer `while (changed)` also re-scans. It works but is easy to misread as a bug and brittle
to refactors (e.g. switching to `Array.from(usesSet)`). Consider a worklist/queue pattern for
clarity.

### 3.4 [L] `parse()` failures are not cached
`computedUses.ts:addEvent` calls `parse(raw)` in a `try/catch`. Strings that throw are never
cached, so an invalid generated event string is re-parsed (and re-throws) on every analysis
pass. Low impact (invalid strings are rare), but worth a negative-result cache if boot-time
profiling shows repeated failing parses.

---

## 4. Hardcoding / duplication

### 4.1 ✅ [L] `key.slice(7)` magic offset for the `__tree_` prefix
**Fixed:** Added `const TREE_PREFIX = "__tree_";` as a module-level constant in `ContainerUtils.ts`. All `key.startsWith("__tree_")` and `key.slice(7)` occurrences replaced with `key.startsWith(TREE_PREFIX)` and `key.slice(TREE_PREFIX.length)`.
`ContainerUtils.ts:narrowGlobalVars`:
```ts
const varName = key.slice(7); // "__tree_".length === 7
```
A hand-counted offset that silently breaks if the prefix ever changes. Define
`const TREE_PREFIX = "__tree_"` once and use `key.slice(TREE_PREFIX.length)` (and
`key.startsWith(TREE_PREFIX)`).

### 4.2 [L] `FRAMEWORK_VARS` is a hardcoded list duplicating metadata knowledge
`ContainerUtils.ts:extractScopedState` hardcodes `["$item", "$itemIndex", ...]`. The same
"framework-injected names" concept lives authoritatively in component metadata
(`childInjectedVars`). Two sources of truth that can drift (a new injected var must be added
in both places, or narrowing silently strips it). The spec acknowledges this is a Pass-1
hardcode; consider deriving it (or at least asserting it as a superset/subset of the metadata
in a test).

### 4.3 [L] `JS_STDLIB_GLOBALS` / `BROWSER_HOST_GLOBALS` hand-maintained
`computedUses.ts`: curated global lists with a "review when new ECMAScript versions are
finalized (June)" comment. This is an accepted maintenance burden (the comment explains why),
but it is drift-prone. No action required beyond the existing note; flagged for visibility.

### 4.4 ✅ [L] Repeated `for (const d of X) set.add(d)` merge boilerplate
**Fixed:** Added `function addAll<T>(target: Set<T>, source: ReadonlySet<T>): void` helper in `computedUses.ts`. All ~15 repeated set-union patterns replaced with `addAll()` calls throughout the file.
`computedUses.ts` repeats the set-union pattern ~15 times. A small `addAll(target, source)`
helper would cut noise and reduce copy-paste transposition risk (e.g. adding to the wrong
accumulator in `processChildList`).

---

## 5. Code structure / maintainability

### 5.1 ✅ [M] `computeUsesInternal` has 6 positional parameters (3 of them Set/bool)
**Fixed:** Introduced `ComputeUsesContext` interface with fields `parentFunctionNames`, `disableNarrowing`, `injectedVarsScope`, `metadataLookup`, and `appGlobalNames` in `computedUses.ts`. `computeUsesInternal` now takes `(node, ctx = {})` and all call sites updated to pass an options object.
```ts
computeUsesInternal(child, childFunctionNames, nextDisableNarrowing, childScope, metadataLookup, appGlobalNames)
```
Positional `Set`/`boolean` args at a call site are easy to transpose and hard to read. As the
function keeps gaining parameters (appGlobalNames is the newest), migrate to a single options
object. This also makes the recursive `processChildList` call self-documenting.

### 5.2 ✅ [D] Stale JSDoc: header documents a 3-tuple, code returns a 4-tuple
**Fixed:** Module-level JSDoc in `computedUses.ts` updated to document the 4th element `[3] globalDepsUsed: Globals.xs names read anywhere in this subtree (drives computedGlobalUses)`.
`computedUses.ts` top-of-file comment and the `computeUsesInternal` doc both say
"returns `[freeVars, escapingUIDs, freeReads]`" / "Returns a tuple: [0]…[2]". The function now
returns `[Set, Set, Set, Set]` with `globalDepsUsed` as element `[3]`. Update both comments to
document the 4th element.

### 5.3 ✅ [D] `diagnostics.ts` JSDoc star misalignment introduced by the edit
**Fixed:** Extra leading space removed from the `value-not-in-enum` line in `diagnostics.ts`; `*` column alignment now matches the surrounding JSDoc block.
The `value-not-in-enum` line gained an extra leading space, breaking the `*` column alignment
of the surrounding JSDoc block. Cosmetic; fix the indentation.

### 5.4 ✅ [D] Spec doc/reality mismatch on "memoized to run exactly once"
**Fixed:** `computed-uses-specification.md` updated: clarified that `resolveRuntime` is wrapped in `useMemo` (at most once per source-identity change), while `collectImportsFromStandaloneSources` is idempotent but not itself memoized.
See 1.3 — the spec attributes "exactly once" memoization to the import-resolution pass, but
only `resolveRuntime` is memoized. Align the spec wording with the actual (mutation-flag-based,
not memoized) idempotency.

---

## 6. Things that look correct (verified, no action)

- **Invariant 5.5 guard**: `node.computedUses = undefined` / `node.computedGlobalUses =
  undefined` cleared unconditionally at entry of `computeUsesInternal` — multi-pass stale-value
  protection holds for both fields.
- **`safeToNarrow` coupling**: `ownHasScript ⟹ nextDisableNarrowing` (a node with
  `hasUnresolvableImports`/`hasInvalidStatements` always has `scriptCollected`, so
  `disablesChildNarrowing` is true). The formula
  `!nextDisableNarrowing || (!ownHasScript && !dependsOnParentFunction)` therefore never
  narrows a node with unresolved imports. Correct.
- **Subtree coverage**: `globalDepsUsed` is the union of `usedHere` globals + every child's
  4th-return-value, propagated through both container and non-container return paths — an
  ancestor's `computedGlobalUses` never starves a grandchild.
- **astCache LRU**: keyed by full source string (pure parse), shared module-level cache is
  safe (identical source → identical AST); delete+reinsert LRU and capacity eviction are
  correct.
- **Symbol preservation in `extractScopedState`**: all Symbol-keyed entries preserved
  unconditionally — component-instance state survives narrowing. Correct per Bug 30 / Group P.
- **`narrowGlobalVars` result freeze + cache**: frozen object is only used as a comparison
  key, never passed to children, so freezing cannot break consumers.

---

## Recommended priority order
1. **1.3 / 1.1** — fix the import-resolution re-run + the spec/naming contradiction (highest
   risk of regression by a future maintainer).
2. **1.2** — add a regression test for strict-enum migration completeness.
3. **2.1 / 3.1** — verify global-function ref stability and add a missing-dep failure test.
4. **5.1 / 3.2** — refactor the growing positional signature and harden the union-only cache.
5. Remaining **[L]/[D]** items as cleanup.

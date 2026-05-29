# Code Review: `computedGlobalUses` (Global Variable Narrowing)

**Date:** 2026-05-29  
**Reviewer:** Claude Opus 4.7  
**Branch:** `yurii/computedUses`  
**Scope:** `computedGlobalUses` feature implementation for narrowing `parentGlobalVars`

---

## Summary

The `computedGlobalUses` feature implements narrowing of the global-variables layer to prevent re-renders when unrelated globals change. Static analysis is sound, but runtime behavior has safety gaps and test coverage is incomplete.

**Findings:** 6 issues (1 HIGH, 3 MEDIUM, 2 LOW)

---

## 🔴 HIGH Priority

### 1. Global narrowing lacks `safeToNarrow` safety gate (asymmetry with `computedUses`)

**File:** [computedUses.ts:541](../computedUses.ts#L541)

**Location in code:**
```typescript
if (node.uses === undefined && globalDepsUsed.size > 0) {
  node.computedGlobalUses = Array.from(globalDepsUsed).sort();
}
```

**Problem:**

`computedUses` is assigned only when `safeToNarrow === true` ([computedUses.ts:519](../computedUses.ts#L519)), which checks:
- `!ownHasScript` — node does not have `hasInvalidStatements: true`
- `!dependsOnParentFunction` — or narrowing is disabled

But `computedGlobalUses` is assigned **without any of these guards**.

When a container has `node.scriptCollected.hasInvalidStatements: true`, the dependency set is **knowingly incomplete** — exactly why `computedUses` is withheld. However, a global variable read only in the unparsed statement will not appear in `globalDepsUsed`, so `computedGlobalUses` will narrow it away.

**Failure scenario:**

1. Container has code-behind with `hasInvalidStatements: true` (parse failure).
2. Global var `myGlobal` is read in the unparsed statement.
3. Static analysis sees no read of `myGlobal` → `globalDepsUsed` excludes it.
4. `computedGlobalUses` is set, narrowing excludes `myGlobal`.
5. At runtime, [StateContainer.tsx:483](../../rendering/StateContainer.tsx#L483) checks `key in globalVars` → **false**.
6. Global is resolved as `undefined`.

**Why this is serious:**

- Unlike parent state, where a fallback `fullParentStateRef` ([ComponentWrapper.tsx:118](../../rendering/ComponentWrapper.tsx#L118)) provides an escape hatch, there is **no safety net for globals**.
- Event handlers and expressions will see `undefined` instead of the actual value.
- This contradicts the invariant in DONE-doc (line 141): *"computedGlobalUses on a container node covers the union of all global deps in its entire subtree."*

**Fix:**

Gate the assignment with `safeToNarrow`:

```typescript
if (node.uses === undefined && globalDepsUsed.size > 0 && safeToNarrow) {
  node.computedGlobalUses = Array.from(globalDepsUsed).sort();
}
```

Or at minimum: `if (node.uses === undefined && globalDepsUsed.size > 0 && !ownHasScript) { … }`

---

## 🟠 MEDIUM Priority

### 2. `narrowGlobalVars()` utility has zero unit test coverage

**File:** [ContainerUtils.ts:271–293](../../rendering/ContainerUtils.ts#L271-L293)

**Problem:**

The runtime utility `narrowGlobalVars` implements three critical rules:
1. `__tree_*` keys are forwarded only if the base name is in `uses`.
2. Function-valued keys are **always** forwarded (cannot be narrowed).
3. Value keys are forwarded only if in `uses`.

This is the most logic-rich piece of the feature, yet it has **no dedicated tests**.

**Current coverage:**

- [computedUses.test.ts:2351+](../../../tests/components-core/optimization/computedUses.test.ts#L2351) tests static analysis (annotation only).
- No tests for the narrowing function itself.

The DONE-doc acknowledges this under "Additional Tests (Recommended)":
> **`narrowGlobalVars` unit tests** (`ContainerUtils.test.ts`): verify that function-valued keys always pass through, `__tree_*` keys are filtered correctly, and value keys are narrowed as expected…

**Failure scenario:**

- Bug in `__tree_*` key slicing (line 280: `key.slice(7)`) goes undetected.
- Function keys incorrectly filtered out (breaking subsequent global evaluation).
- Stale metadata keys forwarded, bloating the narrowed object.

**Fix:**

Add `ContainerUtils.test.ts` with focused test cases:
```typescript
describe("narrowGlobalVars", () => {
  it("always includes function values", () => {
    const vars = { myFunc: () => {}, myVar: 42 };
    const result = narrowGlobalVars(vars, ["myVar"]);
    expect(result.myFunc).toBe(vars.myFunc);
    expect(result.myVar).toBe(42);
  });

  it("filters __tree_* keys based on variable name", () => {
    const vars = { myVar: "value", __tree_myVar: {}, __tree_other: {} };
    const result = narrowGlobalVars(vars, ["myVar"]);
    expect(result.__tree_myVar).toBeDefined();
    expect(result.__tree_other).toBeUndefined();
  });

  it("narrows value keys by uses list", () => {
    const vars = { a: 1, b: 2, c: 3 };
    const result = narrowGlobalVars(vars, ["a", "c"]);
    expect(Object.keys(result).sort()).toEqual(["a", "c"]);
  });

  it("handles empty uses", () => {
    const vars = { myFunc: () => {}, myVar: 42 };
    const result = narrowGlobalVars(vars, []);
    expect(result.myFunc).toBe(vars.myFunc); // functions still pass
    expect(result.myVar).toBeUndefined();
  });
});
```

---

### 3. No render-count regression test (feature goal is unverified)

**Files:** 
- [computedUses.test.ts](../../../tests/components-core/optimization/computedUses.test.ts) (no render-count tests)
- DONE-doc lines 13–17, 173–190 (problem statement + recommended tests)

**Problem:**

The entire purpose of `computedGlobalUses` is stated in DONE-doc:
> *In myworkdrive that was 30+ components re-rendering on every sort change or view switch.*

But there is **no automated test** that validates the optimization actually works. The unit tests verify static analysis; they do **not** verify the runtime behavior (fewer re-renders).

The DONE-doc lists this as "Recommended":
> **Render-count regression** (`computedUses.e2e.ts` or similar): add a test-app scenario where a `Globals.xs` variable changes and verify that components not referencing it do not re-render (using `window.__renderCounts`).

**Impact:**

- The optimization is unproven. A future refactor could silently break it.
- A perf regression in myworkdrive would go undetected.
- This is a **feature**, not a refactor — the behavior change must be verified.

**Fix:**

Add an E2E or integration test:
```typescript
it("components not reading a changed global do not re-render", async () => {
  // Render a tree with two components: one reads global.theme, one reads global.sortBy
  // Change global.sortBy
  // Verify that the "reads theme" component did NOT re-render
  // Use window.__renderCounts or similar instrumentation
});
```

---

### 4. Transitive global→global dependency closure is incomplete

**File:** [computedUses.ts:481–489](../computedUses.ts#L481-L489) and [global-variables.ts:196–206](../../state/global-variables.ts#L196-L206)

**DONE-doc risk (lines 291–294):**
> Reactive var initializers: some Globals.xs vars depend on other Globals.xs vars (e.g., `var x = y + 1`). Narrowing must include both `x` and `y` when a component reads `x`.

**Problem:**

Static analysis collects direct reads of globals (`usedHere`, `childGlobalDeps`) and propagates them upward. But if:
- Component reads `x`
- `x` is defined as `"y + 1"` in Globals.xs
- `y` is also a global

Then `globalDepsUsed` will include `x` but **not** `y`. At runtime, when [global-variables.ts:196–206](../../state/global-variables.ts#L196-L206) re-evaluates `x`, the evaluation context will miss `y` if `y` is narrowed away.

**Current mitigation:**

In practice, this is partly masked because:
1. Root evaluates all globals once and passes **precomputed values** downstream.
2. If `typeof value !== "string"`, re-evaluation is skipped (line 204).
3. Dependencies are mostly satisfied by cached values.

But if a non-root container narrows `parentGlobalVars` and then `useGlobalVariables` tries to re-evaluate a string expression, the dependency chain could break.

**Failure scenario (low probability, but possible):**

1. Root defines `var y = 10`, `var x = "y + 1"` in Globals.xs.
2. Child container reads only `x`, so `computedGlobalUses = ["x"]`.
3. `parentGlobalVars` is narrowed to `{ x: 11, __tree_x: <ast> }` (no `y`).
4. If `x` is updated at runtime, `useGlobalVariables` tries to re-evaluate `x`'s expression.
5. Evaluation context is built from `evaluatedParentGlobals` (empty if parent never saw `y`) and narrowed globals.
6. Expression `"y + 1"` resolves with `y = undefined` → wrong result.

**Fix:**

Compute a transitive closure of global dependencies during static analysis:
```typescript
// After collecting globalDepsUsed, expand it to include transitive global deps
const transitiveGlobalDeps = computeTransitiveGlobalDeps(globalDepsUsed, appGlobalNames);
if (node.uses === undefined && transitiveGlobalDeps.size > 0) {
  node.computedGlobalUses = Array.from(transitiveGlobalDeps).sort();
}

function computeTransitiveGlobalDeps(directGlobals: Set<string>, appGlobalNames: ReadonlySet<string>): Set<string> {
  const visited = new Set<string>();
  const toExpand = Array.from(directGlobals);
  
  while (toExpand.length > 0) {
    const current = toExpand.pop()!;
    if (visited.has(current)) continue;
    visited.add(current);
    
    // (Need access to global definitions to extract dependencies)
    // If global 'x' depends on global 'y', add 'y' to toExpand
  }
  return visited;
}
```

**Test case:**
```typescript
it("global depending on another global is included in computedGlobalUses", () => {
  const root = {
    globalVars: {
      y: 10,
      x: "y + 1",
    },
    children: [
      { type: "Text", props: { text: "{x}" } }
    ],
  };
  computeUsesForTree(root, metadataLookup, new Set(["x", "y"]));
  // expect(root.children[0].container?.computedGlobalUses).toContain("y")
});
```

---

## 🟡 LOW Priority

### 5. DONE-document contains duplicated and contradictory content

**File:** [DONE-globalvars-narrowing.md](./DONE-globalvars-narrowing.md)

**Problem:**

The document has two complete versions of the spec:
- **Implemented version** (lines 1–144): Describes the actual implementation using `narrowGlobalVars()`.
- **Duplicate/obsolete version** (lines 193–303): Duplicates the "Problem" section and proposes `extractScopedState(parentGlobalVars, …)` ([line 258](./DONE-globalvars-narrowing.md#L258)) — a different approach than actually implemented.

This is likely the body of the deleted `TODO-globalvars-narrowing.md` (visible in git diff: `D xmlui/src/components-core/optimization/specs/TODO-globalvars-narrowing.md`), pasted in without cleanup.

**Impact:**

- Future readers will be confused about which approach is correct.
- The document contradicts itself.

**Fix:**

Delete lines ~193–303 (everything after "Related" section). Keep only the "What Was Implemented" version.

---

### 6. `narrowGlobalVars` scans all globals on every `globalVars` change

**File:** [ComponentWrapper.tsx:103–110](../../rendering/ComponentWrapper.tsx#L103-L110)

**Problem:**

```typescript
const scopedGlobalVars = useShallowCompareMemoize(
  useMemo(
    () =>
      nodeComputedGlobalUses && globalVars
        ? narrowGlobalVars(globalVars, nodeComputedGlobalUses)
        : globalVars,
    [globalVars, nodeComputedGlobalUses],
  ),
);
```

`narrowGlobalVars` does `Object.entries(vars)` (full scan) whenever `globalVars` changes — e.g., on every global mutation or timer tick. `useShallowCompareMemoize` prevents the **re-render**, but not the **scan itself**.

For each narrowed container in the tree, this is O(#globals) work on each global mutation.

**Impact:**

Low in practice, because:
1. `useShallowCompareMemoize` breaks the re-render chain.
2. The scan is fast for typical global counts (< 100).

But if a component tree has many narrowed containers and a hot-path loop mutates globals, this could accumulate.

**Optional optimization:**

Precompute the set of function keys at startup (since they're always forwarded):
```typescript
function narrowGlobalVars(vars, uses, functionKeys?) {
  const result = {};
  for (const [key, value] of Object.entries(vars)) {
    if (key.startsWith("__tree_")) {
      const varName = key.slice(7);
      if (usesSet.has(varName)) result[key] = value;
    } else if (functionKeys?.has(key) || typeof value === "function") {
      result[key] = value;
    } else if (usesSet.has(key)) {
      result[key] = value;
    }
  }
  return result;
}
```

Not urgent; mentioned for completeness.

---

## Summary Table

| # | Severity | Title | File | Action |
|---|----------|-------|------|--------|
| 1 | 🔴 HIGH | Missing `safeToNarrow` gate | computedUses.ts:541 | **Add guard** |
| 2 | 🟠 MEDIUM | No unit tests for `narrowGlobalVars` | ContainerUtils.ts:271 | **Add tests** |
| 3 | 🟠 MEDIUM | No render-count regression test | computedUses.test.ts | **Add E2E** |
| 4 | 🟠 MEDIUM | No transitive global dep closure | computedUses.ts:483 | **Add closure logic + test** |
| 5 | 🟡 LOW | Duplicate/contradictory doc content | DONE-globalvars-narrowing.md | **Clean up** |
| 6 | 🟡 LOW | Repeated scans on global mutation | ComponentWrapper.tsx:106 | Optional: precompute functions |

---

## Recommended Action Plan

**Block-list (must fix before merge):**
- [ ] **#1:** Add `safeToNarrow` gate to `node.computedGlobalUses` assignment.
- [ ] **#2:** Add unit tests for `narrowGlobalVars()` in `ContainerUtils.test.ts`.
- [ ] **#5:** Remove duplicate content from DONE-doc (lines 193–303).

**Nice-to-have (post-merge):**
- [ ] **#3:** Add E2E render-count regression test.
- [ ] **#4:** Compute and test transitive global dependencies.
- [ ] **#6:** Profile and consider precomputing function-key set.


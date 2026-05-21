# DONE: Mandatory Containers for Heavy Components (Implemented)

## 1. Executive Summary

We have implemented **Mandatory Shielding** for heavy components (`Select`, `List`, `Table`, `DataGrid`). These components are now always promoted to `StateContainers` (implicit containers) regardless of whether they have active read dependencies. This ensures they always have a `React.memo` performance shield, protecting them from unnecessary parent re-renders.

During implementation, we encountered and fixed a regression where non-heavy components (like `HStack`) were accidentally promoted, causing sibling API visibility issues. The final logic strictly limits unconditional promotion to the `IMPLICIT_CONTAINER_COMPONENT_NAMES` list.

---

## 2. The 5 Scenarios of "Accidental Un-shielding" (Resolved)

Based on deep analysis of `computedUses.ts`, a heavy component previously became "naked" (lost its container) in these 5 scenarios:

### Scenario A: Write-Only Targets
We filter out assignment targets from read dependencies to avoid triggering re-renders when a component only writes data.
*   **Result (FIXED):** The component is now unconditionally promoted because it's in the heavy list.

### Scenario B: Dynamic Variables (`$context`)
We filter `$context` out of `nonDynamicReadDeps` because promoting a generic container solely on `$context` caused sibling API visibility bugs.
*   **Result (FIXED):** Mandatory shielding ensures the container exists; `$context` is still included in `computedUses` for reactivity, but the promotion trigger is now type-based.

### Scenario C: Data Fetch Handlers (`$queryParams`)
We filter injected variables in `onFetch` (Bug 21 fix) so they don't shadow global router state.
*   **Result (FIXED):** Mandatory shielding ensures the shield remains even after `onFetch` filters apply.

### Scenario D: Built-in Globals
We filter `Math`, `setTimeout`, etc.
*   **Result (FIXED):** Shield remains.

### Scenario E: Completely Static
*   **Code:** `<Select options="['A', 'B']" />`
*   **Result (FIXED):** 0 dependencies found, but `computedUses` is set to `[]` (plus escaping children) to build the shield.

---

## 3. The Flaw in the Promotion Logic (Fixed)

Previously, `computedUses.ts` linked two completely different concepts:
1.  **State Scoping:** What variables need to be passed down to this component?
2.  **Performance Shielding:** Should this component be wrapped in a `React.memo` boundary?

The logic was: *If there is nothing to pass down (due to filters), do not build the shield.*
This was a fatal flaw for Heavy Components. We now decouple these: we build the shield for heavy components **regardless of what is passed down.**

---

## 4. Implementation: Decouple Shielding from Scoping

We enforced **Mandatory Shielding** for any component listed in `IMPLICIT_CONTAINER_COMPONENT_NAMES`.

### Code Adjustment implemented in `computedUsesInternal`:

```typescript
  // NOTE: Heavy components (Select, List, Table, DataGrid) are ALWAYS promoted
  // to implicit containers to ensure they have a React.memo shield, protecting
  // them from unnecessary parent re-renders even if they have no read deps.
  const isHeavy = IMPLICIT_CONTAINER_COMPONENT_NAMES.has(node.type);
  const isImplicitDefault = isHeavy; // Heavy components are always containers
  const isContainer = isKnownContainer || isImplicitDefault;

  if (isContainer) {
    // ...
    // Guard narrowing on (nonDynamicReadDeps || isHeavy): we want to set
    // computedUses for heavy components even if they have no dynamic deps
    // to ensure they have a performance shield.
    if (node.uses === undefined && (nonDynamicReadDeps.size > 0 || isHeavy) && safeToNarrow) {
        // ...
    }
}
```

### Why this works:
*   By forcing `isImplicitDefault = true` for `isHeavy`, we guarantee the creation of the `StateContainer`.
*   By forcing the assignment to `node.computedUses`, we ensure `extractScopedState` receives a strict array.
*   If a `<Select>` is completely static and has no children with UIDs, `computedUses` becomes `[]`. It receives `{}` state. The shield works perfectly (O(1) memoization check against an empty object).

---

## 5. Related context: the "static analysis vs runtime reality" family

### Comparison

| Aspect | This TODO ("Filtered Shield") | Бaг 24 / Invariant #22 | Бaг 25 / Static vs Runtime Types |
|---|---|---|---|
| Trigger | AST filters (write-only, `$context`, fetch-injected, JS globals, fully static) strip read-deps to 0 | `CompoundComponent` moves `vars`/`loaders`/`functions` out of the compound body into a freshly created outer Container at runtime | Runtime or test utils inject `Symbol` UIDs into the tree, conflicting with static `string`-based AST assumptions |
| Effect | Heavy component is not promoted to a container → no `React.memo` shield → over-rendering | Compound body keeps a pre-computed `computedUses` that excluded its now-hoisted vars → `extractScopedState` filters those vars OUT of `parentState` → inner reads return `undefined` | Crash (`TypeError`) when `Array.prototype.sort()` tries to implicitly convert a `Symbol` to a string |
| Class | Performance correctness | State / scoping correctness | Type safety / Execution correctness |
| Fix shape | Decouple shielding from scoping: heavy nodes must always get `computedUses` (even `[]`) | Strip stale `computedUses` from any subtree the runtime moves into a new parent (currently the `rest` spread in `CompoundComponent.tsx`) | Explicitly filter non-string values (`Symbol`) from arrays meant for expression evaluation, and update TypeScript types to reflect runtime reality (`string \| symbol`) |
| Status | ✅ Implemented | Fixed in `CompoundComponent.tsx`; regression unit + e2e tests in place | Fixed in `computedUses.ts`; regression unit test in place |

### Shared design rule

`computedUses` is a snapshot of a node's relationship to its position in the tree at the moment of analysis. Any mechanism that:
1. Decides whether a node is a container (this TODO's concern), or
2. Moves a node between parents (Бaг 24's concern), or
3. Adds/removes `localDeclared` names of an ancestor at runtime (potential future concern), or
4. Blurs the line between static AST properties (`string`) and runtime identifiers (`Symbol`) (Бaг 25's concern),

must either invalidate the affected snapshots, recompute them, or be robust against type mismatches. Hardcoding either decision (shield-or-not, position-in-tree) into a static array that the runtime treats as authoritative is fragile by construction — the cure is explicit invalidation points, type safety checks, not implicit trust.

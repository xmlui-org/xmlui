# TODO: The "Filtered Shield" Problem (Mandatory Containers for Heavy Components)

## 1. Executive Summary

In our quest to fix various bugs related to state scoping, we introduced aggressive filtering rules in `computedUses.ts`. We filter out specific identifiers so they don't corrupt the scoping boundary (e.g., filtering `$queryParams` in `fetch` handlers so it doesn't shadow router state).

However, this filtering has a **critical unintended side-effect**: it reduces a component's `nonDynamicReadDeps` count to 0. 
Because the current architecture only promotes "heavy components" (`Select`, `List`, `DataGrid`, etc.) to `StateContainers` if `nonDynamicReadDeps.size > 0`, our bug-fix filters are accidentally **stripping heavy components of their `React.memo` performance shields**. 

When a heavy component loses its container, it receives the *entire* `parentState` and re-renders on *every single parent update*, destroying application performance.

---

## 2. The 5 Scenarios of "Accidental Un-shielding"

Based on deep analysis of `computedUses.ts`, a heavy component becomes "naked" (loses its container) in these 5 scenarios:

### Scenario A: Write-Only Targets
We filter out assignment targets from read dependencies to avoid triggering re-renders when a component only writes data.
*   **Code:** `<Select onChange="myVar = $event" />`
*   **Result:** `myVar` is filtered from `reads`. `nonDynamicReadDeps` is 0. 
*   **Side-effect:** The `Select` is not a container. It re-renders constantly.

### Scenario B: Dynamic Variables (`$context`)
We filter `$context` out of `nonDynamicReadDeps` because promoting a generic container solely on `$context` caused sibling API visibility bugs.
*   **Code:** `<List data="{$context.items}" />`
*   **Result:** `$context` is filtered. `nonDynamicReadDeps` is 0.
*   **Side-effect:** The `List` loses its container and re-renders on every parent tick.

### Scenario C: Data Fetch Handlers (`$queryParams`)
We filter injected variables in `onFetch` (Bug 21 fix) so they don't shadow global router state.
*   **Code:** `<DataGrid onFetch="... uses $queryParams ..." />`
*   **Result:** `$queryParams` is filtered. `nonDynamicReadDeps` is 0.
*   **Side-effect:** The `DataGrid` loses its container shield.

### Scenario D: Built-in Globals
We filter `Math`, `setTimeout`, etc.
*   **Code:** `<Select label="{Math.PI}" />`
*   **Result:** `Math` is filtered.
*   **Side-effect:** The `Select` loses its container shield.

### Scenario E: Completely Static
*   **Code:** `<Select options="['A', 'B']" />`
*   **Result:** 0 dependencies found.
*   **Side-effect:** The `Select` loses its container shield.

---

## 3. The Flaw in the Promotion Logic

Currently, `computedUses.ts` links two completely different concepts:
1.  **State Scoping:** What variables need to be passed down to this component?
2.  **Performance Shielding:** Should this component be wrapped in a `React.memo` boundary?

The logic says: *If there is nothing to pass down (due to filters), do not build the shield.*
This is a fatal flaw. For Heavy Components, **we want the shield regardless of what is passed down.** 

If `computedUses === undefined` (which happens when the promotion fails), `StateContainer` falls back to passing the *entire* parent state down, which forces a re-render every time *any* sibling state changes.

---

## 4. Proposed Solution: Decouple Shielding from Scoping

We must enforce **Mandatory Shielding** for any component listed in `IMPLICIT_CONTAINER_COMPONENT_NAMES`.

### Code Adjustment required in `computedUsesInternal`:

```typescript
// 1. Identify Heavy Components
const isHeavy = IMPLICIT_CONTAINER_COMPONENT_NAMES.has(node.type);

// 2. Promotion must happen if it's heavy, regardless of read deps!
const isImplicitDefault = isHeavy; // REMOVED: && nonDynamicReadDeps.size > 0
const isContainer = isKnownContainer || isImplicitDefault;

if (isContainer) {
    // ... safeToNarrow logic ...

    // 3. For Heavy Components, even if nonDynamicReadDeps is empty, 
    // we MUST assign an array to computedUses so the runtime scopes it.
    // If it's undefined, it gets full parent state (bad).
    if (node.uses === undefined && (nonDynamicReadDeps.size > 0 || isHeavy) && safeToNarrow) {
        const computedUsesSet = dependsOnParentFunction
            ? new Set([...parentDependencies, ...parentFunctionNames])
            : parentDependencies; // Note: parentDependencies still contains write-targets and $context!
            
        // CRITICAL BUG 23 CONSIDERATION:
        // We cannot just assign `[]` if the set is empty, because implicit containers
        // do not own their children's UIDs at runtime (they delegate to explicit owners).
        // If we shield this container, we MUST include its escaping children in the shield
        // to prevent `extractScopedState` from hiding them from descendants.
        if (node.uid) computedUsesSet.add(node.uid);
        if (!isExplicitOwner) {
            for (const uid of childEscapingUIDs) {
                computedUsesSet.add(uid);
            }
        }
        
        node.computedUses = Array.from(computedUsesSet).sort();
    }
}
```

### Why this works:
*   By forcing `isImplicitDefault = true` for `isHeavy`, we guarantee the creation of the `StateContainer`.
*   By forcing the assignment to `node.computedUses`, we ensure `extractScopedState` receives a strict array.
*   If a `<Select>` only has a write-target `myVar = $event`, `parentDependencies` contains `myVar`. `computedUses` becomes `['myVar']`. The shield works perfectly.
*   If a `<List>` only uses `$context`, `parentDependencies` contains `$context`. `computedUses` becomes `['$context']`. The shield works perfectly.
*   If a `<Select>` is completely static and has no children with UIDs, `computedUses` becomes `[]`. It receives `{}` state. The shield works perfectly (O(1) memoization check against an empty object).
*   **The Bug 23 Safety Net:** If a `<DataGrid>` is static but contains a child API (`<Column id="myCol" />`), `computedUses` becomes `["myCol"]`. The shield is built, it protects the DataGrid from parent re-renders, BUT it allows `myCol` to pass through the scope filter so that other components can read `{myCol.visibility}`.

### Conclusion
We successfully fixed state-shadowing bugs via AST filtering, but we must patch the promotion logic so those filters do not strip the performance barriers off heavy UI components. Adding `childEscapingUIDs` ensures that this mandatory shielding does not accidentally isolate child APIs.
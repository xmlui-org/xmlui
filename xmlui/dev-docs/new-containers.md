# Research: Eliminating the `uses` Property

## Current State

**Finding:** A detailed refactoring plan already exists at [refactoring-plan-eliminate-uses.md](refactoring-plan-eliminate-uses.md).

**Key Discovery:** The `uses` property is **not used in production** - only exists in:
- Framework defaults (StandaloneComponent, AppRoot, CompoundComponent)
- Parser validation tests (5 tests total)
- No real applications use it

## What `uses` Does

Controls state inheritance between parent and child containers:

```typescript
// extractScopedState() - StateContainer.tsx:279
if (!uses) return parentState;              // Inherit ALL (current default)
if (uses.length === 0) return EMPTY_OBJECT; // Inherit NONE
return pick(parentState, uses);             // Inherit SPECIFIC keys
```

**Two Locations:**
1. **Downward flow**: Filter parent state passed to child (StateContainer.tsx:78)
2. **Upward propagation**: Control which changes bubble to parent (StateContainer.tsx:214)

## Analysis: Can We Remove It?

### Evidence It's Unnecessary

1. **Zero Production Usage**: No `.xmlui` files use it after 3+ months
2. **Default Works**: Everyone inherits all parent state - no performance issues
3. **No Problem Solved**: Added Sep 2025 without documented issue or benchmarks
4. **Framework Defaults**: Only set `uses: []` where parent is already empty (redundant)

### What Happens Without `uses`

**Current behavior when `uses` is undefined (always in production):**
```typescript
// StateContainer.tsx:78
stateFromOutside = parentState  // Inherit everything

// StateContainer.tsx:214
if (!node.uses || ...) {  // Always true, always propagates
  parentStatePartChanged(...)
}
```

**Removing `uses` makes this explicit:** Always inherit all parent state, always propagate changes.

### Performance Considerations

**Theoretical Concern**: Inheriting all parent state might cause unnecessary re-renders.

**Reality Check**:
- React memoization already optimized (StateContainer uses `useShallowCompareMemoize`)
- Variable resolution uses dependency tracking (only recalculates when dependencies change)
- Container components are memoized (`memo` wrapper)
- No documented performance problems in 3 months of default behavior

**State Composition Cost**:
```typescript
// Current: Always does this anyway since uses is undefined
const stateFromOutside = { ...parentState };  // O(n) shallow copy

// Theoretical "optimized" with uses=['x', 'y']:
const stateFromOutside = pick(parentState, ['x', 'y']);  // O(2) but adds maintenance
```

**Tradeoff**: Save O(n) copy vs. manual dependency tracking burden. Given zero reported performance issues, the O(n) cost is acceptable.

## Recommendation: Remove It

### Rationale

1. **Simplification**: Removes conceptual complexity and 3 code paths
2. **Zero Risk**: Nobody uses it, so nothing breaks
3. **Predictability**: Always inherit all state - simpler mental model
4. **Future Path**: If performance issues arise, add automatic dependency detection

### Implementation Plan

**Phase 1: Runtime Removal** (2-3 days)
1. Remove `uses` from `ComponentDef` type definition
2. Remove `extractScopedState()` function
3. Always use `parentState` directly in `StateContainer`
4. Remove conditional in `statePartChanged()` 
5. Update `isContainerLike()` check
6. Remove from framework defaults (StandaloneComponent, AppRoot, CompoundComponent)

**Phase 2: Parser Removal** (1 day)
1. Remove `uses` attribute parsing
2. Remove `uses` element parsing  
3. Update or remove 5 parser tests

**Phase 3: Documentation** (1 hour)
1. Update containers.md (remove uses section)
2. Remove from component documentation
3. Add note about automatic full inheritance

### Alternative: Keep for Explicit Isolation

If there's concern about removing it completely, consider:

**Keep only `uses="[]"` for explicit isolation**:
- Remove selective inheritance (`uses=['x', 'y']`)
- Keep only opt-out behavior (`uses=[]` = isolate completely)
- Simpler: binary choice (inherit all vs. none)

**Example use case**: Compound components that need complete isolation
```typescript
// CompoundComponent wraps with uses=[] to isolate $props
containerNode: {
  type: "Container",
  uses: EMPTY_ARRAY,  // Don't inherit parent state
  vars: { $props: resolvedProps },
  // ...
}
```

**Analysis**: This is the only legitimate use case, but it's also rare and could be handled differently (explicit isolation flag instead of `uses`).

## Conclusion

**Yes, remove the `uses` property.** 

- It's unused in production
- Default behavior (inherit all) works fine
- Adds complexity without proven value
- Can be removed safely with zero impact

If performance issues arise later, implement automatic dependency detection rather than manual `uses` specification.

**Next Step**: Follow existing refactoring plan in `refactoring-plan-eliminate-uses.md` which provides detailed implementation steps.

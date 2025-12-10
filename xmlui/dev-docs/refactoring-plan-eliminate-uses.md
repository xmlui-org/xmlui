# Refactoring Plan: Eliminate the `uses` Property

**Document Version:** 1.0  
**Created:** December 10, 2024  
**Status:** Planning Phase

## Executive Summary

This document outlines a comprehensive plan to eliminate the `uses` property from XMLUI's container-based state management system and replace it with automatic dependency detection. The `uses` property currently controls which parent state variables are inherited by child containers, but it requires manual specification and creates a maintenance burden for developers.

## Current State Analysis

### What is the `uses` Property?

The `uses` property is an optional array of strings on `ComponentDef` that controls state inheritance from parent containers:

```xml
<!-- Inherit all parent state (default) -->
<Stack><!-- children --></Stack>

<!-- Inherit no parent state -->
<Stack uses="[]"><!-- children --></Stack>

<!-- Inherit specific parent state -->
<Stack uses="['userInfo', 'theme']"><!-- children --></Stack>
```

### Why Does `uses` Exist?

According to the documentation (containers.md), `uses` serves two purposes:

1. **Controls reactive data flow scope** - Limits which parent state is visible to child containers
2. **Prevents unnecessary re-renders** - Child containers don't re-render when unrelated parent state changes

### How `uses` Works Currently

#### 1. **State Scoping in StateContainer**

The `extractScopedState()` function implements the filtering logic:

```typescript
// From StateContainer.tsx line 293
function extractScopedState(
  parentState: ContainerState,
  uses?: string[],
): ContainerState | undefined {
  if (!uses) {
    return parentState;  // Inherit everything (default)
  }
  if (uses.length === 0) {
    return EMPTY_OBJECT;  // Inherit nothing
  }
  return pick(parentState, uses);  // Inherit only specified keys
}
```

Called at line 92:
```typescript
const stateFromOutside = useShallowCompareMemoize(
  useMemo(() => extractScopedState(parentState, node.uses), [node.uses, parentState]),
);
```

#### 2. **State Change Propagation**

When state changes occur via proxy callbacks (line 228):

```typescript
if (!node.uses || node.uses.includes(key)) {
  parentStatePartChanged(pathArray, newValue, target, action);
}
```

This prevents propagating changes to parent for variables not in the `uses` array.

#### 3. **UID Reference Scope**

In Container.tsx (line 645):
```typescript
const uidInfoRef = node.uses === undefined ? parentUidInfoRef : thisUidInfoRef;
```

When `uses` is defined, the container creates its own UID reference scope.

### Where `uses` Appears in Codebase

**Parser & Serialization:**
- `xmlui-parser/transform.ts` (lines 37, 452, 657, 717-720) - Parsing and merging uses declarations
- `xmlui-parser/xmlui-serializer.ts` (lines 324-325) - Serializing uses back to XML

**Container System:**
- `StateContainer.tsx` (lines 92, 228, 293-302) - State scoping and change propagation
- `Container.tsx` (line 645) - UID reference scoping
- `ContainerWrapper.tsx` (lines 73, 149, 180-181, 195) - Container detection and cleanup

**Component Initialization:**
- `CompoundComponent.tsx` (line 72) - Default empty array for compound components
- `StandaloneComponent.tsx` (line 36) - Empty array for root component
- `AppRoot.tsx` (line 78) - Empty array for app root

**Tests:**
- `transform.attr.test.ts` (lines 69-79) - Parser tests for uses attribute
- `transform.element.test.ts` (lines 686-707) - Element-based uses declarations

### Current Usage in Real Code

**Key Finding:** A search through the entire codebase reveals:
- ✅ The infrastructure exists and is well-tested
- ⚠️ **NO actual usage in production .xmlui files**
- ⚠️ **NO usage in documentation examples**
- ✅ Only used in unit tests and default initializations

This suggests the feature was built but never adopted by developers, likely due to:
1. **Developer burden** - Requires manual tracking of dependencies
2. **Maintenance overhead** - Must update uses when adding/removing state dependencies
3. **Non-obvious benefits** - Performance impact not immediately visible

## Problem Statement

### Issues with Current Approach

1. **Manual Dependency Management**
   - Developers must explicitly list which parent state variables are needed
   - Easy to forget to update `uses` when adding new dependencies
   - No compile-time or runtime warnings when dependencies are missing

2. **Maintenance Burden**
   - Refactoring parent components requires updating `uses` in all children
   - Removing a variable from parent requires finding all `uses` references
   - Creates coupling between parent and child implementations

3. **Developer Experience**
   - Non-intuitive - developers expect automatic dependency resolution (like React hooks)
   - Documentation admits this is a pain point: "XMLUI is moving toward automatic dependency detection"
   - Requires understanding of container hierarchy to use correctly

4. **Limited Adoption**
   - Zero usage in production code despite full implementation
   - Only used in framework defaults (empty arrays)
   - Suggests the feature doesn't justify its complexity

### Performance Concerns

The documentation claims `uses` "prevents unnecessary re-renders from unrelated parent state changes." However:

- **React's memoization** already prevents re-renders when props don't change
- **XMLUI's useShallowCompareMemoize** provides additional protection
- **Variable dependencies are already tracked** by `collectVariableDependencies()`

The real question: **Does explicit `uses` provide measurable performance benefits over automatic detection?**

## Proposed Solution: Automatic Dependency Detection

### Core Concept

Replace explicit `uses` declarations with automatic dependency analysis:

1. **Static Analysis** - Parse component markup/scripts to detect variable references
2. **Runtime Tracking** - Use existing `collectVariableDependencies()` infrastructure
3. **Smart Scoping** - Only inherit parent state actually referenced in expressions
4. **Selective Re-rendering** - Only re-render when used dependencies change

### How Automatic Detection Would Work

#### Phase 1: Dependency Collection (Already Exists!)

XMLUI already has a sophisticated dependency tracking system:

```typescript
// From StateContainer.tsx - already used for variable resolution
const dependencies = collectVariableDependencies(value.tree, referenceTrackedApi);
```

This function walks the AST of expressions and collects all variable references.

#### Phase 2: Aggregate Dependencies at Container Level

```typescript
// New function to collect all dependencies in a container
function collectContainerDependencies(node: ContainerWrapperDef): Set<string> {
  const deps = new Set<string>();
  
  // Collect from vars
  if (node.vars) {
    Object.values(node.vars).forEach(varDef => {
      if (isParsedValue(varDef)) {
        collectVariableDependencies(varDef.tree, {}).forEach(dep => deps.add(dep));
      }
    });
  }
  
  // Collect from contextVars
  if (node.contextVars) {
    Object.values(node.contextVars).forEach(contextVar => {
      // Parse and collect dependencies from context variable expressions
    });
  }
  
  // Collect from children recursively
  if (node.children) {
    node.children.forEach(child => {
      // Collect dependencies from child expressions (props, events, etc.)
    });
  }
  
  return deps;
}
```

#### Phase 3: Replace extractScopedState

```typescript
// New implementation - automatic scoping
function extractScopedState(
  parentState: ContainerState,
  containerDependencies: Set<string>,
): ContainerState {
  if (containerDependencies.size === 0) {
    return EMPTY_OBJECT;
  }
  
  // Only pick the dependencies actually referenced
  return pick(parentState, Array.from(containerDependencies));
}
```

#### Phase 4: Optimize Re-rendering

The key insight: **We don't need to re-compute dependencies on every render** because they're derived from the static component definition.

```typescript
// Memoize dependency collection
const containerDeps = useMemo(
  () => collectContainerDependencies(node),
  [node]  // Only recompute if node definition changes
);

const stateFromOutside = useShallowCompareMemoize(
  useMemo(
    () => extractScopedState(parentState, containerDeps),
    [containerDeps, parentState]
  ),
);
```

### Benefits of Automatic Detection

1. **Zero Developer Burden** - No manual dependency management
2. **Always Correct** - Dependencies automatically reflect actual usage
3. **Refactor-Friendly** - Adding/removing variables just works
4. **Better DX** - Matches expectations from React/Vue/modern frameworks
5. **Same Performance** - Dependency-based scoping still happens, just automatically

### Potential Challenges

1. **Dynamic Property Access**
   - `parentState[dynamicKey]` - can't statically determine which keys are accessed
   - **Solution:** Conservative approach - if dynamic access is detected, inherit all parent state

2. **Spread Operators**
   - `{ ...parentState }` - explicitly accessing all state
   - **Solution:** Detect spread syntax and inherit all parent state

3. **Function Calls with State**
   - `someFunction(parentState)` - function might access any property
   - **Solution:** Track function implementations and analyze them too

4. **Backwards Compatibility**
   - Existing `uses` declarations in tests
   - **Solution:** Deprecation period - `uses` overrides automatic detection during transition

## Refactoring Plan

### Phase 1: Preparation & Analysis (Week 1-2)

#### 1.1 Create Performance Baseline
- [ ] Write performance benchmarks for container rendering
- [ ] Measure re-render frequency with current `uses` implementation
- [ ] Create test apps with various container hierarchies
- [ ] Document performance metrics (render time, memory usage)

**Deliverable:** Performance benchmark suite + baseline metrics document

#### 1.2 Enhance Dependency Collection
- [ ] Audit `collectVariableDependencies()` for completeness
- [ ] Add support for dynamic property access detection
- [ ] Add support for spread operator detection
- [ ] Handle edge cases (optional chaining, nullish coalescing, etc.)

**Deliverable:** Enhanced dependency collector with 100% test coverage

#### 1.3 Create Container Dependency Aggregator
- [ ] Implement `collectContainerDependencies()` function
- [ ] Walk component tree and aggregate all variable references
- [ ] Handle nested children and slots
- [ ] Support loaders and contextVars

**Deliverable:** Working aggregator with unit tests

### Phase 2: Core Implementation (Week 3-4)

#### 2.1 Update StateContainer
- [ ] Add automatic dependency collection to StateContainer
- [ ] Replace `extractScopedState()` call with automatic version
- [ ] Keep `uses` as optional override for backwards compatibility
- [ ] Add logging to track automatic vs manual scoping

**Deliverable:** Updated StateContainer with feature flag

#### 2.2 Update State Change Propagation
- [ ] Update proxy callback logic to use automatic dependencies
- [ ] Remove `node.uses.includes(key)` check
- [ ] Add dependency-based filtering in change propagation

**Deliverable:** Updated state change system

#### 2.3 Update Container.tsx
- [ ] Update UID reference scoping logic
- [ ] Replace `node.uses === undefined` check with automatic detection
- [ ] Ensure consistent behavior across all container types

**Deliverable:** Updated Container component

### Phase 3: Testing & Validation (Week 5-6)

#### 3.1 Update Existing Tests
- [ ] Update parser tests to handle automatic mode
- [ ] Keep `uses` tests but mark as legacy
- [ ] Add tests for automatic dependency detection
- [ ] Verify E2E tests pass without modification

**Deliverable:** All existing tests passing

#### 3.2 Create New Test Suite
- [ ] Test automatic detection with various expression types
- [ ] Test dynamic property access scenarios
- [ ] Test spread operator scenarios
- [ ] Test nested container hierarchies
- [ ] Test performance vs manual `uses`

**Deliverable:** Comprehensive automatic detection test suite

#### 3.3 Real-World Testing
- [ ] Test with docs site (built mode)
- [ ] Test with example standalone apps (buildless mode)
- [ ] Test with extensions
- [ ] Verify no performance regressions

**Deliverable:** Real-world validation report

### Phase 4: Migration & Deprecation (Week 7-8)

#### 4.1 Deprecation Warning System
- [ ] Add console warning when `uses` is explicitly set
- [ ] Add linting rule to discourage `uses`
- [ ] Update parser to mark `uses` as deprecated

**Deliverable:** Deprecation warning system

#### 4.2 Documentation Updates
- [ ] Update containers.md to remove `uses` documentation
- [ ] Add migration guide for existing `uses` code (if any found)
- [ ] Update component metadata to mark `uses` as deprecated
- [ ] Add "How It Works" section explaining automatic detection

**Deliverable:** Updated documentation

#### 4.3 Remove `uses` from Defaults
- [ ] Remove `uses: []` from CompoundComponent.tsx
- [ ] Remove `uses: []` from StandaloneComponent.tsx  
- [ ] Remove `uses: []` from AppRoot.tsx
- [ ] Update component templates

**Deliverable:** Clean default initialization

### Phase 5: Cleanup & Finalization (Week 9-10)

#### 5.1 Performance Analysis
- [ ] Re-run performance benchmarks
- [ ] Compare automatic vs manual scoping
- [ ] Document any performance differences
- [ ] Optimize if needed

**Deliverable:** Performance comparison report

#### 5.2 Code Cleanup (Optional - for future major version)
- [ ] Remove `uses` from ComponentDef interface
- [ ] Remove `extractScopedState()` legacy path
- [ ] Remove parser support for `uses` attribute
- [ ] Remove serializer support for `uses`
- [ ] Remove all `uses` tests

**Deliverable:** Fully cleaned codebase (breaking change)

#### 5.3 Release
- [ ] Update CHANGELOG with breaking changes (if applicable)
- [ ] Update version number following semver
- [ ] Create migration guide
- [ ] Announce on documentation site

**Deliverable:** Released version

## Testing Strategy

### Before Refactoring Tests

These tests establish the baseline behavior that must be preserved:

#### Test Suite 1: State Inheritance Behavior
```typescript
describe('State Inheritance - Baseline', () => {
  test('child container inherits parent state by default', async () => {
    // <Stack var.x="parent value">
    //   <Stack var.y="{x}">
    //     <Text testId="result">{y}</Text>
    // Verify child can access parent variable x
  });
  
  test('child with uses=[] inherits nothing', async () => {
    // <Stack var.x="parent value">
    //   <Stack uses="[]" var.y="{x}">
    // Verify x is undefined in child
  });
  
  test('child with uses=["x"] inherits only x', async () => {
    // <Stack var.x="x value" var.z="z value">
    //   <Stack uses="['x']" var.y="{x}">
    // Verify child has x but not z
  });
  
  test('child without uses inherits component APIs', async () => {
    // <Stack>
    //   <Button id="btn" />
    //   <Stack var.ref="{btn}">
    // Verify child can access btn component API
  });
});
```

#### Test Suite 2: Re-rendering Behavior
```typescript
describe('Re-rendering - Baseline', () => {
  test('child re-renders when used parent state changes', async () => {
    // Track render count
    // Change parent variable referenced in child
    // Verify child re-rendered
  });
  
  test('child with uses=["x"] does NOT re-render when y changes', async () => {
    // <Stack var.x="1" var.y="1">
    //   <Stack uses="['x']">
    // Change y, verify child didn't re-render
  });
  
  test('child without uses re-renders on any parent change', async () => {
    // This establishes current (potentially inefficient) behavior
  });
});
```

#### Test Suite 3: State Change Propagation
```typescript
describe('State Change Propagation - Baseline', () => {
  test('child mutation propagates to parent when var in uses', async () => {
    // <Stack var.obj="{count: 0}">
    //   <Stack uses="['obj']">
    //     <Button onClick="obj.count++">
    // Verify parent sees change
  });
  
  test('child mutation does NOT propagate when var not in uses', async () => {
    // <Stack var.obj="{count: 0}">
    //   <Stack uses="[]">
    //     <Button onClick="obj.count++">  // Should this even work?
    // Document current behavior
  });
});
```

#### Test Suite 4: Performance Baseline
```typescript
describe('Performance - Baseline', () => {
  test('measure render time with deep container hierarchy', async () => {
    // Create 10-level deep containers with many variables
    // Measure initial render time
  });
  
  test('measure re-render time with scoped uses', async () => {
    // Setup containers with uses=["specific"]
    // Change unrelated parent state
    // Measure time
  });
  
  test('measure re-render time without uses', async () => {
    // Same setup but no uses
    // Compare to previous test
  });
  
  test('measure memory usage', async () => {
    // Track container state size
    // With and without uses scoping
  });
});
```

### After Refactoring Tests

These tests verify automatic detection works correctly:

#### Test Suite 5: Automatic Dependency Detection
```typescript
describe('Automatic Dependency Detection', () => {
  test('auto-detects simple variable reference', async () => {
    // <Stack var.x="value">
    //   <Stack var.y="{x}">
    // Verify automatic scoping includes x
  });
  
  test('auto-detects nested property access', async () => {
    // <Stack var.obj="{a: {b: 'value'}}">
    //   <Stack var.y="{obj.a.b}">
    // Verify automatic scoping includes obj
  });
  
  test('auto-detects dependencies in expressions', async () => {
    // <Stack var.x="1" var.y="2" var.z="3">
    //   <Stack var.result="{x + y}">
    // Verify automatic scoping includes x and y, excludes z
  });
  
  test('auto-detects dependencies in event handlers', async () => {
    // <Stack var.count="0">
    //   <Stack>
    //     <Button onClick="count++">
    // Verify automatic scoping includes count
  });
  
  test('handles dynamic property access conservatively', async () => {
    // <Stack var.obj="{...}">
    //   <Stack var.key="'prop'" var.value="{obj[key]}">
    // Verify entire obj is included (conservative)
  });
  
  test('handles spread operator', async () => {
    // <Stack var.x="1" var.y="2">
    //   <Stack var.merged="{...parentState}">
    // Verify all parent state included
  });
});
```

#### Test Suite 6: Automatic Re-rendering
```typescript
describe('Automatic Re-rendering', () => {
  test('child re-renders ONLY when referenced state changes', async () => {
    // <Stack var.x="1" var.y="2" var.z="3">
    //   <Stack var.result="{x + y}">
    // Change z, verify child did NOT re-render
    // Change x, verify child DID re-render
  });
  
  test('performance matches manual uses', async () => {
    // Compare automatic detection performance to manual uses
    // Should be equivalent or better
  });
});
```

#### Test Suite 7: Backwards Compatibility
```typescript
describe('Backwards Compatibility', () => {
  test('explicit uses still works during deprecation', async () => {
    // <Stack var.x="1" var.y="2">
    //   <Stack uses="['x']" var.z="{y}">
    // Verify uses takes precedence over automatic detection
    // Verify y is undefined (respects explicit uses)
  });
  
  test('empty uses=[] still blocks inheritance', async () => {
    // Verify uses=[] overrides automatic detection
  });
});
```

#### Test Suite 8: Edge Cases
```typescript
describe('Edge Cases', () => {
  test('handles circular dependencies gracefully', async () => {
    // If variable A depends on B which depends on A
  });
  
  test('handles optional chaining', async () => {
    // <Stack var.obj="{maybeNull}">
    //   <Stack var.value="{obj?.prop?.nested}">
  });
  
  test('handles nullish coalescing', async () => {
    // <Stack var.x="null" var.y="undefined">
    //   <Stack var.value="{x ?? y ?? 'default'}">
  });
  
  test('handles function calls', async () => {
    // <Stack var.fn="{() => x + y}">
    //   <Stack var.result="{fn()}">
  });
});
```

## Implementation Details

### Key Files to Modify

#### High Priority (Core Logic)
1. **StateContainer.tsx** - Main state management, dependency detection
2. **collectFnVarDeps.ts** - Enhance dependency collection
3. **visitors.ts** - Update AST walking for comprehensive dependency tracking

#### Medium Priority (Integration)
4. **Container.tsx** - Update UID scoping logic
5. **ContainerWrapper.tsx** - Update container detection
6. **reducer.ts** - Update state change propagation

#### Low Priority (Cleanup)
7. **transform.ts** - Mark `uses` as deprecated
8. **xmlui-serializer.ts** - Handle deprecated `uses` in serialization
9. **ComponentDefs.ts** - Update type definitions

### API Changes

#### Public APIs (Breaking Changes in Major Version)
```typescript
// BEFORE
interface ComponentDefCore {
  uses?: string[];  // Manual dependency specification
}

// AFTER (Major version)
interface ComponentDefCore {
  // uses property removed entirely
}
```

#### Internal APIs (Non-Breaking)
```typescript
// NEW: Automatic dependency collection
function collectContainerDependencies(
  node: ContainerWrapperDef
): Set<string>;

// MODIFIED: extractScopedState signature
function extractScopedState(
  parentState: ContainerState,
  dependencies: Set<string> | undefined  // Changed from uses?: string[]
): ContainerState | undefined;
```

### Migration Path for Consumers

**Current Reality:** No migration needed! Search results show:
- ❌ Zero `.xmlui` files use `uses` in production
- ❌ Zero documentation examples use `uses`
- ✅ Only test files and framework defaults

**If `uses` were actually used (theoretical):**

```xml
<!-- BEFORE (manual) -->
<Stack var.x="1" var.y="2" var.z="3">
  <Stack uses="['x', 'y']" var.result="{x + y}">
    <Text>{result}</Text>
  </Stack>
</Stack>

<!-- AFTER (automatic) -->
<Stack var.x="1" var.y="2" var.z="3">
  <Stack var.result="{x + y}">
    <!-- uses removed - automatically detects x and y are needed -->
    <Text>{result}</Text>
  </Stack>
</Stack>
```

## Risk Assessment

### High Risk Items
- **Performance Regression** - Automatic detection might be slower than explicit scoping
  - **Mitigation:** Thorough benchmarking, memoization of dependencies
  
- **Subtle Behavior Changes** - Edge cases where automatic detection differs from manual
  - **Mitigation:** Comprehensive test suite, gradual rollout

### Medium Risk Items
- **Dynamic Access Patterns** - Can't statically analyze `obj[dynamicKey]`
  - **Mitigation:** Conservative fallback (inherit all parent state)
  
- **Complex Expressions** - Might miss dependencies in complex nested expressions
  - **Mitigation:** Enhance `collectVariableDependencies()` to handle all cases

### Low Risk Items
- **Breaking Changes** - Few to no consumers actually use `uses`
  - **Mitigation:** Deprecation warnings, documentation

## Success Criteria

### Must Have
- ✅ All existing tests pass
- ✅ No performance regression (< 5% slower than manual `uses`)
- ✅ Automatic detection handles 100% of current use cases
- ✅ Documentation updated to remove `uses`

### Should Have
- ✅ Performance improvement in typical scenarios
- ✅ Comprehensive test coverage for automatic detection
- ✅ Migration guide (even though likely not needed)
- ✅ Deprecation warnings in place

### Nice to Have
- ✅ Performance improvements from better scoping
- ✅ Developer testimonials about improved DX
- ✅ Blog post explaining the improvement

## Timeline

**Estimated Duration:** 8-10 weeks (can be parallelized)

- **Week 1-2:** Preparation & Analysis
- **Week 3-4:** Core Implementation
- **Week 5-6:** Testing & Validation
- **Week 7-8:** Migration & Deprecation
- **Week 9-10:** Cleanup & Release

**Milestone Checkpoints:**
- ✅ Week 2: Performance baseline established
- ✅ Week 4: Feature flag implementation complete
- ✅ Week 6: All tests passing
- ✅ Week 8: Deprecation warnings active
- ✅ Week 10: Release candidate ready

## Open Questions

1. **Should we support opt-out for edge cases?**
   - Some developers might want explicit control
   - Could keep `uses` as an escape hatch even after automatic detection

2. **How aggressive should automatic scoping be?**
   - Conservative (inherit more than needed) vs Strict (only detected dependencies)
   - Trade-off: Correctness vs Performance

3. **Should we log/report unused parent state?**
   - Could help identify optimization opportunities
   - Might be noisy in large applications

4. **Should this be a major version bump?**
   - Technically breaking if `uses` is removed from interface
   - But practically, no one uses it

5. **Should we build tooling to detect `uses` usage?**
   - CLI tool to scan codebase for `uses`
   - IDE plugin to suggest automatic migration

## References

### Documentation
- `containers.md` - Current state management documentation
- `standalone-app.md` - Application bootstrapping and rendering

### Key Source Files
- `xmlui/src/components-core/rendering/StateContainer.tsx` - State container implementation
- `xmlui/src/components-core/rendering/Container.tsx` - Container component
- `xmlui/src/components-core/script-runner/visitors.ts` - Dependency collection
- `xmlui/src/abstractions/ComponentDefs.ts` - Component type definitions

### Related Issues/PRs
- (To be added as work progresses)

## Conclusion

Eliminating the `uses` property will:
- ✅ **Improve Developer Experience** - No manual dependency management
- ✅ **Reduce Maintenance Burden** - Dependencies always correct
- ✅ **Match Modern Expectations** - Automatic like React hooks
- ✅ **Maintain Performance** - Dependency-based scoping preserved
- ✅ **Low Risk** - Virtually no existing usage to migrate

The infrastructure for automatic detection already exists (`collectVariableDependencies()`). This refactoring primarily involves:
1. Aggregating dependencies at the container level
2. Replacing manual scoping with automatic scoping
3. Ensuring performance characteristics are maintained

**Recommendation:** Proceed with refactoring. The benefits significantly outweigh the risks, especially given zero production usage of the `uses` property.

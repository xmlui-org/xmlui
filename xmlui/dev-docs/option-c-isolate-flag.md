# Option C: Replace `uses` with `isolate` Boolean Flag

## Current Implementation

### `uses` Property Behavior
```typescript
uses?: string[]  // In ComponentDefs.ts

// Three states:
// 1. undefined → inherit all parent state (default)
// 2. []       → inherit nothing (isolation)
// 3. ['x','y'] → inherit only x and y (selective - NEVER USED)
```

### Production Usage
**Only one place uses `uses` in production:**
- [CompoundComponent.tsx](xmlui/src/components-core/rendering/CompoundComponent.tsx#L72): `uses: EMPTY_ARRAY` for isolation

### Current Implementation Points

1. **extractScopedState() - StateContainer.tsx:279-290**
```typescript
const extractScopedState = (parentState: any, uses?: string[]) => {
  if (!uses) {
    return parentState;  // inherit all
  }
  if (uses.length === 0) {
    return EMPTY_OBJECT;  // isolation
  }
  return pick(parentState, uses);  // selective (never used)
};
```

2. **State composition - StateContainer.tsx:78**
```typescript
extractScopedState(parentState, node.uses)
```

3. **State propagation - StateContainer.tsx:214**
```typescript
if (!node.uses || node.uses.includes(key)) {
  propagateToParent(key, value);
}
```

4. **Container wrapping - ContainerWrapper.tsx:189**
```typescript
uses: node.uses,
```

5. **UID reference decision - Container.tsx:645**
```typescript
const uidInfoRef = node.uses === undefined ? parentUidInfoRef : thisUidInfoRef;
```

## Proposed Solution

### Replace with Binary Flag
```typescript
isolate?: boolean  // In ComponentDefs.ts

// Two states only:
// undefined/false → inherit all parent state (default)
// true            → inherit nothing (isolation)
```

### Changes Required

#### 1. ComponentDefs.ts
```typescript
// OLD
uses?: string[];

// NEW
isolate?: boolean;
```

#### 2. StateContainer.tsx:279-290
```typescript
// OLD (3 branches)
const extractScopedState = (parentState: any, uses?: string[]) => {
  if (!uses) return parentState;
  if (uses.length === 0) return EMPTY_OBJECT;
  return pick(parentState, uses);
};

// NEW (2 branches)
const extractScopedState = (parentState: any, isolate?: boolean) => {
  return isolate ? EMPTY_OBJECT : parentState;
};
```

#### 3. StateContainer.tsx:78
```typescript
// OLD
extractScopedState(parentState, node.uses)

// NEW
extractScopedState(parentState, node.isolate)
```

#### 4. StateContainer.tsx:214
```typescript
// OLD
if (!node.uses || node.uses.includes(key)) {
  propagateToParent(key, value);
}

// NEW
if (!node.isolate) {
  propagateToParent(key, value);
}
```

#### 5. ContainerWrapper.tsx:174
```typescript
// OLD
delete wrappedNode.uses;

// NEW
delete wrappedNode.isolate;
```

#### 6. ContainerWrapper.tsx:189
```typescript
// OLD
uses: node.uses,

// NEW
isolate: node.isolate,
```

#### 7. Container.tsx:645
```typescript
// OLD
const uidInfoRef = node.uses === undefined ? parentUidInfoRef : thisUidInfoRef;

// NEW
const uidInfoRef = node.isolate ? thisUidInfoRef : parentUidInfoRef;
```

#### 8. CompoundComponent.tsx:72
```typescript
// OLD
containerNode: {
  type: "Container",
  uses: EMPTY_ARRAY,
  ...
}

// NEW
containerNode: {
  type: "Container",
  isolate: true,
  ...
}
```

## Benefits

1. **Simpler Semantics**: Binary choice clearer than 3-way array logic
2. **Remove Dead Code**: Eliminates unused selective inheritance (`pick()` logic)
3. **Clearer Intent**: `isolate: true` vs `uses: []` is more explicit
4. **No Complexity Tax**: Removes feature (selective inheritance) that's never used
5. **Type Safety**: Boolean simpler than `string[] | undefined`

## Code Removed

1. **pick() function** - No longer needed for selective inheritance
2. **Array length checks** - `uses.length === 0` gone
3. **Array includes checks** - `uses.includes(key)` gone
4. **3-branch logic** - Reduced to simple boolean check

## Simplification Analysis

### Before (uses)
- Type: `string[] | undefined`
- Logic branches: 3 (undefined, empty array, non-empty array)
- Helper functions: `pick()` for selective inheritance
- Checks: Array length, includes, undefined
- Lines of code: ~15

### After (isolate)
- Type: `boolean | undefined`
- Logic branches: 2 (falsy, true)
- Helper functions: None needed
- Checks: Simple boolean
- Lines of code: ~8

**Estimated simplification: ~45%** (from current uses implementation)

## Risk Assessment

### Low Risk
- CompoundComponent is only production user
- Change is straightforward boolean conversion
- No behavioral change for existing isolation use case
- Removes untested/unused selective inheritance code

### Testing Strategy
1. Verify CompoundComponent still isolates state
2. Verify normal containers still inherit state
3. Verify state propagation still works correctly
4. Remove any tests for selective inheritance

## Migration Path

1. Add `isolate` property alongside `uses` (both optional)
2. Update CompoundComponent to use `isolate: true`
3. Update all internal checks to prefer `isolate` over `uses`
4. Remove `uses` property from types and runtime
5. Clean up any `uses`-specific tests
6. Update documentation

## Conclusion

**Option C is the simplest solution:**
- Removes unused feature (selective inheritance)
- Simplifies 3-way choice to binary flag
- Makes intent explicit (`isolate` vs cryptic empty array)
- Achieves ~45% code reduction vs current implementation
- No risk to CompoundComponent functionality

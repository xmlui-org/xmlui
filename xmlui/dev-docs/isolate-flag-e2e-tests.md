# E2E Test Cases for `isolate` Flag

## Test Strategy

Test the new `isolate` boolean flag early to avoid late-stage failures. Focus on:
1. State inheritance behavior (default: inherit all)
2. Isolation behavior (`isolate: true`)
3. CompoundComponent isolation preservation
4. Interaction with existing features (vars, loaders, functions, etc.)

---

## New Test File: `container-isolation.spec.ts`

### Basic Isolation Tests

1. **container with isolate true does not inherit parent state**
   - Parent container defines vars
   - Child container with `isolate: true` cannot access parent vars
   - Verify undefined/error when accessing parent vars

2. **container with isolate false inherits parent state**
   - Parent container defines vars
   - Child container with `isolate: false` (explicit) can access parent vars
   - Verify values match parent

3. **container without isolate inherits parent state (default)**
   - Parent container defines vars
   - Child container with no `isolate` property can access parent vars
   - Verify default behavior matches `isolate: false`

4. **nested containers respect isolation boundaries**
   - Root container with vars
   - Middle container with `isolate: true`
   - Deep container without isolate
   - Deep container should NOT inherit from root (isolation boundary)

5. **state changes in child do not propagate through isolation boundary**
   - Parent container with var
   - Isolated child attempts to modify parent var
   - Verify parent var unchanged (isolation prevents upward propagation)

### Isolation with Container Features

6. **isolated container with own vars works correctly**
   - Isolated container defines its own vars
   - Child components can access isolated container's vars
   - Verify isolation + local state works

7. **isolated container with loaders works correctly**
   - Isolated container with DataSource/loader
   - Verify loader data available within isolated container
   - Verify parent cannot access isolated loader data

8. **isolated container with functions works correctly**
   - Isolated container defines functions
   - Verify functions can be called within isolated container
   - Verify parent cannot call isolated functions

9. **isolated container with api works correctly**
   - Isolated container with API calls
   - Verify API state available within isolated container
   - Verify isolation boundary respected for API state

### Shadowing and Isolation

10. **isolated container can define vars with same name as parent**
    - Parent container with `var.x="parent"`
    - Isolated child with `var.x="child"`
    - Verify child sees "child", parent sees "parent"
    - Verify no conflicts (complete isolation)

11. **non-isolated container shadowing still affects parent**
    - Parent with `var.x="parent"`
    - Non-isolated child with `var.x="child"`
    - Child modifies x
    - Verify shadowing behavior preserved (existing test coverage)

### CompoundComponent Isolation

12. **compound component internals are isolated from parent state**
    - Parent container with vars
    - CompoundComponent usage
    - Verify component internals cannot access parent vars
    - Verify only $props are accessible

13. **compound component props work with isolated container**
    - CompoundComponent with props
    - Verify $props accessible inside component
    - Verify parent state isolated

14. **nested compound components maintain isolation**
    - CompoundComponent using another CompoundComponent
    - Each should have independent isolation
    - Verify no state leakage between components

15. **compound component children access parent scope correctly**
    - Parent container with vars
    - CompoundComponent with <Slot/>
    - Children passed to component
    - Verify children access parent scope (not component internals)

### Edge Cases

16. **isolation boundary at root level**
    - Root container with `isolate: true`
    - Should work (no parent to isolate from)
    - Verify no errors

17. **deeply nested isolation boundaries**
    - Multiple levels of isolated containers
    - Each isolated container has own state
    - Verify no state leakage across boundaries

18. **isolation with conditional rendering (when property)**
    - Container with `when` condition and `isolate: true`
    - Toggle visibility
    - Verify isolation maintained on re-mount

19. **isolation with dynamic container creation**
    - ForEach creating isolated containers
    - Each iteration should be isolated
    - Verify no cross-iteration state access

20. **isolation does not affect UID propagation**
    - Isolated container with inputs/components
    - Parent should still access component UIDs (existing behavior)
    - Verify UID resolution works correctly

---

## Tests to Update in Existing Files

### `compound-component.spec.ts`

**No changes needed** - All existing tests should pass as-is because:
- CompoundComponent implementation changes from `uses: []` to `isolate: true`
- Behavior remains identical
- All 32 existing tests validate isolation implicitly

**Verify these critical tests still pass:**
- "props work with compound components" (props isolation)
- "can't overwrite $props" (props immutability)
- "$this works in compound components" (scope boundaries)
- "$self works in compound components" (component scope)

### `state-var-scopes.spec.ts`

**No changes needed** - Tests validate shadowing, not isolation:
- "vars shadowing works" 
- "inner input is available in the file"
- "inner datasource is available in the file"

These test inheritance (no `isolate` flag), so default behavior preserved.

### `init-cleanup-events.spec.ts`

**Update 1 test:**
- "can access and modify parent state" (line 196)
  - Add negative test: with `isolate: true`, should NOT access parent

**Add 1 new test:**
- "init/cleanup events work in isolated containers"
  - Verify events fire correctly
  - Verify parent state isolated

### `state-scope-in-pages.spec.ts`

**Review for implicit isolation assumptions:**
- Check if any tests assume state inheritance
- Verify page-level containers work with default (inherit) behavior

---

## Test Priority

### Phase 1: Before Implementation
- Basic isolation tests (#1-5)
- Verify existing compound-component.spec.ts passes

### Phase 2: During Implementation  
- Container feature tests (#6-9)
- CompoundComponent isolation tests (#12-15)

### Phase 3: After Implementation
- Edge cases (#16-20)
- Shadowing interaction tests (#10-11)
- Update existing test files

---

## Success Criteria

- ✅ All new isolation tests pass
- ✅ All existing compound-component tests pass (no regressions)
- ✅ All existing state-var-scopes tests pass
- ✅ No E2E test failures across full suite (738+ tests)
- ✅ CompoundComponent isolation preserved
- ✅ Default inheritance behavior unchanged

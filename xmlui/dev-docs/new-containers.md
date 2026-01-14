# Refactoring Plan: Eliminating the `uses` Property

Removing `uses` is **simple but requires touching 3 core files plus parser**. Nobody uses it in production, so the only real constraint is keeping CompoundComponent's internal `uses: []` for encapsulation.

## What Is `uses`?

Controls state inheritance between parent and child containers:

```typescript
// extractScopedState() - StateContainer.tsx:279
if (!uses) return parentState;              // Inherit ALL (current default)
if (uses.length === 0) return EMPTY_OBJECT; // Inherit NONE
return pick(parentState, uses);             // Inherit SPECIFIC keys
```

**Implementation Locations:**
1. **Downward flow**: Filter parent state passed to child (StateContainer.tsx:78)
2. **Upward propagation**: Control which changes bubble to parent (StateContainer.tsx:214)
3. **Container detection**: Triggers container creation (ContainerWrapper.tsx:73)

---

## Evidence It's Unnecessary

### Production Usage: ZERO

- ❌ No `.xmlui` files use `uses` attribute
- ❌ No documentation examples
- ❌ No example applications
- ✅ Only framework defaults (3 places)
- ✅ Only parser validation tests (5 tests)

### Framework Defaults Analysis

**Three places set `uses: []`:**

1. **StandaloneComponent** (line 36): Sets `uses: []` where parent is already `EMPTY_OBJECT` → **Redundant**
2. **AppRoot** (line 78): Root container has no parent → **Redundant**
3. **CompoundComponent** (line 72): Isolates component internals from parent scope → **Only legitimate use**

### Current Behavior

When `uses` is undefined (always in production):
```typescript
// StateContainer.tsx:78
stateFromOutside = parentState  // Inherit everything

// StateContainer.tsx:214  
if (!node.uses || ...) {  // Always true, always propagates
  parentStatePartChanged(...)
}
```

### Performance Reality

- React memoization optimized (`useShallowCompareMemoize`)
- Variable resolution uses dependency tracking
- Container components memoized
- **Zero documented performance issues in 3+ months**

---

## The CompoundComponent Exception

**Critical Finding:** CompoundComponent uses `uses: []` to isolate internal state:

```typescript
// CompoundComponent.tsx:72
const containerNode: ContainerWrapperDef = {
  type: "Container",
  uses: EMPTY_ARRAY,  // Prevents parent state inheritance
  vars: { $props: resolvedProps },
  // ...
};
```

**Why this matters:**
- Compound components need encapsulation (internals shouldn't access parent scope)
- This is an **internal architectural decision**, not a user-facing feature
- Removing `uses` completely would break compound component isolation

**Solution:** Keep `uses` internally, remove from public API.

---

## Incremental Refactoring Plan

### Step 1: Remove from Container Logic

All tests pass after this step except parser tests.

#### 1.1: Remove from container detection
**File:** `/xmlui/src/components-core/rendering/ContainerWrapper.tsx:73`

```typescript
// OLD
export function isContainerLike(node: ComponentDef) {
  return !!(
    node.loaders ||
    node.vars ||
    node.uses ||  // ← Remove this line
    node.contextVars ||
    node.functions ||
    node.scriptCollected
  );
}

// NEW
export function isContainerLike(node: ComponentDef) {
  return !!(
    node.loaders ||
    node.vars ||
    node.contextVars ||
    node.functions ||
    node.scriptCollected
  );
}
```

**Impact:** Components with ONLY `uses` won't create containers anymore (nobody does this).

#### 1.2: Keep state inheritance logic (DO NOT CHANGE)
**File:** `/xmlui/src/components-core/rendering/StateContainer.tsx:78`

```typescript
// KEEP AS IS - CompoundComponent needs this
const stateFromOutside = useShallowCompareMemoize(
  useMemo(() => extractScopedState(parentState, node.uses), [node.uses, parentState]),
);
```

**Impact:** No change. CompoundComponent's `uses: []` continues to work.

#### 1.3: Keep state change propagation logic (DO NOT CHANGE)
**File:** `/xmlui/src/components-core/rendering/StateContainer.tsx:214`

```typescript
// KEEP AS IS - CompoundComponent needs this
if (!node.uses || node.uses.includes(key)) {
  parentStatePartChanged(pathArray, newValue, target, action);
}
```

**Impact:** No change. State propagation continues to respect `uses`.

#### 1.4: Keep extractScopedState function (DO NOT CHANGE)
**File:** `/xmlui/src/components-core/rendering/StateContainer.tsx:279-290`

```typescript
// KEEP AS IS - CompoundComponent needs this
function extractScopedState(
  parentState: ContainerState,
  uses?: string[],
): ContainerState | undefined {
  if (!uses) {
    return parentState;
  }
  if (uses.length === 0) {
    return EMPTY_OBJECT;
  }
  return pick(parentState, uses);
}
```

**Impact:** No change. Function remains for CompoundComponent isolation.

#### 1.5: Keep UID info scoping (DO NOT CHANGE)
**File:** `/xmlui/src/components-core/rendering/Container.tsx:645`

```typescript
// OLD
const uidInfoRef = node.uses === undefined ? parentUidInfoRef : thisUidInfoRef;

// NEW
const uidInfoRef = parentUidInfoRef;
```
// KEEP AS IS - May be needed for uses functionality
const uidInfoRef = node.uses === undefined ? parentUidInfoRef : thisUidInfoRef;
```

**Impact:** No change. Preserves existing behavior.
**File:** `/xmlui/src/components-core/rendering/ContainerWrapper.tsx:180-195`

```typescrKeep uses in wrapping logic (DO NOT CHANGE)
**File:** `/xmlui/src/components-core/rendering/ContainerWrapper.tsx:180-195`

```typescript
// KEEP AS IS - CompoundComponent sets uses: EMPTY_ARRAY internally
delete wrappedNode.uses;  // Still cleanup from parsed content
delete (wrappedNode.props as any)?.uses;
// ...
return {
  type: "Container",
  // ...
  uses: node.uses,  // KEEP - CompoundComponent needs this
  // ...
};
```

**Impact:** No change. CompoundComponent isolation preserved.
### Step 3: Remove Framework Defaults

#### 3.1: Remove from StandaloneComponent
**File:** `/xmlui/src/components-core/rendering/StandaloneComponent.tsx:36`

```typescript
// OLD
return {
  type: "Container",
  uid: "standaloneComponentRoot",
  children: [node],
  uses: [],  // ← Remove this line
  functions,
  vars,
};

// NEW
return {
  type: "Container",
  uid: "standaloneComponentRoot",
  children: [node],
  functions,
  vars,
};
```

#### 3.2: Remove from AppRoot
**File:** `/xmlui/src/components-core/rendering/AppRoot.tsx:78`

```typescript
// OLD
return {
  type: "Container",
  uid: "root",
  children: [themedRoot],
  uses: [],  // ← Remove this line
};

// NEW
return {
  type: "Container",
  uid: "root",
  children: [themedRoot],
};
```

#### 3.3: Keep in CompoundComponent (with comment)
**File:** `/xmlui/src/components-core/CompoundComponent.tsx:72`

```typescript
// KEEP BUT ADD COMMENT
const containerNode: ContainerWrapperDef = useMemo(() => {
  const { loaders, vars, functions, scriptError, ...rest } = compound;
  return {
    type: "Container",
    // Isolate compound component internals from parent scope
    // This prevents component implementation details from accessing parent state
    uses: EMPTY_ARRAY,
    api,
    scriptCollected,
    // ...
  };
}, [/* ... */]);
```

**Test:** Run `npm run test`

---

### Step 4: Update Type Definitions
**File:** `/xmlui/src/abstractions/ComponentDefs.ts:67-74`

```typescript
// OLD
/**
 * Components managing state through variables or loaders are wrapped with containers
 * responsible for this job. Just as components, containers form a hierarchy. While
 * working with this hierarchy, parent components may flow state values (key and value
 * pairs) to their child containers. This property holds the name of state values to
 * flow down to the direct child containers.
 * Analysis: Does This Simplify Anything?

**Answer: NO. This "refactoring" achieves almost nothing.**

### What Gets Removed
- Parser support for `uses` attribute/element (deprecation warnings)
- 5 parser validation tests
- `splitUsesValue()` utility function
- Documentation of `uses` as user-facing feature
- `uses: []` from StandaloneComponent and AppRoot (redundant anyway)

### What Stays (The Entire Implementation)
- `extractScopedState()` function
- State inheritance logic in StateContainer (line 78)
- State propagation logic in StateContainer (line 214)
- UID info scoping logic in Container (line 645)
- `uses` property in ContainerWrapper wrapping
- `uses` property in ComponentDef type
- **CompoundComponent using `uses: EMPTY_ARRAY`**

### Actual Simplification Achieved
**~50 lines of parser code removed. Core container logic: UNCHANGED.**

### The Real Question
CompoundComponent needs isolation. Current implementation uses `uses: []`. If we're keeping that mechanism, removing it from the public API is just hiding it, not simplifying it.

---

## Real Simplification Options

### Option A: Accept Current State
**Do nothing.** The implementation works. CompoundComponent needs isolation. `uses` provides it. Nobody uses it publicly, so there's no maintenance burden.

**Simplification: 0%**

### Option B: Parser-Only Removal (This Plan)
Remove parser, keep runtime. Users can't use `uses`, but all the machinery stays for CompoundComponent.

**Simplification: ~5% (just parser code)**

### Option C: Replace with Explicit Isolation Flag
```typescript
// ComponentDef type
isolate?: boolean;  // Clear semantics: true = no parent state

// extractScopedState becomes simpler
function extractScopedState(parentState, isolate?) {
  return isolate ? EMPTY_OBJECT : parentState;
}

// CompoundComponent
return {
  type: "Container",
  isolate: true,  // Clearer than uses: EMPTY_ARRAY
  // ...
};
```

**Benefits:**
- Binary choice (isolate or don't) vs 3-way choice (undefined/[]/['x','y'])
- Clearer semantics
- Simpler implementation (no `pick()`, no array handling)
- Same functionality

**Simplification: ~30% (removes selective inheritance complexity)**

### Option D: Eliminate CompoundComponent Isolation Need
Research why CompoundComponent needs isolation:
- Is it actually necessary?
- Can we redesign compound components to not need it?
- What breaks if we remove it?

This requires understanding CompoundComponent architecture deeply.

**Simplification: ~100% if viable, but requires design work**

---

## Recommendation

**This plan (Option B) is not worth doing.** It removes a feature nobody uses while keeping all the implementation complexity. The effort/benefit ratio is terrible.

**Better path:**
1. Research Option D first: Can CompoundComponent work without isolation?
2. If no: Implement Option C (explicit isolation flag) - cleaner and simpler
3. If yes to either: Then remove `uses` completely with real simplification

**Current plan removes user-facing feature while keeping 95% of the complexity. That's not refactoring, that's just hiding things.**
uses?: string[];

// NEW
/**
 * @deprecated This property is no longer used. All parent state is automatically inherited.
 * Internal usage preserved for CompoundComponent encapsulation only.
 * Will be removed from public API in v2.0.
 */
uses?: string[];
```

---

### Step 5: Update Parser

Parser tests fail until this step is complete.

#### 5.1: Deprecate uses attribute parsing
**File:** `/xmlui/src/parsers/xmlui-parser/transform.ts:452`

```typescript
// OLD
case "uses":
  comp.uses = splitUsesValue(value);
  return;

// NEW - Add deprecation warning but don't set it
case "uses":
  console.warn(
    `[XMLUI] The 'uses' attribute is deprecated and will be ignored. ` +
    `All parent state is now automatically inherited. ` +
    `You can safely remove 'uses="${value}"'.`
  );
  return;
```

#### 5.2: Deprecate uses element parsing
**File:** `/xmlui/src/parsers/xmlui-parser/transform.ts:710-721`

```typescript
// OLD
function processUsesElement(/*...*/) {
  // ... validation and parsing ...
  if (comp.uses) {
    comp.uses.push(...usesValues);
  } else {
    comp.uses = usesValues;
  }
}

// NEW - Just log warning and return
function processUsesElement(comp: ComponentDef, node: Node) {
  console.warn(
    `[XMLUI] The '<uses>' element is deprecated and will be ignored. ` +
    `All parent state is now automatically inherited. ` +
    `You can safely remove this element.`
  );
  return;
}
```

#### 5.3: Remove splitUsesValue utility
**File:** `/xmlui/src/parsers/xmlui-parser/transform.ts:1329-1331`

```typescript
// DELETE THIS FUNCTION
function splitUsesValue(value: string) {
  return value.split(",").map((v) => v.trim());
}
```

**Test:** Run `npm run test -- tests/parsers/xmlui/`

---

### Step 6: Update Parser Tests
**File:** `/xmlui/tests/parsers/xmlui/transform.attr.test.ts`

```typescript
// OLD
test("parsing uses attribute", () => {
  const cd = transformSource("<Stack uses='isOpen' />") as ComponentDef<typeof StackMd>;
  expect(cd.uses).deep.equal(["isOpen"]);
});

test("parsing multiple uses values", () => {
  const cd = transformSource("<Stack uses='isOpen, count' />") as ComponentDef<typeof StackMd>;
  expect(cd.uses).deep.equal(["isOpen", "count"]);
});

// NEW
test("uses attribute shows deprecation warning", () => {
  const spy = vi.spyOn(console, 'warn');
  transformSource("<Stack uses='isOpen' />");
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('deprecated'));
  spy.mockRestore();
});

test("uses attribute is ignored", () => {
  const cd = transformSource("<Stack uses='isOpen' />") as ComponentDef<typeof StackMd>;
  expect(cd.uses).toBeUndefined();
});
```

#### 6.2: Update element parsing tests
**File:** `/xmlui/tests/parsers/xmlui/transform.element.test.ts`

```typescript
// OLD
test("parsing uses element", () => {
  const cd = transformSource("<Stack><uses>isOpen</uses></Stack>");
  expect(cd.uses).deep.equal(["isOpen"]);
});

test("parsing multiple uses elements", () => {
  const cd = transformSource("<Stack><uses>isOpen</uses><uses>count</uses></Stack>");
  expect(cd.uses).deep.equal(["isOpen", "count"]);
});

test("parsing uses element with comma-separated values", () => {
  const cd = transformSource("<Stack><uses>isOpen, count</uses></Stack>");
  expect(cd.uses).deep.equal(["isOpen", "count"]);
});

// NEW
test("uses element shows deprecation warning", () => {
  const spy = vi.spyOn(console, 'warn');
  transformSource("<Stack><uses>isOpen</uses></Stack>");
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('deprecated'));
  spy.mockRestore();
});

test("uses element is ignored", () => {
  const cd = transformSource("<Stack><uses>isOpen</uses></Stack>");
  expect(cd.uses).toBeUndefined();
});
```

**Test:** Run `npm run test -- tests/parsers/xmlui/`

---

### Step 7: Update Documentation

**File:** `/xmlui/dev-docs/containers.md`

**Remove** the entire "Uses Declarations" section (lines 192-207) and **replace** with:

### State Inheritance (Automatic)

Parent state is automatically inherited by child containers. All variables defined in parent containers are accessible in child containers.

```xml
<Stack var.user="{currentUser}" var.theme="{'dark'}">
  <Stack var.count="{0}">
    <!-- Both parent variables are accessible -->
    <Text>{user.name}</Text>
    <Text>{theme}</Text>
    <Text>{count}</Text>
  </Stack>
</Stack>
```

**State Shadowing:** Child containers can define variables with the same name as parent variables. The child's variable takes precedence within that container's scope.

```xml
<Stack var.x="outer">
  <Text>{x}</Text>  <!-- "outer" -->
  <Stack var.x="inner">
    <Text>{x}</Text>  <!-- "inner" - shadows parent -->
  </Stack>
  <Text>{x}</Text>  <!-- "outer" - unchanged -->
</Stack>
```

**Note:** The deprecated `uses` property previously allowed manual control of state inheritance. It is no longer needed and will be removed from the public API in v2.0. Internal usage is preserved for CompoundComponent encapsulation.

#### 7.2: Remove from component documentation
Search and remove any `uses` property documentation from component `.md` files.

---

## Testing Strategy

### Before Refactoring

```bash
# Create baseline
npm run test > baseline-tests.txt
npm run test:e2e > baseline-e2e.txt

# Verify no production usage
grep -r "uses=" packages/**/*.xmlui
grep -r "uses=" docs/**/*.xmlui
grep -r "uses=" blog/**/*.xmlui
# Should return nothing
```

### After Each Step

```bash
# After Step 1: Container logic
npm run test -- tests/components-core/container/
npm run test:e2e -- tests-e2e/state-var-scopes.spec.ts

# After Step 2-4: Runtime changes
npm run test

# After Step 5-6: Parser changes
npm run test -- tests/parsers/xmlui/

# Final validation
npm run test
npm run test:e2e
```

### Success Criteria

- [ ] All existing tests pass
- [ ] 5 parser tests updated for deprecation
- [ ] No changes to E2E test behavior
- [ ] No performance regression
- [ ] Docs site builds correctly
- [ ] Example apps work without modification

---

## Expected Test Results

### Tests That Pass (No Changes)

- ✅ All 738+ E2E tests (none use `uses`)
- ✅ All integration tests
- ✅ All component tests  
- ✅ All rendering tests
- ✅ State inheritance tests (test behavior, not syntax)

### Tests That Need Updates

- ❌ 5 parser tests that validate `uses` syntax
  - 2 in `transform.attr.test.ts`
  - 3 in `transform.element.test.ts`
- **Fix:** Update to verify deprecation warnings and that `uses` is undefined

---

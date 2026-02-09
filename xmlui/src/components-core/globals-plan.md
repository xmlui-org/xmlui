# New Feature: Global variables in XMLUI

## Resources

- Rendering pipeline: xmlui/dev-docs/standalone-app.md
- Containers and state management: xmlui/dev-docs/containers.md
- Component conventions: xmlui/dev-docs/conv-create-components.md
- E2E conventions: xmlui/dev-docs/conv-e2e-testing.md

## Test prototype app

Main.xmlui:

```xmlui
<App>
  <Text>Count: {count}</Text>
  <IncButton label="First Button" />
  <IncButton label="Second Button" />
  <Button
    label="3rd button: {count}"
    onClick="count++" />
  <Button
    var.count="{0}"
    label="4th button (local): {count}"
    onClick="count++" />
</App>
```

Globals.xs:

```js
var count = 6*7;
```

IncButton.xmlui:

```xmlui
<Component name="IncButton">
  <Button
    label="{($props.label ?? 'Click me to increment') + ': ' + count}"
    onClick="count++" />
</Component>
```

When I run the app, the Text and the first three button should display "42" as their initial value. The "count" variable in 4th button shadows the global "count" variable and should display 0. As I click any of the first four buttons, they should increment the global count variable and these buttons plus the Text should show the incremented value.

---

## Research: `<global>` Helper Tag Feasibility

### Executive Summary

Introducing a `<global>` helper tag is **highly feasible** and aligns well with the existing XMLUI architecture. The infrastructure for global variables is already in place - we only need to add parsing support for the new tag.

### Current Global Variable Implementation

#### 1. Architecture Overview

**Data Flow:**
```
Globals.xs file
    ↓
StandaloneApp (loads & evaluates)
    ↓
AppRoot (passes globalVars to root Container)
    ↓
Root Container (node.globalVars = {...})
    ↓
Child Containers (via parentGlobalVars)
    ↓
Combined State (merged with local vars)
```

**Key Files:**
- `xmlui/src/components-core/StandaloneApp.tsx` - Global variable loading from Globals.xs
- `xmlui/src/components-core/rendering/AppRoot.tsx` - Creates root container with globalVars
- `xmlui/src/components-core/rendering/StateContainer.tsx` - Merges and propagates global variables
- `xmlui/src/abstractions/ComponentDefs.ts` - ComponentDefCore.globalVars property

#### 2. Container State Composition

Global variables are merged into the container state in **StateContainer.tsx** (lines 522-527):

```typescript
const currentGlobalVars = useMemo(() => {
  return {
    ...(parentGlobalVars || {}),
    ...(node.globalVars || {}),
  };
}, [parentGlobalVars, node.globalVars]);
```

Then added to combined state via `useCombinedState()`:
```typescript
const combinedState = useCombinedState(
  stateFromOutside,
  node.contextVars,
  currentGlobalVars,  // Global variables layer
  mergedWithVars,
  routingParams,
);
```

#### 3. Update Propagation

Updates to global variables bubble up to the root container via `statePartChanged` (lines 554-575):

```typescript
const statePartChanged: StatePartChangedFn = useCallback(
  (pathArray, newValue, target, action) => {
    const key = pathArray[0];
    const isGlobalVar = key in currentGlobalVars;
    const isRoot = node.uid === 'root';
    
    if (isGlobalVar) {
      if (isRoot) {
        // Root container handles global var updates
        dispatch({ type: ContainerActionKind.STATE_PART_CHANGED, ... });
      } else {
        // Non-root containers bubble to parent
        parentStatePartChanged(pathArray, newValue, target, action);
      }
    }
    // ... local state handling
  },
  [resolvedLocalVars, currentGlobalVars, node.uses, node.uid, parentStatePartChanged],
);
```

### Current `<variable>` Helper Tag Implementation

The `<variable>` tag is processed in **xmlui/src/parsers/xmlui-parser/transform.ts**:

#### 1. HelperNode Enum (lines 41-50)
```typescript
const HelperNode = {
  property: "property",
  template: "template",
  event: "event",
  variable: "variable",  // <-- Current helper tag
  loaders: "loaders",
  uses: "uses",
  method: "method",
  item: "item",
  field: "field",
} as const;
```

#### 2. Processing in collectTraits (lines 342-355)
```typescript
case HelperNode.variable:
  collectElementHelper(
    usesStack,
    comp,
    child,
    
    (name) => (isComponent(comp) ? comp.vars?.[name] : undefined),
    (name, value) => {
      if (!isComponent(comp)) return;
      comp.vars ??= {};
      comp.vars[name] = value;  // <-- Stores in comp.vars
    },
  );
  return;
```

#### 3. collectElementHelper Function (lines 657-687)
Handles the parsing of name/value attributes or nested components:
- Extracts `name` and `value` attributes
- Supports both attribute-based and nested component syntax
- Calls setter function to store the parsed value

### Proposed `<global>` Helper Tag Implementation

#### Constraint: Root Element and Compound Components Only

**Important:** The `<global>` tag and `global.*` attributes are **only allowed in**:
1. **Root element** (typically Main.xmlui's `<App>` component)
2. **Compound component definitions** (`<Component name="...">` elements)

Usage in nested regular components will trigger a parser error.

#### Required Changes

**1. Update HelperNode Enum** (`xmlui/src/parsers/xmlui-parser/transform.ts:41`)
```typescript
const HelperNode = {
  property: "property",
  template: "template",
  event: "event",
  variable: "variable",
  global: "global",    // <-- ADD THIS
  loaders: "loaders",
  uses: "uses",
  method: "method",
  item: "item",
  field: "field",
} as const;
```

**2. Add Case Handler in collectTraits** (`xmlui/src/parsers/xmlui-parser/transform.ts:~356`)

Add after the `HelperNode.variable` case:

```typescript
case HelperNode.global:
  // Allow in both root components and compound components
  collectElementHelper(
    usesStack,
    comp,
    child,
    
    (name) => (isComponent(comp) ? comp.globalVars?.[name] : undefined),
    (name, value) => {
      if (!isComponent(comp)) return;
      comp.globalVars ??= {};
      comp.globalVars[name] = value;  // <-- Target globalVars instead of vars
    },
  );
  return;
```

**3. Update collectAttribute** (`xmlui/src/parsers/xmlui-parser/transform.ts:~420`)

Add support for `global.*` attribute syntax around line 430:
```typescript
switch (name) {
  case "id":
    comp.uid = value;
    return;
  // ... other cases ...
  default:
    if (startSegment === "var") {
      comp.vars ??= {};
      comp.vars[name] = value;
    } else if (startSegment === "global") {  // <-- ADD THIS
      // Note: Validation for root-only will be added
      comp.globalVars ??= {};
      comp.globalVars[name] = value;
    } else if (startSegment === "method") {
      comp.api ??= {};
      comp.api[name] = value;
    }
    // ... rest of code
```

**4. Handle Compound Components** (`xmlui/src/parsers/xmlui-parser/transform.ts:~175`)

Update `collectCompoundComponent` to handle nested `<global>` tags:

```typescript
const nonVarHelperNodes: Node[] = [];
const nestedVars: Node[] = [];
const nestedGlobals: Node[] = [];  // <-- ADD THIS

for (let child of children) {
  if (child.kind === SyntaxKind.ElementNode) {
    const childName = getComponentName(child, getText);
    if (childName === HelperNode.variable) {
      nestedVars.push(child);
    } else if (childName === HelperNode.global) {  // <-- ADD THIS
      nestedGlobals.push(child);
    } else if (childName in HelperNode) {
      nonVarHelperNodes.push(child);
    }
  }
}

// Update fragment wrapping:
if (nestedComponents.length > 1 || nestedVars.length > 0 || nestedGlobals.length > 0) {
  element = wrapWithFragment([...nestedVars, ...nestedGlobals, ...nestedComponents]);
}

// After processing, merge globalVars into nested component:
if (globalVars) {
  nestedComponent.globalVars = { ...nestedComponent.globalVars, ...globalVars };
}
```

**5. Collect globalVars in collectCompoundComponent** (`xmlui/src/parsers/xmlui-parser/transform.ts:~165`)

```typescript
// Get global attributes
let globalVars: Record<string, any> | undefined;
const globalAttrs = attrs.filter((attr) => attr.startSegment === "global");
if (globalAttrs.length > 0) {
  globalVars = {};
  globalAttrs.forEach((attr) => {
    globalVars![attr.name] = attr.value;
  });
}
```

**6. Update Compound Component Attribute Validation** (`xmlui/src/parsers/xmlui-parser/transform.ts:~405`)

```typescript
if (isCompound) {
  if (startSegment && startSegment !== "method" && startSegment !== "var" && startSegment !== "global") {
    reportError(DIAGS_TRANSFORM.invalidReusableCompAttr(nsKey));
    return;
  }
  // ...
}
```

### Syntax Support

The `<global>` tag supports the same syntax variants as `<variable>`, but **only in the root element**:

#### 1. Element Syntax - Root Element
```xmlui
<!-- Main.xmlui - Valid -->
<App>
  <global name="count" value="{42}" />
  <global name="userName" value="{'John'}" />
  <Text>Count: {count}, User: {userName}</Text>
</App>
```

#### 2. Element Syntax - Compound Component
```xmlui
<!-- components/Counter.xmlui - Valid -->
<Component name="Counter">
  <global name="totalClicks" value="{0}" />
  <Button 
    onClick="totalClicks++" 
    label="Total Clicks: {totalClicks}" 
  />
</Component>
```

#### 3. Attribute Syntax - Root Element
```xmlui
<!-- Main.xmlui - Valid -->
<App global.count="{42}" global.userName="{'John'}">
  <Text>Count: {count}, User: {userName}</Text>
</App>
```

#### 4. Attribute Syntax - Compound Component
```xmlui
<!-- components/SharedState.xmlui - Valid -->
<Component name="SharedState" global.sharedValue="{100}">
  <Text>Shared: {sharedValue}</Text>
</Component>
```

#### 5. Mixed with Local Variables
```xmlui
<!-- Main.xmlui - Root has globals, child has local vars -->
<App global.globalCount="{0}">
  <Stack var.localCount="{0}">
    <Button onClick="localCount++" label="Local: {localCount}" />
    <Button onClick="globalCount++" label="Global: {globalCount}" />
  </Stack>
</App>
```

#### 6. Compound Component with Both Global and Local
```xmlui
<!-- components/StatefulWidget.xmlui -->
<Component name="StatefulWidget" var.localState="{0}" global.widgetCount="{0}">
  <VStack>
    <Text>Local: {localState}</Text>
    <Text>Global Widget Count: {widgetCount}</Text>
    <Button onClick="localState++; widgetCount++" label="Increment Both" />
  </VStack>
</Component>
```

#### 7. Invalid Usage
```xmlui
<!-- ERROR: Not in root or compound component -->
<App>
  <Stack>
    <global name="count" value="{42}" />  <!-- ❌ Parser Error -->
  </Stack>
</App>

<!-- ERROR: Nested in regular component children -->
<App>
  <VStack>
    <HStack>
      <global name="nested" value="{1}" />  <!-- ❌ Parser Error -->
    </HStack>
  </VStack>
</App>
```

### Scoping and Shadowing Behavior

**Global variables:**
- Defined once (typically in Main.xmlui or Globals.xs)
- Flow to all containers regardless of `uses` property
- Updates propagate back to root container
- Can be shadowed by local variables with the same name

**Example:**
```xmlui
<App>
  <global name="count" value="{42}" />
  
  <!-- This sees global count = 42 -->
  <Text>{count}</Text>
  
  <!-- This shadows global count with local -->
  <Stack var.count="{0}">
    <Text>{count}</Text>  <!-- Shows 0, not 42 -->
  </Stack>
  
  <!-- This sees global count = 42 again -->
  <Text>{count}</Text>
</App>
```

### Testing Requirements

**1. Unit Tests** (`xmlui/src/parsers/xmlui-parser/transform.spec.ts`)
- Parse `<global>` element syntax
- Parse `global.*` attribute syntax
- Test in compound components
- Test shadowing behavior
- Test error cases (e.g., global in non-root contexts)

**2. E2E Tests** (`xmlui/tests-e2e/`)
- Global variable reactivity across components
- Update propagation to root
- Shadowing by local variables
- Integration with Globals.xs file

**3. Inspector Tests**
- Global variable changes logged correctly
- Distinguished from local variable changes in xsVerbose mode

### Benefits

1. **Explicit Intent** - `<global>` makes global variable declarations visually distinct from local ones
2. **Consistency** - Follows the same pattern as `<variable>`, reducing learning curve
3. **Flexibility** - Supports both element and attribute syntax
4. **Minimal Changes** - Leverages existing infrastructure, only adds parsing support
5. **No Breaking Changes** - Fully backward compatible with Globals.xs approach

### Potential Concerns

1. **Root and Compound Component Restriction** - Users might not understand why `<global>` only works in specific contexts
   - *Mitigation:* Clear error messages explaining globals must be defined at root or in compound components
   - *Rationale:* Globals are app-wide; compound components are reusable and initialized early
   - Root element = app-level globals; Compound components = component-level globals
   
2. **Globals.xs vs `<global>` Tag** - Two ways to do the same thing
   - *Mitigation:* Document that they can be used together; `<global>` provides inline alternative
   - `<global>` is clearer for simple values; Globals.xs better for complex logic
   
3. **Performance** - Additional parsing overhead
   - *Impact:* Negligible - same code path as `<variable>`, just different target property

### Alternatives Considered

1. **Use `var.global.*` syntax** - Too confusing, mixing local and global concepts
2. **Use `global="varName"` attribute** - Doesn't support complex expressions easily
3. **Keep only Globals.xs** - Less flexible, requires separate file

### Recommendation

**Proceed with implementation.** The `<global>` helper tag is a natural extension of the existing variable system, requires minimal code changes, and provides a clearer syntax for declaring global variables directly in markup.

---

## Implementation Plan

### Constraint: Root Element and Compound Components Only

**Important:** The `<global>` tag is only allowed in two contexts:
1. **Root element** (Main.xmlui or App.xmlui)
2. **Compound component definitions** (files with `<Component name="...">`)

Attempting to use it in nested regular components will result in a parser error.

**Valid:**
```xmlui
<!-- Main.xmlui - Root element -->
<App>
  <global name="appCounter" value="{0}" />
  <Text>{appCounter}</Text>
</App>
```

```xmlui
<!-- components/Counter.xmlui - Compound component -->
<Component name="Counter">
  <global name="totalClicks" value="{0}" />
  <Button onClick="totalClicks++" label="Clicks: {totalClicks}" />
</Component>
```

**Invalid:**
```xmlui
<!-- Nested in a regular component - ERROR -->
<App>
  <Stack>
    <global name="count" value="{42}" />  <!-- ❌ Not in root or compound -->
  </Stack>
</App>
```

**How It Works:**
- Globals from root element are immediately available
- Globals from compound components are collected by StandaloneApp during initialization
- All globals are merged and flow to all containers

### Step-by-Step Implementation

Each step follows this workflow:
1. **Update required files** with implementation changes
2. **Check linting** - Ensure no linting issues in updated files
3. **Create tests** - Unit tests preferred; E2E only if unit tests insufficient
4. **Run new tests** - Verify new functionality works
5. **Run all unit tests** - Ensure no regressions
6. **Skip E2E tests** - Will be run manually later
7. **Request approval** - Wait for approval before proceeding to next step

---

### Step 1: Add Parser Support for `<global>` Element Tag

**Goal:** Add basic parsing capability to recognize `<global>` as a helper tag in root elements and compound components.

**Files to Update:**
1. `xmlui/src/parsers/xmlui-parser/transform.ts`
   - Add `global: "global"` to `HelperNode` object (line ~47)
   - Add case handler for `HelperNode.global` in `collectTraits` (after line ~355)
   - Add validation to ensure `<global>` only appears in top-level components

**Implementation Details:**

```typescript
// 1. Add to HelperNode (line ~47)
const HelperNode = {
  property: "property",
  template: "template",
  event: "event",
  variable: "variable",
  global: "global",    // ADD THIS
  loaders: "loaders",
  uses: "uses",
  method: "method",
  item: "item",
  field: "field",
} as const;

// 2. Add case handler in collectTraits switch (after line ~355)
case HelperNode.global:
  // Allow in both root elements and compound components
  collectElementHelper(
    usesStack,
    comp,
    child,
    
    (name) => (isComponent(comp) ? comp.globalVars?.[name] : undefined),
    (name, value) => {
      if (!isComponent(comp)) return;
      comp.globalVars ??= {};
      comp.globalVars[name] = value;
    },
  );
  return;

// 3. Update collectCompoundComponent to handle nested <global> tags (line ~175)
const nestedGlobals: Node[] = [];
for (let child of children) {
  if (child.kind === SyntaxKind.ElementNode) {
    const childName = getComponentName(child, getText);
    if (childName === HelperNode.global) {
      nestedGlobals.push(child);
    }
  }
}

// Wrap with fragment if needed
if (nestedComponents.length > 1 || nestedVars.length > 0 || nestedGlobals.length > 0) {
  element = wrapWithFragment([...nestedVars, ...nestedGlobals, ...nestedComponents]);
}
```

**Diagnostics to Add:**
- Add `globalNotAllowedInNestedComponent` to diagnostics (`xmlui/src/parsers/xmlui-parser/diagnostics.ts`)

**Tests to Create:**
- `xmlui/src/parsers/xmlui-parser/transform.spec.ts`
  - Test parsing `<global name="x" value="{1}" />` in root element
  - Test parsing `<global>` in compound component definition
  - Test error when `<global>` appears in nested regular component
  - Test multiple `<global>` declarations in root
  - Test multiple `<global>` declarations in compound component
  - Test `<global>` with complex expressions
  - Test compound component with both `var.*` and `global.*` attributes

**Expected Test Count:** ~7 unit tests

**Workflow:**
```bash
# 1. Make code changes
# 2. Check linting
npm run lint:check

# 3. Create unit tests in transform.spec.ts
# 4. Run new tests (specific test file)
npm run test -- transform.spec.ts

# 5. Run all unit tests
npm run test

# 6. Skip E2E tests
# 7. Wait for approval
```

---

### Step 2: Add Parser Support for `global.*` Attribute Syntax

**Goal:** Enable attribute-based global variable declarations in root elements and compound components (e.g., `<App global.count="{42}">`, `<Component name="X" global.y="{1}">`).

**Files to Update:**
1. `xmlui/src/parsers/xmlui-parser/transform.ts`
   - Update `collectAttribute` function to handle `global.*` prefix (around line ~430)
   - Add validation to ensure `global.*` attributes only on root element

**Implementation Details:**

```typescript
// 1. In collectAttribute, in the default case (around line ~430)
default:
  if (startSegment === "var") {
    comp.vars ??= {};
    comp.vars[name] = value;
  } else if (startSegment === "global") {
    comp.globalVars ??= {};
    comp.globalVars[name] = value;
  } else if (startSegment === "method") {
    comp.api ??= {};
    comp.api[name] = value;
  }
  // ... rest

// 2. In collectCompoundComponent, collect global attributes (around line ~165)
const globalAttrs = attrs.filter((attr) => attr.startSegment === "global");
if (globalAttrs.length > 0) {
  globalVars = {};
  globalAttrs.forEach((attr) => {
    globalVars![attr.name] = attr.value;
  });
}

// 3. Update compound component validation (around line ~405)
if (isCompound) {
  if (startSegment && startSegment !== "method" && startSegment !== "var" && startSegment !== "global") {
    reportError(DIAGS_TRANSFORM.invalidReusableCompAttr(nsKey));
    return;
  }
}
```

**Tests to Create:**
- `xmlui/src/parsers/xmlui-parser/transform.spec.ts`
  - Test `<App global.count="{42}" />` in root
  - Test `<Component name="X" global.count="{42}" />` in compound component
  - Test multiple `global.*` attributes in both contexts
  - Test mixing `global.*` with `var.*` attributes
  - Test error when `global.*` on nested regular component
  - Test `global.*` with various data types (string, number, boolean, object)

**Expected Test Count:** ~6 unit tests

**Workflow:**
```bash
# 1. Make code changes
# 2. Check linting
npm run lint:check

# 3. Add unit tests to transform.spec.ts
# 4. Run new tests
npm run test -- transform.spec.ts

# 5. Run all unit tests
npm run test

# 6. Skip E2E tests
# 7. Wait for approval
```

---

### Step 3: Runtime Integration and State Management

**Goal:** Ensure global variables from both root and compound components flow correctly through the container hierarchy at runtime. Add StandaloneApp logic to collect globals from compound components.

**Files to Update:**
1. `xmlui/src/components-core/StandaloneApp.tsx`
   - Add logic to collect `globalVars` from compound components during app initialization
   - Merge compound component globals with root globals
   - In `resolveRuntime` function (~line 700), extract globals from `components` array
   - In `useStandalone` hook, collect globals from fetched compound components

2. `xmlui/src/components-core/rendering/StateContainer.tsx`
   - Verify `currentGlobalVars` merging works with parsed globals (should already work)
   - Ensure `statePartChanged` handles globals correctly (should already work)

3. `xmlui/src/components-core/rendering/AppRoot.tsx`
   - Verify root container receives merged `globalVars` (should already work)

**Implementation in StandaloneApp:**

```typescript
// In resolveRuntime function, after collecting components
function resolveRuntime(runtime: Record<string, any>) {
  // ... existing code ...
  
  // Collect globalVars from compound components
  const compoundGlobals: Record<string, any> = {};
  components.forEach(compound => {
    if (compound.component?.globalVars) {
      Object.assign(compoundGlobals, compound.component.globalVars);
    }
  });
  
  // Merge with root globals (root takes precedence)
  const mergedGlobals = {
    ...compoundGlobals,
    ...(entryPointWithCodeBehind.globalVars || {}),
  };
  
  // Pass to StandaloneAppDescription
  return {
    standaloneApp: {
      // ... existing props ...
      globalVars: mergedGlobals,
    },
  };
}
```

**Tests to Create:**
- `xmlui/src/components-core/__tests__/global-variables-runtime.spec.tsx` (new file)
  - Test global variables from root merge into component state
  - Test global variables from compound components merge into state
  - Test globals from both root and compound components (compound defined first)
  - Test root globals override compound globals with same name
  - Test global variable updates propagate to root
  - Test local variables shadow global variables
  - Test global variables accessible in nested containers
  - Test global variables persist across container boundaries
  - Test multiple compound components with different globals

- `xmlui/src/components-core/StandaloneApp.spec.tsx` (if exists, or add to existing)
  - Test `resolveRuntime` collects globals from compound components
  - Test globals merging precedence (root > compound)

**Expected Test Count:** ~11 unit tests

**Workflow:**
```bash
# 1. Make code changes (if needed)
# 2. Check linting
npm run lint:check

# 3. Create unit tests
# 4. Run new tests
npm run test -- global-variables.spec.tsx

# 5. Run all unit tests
npm run test

# 6. Skip E2E tests
# 7. Wait for approval
```

---

### Step 4: Add Diagnostic Error Messages

**Goal:** Provide clear error messages for invalid `<global>` usage.

**Files to Update:**
1. `xmlui/src/parsers/xmlui-parser/diagnostics.ts`
   - Add error messages for:
     - `globalNotAllowedInNested`: "Global variables can only be declared in the root element or compound component definitions, not in nested regular components"
     - `globalInvalidSyntax`: "Invalid global variable syntax"

**Tests to Create:**
- `xmlui/src/parsers/xmlui-parser/diagnostics.spec.ts` (if exists) or add to transform.spec.ts
  - Test correct error code for nested global
  - Test error message formatting
  - Test error position tracking
  - Test no error for global in root
  - Test no error for global in compound component

**Expected Test Count:** ~5 unit tests

**Workflow:**
```bash
# 1. Make code changes
# 2. Check linting
npm run lint:check

# 3. Create/update unit tests
# 4. Run new tests
npm run test -- diagnostics.spec.ts

# 5. Run all unit tests
npm run test

# 6. Skip E2E tests
# 7. Wait for approval
```

---

### Step 5: Integration Testing and Documentation

**Goal:** Create comprehensive integration tests and verify the complete feature works end-to-end.

**Files to Update:**
1. `xmlui/src/components-core/__tests__/global-tag-integration.spec.tsx` (new file)
   - Test complete scenarios with `<global>` tags
   - Test interaction with Globals.xs
   - Test shadowing behaviors
   - Test reactivity across components

2. Update documentation (optional, can be separate):
   - Add `<global>` tag to helper tags documentation
   - Add examples to component documentation

**Tests to Create:**
- Integration test scenarios:
  - Global variable declared in root with `<global>` tag, accessed across all components
  - Global variable declared in compound component, accessible in instances
  - Mix of `<global>` element and `global.*` attributes in both contexts
  - Both root and compound component define globals with different names
  - Both root and compound component define globals with same name (root wins)
  - Global from `<global>` tag + global from Globals.xs (same name)
  - Update global variable from compound component instance, verify propagation
  - Update global variable from root context, verify all components update
  - Local variable shadows global in nested scope
  - Multiple compound components with independent globals
  - Compound component global accessed before component is instantiated
  - Error handling for invalid `<global>` placements (nested regular component)

**Expected Test Count:** ~12 integration tests

**Workflow:**
```bash
# 1. Make code changes
# 2. Check linting
npm run lint:check

# 3. Create integration tests
# 4. Run new tests
npm run test -- global-tag-integration.spec.tsx

# 5. Run all unit tests
npm run test

# 6. Skip E2E tests
# 7. Wait for approval
```

---

### Summary

**Total Steps:** 5
- Step 1: Parser support for `<global>` element (root + compound components)
- Step 2: Parser support for `global.*` attributes (root + compound components)
- Step 3: Runtime integration + StandaloneApp collection logic
- Step 4: Diagnostic error messages
- Step 5: Integration testing

**Estimated Tests:** ~41 unit tests total

**Key Constraint:** `<global>` tags allowed in:
- Root element (Main.xmlui/App.xmlui)
- Compound component definitions (`<Component name="...">`)
- NOT allowed in nested regular components

**Test Strategy:**
- ✅ Unit tests for parser logic
- ✅ Unit tests for runtime behavior
- ✅ Integration tests for complete scenarios
- ⏭️ E2E tests run manually by developer

Each step requires approval before proceeding to the next.


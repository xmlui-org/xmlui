# New Feature: Global variables in XMLUI

Resources:
- Rendering pipeline: xmlui/dev-docs/standalone-app.md
- Containers and state management: xmlui/dev-docs/containers.md
- Component conventions: xmlui/dev-docs/conv-create-components.md
- E2E conventions: xmlui/dev-docs/conv-e2e-testing.md

## Idea

Currently variables are scope-bound. The can belong to the Mian.xmlui file's scope or to a component file's scope. I'd like to introduce global variables. My idea is that global variables should be added to the top container of an xmlui app that the framework implicitly adds to the application. I'd like to use the "uses" property of the top-layer container to flow down container state to the lower-level containers.

I'd like to experiment with a very simple prototype: hardcode a "count" variable with initial value of 42 into this container. It should work with this app example:

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

IncButton.xmlui:

```xmlui
<Component name="IncButton">
  <Button
    label="{($props.label ?? 'Click me to increment') + ': ' + count}"
    onClick="count++" />
</Component>
```

When I run the app, the Text and the first three button should display "42" as their initial value. The "count" variable in 4th button shadows the global "count" variable and should display 0. As I click any of the first four buttons, they should increment the global count variable and these buttons plus the Text should show the incremented value.

## Implementation Plan

### Architecture Overview

The root container is created in `AppRoot.tsx` (lines 68-80). This is where the framework automatically wraps the entire application with a Container component that manages top-level state. Variables defined here flow down to child containers via the existing state inheritance mechanism.

**Key components:**
- `AppRoot.tsx`: Creates the root container with `uid: "root"`, `uses: []`
- `StateContainer.tsx`: Manages state composition and variable resolution
- `ContainerWrapper.tsx`: Determines container creation and implicit/explicit boundaries
- State flow: Parent containers pass state to children via `extractScopedState()` and `useCombinedState()`

**State inheritance rules:**
- `uses` undefined: Inherit all parent state (default for implicit containers)
- `uses: []`: Inherit no parent state (current root container behavior)
- `uses: ['var1', 'var2']`: Inherit only specified variables

### Phase 1: Hardcoded Prototype ✅

**Goal:** Add a hardcoded `count` variable with value `42` to the root container.

**Changes:**
1. **File:** `xmlui/src/components-core/rendering/AppRoot.tsx` (lines 68-80)
   - Add `vars: { count: 42 }` to the root container object
   - This makes `count` available globally to all child containers

2. **File:** `xmlui/src/components-core/CompoundComponent.tsx` (line 72)
   - Remove `uses: EMPTY_ARRAY` from compound component container creation
   - This allows compound components to inherit parent state including global variables
   - **Root cause:** Compound components were creating isolated containers with `uses: []`, blocking all parent state inheritance

**Implementation:**

AppRoot.tsx:
```typescript
return {
  type: "Container",
  uid: "root",
  children: [themedRoot],
  uses: [],
  vars: {
    count: 42,  // Hardcoded global variable
  },
};
```

CompoundComponent.tsx (removed line):
```typescript
// BEFORE:
return {
  type: "Container",
  uses: EMPTY_ARRAY,  // ❌ Blocked parent state
  // ...
};

// AFTER:
return {
  type: "Container",
  // uses property removed - inherits all parent state ✅
  // ...
};
```

**Result:** Global variables now flow down to all containers including compound components via the existing state inheritance mechanism. Local variables declared with `var.count="{0}"` will shadow the global variable in their scope.

**Status:** ✅ Implemented

**Breaking Changes with Initial Approach:**
- ✅ Global variables accessible in compound components
- ⚠️ All parent variables are now accessible (not just globals)
- ⚠️ Potential for variable name collisions if parent and component use same names

**Revised Implementation - Separate Global Variables Flow:**

To avoid breaking changes, we implemented a separate `globalVars` flow that works alongside `uses`:

**Files Changed:**
1. `xmlui/src/abstractions/ComponentDefs.ts` - Added `globalVars` property to ComponentDefCore
2. `xmlui/src/abstractions/RendererDefs.ts` - Added `globalVars` to ComponentRendererContextBase
3. `xmlui/src/components-core/rendering/AppRoot.tsx` - Use `globalVars` instead of `vars`
4. `xmlui/src/components-core/rendering/ContainerWrapper.tsx` - Pass `parentGlobalVars` through hierarchy
5. `xmlui/src/components-core/rendering/StateContainer.tsx` - Merge and flow globalVars
6. `xmlui/src/components-core/rendering/Container.tsx` - Pass globalVars to children via renderChild
7. `xmlui/src/components-core/rendering/ComponentWrapper.tsx` - Extract and pass globalVars to ContainerWrapper

**Key Mechanism:**
GlobalVars are added to `combinedState` but NOT to `componentState` or `resolvedLocalVars`. The existing `statePartChanged` logic (StateContainer.tsx lines 543-568) already handles bubbling:
- If a variable is in local state → dispatch locally
- If a variable is NOT in local state → bubble up to parent (via `parentStatePartChanged`)

Since globalVars are not in local state, changes automatically propagate up to the root container!

**Final Result:**
- ✅ Global variables accessible everywhere including compound components
- ✅ Updates to globals propagate to root automatically (existing mechanism)
- ✅ Compound components maintain isolation (`uses: []`) for their local state
- ✅ No breaking changes

### Phase 2: Dynamic Global Variables Declaration

**Goal:** Allow declaring global variables dynamically (non-hardcoded).

**Options:**

**Option A: Via AppState.xmlui**
Add support for declaring global variables in an optional `AppState.xmlui` file at the app root:

```xmlui
<AppState>
  <script>
    let count = 42;
    let userName = "";
    const appConfig = { theme: "light" };
  </script>
</AppState>
```

**Changes needed:**
1. Parse `AppState.xmlui` in `useStandalone()` hook (StandaloneApp.tsx)
2. Extract variables/script from AppState component
3. Pass these to AppRoot as a new prop (e.g., `globalVars`)
4. Merge `globalVars` into root container's `vars` property

**Option B: Via config.json**
Extend `config.json` to support global variable declarations:

```json
{
  "name": "My App",
  "defaultTheme": "light",
  "globals": {
    "count": 42,
    "userName": "",
    "appConfig": {
      "theme": "light"
    }
  }
}
```

**Changes needed:**
1. Update config.json schema/parsing in `useStandalone()`
2. Extract `globals` from config
3. Pass to AppRoot and merge into root container's `vars`

**Option C: Via Main.xmlui script block**
Support a `<script>` block at the top level of Main.xmlui for global variables:

```xmlui
<App>
  <script global="true">
    let count = 42;
    let userName = "";
  </script>
  <!-- rest of app -->
</App>
```

**Changes needed:**
1. Modify XMLUI parser to recognize `global="true"` attribute on script blocks
2. Extract global script variables during parsing (in `xmlUiMarkupToComponent`)
3. Pass these separately from component-level scripts
4. Inject into root container's `vars`

**Recommendation:** Option A (AppState.xmlui) is most consistent with XMLUI patterns. It:
- Keeps global state separate from app UI structure
- Uses familiar XMLUI/script syntax
- Mirrors the existing component code-behind pattern
- Is explicit about intent (dedicated file for app-level state)

### Phase 3: Scoping and Uses

**Current behavior:**
- Root container has `uses: []` (inherits no parent state)
- Child containers with `uses: undefined` inherit all parent state
- Child containers with `uses: []` inherit no parent state
- Child containers with `uses: ['var1']` inherit only specified variables

**No changes needed** - the existing `uses` mechanism already handles global variable scoping correctly. Local variables declared with `var.X` automatically shadow globals with the same name.

### Testing Strategy

**Manual testing with example app:**
1. Create Main.xmlui with the example code
2. Create IncButton.xmlui component
3. Deploy as buildless app (no build step)
4. Verify:
   - Text shows "Count: 42" initially
   - First 3 buttons show "42" in labels
   - 4th button shows "0" (local variable shadows global)
   - Clicking first 3 buttons increments shared global count
   - Clicking 4th button increments only its local count
   - All components showing global count update together

**Key scenarios:**
- Global variable access from Main.xmlui ✓
- Global variable access from child component ✓
- Local variable shadowing ✓
- Reactivity across component boundaries ✓

### Technical Notes

**Variable Storage:**
- Variables are stored in ComponentDef's `vars` property (Record<string, any>)
- Resolved by `useVars()` hook in StateContainer.tsx
- Proxified for change detection via `buildProxy()`

**State Composition (StateContainer.tsx lines 510-520):**
```typescript
const combinedState = useCombinedState(
  stateFromOutside,    // Parent state (includes parent's vars)
  node.contextVars,    // Framework context variables ($item, etc)
  mergedWithVars,      // Local variables and component state
  routingParams,       // Routing parameters
);
```

Global variables flow through `stateFromOutside` (parent state), making them available to expressions and event handlers.

**Container Creation (`isContainerLike()` in ContainerWrapper.tsx):**
A container is created when a component has any of:
- `loaders` (data loading)
- `vars` (variable declarations)
- `uses` (parent state scoping)
- `contextVars` (context variables)
- `functions` (function declarations)
- `scriptCollected` (script blocks)

### Next Steps

1. ✅ Test the hardcoded prototype manually
2. Choose approach for dynamic global variables (recommend Option A: AppState.xmlui)
3. Implement chosen approach
4. Add documentation
5. Consider advanced features (if needed):
   - Global variable validation/types
   - Global variable initialization order
   - Global variable reset/clear APIs
   - DevTools integration for global state inspection
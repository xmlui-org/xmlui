# Container & State Management Refactoring Plan

## Current Architecture Analysis

### File Structure & Size
- **StateContainer.tsx**: 1,130 lines - State composition pipeline (6 layers)
- **Container.tsx**: 1,143 lines - Event handling, rendering, lifecycle
- **ContainerWrapper.tsx**: 256 lines - Containerization logic
- **reducer.ts**: 181 lines - State reducer
- **ContainerUtils.ts**: 123 lines - Pure utility functions
- **buildProxy.ts**: 92 lines - Proxy-based change tracking
- **containers.ts**: 38 lines - Action types
- **Total**: ~3,000 lines

### Key Responsibilities

**StateContainer.tsx**:
- 6-layer state composition pipeline:
  1. Parent state scoping (via `uses`)
  2. Component reducer state
  3. Component APIs
  4. Context variables
  5. Local variable resolution (two-pass for forward references)
  6. Routing parameters
- Global variable evaluation and dependency tracking
- Inspector logging for variable changes (~200 lines)
- Variable resolution with memoization
- Routing integration

**Container.tsx**:
- Async event handler execution (`runCodeAsync`) - ~400 lines
- Sync event handler execution (`runCodeSync`) - ~50 lines
- Event handler caching and lifecycle - ~150 lines
- Inspector logging for handlers (~300 lines)
- Child rendering via `renderChild`
- Loader rendering
- Statement execution with state tracking
- React transition management
- API registration

**ContainerWrapper.tsx**:
- Implicit vs explicit container determination
- Component wrapping logic
- Error boundary integration
- Props forwarding to StateContainer

### Key Issues

1. **Monolithic Files**: Container.tsx and StateContainer.tsx exceed 1,100 lines each
2. **Mixed Concerns**: Inspector logging intermingled with business logic
3. **Complex Control Flow**: Deeply nested callbacks, multiple useEvent/useCallback hooks
4. **Difficult Navigation**: Reader must hop between many sections
5. **Hidden Dependencies**: Ref juggling and closure-based state management
6. **Verbose Logging**: Inspector code adds ~500 lines across both files
7. **Duplication**: Similar error handling, logging, and caching patterns

### Dependencies & Integration Points

**External Dependencies**:
- React hooks (useState, useReducer, useMemo, useCallback, useEffect, useRef)
- React Router (useLocation, useNavigate, useParams, useSearchParams)
- Immer (produce) for immutable updates
- Lodash (cloneDeep, merge, isEmpty, etc.)
- memoize-one for function memoization

**Internal Dependencies**:
- AppContext (global app utilities)
- ThemeContext (theming support)
- DebugViewProvider (debug configuration)
- ApiInterceptorContext (API interception)
- Script runner (statement processing, tree evaluation)
- Inspector utilities (logging, tracing)
- Proxy builder (change tracking)

**Integration Points**:
- Component renderers (via RendererContext)
- LoaderComponent (async data loading)
- ErrorBoundary (error handling)
- ComponentWrapper (component routing)
- renderChild (child rendering)

## Refactoring Goals

1. **Reduce file size** to ~300-500 lines per file
2. **Improve readability** with linear code flow
3. **Separate concerns** into focused modules
4. **Extract inspector logic** into dedicated files
5. **Simplify state composition** with clearer boundaries
6. **Add strategic comments** for complex flows
7. **Maintain backward compatibility** (no breaking changes to component API)
8. **Enable testing** through better separation

## Proposed Architecture

### New File Structure

```
rendering/
├── Container.tsx                    (~300 lines) - Core container orchestration
├── StateContainer.tsx               (~400 lines) - State composition pipeline
├── ContainerWrapper.tsx             (~256 lines) - No changes
├── container/
│   ├── event-handlers.ts           (~300 lines) - Event execution logic
│   ├── event-handler-cache.ts      (~150 lines) - Handler caching & lifecycle
│   ├── action-lookup.ts            (~200 lines) - Action resolution functions
│   └── child-rendering.ts          (~150 lines) - renderChild & loader logic
├── state/
│   ├── state-layers.ts             (~250 lines) - Layer composition functions
│   ├── variable-resolution.ts      (~200 lines) - Two-pass variable resolution
│   ├── global-variables.ts         (~150 lines) - Global var evaluation
│   └── routing-state.ts            (~100 lines) - Routing parameter integration
├── inspector/
│   ├── handler-logging.ts          (~200 lines) - Handler execution logging
│   ├── variable-logging.ts         (~200 lines) - Variable change logging
│   └── state-logging.ts            (~100 lines) - State change logging
├── reducer.ts                       (~181 lines) - No changes
├── ContainerUtils.ts                (~123 lines) - No changes
├── buildProxy.ts                    (~92 lines) - No changes
└── containers.ts                    (~38 lines) - No changes
```

### Module Responsibilities

**container/event-handlers.ts**:
- `createEventExecutor(config)` - Returns runCodeAsync and runCodeSync
- Statement parsing and preparation
- State change tracking and proxy management
- React transition coordination
- Error handling and propagation

**container/event-handler-cache.ts**:
- `createEventHandlerCache()` - Handler caching infrastructure
- `getOrCreateEventHandlerFn()` - Handler lookup/creation
- Lifecycle tracking (started, completed, error)
- Source info storage for inspector

**container/action-lookup.ts**:
- `createActionLookup(config)` - Returns lookupAction and lookupSyncCallback
- Sync callback resolution
- Async action resolution
- Ephemeral action handling

**container/child-rendering.ts**:
- `createChildRenderer(config)` - Returns renderChild function
- Loader component rendering
- Layout context management
- Children rendering logic

**state/state-layers.ts**:
- `extractParentState(parentState, uses)` - Layer 1: Parent state scoping
- `mergeComponentState(reducerState, apis)` - Layer 2+3: Reducer + APIs
- `addContextVariables(state, contextVars)` - Layer 4: Context vars
- `addRoutingState(state, routing)` - Layer 6: Routing params
- `composeFinalState(layers)` - Combines all layers

**state/variable-resolution.ts**:
- `resolveVariables(definitions, dependencies, context, cache)` - Two-pass resolution
- `collectFunctionDependencies(definitions)` - Dependency collection
- `evaluateVariable(definition, context)` - Single variable evaluation
- Clear documentation of two-pass strategy

**state/global-variables.ts**:
- `resolveGlobalVariables(config)` - Global variable evaluation
- `collectGlobalDependencies(globalVars)` - Dependency tracking
- `evaluateGlobalExpression(expr, context)` - Expression evaluation
- Runtime change detection

**state/routing-state.ts**:
- `useRoutingParams()` - Routing parameter hook
- `extractRoutingState(location, params, search, linkInfo)` - State extraction
- Route variable mapping ($pathname, $routeParams, etc.)

**inspector/handler-logging.ts**:
- `createHandlerLogger(config)` - Returns logging functions
- `logHandlerStart(details)` - Log handler execution start
- `logHandlerComplete(details)` - Log handler completion
- `logHandlerError(details)` - Log handler errors
- `formatHandlerLog(details)` - Format log entries

**inspector/variable-logging.ts**:
- `createVariableLogger(config)` - Returns logging functions
- `logVariableInit(vars)` - Log initial variable values
- `logVariableChange(changes)` - Log variable changes
- `trackVariableChanges(prev, current)` - Change detection
- Source file resolution logic

**inspector/state-logging.ts**:
- `createStateLogger(config)` - Returns logging functions
- `logStateChange(change)` - Log state changes
- `formatStateChange(change)` - Format change details

## Refactoring Steps

### Step 1: Extract Inspector Logging ✅ COMPLETED
**Goal**: Remove ~500 lines of logging code from Container.tsx and StateContainer.tsx

**Files created**:
- ✅ `inspector/handler-logging.ts` (450 lines)
- ✅ `inspector/variable-logging.ts` (350 lines)
- ✅ `inspector/state-logging.ts` (150 lines)

**Changes completed**:
- ✅ Extracted handler logging functions from Container.tsx
- ✅ Extracted variable logging from StateContainer.tsx
- ✅ Replaced inline logging with function calls
- ✅ Maintained same logging behavior and format

**Results**:
- ✅ Container.tsx reduced from 1,143 to 1,048 lines (95 lines / 8.3% reduction)
- ✅ StateContainer.tsx reduced from 1,130 to 918 lines (212 lines / 18.8% reduction)
- ✅ Total reduction: 307 lines from core files
- ✅ No linting errors

**Testing status**:
- ⏳ Needs manual testing in browser with xsVerbose mode
- ⏳ Needs verification of handler execution logging
- ⏳ Needs verification of variable change tracking

---

### Step 2: Extract Event Handler Management
**Goal**: Separate event handling logic from Container.tsx

**Files to create**:
- `container/event-handlers.ts`
- `container/event-handler-cache.ts`

**Changes**:
- Extract `runCodeAsync` (~400 lines) to event-handlers.ts
- Extract `runCodeSync` (~50 lines) to event-handlers.ts
- Extract `getOrCreateEventHandlerFn` (~100 lines) to event-handler-cache.ts
- Extract lifecycle tracking (started/completed/error dispatches)
- Create factory functions that return configured handlers
- Maintain closure-based access to refs and state

**Interface**:
```typescript
// event-handlers.ts
export function createEventExecutor(config: EventExecutorConfig) {
  return {
    runCodeAsync: (source, uid, options, ...args) => Promise<any>,
    runCodeSync: (arrowExpr, ...args) => any
  };
}

// event-handler-cache.ts
export function createEventHandlerCache(config: CacheConfig) {
  return {
    getOrCreateHandlerFn: (source, uid, options) => Function,
    cleanup: (uid) => void
  };
}
```

**Testing**:
- Test async event handlers
- Test sync callbacks
- Verify handler caching works
- Test lifecycle flags (clickInProgress, etc.)
- Verify error handling and propagation

**Success criteria**:
- Container.tsx reduced by ~550 lines
- Event handler logic isolated and testable
- All event-based components work correctly
- No linting errors

---

### Step 3: Extract Action Lookup Functions
**Goal**: Separate action resolution from Container.tsx

**Files to create**:
- `container/action-lookup.ts`

**Changes**:
- Extract `lookupAction` (~100 lines)
- Extract `lookupSyncCallback` (~60 lines)
- Extract `getOrCreateSyncCallbackFn` (~50 lines)
- Create factory function returning lookup functions

**Interface**:
```typescript
// action-lookup.ts
export function createActionLookup(config: ActionLookupConfig) {
  return {
    lookupAction: (action, uid, options) => Promise<any>,
    lookupSyncCallback: (callback, uid) => Function
  };
}
```

**Testing**:
- Test action lookup from event handlers
- Test sync callback resolution
- Verify ephemeral actions work
- Test context propagation

**Success criteria**:
- Container.tsx reduced by ~200 lines
- Action lookup isolated
- All action-based features work
- No linting errors

---

### Step 4: Extract Child Rendering
**Goal**: Separate rendering logic from Container.tsx

**Files to create**:
- `container/child-rendering.ts`

**Changes**:
- Extract `stableRenderChild` (~150 lines)
- Extract loader rendering logic
- Extract layout context management

**Interface**:
```typescript
// child-rendering.ts
export function createChildRenderer(config: ChildRendererConfig) {
  return {
    renderChild: (child, layoutContext) => ReactNode,
    renderLoaders: (loaders) => ReactNode
  };
}
```

**Testing**:
- Test child component rendering
- Test loader states (loading, loaded, error)
- Verify layout context propagation
- Test nested children

**Success criteria**:
- Container.tsx reduced by ~150 lines
- Rendering logic isolated
- All components render correctly
- No linting errors

---

### Step 5: Simplify Container.tsx
**Goal**: Container.tsx becomes orchestration hub (~300 lines)

**Changes**:
- Import and use extracted modules
- Simplify hook composition
- Add clear section comments
- Document the orchestration flow

**Structure**:
```typescript
// Container.tsx (~300 lines)
export const Container = memo(forwardRef(function Container(props, ref) {
  // ========== SETUP ==========
  // Context, refs, state
  
  // ========== INSPECTOR ==========
  const handlerLogger = useHandlerLogger(config);
  const stateLogger = useStateLogger(config);
  
  // ========== EVENT HANDLERS ==========
  const { runCodeAsync, runCodeSync } = useEventExecutor(config);
  const { getOrCreateHandlerFn, cleanup } = useEventHandlerCache(config);
  
  // ========== ACTION LOOKUP ==========
  const { lookupAction, lookupSyncCallback } = useActionLookup(config);
  
  // ========== RENDERING ==========
  const { renderChild, renderLoaders } = useChildRenderer(config);
  
  // ========== LIFECYCLE ==========
  useEffect(...);
  
  // ========== RENDER ==========
  return <>{renderLoaders()}{renderChild(node.children)}</>;
}));
```

**Testing**:
- Run all existing Container tests
- Verify full integration works
- Test complex event scenarios
- Check performance (should be same or better)

**Success criteria**:
- Container.tsx is ~300 lines
- Clear linear flow
- All tests pass
- No performance regression

---

### Step 6: Extract State Layer Composition
**Goal**: Make StateContainer's 6-layer pipeline explicit and clear

**Files to create**:
- `state/state-layers.ts`

**Changes**:
- Extract layer composition into separate functions
- Create clear pipeline with named steps
- Add diagram comments

**Interface**:
```typescript
// state-layers.ts
export function composeContainerState(config: StateCompositionConfig) {
  // Layer 1: Parent state scoping
  const parentScoped = extractParentState(config.parentState, config.uses);
  
  // Layer 2: Component reducer state
  const withReducer = { ...parentScoped, ...config.reducerState };
  
  // Layer 3: Component APIs
  const withApis = mergeComponentApis(withReducer, config.apis);
  
  // Layer 4: Context variables
  const withContext = { ...withApis, ...config.contextVars };
  
  // Layer 5: Local variables
  const withVars = { ...withContext, ...config.localVars };
  
  // Layer 6: Routing parameters
  const final = { ...withVars, ...config.routingState };
  
  return final;
}
```

**Testing**:
- Test state scoping with `uses` property
- Test variable shadowing
- Verify layer priority (later overrides earlier)
- Test routing parameter injection

**Success criteria**:
- State composition is explicit and clear
- Pipeline is easy to understand
- All state-based features work
- No linting errors

---

### Step 7: Extract Variable Resolution
**Goal**: Clarify two-pass variable resolution logic

**Files to create**:
- `state/variable-resolution.ts`

**Changes**:
- Extract `useVars` hook and related logic (~200 lines)
- Extract dependency collection
- Document two-pass strategy clearly

**Interface**:
```typescript
// variable-resolution.ts
/**
 * Resolves variables with two-pass strategy:
 * 
 * Pass 1: Pre-resolve variables to handle forward references
 * Pass 2: Final resolution with complete context
 * 
 * Example: { fn: "$props.value", $props: "{x: 1}" }
 * Pass 1: fn gets undefined (props not yet resolved)
 * Pass 2: fn gets {x: 1} (props now available)
 */
export function useVariableResolution(config: VarResolutionConfig) {
  // Pass 1: Pre-resolution
  const preResolved = resolveVariables(config.definitions, config.baseContext);
  
  // Pass 2: Final resolution with pre-resolved vars
  const finalResolved = resolveVariables(
    config.definitions,
    { ...config.baseContext, ...preResolved }
  );
  
  return finalResolved;
}
```

**Testing**:
- Test forward references (function using var defined later)
- Test circular dependencies (should handle gracefully)
- Test dependency changes triggering re-evaluation
- Verify memoization works

**Success criteria**:
- Two-pass strategy is well-documented
- Variable resolution is testable
- All variable scenarios work
- No linting errors

---

### Step 8: Extract Global Variable Logic
**Goal**: Separate global variable handling from StateContainer.tsx

**Files to create**:
- `state/global-variables.ts`

**Changes**:
- Extract global variable evaluation (~150 lines)
- Extract dependency tracking
- Extract runtime change detection

**Interface**:
```typescript
// global-variables.ts
export function useGlobalVariables(config: GlobalVarConfig) {
  const dependencies = collectGlobalDependencies(config.globalVars);
  const evaluated = evaluateGlobalVariables(
    config.globalVars,
    config.context,
    dependencies
  );
  return evaluated;
}
```

**Testing**:
- Test global variable access
- Test global variable updates
- Test dependency tracking
- Verify local vars can shadow globals

**Success criteria**:
- Global variable logic isolated
- Dependency tracking clear
- All global var features work
- No linting errors

---

### Step 9: Extract Routing State Integration
**Goal**: Separate routing concerns from StateContainer.tsx

**Files to create**:
- `state/routing-state.ts`

**Changes**:
- Extract `useRoutingParams` hook (~50 lines)
- Extract routing state extraction
- Consolidate routing variable mapping

**Interface**:
```typescript
// routing-state.ts
export function useRoutingParams() {
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const linkInfo = useLinkInfoContext();
  
  return extractRoutingState(location, params, searchParams, linkInfo);
}
```

**Testing**:
- Test $pathname variable
- Test $routeParams access
- Test $queryParams access
- Test route navigation

**Success criteria**:
- Routing logic isolated
- State variables work correctly
- Navigation features work
- No linting errors

---

### Step 10: Extract Variable Inspector Logging
**Goal**: Remove variable logging from StateContainer.tsx

**Files to modify**:
- `inspector/variable-logging.ts` (already created in Step 1, enhance here)

**Changes**:
- Move complex variable logging (~200 lines)
- Consolidate source file resolution
- Handle deferred init logging

**Testing**:
- Test variable init logging
- Test variable change logging
- Verify source file resolution
- Check deferred logging works

**Success criteria**:
- StateContainer.tsx reduced by ~200 lines
- Variable tracking works identically
- Source attribution correct
- No linting errors

---

### Step 11: Simplify StateContainer.tsx
**Goal**: StateContainer.tsx becomes state composition hub (~400 lines)

**Changes**:
- Import and use extracted modules
- Simplify hook composition
- Add clear section comments for remaining code
- Document state pipeline with diagrams

**Structure**:
```typescript
// StateContainer.tsx (~400 lines)
export const StateContainer = memo(forwardRef(function StateContainer(props, ref) {
  // ========== LAYER 1: PARENT STATE ==========
  const parentScoped = extractParentState(parentState, node.uses);
  
  // ========== LAYER 2: REDUCER STATE ==========
  const [componentState, dispatch] = useReducer(containerReducer, {});
  
  // ========== LAYER 3: COMPONENT APIS ==========
  const [componentApis, setComponentApis] = useState({});
  const withApis = mergeComponentApis(componentState, componentApis);
  
  // ========== LAYER 4: CONTEXT VARS ==========
  const withContext = { ...withApis, ...node.contextVars };
  
  // ========== LAYER 5: LOCAL VARS ==========
  const localVars = useVariableResolution({ ... });
  const withVars = { ...withContext, ...localVars };
  
  // ========== LAYER 6: ROUTING & GLOBALS ==========
  const routingState = useRoutingParams();
  const globalVars = useGlobalVariables({ ... });
  const finalState = { ...withVars, ...routingState };
  
  // ========== INSPECTOR ==========
  useVariableLogger({ ... });
  
  // ========== STATE CHANGE HANDLER ==========
  const statePartChanged = useCallback(...);
  
  // ========== RENDER ==========
  return (
    <ErrorBoundary>
      <Container
        componentState={finalState}
        globalVars={globalVars}
        dispatch={dispatch}
        statePartChanged={statePartChanged}
        registerComponentApi={registerComponentApi}
        {...rest}
      />
    </ErrorBoundary>
  );
}));
```

**Testing**:
- Run all existing StateContainer tests
- Test complete state composition
- Verify variable resolution
- Test state change propagation

**Success criteria**:
- StateContainer.tsx is ~400 lines
- State pipeline is explicit and clear
- All tests pass
- No performance regression

---

### Step 12: Add Documentation & Comments
**Goal**: Make code self-documenting and easy to understand

**Changes**:
- Add JSDoc comments to all extracted functions
- Add flow diagrams to complex logic
- Document edge cases and gotchas
- Add usage examples in comments

**Areas to document**:
- Two-pass variable resolution strategy
- Event handler lifecycle
- State layer composition priority
- Inspector logging integration
- Caching strategies

**Testing**:
- Code review for clarity
- Verify docs match implementation
- Check examples are accurate

**Success criteria**:
- All modules well-documented
- Complex flows have diagrams
- Edge cases noted
- Examples provided

---

### Step 13: Final Integration Testing
**Goal**: Verify entire refactored system works correctly

**Testing strategy**:
1. Run all unit tests: `npm run test:unit`
2. Run E2E tests for container features:
   - Variable state management
   - Event handlers
   - Loaders
   - State scoping with `uses`
   - Global variables
   - Routing integration
3. Manual testing:
   - Inspector logging in browser
   - Complex component scenarios
   - Performance profiling
4. Check for regressions:
   - Compare bundle size
   - Measure render performance
   - Verify all existing apps work

**Success criteria**:
- All tests pass
- No observable regressions
- Bundle size same or smaller
- Performance same or better
- All features work identically

---

### Step 14: Update Documentation
**Goal**: Update dev docs to reflect new architecture

**Files to update**:
- `dev-docs/containers.md` - Update architecture section
- `dev-docs/standalone-app.md` - Update Container & StateContainer sections
- `dev-docs/conv-create-components.md` - Update if needed

**Changes**:
- Document new file structure
- Update architecture diagrams
- Add references to new modules
- Update code examples

**Success criteria**:
- Documentation accurate
- Architecture clear
- Examples updated
- Cross-references correct

## Testing Strategy

### Unit Tests
- Test each extracted module independently
- Focus on pure functions where possible
- Mock dependencies for integration points
- Achieve >80% code coverage for new modules

### Integration Tests
- Test Container + extracted modules together
- Test StateContainer + extracted modules together
- Verify state composition pipeline
- Test event handler execution flows

### E2E Tests
- Use existing E2E tests as regression suite
- Add tests for edge cases discovered during refactoring
- Test inspector logging features
- Verify component isolation

### Performance Testing
- Compare before/after render times
- Check memory usage
- Verify no new performance bottlenecks
- Profile event handler execution

## Rollout Plan

1. **Steps 1-4**: Extract inspector and event handling (lowest risk)
2. **Step 5**: Simplify Container.tsx (verify integration)
3. **Steps 6-10**: Extract state management (medium risk)
4. **Step 11**: Simplify StateContainer.tsx (verify integration)
5. **Steps 12-14**: Documentation and final testing

## Risk Mitigation

- Keep original files for comparison during development
- Run tests after each step before proceeding
- Use feature flags if needed for gradual rollout
- Have rollback plan (revert commits) if issues arise
- Test with real-world apps (docs site, playground, etc.)

## Success Metrics

- Container.tsx: 1,143 → ~300 lines (74% reduction)
- StateContainer.tsx: 1,130 → ~400 lines (65% reduction)
- Improved maintainability (subjective, via code review)
- No performance regression (<5% variance)
- All tests passing
- Documentation updated and accurate

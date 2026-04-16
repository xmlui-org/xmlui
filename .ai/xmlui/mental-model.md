# XMLUI Mental Model & Request Lifecycle

## What XMLUI Is

- Declarative-reactive frontend framework: XML markup → React component tree
- Users write `.xmlui` files, never JSX or raw React
- Every `{expression}` re-evaluates automatically when its dependencies change (spreadsheet-like reactivity)
- Built on React, but React is an implementation detail hidden from markup authors

## Two Deployment Modes

| Mode | Entry | Parsing | Component discovery | Use case |
|------|-------|---------|---------------------|----------|
| **Standalone (buildless)** | `index.html` loads `xmlui-standalone.umd.js` | Runtime: fetches + parses `.xmlui` at startup | Scans `components/` directory | Static hosting, no build step |
| **Vite (built)** | `import.meta.glob()` bundles all `.xmlui` at build time | Build-time: compiled to JS modules. `{expressions}` and event handlers still interpreted at runtime by the scripting engine | Pre-bundled via glob imports | Production, HMR during dev |

Both modes converge at `AppRoot` — the rendering pipeline is identical after component resolution.

## Key Abstractions

| Abstraction | Type / File | Role |
|-------------|-------------|------|
| `ComponentDef` | `abstractions/ComponentDefs.ts` | Parsed representation of an XML element: `type`, `props`, `events`, `children`, `vars`, `loaders`, `when`, `uses` |
| `ComponentRendererDef` | `abstractions/RendererDefs.ts` | Registry entry mapping component type → renderer function + metadata |
| `CompoundComponentDef` | `abstractions/ComponentDefs.ts` | User-defined component: `name` + `component` (template tree) + optional `script` |
| `ContainerState` | `abstractions/ContainerDefs.ts` | Flat key-value state object managed by a container's reducer |
| `RendererContext` | `abstractions/RendererDefs.ts` | Passed to every renderer: `uid`, `node.props`, `state`, `extractValue`, `renderChild`, `lookupEventHandler`, `updateState`, `registerComponentApi` |
| `AppContextObject` | `abstractions/AppContextDefs.ts` | Global utilities: `navigate()`, `toast()`, `confirm()`, `Actions.*`, date/math helpers |

## Bootstrap Sequence

```
StandaloneApp
  → resolves mode (buildless: fetch+parse / built: use pre-compiled modules)
  → ApiInterceptorProvider (optional API mocking)
    → AppRoot
      → wraps entry point in root Container + Theme node
      → ComponentProvider (component registry)
        → StyleProvider (CSS-in-JS registry)
          → DebugViewProvider
            → AppWrapper
              → Router (Hash/Browser/Memory)
                → QueryClientProvider (TanStack React Query)
                  → HelmetProvider (document head)
                    → LoggerProvider
                      → IconProvider
                        → ThemeProvider
                          → InspectorProvider
                            → ConfirmationModalContextProvider
                              → AppContent
                                → AppContext.Provider (global functions)
                                  → root StateContainer → Container → renderChild()
```

## Rendering Loop

`renderChild()` is the recursive core. Called for every node in the component tree.

### renderChild decision tree

1. Check `when` / `responsiveWhen` → skip if false (exception: nodes with `init` event handler render once)
2. **TextNodeCData** → return raw text value
3. **TextNode** → evaluate expression via `extractParam()`, return text
4. **Slot** → resolve named/default slot children, render with parent context
5. **Any other type** → wrap in `<ComponentWrapper>`

### ComponentWrapper pipeline

1. Apply node transformations (memoized):
   - `childrenAsTemplate` → move children to a prop
   - child `<DataSource>` → convert to `loaders` array
   - `dataSourceRef` prop → convert to virtual `DataSourceRef` node
   - `data` string prop → convert to `<DataSource>` component
   - `raw_data` prop → convert to pre-resolved data
2. Route to the right renderer:
   - **Container-like** (has `vars`, `functions`, `uses`, or `loaders`) → `ContainerWrapper` → `StateContainer` → `Container`
   - **Stateless** → `ComponentAdapter` (direct render, no container overhead)

## State Composition (6 Layers)

`StateContainer` composes state bottom-up. Later layers shadow earlier ones.

| Layer | Source | How |
|-------|--------|-----|
| 1. Parent state | Inherited from parent container, scoped by `uses` prop | `stateFromOutside` |
| 2. Component reducer | `useReducer(createContainerReducer())` — handles loader results, events, component state changes | `componentState` |
| 3. Component APIs | Registered via `registerComponentApi()` — merged into state | `componentStateWithApis` |
| 4. Context variables | `$item`, `$itemIndex`, slot props; `$pathname`, `$routeParams`, `$queryParams` via `useRoutingParams()` | `localVarsStateContext` |
| 5. Local variables | Two-pass resolution: pass 1 pre-resolves (handles forward refs), pass 2 finalizes with persistent cache | `resolvedLocalVars` |
| 6. Global variables | App-wide state owned by root container; passed down as `parentGlobalVars` | `stableCurrentGlobalVars` |

Final: `useCombinedState()` merges all layers into a single flat object.

## State Mutation Routing

When `statePartChanged(key, value)` is called:

```
Is key a local var?        → dispatch locally
Is key a global var?
  Am I root container?     → dispatch locally
  Not root?                → bubble to parent via parentStatePartChanged()
Is key in componentState?  → dispatch locally
Otherwise                  → bubble to parent (if `uses` boundary allows)
```

## Reducer Actions

| `ContainerActionKind` | Trigger | Effect |
|-----------------------|---------|--------|
| `LOADER_IN_PROGRESS_CHANGED` | DataSource fetch starts/stops | Sets loader `inProgress` flag |
| `LOADER_IS_REFETCHING_CHANGED` | DataSource refetching | Sets `isRefetching` flag |
| `LOADER_LOADED` | DataSource returns data | Updates `state[uid].value`, builds `byId` map, sets `loaded: true` |
| `LOADER_ERROR` | DataSource fails | Sets `error`, marks `loaded: true` |
| `EVENT_HANDLER_STARTED` | Event handler begins | Sets `${eventName}InProgress: true` |
| `EVENT_HANDLER_COMPLETED` | Event handler ends | Sets `${eventName}InProgress: false` |
| `EVENT_HANDLER_ERROR` | Event handler fails | Sets `${eventName}InProgress: false` |
| `COMPONENT_STATE_CHANGED` | Native component calls `updateState` | Merges new state into `state[uid]` |
| `STATE_PART_CHANGED` | Expression assigns to a variable | Path-based update via immer `setWith()` |

All reducer mutations use immer `produce()` — immutable under the hood.

## Container: Event Execution & Child Rendering

`Container` creates four subsystems:

| Subsystem | Factory | Purpose |
|-----------|---------|---------|
| Event handlers | `createEventHandlers()` | `runCodeAsync` / `runCodeSync` — execute parsed statements |
| Handler cache | `createEventHandlerCache()` | Memoize event handler functions by source code |
| Action lookup | `createActionLookup()` | Resolve `lookupAction` / `lookupSyncCallback` for nested actions |
| Child renderer | `createChildRenderer()` | Stable `renderChild` function closed over current state |

Renders: `{renderedLoaders}` (DataSource components) + `{renderedChildren}` (recursive via `stableRenderChild`).

## Reactivity Cycle (How a Click Becomes a UI Update)

1. User clicks a `<Button>`
2. React calls the button's `onClick` handler
3. Handler is a cached function from `createEventHandlerCache`
4. `runCodeAsync()` evaluates the handler's parsed statements against current state
5. Statement like `count++` calls `statePartChanged("count", newValue)`
6. Mutation routing finds the owning container and dispatches `STATE_PART_CHANGED`
7. immer `produce()` creates new state, React re-renders the container subtree
8. `renderChild()` re-evaluates `{count}` expressions in children → DOM updates

## Implicit vs Explicit Containers

`StateContainer` and `Container` are always paired and have distinct roles:
- **`StateContainer`** — owns state: composes the 6 layers, provides merged state object
- **`Container`** — owns behaviour: creates event handlers, action lookup, stable `renderChild`; renders children and loaders

- **Explicit**: node has `vars`, `functions`, `uses`, or `loaders` → gets its own `StateContainer` + `Container` pair
- **Implicit**: framework wraps certain nodes (user-defined components) automatically
- Implicit containers delegate `dispatch` and `registerComponentApi` to the parent

## Key Files

| File | Path |
|------|------|
| renderChild | `xmlui/src/components-core/rendering/renderChild.tsx` |
| ComponentWrapper | `xmlui/src/components-core/rendering/ComponentWrapper.tsx` |
| StateContainer | `xmlui/src/components-core/rendering/StateContainer.tsx` |
| Container | `xmlui/src/components-core/rendering/Container.tsx` |
| AppRoot | `xmlui/src/components-core/rendering/AppRoot.tsx` |
| AppWrapper | `xmlui/src/components-core/rendering/AppWrapper.tsx` |
| StandaloneApp | `xmlui/src/components-core/StandaloneApp.tsx` |
| reducer | `xmlui/src/components-core/rendering/reducer.ts` |
| ComponentDefs | `xmlui/src/abstractions/ComponentDefs.ts` |
| RendererDefs | `xmlui/src/abstractions/RendererDefs.ts` |
| ContainerDefs | `xmlui/src/abstractions/ContainerDefs.ts` |
| AppContextDefs | `xmlui/src/abstractions/AppContextDefs.ts` |

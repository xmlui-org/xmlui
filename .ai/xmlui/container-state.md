# Container & State System

## Overview

Every stateful XMLUI component lives inside a **container** — an invisible React boundary that owns a state object and a reducer. `StateContainer` composes the state; `Container` wires up event handling and child rendering.

## When a Container Is Created

`isContainerLike(node)` returns true when ANY of these are present:

```
node.loaders | node.vars | node.uses | node.contextVars | node.functions | node.scriptCollected
```

An `id` attribute alone does NOT create a container.

## Implicit vs Explicit Containers

| Aspect | Implicit | Explicit |
|--------|----------|----------|
| Created when | `vars`, `loaders`, `functions`, or `scriptCollected` on a non-Container node | Node type is `Container` OR has `uses` prop |
| `uses` value | `undefined` | Array of inherited keys (may be empty `[]`) |
| Parent state | Inherits **all** parent state | Inherits **only** keys listed in `uses` |
| Own reducer | Shares parent's dispatcher | Owns its own `useReducer` |
| State boundary | No — mutations bubble up transparently | Yes — mutations to inherited keys bubble up; local keys stay |

## State Composition Layers

`StateContainer` composes state from 7 sources. Later layers shadow earlier ones.

| Layer | Source | Internal hook / call | Shadows previous? |
|-------|--------|---------------------|-------------------|
| 1 | Parent state | `extractScopedState(parentState, node.uses)` | — |
| 2 | Component reducer state | `useReducer(containerReducer, {})` | Yes |
| 3 | Component APIs | `mergeComponentApis(componentState, componentApis)` — uses `Symbol.description` (= `id` string) as state key | Yes |
| 4 | Context variables | `useCombinedState(layers 1–3, node.contextVars, routingParams)` — `$item`, `$itemIndex`, `$pathname`, `$routeParams` | Yes |
| 5 | Local variables (two-pass) | `useVars()` called twice (pre-resolve + final resolve) | Yes |
| 6 | Global variables | `useGlobalVariables(parentGlobalVars, node.globalVars, node.functions, componentStateWithApis)` | Yes |

Post-processing: `useCombinedState()` merges all 6 layers into a flat object; `__liveApiRef__` sentinels then resolved to actual values.

### Layer 1: Parent State Scoping — `extractScopedState`

```typescript
extractScopedState(parentState, uses?)
// uses === undefined  → return all parent state
// uses === []         → return {} (full boundary)
// uses === ['count']  → return { count: parentState.count }
```

### Layer 5: Two-Pass Variable Resolution

Handles forward references (variable B references variable A declared after it).

- **Pass 1** — Resolve with temporary memoization cache. Produces partial results.
- **Pass 2** — Re-resolve with pass-1 results merged into context + persistent cache. Produces final values.

### Layer 7: Live Reference Resolution

When an event handler assigns `myVar = ds` (a component API reference), the reducer stores `{ __liveApiRef__: "ds" }`. Layer 7 replaces these sentinels with the actual current value of the referenced key.

## Variable Re-evaluation Rule

`var.foo="{someExpr}"` re-evaluates `someExpr` on every render from scratch. When a mutation is detected, the new value lands in reducer state and **shadows** the initial expression from that point forward.

## Reducer

Created via `createContainerReducer(debugView)` using Immer `produce()`.

### ContainerActionKind Enum (9 actions)

| Action | Trigger | State effect |
|--------|---------|-------------|
| `LOADER_IN_PROGRESS_CHANGED` | DataSource starts/stops loading | Sets `inProgress` flag |
| `LOADER_IS_REFETCHING_CHANGED` | Refetch after initial load | Sets `isRefetching` flag |
| `LOADER_LOADED` | DataSource succeeds | Sets `value`, `byId` (array index by `$id`), `loaded`, `pageInfo`, `responseHeaders`; clears `inProgress` |
| `LOADER_ERROR` | DataSource fails | Sets `error`, clears `inProgress`, sets `loaded: true` |
| `EVENT_HANDLER_STARTED` | Event handler begins | Sets `{eventName}InProgress: true` |
| `EVENT_HANDLER_COMPLETED` | Event handler finishes | Sets `{eventName}InProgress: false` |
| `EVENT_HANDLER_ERROR` | Event handler throws | Sets `{eventName}InProgress: false` |
| `COMPONENT_STATE_CHANGED` | Native component calls `updateState` | Shallow-merges new state into UID's state |
| `STATE_PART_CHANGED` | Proxy intercepts mutation | Deep-sets value at path using lodash `setWith`; supports `unset` for delete |

### ContainerState Shape

```typescript
type ContainerState = Record<uid, {
  // Loader fields
  value?: any;
  byId?: Record<string, any>;
  inProgress?: boolean;
  isRefetching?: boolean;
  loaded?: boolean;
  error?: any;
  pageInfo?: any;
  responseHeaders?: Record<string, string>;
  // Event handler flags
  [eventName + "InProgress"]?: boolean;
  // Component state (arbitrary keys)
  [key: string]: any;
}>;
```

## Proxy-Based Mutation Tracking — `buildProxy`

`buildProxy(target, callback, tree)` returns a JS `Proxy` that intercepts:

| Trap | Behaviour |
|------|-----------|
| `get` | Returns proxied versions of nested objects/arrays (cached via WeakMap). Skips: primitives, frozen objects, arrow expressions. |
| `set` | Compares old/new (reference then JSON deep-equal). If changed: calls callback with `{ action: "set", path, pathArray, target, newValue, previousValue }`. |
| `deleteProperty` | Calls callback with `{ action: "unset", path, pathArray, target }`. |

**No-op optimisation:** If `previousValue === newValue` or deep-equal via `JSON.stringify`, the set is a no-op — no callback fires.

## Mutation Routing — `statePartChanged`

When a proxy callback fires, `statePartChanged` in `StateContainer` routes the mutation:

```
Is the key a local variable?      → dispatch STATE_PART_CHANGED locally
Is the key a global variable?
  ├── Root container?             → dispatch STATE_PART_CHANGED locally
  └── Non-root?                   → bubble to parentStatePartChanged
Is the key in component state?    → dispatch STATE_PART_CHANGED locally
Otherwise?
  ├── uses includes key?          → bubble to parentStatePartChanged
  └── uses does not include key?  → dropped (no owner found)
```

**Priority:** local vars > global vars > component state > parent state (bubble)

## Container — Event Handler Subsystem

`Container.tsx` creates the event execution infrastructure:

### Factory chain

```
createEventHandlers({ appContext, stateRef, dispatch, statePartChanged, ... })
  → { runCodeAsync, runCodeSync }

createEventHandlerCache({ fnsRef, runCodeAsync, runCodeSync })
  → { getOrCreateEventHandlerFn, getOrCreateSyncCallbackFn, cleanup }

createActionLookup({ componentState, getOrCreateEventHandlerFn, getOrCreateSyncCallbackFn })
  → { lookupAction, lookupSyncCallback }
```

- `lookupAction(action, uid, options)` — resolves action string/object to executable function (arrow functions, event handlers, method calls)
- `lookupSyncCallback(callbackPath, uid)` — resolves sync callback for `callbacks` in wrapComponent
- Event handlers cached per component UID in `fnsRef: Map<symbol, any>`

### Lifecycle

- `statementPromises: Map<string, any>` tracks async handler promises
- All pending promises resolved on `version` change (triggering re-render) or unmount
- `mountedRef` prevents updates after unmount

### Child Rendering

`stableRenderChild(children, layoutContext, parentRenderContext, uidInfoRef, ref, props)` recursively renders children. Each stateful child starts its own `StateContainer` → `Container` cycle.

### Loader Rendering

Loaders (`DataSource`, `APICall`) are rendered as invisible components at the top of the container. They dispatch `LOADER_LOADED`, `LOADER_ERROR`, `LOADER_IN_PROGRESS_CHANGED`, `LOADER_IS_REFETCHING_CHANGED` actions back to the reducer.

## Function Dependency Analysis — `collectFnVarDeps`

Flattens transitive function dependencies into direct variable dependencies:

```typescript
// Input
{ fn1: ["fn2", "var1"], fn2: ["var3", "fn3"], fn3: ["var4"] }
// Output
{ fn1: ["var3", "var4", "var1"], fn2: ["var3", "var4"], fn3: ["var4"] }
```

Cycle-safe (uses visited set). Used in layer 5 to determine which variables must resolve before a function can evaluate.

## Key Behavioural Rules

- Children receive `parentState` as a reference prop, not a copy. Only the owning container's reducer mutates; children see the new reference on re-render.
- In an `Items` component, each row gets its own context object (`$item`, `$itemIndex`). Changing one row never affects another.
- Globals are stored in the root container's reducer and passed down as `parentGlobalVars`. There is one source of truth.

## Key Files

| File | Path |
|------|------|
| StateContainer | `xmlui/src/components-core/rendering/StateContainer.tsx` |
| Container | `xmlui/src/components-core/rendering/Container.tsx` |
| reducer | `xmlui/src/components-core/rendering/reducer.ts` |
| containers (enum) | `xmlui/src/components-core/rendering/containers.ts` |
| buildProxy | `xmlui/src/components-core/rendering/buildProxy.ts` |
| ContainerUtils | `xmlui/src/components-core/rendering/ContainerUtils.ts` |
| collectFnVarDeps | `xmlui/src/components-core/rendering/collectFnVarDeps.ts` |

# Action Execution Model

Internal architecture for event handlers and actions — how user interactions become side effects in XMLUI. For user-facing markup patterns, see `.ai/xmlui/data.md` (APICall section).

## Event Handler Execution (Async Model)

All XMLUI event handlers are async. Handler strings → parsed AST → `processStatementQueueAsync()`. The framework uses its own AST interpreter, not `eval()` or `new Function()`.

### Mouse event pipeline (event-handlers.ts)

```typescript
// useEventHandler — simplified
(event) => {
  // 1. SYNCHRONOUS: lock down event BEFORE user code runs
  event.stopPropagation();
  event.preventDefault();
  // 2. ASYNC: fire handler — Promise is DROPPED (fire-and-forget)
  onEvent(event);
}
```

**Consequences:**
- `preventDefault` / `stopPropagation` always happen before user code — user cannot conditionally allow propagation
- Return value discarded — errors become unhandled promise rejections
- `bubbleEvents` prop (experimental) selectively skips `stopPropagation` + `preventDefault` for listed event names

### Statement-by-statement execution (container/event-handlers.ts)

After each statement:
1. If state changed → dispatch to container reducer → `await` React `startTransition` commit
2. Fresh state snapshot cloned for next statement
3. After 100 no-change statements → `await delay(0)` to yield main thread

Effect: state changes from statement N are visible to statement N+1. Unlike raw React batching.

### Event categories

| Category | Examples | preventDefault | stopPropagation | Awaited? | Return observed? |
|----------|---------|----------------|-----------------|----------|-----------------|
| Mouse | `onClick`, `onDoubleClick`, `onContextMenu` | Yes (sync, before handler) | Yes (sync) | No | No |
| Hover | `onMouseEnter`, `onMouseLeave` | Yes | Yes | No | No |
| Init/cleanup | `onInit`, `onCleanup` | N/A | N/A | No | No |
| Form | `onSubmit`, `onWillSubmit`, `onSuccess` | Yes (Form component) | Yes | **Yes** | **Yes** |
| Keyboard (internal) | Arrow keys in Select/Table | Component does it | Component does it | Varies | Varies |

### Handler resolution chain

```
ComponentAdapter.memoedLookupEventHandler(eventName)
  → reads safeNode.events[eventName] (string or ParsedEventValue)
  → calls lookupAction(action, uid, options)  [container/action-lookup.ts]
  → getOrCreateEventHandlerFn(src, uid, options)  [event-handler-cache.ts]
  → wraps in: (...args) => runCodeAsync(src, uid, options, ...cloneDeep(args))
  → cached by `eventName;source` key (unless ephemeral or context)
```

### Event lifecycle signals

```typescript
dispatch({ type: EVENT_HANDLER_STARTED,   payload: { uid, eventName } });
// ... handler executes ...
dispatch({ type: EVENT_HANDLER_COMPLETED, payload: { uid, eventName } });
```

Drives inspector UI and in-progress tracking.

## Core Types

```typescript
// Registry entry — one per named action
interface ActionRendererDef {
  actionName: string;        // e.g. "callApi", "upload", "download"
  actionFn: ActionFunction;  // The function to call
}

// The function signature all actions share
type ActionFunction = (executionContext: ActionExecutionContext, ...args: any[]) => any;

// Passed to every action at execution time
interface ActionExecutionContext {
  uid: symbol;                        // The container's unique identifier
  state: ContainerState;              // Snapshot of container state at call time
  getCurrentState: () => ContainerState; // Live getter — use for closures
  appContext: AppContextObject;       // Global context (queryClient, navigate, toast, etc.)
  apiInstance?: IApiInterceptor;      // Optional API interceptor
  lookupAction: LookupAsyncFnInner;   // Resolve another action by name (for nested handlers)
  navigate: any;                      // react-router navigate (workaround for router bug)
  location: any;                      // react-router location (workaround for router bug)
}
```

## Action Registration

Actions are registered in `ComponentRegistry` as a `Map<string, ActionFunction>`:

```typescript
// ComponentProvider.tsx — ComponentRegistry constructor
this.registerActionFn(apiAction);       // "callApi"
this.registerActionFn(downloadAction);  // "download"
this.registerActionFn(uploadAction);    // "upload"
this.registerActionFn(navigateAction);  // "navigate"
this.registerActionFn(timedAction);     // "delay"
```

External packages can contribute actions the same way via `ContributesDefinition`:
```typescript
export default { namespace: "MyPkg", actions: [createAction("myAction", myFn)] };
```

Registered actions are exposed to scripting via the `Actions` namespace in `AppContextObject`:
```typescript
// AppContextDefs.ts
Actions: Record<string, ActionFunction>;
```
In markup expressions: `Actions.callApi(...)`, `Actions.upload(...)`, etc.

## The 5 Built-In Actions

| Action name | Function | Source file |
|-------------|----------|-------------|
| `callApi` | HTTP mutation, optimistic updates, cache invalidation | `action/APICall.tsx` |
| `download` | File download (iframe or fetch+anchor) | `action/FileDownloadAction.tsx` |
| `upload` | Chunked file upload via FormData | `action/FileUploadAction.tsx` |
| `navigate` | Programmatic routing (resolves relative paths) | `action/NavigateAction.tsx` |
| `delay` | `setTimeout`-based callback delay | `action/TimedAction.tsx` |

## LookupActionOptions

Controls how an event handler string is resolved and executed:

```typescript
type LookupActionOptions = {
  signError?: boolean;           // Default true — surface errors in UI
  eventName?: string;            // For inspector: "click", "success", "error", etc.
  ephemeral?: boolean;           // true → do not cache resolved function (for one-off calls)
  defaultHandler?: string;       // Fallback handler if event not defined on component
  context?: any;                 // Extra state injected into execution context
  componentType?: string;        // Inspector: "Button"
  componentLabel?: string;       // Inspector: "Save"
  componentId?: string;          // Inspector: element id
  sourceFileId?: string|number;  // Inspector: source file index
  sourceRange?: { start: number; end: number }; // Inspector: character range
};
```

## ApiBoundComponent — The Code Generation Bridge

`ApiBoundComponent` is the critical bridge between declarative action definitions in markup and executable React event handlers. It runs at render time (inside `ComponentAdapter`) when a component node has API-bound events.

**Detection (ComponentAdapter):**
```typescript
const apiBoundEvents = getApiBoundItems(safeNode.events, "APICall", "FileDownload", "FileUpload");
```

**Code generation (`generateEventHandler`):**  
For each API-bound event child (`APICall`, `FileUpload`, `FileDownload`), `ApiBoundComponent` generates a JavaScript string:

```typescript
// For an APICall child:
`(eventArgs, options) => {
  return Actions.callApi({
    uid: "...",
    url: "...",
    method: "...",
    body: ... || (options?.passAsDefaultBody ? eventArgs : undefined),
    onSuccess: ...,
    onError: ...,
    invalidates: ...,
    // ... all props serialized as JSON literals
  }, { resolveBindingExpressions: true });
}`

// For FileUpload:
`(eventArgs) => {
  return Actions.upload({ url: ..., file: ..., onSuccess: ..., onProgress: eventArgs.onProgress, ... });
}`

// For FileDownload:
`(eventArgs) => {
  return Actions.download({ url: ..., fileName: ..., ... });
}`
```

These strings are injected as the component's event handlers. The scripting engine evaluates them at runtime; the `Actions` namespace in scope provides the registered action functions.

**Nested action support:** `prepareEvent()` handles nested actions (`success`, `error`, `progress`, `beforeRequest`, `mockExecute`) recursively, embedding the nested handler's generated code inline.

## callApi Execution Lifecycle

`callApi` in `action/APICall.tsx` is the most complex action. Its lifecycle:

```
1. when check     — if `when` evaluates falsy → return (no-op)
2. confirm dialog — if confirmTitle/confirmMessage → await user confirmation; cancel → return
3. resolve invalidates — extractParam(state, invalidates, appContext)
4. onBeforeRequest — if returns false → abort
5. optimistic update — if updates + (optimisticValue | getOptimisticValue):
     a. cancelQueries for matched keys
     b. setQueryData with optimistic entry (immer draft, keyed by clientTxId)
6. toast.loading  — if inProgressNotificationMessage
7. HTTP request   — RestApiProxy.execute() (or onMockExecute handler if present)
8. onSuccess      — await; receives (result, $param)
9. updateQueriesWithResult — replace optimistic entry with real result
10. invalidateQueries — setTimeout(0) macrotask (deferred to allow navigation to settle)
    → SKIPPED if onSuccess returns false
11. toast.success or toast.dismiss
--- error path ---
12. invalidateQueries() — full cache reset if optimistic updates were applied
13. onError handler
14. toast.error
15. re-throw — unless onError returns false (suppresses propagation)
```

**Key behaviors:**
- `invalidates` without a URL → invalidates **all** queries (`queryClient.invalidateQueries()` with no predicate). Provide a URL pattern to scope it.
- `updates` (cache merge) vs `invalidates` (cache bust) can coexist: `updates` is applied immediately with optimistic data; `invalidates` triggers a background re-fetch.
- `onSuccess` returning `false` skips invalidation — used when the handler performs navigation and the component will unmount before re-fetch completes.
- Cache invalidation is deferred to a macrotask (`setTimeout(0)`) so that synchronous `navigate()` calls in `onSuccess` complete before queries re-fire.

## Event Handler Resolution (ComponentAdapter)

```typescript
// ComponentAdapter.tsx — memoedLookupEventHandler
const memoedLookupEventHandler: LookupEventHandlerFn = useCallback(
  (eventName, actionOptions) => {
    const action = safeNode.events?.[eventName] || actionOptions?.defaultHandler;
    return lookupAction(action, uid, {
      eventName,
      componentType: ctx.componentType,
      componentLabel: ctx.componentLabel,
      ...actionOptions,
    });
  },
  [lookupAction, safeNode.events, uid],
);
```

`lookupAction` (from the container's scripting context) evaluates the event handler string or resolves it from the action registry, then returns an `AsyncFunction` ready to call.

## Inspector / Trace Integration

`APICall.tsx` emits trace events when `appGlobals.xsVerbose === true`:

```typescript
traceApiCall(appContext, "api:start",    url, method, { transactionId, body });
traceApiCall(appContext, "api:complete", url, method, { transactionId, result, status });
traceApiCall(appContext, "api:error",    url, method, { transactionId, error });
```

`pushXsLog` / `getCurrentTrace` in `components-core/inspector/inspectorUtils.ts` manage the trace log. Every API call is tagged with a `clientTxId` (UUID) and a `traceId` captured before the `await` so the completion trace uses the same context as the start.

## Key Files

| File | Role |
|------|------|
| `abstractions/ActionDefs.ts` | `ActionRendererDef`, `ActionExecutionContext`, `LookupActionOptions`, `ActionFunction` |
| `components-core/ApiBoundComponent.tsx` | Generates event handler code strings from APICall/FileUpload/FileDownload markup |
| `components-core/action/APICall.tsx` | `callApi` — the primary HTTP mutation action |
| `components-core/action/FileUploadAction.tsx` | `upload` — chunked FormData file upload |
| `components-core/action/FileDownloadAction.tsx` | `download` — file download via iframe or anchor |
| `components-core/action/NavigateAction.tsx` | `navigate` — programmatic routing with relative path resolution |
| `components-core/action/TimedAction.tsx` | `delay` — setTimeout-based callback |
| `components-core/action/actions.ts` | `createAction()` factory |
| `components-core/rendering/ComponentAdapter.tsx` | `memoedLookupAction`, `memoedLookupEventHandler` |
| `components-core/RestApiProxy.ts` | HTTP abstraction layer used by callApi and upload |
| `components-core/utils/actionUtils.ts` | `invalidateQueries()` utility |
| `components-core/utils/extractParam.ts` | `extractParam()` — resolves prop values against state |
| `components-core/inspector/inspectorUtils.ts` | `pushXsLog`, `getCurrentTrace` for trace integration |
| `components/ComponentProvider.tsx` | `registerActionFn()`, built-in action registration |
| `abstractions/AppContextDefs.ts` | `AppContextObject.Actions` — the scripting-visible namespace |

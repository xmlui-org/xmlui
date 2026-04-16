# Error Handling Strategy — AI Reference

## Overview

XMLUI uses a **layered error handling strategy** with five distinct error domains, each handled
differently:

| Domain | Mechanism | User Visible As |
|---|---|---|
| Render errors | `ErrorBoundary` (React class) | Inline red overlay where component was |
| Event handler errors | `try/catch` + `signError()` | Red toast notification |
| Loader/fetch errors | `LOADER_ERROR` reducer + `$error` | Toast or custom `errorNotificationMessage` |
| Parse/markup errors | `errReport*` fallback components | Full-page error UI with line/column info |
| Bootstrap errors | Console groups + `null` render | Console output, blank page |

---

## ErrorBoundary Component

```ts
// xmlui/src/components-core/rendering/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo, this.props.location);
    pushXsLog({
      kind: "error:boundary",
      error: { message: error.message },
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      location: this.props.location,
    });
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.node !== this.props.node) {
      this.setState({ hasError: false });  // Auto-reset on node change
    }
  }

  render() {
    return this.state.hasError ? (
      <div data-error-boundary className={styles.errorOverlay}>
        <div className={styles.title}>There was an error!</div>
        <div className={styles.errorItem}>{this.state.error?.message}</div>
      </div>
    ) : (
      this.props.children
    );
  }
}
```

**Props:**
- `node?: ComponentLike` — when this ref changes, the boundary resets to "no error"
- `location?: string` — label for trace logging (e.g. `"container"`, `"root-outer"`, `"theme-root"`)

**Auto-reset:** When the `node` prop changes identity (new ComponentDef reference), the boundary
resets to clear state. This means navigating to a new page (which replaces the root node)
automatically recovers from render errors.

**Fallback UI:** A red overlay with "There was an error!" and the error message. Styled via
`ErrorBoundary.module.scss`. Has `data-error-boundary` attribute for test selection.

---

## ErrorBoundary Placement — Every Container

`ErrorBoundary` wraps each `StateContainer`, which means **every component** in the tree has
its own boundary. This is the correct isolation strategy — a crash in one component doesn't
propagate to siblings or ancestors.

| File | `location` tag | Scope |
|---|---|---|
| `StateContainer.tsx` (line 465) | `"container"` | Every XMLUI component with state |
| `ContainerWrapper.tsx` (line 187) | `"container"` | Explicit container wrappers |
| `AppWrapper.tsx` (line 302) | `"root-outer"` | Outermost app boundary |
| `ThemeNative.tsx` (line 284) | `"theme-root"` | Theme component subtree |
| `NestedAppNative.tsx` | (default) | Nested `<App>` component subtrees |

**Key:** The `StateContainer` wrapping is the most important — since `StateContainer` wraps every
component (it's how state is provided), every component gets an error boundary for free.

---

## Event Handler Errors

Event handlers are evaluated in `event-handlers.ts`. Errors are caught per-handler:

```ts
try {
  // ... handler execution (statement evaluation, async/await, etc.)
} catch (e) {
  handlerLogger.logHandlerError({ uid: uidName, eventName, error: e });

  if (options?.signError !== false) {
    appContext.signError(e as Error);   // Show red toast
  }

  dispatch({
    type: ContainerActionKind.EVENT_HANDLER_ERROR,
    payload: { uid, eventName, error: e },
  });

  throw e;  // Re-throw so caller knows it failed
} finally {
  handlerLogger.cleanupTrace(traceId);
}
```

**Key behaviors:**
- `signError()` is always called **unless** `options.signError === false` (used for silently
  failing operations where the caller handles the error differently)
- `EVENT_HANDLER_ERROR` reducer action updates container state (allows components to react)
- The error is **re-thrown** after handling — so the caller (event dispatcher) also sees the failure
- `ThrowStatementError` from an explicit `throw` statement in markup is caught the same way

---

## signError() — The Universal Error Notifier

```ts
// xmlui/src/components-core/rendering/AppContent.tsx
function signError(error: Error | string) {
  const message = typeof error === "string" ? error : error.message || "Something went wrong";

  toast.error(message);         // Red toast notification
  console.error("[xmlui]", message);  // Console (for Playwright capture)
  pushXsLog({
    kind: "error:runtime",
    error: { message, stack: error instanceof Error ? error.stack : undefined },
  });
}
```

`signError()` is available in markup expressions and event handlers as a global function.
It always shows a toast, logs to console (prefixed `[xmlui]` for test capture), and records
to the trace system.

---

## Loader/DataSource Error Handling

**Path:** fetch fails → `loaderError(error)` → `LOADER_ERROR` reducer action → `$error` context var

```ts
// Reducer (reducer.ts)
case ContainerActionKind.LOADER_ERROR: {
  const { error } = action.payload;
  state[uid] = { ...state[uid], error, inProgress: false, loaded: true };
  break;
}
```

**`$error` context variable structure:**

```ts
// createContextVariableError() in EngineError.ts
{
  statusCode: number;   // HTTP status or 500
  message: string;      // Error message
  details: any;         // Extra error detail object
  response: any;        // Raw response (if available)
}
```

**What the user sees depends on the DataSource configuration:**
1. If `errorNotificationMessage` prop is set → toast with that message (with `$error` in scope)
2. If no `errorNotificationMessage` → `signError()` called → toast with raw error message
3. If `onError` handler is defined → handler runs first; returning `false` suppresses the toast
4. Loading toast (if any) is always dismissed on error

---

## Action Execution Errors

For `APICall` / `FileUpload` / `FileDownload` actions:
- If the action has a nested `error` child action → it runs (receives `$error` in context)
- If no nested `error` action → `signError()` is called

Custom `actionFn` errors propagate up to the event handler `try/catch` block and follow the
same path as event handler errors.

---

## Parse-Time Errors — errReport* Fallback Components

When markup (`.xmlui` file) fails to parse, instead of crashing the entire app, the parser
returns a **replacement component** that renders a full-page error UI:

| Function | Trigger | Display |
|---|---|---|
| `errReportComponent(errors, file, name)` | XML parse errors in markup | "X errors while processing XMLUI markup" — each error with line/col/message |
| `errReportScriptError(error, file)` | Script/code-behind parser error | "Error in XMLUI code-behind script" — line:column + message |
| `errReportModuleErrors(errors, file)` | Import/module resolution errors | Per-module error list |

These functions create a ComponentDef that renders a full-page red error UI. The `component`
property on the returned object is replaced — the rest of the app continues rendering normally.
Only the component with the error is replaced.

---

## Custom Error Types

All custom types extend `EngineError`:

```ts
abstract class EngineError extends Error {
  protected abstract readonly errorCategory: string;
}
```

| Class | `errorCategory` | When Thrown |
|---|---|---|
| `GenericBackendError` | `"GenericBackendError"` | HTTP/API failures; parses RFC 7807, Google/MS error formats |
| `ScriptParseError` | `"ScriptParserError"` | Scripting parser failure; has `source` and `position` |
| `StatementExecutionError` | `"StatementExecutionError"` | Runtime statement evaluation failure |
| `ThrowStatementError` | `"ThrowStatementError"` | Explicit `throw` in markup script; carries `errorObject` |
| `NotAComponentDefError` | `"NotAComponentError"` | Type mismatch when ComponentDef was expected |
| `CodeBehindParseError` | (extends `Error`) | Multiple script errors in code-behind; formats them into message |
| `ParseVarError` | (extends `Error`) | Variable resolution failure during container init |

`GenericBackendError` handles multiple error response formats automatically:
- RFC 7807 (`{ type, title, status, detail }`)
- Google style (`{ error: { code, message, status } }`)
- MS/Azure style (`{ error: { code, message } }`)
- Nested validation arrays

---

## Inspector Trace Entries for Errors

| `kind` field | Created By | Contents |
|---|---|---|
| `"error:boundary"` | `ErrorBoundary.componentDidCatch` | `error.message`, `stack`, `componentStack`, `location` |
| `"error:runtime"` | `signError()` | `error.message`, `stack` |
| `"error:handler"` | `handlerLogger.logHandlerError` | `uid`, `eventName`, error details |

`pushXsLog()` is a **noop** when `window._xsVerbose` is off (the default in production).
Zero performance impact unless verbose mode is enabled.

---

## Bootstrap Error Flow (Standalone Mode)

On startup, errors in component discovery, parsing, or module loading:

1. **XML parse errors** → component replaced with `errReportComponent()` UI — app renders without that component
2. **Code-behind errors** → component replaced with `errReportScriptError()` UI — app renders
3. **Module import errors** → component replaced with `errReportModuleErrors()` UI — app renders
4. **Build errors** (Vite mode) → logged as `console.group("🔴 Build Errors Found")` with full details
5. **Main app failure** → `null` returned from StandaloneApp → blank page

---

## Key Files

| File | Role |
|---|---|
| `xmlui/src/components-core/rendering/ErrorBoundary.tsx` | React class boundary — catch/reset/log |
| `xmlui/src/components-core/rendering/StateContainer.tsx` | Places boundary around every container |
| `xmlui/src/components-core/rendering/AppWrapper.tsx` | Root-outer boundary |
| `xmlui/src/components-core/rendering/AppContent.tsx` | `signError()` implementation |
| `xmlui/src/components-core/rendering/event-handlers.ts` | Handler try/catch + signError |
| `xmlui/src/components-core/rendering/reducer.ts` | `LOADER_ERROR` reducer case |
| `xmlui/src/components-core/loader/DataLoader.tsx` | Loader error path + `$error` creation |
| `xmlui/src/components-core/utils/EngineError.ts` | Custom error type hierarchy |
| `xmlui/src/components-core/xmlui-parser.ts` | `errReport*` fallback component factories |
| `xmlui/src/components-core/StandaloneApp.tsx` | Bootstrap error collection and handling |
| `xmlui/src/components-core/inspector/inspectorUtils.ts` | `pushXsLog()` implementation |

---

## Anti-Patterns

| Anti-Pattern | Problem | Correct Approach |
|---|---|---|
| Swallowing errors silently in handlers | User sees nothing; bugs go undetected | Always call `signError()` or handle visibly |
| `signError: false` without alternative feedback | Error is lost from user's view | Only use `signError: false` when the calling code shows its own error UI |
| Catching `ThrowStatementError` and ignoring | User `throw` in markup is intentional | Let it propagate or handle as intended error signal |
| Catching `GenericBackendError` without reading `statusCode` | Miss 401/403/404 handling | Read `err.statusCode` and handle auth/not-found specially |
| Placing new ErrorBoundary manually inside a renderer | Already provided by StateContainer; double-wrapping | Don't add extra boundaries in component renderers |

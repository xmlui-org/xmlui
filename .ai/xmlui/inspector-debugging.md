# Inspector & Debugging

## Overview

XMLUI ships a built-in trace/log system under the `_xs*` namespace on `window`. It is **zero-overhead when disabled** and captures a full timeline of interactions, API calls, state changes, and handler executions when enabled. The system has two entry points: the `Inspector` component (UI viewer) and `window._xsLogs` (raw data for DevTools/automation).

**Key directories:**
```
xmlui/src/components-core/inspector/
├── inspectorUtils.ts      ← Core: pushXsLog, createLogEntry, pushTrace, popTrace
├── handler-logging.ts     ← Event handler start/complete/error tracing
├── state-logging.ts       ← State mutation tracing (outside handlers)
└── variable-logging.ts    ← User-declared variable change tracing

xmlui/src/components/Inspector/
├── Inspector.tsx          ← Component metadata + renderer
└── InspectorNative.tsx    ← React impl: icon button → iframe overlay
```

---

## Core Functions (`inspectorUtils.ts`)

| Function | Signature | Purpose |
|----------|-----------|---------|
| `pushXsLog` | `(entry: XsLogEntry, xsLogMax?: number) => void` | Append entry to `window._xsLogs`; noop if tracing off |
| `createLogEntry` | `(kind: string, extras?: Partial<XsLogEntry>) => XsLogEntry` | Factory; pre-fills `ts`, `perfTs`, `traceId` |
| `pushTrace` | `(preferredId?: string) => string` | Push new trace ID onto stack; returns the new ID |
| `popTrace` | `() => void` | Pop current trace ID; restore parent |
| `getCurrentTrace` | `() => string \| undefined` | Current trace ID (excludes startup trace after first interaction) |
| `generateTraceId` | `() => string` | `"t-${timestamp}-${random}"` |

---

## `XsLogEntry` Type

```typescript
interface XsLogEntry {
  ts: number;               // Date.now() when created
  perfTs?: number;          // performance.now()
  startPerfTs?: number;     // For duration calculation
  traceId?: string;         // Groups events in one interaction
  kind?: string;            // See: Event Kinds table
  eventName?: string;       // "click", "change", "submit", etc.
  componentType?: string;   // XMLUI component name
  componentLabel?: string;  // Human-readable ID
  uid?: string;             // Component UID or DataSource ID
  text?: string;            // Stringified details
  diffPretty?: string;      // Human-readable state diff
  diffJson?: DiffEntry[];   // Structured diff
  error?: { message: string; stack?: string };
  [key: string]: any;       // Custom fields allowed
}
```

---

## Event Kinds Reference

| Kind | Pushed By | Meaning |
|------|-----------|---------|
| `"interaction"` | AppContent (document capture) | User click/keypress (trusted events only) |
| `"navigate"` | NavigateAction | `navigate()` called |
| `"api:start"` | DataLoader, APICall | Fetch begins |
| `"api:complete"` | DataLoader, APICall | Fetch succeeded |
| `"api:error"` | DataLoader, APICall | Fetch failed |
| `"handler:start"` | handler-logging | Event handler begins |
| `"handler:complete"` | handler-logging | Handler finished (with duration) |
| `"handler:error"` | handler-logging | Handler threw |
| `"state:changes"` | handler-logging, AppContent | Container state diff |
| `"error:boundary"` | ErrorBoundary | React render error caught |
| `"toast"` | AppContent | Toast notification shown |
| `"modal:show"` | ConfirmationModalContextProvider | Confirm dialog opened |
| `"modal:confirm"` | ConfirmationModalContextProvider | User confirmed |
| `"modal:cancel"` | ConfirmationModalContextProvider | User cancelled |
| `"method:call"` | state-layers | Component API method invoked |
| `"value:change"` | variable-logging | User var changed |
| `"native:*"` | Any | Native DOM events (prefix preserved) |
| `"sandbox:warn"` | bannedMembers `sandboxWarnLogger` | Banned DOM API access in non-strict mode (default) |
| `"log:debug"` / `"log:info"` / `"log:warn"` / `"log:error"` | `Log.*` global | User-emitted log via sanctioned `Log` API (replaces `console.*`) |
| `"app:fetch"` | `App.fetch` global | HTTP request via the gated fetch wrapper (origin allowlist applied) |
| `"app:randomBytes"` | `App.randomBytes` global | Entropy use via the gated `crypto.getRandomValues` wrapper |
| `"app:mark"` / `"app:measure"` | `App.mark` / `App.measure` globals | User performance marks/measures |
| `"clipboard:copy"` | `Clipboard.copy` global | Clipboard write via sanctioned wrapper |
| `"ws:connect"` / `"ws:message"` / `"ws:error"` / `"ws:close"` | `<WebSocket>` component | Managed WebSocket lifecycle |
| `"eventsource:connect"` / `"eventsource:message"` / `"eventsource:error"` / `"eventsource:close"` | `<EventSource>` component | Managed SSE lifecycle |

---

## Window Properties

All are initialized only when `xsVerbose=true` in app config/globals. Checking `window._xsLogs` being an array is the canonical gate.

| Property | Type | Description |
|----------|------|-------------|
| `_xsLogs` | `XsLogEntry[]` | Circular buffer (default max 200) |
| `_xsCurrentTrace` | `string` | Active trace ID |
| `_xsStartupTrace` | `string` | Startup-phase trace ID |
| `_xsStartupComplete` | `boolean` | True after first user interaction |
| `_xsLastInteraction` | `object` | `{ id, ts, type, target }` of last event |
| `_xsInspectMap` | `Map` | `data-inspectid` → component metadata |
| `_xsTestIdMap` | `Map` | `data-testid` → component metadata |
| `_xsSources` | `Map` | File ID → source code |
| `_xsSourceFiles` | `string[]` | Source file paths |
| `_xsHandlerSourceInfo` | `SourceLocation` | Active handler's source location |
| `_xsPendingConfirmTrace` | `string` | Trace ID awaiting confirmation |
| `_xsLastApiStatus` | `Map` | Transaction ID → HTTP status code |
| `__xsVerbose` | `boolean` | Verbose mode flag |
| `__xsTraceHelpers` | `object` | `{ pushTrace, popTrace, pushXsLog, createLogEntry }` (for `method:call` instrumentation) |

---

## Enabling Tracing

In `config.json` or app globals:
```json
{
  "globals": {
    "xsVerbose": true,
    "xsVerboseLogMax": 500
  }
}
```

**In code, check the flag uniformly:**
```typescript
const xsVerbose = appContext.appGlobals?.xsVerbose === true;
if (!xsVerbose) return;
// ... trace code only executes when enabled
```

---

## Trace ID Stack

- **Module-level array** `traceStack: string[]` (in `inspectorUtils.ts`)
- Each user interaction calls `pushTrace()` → new ID becomes `_xsCurrentTrace`
- Nested async operations (actions, API calls) inherit the current trace
- `popTrace()` restores parent trace after handler completes
- Confirmation modals save trace to `_xsPendingConfirmTrace`; restored on confirm

---

## Logging Modules

### Handler Logging (`handler-logging.ts`)

Used by `event-handlers.ts` to wrap every `on*` event handler.

```typescript
const logger = createHandlerLogger({ appContext, nodeDebugSource });
const traceId = logger.logHandlerStart({
  uid, eventName, componentType, handlerCode
});
try {
  // ... execute handler ...
  logger.logHandlerComplete({ traceId, duration });
} catch (e) {
  logger.logHandlerError({ traceId, error: e });
}
logger.logStateChanges({ traceId, before, after });
```

### State Logging (`state-logging.ts`)

Used by DataLoader and StateContainer for mutations outside event handlers.

```typescript
const logger = createStateLogger({ appContext });
logger.logStatePartChange({ uid, key, oldValue, newValue });
logger.logStateBatch(changes);  // Multiple changes atomically
```

### Variable Logging (`variable-logging.ts`)

Tracks `<Var>` element values and script variable changes. Filters internal framework vars:
```
"$props", "emitEvent", "hasEventHandler", "updateState",
"$item", "$itemIndex", "$this", "$parent"
```

---

## Inspector Component

**Props:**

| Prop | Default | Description |
|------|---------|-------------|
| `src` | `"xmlui/xs-diff.html"` | Inspector viewer URL |
| `tooltip` | `"Inspector"` | Icon hover text |
| `dialogTitle` | `"XMLUI Inspector"` | Modal header |
| `dialogWidth` | `"95vw"` | Modal CSS min-width |
| `dialogHeight` | `"95vh"` | Modal CSS min-height |

**APIs:** `open()`, `close()`

**Renders:** `SearchCodeIcon` button → overlay modal → `<iframe src={src}>`  
The iframe reads `window._xsLogs` via postMessage to display the trace timeline.

---

## Debug View (State Visualizer)

**Provider:** `DebugViewProvider.tsx` (components-core)  
**Keyboard shortcut:** Alt + Ctrl + Shift + S (toggles state view)

When `displayStateView=true`:
- Components are outlined with bounding boxes
- State change transitions optionally highlighted (blink)

Debug view configuration interface:
```typescript
interface IDebugViewContext {
  displayStateView?: boolean;
  collectStateTransitions?: boolean;
  stateTransitions?: StateTransition[];
  showDebugToolsWindow: boolean;
  openDebugToolsWindow(): void;
  closeDebugToolsWindow(): void;
  setDisplayStateView(display: boolean): void;
  startCollectingStateTransitions(): void;
  stopCollectingStateTransitions(): void;
}
```

---

## Adding Custom Trace Entries

**Minimal pattern:**
```typescript
import { pushXsLog, createLogEntry } from "../inspector/inspectorUtils";

// In a function that has access to appContext:
const xsVerbose = appContext.appGlobals?.xsVerbose === true;
if (xsVerbose) {
  pushXsLog(createLogEntry("custom:myEvent", {
    uid: componentId,
    eventName: "myAction",
    text: JSON.stringify(details),
  }));
}
```

**With trace lifecycle (for multi-step operations):**
```typescript
import { pushTrace, popTrace, createLogEntry, pushXsLog } from "../inspector/inspectorUtils";

const traceId = pushTrace();
try {
  pushXsLog(createLogEntry("custom:start", { traceId }));
  // ... operation ...
  pushXsLog(createLogEntry("custom:complete", { traceId }));
} finally {
  popTrace();
}
```

---

## Integration Map

| Component | What It Logs | Kind(s) |
|-----------|-------------|---------|
| `AppContent` | User interactions (trusted DOM events), app state changes, toasts | `interaction`, `state:changes`, `toast` |
| `event-handlers.ts` | Every on* handler execution | `handler:start`, `handler:complete`, `handler:error`, `state:changes` |
| `DataLoader` | API fetch lifecycle | `api:start`, `api:complete`, `api:error` |
| `APICall` | Action-triggered API calls | `api:start`, `api:complete`, `api:error` |
| `NavigateAction` | Route changes | `navigate` |
| `ErrorBoundary` | Render errors | `error:boundary` |
| `ConfirmationModalContextProvider` | Confirm dialogs | `modal:show`, `modal:confirm`, `modal:cancel` |
| `state-layers.ts` | Component API method calls | `method:call` |

---

## `pushXsLog` Buffer Management

- Default max: 200 entries (configurable with `xsVerboseLogMax`)
- When full, calls `splicePreservingInteractions()` — trims old entries but keeps all entries with preserved kinds
- **Preserved kinds** (never trimmed): `"interaction"`, `"navigate"`, `"api:start"`, `"api:complete"`, `"api:error"`, `"handler:start"`, `"handler:complete"`, `"modal:*"`, `"toast"`, `"method:call"`, `"value:change"`, `"native:*"`

---

## Anti-patterns

- **Do not call `pushXsLog` without checking `xsVerbose`** — always gate with `appContext.appGlobals?.xsVerbose === true`; the function itself checks, but the caller guard ensures expensive object construction is also skipped
- **Do not pass live React/Query objects directly** — `pushXsLog` safe-clones but complex live objects may lose fields; serialize with `JSON.stringify` into the `text` field instead
- **Do not omit `traceId`** — always pass `getCurrentTrace()` or the trace ID from `pushTrace()`; entries without trace IDs cannot be correlated in the inspector view
- **Do not call `pushTrace()` without `popTrace()` in a finally block** — mismatched push/pop corrupts the trace stack for all subsequent events

---

## Key Files

| File | Purpose |
|------|---------|
| `xmlui/src/components-core/inspector/inspectorUtils.ts` | Core trace API |
| `xmlui/src/components-core/inspector/handler-logging.ts` | Handler lifecycle logging |
| `xmlui/src/components-core/inspector/state-logging.ts` | State mutation logging |
| `xmlui/src/components-core/inspector/variable-logging.ts` | Variable change logging |
| `xmlui/src/components-core/rendering/AppContent.tsx` | Interaction capture + system initialization |
| `xmlui/src/components-core/DebugViewProvider.tsx` | State visualizer context |
| `xmlui/src/components/Inspector/InspectorNative.tsx` | Inspector UI component |

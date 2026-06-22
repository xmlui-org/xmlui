# XMLUI Advanced Debug Functions Plan

Status: Stages 1-2 implemented; Stage 3 next

## Scope

This plan extends XMLUI's built-in debugging helpers beyond `debugBreak`,
`debugLog`, and `debugTrace`.

The primary goal is to let developers inspect XMLUI values while debugging
without learning generated runtime internals such as `ctx.readLocal("count")`.

## Existing Debug Helper Behavior

Implemented helpers:

- `debugBreak()` pauses browser execution through a generated `debugger;`
  statement when used as an event-handler statement.
- `debugLog(...args)` compiles to `console.log(...args)` and returns
  `undefined`.
- `debugTrace(...args)` compiles to `console.trace(...args)` and returns
  `undefined`.

The helpers are compiler-recognized built-ins and do not require extension
registration.

## Proposed Helpers

### `debugWatch(label, value)`

First useful version:

```xml
<Button onClick="debugWatch('count', count); count++" />
```

Generated behavior:

```js
console.log("[xmlui watch]", "count", ctx.readLocal("count"));
```

Goals:

- easy to explain;
- no browser extension;
- works with DevTools Console;
- keeps runtime semantics simple by returning `undefined`;
- works in generated JavaScript and the runtime IR fallback execution path.

Optional runtime hook:

```js
ctx.debug?.watch?.(label, value)
```

This would let an application or future XMLUI Inspector collect watch values
without scraping console output.

### `debugSnapshot(label?)`

Log a broader scope snapshot:

```xml
<Button onClick="debugSnapshot('before save'); save()" />
```

Possible output:

```js
{
  label: "before save",
  locals: { ... },
  globals: { ... },
  props: { ... },
  context: { ... }
}
```

Risks:

- exposes large or sensitive data in the console;
- may be expensive if scope objects become deep;
- needs careful formatting to avoid unstable snapshots.

Recommendation:

- start with shallow readable values;
- avoid serializing through JSON so object identity remains inspectable in
  DevTools;
- make production behavior an explicit decision.

### `debugScope()`

Return a debugger-friendly object rather than logging:

```xml
debugLog(debugScope())
```

or:

```xml
let scope = debugScope();
debugLog(scope.locals.count);
```

This is more flexible than `debugSnapshot`, but it requires a runtime context
API that can expose locals/globals/props safely.

### `debugLabel(label)`

Marks the current point in execution without logging values:

```xml
debugLabel('entered validation branch')
```

Possible generated behavior:

```js
console.debug("[xmlui]", label);
```

This is minor, but it can be useful when stepping through long event handlers.

## DevTools-Native Scope Bridge

Longer-term idea:

Expose the current XMLUI debug scope on a stable global while an event handler
runs:

```js
globalThis.__xmluiDebug.current = {
  sourceId,
  eventName,
  locals,
  globals,
  props,
  references,
};
```

Before each mapped statement, update `current.statement` and the visible value
snapshot. Then DevTools Watch can inspect:

```js
__xmluiDebug.current.locals.count
__xmluiDebug.current.globals.count
__xmluiDebug.current.props.label
```

Pros:

- no browser extension;
- integrates with DevTools Watch;
- works while paused at `debugBreak()` or source-map breakpoints;
- does not require adding `debugWatch(...)` calls everywhere.

Cons:

- more generated code;
- possible performance overhead if updated before every statement;
- needs lifecycle cleanup after handlers complete;
- watch values may go stale if asynchronous handlers overlap;
- exposing scope data globally has security/privacy implications.

Mitigations:

- enable only in dev mode;
- update only around mapped statements;
- track handler instance IDs;
- clear `current` in a `finally` block;
- avoid deep cloning unless explicitly requested.

## XMLUI Inspector Integration

Future XMLUI Inspector support could collect debug events:

```ts
ctx.debug = {
  watch(label, value, metadata) {},
  log(args, metadata) {},
  trace(args, metadata) {},
  break(metadata) {},
};
```

Metadata should include:

- source id;
- source span;
- generated function name;
- event or binding id;
- component/node id;
- timestamp;
- handler execution mode.

This would support a richer in-app debug timeline without changing browser
DevTools.

## Chrome Extension Option

A Chrome extension can provide a richer XMLUI debugging surface than Console
logs and raw DevTools Watch expressions. If implemented in this workspace, put
it under:

```text
tools/chrome-debugger/
```

Recommended initial shape:

```text
tools/chrome-debugger/
  package.json
  tsconfig.json
  vite.config.ts
  public/manifest.json
  src/
    devtools.ts
    panel.tsx
    panel.html
    contentScript.ts
    pageBridge.ts
    protocol.ts
```

### Extension Architecture

Use a standard Chrome DevTools extension architecture:

- `devtools.ts` registers a custom DevTools panel, for example **XMLUI**.
- `panel.tsx` renders watch values, debug events, current handler metadata, and
  selected source locations.
- `contentScript.ts` runs in the isolated extension world and relays messages
  between the extension and the page.
- `pageBridge.ts` is injected into the page world so it can access
  `window.__xmluiDebug` and subscribe to XMLUI debug events.
- `protocol.ts` defines typed messages shared by the bridge, content script,
  and panel.

Message flow:

```text
XMLUI runtime -> window.__xmluiDebug -> pageBridge -> contentScript -> DevTools panel
```

The extension should not scrape Console output. It should consume structured
debug events from a runtime bridge.

### Runtime Bridge Contract

The framework should expose a development-only bridge:

```ts
type XmluiDebugEvent =
  | {
      kind: "watch";
      label: string;
      value: unknown;
      metadata: XmluiDebugMetadata;
    }
  | {
      kind: "log" | "trace" | "break" | "snapshot" | "statement";
      args?: unknown[];
      snapshot?: XmluiDebugSnapshot;
      metadata: XmluiDebugMetadata;
    };

type XmluiDebugMetadata = {
  sourceId: string;
  sourceSpan?: { start: number; end: number };
  generatedName?: string;
  eventId?: string;
  bindingId?: string;
  nodeId?: string;
  executionId?: string;
  executionMode?: "sync" | "async";
  timestamp: number;
};

type XmluiDebugBridge = {
  version: 1;
  current?: XmluiDebugSnapshot;
  subscribe(listener: (event: XmluiDebugEvent) => void): () => void;
  emit(event: XmluiDebugEvent): void;
};
```

Install it at:

```js
globalThis.__xmluiDebug
```

The bridge can exist without the extension. The extension becomes a better UI
for data that is already available.

### Extension Features

First valuable features:

- watch timeline for `debugWatch(label, value)`;
- current handler/source metadata;
- current XMLUI scope snapshot while paused;
- clear button for debug events;
- copy value as JSON where possible;
- filter by source file, handler, component, or label;
- jump-to-source support using source IDs and spans where Chrome APIs allow it.

More advanced features:

- persistent watch expressions, evaluated against `__xmluiDebug.current`;
- event-handler execution timeline with statement boundaries;
- async handler execution IDs and overlapping handler visualization;
- link panel rows to source-map locations;
- export trace JSON compatible with XMLUI Inspector tooling;
- optional integration with the existing XMLUI Inspector trace format.

### Security And Packaging Notes

- Keep permissions narrow: prefer `devtools_page`, `scripting`, and active-tab
  style access only where necessary.
- Restrict the extension to localhost/development origins initially.
- Do not inject the page bridge unless the page exposes XMLUI markers or the
  user opens the XMLUI DevTools panel.
- Treat watched values as sensitive; avoid automatic remote transmission.
- The extension should be loadable unpacked during early development.
- A packaged `.crx` or Chrome Web Store flow can wait until the protocol is
  stable.

### Relationship To The VS Code Tool

The repository already has `tools/vscode`. The Chrome extension should follow
the same broad tooling convention:

- own `package.json`;
- build script;
- tests where practical;
- generated `dist/` ignored unless packaging explicitly requires it;
- concise README with load-unpacked instructions.

## Staged Implementation

### Stage 1: `debugWatch(label, value)` Console Helper `[implemented]`

- Add `debugWatch` to the compiler-recognized debug helper list.
- Generate `console.log("[xmlui watch]", label, value)` and return
  `undefined`.
- Implement matching runtime IR fallback behavior.
- Add codegen tests.
- Add the helper to the debug example.

Implementation notes:

- `debugWatch` is now recognized by the compiler as a built-in debug helper.
- Generated JavaScript emits `console.log("[xmlui watch]", label, value)` and
  returns `undefined`.
- The runtime IR fallback path mirrors the generated behavior.
- The `debugHelpers` example now uses `debugWatch` before incrementing state.

### Stage 2: Runtime Debug Hook `[implemented]`

- Add optional `ctx.debug?.watch?.(...)` call before console fallback or in
  addition to console output.
- Define the hook shape in compiler/runtime context types.
- Add tests with a fake debug context.

Implementation notes:

- The runtime installs `globalThis.__xmluiDebug` with `version`,
  `subscribe(listener)`, and `emit(event)`.
- Runtime expression/event contexts expose that bridge as `ctx.debug`.
- `debugWatch`, `debugLog`, `debugTrace`, and `debugBreak` emit structured
  bridge events before or alongside Console/debugger behavior.
- Bridge events currently include `kind`, helper args, watch label/value where
  applicable, and a timestamp.
- Rich source metadata is intentionally left for the extension/metadata stages.

### Stage 3: `debugSnapshot(label?)`

- Add a shallow scope snapshot helper.
- Decide whether it logs directly, returns an object, or both.
- Add tests covering locals, globals, props, and references.

### Stage 4: DevTools Scope Bridge

- Add a development-only `globalThis.__xmluiDebug` bridge.
- Update it at mapped event-handler statement boundaries.
- Clean it up in `finally`.
- Verify browser Watch expressions can inspect XMLUI scope values.

### Stage 5: Inspector Timeline

- Route debug helpers through a structured runtime debug interface.
- Record watch/log/trace/break events with source metadata.
- Add an inspector or example display if useful.

### Stage 6: Chrome Extension Planning And Scaffold

- Create `tools/chrome-debugger/`.
- Add a Manifest V3 `public/manifest.json`.
- Add a DevTools page that registers an **XMLUI** panel.
- Add a minimal panel UI showing connection status and received event count.
- Add a content script and page bridge with a typed message protocol.
- Document load-unpacked steps in `tools/chrome-debugger/README.md`.

### Stage 7: Runtime Bridge For Extension

- Add `globalThis.__xmluiDebug` in development/debug mode.
- Route `debugWatch`, `debugLog`, `debugTrace`, and `debugBreak` through
  structured bridge events.
- Keep Console behavior as fallback or as an explicit parallel behavior.
- Include source metadata in each emitted event.
- Add tests for bridge event emission with a fake bridge.

### Stage 8: Extension Watch Panel

- Render `debugWatch` events in the XMLUI DevTools panel.
- Show label, value preview, source file, source line/column, generated
  function name, and timestamp.
- Add clear/filter controls.
- Add manual browser verification steps.

### Stage 9: Scope And Statement Debugging

- Update `__xmluiDebug.current` while handlers run.
- Add persistent watch expressions evaluated by the panel against current
  scope.
- Emit statement-boundary events for mapped event-handler statements.
- Visualize async execution IDs when handlers overlap.

### Stage 10: Trace Export And Inspector Compatibility

- Export panel events as JSON.
- Align exported data with XMLUI Inspector trace concepts where practical.
- Add import/replay support only after the event protocol stabilizes.

## Open Questions

- Should debug helpers remain active in production builds, be stripped, or
  become no-ops?
- Should `debugWatch` always log to console, or prefer `ctx.debug.watch` when
  available?
- Should expression bindings allow all debug helpers, or should some helpers be
  event-handler-only?
- How much source metadata should helper calls receive?
- Should scope snapshots include references and context variables by default?
- Should the Chrome extension live in `tools/chrome-debugger`,
  `tools/devtools`, or `tools/xmlui-devtools`?
- Should the runtime bridge be enabled by dev server mode, sourcemap mode, or a
  dedicated debug flag?
- Should extension support be Chromium-only initially, or designed around
  browser-extension APIs that Firefox could support later?
- How should the extension open original XMLUI sources from virtual
  `xmlui-source://...` source-map URLs?

## Verification

- Unit tests for generated JavaScript source.
- Interpreter-path tests for helper behavior.
- Browser check in `?example=debugHelpers`.
- Manual DevTools check:
  - watch output appears in Console;
  - `debugBreak` pauses;
  - call stack uses named event functions;
  - source maps still land in original XMLUI files.
- Chrome extension manual checks:
  - load `tools/chrome-debugger/dist` unpacked;
  - open DevTools and confirm the XMLUI panel appears;
  - open `?example=debugHelpers`;
  - click debug helper buttons and confirm structured events appear;
  - verify filters, clear, and value display behavior;
  - verify no events are collected on non-XMLUI pages unless explicitly
    connected.

# Using the Inspector

When something in your XMLUI app behaves unexpectedly — a button click does nothing, an API call fires twice, a value updates at the wrong moment — the browser's DevTools rarely give you the whole story. They show you the network and the console, but they don't show which XMLUI handler ran, which state mutation it triggered, or how one interaction cascaded into the next.

The **Inspector** is XMLUI's built-in answer to this problem. It records a complete, ordered timeline of everything your app does at runtime: user interactions, event handlers, API calls, state changes, navigations, modal dialogs, toasts, and more. You can open the timeline in-app with a single click, browse it interactively, and export it as JSON to share with a teammate or an AI assistant.

## Enabling the Inspector

The Inspector is **off by default** so production apps pay zero overhead. Turning it on takes two steps.

### 1. Set `xsVerbose` in `config.json`

```json
{
  "appGlobals": {
    "xsVerbose": true,
    "xsVerboseLogMax": 500
  }
}
```

`xsVerbose` activates the trace recorder. `xsVerboseLogMax` (optional, default `200`) sets how many entries are kept in the rolling buffer. When the buffer fills, older entries are trimmed first — but significant events (interactions, API calls, navigations, modal events) are never discarded.

### 2. Add `<Inspector />` to your markup

Place the component anywhere in `Main.xmlui`. By convention it goes near the top of the `App`:

```xmlui
<App>
  <Inspector />
  <!-- ...the rest of your app... -->
</App>
```

The Inspector renders as a small magnifying-glass icon (typically in the top-right corner of the page). Clicking it opens a full-screen overlay with the trace viewer.

> [!INFO]
> Apps created with the `xmlui new` CLI already include `<Inspector />` and have `xsVerbose` enabled in development. You don't need to add anything to start using it.

## What the Inspector shows you

The trace viewer groups entries by **interaction**. A single user action — a click, a keypress, a form submit — produces one group containing every event that happened as a consequence of that action: the handler that ran, the API call it made, the state variables it changed, the navigation it triggered.

Inside a group, you see entries like:

- `interaction` — the original user event
- `handler:start` / `handler:complete` — the `on*` handler that ran, with timing
- `api:start` / `api:complete` / `api:error` — fetches issued by `DataSource` or `APICall`
- `state:changes` — which container variables changed, with a before/after diff
- `value:change` — user-declared `var` updates
- `navigate` — page navigation
- `toast`, `modal:show`, `modal:confirm`, `modal:cancel` — UI side effects
- `error:boundary` — render errors caught by the framework

The first group in any session is the **Startup phase** — every API call and value initialization that happened before the user did anything. Expanding it is a good first step when something looks wrong on initial load.

## A typical debugging workflow

1. Reproduce the problem in the running app.
2. Click the Inspector icon.
3. Find the group that corresponds to the action you just took (it's usually the last one).
4. Expand the group and read down the list. Look for:
   - `handler:error` — your handler threw
   - `api:error` — the request failed; click for status code and body
   - Missing `state:changes` after a handler — the handler ran but did not update state
   - Two `api:start` entries for the same URL — duplicate fetches
   - An unexpected `navigate` — something redirected you
5. Click any entry to see its full detail — source code of the handler, request URL, response body, state diff.

## Exporting a trace

The Inspector dialog has an **Export** button that copies the current trace as JSON. Use this to:

- Attach a trace to a bug report so a teammate can see exactly what happened.
- Hand the trace to an AI assistant. If you've installed the XMLUI MCP server, your assistant has a `xmlui_distill_trace` tool that turns the raw JSON into a readable per-step summary. A typical prompt is:

  > Distill and analyze this trace.

  The assistant returns a narrated walkthrough — what the user did, which handler ran, which API was called, which state changed — and can suggest fixes based on the docs.

## Inspecting traces from the console

When `xsVerbose` is on, the trace data is also available directly in the browser DevTools:

```javascript
// All log entries in chronological order
window._xsLogs

// Copy them to the clipboard for offline analysis
copy(JSON.stringify(window._xsLogs))

// The trace currently in progress (if any)
window._xsCurrentTrace

// The most recent user interaction
window._xsLastInteraction
```

This is handy in automated tests: a Playwright test can read `window._xsLogs` to assert that a particular event fired, or to wait until an `api:complete` entry appears before continuing.

## Inspector component reference

The `<Inspector />` component accepts a few optional props:

| Prop | Default | Description |
|------|---------|-------------|
| `src` | `xmlui/xs-diff.html` | URL of the trace viewer page. Override only if you self-host the viewer at a different path. |
| `tooltip` | `Inspector` | Hover text on the icon. |
| `dialogTitle` | `XMLUI Inspector` | Heading text in the dialog. |
| `dialogWidth` | `95vw` | Width of the dialog overlay. |
| `dialogHeight` | `95vh` | Height of the dialog overlay. |

It also exposes two API methods so you can open the dialog programmatically — for example from a keyboard shortcut:

```xmlui
<App>
  <Inspector id="inspector" />
  <!-- ...the rest of your app... -->
</App>
```

```js
inspector.open();   // open the trace viewer
inspector.close();  // close it
```

## Performance note

When `xsVerbose` is `false` (the default in production builds), every trace check in the framework short-circuits at a single boolean comparison. No arrays are allocated, no objects are built, no work is performed. You can safely leave `<Inspector />` in your markup year-round and ship the same `Main.xmlui` to development and production — the Inspector icon simply won't appear, and no tracing happens, unless `xsVerbose` is turned on.

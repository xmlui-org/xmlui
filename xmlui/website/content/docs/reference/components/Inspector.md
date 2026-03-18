# Inspector [#inspector]

`Inspector` provides an in-app trace viewer for XMLUI applications. It renders a clickable icon that opens a modal dialog containing the XMLUI Inspector, which displays interactive timelines of interactions, API calls, state changes, and handler timing.

**Key features:**
- **Trace visualization**: View interaction timelines, API call/response correlation, state change tracking, and handler timing
- **LLM-assisted debugging**: Show traces to LLMs when analyzing app behavior and failures
- **Semantic regression testing**: See [trace-tools](https://github.com/xmlui-org/trace-tools/?tab=readme-ov-file#regression-testing) for details

## Setup [#setup]

To use the Inspector, your app needs two files in its `xmlui/` directory alongside the XMLUI runtime:

1. **`xs-diff.html`** — the Inspector viewer (from [trace-tools](https://github.com/user/trace-tools))
2. **`xmlui-parser.es.js`** — the standalone XMLUI parser from the same place

Optionally, include **`xs-trace.js`** (from the same repo) in your app's root directory and load it via a `<script>` tag. This provides three helpers for injecting app-level traces into the Inspector timeline:

- **`window.xsTrace(label, fn)`** — wraps a function call and records its duration
- **`window.xsTraceEvent(label, data)`** — emits a semantic event with a data payload
- **`window.xsTraceWith(label, fn, extractData)`** — combines both: times the function and attaches data extracted from its result

All three emit entries with kind `"app:trace"` that appear in the Inspector timeline alongside engine-generated events. They are no-ops when tracing is disabled (`window._xsLogs` is undefined).

Enable tracing in your `config.json`:

```json
{
  "appGlobals": {
    "xsVerbose": true,
    "xsVerboseLogMax": 200
  }
}
```

## Usage [#usage]

Place `<Inspector />` wherever you want the icon to appear, typically in the `AppHeader`:

```xmlui
<App>
  <AppHeader>
    <Text value="My App" fontWeight="bold" />
    <SpaceFiller />
    <Inspector />
  </AppHeader>
</App>
```

## Properties [#properties]

### `src` [#src]

Path to the inspector HTML file. The file must be accessible from the app's root directory.

- Type: `string`
- Default: `"xmlui/xs-diff.html"`

```xmlui
<App>
  <AppHeader>
    <SpaceFiller />
    <Inspector src="my-custom-path/xs-diff.html" />
  </AppHeader>
</App>
```

### `tooltip` [#tooltip]

Tooltip text shown when hovering over the inspector icon.

- Type: `string`
- Default: `"Inspector"`

### `dialogTitle` [#dialogtitle]

Title displayed in the inspector modal dialog header.

- Type: `string`
- Default: `"XMLUI Inspector"`

### `dialogWidth` [#dialogwidth]

Minimum width of the inspector modal dialog.

- Type: `string`
- Default: `"95vw"`

### `dialogHeight` [#dialogheight]

Minimum height of the inspector modal dialog.

- Type: `string`
- Default: `"95vh"`

## Exposed Methods [#exposed-methods]

### `open` [#open]

Opens the inspector dialog programmatically.

**Signature**: `open(): void`

```xmlui
<App>
  <AppHeader>
    <Button label="Open Inspector" onClick="myInspector.open()" />
    <Inspector id="myInspector" />
  </AppHeader>
</App>
```

### `close` [#close]

Closes the inspector dialog programmatically.

**Signature**: `close(): void`

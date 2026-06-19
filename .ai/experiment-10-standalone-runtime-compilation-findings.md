# Experiment 10 Standalone Startup Findings

Status: Initial audit of the original XMLUI standalone startup contract

## Original Sources Inspected

- `/Users/dotneteer/source/xmlui/xmlui/src/index-standalone.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/StandaloneApp.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/Islands/activateIslands.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/abstractions/standalone.ts`
- `/Users/dotneteer/source/xmlui/tools/create-xmlui-hello-world/index.js`
- `/Users/dotneteer/source/xmlui/integration-tests/test-app/index.html`
- `/Users/dotneteer/source/xmlui/integration-tests/test-app/index.js`
- `/Users/dotneteer/source/xmlui/integration-tests/test-app/scripts/setup-standalone.mjs`
- `/Users/dotneteer/source/xmlui/integration-tests/tests/playwright.config.ts`

## Public Startup Pattern

The original standalone build emits `dist/standalone/xmlui-standalone.umd.js`.
Generated no-build apps commonly copy it as `xmlui/xmlui-latest.js` and load it
with a plain script tag:

```html
<script src="xmlui/xmlui-latest.js"></script>
```

`Main.xmlui` sits beside `index.html`. Extension scripts are also plain script
tags and are loaded after the XMLUI engine, for example:

```html
<script src="xmlui/xmlui-latest.js"></script>
<script src="xmlui/xmlui-hello-world.js"></script>
```

The user does not normally call a render function in HTML. The standalone UMD
registers a `DOMContentLoaded` listener. On that event, it checks for
`[data-xmlui-src]` island targets. If islands exist, it activates those. If not,
it starts the full app with `startApp(undefined, undefined, extensionManager)`.

`startApp` looks for `#root`. If it does not exist, it creates
`<div id="root">` and appends it to `document.body`. If `#root` already has
HTML, it hydrates; otherwise it creates a React root and renders the standalone
app.

## Source Loading Semantics

In standalone source mode, the old runtime fetches `Main.xmlui` by convention.
It also attempts to load optional `config.json`, `Globals.xs`, configured
themes, configured component files, explicit or convention-based
`Main.xmlui.xs`, and missing app components discovered after parsing. Config
can provide app name, default theme, default tone, resources, resource map,
`xmluiConfig`, components, themes, and API interceptor configuration.

## Integration Test Pattern

The integration test app uses an `index.js` module that dynamically appends the
UMD engine and extension scripts in standalone mode. Because that can happen
after the browser has already fired `DOMContentLoaded`, the test re-dispatches
`DOMContentLoaded` so the UMD startup listener runs.

## Compatibility Implication

Experiment 10 should preserve the public syntax and semantics:

- script-tag loading of a standalone UMD-compatible bundle;
- automatic startup on `DOMContentLoaded`;
- `Main.xmlui` beside `index.html` by default;
- optional `#root`, with auto-creation when absent;
- extension scripts after the engine;
- island detection before full-app startup, even if island rendering itself is
  deferred;
- explicit startup APIs may exist for tests and future tooling, but they should
  not replace the canonical no-code HTML startup pattern.

## Implemented in the Rewrite

- `xmlui/src/standalone/index.ts` is the standalone script entry.
- `xmlui/vite.standalone.config.ts` builds `dist/standalone/xmlui-latest.js`.
- The bundle installs a `DOMContentLoaded` startup listener and exposes
  `window.xmlui`.
- The full-app path fetches `Main.xmlui`, discovers sibling component files by
  component name, compiles sources in the browser, and renders through the same
  runtime used by Vite mode.
- The static samples under `xmlui/standalone-samples/` keep the old
  `xmlui/xmlui-latest.js` script path. The E2E preparation script copies the
  generated bundle into that path before tests.

Deferred compatibility items:

- island rendering is detected but not implemented;
- config, globals, themes, API interceptors, and code-behind files are not yet
  loaded in standalone mode;
- extension scripts can register with the minimal manager shape, but extension
  rendering is not complete.

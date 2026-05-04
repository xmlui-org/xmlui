# Extension packaging

The components on the [ECharts](/docs/guides/wrap-component/echarts) and [Tiptap](/docs/guides/wrap-component/tiptap) pages are heavy third-party libraries -- ECharts alone is ~1 MB bundled, Tiptap with all its extensions is ~500 KB. Including them all in the monolithic standalone bundle would push it well past what most apps need. Most XMLUI apps don't need charting or rich-text editing.

Extension packaging solves this. Each wrapped component ships as an independent UMD bundle that auto-registers with the XMLUI engine when loaded via a `<script>` tag. Apps include only the components they need.

## How it works

Each extension is a small npm project under `packages/xmlui-*`:

```
packages/xmlui-echart/
  src/
    index.tsx          # registers the component
    EChartRender.tsx   # the React render component
    EChartWrapped.tsx  # wrapComponent config
  package.json         # declares third-party deps
```

Building is one command:

```bash
xmlui build-lib
```

This produces a self-contained UMD `.js` file that externalizes React and the XMLUI runtime (already loaded by the host app). The bundle includes only the extension's own dependencies.

## What `xmlui build-lib` does

The implementation is ~80 lines of Vite/Rolldown config — see [`xmlui/src/nodejs/bin/build-lib.ts`](https://github.com/xmlui-org/xmlui/blob/main/xmlui/src/nodejs/bin/build-lib.ts). Reading it answers the toolchain questions that come up when wrapping your first component:

- **Entry point** is hardcoded to `src/index.tsx`.
- **Externals**: `react`, `react-dom`, `xmlui`, and `react/jsx-runtime` are not bundled — the host app already provides them.
- **Auto-register footer**: the UMD bundle ends with `window.xmlui.standalone.registerExtension(...)`, which is why a `<script>` tag alone is enough.
- **Watch mode** (`xmlui build-lib --watch`) emits ES with inline sourcemaps and rebuilds on change.
- **Override hooks**: a `vite.config-overrides.ts` next to your `package.json` can supply additional Vite plugins or a custom logger.

The build runs in your extension's own working directory and reads `package.json` for the bundle name (`${npm_package_name}.js` for UMD, `.mjs` for ES).

## Loading an extension

In `index.html`, add a script tag:

```html
<script src="xmlui/xmlui-echart.js"></script>
```

That's it. The component auto-registers and is immediately available in XMLUI markup as `<EChart ... />`.

## Extension sizes

| Package | Size | Third-party library |
|---|---|---|
| xmlui-calendar | ~200 KB | react-big-calendar |
| xmlui-gauge | ~2.4 MB | smart-webcomponents-react |
| xmlui-echart | ~1.1 MB | Apache ECharts |
| xmlui-tiptap-editor | ~520 KB | @tiptap/react + extensions |
| xmlui-masonry | ~3 KB | CSS multi-column (no dependency) |
| xmlui-grid-layout | ~105 KB | react-grid-layout |

Each is independent. An app that only needs charting loads `xmlui-echart.js` and nothing else. An app that needs everything loads all of them. The host app never changes -- just add or remove `<script>` tags.

## The pattern

1. Wrap with `wrapComponent` or `wrapCompound`
2. Theme via SCSS bridge or `useTheme()` in the render component
3. Trace via standard events or `captureNativeEvents: true`
4. Build as an extension with `xmlui build-lib`
5. Load via `<script>` tag -- auto-registers, zero config

No changes to the XMLUI core. The wrapper handles props, events, and tracing. The render component handles library-specific semantics and theming. The extension package handles bundling and registration.

The React ecosystem has thousands of components -- charting, mapping, editing, visualization, media, collaboration. The wrapping approach makes them all accessible to XMLUI, with theming that follows the design system and tracing that enables semantic debugging and test generation.

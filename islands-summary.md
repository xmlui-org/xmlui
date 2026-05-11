# XMLUI Islands — Implementation Summary

## What Is Islands

Islands lets you embed one or more independent XMLUI apps inside an arbitrary host web page (one that is not itself an XMLUI app). Each island is declared with a single HTML attribute:

```html
<div data-xmlui-src="./checkout-form"></div>
```

The value is a relative path to a folder containing a standard XMLUI project (`Main.xmlui`, optional `config.json`, optional `Globals.xs`, optional `components/`). The standalone UMD bundle detects these markers on `DOMContentLoaded` and mounts a fully isolated XMLUI application into each one.

---

## Problem Context

Two earlier commits (b450ce8e, 6203b636) attempted this feature but broke the build:

- `ThemeReact.tsx` imported `virtual:css-injected-by-js` directly. That virtual module only exists when `vite-plugin-css-injected-by-js` is active — i.e. standalone mode only. The import caused hard errors in all other build modes (lib, dev, SSG).
- The attempted fix added `cssInjectedByJsPlugin` to `viteConfig.ts` (the CLI's dev/build config), which then conflicted with `vite-plugin-lib-inject-css` and broke lib builds.

---

## What Was Changed

### 1. `xmlui/src/components-core/cssInjectionRegistry.ts` (new)

A tiny shared singleton with no virtual module dependency:

```ts
type CSSInjectionAPI = {
  injectCSS: (opts: { target: Element | ShadowRoot }) => void;
  removeCSS: () => void;
};
let _api: CSSInjectionAPI | null = null;
export const registerCSSInjection = (api: CSSInjectionAPI): void => {
  _api = api;
};
export const getCSSInjectionAPI = (): CSSInjectionAPI | null => _api;
```

Standalone entry populates it; shared code reads from it. In non-standalone modes `_api` stays `null`, so all calls are no-ops.

### 2. `xmlui/src/index-standalone.ts`

The **only** file that imports `virtual:css-injected-by-js`. It registers the CSS API and routes to either `activateIslands` (island mode) or `startApp` (classic standalone) based on whether `[data-xmlui-src]` elements exist:

```ts
import { injectCSS, removeCSS } from "virtual:css-injected-by-js";
import { registerCSSInjection } from "./components-core/cssInjectionRegistry";
import { activateIslands } from "./components-core/Islands/activateIslands";

registerCSSInjection({ injectCSS, removeCSS });

document.addEventListener("DOMContentLoaded", () => {
  const islandTargets = document.querySelectorAll("[data-xmlui-src]");
  if (islandTargets.length > 0) {
    activateIslands(islandTargets);
  } else {
    startApp(undefined, undefined, Xmlui);
  }
});
```

### 3. `xmlui/src/components-core/Islands/activateIslands.tsx` (new)

For each `[data-xmlui-src]` element:

1. Attaches a shadow root (`mode: "open"`).
2. Injects `@layer reset, base, components, themes, dynamic;` as the first `<style>` in the shadow root. This must happen before any component CSS enters, otherwise the browser's first-appearance cascade ordering silently breaks theme overrides.
3. Creates a `<div id="nested-app-root" style="display:contents">` inside the shadow root. `ThemeReact.tsx`'s `RootClasses` component queries for this element by ID to apply theme class names; without it, the query returns `null` and crashes.
4. Mounts React into that div (not directly into the shadow root) with:
   - `StyleInjectionTargetContext.Provider value={shadowRoot}` — tells `useStyles()` to inject `<style>` tags into the shadow root instead of `document.head`.
   - `StyleProvider forceNew={true}` — creates a fresh `StyleRegistry` per island, preventing cross-island style deduplication contamination.
   - `StandaloneApp basePath={basePath}` — routes all file fetches to the island's own folder.

All islands share one `StandaloneExtensionManager` instance (extensions registered once, used everywhere).

### 4. `xmlui/src/components/Theme/ThemeReact.tsx`

Removed the direct `virtual:css-injected-by-js` import. `RootClasses` now uses the registry:

```ts
import { getCSSInjectionAPI } from "../../components-core/cssInjectionRegistry";

// inside RootClasses useIsomorphicLayoutEffect:
const insideShadowRoot = domRoot instanceof ShadowRoot;
const target = insideShadowRoot ? domRoot : document.head;
// ...
const cssAPI = getCSSInjectionAPI();
if (cssAPI) {
  cssAPI.injectCSS({ target });
}
return () => {
  // ...
  // Skip removeCSS for shadow roots: unmounting one island must not strip
  // styles from all others. Shadow root GC reclaims styles when destroyed.
  if (cssAPI && !insideShadowRoot) cssAPI.removeCSS();
};
```

### 5. `xmlui/vite.config.ts`

Added a `standalone` case in the plugin selection. Only `cssInjectedByJsPlugin()` is used there — no `libInjectCss`, no `dts`:

```ts
} else if (mode === "standalone") {
  plugins = [react(), svgr(), ViteYaml(), ViteXmlui({}), cssInjectedByJsPlugin()] as Plugin[];
} else {
  plugins = [react(), svgr(), ViteYaml(), ViteXmlui({}), libInjectCss(), dts({ rollupTypes: true })] as Plugin[];
}
```

### 6. `xmlui/src/vite-env.d.ts`

Added a module declaration for `virtual:css-injected-by-js` so TypeScript is satisfied in all build modes. (`vite-plugin-css-injected-by-js` v5.0.1 does not ship a usable ambient declaration at a predictable path, so we declare it ourselves.)

### 7. `xmlui/src/components-core/StandaloneApp.tsx`

- Added `basePath?: string` prop. When set (islands), all resource fetches go through a `prefixPath` helper that prepends it to relative paths and passes absolute URLs unchanged.
- `previewMode={!!basePath}` forces `MemoryRouter` per island, preventing islands from sharing the host page's URL hash. The same prop also disables `HelmetProvider.canUseDOM`, which is the desired side-effect — islands should not be able to modify the host page's `<head>`.
- Dependency array includes `basePath` so the effect re-runs if it changes.

### 8. `temp-islands/` (test harness)

```
temp-islands/
  index.html                   # host page with <div data-xmlui-src="./bio"> and <div data-xmlui-src="./checkout-form">
  xmlui-standalone.umd.js      # copy of the built bundle (run build:xmlui-standalone then cp)
  bio/
    Main.xmlui                 # light-themed form + markdown + MyComp
    components/
      MyComp.xmlui
  checkout-form/
    Main.xmlui                 # dark-themed card + modal button + MyComp
    components/
      MyComp.xmlui
```

Serve with `npx serve . -p 4173` from inside `temp-islands/`. The `xmlui-standalone.umd.js` is not committed (it is in `.gitignore`); rebuild and copy after each change.

---

## What Works

| Mode                                                   | Status |
| ------------------------------------------------------ | ------ |
| `npm run build:xmlui-standalone`                       | ✅     |
| `npm run build:xmlui` (lib)                            | ✅     |
| `npm run start` (dev via `viteConfig.ts`)              | ✅     |
| Islands render in browser (shadow DOM, per-island CSS) | ✅     |
| Host CSS cannot bleed into islands                     | ✅     |
| Island CSS cannot leak out to host page                | ✅     |
| Each island loads its own `Main.xmlui` / `components/` | ✅     |
| Islands do not share router state (MemoryRouter)       | ✅     |
| Islands do not modify host `<head>`                    | ✅     |
| SSG build                                              | ✅     |

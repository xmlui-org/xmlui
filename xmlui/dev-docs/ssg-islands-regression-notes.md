# SSG / Islands Regression Notes

This note captures what changed around the islands work, why SSG first paint changed, and the critical code path involved in the regression.

## Summary

The regression was not an "islands-only" bug.

Commit `ed09b3395` ("Xmlui islands concept is ready for QA") changed the CSS delivery path for standalone apps in a way that also affected normal SSG pages:

- base framework CSS was moved away from eager standalone startup
- built component/module CSS was moved into runtime JS injection
- `RootClasses` became responsible for injecting styles into either `document.head` or a shadow root

That architecture is correct for islands, but it also means non-island SSG pages can miss part of their styling at first paint unless the same styles are serialized into the generated HTML.

## Critical Code Path

This is the critical path for the behavior we were debugging:

1. Website SSG entry point

   - [website/package.json](/Users/jonudell/xmlui/website/package.json:13)
   - `npm run build-ssg`
   - runs `xmlui ssg`

2. XMLUI CLI dispatch

   - [xmlui/src/nodejs/bin/index.ts](/Users/jonudell/xmlui/xmlui/src/nodejs/bin/index.ts:213)
   - the `ssg` subcommand calls `ssg(...)`

3. SSG build flow

   - [xmlui/src/nodejs/bin/ssg.ts](/Users/jonudell/xmlui/xmlui/src/nodejs/bin/ssg.ts:636)
   - builds the app with `buildMode: "INLINE_ALL"`
   - copies `dist` to `dist-ssg`
   - builds a temporary SSR bundle
   - renders each route via `renderPath(...)`
   - merges the rendered output into the shell HTML via `applyRenderToShell(...)`

4. SSR render entry

   - [xmlui/src/nodejs/bin/ssg.ts](/Users/jonudell/xmlui/xmlui/src/nodejs/bin/ssg.ts:272)
   - temporary module creates:
     - `StyleRegistry`
     - `HelmetProvider`
     - `StandaloneApp`
   - `renderToString(app)` produces route HTML
   - `registry.getSsrStyles()` produces theme/dynamic SSR CSS
   - `helmetContext.helmet` produces extra head tags

5. HTML assembly

   - [xmlui/src/nodejs/bin/ssg.ts](/Users/jonudell/xmlui/xmlui/src/nodejs/bin/ssg.ts:237)
   - `applyRenderToShell(...)`
   - injects:
     - title/head tags
     - `data-style-registry` styles from `StyleRegistry`
     - rendered markup

6. Client startup after SSG

   - [xmlui/src/components-core/StandaloneApp.tsx](/Users/jonudell/xmlui/xmlui/src/components-core/StandaloneApp.tsx:1736)
   - `startApp(...)`
   - if `#root` already has HTML, calls `ReactDOM.hydrateRoot(...)`

7. Root theme/style application on the client

   - [xmlui/src/components/Theme/ThemeReact.tsx](/Users/jonudell/xmlui/xmlui/src/components/Theme/ThemeReact.tsx:342)
   - `RootClasses`
   - applies classes to `<html>`
   - injects base styles
   - applies runtime-injected module styles from `window.__XMLUI_STYLES__`

8. Built CSS injection path

   - [xmlui/src/nodejs/bin/viteConfig.ts](/Users/jonudell/xmlui/xmlui/src/nodejs/bin/viteConfig.ts:45)
   - [xmlui/vite.config.ts](/Users/jonudell/xmlui/xmlui/vite.config.ts:125)
   - `vite-plugin-css-injected-by-js`
   - generated JS appends CSS into:
     - `window.__XMLUI_STYLES__`
   - then dispatches:
     - `xmlui-styles-loaded`

The regression happens when step 5 does not serialize enough CSS into the HTML, and step 7 / step 8 only complete after the browser has already painted the page.

## What `ed09b3395` Changed

The important non-island effects were:

### 1. Standalone base CSS stopped being an eager side-effect import

Before the islands work, `StandaloneApp` imported:

- [xmlui/src/components-core/StandaloneApp.tsx](/Users/jonudell/xmlui/xmlui/src/components-core/StandaloneApp.tsx:12)
  - `import "../index.scss";`

That made base CSS available through the normal standalone startup path.

After the islands work, base CSS was no longer imported there. Instead it was moved into runtime injection in `RootClasses`.

### 2. `RootClasses` became responsible for injecting base CSS

Affected file:

- [xmlui/src/components/Theme/ThemeReact.tsx](/Users/jonudell/xmlui/xmlui/src/components/Theme/ThemeReact.tsx:342)

The islands version made `RootClasses` do more:

- inject `xmlui-base-styles`
- prepend them to the correct target
- support both `document.head` and shadow roots
- consume `window.__XMLUI_STYLES__`

That is necessary for islands, because shadow DOM cannot rely on document-global CSS.

### 3. Built CSS moved into JS runtime injection

Affected files:

- [xmlui/src/nodejs/bin/viteConfig.ts](/Users/jonudell/xmlui/xmlui/src/nodejs/bin/viteConfig.ts:45)
- [xmlui/vite.config.ts](/Users/jonudell/xmlui/xmlui/vite.config.ts:125)

The added plugin emits code like:

- `window.__XMLUI_STYLES__ += ...`
- `window.dispatchEvent(new CustomEvent("xmlui-styles-loaded"))`

That means built component/module CSS is available after the bundle runs, not automatically in the prerendered HTML.

## Why SSG Regressed

For a good SSG first paint, the generated HTML needs to contain all styling needed to render the page in its first visual state.

After the islands change:

- SSR still emitted `StyleRegistry` CSS via `registry.getSsrStyles()`
- but base CSS was now client-injected by `RootClasses`
- and built module CSS was now client-injected by the JS bundle

So SSG pages could render with:

- correct HTML
- some theme/dynamic CSS
- but missing base CSS and/or missing module CSS until hydration

That is the root reason for the first FOUC we saw.

## Why Debugging Was Confusing

There were two separate issues:

### 1. Big first-paint CSS gap

This was the obvious FOUC.

It was caused by missing CSS in the generated HTML.

### 2. Smaller remaining header flicker

Once the bigger CSS gap was addressed, a smaller movement remained.

The leading suspects there were:

- app layout helper vars changing after mount
  - [xmlui/src/components/App/AppReact.tsx](/Users/jonudell/xmlui/xmlui/src/components/App/AppReact.tsx:299)
- scrollbar-width compensation affecting header padding
  - [xmlui/src/components-core/utils/css-utils.ts](/Users/jonudell/xmlui/xmlui/src/components-core/utils/css-utils.ts:140)
  - [xmlui/src/components/App/App.module.scss](/Users/jonudell/xmlui/xmlui/src/components/App/App.module.scss:276)
- responsive/header state changing after hydration

That header flicker should be treated separately from the original SSG CSS-delivery regression.

## Important Discovery During Investigation

At one point the wrong server was being inspected.

Port `4173` was running:

- `xmlui preview`

not:

- `preview-ssg`

That server returned only a small HTML shell and none of the expected inlined SSG styles.

The actual SSG preview on port `3000` was serving:

- `xmlui-base-styles`
- `xmlui-module-styles`
- `data-style-registry`

That distinction mattered a lot when separating:

- generated HTML correctness
- from live preview/server correctness

## Was the Islands Commit "Mixed With Other Things"?

Yes, but not in the sense of random unrelated work.

It was a cross-cutting infrastructure change that bundled:

- island support
- standalone startup changes
- CSS delivery changes
- head/shadow-root style targeting
- Vite CSS-in-JS injection changes

So the right framing is:

> the islands commit changed shared style-delivery infrastructure, and that infrastructure also serves non-island SSG pages.

That is why the regression showed up in the website even though the website itself is not an island app.

## Practical Takeaway

The critical fix area is not "the website header" itself.

The critical fix area is the standalone/SSG style-delivery path:

- what SSR serializes into the HTML
- what `RootClasses` injects only after hydration
- what Vite emits only into `window.__XMLUI_STYLES__`

If SSG is expected to paint correctly before hydration, that path must ensure the same required CSS is available in prerendered HTML, not only after the client bundle runs.

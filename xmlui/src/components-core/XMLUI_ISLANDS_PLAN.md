# XMLUI Islands — Implementation Plan

> Goal: allow a host (non-XMLUI) web page to embed multiple, independent XMLUI
> apps by placing `<div data-xmlui-src="./folder">` markers in its HTML. Each
> island is fully isolated (state, styles, themes). The primary delivery target
> is the existing `xmlui-standalone.umd.js` bundle loaded via a plain `<script>`
> tag — no build step required on the host site. Islands are designed for
> traditional server-rendered settings (ASP.NET, Django, Rails, any CMS) where
> the server controls the HTML and a client-side bundle activates the islands.

This plan is incremental: every step ends in a runnable / testable state.

The reference example is `temp-islands/`. it tags two divs with `data-xmlui-src="./bio"`
and `data-xmlui-src="./checkout-form"`, islands should be placed there.

---

## 0. Reference points in the existing codebase

These existing pieces will be **reused**, not duplicated:

- [xmlui/src/index-standalone.ts](xmlui/src/index-standalone.ts) — current UMD
  entry that calls `startApp(undefined, undefined, Xmlui)`. Islands support will
  be added here.
- [xmlui/src/components-core/StandaloneApp.tsx](xmlui/src/components-core/StandaloneApp.tsx)
  — exports `StandaloneApp` and `startApp(runtime, extensions, extensionManager)`.
  `startApp` always targets `#root` and creates a single React root, which should be modified. If there's no #root, but there are data-xmlui-src="/some/path/" attributes, do not create the root.
- [xmlui/src/components-core/StandaloneExtensionManager.ts](xmlui/src/components-core/StandaloneExtensionManager.ts).
- Style isolation primitives:
  - `StyleInjectionTargetContext` and `useDomRoot` in
    [xmlui/src/components-core/theming/StyleContext.tsx](xmlui/src/components-core/theming/StyleContext.tsx#L84)
    — when set to a `ShadowRoot`, all dynamic styles register inside that
    shadow root instead of `document.head`.
  - `StyleProvider` (own `StyleRegistry` per island).
  - `ThemeProvider` already branches on `domRoot instanceof ShadowRoot` for
    portal containers — see
    [ThemeProvider.tsx:357](xmlui/src/components-core/theming/ThemeProvider.tsx#L357).
- Existing in-page shadow-DOM example: [NestedAppReact.tsx](xmlui/src/components/NestedApp/NestedAppReact.tsx#L150).
- `xmlui-standalone` build mode in [xmlui/vite.config.ts](xmlui/vite.config.ts#L21) and
  the script `build:xmlui-standalone` in [xmlui/package.json](xmlui/package.json#L13).
- Existing SSG pipeline: [xmlui/src/nodejs/bin/ssg.ts](xmlui/src/nodejs/bin/ssg.ts).
  Islands do not add to or depend on this pipeline. It is listed here only
  because island changes some files that
  could accidentally break it, based on how ssg creates an entrypoint with custom theme provider and such.

The new code must touch these files non-invasively (additive APIs only);
existing `startApp` callers must not change behavior.

---

## 1. Architectural overview

An _island_ is a standalone XMLUI app instance mounted into an arbitrary host
DOM element. The contract:

- Host page contains zero or more `<div data-xmlui-src="<folder>"></div>`
  elements. The folder path is resolved relative to the host page URL. The host
  page is produced by a server (or a CMS); it is not an XMLUI SSG output.
- The framework extends the standalone bundle (`xmlui-standalone.umd.js`). The host page loads it with a plain `<script>`
  tag — no build step, no bundler.
- For each marker div, the framework (once DOMContentLoaded has fired) automatically:
  1. Fetches `Main.xmlui` (and the usual standalone resources: `config.json`,
     `Main.xmlui.xs`, `Globals.xs`, `themes/*.json`, `components/*`,
     `resources/*`) **rooted at the marker's folder**, not the host site root. This works just like how standalone mode works right now.
  2. Attaches an open Shadow DOM to the marker div.
  3. Renders an isolated `<StandaloneApp>` inside the shadow root with its own
     `StyleRegistry` and `StyleInjectionTargetContext`.
- Multiple islands on the same host page share neither React state, theme
  state, query cache, nor injected styles.

### Why Shadow DOM (and not just CSS scoping)

- Bidirectional isolation: host CSS cannot bleed in (XMLUI relies on global
  CSS variables and a CSS reset; without isolation, host styles would clash);
  the island's component styles cannot leak out.
- Already supported by `StyleInjectionTargetContext` — minimal new code.
- Theming portals (`#nested-app-portal-root`) already handled.

### Trade-offs

- Shadow DOM blocks form auto-fill / extensions for some sites and breaks
  CSS `@font-face` resolution from external stylesheets — mitigations
  documented in step 6.
- Hash-based routing is undesirable for embedded apps; islands default to
  memory routing.

### Relationship to the website SSG pipeline

The XMLUI website uses its own SSG pipeline (`xmlui ssg`). **Islands are
orthogonal to that pipeline.** Islands render purely client-side; the host
server is responsible for its own HTML. Islands do not produce, consume, or
extend the SSG output.

The only risk islands pose to the website SSG is at build time: edits to shared
files (`AppWrapper.tsx`, `StandaloneApp.tsx`) could silently break the SSG build,
**especially with changes to theming**.

---

## 2. Verification protocol

**After each step, stop.** Run `npm run test-smoke` and `npm run test-integration`,
then ask the programmer to verify that the website SSG output is still correct

---

## 3. Incremental steps

### Step 1 — Auto-detection stub (no render)

**Add**: `xmlui/src/components-core/Islands/activateIslands.tsx` — an internal
module (not exported from `index.ts`) that:

- Logs a console banner with the XMLUI version.
- Iterates `document.querySelectorAll('[data-xmlui-src]')`.
- Tags each marker `dataset.xmluiIslandStatus = 'pending'` (no render yet).

**Modify**: `xmlui/src/index-standalone.ts` — on `DOMContentLoaded`, detect
which mode to use:

```ts
import { activateIslands } from "./components-core/Islands/activateIslands";

document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelectorAll("[data-xmlui-src]").length > 0) {
    activateIslands(Xmlui);
  } else if(!document.getElementById("root")){
      // Your existing code unmodified...
      const div = document.createElement('div');
      div.id = 'root';
      document.getElementsByTagName('body')[0].appendChild(div);
    }
    startApp(undefined, undefined, Xmlui);
  }
});
```

The host page needs no JavaScript call — dropping the script tag is sufficient.

**Pause** and run the standard checks. Verify the console banner appears and
markers are tagged in the DOM when serving `temp-islands/`.

**Risk**: zero. The new branch is only entered when markers exist; the `startApp`
path is untouched.

---

### Step 2 — Per-island React mount with isolation (placeholder content)

Render a placeholder `<div>` inside each marker using a private React root
mounted on a Shadow DOM.

**Add**: `xmlui/src/components-core/Islands/IslandRoot.tsx`

- Accepts `host: HTMLElement` and `children: ReactNode`.
- Calls `host.attachShadow({ mode: "open" })` once (idempotent for HMR).
- Creates `<div id="xmlui-island-root">` inside the shadow root.
- Before mounting React, injects a `<style>` tag as the **first child** of the
  shadow root containing `@layer reset, base, components, themes, dynamic;`.
  This must match the layer order in `index.scss`; without it, cascade layers
  inside the shadow root apply in an undefined order (silent rendering bugs).
- Wraps children in `<StyleProvider forceNew={true}>` (own `StyleRegistry`) +
  `<StyleInjectionTargetContext.Provider value={shadowRoot}>`.
  The `forceNew` prop is required — without it, the provider may reuse a parent
  registry and dynamic component styles will land outside the shadow root.

**Modify** `activateIslands` to render `<IslandRoot>placeholder</IslandRoot>` per
marker. Track roots in a module-level `Map<HTMLElement, Root>`.

**Pause** and run the standard checks. Also visually verify `NestedApp` in the
devtools demo — it shares the same shadow-DOM path and is the easiest manual
repro for portal/style issues.

**Risk**: low. No changes to `StandaloneApp`/`startApp`.

---

### Step 3 — Plumb `basePath` through `StandaloneApp` / `useStandalone`

**This is the highest-risk shared-code step**. Currently `useStandalone` and
the parser fetch helpers fetch `Main.xmlui`, `config.json`, `themes/*.json`,
and `components/**` from paths implicitly rooted at the document. Islands
need each app rooted at its own folder.

**Plan**:

1. Survey: list every `fetch(...)` and resource resolution call reachable from
   `<StandaloneApp>` (`StandaloneApp.tsx`, `xmlui-parser.ts`,
   `ModuleResolver.ts`, `theming/ThemeProvider.tsx`, icon sprite loader).
2. Add an optional `basePath?: string` prop to `StandaloneApp` (default `""`).
3. Plumb via prop drilling. Provide a single
   helper `resolveAppFile(relativePath, basePath)` so every fetch goes
   through it.
4. `startApp` does not pass `basePath` → empty-string default reproduces
   today's behavior exactly.

**Pause** and run the checks.
Note that there's a `window.__PUBLIC_PATH` option, which could interfere with
this feature (used for standalone entrypoint mode). `basePath` must be independent of that.

**Risk**: high. Mitigations: funnel through one helper; add a Vitest unit test
that asserts every known fetch site composes URLs through that helper
(grep-based test).

---

### Step 4 — Wire islands to load real apps

Combine steps 2 + 3.

**Modify** `IslandRoot` to render
`<StandaloneApp basePath={folder} extensionManager={...} />` inside its
shadow root.

The router is hardcoded to **memory** mode for islands — hash routing on the
host page would make every island react to the same URL hash. Implementation:
thread a `routerMode` prop into `AppWrapper.tsx` (today only `useHashBasedRouting`
exists; add `useMemoryRouter` as a peer). `activateIslands` always passes
`routerMode="memory"`.

Note that `StandaloneApp` passes `window.__PUBLIC_PATH` as `routerBaseName`
(line 283 of `StandaloneApp.tsx`). For islands this must be overridden to `""`
(or the island's own sub-path if needed); inheriting the host page's public path
would produce broken router base names. Add a `routerBaseName?: string` prop to
`StandaloneApp` (default: `window.__PUBLIC_PATH || ""`) and pass `""` from
`IslandRoot`.

**Pause** and run the standard checks. Also verify manually:

- Both islands render their real `Main.xmlui` content.
- A counter/state change in one island does not affect the other.
- Switching theme tone in one island does not affect the host or the other.
- Network panel: requests for `./bio/Main.xmlui`, `./bio/components/...`,
  `./checkout-form/Main.xmlui`, etc.

**Risk**: medium. Most likely failure mode: forgotten fetch site for theme
JSON or icon sprite — caught by the verification list above. Router-mode
plumbing edits `AppWrapper.tsx`, which the website's SSG pipeline uses via
`StaticRouter` — the SSG check guards this.

---

### Step 5 — Style/theme isolation hardening

Address issues surfaced in steps 2 and 4:

1. **Global CSS reset**: `StandaloneApp.tsx` does `import "../index.scss"` which
   the bundler injects into `document.head` at module-init time — before any
   island logic runs — and this will affect the host page. Do NOT try to capture
   the CSS string at build time; use the same runtime approach as
   `NestedAppReact.tsx` (lines 162-199):
   - After attaching the shadow root, iterate `document.styleSheets`.
   - **Skip** sheets whose owner element has a `data-style-hash` attribute —
     those are the dynamic per-component styles that `StyleProvider` /
     `StyleInjectionTargetContext` will re-inject into the shadow root. Copying
     them here would produce duplicates.
   - **Skip** cross-origin sheets (can't be read due to CORS).
   - Clone the remaining sheets into `CSSStyleSheet` objects and assign them to
     `shadowRoot.adoptedStyleSheets`.
   - This runs after `DOMContentLoaded`, so the bundle's `<style>` tags are
     already present in `document.styleSheets` by the time islands activate.
2. **`@font-face` and external assets**: declare in the host page or proxy
   into each island's shadow root.
3. **CSS variable inheritance bleed**: CSS custom properties (`--theme-*`,
   `--background-color`, etc.) are *inherited by default* and cross shadow
   boundaries — a host page that sets any XMLUI theme variable will affect
   island theming even with shadow DOM. Mirror the `NestedAppRoot` pattern from
   `NestedAppReact.tsx` (lines 385-408): inside the island's shadow root, render
   a wrapper element that resets every known theme CSS variable to `initial`.
   Note that the isolation test described below (`color: red !important`) does
   NOT catch this; add a separate test that sets `--background-color` on the
   host body and confirms the island is unaffected.

4. **`react-hot-toast` portal**: `StandaloneApp` uses `toast.error` for lint
   warnings. The Toaster portal renders into `document.body`, outside the shadow
   root. For islands, these toasts will appear in the host page. This is a
   cosmetic issue (not a correctness bug), but worth tracking. Mitigation is
   deferred; document as a known limitation for now.

5. **Portals (modal, tooltip, dropdown)**: `ThemeProvider` already creates a
   portal container inside the shadow root when `domRoot instanceof ShadowRoot`.
   Verify against a Modal-using island.

**Pause** and run the standard checks. Also verify:

- Add `<style>* { color: red !important; box-shadow: 0 0 0 2px lime !important; }</style>`
  to the host head — islands must remain unaffected.
- Add `<style>:root { --background-color: hotpink; }</style>` to the host head —
  island background must remain unaffected (CSS variable inheritance bleed check).
- A Modal-using island fixture — the modal must portal inside the island's
  shadow root, not the host body.

**Risk**: medium. Iterative; treat regressions as red gates.

---

---

## 4. Public API summary (target end state)

There is no user-callable function. The entire islands contract is expressed
through HTML attributes:

| Attribute                   | Element           | Description                                                                           |
| --------------------------- | ----------------- | ------------------------------------------------------------------------------------- |
| `data-xmlui-src="<folder>"` | any block element | Marks the element as an island. `<folder>` is resolved relative to the host page URL. |

The bundle auto-detects markers on `DOMContentLoaded`. If any are present it
activates islands mode; otherwise it falls back to classic single-app mode
(targets `#root`).

Land each step as its own chunk of work.

---

## 6. Out-of-scope (explicitly deferred)

- Cross-island communication (pub/sub, shared store).
- Lazy / intersection-observer based island activation.
- Island-specific SSG pre-rendering: islands render purely client-side. The
  host server (Django, Rails, etc.) is responsible for its own HTML; XMLUI
  does not provide tooling to pre-render island content into that HTML.
- `xmlui island` CLI commands (`island build`, `island ssg`, `island start`):
  there is no user-facing `xmlui island` subcommand.
- SSR streaming.

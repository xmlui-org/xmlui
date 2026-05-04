# XMLUI Islands — Implementation Plan

> Goal: allow a host (non-XMLUI) web page to embed multiple, independent XMLUI
> apps by placing `<div data-xmlui-src="./folder">` markers in its HTML. Each
> island is fully isolated (state, styles, themes). The primary delivery target
> is a CDN script tag — no build step required on the host site. Islands are
> designed for traditional server-rendered settings (ASP.NET, Django, Rails,
> any CMS) where the server controls the HTML and a client-side bundle
> activates the islands.

This plan is incremental: every step ends in a runnable / testable state and
includes a concrete **manual smoke matrix** that catches regressions the unit
and E2E suites have historically missed (most importantly: silent SSG breakage).

The reference example is `temp-islands/`. The host page already calls
`startIslands()` from `xmlui` and tags two divs with `data-xmlui-src="./bio"`
and `data-xmlui-src="./checkout-form"`.

---

## 0. Reference points in the existing codebase

These existing pieces will be **reused**, not duplicated:

- [xmlui/src/index-standalone.ts](xmlui/src/index-standalone.ts) — current UMD
  entry that calls `startApp(undefined, undefined, Xmlui)`.
- [xmlui/src/components-core/StandaloneApp.tsx](xmlui/src/components-core/StandaloneApp.tsx)
  — exports `StandaloneApp` and `startApp(runtime, extensions, extensionManager)`.
  `startApp` always targets `#root` and creates a single React root.
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
  The island build follows the same pattern — CI-only, not a user-facing command.
- Existing SSG pipeline: [xmlui/src/nodejs/bin/ssg.ts](xmlui/src/nodejs/bin/ssg.ts).
  Islands do not add to or depend on this pipeline. It is listed here only
  because island build changes to shared files (e.g. `vite.config.ts`,
  `AppWrapper.tsx`) could accidentally break it — the W-SSG smoke check guards
  against that.
- Static preview server: [tools/preview-ssg](tools/preview-ssg) — is a
  general static file server useful for testing multi page applications. For the islands client, `npx serve -s` is prefered.

The new code must touch these files non-invasively (additive APIs and a new
build mode); existing `startApp` callers must not change behavior.

---

## 1. Architectural overview

An *island* is a standalone XMLUI app instance mounted into an arbitrary host
DOM element. The contract:

- Host page contains zero or more `<div data-xmlui-src="<folder>"></div>`
  elements. The folder path is resolved relative to the host page URL. The host
  page is produced by a server (or a CMS); it is not an XMLUI SSG output.
- The framework provides a UMD bundle (`xmlui-island.umd.js`) that exposes a
  global function `startIslands(options?)`. The host page loads it with a plain
  `<script>` tag — no build step, no bundler.
- For each marker div, the framework:
  1. Fetches `Main.xmlui` (and the usual standalone resources: `config.json`,
     `Main.xmlui.xs`, `Globals.xs`, `themes/*.json`, `components/*`,
     `resources/*`) **rooted at the marker's folder**, not the host site root.
  2. Attaches an open Shadow DOM to the marker div.
  3. Renders an isolated `<StandaloneApp>` inside the shadow root with its own
     `StyleRegistry` and `StyleInjectionTargetContext`.
- Multiple islands on the same host page share neither React state, theme
  state, query cache, nor injected styles.

The `xmlui-island.umd.js` bundle is built in CI alongside
`xmlui-standalone.umd.js`, via a new `build:xmlui-island` script in
`xmlui/package.json` and a new `case "island"` arm in `xmlui/vite.config.ts`.
This is not a user-facing CLI command.

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
files (`vite.config.ts`, `AppWrapper.tsx`, `StandaloneApp.tsx`) could silently
break the SSG build **SPECIALLY WITH CHANGES TO THEMING**. The W-SSG smoke check guards against that regression.

---

## 2. Manual smoke matrix (run after every step)

The unit and E2E suites previously gave a green light while real apps broke.
The matrix below is short and targets the apps most likely to regress.
**Run the rows applicable to each step's risk class** (each step lists which
rows to run). Each row runs in its own terminal; treat any visual regression,
console error, or hydration mismatch as a failure even if exit code is 0.

| ID | App | Command (from repo root) | What to inspect |
|----|-----|--------------------------|-----------------|
| **E** | E2E (smoke subset) | `npm run test-smoke` (or full test for risky steps `npm run test`) | All green; no new flakes |
| **W-DEV** | Website (Vite dev) | `npm run -w website start` | Loads at `http://localhost:5173`; nav between Docs / Blog / a few component pages; check theme toggle |
| **W-SSG** | Website SSG (regression check) | `npm run -w website build-ssg && npm run -w website preview-ssg` | (1) Build completes without errors, (2) `dist-ssg/index.html` and `dist-ssg/docs/index.html` exist and contain pre-rendered XMLUI markup (NOT just an empty `<div id="root">`), (3) preview at `http://localhost:3000` shows content **before** JS hydration (disable JS in DevTools, reload), (4) re-enable JS, navigate around — no hydration warnings in console, search and links work |
| **STD** | Standalone UMD | `npm run -w xmlui build:xmlui-standalone`, copy the resulting umd file into a standalone project (which shall be created) then open it with a web server | UMD bundle loads; classic standalone app boots |
| **ISL** | Islands UMD (CDN mode) | `npm run -w xmlui build:xmlui-island`, copy the resulting umd file and source-map into the temp-islands folder, serve with a static file server | Both islands render in their own shadow roots; click events work; counters / state independent |

**The single most important regression check is W-SSG**, because its failures
are silent (`xmlui ssg` exits 0 even when nothing was pre-rendered). A reusable
verification snippet (paste after every SSG run):

```bash
# Asserts pre-rendered content is present, not just an empty <div id="root">.
node -e '
  const fs = require("fs");
  const path = require("path");
  const dir = process.argv[1];
  const file = path.join(dir, "index.html");
  const html = fs.readFileSync(file, "utf8");
  const m = html.match(/<div id="root"[^>]*>([\s\S]*?)<\/div>\s*<script/);
  const inner = m ? m[1].trim() : "";
  if (inner.length < 200) {
    console.error("FAIL: " + file + " has empty/near-empty #root (length=" + inner.length + ")");
    process.exit(1);
  }
  console.log("OK: " + file + " (#root length=" + inner.length + ")");
' website/dist-ssg
```

---

## 3. Incremental steps

Each step lists: what to build, files to add/modify, **smoke rows** from §2 to
run, and what could regress.

### Step 1 — `startIslands()` API stub (no behavior)

**Add**: `xmlui/src/components-core/Islands/startIslands.tsx` exporting
`startIslands(options?)`:

- Logs a console banner with the XMLUI version.
- Iterates `document.querySelectorAll('[data-xmlui-src]')`.
- Tags each marker `dataset.xmluiIslandStatus = 'pending'` (no render).

**Modify**: `xmlui/src/index.ts` — re-export `startIslands` so
`temp-islands/index.ts`'s existing import resolves.

**Smoke**: `E`, `ISL` (just verifies the banner + tagged markers in DOM).

**Risk**: zero. Pure additive export.

---

### Step 2 — Per-island React mount with isolation (placeholder content)

Render a placeholder `<div>` inside each marker using a private React root
mounted on a Shadow DOM.

**Add**: `xmlui/src/components-core/Islands/IslandRoot.tsx`

- Accepts `host: HTMLElement` and `children: ReactNode`.
- Calls `host.attachShadow({ mode: "open" })` once (idempotent for HMR).
- Creates `<div id="xmlui-island-root">` inside the shadow root.
- Wraps children in `StyleProvider` (own `StyleRegistry`) +
  `<StyleInjectionTargetContext.Provider value={shadowRoot}>`.

**Modify** `startIslands` to render `<IslandRoot>placeholder</IslandRoot>` per
marker. Track roots in a module-level `WeakMap<HTMLElement, Root>` so
re-invocations unmount the previous root before remounting.

**Smoke**: `E`, `ISL`, plus a quick visual on **DEMO-D** (because
`NestedApp` uses the same shadow-DOM path and devtools demo is the easiest
manual repro for portal/style issues).

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
3. Plumb via a new React context `IslandBasePathContext`. Provide a single
   helper `resolveAppFile(relativePath, basePath)` so every fetch goes
   through it.
4. `startApp` does not pass `basePath` → empty-string default reproduces
   today's behavior exactly.

**Smoke**: **the full matrix minus islands**.
Justification: this is the first step that edits shared code paths. `StandaloneApp`
is used by both the islands path and the website's SSG pipeline. If any fetch
site is missed, the website's SSG build silently regresses (the original
failure mode). W-SSG plus the verification snippet from §2 catches it.

Also, manually exercise `<StandaloneApp basePath="./bio" />` from a temporary
test page or a Vitest fixture to confirm the new code path works in isolation
before any island wiring.

Note that there's a `window.__PUBLIC_PATH` option, which could interfere with this feature. It should be independent of that.

**Risk**: high. Mitigations: funnel through one helper; add a Vitest unit test
that asserts every known fetch site composes URLs through that helper
(grep-based test).

---

### Step 4 — Wire islands to load real apps (ISL only)

Combine steps 2 + 3.

**Modify** `IslandRoot` to render
`<StandaloneApp basePath={folder} extensionManager={...} />` inside its
shadow root.

**Modify** `startIslands` options:
```ts
type StartIslandsOptions = {
  selector?: string;          // default "[data-xmlui-src]"
  extensionManager?: StandaloneExtensionManager;
  routerMode?: "memory" | "hash" | "browser"; // default "memory"
  decorateWithTestId?: boolean;
};
```

The router default switches to **memory** for islands (hash routing on the
host page would make every island react to the same URL). Implementation:
thread `routerMode` into `AppWrapper.tsx` (today only `useHashBasedRouting`
exists; add `useMemoryRouter` as a peer).

**Smoke**: **E**, **ISL**, plus **W-SSG** (because router-mode plumbing edits
`AppWrapper.tsx`, which the website's SSG pipeline uses via `StaticRouter` —
regression check only).

**Verify in ISL**:
- Both islands render their real `Main.xmlui` content.
- A counter/state change in one island does not affect the other.
- Switching theme tone in one island does not affect the host or the other.
- Network panel: requests for `./bio/Main.xmlui`, `./bio/components/...`,
  `./checkout-form/Main.xmlui`, etc.

**Risk**: medium. Most likely failure mode: forgotten fetch site for theme
JSON or icon sprite — caught by the verification list above.

---

### Step 5 — `xmlui-island` Vite build mode (UMD bundle)

Produce `dist/island/xmlui-island.umd.js` — the script a host page loads via
a `<script>` tag. This is the step that unlocks the primary delivery target
(CDN/no-build mode). No Vite dev server, no build step on the host site.

**Modify** `xmlui/vite.config.ts`: add a `case "island"` arm mirroring
`standalone` (entry `src/index-island.ts`, `name: "xmluiIsland"`,
`formats: ["umd"]`, output `dist/island/`, same `INLINE_ALL` defines).

**Add** `xmlui/src/index-island.ts`:
```ts
import React from "react";
import jsxRuntime from "react/jsx-runtime";
import ReactDOM from "react-dom";
import { startIslands } from "./components-core/Islands/startIslands";
import StandaloneExtensionManager from "./components-core/StandaloneExtensionManager";
import * as xmluiExports from "./index";

const Xmlui = new StandaloneExtensionManager();
window.React = React;
(window as any).jsxRuntime = jsxRuntime;
window.ReactDOM = ReactDOM;

document.addEventListener("DOMContentLoaded", () => {
  startIslands({ extensionManager: Xmlui });
});

export default { ...xmluiExports, standalone: Xmlui, startIslands };
```

**Modify** `xmlui/package.json`: add
`"build:xmlui-island": "vite build --mode island"`, extend `exports` with
`./island`.

**Smoke**:
- **W-SSG**, **STD** (build the standalone UMD afterward to confirm the
  standalone arm of `vite.config.ts` was not perturbed by the new `island` arm).
- **ISL** (CDN mode verification): serve `temp-islands/` with the UMD script
  tag (no Vite dev server); both islands must render.

**Risk**: low. Build modes are independent; the main regression risk is
inadvertently touching the `standalone` or `lib` arms of the switch.

---

### Step 6 — Style/theme isolation hardening

Address issues surfaced in steps 2 and 4 that the smoke matrix flagged:

1. **Global CSS reset**: `StandaloneApp.tsx` does
   `import "../index.scss"` which lands in `document.head` and would affect
   the host. In `index-island.ts`, capture the framework CSS string at build
   time and inject it inside each shadow root (mirror the
   `NestedAppReact.tsx` mechanism — review and reuse, do not re-invent).
2. **`@font-face` and external assets**: declare in the host page or proxy
   into each island's shadow root.
3. **Portals (modal, tooltip, dropdown)**: `ThemeProvider` already creates a
   portal container inside the shadow root when `domRoot instanceof ShadowRoot`.
   Verify against a Modal-using island.

**Smoke**:
- **E** (full).
- **ISL** with an aggressive host CSS test:
  add `<style>* { color: red !important; box-shadow: 0 0 0 2px lime !important; }</style>`
  to the host head — islands must remain unaffected.
- **ISL** with a Modal-using island fixture — modal must portal inside
  the island's shadow root, not the host body.
- **DEMO-D**, **DEMO-A** — re-verify because they exercise NestedApp /
  shadow-root + animations, which share these code paths.

**Risk**: medium. Iterative; treat regressions as red gates.

---

### Step 7 — Tests, docs, changeset

- Unit tests under `xmlui/tests/components-core/Islands/`: marker discovery,
  basePath normalization, shadow-root mount lifecycle.
- Playwright specs under `xmlui/tests-e2e/islands/`:
  - Two-island isolation (state, theme, click events).
  - Host-CSS-leak protection.
  - Modal portal containment.
- AI doc: `.ai/xmlui/islands.md` summarizing the public API.
- Changeset: `.changeset/xmlui-islands.md` (`"xmlui": patch`).

**Smoke**: **E** (full), **W-SSG**.

---

### Step 8 — Unify standalone and islands outputs (LOW PRIORITY)

The `xmlui-standalone` and `xmlui-island` bundles are nearly identical: both
bundle everything, expose React globals, and auto-start on `DOMContentLoaded`.
The only difference is the entry point (`startApp` vs `startIslands`).

Explore whether a single UMD bundle can cover both use cases, with the mode
determined at runtime rather than at build time. Options:

- Export both `startApp` and `startIslands` from one bundle; the host page
  calls whichever it needs.
- Detect markers at startup: if `[data-xmlui-src]` elements are present,
  activate islands mode; otherwise fall back to `#root` single-app mode.
- Keep the bundles separate but extract a shared base bundle to avoid
  duplicating framework code.

This step is deliberately vague because the right approach depends on what
emerges from steps 1–8. Treat it as a design spike before committing to an
implementation.

**Risk**: medium. Unifying entry points touches CI build scripts and the
public bundle URL contract. Only proceed if the duplication is genuinely
costly.

---

## 4. Public API summary (target end state)

```ts
// import { startIslands } from "xmlui";
export type StartIslandsOptions = {
  selector?: string;                              // default "[data-xmlui-src]"
  extensionManager?: StandaloneExtensionManager;
  routerMode?: "memory" | "hash" | "browser";    // default "memory"
  decorateWithTestId?: boolean;
};

export type IslandsHandle = {
  islands: ReadonlyArray<{ host: HTMLElement; src: string; root: ReactDOM.Root }>;
  unmount: () => void;
};

export function startIslands(options?: StartIslandsOptions): IslandsHandle;
```

Bundle artifacts:

- `xmlui/dist/island/xmlui-island.umd.js` (new, via `build:xmlui-island` in CI)
- Existing `xmlui/dist/standalone/xmlui-standalone.umd.js` (unchanged)
- Existing `xmlui/dist/lib/*` (unchanged)

Host page usage (no build step required):

```html
<script src="https://cdn.example.com/xmlui-island.umd.js"></script>
<div data-xmlui-src="./bio"></div>
<div data-xmlui-src="./checkout-form"></div>
```

---

## 5. Sequencing & checkpoints

| Step | Deliverable | Smoke rows | Acceptance gate |
|------|-------------|------------|-----------------|
| 1 | `startIslands` stub | E, ISL | Banner + tagged markers |
| 2 | Per-marker shadow-root mount | E, ISL, DEMO-D | Placeholder visible, host CSS isolated |
| 3 | `basePath` plumbing | **Full matrix minus islands** | W-SSG verification snippet passes |
| 4 | Real island rendering (CSR) | E, ISL, W-SSG | Two apps run independently |
| 5 | `xmlui-island.umd.js` build | W-SSG, STD, ISL (CDN mode) | Script tag works, no Vite needed |
| 6 | Style/theme isolation hardening | E, ISL (aggressive CSS), DEMO-D, DEMO-A | All visual regression tests pass |
| 7 | Tests + docs + changeset | E (full), W-SSG | CI green; docs published |
| 8 | Unify standalone + islands (low priority) | STD, ISL | Design spike complete |

Land each step as its own PR (or commit) with a passing smoke gate. **Do not
proceed until W-SSG passes the verification snippet** — that is the historical
silent-failure mode.

---

## 6. Out-of-scope (explicitly deferred)

- Cross-island communication (pub/sub, shared store).
- Lazy / intersection-observer based island activation.
- Island-specific SSG pre-rendering: islands render purely client-side. The
  host server (Django, Rails, etc.) is responsible for its own HTML; XMLUI
  does not provide tooling to pre-render island content into that HTML.
- `xmlui island` CLI commands (`island build`, `island ssg`, `island start`):
  the island bundle is produced in CI only, exactly like `xmlui-standalone`.
  There is no user-facing `xmlui island` subcommand.
- SSR streaming.

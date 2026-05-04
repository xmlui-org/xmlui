# XMLUI Islands — Implementation Plan

> Goal: allow a host (non-XMLUI) web page to embed multiple, independent XMLUI
> apps by placing `<div data-xmlui-src="./folder">` markers in its HTML. Each
> island is fully isolated (state, styles, themes), supports SSG pre-rendering,
> and ideally also works without a build step (CDN script tag).

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
- Existing SSG pipeline: [xmlui/src/nodejs/bin/ssg.ts](xmlui/src/nodejs/bin/ssg.ts)
  — `renderPath()`, `applyRenderToShell()`, `getSsgEntrySource()`. Uses
  `react-dom/server`, `StaticRouter`, a temporary entry that calls
  `import.meta.glob('./src/**', { eager: true })`.
- Static preview server: [tools/preview-ssg](tools/preview-ssg).

The new code must touch these files non-invasively (additive APIs and a new
build mode); existing `startApp` callers must not change behavior.

---

## 1. Architectural overview

An *island* is a standalone XMLUI app instance mounted into an arbitrary host
DOM element. The contract:

- Host page contains zero or more `<div data-xmlui-src="<folder>"></div>`
  elements. The folder path is resolved relative to the host page URL.
- The framework provides a UMD bundle (`xmlui-island.umd.js`) that exposes a
  global function `startIslands(options?)`.
- For each marker div, the framework:
  1. Fetches `Main.xmlui` (and the usual standalone resources: `config.json`,
     `Main.xmlui.xs`, `Globals.xs`, `themes/*.json`, `components/*`,
     `resources/*`) **rooted at the marker's folder**, not the host site root.
  2. Attaches an open Shadow DOM to the marker div.
  3. Renders an isolated `<StandaloneApp>` inside the shadow root with its own
     `StyleRegistry` and `StyleInjectionTargetContext`.
  4. Optionally hydrates pre-rendered SSG markup that was written into the
     marker by the SSG step.
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
  documented in step 8.
- React's HMR + shadow root works in dev but the island bundle is UMD-only.
- Hash-based routing is undesirable for embedded apps; islands default to
  memory routing.

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
| **W-SSG** | Website SSG | `npm run -w website build-ssg && npm run -w website preview-ssg` | (1) Build completes without errors, (2) `dist-ssg/index.html` and `dist-ssg/docs/index.html` exist and contain pre-rendered XMLUI markup (NOT just an empty `<div id="root">`), (3) preview at `http://localhost:3000` shows content **before** JS hydration (disable JS in DevTools, reload), (4) re-enable JS, navigate around — no hydration warnings in console, search and links work |
| **STD** | Standalone UMD | `npm run -w xmlui build:xmlui-standalone`, coppy the resulting umd file into a standalone project (which shall be created) then open it with a web server | UMD bundle loads; classic standalone app boots |
| **ISL** | Islands UMD | `npm run -w xmlui build:xmlui-islands`, coppy the resulting umd file and source-map into the temp-islands folder, then open it with a web server | Both islands render in their own shadow roots; click events work; counters / state independent |

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

**Smoke**: `E`, `ISL-CSR` (just verifies the banner + tagged markers in DOM).

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

**Smoke**: `U`, `ISL`, plus a quick visual on **DEMO-D** (because
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
Justification: this is the first step that edits shared code paths; if any
fetch site is missed the SSG output silently regresses (the original failure
mode you described). W-SSG plus the verification snippet from §2 catches it.

Also, manually exercise `<StandaloneApp basePath="./bio" />` from a temporary
test page or a Vitest fixture to confirm the new code path works in isolation
before any island wiring.

Note that there's a window.__PUBLIC_PATH option, which could interfere with this feature. It should be independent of that.

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

**Smoke**: **E**, **ISL**, plus **W-SSG** again (because router-mode
plumbing edits `AppWrapper.tsx`, which the SSG path uses via `StaticRouter`).

**Verify in ISL**:
- Both islands render their real `Main.xmlui` content.
- A counter/state change in one island does not affect the other.
- Switching theme tone in one island does not affect the host or the other.
- Network panel: requests for `./bio/Main.xmlui`, `./bio/components/...`,
  `./checkout-form/Main.xmlui`, etc.

**Risk**: medium. Most likely failure mode: forgotten fetch site for theme
JSON or icon sprite — caught by the verification list above.

---

### Step 5 — SSG for islands (MVP) — **brought forward to deal with SSG risk early**

Rationale: SSG bugs are the most expensive to debug and historically slipped
past tests. Land an MVP SSG path now, while the island stack is still small
and the diff against the current SSG pipeline is minimal.

**Scope of MVP** (deliberately narrow):

- One CLI command: `xmlui island ssg <hostHtml> [--out dist-ssg]`.
- Reads the host HTML file, finds every `<div data-xmlui-src="./folder">`.
- For each folder, invokes the existing
  [getSsgEntrySource](xmlui/src/nodejs/bin/ssg.ts#L262) machinery on that
  folder's `src/`. Reuses `renderPath("/")` to obtain
  `{markup, ssrStyles, ssrHashes, htmlClasses, ...}`.
- Inserts the markup as the `innerHTML` of the marker div, wrapped in a
  `<template data-xmlui-island-prerender>` element so the runtime can later
  move it inside a shadow root (step 6).
- Emits the per-island SSR styles as
  `<template data-xmlui-island-styles="<folder>" data-ssr-hashes="...">`
  next to the marker.
- Copies the island's source folder verbatim into `dist-ssg/<folder>/` so
  runtime fetches still resolve.
- Drops Helmet output (titles/meta) for islands so the host page's `<head>`
  is not polluted.

**Implementation notes**:

- Refactor `getSsgEntrySource` to take a `srcDir` parameter (today it
  hard-codes `./src`). The existing single-app `xmlui ssg` keeps its current
  default; the new island flow passes the marker folder.
- Run the per-island SSR builds **serially** in one Node process to keep the
  diff small. Optimize later.
- Print which markers were processed and their pre-rendered byte length.
  Fail fast if any island produced `<200` bytes (the silent-regression
  signature).

**Smoke**:
- **U**, **W-SSG** (regression check on the existing SSG pipeline — the
  refactor of `getSsgEntrySource` could break it). Run the §2 verification
  snippet against `website/dist-ssg`.
- **ISL-SSG**:
  1. `cd temp-islands && xmlui island ssg index.html`
  2. Open `dist-ssg/index.html` in a text editor; both marker divs must
     contain a `<template data-xmlui-island-prerender>` block with real XMLUI
     markup. Run an inline check:
     ```bash
     grep -c "data-xmlui-island-prerender" temp-islands/dist-ssg/index.html
     # Expect 2 (one per island marker).
     ```
  3. `npx preview-ssg ./dist-ssg` and visit `http://localhost:3000`.
  4. With JS enabled, both islands hydrate and stay interactive (full
     "before-hydration paint" check is part of step 6).

**Risk**: high. Mitigations:
- Keep the existing `xmlui ssg` code path untouched aside from the `srcDir`
  refactor.
- New code lives in a new file (`xmlui/src/nodejs/bin/island-ssg.ts`) that
  imports and reuses helpers from `ssg.ts`.

---

### Step 6 — Hydration of SSG output inside Shadow DOM

Now make the SSG output actually paint before hydration.

**Plan**:

1. `IslandRoot` mount logic, in this order:
   - Read `<template data-xmlui-island-prerender>` and
     `<template data-xmlui-island-styles>` from the host marker (if present),
     pull their `.content`.
   - `attachShadow`, append the styles template content + the prerender
     template content as the shadow root's children.
   - Call `ReactDOM.hydrateRoot(shadowRoot.firstElementChild, <App ... />)`
     instead of `createRoot` when prerender markup was present.
2. Pass the SSR `StyleRegistry` cache (serialized from the SSR-emitted hashes)
   into the island's `StyleProvider` so client-side `useStyles` skips
   re-injecting.
3. If no prerender template exists, fall back to the step-4 `createRoot` path.

**Smoke**:
- **U**, **E** (full).
- **W-SSG** (regression — hydration code lives near shared helpers).
- **ISL-SSG** with a stricter check: with JS disabled, **island content is
  visible** (no FOUC); with JS enabled, console has no `Hydration failed`
  warnings; clicking a button in the prerendered island works.
- **DEMO-D**: smoke `NestedApp` again because the shadow-root + StyleProvider
  changes overlap with this code.

**Risk**: high. React hydration into shadow roots produces obscure mismatch
errors. Mitigations:
- Add a Playwright spec under `xmlui/tests-e2e/islands/` that asserts initial
  HTML contains island markup, and post-hydration the page is interactive
  with no console warnings (use `page.on('console')`).
- Provide a `STARTISLANDS_DEBUG=1` env flag that logs each step of the
  template-extraction and hydration path so future debugging is cheap.

---

### Step 7 — `xmlui-island` Vite build mode (UMD bundle)

Produce `dist/island/xmlui-island.umd.js` as the script the host page loads.

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
- **U**, **STD** (build the standalone UMD afterward to confirm the
  standalone arm of `vite.config.ts` was not perturbed).
- Manual island UMD test: replace `temp-islands/index.ts` with a
  `<script src=".../xmlui-island.umd.js">` tag and verify both islands
  render with no Vite dev server.

**Risk**: low. Build modes are independent.

---

### Step 8 — Style/theme isolation hardening

Address issues surfaced in steps 2/4/6 that the smoke matrix flagged:

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
- **U**, **E** (full).
- **ISL-CSR** with an aggressive host CSS test:
  add `<style>* { color: red !important; box-shadow: 0 0 0 2px lime !important; }</style>`
  to the host head — islands must remain unaffected.
- **ISL-CSR** with a Modal-using island fixture — modal must portal inside
  the island's shadow root, not the host body.
- **DEMO-D**, **DEMO-A** — re-verify because they exercise NestedApp /
  shadow-root + animations, which share these code paths.

**Risk**: medium. Iterative; treat regressions as red gates.

---

### Step 9 — `tools/preview-ssg` adjustments

Verify it serves `.xmlui` and `.xs` files with a sensible MIME (currently
neither is in `mimeTypes` in
[preview-ssg/src/index.js](tools/preview-ssg/src/index.js#L7)). Add
`"text/xml"` mappings if needed.

**Smoke**: **W-SSG** (existing user), **ISL-SSG** (new user).

**Risk**: trivial.

---

### Step 10 — `xmlui island` CLI surface

Wrap step 5's `island-ssg.ts` and add convenience:
- `xmlui island build` — for each marker folder, run the existing app build
  pipeline.
- `xmlui island ssg` — already added in step 5; finalize CLI args.
- `xmlui island start` — Vite dev server that serves the host HTML and
  injects the dev-mode `xmlui` entry.

**Smoke**: full matrix — these commands wrap existing `build`/`ssg` flows;
running W-SSG and STD again confirms no regression.

**Risk**: low.

---

### Step 11 — No-build (CDN) mode

Lowest priority. Once steps 1–8 are stable, the no-build mode is automatic:
the host page adds `<script src=".../xmlui-island.umd.js"></script>` and
markers work because all source loading is runtime fetch (matching today's
`xmlui-standalone` model).

**Smoke**: **ISL-CSR** with `temp-islands/index.html` stripped of
`index.ts`/Vite, served via `npx preview-ssg ./temp-islands`.

**Risk**: low.

---

### Step 12 — Tests, docs, changeset

- Unit tests under `xmlui/tests/components-core/Islands/`: marker discovery,
  basePath normalization, hydration template extraction.
- Playwright specs under `xmlui/tests-e2e/islands/`:
  - Two-island isolation (state, theme, click events).
  - Host-CSS-leak protection.
  - SSG hydration round-trip (no console warnings).
  - Modal portal containment.
- AI doc: `.ai/xmlui/islands.md` summarizing the public API.
- Changeset: `.changeset/xmlui-islands.md` (`"xmlui": patch`).

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

- `xmlui/dist/island/xmlui-island.umd.js` (new, via `build:xmlui-island`)
- Existing `xmlui/dist/standalone/xmlui-standalone.umd.js` (unchanged)
- Existing `xmlui/dist/lib/*` (unchanged)

CLI artifacts:

- `xmlui island build`, `xmlui island ssg`, `xmlui island start`.

---

## 5. Sequencing & checkpoints

| Step | Deliverable | Smoke rows | Acceptance gate |
|------|-------------|------------|-----------------|
| 1 | `startIslands` stub | U, ISL-CSR | Banner + tagged markers |
| 2 | Per-marker shadow-root mount | U, ISL-CSR, DEMO-D | Placeholder visible, host CSS isolated |
| 3 | `basePath` plumbing | **Full matrix minus islands** | W-SSG verification snippet passes |
| 4 | Real island rendering (CSR) | U, ISL-CSR, W-SSG | Two apps run independently |
| 5 | Islands SSG MVP | U, W-SSG, ISL-SSG | Pre-rendered markup present in `dist-ssg/index.html` |
| 6 | Shadow-root hydration | U, E (full), W-SSG, ISL-SSG, DEMO-D | No FOUC, no hydration warnings |
| 7 | `xmlui-island.umd.js` build | U, STD, manual UMD test | UMD script tag works without Vite |
| 8 | Style/theme isolation hardening | U, E, ISL-CSR (aggressive CSS), DEMO-D, DEMO-A | All visual regression tests pass |
| 9 | preview-ssg adjustments | W-SSG, ISL-SSG | `.xmlui` served correctly |
| 10 | `xmlui island` CLI | Full matrix | Single command builds + previews `temp-islands` |
| 11 | No-build mode | ISL-CSR (no Vite) | CDN script tag suffices |
| 12 | Tests + docs + changeset | U, E (full) | CI green; docs published |

Land each step as its own PR (or commit) with a passing smoke gate. **Do not
proceed until W-SSG passes the verification snippet** — that is the historical
silent-failure mode.

---

## 6. Out-of-scope (explicitly deferred)

- Cross-island communication (pub/sub, shared store).
- Lazy / intersection-observer based island activation.
- SSR streaming.
- Server-side data fetching during SSG (islands SSG renders only the static
  shell; data-bound components remain client-rendered after hydration, as in
  the current `xmlui ssg`).

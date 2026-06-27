# Website Migration Plan

Status: active  
Source baseline: `/Users/dotneteer/source/xmlui`  
Rewrite workspace: `/Users/dotneteer/source/xmlui-rs`  
Primary goal: display the migrated website as soon as possible, then tighten
package and website parity with focused tests.

## Scope

Migrate the old XMLUI website into this workspace as a visual regression
surface for the rewrite. The website should exercise real XMLUI behavior,
including docs pages, embedded playground snippets, navigation, themes,
extension packages, content loading, static assets, and production/SSG output.

This plan extends Phase 6 in `.plans/rebuild-plan.md`. For website readiness,
the first Phase 6 package targets are the extension packages imported by the
old website:

| Package | Old website role | Old tests found |
| --- | --- | --- |
| `xmlui-search` | Search UI and search data filtering | `src/Search.spec.ts` |
| `xmlui-website-blocks` | Landing blocks, hero, carousel, breakout, backdrop | `Backdrop`, `Breakout`, `Carousel`, `HeroSection` specs |
| `xmlui-docs-blocks` | Docs/blog layout blocks, docs rendering helpers, themes | `Share.spec.ts`, `DocsBlocks.spec.ts` |
| `xmlui-echart` | ECharts examples and chart docs | `src/EChart.spec.ts` |
| `xmlui-calendar` | Calendar extension examples | No old package E2E spec found |
| `xmlui-gauge` | Gauge extension examples | `src/Gauge.spec.ts` |
| `xmlui-grid-layout` | Grid layout examples | No old package E2E spec found |
| `xmlui-masonry` | Masonry examples | `src/Masonry.spec.ts` |
| `xmlui-tiptap-editor` | Rich text editor examples | `src/TiptapEditor.spec.ts` |

## Non-Goals

- Do not complete every first-party package before showing the website.
- Do not require perfect docs generation parity before the local website can
  render.
- Do not migrate package publishing automation beyond the artifact shape needed
  for local package builds and website consumption.
- Do not fetch live release data during early local display work. Use checked-in
  resources or deterministic fixtures first.

## Compatibility Sources

Inspect and cite these old-repo files before implementing each area:

- Website entry and app: `/Users/dotneteer/source/xmlui/website/index.ts`,
  `/Users/dotneteer/source/xmlui/website/src/Main.xmlui`,
  `/Users/dotneteer/source/xmlui/website/extensions.ts`.
- Website config/scripts/assets:
  `/Users/dotneteer/source/xmlui/website/package.json`,
  `/Users/dotneteer/source/xmlui/website/xmlui.config.json`,
  `/Users/dotneteer/source/xmlui/website/public`,
  `/Users/dotneteer/source/xmlui/website/content`,
  `/Users/dotneteer/source/xmlui/website/navSections`.
- Extension packages:
  `/Users/dotneteer/source/xmlui/packages/<package-name>`.
- Old package build contract:
  `xmlui build-lib`, `xmlui build-lib --mode=metadata`, `clean-package`
  publish export rewrites, `dist/<package>.mjs`, `dist/<package>.js`,
  `dist/<package>-metadata.*`, and package CSS exports.

## Assumptions

- The current workspace already has `website/` and `packages/*` workspace
  slots, plus the `xmlui-counter-badge` extension compatibility fixture.
- The quickest useful display path is to migrate package source and website
  content, then temporarily gate or stub only the heaviest optional extension
  pages when they block the shell.
- Website rendering itself is a compatibility test: regressions found while
  loading docs, snippets, themes, or extension demos should be converted into
  focused package or XMLUI E2E coverage.

## Fast Display Strategy

1. Restore the website shell first: entry files, config, themes, content,
   nav JSON, public resources, and extension registration list.
2. Migrate the extensions needed for initial routes in dependency order:
   `xmlui-docs-blocks`, `xmlui-website-blocks`, then `xmlui-search`.
3. Make `npm --workspace xmlui-website run start` render the home page and at
   least one docs page locally, even if chart/calendar/editor demos are
   temporarily hidden behind explicit TODO routes.
4. Add package-by-package extension parity after the shell is visible.
5. Re-enable all extension docs/demo routes and embedded snippets.

## Work Plan

### Step 1: Website and Package Inventory

Status: complete. Findings are recorded in
`.ai/website-migration-inventory.md`.

Create `.ai/website-migration-inventory.md`.

Record:

- all old website files and generated files;
- imported extension packages and their exported components/themes/functions;
- old package scripts, dependencies, and test files;
- website routes that use each extension;
- files that can be copied directly versus files that need compatibility
  shims or rewrite-side API work.

Verification:

- Inventory lists the nine website extension imports from old
  `website/extensions.ts`.
- Inventory identifies which extension packages have old E2E specs and which
  require new smoke specs.

### Step 2: Package Tooling Baseline for Website Extensions

Status: complete for the reusable baseline. Findings are recorded in
`.ai/website-package-tooling-baseline-findings.md`. Follow-up package-specific
tooling gaps should be handled during each package migration.

Extend the current package compatibility infrastructure so each website package
can at least install, typecheck, build an extension artifact, and build
metadata.

Tasks:

- generalize the `xmlui-counter-badge` build/metadata scripts or replace them
  with the emerging `xmlui build-lib` compatibility command;
- preserve the old package entry convention of `exports: "./src/index.tsx"`
  during local development;
- emit deterministic local artifacts under `dist/` and `dist-metadata/`;
- ensure package CSS is bundled or imported in a way compatible with the
  rewrite's CSS module policy.

Verification:

- `npm --workspace <package> run build`
- `npm --workspace <package> run build:metadata`
- `npm --workspace xmlui run check:metadata`

### Step 3: Migrate `xmlui-docs-blocks`

Status: display-ready package baseline complete. Findings are recorded in
`.ai/xmlui-docs-blocks-migration-findings.md`. Old package E2E activation is
deferred to the hardening pass so the website shell can be displayed sooner.

Reason for priority: docs blocks are needed by the docs pages and help turn the
website into a broad visual compatibility surface quickly.

Tasks:

- port package source, XMLUI user-defined components, theme, metadata, and
  docs utility exports; complete for the local package build path;
- activate old `Share.spec.ts` and `DocsBlocks.spec.ts`; pending;
- add one smoke test proving a docs block renders content and one state update
  path changes rendered output; pending;
- replace temporary React fallbacks for old public exports with full runtime
  behavior where website rendering exposes gaps; pending.

Verification:

- package build and metadata commands; passing;
- old package specs, with explicit skips only for documented blockers; pending;
- a website route using docs blocks renders; pending Step 6.

### Step 4: Migrate `xmlui-website-blocks`

Reason for priority: home/landing pages depend on the visual blocks.

Status: display-ready package baseline complete. Findings are recorded in
`.ai/xmlui-website-blocks-migration-findings.md`. Old package E2E activation is
deferred to the hardening pass so the first visible website milestone can move
forward.

Tasks:

- port `HeroSection`, `Backdrop`, `Breakout`, `Carousel`, `ScrollToTop`,
  `FancyButton`, assets, styles, and metadata; complete for the local package
  build path;
- activate old specs for `Backdrop`, `Breakout`, `Carousel`, and `HeroSection`;
  pending;
- add a Carousel interaction test if old coverage does not prove visible state
  changes after navigation; pending;
- replace temporary React fallbacks for `Part` and `Theme` with full runtime
  behavior where website rendering exposes gaps; pending.

Verification:

- package build and metadata commands; passing;
- old package specs; pending;
- home page renders without missing component diagnostics; pending Step 6.

### Step 5: Migrate `xmlui-search`

Reason for priority: search is a top-level website workflow and exercises
extension functions, filtering, keyboard interaction, and routing.

Status: display-ready package baseline complete. Findings are recorded in
`.ai/xmlui-search-migration-findings.md`. Old package E2E activation is
deferred to the hardening pass so the first visible website milestone can move
forward.

Tasks:

- port search components, metadata, Fuse dependency integration, styles, and
  exported search data types used by `website/utils/index.ts`; complete for
  the local package build path;
- activate old `Search.spec.ts`; pending;
- add a website-level smoke test that opens search, filters results, and
  navigates to a selected result; pending.

Verification:

- package build and metadata commands; passing;
- old Search E2E; pending;
- website search smoke E2E; pending Step 6.

### Step 6: First Visible Website Milestone

Status: focused display shell complete. The first visible website slice now
builds and runs locally with the three migrated priority packages:
`xmlui-docs-blocks`, `xmlui-website-blocks`, and `xmlui-search`.

Copy the old website into the current workspace enough to display:

- `index.ts`, `src/Main.xmlui`, `src/config.ts`, themes, `extensions.ts`;
- content needed for home and one docs page;
- `navSections/*.json`;
- public resources referenced by the visible routes;
- deterministic local versions of generated release/search/rss/sitemap inputs.

Tasks:

- update `website/package.json` dependencies for migrated packages; complete;
- avoid network-dependent generation in the local display path; complete via a
  focused `src/Main.xmlui` display shell and deterministic inline search/docs
  fixtures;
- add a focused website Playwright smoke test for home and one docs page;
  complete via `website/tests/e2e/website-migration.spec.ts`.

Verification:

- `npm --workspace xmlui-website run build`; passing with Sass deprecation
  warnings from the copied old `_themes.scss` helper;
- `npm --workspace xmlui-website run start`; displays the home page locally at
  `http://localhost:5173/`;
- home route has no unknown-component errors for migrated packages; verified in
  the in-app browser;
- one docs route renders content; verified at `http://localhost:5173/#/docs`;
- docs route state update path works; clicking `Update docs state` changes the
  rendered text from `Docs state updates: 0` to `Docs state updates: 1`;
- focused website E2E smoke passes with `npm --workspace xmlui-website run
  test:e2e`.

### Step 7: Migrate Visual/Demo Extension Packages

Migrate remaining website extensions one by one using
`.plans/extension-package-migration-template.md`:

1. `xmlui-masonry` - display-ready package baseline complete. Static Masonry
   children render in the focused website docs route. Old data
   `childrenAsTemplate` behavior is copied into tests but still pending
   runtime compatibility work.
2. `xmlui-gauge` - display-ready package baseline complete. Gauge renders in
   the focused website docs route, and the website smoke proves the old
   `id`/`setValue`/`value` API path updates rendered text.
3. `xmlui-echart` - display-ready package baseline complete. EChart renders in
   the focused website docs route with the SVG renderer, and the website smoke
   proves a bound state value updates visible chart-demo text.
4. `xmlui-calendar` - display-ready package baseline complete. BigCalendar
   renders in the focused website docs route with a month view, and the website
   smoke proves a bound state value updates visible event text.
5. `xmlui-grid-layout` - display-ready package baseline complete. GridLayout
   renders in the focused website docs route with real react-grid-layout DOM,
   and the website smoke proves a bound state value updates visible tile text.
6. `xmlui-tiptap-editor` - display-ready package baseline complete.
   TiptapEditor renders in the focused website docs route with toolbar disabled
   for a compact smoke, and the website smoke proves the old `id`/`setValue`/
   `value` API path updates both editor content and rendered text.

Package order may change if a website route exposes a more urgent blocker.
Prefer packages with old specs first unless a missing component blocks the
current visible page.

Verification for each package:

- package build and metadata commands;
- old E2E spec when present;
- at least one new smoke test when no old spec exists;
- website route or embedded docs snippet using the package renders.

Current automated extension package E2E verification:

- `npm run test:extensions:e2e`; passing with 9 tests;
- package smoke coverage exists for all migrated website extension packages:
  `xmlui-docs-blocks`, `xmlui-website-blocks`, `xmlui-search`,
  `xmlui-masonry`, `xmlui-gauge`, `xmlui-echart`, `xmlui-calendar`,
  `xmlui-grid-layout`, and `xmlui-tiptap-editor`;
- the extension E2E harness loads package extensions through `extensionIds`
  and supports old-style `mainXs` variable setup for copied package specs;
- old package specs are still a hardening task, especially `Share` default
  boolean behavior and XMLUI-defined docs block expansion in
  `xmlui-docs-blocks`.

Current `xmlui-masonry` verification:

- `npm --workspace xmlui-masonry run build`; passing;
- `npm --workspace xmlui-masonry run build:metadata`; passing;
- `npm --workspace xmlui-website run build`; passing with known Sass
  deprecation warnings;
- browser smoke at `http://localhost:5173/#/docs`; Masonry heading and static
  items `Alpha`, `Beta`, `Gamma`, and `Delta` render.

Current `xmlui-gauge` verification:

- `npm --workspace xmlui-gauge run build`; passing with known Sass deprecation
  warnings and Smart UI direct-eval bundler warning;
- `npm --workspace xmlui-gauge run build:metadata`; passing with known Sass
  deprecation warnings;
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`;
  passing;
- `npm --workspace xmlui-website run build`; passing with known Sass, Smart UI,
  and large chunk warnings;
- browser smoke at `http://localhost:5173/#/docs`; Gauge heading renders, one
  `smart-gauge` element mounts, `Gauge value: 42` appears initially, and
  clicking `Set gauge to 72` changes the rendered text to `Gauge value: 72`.

Current `xmlui-echart` verification:

- `npm --workspace xmlui-echart run build`; passing with known Sass deprecation
  warnings and a large charting bundle;
- `npm --workspace xmlui-echart run build:metadata`; passing with known Sass
  deprecation warnings;
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`;
  passing;
- `npm --workspace xmlui-website run build`; passing with known Sass, Smart UI,
  and large chunk warnings;
- browser smoke at `http://localhost:5173/#/docs`; EChart heading renders, SVG
  chart elements mount, `Chart boost: 0` appears initially, clicking
  `Boost chart data` changes the rendered text to `Chart boost: 5`, and the
  browser console has no errors.

Current `xmlui-calendar` verification:

- `npm --workspace xmlui-calendar run build`; passing with known Sass
  deprecation warnings;
- `npm --workspace xmlui-calendar run build:metadata`; passing with known Sass
  deprecation warnings;
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`;
  passing;
- `npm --workspace xmlui-website run build`; passing with known Sass, Smart UI,
  and large chunk warnings;
- browser smoke at `http://localhost:5173/#/docs`; Calendar heading renders,
  one `.rbc-calendar` container and one `.rbc-month-view` mount, the events
  `Migration Standup` and `Visual Check 0` render, clicking
  `Advance calendar smoke` changes visible text to `Calendar shift: 1` and
  `Visual Check 1`, and the browser console has no errors.

Current `xmlui-grid-layout` verification:

- `npm --workspace xmlui-grid-layout run build`; passing;
- `npm --workspace xmlui-grid-layout run build:metadata`; passing;
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`;
  passing;
- `npm --workspace xmlui-website run build`; passing with known Sass, Smart UI,
  and large chunk warnings;
- browser smoke at `http://localhost:5173/#/docs`; GridLayout heading renders,
  one `.react-grid-layout` and three `.react-grid-item` elements mount,
  `Layout tile: 0` and `Grid shift: 0` render initially, clicking
  `Advance grid layout smoke` changes visible text to `Layout tile: 1` and
  `Grid shift: 1`, and the browser console has no errors.

Current `xmlui-tiptap-editor` verification:

- `npm --workspace xmlui-tiptap-editor run build`; passing;
- `npm --workspace xmlui-tiptap-editor run build:metadata`; passing;
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`;
  passing;
- `npm --workspace xmlui-website run build`; passing with known Sass, Smart UI,
  and large chunk warnings;
- browser smoke at `http://localhost:5173/#/docs`; TiptapEditor heading
  renders, one `.ProseMirror` editor mounts, `Initial rich text` and
  `Editor value: Initial rich text` render initially, clicking
  `Update editor content` changes visible text to `Updated rich text` and
  `Editor value: Updated rich text`, and the browser console has no errors.

### Step 8: Full Website Content and Asset Parity

Status: in progress. Blog overview, individual blog post display, and one
copied docs markdown page are restored from copied website content/config.
Findings are recorded in `.ai/website-blog-route-findings.md` and
`.ai/website-docs-route-findings.md`.

Tasks:

- copy all docs/blog/home content and public resources;
- restore RSS, sitemap, redirects, static web app config, and generated docs
  reference inputs as deterministic local scripts;
- verify `xmlui-pg` snippets in markdown either render or have explicit tracked
  blockers;
- ensure `website/navSections/components.json` and
  `website/navSections/extensions.json` match generated metadata expectations.

Verification:

- website build passes;
- website smoke covers home, docs overview, component reference, extension
  reference, blog overview, and one blog post;
- metadata/docs-reference build passes.

Current blog route verification:

- `npm --workspace xmlui-docs-blocks run build`; passing with known Sass
  deprecation warnings;
- `npm --workspace xmlui-website run build`; passing with known Sass, Smart UI
  direct-eval, and large chunk warnings;
- `npm --workspace xmlui-website run start`; running at
  `http://localhost:5173/`;
- browser smoke at `http://localhost:5173/blog`; overview renders `Blog` and
  a migrated `Introducing XMLUI` post link;
- browser smoke at `http://localhost:5173/blog/introducing-xmlui`; post renders
  title `Introducing XMLUI`, copied markdown body text, and sections including
  `Components` and `Reactivity`;
- browser smoke reports no console errors for the blog overview/post pass.

Current docs markdown route verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`;
  passing;
- `npm --workspace xmlui-website run build`; passing with known Sass, Smart UI
  direct-eval, and large chunk warnings;
- `npm --workspace xmlui-website run start`; running at
  `http://localhost:5173/`;
- browser smoke at `http://localhost:5173/docs/intro`; copied
  `content/docs/pages/intro.md` renders title `Introduction`, intro text
  including `building user interfaces declaratively`, the example app text,
  and the `Markup` section;
- browser smoke reports no console or page errors for the docs intro route.

Current automated website E2E verification:

- `npm --workspace xmlui-website run test:e2e`; passing with 4 tests;
- tests cover the home shell, docs extension smoke route, copied docs markdown
  route, blog overview, and copied blog post route;
- the docs extension smoke test verifies user-visible state updates for Gauge,
  EChart, Calendar, GridLayout, TiptapEditor, and the docs route counter.

Current docs markdown follow-ups:

- route uses a direct `Markdown` rendering bridge so the page is visible now;
  restoring the old `DocumentPage` user-defined component path is still
  pending, because `<DocumentPage>` currently reports `Unknown XMLUI component:
  DocumentPage`;
- the route uses the runtime `$appGlobals` context alias to access copied
  docs content; old-style bare `appGlobals` expression parity still needs a
  focused compatibility check;
- `TableOfContents` mounts without browser errors, but the quick route smoke
  did not prove markdown heading extraction yet;
- old responsive prop syntax such as `when-lg` was omitted from this route
  after current parser/prop validation rejected it.

### Step 9: Production and SSG Parity

Tasks:

- restore old `build`, `build-ssg`, and `preview-ssg` behavior in workspace
  terms;
- preserve old static asset layout and config file names where public;
- compare generated route output and asset references against the old website.

Verification:

- `npm --workspace xmlui-website run build`
- `npm --workspace xmlui-website run build-ssg`
- `npm --workspace xmlui-website run preview-ssg`
- focused browser checks against production and SSG output.

### Step 10: Regression Harness Closure

Tasks:

- add root scripts for website/package verification if missing;
- document the website smoke commands in `.ai/verification-command-matrix.md`;
- keep remaining package or website gaps in `.ai/compatibility-debt.md` with
  source links and user-visible impact.

Verification:

- package verification for all nine website extensions passes or has explicit
  documented blockers;
- website dev/build/SSG smoke passes;
- full XMLUI E2E still passes after website/package integration.

## Risks

- Some old extension packages depend on public XMLUI React helpers that are not
  fully implemented in the rewrite.
- Heavy third-party packages may require dependency installation or bundler
  compatibility work.
- Docs markdown and `xmlui-pg` snippets may reveal missing runtime/parser
  behavior not currently covered by component E2E.
- Release/download scripts use network APIs; local migration should keep these
  deterministic until live publish behavior is explicitly restored.

## Completion Criteria

- The migrated website displays locally from this workspace.
- Home, docs, extension reference, and blog routes render with migrated content.
- All nine website extension packages build and contribute metadata, or each
  remaining blocker is documented with a visible-route workaround.
- Existing old package E2E tests are migrated or explicitly skipped with a
  current compatibility reason.
- New smoke tests cover package state updates where old tests are absent or
  display-only.

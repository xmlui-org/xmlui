# Website Migration Plan

Status: active  
Source baseline: `/Users/dotneteer/source/xmlui`  
Rewrite workspace: `/Users/dotneteer/source/xmlui-rs`  
Primary goal: display the migrated website as soon as possible, then tighten
package and website parity with focused tests.

Update: the display-first milestone proved the website plumbing, but it is not
the final visual compatibility target. Continue website visual parity work from
`.plans/website-original-structure-reuse-plan.md`, which treats the old
website's own XMLUI markup, component tree, themes, content, and assets as the
source to copy and run with only compatibility shims.

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

Status: complete for the display-first website milestone. Blog overview,
individual blog post display, copied docs markdown pages with old-style docs
route aliases, display-first tutorial/learn/reference/resources/icons/palettes
pages, copied home content, copied-content header search, focused
component/extension reference routes, and public website artifacts are restored
from copied website content/config. All 23 display-first Step 8 slices
identified after the core docs cluster are complete. Remaining old
`DocumentPage` and live embedded playground parity gaps are explicitly tracked
as compatibility debt rather than Step 8 display blockers. Findings are
recorded in
`.ai/website-blog-route-findings.md`, `.ai/website-docs-route-findings.md`,
`.ai/website-reference-route-findings.md`, and
`.ai/website-search-and-docs-content-findings.md`.

Tasks:

- copy all docs/blog/home content and public resources; complete for the
  display-first website slice;
- restore RSS, sitemap, redirects, static web app config, and generated docs
  reference inputs as deterministic local assets; complete for display-first
  serving and E2E checks, with production/SSG generation parity continuing in
  Step 9;
- verify `xmlui-pg` snippets in markdown either render or have explicit tracked
  blockers; complete for Step 8 by rendering copied pages through a static-code
  markdown variant and tracking live playground parity as `COMP-0032`;
- ensure `website/navSections/components.json` and
  `website/navSections/extensions.json` match generated metadata expectations;
  complete for copied navigation display, with generated metadata parity
  continuing in Step 9/10 hardening.

Verification:

- website build passes;
- website smoke covers home, docs overview, component reference, extension
  reference, blog overview, and one blog post;
- copied public artifacts are served by the website dev server;
- metadata/docs-reference build parity is tracked for Step 9/10 hardening.

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
- browser smoke at `http://localhost:5173/docs/app-structure`; copied
  `content/docs/pages/app-structure.md` renders title
  `Structure of an XMLUI app`, body text including
  `The XMLUI Invoice demo app`, and section headings including `Main.xmlui`
  and `Local deployment`;
- old-style docs route aliases now render copied content for
  `/docs/reactive-intro`, `/docs/components-intro`, `/docs/guides`,
  `/docs/guides/app-structure`, `/docs/guides/markup`,
  `/docs/guides/scripting`, `/docs/guides/scoping`,
  `/docs/guides/visibility`, `/docs/guides/layout`,
  `/docs/guides/working-with-text`, `/docs/guides/working-with-markdown`,
  `/docs/guides/routing-and-links`, `/docs/guides/forms`, and
  `/docs/guides/modal-dialogs`;
- the next old-route cluster now renders copied content for
  `/docs/guides/user-defined-components`, `/docs/guides/refactoring`,
  `/docs/styles-and-themes/layout-props`,
  `/docs/styles-and-themes/theme-variables`,
  `/docs/styles-and-themes/theme-variable-defaults`, and
  `/docs/styles-and-themes/common-units`;
- the markdown-backed core docs cluster now renders copied content for
  `/docs/context-variables`, `/docs/context-variables2`, `/docs/behaviors`,
  `/docs/globals`, `/docs/app-globals`, `/docs/xmlui-config`,
  `/docs/helper-tags`, `/docs/core-properties`, `/docs/template-properties`,
  and `/docs/glossary`;
- tutorial and learn routes now render through display-first pages and copied
  markdown for `/docs/learn`, `/docs/themes-intro`, `/docs/tutorial`, and
  `/docs/tutorial-01` through `/docs/tutorial-12`;
- reference/resource/custom visual entry routes now render display-first pages
  for `/docs/reference`, `/docs/reference/themes`, `/docs/resources`,
  `/docs/icons`, and `/docs/palettes`; full old custom component behavior for
  icons/palettes remains in the later interactive docs parity slice;
- `/docs/guides/playground-and-codefence` renders copied markdown through the
  static-code content bridge;
- the wrap-component guide cluster now renders copied markdown for
  `/docs/guides/wrap-component`,
  `/docs/guides/wrap-component/wrap-component-fn`,
  `/docs/guides/wrap-component/wrap-compound-fn`,
  `/docs/guides/wrap-component/prop-forwarding`,
  `/docs/guides/wrap-component/free-tracing`,
  `/docs/guides/wrap-component/file-objects`,
  `/docs/guides/wrap-component/bigcalendar`,
  `/docs/guides/wrap-component/gauge-theme`,
  `/docs/guides/wrap-component/calendar-theme`,
  `/docs/guides/wrap-component/masonry`,
  `/docs/guides/wrap-component/echarts`,
  `/docs/guides/wrap-component/tiptap`, and
  `/docs/guides/wrap-component/extension-packaging`;
- the first how-to basics cluster now renders `/docs/howto` and copied
  markdown routes for component methods, reactive edit buffering, table value
  transformation, API response transformation, list grouping, chained
  DataSource readiness, and safe `when` usage;
- the next five how-to slices now render through the display-first
  `/docs/howto` overview and dynamic `/docs/howto/:slug` markdown route,
  covering forms/modal basics, layout/i18n/accessibility, runtime state and
  async workflows, advanced forms, and API operation recipes;
- five additional how-to slices now render through the same overview and
  dynamic markdown route, covering tables/lists/trees, routing/layout UI,
  dialogs/themes/user components, lifecycle/errors/menus/content, and theming
  recipes;
- the final how-to display group now covers advanced components, charts, and
  media routes through the same dynamic `/docs/howto/:slug` markdown route;
- hosted deployment, MCP, VS Code, news/reviews, and full theme-definition
  docs pages now render from copied markdown;
- the managed-react docs cluster now renders `/docs/managed-react` and dynamic
  `/docs/managed-react/:slug` pages from copied markdown;
- component reference pages now have a generic
  `/docs/reference/components/:componentName` markdown route for copied
  `content/docs/reference/components/*` pages, while the Button route remains
  as an interactive smoke;
- extension reference pages now have a generic
  `/docs/reference/extensions/:packageName/:entryName` markdown route for
  copied `content/docs/reference/extensions/*` pages, while the Gauge route
  remains as an interactive smoke;
- the dynamic how-to route reads copied files from
  `content/docs/pages/howto/*.md` via `docsContentStaticCode`, preserving
  visibility for copied how-to pages while old generated navigation parity is
  restored in a later slice;
- the scripting, scoping, visibility, layout, working-with-text,
  working-with-markdown, routing-and-links, forms, modal-dialogs,
  user-defined-components, refactoring, styles/themes, and core docs routes
  render copied markdown through `docsContentStaticCode`, which converts
  `xmlui-pg` fences to static `xmlui` fences so the pages remain visible while
  embedded playground parity is restored;
- `docsContentStaticCode` also rewrites old bare `appGlobals.` references to
  `$appGlobals.` for copied markdown display; this is a temporary bridge until
  old app-global expression parity is handled directly;
- browser smoke reports no console or page errors for the docs intro route.

Current copied search verification:

- the header `Search` uses copied `staticSearchData` from `website/utils`;
- the website route uses Search overlay mode for this slice, avoiding the
  current inline Popover loop/noise while keeping the top-level search workflow
  visible;
- website E2E opens the header search, searches for `XMLUI`, and verifies a
  copied blog result, `Introducing XMLUI`, appears.

Current home and public artifact verification:

- the home route renders the copied home markdown cards from
  `content/home/why-simple.md` and `content/home/why-reactive.md`;
- `/get-started` renders copied `content/home/get-started.md` through the same
  static markdown bridge used for docs visibility;
- homepage markdown is normalized through the static-code bridge so copied
  `xmlui-pg` fences remain visible as static `xmlui` code blocks while live
  embedded playground parity is tracked in `COMP-0032`;
- website E2E fetches copied public artifacts from the dev server:
  `/feed.rss`, `/sitemap.xml`, `/_redirects`,
  `/staticwebapp.config.json`, and `/resources/logo.svg`.

Current automated website E2E verification:

- `env XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui-website run test:e2e`;
  passing with 15 tests; the website Playwright harness now runs with one
  worker because it is a visual route regression harness over one Vite dev
  server and copied markdown route compilation was not reliable under fully
  parallel execution;
- focused home/public artifact check
  `env XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui-website exec -- playwright test tests/e2e/website-migration.spec.ts --grep "home content and public website artifacts"`;
  passing;
- focused next-five content parity route check
  `env XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui-website exec -- playwright test tests/e2e/website-migration.spec.ts --grep "next five content parity"`;
  passing;
- focused second-five how-to route check
  `env XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui-website exec -- playwright test tests/e2e/website-migration.spec.ts --grep "second five how-to"`;
  passing;
- focused next-five how-to route check
  `env XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui-website exec -- playwright test tests/e2e/website-migration.spec.ts --grep "next five how-to"`;
  passing;
- focused how-to route check
  `env XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui-website exec -- playwright test tests/e2e/website-migration.spec.ts --grep "first how-to basics"`;
  passing;
- focused guide-route check
  `env XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui-website exec -- playwright test tests/e2e/website-migration.spec.ts --grep "copied docs markdown"`;
  passing for the copied intro, app-structure, guide, and styles/themes route
  cluster;
- focused core-docs route check
  `env XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui-website exec -- playwright test tests/e2e/website-migration.spec.ts --grep "copied core docs"`;
  passing;
- TableOfContents shared component check
  `npx playwright test src/components/TableOfContents/TableOfContents.spec.ts --grep "renders table of contents links with headings"`;
  passing after making TOC render keys unique for duplicate markdown ids;
- tests cover the home shell, docs extension smoke route, copied docs markdown
  routes, tutorial/learn/theme entry routes, reference/resources/icons/palettes
  display routes, playground/codefence and wrap-component routes, first how-to
  basics routes, eleven additional how-to route slices, misc docs,
  managed-react routes, copied-content header search, component reference
  index/detail/dynamic routes, extension reference index/detail/dynamic routes,
  blog overview, copied blog post routes, copied home content, `/get-started`,
  and public website artifacts;
- the docs extension smoke test verifies user-visible state updates for Gauge,
  EChart, Calendar, GridLayout, TiptapEditor, and the docs route counter.

Current reference route verification:

- component reference index renders copied `website/navSections/components.json`
  entries, including `Button` and `Text`;
- component detail route `/docs/reference/components/Button` renders and
  proves a visible `Button`-driven counter update;
- dynamic component reference routes render copied markdown, verified with
  `/docs/reference/components/Table` and
  `/docs/reference/components/ModalDialog`;
- extension reference index renders copied `website/navSections/extensions.json`
  entries, including `Xmlui Gauge` and `Xmlui Website Blocks`;
- extension detail route `/docs/reference/extensions/xmlui-gauge/Gauge`
  renders the migrated Gauge extension and proves the old `id`/`setValue`/
  `value` API path updates rendered text.
- dynamic extension reference routes render copied markdown, verified with
  `/docs/reference/extensions/xmlui-website-blocks/HeroSection` and
  `/docs/reference/extensions/xmlui-echart/EChart`;

Current docs markdown follow-ups:

- route uses a direct `Markdown` rendering bridge so the page is visible now;
  restoring the old `DocumentPage` user-defined component path is still
  pending, because `<DocumentPage>` currently reports `Unknown XMLUI component:
  DocumentPage`;
- the route uses the runtime `$appGlobals` context alias to access copied
  docs content, and static markdown currently rewrites old-style bare
  `appGlobals.` references; old-style bare `appGlobals` expression parity still
  needs a focused compatibility check;
- `TableOfContents` mounts without browser errors, but the quick route smoke
  only proves selected copied markdown headings; broader heading extraction and
  duplicate-id behavior still need a dedicated parity pass;
- old responsive prop syntax such as `when-lg` was omitted from this route
  after current parser/prop validation rejected it.

### Step 9: Production and SSG Parity

Status: complete. Slices 1-5 restored website-level production/SSG script
names, made the core SSG SSR build path use the same extension metadata and
source filtering as the normal website build, made generated route output
enforceable, added preview-serving smoke coverage, and recorded the old-vs-new
output-shape comparison. `build-ssg` now renders the migrated route set,
prepares the SSG Static Web Apps config under the public
`staticwebapp.config.json` name, and runs a website verifier that fails when
representative route HTML or copied assets are missing.

Planned slices:

1. Restore website package scripts for production/SSG commands in workspace
   terms; complete.
2. Verify production build output keeps copied public artifacts and hosting
   config files; complete.
3. Add/verify website SSG output for the migrated route set, including failing
   the build or test when discovered routes produce no rendered HTML; complete.
4. Add/verify `preview-ssg` smoke checks for clean URLs, fallback navigation,
   copied assets, and resource 404 behavior; complete.
5. Compare key generated output shape against the old website and record
   remaining parity debt; complete.

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

Current Step 9 verification:

- old website command source:
  `/Users/dotneteer/source/xmlui/website/package.json`;
- website `build` script now uses `xmlui build --buildMode=INLINE_ALL
  --withMock` followed by `website/scripts/verify-production-output.mjs`,
  matching the old display website build mode without live network-backed
  generation scripts and making copied asset/config retention enforceable;
- website `verify:production-output` checks `dist/index.html`,
  `dist/mockServiceWorker.js`, copied RSS/sitemap files, copied
  `staticwebapp.config.json` and `ssg-staticwebapp.config.json`, copied logo,
  favicon, LLMs text, release/template data, and copied parser resources;
- the production verifier compares copied public files byte-for-byte against
  `website/public`, and validates the key hosting semantics:
  `navigationFallback.rewrite === "/index.html"`,
  `.rss` MIME type, and SSG `404` rewrite to `/200.html`;
- website `build-ssg` script now runs `xmlui ssg`,
  `website/scripts/prepare-ssg-output.mjs`, and
  `website/scripts/verify-ssg-output.mjs`;
- website `verify:ssg-output` checks required SSG files, the 404 fallback,
  prepared Static Web Apps config equality, copied RSS/sitemap/logo content,
  at least 250 generated route `index.html` files, and representative route
  HTML/content markers for home, get-started, docs, reference, extension, and
  blog pages;
- website `preview-ssg` script now serves `dist-ssg` through the local
  `xmlui/scripts/preview-ssg.mjs` compatibility server;
- website `verify:preview-ssg` starts that preview server on a test port and
  verifies clean URLs (`/`, `/docs/intro`,
  `/docs/reference/components/Table`), fallback navigation for an unknown
  document route, copied RSS/sitemap/logo assets with expected MIME types, and
  404 behavior for missing static resources including `.css` and `.rss`;
- `xmlui/scripts/preview-ssg.mjs` now treats copied static extensions used by
  the old website, including `.rss`, `.md`, font, media, and archive files, as
  resources instead of falling back to HTML for missing files;
- `xmlui/src/cli/ssg.ts` now reuses the normal build extension metadata loader
  and raw source plugins for the SSR bundle, so website extension components
  such as `Search` compile during SSG;
- `xmlui/src/ssg/ssgEntry.ts` now limits runtime globbing to `src/**`, so
  copied docs sample `.xmlui` files remain content instead of accidental SSR
  module inputs;
- `xmlui/src/ssg/ssgEntry.ts` passes `appGlobals.isSsg === true` during SSG
  renders. The focused `/docs` browser-only extension smoke block is hidden
  only for SSG, while the normal website dev route and its Playwright test
  continue to exercise the migrated Masonry, Gauge, EChart, Calendar,
  GridLayout, and TiptapEditor packages;
- `npm --workspace xmlui-website run build-ssg`; passing with known Sass,
  Smart UI direct-eval, chunk-size, and plugin-timing warnings; the command
  discovers 259 routes, writes 260 `index.html` files plus `200.html`,
  prepares the SSG hosting config, and passes SSG output verification.
- `npm --workspace xmlui-website run verify:ssg-output`; passing;
- `npm --workspace xmlui-website run verify:preview-ssg`; passing with local
  server sandbox escalation;
- `env XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui-website exec --
  playwright test tests/e2e/website-migration.spec.ts --grep "docs smoke
  route"`; passing after rerun with local-server sandbox escalation;
- `npm --workspace xmlui-website run verify:production-output`; passing;
- `npm --workspace xmlui-website run build`; passing with known Sass, Smart UI
  direct-eval, chunk-size, and plugin-timing warnings, followed by passing
  production output verification.

Step 9 old-vs-new output shape comparison:

- old website `build` and `build-ssg` first regenerated releases, latest XMLUI
  download, RSS, and sitemap from scripts before invoking `xmlui`; the migrated
  workspace uses deterministic copied resources for this display milestone and
  verifies those files are retained in output;
- old website `build-ssg` moved
  `dist-ssg/ssg-staticwebapp.config.json` to
  `dist-ssg/staticwebapp.config.json`; the migrated workspace copies it instead
  so both names remain available for verification while preserving the public
  SSG hosting config name;
- old website `preview-ssg` used `npx preview-ssg ./dist-ssg`; the migrated
  workspace uses the local compatibility server in `xmlui/scripts`, with
  explicit smoke coverage for clean URLs, fallback HTML, copied assets, and
  missing-resource 404 behavior;
- production hosting semantics match the old public config shape for
  `navigationFallback.rewrite === "/index.html"` and `.rss` MIME type; SSG
  hosting semantics match the old `trailingSlash: "never"` and
  `responseOverrides.404.rewrite === "/200.html"` shape;
- remaining parity debt: live network-backed generation scripts, full old
  `DocumentPage`/embedded playground behavior, and generated metadata
  reference parity remain later hardening work rather than Step 9 blockers.

### Step 10: Regression Harness Closure

Status: complete. Root-level aggregate scripts now cover website extension
build/metadata/E2E checks and website build/SSG/preview/E2E checks. The command
matrix and compatibility debt notes record the current verification surface and
remaining hardening gaps.

Tasks:

- add root scripts for website/package verification if missing; complete via
  `build:website-extensions`, `build:website-extensions:metadata`,
  `verify:website-extensions`, `build-extensions`, and `verify:website`;
- document the website smoke commands in `.ai/verification-command-matrix.md`;
  complete;
- keep remaining package or website gaps in `.ai/compatibility-debt.md` with
  source links and user-visible impact; complete for the current Search inline
  popover noise and Step 9/10 package/website gaps.

Verification:

- package verification for all nine website extensions passes or has explicit
  documented blockers;
- website dev/build/SSG smoke passes;
- full XMLUI E2E still passes after website/package integration.

Current Step 10 verification:

- `npm run build:website-extensions`; passing with known Sass deprecation
  warnings and Smart UI direct-eval warnings in `xmlui-gauge`;
- `npm run build:website-extensions:metadata`; passing with known Sass
  deprecation warnings;
- `npm run test:extensions:e2e`; passing with 9 tests. The inline
  `xmlui-search` popover path still emits console/runtime noise; this is
  tracked as `COMP-0033`, and the visible website header uses overlay mode;
- `npm run test:website:e2e`; passing with 15 tests;
- `npm run test:core:e2e`; passing with 4576 tests and 496 skipped;
- Step 9 already verified `npm --workspace xmlui-website run build`,
  `npm --workspace xmlui-website run build-ssg`,
  `npm --workspace xmlui-website run verify:ssg-output`,
  `npm --workspace xmlui-website run verify:preview-ssg`, and
  `npm --workspace xmlui-website run verify:production-output`.

Aggregate script note:

- `npm run verify:website-extensions` is the root aggregate for website
  extension build, metadata, and package E2E verification;
- `npm run verify:website` is the root aggregate for website production build,
  SSG build, preview-SSG smoke, and website E2E verification;
- the component commands behind both aggregate scripts were verified during
  Steps 9 and 10. The aggregate wrappers are intentionally thin npm-script
  orchestration over those same commands.

### Step 11: Extension Package Old-Spec Hardening

Status: complete. The display-first package smoke suite is green, copied old
package specs are active where source suites exist, and new package-adjacent
E2E specs cover the old website extensions that had no package suite in the
reference repo.

Planned slices:

1. Activate the copied old `xmlui-search` spec in the extension Playwright
   harness and record pass/fail/noise details; complete. The package-adjacent
   spec is part of `playwright.extensions.config.ts`, inline Search no longer
   uses the Radix Popover path that produced update-depth/Floating UI noise,
   `TextBox` forwards the ARIA attributes required by the old Search spec, and
   `packages/xmlui-search/src/Search.spec.ts` passes with 28 tests.
2. Activate copied `xmlui-website-blocks` specs for `Backdrop`, `Breakout`,
   `Carousel`, and `HeroSection`, with focused compatibility notes for any
   blocked old behavior; complete. Backdrop `overlayTemplate` uses old
   `<property name="...">` template children through the extension authoring
   compatibility adapter, old `testId` props map to `data-testid`, absent
   boolean props no longer override package defaults, and Carousel consumes the
   old `width`, `height`, and `registerApi` props. Two Carousel custom-icon
   tests remain explicitly skipped as `COMP-0034` until old icon resource
   mapping is restored.
3. Activate copied `xmlui-docs-blocks` specs for `Share` and `DocsBlocks`,
   documenting the known default boolean and XMLUI-defined docs block gaps;
   complete. `Share`, `Breadcrumbs` default-item behavior, and `ReadingTime`
   old specs are active. Eight XMLUI-defined docs wrapper/navigation tests are
   explicitly skipped as `COMP-0035` until `createUserDefinedComponentRenderer`
   compiles and renders `.xmlui` extension components and route hierarchy
   parity is restored.
4. Copy and adapt old specs for remaining website extensions that have old
   package suites but are not yet present in the rewrite workspace:
   `xmlui-gauge`, `xmlui-echart`, `xmlui-masonry`, and `xmlui-tiptap-editor`;
   complete. Gauge, EChart, and Tiptap old specs pass. Masonry static rendering
   passes, with three old data item-template context tests explicitly skipped
   as `COMP-0036`.
5. Add new package-level E2E specs for old website extensions with no old
   package spec found: `xmlui-calendar` and `xmlui-grid-layout`; complete.
   Calendar now covers DOM attachment, month event rendering, custom sizing,
   and state-driven rerendering. GridLayout now covers DOM attachment, static
   layout children, row height/gap props, and state-driven rerendering. One
   GridLayout data item-template case is explicitly skipped as `COMP-0036`
   until extension children-as-template context parity is restored.
6. Promote passing old/new package specs into the aggregate
   `npm run test:extensions:e2e` command, keeping explicit skips tied to
   compatibility-debt rows; complete.
7. Run `npm run verify:website-extensions` and `npm run test:website:e2e`
   after the activated package specs to ensure the website-facing display
   surface remains green; complete.

Verification:

- package-adjacent old specs run under `playwright.extensions.config.ts`;
- each activated package spec either passes or has explicit skips with source
  anchors and compatibility debt references;
- aggregate extension and website E2E remain green after every slice.

Current Step 11 verification:

- `npx playwright test -c playwright.extensions.config.ts
  packages/xmlui-search/src/Search.spec.ts`; passing with 28 tests;
- `npx playwright test -c playwright.extensions.config.ts
  packages/xmlui-website-blocks/src/Backdrop/Backdrop.spec.ts
  packages/xmlui-website-blocks/src/Breakout/Breakout.spec.ts
  packages/xmlui-website-blocks/src/Carousel/Carousel.spec.ts
  packages/xmlui-website-blocks/src/HeroSection/HeroSection.spec.ts`; passing
  with 55 tests and 2 explicit `COMP-0034` skips;
- `npx playwright test -c playwright.extensions.config.ts
  packages/xmlui-docs-blocks/src/blog/Share.spec.ts
  packages/xmlui-docs-blocks/src/docs/DocsBlocks.spec.ts`; passing with 56
  tests and 8 explicit `COMP-0035` skips;
- `npx playwright test -c playwright.extensions.config.ts
  packages/xmlui-gauge/src/Gauge.spec.ts
  packages/xmlui-echart/src/EChart.spec.ts
  packages/xmlui-masonry/src/Masonry.spec.ts
  packages/xmlui-tiptap-editor/src/TiptapEditor.spec.ts`; passing with 22 tests
  and 3 explicit `COMP-0036` skips;
- `npx playwright test -c playwright.extensions.config.ts
  packages/xmlui-calendar/src/Calendar.spec.ts
  packages/xmlui-grid-layout/src/GridLayout.spec.ts`; passing with 8 passed
  tests and 1 explicit `COMP-0036` skip;
- `npm run verify:website-extensions`; passing, including extension package
  builds, metadata builds, and aggregate extension E2E with 178 passed and 14
  explicit skips (`COMP-0034`, `COMP-0035`, and `COMP-0036`);
- `npm run test:website:e2e`; passing with 15 tests and the known copied Sass
  deprecation warnings from `_themes.scss`.

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

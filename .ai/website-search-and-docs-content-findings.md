# Website Search and Docs Content Findings

Date: 2026-06-27
Plan step: `.plans/website-migration-plan.md` Step 8

## Scope

Expanded the visible website content slice with copied docs markdown pages and
switched the header search to use copied docs/blog search data.

## Source of Truth

- Old docs content:
  `/Users/dotneteer/source/xmlui/website/content/docs/pages/app-structure.md`
  and guide pages under `/Users/dotneteer/source/xmlui/website/content/docs/pages/`
- Migrated content:
  `website/content/docs/pages/*.md`
- Search data generation:
  `website/utils/index.ts`
- Header usage:
  `website/src/Main.xmlui`

## Implemented

- Added `/docs/app-structure`, rendering copied
  `pages/app-structure.md` through the same direct `Markdown` bridge as
  `/docs/intro`.
- Added old-style docs route aliases backed by copied markdown:
  `/docs/reactive-intro`, `/docs/components-intro`, `/docs/guides`,
  `/docs/guides/app-structure`, `/docs/guides/markup`,
  `/docs/guides/scripting`, `/docs/guides/scoping`,
  `/docs/guides/visibility`, `/docs/guides/layout`,
  `/docs/guides/working-with-text`, `/docs/guides/working-with-markdown`,
  `/docs/guides/routing-and-links`, `/docs/guides/forms`, and
  `/docs/guides/modal-dialogs`.
- Added the next copied guide/styles route cluster:
  `/docs/guides/user-defined-components`, `/docs/guides/refactoring`,
  `/docs/styles-and-themes/layout-props`,
  `/docs/styles-and-themes/theme-variables`,
  `/docs/styles-and-themes/theme-variable-defaults`, and
  `/docs/styles-and-themes/common-units`.
- Added the markdown-backed core docs route cluster:
  `/docs/context-variables`, `/docs/context-variables2`, `/docs/behaviors`,
  `/docs/globals`, `/docs/app-globals`, `/docs/xmlui-config`,
  `/docs/helper-tags`, `/docs/core-properties`, `/docs/template-properties`,
  and `/docs/glossary`.
- Added the tutorial/learn slice:
  `/docs/learn`, `/docs/themes-intro`, `/docs/tutorial`, and
  `/docs/tutorial-01` through `/docs/tutorial-12`. Tutorial chapter routes use
  copied markdown; learn/theme/tutorial landing pages are display-first XMLUI
  pages until the old `Overview` component path is restored.
- Added display-first reference/resource/custom visual entry routes:
  `/docs/reference`, `/docs/reference/themes`, `/docs/resources`,
  `/docs/icons`, and `/docs/palettes`. The icons and palettes routes verify
  visible page/display coverage now, while full old custom component behavior
  remains a later parity slice.
- Added `/docs/guides/playground-and-codefence` using the static-code markdown
  bridge.
- Added the wrap-component guide cluster:
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
  `/docs/guides/wrap-component/extension-packaging`.
- Added the first how-to basics cluster:
  `/docs/howto`,
  `/docs/howto/expose-a-method-from-a-component`,
  `/docs/howto/delegate-a-method`,
  `/docs/howto/buffer-a-reactive-edit`,
  `/docs/howto/modify-a-value-reported-in-a-column`,
  `/docs/howto/filter-and-transform-data-from-an-api`,
  `/docs/howto/group-items-in-list-by-a-property`,
  `/docs/howto/delay-a-datasource-until-another-datasource-is-ready`,
  `/docs/howto/prevent-undefined-requests-in-chained-datasources`,
  `/docs/howto/hide-an-element-until-its-datasource-is-ready`, and
  `/docs/howto/use-fetched-data-safely-in-when`.
- Added the next five how-to route slices:
  forms/modal basics, layout/i18n/accessibility, runtime state and async,
  advanced forms, and API operations. The `/docs/howto` overview now exposes
  representative links for those groups, and `/docs/howto/:slug` renders copied
  markdown from `content/docs/pages/howto/*.md` through
  `docsContentStaticCode`.
- Added five more how-to route slices:
  tables/lists/trees, routing/layout UI, dialogs/themes/user components,
  lifecycle/errors/menus/content, and theming recipes. These also use
  representative `/docs/howto` links plus the dynamic copied-markdown route.
- Added the final how-to display group for advanced components, charts, and
  media, still backed by `/docs/howto/:slug`.
- Added copied markdown routes for `/docs/hosted-deployment`, `/docs/mcp`,
  `/docs/vscode`, `/docs/news-and-reviews`, and
  `/docs/styles-and-themes/themes`.
- Added `/docs/managed-react` and dynamic `/docs/managed-react/:slug` routes
  for the copied managed-react article cluster.
- Added generic copied-markdown reference routes for
  `/docs/reference/components/:componentName` and
  `/docs/reference/extensions/:packageName/:entryName`. The existing Button
  and Gauge special routes remain as interactive smoke coverage.
- Added `docsContentStaticCode` in `website/utils/index.ts` and exposed it
  through `website/src/config.ts`. The first guide-route cluster uses this
  static-code content variant to convert `xmlui-pg` markdown fences to `xmlui`
  fences, keeping copied pages visible while embedded playground parity is
  restored.
- Expanded `docsContentStaticCode` to rewrite old bare `appGlobals.` markdown
  expressions to `$appGlobals.`. This keeps `working-with-markdown.md` visible
  in the current runtime while old app-global expression parity remains open.
- Added visible navigation from `/docs` to both copied docs pages.
- Changed website header `Search` to consume `$appGlobals.staticSearchData`
  directly, so the header search uses copied docs/blog content rather than the
  earlier two-item inline fixture.
- Kept the header search in overlay mode for this display slice. Inline mode
  currently triggers Radix Popover update-depth and `getBoundingClientRect`
  noise when used in the website header.
- Updated `ButtonReact` so extension code can pass a rendered React icon node
  while still receiving the `contextualLabel` accessible name.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npx playwright test src/components/Button/Button.spec.ts --grep "icon-only button uses contextualLabel|icon & label button uses label"`
- `npm --workspace xmlui-website exec -- playwright test tests/e2e/website-migration.spec.ts --grep "header search"`
- `env XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui-website exec -- playwright test tests/e2e/website-migration.spec.ts --grep "copied docs markdown"`
- `env XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui-website exec -- playwright test tests/e2e/website-migration.spec.ts --grep "copied core docs"`
- `env XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui-website exec -- playwright test tests/e2e/website-migration.spec.ts --grep "first how-to basics"`
- `env XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui-website exec -- playwright test tests/e2e/website-migration.spec.ts --grep "next five how-to"`
- `env XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui-website exec -- playwright test tests/e2e/website-migration.spec.ts --grep "second five how-to"`
- `env XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui-website exec -- playwright test tests/e2e/website-migration.spec.ts --grep "next five content parity"`
- `env XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui-website run test:e2e`
- `npx playwright test src/components/TableOfContents/TableOfContents.spec.ts --grep "renders table of contents links with headings"`
- `npm --workspace xmlui-website run build`

## Remaining Gaps

- The website still uses focused hand-written routes instead of the old
  `DocumentPage` user-defined component path. Tracked as `COMP-0031`.
- Inline Search mode still needs a separate compatibility hardening pass before
  it should be used in the website header E2E path.
- `xmlui-pg` snippets are currently static code blocks on the first copied
  guide-route cluster. The eventual parity path should render embedded
  playground snippets without causing nested-app update loops. Tracked as
  `COMP-0032`.
- Bare `appGlobals` support in markdown expressions is bridged only in
  `docsContentStaticCode`; the runtime compatibility question is still open.

## Step 8 Completion Update

- The display-first home route now renders copied `why-simple.md` and
  `why-reactive.md` homepage content, and `/get-started` renders copied
  `get-started.md`.
- Copied homepage markdown is normalized with the same static-code bridge used
  for docs, so old `xmlui-pg` fences stay visible as code while live playground
  embedding remains tracked compatibility debt.
- Website E2E now verifies copied public artifacts served by the dev server:
  RSS, sitemap, redirects, Static Web Apps config, and logo SVG.
- The website Playwright harness runs serially with one worker, matching its
  role as a single-dev-server visual regression route suite.

## Step 9 SSG Slice 1 Update

- Added website-level `build-ssg` and `preview-ssg` scripts matching the old
  command names while keeping copied public artifacts deterministic.
- Added `website/scripts/prepare-ssg-output.mjs` to copy
  `ssg-staticwebapp.config.json` over `staticwebapp.config.json` in `dist-ssg`,
  preserving the old SSG hosting config convention.
- Updated core SSG tooling to reuse normal build extension metadata and raw
  source plugins for the SSR bundle. This fixes the initial SSG compile failure
  for website extension components such as `Search`.
- Restricted SSG runtime module globbing to `src/**` so copied docs sample
  `.xmlui` files are not compiled as app modules.
- `npm --workspace xmlui-website run build-ssg` now completes, but most
  discovered routes still report `no render output`; Step 9 slice 3 should make
  route render coverage explicit and enforceable.

## Step 9 Production Output Slice 2 Update

- Added `website/scripts/verify-production-output.mjs` and wired it into the
  website `build` script.
- The verifier checks generated shell/mock files, byte-for-byte copied public
  artifacts, RSS/sitemap content, logo SVG markup, and Static Web Apps config
  semantics for both production and SSG config files.
- `npm --workspace xmlui-website run verify:production-output` passes.
- `npm --workspace xmlui-website run build` now rebuilds and then runs the
  verifier; it passes with the known Sass, Smart UI direct-eval, large chunk,
  and plugin timing warnings.

## Step 9 SSG Route Output Slice 3 Update

- Added `website/scripts/verify-ssg-output.mjs` and wired it into
  `website`'s `build-ssg` script after SSG config preparation.
- The SSG verifier checks required files, the prepared `staticwebapp.config.json`
  404 rewrite, copied RSS/sitemap/logo content, at least 250 generated route
  `index.html` files, and representative route content for home, get-started,
  docs, reference, extension, and blog routes.
- Core SSG now throws when any discovered route render reports an error or
  produces no rendered HTML.
- Core SSG injects `appGlobals.isSsg === true` while prerendering. The `/docs`
  browser-only extension smoke block is hidden only during SSG so server
  rendering stays deterministic, while the normal website route continues to
  exercise Masonry, Gauge, EChart, Calendar, GridLayout, and TiptapEditor.
- `npm --workspace xmlui-website run build-ssg` passes with the known Sass,
  Smart UI direct-eval, large chunk, and plugin timing warnings. It discovers
  259 routes and verifies 260 generated `index.html` files.
- Focused browser verification still passes:
  `env XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui-website exec --
  playwright test tests/e2e/website-migration.spec.ts --grep "docs smoke route"`.

## Step 9 Preview and Output Shape Completion

- Added `website/scripts/verify-preview-ssg.mjs` and wired
  `website`'s `verify:preview-ssg` script.
- The preview verifier starts the local SSG preview server and checks clean
  document URLs, fallback navigation, copied RSS/sitemap/logo assets with MIME
  types, and missing static resource 404 behavior.
- Updated `xmlui/scripts/preview-ssg.mjs` so copied static extensions used by
  the old website, including `.rss`, `.md`, font, media, and archive files, are
  treated as resources instead of falling back to HTML when missing.
- Old command shape compared:
  old `build`/`build-ssg` regenerated live resources before building; the
  migrated display milestone uses deterministic copied resources and verifies
  output retention. Old `build-ssg` moved the SSG Static Web Apps config over
  `staticwebapp.config.json`; the migrated script copies it and keeps both
  names. Old `preview-ssg` used `npx preview-ssg ./dist-ssg`; the migrated
  workspace uses the local preview compatibility server with smoke coverage.
- Step 9 is complete for production and SSG parity of the migrated display
  website. Remaining parity debt is live generation, old `DocumentPage` and
  embedded playground behavior, and generated metadata reference parity.
- Verification:
  `npm --workspace xmlui-website run build`,
  `npm --workspace xmlui-website run build-ssg`, and
  `npm --workspace xmlui-website run verify:preview-ssg`.

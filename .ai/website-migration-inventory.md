# Website Migration Inventory

Date: 2026-06-27  
Source baseline: `/Users/dotneteer/source/xmlui`  
Rewrite workspace: `/Users/dotneteer/source/xmlui-rs`

## Purpose

This note supports `.plans/website-migration-plan.md` Step 1. It inventories
the old XMLUI website and the extension packages imported by that website so
the migration can start with small, testable package slices and reach a visible
local website quickly.

## Old Website Entry Points

Inspected:

- `/Users/dotneteer/source/xmlui/website/index.ts`
- `/Users/dotneteer/source/xmlui/website/extensions.ts`
- `/Users/dotneteer/source/xmlui/website/package.json`
- `/Users/dotneteer/source/xmlui/website/xmlui.config.json`
- `/Users/dotneteer/source/xmlui/website/src/Main.xmlui`
- `/Users/dotneteer/source/xmlui/website/src/config.ts`

Runtime shape:

- `website/index.ts` imports `startApp` from `xmlui`, imports nine extension
  packages, loads `import.meta.glob('/src/**', { eager: true })`, then calls
  `startApp(runtime, usedExtensions)`.
- HMR repeats `startApp(newModule?.runtime ?? runtime, usedExtensions)`.
- `website/extensions.ts` exports the same nine extensions as an array.
- `website/xmlui.config.json` disables analyzer/reactive-cycle/accessibility/
  type-contract checks for this app.
- `website/src/config.ts` exports a `StandaloneAppDescription` with:
  - app name `XMLUI`;
  - default theme `xmlui-website-theme`;
  - seven local themes;
  - local icons from `website/utils`;
  - resources for logo, dark logo, and favicon;
  - `appGlobals` for search data, nav sections, docs content, prefetched
    content, posts, all posts, code highlighter, lint severity, and pop-out URL.

Current rewrite baseline:

- `/Users/dotneteer/source/xmlui-rs/website` exists but is only a placeholder
  app with one Button.
- The current rewrite has one real extension package fixture:
  `/Users/dotneteer/source/xmlui-rs/packages/xmlui-counter-badge`.
- Other `packages/*` entries in the rewrite currently appear only as old
  `.turbo` logs unless migrated later.

## Old Website File Inventory

Counts from the old website:

| Area | Count | Notes |
| --- | ---: | --- |
| `content/` | 440 files | Docs pages, reference pages, extension reference pages, blog posts, home snippets, samples. |
| `public/` | 287 files | Static resources, generated release/search/docs assets, RSS, sitemap, redirects, static web app config, mock service worker, parser asset. |
| `icons/` | 47 files | Local SVG icons loaded by `getLocalIcons()`. |
| `src/` | 39 files | Main app, config, themes, XMLUI user-defined website components. |
| `scripts/` | 7 files | Release download/list generation, RSS, sitemap, how-to stubs. |
| `navSections/` | 2 files | `components.json` and `extensions.json`. |

Direct-copy candidates for early display:

- `website/src/Main.xmlui`
- `website/src/config.ts`
- `website/src/themes/*.ts`
- `website/src/components/**/*.xmlui`
- `website/icons/*.svg`
- `website/navSections/*.json`
- `website/content/home/*.md`
- the first docs page set needed for `/docs`
- public logo/favicon/media/resources referenced by home/docs routes

Copy with compatibility review:

- `website/utils/index.ts`, because it imports utilities from
  `xmlui-docs-blocks` and types from `xmlui`.
- `website/scripts/*`, because `get-releases.ts` and
  `download-latest-xmlui.ts` use live GitHub release data. Keep deterministic
  checked-in resources for early local display.
- `website/content/docs/reference/**`, because generated component/extension
  reference pages must eventually line up with rewrite metadata output.
- `website/public/resources/components.json`, release files, RSS, sitemap, and
  static web app configs, because some are generated/publish-facing artifacts.

## Website Routes and Visual Surface

`src/Main.xmlui` declares the app shell and navigation for:

- `/`
- `/docs`, `/docs/learn`, `/docs/reactive-intro`, `/docs/components-intro`,
  `/docs/themes-intro`
- `/docs/guides/*`
- `/docs/managed-react/*`
- `/docs/guides/wrap-component/*`
- `/docs/tutorial` and `/docs/tutorial-01` through `/docs/tutorial-12`
- `/docs/howto/*`
- `/docs/reference/components/*`
- `/docs/reference/extensions/*`
- `/blog` and `/blog/:slug`
- `/get-started`
- `/news`

First visible milestone should cover:

- `/` home route;
- `/docs` or another low-dependency docs route;
- one route using `xmlui-docs-blocks`;
- top-level header/nav search once `xmlui-search` is migrated.

## Imported Website Extensions

The old website imports these packages directly from `website/index.ts` and
`website/extensions.ts`:

| Package | Components/themes/functions from old package | Old tests | Notes |
| --- | --- | --- | --- |
| `xmlui-docs-blocks` | Components: `BasicLayout`, `FeaturedWithTabsLayout`, `OverviewCard`, `Breadcrumbs`, `Separator`, `LinkButton`, `DocumentLinks`, `DocumentPage`, `DocumentPageNoTOC`, `TBD`, `SectionHeader`, `Overview`, `TwoColumnCode`, `PageNotFound`, `ReleaseList`, `Blog`, `ReadingTime`, `Share`. Theme: `xmlui-docs`. Functions: `findNavItem`, `getNavGroup`, `getTopLevelChildren`, `getPageDescription`, `getRootLinks`, `getCardIcon`. Utility exports: highlighter/content helpers and custom syntax types. | `src/blog/Share.spec.ts`, `src/docs/DocsBlocks.spec.ts` | Highest priority for docs rendering. Package dependencies: `@shikijs/langs`, `js-yaml`, `remark-parse`, `remark-stringify`, `shiki`, `strip-markdown`, `unified`. |
| `xmlui-website-blocks` | Components: `HeroSection`, `ScrollToTop`, `FancyButton`, `Carousel`, `CarouselItem`, `Backdrop`, `Breakout`. | `Backdrop.spec.ts`, `Breakout.spec.ts`, `Carousel.spec.ts`, `HeroSection.spec.ts` | Highest priority for home/landing display. Depends on `@react-spring/web`. Carousel tests include visible state changes through next/previous/indicator controls. |
| `xmlui-search` | Component: `Search`. Utility exports: `SearchMd`, `ThemedSearch`. | `src/Search.spec.ts` | Top-level header/nav workflow. Depends on `fuse.js`. Website uses `appGlobals.staticSearchData`, suggestions, preview metadata, pagination, spell correction. |
| `xmlui-masonry` | Component: `Masonry`. | `src/Masonry.spec.ts` | No runtime dependencies beyond `xmlui` in old package. Good early visual/demo package after shell/search. |
| `xmlui-gauge` | Component: `Gauge`. | `src/Gauge.spec.ts` | Depends on `smart-webcomponents-react` and `classnames`; generated bundle includes an extra smart gauge chunk. |
| `xmlui-echart` | Component: `EChart`. | `src/EChart.spec.ts` | Depends on `echarts`, `echarts-for-react`, and `classnames`. |
| `xmlui-calendar` | Component metadata name: `BigCalendar`; default export registers `bigCalendarComponentRenderer`. | No old package spec found. | Depends on `react-big-calendar`, `dayjs`, and `classnames`; needs new smoke/state-update coverage. |
| `xmlui-grid-layout` | Component: `GridLayout`. | No old package spec found. | Depends on `react-grid-layout`; old package has no `build:meta` script and no `meta/componentsMetadata.ts`; needs metadata decision and new smoke/state-update coverage. |
| `xmlui-tiptap-editor` | Component: `TiptapEditor`. | `src/TiptapEditor.spec.ts` | Depends on Tiptap packages and `tiptap-markdown`; likely heavy, later after visible shell. |

All nine old packages default-export an extension object with
`namespace: "XMLUIExtensions"` and a `components` array. Only
`xmlui-docs-blocks` exports themes/functions among the website-first package
set.

## Package Build and Artifact Contract

Inspected package scripts show the old first-party extension convention:

- local development export: `"exports": "./src/index.tsx"`;
- extension build: `xmlui build-lib`;
- metadata build: `xmlui build-lib --mode=metadata` for all website imports
  except `xmlui-grid-layout`;
- publish rewrite with `clean-package`, generally to:
  - `./dist/<package>.mjs`
  - `./dist/<package>.js`
  - optional `./*.css` import mapping for packages with side-effect CSS;
- `files: ["dist"]`;
- package demos generally use `index.ts` plus `import.meta.glob('/demo/**')`.

Early rewrite work should either:

- generalize the current `xmlui-counter-badge` TypeScript/metadata scripts for
  these packages; or
- restore a compatible `xmlui build-lib` command before copying the packages.

## Website Content Touchpoints for Extensions

Known extension nav/reference content:

- `navSections/extensions.json` includes reference nav for:
  `xmlui-docs-blocks`, `xmlui-echart`, `xmlui-gauge`, `xmlui-masonry`,
  `xmlui-tiptap-editor`, and `xmlui-website-blocks`.
- `content/docs/reference/extensions/` includes pages for those packages plus
  other extension families not imported by the website runtime today
  (`xmlui-animations`, `xmlui-pdf`, `xmlui-recharts`, `xmlui-spreadsheet`).
- `content/docs/pages/wrap-component/` includes package-oriented guide pages
  for calendar/bigcalendar, ECharts, gauge theme, grid layout, masonry, and
  Tiptap.
- `content/docs/pages/managed-react/themevars-namespace.md` documents theme
  namespace prefixes for the website extension packages.

This means early website display can copy all content, but extension reference
pages should be expected to reveal missing components/metadata until the
corresponding package is migrated.

## Suggested First Implementation Slices

1. Package tooling baseline:
   - make a package skeleton convention that can host old `src/index.tsx`
     extension packages;
   - verify against `xmlui-counter-badge` before copying bigger packages.
2. `xmlui-docs-blocks`:
   - first package because `website/utils/index.ts` imports content/highlighter
     helpers from it and docs routes depend on its components/functions/theme.
3. `xmlui-website-blocks`:
   - second package because the home route depends on landing blocks and visual
     components.
4. `xmlui-search`:
   - third package because the header/nav renders `Search` directly and search
     is an important website workflow.
5. First visible website milestone:
   - copy entry/config/themes/home/docs essentials;
   - gate heavy extension reference routes only if needed;
   - verify `/` and one `/docs` route.
6. Remaining packages:
   - `xmlui-masonry`, `xmlui-gauge`, `xmlui-echart`, `xmlui-calendar`,
     `xmlui-grid-layout`, `xmlui-tiptap-editor`.

## Known Compatibility Risks

- Old packages use public XMLUI helpers including `wrapComponent`,
  `createComponentRenderer`, `createMetadata`, `parseScssVar`,
  `useComponentThemeClass`, `useTheme`, `startApp`, `xmlui/testing`, and
  component API registration hooks.
- Some packages rely on CSS module imports plus package-level CSS side effects.
- Docs blocks rely on runtime content discovery and markdown/highlighting
  utilities; these are part package behavior and part website build behavior.
- `xmlui-grid-layout` lacks old metadata and old tests, so it needs a new
  minimal metadata contract and smoke/state-update tests.
- `xmlui-calendar` lacks old tests, so it needs new smoke/state-update tests.
- Live release/download scripts should be disabled or fixture-backed until the
  local visual website is stable.

## Verification Targets for Step 1

Step 1 is complete when this inventory:

- lists the nine imported website extensions;
- identifies existing old package E2E/spec coverage;
- identifies packages needing new smoke/state-update tests;
- separates direct-copy website files from compatibility-review files;
- names the first implementation order for fast website display.

This note satisfies those Step 1 targets.

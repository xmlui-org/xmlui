# Website Original Structure Reuse Plan

Status: draft  
Source baseline: `/Users/dotneteer/source/xmlui/website`  
Rewrite workspace target: `/Users/dotneteer/source/xmlui-rs/website`

## Purpose

Replace the display-first migrated website shell with the original website's
actual structure, XMLUI markup, themes, content, scripts, and assets. The
website should look and behave like the original because it is the original
website, copied into the rewrite workspace with only compatibility shims where
the rewrite framework is still missing old XMLUI behavior.

The previous display milestone proved that the current XMLUI core, website
extension packages, routing, content loading, production build, SSG build, and
E2E harness can run. It is not sufficient as visual parity because it rebuilt
large parts of `website/src/Main.xmlui` by hand. From this point forward, the
old website markup is the compatibility contract.

## Guiding Rules

- Preserve `/Users/dotneteer/source/xmlui/website` file layout and markup
  wherever possible.
- Do not redesign `website/src/Main.xmlui`.
- Do not replace old website XMLUI components with ad hoc cards, smoke panels,
  or route-specific approximations.
- Prefer fixing XMLUI core compatibility over changing website markup.
- When a temporary website-local shim is unavoidable, keep it small, document
  it here, and add a test that fails once the shim can be removed.
- Every step must leave `npm --workspace xmlui-website run start` usable or
  have an explicit blocker recorded before moving on.

## Compatibility Sources

- Old website entry and config:
  `/Users/dotneteer/source/xmlui/website/index.ts`,
  `/Users/dotneteer/source/xmlui/website/extensions.ts`,
  `/Users/dotneteer/source/xmlui/website/src/config.ts`,
  `/Users/dotneteer/source/xmlui/website/xmlui.config.json`.
- Old website app shell:
  `/Users/dotneteer/source/xmlui/website/src/Main.xmlui`.
- Old user-defined website components:
  `/Users/dotneteer/source/xmlui/website/src/components/home/*.xmlui`,
  `/Users/dotneteer/source/xmlui/website/src/components/blog/*.xmlui`,
  `/Users/dotneteer/source/xmlui/website/src/components/docs/*.xmlui`,
  `/Users/dotneteer/source/xmlui/website/src/components/news/*.xmlui`,
  `/Users/dotneteer/source/xmlui/website/src/components/_common/*.xmlui`.
- Old themes:
  `/Users/dotneteer/source/xmlui/website/src/themes/*.ts`.
- Old content and metadata:
  `/Users/dotneteer/source/xmlui/website/content`,
  `/Users/dotneteer/source/xmlui/website/navSections`,
  `/Users/dotneteer/source/xmlui/website/public`,
  `/Users/dotneteer/source/xmlui/website/utils/index.ts`.
- Rewrite compiler/runtime behavior to harden:
  `xmlui/src/compiler/compileXmluiModule.ts`,
  `xmlui/src/production/manifest.ts`,
  `xmlui/src/ssg/ssgEntry.ts`,
  `xmlui/src/extensionAuthoringCompat.tsx`.

## Reuse Strategy

The target state is a copied old website tree:

- `website/src/Main.xmlui` should match the old file except for documented
  compatibility comments or unavoidable path/import adjustments.
- `website/src/components/**` should be copied from the old website and remain
  organized by `home`, `blog`, `docs`, `news`, and `_common`.
- `website/src/themes/**`, `website/content/**`, `website/navSections/**`,
  `website/public/**`, and `website/utils/index.ts` should preserve old shape.
- `website/package.json` may keep workspace-local script wrappers, but command
  semantics must stay aligned with the old website scripts.

## Step 1: Restore XMLUI User Component Discovery

Status: complete for the home-page slice.

Problem: the rewrite compiler currently imports sibling `.xmlui` components
from the same directory as the compiled file. The old website expects
components under `src/components/**` to be globally available to
`src/Main.xmlui`, for example `HomePage`, `BlogOverview`, `BlogPage`,
`ThemesIntro`, `HowtoOverview`, and `NewsAndReviews`.

Tasks:

- inspect old XMLUI app/component discovery behavior and record the exact
  source files in `.ai/website-original-structure-findings.md`;
- extend the rewrite website build/start/SSG path so XMLUI components under
  `src/components/**/*.xmlui` are available to `Main.xmlui` without changing
  `Main.xmlui`;
- preserve existing same-directory component imports used by smaller fixtures;
- add focused E2E or compiler tests proving `Main.xmlui` can render a component
  from `src/components/home/HomePage.xmlui` and a nested dependency such as
  `Benefits -> Benefit`.

Verification:

- focused website E2E for the copied home component group passes;
- `npm --workspace xmlui-website run build` reaches `/` without unknown
  component errors after copying the home component group.

Notes:

- The rewrite compiler now discovers referenced app components from
  `src/components/**/*.xmlui` and referenced same-directory component
  dependencies from component modules.
- Component modules now carry their imported component registry at runtime so
  nested copied components such as `Benefits -> Benefit` render.
- Imports are limited to actually referenced components to avoid circular
  initialization in dev-time generated modules.

## Step 2: Copy the Original Home Structure First

Status: complete with documented compatibility adaptations.

Tasks:

- copy old `src/components/home/*.xmlui` literally into
  `website/src/components/home`;
- replace the current handmade `/` page body with the old `<HomePage />` route
  from old `src/Main.xmlui`;
- keep the old `Headlines`, `Benefits`, `HeroApp`, and `WhyXMLUI` markup;
- if `xmlui-pg` embedded playground rendering blocks `HeroApp`, implement the
  missing markdown/playground compatibility in XMLUI or add one tiny documented
  temporary fallback inside the markdown renderer, not by rewriting `HeroApp`.

Verification:

- visual smoke: first viewport contains `Practical User Interfaces` and
  `Built Simply` from the old home page;
- E2E checks the original home component text and benefit text;
- screenshot comparison note records the main remaining visual differences
  against the old home page, if any.

Notes:

- `website/src/components/home/*.xmlui` has been copied from the old site.
- `HeroApp.xmlui` is not yet a byte-for-byte copy. Its embedded `xmlui-pg`
  markdown block is adapted because current parser/playground compatibility
  does not yet accept the old CDATA/shorthand form.
- This adaptation should be removed after markdown playground compatibility is
  restored.

## Step 3: Copy the Original App Shell and Navigation

Status: in progress; header, first nav-panel slice, footer frame, and landing
route are restored.

Tasks:

- replace the migrated `website/src/Main.xmlui` shell with the old
  `src/Main.xmlui` structure: `Theme`, `App`, `PageMetaTitle`, `AppHeader`,
  desktop/mobile `Search`, `NavPanel`, `NavGroup`, `IncludeNavSection`, and
  original route table;
- keep old title expressions and active-route expressions;
- preserve old `NavPanel` width/border theme expressions;
- fix XMLUI core incompatibilities discovered by the old shell instead of
  simplifying the shell.

Verification:

- `/`, `/docs`, `/blog`, `/get-started`, and `/news` render with the original
  header and navigation structure;
- desktop and mobile viewport screenshots confirm the old header/nav layout is
  present;
- E2E checks old top-level nav labels: `Docs`, `Blog`, `Get started`, and
  `News & Reviews`.

Notes:

- The landing route now uses the copied `<HomePage />` component and the
  original top-level header labels.
- The app now includes an original-shaped `NavPanel` with mobile search,
  top-level mobile links, `Learn XMLUI`, `Guides`, `Reference`, and
  footer-adjacent links. The full old generated navigation tree is still to be
  restored.
- The original footer frame is restored with `ScrollToTop`, `Footer`,
  `Changelog`, `GitHub`, and `ToneSwitch`. The docs-blocks `Separator`
  component is temporarily represented by its equivalent built-in
  `ContentSeparator` markup because the runtime extension registry did not
  expose `Separator` in this slice.
- Root `<Theme>` around `<App>` is not yet supported by the current parser, so
  the old theme variables needed by the shell are temporarily passed as `App`
  theme-variable props.
- Original expression conveniences such as the unprefixed `pathname` alias are
  temporarily adapted to the rewrite expression model.
- Responsive `when-*` props have been added to the rewrite runtime and
  metadata validation so original shell visibility rules can be preserved.
- `xmlui-pg` markdown fences now extract only the `---app` section, so copied
  old website playground fences with `---config` and `---api` sections do not
  pass non-app content to `NestedApp`.
- Tooltip framework props are now allowed by the rewrite contract so copied
  old markup such as `<Button tooltip="...">` can render.

Verification:

- `npx playwright test -c xmlui/playwright.config.ts
  xmlui/src/components/Markdown/Markdown.spec.ts`; passing.
- `XMLUI_REUSE_EXISTING_SERVER=0 npx playwright test -c
  website/playwright.config.ts website/tests/e2e/website-migration.spec.ts
  --grep "home route|home content"`; passing.
- `npm --workspace xmlui-website run build`; passing with existing Sass
  deprecation warnings and bundle-size/direct-eval warnings.

## Step 4: Copy Original Blog and News Components

Status: pending

Tasks:

- copy `src/components/blog/*.xmlui`,
  `src/components/news/NewsAndReviews.xmlui`, and shared
  `src/components/_common/*.xmlui`;
- use the old `/blog`, `/blog/:slug`, and `/news` route markup;
- preserve old `posts`, `allPosts`, and `blog.posts` appGlobals shape from
  old `utils/index.ts`;
- avoid route-specific replacement pages unless a core compatibility blocker is
  documented.

Verification:

- `/blog` renders `BlogOverview`;
- one copied blog post renders through `BlogPage`;
- `/news` renders `NewsAndReviews`;
- E2E checks representative old text and links from each route.

## Step 5: Copy Original Docs Components and Document Pages

Status: pending

Tasks:

- copy `src/components/docs/*.xmlui` literally;
- restore old `DocumentPage`, `DocumentPageNoTOC`, `ThemesIntro`,
  `HowtoOverview`, `Icons`, `Palettes`, `ThousandThemes`, and reference route
  usage from old `Main.xmlui`;
- fix user-defined component rendering and slot behavior needed by
  `DocumentPage` rather than replacing docs routes with direct `Markdown`;
- keep old `docsContent` markdown handling so `xmlui-pg` fences and old
  markdown conventions are preserved.

Verification:

- `/docs`, `/docs/reactive-intro`, `/docs/components-intro`,
  `/docs/themes-intro`, `/docs/howto`, `/docs/reference/components`, and
  `/docs/reference/extensions` render through old components;
- E2E checks table of contents behavior on a `DocumentPage` route and absence
  of TOC on a `DocumentPageNoTOC` route;
- old docs block package E2E skips tied to `COMP-0035` are revisited and
  unskipped where the copied structure now passes.

## Step 6: Restore Original Content, Assets, Icons, and Config Shape

Status: pending

Tasks:

- compare copied `content`, `public`, `navSections`, `icons`, and
  `utils/index.ts` against the old repo byte-for-byte where deterministic;
- restore old icon/resource names used by `Main.xmlui` and docs components;
- keep deterministic local fixtures only for live network-generated files, and
  document each fixture as a build-time compatibility substitution;
- ensure `getLocalIcons`, `staticSearchData`, `prefetchedContent`,
  `docsContent`, and `docsContentStaticCode` match old appGlobals semantics.

Verification:

- file comparison script reports expected equal files and documented
  substitutions;
- header/search icons and docs nav icons render;
- old search suggestions and representative search results work.

## Step 7: Production, SSG, and Preview Parity With Original Structure

Status: pending

Tasks:

- run the old structure through current `xmlui build`, `xmlui ssg`, and local
  preview-SSG compatibility server;
- remove any display-shell-specific SSG exclusions that are no longer needed;
- preserve old output semantics for `staticwebapp.config.json`,
  `ssg-staticwebapp.config.json`, RSS, sitemap, copied assets, and fallback
  routes.

Verification:

- `npm --workspace xmlui-website run build`;
- `npm --workspace xmlui-website run build-ssg`;
- `npm --workspace xmlui-website run verify:preview-ssg`;
- representative production and SSG routes render old structure.

## Step 8: Visual Regression Harness

Status: pending

Tasks:

- add screenshot-based Playwright checks for the old website first viewport and
  key route families;
- capture desktop and mobile screenshots for `/`, `/docs`, `/blog`,
  `/docs/reference/components`, and one `DocumentPage` route;
- compare against checked-in or generated baselines from the old website only
  after the old and new routes can be run deterministically.

Verification:

- visual checks fail when the handmade display shell returns;
- textual E2E continues to verify the original route content;
- screenshot artifacts are documented for human review.

## Compatibility Debt to Revisit

- `COMP-0005`: website parity should move from display-first shell to original
  structure parity.
- `COMP-0031`: old `DocumentPage` route component must be restored rather than
  bypassed.
- `COMP-0032`: embedded playground markdown snippets must render or have a
  narrow markdown/playground compatibility fallback.
- `COMP-0035`: user-defined docs extension components should be unblocked by
  the same user component rendering work needed by the copied website.

## Completion Criteria

- The website source tree keeps the original website structure and route
  markup.
- The home page, docs shell, blog, news, reference pages, and extension docs
  render using copied old XMLUI components.
- Any changed old website file has a documented reason tied to a rewrite
  compatibility gap.
- The website visually resembles the old site because it is driven by the same
  XMLUI markup, themes, content, and assets.
- `npm --workspace xmlui-website run start`,
  `npm run verify:website-extensions`, and `npm run verify:website` pass.

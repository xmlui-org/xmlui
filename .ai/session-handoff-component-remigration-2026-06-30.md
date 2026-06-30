# Session Handoff: Component Re-Migration, App Shell Layouts

Date: 2026-06-30

## Current Objective

Continue `.plans/component-remigration.md` under the user's component-by-component
approval workflow. The active component family is the app shell/navigation/page
set:

- `App`
- `AppHeader`
- `Footer`
- `Logo`
- `NavLink`
- `NavGroup`
- `NavPanel`
- `Pages`
- `Page`

These remain `Awaiting approval` until the user finishes testing and explicitly
approves them.

## Important User Instructions

- Preserve original XMLUI behavior from `/Users/dotneteer/source/xmlui`.
- Keep `.plans/component-remigration.md` current.
- Mark affected components complete only after user approval.
- Do not revert unrelated user changes.
- Before this handoff, the dirty worktree was stashed intentionally so the next
  session can restore the exact continuation state.

## How To Restore The Continuation State

The dirty worktree was saved with:

```bash
git stash push -u -m "component-remigration handoff 2026-06-30 app-shell-layouts"
```

In the next session, inspect and apply the stash:

```bash
git stash list
git stash show --stat stash^{/component-remigration handoff 2026-06-30 app-shell-layouts}
git stash apply stash^{/component-remigration handoff 2026-06-30 app-shell-layouts}
```

Do not drop the stash until the user confirms the restored state is no longer
needed.

## Latest Work Completed

The latest user-reported issue was with:

```xml
<App layout="vertical-full-header">
  ...
</App>
```

The expected behavior is:

- header spans full width and remains pinned at the top;
- footer spans full width and remains pinned at the bottom;
- NavPanel is in the centered content row, below the header, and remains pinned;
- with default `scrollWholePage=true`, there is a single App/window scrollbar;
- the `List` inside the page must not become a second internal scrollbar.

The latest implementation changes:

- `AppReact.tsx`
  - Added the original `vertical-full-header` structure:
    full-width header, centered `mainContentRow`, side `navPanel`, content area,
    and full-width footer.
  - Added measured header/footer heights via a small `useMeasuredBlockSize`
    hook.
  - Writes `--app-header-height` and `--app-footer-height` for CSS sticky sizing.
  - Keeps `vertical` and `vertical-sticky` as row-root layouts, while
    `vertical-full-header` remains a column-root layout.

- `App.module.scss`
  - Added/adjusted `.verticalFullHeader` rules.
  - Uses measured header/footer heights for NavPanel sticky top/height.
  - In `scrollWholePage` mode, lets pages/content grow with their content so
    the App/root owns scrolling.
  - Restores the original `scrollWholePage.verticalFullHeader` scrollbar-gutter
    compensation on the main content row and content area. Do not use
    `paddingHorizontal-content-App` on `.verticalFullHeader .mainContentArea`;
    routed `Page` content owns the normal page padding.

## Follow-Up Fix: Page Content Inset

The user later compared the manually tested old/new `vertical-full-header`
sample at `/page1` and found the rewrite's `Page 1` text was subtly shifted.
The cause was the rewrite-only `.verticalFullHeader .mainContentArea` padding
using `paddingHorizontal-content-App`, which added another normal content inset
outside the routed `Page` wrapper.

Fix applied on 2026-06-30:

- removed `padding-inline: $paddingHorizontal-content-App` from
  `.verticalFullHeader .mainContentArea`;
- restored the old `scrollWholePage.verticalFullHeader` row compensation:
  `mainContentRow` widens by `2 * --scrollbar-width`, and
  `mainContentArea` uses only `--scrollbar-width` padding.

Live rewrite measurement on `http://localhost:5173/page1` after the fix:

- `.pagesContainer` and `.xmlui-page-root` start at `x=640`;
- `.xmlui-page-root` keeps the expected own `padding-left: 16px`;
- the rendered `Text` starts at `x=656`.

- `App.tsx` / `NavPanel.tsx`
  - Do not default `height-AppHeader` from App or NavPanel. The original
    NavPanel consumed that variable when explicitly supplied, but did not define
    a default for it. Defaulting it in the rewrite inflated `horizontal` and
    `horizontal-sticky` NavPanel height from content height to header height.

## Follow-Up Fix: Horizontal NavPanel Height

The user later compared `layout="horizontal"` and `layout="horizontal-sticky"`
and found the rewrite NavPanel was taller than the original. The cause was
defaulting `height-AppHeader` in the rewrite's `App` and `NavPanel` metadata.
The copied NavPanel SCSS uses `height-AppHeader`, but the original NavPanel
metadata did not default that variable, so horizontal NavPanel height fell back
to the rendered link content height unless a theme explicitly supplied
`height-AppHeader`.

Fix applied on 2026-06-30:

- removed `height-AppHeader` from `App` default theme variables;
- removed `height-AppHeader` from `NavPanel` default theme variables;
- added an App shell regression covering both `horizontal` and
  `horizontal-sticky`.

Live rewrite measurement on `http://localhost:5173/page1` after the fix:

- header height: 57px;
- horizontal NavPanel content height: 42px;
- NavPanel wrapper height including bottom border: 43px;
- `--xmlui-height-AppHeader` is not emitted on the default NavPanel.

## Follow-Up Fix: Horizontal-Sticky Scroll Offset

The user later found that with `layout="horizontal-sticky"`, the NavPanel
appeared about 1px shorter after scrolling the App content. The cause was not a
height change in NavPanel itself. The sticky NavPanel wrapper was pinned with
the token fallback header height (`56px`), while the rendered AppHeader measured
`57px` including its bottom border. When sticky positioning activated, the
NavPanel moved 1px under the header.

Fix applied on 2026-06-30:

- measure AppHeader in all App layout branches, not only
  `vertical-full-header`;
- always write `--app-header-height` when a header measurement is available;
- use `--app-header-height` for horizontal-sticky NavPanel wrapper `top`
  positioning in both CSS and the renderer-owned inline shell style.

Live rewrite measurement on `http://localhost:5173/` after the fix:

- before scroll: header bottom 57px, NavPanel wrapper top 57px, wrapper height
  43px, NavPanel height 42px;
- after scroll: header bottom 57px, NavPanel wrapper top 57px, wrapper height
  43px, NavPanel height 42px;
- computed sticky top is 57px from `--app-header-height`.

## Follow-Up Fix: Desktop Layout Scroll Shell

The user later compared `layout="desktop"` and found the rewrite still applied
ordinary centered content behavior: the NavPanel was correctly hidden, but the
routed content kept App max-width/margins and pushed the footer out of the
viewport instead of scrolling inside the desktop content region.

Fix applied on 2026-06-30:

- restored desktop shell CSS resets for App header, middle content, page content,
  and footer wrappers;
- made desktop `pageContent` bypass normal App content max-width and centered
  margin inline styles;
- made the desktop middle content region non-scrolling and the `pageContent`
  wrapper the scroll container;
- added an App shell regression proving desktop hides NavPanel, keeps App/root
  from scrolling, keeps header/footer fixed, and scrolls only page content.

Desktop compatibility rule:

- `layout="desktop"` should render header, routed content, and footer in a
  viewport-sized flex column; `NavPanel` is not rendered; header/footer remain
  visible while the page content wrapper scrolls.

## Follow-Up Fix: Desktop List Outside Scroll

The user later found two remaining desktop visual issues in the same sample:
the App title/header spacing and the vertical band around the `List`. Live DOM
comparison showed the AppHeader effective geometry matched the original at the
same viewport, but the rewrite `List` was acting as its own scroll container
inside the padded `Page`. In the original desktop layout, `pageContent` owns the
scroll and the List participates in outside scrolling, so Page top padding
scrolls away instead of staying visible around the List.

Fix applied on 2026-06-30:

- added a desktop-only rule under `.pageContentContainer` that makes contained
  `List` roots use `overflow: visible`, `flex: 0 1 auto`, and `min-height: 0`;
- restored the original `scrollWholePage.desktop` cancellation so desktop
  header/footer wrappers do not receive the scrollbar-gutter compensation used
  by other `scrollWholePage` layouts;
- changed the desktop App shell regression to use a real `List` + `Card`
  template and assert that `pageContent` scrolls while the List `scrollTop`
  remains `0`;
- kept AppHeader root, inner spacing, and Footer content left padding covered
  by the same regression, including a forced nonzero `--scrollbar-width`.

Live rewrite measurement on `http://localhost:5173/` after the fix:

- with `--scrollbar-width: 16px`, AppHeader root stays `x=0`, `padding-left=0`;
- on a 1920px viewport, the logo-template title is `x=336`, a 16px offset from
  the header inner edge, matching the original;
- Footer outer stays `x=0`, `padding-left=0`, while Footer content remains
  centered at `x=320` with its normal own `14px` left padding;
- `pageContent.scrollTop` changes while `List.scrollTop` stays `0`;
- List computed `overflow` is `visible`, so the Page padding scrolls away with
  the page content.

## Follow-Up Fix: Vertical scrollWholePage=false

The user later tested:

```xml
<App layout="vertical" scrollWholePage="false">
  ...
</App>
```

and reported that the rewrite behaved as if the main content column was still a
scroll container. The symptom was a visible gap between the side NavPanel and
the header/content column, plus the footer leaving the viewport. The same issue
applied to `layout="vertical-sticky"`.

Source comparison showed the original `App` has a general
`:not(.scrollWholePage)` rule that clamps the App root to `100dvh`, clips the
root, bounds `pagesContainer`/`pageContentContainer`, and prevents the main
content area from reserving scrollbar gutter space. The rewrite only had the
viewport clamp for horizontal layout, so vertical fell back to
`.mainContentArea { overflow: auto; scrollbar-gutter: stable both-edges; }`.

Fix applied on 2026-06-30:

- added `.appContainer.vertical:not(.scrollWholePage)` rules to restore
  `overflow: clip`, `height: 100dvh`, non-scrolling main content, bounded
  `pagesContainer`, and bounded `pageContentContainer`;
- added an App shell regression covering both `vertical` and `vertical-sticky`
  with `scrollWholePage="false"`.

Live rewrite measurement on `http://localhost:5173/` after the fix:

- App root: `overflow=clip`, `height=1000`, no document scroll;
- App content starts exactly at the NavPanel right edge (`contentLeftDelta=0`);
- App header starts at the content left edge (`headerLeftDelta=0`);
- pages/pageContent are `overflow=hidden`;
- footer remains at viewport bottom (`footerBottomDelta=0`).

- `App-shell.spec.ts`
  - Added regression test:
    `vertical-full-header default scroll keeps chrome pinned and does not scroll the List`.
  - Added regression test:
    `horizontal layouts keep NavPanel at content height by default`.
  - Tightened `horizontal-sticky pins header and footer while the App scrolls`
    to require exact measured header/NavPanel alignment and unchanged NavPanel
    wrapper height after scrolling.
  - Added regression test:
    `desktop layout hides NavPanel and scrolls only the page content`, later
    expanded to cover the real `List` outside-scroll desktop case.
  - Added regression test:
    `vertical layouts with scrollWholePage false clamp the App and do not
    gutter-shift content`.

- `.plans/component-remigration.md`
  - Summary table exists before the detailed status table.
  - App row records the `vertical-full-header` work and latest verification.

## Live DOM Findings Before Handoff

On `http://localhost:5173/` after the latest fix:

- `appCanScroll: true`
- `listCanScroll: false`
- after scrolling, `appScrollTop` changed while `listScrollTop` stayed `0`
- header top stayed `0`
- NavPanel top matched header bottom
- footer bottom stayed `0`

This matched the original project behavior observed on `http://localhost:5174/`.

## Follow-Up Fix: Mobile Hamburger Drawer

The user then confirmed the wide layouts and reported the remaining mobile
compatibility gap: old XMLUI switches every App layout to the same narrow-screen
view with an AppHeader hamburger and a drawer-hosted NavPanel.

Source check in `/Users/dotneteer/source/xmlui/xmlui/src/components/App/AppReact.tsx`
showed the old App computes `navPanelVisible` from the registered header,
registered NavPanel, layout, and `mediaSize.largeScreen`. On small screens with
an AppHeader, the inline NavPanel is hidden and a Sheet renders the NavPanel with
`inDrawer: true`. The old AppHeader renders a hamburger drawer toggle through
App layout context.

Rewrite changes:

- added a narrow-screen branch in `AppReact.tsx` using a guarded
  `shouldUseDrawerNavPanel` condition;
- skipped side/horizontal/condensed inline NavPanel rendering only in that
  branch;
- rendered a fixed left drawer with the NavPanel under a temporary vertical
  layout context so all App layout values share the same mobile drawer view;
- wired AppHeader's hamburger button to the App drawer state;
- added an explicit mobile AppHeader class so the hamburger remains visible in
  the rewrite testbed even when the old container-query screen-size state is not
  present;
- added a regression covering `vertical`, `vertical-sticky`,
  `vertical-full-header`, `horizontal`, `horizontal-sticky`, `condensed`,
  `condensed-sticky`, and `desktop` at 390px.

Live check on `http://localhost:5173/` at 390px:

- before opening the drawer: one visible hamburger, zero visible NavPanels;
- after clicking the hamburger: drawer state is `open`, one NavPanel is visible.

Second mobile follow-up:

- The original switches to hamburger mode through the tablet breakpoint
  (`maxWidth-tablet` / old `mediaSize.largeScreen === false`), so the rewrite
  narrow-screen query was widened from 767px to 991px.
- For mobile `scrollWholePage=true`, the App root remains the scroll container.
  The mobile branch now lets the main/pages/pageContent chain grow to content
  height instead of flexing to the remaining viewport, preventing an inner
  content/List scroller and keeping the footer below the viewport like the
  original screenshot.
- The AppHeader hamburger now renders the real themed `hamburger` icon centered
  in the drawer-toggle button instead of a hand-drawn span.
- A follow-up header geometry check matched the old project by setting the
  mobile drawer-toggle wrapper/button to `42px` and the hamburger button font
  size to `14px`: old/new both measure button `x=31,y=7,w=42,h=42`, icon
  `w=17,h=17`, and title `x=89`.
- Live check at 852px on `localhost:5173` matched the old geometry: content
  starts at `y=57`, visible inline NavPanel count is `0`, App is scrollable,
  content is not the active scroll container, and the footer starts below the
  viewport.

Third mobile follow-up:

- The old drawer uses the App `Sheet` left position, whose `.sheetContent.left`
  is `width: 100%`, `height: 100%`, and `max-width:
  var(--xmlui-maxWidth-drawer-App, 100%)`.
- The rewrite drawer panel now follows that shape: the panel spans the full App
  width on narrow screens, and the contained NavPanel is forced to `width: 100%`
  instead of shrink-wrapping to the link labels.
- The background click overlay is kept separate from the visible close button
  and marked `aria-hidden` so it does not become a second announced
  "Close navigation menu" control.
- The mobile drawer regression now asserts both the drawer dialog and NavPanel
  start at the App left edge and have the same width as the App.

Live check on `http://localhost:5173/` at 852px after opening the drawer:

- drawer dialog: `x=0`, `width=852`, `height=934`;
- NavPanel: `x=0`, `width=852`, `height=934`;
- close button: `x=812`, `y=8`, `width=32`, `height=32`;
- active Home link starts at the drawer left edge and spans the drawer width.

Fourth mobile follow-up:

- The user reported remaining mobile header/drawer differences: header
  positioning, drawer logo position, close icon shape, and missing drawer
  animation.
- Original source confirmed the drawer path is `App/Sheet.tsx` plus
  `Sheet.module.scss`, not a plain panel: the overlay uses 300ms blur
  animations, the sheet content uses 300ms slide-in/slide-out animations, and
  the close button renders `<ThemedIcon name="close" />` with 4px padding,
  0.7 opacity, and `$space-2` top/right offsets.
- Original `NavPanelReact.tsx` also confirmed drawer mode renders a dedicated
  `DrawerNavPanel` and marks the logo wrapper with `styles.inDrawer`, giving it
  a 32px minimum height to leave room for the close button.
- The rewrite drawer now keeps itself mounted for 300ms after close so the exit
  animation can run, applies App theme variables directly on the drawer host
  because the drawer is outside the App root, renders the themed close icon, and
  switches NavPanel to the drawer-specific logo wrapper when
  `AppLayoutContext.isNarrowScreen` is true.

Live localhost comparison at 852px after the fix:

- Header before opening: old/new header `x=15,y=0,w=822,h=57`, hamburger
  `x=31,y=7,w=42,h=42`, title `x=89,y=17,w=110,h=23`.
- Drawer after animation: old/new drawer `x=0,y=0,w=852,h=934` with a 300ms
  slide-in animation and `rgb(248, 250, 251)` background.
- Logo wrapper: old `x=0,y=20,w=851,h=56`; new `x=0,y=20,w=852,h=56`. Logo
  image: old/new `x=395,y=36,w=61,h=24`.
- Close icon box: old/new button `w=27.1875,h=35.1875`, SVG
  `w=19.1875,h=19.1875`, top `8px`, padding `4px`, opacity `0.7`. The new
  button remains 1px farther right than the old Radix button in this probe, but
  the icon, aspect ratio, top offset, padding, and opacity now match.

Fifth mobile follow-up:

- The user reported that the mobile AppHeader group was still visibly too far
  left in the docked-DevTools/narrow-pane screenshot, even though a plain
  headless viewport measured old/new header internals as equal.
- The fix is intentionally mobile-only: `.header.mobile .headerInner` now adds
  an explicit 14px to the normal AppHeader left padding. This moves
  the hamburger/title group right without touching wide-screen AppHeader
  layout.
- Live rewrite measurement at 842px after the correction:
  header `x=15,w=812,h=57`, header inner `padding-left=30px`, hamburger
  `x=45,y=7,w=42,h=42`, title `x=103,y=17,w=110,h=23`, and title remains
  `58px` to the right of the hamburger wrapper.
- The narrow App shell regression now asserts that corrected mobile header
  geometry before opening the drawer.

Sixth mobile follow-up:

- The user reported that clicking a NavLink inside the open hamburger drawer
  should close the drawer, with the same animated close state as the old
  project.
- Original App `useDrawerState` closes the Radix Sheet on route/layout changes;
  Radix keeps the content mounted in `data-state="closed"` while the old
  `slide-out-to-left` and `blur-out` animations run.
- The rewrite drawer now listens for anchor activation inside the drawer panel
  and calls the same `closeDrawer` state transition used by the close button and
  overlay. This is limited to `a[href]` so ordinary drawer buttons, such as
  expandable group headers, do not close the panel.
- The narrow App shell regression now opens the drawer, clicks `Page 1`, checks
  routed content updates, verifies the drawer enters `data-state="closed"` with
  `slide-out-to-left` and `blur-out` animations, then waits for the drawer to
  unmount after the animation window.

Seventh mobile follow-up:

- The user reported that, on narrow screens with short routed content, the
  original keeps the Footer stuck to the viewport bottom while the rewrite
  placed the Footer immediately after the short page body.
- The mobile `scrollWholePage=true` branch now uses `flex: 1 0 auto` for the
  main content area and pages container. This preserves the old long-content
  behavior where the App is the scroll parent, while letting short pages fill
  the remaining viewport height so the Footer sits at the bottom.
- A narrow App shell regression now renders a short page, verifies the App does
  not scroll, checks that the content area touches the Footer, and asserts the
  Footer bottom matches the App viewport bottom.

Eighth mobile follow-up:

- The user then reported that narrow `layout="vertical-full-header"` still let
  the header and footer scroll out with long content. The old mobile layout
  compatibility suite explicitly documents that narrow App layouts behave as
  sticky by default: the hamburger header and footer remain in the viewport
  while the App/root is the scroll owner.
- The rewrite mobile shell now keeps App-root `overflow:auto`, forces the
  AppHeader/Footer wrappers sticky in the mobile branch, and keeps the middle
  content wrappers in natural-height/visible-overflow mode for
  `scrollWholePage=true`. This keeps the fix mobile-only and avoids changing
  the normal wide-screen layout behavior.
- The earlier narrow horizontal scroll-parent regression was updated to the old
  mobile contract, and a new narrow `vertical-full-header` regression verifies
  that long content scrolls through the App while the header and Footer stay
  pinned before and after scrolling.

Ninth mobile follow-up:

- The user then found that the pinned mobile `vertical-full-header` shell still
  showed wrong scroll ownership around a `List`. The cause was the rewrite still
  bounding the middle content/page wrappers to the viewport height in the mobile
  branch, which created nested scroll candidates instead of the old full-height
  content stack.
- The mobile `scrollWholePage` branch now lets the main content/pages/page
  wrappers grow to their routed content height and mirrors the desktop
  outside-scroll rule for contained default Lists: `overflow: visible`,
  `flex: 0 1 auto`, and `min-height: 0`. The App/root owns scrolling, so
  App/Page vertical padding moves with the content instead of becoming nested
  scroll chrome.
- The narrow `vertical-full-header` regression now uses a real `List` + `Card`
  template and asserts the App scrolls, the middle content pane and List do not,
  and sticky header/footer positions remain fixed.

Tenth mobile follow-up:

- The user reported that after restoring App/root scroll ownership, the narrow
  sticky Footer appeared transparent while routed content scrolled underneath
  it.
- The mobile footer wrapper is now explicitly painted with the Footer background
  token. This is needed because the mobile branch makes the wrapper itself
  sticky; relying only on the nested `Footer.outerWrapper` background can leave
  the sticky overlay layer visually transparent.
- Narrow mobile regressions now assert the sticky footer wrapper background is
  not transparent while the App scrolls.

Eleventh App follow-up:

- The user reported a wide `vertical-full-header` regression where the side
  NavPanel content shifted upward when the App scroll position approached the
  bottom.
- The original App stylesheet flexes the first child inside `.navPanelWrapper`
  (`flex: 1; min-height: 0;`). The rewrite had lost that rule while rebuilding
  the shell, so the sticky wrapper and NavPanel child could diverge at bottom
  scroll.
- Restored the old wrapper child flex rule and expanded the
  `vertical-full-header default scroll keeps chrome pinned and does not scroll
  the List` regression to use a 2048x1050 viewport, 40 rows, partial and bottom
  scroll positions, wrapper/NavPanel top alignment, and first NavLink offset
  stability.

## Verification Already Run

Passed:

```bash
npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts
npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts src/components/Pages/Pages.spec.ts
npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts -g "narrow screens move every layout NavPanel"
npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts -g "narrow"
npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts -g "narrow screens move every layout NavPanel"
npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts src/components/Pages/Pages.spec.ts
npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts -g "narrow screens move every layout NavPanel"
npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts src/components/Pages/Pages.spec.ts
npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts -g "narrow (horizontal default|short pages)"
npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts src/components/Pages/Pages.spec.ts
npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts -g "narrow (horizontal default|vertical-full-header|short pages)"
npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts src/components/Pages/Pages.spec.ts
npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts -g "narrow vertical-full-header"
npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts -g "narrow (horizontal default|vertical-full-header|short pages)"
npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts src/components/Pages/Pages.spec.ts
XMLUI_INCLUDE_INCOMPLETE_COMPAT=1 npm --workspace xmlui run test:e2e -- src/components/App/App.spec.ts -g "content spacing theme variables control App default content padding and gap"
npx tsc -p xmlui/tsconfig.build.json --noEmit
npx vitest run src/components/App/App.spec.tsx
npm --prefix xmlui run check:metadata
npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts -g "vertical-full-header default scroll"
npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts -g "narrow (horizontal default|vertical-full-header|short pages)"
npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts src/components/Pages/Pages.spec.ts
npx tsc -p xmlui/tsconfig.build.json --noEmit
npm --prefix xmlui run check:metadata
git diff --check
```

Latest focused App/Pages run passed 24/24 after the wide
`vertical-full-header` NavPanel bottom-scroll fix.
During the earlier drawer-width run, the vertical sidebar width assertion was
made tolerant around the two old-compatible pixel values observed under
parallel Playwright scheduling, while still requiring the logo wrapper and link
widths to match.

## Files In The Stash

The stash should contain, among other dirty files:

- `.plans/component-remigration.md`
- `sample/src/Main.xmlui`
- `sample/src/config.ts`
- `sample/public/resources/xmlui-logo.svg`
- `sample/public/resources/xmlui-logo-dark.svg`
- `xmlui/src/components-core/utils/css-utils.ts`
- `xmlui/src/components/App/*`
- `xmlui/src/components/AppHeader/*`
- `xmlui/src/components/NavLink/*`
- `xmlui/src/components/NavPanel/*`
- `xmlui/src/components/Pages/*`
- `xmlui/src/runtime/startApp.tsx`
- `xmlui/src/ssg/ssgEntry.ts`

## Likely Next Step

Wait for the user's testing feedback. If they report more visual mismatches,
compare old/new local servers and inspect the original source in
`/Users/dotneteer/source/xmlui`.

If the user approves the app shell/navigation/page family, update
`.plans/component-remigration.md` to mark the affected components complete, then
continue to the next component according to the plan.

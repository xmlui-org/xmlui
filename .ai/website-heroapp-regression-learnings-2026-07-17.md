# Website HeroApp Regression Learnings - 2026-07-17

## Context

The old site at `http://localhost:5173/` and the rewrite at
`http://localhost:5174/` were compared for the landing-page `HeroApp` embedded
through an `xmlui-pg` fenced code block. The user reported that the new app's
`SpaceFiller` between `Our Team` and `ToneSwitch` was visually wider than the
old app, despite earlier headless checks appearing to show parity.

## Important Debugging Lesson

When the user reports a visual mismatch from their browser and headless
Playwright does not reproduce it, do not treat the headless result as
authoritative. Attach to the user's actual browser/tab when possible and measure
the live DOM there.

In this session, the live Chrome tab exposed the true regression:

- old `5173` Chrome tab: `SpaceFiller` width was `597.99px`;
- new `5174` Chrome tab before the final fix: `SpaceFiller` width was
  `625.987px`;
- new `5174` Chrome tab after the final fix: `SpaceFiller` width returned to
  `597.99px`.

Chrome automation workflow used:

1. Read active tab URL:
   `osascript -e 'tell application "Google Chrome" to get URL of active tab of front window'`
2. If Chrome rejects JavaScript execution, ask the user to enable:
   `View > Developer > Allow JavaScript from Apple Events`.
3. Use AppleScript `execute javascript` against the relevant `localhost:5174`
   tab to measure bounding boxes and computed styles.

## Root Cause

The apparent `SpaceFiller` width difference was not caused by the spacer's own
CSS after its DOM shape was fixed. It was caused by an App-level layout rule in
the new implementation:

```scss
&:not(.verticalFullHeader) {
  > .headerWrapper > div,
  > .headerWrapper nav > div,
  > .footerWrapper > div {
    width: 100%;
    max-width: var(--xmlui-maxWidth-content, 1280px);
    margin-inline: auto;
  }
}
```

`AppHeader` uses `box-sizing: content-box` and horizontal padding. Forcing
`width: 100%` onto the padded AppHeader root made the root overflow the header
wrapper by about 28px, which expanded the AppHeader content area and made the
flex spacer larger.

The compatibility fix was to remove the App-level selectors that target
`> .headerWrapper > div` and `> .headerWrapper nav > div`, leaving AppHeader to
own its own width and padding behavior as in the old implementation. Keep the
footer selector unless separately proven incompatible.

## Related Fixes From This Session

- `SpaceFiller` runtime renderer should match the old classic renderer:
  render a bare `<SpaceFiller />` and ignore props/root attrs. The expected DOM
  is a simple `<div class="_spacer_..."></div>` with no
  `data-xmlui-component` and no `xmlui-SpaceFiller` class.
- Nested apps should not inherit outer app logo resources. Normalize nested
  resources so `logo`, `logo-light`, and `logo-dark` default to empty strings
  unless explicitly supplied in the nested config.
- Markdown heading styles can leak into nested XMLUI app content. Nested app
  headings inside markdown need to reset to normal XMLUI heading theme vars so
  Card title spacing matches the old site.
- Extension components must not forward XMLUI layout props such as
  `marginBottom` to native DOM elements. Convert/use layout props for layout
  style, then strip them from React component props. This fixed the
  `ScrollToTop marginBottom` React warning.

## Regression Tests Added

Focused verification command:

```bash
npm --workspace xmlui run test:e2e -- src/components/NestedApp/NestedApp.spec.ts src/components/SpaceFiller/SpaceFiller.spec.ts tests/e2e/extension-layout-props.spec.ts
```

Expected result at the time of writing: `22 passed`.

Important assertions:

- `NestedApp.spec.ts` checks that the HeroApp nested AppHeader does not show a
  leaked logo, `SpaceFiller` is bare DOM, Card title margins are zero, and the
  AppHeader root does not overflow its wrapper.
- `tests/e2e/extension-layout-props.spec.ts` checks that
  `<ScrollToTop marginBottom="$space-4" />` does not forward `marginBottom` to
  its native button and does not emit the React unknown-prop warning.

## Compatibility Principle

For visual parity work, compare the original source and live browser DOM before
adding theme/page-specific workarounds. The correct fix here was a framework
layout compatibility change, not a HeroApp theme override or a SpaceFiller
spacing hack.

## Later Landing-Page Data Regression

The homepage Tube examples (`live status of London tube lines` and
`Watch the table reactively update when lines.value changes`) stopped showing
data even though isolated `Table`, `List`, and `Items` data tests still passed.
The important composition lesson: homepage `xmlui-pg` samples are sibling
`NestedApp` instances, so a global runtime service mutation in one sample can
break another sample.

Root cause found on 2026-07-17:

- `NestedApp` installed a global `managedFetchService` adapter when a playground
  sample had an `api` block.
- The nested mock adapter threw `404 Not Found` for every unrecognized URL,
  including absolute external URLs such as `https://api.tfl.gov.uk/...`.
- A mock API sample such as HeroApp could therefore intercept sibling Tube
  examples using centralized `data="https://..."` handling.

Compatibility fix:

- Do not touch `Select` or `Table` for this class of failure.
- Keep centralized `data` handling intact.
- Make the nested API adapter handle only requests inside its declared `apiUrl`
  namespace and delegate all other requests to the previous/default managed
  fetch adapter.

Useful regression shape:

- Mount two sibling `NestedApp` instances.
- First sibling has a playground mock API under `/api`.
- Second sibling has a `Table data="https://api.example.test/..."`.
- Verify both the mock `/api` data and the external URL data render.

Live Chrome verification after the fix showed the simple Tube table populated
with rows including `Bakerloo`, `Central`, `Good Service`, and `Minor Delays`,
and the reactive sample populated with station rows.

## Select Default Width Regression

Another landing-page parity issue in the reactive Tube sample was that the
`Select` shrink-wrapped to its selected value in the rewrite, while the old site
rendered it full-width.

Important source-of-truth check:

- Old source:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/Select/Select.module.scss`
  had `.selectTrigger { width: 100%; }`.
- Rewrite source had `.selectTrigger { width: fit-content; }`.

Compatibility fix:

- Restore `.selectTrigger { width: 100%; }` in the rewrite stylesheet.
- Keep authored widths working through the existing inline `style` path, so
  `width="180px"` still overrides the stylesheet default.

Useful regression tests:

- A default `Select` inside a fixed-width container should match the available
  container width.
- A `Select` with an authored `width` should honor that explicit width.

Live Chrome verification after the fix measured the reactive sample combobox at
about `741.82px`, matching the available content width inside its padded nested
app page container, rather than the selected label's intrinsic width.

## Docs Page Markdown And NavPanel Regression

On `/docs`, the rendered markdown paragraph text in the main content panel
turned black in the rewrite while the old site used the website text color
`rgb(99, 98, 106)`. Live DOM showed the markdown wrapper already had the right
color; the paragraph rendered through `Text variant="paragraph"` overrode it.
The compatibility fix was localized to `Markdown.module.scss`: markdown
paragraph text should inherit the markdown content color.

The docs nav top spacing regression was not caused by padding. The website app
uses `layout="vertical-full-header"` and supplies a `NavPanel` `logoTemplate`,
but the old runtime only rendered the NavPanel logo for `vertical` and
`vertical-sticky` layouts. The rewrite rendered any available logo content,
creating one AppHeader-height of empty-looking space above the nav items. Keep
`NavPanel` logo rendering limited to the old `vertical` and `vertical-sticky`
layouts.

Live Chrome measurements after the fix:

- First docs nav item `Learn XMLUI`: old `y=59.91`, new `y=59.91`.
- First markdown paragraph color: old `rgb(99, 98, 106)`, new
  `rgb(99, 98, 106)`.

## Docs Reference IncludeNavSection Regression

On `/docs`, the `Reference` `NavGroup` should include generated sections from:

- `<IncludeNavSection sectionId="components" />`
- `<IncludeNavSection sectionId="extensions" />`

The old DOM under the `Reference` group contains `Components` followed by the
component entries, and later `Extensions` followed by extension entries. The
rewrite initially rendered only the literal children after the placeholders
(`Themes`, etc.) because the active renderer path registered
`IncludeNavSection` as a null component.

Important implementation detail:

- The active rewrite renderer is `navPanelRuntimeRenderer` in
  `xmlui/src/components/NavPanel/NavPanel.tsx`, imported by
  `component-core/runtimeRegistry.ts`.
- `xmlui/src/components/NavPanel/NavPanel.renderer.tsx` and the legacy
  `navPanelRenderer`/`ComponentProvider` compatibility path are not the path
  used by the website runtime here.

Compatibility fix:

- Expand `IncludeNavSection` nodes inside `navPanelRuntimeRenderer` before
  calling `adapter.context.renderChildren`.
- Use `appGlobals.navSections[sectionId]` and convert its JSON items into
  runtime `NavGroup`/`NavLink` nodes.

Live Chrome verification after the fix:

- Old and new `Reference` group DOM both contain `Components`.
- Old and new `Reference` group DOM both contain `Extensions`.
- In both old and new, `Components` starts at index `10` and `Extensions`
  starts at index `1011` within the normalized `Reference` group text.

## Docs Component Reference 404 Regression

The docs component pages use a parameterized route:

- `Page url="/docs/reference/components/:compId"`

The page-local `<script>` block derives `contentKey` from
`$routeParams.compId`, then reads `appGlobals.docsContent[contentKey]`. In the
runtime renderer, `<script>` declarations are stored as local variables on the
`Page` element itself. Rendering only `matched.page.children` skips those local
variables, so `content` stays undefined and the docs page redirects to `/404`.

Compatibility fix:

- Runtime `Pages` rendering must preserve the matched `Page` element's local
  scope before rendering its children. A scoped synthetic `Fragment` carrying
  the matched page's `vars`/`parsed.vars` is enough and avoids adding wrapper
  DOM.
- `readRouteContext` must not synthesize `{}` for `$routeParams` before parent
  context lookup. Otherwise nested local scopes cannot inherit route params
  supplied by the matched page route scope.

Useful regression test:

- A `Page url="/docs/reference/components/:compId"` whose script derives
  `content` from `$routeParams.compId` and `appGlobals.docsContent` should make
  that page-local `content` visible to child `when` expressions and text.

## NestedApp Host Separation Regression

Old XMLUI playground/nested apps render the live nested app into an open shadow
root. The frame/header controls stay in the host document, but the nested XMLUI
runtime, its component DOM, and injected dynamic styles live behind that
boundary. This prevents host layout/theme rules from leaking into the nested
app and prevents nested app layout rules from becoming part of the host DOM.

The rewrite initially rendered `XmluiRoot` directly in the host DOM. On docs
pages such as `/docs/reference/components/App`, layout examples like
`Example: 'horizontal' layout` then showed serious separation problems:
host-page sizing and nested app layout interacted, and the host DOM contained
the nested `App` tree inline.

Compatibility fix:

- Restore an open shadow-root host inside `NestedApp` for the live runtime view.
- Copy readable document stylesheets into the shadow root, preserving the
  XMLUI layer declaration.
- Wrap the nested `XmluiRoot` with `StyleInjectionTargetContext.Provider` so
  runtime-generated dynamic styles are injected into the shadow root instead of
  `document.head`.
- Keep the frame shell and code view in the host DOM; only the live app view
  needs the shadow boundary.

Useful verification:

- Live DOM should show one shadow host per rendered `NestedApp`.
- `NestedApp` light DOM should not contain inline
  `[data-xmlui-component="App"]` descendants.
- Playwright locators can pierce open shadow roots, but manual
  `element.querySelector(...)` in tests cannot. Tests that inspect nested app
  internals from host elements should explicitly traverse `shadowRoot`.

Follow-up TOC isolation issue:

- React context crosses portals even when DOM is isolated by an open shadow
  root. Without an explicit context reset, nested `Heading` components can
  still see the host `TableOfContentsProvider` and register nested headings in
  the host docs TOC.
- `NestedApp` must wrap the portal content with
  `TableOfContentsContext.Provider value={null}` to match the old separate
  React-root behavior.
- Live verification on `/docs/reference/components/App` should show nested
  headings such as `Horizontal Splitter Example` absent from
  `nav[aria-label="Table of Contents"]`.

## TableOfContents Hover Font Weight Regression

Old `TableOfContents` declares hover font-weight theme variables, but the
default value for `fontWeight-TableOfContentsItem--hover` is `null`/unset. The
new metadata briefly added a default of `$fontWeight-bold`, which made hovered
TOC items look heavier on the website.

Compatibility fix:

- Keep the hover font-weight theme variable declared so explicit theme
  overrides still work.
- Do not add `fontWeight-TableOfContentsItem--hover` to
  `TableOfContentsMd.defaultThemeVars`.
- Regression coverage should verify both paths: default hover keeps the
  pre-hover computed font weight, and an explicit
  `fontWeight-TableOfContentsItem--hover` override still applies.

Verification caution:

- The docs left navigation can look like a TOC during DOM queries. When
  checking this regression, target the actual `TableOfContents` rendered by the
  page or a focused component test, not arbitrary `nav`/anchor fallbacks.

## NavGroup Group-Level Route Regression

Old XMLUI supports `NavGroup` entries with their own `to` target. In the docs
site, `Guides` uses `to="/docs/guides"` and the matching page route renders
`<Overview />`, which dynamically shows cards for the nested guide pages. There
is no hidden special-case card rendering in the old NavGroup; the important
behavior is that clicking the group header both toggles the group and navigates
through XMLUI routing.

Compatibility fix:

- Runtime `NavGroup` must use `scope.routing.navigate(to)` for internal group
  targets, just like runtime `NavLink` does.
- A browser-only URL change is insufficient: `Pages` subscribes to XMLUI's
  runtime routing store, so relying on the default React Router link path can
  leave the old page content mounted while the address bar changes.
- Preserve the existing mobile behavior: NavGroup headers toggle only on mobile
  and do not navigate.

Useful verification:

- Reproduce the website flow: open `/docs`, click `Reactive Data`, then click
  `Guides`. The URL should become `/docs/guides`, the `Reactive data binding`
  content should disappear, and the guide overview cards such as `App
  Structure`, `Markup`, and `Scripting` should be present.

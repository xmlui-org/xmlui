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

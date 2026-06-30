# App Shell Navigation Compatibility Closure - 2026-06-29

## Scope

Batch implemented for user approval:

- `App`
- `AppHeader`
- `Footer`
- `Logo`
- `NavLink`
- `NavGroup`
- `NavPanel`

Spinner was also moved to `Approved complete` after user confirmation.

## Source Of Truth

Primary reference checkout:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/App`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/AppHeader`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Footer`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Logo`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavLink`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavGroup`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavPanel`

Original stylesheets were restored for the shell/navigation components where the rewrite component already uses direct CSS module imports:

- `AppHeader.module.scss`
- `Footer.module.scss`
- `NavLink.module.scss`
- `NavGroup.module.scss`
- `NavPanel.module.scss`

## Implementation Notes

- Added `AppLayoutContext` so App-level layout, logo, drawer, collapsed nav panel, and sub-nav slot state can be shared with `AppHeader`, `NavPanel`, `Footer`, and `Logo`.
- Kept the current rewrite `App` shell renderer but added old-compatible context/event behavior: document title, i18n config, `ready`, `messageReceived`, key events, and routing navigation hooks.
- Restored old class contracts for `NavLink`, `NavGroup`, and `NavPanel` at the renderer boundary instead of replacing component visuals with inline styles.
- `Footer` now uses the old outer/content wrapper shape and exposes the content part marker expected by foundation tests.
- `Logo` uses App/AppHeader logo lookup and wraps inline logos in an inline span. This avoids browser flex-item blockification so the image itself computes as `display: inline`, matching the old Image inline bridge.
- `AppHeader` provides `useLogoUrl()` for App-level `logo`, `logoDark`, and `logoLight` fallback lookup.

## Verification

Passed:

- `npm --workspace xmlui run test:e2e -- src/components/Logo/Logo.spec.ts --workers=1`
- `npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts src/components/App/App-script-imports.spec.ts --workers=1`
- `npm --workspace xmlui run test:e2e -- src/components/NavLink/NavLink.spec.ts src/components/NavLink/NavLink.foundation.spec.ts src/components/NavGroup/NavGroup.spec.ts src/components/NavGroup/NavGroup.foundation.spec.ts src/components/NavPanel/NavPanel.spec.ts src/components/NavPanel/NavPanel.foundation.spec.ts src/components/AppHeader/AppHeader.spec.ts src/components/AppHeader/AppHeader.foundation.spec.ts src/components/Footer/Footer.spec.ts src/components/Footer/Footer.foundation.spec.ts src/components/Logo/Logo.spec.ts src/components/App/App-shell.spec.ts --workers=1`
  - Result: 62 passed, 131 skipped.
- `npx tsc -p xmlui/tsconfig.build.json --noEmit`
- `npm --prefix xmlui run check:metadata`
- `npm --workspace xmlui run compatibility:css-module-import-audit -- --components=NavLink,NavGroup,NavPanel,AppHeader,Footer,Logo,App`
- `XMLUI_INCLUDE_INCOMPLETE_COMPAT=1 XMLUI_REUSE_DEV_SERVER=0 npm --workspace xmlui run test:e2e -- src/components/App/App.spec.ts -g "content spacing|Drawer displayed|NavPanel appears|NavPanel visibility updates|complex when expression" --workers=1`
  - Result after fixes: 6 passed, 1 failed. The passing cases cover drawer display and NavPanel `when` reactivity. The remaining failure is `content spacing theme variables control App default content padding and gap`.
- `npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts src/components/Pages/Pages.spec.ts`
  - Result after the 2026-06-30 `vertical-full-header` content inset fix: 17 passed.
- `XMLUI_INCLUDE_INCOMPLETE_COMPAT=1 npm --workspace xmlui run test:e2e -- src/components/App/App.spec.ts -g "content spacing theme variables control App default content padding and gap"`
  - Result after the 2026-06-30 `vertical-full-header` content inset fix: 1 passed.
- `npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts src/components/Pages/Pages.spec.ts`
  - Result after the 2026-06-30 horizontal NavPanel height fix: 18 passed.
- `npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts src/components/Pages/Pages.spec.ts`
  - Result after the 2026-06-30 horizontal-sticky measured header offset fix: 18 passed.
- `npx tsc -p xmlui/tsconfig.build.json --noEmit`
  - Result after the 2026-06-30 horizontal-sticky measured header offset fix: passed.
- `npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts src/components/Pages/Pages.spec.ts`
  - Result after the 2026-06-30 desktop scroll shell fix: 19 passed.
- `npm --prefix xmlui run check:metadata`
  - Result after the 2026-06-30 desktop scroll shell fix: passed.
- `npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts -g "desktop layout hides NavPanel"`
  - Result after the 2026-06-30 desktop List outside-scroll fix: 1 passed.
- `npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts -g "desktop layout hides NavPanel"`
  - Result after the 2026-06-30 desktop scrollWholePage gutter cancellation fix: 1 passed.
- `npx tsc -p xmlui/tsconfig.build.json --noEmit`
  - Result after the 2026-06-30 desktop scrollWholePage gutter cancellation fix: passed.
- `npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts src/components/Pages/Pages.spec.ts`
  - Result after the 2026-06-30 desktop scrollWholePage gutter cancellation fix: 19 passed.
- `npm --prefix xmlui run check:metadata`
  - Result after the 2026-06-30 desktop scrollWholePage gutter cancellation fix: passed.
- `npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts -g "vertical layouts with scrollWholePage false"`
  - Result after the 2026-06-30 vertical scrollWholePage=false clamp fix: 1 passed.
- `npx tsc -p xmlui/tsconfig.build.json --noEmit`
  - Result after the 2026-06-30 vertical scrollWholePage=false clamp fix: passed.
- `npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts src/components/Pages/Pages.spec.ts`
  - Result after the 2026-06-30 vertical scrollWholePage=false clamp fix: 20 passed.
- `npm --prefix xmlui run check:metadata`
  - Result after the 2026-06-30 vertical scrollWholePage=false clamp fix: passed.

Attempted but stopped:

- `npm --workspace xmlui run compatibility:component-e2e-audit -- --expanded=NavLink,NavGroup,NavPanel,AppHeader,Footer,Logo,App`
  - The audit hung while expanding the old App layout suite through Playwright `--list`. No failure output was produced; the command was interrupted.

## Residual Risk

- The current `App` renderer is still the rewrite shell bridge, not a literal old App source copy. It passes the active shell tests, but the large old App layout suites remain behind the current compatibility filter.
- The earlier expanded App content-spacing failure was fixed by later App theme-variable work and rechecked on 2026-06-30. The remaining App layout suites are still mostly behind the compatibility filter.
- `height-AppHeader` is intentionally not defaulted by App or NavPanel. Explicit theme overrides can still provide it, but default horizontal NavPanel height should come from rendered link content.
- Horizontal-sticky NavPanel wrapper positioning should use measured `--app-header-height`; otherwise a header border can make the sticky bar overlap the header by 1px after scrolling.
- Desktop layout should not render NavPanel. The App root owns the viewport, but routed `pageContent` owns scrolling so header and footer remain visible.
- In desktop layout, Lists without an explicit scroll height should participate in the routed `pageContent` outside scroll. If the List becomes its own scroller, Page vertical padding remains visible as a permanent band around the List after scrolling.
- In desktop layout with default `scrollWholePage=true`, desktop must cancel the generic header/footer scrollbar-gutter compensation. AppHeader and Footer outer wrappers stay viewport-width with zero padding; their inner content keeps the normal centered content band.
- In vertical and vertical-sticky layouts with `scrollWholePage=false`, the App root is viewport-clamped and clipped, the main content area must not become a guttered scroller, and pages/pageContent own the bounded clipping region.
- `NavGroup` horizontal/dropdown behavior is bridged through the rewrite navigation structure and active tests, not fully reimplemented from the old App layout source.
- The focused batch had 131 skipped tests, representing already-known transferred old-suite debt rather than new failures from this batch.

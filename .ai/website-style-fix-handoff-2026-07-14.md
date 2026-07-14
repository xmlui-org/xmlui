# Website Styling Fix Handoff - 2026-07-14

Use this note to continue old/new website styling parity work.

## Context

- Old website dev server: `http://localhost:5173/`
- New website dev server: `http://localhost:5174/`
- The local dev servers are available for DOM/computed-style inspection. Compare old and new by querying computed styles and CSS variables in the browser, not by guessing from source.
- The user is showing a few styling deviations at a time. Fixes must preserve old XMLUI behavior.

## Guardrails

- Do not change website source/content/theme files to fix styling, except website startup code when needed.
- Styling/theming fixes should live in XMLUI core or extension packages used by the website.
- Component visual styling should live in component `.module.scss` files and CSS classes. Avoid injected `<style>` components and avoid React-computed inline visual styles unless genuinely dynamic.
- If a fix requires changing theming core, explicitly tell the user because it can introduce future compatibility risk.
- Keep summaries concise and explicitly say which reported issues are fixed.

## Current Learnings

Read `.ai/website-style-fix-learnings-2026-07-14.md` before making further changes. It records reusable findings from this styling parity session, including:

- website config/default theme propagation;
- extension theme metadata registration;
- nested app theme isolation;
- App/AppHeader layout compatibility;
- search package themed authoring exports;
- the rename from `LegacyThemeProvider`/`oldThemeCompiler` to `XmluiThemeProvider`/`themeCompiler`.

## Work Already Done In This Session

- Fixed website theme propagation through startup/core so the new site uses `xmlui-website-theme`.
- Fixed header/main divider width by moving App horizontal band styling into `App.module.scss`.
- Fixed search box/header sizing deviations through core and extension theming paths.
- Removed the injected `HorizontalAppBandStyle` component.
- Renamed active theme infrastructure:
  - `LegacyThemeProvider` -> `XmluiThemeProvider`
  - `oldThemeCompiler.ts` -> `themeCompiler.ts`
  - `compileOldThemeModel` -> `compileThemeModel`
  - provider/compiler tests renamed accordingly.
- Removed migration-only old theme shadow/canary scaffolding and tests.
- Added website-local placeholder E2E script/spec so root `npm run test:e2e` no longer fails because `website` lacks `test:e2e`.

## Useful Verification Commands

- Focused website parity:
  `npx playwright test xmlui/tests/e2e/website-route-parity.spec.ts xmlui/tests/e2e/website-theme-parity.spec.ts --config=xmlui/playwright.config.ts --retries=1`
- Website workspace placeholder:
  `npm --workspace xmlui-website run test:e2e`
- Unit tests:
  `npm --workspace xmlui run test`
- Root E2E:
  `npm run test:e2e`

## Verification From Latest Session

- Focused theming tests: 26 passed.
- Unit tests: 312 passed.
- Core E2E: 5579 passed, 83 skipped.
- Extension package E2E: 577 passed.
- Website parity E2E: 4 passed.
- Website placeholder E2E: 1 passed.

## Notes For Next Styling Issue

1. Reproduce the visual difference in old and new using the local dev servers.
2. Inspect DOM and computed styles, especially `--xmlui-*` variables.
3. Identify whether the difference is caused by:
   - missing app config/default theme;
   - missing extension metadata/default theme vars;
   - component stylesheet/layout class mismatch;
   - nested app/provider leakage;
   - Vite stale optimized dependency cache.
4. Fix in core or extension packages, not website content.
5. Add or update focused parity tests when the issue is compatibility-sensitive.

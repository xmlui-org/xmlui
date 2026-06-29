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

Attempted but stopped:

- `npm --workspace xmlui run compatibility:component-e2e-audit -- --expanded=NavLink,NavGroup,NavPanel,AppHeader,Footer,Logo,App`
  - The audit hung while expanding the old App layout suite through Playwright `--list`. No failure output was produced; the command was interrupted.

## Residual Risk

- The current `App` renderer is still the rewrite shell bridge, not a literal old App source copy. It passes the active shell tests, but the large old App layout suites remain behind the current compatibility filter.
- Expanded App verification still has one known failure: root-App `testThemeVars` for content padding/gap do not reach the App content wrapper, so `App.spec.ts`'s content-spacing test reports `0px`/`0px`/`0px` instead of `28px`/`32px`/`24px`.
- `NavGroup` horizontal/dropdown behavior is bridged through the rewrite navigation structure and active tests, not fully reimplemented from the old App layout source.
- The focused batch had 131 skipped tests, representing already-known transferred old-suite debt rather than new failures from this batch.

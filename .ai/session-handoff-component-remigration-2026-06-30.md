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
  - Adds horizontal content inset for `vertical-full-header` parity.

- `App.tsx`
  - Added `height-AppHeader` default so App-level styles can provide the
    fallback height consumed by layout CSS.

- `App-shell.spec.ts`
  - Added regression test:
    `vertical-full-header default scroll keeps chrome pinned and does not scroll the List`.

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

## Verification Already Run

Passed:

```bash
npm --workspace xmlui run test:e2e -- src/components/App/App-shell.spec.ts
npx tsc -p xmlui/tsconfig.build.json --noEmit
npx vitest run src/components/App/App.spec.tsx
npm --prefix xmlui run check:metadata
```

The App shell suite passed 11/11, including the new
`vertical-full-header` scroll-owner regression.

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

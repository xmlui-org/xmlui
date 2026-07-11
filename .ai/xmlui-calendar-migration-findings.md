# xmlui-calendar Migration Findings

Date: 2026-06-27

## Source Baseline

Old package: `/Users/dotneteer/source/xmlui/packages/xmlui-calendar`

Relevant old files inspected:

- `package.json`
- `src/index.tsx`
- `src/CalendarWrapped.tsx`
- `src/CalendarRender.tsx`
- `src/Calendar.module.scss`
- `meta/componentsMetadata.ts`

No old package E2E spec was found for `xmlui-calendar`.

The old package registers a `BigCalendar` component with `wrapComponent`, uses
`react-big-calendar` plus the Day.js localizer, imports
`react-big-calendar/lib/css/react-big-calendar.css`, and injects scoped runtime
theme CSS from XMLUI theme variables.

## Migrated Workspace Files

- `packages/xmlui-calendar/package.json`
- `packages/xmlui-calendar/tsconfig.json`
- `packages/xmlui-calendar/src/index.tsx`
- `packages/xmlui-calendar/src/CalendarWrapped.tsx`
- `packages/xmlui-calendar/src/CalendarRender.tsx`
- `packages/xmlui-calendar/src/Calendar.module.scss`
- `packages/xmlui-calendar/src/xmlui-public.d.ts`
- `packages/xmlui-calendar/src/vite-env.d.ts`
- `packages/xmlui-calendar/meta/componentsMetadata.ts`

Website wiring:

- `website/package.json`
- `website/index.ts`
- `website/xmlui.config.json`
- `website/src/Main.xmlui`

## Compatibility Notes

- The package name is `xmlui-calendar`, but the public component name is
  `BigCalendar`.
- The old package sets `captureNativeEvents: true`, and `CalendarRender` calls
  `onNativeEvent` for select, navigate, and view changes. The current rewrite
  compatibility layer accepts this option but does not yet implement the full
  native-event trace plumbing.
- `CalendarRender` calls `registerComponentApi`, but the old wrapper only
  passes that prop when `exposeRegisterApi` is set. The old package does not set
  it, so API exposure remains a follow-up rather than a display blocker.
- `react-big-calendar` did not provide declarations in the installed package,
  so the package-local `vite-env.d.ts` includes a focused module declaration.

## Verification

Passing commands:

- `npm --workspace xmlui-calendar run build`
- `npm --workspace xmlui-calendar run build:metadata`
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui-website run build`
- `npm --workspace xmlui-calendar run test:e2e`

2026-07-11 remigration audit:

- `src/CalendarRender.tsx`, `src/CalendarWrapped.tsx`, `src/index.tsx`,
  `src/Calendar.module.scss`, and `meta/componentsMetadata.ts` diff clean
  against `/Users/dotneteer/source/xmlui/packages/xmlui-calendar`.
- The package E2E spec is rewrite-added coverage because the old package has no
  copied spec. It asserts rendered `react-big-calendar` DOM and visible
  behavior rather than requiring `testId` forwarding from `CalendarRender`,
  because the copied old implementation does not forward arbitrary DOM props.

Manual browser smoke at `http://localhost:5173/#/docs`:

- `Calendar extension check` renders.
- One `.rbc-calendar` container and one `.rbc-month-view` mount.
- `Migration Standup`, `Visual Check 0`, and `Calendar shift: 0` render
  initially.
- Clicking `Advance calendar smoke` changes visible text to
  `Visual Check 1` and `Calendar shift: 1`.
- Browser console error log is empty after the smoke.

Known verification noise:

- Sass deprecation warnings from the copied old `_themes.scss` helper.
- Large bundle warnings from the combined website build.

## Follow-Up

- Add website-level coverage for event rendering and toolbar view changes.
- Implement and test native-event capture for calendar select/navigate/view
  events.
- Decide whether the package should opt into `exposeRegisterApi` or whether API
  registration should remain intentionally unavailable for compatibility.

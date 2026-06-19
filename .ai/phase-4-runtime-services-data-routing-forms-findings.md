# Phase 4 Runtime Services, Data, Routing, and Forms Findings

Date: 2026-06-19

## Old Source Anchors

- `/Users/dotneteer/source/xmlui/xmlui/src/components/DataSource`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/APICall`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Form`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/FormItem`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Pages`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/NavLink`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/App`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/howto/show-toast-notifications-from-code.md`

## Implemented Slice

- Added an app-scoped toast runtime service exposed to compiled handlers as the
  `toast` reference.
- Implemented the documented `toast()`, `toast.success()`, `toast.error()`,
  `toast.loading()`, and `toast.dismiss()` surface for the current experiment.
- Added a root-level managed toast host so apps can show notifications without
  adding toast markup.
- Added the `runtimeToast` example, which mutates app state and shows, replaces,
  and dismisses toasts from compiled event handlers.
- Added `compatibility:runtime-artifact`, producing:
  - `xmlui/.compatibility-report/runtime-artifact-latest.json`
  - `xmlui/.compatibility-report/runtime-artifact-latest.md`
- Added the runtime artifact command to `compatibility:sweep`.

## Deferred Compatibility

- Full form context, validators, binding, dirty/touched state, server errors,
  accessibility feedback, and nested form behavior remain open.
- Full DataSource/APICall request builders, upload/download, cancellation,
  stale-response handling, tracing, inspector hooks, and optimistic/paging
  behavior remain open.
- Confirmations, modals, queues, timers, event sources, websockets, lifecycle,
  i18n, audit, accessibility, and inspector/devtools services remain open.
- App shell navigation regions, mobile shell, search/index collection, page
  metadata, config loading, route guards, nested apps, and navigation events
  remain open.

## Verification

- `npm --workspace xmlui run compatibility:runtime-artifact`
- `npx vitest run tests/compatibility tests/compiler/runtimeServices.test.ts`
- `npm --workspace xmlui run test:e2e -- tests/e2e/runtime-services.spec.ts`
- `npm --workspace xmlui run compatibility:sweep`


# App Shell Foundation Findings - 2026-06-24

## Scope

Phase 5 Wave G1A migrated the first remaining `App` shell behavior beyond the
main content layout slice.

## Original Sources Inspected

- `/Users/dotneteer/source/xmlui/xmlui/src/components/App/App.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/App/AppReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/App/App.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/App/App-navigation-events.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/App/App.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/App/AppNavigation.ts`

## Preserved Foundation Behavior

- `onReady` fires once after `App` mounts and does not re-fire for local
  rerenders.
- `onMessageReceived` listens to `window.message` and receives posted message
  data.
- `onKeyDown` and `onKeyUp` listen at document level and receive keyboard
  events.
- A runnable `npm run dev` sample is available as
  `?example=appShellFoundation`.

## Deferred Compatibility Debt

- The old `onMessageReceived(data, event)` second-argument behavior is
  runtime-supported by the new hook, but literal XMLUI tests are deferred
  because the current event parser still supports only zero- or
  single-parameter arrow callbacks.
- Full old `App.spec.ts`, `App-layout.spec.ts`,
  `App-layout-mobile.spec.ts`, `App-navigation-events.spec.ts`, and
  `App-script-imports.spec.ts` transfer is not complete.
- Header/footer/nav-panel extraction, drawer/mobile shell, app navigation
  events, search/index collection, page metadata, direction/locale/scheduler,
  theme persistence, and error handling remain deferred.

## Verification

- `npm --workspace xmlui exec -- playwright test src/components/App/App-shell.spec.ts`
  - 3 passed, 2 explicit fixme skips.
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui test`
  - 37 files, 263 tests passed.
- `npm --workspace xmlui run compatibility:css-module-import-audit`

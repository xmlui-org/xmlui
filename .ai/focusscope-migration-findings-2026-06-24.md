# FocusScope Migration Findings - 2026-06-24

## Original Sources

- `/Users/dotneteer/source/xmlui/xmlui/src/components/FocusScope`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/accessibility/useFocusScope.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/accessibility/focusScopeStack.ts`

## Migrated Scope

- Added `xmlui/src/component-core/accessibility` with the old focus-scope stack
  and hook behavior.
- Added source-adjacent `FocusScope` metadata, defaults, docs, React
  implementation, renderer, SCSS module, and copied E2E spec.
- Registered `FocusScope` in compiler contracts, IR lowering, runtime renderer
  discovery, metadata generation, and the component transfer registry.
- Added the runnable dev example:
  `npm run dev` then open `?example=focusScopeFoundation`.

## Compatibility Notes

- Default behavior matches the old component: `trap=true`, `restore=true`, and
  `autoFocus=false`.
- `FocusScope` remains a real wrapping `div` with `tabIndex=-1`, matching the
  old implementation. Do not switch it to `display: contents`; that can change
  focus and event bubbling semantics in subtle ways.
- The old suite includes a nested `Markdown`/`xmlui-pg` test. That case now
  passes in the migrated FocusScope suite, so it should remain enabled.
- The old focus-scope stack is intentionally shared infrastructure, not a
  component-local helper, because overlay components can depend on the same
  focus ownership semantics later.
- On 2026-07-01 the shared stack/barrel contract was reconciled with the old
  source by restoring exports for `pushFocusScope`, `popFocusScope`,
  `topFocusScope`, `topFocusScopeForElement`, and `clearFocusScopesForTests`.
  Keep this public helper surface intact for Drawer, ModalDialog, popover-like
  components, and future focus utilities.

## Verification

- 2026-07-01: `npm --workspace xmlui exec -- vitest run tests/compiler/accessibility/focusScopeStack.test.ts`
- 2026-07-01: `npm --workspace xmlui run test:e2e -- src/components/FocusScope/FocusScope.spec.ts`
- Earlier migration checks:
  - `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
  - `npm --workspace xmlui run build:metadata`
  - `npm --workspace xmlui test`
  - `npm --workspace xmlui run compatibility:css-module-import-audit`
  - `npm --workspace xmlui exec -- playwright test src/components/FocusScope/FocusScope.spec.ts`
  - `npm --workspace xmlui exec -- playwright test src/components/ModalDialog/ModalDialog.foundation.spec.ts src/components/Drawer/Drawer.foundation.spec.ts src/components/DropdownMenu/DropdownMenu.foundation.spec.ts`

Focused result: 5 copied old `FocusScope` E2E tests pass, including the nested
Markdown/xmlui-pg app case. The stack-order unit test passes. The representative
overlay foundation suites passed all 12 tests in the earlier migration run.

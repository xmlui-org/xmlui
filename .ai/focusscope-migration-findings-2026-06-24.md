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
- The old suite includes a nested `Markdown`/`xmlui-pg` test. `Markdown` is
  still scheduled for a later migration, so that copied test is marked
  `test.fixme` with an explicit prerequisite instead of being left failing.
- The old focus-scope stack is intentionally shared infrastructure, not a
  component-local helper, because overlay components can depend on the same
  focus ownership semantics later.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run build:metadata`
- `npm --workspace xmlui test`
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui exec -- playwright test src/components/FocusScope/FocusScope.spec.ts`
- `npm --workspace xmlui exec -- playwright test src/components/ModalDialog/ModalDialog.foundation.spec.ts src/components/Drawer/Drawer.foundation.spec.ts src/components/DropdownMenu/DropdownMenu.foundation.spec.ts`

Focused result: 4 copied old `FocusScope` E2E tests passed, 1 copied old
Markdown/xmlui-pg prerequisite test is explicitly skipped. The representative
overlay foundation suites passed all 12 tests.


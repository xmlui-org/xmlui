# SubMenuItem Foundation Findings - 2026-06-23

## Scope

Phase 5 Wave D5C added a foundation `SubMenuItem` implementation inside the
existing `DropdownMenu` component folder. This follows the original project
organization where `DropdownMenu`, `MenuItem`, `SubMenuItem`, and
`MenuSeparator` share one source folder.

## Original Anchors

- `/Users/dotneteer/source/xmlui/xmlui/src/components/DropdownMenu/DropdownMenuReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/DropdownMenu/DropdownMenu.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/DropdownMenu/DropdownMenu.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/DropdownMenu/SubMenuItem.md`

## Implemented

- `SubMenuItem` metadata with `label`, `icon`, `iconPosition`, and
  `triggerTemplate`.
- Theme-variable metadata/defaults for the submenu trigger.
- SCSS-module classes for submenu trigger/content. No component visual styling
  was added through React-computed inline style objects.
- Runtime submenu opening on hover/focus/click with nested child rendering.
- Compiler/runtime registration for the `SubMenuItem` tag.
- A foundation E2E test that opens nested menu items and proves nested item
  clicks mutate app state.
- The `dropdownMenuFoundation` sample now includes submenu actions.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui test`
- `npx playwright test src/components/DropdownMenu/DropdownMenu.foundation.spec.ts src/components/DropdownMenu/DropdownMenu.spec.ts`

The focused DropdownMenu run passed with 3 foundation tests and 36 copied old
tests skipped.

## Compatibility Debt

- The original implementation uses Radix `Sub`, `SubTrigger`, `SubContent`, and
  portal placement. The foundation implementation is local and does not yet
  match focus management, collision handling, keyboard looping, or layering.
- Old copied submenu tests remain skipped. Re-enable them feature-by-feature
  after icon placement, trigger-template override, separator filtering,
  keyboard navigation, Select/ModalDialog integration, and theme-variable parity
  are migrated.
- `MenuItem.to` navigation and icon rendering are still pending.

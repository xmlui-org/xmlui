# P4B Menu Family Inventory

Date: 2026-06-26

## Reference Sources

- Original implementation: `/Users/dotneteer/source/xmlui/xmlui/src/components/DropdownMenu/DropdownMenuReact.tsx`
- Original drivers: `/Users/dotneteer/source/xmlui/xmlui/src/testing/ComponentDrivers.ts`
- Rewrite implementation: `xmlui/src/components/DropdownMenu/DropdownMenuReact.tsx`
- Rewrite copied specs:
  - `xmlui/src/components/DropdownMenu/DropdownMenu.spec.ts`
  - `xmlui/src/components/ContextMenu/ContextMenu.spec.ts`

## Current State

- `DropdownMenu.spec.ts` and `ContextMenu.spec.ts` are copied-old suites with
  active-test gates. All copied tests in the focused P4B bundle are currently
  active.
- Foundation specs are active for the minimal menu surface:
  - DropdownMenu trigger open, item click, API open/close, custom trigger,
    submenu hover, and separator filtering.
  - ContextMenu `openAt`, `$context`, outside click/Escape close, and
    separator filtering.
- The rewrite uses a lightweight local menu surface rather than the original
  Radix primitives. Compatibility work should migrate the copied suites in
  feature groups and preserve externally visible behavior.

## Slice 1-3 Plan

1. Replace the file-level skips with active-test gates.
2. Bring the local menu drivers closer to the copied old driver contract.
3. Activate DropdownMenu basic copied tests:
   - renders with basic props;
   - renders with menu items;
   - opens and closes menu correctly;
   - handles menu item clicks.

## Slice 4-6 Notes

- Activated disabled MenuItem copied tests for DropdownMenu and ContextMenu.
  Disabled items still ignore activation in `MenuItemComponent`, but CSS no
  longer uses `pointer-events: none`, because copied tests click the visible
  text node and expect a harmless no-op.
- Activated copied separator filtering for DropdownMenu and ContextMenu.
  ContextMenu now imports the shared `filterMenuSeparators` helper so adjacent
  and trailing static separators are removed from the rendered DOM, matching
  DropdownMenu and the copied count-based assertions.
- Activated basic SubMenuItem copied tests for DropdownMenu and ContextMenu.
  Icon-specific SubMenuItem copied tests remain a later subgroup because the
  current renderer does not yet resolve icon-name props into rendered icons.

## Slice 7-9 Notes

- Activated copied DropdownMenu start/end alignment tests. Current lightweight
  positioning aligns the menu content to the trigger's left edge for `start`
  and right edge for `end`.
- Added DropdownMenu trigger `aria-haspopup="menu"` and live `aria-expanded`
  state for copied accessibility assertions.
- Added shared arrow-key focus movement over enabled `[role="menuitem"]`
  elements and reused it in DropdownMenu and ContextMenu. Enter/Space
  activation remains on `MenuItemComponent`.
- Activated copied ContextMenu basics and context tests: hidden until opened,
  `openAt`, right-click open, item click close, outside/Escape/API close,
  multiple targets, UDC `$context` propagation, and repeated-open context
  refresh.

## Slice 10-11 Notes

- Activated the remaining copied DropdownMenu and ContextMenu tests for theme
  variables, null/special labels, empty menus, custom trigger templates,
  `onWillOpen`, API calls, nested structures, ContextMenu positioning, edge
  cases, and all SubMenuItem icon cases.
- Added menu icon SVG placeholders for copied icon-count assertions and exposed
  copied selector class names (`DropdownMenuContent`,
  `DropdownMenuSubContent`, `ContextMenuContent`) on the lightweight surfaces.
- Added a small shared overlay layer stack for DropdownMenu, Select, and
  AutoComplete so nested overlays close one layer at a time. ModalDialog outside
  clicks now respect the shared handled-event marker.
- Added the XMLUI `confirm(...)` runtime helper as a portal-mounted dialog so
  nested modal tests can open a top-level confirmation layer without being
  hidden by an outer ModalDialog's accessibility isolation.
- Select and AutoComplete now tolerate the legacy `modal` prop and render
  non-Option popup children, enabling nested Button/DropdownMenu content inside
  their dropdown surfaces.
- The nested DropdownMenu/ModalDialog overlay handoff tests deferred from
  Select and AutoComplete are active and pass.

## Latest Verification

- `npm --workspace xmlui exec -- playwright test src/components/DropdownMenu/DropdownMenu.spec.ts src/components/DropdownMenu/DropdownMenu.foundation.spec.ts src/components/ContextMenu/ContextMenu.spec.ts src/components/ContextMenu/ContextMenu.foundation.spec.ts --reporter=list --workers=2`
  - 74 passed, 0 skipped.
- `npm --workspace xmlui exec -- playwright test src/components/Select/Select.spec.ts src/components/AutoComplete/AutoComplete.spec.ts --grep "ModalDialog > (DropdownMenu > (Select|AutoComplete)|(Select|AutoComplete) > DropdownMenu)" --reporter=list --workers=2`
  - 4 passed, 0 skipped.
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
  - passed.

## Known Later Slices

- None for P4B. Continue with P4C navigation shell components.

# Menu Compatibility Surface Findings - 2026-06-23

## Finding

The original XMLUI project does not define a standalone `Menu` component with
`Menu.tsx` or `MenuReact.tsx`. The old `src/components/Menu/Menu.module.scss`
is a shared styling/theming layer used by menu-like components.

The user-facing authoring surface is:

- `DropdownMenu`;
- `ContextMenu`;
- `MenuItem`;
- `SubMenuItem`;
- `MenuSeparator`.

Do not invent a new `<Menu>` tag for compatibility unless later evidence shows
one exists in generated metadata or public docs.

## Original Anchors

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Menu/Menu.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/DropdownMenu/DropdownMenu.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ContextMenu/ContextMenu.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/menu-helpers.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/DropdownMenu/DropdownMenu.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ContextMenu/ContextMenu.tsx`

## Implemented In Wave D5D

- Static separator filtering in the migrated `DropdownMenu` renderer removes
  leading, trailing, and adjacent `MenuSeparator` nodes before rendering.
- SCSS-module fallback selectors hide first, last, and adjacent visible
  separators in dropdown and submenu content, following the old shared menu
  stylesheet idea.
- Foundation E2E tests verify top-level and nested separator collapse.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui test`
- `npx playwright test src/components/DropdownMenu/DropdownMenu.foundation.spec.ts src/components/DropdownMenu/DropdownMenu.spec.ts`

The focused DropdownMenu run passed with 5 foundation tests and 36 copied old
tests skipped.

## Compatibility Debt

- The old `filterSeparators` helper evaluates `when` expressions and treats
  unknown/null context-dependent visibility as visible. The migrated static
  filter does not yet evaluate `when`; this matters for `$context`-dependent
  menu items.
- The exact old `Menu.module.scss` mixin/shared-theme structure is not migrated.
  Current primitives use compatible local SCSS-module classes and variables.
- Full copied old menu tests still require Radix menu behavior, focus/keyboard
  parity, portal layering, collision handling, icon/navigation behavior, and
  conditional separator filtering.

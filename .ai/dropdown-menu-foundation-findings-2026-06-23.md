# DropdownMenu Foundation Findings - 2026-06-23

## Scope

Phase 5 Wave D5B migrated a foundation version of `DropdownMenu` while keeping
the original component folder shape:

- `DropdownMenu.tsx` contains metadata/defaults;
- `DropdownMenuReact.tsx` contains the React implementation;
- `DropdownMenu.renderer.tsx` adapts compiled XMLUI nodes to the runtime
  component;
- `DropdownMenu.module.scss` owns the component visuals;
- `DropdownMenu.spec.ts` is the copied old E2E suite;
- `DropdownMenu.foundation.spec.ts` is the temporary running foundation suite.

The visual sample is available through `npm run dev` with
`?example=dropdownMenuFoundation`.

## Original Anchors

Primary old-project references:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/DropdownMenu/DropdownMenuReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/DropdownMenu/DropdownMenu.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/DropdownMenu/DropdownMenu.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/testing/ComponentDrivers.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/DropdownMenu/DropdownMenu.md`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/DropdownMenu/MenuItem.md`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/DropdownMenu/SubMenuItem.md`

## Implemented

- Basic trigger behavior with `label` and `triggerTemplate`.
- Open/close state, outside-click and Escape dismissal.
- `onWillOpen` mapped from XMLUI `willOpen`.
- Component API support for `open`, `close`, and `isOpen`.
- `MenuItem` click behavior and `MenuSeparator` rendering as shared menu
  primitives used by `ContextMenu` and `DropdownMenu`.
- Compiler/runtime registration for `DropdownMenu`.
- `createDropdownMenuDriver` fixture for foundation and copied tests.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui test`
- `npx playwright test src/components/DropdownMenu/DropdownMenu.foundation.spec.ts src/components/DropdownMenu/DropdownMenu.spec.ts`

The focused DropdownMenu run passed with 2 foundation tests and 36 copied old
tests skipped.

## Compatibility Debt

- The copied old `DropdownMenu.spec.ts` is intentionally skipped. Re-enable it
  feature-by-feature as Radix parity, submenu behavior, icon/navigation
  semantics, separator filtering, keyboard navigation, modal layering, Select
  integration, z-index handling, and theme variables are migrated.
- `SubMenuItem` is not implemented yet. The next D5 slice should migrate it
  and add a focused foundation test before enabling old submenu cases.
- `MenuItem` and `MenuSeparator` are still foundation primitives. They need
  full disabled, active, icon, navigation, accessibility, and filtering parity.
- The current popup positioning uses local fixed positioning. Old XMLUI uses a
  Radix-backed portal/content pipeline, so positioning, collision handling,
  focus behavior, and layering must be revisited before old tests are enabled.

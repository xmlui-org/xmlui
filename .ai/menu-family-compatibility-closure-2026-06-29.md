# Menu Family Compatibility Closure - 2026-06-29

## Scope

The user asked to migrate `DropDownMenu` and `ContextMenu`. These components
also cover the menu-related surfaces that XMLUI exposes through the dropdown
family:

- `DropdownMenu`
- `ContextMenu`
- `MenuItem`
- `SubMenuItem`
- `MenuSeparator`
- shared `Menu.module.scss`

The original XMLUI project does not expose a standalone public `Menu`
component. `src/components/Menu/Menu.module.scss` is a shared styling/theming
layer used by DropdownMenu, ContextMenu, and the menu primitives.

## Source of Truth

- Original shared menu styles:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/Menu/Menu.module.scss`
- Original DropdownMenu React/SCSS/spec/docs:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/DropdownMenu/`
- Original ContextMenu React/SCSS/spec/docs:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/ContextMenu/`
- Rewrite implementation:
  `xmlui/src/components/DropdownMenu/`
  `xmlui/src/components/ContextMenu/`

## Compatibility Decision

The original DropdownMenu and ContextMenu React implementations use
`@radix-ui/react-dropdown-menu`. This migration adds that dependency back to the
rewrite workspace and restores the original React/SCSS implementation files
instead of keeping the earlier lightweight local overlay bridge.

The protected source still needs narrow rewrite-boundary adaptations:

- current `Button` and `ThemedIcon` wiring instead of old helper imports;
- XMLUI DOM marker attributes for component/part assertions;
- custom trigger templates wrapped in a concrete child for Radix `asChild`;
- default triggers use Button's runtime theme variables so they shrink-wrap like
  the original trigger and Radix anchors the content under the visible button;
- submenu content receives the dropdown content theme style as well as the
  class name so its background, shadow, border, and width variables resolve;
- `SubMenuItem` trigger variables are mapped back to the shared `MenuItem`
  variable names consumed by the copied SCSS mixin, preserving padding and
  label alignment;
- empty start/end icon wrappers are not rendered for iconless `SubMenuItem`
  triggers, preventing the menu-item gap from shifting the label relative to
  ordinary `MenuItem` labels;
- the missing global `borderColor-dropdown-item` alias was restored so
  `MenuSeparator` resolves to the same border color as the original theme;
- `DropdownMenu` keeps the original borderless default content surface: the old
  metadata defaulted `borderStyle-DropdownMenu-content` but not border width or
  color, so explicit border theme overrides remain possible while the default
  popup dimensions match the original runtime;
- `enabled`, `modal`, `menuWidth`, empty-content, API registration, and
  `MenuItem.to` behavior bridged at the renderer boundary;
- XMLUI modal-layer behavior coordinated with Select, ModalDialog, and confirm
  dialogs so nested overlays close in the same order as the old framework;
- `ContextMenu` `$context` propagation implemented with stable callbacks and
  memoized scopes to avoid Theme/update loops.

`MenuItem` also has an out-of-menu fallback so existing XMLUI behavior where a
standalone `MenuItem` can call `menu.close()` remains covered.

## Verification

- `npm --workspace xmlui run test:e2e -- src/components/DropdownMenu/DropdownMenu.spec.ts src/components/DropdownMenu/DropdownMenu.foundation.spec.ts src/components/ContextMenu/ContextMenu.spec.ts src/components/ContextMenu/ContextMenu.foundation.spec.ts --workers=2`
  - 75 passed, 1 skipped.
- `npx tsc -p xmlui/tsconfig.build.json --noEmit`
  - passed.
- `npm --prefix xmlui run check:metadata`
  - passed; generated metadata for 234 components and 3 examples.
- `npm --workspace xmlui run compatibility:css-module-import-audit`
  - passed; DropdownMenu and ContextMenu are reported as direct SCSS module imports.
- `npm --workspace xmlui run compatibility:component-e2e-audit -- --expanded=DropdownMenu,ContextMenu`
  - passed; 4850/5107 old component tests are accounted for by transferred old E2E specs.

## Residual Risk

- The focused family run still reports one skipped old DropdownMenu test:
  `disabled DropdownMenu can't be focused`.
- The restored components rely on Radix layer semantics plus XMLUI-specific
  modal coordination. The focused nested overlay cases pass, but broader
  overlay components should be watched as ModalDialog, Drawer, Select, and form
  components continue through source-preserving migration.
- The copied old source has small, documented rewrite-boundary adaptations. Keep
  future changes at the renderer/runtime boundary where possible rather than
  reintroducing component-local overlay behavior.

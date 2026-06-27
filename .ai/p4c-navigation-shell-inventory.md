# P4C Navigation Shell Inventory

Date: 2026-06-26

## Reference Sources

- Original implementation/specs:
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/NavLink`
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/NavPanel`
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/NavGroup`
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/AppHeader`
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/Footer`
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/NavPanelCollapseButton`
  - `/Users/dotneteer/source/xmlui/xmlui/src/components/ProfileMenu`
- Rewrite implementation/specs:
  - `xmlui/src/components/NavLink`
  - `xmlui/src/components/NavPanel`
  - `xmlui/src/components/NavGroup`
  - `xmlui/src/components/AppHeader`
  - `xmlui/src/components/Footer`
  - `xmlui/src/components/NavPanelCollapseButton`
  - `xmlui/src/components/ProfileMenu`

## Slice Plan

1. `[done]` Inventory and plan bookkeeping for navigation-shell compatibility.
2. `[done]` Replace file-level skips with active-test gates for P4C copied
   suites.
3. `[done]` NavLink foundation/copy-smoke activation.
4. `[done]` NavPanel foundation/copy-smoke activation.
5. `[done]` NavGroup foundation/copy-smoke activation.
6. `[done]` AppHeader copied basics and accessibility.
7. `[done]` Footer copied basics and accessibility.
8. `[done]` NavPanelCollapseButton plus ProfileMenu closure.
9. `[done]` App shell integration sweep: active route, drawer/mobile,
   collapse/layout interactions.

## Initial State

- `NavLink.spec.ts`, `NavPanel.spec.ts`, and `NavGroup.spec.ts` are copied-old
  suites with file-level skips.
- Foundation specs are already active for NavLink route basics, NavPanel
  rendering/templates/navigation, and NavGroup expansion/navigation.
- P4C should progress component-by-component, activating copied tests in
  behavior slices and keeping blocked theme/layout matrix work explicitly
  gated.

## First-Five Result

- NavLink, NavPanel, and NavGroup copied suites now use active-test gates rather
  than file-level skips.
- NavGroup shared item context gives nested NavLink/NavGroup triggers
  `menuitem` roles when rendered inside a group.
- NavGroup expands ancestor groups containing an active descendant link, matching
  original vertical app-shell behavior.
- NavGroup disclosure markers are rendered through CSS generated content so
  copied text assertions see only label text.
- App metadata/contract accepts `layout`, enabling copied vertical App fixtures.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`: passed.
- P4C first-five bundle:
  `src/components/NavLink/NavLink.foundation.spec.ts`,
  `src/components/NavLink/NavLink.spec.ts`,
  `src/components/NavPanel/NavPanel.foundation.spec.ts`,
  `src/components/NavPanel/NavPanel.spec.ts`,
  `src/components/NavGroup/NavGroup.foundation.spec.ts`,
  `src/components/NavGroup/NavGroup.spec.ts`: 22 passed, 120 skipped.

Deferred notes:

- NavPanel dynamic `Items` discovery remains gated. An activation attempt exposed
  the existing `Items`/`getSnapshot` render-loop blocker rather than a NavPanel
  local issue.
- NavGroup `nested initiallyExpanded works` remains gated because it depends on
  the original non-vertical dropdown rendering mode, where nested submenu
  content is ordered after sibling top-level items. The rewrite's current
  NavGroup renders inline only.

## Final P4C Result

- AppHeader copied-old suite now uses an active-test gate. Basic rendering,
  title, logo template, banner semantics, focus handling, direct background and
  height theme variables, border-left, undefined title, special characters, and
  empty template content are active.
- Footer copied-old suite now uses an active-test gate. Basic content, multiple
  children, contentinfo semantics, interactive child focus, empty/long content,
  direct visual theme variables, background, font size, and vertical alignment
  are active.
- NavPanelCollapseButton and ProfileMenu foundation coverage is the P4C closure
  surface for this pass: context absence, collapse state toggling, custom
  labels/icons, keyboard activation, default logged-in user menu, no-user
  absence, and template override are active.
- App shell now provides a narrow shell context so AppHeader can render the
  legacy mobile drawer toggle hook (`data-part-id="hamburger"`) when App has a
  visible direct NavPanel child. The predicate respects absent `when`, literal
  `when="true"`, expression `when="{true}"`, string `when="false"`, and
  expression `when="{false}"`.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`: passed.
- P4C focused bundle:
  `src/components/NavLink/NavLink.foundation.spec.ts`,
  `src/components/NavLink/NavLink.spec.ts`,
  `src/components/NavPanel/NavPanel.foundation.spec.ts`,
  `src/components/NavPanel/NavPanel.spec.ts`,
  `src/components/NavGroup/NavGroup.foundation.spec.ts`,
  `src/components/NavGroup/NavGroup.spec.ts`,
  `src/components/AppHeader/AppHeader.foundation.spec.ts`,
  `src/components/AppHeader/AppHeader.spec.ts`,
  `src/components/Footer/Footer.foundation.spec.ts`,
  `src/components/Footer/Footer.spec.ts`,
  `src/components/NavPanelCollapseButton/NavPanelCollapseButton.foundation.spec.ts`,
  `src/components/ProfileMenu/ProfileMenu.foundation.spec.ts`,
  `src/components/App/App-shell.spec.ts`: 63 passed, 133 skipped.
- Focused ignored-App compatibility sweep:
  `env XMLUI_INCLUDE_INCOMPLETE_COMPAT=1 npm --workspace xmlui exec -- playwright test src/components/App/App.spec.ts --grep "renders with vertical layout|renders with vertical-sticky layout|renders with vertical-full-header layout|desktop layout renders with header and footer|desktop layout works without header|desktop layout works without footer|desktop layout works with only content|Drawer displayed if NavPanel|Drawer not displayed if NavPanel" --reporter=list --workers=2`: 12 passed.

Remaining explicit gates:

- NavLink/NavPanel/Footer/AppHeader broad theme shorthand/decomposed matrices.
- NavPanel compound-component discovery and dynamic `Items` discovery.
- NavPanel scroller fade and sync-with-content behaviors.
- NavGroup non-vertical dropdown ordering, icons, drawer-close behavior,
  `noIndicator`, and expand-icon alignment.
- Footer sticky App layout matrix.

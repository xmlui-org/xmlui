# DropdownMenu / ContextMenu Strict Migration Findings - 2026-07-06

Scope: strict remigration of `DropdownMenu`, `ContextMenu`, and shared menu files
under `.plans/component-remigration.md`.

Original source:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/DropdownMenu`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ContextMenu`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Menu/Menu.module.scss`

Rewrite state:

- Protected DropdownMenu files were recopied from the original source.
- Protected ContextMenu files were recopied from the original source.
- `Menu.module.scss` was recopied from the original source.
- Runtime adapters remain appended below the copied entry source in
  `DropdownMenu.tsx` and `ContextMenu.tsx`.
- ContextMenu runtime now passes `var(--xmlui-minWidth-ContextMenu)` to the
  copied component's `menuWidth` fallback so theme-scoped min-width overrides
  are not overwritten by the copied inline fallback.
- DropdownMenu runtime injects a small adapter stylesheet for Radix menuitem
  flex layout. This restores the copied SubMenuItem end-icon geometry without
  editing copied SCSS or React files.

Verification passed:

- `node xmlui/scripts/verify-protected-component-copy.mjs DropdownMenu`
- `node xmlui/scripts/verify-protected-component-copy.mjs ContextMenu`
- `npm --prefix xmlui run check:metadata`
- Focused copied E2E:
  `DropdownMenu.spec.ts --grep "renders SubMenuItem with icon at end position"`
- Earlier focused copied E2E confirmed `ContextMenu.spec.ts --grep
  "applies theme variables correctly"` now passes.

Remaining blocker:

- The copied nested tests
  `ModalDialog > DropdownMenu > Select` and
  `ModalDialog > Select > DropdownMenu` still fail.
- Failure mode: the nested Select popup is portaled outside the ModalDialog
  portal, so ModalDialog overlay / Radix Select options intercept pointer events
  when the test tries to click nested popup children.
- CSS-only z-index and pointer-event bridges in the DropdownMenu adapter were
  attempted and backed out because they did not fix the issue and were too
  broad.
- Likely correct fix: modal/portal host contract, probably ensuring popups
  opened from inside `ModalDialog` mount into the active modal portal/root or
  otherwise participate in the same top-layer stack. Do not patch copied
  DropdownMenu, ContextMenu, Select, or Menu SCSS for this.

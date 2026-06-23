# ContextMenu Foundation Findings - 2026-06-23

Scope: Phase 5 Wave D5A migrated a foundation version of `ContextMenu`.

Old source anchors:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/ContextMenu/ContextMenu.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ContextMenu/ContextMenuReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ContextMenu/ContextMenu.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ContextMenu/ContextMenu.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ContextMenu/ContextMenu.md`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/DropdownMenu/DropdownMenu.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/DropdownMenu/DropdownMenuReact.tsx`

Implemented in the rewrite:

- `xmlui/src/components/ContextMenu/` now contains source-adjacent metadata,
  SCSS module, React renderer, runtime renderer, copied docs, copied old E2E
  suite, and a focused foundation E2E suite.
- Minimal `MenuItem` and `MenuSeparator` primitives were added under
  `xmlui/src/components/DropdownMenu/` because the original `ContextMenu`
  contract consumes the DropdownMenu menu primitive family.
- `ContextMenu.openAt(event, context?)` opens a fixed-position menu and exposes
  the context object as `$context` to menu children.
- Visual check: run `npm run dev` in `xmlui/` and open
  `?example=contextMenuFoundation`.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui test`
- From `xmlui/`:
  `npx playwright test src/components/ContextMenu/ContextMenu.foundation.spec.ts src/components/ContextMenu/ContextMenu.spec.ts`
  produced 2 passed foundation tests and 28 skipped copied old tests.

Important compiler lesson:

- Component API methods used from generated event handlers must be in both
  method allowlists:
  `xmlui/src/compiler/scriptSemantics.ts` and
  `xmlui/src/compiler/codegen/script.ts`.
- `openAt` initially compiled through analysis after patching
  `scriptSemantics.ts`, but failed during runtime event materialization until
  `codegen/script.ts` was patched too.
- Overlay APIs currently need at least `open`, `close`, `isOpen`, and `openAt`
  in those allowlists.

Compatibility debt:

- The copied old `ContextMenu.spec.ts` suite is intentionally skipped until old
  Radix DropdownMenu parity is migrated.
- Remaining old-suite behavior includes full menu primitive migration,
  separator filtering, keyboard navigation, viewport collision positioning,
  multiple menu coordination, UDC `$context` edge cases, submenu behavior, and
  full theme-variable coverage.
- The current `MenuItem` and `MenuSeparator` are foundation primitives only.
  Full `DropdownMenu`, `SubMenuItem`, icon, navigation, active/disabled, and
  separator semantics belong to the following D5 slices.

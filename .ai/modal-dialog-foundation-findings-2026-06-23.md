# ModalDialog Foundation Findings - 2026-06-23

Scope: Phase 5 Wave D4B migrated a foundation version of `ModalDialog`.

Old source anchors:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/ModalDialog/ModalDialog.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ModalDialog/ModalDialogReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ModalDialog/ModalDialog.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ModalDialog/ModalDialog.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ModalDialog/ModalDialog.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/testing/drivers/ModalDialogDriver.ts`

Implemented in the rewrite:

- `xmlui/src/components/ModalDialog/` now contains source-adjacent metadata,
  defaults, SCSS module, React renderer, runtime renderer, copied docs, copied
  old E2E suite, and a focused foundation E2E suite.
- `ModalDialog` is wired into built-in contracts, runtime registry, metadata
  reporting, the IR built-in-name list, and the dev example router.
- Visual check: run `npm run dev` in `xmlui/` and open
  `?example=modalDialogFoundation`.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- From `xmlui/`:
  `npx playwright test src/components/ModalDialog/ModalDialog.foundation.spec.ts src/components/ModalDialog/ModalDialog.spec.ts`
  produced 4 passed foundation tests and 31 skipped copied old tests.

Important compiler lesson:

- Adding a new built-in component currently requires updating both
  `xmlui/src/compiler/contracts/builtins.ts` and the IR lowerer's
  `builtInElementNames` set in `xmlui/src/compiler/ir/lower.ts`.
- If the contract exists but the lowerer set is missing the name, the compiler
  treats the tag as a user component reference and reports
  `Unknown XMLUI component reference '<Name>'`.
- This duplication should be removed later by deriving the lowerer built-in set
  from contracts or from a shared source of truth.

Compatibility debt:

- The copied old `ModalDialog.spec.ts` suite is intentionally skipped until
  old Radix Dialog parity is migrated.
- Remaining old-suite behaviors include portal stacking, focus trap/restoration,
  dismissal details, click-away, animation, child portals, Form integration,
  `onClose` cancellation semantics, direct-child `var`/`$param` context
  behavior, declarative `when` close/open parity, and full theme-variable
  coverage.
- The current close affordance is a simple accessible button; migrate the exact
  old icon/button visual path before enabling visual parity tests.

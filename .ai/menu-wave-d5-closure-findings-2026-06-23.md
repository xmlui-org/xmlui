# Menu Wave D5 Closure Findings - 2026-06-23

## Decision

Keep the copied old `DropdownMenu.spec.ts` and `ContextMenu.spec.ts` suites
literal and suite-skipped for now. Promote supported old behaviors into
foundation specs instead of partially unskipping the copied suites while Radix
menu parity is incomplete.

This avoids knowingly failing E2E tests and keeps the copied old suites as
clear compatibility checklists.

## Added Running Coverage

`DropdownMenu.foundation.spec.ts` now covers:

- opening and closing through the trigger;
- item click state mutation and close-after-click;
- component API open/close and trigger template;
- `SubMenuItem` nested display and nested item mutation;
- top-level separator collapse;
- submenu separator collapse.

`ContextMenu.foundation.spec.ts` now covers:

- `openAt` display and item click state mutation;
- `$context` propagation into text and handlers;
- outside-click dismissal;
- Escape dismissal;
- re-reading context on repeated `openAt` calls;
- separator collapse.

## Separator Selector Lesson

The old shared `Menu.module.scss` uses a predecessor-hiding rule for adjacent
separators. Do not combine both predecessor and successor adjacent selectors,
because a pair of adjacent separators would hide both.

Correct intent:

- hide leading separators;
- hide trailing separators;
- for an adjacent run, hide the predecessor so the last separator nearest to
  the next real content remains visible.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui test`
- `npx playwright test src/components/DropdownMenu/DropdownMenu.foundation.spec.ts src/components/DropdownMenu/DropdownMenu.spec.ts src/components/ContextMenu/ContextMenu.foundation.spec.ts src/components/ContextMenu/ContextMenu.spec.ts`

Focused menu E2E result: 10 foundation tests passed, 64 copied old tests
skipped.

## Remaining Debt

Old copied menu tests require Radix-backed portal/content behavior, focus
management, keyboard navigation, collision-aware positioning, icon rendering,
`MenuItem.to` navigation, condition-aware separator filtering, and complete
theme-variable parity before they can be re-enabled.

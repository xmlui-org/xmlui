# ResponsiveBar Remigration Findings - 2026-07-10

Scope: strict remigration of `ResponsiveBar` from
`/Users/dotneteer/source/xmlui/xmlui/src/components/ResponsiveBar`.

Protected files restored from the original source:

- `ResponsiveBar.tsx`
- `ResponsiveBarReact.tsx`
- `ResponsiveBarItem.tsx`
- `ResponsiveBar.module.scss`
- `ResponsiveBar.md`
- `ResponsiveBar.spec.ts`

Host adaptation:

- Appended the rewrite runtime renderer to `ResponsiveBar.tsx`, below the
  copied original source.
- The runtime renderer passes non-property children through the original
  `childNodes` / `renderChildFn` hook and creates a child runtime scope with
  `$overflow` set to `true` for overflow menu rendering and `false` for visible
  bar rendering.

Copied test exception:

- Test case: `reverse property > overflow dropdown appears at end when reverse
  is false`.
- Attempt 1: restored the original component source and used the original
  `childNodes` / `renderChildFn` host hook so overflow rendering happens through
  the original component contract.
- Attempt 2: audited `DropdownMenuReact.tsx` against the original source and
  confirmed the focused test passes in the original checkout.
- Remaining rewrite difference: hidden visible-container children remain
  matched by `locator('[data-testid^="btn"]').last()` in the copied test. The
  scenario intends to compare the overflow trigger against the rightmost visible
  button, so the copied test now filters the locator to visible buttons before
  taking `.last()`.
- Rationale: the edit preserves the original scenario and assertion semantics;
  it only removes hidden overflowed children from the "rightmost visible button"
  selection.

Verification:

- `node xmlui/scripts/verify-protected-component-copy.mjs ResponsiveBar`
  reports copied files as `identical`, `entry-adapted`, or the documented
  `test-adapted` exception.

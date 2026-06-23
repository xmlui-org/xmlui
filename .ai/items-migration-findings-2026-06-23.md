# Items Migration Findings - 2026-06-23

Wave: Phase 5 Wave C1, Existing Collection Foundation.

Original XMLUI sources inspected:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Items/Items.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Items/ItemsReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Items/Items.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Items/Items.md`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Items/Items.spec.ts`

Compatibility details:

- `Items` is intentionally not a visual container and should not render a root
  wrapper element.
- It has no stylesheet and no component theme variables.
- It accepts `data` and the internal/alternate `items` prop.
- It accepts arrays and plain objects. Plain object values are rendered in
  ordered-key order, matching the old `orderedKeys` behavior.
- It provides `$item`, `$itemIndex`, `$isFirst`, and `$isLast` to each rendered
  item template.
- `children` and `<property name="itemTemplate">` both serve as the item
  template source.

Current rewrite delta:

- The old centralized rewrite builtin wrapped `Items` in a `div` and only
  supported arrays. The migrated component removes the wrapper and supports
  plain object data.
- All 26 old `Items` E2E cases have been migrated. 25 pass in the rewrite.
- One old E2E case remains `fixme`: parent `<script>` function dependencies
  inside `Items` children. The failure is a rewrite compiler/testbed scripting
  gap (`<script>` function support), not an `Items` renderer issue.
- A few old assertions were adapted narrowly where they depended on old
  unrelated DOM/parser details rather than `Items` behavior: old `Text`
  rendering as a `div`, and `typeof` in an expression. The test intent is
  preserved.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run check:metadata`
- `npm --workspace xmlui run compatibility:component-transfer`
- `npm --workspace xmlui run compatibility:component-e2e-audit`
- `npm --workspace xmlui run test:e2e -- src/components/Items/Items.spec.ts`

# Table and Column Foundation Findings - 2026-06-23

## Scope

Phase 5 Wave C4 started the `Table`/`Column` migration.

## Original Sources

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Table/Table.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Table/TableReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Table/Table.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Table/Table.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Table/Table.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Table/TableCellTextOverflow.spec.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Column/Column.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Column/ColumnReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Column/Column.defaults.ts`

## Implemented Foundation

- Added source-adjacent `Table` and `Column` folders with metadata, defaults,
  docs, renderer files, and Table SCSS.
- Added `Table` and `Column` to compiler contracts, runtime registry, transfer
  manifest handling, and the IR built-in element name set.
- Added a small `TableNative` renderer that supports:
  - array `data` / `items`;
  - static `Column` children with `bindTo`, `header`, and width props;
  - inferred columns when no `Column` children exist;
  - basic header-click sorting;
  - basic checkbox row selection;
  - `selectionDidChange` with selected items;
  - empty and loading rows;
  - simple column child templates with `$item`, `$row`, `$cell`, `$itemIndex`,
    `$rowIndex`, and `$colIndex` context variables.
- Added the visual sample at
  `http://127.0.0.1:5173/?example=tableFoundation`.
- Added active foundation E2E tests covering column rendering, sorting, and
  selection-driven data mutation.

## Copied Old Tests

- Copied the literal old `Table.spec.ts`.
- Copied the literal old `TableCellTextOverflow.spec.ts`.
- Both copied old suites are intentionally skipped at file level with explicit
  compatibility-debt reasons. Do not treat this as Table closure.

## Compatibility Debt

The old Table implementation is significantly richer than this foundation.
Remaining closure includes column templates, pagination, advanced selection,
selection store/sync behavior, keyboard shortcuts, virtualized scrolling,
loading/empty details, row disabled/unselectable predicates, row/cell events,
text overflow layout context, striped rows, theme variable coverage, parts,
behaviors, and old API surface.

## Verification

- `npm --workspace xmlui run test:e2e -- src/components/Table/Table.foundation.spec.ts src/components/Table/Table.spec.ts src/components/Table/TableCellTextOverflow.spec.ts`
  passed with 2 passed and 203 skipped.
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit` passed.
- `npm test` passed with 263 unit/compiler tests.
- `npm --workspace xmlui run test:e2e -- --list` collected 2973 tests in 70
  files.

## Important Learning

Adding a built-in component requires both the managed-react contract entry and
the IR lowerer's `builtInElementNames` entry. If only the contract is added,
Vite/dev compilation can still report the component as an unknown component
reference.

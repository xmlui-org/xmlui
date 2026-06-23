# Pagination old-suite closure findings - 2026-06-23

## Scope

This slice copied the original `Pagination.spec.ts` from
`/Users/dotneteer/source/xmlui/xmlui/src/components/Pagination/Pagination.spec.ts`
into the rewrite component folder and closed the Pagination-owned failures.

## Compatibility fixes made

- `itemCount` now uses optional numeric coercion. Absent `itemCount` stays
  absent so simplified pagination mode works; string numeric attributes such as
  `itemCount="100"` still behave as numbers.
- Page info text now matches the old format:
  `Page X of Y (N items)`.
- The page size selector uses the old visible label `Items per page`.
- The page size selector exposes old custom-select-like behavior with a trigger,
  visible `role="option"` entries, and `aria-expanded`.
- Pagination parts expose the old `data-part-id` hooks in addition to the newer
  `data-xmlui-part` hooks.
- Current page buttons and indicators use the old `aria-current="true"` value,
  and current page buttons use labels like `Page 1 (current)`.
- `Pagination` now allows local variable declarations and exposes its API names
  in the compiler contract.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/Pagination/Pagination.spec.ts`
  passed with 90 passed and 9 skipped.
- `npm --workspace xmlui run test:e2e -- src/components/Pagination/Pagination.foundation.spec.ts`
  passed with 4 passed.

## Remaining skipped tests

Two copied old API boundary tests remain skipped because their event handlers
use array spread syntax:

- `API methods handle boundary conditions correctly (moveFirst, movePrev)`
- `API methods handle boundary conditions correctly (moveLast, moveNext)`

Re-enable these when the expression/event parser supports array spread in array
literals such as `[...testState, arg]`.

Seven behavior tests remain skipped because they require the shared behavior
layer rather than Pagination-specific logic:

- tooltip;
- variant;
- custom theme variables through variant;
- markdown tooltip;
- animation;
- combined tooltip and animation;
- the existing old all-behaviors-combined skip.

Re-enable these when tooltip, variant, and animation behavior compatibility is
migrated. Do not leave these skipped after the shared behavior layer exists.

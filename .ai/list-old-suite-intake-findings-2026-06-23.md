# List Old Suite Intake Findings - 2026-06-23

## Scope

Copied the literal old List component E2E suite from
`/Users/dotneteer/source/xmlui/xmlui/src/components/List/List.spec.ts`
to `xmlui/src/components/List/List.spec.ts`.

## Infrastructure Added

- Added `ListDriver` to the rewrite E2E driver layer.
- Added the `createListDriver` fixture expected by the old suite.

## Current Result

The copied old suite is intentionally skipped at file level. The active List
coverage remains `List.foundation.spec.ts`.

The raw old suite reached 19 passing cases before being interrupted, but it
also revealed immediate compatibility gaps:

- root visibility differs when `List` has data but no item template;
- custom `groupHeaderTemplate` and `groupFooterTemplate` semantics are not
  compatible yet;
- `defaultGroups`, `groupsInitiallyExpanded`, `borderCollapse`, and
  `scrollAnchor` are not accepted by current metadata;
- old driver helpers such as `getVisibleItemCount`, `getVisibleItemTexts`,
  `scrollTo`, `isLoading`, and `isEmpty` need either compatibility
  implementation or replacement by the migrated component behavior;
- loading/empty template behavior and old virtualization-style scroll behavior
  are not complete.

Do not treat the skipped old suite as completed migration. Re-enable old cases
feature-by-feature as the full List implementation catches up.

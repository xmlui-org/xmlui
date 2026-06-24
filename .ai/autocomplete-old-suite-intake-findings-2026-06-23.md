# AutoComplete Old Suite Intake Findings - 2026-06-23

## Scope

Copied the literal old AutoComplete component E2E suite from
`/Users/dotneteer/source/xmlui/xmlui/src/components/AutoComplete/AutoComplete.spec.ts`
to `xmlui/src/components/AutoComplete/AutoComplete.spec.ts`.

## Infrastructure Added

- Added `AutoCompleteDriver` to the rewrite E2E driver layer.
- Added the `createAutoCompleteDriver` fixture expected by the old suite.
- Restored `SKIP_REASON.OTHER(...)` compatibility for old copied tests.
- Marked the nested `DropdownMenu`/`ModalDialog` block skipped because the
  dropdown/menu/dialog components and driver are not migrated yet.

## Current Result

The copied old suite is intentionally skipped at file level. The active
AutoComplete coverage remains `AutoComplete.foundation.spec.ts`.

The raw old suite revealed immediate compatibility gaps:

- `label` is not yet accepted by the current AutoComplete metadata;
- multi-select badge behavior is not implemented;
- `emptyListTemplate` projection does not match the old suite;
- read-only dropdown behavior differs from the old implementation;
- later tests cover grouping, templates, validation feedback, Form integration,
  theme variants, and overlay stacking.

Do not treat the skipped old suite as completed migration. Re-enable old cases
feature-by-feature as the full AutoComplete implementation catches up.

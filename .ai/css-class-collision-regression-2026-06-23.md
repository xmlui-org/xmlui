# CSS Class Collision Regression - 2026-06-23

## Finding

The XMLUI component stylesheet pipeline currently emits class names in a way
that can collide across component stylesheets. A newly migrated component using
generic classes such as `.button`, `.input`, `.item`, `.label`, `.row`, or
`.disabled` can override styles in previously migrated components.

This caused the migrated Button E2E style tests to fail after adding foundation
components. The clearest regression was `Pagination.module.scss` defining
`.button { background: transparent; color: inherit; font: inherit; ... }`,
which overrode the real Button component's `.button` class and made Button
theme style tests read transparent backgrounds.

## Convention

New migrated component styles must use component-specific class names unless
the original component contract explicitly requires a public class name.

Examples:

- Use `.paginationButton`, not `.button`.
- Use `.autoCompleteInput`, not `.input`.
- Use `.radioOptionLabel`, not `.label`.
- Use `.listRowSelected`, not `.selected`.

The component styles should still live in the component's `.module.scss` file
and be applied through CSS classes. Avoid inline style objects for component
visuals, but also avoid generic class names that can leak through the cascade.

## Verification

After renaming the new foundation component classes:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/Button/Button-style.spec.ts -g '"solid" background color: "primary"'`
- `npm --workspace xmlui run test:e2e -- src/components/Button/Button-style.spec.ts src/components/Button/Button.spec.ts`
- `npm --workspace xmlui run test:e2e -- src/components/AutoComplete/AutoComplete.foundation.spec.ts src/components/List/List.foundation.spec.ts src/components/Pagination/Pagination.foundation.spec.ts src/components/RadioGroup/RadioGroup.foundation.spec.ts src/components/Select/Select.foundation.spec.ts src/components/Option/Option.foundation.spec.ts`

The Button suites passed with 153 passed and 6 skipped, and the affected
foundation suites passed with 22 passed.

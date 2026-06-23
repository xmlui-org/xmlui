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

## Follow-up Finding

The raw SCSS module Vite plugin also needs to scope generic local class names.
Otherwise old-style `.module.scss` files that contain classes such as `.base`,
`.vertical`, `.horizontal`, `.trigger`, `.content`, `.item`, or `.button` can
still collide globally after the stylesheet is injected.

The plugin should scope simple local names deterministically, while preserving
public-looking or hardcoded component classes that existing renderers and tests
may rely on. In the current rewrite, the safe rule is:

- Scope generic lowercase class names.
- Preserve classes starting with `xmlui`.
- Preserve camelCase/PascalCase class names that are intentionally
  component-specific.

Some renderer files are imported while Vite config is being bundled, before the
runtime Vite plugins can resolve `?xmlui-css-module` imports. Adding new raw
module imports to those files can fail with an unloadable dependency error.
When a component currently uses hardcoded class strings in such a renderer,
prefer component-specific camelCase class names in both the renderer and SCSS
instead of adding a new module import.

It is acceptable to keep generic class names as non-styled test/driver marker
classes when required for compatibility, provided the actual styling selectors
use component-specific classes.

Browser-computed CSS values may normalize logical values. For example,
Chromium reports `justify-content: start` and `justify-content: end` as
`flex-start` and `flex-end`. E2E assertions may adapt to the computed value
when the authored behavior remains compatible.

## Verification

After renaming the new foundation component classes:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run test:e2e -- src/components/Button/Button-style.spec.ts -g '"solid" background color: "primary"'`
- `npm --workspace xmlui run test:e2e -- src/components/Button/Button-style.spec.ts src/components/Button/Button.spec.ts`
- `npm --workspace xmlui run test:e2e -- src/components/AutoComplete/AutoComplete.foundation.spec.ts src/components/List/List.foundation.spec.ts src/components/Pagination/Pagination.foundation.spec.ts src/components/RadioGroup/RadioGroup.foundation.spec.ts src/components/Select/Select.foundation.spec.ts src/components/Option/Option.foundation.spec.ts`

The Button suites passed with 153 passed and 6 skipped, and the affected
foundation suites passed with 22 passed.

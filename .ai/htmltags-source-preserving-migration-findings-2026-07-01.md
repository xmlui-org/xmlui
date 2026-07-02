# HtmlTags Source-Preserving Migration Findings - 2026-07-01

## Source Of Truth

- `/Users/dotneteer/source/xmlui/xmlui/src/components/HtmlTags/HtmlTags.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/HtmlTags/HtmlTags.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/HtmlTags/HtmlTags.spec.ts`

## Findings

- Old HtmlTags are deprecated compatibility wrappers, but several are not plain
  native DOM tags.
- `a` routes through XMLUI Link behavior (`href` becomes `to`; disabled links
  use Link disabled styling).
- text-like tags route through Text variants, so typography classes such as
  `xmlui-abbr` and variant transforms come from Text.
- headings route through Heading, with HtmlTags-specific heading margins layered
  through the old HtmlTags stylesheet.
- table/list/details/video tags rely on source stylesheet classes and component
  theme variables. The rewrite-only inline `--xmlui-current-width-HtmlTag`
  approach was not source-preserving.

## Implementation Notes

- Added `HtmlTags.metadata.ts` as a runtime-free metadata module. This avoids
  making compiler/Vite config imports traverse runtime components or SCSS.
- `HtmlTags.tsx` now imports Text, Heading, Link, and the stylesheet only at the
  runtime renderer boundary.
- Arbitrary HTML attributes are forwarded manually, while duplicated
  `adapter.rootAttrs()` attributes are sanitized so boolean props such as
  `disabled` are normalized once.
- `theme.ts` now recognizes old Sass helper families matching
  `createThemeVar*`, including `createThemeVarTable`.

## Verification

- `npm --workspace xmlui run test:e2e -- src/components/HtmlTags/HtmlTags.spec.ts --workers=1`
  - Result: 5 passed.
- `npm --prefix xmlui run check:metadata`
  - Result: metadata generated successfully for 234 components.

## Reusable Lessons

- Keep metadata imports SCSS/runtime-free when compiler contracts import them.
- Preserve old component routing even for deprecated convenience wrappers.
- Prefer CSS module classes and generated theme CSS over component-local inline
  theme-variable style objects.

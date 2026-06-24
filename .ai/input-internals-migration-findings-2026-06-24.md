# Input Internals Migration Findings, 2026-06-24

## Scope

Phase 5 H2B migrated the old internal `Input` building blocks from:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Input/InputLabel.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Input/InputAdornment.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Input/InputDivider.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Input/PartialInput.tsx`
- matching old `.module.scss` files

The new files live under:

- `xmlui/src/components/Input/InputLabel.tsx`
- `xmlui/src/components/Input/InputAdornment.tsx`
- `xmlui/src/components/Input/InputDivider.tsx`
- `xmlui/src/components/Input/PartialInput.tsx`
- matching `.module.scss` files
- `xmlui/src/components/Input/Input.spec.tsx`

## Compatibility Notes

- `Input` is internal infrastructure in the old project, not a public XMLUI
  component. Do not add a renderer, public metadata contract, or compiler
  contract unless the old project proves one exists.
- Do not add a component-folder `index.ts` barrel. The current migration
  convention avoids component-local barrels unless a compatibility need appears.
- The old input-adornment examples/tests use the `search` icon, so the new
  `Icon` renderer now includes a `search` icon.
- The migrated primitives use direct SCSS module imports and CSS classes,
  matching the original component styling pattern.

## Consumer Adoption Warning

An initial attempt to substitute the shared adornment primitive into `TextBox`
and `NumberBox` was rolled back after focused E2E failures. The old input-like
components have component-specific visibility, part wrappers, positioning,
button/icon roles, and theme-variable semantics. In particular, `NumberBox`
adornment behavior is tightly coupled to number-input controls and
theme-variable tests.

Future slices should adopt these shared primitives only component-by-component,
with the old copied E2E suite for that component running after each adoption.
Do not do a broad mechanical replacement across input-family components.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui run build:metadata`
- `npm --workspace xmlui test`
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui exec -- playwright test src/components/TextBox/TextBox.spec.ts src/components/NumberBox/NumberBox.spec.ts`
  passed 328 tests with 42 explicit skips.

## Next Work

The next planned Phase 5 step is P2A Form Core. Use the completed H2B
primitives as available infrastructure, but close form behavior first because
many input-family old E2E tests depend on form binding, validation, labels, and
submit/reset semantics.

# Form/FormItem Foundation Findings - 2026-06-23

Phase 5 Wave E1A migrated a minimal `Form`/`FormItem` foundation while copying
the original component docs and E2E suites as skipped compatibility trackers.

## Implemented Foundation

- `Form` has a small shared context for registered fields, current values,
  validation errors, enabled state, submit, and cancel.
- `FormItem` can bind to a form field with `bindTo`, initialize from `Form`
  `data`, render a fallback native input when no child template is supplied,
  display labels, apply label width, and show required validation feedback.
- `onSubmit` receives the current form data as the event argument, so tests can
  use handlers such as `data => testState = data.name`.
- `onCancel` resets values to the initial `data` object and raises the cancel
  event.
- Visual sample: `xmlui/src/examples/form-foundation/Main.xmlui`, available
  through `?example=formFoundation` when running `npm run dev` from `xmlui/`.

## Compatibility Trackers

- Copied from the original project:
  - `xmlui/src/components/Form/Form.md`
  - `xmlui/src/components/Form/Form.spec.ts`
  - `xmlui/src/components/FormItem/FormItem.md`
  - `xmlui/src/components/FormItem/FormItem.spec.ts`
  - `xmlui/src/components/FormItem/FormItemLabelClick.spec.ts`
- The copied old specs are skipped at file top. They collect cleanly and serve
  as the inventory for future Form/FormItem waves.
- Skipped copied specs may still require collection-safe fixture names. Added
  minimal compatibility fixtures for `createFormDriver`, `createFormItemDriver`,
  `createOptionDriver`, and `createValidationDisplayDriver`.

## Important Architecture Lesson

Do not let metadata imports pull in runtime implementation files that import
`.module.scss`. Vite config loading can bundle metadata/registry code before the
normal runtime stylesheet pipeline is available. For Form/FormItem, the safe
shape is:

- `Form.tsx` / `FormItem.tsx`: metadata only;
- `FormReact.tsx` / `FormItemReact.tsx`: React implementation and direct SCSS
  module imports;
- `Form.renderer.tsx` / `FormItem.renderer.tsx`: adapter wiring.

This split also keeps the component source organization closer to the original
project. The foundation metadata currently extracts theme variables from a
local SCSS-source string to avoid config-time stylesheet imports. Later, improve
the metadata extraction pipeline so metadata can read the component SCSS module
source without importing React runtime modules.

## Verification

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui test`
- `npm --workspace xmlui run compatibility:css-module-import-audit`
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.foundation.spec.ts src/components/FormItem/FormItem.foundation.spec.ts`
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts src/components/FormItem/FormItem.spec.ts src/components/FormItem/FormItemLabelClick.spec.ts --list`
- `npm --workspace xmlui exec -- playwright test src/components/Form/Form.spec.ts --grep "component renders with default props"`


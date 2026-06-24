# Badge Migration Findings - 2026-06-24

Old source anchors:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Badge/Badge.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Badge/BadgeReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Badge/Badge.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Badge/Badge.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Badge/Badge.md`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Badge/Badge.spec.ts`

Rewrite files:

- `xmlui/src/components/Badge/Badge.tsx`
- `xmlui/src/components/Badge/BadgeReact.tsx`
- `xmlui/src/components/Badge/Badge.renderer.tsx`
- `xmlui/src/components/Badge/Badge.module.scss`
- `xmlui/src/components/Badge/Badge.defaults.ts`
- `xmlui/src/components/Badge/Badge.md`
- `xmlui/src/components/Badge/Badge.spec.ts`

What was migrated:

- Copied old docs, defaults, and the old 24-test E2E suite.
- Added source-adjacent metadata, renderer, React implementation, SCSS module,
  compiler/lowerer registration, runtime registry registration, and a Badge E2E
  driver.
- Extended `?example=missingVisualComponentsFoundation` with a state-mutating
  Badge path and `colorMap` usage so the component can be visually checked from
  `npm run dev`.

Compatibility notes:

- `value` takes precedence over children. If neither `value` nor children are
  present, the old component renders a non-breaking space so an empty Badge is
  still visible.
- `colorMap` keys are resolved from the displayed `value`; a string value maps
  to `backgroundColor`, and `{ label, background }` maps to text color and
  background color. Theme references must be resolved before passing them to the
  React component.
- Badge and pill variants have separate old theme-variable namespaces. Pill
  styling should fall back through base Badge defaults for border and padding
  so decomposed pill variables can still produce visible computed borders.
- Shorthand border variables remain in the SCSS module. Decomposed
  color/style/width border variables are applied as a selective dynamic
  compatibility bridge from the renderer, following the Avatar migration.
- Keep metadata decoupled from `BadgeReact.tsx`. Importing React constants from
  metadata pulled in `Badge.module.scss` during metadata generation and failed
  because that pipeline should not need the React implementation stylesheet.
- The copied old tests needed the old `getStyles` helper API. The rewrite
  helper module now exports a compatible `getStyles(locator, style,
  pseudoElement?)` function.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui exec -- playwright test src/components/Badge/Badge.spec.ts`
  - 24 passed.
- `npm --workspace xmlui test`
  - 37 files, 263 tests passed.
- `npm --workspace xmlui run compatibility:css-module-import-audit`
  - passed; Badge uses direct SCSS module import.
- `npm --workspace xmlui run build:metadata`
  - passed; generated metadata with 221 components and 3 examples.

Next component in the missing-component plan:

- `Stepper`

# Avatar Migration Findings - 2026-06-24

Old source anchors:

- `/Users/dotneteer/source/xmlui/xmlui/src/components/Avatar/Avatar.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Avatar/AvatarReact.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Avatar/Avatar.module.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Avatar/Avatar.defaults.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Avatar/Avatar.md`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Avatar/Avatar.spec.ts`

Rewrite files:

- `xmlui/src/components/Avatar/Avatar.tsx`
- `xmlui/src/components/Avatar/AvatarReact.tsx`
- `xmlui/src/components/Avatar/Avatar.renderer.tsx`
- `xmlui/src/components/Avatar/Avatar.module.scss`
- `xmlui/src/components/Avatar/Avatar.defaults.ts`
- `xmlui/src/components/Avatar/Avatar.md`
- `xmlui/src/components/Avatar/Avatar.spec.ts`

What was migrated:

- Copied old docs, defaults, and the old 97-test E2E suite.
- Added source-adjacent metadata, renderer, React implementation, SCSS module,
  compiler/lowerer registration, runtime registry registration, and an Avatar
  E2E driver.
- Extended `?example=missingVisualComponentsFoundation` with a state-mutating
  Avatar path so the component can be visually checked from `npm run dev`.

Compatibility notes:

- Size tokens are fixed old values: `xs` 24px/12px, `sm` 48px/16px,
  `md` 64px/20px, and `lg` 96px/32px.
- Relative and data URLs are normalized with the old leading-slash behavior.
- Clickability must be based on whether the XMLUI node actually declares the
  event. Do not infer clickability from adapter fallback event functions.
- Old shorthand border theme variables (`border-Avatar`,
  `borderHorizontal-Avatar`, `borderVertical-Avatar`, and side-specific
  variants) belong in the SCSS module cascade.
- Old decomposed border theme variables (`borderColor-*`, `borderStyle-*`,
  `borderWidth-*`, including horizontal/vertical/side variants) must not be
  expressed as broad SCSS longhands on the same class, because unresolved CSS
  variable longhands can override or neutralize shorthand border behavior.
  Avatar uses a selective renderer bridge that emits dynamic longhand style
  only when those decomposed variables are actually present. Treat this as a
  compatibility bridge for legacy theme semantics, not a general license to
  move component visual styling into inline styles.

Verification:

- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --workspace xmlui exec -- playwright test src/components/Avatar/Avatar.spec.ts`
  - 97 passed.
- `npm --workspace xmlui test`
  - 37 files, 263 tests passed.
- `npm --workspace xmlui run compatibility:css-module-import-audit`
  - passed; Avatar uses direct SCSS module import.
- `npm --workspace xmlui run build:metadata`
  - passed; generated metadata with 220 components and 3 examples.

Next component in H1A:

- `Badge`

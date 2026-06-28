# Avatar Source-Preserving Migration Findings

Date: 2026-06-28

## Source Of Truth

- Old component folder:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/Avatar`
- Copied protected files:
  - `AvatarReact.tsx`
  - `Avatar.module.scss`
- Preserved old E2E file:
  - `xmlui/src/components/Avatar/Avatar.spec.ts`

## Migration Edits

- Restored old `AvatarReact.tsx` and `Avatar.module.scss` with import-path
  shims only.
- Kept Avatar behavior at the renderer boundary:
  - `Avatar.renderer.tsx` normalizes resource URLs;
  - bridges `rootAttrs().className` into the old `classes[COMPONENT_PART_KEY]`
    prop;
  - passes adapter root attributes and style through to the copied React root.
- Adapted `Avatar.tsx` metadata without importing the SCSS module directly.
  Direct SCSS imports in metadata break Vite config loading because the config
  graph imports component metadata before normal Sass/CSS handling runs.

## Shared Infrastructure Findings

- Old border theme semantics require generated side variables. The rewrite now
  generates border segment variables from aggregate, axis, side, color, style,
  and width theme variables in shared theme code.
- Generated border variables must be available in default theme construction,
  nested `ThemeScope`, and component theme classes. Explicit theme variables
  must still win over generated variables.
- CSS layer order is part of the compatibility contract. `main.tsx` previously
  imported runtime/component modules before `global.css`, allowing component
  SCSS `@layer components` to be registered before the intended global layer
  order. That let the base reset override Avatar border declarations. Moving
  `global.css` to the first import restored the intended `base` before
  `components` order.
- XMLUI app-context globals are part of the compiler/runtime contract. The
  Avatar docs/example markup
  `onClick="toast('Avatar clicked')"` initially failed with
  "Unresolved XMLUI script identifier 'toast'" because the rewrite had a toast
  service at runtime but no injected `AppContextObject` equivalent for semantic
  resolution. The fix creates one app-context object, lets script analysis
  resolve identifiers from that object's properties, injects the same object
  into `RuntimeScope`, and resolves context reads from it at runtime. Future
  app-context globals should be added to the injected object, not to a separate
  compiler name list.

## Verification

- `npx tsc -p xmlui/tsconfig.build.json --noEmit` passed.
- `npx vitest run tests/compiler/scriptSemantics.test.ts` passed: 46/46.
- `npm --workspace xmlui run test:e2e -- src/components/Avatar/Avatar.spec.ts`
  passed: 97/97.
- The exact Avatar/HStack/toast sample parsed successfully.
- The full global `npm --workspace xmlui run test:e2e` was not rerun after
  Avatar. It was already known red from the ProgressBar closure run.

## Residual Risk

- The Avatar focused suite is green, but the repository-wide component E2E
  baseline still has broader shared theme/variant failures to address before
  the plan's full coexistence gate can be considered green.

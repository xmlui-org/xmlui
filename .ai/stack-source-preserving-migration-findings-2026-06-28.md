# Stack Source-Preserving Migration Findings, 2026-06-28

## Scope

Migrated the Stack family as one approval unit:

- `Stack`
- `HStack`
- `VStack`
- `CHStack`
- `CVStack`
- `SpaceFiller`

Source of truth: `/Users/dotneteer/source/xmlui/xmlui/src/components/Stack`
and `/Users/dotneteer/source/xmlui/xmlui/src/components/SpaceFiller`.

## Preserved Files

- `xmlui/src/components/Stack/StackReact.tsx`
- `xmlui/src/components/Stack/Stack.module.scss`
- `xmlui/src/components/Stack/Stack.defaults.ts`
- `xmlui/src/components/SpaceFiller/SpaceFillerReact.tsx`
- `xmlui/src/components/SpaceFiller/SpaceFiller.module.scss`

The copied Stack React file has import-only shims for the rewrite
`ScrollViewerReact`, `ScrollStyle`, and compatibility hook/type modules.

## Key Findings

- Old Stack owns orientation through component CSS classes. The rewrite generic
  layout resolver also interprets any `orientation` prop and injects
  `display:flex` plus `flexDirection` into root style. That made shortcut
  components fail old tests when authors passed contradictory `orientation`
  props. The Stack renderer now strips generated `display` and `flexDirection`
  root styles before handing control to copied Stack classes.
- Old Stack uses renderer `layoutContext` to wrap children and ignore layout
  props in special parent-child layouts. The rewrite adapter does not expose
  that protocol yet. Stack currently emulates the needed direct-child behavior
  locally for explicit `itemWidth`, `wrapContent`, `SpaceFiller` breaks, star
  sizing, and dock layout.
- `SpaceFiller` must use the old `.spacer` class with
  `flex: 1 1 0 !important` and `place-self: stretch`. It is part of the Stack
  migration unit because Stack wrapping treats it as a flow item break.
- `SpaceFiller.module.scss?xmlui-theme-vars` did not load through the metadata
  build even though SpaceFiller has no actual theme vars. Metadata keeps empty
  theme var extraction while React/SCSS behavior is source-preserved.
- A Stack sample with `<VStack>` as the document root exposed a compiler
  compatibility regression. Old XMLUI allows any ordinary component as the
  application root; `<Component>` is the special reusable-component definition
  root and still requires `name`. The semantic parser, raw parser, and IR
  validator now preserve non-`Component` roots as app documents instead of
  requiring `<App>`.
- The same sample exposed a bad dependency shim: copied Stack imports the old
  internal `ThemedScroller`, but the rewrite had pointed that import at public
  `ScrollViewer`. Public `ScrollViewer` fills its parent (`height: 100%`);
  Stack's internal normal scroller should not impose that height. A
  `ThemedScroller` shim now preserves the old normal-scroll root div behavior
  for Stack while keeping public `ScrollViewer` unchanged.
- The follow-up visual check showed the rows still collapsed to content width.
  Root cause: the rewrite bridge passed metadata default alignment values
  (`"start"`) into copied Stack React even when the author omitted the props.
  Old Stack only applies alignment classes for authored/fixed alignment props,
  so a plain `VStack` keeps flexbox's default cross-axis stretch. The bridge now
  omits alignment props unless authored or fixed by `CHStack`/`CVStack`; the
  regression spec asserts row width equals the root width.
- A `verticalAlignment="end"` sample on default vertical `Stack` exposed that
  the generic layout resolver can also fight copied Stack alignment classes.
  The resolver emitted inline `alignItems: flex-end` from the XMLUI alignment
  prop, moving the child to the right, while old Stack CSS treats
  `verticalAlignment` as the main-axis/bottom alignment for a vertical stack.
  The bridge now removes generated inline `alignItems`/`justifyContent` when
  XMLUI `horizontalAlignment` or `verticalAlignment` props are authored, but
  keeps explicit CSS `alignItems` and `justifyContent` props available.

## Verification

- `npx tsc -p xmlui/tsconfig.build.json --noEmit`
- `npm --prefix xmlui run check:metadata`
- Compiler root compatibility:
  `npm --prefix xmlui exec vitest run tests/compiler/parser/compatibility.test.ts tests/compiler/rawXmlui.test.ts tests/compiler/ir.test.ts tests/compiler/codegen.test.ts tests/compiler/renderingPipeline.test.ts`
  passed with `56 passed`.
- Focused:
  `npm --workspace xmlui run test:e2e -- src/components/Stack/Stack-regression.spec.ts src/components/Stack/Stack.spec.ts src/components/Stack/HStack.spec.ts src/components/Stack/VStack.spec.ts src/components/Stack/CHStack.spec.ts src/components/Stack/CVStack.spec.ts src/components/SpaceFiller/SpaceFiller.spec.ts --workers=1`
  passed with `17 passed, 83 skipped`.
- Side-by-side migrated batch:
  `npm --workspace xmlui run test:e2e -- src/components/ProgressBar/ProgressBar.spec.ts src/components/Avatar/Avatar.spec.ts src/components/Badge/Badge.spec.ts src/components/Br/Br.spec.ts src/components/Icon/Icon.spec.ts src/components/Button/Button.spec.ts src/components/Button/Button-style.spec.ts src/components/Checkbox/Checkbox.spec.ts src/components/Switch/Switch.spec.ts src/components/Text/Text.spec.ts src/components/Heading/Heading.spec.ts src/components/Heading/HeadingShortcuts.spec.ts src/components/Heading/Heading-style.spec.ts src/components/Stack/Stack-regression.spec.ts src/components/Stack/Stack.spec.ts src/components/Stack/HStack.spec.ts src/components/Stack/VStack.spec.ts src/components/Stack/CHStack.spec.ts src/components/Stack/CVStack.spec.ts src/components/SpaceFiller/SpaceFiller.spec.ts --workers=1`
  passed with `858 passed, 89 skipped`.

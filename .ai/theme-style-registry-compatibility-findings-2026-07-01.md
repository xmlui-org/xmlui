# Theme Style Registry Compatibility Findings - 2026-07-01

## Source of Truth

- Original component hook:
  `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/utils.ts`
- Original style registry:
  `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/StyleContext.tsx`
  and `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/StyleRegistry.ts`
- Original Theme component:
  `/Users/dotneteer/source/xmlui/xmlui/src/components/Theme/ThemeReact.tsx`

## Original Behavior

Original XMLUI does not put component theme custom properties directly into
each component's `style` attribute. `useComponentThemeClass()` collects the
component's declared/default theme variables, then calls the style registry via
`useStyles()`. The registry injects a generated CSS class such as `css-*` into a
stylesheet and the component receives that class name.

The original `Theme` component follows the same pattern for scoped theme vars:
it builds a style object with an `&` rule, injects it through `useStyles(...,
{ layer: "themes" })`, and applies the generated class to the wrapper/root.

Inline style remains appropriate for layout props and genuinely dynamic values,
but not for repeated theme variable bags.

## Rewrite Fix

- `xmlui/src/runtime/rendering/theme.tsx` now uses generated dynamic classes for
  root theme variables, component theme variables, and scoped Theme variables.
- The scoped Theme wrapper also moves its `display: contents` rule into the
  generated class. The rewrite filters the shared layout resolver's default
  `boxSizing: "border-box"` value so an implicit Theme wrapper does not emit a
  `style` attribute just for default layout plumbing.
- `useComponentThemeClass()` keeps the public return shape but returns an empty
  `style` object after the variables have been assigned through the generated
  class. This keeps compatibility wrappers that still spread `themeClass.style`
  from reintroducing inline theme vars.
- `xmlui/src/runtime/rendering/adapter.tsx` no longer merges theme variables
  into `adapter.style` or `rootAttrs().style`; it keeps layout styles there.
- `xmlui/src/components-core/theming/StyleContext.tsx` can inject generated
  styles into a named CSS layer, including `themes`.
- `xmlui/src/components/App/AppReact.tsx` now applies the resolved App theme
  variables through the generated theme class on both the App root and the
  mobile drawer host. App keeps truly dynamic shell measurements and layout
  values inline.
- `xmlui/src/runtime/rendering/builtins.tsx` uses the same generated theme
  class path for the built-in fallback App renderer.
- `xmlui/src/components/Link/Link.renderer.tsx` routes the current-variant
  `--xmlui-current-*` variables through generated CSS instead of the rendered
  link's inline style.
- The remaining TableOfContents scan hit is intentionally different: it uses an
  inline active-state `backgroundColor` value that references an existing CSS
  variable, but it does not define theme custom properties inline.

## Verification

- `XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- src/components/Theme/Theme.spec.ts`
- `XMLUI_REUSE_EXISTING_SERVER=0 npm --workspace xmlui run test:e2e -- src/components/Link/Link.spec.ts`
- `npm --workspace xmlui exec -- vitest run src/components/App/App.spec.tsx tests/compiler/renderingAdapter.test.tsx`
- `npm --workspace xmlui exec -- tsc -p tsconfig.build.json --noEmit`
- `npm --prefix xmlui run check:metadata`
- Production-code scan:
  `rg -n "style=.*--xmlui|style=\\{\\{[^\\n]*--xmlui|style\\[.*--xmlui|themeVariablesToCssProperties\\(resolveThemeVariablesWithCssVars|themeVariablesToCssProperties\\(useThemeVariables\\(\\)" xmlui/src xmlui/tests -g '*.ts' -g '*.tsx'`

New regressions assert that TextBox and scoped Theme variables are applied by
generated CSS classes and that their `style` attributes do not contain
`--xmlui-*` variables.

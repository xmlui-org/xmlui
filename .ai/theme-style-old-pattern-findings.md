# Theme and Style Old-Pattern Findings

Date: 2026-07-12  
Plan: `.plans/theme-style-old-pattern-migration-plan.md`  
Old source: `/Users/dotneteer/source/xmlui`  
Rewrite source: `/Users/dotneteer/source/xmlui-rs`

## Purpose

This note freezes the Step 1 compatibility inventory for migrating the rewrite
back to the old XMLUI style and theme pattern. The old project remains the
contract. The rewrite currently has enough copied metadata and theme files to
look close at the source level, but the active runtime wiring is materially
different.

## Source Anchors

Old runtime and aggregation contract:

- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/ThemeProvider.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/ThemeContext.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/StyleRegistry.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/StyleContext.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/themeVars.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/transformThemeVars.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/extendThemeUtils.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/hvar.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/_themes.scss`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/themes/root.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/themes/xmlui.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/ComponentProvider.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components/Theme/*`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/rendering/AppRoot.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/rendering/AppWrapper.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/testing/infrastructure/TestBed.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/nodejs/bin/ssg.ts`

Rewrite files that must be reconciled:

- `xmlui/src/runtime/rendering/theme.tsx`
- `xmlui/src/components-core/theming/ThemeContext.tsx`
- `xmlui/src/components-core/theming/ThemeProvider.tsx`
- `xmlui/src/components-core/theming/StyleContext.tsx`
- `xmlui/src/components-core/theming/StyleRegistry.ts`
- `xmlui/src/components-core/theming/utils.ts`
- `xmlui/src/styling/theme.ts`
- `xmlui/src/component-core/registry.ts`
- `xmlui/src/component-core/runtimeRegistry.ts`
- `xmlui/src/runtime/index.tsx`
- `xmlui/src/components/Theme/*`

Website and extension theme sources included in this inventory:

- `website/src/themes/*.ts`
- `packages/xmlui-search/src`
- `packages/xmlui-website-blocks/src`
- `packages/xmlui-docs-blocks/src`
- `packages/xmlui-echart/src`
- `packages/xmlui-calendar/src`
- `packages/xmlui-gauge/src`
- `packages/xmlui-grid-layout/src`
- `packages/xmlui-masonry/src`
- `packages/xmlui-tiptap-editor/src`

## Metadata Comparison

Machine-readable comparison:
`.ai/theme-style-old-pattern-metadata-comparison.json`.

Summary from the comparison:

| Area | Old | Rewrite |
| --- | ---: | ---: |
| Scanned source files | 724 | 869 |
| Files containing `themeVars:` | 94 | 97 |
| Files containing `defaultThemeVars:` | 78 | 80 |
| Files containing `toneSpecificThemeVars:` | 0 | 0 |
| Files containing `themeVarContributorComponents:` | 3 | 3 |
| Files containing `valueType:` | 118 | 121 |
| `themeVars:` occurrences | 121 | 124 |
| `defaultThemeVars:` occurrences | 101 | 104 |
| `valueType:` occurrences | 948 | 937 |
| Website-local theme files | 7 | 7 |

The source-level metadata footprint is close enough to make a strict migration
practical. The difference is not mainly missing copied metadata; it is the
active runtime aggregation and theme application pattern.

## Old Behavior to Preserve

The old `ComponentProvider` collects registered component theme metadata into
three runtime surfaces:

- `componentThemeVars`: a `Set<string>` of every theme variable declared by
  component metadata.
- `componentThemeVarDeclarations`: a typed declaration map used by strict
  validation.
- `componentDefaultThemeVars`: a deeply merged object of component default
  theme values.

The old `ThemeProvider` consumes that registry data. It builds the active theme
from custom themes, built-ins, root defaults, component defaults, tone-specific
theme vars, theme `extends`, generated variables, hierarchical fallback
matching, resource maps, font resources, strict validation, and accessibility
contrast diagnostics.

The old `StyleRegistry` and `StyleProvider` are real runtime infrastructure.
They provide stable hashes, nested selector and at-rule generation, CSS layers,
root class collection, SSR style extraction, SSR hash hydration, reference
counting, cleanup, parent-provider reuse, and document/shadow-root injection
targets.

The old `useComponentThemeClass` is tied to `ThemeScope` and
`ComponentProvider`. It collects the descriptor's theme vars, default theme
vars, and contributor component metadata; strips legacy namespaces such as
`Input:` and `Heading:`; reads already-resolved `themeScope.themeVars`; and
emits CSS variables through `useStyles(..., { layer: "themes" })`.

The old `<Theme>` component is part of the same provider model. It handles
`themeId`, `tone`, `root`, `applyIf`, `disableInlineStyle`, empty-wrapper
elision, dynamic theme props, root class propagation, portal root tracking, and
notification defaults.

## Rewrite Divergences Found

The rewrite currently has two parallel theme systems:

- `XmluiThemeRoot` and `ThemeScope` in `xmlui/src/runtime/rendering/theme.tsx`;
- `LegacyThemeProvider` in `xmlui/src/components-core/theming/ThemeContext.tsx`.

The old project has one authoritative `ThemeProvider` plus a root `<Theme
root />` wrapper. This split can make root config themes, nested `<Theme>`
scopes, component-generated CSS vars, and website-local theme files disagree.

The rewrite metadata types contain `themeVars`, `defaultThemeVars`,
`toneSpecificThemeVars`, and `themeVarContributorComponents`, but
`xmlui/src/component-core/registry.ts` and
`xmlui/src/component-core/runtimeRegistry.ts` do not expose the old
`componentThemeVars`, `componentThemeVarDeclarations`, or
`componentDefaultThemeVars` aggregation contract.

The rewrite's `components-core/theming/StyleRegistry.ts` is only a type
definition, and `components-core/theming/StyleContext.tsx` is mostly a
compatibility shim with a small dynamic-style cache. The active runtime also
has a separate flat CSS-property registry in `runtime/rendering/theme.tsx`.
Neither path matches the old `StyleRegistry` contract.

The rewrite's `components-core/theming/ThemeProvider.tsx` compiles a simplified
theme stack from `xmlui/src/styling/theme.ts`. It does not currently consume
component registry theme vars, component defaults, typed declarations,
hierarchical fallback matching, strict diagnostics, contrast checks, or
FontFace loading the same way the old provider does.

The rewrite's `components-core/theming/utils.ts` infers a component name from
metadata and delegates to runtime `createComponentThemeClass`. That is not the
old descriptor/contributor/theme-scope cascade.

## Old Unit Tests to Port

The old project has focused theming unit tests under
`/Users/dotneteer/source/xmlui/xmlui/tests/components-core/theming`.
The rewrite currently has no `xmlui/tests/components-core/theming` directory.

Old test files and test counts:

| Old test file | Count |
| --- | ---: |
| `ThemeProvider.test.tsx` | 3 |
| `border-segments.test.ts` | 68 |
| `component-layout.resolver.test.ts` | 70 |
| `layout-property-parser.test.ts` | 75 |
| `layout-resolver-disabled.test.ts` | 6 |
| `layout-resolver.test.ts` | 174 |
| `layout-resolver2.test.ts` | 23 |
| `layout-vp-override.test.ts` | 55 |
| `padding-segments.test.ts` | 42 |
| `responsive-layout.test.ts` | 91 |
| `validator.test.ts` | 49 |

No old unit test maps to Step 1 as an inventory-only test. These tests should
be ported in the implementation steps that restore the behavior they exercise:
StyleRegistry/StyleContext in Step 2, ThemeProvider and transform helpers in
Step 5, validator behavior in Step 6, and Theme/component cascade behavior in
Steps 7-9.

## Step 1 Conclusion

Step 1 should be treated as complete when this note, the JSON comparison, and
the required verification gates pass. The next implementation step should not
start by inventing new theme behavior. It should restore the old
`StyleRegistry`/`StyleContext` contract first, then reintroduce the old
provider aggregation and `<Theme>` behavior on top of it.

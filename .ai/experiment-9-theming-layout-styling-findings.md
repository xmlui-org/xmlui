# Experiment 9: Theming, Layout, and Styling Findings

Status: Initial compatibility note

## Original XMLUI References

- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/layout-resolver.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/component-layout-resolver.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/responsive-layout.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/ThemeProvider.tsx`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/StyleRegistry.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/theming/themeVars.ts`
- `/Users/dotneteer/source/xmlui/xmlui/src/components-core/descriptorHelper.ts`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/styles-and-themes/layout-props.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/styles-and-themes/theme-variables.md`
- `/Users/dotneteer/source/xmlui/website/content/docs/pages/styles-and-themes/themes.md`

## Preserved in This Experiment

- Universal layout prop recognition starts from the original layout prop inventory.
- `$name` theme references resolve to `var(--xmlui-name)`.
- Initial layout resolution covers sizing, spacing, alignment, border, overflow, text basics, opacity, cursor, flex shrink/wrap, and star sizing.
- Theme scoping is represented with CSS custom properties and subtree-local wrappers.
- Built-ins receive stable component and part hooks through `data-xmlui-component` and `data-xmlui-part`.
- Styling props can be expression-backed and update after XMLUI state mutation.

## Deferred

- Full old `StyleRegistry` behavior.
- Full built-in theme catalog, palette generation, tones, fonts, resources, validation, and contrast checks.
- Complete component-part theme variable cascade.
- Complete responsive and state style application.
- Static CSS extraction for SSG and hydration.

The implementation intentionally keeps pure resolver and theme-variable helpers separate from React so future compiler diagnostics, LSP features, visual tests, and SSG extraction can reuse the same compatibility rules.


---
"xmlui": patch
---

Sealed theming sandbox — hot-path wiring (Plan #08 Phase 1 Step 1.2 + Phase 2 Steps 2.1 + 2.2).

- `ComponentRegistry` gains a `componentThemeVarDeclarations` getter (`ReadonlyMap<string, ThemeVarMetadata>`) built during component registration.
- `ThemeProvider` / `useCompiledTheme` now calls `validateTheme()` after the merged theme is resolved. Diagnostics are emitted via `pushXsLog` (`kind: "theming"`) and `console.warn`/`console.error`. In strict mode, error-severity invalid declarations are dropped from the resolved theme map. Gated behind `import.meta.env.DEV || strictTheming` for zero production cost.
- `AppWrapper` threads `globalProps?.strictTheming` down to `ThemeProvider` as a new `strictTheming` prop.
- `ValueExtractor` type gains two new methods: `asLayoutProp(propName, expression, valueType?)` (validates via `validateInlineStyle`, emits diagnostics) and `asStyleProp(expression, componentName?)` (validates via `validateStyleString`, emits diagnostics). Both methods respect `appGlobals.strictTheming`, `appGlobals.allowInlineRawCss`, and `appGlobals.maxZIndex`.
- `LabelBehavior` updated to call `extractValue.asStyleProp()` instead of plain `extractValue()` for the `style` prop.

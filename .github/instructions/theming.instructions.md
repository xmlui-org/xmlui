---
applyTo: "**/*.module.scss"
---

# XMLUI Theming & SCSS Rules

These rules apply whenever editing SCSS module files.

## Reference documentation

| Topic | AI Doc |
|-------|--------|
| Theming system | `.ai/xmlui/theming-styling.md` |
| SCSS conventions | `.ai/xmlui/components/styling.md` |
| Parts pattern | `.ai/xmlui/components/parts.md` |

Verified rules: `guidelines.md` at the repo root (Topic 7).

## Theme variable pattern

```scss
@use "../../components-core/theming/themes" as *;

$themeVars: (
  "property-ComponentName": createThemeVar("property-ComponentName", defaultValue),
);

:export {
  themeVars: exportThemeVars($themeVars);
}

.root {
  color: getThemeVar($themeVars, "color-text-ComponentName");
}
```

## Key conventions

- Variable naming: `property-ComponentName[-VariantName]`
- Use `createThemeVar()` for every theme variable
- Always include the `:export { themeVars }` block
- Use `getThemeVar()` to read theme variables in CSS rules
- No hardcoded colors or sizes that should be theme variables

## Key prohibitions

- Do NOT use `!important` unless absolutely necessary
- Do NOT hardcode colors — use theme variables
- Do NOT use global CSS — everything is scoped via CSS modules

# Component Styling & Theme Variables

Visual components use a SCSS module for styles and theme variables. Non-visual components skip this entirely.

## SCSS Module Structure

```scss
// ComponentName.module.scss
@use "../../components-core/theming/themes" as t;

// ─── Required boilerplate: collects theme variable names ──────────────────────
$themeVars: ();
@function createThemeVar($componentVariable) {
  $themeVars: t.appendThemeVar($themeVars, $componentVariable) !global;
  @return t.getThemeVar($themeVars, $componentVariable);
}

// ─── Declare theme variables ──────────────────────────────────────────────────
$backgroundColor-ComponentName: createThemeVar("backgroundColor-ComponentName");
$borderColor-ComponentName:     createThemeVar("borderColor-ComponentName");
$textColor-ComponentName:       createThemeVar("textColor-ComponentName");

// Variant-specific variables follow the pattern: property-Component-Variant
$backgroundColor-ComponentName-Primary: createThemeVar("backgroundColor-ComponentName-Primary");

// ─── CSS rules ────────────────────────────────────────────────────────────────
.component {
  background-color: $backgroundColor-ComponentName;
  border: 1px solid $borderColor-ComponentName;
  color: $textColor-ComponentName;

  &.primary {
    background-color: $backgroundColor-ComponentName-Primary;
  }

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

// ─── Required export: the renderer reads this ─────────────────────────────────
:export {
  themeVars: t.json-stringify($themeVars);
}
```

## Using in the Renderer

```typescript
import styles from "./ComponentName.module.scss";
import { parseScssVar } from "../../components-core/theming/utils";

// In metadata:
themeVars: parseScssVar(styles.themeVars),
defaultThemeVars: {
  "backgroundColor-ComponentName": "transparent",
  "borderColor-ComponentName": "#cccccc",
  "textColor-ComponentName": "inherit",
},
```

## Naming Conventions

Full convention: `property[-partNameOrScreenSize][-ComponentName][-variantName][--stateName][--stateNameN]`

`-` separates positional segments; `--` introduces state names. Segment classification is by first letter:

| Position | Segment | Case | Identification |
|----------|---------|------|----------------|
| 1 | `property` | camelCase | required; starts lowercase |
| 2 | `partName` or `screenSize` | camelCase/lowercase | `xs`/`sm`/`md`/`lg`/`xl` = screen size; else part name |
| 3 | `ComponentName` | PascalCase | starts uppercase |
| 4 | `variantName` | camelCase | starts lowercase |
| after `--` | `stateName` (repeatable) | camelCase | follows `--` |

| Pattern | Example |
|---|---|
| `property-ComponentName` | `backgroundColor-Button` |
| `property-screenSize-ComponentName` | `fontSize-sm-Text` |
| `property-partName-ComponentName` | `backgroundColor-label-Button` |
| `property-ComponentName-variantName` | `backgroundColor-Button-primary` |
| `property-ComponentName--stateName` | `borderColor-Input--focus` |

Writing `Primary` (uppercase) where a variant is expected is rejected as a duplicate component name.

## Parts Styling

Each part gets its own theme variable scope. Apply `partClassName()` in the native component so tests and theme rules can target individual parts (see `parts.md`).

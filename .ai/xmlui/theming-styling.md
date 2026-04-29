# Theming & Styling

## Architecture Overview

XMLUI theming converts declarative theme definitions (TypeScript/JSON) into CSS custom properties (`--xmlui-*`) applied at runtime. Components declare which theme variables they use via SCSS modules; the framework resolves values through an inheritance chain and injects them per-component.

**Pipeline:** ThemeDefinition → inheritance chain → tone overlay → derived token generation → `$ref` resolution → CSS variable injection → SCSS module consumption

## Key Files

| File | Role |
|------|------|
| `components-core/theming/ThemeProvider.tsx` | Root provider; compiles theme chain; provides `ThemeContext` + `ThemesContext` |
| `components-core/theming/ThemeContext.tsx` | Context definitions: `ThemeScope`, `AppThemes` |
| `components-core/theming/themes/root.ts` | Root theme: design tokens (spacing, fonts, colors, shadows) |
| `components-core/theming/themes/xmlui.ts` | Built-in themes (xmlui, xmlui-green, xmlui-gray, etc.) |
| `components-core/theming/extendThemeUtils.ts` | `collectThemeChainByExtends()` — builds inheritance chain |
| `components-core/theming/transformThemeVars.ts` | Derived token generation (spacing scale, color tones, button states) |
| `components-core/theming/themeVars.ts` | SCSS variable parsing utilities |
| `components-core/theming/utils.ts` | `useComponentThemeClass()`, `parseScssVar()` |
| `components-core/theming/layout-resolver.ts` | Responsive layout: breakpoints, star sizing, shorthand expansion |
| `components-core/theming/responsive-layout.ts` | `buildResponsiveStyleObjects()` — media queries and parts |
| `components-core/theming/parse-layout-props.ts` | Theme variable name parser (property, part, breakpoint, state) |
| `components-core/theming/StyleContext.tsx` | `useStyles()` — hash-based CSS injection with `@layer` |
| `components-core/theming/component-layout-resolver.ts` | Component-level layout resolution |
| `components-core/parts/index.ts` | Part constants (e.g. `PART_LABEL`) |

## ThemeDefinition Interface

```typescript
interface ThemeDefinition {
  id: string;
  extends?: string | string[];        // parent theme(s)
  color?: string;                      // primary color (can be $ref)
  resources?: Record<string, any>;     // fonts, images
  themeVars?: Record<string, string>;  // CSS variable definitions
  tones?: {
    light?: ThemeDefinitionDetails;    // { themeVars, resources }
    dark?: ThemeDefinitionDetails;
  };
}
```

## Theme Inheritance

- `extends` creates a chain: `[RootTheme] → [...parentThemes] → currentTheme`
- Variables merge left-to-right; later themes override earlier
- Multiple inheritance: `extends: ["xmlui", "other"]` — processed in array order
- All built-in themes extend `xmlui`, which implicitly extends `root`
- `collectThemeChainByExtends()` in `extendThemeUtils.ts` builds the chain

## Theme Compilation (useCompiledTheme)

1. Build chain via `collectThemeChainByExtends(activeTheme, allThemes, componentDefaults)`
2. Merge base `themeVars` across chain (left-to-right)
3. Apply active tone overrides (`tones.light.themeVars` or `tones.dark.themeVars`)
4. Generate derived tokens:
   - **Spacing scale** from `space-base`: 34 tokens (`space-0` through `space-96`, fractional: `space-0_5`, `space-1_5`, etc. — underscores replace dots)
   - **Font size scale** from `fontSize`: `const-fontSize-tiny` through `const-fontSize-9xl`
   - **Color palettes**: 7 families × 13 tones (0, 50, 100, ..., 950, 1000) as `const-color-{family}-{tone}` + runtime alpha/tone variants
   - **Button state variants**: `backgroundColor-Button-{variant}-{style}--{state}`
   - **Shorthand expansions**: `paddingHorizontal` → `paddingLeft` + `paddingRight`
5. Resolve `$references`: `$color-primary-500` → `var(--xmlui-color-primary-500)`
6. Output: `Record<string, string>` with `--xmlui-` prefixed keys

## Root Theme Tokens

| Category | Key tokens | Source |
|----------|-----------|--------|
| Spacing | `space-base` → `space-0` through `space-96` (fractional: `space-0_5`, `space-1_5`, etc.) | `root.ts` |
| Font sizes | `fontSize` → `fontSize-tiny` through `fontSize-9xl`, `const-fontSize-*` | `root.ts` |
| Colors | 7 families: primary, secondary, info, success, warn, danger, surface | `root.ts` |
| Color tones | Each family → 50, 100, 200, ..., 950 + alpha variants | Generated |
| Typography | `fontWeight-*`, `fontFamily-*`, `lineHeight-*`, `letterSpacing-*` | `root.ts` |
| Effects | `boxShadow-sm/md/lg/xl`, `borderRadius-*`, `outline-*` | `root.ts` |
| Layout | `maxWidth-xs` through `maxWidth-xxl` | `root.ts` |

## Built-in Themes

| Theme ID | Color scheme |
|----------|-------------|
| `xmlui` | Blue (default) |
| `xmlui-green` | Green |
| `xmlui-gray` | Neutral |
| `xmlui-orange` | Orange |
| `xmlui-purple` | Purple |
| `xmlui-cyan` | Cyan |
| `xmlui-red` | Red |
| `xmlui-blog` | Blog site |
| `xmlui-web` | Marketing site |
| `xmlui-docs` | Documentation site |

All extend `xmlui` and override color variables.

## Tone Management (Light/Dark)

- Two tones: `light` and `dark`
- Tone-specific variables override base variables
- `ThemesContext` exposes: `activeThemeTone`, `setActiveThemeTone(tone)`, `toggleThemeTone()`
- `ToneSwitch` component: lightweight toggle with sun/moon icons
- `ToneChangerButton`: deprecated, same functionality

**Merge order:** base themeVars → tone-specific themeVars from `tones[tone].themeVars`

## Theme Variable Naming Convention

```
property[-partNameOrScreenSize][-ComponentName][-variantName][--stateName]
```

| Segment | Case | Notes |
|---------|------|-------|
| `property` | camelCase | Required, starts lowercase: `backgroundColor`, `fontSize`, `color` |
| `partName` or `screenSize` | camelCase/lowercase | `xs`/`sm`/`md`/`lg`/`xl`/`xxl` = screen; else part name |
| `ComponentName` | PascalCase | Starts uppercase |
| `variantName` | camelCase | Starts lowercase |
| `stateName` | camelCase | Follows `--` delimiter, repeatable |

**Examples:**
- `backgroundColor-Button` — property + component
- `fontSize-sm-Text` — property + screenSize + component
- `backgroundColor-label-Button` — property + part + component
- `backgroundColor-Button-primary` — property + component + variant
- `borderColor-Input--focus` — property + component + state
- `backgroundColor-Button-primary-solid--hover` — full pattern

## SCSS Module Boilerplate

Every visual component follows this pattern:

```scss
@use "../../components-core/theming/themes" as t;

$themeVars: ();
@function createThemeVar($componentVariable) {
  $themeVars: t.appendThemeVar($themeVars, $componentVariable) !global;
  @return t.getThemeVar($themeVars, $componentVariable);
}

$backgroundColor-Foo: createThemeVar("backgroundColor-Foo");
$textColor-Foo: createThemeVar("textColor-Foo");

.component { background-color: $backgroundColor-Foo; color: $textColor-Foo; }

:export { themeVars: t.json-stringify($themeVars); }
```

## Renderer Integration

```typescript
import styles from "./Foo.module.scss";
import { parseScssVar } from "../../components-core/theming/utils";

// In metadata:
themeVars: parseScssVar(styles.themeVars),
defaultThemeVars: {
  "backgroundColor-Foo": "transparent",
  "textColor-Foo": "inherit",
},
```

## useComponentThemeClass() Hook

1. Reads component metadata's `themeVars` and `defaultThemeVars`
2. Collects vars from `themeVarContributorComponents` (shared variable contributors)
3. Looks up resolved values from `themeScope.themeVars`
4. Creates CSS variable object with `--xmlui-` prefix
5. Passes to `useStyles()` → returns className

**Pattern in Native component:**
```typescript
const themeClassName = useComponentThemeClass(descriptor);
return <div className={classnames(themeClassName, styles.component)}>{children}</div>;
```

**ThemedX wrapper pattern:** A `Themed<Component>` wrapper applies `useComponentThemeClass()` and passes the className. `wrapComponent` receives the ThemedX wrapper, not the bare native component.

## Style Injection (useStyles)

- `StyleContext.tsx` provides `useStyles(styleObject, options)`
- Style objects are hashed for deduplication
- CSS injected via `<style>` elements with `data-style-hash` attribute
- `@layer` directives organize cascade: `@layer dynamic { ... }`
- Reference counting for cleanup on unmount
- Supports `ShadowRoot` injection target

## Responsive Layout

### Breakpoints

| Name | Min width | CSS variable `--screenSize` |
|------|-----------|----------------------------|
| `xs` | 0 (base) | 0 |
| `sm` | 576px | 1 |
| `md` | 768px | 2 |
| `lg` | 992px | 3 |
| `xl` | 1200px | 4 |
| `xxl` | 1400px | 5 |

### Responsive Property Syntax

```xml
<Stack width="100%" width-sm="400px" width-md="600px" padding="$space-2" padding-md="$space-4" />
```

`-sm`, `-md`, etc. suffixes generate `@media (min-width: Npx)` rules.

### Star Sizing (Flex)

```xml
<HStack>
  <Box width="200px" />   <!-- fixed -->
  <Box width="1*" />      <!-- flex: 1 -->
  <Box width="2*" />      <!-- flex: 2 -->
</HStack>
```

`N*` converts to `flex: N; flexShrink: 1`.

### Shorthand Expansion

| Shorthand | Expands to |
|-----------|-----------|
| `paddingHorizontal` | `paddingLeft` + `paddingRight` |
| `paddingVertical` | `paddingTop` + `paddingBottom` |
| `marginHorizontal` | `marginLeft` + `marginRight` |
| `marginVertical` | `marginTop` + `marginBottom` |
| `borderHorizontal` | `borderLeft` + `borderRight` |
| `borderVertical` | `borderTop` + `borderBottom` |

### Layout Property Modes

| Mode | Properties included |
|------|-------------------|
| `dims` | width, minWidth, maxWidth, height, minHeight, maxHeight |
| `spacing` | dims + gap, padding (all), margin (all) |
| `all` (default) | dims + spacing + borders + radii + typography + transforms |

## Part-Based Styling

- Parts target sub-elements of a component
- Declared in metadata: `parts: { label: { ... }, input: { ... } }`
- Applied in native via `<Part partId={PART_LABEL}>` (from `components/Part/Part`) → sets `data-part-id` attribute
- Theme variables for parts: `color-label-Input`, `backgroundColor-input-Input`
- Layout properties for parts: `color-label-Input="$color-primary-600"`
- `defaultPart` in metadata: specifies which part gets default layout properties
- `COMPONENT_PART_KEY = "-component"` distinguishes root from named parts

## Variable Reference Resolution

- `$variable-name` in theme values → `var(--xmlui-variable-name)` in CSS output
- `THEME_VAR_PREFIX = "xmlui"` — all CSS variables prefixed with `--xmlui-`
- References resolve at compile time (during `useCompiledTheme`), not at SCSS build time
- Self-referencing or circular references: not checked, would produce invalid CSS

## Contexts

| Context | Hook | Provides |
|---------|------|----------|
| `ThemeContext` | `useTheme()` | `themeCssVars`, `getThemeVar()`, `getResourceUrl()`, `fontLinks` |
| `ThemesContext` | `useThemes()` | `activeThemeId`, `activeThemeTone`, `setActiveThemeId()`, `setActiveThemeTone()`, `toggleThemeTone()`, `themes[]` |
| `StyleInjectionTargetContext` | `useDomRoot()` | DOM target for `<style>` injection (document.head or ShadowRoot) |

## Theme Variable Injection Reduction (Nested Themes)

When multiple `<Theme>` elements are nested, the framework minimizes injected CSS variables via a 3-layer filtering system in `ThemeNative.tsx`:

### Layer 1: Decision gate (`needsCompiledVars`)

```typescript
const needsCompiledVars =
  tone !== undefined ||                                      // different tone from parent
  id !== undefined ||                                        // different theme from parent
  Object.keys(themeVars).some((key) => !parseHVar(key)?.component);  // base variables present
```

If `false`, **zero** compiled variables are injected onto the wrapper div. This prevents the wrapper from shadowing `<html>`'s CSS variables, which would break global tone-switching (children would inherit stale tone values from the closer ancestor div instead of the updated `<html>`).

### Layer 2: Component-based filtering

When compilation IS needed, each variable is checked:

```typescript
const rawKey = key.replace(/^--[^-]+-/, "");  // strip --xmlui- prefix
const componentName = parseHVar(rawKey)?.component;
const allowed =
  !componentName ||                              // base vars (no component suffix) → always
  registeredComponent?.isCompoundComponent ||     // user-defined components → always
  componentName === "Input" ||                    // special built-ins → always
  componentName === "Heading" ||
  componentName === "Footer" ||
  inComponentThemeVars;                           // vars referenced in templates → allowed
```

`parseHVar()` (in `hvar.ts`) parses the variable name: if the name contains a PascalCase segment (= component name), it's component-scoped. Variables without a component suffix are base variables and always pass.

**Filtered out:** Component-specific variables whose component is a native built-in NOT in the special list AND not referenced in any user-defined template. Example: `backgroundColor-Button-primary` is filtered if `Button` vars aren't referenced by descendant compound components.

### Layer 3: Explicit overrides always injected

User-provided `themeVars` prop values are always injected regardless of filtering:

```typescript
Object.entries(themeVars).forEach(([key, value]) => {
  filteredThemeCssVars[`--${THEME_VAR_PREFIX}-${key}`] = value;
});
```

### Practical effect

| Scenario | Variables injected |
|----------|-------------------|
| `<Theme themeVars={{ "width-navPanel-App": "250px" }}>` | Only the explicit override (layout-only, no compiled vars) |
| `<Theme tone="dark">` | Full filtered set (base + compound + special built-ins + template-referenced) |
| `<Theme id="xmlui-green">` | Full filtered set for the new theme |
| `<Theme themeVars={{ "color-primary": "red" }}>` | Full filtered set (base var triggers compilation) |

## Anti-patterns

- **Don't use raw CSS values when theme tokens exist** — use `$color-primary-500` not `#3b82f6`
- **Don't forget the SCSS `:export` block** — without it, `parseScssVar()` returns empty and no theme variables are collected
- **Don't pass bare native component to `wrapComponent`** — use the ThemedX wrapper that applies `useComponentThemeClass()`
- **Don't name variants with PascalCase** — `Primary` is parsed as a ComponentName, not a variant. Use `primary` (camelCase)
- **Don't use `--` for non-state separators** — `--` introduces state names only; structural segments use single `-`

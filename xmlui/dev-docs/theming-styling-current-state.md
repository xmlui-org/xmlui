# XMLUI Theming & Styling - Current State

## Overview

XMLUI uses a multi-layered theming system combining SCSS modules, CSS custom properties, React Context, and theme JSON files to provide dynamic, customizable styling across components.

## Architecture Components

### 1. Theme Variables System (SCSS)

**Location**: Component `.module.scss` files

**Key Function**: `createThemeVar()`
- Generates CSS custom properties (e.g., `--borderRadius-Image`)
- Registers variables for theme system collection
- Must be called at top-level (not inside `@mixin` or `@layer` blocks)

**Naming Convention**:
```
{property}-{part}-{component}-{screenSize}[--{state1}][--{state2}]
```

**Structure Components** (order matters):

1. **property** (required, camelCase): CSS property name
   - Must start with lowercase letter
   - Examples: `backgroundColor`, `borderRadius`, `fontSize`, `textColor`

2. **part** (optional, lowercase): Component sub-element
   - Must start with lowercase letter
   - Examples: `control`, `indicator`, `label`, `input`, `passwordToggle`

3. **component** (optional, PascalCase): Component name
   - Must start with uppercase letter
   - Examples: `Button`, `TextBox`, `Carousel`, `Image`

4. **screenSize** (optional): Responsive breakpoint
   - Valid values: `xs`, `sm`, `md`, `lg`, `xl`, `xxl`

5. **states** (optional, separated by `--`): Component states
   - Common states: `hover`, `focus`, `active`, `disabled`, `checked`
   - Validation states: `default`, `error`, `warning`, `success`
   - Can combine multiple states: `--hover--disabled`

**Key Rules**:
- Single dash `-` separates structural parts (property, part, component)
- Double dash `--` separates states (must be at the end)
- States must come after all structural parts
- Property names use camelCase, never kebab-case
- Component names must start with uppercase (PascalCase)
- Part names must start with lowercase

**Examples by Complexity**:

*Simple components:*
```scss
$borderRadius-Image: createThemeVar("borderRadius-Image");
$borderColor-Image: createThemeVar("borderColor-Image");
$width-IFrame: createThemeVar("width-IFrame");
```

*Components with states:*
```scss
$textColor-Button--hover: createThemeVar("textColor-Button--hover");
$backgroundColor-Button--disabled: createThemeVar("backgroundColor-Button--disabled");
$outlineColor-Link--focus: createThemeVar("outlineColor-Link--focus");
```

*Components with parts:*
```scss
$backgroundColor-control-Carousel: createThemeVar("backgroundColor-control-#{$component}");
$color-passwordToggle-TextBox: createThemeVar("Input:color-passwordToggle-#{$componentName}");
$paddingLeft-adornment-TextBox: createThemeVar("Input:paddingLeft-adornment-#{$componentName}");
```

*Components with parts and states:*
```scss
$backgroundColor-control-Carousel--hover: createThemeVar("backgroundColor-control-#{$component}--hover");
$color-passwordToggle-TextBox--focus: createThemeVar("Input:color-passwordToggle-#{$componentName}--focus");
$textColor-indicator-Carousel--hover--disabled: createThemeVar("textColor-indicator-#{$component}--hover--disabled");
```

*Validation variants (as states):*
```scss
$borderColor-TextBox--default: createThemeVar("Input:borderColor-#{$componentName}--default");
$borderColor-TextBox--error: createThemeVar("Input:borderColor-#{$componentName}--error");
$borderColor-TextBox--error--hover: createThemeVar("Input:borderColor-#{$componentName}--error--hover");
$backgroundColor-TextBox--warning--focus: createThemeVar("Input:backgroundColor-#{$componentName}--warning--focus");
```

*Responsive (with screen sizes):*
```scss
$fontSize-md-Text: createThemeVar("fontSize-md-Text");
$padding-lg-Button: createThemeVar("padding-lg-Button");
```

**Invalid Examples** (common mistakes):

```scss
// ❌ Wrong: kebab-case property name
$background-color-Button: createThemeVar("background-color-Button");
// Error: "background" is not a valid camelCase property

// ❌ Wrong: state uses single dash instead of double dash
$backgroundColor-Button-hover: createThemeVar("backgroundColor-Button-hover");
// Parsed incorrectly! 'Button' treated as part, 'hover' as component

// ❌ Wrong: state not at the end
$backgroundColor-hover-Button: createThemeVar("backgroundColor-hover-Button");
// Parsed incorrectly! 'hover' treated as part

// ❌ Wrong: component name doesn't start with uppercase
$backgroundColor-button: createThemeVar("backgroundColor-button");
// Parsed as part, not component
```

**SCSS Usage Best Practices**:

```scss
// ✅ Correct - createThemeVar() at top level (before @mixin/@layer)
$borderRadius-Image: createThemeVar("borderRadius-Image");
$backgroundColor-control-Carousel--hover: createThemeVar("backgroundColor-control-Carousel--hover");

@layer components {
  .img {
    border-radius: $borderRadius-Image;
  }
}

// ❌ Wrong - inside @layer (won't be collected by theme system)
@layer components {
  .img {
    border-radius: createThemeVar("borderRadius-Image");
  }
}

// ❌ Wrong - inside @mixin (won't be collected by theme system)
@mixin componentStyles {
  border-radius: createThemeVar("borderRadius-Image");
}
```

**Parser Implementation**: The `parseLayoutProperty()` function in `src/components-core/theming/parse-layout-props.ts` validates and parses theme variable names:

1. Splits by `--` to separate states from structural parts
2. Validates state names (must be non-empty, valid identifiers)
3. Splits main part by `-` to get segments
4. First segment = CSS property (validates camelCase)
5. Remaining segments processed in order:
   - Screen size breakpoint (xs, sm, md, lg, xl, xxl)
   - Component name (starts with uppercase)
   - Part name (starts with lowercase)
6. Returns `ParsedLayout` object or error message

Example parsing results:
```typescript
parseLayoutProperty('backgroundColor-control-Carousel--hover', true)
// Returns: {
//   property: 'backgroundColor',
//   part: 'control',
//   component: 'Carousel',
//   states: ['hover']
// }

parseLayoutProperty('fontSize-md-Text', true)
// Returns: {
//   property: 'fontSize',
//   component: 'Text',
//   screenSizes: ['md']
// }
```

### 2. StyleProvider Component

**Purpose**: CSS-in-JS and theme context provider

**Responsibilities**:
- Supplies theme values and design tokens via React Context
- Computes dynamic CSS classes from layout properties
- Handles responsive styling and breakpoint-aware tokens
- Memoizes theme-derived values for performance
- Translates markup properties to CSS:
  ```xml
  <Stack width="48px" backgroundColor="purple" />
  <!-- Becomes -->
  .stack_autogen_x1y2 { width:48px; background-color:purple; }
  ```

### 3. ThemeProvider Component

**Purpose**: High-level theme switching and persistence

**Context Hooks**:
- `useTheme()` - Read current theme information
  - `activeThemeTone`: "light" | "dark"
  - `activeTheme`: Current theme object
  - `getResourceUrl`: Function for theme-specific resources

- `useThemes()` - Theme control and management
  - `setActiveThemeTone()`: Switch between light/dark
  - `setActiveThemeId()`: Change themes
  - `themes`: Available theme definitions

**Integration**: Mounted in `AppWrapper` provider stack

### 4. ComponentRegistry

**Theme Variable Collection**:
- Collects all component theme variables during registration
- Maintains `componentThemeVars` set
- Stores `componentDefaultThemeVars` values
- Enables theme resolution and customization

### 5. Layout Properties

**Location**: `src/components-core/theming/parse-layout-props.ts`

**Function**: `parseLayoutProperty()`
- Parses theme variable names to extract structure
- Maps properties from components to theme system
- Supports dot notation for nested theme values (e.g., `spacing.md`)
- Converts to CSS custom properties (e.g., `var(--xmlui-spacing-md)`)

**Naming Structure**: `{property}-{part}-{component}-{screenSize}[--{state1}][--{state2}]`

See `parse-layout-props.ts` for comprehensive documentation and examples of the naming convention.

## Theme Variable Transformation Pipeline

XMLUI's theming system transforms theme variables through multiple stages from definition to final CSS values. Understanding this pipeline is crucial for theme customization and debugging.

### Stage 1: Variable Definition (SCSS)

**File**: Component `.module.scss` files  
**Function**: `createThemeVar()`

```scss
// Top-level variable declarations (required for collection)
$borderRadius-Image: createThemeVar("borderRadius-Image");
$backgroundColor-control-Carousel--hover: createThemeVar("backgroundColor-control-Carousel--hover");

@layer components {
  .carousel-control {
    background-color: $backgroundColor-control-Carousel--hover;
  }
}
```

**Output**: CSS custom properties
```css
:root {
  --xmlui-borderRadius-Image: 8px;
  --xmlui-backgroundColor-control-Carousel--hover: #3b82f6;
}
```

### Stage 2: Variable Collection & Registration

**File**: `themeVars.ts`, `themeVars.module.scss`  
**Process**: SCSS variables are parsed and collected into a JavaScript object

```typescript
// themeVars.ts extracts CSS variables from SCSS
export function parseScssVar(scssStr: any) {
  // Converts SCSS output to JavaScript object
  return JSON.parse(jsValue);
}

// Returns collected theme variables
const theme = {
  keyPrefix: "xmlui",           // Prefix for CSS custom properties
  themeVars: vars,              // Array of all registered theme variable names
};
```

**Function**: `getVarKey(varName: string)`
- Converts theme variable name to CSS custom property key
- Example: `getVarKey("borderRadius-Image")` → `"--xmlui-borderRadius-Image"`

### Stage 3: Theme Variable Resolution

**File**: `transformThemeVars.ts`  
**Functions**: `resolveThemeVar()`, `resolveThemeVars()`

**Purpose**: Resolves theme variable references and generates derived values

```typescript
// Resolves $-prefixed variable references
resolveThemeVar("$color-primary", theme)
// If theme["color-primary"] = "$color-info"
// Recursively resolves to theme["color-info"]

// Auto-generates derived theme values:
// 1. Color tones (0, 50, 100, 200...950, 1000)
// 2. Spacing scales (0, 0.5, 1, 1.5...96)
// 3. Font size scales (tiny, xs, sm, base, lg, xl...9xl)
// 4. Button variant styles (solid, outlined, ghost)
```

**Auto-Generation Examples**:

```typescript
// generateBaseTones() - Creates 13 color shades from a base color
generateBaseTones({ "color-primary": "#3b82f6" })
// Returns:
// {
//   "const-color-primary-0": "#ffffff",
//   "const-color-primary-50": "#eff6ff",
//   "const-color-primary-100": "#dbeafe",
//   ...
//   "const-color-primary-950": "#172554",
//   "const-color-primary-1000": "#0f172a"
// }

// generateBaseSpacings() - Creates spacing scale from base value
generateBaseSpacings({ "space-base": "0.25rem" })
// Returns:
// {
//   "space-0": "0rem",
//   "space-0_5": "0.125rem",
//   "space-1": "0.25rem",
//   ...
//   "space-96": "24rem"
// }

// generateButtonTones() - Creates button variant styles
generateButtonTones(theme)
// Returns styles for primary/secondary/attention variants
// in solid/outlined/ghost modes with hover/active states
```

**Special Transformations**:

```typescript
// Padding segmentation - expands shorthand to individual sides
generatePaddingSegments({
  "padding-Button": "8px 16px"
})
// Returns:
// {
//   "paddingTop-Button": "8px",
//   "paddingRight-Button": "16px",
//   "paddingBottom-Button": "8px",
//   "paddingLeft-Button": "16px"
// }

// Border segmentation - expands border shorthand
generateBorderSegments({
  "border-Card": "1px solid #e5e7eb"
})
// Returns:
// {
//   "borderWidth-Card": "1px",
//   "borderStyle-Card": "solid",
//   "borderColor-Card": "#e5e7eb",
//   "borderLeft-Card": "1px solid #e5e7eb",
//   "borderRight-Card": "1px solid #e5e7eb",
//   ...
// }
```

### Stage 4: HVar Matching (Runtime Fallback)

**File**: `hvar.ts`  
**Function**: `parseHVar()`, `matchThemeVar()`

**Purpose**: Match component property requests to available theme variables with fallback logic

```typescript
// Parse a theme variable request
parseHVar("Input:borderColor-TextBox-error--hover")
// Returns:
// {
//   classes: ["Input"],
//   attribute: "borderColor",
//   component: "TextBox",
//   traits: ["error"],
//   states: ["hover"]
// }

// matchThemeVar() searches for best match with fallback priorities:
matchThemeVar("borderColor-TextBox-error--hover", [themeVars])
// Searches in order:
// 1. borderColor-TextBox-error--hover (exact match)
// 2. borderColor-TextBox-error (without hover state)
// 3. borderColor-TextBox (without traits and states)
// 4. borderColor-Input-error--hover (using class instead of component)
// 5. borderColor-Input-error
// 6. borderColor-Input
```

**Matching Priority**:
1. Longest state combination (e.g., `--hover--disabled`)
2. Individual states (e.g., `--hover`)
3. Longest trait combination (e.g., `-error-focused`)
4. Individual traits (e.g., `-error`)
5. Component name exact match
6. Class name (fallback to category like "Input")
7. Base property (last resort)

### Stage 5: Layout Property Resolution

**File**: `layout-resolver.ts`, `component-layout-resolver.ts`  
**Functions**: `resolveLayoutProps()`, `resolveComponentLayoutProps()`

**Purpose**: Convert component props with theme variable references to CSS properties

#### For General Layout Props (layout-resolver.ts):

```typescript
// Component markup
<Stack width="$width-Stack" padding="$padding-Stack">

// Resolution process
resolveLayoutProps({
  width: "$width-Stack",
  padding: "$padding-Stack"
})

// 1. Parse property name
// 2. Extract theme variable references ($ prefix)
// 3. Convert to CSS custom properties
// 4. Apply special resolvers for complex properties

// Returns:
{
  cssProps: {
    width: "var(--xmlui-width-Stack)",
    padding: "var(--xmlui-padding-Stack)",
    flexShrink: 0  // Auto-added in container context
  },
  issues: new Set()
}
```

**Theme Variable Conversion**:
```typescript
// toCssVar() converts theme variable to CSS custom property
toCssVar("$borderRadius-Image")
// Returns: "var(--xmlui-borderRadius-Image)"

// Regex finds all $-prefixed variables in values
"$padding-md $margin-lg".replace(themeVarCapturesRegex, toCssVar)
// Returns: "var(--xmlui-padding-md) var(--xmlui-margin-lg)"
```

**Special Resolvers**: Handle shorthand properties
```typescript
specialResolvers = {
  paddingHorizontal: (value) => ({
    paddingLeft: value,
    paddingRight: value
  }),
  paddingVertical: (value) => ({
    paddingTop: value,
    paddingBottom: value
  }),
  width: (value, layoutContext) => {
    // Star size handling (e.g., "2*" means flex: 2)
    if (starSizeRegex.test(value)) {
      return { flex: getStarSizeNumber(value), flexShrink: 1 };
    }
    return { width: value };
  }
}
```

#### For Component-Specific Props (component-layout-resolver.ts):

```typescript
// Component markup with part/state-specific styling
<Button 
  backgroundColor-primary-Button--hover="$color-primary-600"
  padding-label-Button="$space-2"
>

// Resolution process
resolveComponentLayoutProps({
  "backgroundColor-primary-Button--hover": "$color-primary-600",
  "padding-label-Button": "$space-2"
})

// 1. Parse property name using parseLayoutProperty()
// 2. Extract part name ("label"), states (["hover"])
// 3. Convert theme variables to CSS custom properties
// 4. Organize by part and state

// Returns structured layout:
{
  _base_: {
    baseStyles: { /* base styles */ }
  },
  label: {
    baseStyles: {
      padding: "var(--xmlui-space-2)"
    }
  },
  primary: {
    baseStyles: {
      states: {
        "hover": {
          backgroundColor: "var(--xmlui-color-primary-600)"
        }
      }
    }
  }
}
```

**Responsive Styles**: Screen size handling
```typescript
// Props with screen size suffixes
{
  "fontSize-md-Text": "$fontSize-lg",
  "fontSize-lg-Text": "$fontSize-xl"
}

// Organized into responsiveStyles
{
  _base_: {
    responsiveStyles: {
      "md": { fontSize: "var(--xmlui-fontSize-lg)" },
      "lg": { fontSize: "var(--xmlui-fontSize-xl)" }
    }
  }
}
```

### Stage 6: Runtime Style Injection

**File**: `StyleContext.tsx`, `StyleRegistry.ts`  
**Functions**: `useStyles()`, `useComponentStyle()`, `StyleProvider`

**Purpose**: Generate CSS class names, inject styles into DOM

```typescript
// Component uses theme-resolved styles
const styles = {
  backgroundColor: "var(--xmlui-color-primary)",
  padding: "var(--xmlui-space-4)",
  "&:hover": {
    backgroundColor: "var(--xmlui-color-primary-600)"
  }
}

const className = useStyles(styles);

// StyleRegistry.register() process:
// 1. Hash the style object → "abc123"
// 2. Generate unique class name → "css-abc123"
// 3. Convert to CSS string:
const css = `
.css-abc123 {
  background-color: var(--xmlui-color-primary);
  padding: var(--xmlui-space-4);
}
.css-abc123:hover {
  background-color: var(--xmlui-color-primary-600);
}
`;

// 4. Inject into DOM (if not already injected):
<style data-style-hash="abc123" data-style-registry="true">
@layer dynamic {
  .css-abc123 { ... }
}
</style>

// 5. Return class name for component use
return "css-abc123";
```

**SSR Support**: Hydration handling
```typescript
// Server renders with all styles
<style data-style-registry="true" data-ssr-hashes="hash1,hash2,hash3">
  /* All SSR styles */
</style>

// Client reads SSR hashes on mount
const ssrHashes = document.querySelector('[data-ssr-hashes]')
  ?.getAttribute('data-ssr-hashes');
registry.ssrHashes = new Set(ssrHashes.split(','));

// Skip re-injection of SSR styles
if (registry.ssrHashes.has(styleHash)) {
  return; // Already in DOM from server
}
```

**Reference Counting**: Cleanup management
```typescript
useEffect(() => {
  registry.incrementRef(styleHash); // Component mounting
  
  return () => {
    registry.decrementRef(styleHash); // Component unmounting
    
    setTimeout(() => {
      if (registry.getRefCount(styleHash) === 0) {
        // No components using this style anymore
        registry.injected.delete(styleHash);
        document.querySelector(`[data-style-hash="${styleHash}"]`)?.remove();
      }
    }, 0);
  };
}, [styleHash]);
```

### Complete Flow Example

```scss
// 1. SCSS Definition (Button.module.scss)
$backgroundColor-Button-primary-solid: createThemeVar("backgroundColor-Button-primary-solid");

@layer components {
  .button-primary-solid {
    background-color: $backgroundColor-Button-primary-solid;
  }
}
```

↓

```typescript
// 2. Variable Collection (build time)
themeVars = ["backgroundColor-Button-primary-solid", ...]
```

↓

```json
// 3. Theme Configuration (theme JSON file)
{
  "backgroundColor-Button-primary-solid": "$color-primary"
}
```

↓

```typescript
// 4. Theme Resolution (runtime init)
resolveThemeVar("backgroundColor-Button-primary-solid", theme)
// Resolves $color-primary → "#3b82f6"
```

↓

```css
/* 5. CSS Custom Property Injection */
:root {
  --xmlui-backgroundColor-Button-primary-solid: #3b82f6;
}
```

↓

```typescript
// 6. Component Rendering
<Button variant="primary" appearance="solid">
  
// 7. Layout Resolution
resolveLayoutProps({
  backgroundColor: "$backgroundColor-Button-primary-solid"
})
// → { backgroundColor: "var(--xmlui-backgroundColor-Button-primary-solid)" }

// 8. Style Injection
useStyles({ backgroundColor: "var(--xmlui-backgroundColor-Button-primary-solid)" })
// → className: "css-abc123"
```

↓

```html
<!-- 9. Final DOM Output -->
<button class="css-abc123">...</button>
<style data-style-hash="abc123">
@layer dynamic {
  .css-abc123 {
    background-color: var(--xmlui-backgroundColor-Button-primary-solid);
  }
}
</style>
```

↓

```css
/* 10. Browser Renders (CSS custom property resolved) */
.css-abc123 {
  background-color: #3b82f6;  /* Resolved from --xmlui-... */
}
```

## Component Styling Patterns

### Simple Components
```scss
// Variables at top level
$borderRadius-Image: createThemeVar("borderRadius-Image");
$borderColor-Image: createThemeVar("borderColor-Image");

@layer components {
  .img {
    border-radius: $borderRadius-Image;
    border-color: $borderColor-Image;
  }
}
```

### Components with States
```scss
$outlineColor-Link--focus: createThemeVar("outlineColor-Link--focus");
$textColor-Button--hover: createThemeVar("textColor-Button--hover");
$backgroundColor-Button--disabled: createThemeVar("backgroundColor-Button--disabled");
```

### Components with Parts
```scss
$backgroundColor-control-Carousel: createThemeVar("backgroundColor-control-#{$component}");
$backgroundColor-indicator-Carousel--hover: createThemeVar("backgroundColor-indicator-#{$component}--hover");
```

### Components with Validation Variants
```scss
$borderColor-TextBox--default: createThemeVar("Input:borderColor-#{$componentName}--default");
$borderColor-TextBox--error: createThemeVar("Input:borderColor-#{$componentName}--error");
$borderColor-TextBox--error--hover: createThemeVar("Input:borderColor-#{$componentName}--error--hover");
```

### Complex Components (e.g., Markdown)
```scss
// Main container
$paddingTop-Markdown: createThemeVar("paddingTop-Markdown");

// Contextual variations (same element, different context)
$marginTop-H1-markdown: createThemeVar("marginTop-H1-markdown");
$marginTop-Image-markdown: createThemeVar("marginTop-Image-markdown");

// Sub-elements
$backgroundColor-Blockquote: createThemeVar("backgroundColor-Blockquote");

// Sub-element variants
$backgroundColor-Admonition-info: createThemeVar("backgroundColor-Admonition-info");
$backgroundColor-Admonition-warning: createThemeVar("backgroundColor-Admonition-warning");
```

## Current Issues & Technical Debt

### 1. Variable Extraction Required
**Problem**: Variables inside `@mixin` or `@layer` blocks not collected by theme system

**Solution**: Ongoing refactoring to move all `createThemeVar()` calls to top level
- **Status**: 32/42 components refactored
- **Remaining**: ~1 component + fixing incorrect naming

### 2. Inconsistent Naming
**Problem**: Some components use incorrect state separators
- Example: `-hover` instead of `--hover` in Carousel
- Must fix before extraction

### 3. Mixin Limitations
**Problem**: Cannot use dynamic variable references in mixins
```scss
// ❌ Invalid - SASS can't interpolate variable names
@mixin variant($variantName) {
  border-color: $borderColor-TextBox-#{$variantName};
}

// ✅ Correct - Keep original createThemeVar calls
@mixin variant($variantName) {
  border-color: createThemeVar("Input:borderColor-#{$componentName}-#{$variantName}");
}
```

### 4. Multiple Style Contexts
- Component-level styles via SCSS modules
- Layout properties converted to inline/class styles
- Theme variables via CSS custom properties
- Potential for conflicting specificity

## Theme Resolution Flow

1. **Build Time**: SCSS files compiled, `createThemeVar()` calls generate CSS custom properties
2. **Registration**: ComponentRegistry collects theme variables from component descriptors
3. **Runtime Init**: Theme JSON files loaded, default values merged with custom themes
4. **Context Provision**: ThemeProvider + StyleProvider expose theme to component tree
5. **Component Render**: 
   - Layout props → StyleProvider → CSS classes
   - Theme variables → CSS custom properties
   - Component SCSS → CSS modules

## Provider Stack Order

From `AppWrapper` (outermost to innermost):
1. ErrorBoundary
2. Router (Browser/Hash/Memory)
3. QueryClientProvider
4. HelmetProvider
5. LoggerProvider
6. IconProvider
7. **ThemeProvider** ← Theme context
8. InspectorProvider
9. ConfirmationModalContextProvider

## Customization Points

### For Component Developers
- Define theme variables via `createThemeVar()` in SCSS
- Follow naming conventions for automatic parsing
- Group variables logically (main, parts, states, variants)

### For Application Developers
- Create custom theme JSON files
- Override theme variables via `Theme` component
- Switch themes via `useThemes()` hook
- Access theme values via `useTheme()` hook

### For Extension Developers
- Register components with theme variables
- Theme variables automatically collected by registry
- Follow same SCSS conventions

## Performance Considerations

- StyleProvider memoizes theme-derived values
- CSS custom properties enable dynamic theming without style recalculation
- Layout property computation happens per-render
- Theme switching triggers CSS custom property updates (efficient)

## Related Systems

- **CSS Modules**: Component-scoped styles (`.module.scss` files)
- **CSS Layers**: Organize style precedence (`@layer components`)
- **Layout Context**: Parent-controlled child styling via `wrapChild`
- **Component Parts**: Named sub-elements for targeted styling
- **Validation States**: Built-in state system for form components

## Documentation References

- Full details: `theme-variables-refactoring.md`
- Theme context usage: `next/theme-context.md`
- Component rendering: `standalone-app.md` (StyleProvider, ThemeProvider sections)
- Component metadata: `component-metadata.md` (shows which components have unexposed variables)

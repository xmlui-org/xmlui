# Theming and Styling Architecture

This document provides comprehensive documentation of XMLUI's theming and styling system for developers working on the XMLUI core framework. It covers the complete styling pipeline from theme definitions through CSS variable generation to runtime component styling, explaining how themes, CSS-in-JS, and layout properties work together to create styled React applications.

The document is structured in three main sections: (1) Theming Overview explains theme definitions, inheritance chains, and tone management, (2) Styling Pipeline shows how CSS is generated and injected at runtime, and (3) Implementation Details provides in-depth documentation of each component, utility, and styling mechanism with behavior descriptions and cross-references.

## Theming Overview

XMLUI's theming system provides declarative, hierarchical theming with support for light/dark tones, theme inheritance, CSS variable generation, responsive design tokens, and runtime theme switching. The system is designed to enable consistent styling across applications while allowing deep customization without writing CSS.

### Theme Definitions

**Structure of a Theme**

A theme is a JavaScript object conforming to the `ThemeDefinition` interface:

```typescript
interface ThemeDefinition {
  id: string;                           // Unique theme identifier
  extends?: string | string[];           // Parent theme(s) for inheritance
  color?: string;                       // Primary color (can reference themeVars)
  resources?: Record<string, any>;      // Fonts, images, and other assets
  themeVars?: Record<string, string>;   // CSS variable definitions
  tones?: {                             // Tone-specific overrides
    light?: ThemeDefinitionDetails;
    dark?: ThemeDefinitionDetails;
  };
}
```

**Example Theme Definition:**

```typescript
export const XmlUiThemeDefinition: ThemeDefinition = {
  id: "xmlui",
  resources: {
    "font.inter": "https://rsms.me/inter/inter.css",
  },
  color: "$color-primary-500",
  themeVars: {
    "font-size": "15px",
    "boxShadow-Input": "$boxShadow-sm",
  },
  tones: {
    light: {
      themeVars: {
        "backgroundColor-ModalDialog": "white",
        "backgroundColor-checked-RadioGroupOption": "$color-primary-400",
      },
    },
    dark: {
      themeVars: {
        "color-error": "$color-danger-400",
      },
    },
  },
};
```

### Theme Inheritance and Extension

XMLUI supports hierarchical theme inheritance where child themes can extend parent themes and override specific variables.

**Inheritance Example:**

```typescript
export const XmlUiGreenThemeDefinition: ThemeDefinition = {
  id: "xmlui-green",
  extends: "xmlui",              // Inherits all variables from xmlui theme
  color: "$color-primary-500",
  themeVars: { ...greenThemeColors },  // Overrides color palette
};
```

**Theme Chain Resolution:**

When a theme extends another, XMLUI builds a theme chain: `[root] → [parent themes] → [current theme]`. Variables are resolved left-to-right with later themes overriding earlier ones.

The `collectThemeChainByExtends` function assembles the complete chain:

```typescript
// Given: XmlUiGreenThemeDefinition extends "xmlui"
// Result: [RootTheme, XmlUiTheme, XmlUiGreenTheme]
const themeChain = collectThemeChainByExtends(XmlUiGreenThemeDefinition, allThemes);
```

**Root Theme:**

Every theme chain starts with the `RootThemeDefinition` which provides fundamental design tokens including base spacing, font sizes, color scales, and component-specific variables. Component developers can register default theme variables that are automatically merged into the root theme.

### Theme Tones (Light/Dark Mode)

Each theme supports two tones: `light` and `dark`. Tone-specific variables override the base theme variables.

**Tone Structure:**

```typescript
tones: {
  light: {
    themeVars: {
      "backgroundColor-surface": "white",
      "textColor-primary": "#1a1a1a",
    },
  },
  dark: {
    themeVars: {
      "backgroundColor-surface": "#1a1a1a",
      "textColor-primary": "#ffffff",
    },
  },
}
```

**Tone Resolution:**

When compiling a theme, XMLUI merges variables in this order:
1. Base theme variables (excluding tone-specific ones)
2. Tone-specific variables from `themeVars[tone]`
3. Tone-specific variables from `tones[tone].themeVars`

This three-level merge happens for each theme in the inheritance chain.

### Theme Variables and CSS Variables

**Variable Naming Convention:**

Theme variables use kebab-case with semantic prefixes:
- `color-primary-500` — Color tokens
- `space-4` — Spacing tokens  
- `fontSize-lg` — Typography tokens
- `backgroundColor-Button-primary-solid` — Component-specific tokens
- `boxShadow-sm` — Effect tokens

**Variable References:**

Theme variables can reference other variables using `$` prefix:

```typescript
themeVars: {
  "color-primary-500": "#3b82f6",
  "backgroundColor-Button": "$color-primary-500",  // References another variable
  "boxShadow-Input": "$boxShadow-sm",
}
```

**CSS Variable Generation:**

At runtime, theme variables are converted to CSS custom properties with the `--xmlui-` prefix:

```typescript
// Theme variable: "color-primary-500": "#3b82f6"
// Becomes CSS: --xmlui-color-primary-500: #3b82f6;

// Theme variable: "backgroundColor-Button": "$color-primary-500"  
// Becomes CSS: --xmlui-backgroundColor-Button: var(--xmlui-color-primary-500);
```

### Generated Design Tokens

XMLUI automatically generates derived design tokens from base values:

**Spacing Scale (from `space-base`):**

```typescript
themeVars: { "space-base": "0.25rem" }
// Generates: space-0, space-0_5, space-1, space-1_5, ..., space-96
```

**Font Size Scale (from `fontSize`):**

```typescript
themeVars: { "fontSize": "15px" }
// Generates: fontSize-tiny, fontSize-xs, fontSize-sm, fontSize-base, 
//            fontSize-lg, fontSize-xl, ..., fontSize-9xl
```

**Color Tones (from base colors):**

```typescript
themeVars: { "color-primary-500": "#3b82f6" }
// Generates: color-primary-50, color-primary-100, ..., color-primary-950
// Plus alpha variants: color-primary-500-alpha-10, ..., color-primary-500-alpha-90
```

**Button State Variants:**

```typescript
themeVars: { "color-Button-primary-solid": "$color-primary-500" }
// Generates: backgroundColor-Button-primary-solid,
//            backgroundColor-Button-primary-solid--hover,
//            backgroundColor-Button-primary-solid--active,
//            borderColor-Button-primary-solid, ...
```

### Built-in Themes

XMLUI ships with several built-in themes:

```typescript
const builtInThemes = [
  XmlUiThemeDefinition,        // Default blue theme
  XmlUiGreenThemeDefinition,   // Green color palette
  XmlUiGrayThemeDefinition,    // Gray/neutral palette
  XmlUiOrangeThemeDefinition,  // Orange palette
  XmlUiPurpleThemeDefinition,  // Purple palette  
  XmlUiCyanThemeDefinition,    // Cyan palette
  XmlUiRedThemeDefinition,     // Red palette
  XmlUiDocsThemeDefinition,    // Documentation site theme
  XmlUiBlogThemeDefinition,    // Blog site theme
  XmlUiWebThemeDefinition,     // Marketing site theme
];
```

All built-in themes extend the base `xmlui` theme and override color palettes and component-specific variables.

### Theme Resources

Themes can declare resources like fonts, images, and other assets:

**Font Resources:**

```typescript
resources: {
  "font.inter": "https://rsms.me/inter/inter.css",  // CSS link
  "font.custom": {                                   // FontFace definition
    fontFamily: "CustomFont",
    src: "resource:customfont.woff2",
    fontWeight: "400",
    fontStyle: "normal",
    fontDisplay: "swap",
  },
}
```

**Image Resources:**

```typescript
resources: {
  "logo": "/assets/logo.svg",
  "background": "https://example.com/bg.jpg",
}
```

**Resource Resolution:**

The `getResourceUrl` function resolves resource references:
- `resource:logo` → looks up in theme resources → returns resolved URL
- Resources can reference other resources
- ResourceMap provides runtime path mappings for bundled assets

## Styling Pipeline

XMLUI's styling system combines CSS-in-JS, CSS variables, and static CSS modules to create a flexible, performant styling solution. The pipeline has three main stages: theme compilation, CSS generation, and style injection.

### Stage 1: Theme Compilation

**Input:** Theme definitions with inheritance chains and tone selections  
**Output:** Resolved theme variables and CSS custom properties

The `useCompiledTheme` hook orchestrates theme compilation:

```typescript
const {
  themeCssVars,                              // CSS custom properties
  allThemeVarsWithResolvedHierarchicalVars,  // Resolved variable map
  getThemeVar,                               // Variable lookup function
  getResourceUrl,                            // Resource resolver
  fontLinks,                                 // Font URLs to load
} = useCompiledTheme(activeTheme, activeTone, themes, resources, resourceMap);
```

**Compilation Steps:**

1. **Build Theme Chain:** Collect all themes in the inheritance chain from root to current theme
2. **Merge Variables:** Combine theme variables from all themes in the chain, applying tone overrides
3. **Generate Tokens:** Create spacing scales, font sizes, color tones, and component variants
4. **Resolve References:** Replace variable references (`$variable-name`) with CSS variable references
5. **Create CSS Variables:** Convert all resolved variables to CSS custom properties with `--xmlui-` prefix
6. **Process Resources:** Collect fonts and resources from theme chain, resolve URLs

**Variable Resolution Example:**

```typescript
// Input theme variables:
{
  "color-primary-500": "#3b82f6",
  "backgroundColor-Button": "$color-primary-500",
  "boxShadow-Input": "$boxShadow-sm",
}

// After resolution:
{
  "color-primary-500": "#3b82f6",
  "backgroundColor-Button": "var(--xmlui-color-primary-500)",
  "boxShadow-Input": "var(--xmlui-boxShadow-sm)",
}

// Final CSS variables:
{
  "--xmlui-color-primary-500": "#3b82f6",
  "--xmlui-backgroundColor-Button": "var(--xmlui-color-primary-500)",
  "--xmlui-boxShadow-Input": "var(--xmlui-boxShadow-sm)",
}
```

### Stage 2: CSS-in-JS Generation

XMLUI uses a custom CSS-in-JS system built on `StyleRegistry` for dynamic styling.

**StyleRegistry Architecture:**

```typescript
class StyleRegistry {
  cache: Map<string, StyleCacheEntry>;     // Style hash → CSS mapping
  injected: Set<string>;                   // Injected style hashes
  refCounts: Map<string, number>;          // Reference counting for cleanup
  ssrHashes: Set<string>;                  // Server-rendered style hashes
  
  register(styles: StyleObjectType): { className, styleHash, css }
  incrementRef(styleHash: string): void
  decrementRef(styleHash: string): void
}
```

**Style Registration Flow:**

1. Component calls `useStyles(styleObject)`
2. StyleRegistry computes stable hash from style object
3. If cached, return existing className; otherwise generate CSS
4. CSS generation supports nesting, pseudo-selectors, and media queries
5. Return unique className (e.g., `css-a7b9k2`)

**Style Object Example:**

```typescript
const styleObject = {
  "&": {                                    // Root styles
    display: "flex",
    padding: "var(--xmlui-space-4)",
  },
  "&:hover": {                              // Pseudo-selector
    backgroundColor: "var(--xmlui-color-primary-100)",
  },
  "& > .child": {                           // Nested selector
    margin: "var(--xmlui-space-2)",
  },
  "@media (min-width: 768px)": {            // Media query
    "&": {
      flexDirection: "row",
    },
  },
};

const className = useStyles(styleObject);  // Returns "css-a7b9k2"
```

**Generated CSS:**

```css
@layer dynamic {
  .css-a7b9k2 {
    display: flex;
    padding: var(--xmlui-space-4);
  }
  .css-a7b9k2:hover {
    background-color: var(--xmlui-color-primary-100);
  }
  .css-a7b9k2 > .child {
    margin: var(--xmlui-space-2);
  }
  @media (min-width: 768px) {
    .css-a7b9k2 {
      flex-direction: row;
    }
  }
}
```

### Stage 3: Style Injection

**Client-Side Injection:**

The `useStyles` hook uses React's `useInsertionEffect` to inject styles before browser paint:

```typescript
useInsertionEffect(() => {
  if (!styleHash || registry.injected.has(styleHash)) return;
  
  const { css } = registry.cache.get(styleHash);
  const styleElement = document.createElement("style");
  styleElement.setAttribute("data-style-hash", styleHash);
  styleElement.innerHTML = `@layer dynamic {\n${css}\n}`;
  injectionTarget.appendChild(styleElement);
  
  registry.injected.add(styleHash);
}, [styleHash]);
```

**Server-Side Rendering (SSR):**

1. StyleRegistry collects all styles during SSR
2. Styles are rendered to a `<style>` tag with `data-ssr-hashes` attribute
3. On client hydration, registry reads SSR hashes and skips re-injection
4. Prevents flash of unstyled content (FOUC)

**Reference Counting and Cleanup:**

```typescript
useEffect(() => {
  registry.incrementRef(styleHash);  // Mount: increment ref count
  
  return () => {
    registry.decrementRef(styleHash);  // Unmount: decrement ref count
    
    setTimeout(() => {
      // If ref count reaches 0 and not SSR-rendered, remove style tag
      if (registry.getRefCount(styleHash) === 0 && !registry.ssrHashes.has(styleHash)) {
        registry.injected.delete(styleHash);
        document.querySelector(`style[data-style-hash="${styleHash}"]`)?.remove();
      }
    }, 0);
  };
}, [styleHash]);
```

This cleanup mechanism prevents memory leaks and DOM bloat from unused styles while handling React's Strict Mode double-rendering.

### Layout Properties and CSS Mapping

XMLUI components accept declarative layout properties that are automatically converted to CSS:

**Layout Property Example:**

```xml
<Stack 
  width="200px" 
  height="48px"
  padding="$space-4"
  backgroundColor="$color-primary-500"
  borderRadius="$radius-md"
/>
```

**Resolution Process:**

1. `resolveLayoutProps` extracts layout properties from component props
2. Theme variable references (`$space-4`) are converted to CSS variables via `toCssVar`
3. Layout-specific logic handles flex sizing, responsive properties, and container context
4. Returns `cssProps` object ready for React's `style` prop or CSS-in-JS

**Responsive Layout Properties:**

```xml
<Stack
  width="100%"
  width-sm="400px"
  width-md="600px"
  width-lg="800px"
/>
```

Resolution checks `layoutContext.mediaSize.sizeIndex` and selects the appropriate value based on viewport breakpoints.

**Star Sizing (Flex):**

```xml
<HStack>
  <Box width="200px" />
  <Box width="1*" />      <!-- flex: 1 -->
  <Box width="2*" />      <!-- flex: 2 -->
</HStack>
```

When `width` or `height` ends with `*` and the parent is a Stack, it's converted to `flex` with the numeric multiplier.

### Component-Specific Styling

Components can register default theme variables and apply them through multiple mechanisms:

**1. Static CSS Modules (SCSS):**

```scss
// Text.module.scss
.text {
  color: var(--xmlui-textColor-Text);
  font-family: var(--xmlui-fontFamily-Text);
  font-size: var(--xmlui-fontSize-Text);
  
  &.variant-title {
    font-size: var(--xmlui-fontSize-Text-title);
    font-weight: var(--xmlui-fontWeight-Text-title);
  }
}
```

**2. Dynamic CSS-in-JS (Custom Variants):**

The Text component generates CSS-in-JS for custom variants:

```typescript
const variantSpec = useMemo(() => {
  if (!isCustomVariant) return EMPTY_OBJECT;
  const subject = `-Text-${variant}`;
  return {
    color: toCssVar(`$textColor${subject}`),
    "font-size": toCssVar(`$fontSize${subject}`),
    "font-weight": toCssVar(`$fontWeight${subject}`),
    // ... more properties
  };
}, [variant]);

const customVariantClassName = useComponentStyle(variantSpec);
```

This allows themes to define custom text variants without modifying component code:

```typescript
themeVars: {
  "textColor-Text-brand": "$color-primary-600",
  "fontSize-Text-brand": "18px",
  "fontWeight-Text-brand": "700",
}
```

```xml
<Text variant="brand">Styled by theme!</Text>
```

**3. Inline Layout Properties:**

```xml
<Text color="$color-primary-600" fontSize="18px" fontWeight="700">
  Direct styling
</Text>
```

These three approaches can be combined, with specificity order: inline properties > CSS-in-JS > static CSS.

### Theme Scoping with the Theme Component

The `Theme` component creates nested theme scopes where child components inherit or override parent theme values:

```xml
<Theme themeId="xmlui-green">
  <Text>Green theme text</Text>
  
  <Theme tone="dark">
    <Text>Dark tone within green theme</Text>
  </Theme>
  
  <Theme themeVars={{ "textColor-Text": "$color-danger-600" }}>
    <Text>Custom red text</Text>
  </Theme>
</Theme>
```

**Scope Mechanics:**

1. Theme component compiles its own theme based on `themeId`, `tone`, and inline `themeVars`
2. Creates a new `ThemeContext.Provider` with the scoped theme
3. Injects scoped CSS variables via `useStyles` at the Theme's DOM root
4. Child components read from nearest `ThemeContext` for variable resolution
5. CSS variable cascade applies scoped values to descendants

**Root Theme:**

When `isRoot={true}`, the Theme component generates responsive breakpoint CSS variables:

```css
.theme-root {
  --screenSize: 0;
}
@media (min-width: 641px) {
  .theme-root { --screenSize: 1; }
}
@media (min-width: 1025px) {
  .theme-root { --screenSize: 2; }
}
/* ... */
```

Components can use `--screenSize` for responsive styling without JavaScript media queries.

## Implementation Details

This section provides detailed documentation for every component, hook, utility function, and type in the XMLUI theming and styling system. Each entry includes a concise description, behavior bullets explaining key responsibilities and interactions, and cross-references to related components.

### The `ThemeProvider` Component

`ThemeProvider` is the root component that manages the global theming context for XMLUI applications. It maintains available themes, tracks the active theme and tone, provides theme switching functions, and orchestrates theme compilation through `useCompiledTheme`. The provider enables theme persistence, runtime theme switching, and exposes theme data to all descendant components via context.

#### Behavior

- Initializes with `defaultTheme` and `defaultTone` props, falling back to the first available theme and "light" tone when not specified.
- Combines `custThemes` (app-provided themes) with `builtInThemes` to create the complete theme registry available to the app.
- Maintains `activeThemeId` and `activeThemeTone` state that can be changed at runtime via `setActiveThemeId` and `setActiveThemeTone` functions exposed through context.
- Calls `useCompiledTheme` to compile the active theme into CSS variables, resolved theme variables, resource URLs, and font links based on the current theme chain and tone.
- Detects DOM root (document.body or shadow root) and stores it in state for CSS variable injection and portal rendering.
- Provides two contexts: `ThemesContext` (theme registry and switching functions) and `ThemeContext` (current theme compilation results).
- Exposes `toggleThemeTone` function that switches between light and dark tones via context for global theme toggle buttons.
- Syncs `activeThemeId` with `defaultTheme` changes via `useIsomorphicLayoutEffect` to support hot module reloading during development.
- Throws error if `activeThemeId` doesn't match any available theme, preventing silent failures and providing clear debugging information.

#### See Also

- `useCompiledTheme` — hook that compiles theme definitions into CSS variables and resolved values.
- `ThemesContext` / `ThemeContext` — context providers that expose theme data to descendant components.
- `useTheme` / `useThemes` — hooks that components use to access theme data and switching functions.
- `builtInThemes` — array of XMLUI's built-in theme definitions.

### The `useCompiledTheme` Hook

`useCompiledTheme` transforms theme definitions into runtime-ready CSS variables, resolved variable maps, and resource URLs. It receives the active theme, tone, theme registry, and resource mappings, then builds the theme chain, merges variables across tones and inheritance levels, generates derived tokens, resolves variable references, and returns all data needed for theme application.

#### Behavior

- Calls `collectThemeChainByExtends` to build the complete theme chain from root through parent themes to the active theme.
- Merges resources from all themes in the chain, applying tone-specific resource overrides where applicable.
- Extracts font resources (keys starting with "font.") and separates CSS link fonts from FontFace definitions for different loading mechanisms.
- Generates design token scales by calling `generateBaseSpacings`, `generateBaseFontSizes`, `generatePaddingSegments`, `generateBorderSegments`, `generateBaseTones`, `generateButtonTones`, and `generateTextFontSizes` with merged theme variables.
- Performs hierarchical variable resolution by matching theme variables against the theme chain using `matchThemeVar`, creating reference mappings for variables that inherit from parent themes.
- Resolves all variable references (`$variable-name`) to CSS variable references (`var(--xmlui-variable-name)`) via `resolveThemeVarsWithCssVars`.
- Creates `themeCssVars` object with `--xmlui-` prefixed keys suitable for CSS injection via inline styles or style tags.
- Provides `getThemeVar` function for programmatic variable lookups that resolves theme variable names to their final values.
- Provides `getResourceUrl` function that resolves resource references (`resource:name`) through theme resources and resource maps, with fallback logic for absolute and relative paths.
- Loads font resources by creating FontFace instances and adding them to `document.fonts` for web fonts declared in theme resources.
- Memoizes all computations with appropriate dependencies to prevent unnecessary recalculation when theme, tone, or resources haven't changed.

#### See Also

- `ThemeProvider` — component that calls this hook and provides results through context.
- `collectThemeChainByExtends` — function that builds theme inheritance chains.
- `generateBaseSpacings`, `generateBaseFontSizes`, etc. — token generation functions.
- `resolveThemeVar` — function for recursive variable resolution.
- `matchThemeVar` — function for hierarchical variable matching across theme chains.

### The `StyleProvider` Component

`StyleProvider` creates and provides the `StyleRegistry` instance used for CSS-in-JS throughout the application. It handles SSR hydration by reading server-rendered style hashes, prevents duplicate style injection, and enables nested StyleProvider scenarios where child providers can optionally create new registries or reuse parent registries.

#### Behavior

- Creates a `StyleRegistry` instance via `useState` on first render, ensuring the registry persists across re-renders and maintains stable identity.
- Reads SSR-injected style hashes on client mount by querying for `<style data-style-registry="true">` tags and extracting the `data-ssr-hashes` attribute.
- Pre-populates registry's `injected` and `ssrHashes` sets with server-rendered hashes to prevent duplicate injection and enable client hydration without FOUC.
- Checks for parent `StyleContext` via `useContext` and reuses parent registry when `forceNew={false}`, allowing nested StyleProviders to be no-ops.
- When `forceNew={true}`, creates a new registry regardless of parent context, enabling isolated style scopes for nested apps or shadow DOM scenarios.
- Provides registry through `StyleContext.Provider` making it accessible to all descendants via `useStyleRegistry` hook.
- Accepts optional `styleRegistry` prop for injecting a pre-configured registry, useful for testing or custom SSR setups.

#### See Also

- `StyleRegistry` — the class that manages style caching, hashing, CSS generation, and reference counting.
- `useStyleRegistry` — hook that descendants use to access the registry.
- `useStyles` / `useComponentStyle` — hooks that register and inject styles using the registry.

### The `StyleRegistry` Class

`StyleRegistry` implements the CSS-in-JS engine with style caching, hash-based deduplication, CSS generation from nested style objects, reference counting for lifecycle management, and SSR hydration support. It serves as the central data structure for tracking all dynamic styles in the application.

#### Behavior

- Maintains `cache` Map storing `styleHash → { className, styleHash, css }` entries for all registered styles.
- Tracks `injected` Set of style hashes that have been injected into DOM to prevent duplicate injection.
- Tracks `refCounts` Map counting how many components are currently using each style for cleanup lifecycle management.
- Tracks `ssrHashes` Set of style hashes that were server-rendered, preventing removal during client hydration.
- Implements `register(styles)` method that computes stable hash via `stableJSONStringify`, returns cached entry if available, or generates new CSS and caches it.
- Generates CSS via recursive `_generateCss` method that traverses nested style objects, handles pseudo-selectors, nested selectors, media queries, and converts camelCase properties to kebab-case.
- Preserves CSS custom properties (starting with `--`) without kebab-case conversion to maintain correct CSS variable syntax.
- Creates unique classNames using pattern `css-{hash}` where hash is a base-36 string derived from style object content.
- Provides `incrementRef` and `decrementRef` methods for tracking component mounting/unmounting and enabling automatic cleanup.
- Provides `getRefCount` method for querying current reference count, used by cleanup logic to determine when styles can be safely removed.
- Generates CSS wrapped in `@layer dynamic` to ensure proper CSS cascade layer ordering.

#### See Also

- `StyleProvider` — component that creates and provides StyleRegistry instances.
- `useStyles` — hook that calls `register`, increments/decrements refs, and injects CSS.
- `useComponentStyle` — higher-level hook for component styling that uses `useStyles`.

### The `useStyles` Hook

`useStyles` is the core hook for CSS-in-JS styling. It accepts a style object, registers it with the StyleRegistry, injects the CSS into the DOM, manages reference counting for cleanup, and returns the generated className. This hook implements the complete lifecycle of a dynamic style from registration through injection to cleanup.

#### Behavior

- Accepts `styles` parameter as a `StyleObjectType` with support for nested selectors, pseudo-selectors, and media queries.
- Checks `indexing` context flag and returns undefined className when indexing to skip style processing during static site generation.
- Calls `registry.register(styles)` to compute hash and retrieve or generate className and styleHash via memoized computation.
- Uses `useInsertionEffect` to inject CSS before browser paint, creating `<style>` elements with `data-style-hash` attributes for identification.
- Injects styles into appropriate target: `document.head` for normal apps or shadow root for shadow DOM environments, detected via `useDomRoot`.
- Wraps generated CSS in `@layer dynamic` directive to ensure predictable cascade ordering with theme and static styles.
- Marks style as injected in registry to prevent duplicate injection across component instances using the same styles.
- Uses `useEffect` for reference counting lifecycle: increments on mount, decrements on unmount, schedules cleanup check after unmount.
- Cleanup logic removes style tags when ref count reaches zero and style was not server-rendered, preventing memory leaks from unused styles.
- Cleanup uses `setTimeout` to defer removal until after React's Strict Mode double-render completes, preventing premature removal.
- Supports optional `prepend` parameter to inject styles at the beginning of injection target rather than appending, useful for precedence control.

#### See Also

- `StyleRegistry` — class providing register, incrementRef, decrementRef, and getRefCount methods.
- `useStyleRegistry` — hook for accessing registry instance.
- `useDomRoot` — hook for determining injection target (document.head or shadow root).
- `useComponentStyle` — higher-level hook built on useStyles for component styling.

### The `useComponentStyle` Hook

`useComponentStyle` simplifies component styling by accepting a flat style object (CSS properties without nesting) and wrapping it in the `&` root selector required by `useStyles`. It provides a convenient API for components that need simple dynamic styling without complex nesting or media queries.

#### Behavior

- Accepts `styles` parameter as a flat `Record<string, CSSProperties[keyof CSSProperties]>` with CSS property key-value pairs.
- Wraps provided styles in root selector structure `{ "&": styles }` required by the style object format expected by `useStyles`.
- Returns `EMPTY_OBJECT` when styles are undefined, null, or empty to prevent unnecessary style registration and use stable reference.
- Memoizes wrapped style object based on styles reference to prevent unnecessary re-registration when styles haven't changed.
- Delegates to `useStyles` for actual registration, injection, and lifecycle management.
- Returns className string that can be applied directly to component root elements.

#### See Also

- `useStyles` — underlying hook that performs registration, injection, and lifecycle management.
- Text component — uses this hook for custom variant styling.
- Custom components — can use this hook for simple dynamic styling needs.

### The `resolveLayoutProps` Function

`resolveLayoutProps` transforms declarative layout properties into CSS properties suitable for React's style prop. It handles theme variable resolution, responsive property selection, flex sizing, shorthand expansions (paddingHorizontal/Vertical, etc.), and layout context awareness for container-based layout decisions.

#### Behavior

- Accepts `layoutProps` object containing layout property definitions, `layoutContext` for container awareness, and `disableInlineStyle` flag.
- Returns `ResolvedLayout` object with `cssProps` (CSS properties) and `issues` (Set of invalid property names) for debugging.
- Resolves theme variable references by replacing `$variable-name` patterns with CSS variables `var(--xmlui-variable-name)` via `toCssVar`.
- Implements responsive property resolution by selecting appropriate value based on `layoutContext.mediaSize.sizeIndex` from xs/sm/md/lg/xl/xxl variants.
- Detects star sizing (e.g., `width="2*"`) and converts to flex values when component is inside a Stack with matching orientation.
- For horizontal Stacks, converts `width="2*"` to `flex: 2; flexShrink: 1` to enable flex-based sizing.
- For vertical Stacks, converts `height="2*"` to `flex: 2; flexShrink: 1` for vertical flex sizing.
- Sets `flexShrink: 0` by default for components inside Stacks to prevent unwanted shrinking unless star sizing or canShrink is used.
- Expands shorthand properties like `paddingHorizontal` into `paddingLeft` and `paddingRight`, `borderVertical` into `borderTop` and `borderBottom`.
- Validates property values against allowed patterns when defined in `layoutPatterns` and adds invalid properties to `issues` Set.
- Respects `disableInlineStyle` flag for most properties, treating width/height/min*/max* as always enabled since they control layout structure.
- Returns referentially stable `defaultCompResult` when no properties are resolved to prevent unnecessary re-renders.

#### See Also

- `toCssVar` — function that converts theme variable references to CSS variable syntax.
- `LayoutProps` type — defines all supported layout property names and value types.
- `LayoutContext` type — provides container context (orientation, media size) for layout decisions.
- ComponentAdapter — calls this function to resolve layout properties during component rendering.

### The `toCssVar` Function

`toCssVar` converts XMLUI theme variable references (starting with `$`) into CSS custom property syntax (`var(--xmlui-name)`). This function is the bridge between XMLUI's declarative theme variable system and CSS's custom property syntax.

#### Behavior

- Accepts a string starting with `$` (e.g., `$color-primary-500`) and returns CSS variable reference (e.g., `var(--xmlui-color-primary-500)`).
- Strips the leading `$` character and prepends `--xmlui-` prefix defined by `THEME_VAR_PREFIX` constant.
- Wraps result in `var()` function call for CSS custom property syntax.
- Used extensively by layout resolver, component renderers, and theme compilation to ensure consistent variable reference syntax.
- Does not validate variable existence or resolve values—defers resolution to CSS cascade at runtime.

#### See Also

- `THEME_VAR_PREFIX` — constant defining the CSS variable prefix ("xmlui").
- `resolveLayoutProps` — uses this function to convert theme variable references in layout properties.
- `resolveThemeVar` — function for JavaScript-side variable resolution (returns actual values, not CSS references).

### The `Theme` Component

`Theme` creates nested theme scopes where child components inherit or override parent theme variables, tone settings, and styling contexts. It compiles its own theme based on `themeId`, `tone`, and inline `themeVars` overrides, generates CSS variables, injects them at the Theme's DOM root, and provides the scoped theme through context to descendants.

#### Behavior

- Accepts `themeId` prop to select a different theme from the global theme registry, falling back to active theme when undefined.
- Accepts `tone` prop to override parent tone (light/dark), enabling dark sections within light apps and vice versa.
- Accepts inline `themeVars` object that overrides specific theme variables without creating a full theme definition, useful for ad-hoc customization.
- Generates a unique theme ID via `useId` for the scoped theme to prevent conflicts with other Theme instances.
- Merges provided `themeVars` into the selected theme's tone-specific variables to create a derived theme definition.
- Calls `useCompiledTheme` to compile the scoped theme with its tone and variable overrides into CSS variables and resolved values.
- Generates scoped CSS variables via `useStyles` by creating a style object with `&` root selector containing all `themeCssVars`.
- When `isRoot={true}`, generates responsive breakpoint CSS variables (`--screenSize: 0/1/2/3/4/5`) via media queries for viewport detection.
- Injects CSS variables at the Theme's DOM root so descendants inherit scoped values through CSS cascade.
- Provides scoped theme through `ThemeContext.Provider` making it accessible to descendant components via `useTheme` hook.
- Renders `NotificationToast` component when `isRoot={true}` to provide toast notification system with scoped theme styling.
- Supports `applyIf` prop (default true) that conditionally applies theme wrapper, rendering children unwrapped when false for conditional theming.
- Supports `disableInlineStyle` prop to control whether inline styles are disabled for components within the theme scope.
- Wraps children in `ErrorBoundary` to catch and display theme-related errors gracefully without crashing the app.
- Manages theme root state for portal rendering, coordinating with `ThemeProvider` to ensure portals render in correct DOM location.

#### See Also

- `useCompiledTheme` — hook that compiles the scoped theme into CSS variables and resolved values.
- `ThemeContext` — context provided by Theme component with scoped theme data.
- `useTheme` — hook that descendant components use to access scoped theme.
- `NotificationToast` — component rendered by root themes for toast notifications.
- `resolveLayoutProps` — uses theme context to resolve theme variable references in layout properties.

### The `collectThemeChainByExtends` Function

`collectThemeChainByExtends` builds the complete theme inheritance chain from root theme through parent themes to the current theme. It recursively resolves `extends` properties, collects all themes in dependency order, and merges component default theme variables into the root theme for complete theme composition.

#### Behavior

- Accepts `customTheme` (the theme to resolve), `allThemes` (available theme registry), and `componentDefaultThemeVars` (component-registered defaults).
- Creates synthetic root theme by cloning `RootThemeDefinition` and merging all component default theme variables into it.
- Supports component defaults for both base variables and tone-specific variables, organizing tone overrides under appropriate tone keys.
- Calls `collectExtends` to recursively walk the theme inheritance chain via `extends` property, supporting single string or array of theme IDs.
- Returns themes in application order: `[rootTheme, ...parentThemes, customTheme]` where later themes override earlier ones during variable resolution.
- Handles missing parent themes gracefully by skipping undefined theme IDs in the extends chain.
- Supports multiple inheritance when `extends` is an array, processing parent themes in array order.
- Creates stable theme chain for use by `useCompiledTheme` which merges variables left-to-right across the chain.

#### See Also

- `RootThemeDefinition` — the base theme containing fundamental design tokens.
- `useCompiledTheme` — hook that uses the theme chain to merge and resolve variables.
- `ThemeDefinition` interface — defines theme structure including `extends` property.
- Component registration — mechanism for registering default theme variables per component.

### The `generateBaseSpacings` Function

`generateBaseSpacings` creates a complete spacing scale from a base spacing unit defined in theme variables. It supports any CSS unit and generates a comprehensive set of spacing tokens following a carefully designed scale suitable for consistent spacing throughout the application.

#### Behavior

- Reads `space-base` variable from resolved theme (e.g., "0.25rem") and extracts numeric value and unit.
- Handles edge cases: leading decimals (`.5rem` → `0.5rem`), missing units (defaults to `px`), and non-numeric values (returns empty object).
- Generates spacing tokens for predefined scale: `[0, 0.5, 1, 1.5, 2, 2.5, 3, ..., 96]` multiplied by base unit.
- Creates token names with underscores for decimal values: `space-0`, `space-0_5`, `space-1`, ..., `space-96`.
- Returns object with generated tokens: `{ "space-0": "0rem", "space-0_5": "0.125rem", "space-1": "0.25rem", ... }`.
- Used by `useCompiledTheme` during theme compilation to ensure spacing tokens are available throughout the theme chain.

#### See Also

- `generateBaseFontSizes` — similar function for font size token generation.
- `generatePaddingSegments`, `generateBorderSegments` — functions for component-specific spacing tokens.
- `useCompiledTheme` — hook that calls this function during theme compilation.

### The `generateBaseFontSizes` Function

`generateBaseFontSizes` creates a complete font size scale from a base font size defined in theme variables. It generates a comprehensive set of font size tokens from `tiny` through `9xl` suitable for typography hierarchy throughout the application.

#### Behavior

- Reads `fontSize` variable from resolved theme (e.g., "15px") and extracts numeric value and unit.
- Handles edge cases: leading decimals, missing units (defaults to `px`), and non-numeric values (returns empty object).
- Generates font size tokens: `fontSize-tiny` (0.625×), `fontSize-xs` (0.75×), `fontSize-sm` (0.875×), `fontSize-base` (1×), `fontSize-lg` (1.125×), ..., `fontSize-9xl` (8×).
- Creates specific token for code blocks: `fontSize-code` (0.85×) for monospace text sizing.
- Returns object with generated tokens maintaining base unit: `{ "fontSize-tiny": "9.375px", "fontSize-xs": "11.25px", ... }`.
- Used by `useCompiledTheme` during theme compilation to ensure font size tokens are available throughout the theme chain.

#### See Also

- `generateTextFontSizes` — generates Text component-specific font size variants.
- `generateBaseSpacings` — similar function for spacing token generation.
- `useCompiledTheme` — hook that calls this function during theme compilation.

### The `generateTextFontSizes` Function

`generateTextFontSizes` creates Text component-specific font size variants using `calc()` expressions that reference the base `fontSize-Text` CSS variable. This enables theme-based scaling where changing the base text size automatically scales all variants proportionally.

#### Behavior

- Reads `fontSize-Text` variable from resolved theme to determine if Text component has custom base size.
- Returns empty object if `fontSize-Text` is not defined, falling back to default font sizes.
- Generates variant tokens using `calc()` with CSS variable references: `fontSize-Text-small` = `calc(var(--xmlui-fontSize-Text) * 0.875)`.
- Creates variants for all Text component styles: keyboard (0.875×), sample (0.875×), sup (0.625×), sub (0.625×), title (1.5×), subtitle (1.25×), small (0.875×), placeholder (0.875×), paragraph (1×), subheading (0.625×), tableheading (0.625×), secondary (0.875×).
- Returns object with CSS calc expressions: `{ "fontSize-Text-title": "calc(var(--xmlui-fontSize-Text) * 1.5)", ... }`.
- These calc-based tokens respond dynamically to base font size changes without regenerating the theme, enabling responsive typography.
- Used by `useCompiledTheme` during theme compilation, inserted late in the theme chain to reference other resolved variables.

#### See Also

- `generateBaseFontSizes` — generates base font size scale.
- Text component — uses these generated font size tokens for variant styling.
- `useCompiledTheme` — hook that calls this function during theme compilation.

### The `generateBaseTones` Function

`generateBaseTones` creates complete color tone scales (50-950 plus alpha variants) from base color definitions. It supports primary, secondary, info, success, warn, danger, and surface color families, generating comprehensive color palettes from single base colors.

#### Behavior

- Calls `generateBaseTonesForColor` for each color family: primary, secondary, info, success, warn, danger, and surface.
- For surface colors, passes `{ distributeEven: true }` option to use perceptually-even distribution instead of exponential curve.
- Returns merged object containing all generated tones: `{ "color-primary-50": "...", "color-primary-100": "...", ..., "color-surface-950": "..." }`.
- Each color family generates 11 tones (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950) plus alpha variants for each tone.
- Uses Color library to perform color transformations (lightness adjustments, alpha channel manipulation) ensuring perceptually balanced tones.
- Generated tones provide complete color palette for UI components without manual color definition.
- Used by `useCompiledTheme` during theme compilation to expand base color definitions into full palettes.

#### See Also

- `generateBaseTonesForColor` — function that generates tones for a single color family.
- `generateButtonTones` — generates button-specific color variants from base colors.
- Color library — external package providing color manipulation functions.
- `useCompiledTheme` — hook that calls this function during theme compilation.

### The `generateButtonTones` Function

`generateButtonTones` creates comprehensive button styling variants (solid, outlined, ghost) with hover and active states from base button colors. It generates background colors, border colors, and text colors for all button variants and interaction states, providing complete button theming from minimal color definitions.

#### Behavior

- Generates tones for three button variants: primary, secondary, and attention, each with three visual styles: solid, outlined, and ghost.
- For each variant-style combination, calls `mapTones` with `findClosest` color lookup to generate hover/active/base state colors.
- Solid buttons get: `backgroundColor` (base, hover, active), `borderColor` (all states same), `textColor` (all states same, typically white/contrast).
- Outlined buttons get: `backgroundColor` (transparent, alpha hover, alpha active), `borderColor` (base, lighter hover, lighter active), `textColor` (base, lighter hover, lighter active).
- Ghost buttons get: `backgroundColor` (transparent, alpha hover, alpha active), no border, `textColor` (base, lighter hover, lighter active).
- Uses `findClosest` to resolve button color from theme variables, supporting direct color definitions or references to palette colors.
- Uses `mapTones` to generate state variants with different lightness and alpha values for hover/active states.
- Returns object with all generated button tokens: `{ "backgroundColor-Button-primary-solid": "...", "backgroundColor-Button-primary-solid--hover": "...", ... }`.
- Generated tokens provide complete button styling for all states and variants without manual state management.
- Used by `useCompiledTheme` during theme compilation to expand button color definitions into state-aware tokens.

#### See Also

- `findClosest` — function that looks up and resolves button colors from theme variables.
- `mapTones` — function that generates hover/active/alpha variants from base colors.
- Button component — uses these generated tokens for variant and state styling.
- `useCompiledTheme` — hook that calls this function during theme compilation.

### The `resolveThemeVar` Function

`resolveThemeVar` performs recursive resolution of theme variable references to their final values. It handles variable references (starting with `$`) by following the reference chain until reaching a concrete value, preventing infinite loops and providing the actual theme value for JavaScript-side usage.

#### Behavior

- Accepts `varName` (variable name to resolve, with or without `$` prefix) and `theme` (map of theme variable names to values).
- Strips leading `$` from variable name if present to normalize the lookup key.
- Looks up value in theme object and returns immediately if value is not a variable reference.
- If value is another variable reference (starts with `$`), recursively calls itself to continue resolution.
- Returns final resolved value after following the reference chain to a concrete value.
- Does not detect circular references—circular theme variable definitions will cause infinite recursion and stack overflow.
- Used by theme compilation utilities when JavaScript needs actual variable values rather than CSS variable references.
- Complements `toCssVar` which creates CSS variable references without resolving values.

#### See Also

- `toCssVar` — function that creates CSS variable references without resolving values.
- `useCompiledTheme` — uses this function during theme compilation for value resolution.
- `getThemeVar` — context-aware function exposed by compiled theme for component-side variable resolution.

### The `matchThemeVar` Function

`matchThemeVar` performs hierarchical theme variable matching across theme chains. It finds the closest matching variable in the theme chain for a requested variable name, supporting hyphenated pattern matching where more specific variables inherit from less specific ones.

#### Behavior

- Accepts `forValue` (variable name being requested) and `themeVars` (array of theme variable objects in chain order).
- Implements hierarchical matching where `color-Button-primary-solid-hover` can match `color-Button-primary-solid`, `color-Button-primary`, or `color-Button`.
- Splits variable name by hyphens and progressively removes trailing segments to search for parent variables.
- Returns match object with `forValue` (requested name), `matchedValue` (found name), `theme` (theme object containing match).
- Used by `useCompiledTheme` to detect variables that should reference parent theme values via CSS variables.
- Enables theme inheritance where child themes can define partial overrides and automatically reference parent values for unspecified segments.
- Returns `undefined` if no match is found in the theme chain.

#### See Also

- `collectThemeChainByExtends` — builds theme chain that matchThemeVar searches.
- `useCompiledTheme` — uses this function to create hierarchical variable references.
- `resolveThemeVar` — performs recursive resolution after matching finds the target variable.

### The `useTheme` Hook

`useTheme` provides access to the current compiled theme scope for components. It returns the resolved theme variables, CSS variables, resource resolver, and theme metadata from the nearest `ThemeContext.Provider` ancestor, enabling components to access theme values and adapt styling based on the active theme.

#### Behavior

- Reads from `ThemeContext` via `useContext` to access the current theme scope's compiled data.
- Returns `ThemeScope` object containing: `activeThemeId`, `activeThemeTone`, `activeTheme` (full definition), `themeStyles` (CSS variables object), `themeVars` (resolved variable map), `getResourceUrl` (resource resolver), `getThemeVar` (variable lookup), `root` (DOM root for portals), `setRoot` (root state setter).
- Provides access to the theme scope created by nearest `Theme` component or root `ThemeProvider`.
- Enables components to query theme values programmatically for logic that depends on theme data.
- Used by component renderers, layout resolvers, and utility functions that need theme awareness.
- Returns the scoped theme from `Theme` components rather than global theme when called inside theme scopes.

#### See Also

- `ThemeContext` — context provided by Theme and ThemeProvider components.
- `useThemes` — hook for accessing global theme registry and switching functions.
- Theme component — creates scoped ThemeContext for its descendants.
- ThemeProvider — creates root ThemeContext for the application.

### The `useThemes` Hook

`useThemes` provides access to the global theme registry and theme switching functions. It returns all available themes, the active theme ID and tone, and functions to change theme and tone at runtime, enabling theme switcher UI and global theme configuration.

#### Behavior

- Reads from `ThemesContext` via `useContext` to access global theme management state.
- Returns `AppThemes` object containing: `themes` (all available theme definitions), `resources` (global resources), `resourceMap` (resource path mappings), `activeThemeId` (current theme), `activeThemeTone` (current tone), `availableThemeIds` (array of theme IDs), `activeTheme` (current theme definition), `setActiveThemeId` (theme switcher), `setActiveThemeTone` (tone switcher), `toggleThemeTone` (light/dark toggle).
- Enables global theme switching UI by exposing `setActiveThemeId` and `setActiveThemeTone` functions.
- Provides theme registry for theme selector dropdowns that list `availableThemeIds`.
- Used by theme switcher components, theme configuration panels, and app-level theme management.
- Always returns global theme state, not scoped theme state from nested Theme components.

#### See Also

- `ThemesContext` — context provided by ThemeProvider with global theme state.
- `useTheme` — hook for accessing current compiled theme scope.
- ThemeProvider — creates ThemesContext for the application.
- `toggleThemeTone` — convenience function for implementing dark mode toggles.

### The `StyleInjectionTargetContext` Context

`StyleInjectionTargetContext` provides the DOM root where styles should be injected (document or shadow root). It enables XMLUI to work correctly in both normal DOM and shadow DOM environments by allowing components to query the injection target and inject styles in the correct location.

#### Behavior

- Stores `Document | ShadowRoot | null` representing the DOM root for style injection.
- Consumed by `useDomRoot` hook which returns the injection target for use by `useStyles` and other injection hooks.
- Enables shadow DOM support by allowing apps to provide a shadow root as injection target, ensuring styles are injected inside the shadow DOM where they can affect shadowed components.
- Falls back to `document` when no context is provided, maintaining compatibility with standard DOM environments.
- Used by NestedApp component to provide shadow root context for isolated app styling.

#### See Also

- `useDomRoot` — hook that reads this context.
- `useStyles` — uses injection target from this context for style tag placement.
- NestedApp component — provides shadow root via this context for isolated styling.

### The `useDomRoot` Hook

`useDomRoot` returns the DOM root where styles should be injected (document or shadow root). It reads from `StyleInjectionTargetContext` to enable components to inject styles in the correct location regardless of DOM vs shadow DOM environment.

#### Behavior

- Reads `StyleInjectionTargetContext` via `useContext` to access the current injection target.
- Returns `Document | ShadowRoot | null` representing where style tags should be appended.
- Used by `useStyles` to determine injection target: `document.head` for normal DOM, shadow root element for shadow DOM.
- Enables XMLUI's shadow DOM support by allowing dynamic injection target selection at runtime.
- Returns null during SSR since document is not available, preventing server-side injection errors.

#### See Also

- `StyleInjectionTargetContext` — context that stores the injection target.
- `useStyles` — uses this hook to determine where to inject style tags.
- NestedApp component — sets injection target to shadow root via context provider.

### Component Default Theme Variables

XMLUI provides a mechanism for components to register default theme variables that are automatically merged into the root theme. This enables components to define their default styling tokens without requiring explicit theme definitions, while still allowing themes to override these defaults.

#### Behavior

- Component packages export default theme variables via `DefaultThemeVars` type objects in their package metadata.
- The component registry collects `componentDefaultThemeVars` from all registered components during initialization.
- `collectThemeChainByExtends` merges all component defaults into the root theme before building the theme chain.
- Component defaults can define both base variables and tone-specific overrides following the same structure as theme definitions.
- Themes can override component defaults by defining the same variable names, following the standard theme inheritance rules.
- Enables component libraries to ship with sensible styling defaults while maintaining full theme customization.
- Example: Text component registers default variables for `textColor-Text`, `fontSize-Text`, `fontFamily-Text`, etc.

#### See Also

- `ComponentRegistry` — collects component default theme variables during registration.
- `collectThemeChainByExtends` — merges component defaults into root theme.
- `RootThemeDefinition` — base theme that receives component default merges.

### Theme Font Loading

XMLUI automatically loads fonts declared in theme resources, supporting both CSS link-based fonts and FontFace API-based fonts for flexible font integration.

#### Behavior

- Theme resources can declare fonts using `font.{name}` keys with either string URLs (CSS links) or FontFace definition objects.
- `useCompiledTheme` extracts font resources from theme chain, separating link-based fonts from FontFace definitions.
- CSS link fonts are collected into `fontLinks` array and rendered as `<link rel="stylesheet">` tags via Helmet.
- FontFace fonts are loaded via `useEffect` that creates FontFace instances, calls `load()`, and adds them to `document.fonts`.
- Font loading supports all FontFace properties: `fontFamily`, `src`, `fontWeight`, `fontStyle`, `fontDisplay`, `format`.
- Resource URLs in font `src` properties are resolved via `getResourceUrl`, supporting resource references like `resource:customfont.woff2`.
- Font loading failures are caught and logged to console without breaking theme application.
- Fonts from parent themes are inherited and merged with child theme fonts, following standard resource merging rules.

#### See Also

- `useCompiledTheme` — hook that extracts and processes font resources.
- `getResourceUrl` — function that resolves font source URLs from theme resources.
- FontFace API — browser API for programmatic font loading.
- Helmet — library for injecting font link tags into document head.

### Responsive Design and Breakpoints

XMLUI provides responsive design capabilities through viewport breakpoints, responsive layout properties, and CSS custom properties that enable viewport-aware styling without JavaScript media queries.

#### Behavior

- Root `Theme` components generate `--screenSize` CSS variable with values 0-5 representing viewport size categories.
- Breakpoints are defined via theme variables: `maxWidth-phone`, `maxWidth-landscape-phone`, `maxWidth-tablet`, `maxWidth-desktop`, `maxWidth-large-desktop`.
- Media queries in root theme set `--screenSize` based on viewport width: 0 (xs), 1 (sm), 2 (md), 3 (lg), 4 (xl), 5 (xxl).
- Components can use `--screenSize` in CSS for responsive styling: `width: calc(100% - (var(--screenSize) * 20px))`.
- Layout properties support responsive variants: `width-xs`, `width-sm`, `width-md`, `width-lg`, `width-xl`, `width-xxl`.
- `resolveLayoutProps` selects appropriate responsive property value based on `layoutContext.mediaSize.sizeIndex`.
- `AppContent` creates JavaScript `mediaSize` object with viewport dimensions and boolean flags (`isPhone`, `isTablet`, `isDesktop`, etc.) for imperative responsive logic.
- Responsive property resolution follows mobile-first fallback: `width-lg` falls back to `width-md` if `width-lg` is undefined.

#### See Also

- Theme component — generates responsive CSS variables when `isRoot={true}`.
- `resolveLayoutProps` — selects responsive property values based on viewport size.
- `AppContent` — provides JavaScript mediaSize object for imperative responsive logic.
- Layout properties — support responsive variants via size suffixes.

### CSS Layers and Cascade Order

XMLUI uses CSS `@layer` directive to ensure predictable style precedence and prevent specificity conflicts between static, theme, and dynamic styles.

#### Behavior

- Static component CSS (from SCSS modules) is loaded in default (unlayered) cascade position, giving it standard precedence.
- Theme CSS variables are injected via CSS-in-JS into the `dynamic` layer, ensuring they can be overridden by component styles.
- All CSS-in-JS from `useStyles` is wrapped in `@layer dynamic` to place it in the dynamic layer with consistent precedence.
- CSS layers establish precedence order: unlayered (static CSS) > `@layer dynamic` (CSS-in-JS), but within a layer specificity still matters.
- This architecture allows static CSS to override dynamic styles when needed (e.g., component-specific adjustments) while keeping dynamic styles predictable.
- Components can use both static CSS classes and dynamic CSS-in-JS with clear precedence rules.

#### See Also

- `useStyles` — wraps generated CSS in `@layer dynamic` directive.
- CSS `@layer` specification — W3C standard for cascade layering.
- Component SCSS modules — static CSS loaded outside layers with standard precedence.

### Shadow DOM Support

XMLUI supports rendering in shadow DOM environments through injection target context and isolated style scoping, enabling web components and isolated app scenarios.

#### Behavior

- `StyleInjectionTargetContext` allows providing a shadow root as style injection target via context provider.
- `useStyles` detects shadow root injection target via `useDomRoot` and injects styles inside the shadow DOM instead of document head.
- Theme component manages theme root state for shadow DOM environments, storing reference to shadow root's app container element.
- NestedApp component creates shadow roots and provides them via `StyleInjectionTargetContext` for isolated app styling.
- CSS variables cascade into shadow DOM from parent document, but styles injected inside shadow DOM remain isolated.
- Prevents style conflicts when multiple XMLUI apps or web components are rendered on the same page.

#### See Also

- `StyleInjectionTargetContext` — context for providing shadow root injection target.
- `useDomRoot` — hook that returns injection target (document or shadow root).
- NestedApp component — creates shadow roots and provides injection target context.
- `useStyles` — injects styles into shadow root when provided via context.

---

This comprehensive documentation covers XMLUI's complete theming and styling architecture. The system combines theme definitions, CSS variable generation, CSS-in-JS, layout property resolution, and responsive design to create a powerful, flexible styling solution that works seamlessly in both standard DOM and shadow DOM environments.

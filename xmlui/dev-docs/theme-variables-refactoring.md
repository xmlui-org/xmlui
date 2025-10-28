# Theme Variables Refactoring Notes

## Overview

This document outlines the process of refactoring SCSS component files to ensure all theme variables are properly exposed and registered at the module's top level. Variables defined inside `@mixin` or `@layer` blocks may not be correctly collected by the theme system.

## Theme Variable Naming Standards

All theme variable names must follow a specific pattern that can be parsed by `parseLayoutProperty()` found in `parse-layout-props.ts`. The general structure is:

```
{property}-{component-part}-{component-name}[--{state1}--{state2}...--{stateN}]
```

Where `[]` denotes 0, 1 or more of the contained elements.

### Key Rules:
1. **Properties** use camelCase (e.g., `backgroundColor`, `textColor`, `borderRadius`)
2. **Component names** always start with a capital letter (e.g., `Text`, `NumberBox`, `Carousel`)
3. **Component parts** start with lowercase (e.g., `control`, `indicator`, `passwordToggle`)
4. **States** use double dashes (`--`) not single dashes, and must be at the END
5. Common states: `hover`, `focus`, `active`, `disabled`
6. Not all components have parts

### ✅ Correct Examples:
```scss
// Simple property for a component
$borderRadius-Image: createThemeVar("borderRadius-Image");

// Property with component part
$backgroundColor-control-Carousel: createThemeVar("backgroundColor-control-#{$component}");

// Property with component part and state
$backgroundColor-control-Carousel--hover: createThemeVar("backgroundColor-control-#{$component}--hover");

// Property with multiple states
$textColor-indicator-Carousel--hover--disabled: createThemeVar("textColor-indicator-#{$component}--hover--disabled");
```

### ❌ Incorrect Examples (DO NOT USE):
```scss
// WRONG: Property uses kebab-case instead of camelCase
$background-color-control-Carousel: createThemeVar("background-color-control-#{$component}");

// WRONG: State uses single dash instead of double dash
$backgroundColor-control-hover-Carousel: createThemeVar("backgroundColor-control-hover-#{$component}");

// WRONG: State is not at the end
$backgroundColor-hover-control-Carousel: createThemeVar("backgroundColor-hover-control-#{$component}");

// WRONG: Component name doesn't start with uppercase
$backgroundColor-carousel: createThemeVar("backgroundColor-carousel");
```

### When Refactoring Files with Non-Standard Variables:
If you encounter theme variables that don't follow this standard (e.g., using `-hover` instead of `--hover`), **DO NOT** extract them during refactoring. Note them for later correction. The naming must be fixed first to comply with the `parseLayoutProperty()` parser.

## Refactoring Constraints

### 1. Move `createThemeVar` calls outside `@mixin` and `@layer`
All `createThemeVar()` function calls must be moved to the top level of the SCSS file, before any `@mixin` or `@layer` blocks.

### 2. For calls under `@layer`
Create SASS variables outside the `@layer` block, then reference them inside.

**Before:**
```scss
@layer components {
  .img {
    border-radius: createThemeVar("borderRadius-Image");
    border-color: createThemeVar("borderColor-Image");
  }
}
```

**After:**
```scss
// Variables for @layer section
$borderRadius-Image: createThemeVar("borderRadius-Image");
$borderColor-Image: createThemeVar("borderColor-Image");

@layer components {
  .img {
    border-radius: $borderRadius-Image;
    border-color: $borderColor-Image;
  }
}
```

### 3. For calls under `@mixin`
Create SASS variables for **each variant case** outside the mixin.

**Example for variants (default, error, warning, success):**
```scss
// Variables for default variant
$borderColor-TextBox-default: createThemeVar("Input:borderColor-#{$componentName}-default");
$borderColor-TextBox-default--hover: createThemeVar("Input:borderColor-#{$componentName}-default--hover");

// Variables for error variant  
$borderColor-TextBox-error: createThemeVar("Input:borderColor-#{$componentName}-error");
$borderColor-TextBox-error--hover: createThemeVar("Input:borderColor-#{$componentName}-error--hover");

// ... repeat for warning and success
```

### 4. Keep `@mixin` contents unchanged
**IMPORTANT:** The `@mixin` should retain its original implementation with `createThemeVar()` calls. Do NOT attempt to use variable interpolation like `$borderColor-TextBox-#{$variantName}` as this is not valid SASS syntax for variable references.

**Correct (keep as is):**
```scss
@mixin variant($variantName) {
  border-color: createThemeVar("Input:borderColor-#{$componentName}-#{$variantName}");
}
```

**Incorrect (do not use):**
```scss
@mixin variant($variantName) {
  border-color: $borderColor-TextBox-#{$variantName}; // Invalid SASS
}
```

## Refactoring Patterns by Complexity

### Level 1: Simple Components Without Variants

Components like Image that don't have variants or complex sub-elements will have a simple, flat list of variables.

**Example:**
```scss
// Variables for @layer section
$borderRadius-Image: createThemeVar("borderRadius-Image");
$borderColor-Image: createThemeVar("borderColor-Image");

@layer components {
  .img {
    border-radius: $borderRadius-Image;
    border-color: $borderColor-Image;
  }
}
```

### Level 2: Components with States

Components that have state variations (hover, focus, active, disabled) but no variants or complex sub-elements.

**Example - Link component:**
```scss
// Variables for @layer section
$outlineWidth-Link--focus: createThemeVar("outlineWidth-Link--focus");
$outlineColor-Link--focus: createThemeVar("outlineColor-Link--focus");
$outlineStyle-Link--focus: createThemeVar("outlineStyle-Link--focus");
$outlineOffset-Link--focus: createThemeVar("outlineOffset-Link--focus");

@layer components {
  .link {
    &:focus {
      outline-width: $outlineWidth-Link--focus;
      outline-color: $outlineColor-Link--focus;
      outline-style: $outlineStyle-Link--focus;
      outline-offset: $outlineOffset-Link--focus;
    }
  }
}
```

**Example - Heading component with multiple heading levels:**
```scss
// Variables for H1
$textColor-H1: createThemeVar("textColor-H1");
$letterSpacing-H1: createThemeVar("letterSpacing-H1");
$fontFamily-H1: createThemeVar("fontFamily-H1");
$fontWeight-H1: createThemeVar("fontWeight-H1");
$marginTop-H1: createThemeVar("marginTop-H1");
$marginBottom-H1: createThemeVar("marginBottom-H1");

// Variables for H2
$textColor-H2: createThemeVar("textColor-H2");
$letterSpacing-H2: createThemeVar("letterSpacing-H2");
// ... repeat for H3-H6

@layer components {
  .h1 {
    color: $textColor-H1;
    letter-spacing: $letterSpacing-H1;
    font-family: $fontFamily-H1;
    font-weight: $fontWeight-H1;
    margin-top: $marginTop-H1;
    margin-bottom: $marginBottom-H1;
  }
}
```

### Level 3: Components with Sub-Elements

Components with multiple distinct sub-elements (not variants), each with their own state variations. Group variables by sub-element for better organization.

**⚠️ NOTE:** The Carousel component currently has incorrect variable naming (uses `-hover` instead of `--hover`). Do not extract variables with non-standard names.

**How it SHOULD be:**
```scss
// Variables for main carousel
$width-Carousel: createThemeVar("width-#{$component}");
$height-Carousel: createThemeVar("height-#{$component}");

// Variables for control buttons
$backgroundColor-control-Carousel: createThemeVar("backgroundColor-control-#{$component}");
$backgroundColor-control-Carousel--hover: createThemeVar("backgroundColor-control-#{$component}--hover");
$backgroundColor-control-Carousel--active: createThemeVar("backgroundColor-control-#{$component}--active");
$backgroundColor-control-Carousel--disabled: createThemeVar("backgroundColor-control-#{$component}--disabled");

// Variables for indicators
$backgroundColor-indicator-Carousel: createThemeVar("backgroundColor-indicator-#{$component}");
$backgroundColor-indicator-Carousel--hover: createThemeVar("backgroundColor-indicator-#{$component}--hover");
$backgroundColor-indicator-Carousel--active: createThemeVar("backgroundColor-indicator-#{$component}--active");

@layer components {
  .controlButton {
    background-color: $backgroundColor-control-Carousel;
    
    &:hover {
      background-color: $backgroundColor-control-Carousel--hover;
    }
  }
}
```

### Level 4: Components with Validation Variants

Components like TextBox and NumberBox that support validation variants (default, error, warning, success).

**Structure:**
```scss
$componentName: "TextBox";

// Variables for default variant
$borderColor-TextBox-default: createThemeVar("Input:borderColor-#{$componentName}-default");
$borderWidth-TextBox-default: createThemeVar("Input:borderWidth-#{$componentName}-default");
$backgroundColor-TextBox-default: createThemeVar("Input:backgroundColor-#{$componentName}-default");
$borderColor-TextBox-default--hover: createThemeVar("Input:borderColor-#{$componentName}-default--hover");
$borderColor-TextBox-default--focus: createThemeVar("Input:borderColor-#{$componentName}-default--focus");

// Variables for error variant
$borderColor-TextBox-error: createThemeVar("Input:borderColor-#{$componentName}-error");
$borderWidth-TextBox-error: createThemeVar("Input:borderWidth-#{$componentName}-error");
$backgroundColor-TextBox-error: createThemeVar("Input:backgroundColor-#{$componentName}-error");
$borderColor-TextBox-error--hover: createThemeVar("Input:borderColor-#{$componentName}-error--hover");
$borderColor-TextBox-error--focus: createThemeVar("Input:borderColor-#{$componentName}-error--focus");

// ... repeat for warning and success variants

// Variables for @layer section
$gap-adornment-TextBox: createThemeVar("Input:gap-adornment-#{$componentName}");
$textColor-TextBox--disabled: createThemeVar("Input:textColor-#{$componentName}--disabled");

@mixin variant($variantName) {
  // Keep original implementation with createThemeVar calls
  border-color: createThemeVar("Input:borderColor-#{$componentName}-#{$variantName}");
  
  &:hover {
    border-color: createThemeVar("Input:borderColor-#{$componentName}-#{$variantName}--hover");
  }
}

@layer components {
  .inputRoot {
    gap: $gap-adornment-TextBox;
    @include variant("default");
    
    &.error {
      @include variant("error");
    }
  }
}
```

### Level 5: Components with Validation Variants AND Unique Sub-Elements

Components that combine validation variants with component-specific elements (like TextBox with passwordToggle).

**Structure:**
```scss
// Variables for default variant
$borderColor-TextBox-default: createThemeVar("Input:borderColor-#{$componentName}-default");
$borderColor-TextBox-default--hover: createThemeVar("Input:borderColor-#{$componentName}-default--hover");

// Variables for error, warning, success variants
// ... (same pattern as default)

// Variables for passwordToggle (not variant-specific)
$color-passwordToggle-TextBox: createThemeVar("Input:color-passwordToggle-#{$componentName}");
$paddingLeft-passwordToggle-TextBox: createThemeVar("Input:paddingLeft-passwordToggle-#{$componentName}");
$paddingRight-passwordToggle-TextBox: createThemeVar("Input:paddingRight-passwordToggle-#{$componentName}");
$color-passwordToggle-TextBox--hover: createThemeVar("Input:color-passwordToggle-#{$componentName}--hover");
$color-passwordToggle-TextBox--focus: createThemeVar("Input:color-passwordToggle-#{$componentName}--focus");

// Variables for @layer section
$gap-adornment-TextBox: createThemeVar("Input:gap-adornment-#{$componentName}");
$textColor-TextBox--disabled: createThemeVar("Input:textColor-#{$componentName}--disabled");
```

## Common Issues

### Missing borderRadius Variables
Some components (like NumberBox) may not have pre-existing borderRadius variables defined outside the mixin. Ensure all borderRadius variants are created:

```scss
$borderRadius-NumberBox-default: createThemeVar("Input:borderRadius-#{$componentName}-default");
$borderRadius-NumberBox-error: createThemeVar("Input:borderRadius-#{$componentName}-error");
$borderRadius-NumberBox-warning: createThemeVar("Input:borderRadius-#{$componentName}-warning");
$borderRadius-NumberBox-success: createThemeVar("Input:borderRadius-#{$componentName}-success");
```

### Inconsistent State Naming
Always use `--` for states, never `-`. If you find incorrect naming, note it for correction but don't extract those variables during refactoring.

## New Findings from Recent Refactorings

### CSS !important Flag Behavior
The CSS `!important` flag can be used with SASS variables when they are referenced in property declarations, but NOT in variable assignments:

**✅ Valid - !important on CSS property:**
```scss
h1 {
  margin-top: $marginTop-H1-markdown !important;  // Correct
  font-size: $fontSize-H1-markdown !important;    // Correct
}
```

This compiles to:
```css
h1 {
  margin-top: var(--marginTop-H1-markdown) !important;
}
```

**❌ Invalid - !important on variable assignment:**
```scss
// This has no effect and should not be used
$marginTop-H1-markdown: createThemeVar("marginTop-H1-markdown") !important;
```

The `!important` flag is a CSS feature that applies to property values in the compiled output, not to SASS variable definitions.

### Complex Components with Multiple Contexts

Some components like Markdown have variables used in multiple contexts:

1. **Component-level properties** - applied to the root element (e.g., `paddingTop-Markdown`)
2. **Sub-element properties** - for distinct parts like blockquotes, admonitions (e.g., `backgroundColor-Blockquote`)
3. **Contextual variations** - elements styled differently within the component (e.g., `marginTop-H1-markdown`, `marginTop-Image-markdown`)
4. **Sub-element variants** - variations of sub-elements (e.g., `backgroundColor-Admonition-info`, `backgroundColor-Admonition-warning`)

When refactoring complex components:
- Group variables logically by their context (use comments to separate groups)
- Maintain the `-markdown` suffix for contextual variations to distinguish them from standalone component variables
- Sub-element variants should follow the pattern: `{property}-{part}-{component}-{variant}` (e.g., `backgroundColor-Admonition-info`)

**Example from Markdown component:**
```scss
// Variables for main Markdown container
$paddingTop-MarkDown: createThemeVar("paddingTop-Markdown");
$backgroundColor-MarkDown: createThemeVar("backgroundColor-Markdown");

// Variables for Text-markdown (contextual variation)
$marginTop-Text-markdown: createThemeVar("marginTop-Text-markdown");
$marginLeft-Text-markdown: createThemeVar("marginLeft-Text-markdown");

// Variables for Admonition sub-element
$backgroundColor-Admonition: createThemeVar("backgroundColor-Admonition");
$marginTop-Admonition: createThemeVar("marginTop-Admonition");

// Variables for Admonition variants
$backgroundColor-Admonition-info: createThemeVar("backgroundColor-Admonition-info");
$backgroundColor-Admonition-warning: createThemeVar("backgroundColor-Admonition-warning");
$backgroundColor-Admonition-danger: createThemeVar("backgroundColor-Admonition-danger");
```

### Components with Minimal Variables

Not all components have numerous theme variables. Some simpler components like:
- **IFrame** - Only 2 variables (`width-IFrame`, `height-IFrame`)
- **Image** - Only 2 variables (`borderRadius-Image`, `borderColor-Image`)

For these simple components, the refactoring is straightforward with just a few variable declarations before the `@layer` block.

## Special Cases

### Markdown Component - Hybrid Content Renderer

The **Markdown** component is a special case that doesn't fit into the standard complexity levels. It acts as a content renderer that styles multiple different elements and contexts within markdown content.

**Unique characteristics:**
1. **Multiple component contexts** - Styles many different HTML elements (h1-h6, images, blockquotes, horizontal rules, etc.)
2. **Contextual variations** - Same element types styled differently within markdown (e.g., `H1-markdown` vs standalone `H1`)
3. **Sub-element variants** - Has variant systems for sub-elements (e.g., Admonition with info/warning/danger/note/tip variants)
4. **Mixed naming patterns** - Uses both component-level naming and contextual suffixes

**Variable organization pattern:**
```scss
// Variables for main Markdown container
$paddingTop-MarkDown: createThemeVar("paddingTop-Markdown");
$backgroundColor-MarkDown: createThemeVar("backgroundColor-Markdown");

// Variables for Text-markdown (contextual variation)
$marginTop-Text-markdown: createThemeVar("marginTop-Text-markdown");
$marginLeft-Text-markdown: createThemeVar("marginLeft-Text-markdown");

// Variables for Heading margins in markdown context
$marginTop-H1-markdown: createThemeVar("marginTop-H1-markdown");
$marginBottom-H1-markdown: createThemeVar("marginBottom-H1-markdown");
$fontSize-H1-markdown: createThemeVar("fontSize-H1-markdown");
// ... repeat for H2-H6

// Variables for Image in markdown context
$marginTop-Image-markdown: createThemeVar("marginTop-Image-markdown");
$marginBottom-Image-markdown: createThemeVar("marginBottom-Image-markdown");

// Variables for Blockquote sub-element
$backgroundColor-Blockquote: createThemeVar("backgroundColor-Blockquote");
$marginTop-Blockquote: createThemeVar("marginTop-Blockquote");
$color-accent-Blockquote: createThemeVar("color-accent-Blockquote");

// Variables for Admonition sub-element
$backgroundColor-Admonition: createThemeVar("backgroundColor-Admonition");
$borderRadius-Admonition: createThemeVar("borderRadius-Admonition");

// Variables for Admonition variants
$backgroundColor-Admonition-info: createThemeVar("backgroundColor-Admonition-info");
$borderColor-Admonition-info: createThemeVar("borderColor-Admonition-info");
$backgroundColor-Admonition-warning: createThemeVar("backgroundColor-Admonition-warning");
$borderColor-Admonition-warning: createThemeVar("borderColor-Admonition-warning");
// ... etc

// Variables for HorizontalRule
$borderColor-HorizontalRule: createThemeVar("borderColor-HorizontalRule");
$borderStyle-HorizontalRule: createThemeVar("borderStyle-HorizontalRule");
$borderWidth-HorizontalRule: createThemeVar("borderWidth-HorizontalRule");
```

**Key differences from other components:**
- Uses `-markdown` suffix to differentiate contextual element styles from standalone components
- Combines multiple sub-elements (Blockquote, Admonition, HorizontalRule) each with their own properties
- Has variant systems for sub-elements (not for the Markdown component itself)
- Requires careful grouping with comments to maintain readability due to the large number of variables

When refactoring Markdown-like components, prioritize logical grouping by context and use clear comments to separate different sections.

## Refactoring Progress

### ✅ Completed Refactorings

1. **TextBox**
2. **NumberBox**
3. **Carousel** ⚠️ Has incorrect naming (uses `-hover` instead of `--hover`) - needs correction
4. **Image**
5. **Link**
6. **Heading**
7. **IFrame**
8. **Markdown**
9. **Button**
10. **Text**
11. **FormItem**
12. **Form**
13. **NavPanel**
14. **NavLink**
15. **Table**
16. **App**
17. **AppHeader**
18. **AutoComplete**
19. **ColorPicker**
20. **DateInput**
21. **FileInput**
22. **Pagination**
23. **RadioGroup**
24. **ToneSwitch**
25. **TreeDisplay**
26. **TableOfContents**
27. **TextArea**
28. **TimeInput**
29. **Slider**
30. **Select**
31. **DatePicker**

**Total: 31 components refactored**

### 📦 Components Using Shared Stylesheets

The following components share stylesheets with already-refactored components and are therefore complete:

1. **H1** - Uses `Heading.module.scss` (Heading already refactored #6)
2. **H2** - Uses `Heading.module.scss` (Heading already refactored #6)
3. **H3** - Uses `Heading.module.scss` (Heading already refactored #6)
4. **H4** - Uses `Heading.module.scss` (Heading already refactored #6)
5. **H5** - Uses `Heading.module.scss` (Heading already refactored #6)
6. **H6** - Uses `Heading.module.scss` (Heading already refactored #6)
7. **CarouselItem** - Uses `Carousel.module.scss` (Carousel already refactored #3)
8. **RadioItem** - Uses `RadioGroup.module.scss` (RadioGroup already refactored #23)
9. **Password** - Uses `TextBox.module.scss` (TextBox already refactored #1)

**Total: 9 additional components complete via shared stylesheets**

### ⚠️ Components Skipped

1. **Accordion** - Incorrect variable naming (single dash for states instead of double dash)

### 📋 Components Remaining

Approximately **2 components** still need refactoring (out of 42 total with unexposed theme variables, accounting for 31 direct refactorings + 9 shared-stylesheet components + 1 skipped).


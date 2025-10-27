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

### Level 2: Components with Sub-Elements and States

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

### Level 3: Components with Variants

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

### Level 4: Components with Variants AND Unique Sub-Elements

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

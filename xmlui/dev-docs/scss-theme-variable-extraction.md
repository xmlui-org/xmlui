# SCSS Theme Variable Extraction Pattern

## Overview

This document describes the standard pattern for extracting theme variables from SCSS module files to enable proper JSON export for the theme variable system.

## Core Principle

**Extract all `createThemeVar()` calls from mixins, functions, and inline usage, and define them as separate SCSS variables at the module level.**

This ensures that:
- All theme variables are collected via `createThemeVar()` before use
- Variables can be properly exported as JSON
- The theme system can augment variables in TypeScript code

## Pattern Structure

### 1. Variable Naming Convention

Follow this hierarchy for variable names:

```scss
// Generic/base variable
$property-Component

// Element-specific variable  
$property-element-Component

// State-specific variable
$property-element-Component--state

// Variant-specific variable
$property-Component-variant

// Variant with state
$property-Component-variant--state
```

### 2. Organization

Group variables logically by:
1. Generic component variables
2. Element-specific variables (header, content, icon, etc.)
3. Variant variables (default, error, warning, success)
4. State modifiers (hover, active, focus, disabled)

### 3. State Suffix Format

Use double-dash `--` for state modifiers in the `createThemeVar()` call:
```scss
$backgroundColor-control-Carousel--hover: createThemeVar("backgroundColor-control-Carousel--hover");
```

## Examples

### Simple Component (Carousel)

```scss
$component: "Carousel";

// Generic variables
$width-Carousel: createThemeVar("width-Carousel");
$height-Carousel: createThemeVar("height-Carousel");

// Element variables with states
$backgroundColor-control-Carousel: createThemeVar("backgroundColor-control-Carousel");
$backgroundColor-control-Carousel--hover: createThemeVar("backgroundColor-control-Carousel--hover");
$backgroundColor-control-Carousel--active: createThemeVar("backgroundColor-control-Carousel--active");
```

### Component with Variants (TextBox)

```scss
// Generic Input variables
$borderColor-Input-TextBox: createThemeVar("Input:borderColor-TextBox");
$borderColor-Input-TextBox--hover: createThemeVar("Input:borderColor-TextBox--hover");

// Default variant variables
$borderColor-Input-TextBox-default: createThemeVar("Input:borderColor-TextBox-default");
$borderColor-Input-TextBox-default--hover: createThemeVar("Input:borderColor-TextBox-default--hover");

// Error variant variables
$borderColor-Input-TextBox-error: createThemeVar("Input:borderColor-TextBox-error");
$borderColor-Input-TextBox-error--hover: createThemeVar("Input:borderColor-TextBox-error--hover");
```

### Component with Multiple Levels (Heading)

```scss
// Generic variable
$textColor-Heading: createThemeVar("textColor-Heading");

// Level-specific variables
$textColor-H1: createThemeVar("textColor-H1");
$textColor-H2: createThemeVar("textColor-H2");
// ... H3-H6

// Use in conditional mixin
@mixin heading($level) {
  @if $level == "H1" {
    color: $textColor-H1;
  } @else if $level == "H2" {
    color: $textColor-H2;
  }
  // ... etc
}
```

## Migration Steps

1. **Identify all `createThemeVar()` calls** in mixins, inline usage, or interpolated variables
2. **Extract to module level** as separate SCSS variables following naming conventions
3. **Replace interpolation** with explicit conditionals if using dynamic parameters
4. **Update references** to use the pre-defined variables
5. **Group and organize** variables by element/variant/state

## Before/After Example

### Before
```scss
@mixin variant($variantName) {
  background-color: createThemeVar("backgroundColor-#{$component}-#{$variantName}");
  &:hover {
    background-color: createThemeVar("backgroundColor-#{$component}-#{$variantName}--hover");
  }
}
```

### After
```scss
// Variable declarations
$backgroundColor-Input-TextBox-default: createThemeVar("Input:backgroundColor-TextBox-default");
$backgroundColor-Input-TextBox-default--hover: createThemeVar("Input:backgroundColor-TextBox-default--hover");

// Mixin with conditionals
@mixin variant($variantName) {
  @if $variantName == "default" {
    background-color: $backgroundColor-Input-TextBox-default;
    &:hover {
      background-color: $backgroundColor-Input-TextBox-default--hover;
    }
  }
}
```

## Key Benefits

- **Explicit variable collection**: All theme variables are visible at module top
- **JSON export support**: Variables can be properly exported for runtime use
- **Better maintainability**: Clear organization and naming conventions
- **Type safety**: Enables augmentation in TypeScript code
- **Theme inheritance**: Generic → specific variable cascade works correctly

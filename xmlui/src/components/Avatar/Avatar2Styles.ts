/**
 * Avatar2 Runtime CSS Styles
 * 
 * This file defines all styles for the Avatar2 component using JavaScript/TypeScript objects
 * instead of SCSS modules. Styles are injected at runtime using the useComponentStyle hook.
 * 
 * Theme variables are referenced using toCssVar() which converts $varName to var(--xmlui-varName)
 */

import { toCssVar } from "../../components-core/theming/layout-resolver";
import type { CSSProperties } from "react";

// =====================================================================================================================
// Theme Variable References
// =====================================================================================================================

/**
 * All theme variables used by Avatar2 component.
 * These correspond to the theme variables defined in Avatar2.tsx
 */
const THEME_VARS = {
  // Border properties (from composeBorderVars)
  border: toCssVar("$border-Avatar2"),
  borderLeft: toCssVar("$borderLeft-Avatar2"),
  borderRight: toCssVar("$borderRight-Avatar2"),
  borderTop: toCssVar("$borderTop-Avatar2"),
  borderBottom: toCssVar("$borderBottom-Avatar2"),
  borderWidth: toCssVar("$borderWidth-Avatar2"),
  borderLeftWidth: toCssVar("$borderLeftWidth-Avatar2"),
  borderRightWidth: toCssVar("$borderRightWidth-Avatar2"),
  borderTopWidth: toCssVar("$borderTopWidth-Avatar2"),
  borderBottomWidth: toCssVar("$borderBottomWidth-Avatar2"),
  borderStyle: toCssVar("$borderStyle-Avatar2"),
  borderLeftStyle: toCssVar("$borderLeftStyle-Avatar2"),
  borderRightStyle: toCssVar("$borderRightStyle-Avatar2"),
  borderTopStyle: toCssVar("$borderTopStyle-Avatar2"),
  borderBottomStyle: toCssVar("$borderBottomStyle-Avatar2"),
  borderColor: toCssVar("$borderColor-Avatar2"),
  borderLeftColor: toCssVar("$borderLeftColor-Avatar2"),
  borderRightColor: toCssVar("$borderRightColor-Avatar2"),
  borderTopColor: toCssVar("$borderTopColor-Avatar2"),
  borderBottomColor: toCssVar("$borderBottomColor-Avatar2"),
  borderRadius: toCssVar("$borderRadius-Avatar2"),
  borderStartStartRadius: `var(--xmlui-borderStartStartRadius-Avatar2, ${toCssVar("$borderRadius-Avatar2")})`,
  borderStartEndRadius: `var(--xmlui-borderStartEndRadius-Avatar2, ${toCssVar("$borderRadius-Avatar2")})`,
  borderEndStartRadius: `var(--xmlui-borderEndStartRadius-Avatar2, ${toCssVar("$borderRadius-Avatar2")})`,
  borderEndEndRadius: `var(--xmlui-borderEndEndRadius-Avatar2, ${toCssVar("$borderRadius-Avatar2")})`,
  
  // Component-specific properties
  backgroundColor: toCssVar("$backgroundColor-Avatar2"),
  boxShadow: toCssVar("$boxShadow-Avatar2"),
  textColor: toCssVar("$textColor-Avatar2"),
  fontWeight: toCssVar("$fontWeight-Avatar2"),
  
  // Spacing (used in size variants)
  space3: toCssVar("$space-3"),
  space4: toCssVar("$space-4"),
  space5: toCssVar("$space-5"),
  space8: toCssVar("$space-8"),
  space12: toCssVar("$space-12"),
  space16: toCssVar("$space-16"),
  space24: toCssVar("$space-24"),
};

// =====================================================================================================================
// Base Container Styles
// =====================================================================================================================

/**
 * Base styles for the avatar container.
 * Equivalent to .container in Avatar.module.scss
 */
export const avatarContainerStyle: Record<string, CSSProperties[keyof CSSProperties]> = {
  // Layout
  aspectRatio: "1 / 1",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  
  // Visual
  backgroundColor: THEME_VARS.backgroundColor,
  color: THEME_VARS.textColor,
  objectFit: "cover",
  boxShadow: THEME_VARS.boxShadow,
  
  // Border properties (equivalent to @include t.borderVars)
  borderLeft: THEME_VARS.borderLeft,
  borderRight: THEME_VARS.borderRight,
  borderTop: THEME_VARS.borderTop,
  borderBottom: THEME_VARS.borderBottom,
  borderLeftStyle: THEME_VARS.borderLeftStyle,
  borderRightStyle: THEME_VARS.borderRightStyle,
  borderTopStyle: THEME_VARS.borderTopStyle,
  borderBottomStyle: THEME_VARS.borderBottomStyle,
  borderLeftWidth: THEME_VARS.borderLeftWidth,
  borderRightWidth: THEME_VARS.borderRightWidth,
  borderTopWidth: THEME_VARS.borderTopWidth,
  borderBottomWidth: THEME_VARS.borderBottomWidth,
  borderLeftColor: THEME_VARS.borderLeftColor,
  borderRightColor: THEME_VARS.borderRightColor,
  borderTopColor: THEME_VARS.borderTopColor,
  borderBottomColor: THEME_VARS.borderBottomColor,
  borderRadius: THEME_VARS.borderRadius,
  borderStartStartRadius: THEME_VARS.borderStartStartRadius,
  borderStartEndRadius: THEME_VARS.borderStartEndRadius,
  borderEndStartRadius: THEME_VARS.borderEndStartRadius,
  borderEndEndRadius: THEME_VARS.borderEndEndRadius,
  
  // Typography
  fontWeight: THEME_VARS.fontWeight,
  fontSize: "12px",
  whiteSpace: "nowrap",
  
  // Interaction
  userSelect: "none",
};

// =====================================================================================================================
// Size Variant Styles
// =====================================================================================================================

/**
 * Size variant styles for avatar.
 * Equivalent to &.xs, &.sm, &.md, &.lg in Avatar.module.scss
 */
export const avatarSizeStyles = {
  xs: {
    width: THEME_VARS.space8,
    height: THEME_VARS.space8,
    fontSize: THEME_VARS.space3,
  },
  sm: {
    width: THEME_VARS.space12,
    height: THEME_VARS.space12,
    fontSize: THEME_VARS.space4,
  },
  md: {
    width: THEME_VARS.space16,
    height: THEME_VARS.space16,
    fontSize: THEME_VARS.space5,
  },
  lg: {
    width: THEME_VARS.space24,
    height: THEME_VARS.space24,
    fontSize: THEME_VARS.space8,
  },
};

// =====================================================================================================================
// Interactive State Styles
// =====================================================================================================================

/**
 * Styles for clickable avatars.
 * Equivalent to &.clickable in Avatar.module.scss
 */
export const avatarClickableStyle: Record<string, CSSProperties[keyof CSSProperties]> = {
  cursor: "pointer",
};

import type { CSSProperties } from "react";
import type React from "react";
import { forwardRef, useMemo, useRef, useCallback, useEffect, memo } from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";
import classnames from "classnames";

import styles from "./Text.module.scss";

import { getMaxLinesStyle } from "../../components-core/utils/css-utils";
import {
  type BreakMode,
  type OverflowMode,
  type TextVariant,
  TextVariantElement,
} from "../abstractions";
import type { RegisterComponentApiFn } from "../..";
import { useComponentStyle } from "../../components-core/theming/StyleContext";
import { EMPTY_OBJECT } from "../../components-core/constants";
import { toCssVar } from "../../components-core/theming/layout-resolver";

// =============================================================================
// Custom Variant CSS Cache Infrastructure
// =============================================================================

/**
 * Cached CSS information for a custom variant.
 */
interface CustomVariantCacheEntry {
  /** The generated CSS class name for this variant */
  className: string;
  /** The CSS text content that defines the styles for this variant */
  cssText: string;
  /** Timestamp when this entry was created (for debugging/cleanup) */
  createdAt: number;
}

/**
 * Global cache that stores custom variant CSS styles.
 * Key: variant value (string)
 *
 * This cache ensures the same variant value always generates the same CSS.
 */
const customVariantCache = new Map<string, CustomVariantCacheEntry>();

/**
 * Retrieves a cached custom variant entry if it exists.
 */
export function getCustomVariantCache(
  variant: string,
): CustomVariantCacheEntry | undefined {
  return customVariantCache.get(variant);
}

/**
 * Stores a custom variant entry in the cache.
 */
export function setCustomVariantCache(
  variant: string,
  entry: Omit<CustomVariantCacheEntry, "createdAt">,
): void {
  customVariantCache.set(variant, {
    ...entry,
    createdAt: Date.now(),
  });
}

/**
 * Checks if a custom variant is already cached.
 */
export function hasCustomVariantCache(variant: string): boolean {
  return customVariantCache.has(variant);
}

/**
 * Clears the entire custom variant cache.
 * Useful for testing or full app resets.
 */
export function clearCustomVariantCache(): void {
  customVariantCache.clear();
}

/**
 * Gets cache statistics for debugging.
 */
export function getCustomVariantCacheStats() {
  return {
    totalEntries: customVariantCache.size,
    entries: Array.from(customVariantCache.entries()).map(([key, entry]) => ({
      key,
      className: entry.className,
      createdAt: new Date(entry.createdAt).toISOString(),
    })),
  };
}

// =============================================================================
// Component Definition
// =============================================================================

type TextProps = {
  uid?: string;
  children?: React.ReactNode;
  variant?: TextVariant;
  maxLines?: number;
  preserveLinebreaks?: boolean;
  ellipses?: boolean;
  overflowMode?: OverflowMode;
  breakMode?: BreakMode;
  style?: CSSProperties;
  className?: string;
  registerComponentApi?: RegisterComponentApiFn;
  [variantSpecificProps: string]: any;
};

export const defaultProps = {
  maxLines: 0,
  preserveLinebreaks: false,
  ellipses: true,
  overflowMode: undefined as OverflowMode | undefined,
  breakMode: "normal" as BreakMode | undefined,
};

export const Text = forwardRef(function Text(
  {
    uid,
    variant,
    maxLines = defaultProps.maxLines,
    style,
    className,
    children,
    preserveLinebreaks = defaultProps.preserveLinebreaks,
    ellipses = defaultProps.ellipses,
    overflowMode = defaultProps.overflowMode,
    breakMode = defaultProps.breakMode,
    registerComponentApi,
    ...variantSpecificProps
  }: TextProps,
  forwardedRef,
) {
  const innerRef = useRef<HTMLElement>(null);
  const ref = forwardedRef ? composeRefs(innerRef, forwardedRef) : innerRef;

  // Implement hasOverflow function
  const hasOverflow = useCallback((): boolean => {
    const element = innerRef.current;
    if (!element) return false;

    // Check both horizontal and vertical overflow
    const hasHorizontalOverflow = element.scrollWidth > element.clientWidth;
    const hasVerticalOverflow = element.scrollHeight > element.clientHeight;

    return hasHorizontalOverflow || hasVerticalOverflow;
  }, []);

  // Register API with XMLUI if provided
  useEffect(() => {
    if (registerComponentApi) {
      registerComponentApi({ hasOverflow });
    }
  }, [registerComponentApi, hasOverflow]);

  // NOTE: This is to accept syntax highlight classes coming from shiki
  // classes need not to be added to the rendered html element, so we remove them from props
  const { syntaxHighlightClasses, ...restVariantSpecificProps } = variantSpecificProps;

  const Element = useMemo(() => {
    if (!variant || !TextVariantElement[variant]) return "div";
    return TextVariantElement[variant];
  }, [variant]);

  // Custom variant CSS generation
  // Following React hook rules: hooks must be called unconditionally
  // We always call useComponentStyle, passing empty object for known variants
  const isCustomVariant = useMemo(() => {
    return variant && !TextVariantElement[variant];
  }, [variant]);

  // Always call useComponentStyle (React hook rule: no conditional hooks)
  // For now, pass empty object; later this will contain assembled CSS properties
  const variantSpec = useMemo(
    () => {
      if (!isCustomVariant) return EMPTY_OBJECT;
      const subject = `-Text-${variant}`;
      const cssInput = {
        color: toCssVar(`$textColor${subject}`),
        "font-family": toCssVar(`$fontFamily${subject}`),
        "font-size": toCssVar(`$fontSize${subject}`),
        "font-style": toCssVar(`$fontStyle${subject}`),
        "font-weight": toCssVar(`$fontWeight${subject}`),
        "font-stretch": toCssVar(`$fontStretch${subject}`),
        "text-decoration-line": toCssVar(`$textDecorationLine${subject}`),
        "text-decoration-color": toCssVar(`$textDecorationColor${subject}`),
        "text-decoration-style": toCssVar(`$textDecorationStyle${subject}`),
        "text-decoration-thickness": toCssVar(`$textDecorationThickness${subject}`),
        "text-underline-offset": toCssVar(`$textUnderlineOffset${subject}`),
        "line-height": toCssVar(`$lineHeight${subject}`),
        "background-color": toCssVar(`$backgroundColor${subject}`),
        "text-transform": toCssVar(`$textTransform${subject}`),
        "letter-spacing": toCssVar(`$letterSpacing${subject}`),
        "word-spacing": toCssVar(`$wordSpacing${subject}`),
        "text-shadow": toCssVar(`$textShadow${subject}`),
        "text-indent": toCssVar(`$textIndent${subject}`),
        "text-align": toCssVar(`$textAlign${subject}`),
        "text-align-last": toCssVar(`$textAlignLast${subject}`),
        "word-break": toCssVar(`$wordBreak${subject}`),
        "word-wrap": toCssVar(`$wordWrap${subject}`),
        direction: toCssVar(`$direction${subject}`),
        "writing-mode": toCssVar(`$writingMode${subject}`),
        "line-break": toCssVar(`$lineBreak${subject}`),
      };
      return cssInput;
    },
    [isCustomVariant, variant],
  );
  const customVariantClassName = useComponentStyle(variantSpec);

  // Store custom variant in cache if it's a new custom variant
  useEffect(() => {
    if (isCustomVariant && variant && customVariantClassName) {
      // Check if this variant is already cached
      if (!hasCustomVariantCache(variant)) {
        // TODO: When CSS generation is implemented, extract the actual CSS text
        // For now, store placeholder information
        setCustomVariantCache(variant, {
          className: customVariantClassName,
          cssText: "", // Will be populated when CSS generation is implemented
        });
      }
    }
  }, [isCustomVariant, variant, customVariantClassName]);

  // Determine overflow mode classes based on overflowMode and existing props
  const overflowClasses = useMemo(() => {
    const classes: Record<string, boolean> = {};

    // If overflowMode is not explicitly set, use original behavior
    if (!overflowMode) {
      classes[styles.truncateOverflow] = maxLines > 0;
      classes[styles.noEllipsis] = !ellipses;
      // Add multiLineClamp class when using maxLines > 1 to prevent descender artifacts
      classes[styles.multiLineClamp] = maxLines > 1;
      return classes;
    }

    switch (overflowMode) {
      case "none":
        // CSS: overflow: hidden + text-overflow: clip + normal wrapping
        // Effect: Text wraps normally but clips cleanly at container boundaries without ellipsis
        classes[styles.overflowNone] = true;
        break;
      case "scroll":
        // CSS: white-space: nowrap + overflow-x: auto + overflow-y: hidden
        // Effect: Forces single line, enables horizontal scrollbar when content overflows
        classes[styles.overflowScroll] = true;
        break;
      case "ellipsis":
        // CSS: Uses -webkit-line-clamp for multi-line or white-space: nowrap + text-overflow: ellipsis for single line
        // Effect: Shows "..." when text is truncated, respects maxLines for multi-line truncation
        classes[styles.truncateOverflow] = true;
        classes[styles.noEllipsis] = !ellipses;
        // Add multiLineClamp class when using maxLines > 1 to prevent descender artifacts
        classes[styles.multiLineClamp] = maxLines > 1;
        break;
      case "flow":
        // CSS: white-space: normal + overflow-y: auto + overflow-x: hidden
        // Effect: Text wraps to multiple lines with vertical scrolling when needed, no horizontal scrollbar
        // Note: Flow mode ignores maxLines to allow unlimited text wrapping
        classes[styles.overflowFlow] = true;
        break;
    }

    return classes;
  }, [overflowMode, maxLines, ellipses]);

  // Determine break mode classes
  const breakClasses = useMemo(() => {
    const classes: Record<string, boolean> = {};

    // Only apply break mode classes if explicitly set (preserves theme variable support)
    if (breakMode) {
      switch (breakMode) {
        case "normal":
          // CSS: word-break: normal + overflow-wrap: normal
          // Effect: Standard word breaking at natural boundaries (spaces, hyphens)
          classes[styles.breakNormal] = true;
          break;
        case "word":
          // CSS: overflow-wrap: break-word
          // Effect: Breaks long words only when necessary to prevent overflow, preserves word boundaries when possible
          classes[styles.breakWord] = true;
          break;
        case "anywhere":
          // CSS: word-break: break-all + overflow-wrap: anywhere
          // Effect: Most aggressive breaking - allows breaking between any characters to fit container
          classes[styles.breakAnywhere] = true;
          break;
        case "keep":
          // CSS: word-break: keep-all
          // Effect: Prevents breaking within words entirely (useful for CJK text or technical terms)
          classes[styles.breakKeep] = true;
          break;
        case "hyphenate":
          // CSS: hyphens: auto + overflow-wrap: break-word
          // Effect: Uses browser's hyphenation dictionary to break words with proper hyphens
          classes[styles.breakHyphenate] = true;
          break;
      }
    }

    return classes;
  }, [breakMode]);

  return (
    <Element
      {...restVariantSpecificProps}
      ref={ref as any}
      className={classnames(
        syntaxHighlightClasses,
        styles.text,
        // Use custom variant className if it's a custom variant, otherwise use predefined variant style
        isCustomVariant ? customVariantClassName : styles[variant || "default"],
        {
          [styles.preserveLinebreaks]: preserveLinebreaks,
          ...overflowClasses,
          ...breakClasses,
        },
        className,
      )}
      style={{
        ...style,
        // Apply maxLines style for "ellipsis" mode and default behavior
        // "none", "scroll", and "flow" modes ignore maxLines for predictable, reliable behavior
        ...(overflowMode === "ellipsis" || (!overflowMode && maxLines)
          ? getMaxLinesStyle(maxLines)
          : {}),
      }}
    >
      {children}
    </Element>
  );
});

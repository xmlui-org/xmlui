import type { ForwardedRef, HTMLAttributes, Ref } from "react";
import { forwardRef, memo, useMemo, useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
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
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { EMPTY_OBJECT } from "../../components-core/constants";

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

type TextProps = Omit<HTMLAttributes<HTMLElement>, "onContextMenu"> & {
  uid?: string;
  variant?: TextVariant;
  maxLines?: number;
  preserveLinebreaks?: boolean;
  ellipses?: boolean;
  overflowMode?: OverflowMode;
  breakMode?: BreakMode;
  classes?: Record<string, string>;
  onContextMenu?: any;
  registerComponentApi?: RegisterComponentApiFn;
  [variantSpecificProps: string]: any;
};

import { defaultProps } from "./Text.defaults";

function toVariantCssVar(prop: string, variant: string): string {
  return `var(--xmlui-${prop}-Text-${variant}, var(--xmlui-${prop}-Text))`;
}

export const Text = memo(forwardRef(function Text(
  {
    uid,
    variant,
    maxLines = defaultProps.maxLines,
    style,
    className,
    classes,
    children,
    preserveLinebreaks = defaultProps.preserveLinebreaks,
    ellipses = defaultProps.ellipses,
    overflowMode = defaultProps.overflowMode,
    breakMode = defaultProps.breakMode,
    onContextMenu,
    registerComponentApi,
    ...variantSpecificProps
  }: TextProps,
  forwardedRef: ForwardedRef<HTMLElement>,
) {
  const innerRef = useRef<HTMLElement>(null);
  const ref = useComposedRefs(innerRef, forwardedRef);

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
  useLayoutEffect(() => {
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

  const isCustomVariant = useMemo(() => {
    return variant && !TextVariantElement[variant];
  }, [variant]);
  const needsVariantClass = useMemo(() => {
    return Boolean(isCustomVariant || variant === "sup" || variant === "sub" || variant === "mono");
  }, [isCustomVariant, variant]);

  // Always call useComponentStyle (React hook rule: no conditional hooks)
  const variantSpec = useMemo(
    () => {
      if (!variant || !needsVariantClass) return EMPTY_OBJECT;
      const cssInput = {
        color: toVariantCssVar("textColor", variant),
        "font-family": toVariantCssVar("fontFamily", variant),
        "font-size": toVariantCssVar("fontSize", variant),
        "font-style": toVariantCssVar("fontStyle", variant),
        "font-variant": toVariantCssVar("fontVariant", variant),
        "font-weight": toVariantCssVar("fontWeight", variant),
        "font-stretch": toVariantCssVar("fontStretch", variant),
        "text-decoration-line": toVariantCssVar("textDecorationLine", variant),
        "text-decoration-color": toVariantCssVar("textDecorationColor", variant),
        "text-decoration-style": toVariantCssVar("textDecorationStyle", variant),
        "text-decoration-thickness": toVariantCssVar("textDecorationThickness", variant),
        "text-underline-offset": toVariantCssVar("textUnderlineOffset", variant),
        "line-height": toVariantCssVar("lineHeight", variant),
        "background-color": toVariantCssVar("backgroundColor", variant),
        "text-transform": toVariantCssVar("textTransform", variant),
        "letter-spacing": toVariantCssVar("letterSpacing", variant),
        "word-spacing": toVariantCssVar("wordSpacing", variant),
        "text-shadow": toVariantCssVar("textShadow", variant),
        "text-indent": toVariantCssVar("textIndent", variant),
        "text-align": toVariantCssVar("textAlign", variant),
        "text-align-last": toVariantCssVar("textAlignLast", variant),
        "word-break": toVariantCssVar("wordBreak", variant),
        "word-wrap": toVariantCssVar("wordWrap", variant),
        direction: toVariantCssVar("direction", variant),
        "writing-mode": toVariantCssVar("writingMode", variant),
        "line-break": toVariantCssVar("lineBreak", variant),
        "margin-top": toVariantCssVar("marginTop", variant),
        "margin-bottom": toVariantCssVar("marginBottom", variant),
        "margin-left": toVariantCssVar("marginLeft", variant),
        "margin-right": toVariantCssVar("marginRight", variant),
        "border-width": toVariantCssVar("borderWidth", variant),
        "border-color": toVariantCssVar("borderColor", variant),
        "border-style": toVariantCssVar("borderStyle", variant),
        "border-radius": toVariantCssVar("borderRadius", variant),
        "&:hover": {
          color: `var(--xmlui-textColor-Text-${variant}--hover, var(--xmlui-textColor-Text))`,
        },
      };
      return cssInput;
    },
    [needsVariantClass, variant],
  );
  const variantClassName = useComponentStyle(variantSpec);

  // Store custom variant in cache if it's a new custom variant
  useEffect(() => {
    if (isCustomVariant && variant && variantClassName) {
      // Check if this variant is already cached
      if (!hasCustomVariantCache(variant)) {
        // TODO: When CSS generation is implemented, extract the actual CSS text
        // For now, store placeholder information
        setCustomVariantCache(variant, {
          className: variantClassName,
          cssText: "", // Will be populated when CSS generation is implemented
        });
      }
    }
  }, [isCustomVariant, variant, variantClassName]);

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
      ref={ref as Ref<any>}
      onContextMenu={onContextMenu}
      className={classnames(
        syntaxHighlightClasses,
        styles.text,
        styles[variant || "default"],
        variantClassName,
        {
          [styles.preserveLinebreaks]: preserveLinebreaks,
          ...overflowClasses,
          ...breakClasses,
        },
        classes?.[COMPONENT_PART_KEY],
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
}));

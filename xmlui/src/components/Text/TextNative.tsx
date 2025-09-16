import type { CSSProperties } from "react";
import type React from "react";
import { forwardRef, useMemo, useRef, useImperativeHandle, useCallback, useEffect } from "react";
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
import { RegisterComponentApiFn } from "../..";

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

export const Text = forwardRef<TextProps>(function Text(
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
  
  // Implement hasOverflow function
  const hasOverflow = useCallback((): boolean => {
    const element = innerRef.current;
    if (!element) return false;
    
    // Check both horizontal and vertical overflow
    const hasHorizontalOverflow = element.scrollWidth > element.clientWidth;
    const hasVerticalOverflow = element.scrollHeight > element.clientHeight;
    
    return hasHorizontalOverflow || hasVerticalOverflow;
  }, []);

  // Expose API using useImperativeHandle
  useImperativeHandle(forwardedRef, () => ({
    hasOverflow,
  }), [hasOverflow]);

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

  // Determine overflow mode classes based on overflowMode and existing props
  const overflowClasses = useMemo(() => {
    const classes: Record<string, boolean> = {};

    // If overflowMode is not explicitly set, use original behavior
    if (!overflowMode) {
      classes[styles.truncateOverflow] = maxLines > 0;
      classes[styles.noEllipsis] = !ellipses;
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
      ref={innerRef as any}
      className={classnames(
        syntaxHighlightClasses,
        styles.text,
        styles[variant || "default"],
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

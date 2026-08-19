import type { ForwardedRef, HTMLAttributes, ReactNode, Ref } from "react";
import { Fragment, forwardRef, memo, useMemo, useRef, useCallback, useEffect } from "react";
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
import { toCssVar } from "../../components-core/theming/layout-resolver";
import {
  normalizeNeedles,
  prepareNeedles,
  scanHighlightSegments,
} from "../../components-core/utils/highlight-terms";

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

/** Segment-variant names already warned about, so a long list warns once, not per row. */
const warnedVariants = new Set<string>();

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
  inline?: boolean;
  overflowMode?: OverflowMode;
  breakMode?: BreakMode;
  classes?: Record<string, string>;
  onContextMenu?: any;
  registerComponentApi?: RegisterComponentApiFn;
  highlightText?: string | string[];
  highlightActiveIndex?: number;
  segments?: HighlightTextSegment[];
  [variantSpecificProps: string]: any;
};

/** One pre-computed span supplied via the `segments` property. */
export type HighlightTextSegment = {
  text: string;
  hit?: boolean;
  active?: boolean;
  /** Names a non-search span kind, styled via `backgroundColor-mark-<variant>-Text`. */
  variant?: string;
};

import { defaultProps } from "./Text.defaults";

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
    inline = defaultProps.inline,
    overflowMode = defaultProps.overflowMode,
    breakMode = defaultProps.breakMode,
    onContextMenu,
    registerComponentApi,
    highlightText,
    highlightActiveIndex,
    segments,
    ...variantSpecificProps
  }: TextProps,
  forwardedRef: ForwardedRef<HTMLElement>,
) {
  const innerRef = useRef<HTMLElement>(null);
  const ref = useComposedRefs(innerRef, forwardedRef);

  // --- Substring highlighting, sharing Markdown's matching core so that a list mixing
  // Text and Markdown rows counts occurrences as one sequence (see highlight-terms.ts).
  // An inline array prop is a new reference every render, so memoize on a serialized
  // key. JSON rather than a joined string: no separator can collide with term
  // content, and it stays unambiguous without needing a control character.
  const needleKey = JSON.stringify(highlightText ?? "");
  const needles = useMemo(
    () => prepareNeedles(normalizeNeedles(highlightText)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [needleKey],
  );
  const activeIndex =
    typeof highlightActiveIndex === "number" && highlightActiveIndex >= 0
      ? highlightActiveIndex
      : -1;

  // --- Pre-computed spans. For content whose highlights are decided upstream (an FTS5
  // snippet marks whole tokens, and its excerpt has lost the column provenance needed
  // to re-derive spans client-side), substring matching is a different answer rather
  // than an approximation — so the caller supplies the segments and we only render them.
  const validSegments = useMemo(() => {
    if (segments == null) return null; // Not "invalid": the data-fed refetch case.
    const bad = (reason: string) => {
      if (import.meta.env.DEV) {
        console.warn(
          `Text: ignoring the \`segments\` property — ${reason}. Expected an array of ` +
            `{ text: string, hit?: boolean, active?: boolean }. Falling back to the ` +
            `component's own content.`,
        );
      }
      return null;
    };
    if (!Array.isArray(segments)) return bad(`it is ${typeof segments}, not an array`);
    for (const seg of segments) {
      if (seg == null || typeof seg !== "object" || typeof (seg as any).text !== "string") {
        return bad("one or more entries lack a string `text`");
      }
    }
    return segments as HighlightTextSegment[];
  }, [segments]);

  const usingSegments = validSegments !== null;

  if (import.meta.env.DEV && usingSegments && highlightText != null) {
    // Mutually exclusive by intent. A warning rather than an error: `segments` is
    // typically data-fed, and throwing would take out the row over a transient state.
    console.warn(
      "Text: `segments` and `highlightText` are both set. `segments` supplies the " +
        "content and its own highlights, so `highlightText` is ignored.",
    );
  }

  const segmentChildren = useMemo(() => {
    if (!validSegments) return null;
    // Per-segment `active` is authoritative when the caller computes it. Only when no
    // segment claims it do we fall back to counting hits in document order, which is
    // what makes highlightActiveIndex mean the same thing here as for highlightText.
    const callerMarkedActive = validSegments.some((seg) => seg.active);
    let hitOrdinal = 0;
    return validSegments.map((seg, i) => {
      // Precedence: active > hit > variant. A segment that is a search hit renders as
      // one, and its variant is ignored — a span shows one kind at a time.
      if (seg.hit) {
        const ordinal = hitOrdinal++;
        const isActive = callerMarkedActive ? !!seg.active : ordinal === activeIndex;
        return (
          <mark
            key={i}
            className={styles.highlightMark}
            data-active={isActive ? "true" : undefined}
          >
            {seg.text}
          </mark>
        );
      }
      // A variant is a different kind of span, not a weaker match, so it is not a
      // <mark>: consumers count and query marks to find search hits, and putting
      // variants in that namespace would silently inflate every such count. Note the
      // ordinal counter is untouched here — variant spans never enter the sequence
      // highlightActiveIndex walks.
      if (seg.variant) {
        return (
          <span
            key={i}
            className={styles.highlightVariant}
            data-variant={seg.variant}
            style={{
              backgroundColor: toCssVar(`$backgroundColor-mark-${seg.variant}-Text`),
              color: toCssVar(`$textColor-mark-${seg.variant}-Text`),
            }}
          >
            {seg.text}
          </span>
        );
      }
      return <Fragment key={i}>{seg.text}</Fragment>;
    });
  }, [validSegments, activeIndex]);

  // Dev-only: an undeclared variant renders plain by CSS fallback, which is the right
  // runtime behavior and a silent one — a typo in a data-driven field looks identical
  // to a deliberate plain span. Warn once per distinct name rather than per row.
  useEffect(() => {
    if (!import.meta.env.DEV || !usingSegments) return;
    const root = innerRef.current;
    if (!root) return;
    const spans = root.querySelectorAll<HTMLElement>("[data-variant]");
    spans.forEach((el) => {
      const name = el.dataset.variant;
      if (!name || warnedVariants.has(name)) return;
      const token = `--xmlui-backgroundColor-mark-${name}-Text`;
      // Read from the span itself so scoped theme classes are in scope, not just :root.
      const declared = getComputedStyle(el).getPropertyValue(token).trim();
      // Covers both ways a variant renders flat: never declared, and declared with a
      // reference to an undefined theme variable — the theme layer drops that whole
      // declaration, so it arrives here as absent rather than as a broken value.
      if (!declared) {
        warnedVariants.add(name);
        console.warn(
          `Text: segment variant "${name}" has no usable theme value. Define ` +
            `\`${token.replace("--xmlui-", "")}\` (and optionally ` +
            `\`textColor-mark-${name}-Text\`) in your theme, or remove the variant. ` +
            `A declaration that references an undefined theme variable is dropped, so ` +
            `this fires for a broken \`$token\` reference too. The span renders ` +
            `unstyled until then.`,
        );
      }
    });
  }, [usingSegments, segmentChildren]);

  const highlightedChildren = useMemo(() => {
    if (needles.length === 0) return children;
    // Ordinals continue across sibling nodes so numbering matches document order.
    let ordinal = 0;
    const mapNode = (node: ReactNode, key?: number): ReactNode => {
      // Only plain strings can be scanned. Anything else (an element child, a nested
      // component) is passed through untouched rather than guessed at, and does not
      // consume ordinals — we cannot see the text inside it.
      if (typeof node !== "string") return node;
      const { segments, nextOrdinal, hasMatch } = scanHighlightSegments(node, needles, ordinal);
      ordinal = nextOrdinal;
      if (!hasMatch) return node;
      return (
        <Fragment key={key}>
          {segments.map((seg, i) =>
            seg.hit ? (
              <mark
                key={i}
                className={styles.highlightMark}
                data-active={seg.ordinal === activeIndex ? "true" : undefined}
              >
                {seg.text}
              </mark>
            ) : (
              <Fragment key={i}>{seg.text}</Fragment>
            ),
          )}
        </Fragment>
      );
    };
    if (Array.isArray(children)) return children.map((child, i) => mapNode(child, i));
    return mapNode(children);
  }, [children, needles, activeIndex]);

  // Bring the active occurrence into view, matching Markdown's behavior so stepping
  // matches across a mixed list scrolls the same way regardless of row type. Segments
  // qualify on their own: the caller may mark one active without any activeIndex.
  useEffect(() => {
    if (!usingSegments && (activeIndex < 0 || needles.length === 0)) return;
    const el = innerRef.current?.querySelector('mark[data-active="true"]') as HTMLElement | null;
    if (el) el.scrollIntoView({ block: "center", behavior: "auto" });
  }, [activeIndex, needleKey, needles.length, usingSegments, segmentChildren]);

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
    if (!variant || !TextVariantElement[variant]) {
      // Inline mode wants phrasing content that can nest in a flowing line;
      // fall back to a span instead of the default block-level div.
      return inline ? "span" : "div";
    }
    return TextVariantElement[variant];
  }, [variant, inline]);

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
      ref={ref as Ref<any>}
      onContextMenu={onContextMenu}
      className={classnames(
        syntaxHighlightClasses,
        styles.text,
        // Use custom variant className if it's a custom variant, otherwise use predefined variant style
        isCustomVariant ? customVariantClassName : styles[variant || "default"],
        {
          [styles.preserveLinebreaks]: preserveLinebreaks,
          [styles.inline]: inline,
          // Inline mode has no block formatting context, so truncation/overflow
          // classes don't apply; word-break behavior still does.
          ...(inline ? {} : overflowClasses),
          ...breakClasses,
        },
        classes?.[COMPONENT_PART_KEY],
        className,
      )}
      style={{
        ...style,
        // Apply maxLines style for "ellipsis" mode and default behavior
        // "none", "scroll", and "flow" modes ignore maxLines for predictable, reliable behavior
        // Inline mode has no block context, so maxLines/line-clamping does not apply
        ...(!inline && (overflowMode === "ellipsis" || (!overflowMode && maxLines))
          ? getMaxLinesStyle(maxLines)
          : {}),
      }}
    >
      {usingSegments ? segmentChildren : highlightedChildren}
    </Element>
  );
}));

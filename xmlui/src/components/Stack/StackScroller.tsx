import React, { forwardRef, useState, useEffect, type ReactNode, type CSSProperties } from "react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import classnames from "classnames";

import styles from "./StackScroller.module.scss";
import { useTheme } from "../../components-core/theming/ThemeContext";

export type ScrollStyle = "normal" | "overlay" | "whenMouseOver" | "whenScrolling";

export const defaultProps = {
  scrollStyle: "normal" as ScrollStyle,
  showScrollerFade: false,
};

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  scrollStyle?: ScrollStyle;
  showScrollerFade?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * StackScroller provides customizable scrollbar styling using Radix Scroll Area.
 * 
 * @param scrollStyle - Determines the scrollbar behavior:
 *   - "normal": Standard browser scrollbar (plain div, no Radix)
 *   - "overlay": Always-visible scrollbar (Radix type="always")
 *   - "whenMouseOver": Scrollbar appears on hover (Radix type="hover")
 *   - "whenScrolling": Scrollbar appears while scrolling and fades (Radix type="scroll")
 */
export const StackScroller = forwardRef<HTMLDivElement, Props>(function StackScroller(
  {
    children,
    className,
    style,
    scrollStyle = defaultProps.scrollStyle,
    showScrollerFade = defaultProps.showScrollerFade,
    ...rest
  },
  ref
) {
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);
  // Track viewport element in state (not just a ref) so effects re-run when it mounts.
  const [viewportEl, setViewportEl] = useState<HTMLDivElement | null>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const { getThemeVar } = useTheme();

  // Split rest: event handlers go to the Viewport (so scroll/click work on the scrollable element);
  // data-* and aria-* attributes are NOT spread on the outer wrapper because ComponentDecorator
  // already applies them via setAttribute on the forwarded ref (the Viewport). Spreading them
  // on the outer div as well would create two elements with the same data-testid.
  const eventHandlers: Record<string, any> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (key.startsWith('on')) {
      eventHandlers[key] = value;
    }
  }

  // Get auto-hide delay values from theme
  const autoHideDelayMouseOver = parseInt(getThemeVar("autoHideDelay-whenMouseOver-Scroller") || "200", 10);
  const autoHideDelayScrolling = parseInt(getThemeVar("autoHideDelay-whenScrolling-Scroller") || "400", 10);

  // Normalize scrollStyle to a valid value, defaulting to "normal" for unrecognized values
  const normalizedScrollStyle = (["normal", "overlay", "whenMouseOver", "whenScrolling"].includes(scrollStyle as string)
    ? scrollStyle
    : "normal") as ScrollStyle;

  // Update fade indicators based on scroll position
  const updateFadeIndicators = React.useCallback(() => {
    if (!showScrollerFade || !viewportEl) return;

    const { scrollTop, scrollHeight, clientHeight } = viewportEl;
    
    // Show top fade if scrolled down
    setShowTopFade(scrollTop > 0);
    
    // Show bottom fade if not at the bottom
    setShowBottomFade(scrollTop + clientHeight < scrollHeight - 1);
  }, [showScrollerFade, viewportEl]);

  // Set up scroll listener when showScrollerFade is enabled
  useEffect(() => {
    if (!showScrollerFade || !viewportEl) return;

    const viewport = viewportEl;

    // Initial check with a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      updateFadeIndicators();
    }, 50);

    // Listen for scroll events
    viewport.addEventListener('scroll', updateFadeIndicators);
    
    // Also update on resize
    const resizeObserver = new ResizeObserver(updateFadeIndicators);
    resizeObserver.observe(viewport);

    return () => {
      clearTimeout(timer);
      viewport.removeEventListener('scroll', updateFadeIndicators);
      resizeObserver.disconnect();
    };
  }, [showScrollerFade, viewportEl, updateFadeIndicators]);

  // Set up transition detection for all Radix scrollbar modes
  useEffect(() => {
    if (normalizedScrollStyle === "normal" || !viewportEl) return;

    const viewport = viewportEl;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    // Listen for transitionend events to update scroll indicators after transitions complete
    const handleTransitionEnd = (e: TransitionEvent) => {
      // Only respond to grid-template-rows and opacity transitions (NavGroup expand/collapse)
      // Ignore color, background-color transitions to prevent excessive updates
      if (e.propertyName !== 'grid-template-rows' && e.propertyName !== 'opacity') {
        return;
      }
      
      // Debounce updates to avoid excessive recalculations
      if (debounceTimer) clearTimeout(debounceTimer);
      
      debounceTimer = setTimeout(() => {
        if (showScrollerFade) {
          updateFadeIndicators();
        }
      }, 50);
    };

    viewport.addEventListener('transitionend', handleTransitionEnd);

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      viewport.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, [normalizedScrollStyle, viewportEl, showScrollerFade, updateFadeIndicators]);

  // Normal mode: use standard div with default browser scrollbar
  if (normalizedScrollStyle === "normal") {
    return (
      <div ref={ref} className={className} style={style} {...rest}>
        {children}
      </div>
    );
  }

  // Map scrollStyle to Radix ScrollArea Root type prop
  const radixType: "hover" | "scroll" | "always" = 
    normalizedScrollStyle === "overlay" ? "always" :
    normalizedScrollStyle === "whenMouseOver" ? "hover" :
    "scroll";

  const scrollHideDelay = 
    normalizedScrollStyle === "whenMouseOver" ? autoHideDelayMouseOver :
    normalizedScrollStyle === "whenScrolling" ? autoHideDelayScrolling :
    0;

  // In Radix mode the `style` prop may contain overflow-related CSS (e.g. overflowY: "scroll")
  // applied by the framework. Passing those to either the outer wrapper or ScrollArea.Root would
  // override `overflow: hidden` (set via CSS class) and create a native browser scrollbar
  // alongside the Radix one. Strip overflow keys here; Radix's Viewport owns overflow.
  const overflowKeys = new Set(["overflow", "overflowX", "overflowY"]);
  const nonOverflowStyle = style
    ? Object.fromEntries(Object.entries(style).filter(([k]) => !overflowKeys.has(k)))
    : undefined;

  // Radix Scroll Area mode: overlay scrollbar.
  // The ref is forwarded to the outer fadeContainer div, NOT to ScrollArea.Root. This
  // ensures ComponentDecorator's sibling-detection and the ref-callback both target the
  // same element — preventing the duplicate data-testid problem that occurs when the ref
  // points to an inner element while the sibling scan finds the outer wrapper first.
  // StackNative's scrollTo* APIs reach the Radix Viewport via querySelector.
  return (
    <div
      ref={(el) => {
        if (ref) {
          if (typeof ref === "function") {
            ref(el);
          } else {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
          }
        }
      }}
      className={styles.fadeContainer}
      style={nonOverflowStyle}
    >
      <ScrollArea.Root
        className={styles.scrollAreaRoot}
        style={nonOverflowStyle}
        type={radixType}
        scrollHideDelay={scrollHideDelay}
        {...eventHandlers}
      >
        <ScrollArea.Viewport
          ref={(el) => { viewportRef.current = el; setViewportEl(el); }}
          className={styles.viewport}
        >
          {/*
           * Stack's _base class sets min-height: 0 and min-width: 0 which is correct
           * for nested flex contexts but collapses this div in a scroll container.
           * contentWrapper overrides those with !important so the div expands to
           * its natural content size, enabling vertical and horizontal scrolling.
           * min-height: 100% ensures the wrapper fills the viewport height when
           * content is shorter than the scroll container (needed for alignment).
           */}
          <div className={classnames(styles.contentWrapper, className)}>
            {children}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className={styles.scrollbar}
          orientation="vertical"
        >
          <ScrollArea.Thumb className={styles.thumb} />
        </ScrollArea.Scrollbar>
        <ScrollArea.Scrollbar
          className={styles.scrollbar}
          orientation="horizontal"
        >
          <ScrollArea.Thumb className={styles.thumb} />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner className={styles.corner} />
      </ScrollArea.Root>

      {/* Fade overlays for showScrollerFade — absolutely positioned inside container */}
      {showScrollerFade && (
        <>
          <div
            className={classnames(styles.fadeOverlay, styles.fadeTop, {
              [styles.fadeVisible]: showTopFade,
            })}
          />
          <div
            className={classnames(styles.fadeOverlay, styles.fadeBottom, {
              [styles.fadeVisible]: showBottomFade,
            })}
          />
        </>
      )}
    </div>
  );
});

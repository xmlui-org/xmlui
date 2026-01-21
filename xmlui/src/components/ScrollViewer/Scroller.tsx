import React, { forwardRef, useState, useEffect, type ReactNode, type CSSProperties } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import type { OverlayScrollbars } from "overlayscrollbars";
import "overlayscrollbars/styles/overlayscrollbars.css";
import styles from "./ScrollViewer.module.scss";

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
 * Scroller component provides customizable scrollbar styles for scroll containers.
 * 
 * @param scrollStyle - Determines the scrollbar behavior:
 *   - "normal": Standard browser scrollbar
 *   - "overlay": Overlay scrollbar using theme variables (always visible)
 *   - "whenMouseOver": Scrollbar appears only on hover (200ms delay)
 *   - "whenScrolling": Scrollbar appears during scrolling and fades out after 400ms of inactivity
 */
export const Scroller = forwardRef<HTMLDivElement, Props>(function Scroller(
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
  const osInstanceRef = React.useRef<OverlayScrollbars | null>(null);
  const [osReady, setOsReady] = useState(false);

  // Normalize scrollStyle to a valid value, defaulting to "normal" for unrecognized values
  const normalizedScrollStyle = (["normal", "overlay", "whenMouseOver", "whenScrolling"].includes(scrollStyle as string)
    ? scrollStyle
    : "normal") as ScrollStyle;

  // Update fade indicators based on scroll position
  const updateFadeIndicators = React.useCallback(() => {
    if (!showScrollerFade || !osInstanceRef.current) return;

    const { viewport } = osInstanceRef.current.elements();
    if (!viewport) return;

    const { scrollTop, scrollHeight, clientHeight } = viewport;
    
    // Show top fade if scrolled down
    setShowTopFade(scrollTop > 0);
    
    // Show bottom fade if not at the bottom
    setShowBottomFade(scrollTop + clientHeight < scrollHeight - 1);
  }, [showScrollerFade]);

  // Set up scroll listener when using styled scrollbars
  useEffect(() => {
    if (!showScrollerFade || !osReady || !osInstanceRef.current) return;

    const instance = osInstanceRef.current;
    const { viewport } = instance.elements();
    
    if (!viewport) return;

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
  }, [showScrollerFade, osReady, updateFadeIndicators]);

  // Normal mode: use standard div with default browser scrollbar
  if (normalizedScrollStyle === "normal") {
    return (
      <div ref={ref} className={className} style={style} {...rest}>
        {children}
      </div>
    );
  }

  // Overlay mode: overlay scrollbar using theme variables (always visible)
  if (normalizedScrollStyle === "overlay") {
    return (
      <div className={styles.fadeContainer}>
        <OverlayScrollbarsComponent
          ref={(instance) => {
            if (instance) {
              osInstanceRef.current = instance.osInstance();
              setOsReady(true);
            }
          }}
          className={`${styles.wrapper} ${className || ""}`}
          style={style}
          options={{
            scrollbars: {
              autoHide: "never",
            },
          }}
          {...rest}
        >
          {children}
        </OverlayScrollbarsComponent>
        {showScrollerFade && (
          <>
            <div
              className={`${styles.fadeOverlay} ${styles.fadeTop} ${
                showTopFade ? styles.fadeVisible : ""
              }`}
            />
            <div
              className={`${styles.fadeOverlay} ${styles.fadeBottom} ${
                showBottomFade ? styles.fadeVisible : ""
              }`}
            />
          </>
        )}
      </div>
    );
  }

  // WhenMouseOver mode: scrollbar appears on hover
  if (normalizedScrollStyle === "whenMouseOver") {
    return (
      <div className={styles.fadeContainer}>
        <OverlayScrollbarsComponent
          ref={(instance) => {
            if (instance) {
              osInstanceRef.current = instance.osInstance();
              setOsReady(true);
            }
          }}
          className={`${styles.wrapper} ${className || ""}`}
          style={style}
          options={{
            scrollbars: {
              autoHide: "leave",
              autoHideDelay: 200,
            },
          }}
          {...rest}
        >
          {children}
        </OverlayScrollbarsComponent>
        {showScrollerFade && (
          <>
            <div
              className={`${styles.fadeOverlay} ${styles.fadeTop} ${
                showTopFade ? styles.fadeVisible : ""
              }`}
            />
            <div
              className={`${styles.fadeOverlay} ${styles.fadeBottom} ${
                showBottomFade ? styles.fadeVisible : ""
              }`}
            />
          </>
        )}
      </div>
    );
  }

  // WhenScrolling mode: scrollbar appears during scroll and fades after 400ms
  return (
    <div className={styles.fadeContainer}>
      <OverlayScrollbarsComponent
        ref={(instance) => {
          if (instance) {
            osInstanceRef.current = instance.osInstance();
            setOsReady(true);
          }
        }}
        className={`${styles.wrapper} ${className || ""}`}
        style={style}
        options={{
          scrollbars: {
            autoHide: "scroll",
            autoHideDelay: 400,
          },
        }}
        {...rest}
      >
        {children}
      </OverlayScrollbarsComponent>
      {showScrollerFade && (
        <>
          <div
            className={`${styles.fadeOverlay} ${styles.fadeTop} ${
              showTopFade ? styles.fadeVisible : ""
            }`}
          />
          <div
            className={`${styles.fadeOverlay} ${styles.fadeBottom} ${
              showBottomFade ? styles.fadeVisible : ""
            }`}
          />
        </>
      )}
    </div>
  );
});

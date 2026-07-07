import React, { forwardRef, memo, useCallback, useEffect, useRef, useState } from "react";

import { defaultProps, type ScrollStyle } from "./ScrollViewer.defaults";
import styles from "./ScrollViewer.module.scss";

type Props = {
  containerClassName?: string;
  scrollStyle?: ScrollStyle;
  showScrollerFade?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export { type ScrollStyle } from "./ScrollViewer.defaults";

export const Scroller = memo(forwardRef<HTMLDivElement, Props>(function Scroller(
  {
    children,
    className,
    containerClassName,
    style,
    scrollStyle = defaultProps.scrollStyle,
    showScrollerFade = defaultProps.showScrollerFade,
    ...rest
  },
  forwardedRef,
) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const viewportCompatRef = useRef<HTMLDivElement | null>(null);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);
  const normalizedScrollStyle = normalizeScrollStyle(scrollStyle);
  const usesOverlayScroller = normalizedScrollStyle !== "normal";

  const setScrollerNode = useCallback((node: HTMLDivElement | null) => {
    scrollerRef.current = node;
    if (typeof forwardedRef === "function") {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  }, [forwardedRef]);

  const updateFadeIndicators = useCallback(() => {
    const node = scrollerRef.current;
    if (!showScrollerFade || !usesOverlayScroller || !node) {
      setShowTopFade(false);
      setShowBottomFade(false);
      return;
    }
    setShowTopFade(node.scrollTop > 0);
    setShowBottomFade(node.scrollTop + node.clientHeight < node.scrollHeight - 1);
  }, [showScrollerFade, usesOverlayScroller]);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node || !usesOverlayScroller) return;

    const timer = window.setTimeout(updateFadeIndicators, 50);
    node.addEventListener("scroll", updateFadeIndicators);
    const resizeObserver = new ResizeObserver(updateFadeIndicators);
    resizeObserver.observe(node);

    return () => {
      window.clearTimeout(timer);
      node.removeEventListener("scroll", updateFadeIndicators);
      resizeObserver.disconnect();
    };
  }, [updateFadeIndicators, usesOverlayScroller]);

  useEffect(() => {
    const compatNode = viewportCompatRef.current;
    const scrollerNode = scrollerRef.current;
    if (!compatNode || !scrollerNode) return;

    compatNode.scrollTo = ((arg1?: ScrollToOptions | number, arg2?: number) => {
      if (typeof arg1 === "number") {
        scrollerNode.scrollTo(arg1, arg2 ?? 0);
      } else {
        scrollerNode.scrollTo(arg1);
      }
    }) as HTMLDivElement["scrollTo"];
  }, [usesOverlayScroller]);

  if (!usesOverlayScroller) {
    return (
      <div
        {...rest}
        ref={setScrollerNode}
        className={joinClasses(containerClassName, className)}
        style={style}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      {...rest}
      ref={setScrollerNode}
      className={joinClasses(
        styles.fadeContainer,
        styles.wrapper,
        scrollStyleClass(normalizedScrollStyle),
        containerClassName,
        className,
      )}
      style={style}
      onScroll={(event) => {
        rest.onScroll?.(event);
        updateFadeIndicators();
      }}
    >
      {children}
      <div
        aria-hidden="true"
        data-overlayscrollbars-viewport
        ref={viewportCompatRef}
        className={styles.viewportCompat}
      />
      {showScrollerFade ? (
        <>
          <div
            className={joinClasses(
              styles.fadeOverlay,
              styles.fadeTop,
              showTopFade ? styles.fadeVisible : undefined,
            )}
          />
          <div
            className={joinClasses(
              styles.fadeOverlay,
              styles.fadeBottom,
              showBottomFade ? styles.fadeVisible : undefined,
            )}
          />
        </>
      ) : null}
    </div>
  );
}));

function normalizeScrollStyle(scrollStyle: ScrollStyle | undefined): ScrollStyle {
  if (
    scrollStyle === "overlay" ||
    scrollStyle === "whenMouseOver" ||
    scrollStyle === "whenScrolling" ||
    scrollStyle === "normal"
  ) {
    return scrollStyle;
  }
  return "normal";
}

function scrollStyleClass(scrollStyle: ScrollStyle): string | undefined {
  if (scrollStyle === "overlay") {
    return styles.overlay;
  }
  if (scrollStyle === "whenMouseOver") {
    return styles.whenMouseOver;
  }
  if (scrollStyle === "whenScrolling") {
    return styles.whenScrolling;
  }
  return undefined;
}

function joinClasses(...classes: Array<string | undefined | false>): string | undefined {
  const result = classes.filter(Boolean).join(" ");
  return result || undefined;
}

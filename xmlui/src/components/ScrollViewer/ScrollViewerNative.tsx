import React, { forwardRef, type ReactNode, type CSSProperties } from "react";
import { Scroller, type ScrollStyle } from "./Scroller";
import styles from "./ScrollViewer.module.scss";

export const defaultProps = {
  scrollStyle: "normal" as ScrollStyle,
  showScrollerFade: true,
};

type Props = {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  style?: CSSProperties;
  scrollStyle?: ScrollStyle;
  showScrollerFade?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * ScrollViewer is a simple layout container that stretches to fill its parent's viewport
 * and provides customizable scrollbar styles for its content.
 */
export const ScrollViewer = forwardRef<HTMLDivElement, Props>(function ScrollViewer(
  {
    children,
    header,
    footer,
    className,
    style,
    scrollStyle = defaultProps.scrollStyle,
    showScrollerFade = defaultProps.showScrollerFade,
    ...rest
  },
  ref
) {
  const hasHeaderOrFooter = !!header || !!footer;

  if (hasHeaderOrFooter) {
    // Wrap in a flex-column container so header/footer stick outside the scroll area.
    // No inline height is imposed here — XMLUI's className (layoutCss) is solely responsible
    // for sizing this element so that flex: 1 / min-height: 0 on the inner Scroller works.
    //
    // IMPORTANT: ref must be on the OUTER wrapper div, not on the inner Scroller.
    // ComponentDecorator uses the ref to imperatively setAttribute("data-testid") on the
    // resolved DOM node. Forwarding ref to the inner Scroller would put data-testid there,
    // causing duplicate testId matches in tests.
    //
    // Also strip data-testid / data-component-type from rest so they are not duplicated
    // as HTML attributes on the inner Scroller via prop spreading.
    const { "data-testid": _testId, "data-component-type": _compType, ...scrollerRest } = rest;
    const scrollerStyle: CSSProperties = {
      overflow: "auto",
    };
    return (
      <div ref={ref} className={`${styles.headerFooterWrapper} ${className || ""}`} style={style}>
        {header && <div className={styles.stickyHeader}>{header}</div>}
        <Scroller
          className={styles.scrollerFlex}
          style={scrollerStyle}
          scrollStyle={scrollStyle}
          showScrollerFade={showScrollerFade}
          {...scrollerRest}
        >
          {children}
        </Scroller>
        {footer && <div className={styles.stickyFooter}>{footer}</div>}
      </div>
    );
  }

  const containerStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    overflow: "auto",
    ...style,
  };

  return (
    <Scroller
      ref={ref}
      className={className}
      style={containerStyle}
      scrollStyle={scrollStyle}
      showScrollerFade={showScrollerFade}
      {...rest}
    >
      {children}
    </Scroller>
  );
});

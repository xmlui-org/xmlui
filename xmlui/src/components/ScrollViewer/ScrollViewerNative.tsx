import React, { forwardRef, type ReactNode, type CSSProperties } from "react";
import { Scroller, type ScrollStyle } from "./Scroller";
import styles from "./ScrollViewer.module.scss";

export const defaultProps = {
  scrollStyle: "normal" as ScrollStyle,
  showScrollerFade: true,
};

type Props = {
  children: ReactNode;
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
    className,
    style,
    scrollStyle = defaultProps.scrollStyle,
    showScrollerFade = defaultProps.showScrollerFade,
    ...rest
  },
  ref
) {
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

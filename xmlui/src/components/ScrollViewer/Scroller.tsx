import React, { forwardRef, type ReactNode, type CSSProperties } from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/styles/overlayscrollbars.css";
import styles from "./ScrollViewer.module.scss";

export type ScrollStyle = "normal" | "styled" | "whenMouseOver" | "whenScrolling";

export const defaultProps = {
  scrollStyle: "normal" as ScrollStyle,
};

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  scrollStyle?: ScrollStyle;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Scroller component provides customizable scrollbar styles for scroll containers.
 * 
 * @param scrollStyle - Determines the scrollbar behavior:
 *   - "normal": Standard browser scrollbar
 *   - "styled": Styled scrollbar using theme variables (always visible)
 *   - "whenMouseOver": Scrollbar appears only on hover (200ms delay)
 *   - "whenScrolling": Scrollbar appears during scrolling and fades out after 400ms of inactivity
 */
export const Scroller = forwardRef<HTMLDivElement, Props>(function Scroller(
  {
    children,
    className,
    style,
    scrollStyle = defaultProps.scrollStyle,
    ...rest
  },
  ref
) {
  // Normalize scrollStyle to a valid value, defaulting to "normal" for unrecognized values
  const normalizedScrollStyle = (["normal", "styled", "whenMouseOver", "whenScrolling"].includes(scrollStyle as string)
    ? scrollStyle
    : "normal") as ScrollStyle;

  // Normal mode: use standard div with default browser scrollbar
  if (normalizedScrollStyle === "normal") {
    return (
      <div ref={ref} className={className} style={style} {...rest}>
        {children}
      </div>
    );
  }

  // Styled mode: styled scrollbar using theme variables (always visible)
  if (normalizedScrollStyle === "styled") {
    return (
      <OverlayScrollbarsComponent
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
    );
  }

  // WhenMouseOver mode: scrollbar appears on hover
  if (normalizedScrollStyle === "whenMouseOver") {
    return (
      <OverlayScrollbarsComponent
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
    );
  }

  // WhenScrolling mode: scrollbar appears during scroll and fades after 400ms
  return (
    <OverlayScrollbarsComponent
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
  );
});

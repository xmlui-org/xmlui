import { forwardRef, type CSSProperties } from "react";
import classnames from "classnames";

import styles from "./ContentSeparator.module.scss";

type ContentSeparatorProps = {
  thickness?: number | string;
  length?: number | string;
  orientation?: string;
  style?: CSSProperties;
  className?: string;
};

export const defaultProps: Pick<ContentSeparatorProps, "orientation"> = {
  orientation: "horizontal",
};

export const ContentSeparator = forwardRef<HTMLDivElement, ContentSeparatorProps>(
  (
    { orientation = defaultProps.orientation, thickness, length, style, className, ...rest },
    ref,
  ) => {
    // Only apply inline styles if props are explicitly provided
    const inlineStyles: CSSProperties = {};

    if (thickness !== undefined) {
      if (orientation === "horizontal") {
        inlineStyles.height = thickness;
      } else {
        inlineStyles.width = thickness;
      }
    }

    if (length !== undefined) {
      if (orientation === "horizontal") {
        inlineStyles.width = length;
      } else {
        inlineStyles.height = length;
      }
    }

    return (
      <div
        {...rest}
        ref={ref}
        className={classnames(
          styles.separator,
          {
            [styles.horizontal]: orientation === "horizontal",
            [styles.vertical]: orientation === "vertical",
          },
          className,
        )}
        style={{
          ...inlineStyles,
          ...style,
        }}
      />
    );
  },
);

import type { CSSProperties } from "react";
import classnames from "classnames";

import styles from "./ContentSeparator.module.scss";

type ContentSeparatorProps = {
  size?: number | string;
  orientation?: string;
  style?: CSSProperties;
  className?: string;
};

export const defaultProps: Pick<ContentSeparatorProps, "orientation"> = {
  orientation: "horizontal",
};

export const ContentSeparator = ({
  orientation = defaultProps.orientation,
  size,
  style,
  className,
}: ContentSeparatorProps) => {
  return (
    <div
      className={classnames(
        styles.separator,
        {
          [styles.horizontal]: orientation === "horizontal",
          [styles.vertical]: orientation === "vertical",
        },
        className,
      )}
      style={{
        height: orientation === "horizontal" ? size : undefined,
        width: orientation === "horizontal" ? "100%" : size,
        ...style,
      }}
    />
  );
};
